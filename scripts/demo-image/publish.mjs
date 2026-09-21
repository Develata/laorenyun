// Private presenter image only. This does not grant public distribution approval.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {imageRepository,packagePath,digestPattern,privateVisibility,imageTag,commitInput} from './contracts.mjs';
const [mode,sourceDirectory='source',output='delivery']=process.argv.slice(2);
const run=(bin,args,options={})=>execFileSync(bin,args,{encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024,...options}).trim();
async function visibility(allowMissing){
 const r=await fetch('https://api.github.com/'+packagePath,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(20000)});
 const body=await r.json(); privateVisibility(r.status,body,allowMissing);return r.status;
}
if(mode==='preflight'){await visibility(true);console.log('Private package preflight passed');}
else if(mode==='publish'){
 const commit=commitInput(process.env.SOURCE_COMMIT),tag=imageTag(commit,process.env.GITHUB_RUN_ID,process.env.GITHUB_RUN_ATTEMPT);
 assert.equal(run('git',['rev-parse','HEAD'],{cwd:sourceDirectory}),commit);
 const image='laorenyun:private-demo-candidate';
 const id=run('docker',['image','inspect',image,'--format','{{.Id}}']);assert.match(id,digestPattern);
 const receipt=JSON.parse(readFileSync(resolve(output,'acceptance.json')));assert.equal(receipt.imageId,id);
 for(const key of ['coldBoot','access401','restart','nativeTypedSource'])assert.equal(receipt[key],true);
 const packageStatus=await visibility(true);
 // Fresh per-run alias; never overwrite an existing identity, even on manual reruns.
 let existing=false;
 if(packageStatus===200){
  try{run('docker',['buildx','imagetools','inspect',tag],{stdio:['ignore','pipe','pipe']});existing=true;}
  catch(e){if(!/manifest unknown|MANIFEST_UNKNOWN|not found/i.test(String(e.stderr)))throw e;}
 }
 assert.equal(existing,false,'demo alias already exists');
 run('docker',['tag',id,tag]);run('docker',['push',tag],{stdio:['ignore','pipe','pipe']});
 // GitHub documents first package publication as private. Verify persisted state,
 // including a short bounded allowance for API propagation; never change visibility.
 let verified=false;
 for(let i=0;i<6;i++){try{await visibility(false);verified=true;break;}catch(e){if(i===5)throw e;await new Promise(r=>setTimeout(r,2000));}}
 assert.ok(verified);
 const descriptor=JSON.parse(run('docker',['buildx','imagetools','inspect',tag,'--format','{{json .Manifest}}']));
 const digest=descriptor.digest;assert.match(digest,digestPattern);
 const reference=`${imageRepository}@${digest}`;
 run('docker',['pull',reference],{stdio:['ignore','pipe','pipe']});
 assert.equal(run('docker',['image','inspect',reference,'--format','{{.Id}}']),id,'pushed/pulled bytes differ');
 const pin=JSON.parse(readFileSync(resolve(sourceDirectory,'PLUGIN.json'))),upstream=JSON.parse(readFileSync(resolve(sourceDirectory,'UPSTREAM.json')));
 mkdirSync(output,{recursive:true});
 writeFileSync(resolve(output,'image-digest.txt'),reference+'\n');
 writeFileSync(resolve(output,'private-image.json'),JSON.stringify({schema:1,visibility:'private',sourceCommit:commit,plugin:pin.commit,dsh:upstream.commit,imageId:id,tag,digest,reference,publicDistributionApproved:false},null,2)+'\n');
 if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`digest=${digest}\nreference=${reference}\n`);
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Private demo image\n\n\`${reference}\`\n\nSource: \`${commit}\`\n\nVisibility: **private**; authenticated pull required. No public release or tag changed.\n`);
 console.log(JSON.stringify({reference,visibility:'private',sourceCommit:commit}));
}else throw Error('unknown private image operation');
