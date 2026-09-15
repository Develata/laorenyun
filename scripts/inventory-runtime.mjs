// Run with Node inside the built image; inventory metadata, never data/env.
import { readdirSync, readFileSync } from "node:fs";
const packages = new Map();
function walk(root) {
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (e.isSymbolicLink()) continue;
    const path = root + "/" + e.name;
    if (e.isDirectory()) walk(path);
    else if (e.name === "package.json") {
      const v = JSON.parse(readFileSync(path, "utf8"));
      if (v.name && v.version)
        packages.set(v.name + "@" + v.version, {
          name: v.name,
          version: v.version,
          license: v.license ?? null,
        });
    }
  }
}
walk("/opt/dsh/node_modules");
console.log(
  JSON.stringify(
    [...packages.values()].sort(
      (a, b) =>
        a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
    ),
    null,
    2,
  ),
);
