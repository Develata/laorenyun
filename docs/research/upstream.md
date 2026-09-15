# 上游证据账本

检索日期：**2026-09-15**。源码证据优先于 README 宣称；“已核验”指静态源码/文档，不表示已构建运行。下列完整 commit 固定本次观察；正文设计不得使用浮动 main 作为兼容承诺。

## 固定观察版本

| 项目 | 版本/commit | 结论 |
|---|---|---|
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | `0.1.6-alpha.1` / `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720` | 选为实现基线；Node ^22.19 或 ≥24，pnpm 11.7.0，MIT |
| [dsh-talk](https://github.com/PerryLink/dsh-talk) | `6ec13dafe1da5e592908afa4dbc29fd3c30b0c23` | README 验证线 dsh-v0.1.5-rc.2，与本次 DSH pin 不同；Apache-2.0 |
| [Tencent SDK](https://github.com/TencentCloud/tencentcloud-sdk-nodejs) | 根版本 4.1.313 / `302b36cc91481d7851fbb070066dd31b04aedcec` | 官方 TS 源码；根包与产品分包版本不等同 |
| Node | [24.21.0 LTS 文档](https://nodejs.org/download/release/v24.21.0/docs/api/sqlite.html) | sqlite 是 release candidate、同步 API；不是成熟稳定 ABI 承诺 |
| [aeonfun/soul.md](https://github.com/aeonfun/soul.md/tree/98b3b24a7232725bbbe76e2ce0de128ba197b377) | `98b3b24a7232725bbbe76e2ce0de128ba197b377` | 文风/示例模式参考，MIT；身份模拟超出本项目 |

## DSH extension matrix

所有 DSH 路径相对[固定源码根](https://github.com/deepseek-ai/deepseek-harness/tree/0d1f50007f9bca3f52b06e1c3074fa14d5fb0720)。该表拥有上游能力结论；插件文档仅映射项目用途。

| 能力 | 精确源码/文档位置 | 核验及限制 | 置信 |
|---|---|---|---|
| Host plugin/tool | `docs/user/develop/basic/tool.md`、`packages/core/tools/src/index.ts` | Cordis apply/inject/ctx.effect、ctx.tools.register；可加领域工具，不改 loop | 高（静态） |
| Client plugin | `docs/subsystems/client-modules.md`、`docs/subsystems/web-client.md` | dsh.client 声明浏览器入口；Host/Client 独立 face，不能打包 Host secrets 到 Client | 高 |
| Composer | `packages/client/ui-conversation/src/client/contract/input.ts` | session slot 提供 InputActions.setDraft/submit；setDraft 整体替换，不自带业务 revision CAS | 高 |
| 禁用 composer | `.../ui-conversation/src/client/input/blocks.ts`、`contract/composer-blocks.ts` | conversation.blocks.set 仅 UI affordance 且是单席位；不是 Host 权限或多 owner 聚合器 | 高 |
| 提交前领域入库 | `packages/core/agent/src/runtime-types.ts` 的 agent/pre-step | waterfall 可拒绝 step/替换消息；发生在 inbox claim 后，不是所有提交前通用事务钩子 | 高；产品恢复需实测 |
| Conversation 展示 | `docs/subsystems/conversation.md`、`slots.md` | 独立 target views/slots；可保留 composer 与历史，使用产品目标隐藏开发 trace | 高 |
| 全局主面板 | `packages/client/ui-layout/src/client/index.ts` | `main` keyed/root slot，`conversation` 保留为会话面板，其余 key 无 Session binding | 高 |
| profiles/bundles | `packages/bundle/web-app/cordis.patch.yml`、`apps/cli/src/profile-boot.ts`、`docs/user/develop/basic/publish.md` | profile 组合安装图；bundle patch 顺序/row ID 属升级敏感适配层 | 高 |
| per-session presets | `packages/preset/agent-presets/{README.md,src/index.ts}` | cordis.yml/preset.yml 组成隔离 subtree，preset 不是 profile；工具/persona 可限定每会话 | 高 |
| skills | `packages/skill/skill-filesystem/README.md`、`skill/tool-skill` | 目录 SKILL.md/frontmatter，catalog 与 body 分离；includeDefaultRoots=false 可限制来源 | 高 |
| subagents | `packages/subagent/subagent/src/{index,types,continuation}.ts`、`subagent-spawn-in-process/src/index.ts` | startContinuable/sendMessage/interrupt，spawn 不继承父历史；sendMessage 是模型作者消息，不应伪造成人类答复 | 高；五答限制是项目职责 |
| Session | `docs/subsystems/{session,persistence,session-projection}.md` | DSH 自有持久日志/投影、客户端 follow/page；不可直接写格式或视作领域数据库 | 高 |
| attachments | `docs/subsystems/attachment.md` | 内容寻址、immutable、持久后发事件；image 可能标准化降采样，不能替代历史原照片 | 高 |
| storage | `docs/subsystems/storage.md`、`packages/storage/storage-sqlite/src/schema.ts` | node:sqlite；公开 backend 只有 KV facet；缺 SQL/跨表事务面向产品的契约 | 高 |
| theme | `packages/client/ui-theme/src/client/index.ts`、`packages/client/ui-theme/src/theme-settings.ts` | ctx.theme.register/setTheme/overrideTokens；自定义 theme ID 不写入 built-in settings；字号12–17 | 高 |
| settings hiding | `packages/bundle/web-app/cordis.patch.yml`、`docs/subsystems/slots.md` | 用 profile 禁用特定 Client rows / slot 组成；未发现万能 hide-all-developer-settings API | 中（未发现不能证明不存在） |
| LLM | `packages/llm/llm-pi-ai/{README.md,src/catalog.ts}` | openai-responses/openai-completions/anthropic-messages 已有路由，凭据引用/模型参数每请求解析 | 高；网关兼容需真实验收 |
| Docker | `packages/bundle/web-app/src/startup.ts`、`packages/host/webserver/src/index.ts` | CLI 拒绝0.0.0.0，webserver Config允许；以发行 profile配置容器监听，回环发布 | 高（源码），未构建镜像 |
| 网络保护 | `packages/client/connection/README.md` | token交换cookie、Host/Origin限制；不是可任意公网暴露的无认证服务 | 高 |

升级风险：client slots/types、Typert生成描述、preset row IDs、Session log版本、provider字段、依赖闭包都处于 pre-stable。只承诺该 commit，经 seam 回归后再升级。源码可扩展不等于已经验证打包成功。

## dsh-talk 源码审查

[固定源码](https://github.com/PerryLink/dsh-talk/tree/6ec13dafe1da5e592908afa4dbc29fd3c30b0c23)：

- `src/client/TalkMicButton.tsx`：MediaRecorder MIME探测、计时器/音轨释放、VAD、草稿与可选 autoSubmit、音频播放；有多代 inputActions/forSession/fallback 兼容，不照搬这些 cast 与 fallback。
- `src/client/index.ts`：conversation.input.left、settings.plugins.tab、remote.$mount 与 effect lifecycle；可参考注册模式。
- `src/service.ts`：Host 转写与 TTS memory cache、Remote；`transcribe` 不提供老人云的 durable original archive，外部调用使用新 AbortController，不能当作调用者取消传播已解决。
- `src/engine.ts`：FunASR、whisper、edge-tts、Piper及 subprocess；`src/index.ts` 强依赖 subprocess、speak tool、status/error/approval announcement。
- `src/provider.ts` 有 provider 形状，但当前 service 仍按固定引擎分支，不是可直接插入腾讯即完成档案链的注册框架。

| 策略 | 成本/匹配 | 决策 |
|---|---|---|
| 直接依赖 | 引擎/设置/播报/VAD/autoSubmit/子进程面超出需求；仍要新增原件权威层 | 不选 |
| 窄扩展或改造 | 能复用 UI 生命周期，但要改 provider 路由、持久化和取消；继承 Apache文件及升级兼容负担 | 不选为默认 |
| 小型专用 speech 模块 | 用已核验相同 DSH扩展点，官方腾讯SDK与成熟转换器；独立定义保存/草稿/朗读语义 | 选择；先留在单插件包内，不另建 speech repo |

这是架构模式参考，不导入/复制源文件。若以后确需改编 Apache-2.0 代码，保留许可/版权/NOTICE（若有）并标注修改，原创 MIT 不覆盖它。

## 腾讯：用户提供文档的具体比较

已通过HTTPS抓取并解析三份用户文档正文（web工具超时后用标准库gzip解码HTML，无执行网页脚本）。

| 文档 | 当前内容/日期 | 对本项目的结论 |
|---|---|---|
| [54362](https://cloud.tencent.com/document/product/1093/54362) | 服务端API快速入门；2025-12-16 | 是开通/集成指南，不是独立识别引擎；Node产品分包可用 |
| [52554](https://cloud.tencent.com/document/product/1093/52554) | SDK总览；2026-06-29 | Node列普通文件/异步流/一句话；Flash列Go/Java/Python，没有已核验官方Node Flash封装 |
| [131127](https://cloud.tencent.com/document/product/1093/131127) | 实时WebSocket V2；2026-09-04 | 1:1音频推送、连接管理/实时speaker hints；不符合录完再转写的最小成本方案 |
| [52097](https://cloud.tencent.com/document/product/1093/52097) | 总览链接的录音文件识别极速版；2026-07-16 | **选择**：100MB/2小时内、HTTPS raw body同步结果，无远端TaskId轮询 |

Flash `asr.cloud.tencent.com/asr/flash/v1/<appid>`与云API3.0签名/参数/错误码不同；host用Node https/crypto窄适配，签名采用接口指定HMAC-SHA1，不手写密码算法。普通SDK不支持它不是引入Python的理由。官方JS repo `30d9634cdf8081cfbaeb51558f88905b49c9a345`为浏览器实时识别，未作为Node Flash依赖。

Flash支持wav/pcm/ogg-opus/speex/silk/mp3/m4a/aac/amr，未列WebM；因此保留原件并由Host转换WAV。推荐Flash页面明确列出的16k_zh_en大模型1.0，其页面列中英粤及包括安徽在内的方言，不把其他接口的31方言/2.0引擎能力移植过来。word_info=2提供词时间/标点，字段缺失退为段级。speaker_diarization=0，filter_dirty/modal/punc=0，convert_num_mode=0。准确率/目标口音仍unresolved。

对比普通CreateRecTask：官方[固定SDK源码](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/blob/302b36cc91481d7851fbb070066dd31b04aedcec/src/services/asr/v20190614/asr_client.ts)描述直传≤5MB、URL≤5h/1GB、异步最长3小时、结果24h；适合批量归档，但本产品录完后等待体验不如Flash的设计目标。SentenceRecognition≤60s/3MB太短。普通文件/实时V2/Flash不是可以只改域名互换的协议。P0只实现Flash，不自动多provider回退。

Flash官方宣称常见30分钟录音可10秒内识别；这是供应商典型时效，非端到端保证。[计费概述](https://cloud.tencent.com/document/product/1093/35686)区分普通/大模型1.0资源与后付费；免费并发不等于永久免费识别，不把普通免费额度套给大模型。个人单路使用不需买额外并发，质量优先选16k_zh_en，16k_zh留作成本/质量实测对照。没有真实账户调用/计费测量，不作价格/效果承诺。

[TextToVoice](https://cloud.tencent.com/document/api/1073/37995) / [SDK类型](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/blob/302b36cc91481d7851fbb070066dd31b04aedcec/src/services/tts/v20190823/tts_models.ts)：云API3.0、2019-08-23、tts.tencentcloudapi.com；中文150字/英文500字母、wav/mp3/pcm。选官方TTS分包4.1.237/common4.1.220。根SDK4.1.313和产品分包版本不同；common浮动星号通过lock锁定。SDK基础request支持signal，便利方法不额外露options，不应假设可直接传入。

[TRTC](https://cloud.tencent.com/document/product/647/131299)同名录音识别采用另一套AppId/RecTaskId/域名/12h限制，与用户提供ASR1093文档不同，不选。当前未收到目标方言或账号授权状态；只做设计，不消耗云资源。供应商网页/源码置信高，真实性能/账号能力未验证。

## 工程风格样本

读取本地 GitHub checkout 的 AGENTS/README/docs：`Develata/dsh-learning-helper` 的 docs/README.md、constitution.md；`Develata/learning-helper` 的 AGENTS.md/发行README约定；`Develata/math_talk_radar` 的 AGENTS、plan/00_engineering_constitution.md、03_architecture.md（观察HEAD `52bf0f527ee157e8ebec57b9dc8decd9b74037fb`）。这是本地快照风格研究，不宣称这些项目远端最新状态或继承其业务决定。

采纳：任务路由、事实唯一owner、合同/验收分离、thin distribution、证据与真实API声明分离、有限外部等待/恢复/增长检查。未照搬：大型目录树、全量生成门禁、课程业务模型、Rust首选和工程框架。

`Develata/Linux-VM-Init` Git clone/ls-remote 返回 Repository not found，网页未成功读取；未研究其内容、也未用类似名字的仓库冒充。其不可访问不阻塞本项目架构。

## 其他研究依据

- [OHA](https://oralhistory.org/best-practices/)：口述史同意、开放提问、保存与使用者权利；[Dart](https://dartcenter.org/sites/default/files/Interviewing%20Victims%20%26%20Survivors.pdf)：敏感采访。应用规则由03拥有。
- [W3C老年用户](https://www.w3.org/WAI/older-users/)：感知/操作/理解需求；[MediaDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)：HTTPS/loopback与权限；不等于已做用户研究。
- [D3 curves](https://d3js.org/d3-shape/curve)、[SVG弧长](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength)：曲线生成与弧长定位分开；选择是工程判断，非对性能的现成证明。
- [SQLite适用场景](https://www.sqlite.org/whentouse.html)：嵌入式本地存储；[Node24 sqlite](https://nodejs.org/download/release/v24.21.0/docs/api/sqlite.html)：同步与RC状态。
- [Settles survey](https://burrsettles.com/pub/settles.activelearning.pdf)：不确定性/覆盖启发，不提供老人云加权评分的正确性证明。
