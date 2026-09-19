# syntax=docker/dockerfile:1
FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553 AS dsh-build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@11.7.0
WORKDIR /build
COPY upstream/deepseek-harness/ upstream/deepseek-harness/
RUN --mount=type=cache,id=laorenyun-pnpm,target=/root/.local/share/pnpm/store cd upstream/deepseek-harness && pnpm --filter @deepseek-ai/dsh... --filter @deepseek-ai/dsh-typert-generator... --filter @deepseek-ai/dsh-web-frontend... install --frozen-lockfile --ignore-scripts
COPY packaging/ packaging/
COPY scripts/verify-packaging-lock.mjs scripts/verify-packaging-lock.mjs
COPY scripts/dsh-build.config.ts scripts/build-dsh.sh scripts/compile-dsh.mjs scripts/web-build.config.ts scripts/
RUN --mount=type=cache,id=laorenyun-pnpm,target=/root/.local/share/pnpm/store sh scripts/build-dsh.sh
FROM dsh-build AS licenses-build
COPY scripts/collect-licenses.mjs /build/scripts/collect-licenses.mjs
RUN node /build/scripts/collect-licenses.mjs
FROM dsh-build AS plugin-build
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=20 update && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=20 install -y --no-install-recommends ffmpeg=7:5.1.9-0+deb12u1 && rm -rf /var/lib/apt/lists/*
COPY PLUGIN.json /build/PLUGIN.json
COPY scripts/fetch-plugin.mjs /build/scripts/fetch-plugin.mjs
RUN node /build/scripts/fetch-plugin.mjs
WORKDIR /build/plugin
RUN --mount=type=cache,id=laorenyun-pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --ignore-scripts && pnpm check && pnpm pack --pack-destination /build/package
RUN mkdir -p /opt/dsh-laorenyun && tar -xzf /build/package/dsh-laorenyun-0.2.0-rc.1.tgz -C /opt/dsh-laorenyun --strip-components=1 && ln -s /app/data/dsh/profiles/node_modules /opt/dsh-laorenyun/node_modules
FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553 AS dsh-runtime
COPY --from=dsh-build /etc/ssl/certs/ /etc/ssl/certs/
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=20 update && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=20 install -y --no-install-recommends ffmpeg=7:5.1.9-0+deb12u1 ca-certificates && rm -rf /var/lib/apt/lists/*
RUN groupadd --gid 10001 laorenyun && useradd --uid 10001 --gid 10001 --no-create-home --home-dir /app/data laorenyun && mkdir -p /app/data && chown 10001:10001 /app/data && chmod 700 /app/data
COPY --from=dsh-build /opt/dsh/ /opt/dsh/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/util/time/package.json /opt/dsh/node_modules/@deepseek-ai/dsh-util-time/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/util/time/lib/ /opt/dsh/node_modules/@deepseek-ai/dsh-util-time/lib/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/util/output-retention/package.json /opt/dsh/node_modules/@deepseek-ai/dsh-output-retention/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/util/output-retention/lib/ /opt/dsh/node_modules/@deepseek-ai/dsh-output-retention/lib/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/subagent/subagent-in-process-driver/package.json /opt/dsh/node_modules/@deepseek-ai/dsh-subagent-in-process-driver/
COPY --from=dsh-build /build/upstream/deepseek-harness/packages/subagent/subagent-in-process-driver/lib/ /opt/dsh/node_modules/@deepseek-ai/dsh-subagent-in-process-driver/lib/
COPY scripts/link-runtime.mjs /opt/laorenyun/scripts/link-runtime.mjs
COPY scripts/runtime-smoke.mjs /opt/laorenyun/scripts/runtime-smoke.mjs
RUN node /opt/laorenyun/scripts/link-runtime.mjs && node /opt/laorenyun/scripts/runtime-smoke.mjs
COPY --from=plugin-build /opt/dsh-laorenyun/ /opt/dsh-laorenyun/
COPY upstream/deepseek-harness/LICENSE upstream/deepseek-harness/THIRD_PARTY_NOTICES.md /opt/laorenyun/licenses/deepseek-harness/
COPY upstream/deepseek-harness/native/system/LICENSE /opt/laorenyun/licenses/native-system/
COPY --from=licenses-build /opt/build-licenses/ /opt/laorenyun/licenses/build-closure/
COPY licenses/ /opt/laorenyun/licenses/
COPY profiles/ /opt/laorenyun/profiles/
COPY scripts/config.mjs scripts/entrypoint.mjs scripts/healthcheck.mjs /opt/laorenyun/scripts/
COPY UPSTREAM.json PLUGIN.json LICENSE THIRD_PARTY_NOTICES.md /opt/laorenyun/
ENV DSH_TELEMETRY_DISABLED=true LAORENYUN_BIND=0.0.0.0
WORKDIR /app/data
USER 10001:10001
EXPOSE 3080
ENTRYPOINT ["node", "/opt/laorenyun/scripts/entrypoint.mjs"]
