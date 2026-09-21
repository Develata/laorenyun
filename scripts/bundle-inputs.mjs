// Public Rollup/Rolldown output hook. Records actual emitted chunks, not the
// installation graph. External modules are deliberately not bundled inputs.
import {readFileSync,existsSync,mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function bundleInputs({root,out}) {
 const normalized=path=>relative(root,path).split('\\').join('/');
 function input(id){
  if(id.startsWith('\0'))return {id,virtual:true};
  const path=id.split('?')[0];
  if(!isAbsolute(path)||!existsSync(path))return {id:normalized(path),unresolved:true};
  let dir=dirname(path),pkg;
  while(dir!==dirname(dir)){
   const file=resolve(dir,'package.json');
   if(existsSync(file)){const value=JSON.parse(readFileSync(file,'utf8'));if(value.name&&value.version){pkg={name:value.name,version:value.version,license:value.license??null};break;}}
   dir=dirname(dir);
  }
  return {id:normalized(path),sha256:hash(readFileSync(path)),package:pkg??null};
 }
 return {name:'laorenyun-bundle-input-attribution',
  writeBundle(options,bundle){
   mkdirSync(out,{recursive:true});
   for(const entry of Object.values(bundle)){
    const path=options.file?resolve(options.file):resolve(options.dir,entry.fileName);
    const ids=entry.type==='chunk'?Object.entries(entry.modules).filter(([,m])=>m.renderedLength!==0).map(([id])=>id):(entry.originalFileNames??[]);
    const record={schema:1,output:normalized(path),sha256:hash(readFileSync(path)),kind:entry.type,inputs:[...new Set(ids)].sort().map(input)};
    const dest=resolve(out,hash(record.output)+'.json'),tmp=dest+'.'+process.pid+'.tmp';
    writeFileSync(tmp,JSON.stringify(record,null,2)+'\n');renameSync(tmp,dest);
   }
  }
 };
}
