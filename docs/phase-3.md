# Phase 3：记忆智能与主支线验收

Owner：本文件拥有发行、真实容器/模型与阶段结论；[插件报告](https://github.com/Develata/dsh-laorenyun/blob/main/docs/phase-3.md)拥有实现及确定性测试。日期：2026-09-15。

**PASS — ready for Phase 4。** Phase 2 R2 实体麦克风、R3 真人采访后恢复仍 pending。本阶段全部为合成中文、原生键盘提交，不能替代硬件门禁。

## 交付边界

DSH固定 `0.1.6-alpha.1 / 0d1f50007f9bca3f52b06e1c3074fa14d5fb0720`，11,239个原始blob一致、零核心改动。生产插件固定 `0e17f42dfd4cf9b1525d246f4f1a92448d29f318`，见 [PLUGIN.json](../PLUGIN.json)。一个应用容器、一个SQLite worker；没有新运行框架、图/向量数据库或服务。

- schema4沿用transcripts、memory_revisions/current、branches；新增出处、实体、四种边、Conflict、operation和调度记录。未来schema拒绝，Phase2 schema-only fixture迁移保留数据。
- 接纳真人文字与 `extract:<transcriptId>` 同事务。网络在事务外；内部DSH模型仅产提案，60秒、一次格式修复、最多两个内部调用。校验引文、完整原句、时间、实体、候选快照和graphRevision后才写修订。
- confirmed表示“存在于提交证言”，不是历史独立核实。推断/身份不确定/possible conflict为candidate；material conflict才开Conflict。澄清追加双方修订，旧记录保留；不安全的重复改述不另造节点。
- Main注入≤4000字符派生索引，最多12条关键句/5条提示；当前区间绑定Main自身最近confirmed节点。timeline每轮≤6次、累计12000字符，来源另行深读。
- 九个保留真人轮触发原生批量压缩，保留最近两轮、新输入和摘要，日志不删。短历史无压缩收益时可在≤8000字符内暂留，至少新增8个surface事件再尝试；不是无界历史例外。见 [ADR-0016](adr/0016-phase-3-memory-and-branch-admission.md)。
- Branch先提议，后验证明确意愿；深度1、独立spawn。只带主题、返回锚点、一段≤2000字原话、≤6条直接相关节点。第五答持久化并禁止普通模型继续提问；内部生成memo，失败partial，回流消息不算人类回答。
- 调度只在话题边界；最多12个区间，权重 `.30/.30/.20/.20`、温度 `.25`、种子及完整评分持久化。未知当前月取Main明确时间锚点；拒谈暂缓8次真人回答。

## 真实模型：合成语料

协议 `openai-responses`，模型 `gpt-5.6-luna`，真实Compose容器、正常运行时私密环境配置。没有fixture冒充实网。

| 案例 | 观察 | 内部任务耗时 | JSON修复 |
|---|---|---:|---:|
| 1977年进入合肥一中 | anchored confirmed | 6635ms | 0 |
| 独立证言：同年进入合肥六中 | 新节点 + open Conflict | 8722ms | 0 |
| 小时候掉河，年份不记得 | drifting candidate，未编年份 | 10271ms | 0 |
| 仅要求核对已有学校记忆 | 空提案，没有制造新事件 | 4871ms | 0 |
| 明确确认六中、之前记错 | resolved；双方新修订、旧证言仍在 | 5923ms | 0 |
| 两答提前返回支线 | complete memo、Main恢复 | 首轮未采集耗时 | 未采集 |
| 五答支线，第二答后重启 | complete memo，5个唯一来源、111字摘要 | 10866ms | 0 |

耗时只代表该次任务，不是端到端时延或总体准确率。一般采访回复约45–61字，按当前证言询问一个主要问题；用户显式要求核对来源时出现较长解释。混合侧题邀请和叙事的一条输入被保守忽略，是召回不足，不宣称完整抽取。

## 危险边界实测

### 只读渐进检索

真实Main先检索，再调用 `timeline_get_node` 两次及 `timeline_get_sources` 两次核对双方原话。上下文日志中可见graphRevision 3→4→5→…的有界快照；摘要不是来源。原生压缩成功处理2809估算tokens的旧区间，原事件保留。

### Branch硬上限与冷恢复

第二答后实际 `docker compose restart`，恢复计数2，然后完成3–5答。原生child日志有且仅有5条human/RPC消息；第五答之后 **0条assistant/message**。Memo complete，5个source_turns，Main恢复；浏览器未显示UUID。冷恢复窗口未观察到旧回复TTS请求。

### 抽取中断

在真实抽取operation为running时重启容器；重启后同一operation第二次领取、applied，只有1份来源对应节点修订。原transcript与operation ID不变。不是在模型调用期间持有SQLite事务。

### 调度

真实Main在明确话题结束时调用调度工具，持久化了graphRevision、候选、G/C/U/R、温度和种子；第一次非边界调用正确不抽样。确定性测试使用1950s/1960s/1970s/1980s覆盖数 `[5,0,1,8]`，证明稀疏程度提高概率、连续性影响得分、冲突信号封顶、拒谈排除及相同种子可复现。

最终真实调度记录：Main锚点23784（1982年1月），seed=2025796092，6个候选，最大连续性R=1，选中23880（1990年代）。它是一次有种子的抽样，不代表固定选择最高分。

### 最终刷新/重启

28条transcript/Source、10个当前节点、12个revision、14条source_refs、2个BranchMemo在刷新和restart前后行级SHA256摘要一致。`integrity_check=ok`、外键错误0；恢复后话筒入口可用，未出现重复bootstrap/source，历史TTS请求0，未显示UUID。合成卷media=0，不据此声称真实音频已验收。

内部抽取共27份带计量的真实模型返回记录，JSON格式修复0；26个operation已applied，2个早期failed（候选白名单缺陷、旧关闭路径超时）保留。另有2次真实BranchMemo。统计不包含Main普通回答及原生compaction辅助调用，也不代表统计准确率；上述缺陷修复分别有实网澄清及中断恢复证据。

## 修复过的实测问题

- Phase2屏蔽函数在assemble后清空记忆context：移除旧屏蔽，由采访preset拥有有界上下文。
- 通用工具参数使模型给无用时间范围填0：每个工具独立schema，null表示不筛选。
- 普通resolveAgent拒绝child所有权：父子绑定校验后使用公开agents/inspect；真人输入仍由continuable接口恢复。
- 冲突另一端未进入词面候选：把已提供Conflict两端的revision纳入固定输入白名单；原failed操作保留。
- 原生压缩没有装载到定制preset、短前缀摘要反而更大：按官方preset隔离组装载，批量选区及有界短文本例外。没有修改DSH压缩实现。
- “常在放学后补习”与“周三去老师家补习”被模型标为possible：现仅candidate，不开Conflict。旧合成测试中的1条噪声Conflict保留，未无痕删历史；修复后新增兼容细节未再新增Conflict。
- 正常关闭被错记为终态失败：保留running/proposed，由启动恢复。早期测试中的超时记录保留，不把历史失败改成成功。
- 审查还修复了提案重启静默换图版本、不安全重复事件、重复memo来源、拒绝侧题后proposal悬挂、Main当前时间缺省等问题；均有对应确定性检查。

## Docker与回归

最终镜像 `laorenyun:phase3`（本地ID `sha256:72ee26bfba63b731a742516a5450a300232df6ace4b1d7c6b4ec53af8d507b69`）；验收项目 `laorenyun-phase3`，主机 `127.0.0.1:3083` → 容器 `0.0.0.0:3080`，卷 `laorenyun-phase3_laorenyun-data`。运行UID/GID `10001:10001`，目录0700、DB0600；health healthy。运行时读取既有.env，凭据不进镜像/仓库。

带DSH原生授权的浏览器正常使用；访问保护配置保持。实际模型工具目录仅interview_reference、3项Main编排工具、9项只读timeline工具，没有shell/fs/Git/web通用工具。补充的未认证curl请求被执行环境自动审批拒绝，不能把该次探测写成通过。未新增鉴权系统。

语音原件、校订、speaker、Flash签名/解析、真实FFmpeg格式转换、TTS缓存、旧Branch计数等原有测试全部通过；支线实测期间真实TTS请求返回200。本阶段未重跑Flash实云，没有真人音频。媒体为空的合成测试卷不能当作真人音频hash持久性证明。

## 验证命令与证据边界

- 插件：`pnpm check`（typecheck、33个测试、build）、`pnpm format:check`、`git diff --check`。
- 发行：`node scripts/verify-upstream.mjs`、`node scripts/verify-packaging-lock.mjs`：11,239原始blob、1,572 registry依赖版本/integrity一致。
- `LAORENYUN_PORT=3083 docker compose -p laorenyun-phase3 build`；`up -d --wait --wait-timeout 90`；实际多次 `restart`。
- 实际Chromium/Playwright临时脚本：`/tmp/laorenyun-phase3/interview.mjs`、`branch-five.mjs`、`interrupted-extraction.mjs`、`recovery.mjs`。这些是验收脚本，不随产品交付；只使用合成键盘输入，没有实体麦克风。
- 只读容器检查：`docker inspect`、Node `process.getuid/getgid`、`fs.stat`、SQLite `integrity_check`/`foreign_key_check`及来源/修订计数摘要。没有输出密钥或启动token。

## Phase 4输入与限制

图ID/不可变revision、graphRevision、分页/邻居/出处、漂流状态可供河流投影。纠正UI必须追加新证言；自传仅消费有出处的有效主张，Persona只影响表达，导出应携带原件与manifest。当前仍是保守数字日历提取、朴素匹配和有限实体消歧，不宣称一般语义正确率。无河流、照片、Persona、自传或导出实现。

验收结束后停止本任务的Phase3容器，保留命名卷供复查；已有Phase2运行环境和私密.env未迁移或覆盖。启动复查：`LAORENYUN_PORT=3083 docker compose -p laorenyun-phase3 up -d`，使用原生秘密访问链接。镜像未推送公共registry。
