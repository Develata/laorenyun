# Local-only tooling. Base is the exact plugin-build stage of the application Dockerfile.
FROM laorenyun-demo-tools-base AS build
COPY demo/seed/build.ts /build/plugin/scripts/course-demo.ts
WORKDIR /build/plugin
RUN node --input-type=module -e 'import {build} from "esbuild";await build({entryPoints:{"course-demo":"scripts/course-demo.ts","storage/worker":"src/storage/worker.ts"},outdir:"/demo",bundle:true,external:["@deepseek-ai/*"],platform:"node",format:"esm",target:"node24",banner:{js:"import {createRequire as __r} from \"node:module\"; const require=__r(import.meta.url);"}})'
FROM laorenyun:0.2.0
COPY --from=build /demo /opt/demo
ENTRYPOINT ["node","/opt/demo/course-demo.js"]
