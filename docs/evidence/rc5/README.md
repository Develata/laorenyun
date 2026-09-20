# RC5 最终河流视觉与 UX 证据

**PASS — final River art direction and UX ready for v0.2.0 human approval**

作者仍需审图；没有创建 v0.2.0 tag。RC4的叙事3/3与RC2/RC3历史失败证据均不改写。本轮没有付费自传重跑。

## 固定候选

- 插件：`3222353e4bfd3ad202ba98575739f75ef4d5eaea`，`0.2.0-rc.5`。
- DSH保持原固定版本，11239个规范化源码blob核验一致，0上游源码修改。1572个registry版本/integrity未变化，无新依赖。
- 独立Compose项目 `laorenyun-rc5`，本机3098，独立数据卷从RC4合成验收卷复制；原卷不改。正常elderly profile、非root10001:10001、单服务、未授权HTTP401。
- 最终镜像运行摘要见 [container.json](container.json)。未发布registry镜像。

## 三轮视觉审查

1. **几何/构图**：先读RC4原图，确认全局序号切向位移造成向下梳状布局。用实际Chromium加载生产Journey组件的本机合成页面，检查递归父子扇面、水流偏移。发现弯道带动树向下、标签空间不足。
2. **文字/颜色**：再次在实际Chromium检查扇角、节点/标签占用区域。扩大同级扇角，标签在上下左右候选中最小化交叠；桌面年代导航移到独立左缘，手机不粘住河面。取消重复年度与中心车道纹，河段共享端点改为共同竖直切线。
3. **实际Docker/响应式**：固定SHA正常应用中运行完整界面流程并逐张读图；继续修正选中动作压住标签、小屏关系说明重叠、侧栏重复年度。选中动作按现有节点/标签占用选位置；窄屏关系线保留，关系名称通过可访问标签和独立详情呈现。

前两轮是生产组件的隔离视觉harness；最终截图是实际Docker应用，不能把harness说成端到端产品测试。

## 人工审阅入口

- [全河全景](../../images/v0.2-rc5/river-full-overview.png)
- [展开故事树](../../images/v0.2-rc5/river-tree-expanded.png)
- [父子与孙节点](../../images/v0.2-rc5/river-tree-deep.png)
- [选中跨关系](../../images/v0.2-rc5/river-crosslink-selected.png)
- [漂流湾](../../images/v0.2-rc5/drifting-grove.png)
- [360px手机布局](../../images/v0.2-rc5/river-mobile.png)
- [reduced-motion](../../images/v0.2-rc5/river-reduced-motion.png)
- [原生浏览器200%](../../images/v0.2-rc5/river-real-zoom200.png)
- [采访](../../images/v0.2-rc5/interview.png)
- [自传](../../images/v0.2-rc5/biography.png)
- [表达方式](../../images/v0.2-rc5/persona.png)
- [设置](../../images/v0.2-rc5/settings.png)

全景使用较高浏览器viewport展示完整滚动内容，不是正常首屏高度。普通桌面首屏另见 [overview](../../images/v0.2-rc5/river-overview.png)。截图全部为合成材料。

## 几何与信息边界

主河时间仍以真实SVG弧长映射；[visual.json](visual.json)记录500段采样的最大相对误差，原容差0.005。分支为实际父节点位置加旋转后的方向向量，未缩放前深度长度115/100/85px，再按可用河岸宽度缩放。兄弟围绕父方向对称展开；单子链按深度交替小幅弯曲。

密集兄弟连同后代沿根切线分离（同级目标100px），不移动河流锚点；手机另作确定性纵向分离。标签和选中按钮使用有界占用面积启发式，视口边界限制位置。它不是全图最优排版算法；深度3、8可见节点及列表/详情仍是复杂档案的浏览边界。

ELABORATES继续是唯一语义树边；PRECEDES不作树父边，CAUSES/RELATES_TO只在选择时显示。分组junction仅是展示坐标，没有domain ID/出处/详情，不能进入导出。漂流节点不获得虚构日期。

## 漂流湾

实际Chromium组件测试0/1/2/3/30条：无漂流节点不建grove SVG；1条300px，2条400px，3条展开440px；30条仅8个可见节点、余量明确继续浏览，展开940px。[sparse.json](sparse.json)

实际Docker四条合成漂流记忆的展开/收起高度恢复及手机节点边界见 [navigation.json](navigation.json)。不把有限样本当作任意大型图无碰撞证明。

## UX与叙事边界

最新AI问题加大，保存/整理反馈维持实际持久状态。原生composer、speaker、录音状态机不变。侧栏仍使用DSH公开slot/布局；单字rail有原生完整可访问名称与提示。独立详情、右栏预览、原生设置仍可用。

自传阅读行宽740px、中文衬线与宽行距；与首句完全重复的标题仅显示为章序号。旧标题、正文和导出未被偷偷重写；不为此调用模型。Persona仍为“我的表达方式”，不新增功能。

## 实际执行的验证

- 插件 `pnpm check`：77 tests、Host/Client typecheck、build；最终固定SHA Docker构建再次执行同套测试。
- `pnpm format:check`、`git diff --check`。
- 新增父子递归、对称扇面、单链曲率、稳定输入顺序、密集兄弟碰撞、虚拟junction不入domain、漂流边界、阅读标题测试。既有Memory/Conflict/Branch/调度器/语音协议/FFmpeg/叙事WHAT-HOW/导出测试保持通过。
- `node scripts/verify-upstream.mjs`、`node scripts/verify-packaging-lock.mjs`、`node scripts/verify-release.mjs`、`node --test scripts/config.test.mjs`。
- `LAORENYUN_PORT=3098 docker compose -p laorenyun-rc5 build`、`up -d --wait`、`restart`。
- 显式授权运行 `scripts/smoke-v02.mjs`：新档案原生纯文字→无媒体Source→Transcript→抽取→River，同档案新采访共享、跨档案隔离、刷新。[typed.json](typed.json)
- 最终候选重启后 `scripts/smoke-v02.mjs --verify-restart`。[typed-restart.json](typed-restart.json)
- 可复用 `scripts/smoke-rc5.mjs`：年代导航与画布不重叠、展开树/深层节点、漂流高度恢复、360px键盘选中与reduced-motion。通过env显式提供合成档案、私密启动日志路径、测试origin、输出目录；不打印授权URL，不调用云模型。
- 实际Chromium 1440/768/360、右预览→独立详情→出处→更正取消、采访/表达方式/自传/设置/刷新；pageErrors=0。
- 真正的Chromium标签页200%通过测试专用临时扩展 `chrome.tabs.setZoom(2)` 设置：CSS zoom仍1，DPR=2，innerWidth=720，无横向溢出。[real-zoom.json](real-zoom.json)
- 私密数据/凭据不放入截图和提交；新提交文本扫描不含密钥、授权URL或私密日志。运行日志中的凭据仅留在本机私密目录。

## 未运行与限制

- 未运行付费自传生成与Tencent专项云探针：相应架构未改，保留RC4真实叙事3/3和既有speech云证据，不伪称新运行。
- R2 physical microphone: **PENDING**。
- R3 physical-human recovery: **PENDING**。
- 本轮手机为响应式Chromium，未声称实体手机或Safari验收；无新增词级原声对齐能力。
- 最终艺术方向仍由作者审图批准。本轮不创建正式标签。
