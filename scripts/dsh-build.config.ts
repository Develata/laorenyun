import { bundleInputs } from "./bundle-inputs.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import upstream from "../upstream/deepseek-harness/tsdown.config.ts";
// Select the installed application closure; preserve upstream package build configs.
export default (options: unknown) => {
  const config = (upstream as Function)(options);
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      bundleInputs({
        root: "/build/upstream/deepseek-harness",
        out: "/build/bundle-inputs",
      }),
    ],
    cwd: fileURLToPath(new URL("../upstream/deepseek-harness/", import.meta.url)),
    workspace: JSON.parse(
      readFileSync("/build/dsh-build-selection.json", "utf8"),
    ),
  };
};
