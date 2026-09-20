# 老人云 v0.2.0 — 源码发行

本文是 v0.2.0 的发行边界；历史 [RC2–RC6](v0.2-redesign.md) 和 [v0.1.0](release-v0.1.0.md) 证据不改写。

老人云是一个面向老年人的 AI 口述史与动态自传系统。用户可以通过语音或文字讲述经历；系统保存原始证言和出处，将长期记忆组织成可追溯的 Memory Graph，并通过“人生长河”进行可视化探索，最终生成带事实审校的自然自传。AI 抽取和审校不是独立历史核实，也不保证完美事实准确性。

## 发行身份

- Laorenyun：`v0.2.0`；应用精确 SHA 为本库 annotated tag `v0.2.0^{commit}`。可执行 `git rev-parse 'v0.2.0^{commit}'` 核对。
- 插件：`dsh-laorenyun@0.2.0`，`9caf4b1796ff265573bee04424c0bcb966a15f58`，由 [PLUGIN.json](../PLUGIN.json) 精确固定。
- DSH：`0.1.6-alpha.1`，`0d1f50007f9bca3f52b06e1c3074fa14d5fb0720`；上游源码修改 **0**。
- 本地镜像：`laorenyun:0.2.0`，仅供本地构建和运行。
- 最终应用 SHA、两库标签目标、CI 与镜像 ID 记录在 [GitHub Release](https://github.com/Develata/laorenyun/releases/tag/v0.2.0) 的发行说明与 `release-manifest.json`。提交无法在自身内容中包含自身哈希，因此精确双库回执在提交后生成，标签不移动。

## 相比 v0.1.0

- 通过 DSH 公开 shell/slot/workspace/settings/right-sidebar API 提供老人界面，不修改 agent loop。
- 一个人物档案对应一个 Workspace，多次采访共享长期人生记忆，不同人物隔离。
- 文字和语音统一进入接受证言、来源、抽取和记忆图；人工纠正保留历史证言。
- Path-of-Trees 人生长河、独立漂流湾、记忆详情和右侧快速预览；时间沿真实路径弧长映射，故事层级不冒充时间。
- Web 内模型和腾讯语音设置；“我的表达方式”作为可选自传风格，不能增加事实。
- 自然 Biography Writer、段落内原子事实审校和有界修复；更正后的当前叙事只引用有效支持证据。
- Markdown、离线 HTML 与 memories.json；阅读来源和完整归档历史分开保留。
- 大档案展示分别有界读取日期/漂流节点，先筛可见关系再限量，投影版本覆盖 BranchMemo 和展示状态变化。

## 部署与分发

按 [README](../README.md) 克隆、复制 `.env.example` 并在本机配置，运行 `docker compose up --build -d`。未配置云供应商仍可启动本地健康界面；云采访需有效配置。

一个容器、一个持久数据目录、SQLite + 本地媒体。UID/GID 10001:10001，默认宿主仅监听 localhost，保留 DSH 访问保护、cap_drop 和 no-new-privileges。云供应商处理任务所需音频/文字；不是全离线 AI。

**仅发布源代码、Dockerfile、Compose 和构建说明。不发布 GHCR / Docker Hub 镜像或容器 tarball。** Debian FFmpeg 包含 GPL 组件；二进制镜像分发对应源码交付尚未完成项目既定合规要求。许可边界见 [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md)。

## 验证证据

本轮仅提升版本、精确 pin 和发行文档。产品实现、依赖锁、DB 迁移、模型提示词不变。最终验证回执见 [发行检查](evidence/v0.2.0/README.md)。界面沿用已接受的 [RC6 截图](evidence/rc6/README.md#截图审查)，不复制一套相同图片。

未重跑 RC4 三次付费 Biography、Tencent ASR/TTS 云探针：这些路径未改，沿用各历史实测证据。本轮执行确定性测试、本地容器、浏览器和已有书稿的导出验证，不冒称新的云质量测试。

## 已知限制

R2 physical microphone: PENDING
R3 physical-human recovery: PENDING

- 未认证实体 iOS/手机浏览器、真实 Safari；响应式 Chromium 不等于硬件测试。
- 无词级原始音频与归一化音频精确对齐。
- AI 抽取不是独立历史核实，无心理画像或未来观点模拟。
- 无照片采访、ZIP、导入/恢复。导出为阅读/归档输出，不是完整可恢复备份。
- River 是有界启发式投影，不保证任意图最优布局；无一万节点性能保证。[RC6 单次合成规模测量](evidence/rc6/scale.json)仅适用于该夹具。
