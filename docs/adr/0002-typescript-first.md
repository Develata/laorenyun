# ADR-0002：TypeScript MVP 与运行依赖

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

MVP业务、Host适配和Web统一TypeScript。domain不依赖DSH/Tencent/React。Node携带标准sqlite/crypto/http能力；不要求Python、Rust或Go运行时。

## 替代、代价与失败边界

Python语音工具链没有本地推理收益，Rust服务增加边界而无已测瓶颈。复用DSH的native addon及受限FFmpeg是已有二进制依赖，不是新增一套业务语言，也不要求用户安装编译器。选择TS不意味着禁止Node本身使用原生代码。

## 依据与验收

[依赖审计](../research/dependencies.md)；[媒体规范化](0012-audio-normalization.md)。
