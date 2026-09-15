# Phase 2 发行与验收

日期：2026-09-15。状态：**实现和离线/容器门禁已交付；真实云、实体麦克风与口音验收未完成，不能宣布Phase2全部通过或Phase3就绪。** 已读取用户指定的本机.env，仅TENCENT字段有SecretId形状的值；标准SecretId/SecretKey/AppId与模型字段未补齐，实网未调用，不以fixture替代结果。

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

- 真实腾讯Flash/TTS：签名/SDK已实现并有离线测试，但账号权限、引擎16k_zh_en、voice101001/-0.5/0、真实延迟与音质均未实测。
- 真实LLM：三个配置路径可启动；尚无付费模型在Docker里完成真实采访回答，不能评价提问质量。
- 实体麦克风、普通话/地区口音、Safari/手机HTTPS：当前只有Chromium受控设备。未提交私人录音，不报告准确率或方言覆盖。
- 原件与规范化音频的精确时间对齐未证明；ASR时间目前属于规范化坐标。Phase3引用不得声称已有精确原件逐词定位。

后续应先提供私密凭据路径及自愿录音样本，完成真实两轮采访/朗读/重启验收，再宣布进入Phase3。已有实现可以开展代码审阅，但实网门槛不能跳过。

所有临时验证容器最终停止；隔离测试卷保留用于复核（仅合成素材），未执行volume prune。Agent未改写普通项目`.env`；用户自行补充的私密配置不入Git。
