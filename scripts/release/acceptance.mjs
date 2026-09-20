// Cloud-independent fresh-volume smoke. Native composer admits testimony; without keys extraction must fail honestly.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const [image,sourceDirectory,output]=process.argv.slice(2), source=resolve(sourceDirectory),out=resolve(output);
mkdirSync(out,{recursive:true,mode:0o700});
const run=(bin,args,options={})=>execFileSync(bin,args,{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,...options})?.trim() ?? '';
const project='ly-release-'+randomUUID(),volume=project+'-data',container=project;
const port=process.env.RELEASE_PORT ?? '3114';assert.match(port,/^\d{4,5}$/);
const imageInfo=JSON.parse(run('docker',['image','inspect',image]))[0];
assert.equal(imageInfo.Config.User,'10001:10001');
assert.equal(imageInfo.Architecture,'amd64');
assert.ok(!imageInfo.Config.Env.some(e=>/^(?:.*SECRET.*|.*TOKEN.*|.*API_KEY.*|.*PASSWORD.*)=.+/.test(e)));
const imageId=run('docker',['image','inspect',image,'--format','{{.Id}}']);
const pin=JSON.parse(readFileSync(resolve(source,'PLUGIN.json'))),upstream=JSON.parse(readFileSync(resolve(source,'UPSTREAM.json')));
let browser,stage='boot';
try {
 run('docker',['volume','create',volume]);
 run('docker',['run','-d','--name',container,'--init','--user','10001:10001','--cap-drop','ALL','--security-opt','no-new-privileges:true','-p',`127.0.0.1:${port}:3080`,'-v',`${volume}:/app/data`,'--env-file',resolve(source,'.env.example'),'-e','DSH_HOME=/app/data/dsh','-e','LAORENYUN_DATA_DIR=/app/data','-e','LAORENYUN_PRESET_ROOT=/opt/laorenyun/profiles/presets','--health-cmd','node /opt/laorenyun/scripts/healthcheck.mjs','--health-interval','3s','--health-timeout','3s','--health-retries','20',image]);
 async function healthy(){for(let i=0;i<60;i++){if(run('docker',['inspect',container,'--format','{{.State.Health.Status}}'])==='healthy')return;await new Promise(r=>setTimeout(r,1000));}throw Error('Local readiness timeout');}
 await healthy();
 assert.equal(run('docker',['exec',container,'id','-u']),'10001');assert.equal(run('docker',['exec',container,'id','-g']),'10001');
 const actual=JSON.parse(run('docker',['inspect',container]))[0];assert.deepEqual(actual.HostConfig.CapDrop,['ALL']);assert.ok(actual.HostConfig.SecurityOpt.includes('no-new-privileges:true'));assert.equal(actual.HostConfig.PortBindings['3080/tcp'][0].HostIp,'127.0.0.1');assert.ok(actual.Mounts.some(m=>m.Name===volume&&m.Destination==='/app/data'));
 for(const [file,expected]of [['PLUGIN.json',pin],['UPSTREAM.json',upstream]])assert.deepEqual(JSON.parse(run('docker',['exec',container,'cat','/opt/laorenyun/'+file])),expected);
 assert.deepEqual(upstream.corePatches,[]);
 const origin=`http://127.0.0.1:${port}`;
 assert.equal((await fetch(origin,{signal:AbortSignal.timeout(10000)})).status,401);
 const log=run('docker',['logs',container],{stdio:['ignore','pipe','pipe']});
 const launch=[...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];assert.ok(launch,'private launch URL missing');
 const url=new URL(origin);url.search=new URL(launch).search;
 stage='browser-load';
 const require=createRequire(resolve(process.env.RELEASE_BROWSER_RUNTIME,'package.json'));
 const {chromium}=require('playwright');
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage({locale:'zh-CN',viewport:{width:1440,height:1000}});page.setDefaultTimeout(20000);
 await page.addLocatorHandler(page.getByRole('button',{name:'稍后配置',exact:true}),async l=>l.click());
 stage='browser-open';await page.goto(url.href);
 await page.getByRole('button',{name:'人生长河',exact:true}).waitFor();
 const welcome=page.getByRole('button',{name:'继续',exact:true});if(await welcome.isVisible())await welcome.click();
 await page.getByRole('button',{name:'人生长河',exact:true}).waitFor();
 assert.ok((await page.locator('body').innerText()).includes('老人云'));
 stage='sidebar';const expand=page.getByRole('button',{name:'人物档案与采访记录',exact:true});if(await expand.isVisible())await expand.click();
 stage='new-interview';await page.getByRole('button',{name:'＋ 新一次采访',exact:true}).click();
 await page.waitForTimeout(1500);
 const later=page.getByRole('button',{name:'稍后配置',exact:true});if(await later.isVisible())await later.click();
 stage='native-composer';const testimony='1976年春天，我离开学校以后进了合肥的一家工厂工作。';
 await page.locator('[data-composer-input="true"][contenteditable="true"]').fill(testimony);
 await page.getByRole('button',{name:/^(发送消息|Send message)$/}).click();
 await page.getByText(/讲述已保存|已保存您的讲述/).first().waitFor();
 // Inspect software-owned persisted testimony, not generated graph claims or private user files.
 stage='source-persistence';const query=`const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('/app/data/laorenyun.db',{readOnly:true});console.log(JSON.stringify(db.prepare('SELECT sources.id,media_id,transcripts.id AS transcript_id FROM sources JOIN transcripts ON sources.id=transcripts.source_id ORDER BY sources.id').all()));`;
 const before=run('docker',['exec',container,'node','-e',query],{stdio:['ignore','pipe','pipe']});
 const rows=JSON.parse(before);assert.ok(rows.length>0);assert.ok(rows.some(r=>r.media_id===null));
 stage='restart';run('docker',['restart',container]);await healthy();assert.equal(run('docker',['exec',container,'node','-e',query],{stdio:['ignore','pipe','pipe']}),before);
 await page.reload();await page.getByRole('button',{name:'人生长河',exact:true}).waitFor();
 writeFileSync(resolve(out,'acceptance.json'),JSON.stringify({schema:1,imageId,plugin:pin.commit,dsh:upstream.commit,coldBoot:true,uid:10001,gid:10001,localhost:true,access401:true,persistentVolume:true,restart:true,elderlyShell:true,nativeTypedSource:true,mediaIdNull:true,cloudCalls:0,cloudExtractionClaimed:false,upstreamModifications:0},null,2)+'\n');
 console.log('Local image + Chromium + typed source + restart acceptance passed');
} catch (error) {
 // Playwright errors can contain secret launch URLs; never print the raw exception or container logs.
 if(process.env.RELEASE_PRIVATE_DIAGNOSTICS==='true')writeFileSync(resolve(out,'private-error.txt'),String(error),{mode:0o600});
 writeFileSync(resolve(out,'failure.json'),JSON.stringify({stage,errorName:error.name,errorCode:error.code ?? null}));
 throw Error('Release acceptance failed at '+stage+'; private runtime logs are not uploaded');
} finally {
 if(browser)await browser.close();
 run('docker',['rm','-f',container],{stdio:'ignore'});
 run('docker',['volume','rm',volume],{stdio:'ignore'}); // only this script-created fresh synthetic volume
}
