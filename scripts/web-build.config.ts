import { bundleInputs } from "./bundle-inputs.mjs";
import { fileURLToPath } from "node:url";
import upstream from "../upstream/deepseek-harness/apps/web/vite.config.ts";
// The published Web payload excludes the experimental in-browser Node preview.
const plugins = upstream.plugins?.filter(
  (p) =>
    !(
      p &&
      typeof p === "object" &&
      "name" in p &&
      p.name === "dsh-emit-preview-page"
    ),
);
export default {
  ...upstream,
  root: fileURLToPath(
    new URL("../upstream/deepseek-harness/apps/web/", import.meta.url),
  ),
  plugins: [
    ...(plugins ?? []),
    bundleInputs({
      root: "/build/upstream/deepseek-harness",
      inputRoot: fileURLToPath(new URL("../upstream/deepseek-harness/apps/web/", import.meta.url)),
      out: "/build/bundle-inputs",
    }),
  ],
  build: {
    ...upstream.build,
    rollupOptions: {
      ...upstream.build?.rollupOptions,
      input: {
        index: fileURLToPath(
          new URL(
            "../upstream/deepseek-harness/apps/web/index.html",
            import.meta.url,
          ),
        ),
      },
    },
  },
};
