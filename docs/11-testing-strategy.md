> Phase 2 实际接入与验证状态见 [phase-2](phase-2.md) 和 [ADR-0015](adr/0015-phase-2-speech-and-interview.md)。完整产品规范仍含未来阶段，不能视为全数已实现。

# 验证策略

> Phase 1 当前实现与证据见 [phase-1](phase-1.md)；本文件保留完整产品规范，未标为已实现的能力仍属后续阶段。

Owner：本文件拥有验收层次；[插件 testing](https://github.com/Develata/dsh-laorenyun/blob/main/docs/testing.md) 列模块/接口测试，避免重复用例。

## 分层证据

1. Phase 0：检查文件完整、owner/链接、ADR 引用、类型设计、研究源码定位和反例。无应用就不运行虚构应用测试。
2. 领域测试：时间精度、事实状态、speaker、冲突/修订、branch 计数、幂等。固定输入/时钟/随机源，离线通过不代表真实模型语义正确。
3. DSH 集成：精确 commit 构建/加载，profile tools inventory、slot draft、pre-step、子会话冷恢复、相邻数据格式、导出来源链。
4. 浏览器：真实 Chromium 与 WebKit/目标 Safari/Chrome 手机，权限拒绝、设备断开、IME、编辑/重录、autoplay、200%缩放、键盘和焦点、断线重连。模拟 WebKit 不等同真实 iOS MediaRecorder。
5. 真实云：使用经同意的非敏感 30/120/600 秒录音，普通话及目标方言；腾讯 STT/TTS 和三类 LLM 路由分别记录接口、region、engine、耗时、失败和人工转写差异。不自动遍历付费音色；经用户提供凭据/服务授权后运行。
6. 发行：干净 Docker 主机，只 `.env`/Compose，非 root、端口、访问 cookie、卷恢复、SIGTERM、磁盘满、health；最终镜像逐包许可及资产核验。

## 关键故障切点

录音权限 pending、最后 chunk 丢失、rename 前后、DB commit 前后、Flash 请求响应丢失、云返回后写库失败、用户改草稿后旧 ASR 到达、用户提交后 DSH 未记录、Branch 第五答后崩溃、memo 失效、TTS autoplay 拒绝、导出一半空间耗尽、schema 未来版本、两 tab 并发。

每个切点验证：原件状态准确、没有重复事实/计数、有限返回、重试可恢复、旧派生版本可用。hash 相同不是“正确 speaker”的证明；引用存在不是“事实有依据”的证明。

## 人工语义评估

固定约 20 段带评分标注的合成/自愿提供口述样本，含未知时间、同名人、方言错字、代述、敏感经历、矛盾、无答案。指标：无依据重要事实=0、speaker 静默改写=0、自动提交=0、第六次 Branch 回答=0；单主问题、语气和必要澄清做人工逐例判定，不伪称自动分数可充分保证历史真实性。

## 性能预算（尚未测量）

10,000 节点/50,000 文字段的本地单人生测试档；分页查询 p95 <200ms，可见河流≤500节点，采访入口不全量读档；云 ASR 120秒录音 p95 目标≤30秒仅为体验指标，超过需评估接口，不当作供应商 SLA。Host health 在识别/导出期间应持续响应。记录硬件和样本分布；没有测量不报告达标。

后续每次变更只跑受影响检查；上游升级先执行窄 seam tests，再跑产品关键路径。真实演示必须标出使用的 API 和实际返回，不用 fixture 冒充。所有录屏/回执遮蔽密钥和启动 token。
