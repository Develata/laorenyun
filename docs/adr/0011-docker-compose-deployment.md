# ADR-0011：单镜像 Compose 发行

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

唯一支持发行路径：Docker image + docker compose + .env。一个服务、一个持久数据卷，无宿主Node/pnpm/Python/Rust/Tencent工具。多阶段构建、冻结依赖、非root、健康检查、有限停机、回环显式端口与restart策略。

## 替代、代价与失败边界

裸机手装不符合目标。DSH CLI拒绝--host 0.0.0.0，而webserver Config支持；通过profile配置容器监听，宿主只127.0.0.1发布，保留DSH原生token/cookie和Origin校验。不是新增账号系统，也不删除访问保护。

手机录音需要可信HTTPS，默认loopback只保证部署主机可用条件；不以LAN明文HTTP冒充移动支持。Phase0不构建镜像，后续digest/native产物/实际闭包与volume权限必须实际验证。

## 依据与验收

[唯一环境/部署owner](../10-deployment.md)；[DSH接入G3](0013-dsh-integration-seams.md)。
