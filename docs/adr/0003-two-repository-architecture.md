# ADR-0003：发行与领域插件分仓

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

laorenyun拥有产品事实/ADR/发行profile/主题装配/镜像；dsh-laorenyun拥有绝大多数业务、speech、graph、interview、river、persona/export和DSH adapter。一个插件包即可，概念上的speech不额外拆repo。

## 替代、代价与失败边界

单仓把上游同步与业务混在一起；多插件微服务增加版本和事务边界。两仓通过精确插件tarball/hash和契约版本连接，不通过相邻路径或浮动main发行。

应用文档解释语义，插件contracts唯一拥有字段/工具/wire形状。链接引用而非逐份复制规范。

## 依据与验收

[ownership表](../02-architecture.md)；[插件架构](https://github.com/Develata/dsh-laorenyun/blob/main/docs/architecture.md)。
