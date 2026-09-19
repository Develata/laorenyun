// Explicit real-cloud synthetic acceptance. Requires an isolated seeded RC2 archive.
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
if (process.env.LAORENYUN_RC2_ACCEPTANCE !== "true")
  throw Error("explicit acceptance only");
const root = process.env.LAORENYUN_SMOKE_OUT || "/tmp/laorenyun-rc2";
await mkdir(root, { recursive: true, mode: 0o700 });
const log = await readFile(
  process.env.LAORENYUN_PRIVATE_LOG || root + "/launch-private.log",
  "utf8",
);
const url = new URL(
  process.env.LAORENYUN_SMOKE_ORIGIN || "http://127.0.0.1:3094",
);
url.search = new URL([...log.matchAll(/dsh web: (http\S+)/g)].at(-1)[1]).search;
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath(),
});
const c = await browser.newContext({
  locale: "zh-CN",
  viewport: { width: 1440, height: 1000 },
});
const p = await c.newPage();
p.setDefaultTimeout(20000);
const call = (method, body = {}) =>
  p.evaluate(
    async ({ method, body }) => {
      const r = await (
        await fetch("/api/laorenyun/" + method, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).json();
      if (!r.ok) throw Error(r.error);
      return r.value;
    },
    { method, body },
  );
try {
  await p.goto(url.href);
  await p.getByRole("button", { name: "人生长河", exact: true }).waitFor();
  const welcome = p.getByRole("button", { name: "继续", exact: true });
  for (let i = 0; i < 25; i++) {
    if (await welcome.isVisible()) {
      await welcome.click();
      await welcome.waitFor({ state: "hidden" });
      break;
    }
    await p.waitForTimeout(200);
  }
  const expand = p.getByRole("button", {
    name: "人物档案与采访记录",
    exact: true,
  });
  if (await expand.isVisible()) await expand.click();
  await p.getByRole("button", { name: "＋ 新一次采访", exact: true }).click();
  await p.getByRole("button", { name: "我的自传", exact: true }).click();
  await p.getByRole("button", { name: "生成我的自传", exact: true }).waitFor();
  const results = [];
  for (let run = 1; run <= 3; run++) {
    await p
      .getByRole("checkbox", { name: "用于下一次自传" })
      .setChecked(run !== 1);
    const oldIds = (await call("derived-list")).map((g) => g.id);
    const start = Date.now();
    await p.getByRole("button", { name: "生成我的自传", exact: true }).click();
    let g;
    let lastProgress = "";
    while (Date.now() - start < 320000) {
      g = (await call("derived-list")).find(
        (g) => g.kind === "biography" && !oldIds.includes(g.id),
      );
      if (g && g.progress !== lastProgress) {
        console.log(JSON.stringify({ run, progress: g.progress }));
        lastProgress = g.progress;
      }
      if (g && ["published", "failed", "cancelled"].includes(g.state)) break;
      await p.waitForTimeout(1500);
    }
    assert.ok(g, "generation started");
    const view = await call("derived-view", { id: g.id });
    await writeFile(
      `${root}/run-${run}.json`,
      JSON.stringify({ g, view, latencyMs: Date.now() - start }, null, 2),
      { mode: 0o600 },
    );
    const book = view.result;
    const metric = {
      run,
      id: g.id,
      state: g.state,
      latencyMs: Date.now() - start,
      chapters: book?.chapters.length,
      paragraphs: book?.sections.reduce((n, s) => n + s.paragraphs.length, 0),
      facts: book?.facts.length,
      used: book
        ? [
            ...new Set(
              book.sections.flatMap((s) =>
                s.paragraphs.flatMap((p) => p.factRefs),
              ),
            ),
          ].sort()
        : [],
      omissions: book?.omissions,
    };
    results.push(metric);
    await writeFile(root + "/results.json", JSON.stringify(results, null, 2));
    console.log(JSON.stringify(metric));
    assert.equal(
      g.state,
      "published",
      "required 3/3 gate; inspect failed record before any rerun",
    );
    await p.screenshot({ path: `${root}/book-${run}.png`, fullPage: true });
  }
  await p.getByRole("button", { name: "导出", exact: true }).click();
  await p
    .getByRole("link", { name: "离线阅读网页（HTML）", exact: true })
    .waitFor({ timeout: 30000 });
  for (const [label, file] of [
    ["文字自传（Markdown）", "autobiography.md"],
    ["离线阅读网页（HTML）", "index.html"],
    ["记忆档案（JSON）", "memories.json"],
  ]) {
    const href = await p
      .getByRole("link", { name: label, exact: true })
      .getAttribute("href");
    const r = await c.request.get(new URL(href, p.url()).href);
    assert.ok(r.ok());
    await writeFile(root + "/" + file, await r.body(), { mode: 0o600 });
  }
  await p.reload();
  await p.getByRole("button", { name: "我的自传", exact: true }).click();
  await p.getByRole("navigation", { name: "自传目录" }).waitFor();
  console.log("three generations, export and reload passed");
} catch (e) {
  await writeFile(
    root + "/browser-dom-private.txt",
    await p.locator("body").innerText(),
  );
  await writeFile(root + "/browser-error-private.txt", String(e), {
    mode: 0o600,
  });
  console.error("RC2 browser gate failed; inspect private error");
  process.exitCode = 1;
} finally {
  await browser.close();
}
