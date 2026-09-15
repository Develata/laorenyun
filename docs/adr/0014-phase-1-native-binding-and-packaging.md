# ADR-0014：Phase 1 实际接入与冻结打包

状态：接受。日期：2026-09-15。Owner：laorenyun。补充 ADR-0003/0013，不改变 DSH 基础、TypeScript、SQLite 或单镜像选择。

## 决策与证据

- 来源通过公开 reference chip codec 携带显式 Source UUID，经原生提交到 `agent/pre-step`，按原生 session/message/rpc ID 持久关联。浏览器不存在唯一权威的临时关联表。原生回执与领域事务不原子；领域 submitted 表示已接收输入，不冒充模型成功/原生日志已 flush。恢复先查领域记录和 DSH 日志，不自动换 ID 重发。
- 仅 DSH Web 真人消息的 `source.kind=user` 加非空 `rpcId` 可计数；源码及真实支线验证证明初始化 spawn 消息也可能是 user，单看 role/source.kind 不够。
- 支线使用 continuable child + 插件持久门禁。第五答写 closed/memo；保留原生会话历史，不把整个子树 drain 当成单支线关闭。冷恢复先恢复父会话，再刷新目录/打开原 child。
- Phase 1 探针用 Connection 的有认证 Fetch route；不是新的传输框架。完整产品 Typert Remote 契约仍是后续目标。所有 paid-call-free probes 只在 dev + 显式开关启用。
- Docker 的现代 pnpm deploy 使用派生注入锁；原锁里的 workspace link 无法直接构成独立 runtime。实测只加 injection 参数导致缺失 Cordis group，旧式 deploy 又重新解析版本。最小修正是生成并提交专用 packaging 锁，并校验所有 registry version/integrity 不变，保留原始上游快照。

- 完整 Compose 启动进一步证明 DSH fallback 的 lexical manifest 遍历遗漏 isolated pnpm 间接依赖。发行构建在根 node_modules 补齐发现链接，保持原包实路径与 identity；这是第四项外部构建适配，不修改 DSH 源码。CLI --version 不能代替插件加载 smoke。

## 代价与验收

Reference 标记暂时出现在开发会话气泡/标题；展示优化用公开 projection/renderer，不删除证据 ID。Main/Branch 的最终语言行为不在此阶段。

派生锁是生成物，不是第二份手工依赖权威。升级必须重新验证包闭包和 symlink 完整性。构建适配清单见 [UPSTREAM](../../UPSTREAM.md)，实际 Gate A/B/C 证据见 [Phase 1](../phase-1.md)。未通过真实 Compose 前不能据此宣布 Gate C 完成。
