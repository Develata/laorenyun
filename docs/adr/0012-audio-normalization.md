# ADR-0012：保留浏览器原件并集中转换音频

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

浏览器MediaRecorder按feature detection选择可录格式，原样分块持久到Host；Host用最小FFmpeg构建转mono16k PCM WAV给腾讯Flash，保留原件、转换版本/hash与时间映射。不得用转换文件覆盖原件。

## 替代、代价与失败边界

腾讯Flash列表未列WebM，Chrome默认WebM/Opus不能直接当支持。限定浏览器为单一codec不符合Web目标；自写编码/重采样重造成熟通用功能。FFmpeg增加二进制和许可成本，但在容器内隔离可控，无Python/Rust运行依赖。

限制输入opaque ID/格式/大小，固定argv、禁URL/危险protocol、不走shell、有限运行时间和输出大小、kill后等待退出，失败保留原件。只构建必要功能，不能把apt默认包一概声明LGPL。

## 依据与验收

[Flash格式证据](../research/upstream.md)；[FFmpeg法律说明](https://ffmpeg.org/legal.html)；[speech执行预算](https://github.com/Develata/dsh-laorenyun/blob/main/docs/speech.md)。
