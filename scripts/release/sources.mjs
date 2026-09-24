// Runs outside image. Reuses the existing inventory owner; never reads /app/data or env.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,lstatSync,copyFileSync,openSync,closeSync,unlinkSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {sourceProblems,sha256,stableLinks,sourcePathPattern} from './contracts.mjs';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const [image,output,sourceRoot=root]=process.argv.slice(2), out=resolve(output), source=resolve(sourceRoot);
mkdirSync(out,{recursive:true});const stage=join(out,'materials');mkdirSync(stage,{recursive:true});
const run=(bin,args,options={})=>execFileSync(bin,args,{encoding:'utf8',timeout:120000,maxBuffer:32*1024*1024,...options});
const imageId=run('docker',['image','inspect',image,'--format','{{.Id}}']).trim();
const inventory=JSON.parse(run('docker',['run','--rm','--network','none','-i','--entrypoint','node',image,'--input-type=module'],{input:readFileSync(join(root,'scripts/license-inventory.mjs'),'utf8')}));
const nativeCode=`const fs=require('fs');const r='/opt/dsh/node_modules/.pnpm';const n=fs.readdirSync(r).find(x=>x.startsWith('@img+sharp-libvips-linux-x64@'));console.log(fs.readFileSync(r+'/'+n+'/node_modules/@img/sharp-libvips-linux-x64/versions.json','utf8'))`;
const nativeVersions=JSON.parse(run('docker',['run','--rm','--network','none','--entrypoint','node',image,'-e',nativeCode]));
inventory.nativeVersions=nativeVersions;
const nativePackage=inventory.packages.find(p=>p.name==='@img/sharp-libvips-linux-x64');
inventory.nativeShipped=Object.fromEntries(Object.entries(nativeVersions).map(([name,version])=>[name,[{id:`vips:${name}@${version}`,notices:nativePackage?.shipped.flatMap(p=>p.notices)??[]}]]));
writeFileSync(join(out,'inventory.json'),JSON.stringify(inventory,null,2)+'\n');
for(const [path,name]of [['/opt/laorenyun/licenses','notices'],['/usr/share/doc','debian-notices'],['/usr/share/common-licenses','common-licenses'],['/opt/dsh-laorenyun/lib/third-party','tencent-notices']]) {
 const archive=join(out,name+'.tar'), fd=openSync(archive,'w');
 try{run('docker',['run','--rm','--network','none','--entrypoint','tar',image,'-C',path,'--hard-dereference','-chf','-',...(name==='debian-notices'?[...new Set(inventory.os.map(p=>p.licensePath.slice('/usr/share/doc/'.length)))]:['.'])],{stdio:['ignore',fd,'pipe']});}finally{closeSync(fd);}
 mkdirSync(join(stage,name),{recursive:true});
 run('tar',['-xf',archive,'-C',join(stage,name),'--no-same-owner']);unlinkSync(archive);
}
// Preserve every discovered notice occurrence, including duplicate npm installs.
const noticePaths=[...new Set([...inventory.os,...inventory.packages,...(inventory.bundledClosure?.packages??[]),...(inventory.runtimeBinaries??[])].flatMap(p=>(p.shipped??[]).flatMap(x=>x.notices.map(n=>n.path))))].sort();
if(noticePaths.some(p=>!p.startsWith('/')||p.includes('..')||/[\r\n\0]/.test(p)))throw Error('Unsafe notice path');
const noticeArchive=join(out,'image-notices.tar'),noticeFd=openSync(noticeArchive,'w');
try{run('docker',['run','--rm','--network','none','-i','--entrypoint','tar',image,'-C','/','--hard-dereference','-chf','-','--null','-T','-'],{input:noticePaths.map(p=>p.slice(1)).join('\0')+'\0',stdio:['pipe',noticeFd,'pipe']});}finally{closeSync(noticeFd);}
mkdirSync(join(stage,'image-notices'),{recursive:true});
run('tar',['-xf',noticeArchive,'-C',join(stage,'image-notices'),'--no-same-owner']);unlinkSync(noticeArchive);
for(const f of ['Dockerfile','UPSTREAM.json','PLUGIN.json','THIRD_PARTY_NOTICES.md'])copyFileSync(join(source,f),join(stage,f));
writeFileSync(join(stage,'ffmpeg-buildconf.txt'),run('docker',['run','--rm','--network','none','--entrypoint','sh',image,'-c','ffmpeg -buildconf 2>&1']));
writeFileSync(join(stage,'ffmpeg-links.txt'),stableLinks(run('docker',['run','--rm','--network','none','--entrypoint','ldd',image,'/usr/bin/ffmpeg'])));
writeFileSync(join(stage,'native-versions.json'),JSON.stringify(nativeVersions,null,2)+'\n');
const lock=JSON.parse(readFileSync(join(root,'licenses/container/sources.lock.json')));
async function fileHash(path) {
 const h=createHash('sha256');for await(const chunk of createReadStream(path))h.update(chunk);return h.digest('hex');
}
// Downloads must already have a reviewed exact hash; no floating URL is accepted as evidence.
for(const d of lock.downloads) {
 if(!/^https:\/\//.test(d.url)||!/^[a-f0-9]{64}$/.test(d.sha256)||!sourcePathPattern.test(d.path))throw Error('Unsafe source lock entry');
 mkdirSync(join(stage,'sources'),{recursive:true});
 const destination=join(stage,d.path);
 // Reuse only exact locked bytes; partial downloads never qualify as source evidence.
 if(!existsSync(destination) || await fileHash(destination)!==d.sha256)
  run('curl',['--silent','--show-error','--fail','--location','--proto','=https','--proto-redir','=https','--max-time','300','--max-filesize','1073741824','--output',destination,d.url],{timeout:330000});
 if(await fileHash(destination)!==d.sha256)throw Error('Source download hash mismatch');
}
for(const recipe of lock.generated??[]) {
 if(recipe.kind!=='librsvg-rust'||!sourcePathPattern.test(recipe.path)||!lock.downloads.some(d=>d.path===recipe.input)||!/^[a-f0-9]{64}$/.test(recipe.sha256))throw Error('Invalid source recipe');
 const destination=join(stage,recipe.path);
 if(!existsSync(destination)||await fileHash(destination)!==recipe.sha256){
  const work=join(out,'rust-material-'+Date.now());
  run('python3',[join(root,'scripts/release/vendor-librsvg.py'),join(stage,recipe.input),work],{timeout:2100000});
  copyFileSync(join(work,'librsvg-rust-sources.tar.gz'),destination);
 }
 if(await fileHash(destination)!==recipe.sha256)throw Error('Generated source material differs from reviewed hash');
}
copyFileSync(join(root,'scripts/release/vendor-librsvg.py'),join(stage,'vendor-librsvg.py'));
copyFileSync(join(root,'licenses/container/debian-source-identities.json'),join(stage,'debian-source-identities.json'));
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
