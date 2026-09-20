# 范围与验收

Owner：本文件拥有产品优先级和验收编号。当前为 v0.2.0；实际完成与未验证边界见[发行状态](release-v0.2.0.md)。下表保留验收编号，不用设计条件代替真实测试。Phase 0 的文档门禁属于历史。

## Phase 0 历史完成条件

D00：两库 README/AGENTS/LICENSE/NOTICES、要求的主题文档及至少 11 个 ADR 齐备；每个事实有一个 owner；完整上游 pin、证据/置信边界、全部要求的契约和不变量可定位；完成对抗式架构审查及 Markdown/链接/契约校验；不含生产实现。交付证据见 [审查记录](phase-0-review.md)。

## 产品验收编号

| ID | 可观察的通过条件 | 语义 owner |
|---|---|---|
| A01 | `laorenyun` 中文简洁界面；`laorenyun-dev` 保留调试；前者工具清单无任意 shell/文件访问 | [UI](06-ui-ux.md)、[安全部署](10-deployment.md) |
| A02 | 首次开始创建一条主线，无表单；询问出生地/大致年份；重进继续，不重复初始化 | [采访](03-interview-agent.md) |
| A03 | 浏览器录音，Host 原件 hash/时长/身份/持久回执；断网和重启不抹掉已确认保存音频 | [语音](05-speech-pipeline.md) |
| A04 | 真实腾讯 STT 成为 DSH 可编辑草稿；编辑、删除、补充、重录均可；任何 ASR 回调都不触发提交 | [语音](05-speech-pipeline.md) |
| A05 | 默认本人，可选子女/配偶/亲友/其他；每条已提交发言保留身份快照，AI 无权变更 | [出处](07-provenance-and-integrity.md) |
| A06 | 真实模型遵循一次一个主问题、可拒答可停止；主 Agent 不按轮数结束；检索上下文有预算 | [采访](03-interview-agent.md) |
| A07 | 隔离 Branch，最多五次用户回答；重复提交不增加计数；第五次后无第六问；成功或失败均有结构化 memo | [采访](03-interview-agent.md) |
| A08 | SQLite 跨链接图，六要素可缺失，时间精度/确定性分开；无时间记忆漂流，后续锚定保留 ID/历史 | [记忆](04-memory-graph.md) |
| A09 | 抽取候选经校验进入记忆；ASR 修订与历史冲突分开；矛盾并列、直接纠错可追溯 | [出处](07-provenance-and-integrity.md) |
| A10 | 基本河流按主曲线弧长映射月份，可选择节点、访问来源；键盘/列表同样可用 | [UI](06-ui-ux.md) |
| A11 | AI 最终文本持久后腾讯 TTS 自动朗读；浏览器拒播时有播放按钮；失败仍可读文字和继续采访 | [语音](05-speech-pipeline.md) |
| A12 | 第一人称 Markdown 自传和基本静态 HTML、memories.json；重要事实能追到节点版本/文字/原音范围 | [导出](09-export-format.md) |
| A13 | 全新 Docker 主机按 `.env` + Compose 启动；原件/SQLite/DSH 会话重启保持；健康、停止、恢复通过 | [部署](10-deployment.md) |
| A14 | 同一采访/抽取用 DSH 路由支持 Responses、OpenAI-compatible、Anthropic；真实通过记录单独列出 | [测试](11-testing-strategy.md) |

不得以 fixture 对话代替真实云调用验收。语义评估含人工核对；性能数字是验收目标，不是已测结果。

## 尚未纳入当前发行

照片引导采访、ASR 热词学习、带原件的 portable ZIP、完整离线交互 HTML。当前已具备 Path-of-Trees 动画、显式文风蒸馏和出处查看；无 Persona 同样可以生成自然自传。

## 不在范围

应用账号/自建认证、支付/订阅、营销、商业 onboarding、多租户 SaaS、社交、企业管理、原生移动/桌面应用、声音克隆、双工实时通话、向量库/Neo4j/复杂 RAG、定制训练、大规模多 Agent 社会、复杂推荐算法、P0 PDF。保留 DSH 自带本机浏览器访问保护不属于新增账号系统。

## 历史实施顺序

Phase 1 先完成 DSH profile/slot/pre-step/子会话与镜像启动边界验证、证据存储和一条真实语音到草稿闭环，再扩展采访/抽取/记忆河流/导出。每个切片同时完成恢复场景；P1 不抢占 P0。需先关闭的集成风险见[审查记录](phase-0-review.md)。
