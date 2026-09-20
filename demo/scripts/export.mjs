import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const dir = resolve(import.meta.dirname, ".."),
  receipt = JSON.parse(readFileSync(resolve(dir, ".private/receipt.json")));
assert.match(receipt.archive, /^[a-zA-Z0-9-]+$/);
assert.equal(receipt.volume, "laorenyun-demo-data");
const run = (a) =>
  execFileSync("docker", a, {
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
mkdirSync(resolve(dir, "output/export"), { recursive: true });
const docs = {};
for (const name of ["autobiography.md", "index.html", "memories.json"]) {
  const text = run([
    "exec",
    c,
    "cat",
    `/app/data/archives/${receipt.archive}/${name}`,
  ]);
  assert.ok(!/\/home\/|\/app\/data|sk-[a-zA-Z0-9]{20}/.test(text));
  docs[name] = text;
  writeFileSync(resolve(dir, "output/export", name), text + "\n");
}
assert.ok(docs["autobiography.md"].includes("1983"));
assert.ok(!docs["autobiography.md"].includes("1982"));
assert.ok(docs["memories.json"].includes("1982"));
assert.ok(docs["memories.json"].includes("1983"));
assert.ok(!/<script|https?:\/\//i.test(docs["index.html"]));
const ids = new Set(
  [...docs["index.html"].matchAll(/id="([^"]+)"/g)].map((x) => x[1]),
);
for (const m of docs["index.html"].matchAll(/href="#([^"]+)"/g))
  assert.ok(ids.has(m[1]));
const archive = JSON.parse(docs["memories.json"]);
assert.equal(archive.memoryNodes.length, 17);
assert.equal(archive.sources.length, 18);
assert.equal(archive.media.length, 0);
assert.ok(archive.conflicts.some((c) => c.status === "open"));
assert.ok(archive.conflicts.some((c) => c.status === "resolved"));
for (const kind of ["ELABORATES", "CAUSES", "RELATES_TO"])
  assert.ok(archive.edges.some((e) => e.kind === kind));
assert.ok(archive.branchMemos.length);
console.log(
  "Active support, historical correction, offline links and portable export passed",
);
