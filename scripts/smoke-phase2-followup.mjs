// Continue the explicit fixture session, including native typed input and autoplay rejection.
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
const { sessionId } = JSON.parse(
  await readFile(dir + "/identity-private.json", "utf8"),
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath(),
});
const context = await browser.newContext({
  storageState: dir + "/browser-private.json",
  viewport: { width: 1280, height: 1000 },
  locale: "zh-CN",
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
let calls = 0;
page.on("request", (r) => {
  if (r.url().endsWith("/laorenyun/tts")) calls++;
});
async function api(name, body) {
  return page.evaluate(
    async ({ name, body }) => {
      const r = await fetch("/api/laorenyun/" + name, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const v = await r.json();
      if (!v.ok) throw new Error(v.error);
      return v.value;
    },
    { name, body },
  );
}
async function until(fn) {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    if (await fn()) return;
    await page.waitForTimeout(200);
  }
  throw new Error("Condition timeout");
}
try {
  await page.goto("http://127.0.0.1:3082");
  await page.getByRole("button", { name: "开始讲", exact: true }).waitFor();
  await page.waitForTimeout(1500);
  assert.equal(calls, 0, "cold history has no autoplay");
  const original = await api("evidence", { sessionId });
  assert.ok(original.transcripts.length >= 1);
  const originStatus = await page.evaluate(async () => {
    const r = await fetch("/api/laorenyun/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return r.status;
  });
  assert.equal(originStatus, 200);
  await page.getByRole("combobox", { name: "讲述者" }).selectOption("child");
  await page.evaluate(() => {
    window.__play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = () =>
      Promise.reject(
        new DOMException("controlled autoplay refusal", "NotAllowedError"),
      );
  });
  await page
    .locator('[data-composer-input="true"][contenteditable="true"]')
    .fill("这是第二轮纯文字测试。");
  await page.getByRole("button", { name: /^(发送消息|Send message)$/ }).click();
  await page.getByRole("button", { name: "播放问题", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "开始讲", exact: true })
      .isDisabled(),
    true,
    "recording blocked until playback stopped",
  );
  const evidence = await api("evidence", { sessionId });
  assert.equal(evidence.transcripts.length, original.transcripts.length + 1);
  const typed = evidence.transcripts.find(
    (t) => t.text === "这是第二轮纯文字测试。",
  );
  assert.ok(typed);
  assert.equal(typed.rawAsr, "");
  assert.equal(typed.speaker.role, "child");
  await page.evaluate(() => {
    HTMLMediaElement.prototype.play = window.__play;
  });
  await page.getByRole("button", { name: "播放问题", exact: true }).click();
  await until(
    async () =>
      !(await page
        .getByRole("button", { name: "开始讲", exact: true })
        .isDisabled()),
  );
  const count = calls;
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  await until(() => calls > count);
  await page.getByRole("button", { name: "停止朗读" }).click();
  await writeFile(
    dir + "/followup-evidence.json",
    JSON.stringify(
      {
        typedSecondTurn: true,
        explicitChildSpeaker: true,
        autoplayFallback: true,
        repeat: true,
        historyNotAutoplay: true,
        transcriptCount: evidence.transcripts.length,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS typed second turn, explicit speaker, autoplay fallback, repeat and history recovery",
  );
} catch (e) {
  console.error(e.stack);
  await writeFile(
    dir + "/followup-failure.txt",
    await page.locator("body").innerText(),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
