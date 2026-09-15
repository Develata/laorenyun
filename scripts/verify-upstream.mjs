import { readFile, readlink, lstat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("UPSTREAM.files.json", root), "utf8"),
);
const failures = [];
for (const [mode, expected, path] of manifest) {
  const file = new URL("upstream/deepseek-harness/" + path, root);
  try {
    const stat = await lstat(file);
    const bytes =
      mode === "120000"
        ? Buffer.from(await readlink(file))
        : await readFile(file);
    const hash = createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex");
    if (hash !== expected || (mode === "100755" && (stat.mode & 0o111) === 0))
      failures.push(path);
  } catch {
    failures.push(path);
  }
}
if (failures.length)
  throw new Error("Upstream snapshot differs: " + failures.join(", "));
console.log(
  `verified ${manifest.length} original upstream blobs; zero source patches`,
);
