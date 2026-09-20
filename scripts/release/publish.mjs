// Registry mutation boundary: called only after read-only acceptance + source gate.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,appendFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {repo,digestPattern,sha256,releaseCompose,releaseVersion,immutableIdentity} from './contracts.mjs';
import assert from 'node:assert/strict';
const [directory,sourceDirectory]=process.argv.slice(2),out=resolve(directory),source=resolve(sourceDirectory);
const run=(bin,args,options={})=>execFileSync(bin,args,{encoding:'utf8',timeout:300000,maxBuffer:8*1024*1024,...options}).trim();
const input=JSON.parse(readFileSync(join(out,'inputs.json'))),tag=input.tag,version=releaseVersion(tag),id=readFileSync(join(out,'image-id.txt'),'utf8').trim();
assert.equal(input.version,version);assert.match(input.commit,/^[a-f0-9]{40}$/);
const acceptance=JSON.parse(readFileSync(join(out,'acceptance.json')));assert.equal(acceptance.imageId,id);assert.equal(acceptance.plugin,input.plugin);assert.equal(acceptance.dsh,input.dsh);
for(const k of ['coldBoot','localhost','access401','persistentVolume','restart','elderlyShell','nativeTypedSource','mediaIdNull'])assert.equal(acceptance[k],true);
run('sha256sum',['--check','TRANSFER_SHA256SUMS'],{cwd:out});
run('node',[new URL('./verify-bundle.mjs',import.meta.url).pathname,out,id]);
run('docker',['load','--input',join(out,'image.tar.gz')]);
assert.equal(run('docker',['image','inspect','laorenyun:release-candidate','--format','{{.Id}}']),id);
const hashFile=path=>run('sha256sum',[path]).split(' ')[0];
const releaseRepo='Develata/laorenyun';
function api(path){return JSON.parse(run('gh',['api',path]));}
function optional(fn) {try{return fn();}catch(e){if(/HTTP 404|release not found|manifest unknown|not found/i.test(String(e.stderr)))return null;throw e;}}
const old=optional(()=>api(`repos/${releaseRepo}/releases/tags/${tag}`));
if(old && process.env.RELEASE_ALLOW_BACKFILL!=='true')throw Error('Existing release requires explicit manual backfill');
async function remote(reference){
 let text;try{text=run('docker',['buildx','imagetools','inspect','--raw',reference]);}catch(e){if(/manifest unknown|MANIFEST_UNKNOWN/i.test(String(e.stderr)))return null;throw e;}
 const manifest=JSON.parse(text);assert.match(manifest.config?.digest??'',digestPattern,'single-platform image required');
 immutableIdentity(manifest.config.digest,id);
 return {configId:manifest.config.digest}; // An existing alias is never pushed over, even for identical image ID.
}
// Preflight both immutable aliases BEFORE any push or release changes.
const refs=[`${repo}:${version}`,`${repo}:sha-${input.commit}`];
const existing=[];for(const ref of refs)existing.push(await remote(ref));
if(!old){
 const args=['release','create',tag,'--repo',releaseRepo,'--verify-tag','--draft','--title',`老人云 ${tag}`,'--notes','Verified linux/amd64 container distribution. See attached source manifest, corresponding-source bundle and digest-pinned Compose.'];
 if(version.includes('-'))args.push('--prerelease');run('gh',args);
}
function attach(file){
 const info=api(`repos/${releaseRepo}/releases/tags/${tag}`), asset=info.assets.find(a=>a.name===file);
 if(asset){
  const temp=mkdtempSync(join(tmpdir(),'ly-release-asset-'));
  try{run('gh',['release','download',tag,'--repo',releaseRepo,'--pattern',file,'--dir',temp]);assert.equal(hashFile(join(temp,file)),hashFile(join(out,file)),'Existing asset differs; never overwrite');}finally{rmSync(temp,{recursive:true});}
 }else run('gh',['release','upload',tag,join(out,file),'--repo',releaseRepo]);
}
// Source is attached first; publication cannot race ahead of required source delivery.
for(const file of ['container-sources.tar.gz','container-source-manifest.json','inventory.json','acceptance.json'])attach(file);
const digestFor=ref=>{
 const desc=JSON.parse(run('docker',['buildx','imagetools','inspect',ref,'--format','{{json .Manifest}}']));
 assert.match(desc.digest,digestPattern);return desc.digest;
};
let digest;
for(let i=0;i<refs.length;i++){
 if(!existing[i]){run('docker',['tag',id,refs[i]]);run('docker',['push',refs[i]]);}
 const d=digestFor(refs[i]);run('docker',['pull',`${repo}@${d}`]);assert.equal(run('docker',['image','inspect',`${repo}@${d}`,'--format','{{.Id}}']),id);
 if(i===0)digest=d;
}
writeFileSync(join(out,'image-digest.txt'),`${repo}@${digest}\n`);
writeFileSync(join(out,'compose.release.yml'),releaseCompose(readFileSync(join(source,'compose.yaml'),'utf8'),digest));
writeFileSync(join(out,'release-provenance.json'),JSON.stringify({...input,imageId:id,imageDigest:digest,sourceBundleSha256:hashFile(join(out,'container-sources.tar.gz')),attestation:'not generated',sbom:'not generated; inventory is not SBOM'},null,2)+'\n');
const assets=['container-sources.tar.gz','container-source-manifest.json','inventory.json','acceptance.json','image-digest.txt','compose.release.yml','release-provenance.json'];
writeFileSync(join(out,'SHA256SUMS'),assets.map(f=>hashFile(join(out,f))+'  '+f).join('\n')+'\n');
for(const f of [...assets.slice(4),'SHA256SUMS'])attach(f);
// Never edit notes or unrelated assets on an existing release.
if(!old)run('gh',['release','edit',tag,'--repo',releaseRepo,'--draft=false','--latest=false']);
console.log(JSON.stringify({published:`${repo}@${digest}`,release:`https://github.com/${releaseRepo}/releases/tag/${tag}`}));
