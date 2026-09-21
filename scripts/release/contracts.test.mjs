import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {releaseVersion,verifyInputs,immutableIdentity,releaseCompose,sourceProblems,sha256,stableLinks} from './contracts.mjs';
const sha='a'.repeat(40),digest='sha256:'+'a'.repeat(64);
const input={tag:'v0.2.0',commit:sha,tagCommit:sha,pin:{repository:'https://github.com/Develata/dsh-laorenyun',commit:sha,version:'0.2.0'},pluginTagCommit:sha,pluginPackage:{name:'dsh-laorenyun',version:'0.2.0'},upstream:{version:'0.1.6-alpha.1',commit:'0d1f50007f9bca3f52b06e1c3074fa14d5fb0720'}};
test('stable/prerelease input, mismatched versions and immutable commits',()=>{
 assert.equal(releaseVersion('v0.2.1-rc.1'),'0.2.1-rc.1');assert.equal(verifyInputs(input).version,'0.2.0');
 for(const tag of ['main','v01.2.0','v0.2.1-01','v0.2.0;id','v0.2.0+build'])assert.throws(()=>releaseVersion(tag));
 for(const change of [{tag:'v0.2.1'},{tagCommit:'b'.repeat(40)},{pluginTagCommit:null},{pluginTagCommit:'b'.repeat(40)},{pluginPackage:{name:'dsh-laorenyun',version:'0.1.0'}}])assert.throws(()=>verifyInputs({...input,...change}));
});
test('immutable image guard fails on different identity or malformed digest',()=>{
 immutableIdentity(null,digest);immutableIdentity(digest,digest);
 assert.throws(()=>immutableIdentity(digest,'sha256:'+'b'.repeat(64)));
 assert.throws(()=>immutableIdentity(null,'latest'));
});
test('Compose is pull-only, digest pinned and retains security',()=>{
 const text=readFileSync(new URL('../../compose.yaml',import.meta.url),'utf8');
 const result=releaseCompose(text,digest);assert.ok(result.includes('@'+digest));assert.ok(result.includes('cap_drop: [ALL]'));assert.ok(result.includes('no-new-privileges:true'));assert.ok(!result.includes('build:'));
 assert.throws(()=>releaseCompose(text,'ghcr.io/foo:latest'));
});
test('source closure is exact, required and fail-closed',()=>{
 const inventory={os:[{sourcePackage:'example',sourceVersion:'1'}],packages:[],buildClosure:[],bundledClosure:{status:'complete',packages:[]},nativeVersions:{vips:'1'}};
 const manifest={schema:1,imageId:digest,inventorySha256:sha256(JSON.stringify(inventory)),nativeVersions:{vips:'1'},reviewStatus:'complete',files:{'source.tar':sha256('s'),'build.sh':sha256('b'),'COPYING':sha256('c')},components:['deb:example@1','vips:vips@1'].map(id=>({id,license:'LGPL-3.0-or-later',sourceIdentity:id,delivery:'source',review:'fixture only',combination:'independent',notices:['COPYING'],sources:['source.tar'],buildMaterial:['build.sh']}))};
 const files=new Set(Object.keys(manifest.files));assert.deepEqual(sourceProblems(inventory,manifest,files),[]);
 assert.ok(sourceProblems(inventory,manifest,new Set()).some(x=>x.startsWith('MISSING_MATERIAL')));
 assert.ok(sourceProblems(inventory,{...manifest,inventorySha256:'bad'},files).includes('INVENTORY_MISMATCH'));
 assert.ok(sourceProblems(inventory,{...manifest,reviewStatus:'incomplete'},files).includes('SOURCE_REVIEW_INCOMPLETE'));
 assert.ok(sourceProblems(inventory,{...manifest,components:[]},files).some(x=>x.startsWith('UNREVIEWED')));
 assert.ok(sourceProblems(inventory,{...manifest,components:manifest.components.map(c=>({...c,delivery:'notice-only'}))},files).some(x=>x.startsWith('SOURCE_REQUIRED')));
});
test('bundle missing, modified or path/link injection rejected without extraction',()=>{
 const dir=mkdtempSync(join(tmpdir(),'ly-bundle-test-'));
 try{
  const m=join(dir,'manifest.json'),tar=join(dir,'bundle.tar.gz');writeFileSync(m,JSON.stringify({files:{'ok.txt':sha256('ok')}}));
  const verify=()=>execFileSync('python3',[new URL('./archive.py',import.meta.url).pathname,tar,m],{stdio:'pipe'});
  assert.throws(verify);
  const make=(name,type,body)=>execFileSync('python3',['-c',`import tarfile,io,sys\np=tarfile.TarInfo(sys.argv[2]);p.type=tarfile.SYMTYPE if sys.argv[3]=='link' else tarfile.REGTYPE;p.linkname='/etc/passwd';b=sys.argv[4].encode();p.size=len(b)\nwith tarfile.open(sys.argv[1],'w:gz') as t:t.addfile(p,io.BytesIO(b))`,tar,name,type,body]);
  make('ok.txt','file','ok');verify();make('ok.txt','file','wrong');assert.throws(verify);make('../escape','file','ok');assert.throws(verify);make('ok.txt','link','');assert.throws(verify);
 }finally{rmSync(dir,{recursive:true});}
});

test('workflow permission boundary, immutable source checkout and no publish rebuild',()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/release-image.yml',import.meta.url),'utf8');
 const before=workflow.split('  publish:')[0], publish=workflow.split('  publish:')[1];
 assert.ok(before.includes('contents: read'));assert.ok(!before.includes('packages: write'));
 assert.ok(publish.includes("needs.image.outputs.allowed == 'true'"));assert.ok(publish.includes('inputs.dry_run == false'));
 assert.ok(!publish.includes('build-push-action'));assert.ok(!publish.includes('docker build'));
 assert.ok(before.includes('refs/tags/${{ inputs.tag || github.ref_name }}'));
 for(const [,ref] of workflow.matchAll(/uses: ([^\n]+)/g))assert.match(ref,/@[a-f0-9]{40}$/);
 const publisher=readFileSync(new URL('./publish.mjs',import.meta.url),'utf8');assert.ok(!publisher.includes('--clobber'));assert.ok(!publisher.includes(':latest'));assert.ok(publisher.includes('verify-bundle.mjs'));
});

test('linked-library material is independent of process address randomization',()=>{
 const a='libavcodec.so.59 => /lib/libavcodec.so.59 (0x0123)\n/lib/ld-linux.so.2 (0xabcd)\n';
 const b='libavcodec.so.59 => /lib/libavcodec.so.59 (0x4567)\n/lib/ld-linux.so.2 (0x5678)\n';
 assert.equal(stableLinks(a),stableLinks(b));assert.ok(stableLinks(a).includes('/lib/libavcodec.so.59'));assert.notEqual(stableLinks(a),stableLinks(b.replace('59','60')));
});
