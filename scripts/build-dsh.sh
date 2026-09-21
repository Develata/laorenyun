#!/bin/sh
set -eu
cd /build/upstream/deepseek-harness
node /build/scripts/compile-dsh.mjs
pnpm exec tsdown --config /build/scripts/dsh-build.config.ts --env.DSH_BUILD_FACE host
pnpm exec tsc -b packages/client/*/tsconfig.json packages/extensions/cordis-client-runner/tsconfig.json packages/extensions/ui-cordis/tsconfig.json packages/session-query/session-log-export/tsconfig.client.json
pnpm exec tsdown --config /build/scripts/dsh-build.config.ts --env.DSH_BUILD_FACE client
pnpm --filter @deepseek-ai/dsh-web-frontend exec vite build --config /build/scripts/web-build.config.ts
pnpm run build:native-system
node /build/scripts/verify-packaging-lock.mjs
cp /build/packaging/pnpm-lock.yaml ./pnpm-lock.yaml
cp /build/packaging/pnpm-workspace.yaml ./pnpm-workspace.yaml
pnpm --store-dir=/root/.local/share/pnpm/store --config.injectWorkspacePackages=true --filter @deepseek-ai/dsh deploy --prod --offline --frozen-lockfile --ignore-scripts /opt/dsh

node /build/scripts/collect-bundle-inputs.mjs /build/bundle-inputs /opt/dsh /build/bundle-inputs.json
