# 部署、安全与数据运维

Owner：本文件拥有最终发行/环境/隐私边界。当前只有设计，没有 Dockerfile、Compose、镜像或 `.env.example`。插件接入见[deployment-integration](https://github.com/Develata/dsh-laorenyun/blob/main/docs/deployment-integration.md)。

## 镜像与启动

目标 `cp .env.example .env` → 填凭据 → `docker compose up -d`，镜像预含 Node、DSH 构建产物、插件与受限媒体转换器。首发 linux/amd64；arm64 经真实构建/启动验收再声明。基准 Node **24.21.0**，DSH pin 见 ADR-0001，pnpm 版本跟上游 packageManager（11.7.0）。构建时再固定基础镜像 digest，Phase 0 不虚构 digest。

多阶段构建：源码构建阶段可有 pnpm/C 编译器等；最终阶段只放 Node runtime、运行闭包、Web 产物和必要媒体二进制。上游原生 addon 用其官方预编译或相同构建环境生成，不把源码构建工具链带到 runtime。`pnpm install --frozen-lockfile`，插件 tarball 精确版本/hash，无启动时 npm 下载、git clone 或 update。上游大 workspace 包含非必要平台/第三方 Agent 依赖，必须对实际运行闭包审计并裁剪；“没加载”不等于“没被镜像分发”。

Compose 单服务，持久 volume 挂 `/app/data`，`DSH_HOME=/app/data/dsh`、领域库 `/app/data/laorenyun.db`，`audio/images/persona/exports/staging/cache` 都在数据根。默认 Docker named volume 便于非 root 首启；bind mount 是管理员需预建 UID/GID 的选项，不悄悄递归 chown 用户目录。目标 runtime UID/GID 10001，目录 0700、文件 0600、umask 077。镜像内 volume 空目录预设正确 owner，首次启动检查，不匹配则有可操作错误。

## 网络与原生访问保护

DSH CLI 显式拒绝 `--host 0.0.0.0`，底层 webserver Config 支持该监听。容器 profile 固定 `webserver.config.host=0.0.0.0`，启动仍走 `dsh --profile laorenyun --no-open`，不传被拒的 CLI flag、不改 parser；Compose 只发布 `127.0.0.1:3080:3080`。最终 dump-config 与实际端口需要集成验证，不能只相信 YAML。

保留 DSH 原生 launch-token→cookie、Host/Origin/same-site 校验。它是本机访问保护，不建设账号系统。部署者初次取启动链接（未来 `docker compose logs` 中明确的启动行）后在浏览器打开；链接/访问日志按 bearer secret 保护，不进入演示、遥测、支持日志。普通应用错误日志永不打印密钥/原文；不承诺“只有两条命令就自动完成浏览器认证”。容器部署者可掌握本机全部数据，P0 不防本机管理员。

默认仅支持部署主机浏览器的 loopback HTTP（麦克风安全上下文可用）。手机访问 LAN 明文 HTTP 不满足麦克风要求；若要手机实测，使用已有可信 HTTPS reverse proxy + 精确 trustedHosts/同源校验，仅受信网络，不自动开放公网。HTTPS/证书配置属于可选部署集成，不增加产品账号；没有 HTTPS 验收时不得声称手机语音已支持。

## 环境契约（发行层读取并映射为显式 Config）

以下是老人云计划变量，不假称 DSH 自动识别。`.env` 通过 Compose `env_file` 注入，只有 `.env` 文件存在并不自动把值传进容器。管理员可从 `docker inspect` 读取 env，按用户指定的简易部署接受这一边界；之后可加文件 secrets，不影响业务接口。

| 变量 | 必需/默认 | 用途与约束 |
|---|---|---|
| `LAORENYUN_PROFILE` | 默认 laorenyun | 仅 laorenyun / laorenyun-dev；dev 不与 prod 同时写同一卷 |
| `LAORENYUN_PORT` | 默认 3080 | 宿主回环端口；容器服务固定 3080 |
| `LAORENYUN_DATA_DIR` | 容器固定 /app/data | 只允许受控绝对目录，模型/UI 不可配置 |
| `DSH_HOME` | 固定 /app/data/dsh | 保留原生会话、配置、credentials 与 attachment |
| `LAORENYUN_LLM_PROTOCOL` | 必需 | openai-responses / openai-completions / anthropic-messages |
| `LAORENYUN_LLM_MODEL` | 必需 | 与路由匹配的实际 model ID，无模型品牌硬编码 |
| `LAORENYUN_LLM_BASE_URL` | 自定义兼容路由必需 | 仅管理员配置 HTTPS；本地 loopback 调试可 HTTP |
| `LAORENYUN_LLM_API_KEY` | 云路由必需 | 映射 DSH `apiKeyEnv`；不进入 profile 明文 |
| `TENCENTCLOUD_SECRET_ID` / `TENCENTCLOUD_SECRET_KEY` | 语音必需 | Host credentials/SDK，最小 ASR/TTS 必要服务权限 |
| `TENCENTCLOUD_APP_ID` | Flash ASR必需 | 用于固定asr/flash/v1路径，非SecretId；仍只由Host使用 |
| `TENCENTCLOUD_REGION` | 默认 ap-shanghai，按账号验证 | 映射 SDK region；不是自行替换域名 |
| `LAORENYUN_ASR_ENGINE` | 默认 16k_zh_en | 仅已验证支持的引擎，方言升级需授权与测评 |
| `LAORENYUN_TTS_VOICE` | 默认候选 1001，启用前核验 | 使用账号可用音色；无声音克隆 |
| `LAORENYUN_AUTO_TTS` | 默认 true | 可被用户关闭；不影响事实/提交流程 |
| `LAORENYUN_LOG_LEVEL` | 默认 warn | 日志无秘密/全文音频/转写；不启用公开遥测 |

超时/大小等 tunables 由插件 Config schema 拥有（[speech](https://github.com/Develata/dsh-laorenyun/blob/main/docs/speech.md)），不为每个值增加 env。缺凭据启动可显示“配置未完成”及只读历史，禁止启动云操作；健康区分 process alive 与 ready，不无限重启解决配置错误。

## 健康与停止

计划插件提供精确 `/laorenyun/healthz`，只返回 ready/degraded、schema compatible，不返回路径/秘密；健康检查在容器本地调用、单次 2 秒、间隔 30 秒、3 次失败。认证例外仅限这个无数据端点，不能扩展到业务 API。Compose `restart: unless-stopped`、`init: true`、`stop_grace_period: 30s`、日志轮换 10MiB×3、非 root、`cap_drop: ALL`、`no-new-privileges`，这些需真实镜像验收后落为配置。

SIGTERM：停止接纳录音/提交 → 标记/停止外部任务 → 最多 20 秒排空事务与文件同步 → 关闭 DB/DSH；30 秒后被容器强停也应恢复 journal 和 partial 上传。后台 pending/unknown 不无限等待云。镜像目标 compressed <1GiB、空闲 RSS <512MiB，都是待测预算，超出先剖析运行闭包，不为数字牺牲恢复。

## 备份、迁移与增长

停写并停止容器后备份**整个数据卷**（领域 DB、SQLite WAL/SHM、原件、DSH_HOME、manifest）。在线只复制 `.db` 不成立；P0 先用停机备份，不造在线备份服务。恢复到空目录校验 hash/schema/代表音频/DSH session，成功才切换；用户自己的 `.env` 单独安全备份。

源材料按用户积累，无自动 TTL。录前/上传前检查可用空间（默认预留 256MiB），空间不足拒绝新录入，保留已接收材料。源 staging 在失败后登记为 partial，不能当临时缓存清除。可再生成缓存默认上限 256MiB/7日，LRU 清理只作用 cache；已发布 persona/exports 保留，容量大时提示管理员，不自动删。临时派生任务目录过期 24h 且无活跃操作才清理；结构化操作元数据保留，日志有轮换。持续增长的 DSH 日志也算个人原始访谈运行记录，不静默 prune。

## 隐私与权限

浏览器只访问同源 Host；Host 向腾讯发送音频/朗读文本，向所选 LLM 发送访谈文字/检索片段（P1 可发照片）。首次使用明确告知云处理，用户可改用文字，但文字仍可能发给 LLM。云服务的数据保留/训练条款以账号适用条款为准；本项目不宣称 zero retention。

老人 profile 只给采访/记忆/skill 资源工具；无任意 shell/fs/network/MCP/自修改/插件安装权限。FFmpeg 是 Host 固定参数调用，不是模型工具；禁止 URL/protocol 输入和 shell 字符串。所有 media/download 按 opaque ID 查受控路径，拒绝 traversal/符号链接，不接受模型提供路径。原件/照片视为不可信内容，不能作为系统指令。
