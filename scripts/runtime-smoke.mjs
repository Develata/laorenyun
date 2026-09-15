import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdirSync, realpathSync, readFileSync } from "node:fs";
const require = createRequire("/opt/dsh/package.json");
for (const name of [
  "@deepseek-ai/dsh-agent-loop",
  "@deepseek-ai/dsh-host-webserver",
  "@deepseek-ai/dsh-api-session-controller",
  "@deepseek-ai/dsh-subagent-spawn-in-process",
  "@deepseek-ai/dsh-subagent-fork-in-process",
])
  await import(require.resolve(name));
const pkgs = readdirSync("/opt/dsh/node_modules/.pnpm");
assert.ok(
  !pkgs.some((n) =>
    /^(typescript@|esbuild@|tsx@|@anthropic-ai\+claude-agent-sdk@|@openai\+codex@)/.test(
      n,
    ),
  ),
  "unneeded compiler or third-party agent shipped",
);
function links(root) {
  for (const e of readdirSync(root, { withFileTypes: true })) {
    const path = root + "/" + e.name;
    if (e.isSymbolicLink())
      assert.ok(
        realpathSync(path).startsWith("/opt/dsh/"),
        "external or dangling runtime link",
      );
    else if (e.isDirectory()) links(path);
  }
}
links("/opt/dsh/node_modules");
console.log("Runtime imports, isolated links and excluded tools: PASS");
