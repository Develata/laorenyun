# ADR-0006：腾讯极速文件识别与基础 TTS

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

ASR选择**录音文件识别极速版 Flash**，推荐`16k_zh_en`大模型1.0；管理员可选普通`16k_zh`作成本/效果对照。一次录完后Host通过HTTPS上传并同步收结果，浏览器不持腾讯长效凭据。TTS用官方Node分包TextToVoice。领域只见provider契约。

Flash当前无已核验官方Node封装，因此用Node标准https/crypto实现小协议adapter，对照官方Flash文档和Go参考；它不是云API3.0，不能复用普通SDK签名。AppID、SecretId、SecretKey由Host拥有，签名URL禁止日志输出。

## 替代、代价与失败边界

原偏好普通CreateRecTask异步接口在直传5MB下需要分片，或额外URL托管/轮询，增加等待与恢复复杂度。用户所给54362/52554是入门和SDK目录，131127是实时V2；后者要求实时流控而本产品不是通话。目录中的Flash可接100MB/2小时，满足10分钟录音整段上传，选择更小的应用状态面。

Flash推荐引擎明确支持中英粤和列出的方言；这不是老人实际口音准确率保证。官方典型处理速度不是SLA。大模型和普通模型计费/额度分开，免费并发不是免费识别。未测账号权限、实际费用和时延；Phase1用用户授权样本比较再固定管理员默认，不自动付费切换引擎。

HTTP响应丢失没有远端TaskId可恢复；本地记录submission_unknown，保留原件，让用户显式重识别并说明可能重复处理。所有截止与重试由插件拥有。

## 依据与验收

[用户文档比较/SDK源码](../research/upstream.md)；[Flash官方参数](https://cloud.tencent.com/document/product/1093/52097)；[speech契约](https://github.com/Develata/dsh-laorenyun/blob/main/docs/speech.md)。
