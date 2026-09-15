# Third-party notices and distribution boundary

Original Laorenyun documentation/code: Copyright (c) 2026 Develata, MIT, see [LICENSE](LICENSE).

**Phase 0 status:** this repository contains original documentation and license text only; it does not yet vendor DeepSeek Harness, copy dsh-talk/persona code, ship a Docker image, install runtime dependencies, or distribute fonts, model weights, images or speech samples. Research references are not a license grant for future copying. This file is the distribution policy and audit index, not a completed notice inventory for a future image.

## Required treatment when packaging

| Component | Verified license / obligation |
|---|---|
| DeepSeek Harness, commit `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720` | MIT; Copyright (c) 2026 DeepSeek. Keep upstream LICENSE and THIRD_PARTY_NOTICES with the distinguishable source tree and image. Root MIT applies to our original files, not blanket relicensing. |
| DSH transitive payloads | Upstream notices include packages with non-MIT/custom terms, including `@anthropic-ai/claude-agent-sdk` marked SEE LICENSE IN README.md. Exclude unused provider/agent/platform packages from actual shipped closure, or separately satisfy their terms. A disabled plugin does not prove the binary/package is absent. |
| Node / SQLite | Preserve Node LICENSE and bundled notices; SQLite public domain does not erase Node's other third-party obligations. |
| Tencent official TTS SDK / common | Apache-2.0. Include license, copyright and any supplied NOTICE; indicate modifications if copied/changed. Cloud service terms are separate. |
| d3-shape / d3-path | ISC; include actual installed package copyright/permission notices. |
| FFmpeg | Default LGPL-2.1-or-later, subject to actual configuration and linked dependencies. Record exact source archive hash, configure flags, libraries and license; distribute required notices and corresponding source/build materials by a compliant method. No `--enable-nonfree`; GPL options require a separate explicit distribution review. Separate subprocess use does not waive binary distribution obligations. |
| Existing DSH UI icons/libraries | Preserve their actual upstream/transitive notices. No new bundled fonts/images/audio/weights in Phase 0. |

## Referenced but not incorporated

`PerryLink/dsh-talk` is **Apache-2.0**, not MIT. No source has been copied. If adapted later, its copyright/license and applicable NOTICE remain, and modified files must identify changes; new MIT code may coexist without relicensing upstream code. `aeonfun/soul.md` is MIT, `OpenClaw` observed MIT; neither runtime or prompt files are incorporated. Tencent speech-go Apache-2.0 is a protocol reference only; speech-js snapshot without identified root license is not approved for copying.

See [dependency audit](docs/research/dependencies.md) for versions, sources, alternatives and costs, and [upstream evidence](docs/research/upstream.md). Before any release, generate the inventory from **actual artifacts**, retain full license texts and required source offers/materials, audit assets separately, and reconcile this index. This is an engineering license audit, not a claim that an unbuilt image already complies.
