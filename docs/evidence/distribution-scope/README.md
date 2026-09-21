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
3. sharp-libvips 固定构建脚本会修改 librsvg 配置后执行 `cargo update --workspace`；需要匹配实际组合库的 Rust 代码与修改材料。不能把今天重新解析的依赖假称为已分发二进制的对应源码。
4. 构建脚本引用 libultrahdr PR 383 的可变 patch URL。应核定构建时所用内容，不能只拿当前 URL 冒充固定材料。通用编译器工具链不因使用过而全部进入对应源码交付范围。

已取得 9 份新增源码归档（glib、libexif、libheif、fribidi、pango、librsvg、libvips、cairo、proxy-libintl）及 2 份固定 patch。这些材料 的 URL/SHA256 保存在 `licenses/container/sources.lock.json`；下载归档完整性经检查。原有 FFmpeg 精确 Debian source 包与 sharp-libvips 固定构建仓库继续保留。下载到一份源包不等于整个组合库义务完成，因此没有把新增材料直接标成已完成的 component disposition。

## 验证

- 实际镜像扫描、材料打包及逐文件字节校验已运行。
- `verify-bundle.mjs` 明确拒绝不完整审计包（负向验证）；没有 registry 写操作。
- 上游 11239 个规范 blob 检查通过，0 source patches。
- 隔离 checkout 首次 packaging-lock 检查缺少 `js-yaml`；随后通过 `NODE_PATH` 复用原应用 checkout 的已安装依赖重新验证：1572 项 registry 版本/完整性未变。未安装或升级依赖。
- `node --test scripts/config.test.mjs scripts/release/*.test.mjs`：14/14 通过。门禁测试覆盖构建候选排除、实际 bundled copyleft、组合库、MPL/LGPL、AND/OR、错误许可选择、材料缺失、归档路径/链接注入与 immutable publication 边界。

许可证依据：镜像中保留的 GPL/LGPL 文本、[Mozilla MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)、[FFmpeg legal](https://www.ffmpeg.org/legal.html)、固定 [sharp-libvips 构建仓库](https://github.com/lovell/sharp-libvips/tree/4da6d14c0d59866adfb9d8cf52bcaa53846dc4f6)。构建脚本是取证来源，不是替代对应源码的链接承诺。
