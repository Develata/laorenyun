# 依赖选择与许可审计

Owner：本文件拥有拟引入依赖的取舍、成本和观察版本。审计日期 **2026-09-15**；Phase 0 没有安装/分发以下运行依赖。发行时以冻结 lockfile、实际镜像闭包和二进制配置重审，不能把此表当完整 SBOM。许可分发边界见 [THIRD_PARTY_NOTICES](../../THIRD_PARTY_NOTICES.md)。

| 项目/候选版本 | 用途、替代与不自造理由 | 维护/许可 | 运行成本与集成复杂度 | 选择 |
|---|---|---|---|---|
| DSH 0.1.6-alpha.1，commit见ADR-0001 | 已有会话、Agent、工具、LLM、Web；替代是重写同类基础设施，违背既定基础 | 当前活跃、pre-stable；MIT，DeepSeek 2026 | 大workspace、上游native addon、provider闭包；窄adapter升级成本中等 | 固定源码，复用官方插件面 |
| Node 24.21.0 LTS | TS发行运行时；不用额外Python/Rust服务 | LTS；Node自身MIT及捆绑第三方许可 | 单进程+一个DB worker；镜像携带runtime | 使用；完整保留Node许可文件 |
| node:sqlite / SQLite | 关系/事务/索引与FTS已有实现；不手写存储引擎 | Node API stability1.2 RC；SQLite public domain | 无额外npm binding；同步调用需worker隔离，ABI跟Node | 使用，Node精确固定；[文档](https://nodejs.org/download/release/v24.21.0/docs/api/sqlite.html) |
| better-sqlite3 13.0.3 | node:sqlite不满足已证实能力时的薄替代 | 活跃，MIT；Node≥22 | 原生编译/prebuild、额外ABI维护，同样同步 | 不引入；[原仓库](https://github.com/WiseLibs/better-sqlite3) |
| ORM / Neo4j / PostgreSQL | 当前表数量少、单writer、无远端多人事务；SQL足以表达 | 不作产品选型 | ORM迁移/抽象、独立服务超过消除的代码 | 不引入 |
| tencentcloud-sdk-nodejs-tts 4.1.237 + common 4.1.220 | TTS签名、模型和错误协议；比重写云API3.0可靠 | 官方持续发布，Apache-2.0；[固定SDK](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/tree/302b36cc91481d7851fbb070066dd31b04aedcec) | Host-only分包；common上游使用星号，发行lock必须固定；有限signal/deadline适配 | 使用；不导入整套云SDK |
| Node https/crypto（ASR Flash） | 官方Node SDK未覆盖Flash；Go/Java/Python SDK会新增运行时；小协议适配复用标准TLS/HMAC | Node维护；协议依据[Flash文档](https://cloud.tencent.com/document/product/1093/52097) | 流式HTTP无base64整段副本；需签名测试、错误映射、截止时间，成本低至中 | 使用窄adapter，不手写密码算法 |
| Tencent ASR Node分包4.1.310 | 普通CreateRecTask/SentenceRecognition | 官方Apache-2.0 | 不覆盖已选Flash，装了仍需adapter | 不引入；保留后备研究 |
| FFmpeg 9.0.1（候选构建源） | 浏览器WebM/MP4→mono16k WAV；替代浏览器自造PCM/重采样成本和移动端负担更高 | [官方稳定源码](https://ffmpeg.org/download.html)，默认LGPL-2.1-or-later；GPL/nonfree选项改变分发条件 | 独立受限子进程，短暂CPU/磁盘成本；构建与许可配置成本中等 | 仅必要demux/decoder/resampler，禁GPL/nonfree；固定源码hash/构建清单后发行 |
| d3-shape 3.2.0 + d3-path依赖 | 成熟SVG曲线路径；比自己写曲线算法可维护 | 成熟模块，ISC；[官方源码](https://github.com/d3/d3-shape/tree/v3.2.0) | 小模块，浏览器按可见节点绘图；无需全量D3 | 使用候选，Phase1量测bundle |
| d3-scale 4.0.2 / React Flow | 线性月→弧长只需算术；不是节点工作流编辑器 | d3-scale ISC，模块成熟 | d3-scale多项传递依赖；编辑器交互/体积超需求 | 不引入；native SVG弧长API+已有React足够 |
| React/Cordis/Schemastery/Typert | UI、插件生命周期、边界schema、Remote | DSH已选；具体版本/许可沿DSH lock和原notices | peer/singleton复用，禁止打包第二份React/DSH runtime | 复用，不自建事件总线/状态框架 |
| Markdown/HTML rendering | UI沿DSH ui-primitives；源码parse.ts用mdast/micromark，已有功能不重写 | DSH MIT及其lock/notices；模块成熟 | 上游renderer带math/highlight等，不为静态导出带整套React运行时 | HTML从已校验BiographySection结构直接转义为heading/paragraph/脚注模板，不手写Markdown parser；P0不支持任意Markdown转HTML |
| ZIP | P1便携包 | 尚无运行依赖 | 必须限制路径、大小、流式处理 | P1选择成熟轻量ZIP库，不自造格式；P0 UNSUPPORTED |

## 研究过但没有复用源码的项目

| 项目 | 证据/许可 | 可取模式 | 不采用原因 |
|---|---|---|---|
| [dsh-talk](https://github.com/PerryLink/dsh-talk/tree/6ec13dafe1da5e592908afa4dbc29fd3c30b0c23) | LICENSE Apache-2.0，源码审查见[upstream](upstream.md) | MediaRecorder释放、composer slot、播放与remote | 多本地引擎、自动提交/打断/播报面过大；不拥有不可变历史原件 |
| [aeonfun/soul.md](https://github.com/aeonfun/soul.md/tree/98b3b24a7232725bbbe76e2ce0de128ba197b377) | MIT，2026 Aeon Inc.；读取BUILD.md/STYLE.template.md | 分文件文风与示例 | 身份/世界观/意见推断不符合事实约束，只研究格式，不运行/复制其指令 |
| [OpenClaw workspace](https://docs.openclaw.ai/concepts/agent-workspace) / [license](https://github.com/openclaw/openclaw/blob/main/LICENSE) | 观察MIT；文档为滚动版本 | SOUL.md是显式行为引导文件 | 不是凭证据蒸馏的可靠性证明；不为几个Markdown文件引入大Agent平台 |
| [Tencent speech-go](https://github.com/TencentCloud/tencentcloud-speech-sdk-go/tree/257f9f56bcd592bff1faea9b4ce0f1ef90cea803) | Apache-2.0，flashrecognizer.go | Flash签名/响应字段交叉核验 | 仅协议参考；不导入Go运行时、不照搬其600秒默认等待 |
| [Tencent speech-js](https://github.com/TencentCloud/tencentcloud-speech-sdk-js/tree/30d9634cdf8081cfbaeb51558f88905b49c9a345) | 检查快照未见根LICENSE，不能假定MIT/Apache | 浏览器实时语音示例 | 非Node Flash方案；无授权复制结论 |

“当前流行”不作为可靠性证据：上述persona项目说明活跃的文件式实践，不宣称已做全市场热度排名或其生成结果可信。老人云不新增persona运行依赖，不下载权重。

## 资产与服务

图标先用DSH既有原语并保留其依赖notices；Phase0无新增图标包。字体先用系统字体栈，不分发字体文件。未复制图片、纹理、示例真人音频或模型权重；以后每个下载资产单独记录来源、许可和再分发权，代码许可证不覆盖模型/资产。腾讯云服务的计费、隐私、数据处理和使用条款独立于SDK Apache许可；TTS生成音频也不能自动宣称MIT资产。不得把真人访谈作为公开测试fixture。

## Phase 1 实际增量

- 运行新增通用依赖：无。node:sqlite、worker_threads、crypto、fs 属 Node；DSH/Cordis/React 沿用 pin，领域不依赖腾讯/ORM。
- 构建工具 TypeScript 6.0.3（Apache-2.0）、esbuild 0.28.2（MIT）、Prettier 3.6.2（MIT）沿用成熟编译/格式化能力；各自精确锁定，仅开发/构建依赖，较手写模块打包与声明生成维护成本低。pnpm 11.7.0 与 DSH 一致。没有新增通用运行框架。
- SQLite 同步调用只在唯一 worker；没有 native npm binding/ORM 安装成本。图/河流/语音包仍未安装。
- 实际运行 npm 闭包、Web 打包依赖许可证与 native sharp-libvips 条款见 [THIRD_PARTY_NOTICES](../../THIRD_PARTY_NOTICES.md)。冻结锁原 registry 1572 项未改版本/integrity，镜像 npm 实际闭包为 514 个不同 package/version。
- Playwright 使用上游已有开发依赖和本机已有 Chromium，不进入运行镜像。
