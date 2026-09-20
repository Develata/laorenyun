// Explicit local synthetic browser rehearsal. Never log the private launch URL.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "../.."),
  dir = resolve(root, "demo");
const require = createRequire(
  resolve(
    process.env.DEMO_BROWSER_RUNTIME ??
      resolve(root, "upstream/deepseek-harness/apps/web"),
    "package.json",
  ),
);
const { chromium } = require("playwright");
const run = (args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    timeout: 30000,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
const c = run([
  "compose",
  "-f",
  resolve(dir, "compose.yml"),
  "-p",
  "laorenyun-demo",
  "ps",
  "-q",
  "laorenyun",
]);
const receipt = JSON.parse(readFileSync(resolve(dir, ".private/receipt.json")));
const logs = run(["logs", c]),
  launch = [...logs.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];
assert.ok(launch);
const u = new URL("http://127.0.0.1:3085");
u.search = new URL(launch).search;
let browser,
  stage = "launch";
mkdirSync(resolve(dir, "output"), { recursive: true, mode: 0o700 });
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });
  const page = await browser.newPage({
    locale: "zh-CN",
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(20000);
  await page.addLocatorHandler(
    page.getByRole("button", { name: "稍后配置", exact: true }),
    (l) => l.click(),
  );
  await page.addLocatorHandler(
    page.getByRole("button", { name: "继续", exact: true }),
    (l) => l.click(),
  );
  // All provider traffic is unavailable: this rehearsal makes no remote browser requests.
  await page.route("**/*", (r) =>
    new URL(r.request().url()).hostname === "127.0.0.1"
      ? r.continue()
      : r.abort(),
  );
  await page.goto(u.href);
  const welcome = page.getByRole("button", { name: "继续", exact: true });
  if (await welcome.isVisible()) await welcome.click();
  stage = "archive";
  await page
    .getByRole("button", { name: "人物档案与采访记录", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "人物档案", exact: true })
    .selectOption(receipt.archive);
  stage = "typed";
  await page
    .getByRole("button", { name: "＋ 新一次采访", exact: true })
    .click();
  await page.waitForTimeout(1500);
  await page
    .locator('[data-composer-input="true"][contenteditable="true"]')
    .fill("这是合成演示，我想从读小学说起。");
  await page.getByRole("button", { name: /^(发送消息|Send message)$/ }).click();
  await page
    .getByText(/讲述已保存|已保存您的讲述/)
    .first()
    .waitFor();
  stage = "river";
  await page.getByRole("button", { name: "人生长河", exact: true }).click();
  await page.getByRole("combobox", { name: "长河时间范围" }).waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: resolve(dir, "output/river.png") });
  stage = "tree";
  await page.getByRole("button", { name: /开始读小学.*展开/ }).click();
  await page.getByRole("button", { name: /每天在窗前练字.*预览故事/ }).click();
  await page.getByRole("button", { name: "查看完整故事", exact: true }).click();
  stage = "detail";
  await page.getByRole("button", { name: "这里不对", exact: true }).waitFor();
  await page.screenshot({ path: resolve(dir, "output/detail.png") });
  stage = "book";
  await page.getByRole("button", { name: "我的自传", exact: true }).click();
  await page.getByRole("navigation", { name: "自传目录" }).waitFor();
  await page.screenshot({ path: resolve(dir, "output/biography.png") });
  const persona = page.locator("details.ly-persona-result");
  await persona.waitFor();
  await persona.locator("summary").first().click();
  writeFileSync(
    resolve(dir, "output/browser.json"),
    JSON.stringify({
      river: true,
      tree: true,
      detail: true,
      biography: true,
      persona: true,
      fallback: true,
      nativeTyped: true,
      remoteBrowserRequests: 0,
    }),
  );
  console.log("Synthetic browser fallback passed");
} catch (e) {
  writeFileSync(resolve(dir, ".private/browser-error.txt"), String(e), {
    mode: 0o600,
  });
  console.error("Browser failed at " + stage);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
