import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
const pin=JSON.parse(await readFile('PLUGIN.json','utf8'));
if(pin.repository!=='https://github.com/Develata/dsh-laorenyun'||!/^[a-f0-9]{40}$/.test(pin.commit)||pin.version!=='0.2.0-rc.4')throw Error('Invalid plugin pin');
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(f=>f.endsWith('.md')&&!f.startsWith('upstream/')&&!f.startsWith('licenses/'));
let links=0;
for(const f of files){const text=await readFile(f,'utf8');for(const match of text.matchAll(/\]\(([^)]+)\)/g)){let target=match[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;target=target.replace(/^<|>$/g,'');if(target.includes(' '))continue;await access(resolve(dirname(f),decodeURIComponent(target)));links++;}}
console.log(JSON.stringify({pluginPinValid:true,localLinks:links}));
