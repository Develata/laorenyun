# 人物表达与文风快照（P1）

Owner：本文件拥有 persona 语义。P0 不实现蒸馏；没有快照也能朴素生成自传。

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
