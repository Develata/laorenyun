import {createHash} from 'node:crypto';
import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import{execFileSync}from'node:child_process';
const packages=new Map();
function notice(path){return {path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')};}
function addPackage(x,root,role,licenseFiles){
 const key=x.name+'@'+x.version, prior=packages.get(key);
 const occurrence={id:`npm:${key}:${root}`,notices:licenseFiles.map(n=>notice(root+'/'+n))};
 packages.set(key,{...x,role,licenseFiles:[...new Set([...(prior?.licenseFiles??[]),...licenseFiles])],shipped:[...(prior?.shipped??[]),occurrence]});
}
function walk(root,role='DSH runtime'){
 for(const e of readdirSync(root,{withFileTypes:true})){
  if(e.isSymbolicLink())continue;
  const p=root+'/'+e.name;
  if(e.isDirectory())walk(p,role);
  else if(e.name==='package.json'){
   let x;try{x=JSON.parse(readFileSync(p,'utf8'));}catch{continue;}
   if(x.name&&x.version)addPackage({name:x.name,version:x.version,license:x.license??null,source:typeof x.repository==='string'?x.repository:x.repository?.url??x.homepage??null},root,role,readdirSync(root).filter(n=>/^(licen[cs]e|copying|notice|third[._-]party[._-]notices?)([._-]|$)/i.test(n)&&statSync(root+'/'+n).isFile()));
  }
 }
}
walk('/opt/dsh/node_modules');
for (const root of ['/usr/local/lib/node_modules', ...readdirSync('/opt').filter(n=>n.startsWith('yarn-v')).map(n=>'/opt/'+n)]) if (existsSync(root)) walk(root,'shipped Node image tooling');
for(const x of JSON.parse(readFileSync('/opt/dsh-laorenyun/lib/third-party/packages.json'))){
 const root='/opt/dsh-laorenyun/lib/third-party/'+x.name.replaceAll('/','_')+'-'+x.version;
 addPackage({...x,source:'https://www.npmjs.com/package/'+x.name+'/v/'+x.version},root,'bundled Tencent closure',readdirSync(root));
}
const build=JSON.parse(readFileSync('/opt/laorenyun/licenses/build-closure/build-closure.json'));
const os=execFileSync('dpkg-query',['-W','-f=${binary:Package}\t${Version}\t${source:Package}\t${source:Version}\n'],{encoding:'utf8'}).trim().split('\n').map(l=>{const[name,version,sourcePackage,sourceVersion]=l.split('\t');const p='/usr/share/doc/'+name.split(':')[0]+'/copyright';return{name,version,sourcePackage,sourceVersion,licensePath:p,licensePresent:existsSync(p),shipped:[{id:`deb:${name}@${version}`,notices:existsSync(p)?[notice(p)]:[]}],role:'Debian runtime',source:'https://snapshot.debian.org/package/'+sourcePackage+'/'+encodeURIComponent(sourceVersion)+'/',retrieval:'apt-get source --download-only '+sourcePackage+'='+sourceVersion};});
for(const p of packages.values()) {
 if(p.name.startsWith('@deepseek-ai/dsh'))p.coveringLicense='/opt/laorenyun/licenses/deepseek-harness/LICENSE';
 if(p.name==='@deepseek-ai/node-addon-system')p.coveringLicense='/opt/laorenyun/licenses/native-system/LICENSE';
 if(p.name==='@img/sharp-libvips-linux-x64')p.coveringLicense='/opt/laorenyun/licenses/sharp-libvips/LICENSE';
 if(p.name==='benchmark'&&p.version==='1.0.0'){p.role='embedded fast-uri benchmark metadata; not independently installed';p.coveringLicense='/opt/dsh/node_modules/.pnpm/fast-uri@3.1.3/node_modules/fast-uri/LICENSE';}
 const supplemental='/opt/laorenyun/licenses/release/supplemental/'+p.name.replaceAll('/','_')+'-'+p.version+'/LICENSE';
 if(existsSync(supplemental))p.coveringLicense=supplemental;
 if(p.name==='data-uri-to-buffer')p.coveringLicense=supplemental.replace('/LICENSE','/README.md');
 if(p.name==='@img/sharp-libvips-linux-x64')for(const file of ['THIRD-PARTY-NOTICES.md','LGPL-3.0.txt','GPL-3.0.txt']){const path='/opt/laorenyun/licenses/sharp-libvips/'+file;if(existsSync(path))for(const occurrence of p.shipped)occurrence.notices.push(notice(path));}
 if(p.coveringLicense&&existsSync(p.coveringLicense))for(const occurrence of p.shipped)if(!occurrence.notices.some(n=>n.path===p.coveringLicense))occurrence.notices.push(notice(p.coveringLicense));
}
const bundlePath='/opt/laorenyun/licenses/bundle-inputs.json';
const bundledClosure=existsSync(bundlePath)?JSON.parse(readFileSync(bundlePath,'utf8')):{status:'incomplete',packages:[],reason:'Image predates build-to-artifact attribution.'};
for(const a of bundledClosure.artifacts??[]){
 if(!a.path||a.path.startsWith('/')||a.path.split('/').includes('..')||!existsSync('/opt/dsh/'+a.path)||notice('/opt/dsh/'+a.path).sha256!==a.sha256)throw Error('Bundled artifact identity mismatch');
}

// Attribution establishes emitted identity. Actual preserved notice bytes remain
// a separate invariant; absence is not excused by a bundler record.
bundledClosure.packages=(bundledClosure.packages??[]).map(p=>{
 const dir='/opt/laorenyun/licenses/build-closure/'+p.name.replaceAll('/','+')+'@'+p.version;
 const notices=existsSync(dir)?readdirSync(dir).filter(n=>statSync(dir+'/'+n).isFile()).map(n=>notice(dir+'/'+n)):[];
 return {...p,shipped:[{id:`bundle:${p.name}@${p.version}`,notices}]};
});
const nodeNotice='/opt/laorenyun/licenses/node-'+process.versions.node+'/LICENSE';
const runtimeBinaries=[{name:'node',version:process.versions.node,path:process.execPath,sha256:notice(process.execPath).sha256,source:'https://nodejs.org/dist/v'+process.versions.node+'/',shipped:[{id:'binary:node@'+process.versions.node,notices:existsSync(nodeNotice)?[notice(nodeNotice)]:[]}]}];
console.log(JSON.stringify({runtimeBinaries,format:'laorenyun.license-index',version:1,notSBOM:true,redistribution:'inventory only; publication decided by scripts/release/verify-bundle.mjs',packages:[...packages.values()].sort((a,b)=>(a.name+a.version).localeCompare(b.name+b.version)),buildClosure:build,bundledClosure,os},null,2));
