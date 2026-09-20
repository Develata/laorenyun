// Explicit synthetic-only browser regression; no provider calls or graph writes.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
const require=createRequire(new URL('../upstream/deepseek-harness/apps/web/package.json',import.meta.url));
const {chromium}=require('playwright');
if(process.env.LAORENYUN_RC5_ACCEPTANCE!=='true')throw Error('Explicit synthetic RC5 acceptance opt-in required');
const archive=process.env.LAORENYUN_SMOKE_ARCHIVE;
if(!archive)throw Error('Synthetic archive ID required');
const out=process.env.LAORENYUN_SMOKE_OUT || '/tmp/laorenyun-rc5-browser';
await mkdir(out+'/images',{recursive:true,mode:0o700});
async function open(){
 const log=await readFile(process.env.LAORENYUN_PRIVATE_LOG,'utf8');
 const launch=[...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];if(!launch)throw Error('Private launch record missing');
 const url=new URL(process.env.LAORENYUN_SMOKE_ORIGIN || 'http://127.0.0.1:3098');url.search=new URL(launch).search;
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath()});
 const p=await b.newPage({locale:'zh-CN',viewport:{width:1440,height:1000}});p.setDefaultTimeout(15000);
 try {await p.goto(url.href);}catch{await b.close();throw Error('Private application launch failed');}
 await p.getByRole('button',{name:'人生长河',exact:true}).waitFor();const welcome=p.getByRole('button',{name:'继续',exact:true});if(await welcome.isVisible())await welcome.click();await p.waitForTimeout(700);return {b,p};
}
import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const {b,p}=await open();try{
const ex=p.getByRole('button',{name:'人物档案与采访记录',exact:true});if(await ex.isVisible())await ex.click();await p.getByRole('combobox',{name:'人物档案',exact:true}).selectOption(archive);await p.waitForTimeout(500);await p.getByRole('button',{name:'收起侧边栏',exact:true}).click();await p.getByRole('button',{name:'人生长河',exact:true}).click();await p.getByRole('button',{name:/开始读小学.*展开/}).click();await p.locator('.ly-river').evaluate(el=>el.scrollTop=450);await p.waitForTimeout(400);await p.screenshot({path:out+'/images/river-tree-deep.png'});
const nav=p.getByRole('navigation',{name:'年代导航'});await nav.getByRole('button',{name:/1970/}).click();await p.waitForTimeout(1200);
const navResult=await p.evaluate(()=>{const nav=document.querySelector('.ly-time-nav').getBoundingClientRect(),river=document.querySelector('.ly-journey').getBoundingClientRect();return{navRight:nav.right,canvasLeft:river.left,noOverlay:nav.right<=river.left};});assert.equal(navResult.noOverlay,true);
const grove=p.getByRole('group',{name:'漂流湾故事群'}),collapsed=Number(await grove.getAttribute('height'));await p.getByRole('button',{name:/河边摸小鱼.*展开/}).click();await p.waitForTimeout(300);const expanded=Number(await grove.getAttribute('height'));await p.getByRole('button',{name:/河边摸小鱼.*收起/}).click();await p.waitForTimeout(300);assert.equal(Number(await grove.getAttribute('height')),collapsed);
await p.setViewportSize({width:360,height:800});await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(400);const root=p.getByRole('button',{name:/开始读小学.*收起/});await root.scrollIntoViewIfNeeded();await p.getByRole('button',{name:/每天在窗前练字.*预览故事/}).press('Enter');await p.waitForTimeout(300);const leafBounds=await p.locator('.ly-tree-open').evaluate(e=>{const b=e.getBoundingClientRect();return{left:b.left,right:b.right,viewport:innerWidth};});assert.ok(leafBounds.left>=0&&leafBounds.right<=360);const motion=await p.locator('.ly-current').first().evaluate(e=>getComputedStyle(e).animationName);assert.equal(motion,'none');await p.screenshot({path:out+'/images/river-mobile.png'});await writeFile(out+'/navigation.json',JSON.stringify({navResult,grove:{collapsed,expanded,restored:true},leafBounds,reducedMotion:motion,keyboardSelection:true},null,2));console.log('navigator exclusion, grove recovery, mobile tree bounds and keyboard passed');
}finally{await b.close()}
