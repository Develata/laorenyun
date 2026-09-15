// Elder profile on a preserved fixture archive; cloud credentials intentionally absent.
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(
  new URL(
    "../upstream/deepseek-harness/apps/web/package.json",
    import.meta.url,
  ),
);
const { chromium } = require("playwright");
const dir = "/tmp/laorenyun-phase2-browser";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath(),
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
  ],
});
const context = await browser.newContext({
  locale: "zh-CN",
  permissions: ["microphone"],
  viewport: { width: 1280, height: 1000 },
  storageState: dir + "/browser-private.json",
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
let tts = 0;
page.on("request", (r) => {
  if (r.url().endsWith("/laorenyun/tts")) tts++;
});
try {
  const log = await readFile("/tmp/laorenyun-phase2-host-private.log", "utf8");
  const launch = log.match(/dsh web: (http\S+)/)?.[1];
  const url = new URL("http://127.0.0.1:3082");
  url.search = new URL(launch).search;
  await page.goto(url.href);
  await page.getByRole("button", { name: "开始讲", exact: true }).waitFor();
  await page.waitForTimeout(1500);
  assert.equal(tts, 0);
  const body = await page.locator("body").innerText();
  for (const forbidden of [
    "模拟语音输入",
    "创建验证支线",
    "系统提示词",
    "工作区内修改",
    "laorenyun-source:",
  ])
    assert.ok(!body.includes(forbidden), forbidden);
  assert.ok(!/[0-9a-f]{8}-[0-9a-f-]{27}/.test(body), "no visible UUID");
  const fake = await page.evaluate(async () => {
    const r = await fetch("/api/laorenyun/fake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return r.status;
  });
  assert.equal(fake, 404);
  await page.getByRole("button", { name: "开始讲", exact: true }).click();
  await page.getByRole("button", { name: "讲完了", exact: true }).waitFor();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "讲完了", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "录音已经保存" }).waitFor();
  await page.getByRole("button", { name: "重新识别", exact: true }).waitFor();
  await page.screenshot({ path: dir + "/elder.png", fullPage: true });
  await page.getByRole("button", { name: "重新识别", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "录音已经保存" }).waitFor();
  await writeFile(
    dir + "/elder-evidence.json",
    JSON.stringify(
      {
        elderNoProbe: true,
        noTechnicalUuid: true,
        noSystemPrompt: true,
        noWorkspacePermissionChip: true,
        historyNotAutoplay: true,
        missingCloudConfigRecoverable: true,
        fakeRouteStatus: fake,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS elder controls/UUID hidden, fixture route absent, original retained on missing ASR configuration",
  );
} catch (e) {
  console.error(e.stack);
  await writeFile(
    dir + "/elder-failure.txt",
    await page.locator("body").innerText(),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
