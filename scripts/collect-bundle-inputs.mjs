// Join actual copied artifacts to bundler records by bytes, recursively following
// intermediate DSH client bundles. Paths alone do not prove artifact identity.
import {readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const [recordsDir,runtime,out]=process.argv.slice(2);
const hash=b=>createHash('sha256').update(b).digest('hex');
const records=readdirSync(recordsDir).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(readFileSync(join(recordsDir,n))));
const byHash=new Map();for(const r of records){const rows=byHash.get(r.sha256)??[];rows.push(r);byHash.set(r.sha256,rows);}
const artifacts=[],packages=new Map(),unresolved=new Set();
function visit(h,seen=new Set()){
 if(seen.has(h))return [];seen.add(h);
 const inputs=[];
 for(const r of byHash.get(h)??[])for(const x of r.inputs){
  inputs.push(x);
  if(x.unresolved)unresolved.add(x.id);
  if(x.sha256&&byHash.has(x.sha256))inputs.push(...visit(x.sha256,seen));
 }
 return inputs;
}
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){
 const path=join(dir,e.name);if(e.isSymbolicLink())continue;if(e.isDirectory()){walk(path);continue;}
 if(!e.isFile()||statSync(path).size>32*1024*1024)continue;
 const h=hash(readFileSync(path));if(!byHash.has(h))continue;
 const ids=new Set();for(const input of visit(h))if(input.package){const p=input.package,key=p.name+'@'+p.version;ids.add(key);packages.set(key,p);}
 artifacts.push({path:relative(runtime,path),sha256:h,packages:[...ids].sort()});
}}
walk(runtime);
const report={schema:1,status:'incomplete',scope:'actual DSH Host/Client/Web emitted modules matched to deployed artifact bytes',reason:'Prebundled third-party code and global Corepack/Yarn attribution still require evidence; not a complete image bundle closure.',artifacts:artifacts.sort((a,b)=>a.path.localeCompare(b.path)),packages:[...packages.values()].sort((a,b)=>(a.name+'@'+a.version).localeCompare(b.name+'@'+b.version)),unresolved:[...unresolved].sort()};
if(!artifacts.length)throw Error('No deployed artifact matches bundler evidence');
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
