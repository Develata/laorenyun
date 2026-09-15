import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { relative, join } from "node:path";
const filters = [
  "--filter",
  "@deepseek-ai/dsh...",
  "--filter",
  "@deepseek-ai/dsh-typert-generator...",
  "--filter",
  "@deepseek-ai/dsh-web-frontend...",
];
const packages = JSON.parse(
  execFileSync("pnpm", [...filters, "list", "--depth", "-1", "--json"], {
    encoding: "utf8",
    timeout: 120000,
  }),
);
const selected = packages
  .map((p) => relative(process.cwd(), p.path))
  .filter(
    (p) =>
      (p.startsWith("packages/") && !p.startsWith("packages/experimental/")) ||
      p.startsWith("vendor/") ||
      p === "apps/cli",
  );
writeFileSync("/build/dsh-build-selection.json", JSON.stringify(selected));
const targets = selected
  .map((p) =>
    existsSync(join(p, "tsconfig.host.json"))
      ? join(p, "tsconfig.host.json")
      : join(p, "tsconfig.json"),
  )
  .filter(
    (p) =>
      existsSync(p) &&
      !readFileSync(p, "utf8").includes("tsconfig.base.client"),
  );
execFileSync("node", ["node_modules/typescript/bin/tsc", "-b", ...targets], {
  stdio: "inherit",
  timeout: 180000,
});
