# Web 交互、状态与记忆河流

> 当前产品边界见 [v0.2.0](release-v0.2.0.md)。本文件描述现行约束；标为历史的段落保留早期语境，硬件与质量承诺以实际证据为准。

Owner：本文件拥有页面行为/视觉验收；[插件 UI](https://github.com/Develata/dsh-laorenyun/blob/main/docs/ui.md) 拥有 slot 和 client 适配。

## 页面

“讲故事”：当前一个主问题、原生消息历史、醒目的麦克风、原生可编辑 composer、文字发送、说话者选择、保存状态。首次主要动作“开始讲我的故事”；后续“继续讲”。Branch 切换不让用户理解 Agent 工程概念，用“再聊聊这件事 / 回到刚才”表达。

“人生长河”：按年代探索河流与故事树，漂流湾独立展示无日期记忆。点选后可快速预览或进入独立详情；自传、表达画像与导出位于“我的自传”，不挤在河流下方。所有昂贵整理均显式触发。

## 确定性状态

使用两个正交的业务状态和独立播放状态，避免把录音/模型/播放组合成指数状态枚举：capture=`ready|recording|storing|transcribing|draft_ready|error`；turn=`idle|submitting|agent_thinking|persisting|error`；playback 独立为 `idle|tts_generating|tts_playing|blocked|error`。Host 拥有持久任务状态，浏览器拥有设备/播放状态。

| 状态/条件 | 允许动作 | 退出及失败 |
|---|---|---|
| READY / DRAFT_READY，turn idle | 开始说、编辑、显式发送、切换 speaker | 录音进入 recording；非空提交进入 submitting |
| RECORDING | 停止、取消本次采用；显示时长 | 停止后 storing；权限/设备失败保留 partial |
| STORING | 等待有限回执、重试保存、下载未上传副本 | 成功 transcribing；失败不允许声称已保存 |
| TRANSCRIBING | 取消等待、文字输入、重试；禁第二个录音 | 成功确认 draft revision 后注入；失败保留原件 |
| SUBMITTING | 停止等待；避免双击/键盘重复 | accepted 后 agent_thinking；不确定结果查 operation |
| AGENT_THINKING / PERSISTING | 停止本轮；可阅读/编辑下次文字 | 禁止新轮提交/录音，完成后 idle |
| TTS_GENERATING / TTS_PLAYING | 停止/暂停、手动播放、新录音 | 开始录音先停止播放，避免回声；并非 speak-to-interrupt |

ASR 尚在运行时用户可用“改用文字”取消该 draft 的注入绑定后发送；后来结果归档为未采用，不覆盖新草稿。切换 session 先保存/取消当前 draft，迟到响应只能回到其原 session。模型既不能解锁控件，也不能绕过 Host admission 检查。原生 ComposerBlocks 会连编辑一起冻结，只在 recording/storing/实际提交关键期使用；不通过全程禁用 composer 实现“忙”。

## 视觉与可访问性

暖白背景、奶油表面、暖深灰正文、低饱和绿/青主色、少量暖金/棕提示；颜色用 DSH theme alias tokens。先不引入纹理图片。字体采用系统中文字体，自传正文使用 serif；无远端字体请求；产品正文目标 18–20px，行高 1.6，主要触控区 ≥48px。DSH 内置字号设置上限 17px，不能谎称默认支持 20px：通过插件限定作用域 CSS 设置产品正文/composer 变量，保留上游 schema，详见 ADR-0013。

普通正文对比 ≥4.5:1；状态不只靠颜色；200% 缩放和 360px 屏幕不裁切核心按钮；键盘焦点清楚，中文 IME Enter 不误发送；录音状态 aria-live，不反复播报计时；尊重 reduced-motion。遵循 [W3C 老年用户无障碍指导](https://www.w3.org/WAI/older-users/)，这些是待测试要求，不宣称已通过 WCAG。

## 河流几何

令 `t=12*year+month-1`，主中心线以弧长 `s` 参数化 γ，`s(t)=c(t-t0)`。先建平滑曲线，求长度 L，再令 `c=L/(t1-t0)` 并以 SVG `getPointAtLength(s)` 定位；`t1=t0` 时放中心，不除零。布局变化重算 L/c；缩放改变 c，不压缩空白年份误导时间。用 `getTotalLength/getPointAtLength`，不能把 Bézier 参数 u 当弧长。

一年/十年事件画区间或不确定带；同月节点沿法线分层，但锚点仍相同。支线几何只表达叙事关系，不代表等距时间；边可以跨流段，河流不是事实树。当前使用原生 SVG/React/CSS，无 D3 或图编辑器依赖；阅读导出不包含交互河流。可见图形有界，日期与漂流分别检索；超过窗口通过年代/分页与计数入口继续浏览，列表模式保留，无动画也完整可用。

## Phase 4 历史实现

main slot中的SVG长河使用固定平滑路径 + getTotalLength/getPointAtLength；无新增图形运行依赖。年代筛选/列表为主要可访问交互，图形补充时间感；范围金色带、未知独立漂流区，细节后加载。所选纠正预览后放入原生草稿，显式发送才变成新证言。三项派生按钮均用户触发，失败保持旧版本。[发行验收](phase-4.md)单独列实测尺寸/缩放/动效和来源播放限制。

## v0.2 当前信息架构（替代早期合页布局）

主导航为讲故事 / 人生长河 / 我的自传 / 设置。DSH 品牌公开 slots 提供原创云河标志和老人云；折叠侧栏是原生能力，展开后显示人物档案与采访记录。没有浮动覆盖导航，也不替换原生 composer。设置恢复原生 AI 模型/凭据面，辅以语音和显示；模型工具权限仍由 restricted interview preset 控制。

长河为正常滚动的纵向主画布，早年上游、晚年下游；实际 SVG 弧长线性映射月份，区间采用真实子路径，不改变事实日期。桌面河岸文字与稀疏标记、小屏左河右文；密集点聚合、年代范围筛选/跳转、当前位置和显式列表浏览。漂流湾独立于有日期中心线。水流装饰缓慢向下，reduced-motion 停止动画。

点击节点进入独立详情，可看来源/整段原声/这里不对；更正仍先创建新证言，经原生提交进入抽取，不直接改图。右侧长河导航仅是采访辅助，不替代全页。

“我的自传”拥有章目录、阅读、来源和导出；已有书稿时正文优先，“我的表达方式”作为默认折叠的辅助内容，用户可关闭下一次生成对画像的使用。没有年份的故事自然写出，不自动插入数据库时间状态。设计来源与真实截图验收见 [v0.2](v0.2-redesign.md)。

## Path-of-Trees 与投影刷新

主河流表示时间，ELABORATES 构成局部故事树；BranchMemo 与密集日期组只提供非领域分组，CAUSES/RELATES_TO 按需展示，PRECEDES 不当树边。无关漂流记忆仅空间排布，不因同为未知年月而相连。

后端 projectionRevision 覆盖当前投影输入；图节点、关系、来源数、冲突和故事组变化均能刷新。日期与漂流各自有界，关系在可见节点范围过滤后再限量；右预览挂载时轻量轮询。筛选外的年代跳转先换范围，等新几何后滚动。规模验收见[v0.2 RC6](v0.2-redesign.md)，不承诺万节点任意图布局。
