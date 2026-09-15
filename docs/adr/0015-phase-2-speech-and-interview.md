# ADR-0015：Phase 2 语音与采访接入

状态：接受实施方案，真实云验收单列。Owner：应用架构。日期：2026-09-15。

## 接入决定

沿用固定DSH和Phase1出处机制。上传使用现有Connection streaming route，认证/Origin不变；应用限定32MiB和60秒，一次有限缓冲。MVP停止录音后先保存浏览器IndexedDB、再上传原件；不实现Phase0草图的通用分片恢复协议。依据：固定transport可直接背压读body且应用录音有10分钟硬限；分片框架当前增加的复杂度超过收益。录音尚未停止时刷新可能丢失浏览器未保存片段，不能声称实时归档；界面需提醒。

Host集中FFmpeg，固定输入/输出及音频容器/协议白名单，原件不覆盖。暂用Debian bookworm打包FFmpeg（含GPL），代替Phase0“最小自构建”的未实测目标：维护成本更小，仍保持受限调用。完整许可/源码义务在binary发布前解决，不将默认包称LGPL。

腾讯Flash按现行官方文档用Node crypto/fetch；TTS分包SDK按公开request传signal，稳定领域输出。TTS强制MP3，普通Web播放可直接使用；不暴露没有实现浏览器封装的PCM选项。语速/音色可配置，默认101001/-0.5/0，实际声音质量需听测。

原生reference只在编辑/提交间串行化SourceId；接纳后清理text，在DSH可扩展source对象中保留`laorenyunSourceId`。SQLite仍是来源关联权威；旧日志不改写，旧气泡通过公开renderer隐藏标记。应用不修改DSH核心。

采访SKILL.md紧凑核心由agent-scoped system section预载；五份参考由只读白名单工具渐进加载。无需开启任意文件工具。初始化是持久的plugin上下文，不是user/rpc人类回答；先记录bootstrap ID，公开inbox/log核对后驱动首轮。

## 不作的保证

领域receipt与DSHflush没有跨库原子性；只能按ID对账，不能自动新ID重发。SDK/模型类别支持不等于凭据/账号实测。云时延、普通话/地区口音准确率、真人麦克风与移动HTTPS都需各自验收。

[实现及失败窗口](https://github.com/Develata/dsh-laorenyun/blob/main/docs/phase-2.md)；[实际证据](../phase-2.md)。
