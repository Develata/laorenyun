import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountingProblems} from './accounting.mjs';
const hash='a'.repeat(64), other='b'.repeat(64);
function fixture(){return {
 expected:{shipped:[{id:'deb:libfoo@1',notices:[{path:'/doc/libfoo/copyright',sha256:hash}]},{id:'deb:foo-bin@1',notices:[{path:'/doc/foo-bin/copyright',sha256:other}]}]},
 component:{shipped:['deb:libfoo@1','deb:foo-bin@1'],notices:['foo','bin'],noticeCoverage:[{imagePath:'/doc/libfoo/copyright',material:'foo'},{imagePath:'/doc/foo-bin/copyright',material:'bin'}]},
 manifest:{files:{foo:hash,bin:other}},files:new Set(['foo','bin'])
};}
const check=f=>accountingProblems(f.expected,f.component,f.manifest,f.files);
test('same source identity requires every shipped binary and its exact notice bytes',()=>{
 const f=fixture();assert.deepEqual(check(f),[]);
 f.component.shipped.pop();assert.ok(check(f).includes('SHIPPED_COVERAGE_MISMATCH'));
});
test('one notice cannot substitute for a different shipped notice; omitted, extra and altered notices fail',()=>{
 for(const change of [f=>f.component.noticeCoverage.pop(),f=>f.component.noticeCoverage[1].material='foo',f=>f.manifest.files.bin=hash,f=>f.files.delete('bin'),f=>f.component.noticeCoverage.push({imagePath:'/unknown',material:'foo'})]){
  const f=fixture();change(f);assert.ok(check(f).length);
 }
});
test('npm duplicate installations retain their separate LICENSE and NOTICE paths',()=>{
 const f=fixture();f.expected.shipped[1].id='npm:foo@1:/another-install';f.component.shipped[1]=f.expected.shipped[1].id;
 assert.deepEqual(check(f),[]);f.component.noticeCoverage.pop();assert.ok(check(f).includes('NOTICE_COVERAGE_MISSING'));
});
test('missing discovery and duplicate or foreign shipped claims fail closed',()=>{
 for(const change of [f=>f.expected.shipped=[],f=>f.expected.shipped[0].notices=[],f=>f.component.shipped[1]=f.component.shipped[0],f=>f.component.shipped.push('extra')]){
 const f=fixture();change(f);assert.ok(check(f).length);
 }
});
