# Phase 2 本地镜像软件清单

`ffmpeg-buildconf.txt` 与 `debian-packages.tsv` 来自实际非root Compose 容器（2026-09-15）。FFmpeg固定Debian 7:5.1.9-0+deb12u1，启用GPL，没有nonfree。完整软件包版权保留于镜像 `/usr/share/doc/*/copyright`；SDK37项许可在 `/opt/dsh-laorenyun/lib/third-party`。

此清单不是对应源码交付或法律许可替代物。本阶段不发布registry镜像；二进制再分发前须按实际组件完成对应源码、构建材料及相应许可证要求，见[根notices](../../THIRD_PARTY_NOTICES.md)。只读记录构建事实，不包含用户音频、凭据、模型权重。
