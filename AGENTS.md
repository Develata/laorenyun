# Laorenyun — 发行层与文档入口

始终中文交流。当前产品为 v0.2.0，发布与分发状态见 docs/12-release.md：业务归插件库，发行归本库。下一阶段功能需要对应任务授权；不顺带扩大后续阶段范围。

## 读取与权威

- 首读 [README 路由](README.md)、[范围](docs/01-scope-and-acceptance.md)、[架构不变量](docs/02-architecture.md)，再读任务相关 owner 文档及 ADR。
- 本库拥有产品语义、范围、系统架构、验收、发行配置、上游锁定、研究证据和许可清单；插件库拥有类型契约与实现适配。见[权威表](docs/02-architecture.md)。跨库链接在本地可映射到 `../dsh-laorenyun/`。
- 当前实现事实由源码/验证证据说明，规范由 owner 文档说明；矛盾要修正，不可把目标写成已交付。
- 改业务去插件库。优先 bundle/profile/preset/Host/client/slot；无证据不修改 DSH agent-loop。上游树与原创发行文件分目录，版本只使用完整 commit/精确包版本。

## 工程规则

复用成熟轻量依赖。确定性状态、事实权威、超时、重试、幂等、恢复、资源增长必须明确；不得用 LLM 控制 UI、提交确认或权威事实状态。遵守编号不变量 I01–I14。

常规局部变更自主完成；架构边界改变须更新原 owner 与 ADR。保留任务外工作。未经用户明确授权不得 push、发布或大量删除。默认单 Agent；文档不设置强制委派流程。

有 `.codegraph/` 时，理解或定位代码先用 CodeGraph；Markdown/字符串用 rg。变更后执行匹配验证、检查 diff；最终写 `验证：...`，分别报告文档变更、代码实现、运行和发布。发行修改运行 upstream/packaging-lock/release 校验、受影响的构建与 Compose smoke。main 有无 bypass 的历史与 CI 保护；获授权发布时也必须走短分支、CI、PR。当前发布操作见 docs/12-release.md；历史阶段证据保持原样。
