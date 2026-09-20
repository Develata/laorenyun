# 文档导航

README 是产品入口；下表链接唯一语义 owner。规范说明现行约束，发行证据说明某个版本实际运行过什么，ADR 保存决策背景。

| 阅读目的 | 文档 |
|---|---|
| 产品、范围、已知限制 | [产品入口](../README.md)、[范围](01-scope-and-acceptance.md) |
| 架构、人物档案、权威边界 | [架构不变量](02-architecture.md)、[固定上游](../UPSTREAM.md) |
| 主线与支线采访 | [采访](03-interview-agent.md) |
| 语音、确认草稿、原件 | [语音](05-speech-pipeline.md) |
| Memory Graph、冲突、漂流记忆 | [记忆图](04-memory-graph.md) |
| Life River、独立详情、设置 | [交互](06-ui-ux.md) |
| 出处、修订、纠正 | [完整性](07-provenance-and-integrity.md) |
| 我的表达方式 | [Persona](08-persona-distillation.md) |
| 自传与导出 | [生成/导出](09-export-format.md) |
| Docker、HTTPS、卷运维 | [部署](10-deployment.md) |
| 验证层次和硬件缺口 | [测试策略](11-testing-strategy.md) |
| main 保护、tag、镜像与对应源码交付 | [发布操作](12-release.md) |
| 演示与云不可用备用方案 | [演示](demo.md) |
| 实现 API/类型/测试 | [插件文档](https://github.com/Develata/dsh-laorenyun/tree/main/docs) |
| 架构决定与研究 | [ADR](adr/README.md)、[依赖审计](research/dependencies.md) |

## 历史证据

以下记录保持当时的版本、成功与失败，不作为“当前尚未实现”的判断依据：

- [Phase 0](phase-0-review.md)、[Phase 1](phase-1.md)、[Phase 2](phase-2.md)、[Phase 3](phase-3.md)、[Phase 4](phase-4.md)
- [v0.1.0](release-v0.1.0.md)、[v0.2 RC2–RC6](v0.2-redesign.md)、[v0.2.0](release-v0.2.0.md)
- [v0.2.0 原始发行回执](evidence/v0.2.0/README.md)
- [分支保护与分发门禁审计](evidence/distribution/README.md)

R2 实体麦克风与 R3 真人采访后恢复仍独立待验证；不能由源码发行或 CI 通过推导为完成。

## 可复现课程演示

- [合成数据与生命周期](../demo/README.md)
- [七分钟演示](demo.md)
- [HTTPS 私人公网备用](demo-public.md)
