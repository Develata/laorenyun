import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {commitInput,privateVisibility,imageTag} from '../demo-image/contracts.mjs';
test('private demo requires a full commit and a private exact package',()=>{
 const sha='a'.repeat(40);assert.equal(commitInput(sha),sha);
 for(const x of ['main','v0.2.0','abc','a'.repeat(40)+';echo'])assert.throws(()=>commitInput(x));
 assert.throws(()=>privateVisibility(404,{},true));privateVisibility(200,{name:'laorenyun-demo-private',visibility:'private'});
 for(const [status,body] of [[403,{}],[404,{}],[200,{name:'laorenyun-demo-private',visibility:'public'}],[200,{name:'laorenyun',visibility:'private'}]])assert.throws(()=>privateVisibility(status,body));
 assert.equal(imageTag(sha,'123','1'),`ghcr.io/develata/laorenyun-demo-private:sha-${sha}-123-1`);
 assert.throws(()=>imageTag(sha,'../123','1'));
});
test('private workflow is manual, does not publish image artifacts or change source releases',()=>{
 const y=readFileSync(new URL('../../.github/workflows/demo-image.yml',import.meta.url),'utf8');
 assert.ok(y.includes('workflow_dispatch:'));assert.ok(y.includes("github.ref == 'refs/heads/main'"));assert.ok(y.includes('merge-base --is-ancestor'));
 assert.ok(!y.includes('contents: write'));assert.ok(!y.includes('verify-bundle.mjs'));assert.ok(!y.includes('sources.mjs'));assert.ok(!y.includes('image.tar'));assert.ok(y.includes('push: false'));
 const p=readFileSync(new URL('../demo-image/publish.mjs',import.meta.url),'utf8');assert.ok(!p.includes("'release'"));assert.ok(!p.includes('docker build'));assert.ok(p.includes("assert.equal(existing,false"));assert.ok(!p.includes('visibility(true)'));assert.ok(p.indexOf('await visibility();',p.indexOf("mode==='publish'"))<p.indexOf("run('docker',['push'"));
 for(const a of y.matchAll(/uses: ([^\s]+)@([^\s]+)/g))assert.match(a[2],/^[a-f0-9]{40}$/);
});
