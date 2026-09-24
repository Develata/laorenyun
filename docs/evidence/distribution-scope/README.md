# 实际分发闭包再审计

本次只修改发行门禁/材料，不改产品、固定 DSH 或发布标签。审计镜像身份见 [receipt](receipt.json)。这是不完整审计，**GHCR 仍禁止发布**。

## 已纠正的边界

- 1020 项 build installation 候选不再全部当成已分发代码。构建工具自身许可不决定输出许可；实际打包进入输出的代码仍须审核。
- Debian/native 包前缀不再决定 source 必选。独立 permissive 组件可交付通知；许可证 AND/OR 分别处理，OR 的实际选择要明确记录。
- GPL/LGPL/MPL 要求不降级。permissive 组件若属于需要交付源码的组合库，其必要源码/修改/构建材料仍计入。
- 旧清单遗漏全局 npm/Corepack/Yarn。扫描已补充，实际 npm 身份从旧审计的 535 增至当前 671。新旧数字仅用于发现扫描范围差异，不是运行依赖升级。

## 仍需闭合的真实证据

1. DSH/Web、Corepack/Yarn 实际 bundled inputs 与输出的归属。构建候选清单不能证明全部进入输出，也不能证明全部没进入。当前 scanner 明确返回 incomplete；须补充构建到产物的证据后才能 complete。
2. 每个实际分发组件的许可证/通知及组合方式审查。未审查项数量不是需要下载源码的数量。Debian 不能仅凭软件包名称猜测许可；按镜像 copyright 及 binary/source version 获取需要的 `.dsc`、源码和 Debian 修改。
3. sharp-libvips 固定构建脚本会修改 librsvg 配置后执行 `cargo update --workspace`；需要交付组合库所用的 Rust 代码与修改材料。`--workspace` 只更新 workspace 包，不等同于无锁升级所有依赖；可据发布归档自带 Cargo.lock、固定修改和实际 target 重建所需源码集合，不要求必须找回上游 CI 私有缓存，也不要求位级复现。当前尚未完成该集合的核实和 vendoring，不能把今天任意解析的依赖假称为对应源码。
4. 构建脚本引用 libultrahdr PR 383 的可变 patch URL。应核定构建时所用内容，不能只拿当前 URL 冒充固定材料。通用编译器工具链不因使用过而全部进入对应源码交付范围。

已取得 9 份新增源码归档（glib、libexif、libheif、fribidi、pango、librsvg、libvips、cairo、proxy-libintl）及 2 份固定 patch。这些材料 的 URL/SHA256 保存在 `licenses/container/sources.lock.json`；下载归档完整性经检查。原有 FFmpeg 精确 Debian source 包与 sharp-libvips 固定构建仓库继续保留。下载到一份源包不等于整个组合库义务完成，因此没有把新增材料直接标成已完成的 component disposition。

## 验证

- 实际镜像扫描、材料打包及逐文件字节校验已运行。
- `verify-bundle.mjs` 明确拒绝不完整审计包（负向验证）；没有 registry 写操作。
- 上游 11239 个规范 blob 检查通过，0 source patches。
- 隔离 checkout 首次 packaging-lock 检查缺少 `js-yaml`；随后通过 `NODE_PATH` 复用原应用 checkout 的已安装依赖重新验证：1572 项 registry 版本/完整性未变。未安装或升级依赖。
- `node --test scripts/config.test.mjs scripts/release/*.test.mjs`：14/14 通过。门禁测试覆盖构建候选排除、实际 bundled copyleft、组合库、MPL/LGPL、AND/OR、错误许可选择、材料缺失、归档路径/链接注入与 immutable publication 边界。

许可证依据：镜像中保留的 GPL/LGPL 文本、[Mozilla MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)、[FFmpeg legal](https://www.ffmpeg.org/legal.html)、固定 [sharp-libvips 构建仓库](https://github.com/lovell/sharp-libvips/tree/4da6d14c0d59866adfb9d8cf52bcaa53846dc4f6)。构建脚本是取证来源，不是替代对应源码的链接承诺。

## 后续 accounting / attribution 审计（PR #4，仍为 Draft）

上面的旧回执是 **904 unreviewed component dispositions + 2 个全局问题 = 906 total gate problems**，不是 906 个待下载源包；保留旧回执不覆盖。

新增机械约束：每个 component 的 `shipped` 必须精确覆盖 scanner 发现的安装身份；Debian 同一 source identity 下每个 binary package、npm 同版本每个安装位置都保留。`noticeCoverage` 将实际镜像 notice 路径逐个映射到材料路径，门禁要求 SHA256 一致、材料存在且列入 notices。遗漏、重复归属、外来身份、错用另一个 LICENSE 均失败。此约束证明已发现 notices 的覆盖；它不能替代对嵌入代码、非标准许可文件或条款的人工审查。

DSH/Web 发行构建加入公开 Rollup/Rolldown `writeBundle` hook，记录实际 chunk modules、源文件哈希和最终输出哈希。部署后的文件再按字节关联这些记录，并递归追踪中间 Client bundle；不会把整个安装图当成打包输入。报告保留 incomplete：第三方预打包代码、Corepack/Yarn 内嵌依赖仍需单独证据，不由此自动宣布整个镜像 closure 完整。DSH 上游未修改。

### librsvg Rust 材料

原始 2.62.90 Cargo.lock 有 348 个 registry identities。应用固定 sharp 脚本的 GIF/WebP、Cairo PDF/PS feature 修改后，`cargo update --workspace --offline` 没有新增/升级外部版本，只移除 color_quant 1.1.0、gif 0.14.2、image-webp 0.2.4。345 个剩余 crate 已用 `cargo vendor --locked` 获取，并逐文件核对 `.cargo-checksum.json`。

[生成脚本](../../../scripts/release/vendor-librsvg.py)保存原/新 Cargo.lock、feature patch、离线 vendor 配置和源码。它获取原锁所需 registry 材料后离线更新 workspace，拒绝外部身份变化。归档是含测试/构建源的安全超集，不声称每个 crate 都进入二进制，更不把每个 crate 都列为独立对应源码义务。生成归档 SHA256 锁在 `sources.lock.json`；材料完成不代表整个 libvips 组合库已获准分发。

### mutable patch 的实际证据

GitHub API 查得：sharp-libvips 固定提交 4da6d14 的提交时间为 2026-06-30T08:50:50Z，v1.3.2 发布于同日 09:50:15Z。libultrahdr PR 383 当前包含 e2daed8（2025-12-10）和 7af3588（2026-09-10），2026-09-18 才合并。当前 PR patch 因此不能直接充作六月构建的材料。旧提交可作为进一步核对的候选，但时间先后本身不能证明原二进制究竟用了哪些字节；未将候选冒充已确认输入。若无法闭合，首次公共容器发行应使用新版本与固定输入重建，不回填猜测的 v0.2.0 镜像。

## 完整材料下载与实际 Web 产物读回

[source-material-receipt.json](source-material-receipt.json) 分开记录两个镜像，不能混用身份：

- 原本地审计镜像的 206 个 Debian source identities 对应 661 个 `.dsc` / orig / Debian 修改 / 签名文件（984,872,940 bytes），全部匹配由 apt 的 source 元数据取得的 SHA256。可复用的 URL/哈希进入 sources.lock.json；身份→归档索引在 licenses/container/debian-source-identities.json。它是实际运行时源包的材料超集，不把 permissive package 自动改判为 source-required。所有组件仍须分别审查。
- sharp-libvips 构建脚本中 28 个版本的源归档已取得，另有固定 patch、构建仓库和 345-crate Rust vendor 材料。历史 mutable patch 与组合库交付审查仍未闭合。
- 扩展后的本地审计包有 2804 个文件，1,181,539,287 bytes；完整性校验通过，但发布门禁仍拒绝：905 unreviewed component dispositions + 2 个全局问题 = 907 total gate problems。多出的 component 是新显式清点的 Node executable；旧 906 项回执保留原语境。
- 远端 b465dcc 的 Distribution CI 成功。实际 647 个部署产物关联 312 个 DSH/Web 包；unresolved inputs = 0，missing bundled notices = 0。此前 Vite asset origin 是相对于 apps/web 的路径，现已用独立 inputRoot 修正，并补 apps/web 的上游通知。这个结果只闭合这一组归属，不等于 Corepack/Yarn 等预打包代码完成审查。
- Node 24.21.0 完整上游 LICENSE（含其第三方通知）加入镜像，scanner 单独记录 executable version/hash，避免 npm inventory 遗漏 Node 本身。sharp 的第三方通知、GPL/LGPL 文本也纳入 notice coverage。

仍没有公共镜像、没有新 tag。首次公开镜像必须在上述剩余审查完成后以新版本发行；构建成功不代替分发批准。没有产品代码、DSH、个人数据或云凭据变更。
