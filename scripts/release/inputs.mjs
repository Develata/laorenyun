import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {releaseVersion,verifyInputs} from './contracts.mjs';
const [tag, directory, output] = process.argv.slice(2);
releaseVersion(tag);
const cwd = resolve(directory);
const run=(bin,args)=>execFileSync(bin,args,{cwd,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024}).trim();
const api=path=>JSON.parse(run('gh',['api',path]));
function remoteTag(repository) {
  const ref=api(`repos/Develata/${repository}/git/ref/tags/${tag}`).object;
  return ref.type==='tag'?api(`repos/Develata/${repository}/git/tags/${ref.sha}`).object.sha:ref.sha;
}
const pin=JSON.parse(readFileSync(resolve(cwd,'PLUGIN.json')));
const pkg=api(`repos/Develata/dsh-laorenyun/contents/package.json?ref=${pin.commit}`);
const upstream=JSON.parse(readFileSync(resolve(cwd,'UPSTREAM.json')));
const result=verifyInputs({tag,commit:run('git',['rev-parse','HEAD']),tagCommit:remoteTag('laorenyun'),pin,pluginTagCommit:remoteTag('dsh-laorenyun'),pluginPackage:JSON.parse(Buffer.from(pkg.content,'base64')),upstream});
run('node',['scripts/verify-upstream.mjs']);
run('node',['scripts/verify-release.mjs']);
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
if(process.env.GITHUB_OUTPUT)for(const [k,v]of Object.entries(result))appendFileSync(process.env.GITHUB_OUTPUT,`${k}=${v}\n`);
console.log(JSON.stringify(result));
