import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {bundleInputs} from '../bundle-inputs.mjs';
import {sha256} from './contracts.mjs';
test('emitted modules and exact output bytes drive attribution; tree-shaken/build-only inputs excluded',()=>{
 const root=mkdtempSync(join(tmpdir(),'ly-attribution-'));
 try{
 const src=join(root,'node_modules/pkg');mkdirSync(src,{recursive:true});writeFileSync(join(src,'package.json'),JSON.stringify({name:'pkg',version:'1',license:'MIT'}));writeFileSync(join(src,'a.js'),'export const a=1;');writeFileSync(join(root,'out.js'),'const a=1;');
 const p=bundleInputs({root,out:join(root,'evidence')});
 p.writeBundle({dir:root},{'out.js':{type:'chunk',fileName:'out.js',modules:{[join(src,'a.js')]:{renderedLength:10},[join(src,'unused.js')]:{renderedLength:0}}}});
 const record=JSON.parse(readFileSync(join(root,'evidence',readdirSync(join(root,'evidence'))[0])));
 assert.equal(record.sha256,sha256('const a=1;'));assert.equal(record.inputs.length,1);assert.equal(record.inputs[0].package.name,'pkg');assert.equal(record.inputs[0].id,'node_modules/pkg/a.js');
 }finally{rmSync(root,{recursive:true});}
});

test('deployed-byte join follows intermediate bundles and ignores unshipped build artifacts',async()=>{
 const {execFileSync}=await import('node:child_process');
 const root=mkdtempSync(join(tmpdir(),'ly-bundle-join-'));
 try{
 const records=join(root,'records'),runtime=join(root,'runtime');mkdirSync(records);mkdirSync(runtime);
 const pkg=name=>({name,version:'1',license:'MIT'});
 const data=[{schema:1,output:'intermediate.js',sha256:sha256('intermediate'),inputs:[{sha256:sha256('dep'),package:pkg('included')}]},{schema:1,output:'web.js',sha256:sha256('web'),inputs:[{sha256:sha256('intermediate'),package:pkg('workspace')}]},{schema:1,output:'tool.js',sha256:sha256('tool'),inputs:[{package:pkg('build-only')}]}];
 data.forEach((r,i)=>writeFileSync(join(records,i+'.json'),JSON.stringify(r)));writeFileSync(join(runtime,'web.js'),'web');writeFileSync(join(runtime,'different.js'),'changed');
 const output=join(root,'bundle-inputs.json');execFileSync('node',[new URL('../collect-bundle-inputs.mjs',import.meta.url).pathname,records,runtime,output]);
 const result=JSON.parse(readFileSync(output));assert.equal(result.artifacts.length,1);assert.deepEqual(result.packages.map(p=>p.name),['included','workspace']);assert.equal(result.status,'incomplete');
 }finally{rmSync(root,{recursive:true});}
});
