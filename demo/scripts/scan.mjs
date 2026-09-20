import { readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const base = resolve(import.meta.dirname, "..");
let files = 0;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if ([".env", ".private", "output"].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(p);
      continue;
    }
    const s = await readFile(p, "utf8");
    files++;
    const bad = [
      /sk-[A-Za-z0-9_-]{20,}/,
      /AKID[A-Za-z0-9]{20,}/,
      /https?:\/\/[^\s]+[?&](?:token|secret|access_token)=[^\s]+/i,
      /\/home\/[^\s]+/,
      /-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/,
    ];
    if (bad.some((r) => r.test(s)))
      throw Error("Public package scan failed: " + e.name);
  }
}
await walk(base);
console.log(
  JSON.stringify({
    files,
    credentialPatterns: false,
    absolutePrivatePaths: false,
    contentReview:
      "synthetic fixture only; pattern scan does not prove identity",
  }),
);
