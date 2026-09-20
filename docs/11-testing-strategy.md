# 验证策略

> 当前产品边界见 [v0.2.0](release-v0.2.0.md)。本文件描述现行约束；标为历史的段落保留早期语境，硬件与质量承诺以实际证据为准。

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

## 历史扩展性能目标（未作为v0.1.0承诺）

10,000 节点/50,000 文字段的本地单人生测试档；分页查询 p95 <200ms，可见河流≤500节点，采访入口不全量读档；云 ASR 120秒录音 p95 目标≤30秒仅为体验指标，超过需评估接口，不当作供应商 SLA。Host health 在识别/导出期间应持续响应。记录硬件和样本分布；没有测量不报告达标。

后续每次变更只跑受影响检查；上游升级先执行窄 seam tests，再跑产品关键路径。真实演示必须标出使用的 API 和实际返回，不用 fixture 冒充。所有录屏/回执遮蔽密钥和启动 token。

## Phase 2.5真实门禁

当前实网与恢复证据统一见[Phase2报告](phase-2.md#phase-25真实云与恢复补验2026-09-15)。后续profile变更须检查实际被DSH读取的agent.cordis.yml及会话system/message包含口述史技能；只有fixture回答正确不能证明preset加载。R1真实模型/腾讯容器调用与程序输入恢复已测，R2实体麦克风及真人两轮后的R3必须人协助，不用合成文件关闭。

Phase 3 确定性/真实模型证据由[phase-3](phase-3.md)汇总；schema-only Phase2 fixture迁移、worker冷恢复、引文校验、CAS、图约束、冲突、五答支线及拒谈调度均必须回归。普通CI不得默认触发真实付费模型。

## Phase 4 已执行范围

[发行报告](phase-4.md)区分42项自动检查、真实模型、Chromium尺寸/缩放、原生纠正、离线文件和实际restart。Phase2实体硬件仍pending，原件↔归一化逐字时序、Safari/手机HTTPS尚未验证；不得扩大通过声明。

v0.1 课程验收采用500节点/1051修订规模，保留于[历史发行](release-v0.1.0.md)。当前 v0.2 RC6 使用1000节点、700有日期/300漂流、2102关系、50 BranchMemo 进行有界投影验证，计量见[v0.2证据](v0.2-redesign.md)。上述10000节点目标仍未测。

## 分发工程检查

普通 Distribution CI 运行上游/发行校验、配置与发布脚本确定性测试、Docker 构建及本地健康/重启，不持有 registry 写权限。标签流程另运行真实 Chromium 的无云冷启动/文字来源持久化和实际镜像源码材料门禁；缺材料应失败并跳过 publish。具体流程与失败状态由[发布操作](12-release.md)拥有。
