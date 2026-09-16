# Laorenyun v0.1.0 课程源码发行

Owner：本文件是最终发行事实边界。Phase1–4历史报告保留，当前实现规范在各owner文档。日期2026-09-16。

## 状态

软件验收通过，课程源码发行就绪；实体硬件验收独立保留待办。最终标签只在本文件所在提交的CI通过后创建。

**PASS WITH DOCUMENTED HARDWARE VALIDATION PENDING — course release ready**

- Phase3：PASS；Phase4：PASS。
- **R2 physical microphone: PENDING**。
- **R3 physical-human recovery: PENDING**。
- WSL无可访问实体录音输入，未用合成声音替代。作者步骤见[演示](demo.md)。

## 发布审查与修复

1. JSON请求在缓冲之后限制大小：改为streaming，80KB/10秒后再做20k字符约束。
2. GENERATION_LIMIT被统一“稍后重试”掩盖：明确显示单次容量上限，保留旧版本。
3. 未报告MIME时错误标WebM：取实际chunk类型，否则未知类型明确失败。
4. schema/发行标签/当前文档陈旧：当前schema5，镜像0.1.0，历史报告不重写。
5. 空卷demo依赖未创建的DSH profile link：改为不依赖DSH运行模块的独立fixture CLI，包外孤立启动已验证。
6. 不可能的部分凭据/协议/timeout/老人fixture配置提前拒绝。空模型+空腾讯允许本地health-only启动，不启用fake云服务。
7. 浏览器发现Renderer顺序可偏离Planner：发布正文按验证后的章节nodeRefs顺序组装，反序模型输出回归通过。
8. 首次真实CI/干净clone暴露上游`.cmd eol=crlf`检出与原LF Git blob比较不一致；校验器只还原该上游声明的换行变换，仍逐文件比对固定blob，不修改上游。
9. 无CI/可复现demo：每仓一个无云密钥CI，独立空卷合成种子与5–8分钟演示。

## 本机回归与规模

插件43项tests、Host/Client typecheck/build/format通过；发行配置4项tests通过。新增恶意证言作为data、HTML转义、AAC/MP4与Ogg/Opus/MP3真实FFmpeg转换，原有WebM/Opus、五答/冷恢复、CAS、冲突、WHAT/HOW保持。

合成规模：500当前节点、1051历史修订、1051来源/转写；有开放/已解决冲突、支线memo和多代派生产物。所有写入通过领域操作；模型为明确fixture。Node24.18.0/WSL单次计量（非SLA/p95）：

| 操作 | ms |
|---|---:|
| SQLite worker启动 | 34.60 |
| 填充规模数据 | 2102.42 |
| 长河初次500条 | 19.68 |
| 年代查询 / 翻页 | 3.93 / 6.60 |
| 单节点来源深读 | 0.67 |
| timeline search | 1.60 |
| scheduler | 25.65 |
| Persona本人80段清单 | 2.22 |
| 超限新自传拒绝 | 2.18 |

进程maxRSS约110MiB（Node与worker所在进程，非全容器峰值）。小档案固定自传清单+fixture章节约23ms，三文件发布约22ms，单纯渲染约0.53ms；不是云模型速度。大档案不会截断生成新自传；仍可导出此前8节点有效版本（JSON约26KB/HTML4.3KB/Markdown1.45KB），不是整个500节点的备份。

单次生成上限200当前节点/1000历史修订/500来源/150万清单字符；Persona最近80段本人、每段模型最多1200字。超过明确失败，不增加复杂批处理服务。长河最多500可见，来源按需10条，模型上下文有界。

## 安全与隐私

原件/文字/图存本地；腾讯处理音频与朗读文本，模型处理采访/抽取/派生所需文字。不是离线AI或云零留存。`.env`不入镜像/Git；DSH原生启动日志含秘密访问链接，需私密保存。

全历史扫描（发行前复查）：应用11209 blobs、插件318 blobs；比对3个本机秘密值及高置信度Tencent/模型key模式，无命中。模式扫描不能证明绝对无秘密。生成HTML静态转义/CSP禁止网络；没有模型shell/fs/任意SQL权限。路径为opaque IDs，FFmpeg无shell/固定argv/有限时长输出，原件不覆盖。

## 许可与镜像

仅源码发行及本地构建，**无GHCR公共镜像**。FFmpeg Debian7:5.1.9-0+deb12u1含GPL，libvips含LGPL/MPL闭包，对应源码交付未完成，不发布不完整二进制。实际清单和检索命令见[licenses/release](../licenses/release/README.md)。MIT只覆盖原创内容。

Node镜像digest、DSH和插件SHA、npm包版本/integrity固定；OS包仍依赖Debian仓库可获取性。不承诺bit-for-bit重建，也不称全部OS传递依赖已冻结。

## 已知限制

实体麦克风/真人恢复待验；普通话地区口音覆盖有限。Safari/iOS、手机HTTPS仅以实际执行范围声明。无原件↔归一化逐字精确同步、照片采访、ZIP、导入恢复。实体合并保守；抽取不等于历史核实；自传采用受限原话编排，风格变化有限。三文件导出不是完整备份。

## 运行与演示

[README](../README.md)为新使用者入口；[部署](10-deployment.md)解释私密访问、卷和配置；[demo](demo.md)含独立项目、离线预生成与网络中断备用。

## 浏览器、真实云和安全实测

Chromium真实浏览器（非实体麦克风）：新会话首问27字、真实TTS返回；另外两轮合成原生文字输入，openai-responses/gpt-5.6-luna，回复32/49字，等待9009/7022ms，TTS200且6128/4285ms。追问一个主问题、保留年份不确定性；不据此声称模型整体准确率。合成重复上下文抽取出现UNSAFE_MERGE和UNSUPPORTED_STATED各一次，证言保留/采访继续，未用后续模型静默修复。

长河打开约96ms（小demo，单次）；1280/768/360px无水平溢出，键盘选中、出处2段、取消纠正、Persona/自传/三下载通过。CSS2倍和独立Chrome真正200%缩放分别检查；后者devicePixelRatio2、innerWidth640/outerWidth1280、CSS zoom1、长河584/584，无溢出。reduced-motion开启功能完整，不声明WCAG认证。下载HTML断网打开、网络请求0、内部锚点全部可解析。老人UI没有UUID或marker，刷新无旧TTS自动播放。

实际WebKit26.5已下载，但启动缺少libmanette/libenchant/libhyphen/libsecret/libwoff2dec/libGLESv2等系统库，未执行UI验收；真实Safari/iOS/手机/HTTPS硬件未测。没有关闭浏览器安全机制。

实际容器请求：未认证401、恶意Origin403、超大JSON400、非法导出路径400、elder probe404、health200。合成卷restart前后9类表count/hash及原件hash一致，SQLite integrity ok/FK0/schema5；这是程序合成采访恢复，不关闭R3。

## CI与交付检查

插件最终代码976917e710bfc41cfd69e13f9adb6f31e581138b的Actions已通过（43项全量检查）。应用CI实际经历换行与缺少js-yaml两次失败：后者通过把packaging校验留在已有frozen Docker构建内解决，不为CI另外安装整套依赖；build前建立无密钥.env.example副本。第三次执行35089385992通过，包括完整Docker build、老人profile本地health、401、非root与restart。普通CI不需要云凭据。

新增许可证原文中Koffi第6行保留上游尾空格：原创diff检查通过，不为消除提示改写许可证原文。

## 干净安装与最终规模复核

从GitHub重新clone到空目录，固定插件976917e710bfc41cfd69e13f9adb6f31e581138b，使用私密运行时.env，执行docker compose build/up --wait。新project `laorenyun-release-fresh` 的空卷首次启动healthy、UID/GID10001、cap_drop ALL、no-new-privileges，127.0.0.1:3086映射3080。新浏览器显示“开始讲我的故事”和空长河，无自动演示数据。

独立 `laorenyun-release-scale` 容器也从空卷通过合法领域操作生成500节点/1051修订/1051来源。容器内worker启动154ms、river18.56ms、period3.45ms、page6.08ms、source0.66ms、search1.46ms、scheduler37.14ms、Persona清单11.4ms、超限自传拒绝2.23ms；maxRSS约103MiB。构造全部记录约57.9秒（与其它镜像构建并行的卷写入），不把本机2.1秒构造时间冒充容器成绩。restart前后领域表hash/原件hash一致。

实际镜像license index与已提交535个npm元数据条目/290个Debian包一致。Docker Scout1.24.0生成标准SPDX2.3 SBOM，独立随源码Release附上；不是手写SBOM，不嵌入镜像。没有上传二进制容器。

最终Chromium空安装打开约600ms；500节点容器长河约395ms，500个SVG圆点、3002个SVG子元素、文字列表每页30条。翻页、2段出处、360px（304/304无横向溢出）、刷新无旧TTS/技术ID通过。响应式测量等待侧栏过渡稳定；没有用过渡帧误报替代最终布局。
