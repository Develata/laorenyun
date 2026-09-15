# 时间记忆图

> Phase 1 当前实现与证据见 [phase-1](phase-1.md)；本文件保留完整产品规范，未标为已实现的能力仍属后续阶段。

Owner：本文件拥有领域语义；类型和数据库映射分别在[插件 contracts](https://github.com/Develata/dsh-laorenyun/blob/main/docs/contracts.md)、[memory](https://github.com/Develata/dsh-laorenyun/blob/main/docs/memory.md)。

## 最小本体

typed temporal property graph，用 SQLite 关系表表示。不是 rooted tree；Person/Place 为实体记录，MemoryNode 为事件/经历/习惯/关系主张，允许交叉链接。Source 将文字段/媒体与证言相连；BranchDocument 保存访谈材料，Conflict 保存互斥主张；PersonaSnapshot/BiographySection 为派生记录。

MemoryNode 使用六要素：人物、时间、地点、起因、经过、结果。`key_sentence` 是 ≤120 汉字的检索摘要，不是来源；cause/process/result 可为空，不能为填表而补造。只有结构化抽取提案，不直接采信 LLM 输出。

## 时间

内部时间为可空区间；月索引 `12*year+(month-1)` 用于计算，不使用当地 Date/夏令时。保存原说法 `original_text`，以及 `precision=month|year|decade|approximate|unknown`、`certainty=stated|inferred|disputed`。

“1962 年”表示 1962-01 至 1962-12 的可能范围；“六十年代”是 1960–1969 范围。年/十年投影可选区间中点，但只属于 layout，不回写为精确月份。约某年需显式范围；仅知道先后而不知道年月可只有 PRECEDES 边。时间有数值不等于 stated；系统由年龄推算的时间始终 inferred，直到新来源明确确认。矛盾时间不取平均值，保留 alternatives 和 Conflict。

## 漂流记忆

`time` 无有意义锚点时 `placement=drifting`，进入“暂时想不起什么时候”区。新增可靠时间来源后在同一 node ID 上增加 revision，保存旧时间和新证据，转为 anchored；重新撤销时间主张可再漂流。不要创建复制节点或删掉旧引文。disputed 但候选区间明确时可画不确定带；无合理定位仍漂流。

## 最小边词汇

- `PRECEDES`：严格早于；不能对自环/周期提交 confirmed 顺序。已知时间与边冲突须提示。
- `CAUSES`：有来源的因果主张，不由先后关系自动推出；不另存逆向 RESULTS_IN。
- `ELABORATES`：记忆对记忆的细化，不意味着唯一父节点。
- `RELATES_TO`：一般交叉联系，存储按 ID 排序避免反向重复。

INVOLVES 用 node_people/node_places 关系表；SUPPORTED_BY/REFERENCES 用显式 provenance 表；CONTRADICTS 用 Conflict 记录而非再同步一套边。以后确有查询需求再增加词汇，不引入全能 Entity/EAV 框架。

## 状态与修改

`candidate → confirmed` 需证据校验且来自用户已提交文字：直接提取有支持的陈述可确认；推断字段保留 inferred，关键新推断须用户确认，普通主张不逐条弹窗。此处confirmed表示已提交证言经提取校验，不代表独立核实历史真伪；推断内容不得仅因同节点confirmed而升级为stated。`disputed` 标明开放冲突；错误版本可 `superseded`/`retracted`，不可物理覆盖。

直接选择节点说“这里不对”，新建纠正 Source/Transcript（文字或原音），展示一句修订预览后显式确认。更新 node revision；相关冲突可由使用者解决，原版本/来源永远可追。对原有事实的实质相反新证言先生成冲突，不让“纠错”成为无痕覆盖通道。

## 检索

timeline.search/get_node/get_period/get_neighbors/get_sources/get_conflicts/get_unresolved/get_drifting_memories 只读；返回 key_sentence 和分页，然后按 ID 深读。限定区间、数量、文本长度、邻接深度（P0=1），参数化 SQL，无模型 SQL 或路径。区间 overlap + 索引、名称匹配足以支撑单人生规模；P0 不引入 embeddings/vector DB，FTS5 只在中文查询评测证明必要时增加。
