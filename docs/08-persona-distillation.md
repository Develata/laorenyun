# 人物表达与文风快照

Owner：本文件拥有 persona 语义。Phase 4 实现显式蒸馏；没有快照也能朴素生成自传。

## 研究结论

[aeonfun/soul.md](https://github.com/aeonfun/soul.md) 将 SOUL/STYLE/示例分开，BUILD.md 使用语料分析和访谈构造身份；已检查 STYLE.template.md、BUILD.md 与 MIT LICENSE。它同时抽取世界观/意见，范围超过老人云，不直接安装/执行其 skill。[OpenClaw workspace](https://docs.openclaw.ai/concepts/agent-workspace) 说明 SOUL.md 是行为/身份上下文，不能据此宣称已解决可溯源人物蒸馏。它是参考，不是本项目依赖；不拿 star 数证明效果。版本与许可见[依赖审计](research/dependencies.md)。

## 边界

Memory Graph 决定 WHAT，Persona 决定 HOW。显式点击“自动构建人物画像”才创建任务；新的录音不自动更新。只使用本人已确认文字，保留选定 revision 清单；不混用子女/配偶代述，不能推断心理类型、意识形态、未说过的观点、未来反应或事实。

允许提取用词/口头禅、句子长度与节奏、叙事先后、称谓方式、情绪表达方式，以及有出处的第一人称短语。样本不足写 unknown，不用通用人格填空。输出为语言风格观察，非“此人的数字替身”。

## 产物

```text
persona/<snapshot-id>/
  VOICE.md
  NARRATIVE.md
  EXPRESSIONS.md
  examples/
  metadata.json
```

metadata 保存 schemaVersion、snapshot ID、createdAt、input manifest/hash、speaker ID、model/provider/promptVersion、每项观察的 source refs、生成状态。可给事实性示例去标识化，但不能丢失内部原引用。每次生成是不可变 snapshot，显式选择 active 指针；旧 snapshot 不覆盖。源撤回后标 stale，新生成必须排除，旧生成仅供历史审计。

生成先限定可观察风格 schema，再逐项验证出处和禁区；60 秒块级预算/总 5 分钟、有界批次，不加载全部录音。评估用留出本人段落，人工判断是否像本人、是否新增事实；不以人格测试得分当成功标准。Persona 内容作为不可信生成数据，仅送 renderer 风格槽，不能提升为工具权限/系统操作指令。

## Phase 4 权威与限制

实际快照以SQLite derived_generations中的不可变JSON为唯一权威，不另写可编辑VOICE.md目录；目录示例为未来投影，不能作为第二套源。最近最多80段本人已提交文字，每段模型输入最多1200字，固定ID/清单hash、模型route/prompt版本和计量；五类风格必须有逐字引文或unknown。未将心理/政治/未来推测纳入schema，不能声称用小样本鉴定人格。

仅可选快照作为自传renderer的数据风格槽；不改变采访system prompt、工具或权限。当前保守renderer只采用有引文支持的有限转场；完整事实原句不改写。[Phase 4](phase-4.md)列出真实模型观察和未证实项。

## v0.2 展示与使用

结果位于“我的自传”，用常用表达/叙事习惯/句子与节奏/称呼/情绪表达呈现，并可展开真实引文。成功创建后默认用于下一次自传，用户可关闭。新 Writer 可自由调整语言；Persona 仅传观察说明，事实性引用示例不混入事实宇宙。源不足只列 unknown，不生成空引用观察。历史 Phase4 renderer 的有限转场限制不再约束 narrative-v2。
