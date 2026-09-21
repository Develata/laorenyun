import {readdirSync,readFileSync,existsSync} from 'node:fs';
import{execFileSync}from'node:child_process';
const packages=new Map();
function walk(root,role='DSH runtime'){for(const e of readdirSync(root,{withFileTypes:true})){if(e.isSymbolicLink())continue;const p=root+'/'+e.name;if(e.isDirectory())walk(p,role);else if(e.name==='package.json'){let x;try{x=JSON.parse(readFileSync(p,'utf8'));}catch{continue;}if(x.name&&x.version)packages.set(x.name+'@'+x.version,{name:x.name,version:x.version,license:x.license??null,source:typeof x.repository==='string'?x.repository:x.repository?.url??x.homepage??null,role,licenseFiles:readdirSync(root).filter(n=>/^(license|licence|copying|notice)/i.test(n))});}}}
walk('/opt/dsh/node_modules');
for (const root of ['/usr/local/lib/node_modules', ...readdirSync('/opt').filter(n=>n.startsWith('yarn-v')).map(n=>'/opt/'+n)]) if (existsSync(root)) walk(root,'shipped Node image tooling');
for(const x of JSON.parse(readFileSync('/opt/dsh-laorenyun/lib/third-party/packages.json')))packages.set(x.name+'@'+x.version,{...x,source:'https://www.npmjs.com/package/'+x.name+'/v/'+x.version,role:'bundled Tencent closure',licenseFiles:readdirSync('/opt/dsh-laorenyun/lib/third-party/'+x.name.replaceAll('/','_')+'-'+x.version)});
const build=JSON.parse(readFileSync('/opt/laorenyun/licenses/build-closure/build-closure.json'));
const os=execFileSync('dpkg-query',['-W','-f=${Package}\t${Version}\t${source:Package}\t${source:Version}\n'],{encoding:'utf8'}).trim().split('\n').map(l=>{const[name,version,sourcePackage,sourceVersion]=l.split('\t');const p='/usr/share/doc/'+name+'/copyright';return{name,version,sourcePackage,sourceVersion,licensePath:p,licensePresent:existsSync(p),role:'Debian runtime',source:'https://snapshot.debian.org/package/'+sourcePackage+'/'+encodeURIComponent(sourceVersion)+'/',retrieval:'apt-get source --download-only '+sourcePackage+'='+sourceVersion};});
for(const p of packages.values()) {
 if(p.name.startsWith('@deepseek-ai/dsh'))p.coveringLicense='/opt/laorenyun/licenses/deepseek-harness/LICENSE';
 if(p.name==='@deepseek-ai/node-addon-system')p.coveringLicense='/opt/laorenyun/licenses/native-system/LICENSE';
 if(p.name==='@img/sharp-libvips-linux-x64')p.coveringLicense='/opt/laorenyun/licenses/sharp-libvips/LICENSE';
 if(p.name==='benchmark'&&p.version==='1.0.0'){p.role='embedded fast-uri benchmark metadata; not independently installed';p.coveringLicense='fast-uri@3.1.3/LICENSE';}
 const supplemental='/opt/laorenyun/licenses/release/supplemental/'+p.name.replaceAll('/','_')+'-'+p.version+'/LICENSE';
 if(existsSync(supplemental))p.coveringLicense=supplemental;
 if(p.name==='data-uri-to-buffer')p.coveringLicense=supplemental.replace('/LICENSE','/README.md');
}
console.log(JSON.stringify({format:'laorenyun.license-index',version:1,notSBOM:true,redistribution:'inventory only; publication decided by scripts/release/verify-bundle.mjs',packages:[...packages.values()].sort((a,b)=>(a.name+a.version).localeCompare(b.name+b.version)),buildClosure:build,bundledClosure:{status:'incomplete',packages:[],reason:'Build installation inventory is not emitted-code evidence. DSH/Web, Corepack and Yarn bundled inputs still require exact build-to-artifact attribution.'},os},null,2));
