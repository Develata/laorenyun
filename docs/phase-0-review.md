# Phase 0 对抗式审查与交接

日期：2026-09-15。审查对象：两仓当前文档、契约草图和固定上游源码。由本任务执行者进行对抗式自审；没有独立审查Agent，不把自审称为盲审。**Phase 0交付是设计，所有P0产品功能仍未实现。**

## 结论与 Phase 1 入口

可以进入Phase 1，先实施[ADR-0013](adr/0013-dsh-integration-seams.md)的G1–G3最小集成验证，然后实现存储/语音闭环。没有证据要求放弃DSH或引入第二套运行时。G1–G3未运行通过，不能跳过它们直接宣称完整采访链可靠；失败时按ADR收窄接入或记录具体阻塞。

## 对抗式发现及修正

| 风险 | 最终约束/修正 | 权威位置 |
|---|---|---|
| 原生发送清稿与领域入库非原子 | pre-step不能冒充pre-submit；持久draft镜像、binding/message ID对账，所有键盘/失败路径列G1 | ADR-0013、插件interview |
| 子会话“5次”仅靠prompt、重启清零 | Host事务计数/去重；第5答后closing屏蔽原始模型输出/TTS，只接收memo；partial保底 | 03、插件interview |
| 创建/中断/恢复DSH子会话被理想化 | exact live parent、reserved childId、真人prompt、interrupt非quiescence；G2先验证 | 插件interview |
| 旧ASR覆盖新草稿/静默身份漂移 | session+generation+lease，显式speaker快照，迟到结果归档 | 05、07、插件contracts |
| 文件与SQLite两种存储产生丢失窗口 | fsync/rename/journal/receipt，对账而非假跨库事务；partial与complete区别 | 插件memory |
| SQLite同步busy冻结Host/worker超时后重复写 | 单DB worker、有界队列，operation决定是否提交，异常不等于rollback | ADR-0004、插件memory |
| 普通文件接口5MB迫使分片/公网URL | 按用户文档目录改选Flash整段HTTPS，明确不是实时V2/云API3.0 | ADR-0006 |
| Flash响应丢失/无限重发/重复计费 | unknown状态、显式重试、有限真实socket截止；不虚构远端TaskId | 插件speech |
| WebM不受支持/时间映射被假设为0 | 保留原件，FFmpeg规范化，映射编码延迟/起点，不能伪造词级出处 | ADR-0012、插件speech |
| MIT根文件覆盖Apache/二进制许可 | dsh-talk不复制；SDK/FFmpeg/DSH闭包分别审计，禁盲发完整workspace | THIRD_PARTY_NOTICES、research/dependencies |
| Docker监听与CLI冲突/删除访问保护 | profile配置host0，宿主回环绑定，保留token/cookie；G3真实容器验证 | ADR-0011 |
| 手机HTTP麦克风/字号超出上游schema | HTTPS条件显式；18–20px作用域CSS，不写非法theme设置 | 06、10、ADR-0013 |
| LLM事实幻觉/Persona身份模拟 | 字段依据、确认/冲突状态、renderer事实清单和人工语义核对；Persona仅HOW | 04、07、08、09 |
| 过度图本体/重复owner/额外服务 | 四类edge，来源/冲突专表，一个插件、一进程；产品与字段规范分owner | 02、04、插件contracts |
| 导出混用章节修订/把文件清单当完整备份 | biographyGenerationId固定整本manifest；媒体included标识；P0非全备份 | 09、插件contracts |
| 有限API但后台任务/缓存无限积累 | 请求/操作总预算、队列上限、原件与可回收缓存分离，容量拒绝新输入 | 10、插件speech/interview/memory |

## 要求覆盖索引

| 需求组 | 入口 |
|---|---|
| 两仓职责、Context Control Plane、DSH pin、升级、TS | README/AGENTS、02、ADR0001–0004、research/upstream |
| 产品、课程、Web用户、P0/P1/out与14个不变量 | 00、01、02 |
| 腾讯三文档、dsh-talk源码/三策略、录音/草稿/TTS | 05、ADR0006/0007/0012、research、插件speech |
| 采访实践/第一访谈/skill/Main/Branch/调度 | 03、ADR0008、插件interview |
| 六要素、时序、漂流、cross-links、工具、直接纠错 | 04、06、07、插件memory/contracts |
| original/raw/edited、speaker、冲突、出处 | 07、ADR0009、插件contracts |
| Persona研究/显式P1/第一人称/导出 | 08、09、ADR0010 |
| theme/slots/两个profile/确定性UI/图片P1 | 06、插件ui、research/upstream |
| SQLite/依赖复用/许可/容器/隐私/有界恢复 | 10、ADR0004/0011/0012、NOTICES、research/dependencies |
| 测试/实证边界/下一阶段门槛 | 11、插件testing、ADR0013、本文件 |

全部要求的14个主要契约在[插件contracts](https://github.com/Develata/dsh-laorenyun/blob/main/docs/contracts.md)，仅文档内TypeScript，无生产实现。额外Media/Source/OperationContext是表达出处/错误/生命周期所需，未扩展成框架。

## 仍影响 Phase 1 的不确定项

1. G1原生发送与durable输入恢复、单席位block组合；G2真人子会话冷恢复与第五答关闭；G3非root容器profile/监听/访问保护。都有固定源码依据，但尚无运行证据。
2. 腾讯账号是否开通Flash大模型1.0和目标TTS音色、主要口音及真实时延/准确率。选择已明确，无需再做泛栈选型；首次授权真实调用才确认参数/费用适用性。
3. Chrome/Safari原件转换的编码延迟、实际设备麦克风/播放行为；默认本机部署不代表手机HTTPS链已验收。
4. 最终镜像的基础digest、FFmpeg构建配置/source hash、DSH实际runtime闭包及其许可。未构建前不能填写假的已验证值。

persona/ZIP是明确P1，不阻塞Phase1。Linux-VM-Init不可访问也不阻塞，不用未读内容作为证据。

## 本次验证记录

验证：

- `python3 /tmp/laorenyun-phase0-research/check_docs.py`：两仓要求文件、13份ADR、14条不变量、14个必需契约、Markdown围栏/空白/冲突标记及143条本地/跨仓文档链接通过；35条关键DSH源码路径存在。初次检查找到theme-settings路径层级错误，已改正后复查。
- `node /tmp/laorenyun-phase0-research/typescript-validation/package/bin/tsc --strict --noEmit --target ES2022 --lib ES2022,DOM /tmp/laorenyun-phase0-research/contracts.ts`：文档草图拼合独立类型检查通过。编译器TypeScript 5.9.3在临时目录，npm官方tarball SHA512完整性已校验，没有给项目安装依赖。
- 两仓 `git diff --check` 通过；新文件未stage，另由上述脚本覆盖所有新文档的空白/冲突标记。`git status --short --branch`及`git remote -v`核验工作区与origin，保留插件原有LICENSE。
- 研究使用 `git rev-parse HEAD` / `git show` / `rg` / 源码读取、官方文档浏览与标准库HTTPS抓取；腾讯三份用户链接均实际读到正文。Linux-VM-Init访问失败已列账本，未冒充成功。

未运行：DSH/plugin构建、真实浏览器、腾讯/LLM调用、SQLite业务测试、Docker镜像/Compose/性能测试；本阶段无这些生产实现、未配置云凭据。Typecheck只证明草图类型自洽，不证明DSH API集成可用或协议可运行。没有git commit/push、发布或修改远端。

研究工作目录为 `/tmp/laorenyun-phase0-research/`，仅只读上游checkout、网页正文和一次性文档/校验工具；没有运行云API、业务spike或生成最终镜像。仓库中没有production src、package manifest、Dockerfile/Compose。文档中的未来命令和类型不代表已实施。
