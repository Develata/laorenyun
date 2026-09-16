# ADR 0017 — 长河投影、显式纠正与有界派生产物

状态：accepted；日期2026-09-16。承接0005/0009/0010及Phase4任务。领域权威不变。

## 决定

1. 长河仅用graphRevision快照。固定SVG路径 + 浏览器真实弧长API，不把Bézier参数当时间。调研d3-shape 3.2.0后，安装被执行环境自动审批拒绝；本次无需自由曲线生成，原生API足够。未拷贝D3，也未新增图形依赖。
2. 纠正入口预览完整新证言，原子绑定Source→选中node revision，再用原生composer显式提交。原Phase3提案/证据/时间/CAS仍权威；受该绑定限制可追加同ID修订，并保存旧新revision的resolved correction Conflict。普通采访矛盾保持独立主张/open Conflict机制。无来源或并发旧目标拒绝，不静默覆盖。
3. Persona/Biography/Export共用derived_generations和active指针，一个持久任务；复用唯一SQLite worker与DSH内部模型。清单/候选/计量保留。模型60秒单次/一次修复，生成5分钟、导出120秒；中断明确失败，用户重试新generation，上次published保持。
4. Persona数据库JSON是唯一权威；VOICE.md等目录为未来可选投影。仅本人已提交文字，五类语言观察有引文，不足进入unknown，不能提升权限。
5. 自传Renderer采用受限原话编排。仅凭有效node ID无法证明自由散文没有新增事实，因此每个事实完整句必须逐字来自支持证言；软件添加家人归属/不确定说明。Persona只允许有引文支持的有限转场。Planner负责分章，日期顺序软件保证；标题仅中性集合或来源原短语。开放Conflict双方略去，并明确说明。
6. 导出固定绑定已发布自传manifest，private staging→fsync/hash→rename→DB发布指针。不在写文件/等模型期间持SQLite事务。Markdown/静态HTML/JSON不含音频文件，included=false；不是完整备份，不实现导入。

## 代价与证据

受限Renderer的措辞变化较少，但WHAT/HOW可逐字验证；以后若允许自由改写，需要新增语义审校与失败回退证据，不放宽现有发布校验。单次≤200当前节点/1000历史修订，超限明确失败；不是无界全档模型上下文。旧版本和中断staging不自动清理，未来清理另需授权。

实测曾发现2倍缩放最小列宽溢出、模型章节逆序，以及缺日期被错误表达成“我记不清”。分别改为可用宽度布局、确定性时序、编辑性“这段讲述没有明确年份”。完整证据与限制见[Phase4报告](../phase-4.md)。Phase2真人硬件门禁独立pending。
