# Phase 1：实现、门禁与复核

Owner：发行与跨仓验收证据。日期：2026-09-15。插件源码/契约的实现说明由[插件 phase-1](https://github.com/Develata/dsh-laorenyun/blob/main/docs/phase-1.md)维护。Phase 0 独立基线已推送：应用 `4b3a392`，插件 `9bebcd8`。

## 当前交付

- 固定 DSH `0.1.6-alpha.1` / `0d1f50007f9bca3f52b06e1c3074fa14d5fb0720`；完整源码放 upstream/，11,239 原始 Git blob 可机械校验。源码/agent loop 修改均为 **0**。
- 插件独立 Git SHA 由 [PLUGIN.json](../PLUGIN.json)拥有；Docker 从该远端 SHA 构建，不复制 sibling 仓源码。单 worker SQLite v2、源文件/manifest、来源与校订、显式 Speaker、记忆修订与漂流记录、五答支线均归插件。
- 两个真实 profile，唯一无模型工具的 preset；老人模式省去 trajectory/provider/tool/terminal/files 调试入口，并通过公开 slot 隐藏聊天中的 system-prompt/turn-process/stats。开发模式保留诊断。API 探针只在 dev + probes 开启。
- 官方主题 token 层、中文 locale、采访原生 composer、人生长河占位 panel。不是最终 UI，没有 D3，也没有真实 STT/TTS/模型采访。
- 一个本地 Docker image `laorenyun:phase1`、一个 Compose service、一个 named data volume；Node 24.21.0、UID/GID 10001；不需宿主工具链。

## Gate A：来源 → 原生 composer → 校订 → 原生提交

真实 Chromium 在 Compose Web 中点模拟语音输入。原件与 manifest 先落卷，source ID 经 reference chip 序列化穿过原生编辑器/提交路径。刷新页面后恢复草稿，将“我那个时候去了合肥一中”里的“一”选中改成“六”，使用原生发送按钮。

自动断言 raw=`我那个时候去了合肥一中`、edited=`我那个时候去了合肥六中`，Source ID 相同，原生 session/message/rpc ID 均存在，correction=true。没有 Historical Conflict。原生假模型只返回固定回执；不伪称真实 LLM。

存储测试另外覆盖未提交重开、取消、跨 session 拒绝、重复请求、错误重试保留原件。领域 receipt 在 pre-step 接纳，早于 DSH 日志 flush；不宣称两个数据库原子提交。DSH 真实压缩日志中的 `user/message.id`、`source.rpcId`、Source UUID 与校订文本均已和 SQLite 逐项断言匹配，所有原生 request/header 的模型工具集合为空；合成 subagent-settled notices 不是人类回答。Phase 2 自动重试必须先核对领域 receipt 与 DSH inbox/log，禁止换新 ID 盲目重发。

## Gate B：真正人类回答与冷恢复

浏览器通过官方 continuable spawn 打开隔离子会话，回答 1、2 后执行真实 `docker compose restart`。重启后从父会话恢复同一 child ID，计数仍为 2，继续 3、4、5；断言 closed、memo.source_turns.length=5，并等待确定性“已保存五次回答，请回到主线”输入封锁。

真实初始化 prompt 也可能是 user，但没有 browser rpcId；不能仅按 role 计数。助手、工具、系统、subagent notice 和重复请求不增计数。领域事务在第五答写 memo/closed；第六答 Host 拒绝（自动存储测试及本机 DSH 浏览器额外尝试），客户端隐藏/禁用不能代替 Host 门禁。

DSH 本 pin 冷恢复的 child 在父会话离线时只读，必须先重新打开父会话，再刷新公开子会话目录；这是公开 session/address 生命周期限制，已记录 ADR-0014。关闭保留历史，不删除 DSH session，也不以 drain 整个父子树代替单支线关闭。

## Gate C：真实容器

环境：WSL + Docker Desktop，Engine 29.7.2、Compose 5.5.0，linux/amd64。基础镜像 digest 固定于 Dockerfile。

| 项目 | 实测 |
|---|---|
| 构建 | `docker compose build` 完成，原锁安装/派生锁离线 deploy/远端固定插件编译测试均执行；本机镜像 ID `817607bfb4da`，Docker inspect Size=135,664,018 bytes |
| 身份 | `id` 返回 uid=10001 / gid=10001 |
| 监听 | 容器 0.0.0.0:3080；本次宿主 127.0.0.1:3081，默认配置宿主 3080 |
| 健康 | healthy；健康请求只访问领域 worker，不需云凭据；本次空闲容器 working set 209.1 MiB（单次 docker stats，不是性能 SLA） |
| 认证 | 无 cookie 的 Web 与业务请求=401；已认证但恶意 Origin=403；原生 launch link/cookie 可访问；不新增账号系统 |
| 持久卷 | `laorenyun_laorenyun-data` → /app/data；目录 0700、SQLite/原件 0600、owner 10001 |
| 重启 | 来源、校订、DSH 历史与支线两答计数保存，恢复后到五答 |
| 停止 | Compose stop 后 exit=0，OOM=false，未触发强杀 |
| profiles | dev 完整探针；elder 探针 API=404、按钮不存在、trajectory 不显示、river 可开 |

只有应用开发/构建环境需要 Node/pnpm/Chromium。没有向 container registry 发布镜像。本次临时运行容器最终停止并移除；测试 named volume 刻意保留供核查，本机 source-build Host/浏览器探针也停止。停写备份与恢复说明见 [部署](10-deployment.md)。

## 可复现命令

插件：

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm format:check
git diff --check
```

`check` = Host/Client typecheck + Node 真实 worker/SQLite 测试（7 项）+ 分面声明/esbuild 构建。容器中的插件也从固定 Git SHA 执行同一 check。

应用：

```bash
node scripts/verify-upstream.mjs
node scripts/verify-packaging-lock.mjs
docker compose build
docker compose up -d --wait --wait-timeout 60
docker compose restart
# 原生浏览器流程按下节运行
docker compose stop
git diff --check
```

浏览器脚本复用上游开发依赖 Playwright，未额外新增运行依赖。配置 dev + probes=true 后，将 `docker compose logs --no-color` 安全写入 /tmp 文件，设 `SMOKE_HOST_LOG`；可用 `SMOKE_CHROMIUM` 指定本机 Chromium 路径，默认 `SMOKE_BASE_URL=http://127.0.0.1:3081`。

1. `node scripts/smoke-browser.mjs initial`：真实原生编辑/提交/刷新恢复及前两答。
2. `docker compose restart`，等 healthy。
3. `node scripts/smoke-browser.mjs recover`：同一 child 恢复至五答。
4. 改为 elder profile/probes=false 并重新创建容器，`node scripts/smoke-browser.mjs elder`：检查展示隔离和关闭探针。

`SMOKE_STATE_DIR` 默认 /tmp/laorenyun-compose-smoke；包含 **private cookie storageState**，不得提交或分享。仅 `*-evidence.json` 是不含凭据的摘要。脚本自身选择测试文本的 Range 后用真实键盘输入，不直接改领域库/伪造 native submit。截图已人工复核；没有测试真实录音、云 API、WebKit/iOS、磁盘满或完整 DSH 仓库测试。

## 对抗式复核结果

已修正的实测问题：spawn 初始 prompt 被误计、缺少 conversation 注入/child catalog 刷新、同批越限输入影响已接收消息、媒体 rename/DB 窗口恢复、原生主题异步覆盖、elder 残留调试展示、pnpm deploy 缺包与 DSH fallback 路径发现。最终四类构建适配及三个显式补入 peer 包见 [UPSTREAM](../UPSTREAM.md)；不把 CLI --version 当完整加载证据。

领域 ID 随机 UUID，speaker 显式 state，不用文本/“下一条消息”猜测来源；数据库只在 worker 使用，队列/超时有限；原始文件留在卷外部文件系统；没有新 ORM、图数据库、消息总线或 shell 模型能力。插件包不携带第二份 React/Cordis。Git 排除 `.env`、运行 DB/音频、node_modules、lib/dist 和浏览器私密状态。全量 `git diff --cached --check` 仅报告两处保留的第三方原文空白（Node LICENSE 的 space-before-tab、上游 cosmokit README 的行末空格）；原创范围检查通过，未为消除提示改写第三方 blob。

许可检查发现实际 runtime 的 sharp-libvips 是 LGPL，不能套用其打包脚本 Apache 许可。保留组件版本、完整 GPL/LGPL 和包许可证，未复制 dsh-talk。**将来发布二进制镜像前**还需随分发准备相应 LGPL/MPL/Debian 对应源码材料；当前只 push 源码。详见[许可清单](../THIRD_PARTY_NOTICES.md)。

## Phase 2 接口工作

A/B/C 已有真实执行证据，可开始真实采访和腾讯 STT/TTS。仍需在该阶段处理：真正上传分片/音频归一化与 raw ASR attempt、付费服务权限/口音/耗时验证、模型 provider env 到原生 settings 的映射、原生 receipt 与日志在失败窗口的核对，以及用公开 renderer 隐藏用户气泡中的来源标记。以上不改变本阶段确定的持久来源 ID/支线门禁/单镜像边界。
