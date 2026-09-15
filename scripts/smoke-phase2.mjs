// Actual Chromium capture and native DSH UI; speech/model fixture mode is explicit.
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(
  new URL(
    "../upstream/deepseek-harness/apps/web/package.json",
    import.meta.url,
  ),
);
const { chromium } = require("playwright");
const dir = "/tmp/laorenyun-phase2-browser";
await mkdir(dir, { recursive: true, mode: 0o700 });
const base = "http://127.0.0.1:3082";
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
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
const issues = [];
page.on("pageerror", (e) => issues.push(e.message));
const calls = { tts: 0 };
let sessionId = "";
page.on("request", (r) => {
  if (r.url().endsWith("/laorenyun/tts")) calls.tts++;
  if (r.url().endsWith("/laorenyun/begin"))
    sessionId = r.postDataJSON().sessionId;
});
const api = (name, body) =>
  page.evaluate(
    async ({ name, body }) => {
      const r = await fetch("/api/laorenyun/" + name, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const v = await r.json();
      if (!v.ok) throw new Error(v.error);
      return v.value;
    },
    { name, body },
  );
async function until(fn) {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await page.waitForTimeout(200);
  }
  throw new Error("Condition timeout");
}
const editor = () =>
  page.locator('[data-composer-input="true"][contenteditable="true"]');
try {
  assert.equal((await fetch(base)).status, 401);
  const log = await readFile("/tmp/laorenyun-phase2-host-private.log", "utf8");
  const launch = log.match(/dsh web: (http\S+)/)?.[1];
  assert.ok(launch);
  const url = new URL(base);
  url.search = new URL(launch).search;
  await page.goto(url.href);
  await page.getByRole("button", { name: "人生长河", exact: true }).waitFor();
  const notice = page.getByRole("button", { name: /^(继续|Continue)$/ });
  await notice.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  if (await notice.isVisible()) await notice.click();
  await page
    .getByRole("button", { name: "开始讲我的故事", exact: true })
    .first()
    .click();
  await until(() => sessionId);
  await until(() => calls.tts > 0);
  await until(async () => !(await api("state", { sessionId })).processing);
  await page.getByRole("button", { name: "开始讲", exact: true }).waitFor();
  if (await page.getByRole("button", { name: "停止朗读" }).isVisible())
    await page.getByRole("button", { name: "停止朗读" }).click();
  const before = await api("evidence", { sessionId });
  assert.equal(before.transcripts.length, 0, "bootstrap is not human");
  // First deny microphone through a controlled browser API failure, then restore real fake-device stream.
  await page.evaluate(() => {
    window.__savedGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.getByRole("button", { name: "开始讲", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "无法使用麦克风" }).waitFor();
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = window.__savedGetUserMedia;
  });
  await until(async () => !(await api("state", { sessionId })).draft);
  await page.getByRole("button", { name: "开始讲", exact: true }).click();
  await page.getByRole("button", { name: "讲完了", exact: true }).waitFor();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "讲完了", exact: true }).click();
  await until(async () => {
    const s = await api("state", { sessionId });
    return s.draft?.recognition === "ready";
  });
  await until(async () => (await editor().textContent()).includes("合肥一中"));
  const draft = (await api("state", { sessionId })).draft;
  await page.reload();
  await page.getByRole("button", { name: "恢复识别文字" }).waitFor();
  const speechBefore = calls.tts;
  await page.waitForTimeout(1600);
  assert.equal(calls.tts, speechBefore, "history does not autoplay");
  await page.getByRole("button", { name: "恢复识别文字" }).click();
  await editor().evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const offset = n.textContent.indexOf("一中");
      if (offset >= 0) {
        const range = document.createRange();
        range.setStart(n, offset);
        range.setEnd(n, offset + 1);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }
    throw new Error("editable draft not found");
  });
  await page.keyboard.insertText("六");
  await until(async () =>
    (await api("state", { sessionId })).draft?.draft.includes("六中"),
  );
  await page.getByRole("button", { name: /^(发送消息|Send message)$/ }).click();
  const e = await until(async () => {
    const v = await api("evidence", { sessionId });
    return v.transcripts.length === 1 ? v : null;
  });
  assert.equal(e.transcripts[0].rawAsr, "我那个时候去了合肥一中");
  assert.equal(e.transcripts[0].text, "我那个时候去了合肥六中");
  assert.equal(e.transcripts[0].sourceId, draft.id);
  await until(() => calls.tts > speechBefore);
  await until(async () => !(await api("state", { sessionId })).processing);
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "人生长河", exact: true }).click();
  await page.getByRole("heading", { name: "人生长河" }).waitFor();
  await page.getByRole("button", { name: "回到采访" }).click();
  await page.screenshot({ path: dir + "/interview.png", fullPage: true });
  await context.storageState({ path: dir + "/browser-private.json" });
  await writeFile(
    dir + "/identity-private.json",
    JSON.stringify({ sessionId, sourceId: draft.id }),
  );
  const report = {
    capture: "Chromium fake device, real MediaRecorder WebM/Opus",
    normalization: "real FFmpeg",
    providers: "explicit developer fixtures",
    bootstrapHumanCount: 0,
    rawEditedAssociated: true,
    reloadNoAutoplay: true,
    ttsRequests: calls.tts,
    pageErrors: issues,
  };
  await writeFile(dir + "/evidence.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  await page.screenshot({ path: dir + "/failure.png", fullPage: true });
  await writeFile(
    dir + "/failure.txt",
    (await page.locator("body").innerText()).slice(0, 30000),
  );
  console.error(error.stack);
  process.exitCode = 1;
} finally {
  await browser.close();
}
