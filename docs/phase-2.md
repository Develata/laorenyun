# Phase 2 发行与验收

日期：2026-09-15。状态：**实现和离线/容器门禁已交付；真实云、实体麦克风与口音验收未完成，不能宣布Phase2全部通过或Phase3就绪。** 真实TTS和普通引擎Flash已在本机成功；默认大模型引擎的资源包不匹配，Docker真实采访全链仍待验，详见下方补测记录。模型凭据仍未配置，不以fixture替代真实采访。

实现契约由[插件Phase2](https://github.com/Develata/dsh-laorenyun/blob/main/docs/phase-2.md)拥有。产品/发行取舍见[ADR-0015](adr/0015-phase-2-speech-and-interview.md)。

## 固定产物

- DSH仍为0.1.6-alpha.1 / `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720`；11239原始blob校验一致，**零上游源码修改**。
- 插件完整SHA由[PLUGIN.json](../PLUGIN.json)固定为 `442579b7f78664df8a89daebc13b5a47deb0ed7b`，独立仓库Git下载→frozen install→check→pack，不复制工作树，不依赖main。
- 本地镜像 `laorenyun:phase2`：`sha256:f2adc66a71b7a80d33a2e4b40022f7b2c0c1127e6722b9d8f24f477b181287d7`，311571411 bytes，linux/amd64。无registry发布。
- Node24.21.0、FFmpeg Debian7:5.1.9-0+deb12u1，实际包含GPL；配置/OS清单见[licenses/phase-2](../licenses/phase-2/README.md)。不含Python/pnpm/开发编译器运行要求。TTS SDK37项完整许可随包保留；二进制发布前仍须完成对应源码义务。

## 链路与出处

浏览器原生MediaRecorder→停止后IndexedDB→认证二进制上传（32MiB/60秒）→原件文件/hash/SQLite→固定FFmpeg（30秒，16k/mono/PCM16，独立派生物）→Flash→原生可编辑composer→真人显式native send→pre-step接纳最终文字→DSH模型→final assistant→应用TTS→浏览器播放。

Source/media/ASR attempt/raw text/edited text/native message+rpc ID分层保留。提交前原生reference串行化Source ID；接纳后正文去标记，原生source扩展字段保留显式ID。旧日志不改写，老人公开renderer隐藏旧标记；不通过文本或“下一条事件”猜来源。ASR校订不自动创建历史Conflict。

bootstrap先持久固定ID，通过plugin来源上下文启动首轮，没有human rpcId，不计为口述回答。采访preset预载紧凑SKILL，五份参考只读白名单渐进加载；无shell/fs/Git/network工具，无Phase3抽取/智能支线。

## 已执行证据

| 门禁 | 观察结果 |
|---|---|
| 插件 `pnpm check` | Host/Client typecheck、16项Node tests、声明/esbuild通过；Docker内再次执行通过。Phase1校订/跨会话/去重/支线5答/冷恢复/原件恢复/SQLite/记忆来源/speaker全部保留 |
| 浏览器主链 | Chromium真实MediaRecorder、受控fake音频设备、真实二进制上传和容器FFmpeg；**ASR/模型/TTS均显式dev fixtures**。原文“一中”→手工“六中”→native submit，raw/edited/source对应正确；bootstrap人类计数0；刷新不重播；自动TTS请求2次，page errors 0 |
| 第二轮/播放 | 原生纯文字第二轮，无音频/rawASR；显式子女speaker。强制autoplay拒绝后出现播放按钮，录音被禁用，手动播放与再听通过 |
| 老人profile | 无fixture按钮/route（404）、UUID、系统提示词和工作区权限chip；既有会话不自动朗读。真实录音/FFmpeg后缺腾讯配置，原件仍在，重新识别明确失败；2原件+2派生物全部hash正确，没有新增转写 |
| 重启 | 2条转写、2个media ID/hash在容器restart前后相同；实际读取文件验证SHA-256；原件与WAV分开 |
| Compose | build/up/health/restart/stop实际执行（最终SIGTERM退出0、无OOM）；UID/GID10001、目录0700、DB0600，named volume→/app/data，宿主127.0.0.1:3082（测试覆盖端口），容器0.0.0.0:3080。无认证Web401、带cookie跨站POST403；health不调云 |
| 三种模型协议 | openai-responses/openai-completions/anthropic-messages分别用无效测试key配置，启动healthy；模型请求由fixture接管，**仅配置验收，非实网**。公开pi-ai路由/凭据引用，无第二套provider框架 |
| FFmpeg/音频 | WebM/Opus→WAV实际属性检测，坏输入/超时保留原件测试通过。两个合成MP3拼接由Chromium解码为2.0909秒；不是腾讯音质或全部浏览器证明 |
| 打包/文档 | frozen锁1572 registry版本/integrity不变；180本地Markdown目标有效；格式、脚本语法与git diff检查通过；SDK37项许可无缺项 |

浏览器脚本：[主链](../scripts/smoke-phase2.mjs)、[第二轮](../scripts/smoke-phase2-followup.mjs)、[老人/失败](../scripts/smoke-phase2-elder.mjs)。主链要求**独立空测试卷**、dev+probes+SPEECH_FIXTURE、127.0.0.1:3082；从私密`/tmp/laorenyun-phase2-host-private.log`读取原生启动链接，不打印token。`PLAYWRIGHT_CHROMIUM_EXECUTABLE`可指定已有Chromium，默认使用Playwright安装路径。副脚本沿用主链在`/tmp/laorenyun-phase2-browser`留下的私密状态。截图/录音/浏览器凭据不入Git。

## 失败窗口与对抗审查

| 窗口 | 耐久内容 / 恢复 |
|---|---|
| stop/upload前 | 停止后的Blob在IndexedDB，Host回执后才移除；录制中刷新尚可能失去未停止部分，页面警告。stop超时/异常/上限保存已收部分并标不完整，不自动ASR |
| 原件发布、数据库登记中断 | manifest journal启动对账，同ID/hash重试，不伪成功 |
| FFmpeg/Flash失败 | 原件不覆盖；失败attempt可显式重识别，复用已有派生物；不自动重复计费 |
| ASR成功但草稿未注入 | succeeded attempt/raw text已保存；恢复识别文字，不自动发送 |
| 编辑/刷新/原生提交失败 | Host草稿revision CAS；Source不丢；接纳以最终native text为准 |
| 领域receipt与DSH日志窗口 | 按message/rpc ID对账domain-accepted/session-observed，UI提示不重复发送；无跨库事务，不把session-observed当独立fsync证明 |
| 模型或TTS失败 | 人类输入/助手文字各自保留；只重试所需步骤，TTS失败不触发重发真人答案 |

审查修复：自动朗读改用公开live human append而非不可靠的input中间phase；录音Source在reserve时固定；并发draft在worker内拒绝；失败重识别复用派生物；reply相同ID不每秒重写；录音stop异常保留已收块；错误响应结构严格校验；补齐SDK遗漏许可；删除模块文档中的旧预算/分片草图。零dsh-talk代码复制，老人无调试能力泄露，runtime数据/.env不跟踪。

## 尚未关闭的验收

- 真实腾讯Flash/TTS：本机生产TTS成功（2753ms），普通Flash引擎16k_zh成功（7.02秒合成音频，613ms，27字）；16k_zh_en大模型引擎因不适用普通免费包返回4004。AppID已由用户修正。尚未完成容器内真实语音全链或人工音质/口音验收。
- 真实LLM：三个配置路径可启动；尚无付费模型在Docker里完成真实采访回答，不能评价提问质量。
- 实体麦克风、普通话/地区口音、Safari/手机HTTPS：当前只有Chromium受控设备。未提交私人录音，不报告准确率或方言覆盖。
- 原件与规范化音频的精确时间对齐未证明；ASR时间目前属于规范化坐标。Phase3引用不得声称已有精确原件逐词定位。

后续应先提供私密凭据路径及自愿录音样本，完成真实两轮采访/朗读/重启验收，再宣布进入Phase3。已有实现可以开展代码审阅，但实网门槛不能跳过。

所有临时验证容器最终停止；隔离测试卷保留用于复核（仅合成素材），未执行volume prune。Agent未改写普通项目`.env`；用户自行补充的私密配置不入Git。

## 首次补齐凭据后的实网检查（历史记录）

三个标准腾讯字段均非空、无重复项，SecretId/AppId格式符合客户端要求；`.env`权限0600。没有记录任何密钥或账号数值，也未修改用户配置。

- 本机生产TencentTtsProvider调用失败；使用同一官方SDK的最小TextToVoice请求进一步确认错误为 `UnsupportedOperation.PkgExhausted`。按照[腾讯错误码说明](https://cloud.tencent.cn/api/error-center?product=tts)，含义是资源包余量已用尽。没有成功合成音频，不报告音质/成功时延。
- Flash生产provider用一秒合成静音WAV做鉴权/协议探针，HTTP200但业务code4002；脱敏message明确要求检查输入AppID与实际访问AppID是否一致。不是有效语音准确率测试，也没有成功转写。应核对[API密钥管理页](https://console.cloud.tencent.com/cam/capi)的账号AppID，见[Flash官方定义](https://cloud.tencent.cn/document/product/1093/52097)。
- 当时两个条件均未解决，因此停止重复调用，未启动Docker真实云全链，也未开通付费或购买资源。后续状态以下方补测为准。

## 领取TTS资源包后的补测

同日，读取用户更新后的私密配置，未修改.env。实际字段名为 `TENCENTCLOUD_APP_ID`；无同名重复项或进程环境覆盖。

- **TTS成功**：生产TencentTtsProvider / TextToVoice，voice101001、speed -0.5、volume 0，固定非私人首问合成为28080字节MP3，单次请求2753ms。该结果证明此音色配置可调用，不代表三个资源包或全部音色均验收。
- **规范化成功**：同一合成MP3经生产FFmpeg模块转换，ffprobe确认 `pcm_s16le`、16000Hz、单声道、7.020秒；MP3和WAV分别保留在本机临时私密目录。
- **当前配置Flash失败**：相同WAV、engine16k_zh_en，HTTP200/code4002，响应明确为AppID不一致。
- **只读身份比对**：调用官方CAM [GetUserAppId](https://cloud.tencent.com/document/api/598/70416)，返回AppId与.env值不相等，Uin与OwnerUin也不相等（子账号密钥）。仅输出比对布尔值，未记录账号数值；官方返回AppId存于本机0600临时文件供用户核对。
- **临时替换AppID后的Flash失败**：只在测试进程中使用CAM返回AppId，生产签名/请求保持不变，错误转为HTTP200/code4004，message为resource pack exhausted。按[Flash错误码](https://cloud.tencent.cn/document/product/1093/52097)，这是资源包耗尽；仍需可用于该ASR接口的额度。没有成功转写，不能报告准确率或识别成功延迟。
- 未修改密钥/权限、未开通后付费、未购买资源、未启动新的容器。模型凭据仍空；真人麦克风/地区口音及Docker真实两轮采访门禁继续待验。

实际命令：`node --env-file=…/.env --input-type=module` 调用生产TTS/Flash与官方SDK只读CAM接口；`ffprobe -v error -show_entries stream=codec_name,sample_rate,channels:format=duration -of json` 检查合成派生WAV。临时诊断包装只输出状态码/脱敏消息，不输出签名URL、密钥或原始账号响应。此次仅更新证据文档，没有变更生产代码，不重复执行既有构建/离线套件。

## 免费包适用引擎对照：普通Flash实网通过

用户提供当月「录音文件识别极速版免费包5小时」余额100%的控制台记录后，核对[官方计费分类](https://cloud.tencent.com/document/product/1093/35686)及[Flash引擎参数](https://cloud.tencent.cn/document/product/1093/52097)：16k_zh_en属于大模型1.0版，该类别无常规免费额度；普通极速版每月5小时。此前仅从4004推断用户没有极速版免费包，结论不完整；应区分请求引擎可用额度与账号全部资源包余额。

用户已修正AppID。保持同一密钥/AppID、7.020秒合成首问WAV及其他参数，仅在测试进程切换引擎为16k_zh：HTTP200/code0，生产provider完成解析，耗时613ms，结果27字、1段，包含出生与年份问题关键词，返回durationMs=7020。原默认16k_zh_en请求仍为4004。该对照与官方计费说明一致，不需要据此要求用户再次领取已有的普通免费包。

本次只读验证与文档修正；没有改写.env或自动回退引擎。要使用现有普通免费包，可由管理员配置 `TENCENT_ASR_ENGINE=16k_zh`；大模型引擎需要对应额度/计费配置。单条清晰合成语音成功不是老人真实口音准确率证明；当前普通引擎结果也不能替代大模型引擎验收。
