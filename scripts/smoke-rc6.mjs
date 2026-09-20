// Explicit synthetic-only browser regression; no provider calls or graph writes.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
const require=createRequire(new URL('../upstream/deepseek-harness/apps/web/package.json',import.meta.url));
const {chromium}=require('playwright');
if(process.env.LAORENYUN_RC6_ACCEPTANCE!=='true')throw Error('Explicit synthetic RC6 acceptance opt-in required');
const archiveId=process.env.LAORENYUN_SMOKE_ARCHIVE;
if(!archiveId)throw Error('Synthetic archive ID required');
const out=(process.env.LAORENYUN_SMOKE_OUT || '/tmp/laorenyun-rc6-browser')+'/images';
await mkdir(out,{recursive:true,mode:0o700});
async function open(){
 const log=await readFile(process.env.LAORENYUN_PRIVATE_LOG,'utf8');
 const launch=[...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];if(!launch)throw Error('Private launch record missing');
 const url=new URL(process.env.LAORENYUN_SMOKE_ORIGIN || 'http://127.0.0.1:3099');url.search=new URL(launch).search;
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath()});
 const p=await b.newPage({locale:'zh-CN',viewport:{width:1440,height:1000}});p.setDefaultTimeout(15000);
 try {await p.goto(url.href);}catch{await b.close();throw Error('Private application launch failed');}
 await p.getByRole('button',{name:'人生长河',exact:true}).waitFor();const welcome=p.getByRole('button',{name:'继续',exact:true});if(await welcome.isVisible())await welcome.click();await p.waitForTimeout(700);return {b,p};
}

import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const {b,p}=await open(),errors=[];p.on('pageerror',e=>errors.push(e.name));
const a={id:archiveId};
const call=(p,method,body={},archive)=>p.evaluate(async({method,body,archive})=>{const r=await(await fetch('/api/laorenyun/'+method,{method:'POST',headers:{'Content-Type':'application/json',...(archive?{'X-Laorenyun-Archive':archive}:{})},body:JSON.stringify(body)})).json();if(!r.ok)throw Error(r.error);return r.value;},{method,body,archive});
async function chooseArchive(id){const ex=p.getByRole('button',{name:'人物档案与采访记录',exact:true});if(await ex.isVisible())await ex.click();await p.getByRole('combobox',{name:'人物档案',exact:true}).selectOption(id);await p.waitForTimeout(600)}
async function river(){await p.getByRole('button',{name:'人生长河',exact:true}).click();await p.getByRole('combobox',{name:'长河时间范围'}).waitFor();await p.waitForTimeout(700)}
try{
await chooseArchive(a.id);await p.screenshot({path:out+'/sidebar-expanded.png'});
await p.getByRole('button',{name:'收起侧边栏',exact:true}).click();await river();await p.screenshot({path:out+'/sidebar-compact.png'});
assert.equal(await p.getByRole('button',{name:'人生长河',exact:true}).locator('svg').count(),1);
const select=p.getByRole('combobox',{name:'长河时间范围'});
await p.locator('.ly-time-nav').getByRole('button',{name:/^1960/}).click();await p.waitForTimeout(700);assert.equal(await select.inputValue(),'all');
await select.selectOption(String(1960*12));await p.waitForTimeout(700);
const transitions=[];
for(const year of [1980,1950]){await p.locator('.ly-time-nav').getByRole('button',{name:new RegExp('^'+year)}).click();await p.waitForFunction(y=>document.querySelector('select[aria-label="长河时间范围"]').value===String(y*12),year);await p.waitForTimeout(700);transitions.push(await select.inputValue());}
await p.locator('.ly-time-nav').getByRole('button',{name:'漂流湾',exact:true}).click();await p.waitForTimeout(700);assert.equal(await select.inputValue(),'drifting');
assert.equal(await p.locator('.ly-journey').isVisible(),false);
await p.locator('.ly-time-nav').getByRole('button',{name:/^1960/}).click();await p.waitForTimeout(700);assert.equal(await select.inputValue(),String(1960*12));
await select.selectOption('all');await p.waitForTimeout(700);await p.locator('.ly-river').evaluate(e=>e.scrollTop=0);await p.screenshot({path:out+'/river-overview.png'});
await p.getByRole('button',{name:/开始读小学.*展开/}).click();await p.locator('.ly-river').evaluate(e=>e.scrollTop=450);await p.waitForTimeout(400);await p.screenshot({path:out+'/river-tree-expanded.png'});
await p.getByRole('button',{name:/每天在窗前练字.*预览故事/}).press('Enter');await p.getByRole('button',{name:'讲故事',exact:true}).click();await p.getByRole('button',{name:'长河导航',exact:true}).click();await p.getByRole('button',{name:'查看完整故事 →',exact:true}).waitFor();await p.waitForTimeout(500);await p.screenshot({path:out+'/right-preview.png'});
await p.getByRole('button',{name:'查看完整故事 →',exact:true}).click();await p.getByRole('button',{name:'这里不对',exact:true}).waitFor();await p.screenshot({path:out+'/memory-detail.png'});await p.getByRole('button',{name:'这里不对',exact:true}).click();await p.getByRole('button',{name:'取消更正',exact:true}).click();
await p.getByRole('button',{name:'← 返回人生长河',exact:true}).click();
await p.getByRole('button',{name:/我出生在村子里.*预览故事/}).click();await p.getByRole('button',{name:'查看完整故事',exact:true}).click();await p.getByRole('button',{name:'这里不对',exact:true}).waitFor();assert.equal(await p.getByRole('heading',{name:'相关故事',exact:true}).count(),0);await p.getByRole('button',{name:'这里不对',exact:true}).click();await p.getByRole('button',{name:'取消更正',exact:true}).click();await p.getByRole('button',{name:'← 返回人生长河',exact:true}).click();
await p.locator('#ly-drifting-bay').scrollIntoViewIfNeeded();const dr=p.getByRole('button',{name:/河边摸小鱼.*展开/});if(await dr.count())await dr.click();await p.waitForTimeout(300);await p.screenshot({path:out+'/drifting-grove.png'});
await p.setViewportSize({width:768,height:1000});await select.selectOption('all');await p.waitForTimeout(300);await p.locator('.ly-river').evaluate(e=>e.scrollTop=350);await p.screenshot({path:out+'/river-tablet.png'});
await p.setViewportSize({width:360,height:800});await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(500);const root=p.getByRole('button',{name:/开始读小学.*展开/});if(await root.count())await root.press('Enter');await p.locator('.ly-river').evaluate(e=>e.scrollTop=430);await p.waitForTimeout(300);await p.screenshot({path:out+'/river-mobile.png'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.ly-current').first().evaluate(e=>getComputedStyle(e).animationName),'none');
await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:out+'/river-reduced-motion.png'});
const archives=await call(p,'archives');await chooseArchive(archives.defaultId);await p.getByRole('button',{name:'收起侧边栏',exact:true}).click();await p.getByRole('button',{name:'我的自传',exact:true}).click();const persona=p.locator('details.ly-persona-result');await persona.waitFor();assert.equal(await persona.getAttribute('open'),null);await p.locator('.ly-river').evaluate(e=>e.scrollTop=0);await p.screenshot({path:out+'/biography.png'});await persona.locator('summary').first().click();assert.notEqual(await persona.getAttribute('open'),null);await p.screenshot({path:out+'/persona.png'});await persona.locator('summary').first().click();
await p.getByRole('button',{name:'讲故事',exact:true}).click();await p.waitForTimeout(500);await p.screenshot({path:out+'/interview.png'});
await p.getByRole('button',{name:'设置',exact:true}).click();await p.waitForTimeout(400);await p.screenshot({path:out+'/settings.png'});
assert.deepEqual(errors,[]);await writeFile(out+'/../visual.json',JSON.stringify({transitions,driftingReturn:true,sidebarSvg:true,personaCollapsed:true,correctionCancelled:true,correctionWithoutRelations:true,sizes:[1440,768,360],keyboard:true,reducedMotion:true,pageErrors:errors.length},null,2));console.log('RC6 visual/navigation flow passed');
} catch(e){await writeFile(out+'/../browser-error-private.txt',String(e));console.error('RC6 browser failed, inspect local private error');process.exitCode=1}finally{await b.close()}
