# 部署、安全与数据运维

Owner：发行、环境与隐私边界。当前是 Phase 1 基础，实测回执见 [phase-1](phase-1.md)。业务存储由[插件](https://github.com/Develata/dsh-laorenyun/blob/main/docs/deployment-integration.md)拥有。

## 构建与启动

```bash
cp .env.example .env
docker compose up --build -d
docker compose logs
```

从最后一条 `dsh web:` 取原生启动链接。该链接包含访问秘密，只在自己的浏览器使用，不贴入工单/截图。默认宿主 `127.0.0.1:3080`。改变 `LAORENYUN_PORT` 时，将链接端口改为该值；容器内部仍是 3080。

一个镜像、一个服务、一个 named volume。不需要宿主 Node/pnpm/Python/Rust。基础镜像、DSH commit、插件 commit 分别由 Dockerfile、[UPSTREAM.json](../UPSTREAM.json)、[PLUGIN.json](../PLUGIN.json)固定。Node 24.21.0 Debian bookworm slim；pnpm 11.7.0 仅构建期使用。linux/amd64 已作为首个验收平台；arm64 不在本次声明范围。

构建顺序：上游原冻结锁安装 → Host 编译/Typert → Client/Web/native addon → 派生冻结 packaging lock 离线 deploy → 运行依赖发现补齐 → 固定 Git SHA 插件构建打包 → 非 root 最终镜像。只复制运行包和 Web 产物；构建细节及适配清单见 [UPSTREAM](../UPSTREAM.md)。无启动时下载/安装，没有腾讯/FFmpeg/本地模型引擎。

## Profiles 与探针

默认 `laorenyun` 隐藏开发面板，唯一允许的 preset 不注册模型 shell/fs/network 工具。`laorenyun-dev` 保留 DSH 诊断 UI；只有显式 `LAORENYUN_PROBES=true` 才加载假模型、假转写和支线验证按钮。两者不可同时写同一数据卷。开发 preset 同样不授予 shell；保留诊断 UI 不等于授予模型工具。

Phase 1 默认 profile 可加载与读取历史，但不含真实采访智能；未配置真实模型时提交会明确返回 DSH provider 错误。离线完整门禁使用 dev + probes，不需要任何付费 API key。首次创建 DSH settings 时设中文，已有用户 settings 不覆盖。

## 持久数据和权限

Compose named volume `laorenyun-data` → `/app/data`，运行 UID/GID **10001:10001**，镜像预设该目录 owner/0700，启动 umask 077。DSH_HOME=`/app/data/dsh`，领域库=`/app/data/laorenyun.db`，原件=`/app/data/audio`。源文件/manifest 为 0600，不把大二进制写进 SQLite。未来 images/persona/exports 按实际实现创建。

bind mount 是管理员选项：预建该 UID/GID 可写的受控目录；不匹配会报 `DATA_PERMISSIONS`。不执行递归 chown 或 chmod 777。SQLite 单 worker、WAL/FULL/FK 与迁移是插件责任；健康必须等领域库打开成功。

停写并停止容器后备份**整个数据卷**，包含 DB/WAL/SHM、原件/manifest、DSH 会话和访问保护材料；单拷 `.db` 不是在线备份。`.env` 单独安全备份。原始材料无 TTL、无静默清理。Phase 1 失败 partial 保留；容量预检/派生缓存配额留给真实上传阶段。不要把未完成文件当缓存删除。

## 网络、认证与健康

保留原生 launch-token→signed cookie、Host/Origin/same-site 校验。容器 `webserver.config.host=0.0.0.0`，通过公开 patch 注入；不使用 CLI 明确拒绝的 `--host 0.0.0.0`。宿主只映射回环地址。未认证 Web/业务 API 必须拒绝；唯一新增例外是无数据的 `/laorenyun/healthz`。

健康端点查询 worker，返回 ready 或 degraded，无路径/秘密/付费调用；容器每 10 秒检查，单请求 2 秒、Docker 超时 3 秒、3 次失败、启动宽限 20 秒。`restart: unless-stopped`，`init: true`，停止宽限 30 秒；entrypoint 转发 SIGTERM/INT，最多 25 秒后强停子进程。DSH dispose 关闭领域 worker。健康不是云凭据有效性证明。

容器丢弃全部 Linux capabilities、no-new-privileges，日志按 10MiB×3 轮换。DSH 原生启动日志含 bearer link，仍需保护；不能声称日志完全无秘密。新增业务日志不输出全文转写或 credentials。数据目录中 DSH 会话按源记录长期积累，不自动 prune。

默认仅支持部署主机 loopback HTTP。手机通过 LAN 明文 HTTP 不满足麦克风安全上下文；将来使用已有 HTTPS 反向代理和精确 trustedHosts，同源规则保持，未实测 HTTPS 前不声称手机语音支持。不引入产品账号系统。

## 环境变量：当前生效与保留项

`.env` 由 Compose `env_file` 注入；本文件存在本身并不使普通 Node 读取它。管理员能 inspect 容器 env，按个人本地部署接受此边界。

| 变量 | Phase 1 状态 |
|---|---|
| `LAORENYUN_PROFILE` | laorenyun / laorenyun-dev，默认前者 |
| `LAORENYUN_PORT` | 宿主端口，默认 3080 |
| `LAORENYUN_PROBES` | 默认 false；true 必须是 dev |
| `LAORENYUN_MODEL_PROVIDER`, `LAORENYUN_MODEL` | 选择已在原生 DSH settings 配好的 provider/model；probes 时由 fixture 覆盖 |
| `DSH_HOME`, `LAORENYUN_DATA_DIR`, `LAORENYUN_PRESET_ROOT`, `LAORENYUN_BIND` | 发行固定路径/容器监听，非用户领域输入 |
| `DSH_TELEMETRY_DISABLED` | 固定 true |
| `LAORENYUN_LLM_PROTOCOL/MODEL/BASE_URL/API_KEY` | Phase 2 adapter 保留，当前**不读取**；不得误以为填写即完成 provider 配置 |
| `TENCENTCLOUD_SECRET_ID/SECRET_KEY/APP_ID/REGION` | Phase 2 保留；Host 凭据，浏览器不可接触；region 默认候选 ap-shanghai |
| `LAORENYUN_ASR_ENGINE`, `LAORENYUN_TTS_VOICE` | Phase 2 候选 16k_zh_en / 1001，账号与口音实测后启用 |
| `LAORENYUN_LOG_LEVEL` | Phase 2 保留；当前沿用原生 DSH 日志 |

Phase 2 启用云 provider 时必须验证缺失凭据并明确报错，不能落到无效默认值。云调用需要界面告知：腾讯处理音频/朗读文本，LLM 处理访谈文字；文字输入也可能离开本机。本项目不宣称云端 zero retention。导出含完整私人历史，交付他人前提示其范围。录音/照片是资料而不是系统指令。
