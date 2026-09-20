// Runs outside image. Reuses the existing inventory owner; never reads /app/data or env.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,lstatSync,copyFileSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {sourceProblems,sha256,stableLinks} from './contracts.mjs';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const [image,output,sourceRoot=root]=process.argv.slice(2), out=resolve(output), source=resolve(sourceRoot);
mkdirSync(out,{recursive:true});const stage=join(out,'materials');mkdirSync(stage,{recursive:true});
const run=(bin,args,options={})=>execFileSync(bin,args,{encoding:'utf8',timeout:120000,maxBuffer:32*1024*1024,...options});
const imageId=run('docker',['image','inspect',image,'--format','{{.Id}}']).trim();
const inventory=JSON.parse(run('docker',['run','--rm','--network','none','-i','--entrypoint','node',image,'--input-type=module'],{input:readFileSync(join(root,'scripts/license-inventory.mjs'),'utf8')}));
const nativeCode=`const fs=require('fs');const r='/opt/dsh/node_modules/.pnpm';const n=fs.readdirSync(r).find(x=>x.startsWith('@img+sharp-libvips-linux-x64@'));console.log(fs.readFileSync(r+'/'+n+'/node_modules/@img/sharp-libvips-linux-x64/versions.json','utf8'))`;
const nativeVersions=JSON.parse(run('docker',['run','--rm','--network','none','--entrypoint','node',image,'-e',nativeCode]));
inventory.nativeVersions=nativeVersions;
writeFileSync(join(out,'inventory.json'),JSON.stringify(inventory,null,2)+'\n');
for(const [path,name]of [['/opt/laorenyun/licenses','notices'],['/usr/share/doc','debian-notices'],['/usr/share/common-licenses','common-licenses'],['/opt/dsh-laorenyun/lib/third-party','tencent-notices']]) {
 const archive=join(out,name+'.tar'), fd=openSync(archive,'w');
 try{run('docker',['run','--rm','--network','none','--entrypoint','tar',image,'-C',path,'--hard-dereference','-chf','-',...(name==='debian-notices'?inventory.os.map(p=>p.name+'/copyright'):['.'])],{stdio:['ignore',fd,'pipe']});}finally{closeSync(fd);}
 mkdirSync(join(stage,name),{recursive:true});
 run('tar',['-xf',archive,'-C',join(stage,name),'--no-same-owner']);unlinkSync(archive);
}
for(const f of ['Dockerfile','UPSTREAM.json','PLUGIN.json','THIRD_PARTY_NOTICES.md'])copyFileSync(join(source,f),join(stage,f));
writeFileSync(join(stage,'ffmpeg-buildconf.txt'),run('docker',['run','--rm','--network','none','--entrypoint','sh',image,'-c','ffmpeg -buildconf 2>&1']));
writeFileSync(join(stage,'ffmpeg-links.txt'),stableLinks(run('docker',['run','--rm','--network','none','--entrypoint','ldd',image,'/usr/bin/ffmpeg'])));
writeFileSync(join(stage,'native-versions.json'),JSON.stringify(nativeVersions,null,2)+'\n');
const lock=JSON.parse(readFileSync(join(root,'licenses/container/sources.lock.json')));
// Downloads must already have a reviewed exact hash; no floating URL is accepted as evidence.
for(const d of lock.downloads) {
 if(!/^https:\/\//.test(d.url)||!/^[a-f0-9]{64}$/.test(d.sha256)||!/^sources\/[a-zA-Z0-9_.+-]+$/.test(d.path))throw Error('Unsafe source lock entry');
 mkdirSync(join(stage,'sources'),{recursive:true});
 run('curl',['--silent','--show-error','--fail','--location','--proto','=https','--proto-redir','=https','--max-time','120','--max-filesize','1073741824','--output',join(stage,d.path),d.url]);
 const h=createHash('sha256');for await(const chunk of createReadStream(join(stage,d.path)))h.update(chunk);
 if(h.digest('hex')!==d.sha256)throw Error('Source download hash mismatch');
}
const files={};
async function walk(p){for(const n of readdirSync(p).sort()){const f=join(p,n),s=lstatSync(f);if(s.isDirectory())await walk(f);else if(s.isFile()){const h=createHash('sha256');for await(const b of createReadStream(f))h.update(b);files[relative(stage,f)]=h.digest('hex');}else throw Error('Non-regular source material');}}
await walk(stage);
const manifest={schema:1,imageId,inventorySha256:sha256(JSON.stringify(inventory)),nativeVersions,reviewStatus:lock.reviewStatus,components:lock.components,files};
const problems=sourceProblems(inventory,manifest,new Set(Object.keys(files)));
manifest.publicationAllowed=problems.length===0;
writeFileSync(join(out,'container-source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(out,'source-gate.json'),JSON.stringify({imageId,publicationAllowed:manifest.publicationAllowed,blockers:lock.blockers,problems},null,2)+'\n');
// Stable sorted paths, fixed ownership/mtime, gzip without timestamps. This may be an INCOMPLETE audit bundle.
const list=join(out,'files.list');writeFileSync(list,Object.keys(files).join('\0')+'\0');
run('tar',['--hard-dereference','--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','-C',stage,'--null','-T',list,'-cf',join(out,'container-sources.tar')],{timeout:300000});
run('gzip',['-n','-f',join(out,'container-sources.tar')],{timeout:300000});
run('python3',[join(root,'scripts/release/archive.py'),join(out,'container-sources.tar.gz'),join(out,'container-source-manifest.json')],{timeout:300000});
console.log(JSON.stringify({imageId,os:inventory.os.length,npm:inventory.packages.length,native:Object.keys(nativeVersions).length,publicationAllowed:manifest.publicationAllowed,unresolved:problems.length}));
// Audit mode returns successfully to retain evidence. verify-bundle.mjs is the mandatory blocking boundary.
