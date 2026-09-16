> Phase 3 实现/验证见 [phase-3](phase-3.md) 与 [ADR-0016](adr/0016-phase-3-memory-and-branch-admission.md)；Phase 2 两项真人硬件门禁仍 pending。

# 出处、文字修订与完整性

> 当前数据/API见插件实现契约；节点纠正界面及派生产物属于后续阶段。

Owner：本文件拥有来源和修订语义。类型在[插件 contracts](https://github.com/Develata/dsh-laorenyun/blob/main/docs/contracts.md)，文件提交与事务在[插件 memory](https://github.com/Develata/dsh-laorenyun/blob/main/docs/memory.md)。

## 可追溯链

`BiographySection.paragraph → node ID + revision + field → source ref → TranscriptSegment + revision → Media ID + [start_ms,end_ms)`。

原件字节、hash、真实 MIME、录音时长和捕获状态不可变；转写每次识别新增 AsrAttempt，保留腾讯原始结果和转换参数。用户文字 append revision，ASR 原文不覆盖。Source 保存 `kind`、speaker 快照、capture time、DSH session/message 对照、是否使用/确认以及内容修订。

文字修订后原词级时间戳通常不再对应新字词；保留原 ASR alignment，并把新文字标为 segment-level 或 unaligned，能定位整段原音即可，禁止伪造精确字级关联。纯文字补充没有音频，明确 source kind=text，不制造音频出处。若用户在整段草稿中加入新事实而无法可靠划分新增字符，整份校订稿标unaligned；可链接“对应录音”作修订背景，但不能声称新增句在音频某一时刻说过。对齐降级不降低用户显式提交文字的权威。

## ASR 修订不是历史冲突

草稿“合肥一中”改为“合肥六中”，原 ASR 保留，显式提交后的修订是这次发言的权威文字。标点/常见错字不额外打断；人/地/校名/组织/日期/重要数值/关系变化可展示一句轻确认，确认结果附该 revision。检测有不确定性，不能以检测没报错宣称无事实变化。P0 可以先采用修改后预览及显式发送，不强制为每次修改调用 LLM。

当新确认主张与已有历史主张在同一主体/属性/重叠时间/语境中互斥，才创建 Conflict。模型可提出 conflict candidate，代码核验两侧 refs，界面中性并列。用户可选择修订旧说法、保留不同证言或暂不确定；记录 resolution 来源与时间，不能根据“更新”自动覆盖“更早”。

## Speaker

每次录制/文字发言默认“本人”；选择值为本人/子女/配偶/亲友/其他，附可选姓名/关系。speaker 是证言来源，与故事主角 Person 不同。代述“我父亲当年去了……”不可改写成父亲亲口说。

recording start 固定该录音的 speaker 快照；中途换人应结束本段新开，或以后显式按段修订身份。身份纠正也 append revision，不改原审计事实。ASR speakerId/AI hint 不改变权威 speaker；默认不启用声纹。Persona 只用本人确认语料，代述不能混入本人语气。

## 接纳与恢复

模型处理前必须保存用户确认文本。DSH 与领域库两段提交靠 operation/message ID 和对账连接：领域先 durable 固定输入，DSH step 才可执行；收到 native user/message 后补齐日志 seq。崩溃在任一段时能显示 pending/interrupted，重试不新建同一发言或多计 Branch。映射存在但日志未接纳不能被当作“采访已经回答完成”。

生成候选引用不存在/越界来源、错误 speaker、未知 node revision、将 inferred 升 stated，均拒绝发布；最多一次修复请求，失败保留提案供检查。抽取和自传不是证据，只是源材料的解释。

## 删除与容量

P0 不提供物理删原件工具。草稿删除/节点撤回只改变引用状态，保留审计；未来永久删除必须明确范围、影响与备份策略并由使用者确认。原件不可静默清理不等于可无限接收：磁盘不足拒绝新录制/上传并保留已接收片段。源数据无自动 TTL；派生缓存、临时文件、日志有独立界限，见[部署](10-deployment.md)。

Phase 3中TranscriptSegment ID本身是不可变文字版本，未另建同义revision表。来源引文必须来自本次接纳的校订稿；模型比较只可引用固定输入白名单中的节点/Conflict revision。澄清追加两端修订和resolution来源，不改写旧JSON。
