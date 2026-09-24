import {fixtureAccounting} from './fixture-accounting.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {noticeOnlyLicense} from './license-policy.mjs';
import {sourceProblems, sha256} from './contracts.mjs';
test('license alternatives do not impose unchosen copyleft; conjunctions and exceptions fail closed', () => {
 for (const x of ['MIT', 'BSD-3-Clause', '(MIT OR GPL-2.0-only)', 'Apache-2.0 AND MIT']) assert.equal(noticeOnlyLicense(x), true, x);
 for (const x of ['MIT AND GPL-2.0-only', 'LGPL-2.1-or-later', 'MPL-2.0', 'SEE LICENSE', 'unknown', 'MIT WITH unknown-exception', '(MIT', 'MIT OR', '']) assert.equal(noticeOnlyLicense(x), false, x);
});
test('build candidates are not distribution; shipped/bundled/combined copyleft stays gated', () => {
 const inventory={os:[{sourcePackage:'permissive',sourceVersion:'1'}],packages:[],buildClosure:[{name:'build-tool',version:'1',license:'GPL-3.0-only'}],bundledClosure:{status:'complete',packages:[]},nativeVersions:{vips:'1'}};
 const components=['deb:permissive@1','vips:vips@1'].map(id=>({id,license:'MIT',sourceIdentity:id,review:'synthetic fixture',combination:'independent',delivery:'notice-only',notices:['LICENSE']}));
 const manifest={schema:1,imageId:'sha256:'+'a'.repeat(64),inventorySha256:sha256(JSON.stringify(inventory)),nativeVersions:inventory.nativeVersions,reviewStatus:'complete',components,files:{LICENSE:sha256('text')}};
 fixtureAccounting(inventory,manifest);
 const check=()=>sourceProblems(inventory,{...manifest,inventorySha256:sha256(JSON.stringify(inventory))},new Set(['LICENSE']));
 assert.deepEqual(check(),[]);
 components[1].combination='corresponding-source';assert.ok(check().includes('SOURCE_REQUIRED:vips:vips@1'));
 components[1].combination='independent';components[1].license='MPL-2.0';assert.ok(check().includes('SOURCE_REQUIRED:vips:vips@1'));
 inventory.bundledClosure.packages.push({name:'shipped',version:'1',license:'GPL-3.0-only'});assert.ok(check().includes('UNREVIEWED:npm:shipped@1'));
 inventory.bundledClosure.status='incomplete';assert.ok(check().includes('BUNDLED_CLOSURE_UNREVIEWED'));
});
test('notice-only OR needs an explicit permitted license choice', () => {
 const inventory={os:[],packages:[{name:'dual',version:'1',license:'MIT OR GPL-2.0-only'}],buildClosure:[],bundledClosure:{status:'complete',packages:[]},nativeVersions:{vips:'1'}};
 const components=[{id:'npm:dual@1',license:'MIT OR GPL-2.0-only'},{id:'vips:vips@1',license:'MIT'}].map(c=>({...c,sourceIdentity:c.id,review:'fixture',combination:'independent',delivery:'notice-only',notices:['LICENSE']}));
 const manifest={schema:1,imageId:'sha256:'+'a'.repeat(64),inventorySha256:sha256(JSON.stringify(inventory)),nativeVersions:inventory.nativeVersions,reviewStatus:'complete',components,files:{LICENSE:sha256('text')}};
 fixtureAccounting(inventory,manifest);
 const check=()=>sourceProblems(inventory,manifest,new Set(['LICENSE']));
 assert.ok(check().includes('LICENSE_CHOICE_MISSING:npm:dual@1'));
 components[0].licenseChoice='BSD-2-Clause';assert.ok(check().includes('LICENSE_CHOICE_MISSING:npm:dual@1'));
 components[0].licenseChoice='GPL-2.0-only';assert.ok(check().includes('LICENSE_CHOICE_MISSING:npm:dual@1'));
 components[0].licenseChoice='MIT';assert.deepEqual(check(),[]);
 assert.equal(noticeOnlyLicense('(MIT AND GPL-2.0-only) OR BSD-2-Clause','MIT'),false);
 assert.equal(noticeOnlyLicense('(MIT AND GPL-2.0-only) OR BSD-2-Clause','BSD-2-Clause'),true);
});
