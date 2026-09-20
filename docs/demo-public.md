# 私有演示的公网备用部署

这是**可从互联网访问的私人演示备份实例**，供演示者使用，不是开放 SaaS，也不承诺多人安全。没有默认域名或 VPS。主机未配置时，本文是部署包，不是已上线证明。

## 固定源码部署

服务器需要 Docker/Compose、Node 24，以及已有的 HTTPS 反向代理/访问控制。下面 COMMIT 必须替换为已通过 CI 的完整应用提交 SHA，不能使用 main：

```sh
export COMMIT='<经过审核的40位应用提交SHA>'
git clone https://github.com/Develata/laorenyun.git laorenyun-demo
cd laorenyun-demo
git checkout --detach "$COMMIT"
cp demo/.env.example demo/.env
chmod 600 demo/.env
# 在服务器本地填写凭据，不通过命令行参数传入秘密
node demo/demo.mjs prepare
node demo/demo.mjs smoke
```

检查 `demo/.private/receipt.json`：固定应用、插件、DSH 和本机镜像身份。公网二进制发布的对应源码门禁保持关闭；这些命令在主机本地构建，不依赖 GHCR。

## HTTPS 与双层认证

在已有 host-level Caddy/Nginx 或 Cloudflare Access 上配置域名与 TLS。不要修改核心 Compose 添加强制代理服务。应用仅监听 `127.0.0.1:3085`，防火墙不开放 3085；仅向必要来源开放 SSH，对互联网提供 HTTPS 443。

反向代理必须支持 WebSocket，并在**所有路径**执行 Cloudflare Access 身份策略或 Basic Auth（包括 WebSocket 升级/API/媒体）。例如已有 Caddy 主机可以加入下列模板；域名和密码哈希由管理员配置，不能直接照抄示例为有效部署：

```caddyfile
{$LAORENYUN_DEMO_DOMAIN} {
    basic_auth {
        presenter {$LAORENYUN_DEMO_PASSWORD_HASH}
    }
    reverse_proxy 127.0.0.1:3085
}
```

使用主机私密配置传递密码哈希，限制文件权限；不要把密码写入 Git、Compose 或聊天。保留 DSH 原生认证作为第二层。首次 DSH 登录只在私密窗口完成；清理含秘密的地址栏后再投屏。不要关闭 Origin/访问检查。

上线后从外网验证：未认证请求被入口拒绝；仅入口认证而无 DSH 会话仍不能写 API；双层认证后 WebSocket/页面正常；HTTPS 证书有效，浏览器显示 secure context。真实麦克风验收必须由人完成，不能用 Playwright 代替。

## 运维与回退

- `node demo/demo.mjs status` / `smoke`：无秘密状态。
- `restart`：保留演示卷；`reset`：重建合成内容。
- 更换源码使用新 checkout 和记录，不移动已发布 tag。
- 下载预置离线 HTML 到备用设备；它是阅读输出，不是完整备份。
- 依赖原有有限上传、模型超时、并发和 Branch 上限；入口认证防止外人消费云额度。

## 现场笔记本故障时怎么办（约45秒）

1. 换一台有电、有网络的设备。
2. 打开事先收藏的 HTTPS 演示域名。
3. 完成入口认证和已准备的原生 DSH 授权。
4. 选择“周远山（合成演示）”。
5. 从人生长河继续，直接展示预置自传与导出，不需要现场 SSH。

**上课前必须在备用设备完成一次登录演练。** 未真正部署/测试的公网地址不能算已就绪的备用机。

参考：[浏览器安全上下文要求](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)；[Caddy basic_auth](https://caddyserver.com/docs/caddyfile/directives/basic_auth)。Caddy 使用哈希而非明文密码；模板尚不能替代对实际主机 TLS、认证和 WebSocket 的上线验收。
