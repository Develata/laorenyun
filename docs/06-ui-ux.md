> Phase 2 实际接入与验证状态见 [phase-2](phase-2.md) 和 [ADR-0015](adr/0015-phase-2-speech-and-interview.md)。完整产品规范仍含未来阶段，不能视为全数已实现。

# Web 交互、状态与记忆河流

> Phase 1 当前实现与证据见 [phase-1](phase-1.md)；本文件保留完整产品规范，未标为已实现的能力仍属后续阶段。

Owner：本文件拥有页面行为/视觉验收；[插件 UI](https://github.com/Develata/dsh-laorenyun/blob/main/docs/ui.md) 拥有 slot 和 client 适配。

## 页面

“讲故事”：当前一个主问题、原生消息历史、醒目的麦克风、原生可编辑 composer、文字发送、说话者选择、保存状态。首次主要动作“开始讲我的故事”；后续“继续讲”。Branch 切换不让用户理解 Agent 工程概念，用“再聊聊这件事 / 回到刚才”表达。

“人生长河”：按年代浏览、点选节点看短摘要/来源/“这里不对”、漂流区、生成自传/导出入口。Phase 4 画像按钮“自动构建人物画像”明确为用户触发，不能自动运行。

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

暖白背景、奶油表面、暖深灰正文、低饱和绿/青主色、少量暖金/棕提示；颜色用 DSH theme alias tokens。先不引入纹理图片。字体用系统中文 sans-serif，无远端字体请求；产品正文目标 18–20px，行高 1.6，主要触控区 ≥48px。DSH 内置字号设置上限 17px，不能谎称默认支持 20px：通过插件限定作用域 CSS 设置产品正文/composer 变量，保留上游 schema，详见 ADR-0013。

普通正文对比 ≥4.5:1；状态不只靠颜色；200% 缩放和 360px 屏幕不裁切核心按钮；键盘焦点清楚，中文 IME Enter 不误发送；录音状态 aria-live，不反复播报计时；尊重 reduced-motion。遵循 [W3C 老年用户无障碍指导](https://www.w3.org/WAI/older-users/)，这些是待测试要求，不宣称已通过 WCAG。

## 河流几何

令 `t=12*year+month-1`，主中心线以弧长 `s` 参数化 γ，`s(t)=c(t-t0)`。先建平滑曲线，求长度 L，再令 `c=L/(t1-t0)` 并以 SVG `getPointAtLength(s)` 定位；`t1=t0` 时放中心，不除零。布局变化重算 L/c；缩放改变 c，不压缩空白年份误导时间。用 `getTotalLength/getPointAtLength`，不能把 Bézier 参数 u 当弧长。

一年/十年事件画区间或不确定带；同月节点沿法线分层，但锚点仍相同。支线几何只表达叙事关系，不代表等距时间；边可以跨流段，河流不是事实树。离线导出保存派生几何并可重建。P0 SVG + `d3-shape` 足够，月份线性换算不必引入 d3-scale；不用 React Flow/工作流编辑器/Canvas 引擎。最多渲染 500 个可见节点，超出按年代聚合并有列表，无动画也完整可用。

## Phase 4 实现

main slot中的SVG长河使用固定平滑路径 + getTotalLength/getPointAtLength；无新增图形运行依赖。年代筛选/列表为主要可访问交互，图形补充时间感；范围金色带、未知独立漂流区，细节后加载。所选纠正预览后放入原生草稿，显式发送才变成新证言。三项派生按钮均用户触发，失败保持旧版本。[发行验收](phase-4.md)单独列实测尺寸/缩放/动效和来源播放限制。
