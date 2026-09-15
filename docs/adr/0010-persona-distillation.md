# ADR-0010：显式、可溯源的文风蒸馏

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

Persona为P1，用户点击才运行。输出VOICE/NARRATIVE/EXPRESSIONS/examples/metadata，按speaker与输入版本冻结snapshot。只总结语言节奏、称谓、表达与叙事顺序，不推断性格、政治、未来意见和事实。Memory决定WHAT，Persona决定HOW。

## 替代、代价与失败边界

SOUL.md式项目可参考文件分层和示例，不继承身份模拟/信念生成，也不增加它们的运行时。P0没有Persona仍能从已确认事实生成朴素第一人称自传。过期snapshot标记stale，不悄悄自动重建；每个例句绑定来源。

## 依据与验收

[persona设计](../08-persona-distillation.md)；[依赖与许可研究](../research/dependencies.md)。
