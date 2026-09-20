# RC6：正确性、规模与信息层级

本轮本地验收完成，等待作者最终审阅和发布授权。**不创建v0.2.0标签**。RC2–RC5历史证据不覆盖；RC4自然自传门禁、RC5艺术方向保留。

## 固定候选

- 插件：`bc91d78b39fe0db38e6315d50733f24cdfcca92b`，`0.2.0-rc.6`。
- DSH：既有固定版本，11239 canonical blobs校验，零上游源代码修改。
- registry依赖版本/完整性1572项不变，无新增依赖/迁移/基础设施。
- [容器](container.json)：`laorenyun-rc6`独立项目/合成卷，`127.0.0.1:3099`，非root，健康，未授权访问401。镜像`laorenyun:0.2.0-rc.6`。
- CI以两库最终提交的GitHub Actions记录为准；不依赖私密云密钥。

## 修复与边界

### 投影刷新

旧Client只比较graphRevision/ID/分页，漏掉无图版本变动的memo分组。现在Host对**有界展示响应及查询**计算SHA256 projectionRevision；关系、分组、来源数、open冲突标记都包括。Client只比较该版本，不对完整响应做深比较。

测试在同一graphRevision和节点集下新增BranchMemo，版本变化且Client采用新快照；同响应保留旧对象。来源计数/冲突展示的无图版本变动也改变摘要。未进入该页展示的数据变化不要求无条件刷新该页。

### 查询规模

有日期400条、漂流100条独立分页，总节点≤500。默认页日期优先，漂流不能挤掉时间主河。`dated`与`drifting`各自有total/offset/truncated；漂流画布≤12组，余量用列表/分页，不连接无关系节点。

关系通过绑定JSON ID数组/SQLite json_each先筛两端，再按ELABORATES优先、ID稳定序取≤2000。PRECEDES不占河流关系预算；CAUSES/RELATES_TO仍选择时显示。超限不声称完整展示全图。BranchMemo同样先筛可见成员，≤100组/每组≤24成员。详情≤10来源、≤12关联。

### 导航和预览

整段人生→1960只滚动；1960筛选→1980→1950先换查询，等待新投影/几何再定位；筛选→漂流→日期可返回。右预览5秒轮询有界本地数据，单请求，document隐藏/面板不可见时不发新请求，卸载abort。

[真实纯文字验收](typed.json)：在已有合成采访先打开预览，再原生提交新事实，Source.mediaId=null、Transcript、MemoryNode和graphRevision增长，预览无需切档案更新。[最终镜像刷新/重启复核](typed-restart.json)保留同一来源/节点，无页面错误。实时提交在同系列候选上执行；后续改动仅详情/操作位置与死代码清理，最终SHA复核持久性，不为此重复消耗模型调用。

### 清理与层级

删除旧标签占位、全局point cluster/聚类页/clustered IDs、无用x/y坐标；删除旧ly-list/ly-grid/stem/bank-caption/bay-leaves/current-bank/current-inner样式。列表浏览保留。

主/根标签18px、叶17px、年份14px；已展开支流加深，折叠轮廓保持淡。侧栏用原创线SVG，继承DSH原生tooltip/aria/选中状态；档案按钮补键盘焦点提示。详情顺序为时间/标题→关联→原始讲述→次要更正；无关联记忆仍可更正。已有自传时表达方式折叠，生成画像按钮进入次级区域。

Web/Markdown/HTML共用readingTitle纯函数，标题与首句重复时只投影章序号；自然标题保留，数据库/JSON原书稿不改。

## 合成规模测量

[scale.json](scale.json)是一次独立本地Node/SQLite测试，不是普遍性能保证，也不是实网模型测量。

| 项目 | 实际值 |
|---|---:|
| 当前节点 | 1000 |
| 日期 / 漂流 | 700 / 300 |
| 边 | 2102 |
| BranchMemo / open Conflict | 50 / 8 |
| 默认可见日期 / 漂流 | 400 / 100 |
| 默认可见关系 | 2（均ELABORATES，故意置于原全局2000边之后） |
| River查询 | 33.57 ms |
| storyTrees投影 | 15.50 ms |
| 单节点详情 | 0.80 ms |
| JSON响应 | 142888 bytes |

另覆盖700日期/0漂流、20日期/600漂流、100日期/600漂流、600日期/100漂流。夹具是SQLite展示查询测试，不是向生产卷导入的人生档案；无LLM/Tencent调用。未测任意万级图或复杂全图无碰撞最优布局。

## 截图审查

[浏览器记录](visual.json)。保留RC5视觉；实际截图审查发现并修复两项本轮问题：更正按钮误落在相关故事条件内、手机增大标签与主故事操作重叠。最终脚本额外检查无关联节点的更正/取消，操作位置与标签分开并保留44px触达。

- [全景](../../images/v0.2-rc6/river-full-overview.png)
- [展开树](../../images/v0.2-rc6/river-tree-expanded.png)
- [漂流湾](../../images/v0.2-rc6/drifting-grove.png)
- [独立详情](../../images/v0.2-rc6/memory-detail.png)
- [自传](../../images/v0.2-rc6/biography.png)
- [展开侧栏](../../images/v0.2-rc6/sidebar-expanded.png)
- [紧凑侧栏](../../images/v0.2-rc6/sidebar-compact.png)
- [手机](../../images/v0.2-rc6/river-mobile.png)
- [真实200%](../../images/v0.2-rc6/river-real-zoom200.png)
- [右预览实时更新](../../images/v0.2-rc6/right-preview-live.png)

全景用较高viewport呈现完整滚动内容；普通首屏另有river-overview.png。真实Chromium1440/768/360、键盘、reduced-motion；[200%证据](real-zoom.json)为测试扩展调用chrome.tabs.setZoom(2)，CSS zoom保持1、DPR=2，无横向溢出。不是实体手机或Safari测试。

首次浏览器运行因WSL /tmp内存盘已满崩溃（ERR_INSUFFICIENT_RESOURCES）；将本轮临时文件转到磁盘缓存后完成。未清理旧验收/用户资料。新空采访尚无会话页眉，因此预览实测改用已有合成采访，未用fixture冒充云调用。

## 阅读导出

[export.json](export.json)、[Markdown](export/autobiography.md)、[离线HTML](export/index.html)、[完整归档JSON](export/memories.json)。使用已接受书稿，仅执行本地导出，无新叙事调用。阅读标题统一为第1章，HTML离线打开、无remote资源/脚本；归档仍保留1982与1983证言。阅读来源仅来自实际支持引用；未改RC3出处策略。

## 验证：实际执行

- 插件`pnpm check`：82测试、Host/Client类型检查、声明/构建。最终固定SHA Docker构建亦执行完整检查。
- `pnpm format:check`、`git diff --check`。
- `node --test tests/river-hardening.test.ts`独立测量；包含查询/版本/导航/可见轮询测试。
- memory、Conflict/correction、Branch五答/恢复、scheduler、workspace/archive、typed/speech parity、Persona WHAT/HOW、narrative、export、speech协议/FFmpeg既有回归通过。
- 应用`node scripts/verify-upstream.mjs`、`node scripts/verify-packaging-lock.mjs`、`node scripts/verify-release.mjs`、`node --test scripts/config.test.mjs`（4项）。
- `LAORENYUN_PORT=3099 docker compose -p laorenyun-rc6 build`、`up -d --wait`、`restart`。
- `scripts/smoke-rc6.mjs`（显式LAORENYUN_RC6_ACCEPTANCE、合成archive、私密启动日志和origin环境配置）：导航、树、来源、更正取消、无关联更正、画像/设置/手机/键盘/静态模式。
- RC6临时`live-preview.mjs`：已有合成会话原生提交→真实抽取→可见预览更新；`scripts/smoke-v02.mjs --verify-restart`复核同一证据。
- 临时`export.mjs`、`full-river.mjs`、`zoom.mjs`：本地导出/离线打开、全景截图、真实浏览器缩放。
- 授权URL/私密日志/凭据未进入提交；合成导出扫描不含秘密/内部绝对路径。

## 未运行 / 独立限制

- 未重跑三次付费自传、Tencent专项云探针：生成/语音实现未变，保留既有验收，不冒称本轮实测。
- R2 physical microphone: **PENDING**。
- R3 physical-human recovery: **PENDING**。
- 无实体手机/Safari、无新增词级原声时间对齐、无万级档案性能保证。
- 待作者查看最终截图及书稿后授权v0.2.0；本轮不打tag。
