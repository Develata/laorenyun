# v0.1.0 本地镜像许可边界

本次交付源码及本地Compose构建，不发布GHCR二进制。原创MIT不覆盖第三方。Dockerfile/清单不是对应源码交付，也不是书面源码要约。公开镜像发布前须提供实际闭包的对应源码、构建脚本及适用许可材料，特别是FFmpeg/GPL、libvips/LGPL及其MPL依赖、Debian组件。

FFmpeg：Debian `7:5.1.9-0+deb12u1`，源包`ffmpeg`同版本。实际`--enable-gpl`，无`--enable-nonfree`。`/usr/share/doc/ffmpeg/copyright`全文保留于镜像；各链接库自己的copyright同样保留。源包可在启用匹配bookworm/bookworm-security `deb-src`后用：

```bash
apt-get source --download-only ffmpeg=7:5.1.9-0+deb12u1
```

这是检索命令，不是“已提供所有对应源码”的声明。官方说明：[FFmpeg legal](https://www.ffmpeg.org/legal.html)、[Debian源码](https://sources.debian.org/src/ffmpeg/)、[Debian快照](https://snapshot.debian.org/package/ffmpeg/)。固定源包版本如离开当前镜像站，应取快照；GPL合规不能仅依赖外部链接仍然有效。

完整许可位置：DSH/Cordis/Web闭包在`/opt/laorenyun/licenses`，腾讯SDK37项在`/opt/dsh-laorenyun/lib/third-party`，Node完整LICENSE在`/opt/laorenyun/licenses/node`。`manifest.json`是实际构建的索引，不取代许可原文或源码义务。OS清单含source package/version；SBOM若生成另记工具和范围。

补齐了npm tarball未附独立LICENSE的SDK/UI组件原文（pi、xterm、AWS等），来源/commit/hash在supplemental.json。`revisionFromPackage=false`表示取到的许可证来自固定仓库快照，而不是证明发布包的对应源码版本；二进制分发仍禁止。data-uri-to-buffer完整MIT在README内；node-addon-system由native-system许可证覆盖；libvips单独保留。包递归清单包括fast-uri内benchmark元数据，不是额外安装运行依赖。

FFmpeg二进制SHA256：`0dafc1360bb07743f76abeb1e4ae16b0aaa1331e9041a0e8d6a8524111dc0cbb`；copyright SHA256：`7447a836ec8522b699ba022d5de6c9ab39cd1682054facf550ce84589f161e2a`。x264源`2:0.164.3095+gitbaee400-3`，x265二进制`3.5-2+b1`对应源`3.5-2`；完整链接闭包见OS索引。

SBOM使用已安装Docker Scout1.24.0生成SPDX2.3（1126 package records，包含工具识别的嵌套元数据，不等于535项人工运行索引）。不手写SBOM。SBOM作为独立release附件，不打进被索引镜像，避免递归/误称全部源材料已交付。
