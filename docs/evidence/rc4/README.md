# RC4 合成验收证据

只含合成材料，不含真人原声、凭据或访问令牌。旧RC2/RC3证据不改。

## 人工审读入口

- [完整自传第3本](book-3.md)（标题较朴素，留给作者风格审读）
- [长河总览](../../images/v0.2-rc4/river-overview.png)
- [展开故事树](../../images/v0.2-rc4/river-tree-expanded.png)
- [选择跨关系](../../images/v0.2-rc4/river-crosslink-selected.png)
- [漂流树](../../images/v0.2-rc4/drifting-grove.png)
- [手机展开树](../../images/v0.2-rc4/river-mobile.png)
- [采访](../../images/v0.2-rc4/interview.png) / [右侧预览](../../images/v0.2-rc4/river-right-preview.png)
- [记忆详情](../../images/v0.2-rc4/memory-detail.png)
- [自传](../../images/v0.2-rc4/biography.png) / [表达方式](../../images/v0.2-rc4/persona.png)
- [设置](../../images/v0.2-rc4/settings.png)

## 三次真实模型

同一RC2/RC3 archive，graphRevision=11，10个FactAtoms。openai-responses / gpt-5.6-luna，固定插件8786c7a生产Docker。后续插件修改仅客户端展示及river/detail有界读取，不修改叙事协议/模型路径。最终固定镜像重跑受影响浏览器与重启门禁，不重复付费三本。

| 本 | 发布 | 章/段 | 耗时 | 格式/正文/标题修复 | 使用/省略 |
| --- | --- | --- | --- | --- | --- |
| 1，无Persona | 是 | 2/3 | 69.640s | 0/0/0 | 7/3 |
| 2，有Persona | 是 | 2/3 | 68.084s | 0/0/0 | 7/3 |
| 3，有Persona | 是 | 2/3 | 99.166s | 0/0/1 | 7/3 |

[results](results.json)记录每本ID、事实使用/合法省略；[reviews](reviews.json)记录Planner、原子审校和逐尝试耗时。每本省略F001归属歧义、F005/F010未解冲突。各本使用的node/source集合相同。没有统计准确率主张。人工逐本未见新增具体年月、身份、因果或心理；第三本标题单独修复后采用安全事实标题，风格仍可由作者评价。

RC3实际失败是review span absent后格式修复耗尽共享时钟。RC4审校改用无损分句S编号，每次尝试独立60s，但受外层300s约束；仍一次格式修复、最多2并发/32排队。真实三本格式修复均未触发；时钟重试/外层中断由确定性测试覆盖，不宣称云端试验实际经历了格式重试。

## 出处与阅读导出

[provenance](provenance.json)：1983当前支持仅b56a81df…；1982旧证言56a09431…只留历史。阅读导出7脚注、0未用定义，JSON11证言/11修订、更正Conflict保留。[Markdown](autobiography.md)、[离线HTML](index.html)、[档案JSON](memories.json)。[offline](offline.json)：实际Chromium offline=true打开HTML，0网络请求/0断裂锚点。媒体不包含，非完整备份。

## 浏览器与几何

隔离项目laorenyun-rc4、端口127.0.0.1:3097、独立卷。故事树另一个合成档案含12节点及明确ELABORATES深度2、选中RELATES_TO、漂流链；13次图修订。通过正常领域接收/提议/验证写入，未直接造UI节点。人物档案、原生文字、展开/键盘选择、侧栏完整故事、详情来源、取消更正、漂流树、表达画像、既有自传、设置、刷新与重启实际走通。

[typed-restart](typed-restart.json)记录真实原生文字→mediaId=null Source→Transcript→节点→graphRevision1→River；同档案新采访可见、另一档案隔离、刷新与受控重启后仍可见。不是实体麦克风证据。

[visual](visual.json)：Chromium无页面错误；360/768/1440px、键盘、reduced-motion、CSS200%缩放。实际SVG1223.347px，500步分段测距相对误差约0.00000218（要求<0.005）。CSS缩放为部分证据，不声称物理手机、真实Safari或系统浏览器缩放认证。

视觉第一轮发现文字重叠和节点点击空隙，改为112px扇出与完整触控区域；第二轮改善河道曲率/字号、规范采访面板标识恢复DSH原生右栏，扩大预览触控区。总览保持少字；展开树显示分层，漂流树不赋时间。预览限原生采访右栏，长河选择后可带入预览；完整详情独立。

## 实际验证命令

插件：`pnpm check`（73 tests/typecheck/build）、`pnpm format:check`、`git diff --check`。最后触控样式小改另跑typecheck/build/格式，固定镜像构建再跑完整73项。

应用：`node scripts/verify-upstream.mjs`（11239源码对象，无补丁）、`node scripts/verify-packaging-lock.mjs`（1572版本/integrity）、`node scripts/verify-release.mjs`。`LAORENYUN_PORT=3097 docker compose -p laorenyun-rc4 build`、`up -d --wait`、`restart`。`scripts/smoke-rc2.mjs`用RC4隔离环境执行三本；导出需等新export ID published（不能只等已有下载链接出现）。`scripts/smoke-v02.mjs`及`--verify-restart`真实文字验证；本机Playwright visual.mjs/polish.mjs完成截图与交互，offline.mjs检查离线HTML，provenance.py逐项核对出处。私密参数未入Git。

全套包括记忆、Conflict、Branch硬上限/恢复、scheduler、speech协议/FFmpeg、Persona WHAT/HOW、export、档案隔离；未额外重复付费Tencent语音测试。R2实体麦克风与R3真人采访恢复仍PENDING。无v0.2.0标签；须作者审读后再授权。

最终插件：`244d556641cdd2382413e4d7506a3727bc225800`。Docker标签`laorenyun:0.2.0-rc.4`，最终本机image ID `sha256:4a9bc9df257fec84d882da26048d6199ec6f3208ee757bdd05e98b5a2538c7bc`，healthy，user10001:10001；镜像内完整73项再次通过。标签/访问保护未改变，无公开registry发布。

[完整滚动画布总览](../../images/v0.2-rc4/river-full-overview.png)使用加高视口捕捉全画布；通常桌面视口见首个总览链接。截图都经过实际查看，不以DOM通过代替视觉审查。

全画布复查又发现收起的漂流树预留过多高度、主河extent回调漏接，已按实际可见节点修正。[末端与漂流高度实测](extent.json)：末端树底1486.159px < 画布1511.159px；漂流收起420px/展开644px，收起恢复420px。最终截图已替换为修正后实际画面。
