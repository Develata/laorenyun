// Pinned DSH's fallback traverses lexical manifest paths. Give the isolated
// pnpm deployment a flat discovery surface, without copying packages or
// changing Node's existing nearest-dependency resolution.
import { createRequire } from "node:module";
import {
  readFileSync,
  realpathSync,
  existsSync,
  mkdirSync,
  symlinkSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
const root = "/opt/dsh";
const queue = [join(root, "package.json")];
const seen = new Set();
let added = 0;
while (queue.length) {
  const anchor = realpathSync(queue.shift());
  if (seen.has(anchor)) continue;
  seen.add(anchor);
  const pkg = JSON.parse(readFileSync(anchor, "utf8"));
  const require = createRequire(anchor);
  for (const name of Object.keys({
    ...pkg.dependencies,
    ...pkg.peerDependencies,
  })) {
    const paths = require.resolve.paths(name) || [];
    const found = paths
      .map((p) => join(p, name))
      .find((p) => existsSync(join(p, "package.json")));
    if (!found) continue;
    const dir = realpathSync(found);
    queue.push(join(dir, "package.json"));
    const target = join(root, "node_modules", name);
    if (existsSync(target)) continue;
    if (!dir.startsWith(root + "/"))
      throw new Error("RUNTIME_DEPENDENCY_OUTSIDE_IMAGE: " + name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(relative(dirname(target), dir), target);
    added++;
  }
}
console.log(
  `Runtime discovery: ${seen.size} package manifests, ${added} additional links`,
);
