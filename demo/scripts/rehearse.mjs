import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const dir = resolve(import.meta.dirname, ".."),
  root = resolve(dir, ".."),
  envfile = resolve(dir, ".env");
const original = readFileSync(envfile),
  results = [];
const run = (args) =>
  execFileSync(process.execPath, args, {
    cwd: root,
    timeout: 240000,
    stdio: ["ignore", "pipe", "pipe"],
  });
let previousProse;
try {
  for (let i = 1; i <= 3; i++) {
    if (i === 3) {
      let env = original.toString();
      for (const [k, v] of Object.entries({
        LAORENYUN_LLM_MODEL: "gpt-5.6-luna",
        LAORENYUN_LLM_BASE_URL: "http://127.0.0.1:1/v1",
        LAORENYUN_LLM_API_KEY: "synthetic-unavailable",
      }))
        env = env.replace(new RegExp("^" + k + "=.*$", "m"), k + "=" + v);
      writeFileSync(envfile, env, { mode: 0o600 });
    }
    const start = performance.now();
    run(["demo/demo.mjs", "reset"]);
    const seconds = (performance.now() - start) / 1000;
    run(["demo/scripts/browser.mjs"]);
    run(["demo/scripts/export.mjs"]);
    const prose = readFileSync(
      resolve(dir, "output/export/autobiography.md"),
      "utf8",
    )
      .split("\n")
      .filter((l) => l && !/^(生成时间|来源|\[\^|<!--)/.test(l))
      .join("\n");
    if (previousProse !== undefined)
      assert.equal(prose, previousProse, "fixture prose must be reproducible");
    previousProse = prose;
    run(["demo/demo.mjs", "restart"]);
    run(["demo/demo.mjs", "stop"]);
    run(["demo/demo.mjs", "start"]);
    run(["demo/demo.mjs", "status"]);
    results.push({
      run: i,
      reset: true,
      startupSeconds: Number(seconds.toFixed(2)),
      ...JSON.parse(readFileSync(resolve(dir, "output/browser.json"))),
      stableProse: true,
      export: true,
      restart: true,
      stopStart: true,
      providerUnavailable: i === 3,
    });
    mkdirSync(resolve(dir, "assets"), { recursive: true });
    writeFileSync(
      resolve(dir, "assets/rehearsals.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
    console.log("Rehearsal " + i + " passed");
  }
} finally {
  writeFileSync(envfile, original, { mode: 0o600 });
  if (results.length === 3) run(["demo/demo.mjs", "start"]);
}
