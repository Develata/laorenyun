# 发布操作与容器分发

Owner：本文件拥有当前发布流程、门禁和不变性政策。历史 [v0.2.0](release-v0.2.0.md) 源码发行边界不改写。

## 当前状态

已发布 v0.2.0 源码；支持本地 Docker 构建。**GHCR publication remains disabled**：实际镜像闭包的对应源码/构建材料尚未完整归档和审查。新工作流的 dry run 可执行输入、构建、浏览器、清单/归档校验，但必须在源码完整性门禁失败；不得将其描述为容器发行成功。

本阶段不增加版本、不创建 tag、不回填 v0.2.0 二进制。未来首次容器发行优先新版本（例如 v0.2.1），只有全部门禁通过才创建对应发布。

## 受保护的 main

两库都使用 active rulesets，匹配 `refs/heads/main`，无 bypass：

| 仓库 | main-integrity | main-ci | API 确认的 check |
|---|---|---|---|
| laorenyun | 23732458 | 23732459 | `distribution`（GitHub Actions app 15368） |
| dsh-laorenyun | 23732460 | 23732462 | `check`（GitHub Actions app 15368） |

完整性规则禁止 deletion 和 non-fast-forward；CI 要求严格更新到 main 后检查通过。没有额外审批人数、CODEOWNERS、签名、线性历史或 conversation resolution 要求。管理员也无绕过；不测试对 main 的破坏性操作。

日常工作：短分支 → push → CI → PR merge。不要先推 main 再等 CI；失败时修复分支，不能临时关闭规则。有效状态用 `gh api repos/Develata/<repo>/rules/branches/main` 读回。

## 版本与不可变输入

1. 插件更新 package version，完成 `pnpm check`、format 和 CI，经 PR 合入后创建同名版本 tag。
2. 应用 PLUGIN.json 固定该插件完整 SHA，version、Docker 打包文件名和本地 Compose tag 同步；DSH pin 不随发行升级。
3. 应用通过本地检查、固定镜像验收、main CI 后，才创建相同版本的 annotated tag。
4. `scripts/release/inputs.mjs` 核对真实远端 tag → checkout SHA、插件 tag → pin、插件 package version、DSH pin 和上游完整性；缺少或不匹配即失败。

已发布 tag 永不移动；新代码必须新版本。已有 SemVer 镜像只允许原字节，不能用“重建同一版本”覆盖。main 本身不自动 bump 版本。

## 工作流与权限边界

[Container release](../.github/workflows/release-image.yml) 由 `v[0-9]*` tag 或 `workflow_dispatch` 触发。手动运行只允许选择 main 上经审查的工作流，输入必须是已存在的合法 tag，不能是任意 branch SHA。

```text
immutable inputs → deterministic checks
                 → one linux/amd64 build → fresh-volume Chromium + restart
                 → actual image inventory → source material bundle → source gate
                                                           ↓ only on success
                                     docker save + checksums + acceptance receipt
                                                           ↓
                          publication job: verify / docker load / push same image ID
                                                           ↓
                                registry digest + source assets + pull-only Compose
```

默认只有 `contents: read`；仅最终 job 拥有 `contents: write`、`packages: write`。普通 Distribution CI 没有发布权限。source gate 输出 `allowed=true` 前，publish job 不启动；dry_run 无论门禁结果都不启动 publish。

镜像仅构建一次，Dockerfile 内完成固定安装/锁校验/插件测试；publish 不运行 Docker build。传输 tar.gz 包、image ID、SHA256、输入/验收回执、源码包和manifest；短期 Actions image artifact 保留1天，安全审计JSON保留7天，不上传访问URL或容器日志。所有下载、子进程和job有限时。

## 容器源码交付门禁

[锁文件](../licenses/container/sources.lock.json) 是审查入口；[实际清单脚本](../scripts/license-inventory.mjs) 是包身份清单 owner，不再手写第二份运行包列表。每次从被测试镜像取 Debian binary/source package/version、npm 包（含全局工具）、构建候选清单及 sharp `versions.json`，记录 image ID 和 inventory SHA256。

门禁以实际分发内容和许可证义务为边界：

- 实际安装的 Debian、npm/Node 全局包、原生库均属分发内容；按实际 copyright/许可证逐项审核。独立 MIT/BSD/Apache 等组件交付必要 notices，不因 `deb:`/`vips:` 前缀强制源码。未知或自定义条款不自动豁免。
- `buildClosure` 只是构建安装清单及通知材料的超集，不是分发清单。仅用于构建且未进入镜像或输出的工具不要求对应源码；打包进 DSH/Web/Corepack/Yarn 的代码仍须由实际产物证据识别。缺少此归属证据时，门禁报告 `BUNDLED_CLOSURE_UNREVIEWED`，不会把未知当不存在。
- GPL/LGPL/MPL 等适用组件继续交付相应范围的源码、修改及构建材料。LGPL 组合库还须满足可修改/重链接条件；MPL 按 covered files 范围审核。独立容器包的简单聚合不自动扩展为整个镜像 copyleft。
- permissive 代码若构成需要交付的组合库源码，不因自身许可证宽松而从该库构建闭包删除。`combination: corresponding-source` 明确要求源码；独立组件记录 `independent`。不是要求交付所有通用编译工具。
- 许可证 `OR` 可选择允许的分支，notice-only 必须记录明确的 `licenseChoice`；`AND` 同时满足两侧。未识别条款、例外或选择不能自动放行。
- 每个 reviewed component 显式列出 `shipped` identities 与 `noticeCoverage`。聚合 source package 不能省略旗下 binary；npm 重复安装位置也必须覆盖。notice 路径绑定实际镜像文件 SHA256，并与归档中的相应材料逐字节一致；缺失、重复归属或不匹配均失败。
- downloads 仅接受 HTTPS、预审 SHA256、固定安全路径；新增组件/版本没有 disposition、缺失 notices 或需要的源码材料仍失败。

`container-source-manifest.json` 记录 image ID、inventory hash、每项 identity/license/review、sources/buildMaterial/notices 和逐文件SHA256。tar 使用排序、固定mtime/uid/gid和无时间戳gzip；stream verifier逐文件哈希、拒绝路径外逸、软/硬链接、重复和额外成员，不解包不可信内容。清单或材料不匹配即拒绝。

**目前生成的是不完整的 audit bundle**（`container-sources.tar.gz`），含实际许可通知、pin、FFmpeg配置/链接信息、完整同版本Debian FFmpeg源包及sharp-libvips固定版本构建仓库，但不含其他组件的完整对应源码；不是完整 corresponding-source bundle，不可作为放行凭据。具体缺口见 source-gate.json。SBOM只可作索引，不能代替这项判断。

官方依据：[FFmpeg legal](https://www.ffmpeg.org/legal.html)、[GNU GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html)、[sharp-libvips build](https://github.com/lovell/sharp-libvips/tree/v1.3.2)。本门禁是项目工程交付政策，不宣称对所有司法辖区给出法律保证。

## Dry run

合并工作流后，可显式验证旧tag，绝不移动它：

```bash
gh workflow run release-image.yml --repo Develata/laorenyun --ref main \
  -f tag=v0.2.0 -F dry_run=true -F allow_backfill=false
```

本地等价：输入校验 → `docker build --platform linux/amd64` → `scripts/release/acceptance.mjs` → `scripts/release/sources.mjs` → `scripts/release/verify-bundle.mjs`。浏览器脚本沿用已验收的原生 composer/slot 交互，在临时新卷运行，结束只删除其自身测试卷。无key时只断言新文字来源持久化，不声称云抽取成功。

## 发布、digest 与回填

全部门禁通过后，版本别名为 `ghcr.io/develata/laorenyun:<semver>` 和 `sha-<full-app-sha>`，linux/amd64；不维护 latest。已存在别名先读取实际 config image ID，不一致即拒绝；一致时复用，绝不覆盖。push后按registry digest拉回核验 image ID。

`compose.release.yml` 从已验收源Compose生成，移除build并固定 `ghcr.io/develata/laorenyun@sha256:…`，保留 localhost、env、卷、非root、health和安全选项。发布 `image-digest.txt`、source manifest/bundle、inventory、验收回执、release-provenance.json 和 SHA256SUMS。image tar 本身不是GitHub Release附件。

新Release先建draft并附源码，再推已测镜像、核对digest、添加部署资产，最后转公开。GitHub与GHCR无法跨服务事务原子提交：若最后一步失败，保留draft/source和不可变镜像，修复后显式回填，不删tag掩盖失败。

已有Release仅 `workflow_dispatch` 且 `allow_backfill=true` 才允许追加；不修改正文、tag和无关资产。同名资产必须逐字节相同，否则停止。v0.2.0原文说明source-only，回填须单独明确审查其历史表达，当前不会自动执行。

首次镜像推送后还须验证 package visibility 和无凭据匿名pull；未证实则报告不能匿名读取，不自动修改账号级设置。现在尚未发布，未验证匿名pull。

## 供应链证据与回退

保留源commit、插件/DSH SHA、镜像ID、registry digest、source bundle和release asset SHA256。当前未生成原生attestation；SBOM可由现有成熟工具独立产生，但发布job不请求不需要的id-token权限。并不声称逐字节可重复构建。

回退运行时选择旧digest及与其schema兼容的数据备份，不能用旧程序写新schema。任何后续修复使用新版本（如v0.2.1），不能修改已发布tag/镜像。R2/R3硬件pending与来源/二进制发行门禁独立。
