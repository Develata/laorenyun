// Preserve full license/notice texts from the selected build closure, including
// packages bundled into Web JS and no longer represented in runtime node_modules.
// This is intentionally a superset, not an assertion every package is shipped.
import {
  readdirSync,
  readFileSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
const root = "/build/upstream/deepseek-harness/node_modules/.pnpm";
const out = "/opt/build-licenses";
mkdirSync(out, { recursive: true });
const index = [];
function packageDir(dir, fallbackLicense) {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  } catch {
    return;
  }
  const key = `${pkg.name.replaceAll("/", "+")}@${pkg.version}`;
  const files = [];
  for (const e of readdirSync(dir, { withFileTypes: true }))
    if (
      e.isFile() &&
      /^(licen[cs]e|copying|notice|third.party.notices?)(\.|$)/i.test(e.name)
    ) {
      mkdirSync(join(out, key), { recursive: true });
      copyFileSync(join(dir, e.name), join(out, key, e.name));
      files.push(e.name);
    }
  if (!files.length && fallbackLicense && existsSync(fallbackLicense)) {
    mkdirSync(join(out, key), { recursive: true });
    copyFileSync(fallbackLicense, join(out, key, "LICENSE"));
    files.push("LICENSE");
  }
  index.push({
    name: pkg.name,
    version: pkg.version,
    license: pkg.license ?? null,
    texts: files,
  });
}
for (const e of readdirSync(root, { withFileTypes: true }))
  if (e.isDirectory() && e.name !== "node_modules") {
    const modules = join(root, e.name, "node_modules");
    let dirs;
    try {
      dirs = readdirSync(modules, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const d of dirs)
      if (d.isDirectory()) {
        if (d.name.startsWith("@"))
          for (const c of readdirSync(join(modules, d.name), {
            withFileTypes: true,
          }))
            if (c.isDirectory()) packageDir(join(modules, d.name, c.name));
        if (!d.name.startsWith("@")) packageDir(join(modules, d.name));
      }
  }
// Workspace packages are real emitted inputs too. Original DSH code inherits
// the repository LICENSE; vendored projects retain their own upstream LICENSE.
const workspace = "/build/upstream/deepseek-harness";
for (const dir of JSON.parse(readFileSync("/build/dsh-build-selection.json", "utf8")))
  packageDir(join(workspace, dir), dir.startsWith("vendor/") ? undefined : join(workspace, "LICENSE"));
writeFileSync(
  join(out, "build-closure.json"),
  JSON.stringify(index, null, 2) + "\n",
);
console.log("Build closure notices:", index.length);
