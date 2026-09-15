import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import upstream from "../upstream/deepseek-harness/tsdown.config.ts";
// Select the installed application closure; preserve upstream package build configs.
export default (options: unknown) => ({
  ...(upstream as Function)(options),
  cwd: fileURLToPath(new URL("../upstream/deepseek-harness/", import.meta.url)),
  workspace: JSON.parse(
    readFileSync("/build/dsh-build-selection.json", "utf8"),
  ),
});
