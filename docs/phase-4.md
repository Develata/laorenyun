# Phase 4：长河、纠正、自传与耐久导出验收

Owner：发行、真实模型/浏览器/容器证据及最终结论；[插件报告](https://github.com/Develata/dsh-laorenyun/blob/main/docs/phase-4.md)拥有实现与确定性测试。日期2026-09-16。

**PASS — ready for Phase 5。** Phase 2 R2 实体麦克风、R3 真人采访恢复仍 pending；本阶段全部是合成文字和明确标记的静音WAV夹具，不替代真人门禁。

## 发行边界

生产插件固定 `35a450bf24f0c05c458285b0f881daeeb0d3d703`，见[PLUGIN.json](../PLUGIN.json)。DSH保持 `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720 / 0.1.6-alpha.1`；11,239上游blob一致，零核心补丁；1,572 registry包版本/integrity一致。一个容器、一个SQLite worker、一个卷，schema5。新增[ADR0017](adr/0017-phase-4-derived-generations.md)解释纠正授权、受限renderer、原生SVG和派生状态所有权。

新增代码属于插件；应用只改精确pin、Compose镜像标签和文档。无新运行依赖；d3-shape安装被环境自动审批拒绝，使用固定SVG曲线与浏览器原生弧长API，无自制曲线库。

## 长河与人类纠正

- 使用真实Phase3图表，浏览器6个定时节点、4个漂流节点；按年范围画带，图形仅表示时间。实际主路径长度1106.6809 SVG单位，使用getTotalLength/getPointAtLength线性映射月份。单月零跨度、同月法线分层、年/十年/approximate、漂流排除、同ID再定位有确定性测试。
- 501条数据测试确认单次≤500，年代聚合/分页不丢ID；实际浏览器验收为10节点，不冒充500节点性能基准。SQL直接投影展示字段，选中才深读≤10来源。
- graphRevision变动刷新当前记忆；从自传选择的固定旧revision不被自动换成当前。开放Conflict两侧都有文字提示，不擅自修改node.status。相关线只在选择时显示，不能理解为树或因果时间线。
- 1280/768/360px、2倍CSS布局缩放和Chromium原生200%缩放均无长河横向溢出；reduced-motion正常。实测键盘focus/Enter可选择SVG节点，列表保留大按钮。没有要求拖动。原生缩放实测devicePixelRatio=2、outerWidth=1280、innerWidth=640、CSS zoom=1，长河clientWidth/scrollWidth均584；不外推为所有浏览器组合已验收。
- 详情→原始证言→静音WAV夹具可以加载并播放；1秒、单声道16kHz。只播放整段，不宣称原件与归一化音频逐字同步。

真实纠正案例（合成）：原节点“1978年在合肥六中读书”→“这里不对”→完整新证言“1979年在合肥六中读书”→预览→原生可编辑草稿→原生发送→真实抽取。耗时12,204ms、JSON修复0；同ID新增revision，旧revision保持。新增resolved correction Conflict记录新来源，普通ASR校订不因此创建历史Conflict。句尾标点的展示纠正经测试保留新revision但不增加Conflict。取消预览实测不改节点，长河随后刷新为1979年。

## Persona与自传：真实模型

既有DSH `openai-responses / gpt-5.6-luna`，内部任务无工具，没有另加模型框架。使用合成图：本人/子女来源、年级精度、漂流、1个open学校Conflict、resolved纠正、1个partial BranchMemo。BranchMemo不是Persona或自传的来源。

| 任务 | 固定输入 | 实测结果 | 耗时/修复 |
|---|---|---|---|
| Persona首次 | 9段本人文字，图版本11 | published；发现时间/地点起句、直接称呼、短句 | 21,140ms / 0 |
| Persona复核版 | 10段本人文字，图版本12 | published；不足情绪规律进入unknown | 22,558ms / 0 |
| 无Persona自传 | 图版本12，8个合格节点 | 2章；事实原句、年份和代述保留 | Planner10,535ms；两节6,607/10,684ms；修复0 |
| 有Persona自传 | 相同图版本12/节点修订 | 5章；事实引用集合完全一致 | Planner9,522ms；各节3,946–7,292ms；修复0 |

首轮另有两次五章自传，用于发现章节逆序和无日期被写成“记不清”的问题。累计两次Persona、四次Planner、17次Renderer，即23次成功内部模型返回，JSON修复0；这不是统计准确率。纠正抽取与正常采访调用另计。最终模型输出与验证器匹配；后续最终镜像仅收紧有界读取/元数据和展示，未改变该模型输入/事实输出规则。

Persona只分析本人已提交文字，数据库manifest含来源IDs/hash、route/prompt版本/时间，观察有逐字引文；不夹带家人图数据或BranchMemo。保留两个未送入模型的合成留出句，人工核对时间/地点起句和直接称谓匹配；不能据此推断稳定心理/政治或情绪特征。没有人格分数。

Planner只可用清单内revision，每个可用节点恰好一次；软件保证年代顺序，标题限制中性词组或来源原词。Renderer采用完整原话编排，有Persona时只可加有引文支持的有限转场。故WHAT可逐字核验；它不是自由文学改写。家人证言带“据家人或亲友回忆”，没有擅自声称本人亲历。开放Conflict双方省略，并明确说明仍有不同说法；不选择更流畅的一侧。缺日期用编辑性说明，不替人编造“遗忘”。

## 导出与来源

最终通过正常老人页面按钮下载：

| 文件 | 字节数 |
|---|---:|
| autobiography.md | 2,225 |
| index.html | 6,058 |
| memories.json | 39,517 |

- UTF-8 Markdown包含章节、来源脚注；HTML由结构化Section转义生成，内嵌CSS、无脚本/CDN/远程字体，CSP禁网络。
- Chromium离线模式打开本地HTML成功，网络请求0，内部链接全部可解析；自动测试中的script样本被转义。
- JSON `laorenyun.memories/schemaVersion=1`，固定图版本与自传清单、当前/历史修订、来源、speaker、实体/边/冲突/BranchMemo、可选Persona及生成元数据。媒体hash/逻辑路径与fixture/capture状态保留，全部included=false，没有失效私密URL。它不是完整备份，没有实现导入、ZIP或照片。
- private staging写入→fsync→读回校验/hash→rename→DB发布；失败保留旧good产物。当前验收最终9个派生版本（2 Persona、4 Biography、3 Export）全部保留。
- 对最终三文件检查当前本机配置中的3个非空秘密值，无匹配；内部绝对路径0，远端活动资源0。私密配置和值未输出、未进入镜像或Git。

## 实际浏览器与恢复

最终production插件镜像中执行：长河→键盘选记忆→来源→固定旧自传来源→私密导出三文件→HTML离线→刷新→实际Compose restart→重新打开采访。

刷新/重启前后行级SHA256一致：12 Source/Transcript、10 current nodes、12 revisions、15 source_refs、3 Conflicts、9 derived generations、3 active指针、2 correction intents。WAV夹具文件hash保持；`integrity_check=ok`，外键错误0。历史TTS请求0；采访话筒入口可用，UUID/source marker不可见，浏览器pageerror为0。这里的音频是夹具，不能据此关闭Phase2真人恢复门禁。

镜像 `laorenyun:phase4`，本地ID `sha256:515700c8a760b1fd0ba80dcbdb6b2f9ca6163347220a5c86084f86dead4b1638`。项目 `laorenyun-phase4`，卷 `laorenyun-phase4_laorenyun-data`。`127.0.0.1:3084 → 0.0.0.0:3080`，UID/GID10001，目录0700、DB0600、health healthy。原生DSH访问保护与同源授权路由保留，没有新认证；已授权浏览器验证成功。本阶段没有新增未认证访问探测，不把它算作重新验证通过。

现有Phase2运行环境与.env未覆盖。验收结束停止Phase4测试容器，保留卷；复查启动：`LAORENYUN_PORT=3084 docker compose -p laorenyun-phase4 up -d`，使用DSH原生秘密访问链接。镜像没有推送公共registry。

## 实际执行的验证

- 插件 `pnpm check`：typecheck + **42 tests passed** + build；`node --test tests/derived.test.ts`：9 passed；`pnpm format:check`；`git diff --check`。
- `node scripts/verify-upstream.mjs`：11239原blob一致；`node scripts/verify-packaging-lock.mjs`：1572依赖版本/integrity一致。
- `LAORENYUN_PORT=3084 docker compose -p laorenyun-phase4 build`、`up -d --wait --wait-timeout 90`、实际restart、最终stop；docker inspect/UID/GID/权限/镜像pin核对。
- 实际Chromium临时脚本 `/tmp/laorenyun-phase4/{river-smoke,derived-smoke,correction-smoke,final-smoke,final-release-smoke,zoom-native}.mjs`；合成测试图在容器停止时由一次性worker写入，运行时没有第二SQLite owner。脚本、私密cookie、夹具及运行卷不提交Git。
- 本地文档链接检查：208个本地链接、失效0；最终秘密/路径/远端资源扫描；实际结果不能外推为完整渗透测试或全浏览器认证。

## 对抗审查与Phase5输入

已修复：图摘要读取先加载所有证据、Persona混入无关图manifest、2倍宽度溢出、旧自传详情被刷新成当前、Conflict只提示一侧、unknown变成虚构遗忘、章节逆序、标题编造事实、缺失导出生成/fixture元数据、旧good入口被最近记录挤出。

没有图树化、直接JSON修订、Persona事实通道、模型SQL/文件权限、自动昂贵生成、公开分享或新基础设施。42项回归覆盖原提案、CAS、Conflict、Branch五答/冷恢复、调度、腾讯协议、原件归一化、speaker和composer来源；本阶段没有重新实云调用Flash ASR，没有真人录音。

Phase5聚焦最终真人麦克风与手机HTTPS/Safari验证、端到端演示、较大档案性能/分段生成、CI与发行镜像对应源码/许可、最终安全隐私复查。当前单次生成边界200当前节点/1000历史revision/500来源/150万字符manifest；超限明确失败，后续大档案体验需继续改善。ZIP、照片、导入仍未实现；不冒充本阶段交付。
