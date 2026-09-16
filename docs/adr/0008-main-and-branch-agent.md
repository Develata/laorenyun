# ADR-0008：隔离主采访与五答支线

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

Main默认按时间推进，工具按需检索，不全档注入。支线仅在有价值且会干扰主线时开启，一个fresh continuable spawn、深度一、最多一个活跃branch。Host持久计数独立用户回答，最多五次；模型工具回执、TTS和重试不计数。结束先存BranchMemo再归并Main。

## 替代、代价与失败边界

一个上下文做所有支线会污染主线；大群Agent无隔离收益。DSH已有continuable子会话可复用，但sendMessage产生模型作者消息，不能冒充用户；真人回答走原生child session prompt。continuable不支持outputSchema，memo在Phase3采用应用拥有的内部结构调用完成（修订证据见[ADR0016](0016-phase-3-memory-and-branch-admission.md)），超时保存partial memo。

第五答与关闭、crash恢复/重投递必须验收；五答仅限branch，Main没有回合数强制结束。调用interrupt返回不等于runner已完全停止。

## 依据与验收

[采访生命周期](../03-interview-agent.md)；[插件接入](https://github.com/Develata/dsh-laorenyun/blob/main/docs/interview.md)；[上游subagent证据](../research/upstream.md)。
