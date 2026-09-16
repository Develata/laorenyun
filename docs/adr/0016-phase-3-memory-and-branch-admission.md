# ADR-0016：应用拥有抽取与支线收尾

状态：接受；验收见[Phase 3](../phase-3.md)。日期：2026-09-15。

沿用ADR0004/0005/0008/0009。记忆写入使用durable operation →模型提案→Host校验→短CAS事务。选择既有DSH llm.stream内部调用而非另起可聊天抽取Agent；tools为空、60秒总预算、一次格式修复。不让采访者决定是否每轮记忆。

自动confirmed只表示存在于已提交证言：关键句采用保留否定/限定词的完整原句，字段必须有原话依据；相对时间/身份歧义保留candidate。TranscriptSegment ID就是当前不可变文字版本，不增加重复transcript_revisions表。BranchMemo候选数组暂为空，因为原始支线答案已经走同一抽取队列，禁止从memo摘要重复造事实。

固定DSH证据：ordinary sessionController.resolveAgent明确拒绝child ownership；真实支线创建后状态轮询出现SESSION_ERROR。选择领域父子绑定+公开agents.get/inspection读取，真人输入仍用官方continuable prompt，不绕过父子权限。

第五答pre-step若直接reject，会同时拒绝原生日志接纳。因此先用公开session.append('user/message',...,surfaceOp='append')/flush持久化最后真人答案，再reject普通模型步骤，内部任务生成memo。memo超时/格式失败存partial；return消息固定branch ID去重。这替代ADR0008早期设想的面向会话finish工具生成memo，避免第五答后模型继续问第六问。

Main记忆context来自公开assemble waterfall，不能保留Phase2 suppressRuntimeContext（固定源码在waterfall后清空contexts）。近期历史使用已装载原生compaction.compactRegion，在九个保留真人轮时批量压缩旧段，保留最近两轮与新输入；不改llm/stream冻结请求、不删除日志。完整图不注入；摘要不是后续事实证据。所有接口仍固定上游，升级须重跑相应门禁。

实网第九轮发现host bundle的compaction-basic不属于定制preset：历史压缩服务必须按上游standard preset的官方isolate组装在采访preset内，interviewer显式inject该服务。原错误停止生成并保留证言，不能将单元fake服务视为装载证明。

实网短轮压缩反而变大，DSH正确拒绝（81→506、488→682估算framed tokens）。批量选区仍可能无收益：允许仅在原生错误为summary-not-smaller且完整retained surface≤8000字符时继续，至少新增8个surface事件才重试；其它错误/超预算仍失败。约八轮是常态目标，短文本例外仍有硬字符上限。摘要预算64 tokens；供应商实际限制行为不能替代Host尺寸校验。

最终落地约束：possible_conflict只使提案candidate，明确material_conflict才创建Conflict；同一事件的不安全改述不能另造节点。关闭取消保留running/proposed供重启续跑；真实网络/语义失败保留failed。Main当前时间默认来自本session最近confirmed节点，不由支线时间覆写。
