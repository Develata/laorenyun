// Real browser acceptance against an explicitly selected synthetic archive.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(new URL('../upstream/deepseek-harness/apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
if (process.env.LAORENYUN_SYNTHETIC_ACCEPTANCE !== 'true' || !process.env.LAORENYUN_SMOKE_ARCHIVE) throw Error('Explicit synthetic archive required');
const out = process.env.LAORENYUN_SMOKE_OUT || '/tmp/laorenyun-v02-experience';
await mkdir(out, { recursive: true, mode: 0o700 });
const log = await readFile(process.env.LAORENYUN_PRIVATE_LOG, 'utf8');
const launch = [...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];
if (!launch) throw Error('Private launch log missing');
const url = new URL(process.env.LAORENYUN_SMOKE_ORIGIN || 'http://127.0.0.1:3092');
url.search = new URL(launch).search;
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath() });
const context = await browser.newContext({ locale: 'zh-CN', viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();page.setDefaultTimeout(20000);
const errors = [];page.on('pageerror', e => errors.push(e.name));
try {
  await page.goto(url.href);
  await page.getByRole('button', { name: '人生长河', exact: true }).waitFor();
  const welcome = page.getByRole('button', { name: '继续', exact: true });
  if (await welcome.isVisible()) await welcome.click();
  await page.waitForTimeout(500);
  const expand = page.getByRole('button', { name: '人物档案与采访记录', exact: true });
  if (await expand.isVisible()) await expand.click();
  await page.getByRole('combobox', { name: '人物档案', exact: true }).selectOption(process.env.LAORENYUN_SMOKE_ARCHIVE);
  await page.getByRole('button', { name: '收起侧边栏', exact: true }).click();
  await page.getByRole('button', { name: '人生长河', exact: true }).click();
  const range = page.getByRole('combobox', { name: '长河时间范围' });await range.waitFor();
  assert.equal(await page.getByText('DSH 本地构建', { exact: true }).count(), 0);
  await page.waitForTimeout(500);
  await page.screenshot({ path: out + '/overview.png' });
  const options = await range.locator('option').evaluateAll(es => es.map(e => e.value).filter(v => !['all', 'drifting'].includes(v)));
  assert.ok(options.length > 1, 'archive must have multiple periods to exercise shrinking layouts');
  for (const value of [options[0], options.at(-1), 'drifting', 'all']) {
    await range.selectOption(value);
    await page.waitForTimeout(700);
    assert.equal(await range.inputValue(), value);
    assert.deepEqual(errors, []);
  }
  const geometry = await page.locator('path.ly-water').evaluate(path => {
    const length = path.getTotalLength();let error = 0;
    for (const [a,b] of [[.1,.2],[.2,.4],[.4,.8]]) {
      let measured = 0, previous = path.getPointAtLength(length*a);
      for(let i=1;i<=500;i++){const p=path.getPointAtLength(length*(a+(b-a)*i/500));measured+=Math.hypot(p.x-previous.x,p.y-previous.y);previous=p;}
      error=Math.max(error,Math.abs(measured/(length*(b-a))-1));
    }
    return { length, relativeError:error };
  });
  assert.ok(geometry.relativeError < .005);
  await page.locator('.ly-river').evaluate(el => el.scrollTop=800);
  await page.screenshot({path:out+'/middle.png'});
  await page.locator('svg g[role=button]').first().click();
  await page.getByRole('button',{name:'这里不对',exact:true}).waitFor();
  await page.screenshot({path:out+'/detail.png'});
  await page.getByRole('button',{name:'这里不对',exact:true}).click();
  await page.getByRole('button',{name:'取消更正',exact:true}).click();
  await page.getByRole('button',{name:'← 返回人生长河',exact:true}).click();
  await page.locator('#ly-drifting-bay').scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/drifting.png'});
  await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.ly-river').evaluate(el => el.scrollTop=0);await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:out+'/mobile-reduced.png'});
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='2');
  await page.waitForTimeout(500);await page.screenshot({path:out+'/zoom200.png'});
  await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement!==document.body));
  await page.evaluate(()=>document.body.style.zoom='1');
  await page.getByRole('button',{name:'设置',exact:true}).click();
  await page.getByRole('button',{name:'语音服务',exact:true}).click();
  assert.equal(await page.locator('input[type=password]').evaluateAll(es=>es.every(e=>e.value==='')),true);
  await page.getByRole('button',{name:'AI 模型',exact:true}).click();
  await page.getByRole('combobox',{name:'新采访使用的模型',exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  await writeFile(out+'/evidence.json',JSON.stringify({geometry,rangeTransitions:4,pageErrors:0,mobileWidth:360,zoom:2,reducedMotion:true,correctionCancelled:true,settings:true},null,2)+'\n');
  console.log('v0.2 experience smoke passed');
} catch(error) {
  await writeFile(out+'/error-private.txt',String(error),{mode:0o600});
  console.error('v0.2 experience smoke failed; inspect private local evidence');process.exitCode=1;
} finally { await browser.close(); }
