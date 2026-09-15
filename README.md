# 老人云 · Laorenyun

让讲述留下来，让人生慢慢成书。

面向约 60–80 岁使用者的 AI 口述史与持续生长的第一人称自传系统。自然讲述 → 保留原始录音 → 可修改的识别草稿 → 时间记忆图 → 可溯源自传。文字输入始终可用。

**当前状态：Phase 0 架构与文档阶段；没有可运行产品、镜像或语音功能。** 本仓库是完整应用与 DeepSeek Harness 发行层；[dsh-laorenyun](https://github.com/Develata/dsh-laorenyun) 拥有业务插件。原创内容采用 [MIT](LICENSE)，第三方内容分别遵守[各自许可](THIRD_PARTY_NOTICES.md)。

## 文档入口 / Context Control Plane

先读 [产品](docs/00-product-brief.md)、[范围与验收](docs/01-scope-and-acceptance.md)、[架构及不变量](docs/02-architecture.md)。然后按任务加载一条路径，无需每轮读取全库：

| 工作 | 权威入口 |
|---|---|
| 采访、主线与支线 | [采访](docs/03-interview-agent.md) |
| 记忆、时间、冲突 | [记忆图](docs/04-memory-graph.md) → [完整性](docs/07-provenance-and-integrity.md) |
| 录音、识别、朗读 | [语音](docs/05-speech-pipeline.md) |
| 页面、确定性状态、记忆河流 | [UI/UX](docs/06-ui-ux.md) |
| 文风与自传 | [人物表达](docs/08-persona-distillation.md) → [生成与导出](docs/09-export-format.md) |
| 镜像、配置、隐私、备份 | [部署](docs/10-deployment.md) |
| 验证及下一阶段 | [测试](docs/11-testing-strategy.md) → [Phase 0 审查与就绪状态](docs/phase-0-review.md) |
| 外部事实与选型 | [证据账本](docs/research/upstream.md) → [依赖审计](docs/research/dependencies.md) → [ADR](docs/adr/README.md) |
| 具体类型、插件适配 | [插件契约](https://github.com/Develata/dsh-laorenyun/blob/main/docs/contracts.md) |

## 最终部署契约（尚未交付）

未来 Release 应提供镜像、Compose 和 `.env.example`，使用者只需 Docker：

```bash
cp .env.example .env
# 填写云服务和模型配置
docker compose up -d
```

当前请勿把以上命令当成可运行安装指南。具体网络边界、启动链接与手机 HTTPS 条件见[部署设计](docs/10-deployment.md)。不要求使用者安装 Node、pnpm、Python、Rust 或 DSH。
