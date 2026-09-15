# ADR-0001：固定 DeepSeek Harness 基础

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

使用 upstream **0.1.6-alpha.1 / 0d1f50007f9bca3f52b06e1c3074fa14d5fb0720**。Node 24.21.0 / pnpm 11.7.0作为发行基线。DSH继续拥有agent loop、会话/历史、工具、provider、attachment投递和Web框架；老人云通过Host/Client plugins、profiles、presets、skills和theme接入。

不重新选择Agent框架，不修改核心loop。发行阶段在独立upstream目录保存精确快照及许可，记录取得方式/hash；原创适配在外侧，不能把整个副本重标MIT。Phase0只研究，不导入源码。

## 替代、代价与失败边界

直接fork不可用；浮动git依赖不可复现；重写整个Web/loop扩大同步成本。固定快照增加更新责任，但边界可追踪。pre-stable slots、profile row IDs、会话/Remote/原生addon均是升级风险。

升级流程：单独比较上游diff与许可证闭包→调整唯一DSH adapter→跑composer/branch/profile/provider/session恢复门槛→更新pin和兼容记录。数据格式不兼容先备份迁移，禁止自动拉取最新main。

## 依据与验收

[固定源码与能力矩阵](../research/upstream.md)；[接入门槛](0013-dsh-integration-seams.md)。
