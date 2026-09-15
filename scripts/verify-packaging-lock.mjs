import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../upstream/deepseek-harness/package.json", import.meta.url),
);
const { load } = require("js-yaml");
const source = load(
  readFileSync(
    new URL("../upstream/deepseek-harness/pnpm-lock.yaml", import.meta.url),
    "utf8",
  ),
);
const derived = load(
  readFileSync(new URL("../packaging/pnpm-lock.yaml", import.meta.url), "utf8"),
);
const registry = (lock) =>
  Object.entries(lock.packages)
    .filter(([, v]) => v.resolution?.integrity)
    .map(([k, v]) => [k, v.resolution.integrity])
    .sort(([a], [b]) => a.localeCompare(b));
if (JSON.stringify(registry(source)) !== JSON.stringify(registry(derived)))
  throw new Error("Packaging lock changed registry versions/integrities");
console.log(
  `registry versions and integrities unchanged: ${registry(source).length}; workspace injection is the only resolution change`,
);
