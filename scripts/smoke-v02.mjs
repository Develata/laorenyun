// Explicit real-model acceptance, synthetic text only. Never run in ordinary CI.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../upstream/deepseek-harness/apps/web/package.json',import.meta.url));
const {chromium}=require('playwright');
if(process.env.LAORENYUN_REAL_SMOKE!=='true')throw Error('Explicit LAORENYUN_REAL_SMOKE=true required; use an isolated Compose project');
const out=process.env.LAORENYUN_SMOKE_OUT||'/tmp/laorenyun-v02-acceptance';
await mkdir(out,{recursive:true,mode:0o700});
const log=await readFile(process.env.LAORENYUN_PRIVATE_LOG,'utf8');
const launch=[...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];
if(!launch)throw Error('Launch URL missing from private log');
const url=new URL(process.env.LAORENYUN_SMOKE_ORIGIN||'http://127.0.0.1:3091');url.search=new URL(launch).search;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||chromium.executablePath()});
const c=await browser.newContext({locale:'zh-CN',viewport:{width:1440,height:1000}}),p=await c.newPage();p.setDefaultTimeout(20000);
const errors=[];p.on('pageerror',e=>errors.push(e.name));
const call=(method,body,archive)=>p.evaluate(async({method,body,archive})=>await(await fetch('/api/laorenyun/'+method,{method:'POST',headers:{'Content-Type':'application/json','X-Laorenyun-Archive':archive},body:JSON.stringify(body)})).json(),{method,body,archive});
try{
  await p.goto(url.href);await p.getByRole('button',{name:'人生长河',exact:true}).waitFor();
  const welcome=p.getByRole('button',{name:'继续',exact:true});if(await welcome.isVisible())await welcome.click();
  await p.waitForTimeout(500);
  const expand=p.getByRole('button',{name:'人物档案与采访记录',exact:true});if(await expand.isVisible())await expand.click();
  let evidence;
  if(process.argv.includes('--verify-restart')){
    evidence=JSON.parse(await readFile(out+'/typed-evidence.json','utf8'));
    await p.getByRole('combobox',{name:'人物档案',exact:true}).selectOption(evidence.archive);
  }else{
    await p.getByRole('button',{name:'＋ 新建人物档案',exact:true}).click();
    await p.getByRole('textbox',{name:'怎么称呼您'}).fill('合成文字验收');
    await p.getByRole('button',{name:'建立档案',exact:true}).click();
    await p.getByRole('textbox',{name:'怎么称呼您'}).waitFor({state:'hidden'});
    const archive=await p.getByRole('combobox',{name:'人物档案',exact:true}).inputValue();
    const initial=await call('river',{},archive);assert.equal(initial.value.nodes.length,0);
    await p.locator('[data-composer-input="true"][contenteditable="true"]').fill('1976年春天，我离开学校以后进了合肥的一家工厂工作。');
    await p.getByRole('button',{name:/^(发送消息|Send message)$/}).click();
    const deadline=Date.now()+120000;let river;
    do{river=await call('river',{},archive);if(river.value?.nodes.length)break;await p.waitForTimeout(1500)}while(Date.now()<deadline);
    assert.ok(river.value?.nodes.length>0,'typed testimony extracted');
    const detail=await call('memory-detail',{id:river.value.nodes[0].id},archive),t=detail.value.sources[0].transcript;
    const source=await call('source',{sourceId:t.sourceId,sessionId:t.sessionId},archive);
    assert.equal(source.value.mediaId,null);assert.equal(source.value.rawAsr,'');
    evidence={archive,sourceId:source.value.id,transcriptId:t.id,sessionId:t.sessionId,nodeId:detail.value.node.id,graphRevision:river.value.graphRevision,typedOnly:true,mediaId:null};
    await p.getByRole('button',{name:'＋ 新一次采访',exact:true}).click();
    const shared=await call('river',{},archive);assert.ok(shared.value.nodes.some(n=>n.id===evidence.nodeId));
    const other=await call('archive-create',{title:'隔离验收空档案'},archive);assert.ok(other.ok);
    assert.equal((await call('river',{},other.value.id)).value.nodes.length,0);
    assert.equal((await call('source',{sourceId:t.sourceId,sessionId:t.sessionId},other.value.id)).ok,false);
    evidence.isolation=true;evidence.newInterviewSharesMemory=true;
    await writeFile(out+'/typed-evidence.json',JSON.stringify(evidence,null,2)+'\n',{mode:0o600});
  }
  await p.reload();await p.getByRole('button',{name:'人生长河',exact:true}).click();
  await p.getByRole('group',{name:'人生长河，沿河向下时间前进'}).waitFor();
  const river=await call('river',{},evidence.archive);assert.ok(river.value.nodes.some(n=>n.id===evidence.nodeId));
  const source=await call('source',{sourceId:evidence.sourceId,sessionId:evidence.sessionId},evidence.archive);assert.equal(source.value.mediaId,null);
  await p.screenshot({path:out+'/typed-river.png'});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({...evidence,refresh:true,restart:process.argv.includes('--verify-restart'),pageErrors:errors.length}));
}catch(e){await writeFile(out+'/error-private.txt',String(e),{mode:0o600});console.error('v0.2 browser smoke failed; see private local error file');process.exitCode=1}finally{await browser.close()}
