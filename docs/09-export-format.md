# 自传生成与耐久导出

Owner：本文件拥有生成与交换语义；ExportService 等类型在[插件 contracts](https://github.com/Develata/dsh-laorenyun/blob/main/docs/contracts.md)。

## 生成分层

`Memory Graph 固定版本 → Fact Manifest → Narrative Planner → Writer (+ 可选 Persona) → 独立事实审校/有界修复 → validated BiographySection → autobiography.md`。

v0.2 由 FactAtom 约束事实宇宙，模型自由改写、合并多个事实成段；章名与段落均参与审校。未知日期只保留为 null，不自动写入“年份不详”；家人证言自然归属。独立模型审校不是历史真实性证明，仍需人工阅读；确定性验证保证引用/界限/来源存在。具体改变见 ADR0018。

Planner 选择年代/主题、排序和节点版本，不产生新事实。Renderer 默认第一人称、保留本人朴素说法，不过度文学化；每段带使用的节点/字段/source refs。子女代述必须保留“据家人回忆”等出处限定，不能冒充本人亲历。只有说话者明确说过的内心活动可以写；因果与具体日期受各自 certainty 限制。

每节对 planner 清单校验事实/引用、未知值和冲突；不能仅凭“引用 ID 存在”认定语义正确，真实验收含人工逐段对照。开放冲突并列标明不同记忆，或省略争议细节并说明，不能为了流畅任选一版。模型一次修复仍失败则保留未发布候选，不替换上次可用自传。

输入 node revision / source revision / graph revision / optional persona snapshot / prompt/model 固定并写 manifest。生成总截止5分钟、单节60秒、最多20节；超出分次整理，不能在后台无限生成。每节最多一次修复且不重置预算，失败/取消保留已生成候选，上一发布版本继续可用。P0导出任务总120秒，超时返回可恢复失败；不在一个HTTP请求里无限等待。每次发布原子切换生成版本；同次重试以 generation ID 去重。录音、转写、记忆不依赖自传反向更新。

## P0 文件

- `autobiography.md`：UTF-8，第一人称正文、稳定章节/段落 ID、可读脚注；文件自身说明派生时间/版本，缺出处显示未核实。
- `index.html`：基本自传、节点摘要和来源文字、可点击内部锚点；离线可打开，CSS 内嵌，无远程脚本/CDN/字体。P0 不要求离线互动河流或打包全部音频。
- `memories.json`：`format=laorenyun.memories`、`schemaVersion=1`、exportId/generatedAt/graphRevision、media metadata、speaker snapshots、sources、transcript revisions、nodes/revisions、edges、conflicts、branch memos、biography manifest。按稳定 ID 排序；未知保持 null，不能序列化为推测值。

JSON 媒体引用为相对逻辑路径与 hash；未包含文件有 `included=false`，不能给出失效的 Host 私有 URL 冒充可携带音频。P0 导出不是全备份，也未承诺导入恢复。

## P1 portable ZIP

包含以上三文件及 `audio/`、`images/`，manifest 列文件 bytes/hash、路径、是否原件和版本；可新增 richer HTML 离线河流/出处导航。内部路径无绝对路径、`..`、符号链接；使用成熟 ZIP 流式库，选择时再审计许可证；不为 Phase 0 增加包。

## 一致性与安全

导出以领域 revision 建立稳定 manifest，分批读取版本化记录；SQLite 短读事务拿版本清单，媒体不可变且导出期间固定引用，不长事务等待模型/打包。先写私有 staging，验证全部 refs/文件 hash，再原子发布；取消/空间不足保留上一版本。

UI Markdown复用DSH renderer；静态HTML直接从已校验BiographySection结构渲染标题/段落/出处锚点，文本转义，不再解析任意Markdown，也不自造通用Markdown解析器。Markdown 和 HTML 不执行源文本 HTML/脚本；只允许安全 URL 协议，HTML 输出转义或复用已审计 sanitizer，CSP 禁远端连接。导出默认是私密下载，不自动分享/上传。界面说明可能包含第三方姓名、照片和敏感经历；公开传播由使用者另行决定。密钥、DSH 系统提示、隐藏思考、内部绝对路径不得进入导出。

## Phase 4 历史交付边界（新生成由 ADR0018 替代）

Planner使用固定manifest并覆盖每个可用节点恰好一次；开放Conflict双方暂不写入，并明确说明省略。Renderer采用原话编排：完整keySentence必须原样存在于支持证言，软件添加代述/不确定说明；Persona只能选择有证据的有限转场。此版本优先防止新增事实，未实现自由文学改写。人物/事实不依赖风格快照。

schema5复用一个derived_generations生命周期，显式创建、持久输入hash、progress、candidates、模型计量、active指针。至多一个派生任务；5分钟总期限/60秒单调用/一次格式修复，导出120秒。重启中的任务标failed并保留候选；用户显式重试建立新generation，之前published不动。

自传最多200当前节点、1000历史修订；超过边界显式失败，不静默截断。导出固定绑定自传manifest，包括关联历史证言/修订和冲突，而非声称包含后来新增采访。文件私有staging、fsync、hash复核、rename后才切换DB发布指针；中断遗留不自动清理。媒体均included=false，不提供ZIP/导入或完整备份承诺。验证与原声定位限制见[Phase 4](phase-4.md)。
