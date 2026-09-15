// Real browser + native DSH UI. Run before and after an actual Compose restart.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
const require = createRequire(
  new URL(
    "../upstream/deepseek-harness/apps/web/package.json",
    import.meta.url,
  ),
);
const { chromium } = require("playwright");
const stage = process.argv[2] || "initial";
const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3081";
const dir = process.env.SMOKE_STATE_DIR || "/tmp/laorenyun-compose-smoke";
await mkdir(dir, { recursive: true, mode: 0o700 });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SMOKE_CHROMIUM
    ? { executablePath: process.env.SMOKE_CHROMIUM }
    : {}),
});
const context = await browser.newContext(
  stage !== "initial"
    ? { storageState: join(dir, "browser-private.json") }
    : { locale: "zh-CN" },
);
const page = await context.newPage();
page.setDefaultTimeout(15000);
const report = { stage };
const api = (method, body) =>
  page.evaluate(
    async ({ method, body }) => {
      const r = await fetch("/api/laorenyun/" + method, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      });
      const v = await r.json();
      if (!r.ok || !v.ok) throw new Error("Probe API failed: " + method);
      return v.value;
    },
    { method, body },
  );
async function evidence(sessionId, count) {
  const end = Date.now() + 15000;
  do {
    const v = await api("evidence", { sessionId });
    if (v.transcripts.length === count) return v;
    await page.waitForTimeout(100);
  } while (Date.now() < end);
  throw new Error("Durable transcript count timed out");
}
const editor = () =>
  page.locator('[data-composer-input="true"][contenteditable="true"]');
const submit = () =>
  page.getByRole("button", { name: /^(发送消息|Send message)$/ }).click();
async function answer(sessionId, n) {
  await editor().fill("支线验证回答 " + n);
  await submit();
  return evidence(sessionId, n);
}
try {
  if (stage === "initial") {
    assert.equal(
      (await fetch(base, { signal: AbortSignal.timeout(3000) })).status,
      401,
    );
    const log = await readFile(process.env.SMOKE_HOST_LOG, "utf8");
    const launch = log.match(/dsh web: (http\S+)/)?.[1];
    assert.ok(launch, "native launch URL required");
    const url = new URL(base);
    url.search = new URL(launch).search;
    await page.goto(url.href);
    await page.getByRole("button", { name: "人生长河", exact: true }).waitFor();
    const notice = page.getByRole("button", { name: /^(继续|Continue)$/ });
    if (await notice.isVisible()) await notice.click();
    report.theme = await page.evaluate(() =>
      getComputedStyle(document.body)
        .getPropertyValue("--dsw-alias-bg-base")
        .trim(),
    );
    assert.equal(report.theme, "#faf7f0");
    await page.getByRole("button", { name: "人生长河", exact: true }).click();
    await page.getByRole("heading", { name: "人生长河" }).waitFor();
    await page.getByRole("button", { name: "回到采访" }).click();
    await page
      .getByRole("button", { name: /^(选择工作区|Choose workspace)$/ })
      .click();
    const addWorkspace = page.getByText(/^(添加工作区…|Add workspace…)$/);
    if (await addWorkspace.isVisible()) await addWorkspace.click();
    await page.getByRole("button", { name: /^(编辑路径|Edit path)$/ }).click();
    const path = page.getByRole("textbox", { name: /^(编辑路径|Edit path)$/ });
    await path.fill("/app/data");
    await path.press("Enter");
    await page.getByRole("button", { name: /^(打开|Open)$/ }).click();
    const response = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/laorenyun/fake") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "模拟语音输入" }).click();
    const source = (await (await response).json()).value;
    assert.ok((await editor().innerText()).includes("合肥一中"));
    await page.reload();
    await page.getByRole("button", { name: "恢复草稿" }).waitFor();
    assert.equal(
      (
        await api("source", {
          sessionId: source.sessionId,
          sourceId: source.id,
        })
      ).status,
      "draft",
    );
    await page.getByRole("button", { name: "恢复草稿" }).click();
    await page.waitForFunction(() =>
      document
        .querySelector('[data-composer-input="true"][contenteditable="true"]')
        ?.textContent.includes("合肥一中"),
    );
    await editor().evaluate((el) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const i = n.textContent.indexOf("合肥一中");
        if (i < 0) continue;
        const r = document.createRange();
        r.setStart(n, i + 2);
        r.setEnd(n, i + 3);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(r);
        return;
      }
      throw new Error("Draft text node not found");
    });
    await page.keyboard.insertText("六");
    assert.ok((await editor().innerText()).includes("合肥六中"));
    await submit();
    const accepted = await evidence(source.sessionId, 1);
    const transcript = accepted.transcripts[0];
    assert.equal(transcript.sourceId, source.id);
    assert.equal(transcript.rawAsr, "我那个时候去了合肥一中");
    assert.equal(transcript.text, "我那个时候去了合肥六中");
    assert.ok(transcript.messageId && transcript.requestId);
    assert.equal(transcript.correction, true);
    const branchResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/laorenyun/branch") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "创建验证支线" }).click();
    const branch = (await (await branchResponse).json()).value;
    await editor().waitFor();
    await answer(branch.sessionId, 1);
    await answer(branch.sessionId, 2);
    await writeFile(
      join(dir, "identities.json"),
      JSON.stringify({ source, branch }),
      { mode: 0o600 },
    );
    await context.storageState({ path: join(dir, "browser-private.json") });
    report.gateA = {
      raw: transcript.rawAsr,
      edited: transcript.text,
      explicitAssociation: true,
      refreshRecovery: true,
    };
    report.branchAnswers = 2;
  } else if (stage === "recover") {
    const { source, branch } = JSON.parse(
      await readFile(join(dir, "identities.json"), "utf8"),
    );
    await page.goto(base);
    await page.getByRole("button", { name: "人生长河", exact: true }).waitFor();
    assert.equal(
      (await api("evidence", { sessionId: branch.sessionId })).branch
        .answerCount,
      2,
    );
    await page
      .getByRole("treeitem")
      .filter({ hasText: source.id.slice(0, 8) })
      .click();
    const response = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/laorenyun/branch") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "创建验证支线" }).click();
    const recovered = (await (await response).json()).value;
    assert.equal(recovered.sessionId, branch.sessionId);
    await editor().waitFor();
    await answer(branch.sessionId, 3);
    await answer(branch.sessionId, 4);
    const final = await answer(branch.sessionId, 5);
    assert.equal(final.branch.state, "closed");
    assert.equal(final.branch.memo.source_turns.length, 5);
    await page
      .getByText("这段支线已保存五次回答，请回到主线。", { exact: false })
      .first()
      .waitFor();
    assert.equal(
      (
        await api("source", {
          sessionId: source.sessionId,
          sourceId: source.id,
        })
      ).status,
      "submitted",
    );
    report.gateB = {
      coldRecovery: true,
      sameChild: true,
      answerCount: 5,
      closed: true,
      memoSources: 5,
    };
  } else if (stage === "elder") {
    const { source } = JSON.parse(
      await readFile(join(dir, "identities.json"), "utf8"),
    );
    await page.goto(base);
    await page.getByRole("button", { name: "人生长河", exact: true }).waitFor();
    await page
      .getByRole("treeitem")
      .filter({ hasText: source.id.slice(0, 8) })
      .click();
    assert.equal(
      (await api("state", { sessionId: source.sessionId })).probes,
      false,
    );
    await page.waitForTimeout(300);
    assert.equal(
      await page.getByRole("button", { name: "模拟语音输入" }).count(),
      0,
    );
    assert.equal(
      await page.getByRole("button", { name: "创建验证支线" }).count(),
      0,
    );
    assert.equal(await page.getByText("轨迹", { exact: true }).count(), 0);
    assert.equal(
      await page.getByText("系统提示词", { exact: true }).count(),
      0,
    );
    assert.equal(await page.getByText(/^[0-9]+ 轮 [0-9]+ 步$/).count(), 0);
    await page.getByRole("button", { name: "人生长河", exact: true }).click();
    await page.getByRole("heading", { name: "人生长河" }).waitFor();
    await page.getByRole("button", { name: "回到采访" }).click();
    const status = await page.evaluate(
      async () =>
        (
          await fetch("/api/laorenyun/fake", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          })
        ).status,
    );
    assert.equal(status, 404);
    assert.equal(
      (
        await fetch(base + "/api/laorenyun/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          signal: AbortSignal.timeout(3000),
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await context.request.post(base + "/api/laorenyun/state", {
          data: {},
          headers: { Origin: "https://untrusted.example" },
          timeout: 5000,
        })
      ).status(),
      403,
    );
    report.profile = {
      elder: true,
      probesAbsent: true,
      trajectoryAbsent: true,
      river: true,
    };
  } else throw new Error("stage must be initial, recover or elder");
  await page.screenshot({ path: join(dir, stage + ".png"), fullPage: true });
  await writeFile(
    join(dir, stage + "-evidence.json"),
    JSON.stringify(report, null, 2) + "\n",
    { mode: 0o600 },
  );
  console.log(JSON.stringify(report));
} catch (e) {
  await writeFile(
    join(dir, "failure-private.txt"),
    await page.locator("body").innerText(),
    { mode: 0o600 },
  );
  await page.screenshot({ path: join(dir, "failure-private.png") });
  console.error(String(e).replace(/token=[^\s"'&]+/g, "token=[REDACTED]"));
  process.exitCode = 1;
} finally {
  await browser.close();
}
