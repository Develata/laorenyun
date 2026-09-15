import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const pin = JSON.parse(await readFile("/build/PLUGIN.json", "utf8"));
if (
  pin.repository !== "https://github.com/Develata/dsh-laorenyun" ||
  !/^[0-9a-f]{40}$/.test(pin.commit)
)
  throw new Error("PLUGIN_PIN_INVALID");
const url = `https://codeload.github.com/Develata/dsh-laorenyun/tar.gz/${pin.commit}`;
let bytes;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`PLUGIN_DOWNLOAD_HTTP_${r.status}`);
    bytes = Buffer.from(await r.arrayBuffer());
    break;
  } catch (error) {
    if (attempt === 2) throw error;
  }
}
await writeFile("/build/plugin.tar.gz", bytes);
await mkdir("/build/plugin", { recursive: true });
execFileSync(
  "tar",
  [
    "-xzf",
    "/build/plugin.tar.gz",
    "-C",
    "/build/plugin",
    "--strip-components=1",
  ],
  { timeout: 10000 },
);
const pkg = JSON.parse(await readFile("/build/plugin/package.json", "utf8"));
if (pkg.version !== pin.version) throw new Error("PLUGIN_VERSION_MISMATCH");
