# DeepSeek Harness 集成边界

唯一 pin：[UPSTREAM.json](UPSTREAM.json)。`upstream/deepseek-harness` 是原仓库精确 Git blob 快照；[校验](scripts/verify-upstream.mjs) 对照 [原始文件清单](UPSTREAM.files.json) 验证 11,239 个文件，不把构建产物算上游源码。不是另一个 GitHub fork，也不把业务代码拷进 DSH。

## 修改预算

DSH 源码修改：**0**；agent loop 修改：**0**。原始 LICENSE、THIRD_PARTY_NOTICES、vendor/native 版权完整保留。原创发行文件在本库根、profiles/、scripts/；业务在独立插件仓库。

存在四项明确的**构建装配适配**，均在上游目录外：

1. 根据 `pnpm --filter` 的应用依赖集合编译 Host，再生成 Typert，再编译 Client；不用包含网站/所有测试的上游总聚合替代应用构建。
2. Web 的 Vite wrapper 只构建原生 index，不构建上游明确标为 experimental、发布时排除的 browser-Node preview；不改 Web/Agent 源码。
3. `packaging/` 是派生的 pnpm workspace 注入锁：两个 vendor 的 link override 改为 workspace，启用 injection，以便现代 deploy 携带 workspace peers。原始冻结锁用于编译；构建后使用派生冻结锁部署。1572 个 registry package/version/integrity 与原锁完全一致，机械校验不允许漂移。旧式 deploy 即使传 frozen 仍强制重新解析，已弃用；只设置 injection 而不转换锁会遗漏 workspace 依赖，也已弃用。

4. DSH fallback 按 lexical manifest 路径查找，不跟随 pnpm isolated layout 的中间包 realpath。`scripts/link-runtime.mjs` 在镜像构建时按实际依赖闭包补齐根 discovery 链接；不下载/复制包，不改既有 Node nearest resolution。另外显式装配上游部署闭包遗漏的三个 peer 包 `dsh-util-time`、`dsh-output-retention`、`dsh-subagent-in-process-driver` 的同 pin 编译产物。`runtime-smoke.mjs` 检查关键 Host/支线模块可导入、链接均在镜像内、无额外 Agent/编译器。真实启动验收覆盖该包装层。

## 插件依赖

`PLUGIN.json` 锁定独立仓库的完整 Git SHA。Docker 在独立构建 stage 下载该 SHA 的 GitHub archive，冻结安装、编译、打包；最终只复制包产物。不存在 sibling 本地源码复制步骤或 main/latest 运行依赖。DSH profile 引入独立包的 bundle patch，Node peers 通过 DSH 自己的 profile fallback 解析，保持单份 Cordis/DSH 实例。

## 未来同步

先记录新 pin 与 release notes，在隔离分支导入该 commit 的 blob 快照，保留 Laorenyun 根文件；重新生成原始文件清单和派生 packaging lock，验证 registry integrity 与来源。然后依次运行插件分面编译/测试、原生 composer/branch 浏览器测试、真实 Compose 重启。遇到扩展面变更只适配插件/发行包装层；需要源码补丁时先加入 UPSTREAM.json 的 corePatches 和对应 ADR/回归测试。

不得以“更新 alpha”顺便升级课程演示 pin。版本 0.1.6-alpha.1 的公开类型也不承诺稳定，尤其 reference codec、pre-step、session/subagent 目录和构建装配顺序。
