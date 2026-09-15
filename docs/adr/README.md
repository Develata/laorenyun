# 架构决策索引

Owner：本目录固定跨阶段决定；产品行为见各专题，接口形状见插件contracts。状态“接受”指设计，不代表已运行通过。改变决定须有具体矛盾/证据，更新相关owner和验收；不因新框架流行重开选型。

- [ADR-0001 固定 DeepSeek Harness 基础](0001-deepseek-harness-foundation.md)
- [ADR-0002 TypeScript MVP 与运行依赖](0002-typescript-first.md)
- [ADR-0003 发行与领域插件分仓](0003-two-repository-architecture.md)
- [ADR-0004 独立 SQLite 领域库](0004-sqlite-domain-storage.md)
- [ADR-0005 时序属性图而非人生树](0005-memory-graph-not-tree.md)
- [ADR-0006 腾讯极速文件识别与基础 TTS](0006-tencent-cloud-speech.md)
- [ADR-0007 识别只产生草稿](0007-speech-to-draft.md)
- [ADR-0008 隔离主采访与五答支线](0008-main-and-branch-agent.md)
- [ADR-0009 证据优先与不可变修订](0009-provenance-first-storage.md)
- [ADR-0010 显式、可溯源的文风蒸馏](0010-persona-distillation.md)
- [ADR-0011 单镜像 Compose 发行](0011-docker-compose-deployment.md)
- [ADR-0012 保留浏览器原件并集中转换音频](0012-audio-normalization.md)
- [ADR-0013 公开接入面的验证门槛](0013-dsh-integration-seams.md)

- [ADR-0014 实际原生关联与冻结打包](0014-phase-1-native-binding-and-packaging.md)

ADR-0013 的 G1–G3 实施证据见 [Phase 1](../phase-1.md)。详细证据见[research](../research/upstream.md)，不在每份ADR复制源码矩阵。
