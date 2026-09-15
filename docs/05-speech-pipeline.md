# 语音到草稿与朗读

> Phase 1 当前实现与证据见 [phase-1](phase-1.md)；本文件保留完整产品规范，未标为已实现的能力仍属后续阶段。

Owner：本文件拥有交互与失败语义；[插件 speech](https://github.com/Develata/dsh-laorenyun/blob/main/docs/speech.md) 拥有腾讯映射、具体预算与恢复操作。外部 API 证据见[账本](research/upstream.md)。

## 端到端顺序

1. 用户点击开始，浏览器在安全上下文申请麦克风。录音可手动结束，不用静音 VAD 过早截断老人的停顿。
2. MediaRecorder 保留原始字节、真实 MIME。定时 chunks 暂存并有序上传到 Host staging；最终停止、校验、同步文件和数据库后才显示“录音已保存”。已 ack chunks 在崩溃后作为 partial 原件保留，不伪称可完整解码。
3. Host 从原件生成 16kHz/16-bit/mono WAV 识别副本；腾讯 ASR 极速文件识别同步请求（由 Host 后台任务执行）。所有身份/密钥在 Host。
4. 保存原始响应及分段；当前 draft lease/revision 仍匹配才通过 DSH `inputActions.setDraft` 写入。期间用户已有文字时保留旧文字，明确选择追加/替换，不静默覆盖。
5. 用户编辑、补充或重录；**只有用户点击原生发送/按发送键才提交**。插件不向 ASR 回调暴露 submit 动作。新录音不会删除旧录音；移除草稿仅标记未采用。
6. Host 在允许模型处理前固定本次文字修订、speaker 和源 refs，之后 DSH interviewer 生成最终回答。保存最终文本成功后自动请求 TTS。
7. TTS 只读本次最终 assistant 可见文本，不朗读 tool trace/推理/错误堆栈；播放被浏览器拒绝时显示“点一下播放”。可暂停、停止、重播、关闭自动朗读。

## API 选择

选择中国站 **录音文件识别极速版（Flash）**，一次HTTPS上传整段录音、同步拿结果；TTS继续使用云API3.0 `2019-08-23 TextToVoice`。用户提供的54362是入门、52554是SDK总览、131127是实时WebSocket V2；V2的1:1发送与说话人分离给本项目增加不需要的流控。

通过SDK总览发现Flash，适合录完后识别，省掉异步轮询/公网回调/COS。推荐引擎 `16k_zh_en` 大模型1.0，普通 `16k_zh` 是管理员可选的成本对照；Flash参数页并未列出 `16k_zh_en_2.0`，不能沿用V2/异步接口的引擎名。质量/费用/速度综合选择见 [ADR-0006](adr/0006-tencent-cloud-speech.md)。目标口音尚未给出，账号开通和真实录音对比仍须验收。

Flash不在当前官方Node云API SDK覆盖内，使用Node标准HTTP/crypto实现窄协议适配，TTS复用官方SDK；不用Python/Rust。官方“通常30分钟音频10秒内完成”是供应商描述，不是本产品端到端SLA。语言覆盖不等于老人方言准确率保证；默认不启用情绪/声纹或自动身份推断。

## 录音格式与成本

Chrome 常见 WebM/Opus，Safari 常见 MP4/AAC，需 feature detection 和真实手机验收；不能改扩展名冒充 WAV。采用容器内受限 FFmpeg 进程转换，业务仍 TypeScript；不用浏览器整段 decode/resample 造成长音频内存放大，也不用手写 codec。原件 hash 与转换文件 hash 分开。该依赖及许可证单独记于 [ADR-0012](adr/0012-audio-normalization.md)。

MVP 单次录音默认最多 10 分钟/32 MiB，提前提示并在上限保存，鼓励自然分段但不结束整个采访。10分钟规范化WAV约19.2MB，低于Flash100MB/2小时限制，整段上传，避免为异步接口5MB限制引入人工分片。原件时间轴与词/句时间一致性仍须检查。

## 失败

持久原件与云操作解耦。ASR 失败：“这段录音已经保存，但文字识别失败。”提供重试和文字输入；存储失败则必须写“尚未保存”，保留浏览器副本/下载入口，不能显示前一种文案。未取得完整持久回执前关闭标签页有丢失未上传尾部的风险，要明确提示。

取消识别停止本地网络；已传云数据/可能计费不可伪称撤回。Flash没有持久TaskId轮询恢复，响应丢失时保留原件并提示显式重新识别可能重复处理。TTS 失败不阻塞下一轮采访。重连不自动重播旧回答，不自动再提交文字。自动朗读偏好由用户决定，UI 忙闲由状态机决定。
