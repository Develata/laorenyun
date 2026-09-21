# Third-party notices and distribution boundary

Original Laorenyun documentation/code: Copyright (c) 2026 Develata, MIT, see [LICENSE](LICENSE).

## Current distribution status

The current published product is **v0.2.0 (source release)**. Local Docker builds are supported; no public registry image has been published. Binary publication is fail-closed on actual-image corresponding-source delivery, including Debian FFmpeg and linked components, sharp/libvips and applicable native/Web dependencies. The current audit bundle is incomplete, so **GHCR publication remains disabled**.

The gate distinguishes actual distributed code from build-installation candidates. Independent permissive components require their notices, not corresponding source merely because they are Debian/native packages. Applicable GPL/LGPL/MPL source, modifications and build/relink obligations remain; permissive code incorporated in a copyleft combined library is not automatically excluded. Bundled-code attribution and exact native build materials remain unresolved. See [current release policy](docs/12-release.md#容器源码交付门禁).

[Release operations](docs/12-release.md) owns the live policy and workflow; [distribution audit](docs/evidence/distribution/README.md) records the latest measurements. `scripts/license-inventory.mjs` remains the artifact inventory owner. `licenses/container/sources.lock.json` records reviewed source/notice dispositions and exact source hashes, not another runtime package list. An SBOM or list of download URLs is not accompanying corresponding source.

## Historical release audits

The sections below retain evidence from their original phases. Version counts and source-only statements describe those observations; they do not substitute for a fresh image audit.

### Phase 1 actual image inventory

- [runtime-packages.json](licenses/runtime-packages.json): 514 unique DSH runtime npm package/version pairs, generated from the built linux/amd64 image; it excludes bundled Web modules and Debian base packages, which have separate notices below. No Claude Agent SDK, Codex binary, TypeScript compiler, esbuild or tsx occurs in the runtime package store.
- `/opt/laorenyun/licenses/build-closure/` preserves full license/notice files from the selected build closure, including React 18.3.1, React DOM and KaTeX bundled into Web JS. Its build-closure.json is intentionally a superset, not an assertion all listed build tools ship as runtime dependencies.
- DSH's LICENSE/THIRD_PARTY_NOTICES and native-system LICENSE are copied separately into the image; vendor license texts also remain in the unchanged source and installed package directories. Debian copyright files remain under `/usr/share/doc`; Node 24.21.0's complete LICENSE is [preserved](licenses/node/LICENSE), sha256 `5888dbb9a1d2b18f2c3e6c5f6af1b39de658372b402a0577b002777f14c62ace`.
- `@img/sharp-libvips-linux-x64@1.3.2` is present as a DSH image-processing dependency. Its binary is **LGPL-3.0-or-later**, not the Apache license of its packaging scripts. Its component versions, notices, LGPL/GPL texts and unmodified v1.3.2 build scripts are in [licenses/sharp-libvips](licenses/sharp-libvips). It contains additional libraries under LGPL/MPL/permissive terms. The shared library remains replaceable, and this distribution imposes no restriction on reverse engineering to debug modifications.
- Before publishing binary images, provide corresponding source/build materials for the LGPL/MPL components and Debian base as applicable alongside the image, using the exact version/source URLs in the preserved build scripts and upstream archives. Merely publishing this notice is not a completed source offer. Phase 1 published source repositories, not a binary image release.
- Original Phase1 had no speech dependencies; current image includes Tencent TTS and FFmpeg as detailed below. No added fonts/icons/model weights/dsh-talk/D3 source. Demo media is explicitly synthetic. Existing DSH Web assets retain upstream obligations.

Build-only new plugin tools: TypeScript 6.0.3 (Apache-2.0), esbuild 0.28.2 (MIT), Prettier 3.6.2 (MIT); pnpm 11.7.0 (MIT). They are frozen in package metadata/locks, not required on the user's host.

## Component obligations

| Component | Verified license / obligation |
|---|---|
| DeepSeek Harness, commit `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720` | MIT; Copyright (c) 2026 DeepSeek. Keep upstream LICENSE and THIRD_PARTY_NOTICES with the distinguishable source tree and image. Root MIT applies to our original files, not blanket relicensing. |
| DSH transitive payloads | Upstream notices include packages with non-MIT/custom terms, including `@anthropic-ai/claude-agent-sdk` marked SEE LICENSE IN README.md. Exclude unused provider/agent/platform packages from actual shipped closure, or separately satisfy their terms. A disabled plugin does not prove the binary/package is absent. |
| Node / SQLite | Preserve Node LICENSE and bundled notices; SQLite public domain does not erase Node's other third-party obligations. |
| Tencent official TTS SDK / common | Apache-2.0. Include license, copyright and any supplied NOTICE; indicate modifications if copied/changed. Cloud service terms are separate. |
| d3-shape / d3-path | ISC; include actual installed package copyright/permission notices. |
| FFmpeg | Default LGPL-2.1-or-later, subject to actual configuration and linked dependencies. Record exact source archive hash, configure flags, libraries and license; distribute required notices and corresponding source/build materials by a compliant method. No `--enable-nonfree`; GPL options require a separate explicit distribution review. Separate subprocess use does not waive binary distribution obligations. |
| Existing DSH UI icons/libraries | Preserve their actual upstream/transitive notices. No new Laorenyun fonts/images/audio/weights. |

## Referenced but not incorporated

`PerryLink/dsh-talk` is **Apache-2.0**, not MIT. No source has been copied. If adapted later, its copyright/license and applicable NOTICE remain, and modified files must identify changes; new MIT code may coexist without relicensing upstream code. `aeonfun/soul.md` is MIT, `OpenClaw` observed MIT; neither runtime or prompt files are incorporated. Tencent speech-go Apache-2.0 is a protocol reference only; speech-js snapshot without identified root license is not approved for copying.

See [dependency audit](docs/research/dependencies.md) for versions, sources, alternatives and costs, and [upstream evidence](docs/research/upstream.md). Before any release, generate the inventory from **actual artifacts**, retain full license texts and required source offers/materials, audit assets separately, and reconcile this index. The local image inventory above is actual evidence; publishing redistributable binary images still requires the stated corresponding-source work.

## Phase 2 新增

腾讯TTS分包及common：Apache-2.0；实际依赖完整许可由插件构建产物`lib/third-party/`随镜像保留。Flash原创协议代码不复制腾讯SDK源码。

音频转换采用Debian bookworm的FFmpeg发行包，其配置包含GPL组件，不声明整个FFmpeg为LGPL。镜像保留`/usr/share/doc/*/copyright`；实际固定FFmpeg 7:5.1.9-0+deb12u1，buildconf含--enable-gpl（没有--enable-nonfree）；OS包与配置清单见licenses/phase-2。此阶段只做本地Compose构建，不发布registry二进制。发布前须补齐FFmpeg、其链接库及此前libvips/Debian组件适用的对应源码/构建材料与交付方式。原创MIT不覆盖这些组件。

## Phase 3 增量

未新增运行框架或模型权重。内部模型、子会话、压缩均复用上述固定MIT许可DSH组件；SQLite仍为Node内建。没有引入图数据库、向量库或第三方语料；提交的中文测试均为人工合成案例。

## Phase 4

没有新增运行依赖、远程字体或图像资产。SVG固定路径与静态导出模板为本项目原创。调研过的d3-shape/d3-path未安装、未随镜像分发。DSH/Tencent/FFmpeg已有许可义务不变；未发布公共registry镜像。

## v0.1.0源码发行审计

最终实际闭包索引、缺失许可补充与FFmpeg来源信息见[release](licenses/release/README.md)。Docker Scout生成SPDX2.3作为本机镜像证据（不证明许可证合规）；公共镜像仍未发布。源代码发布与对应源码交付义务分开，未把未完成二进制义务称已完成。
