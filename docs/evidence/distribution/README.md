# main 保护与容器分发审计 · 2026-09-20

这是 v0.2.0 之后的工程记录，不修改已发布版本。产品代码、DSH、插件 pin、版本均未改；本阶段没有创建新 tag、镜像或 GitHub Release。

## 已执行的保护

`gh auth status` 有效，两库 `viewerPermission=ADMIN`。最初沙箱无法连接代理导致认证检查失败；获准联网后确认认证正常，没有要求更换 token。

API 实际 check-runs：应用 `distribution`、插件 `check`，app ID 15368，发布基线结果 success。创建前两库 rulesets 为空，classic protection 返回404。

分别创建 main-integrity/main-ci 后，用 `/rules/branches/main` 读回，见 [应用](app-effective.json)、[插件](plugin-effective.json)。两库禁止非快进、禁止删除、严格必需CI，无 bypass，无新增审批/签名/线性历史要求。没有执行破坏性探测。

## 本地实际镜像

对固定 v0.2.0 输入重新执行 `docker build --platform linux/amd64 -t laorenyun:distribution-audit .`，构建成功，镜像 ID `sha256:1de03d5dd9321be9572e743beb09764e48d628534f6f7edf2519301a8ac9ef7d`。它与原 v0.2.0 本机镜像 ID 不同，未声称逐字节可重复，也未覆盖已发布tag。

- 290 Debian binary packages，206 distinct source package/version。
- 535 项 runtime npm 元数据；build-closure 1020项是许可收集超集，不能误称都在运行。
- sharp-libvips 1.3.2，vips 8.18.3，versions.json 共28项原生成分。
- FFmpeg binary/source `7:5.1.9-0+deb12u1`，构建含GPL；无擅自升级DSH/依赖。

新卷/无云凭据下，真实 Chromium 验证老人云、原生文字提交、Source→Transcript且mediaId=null、非root、localhost、401、持久卷和restart后来源仍在；见[安全回执](acceptance.json)。未声称新云抽取成功，没有重复付费Biography或腾讯测试。

本地测试脚本曾遇到首次欢迎页/模型配置弹窗的加载顺序，修正等待后通过；仅改发布验收脚本。许可收集最初遇到Debian损坏NEWS软链，改为按实际包读取copyright及公共许可，未忽略版权文件错误。

## 源材料与拒绝结果

实际收集镜像内Debian版权/通用许可、DSH/Web闭包通知、腾讯许可、现存libvips脚本、pin、FFmpeg buildconf/ldd；额外取得官方Debian同版本dsc、orig、orig签名、Debian patches，以及固定tag解析出的完整sharp-libvips构建仓库。各下载固定HTTPS URL和SHA256，FFmpeg三份源档案哈希核对官方dsc的Checksums-Sha256；没有声称额外PGP签名信任链验证。

仍缺其他Debian源包/链接闭包、libvips组件源码/补丁/vendor材料与逐组件完整审查。源码包流式字节校验通过 **不等于** source gate通过；门禁明确失败，`publicationAllowed=false`，publish必须跳过。

[汇总与材料hash](summary.json) 是本地本次采样；完整audit bundle与manifest由本地 `artifacts/distribution-complete-audit/` 或工作流临时审计artifact保留。它是不完整源码审计包，不是获准交付的完整对应源码。

## 验证边界

已运行命令由下方后续回执补充。发布流程没有 registry 写入、未做匿名pull；不把测试fixture的模拟完整清单当真实发布成功。GitHub/GHCR发布路径目前只做静态与负向门禁验证，待真实源码材料闭合后才能运行正向验收。

## 本地确定性验证

插件 `pnpm check` 82/82、`pnpm format:check`、`git diff --check` 通过。应用配置4项+release契约/归档/权限6项共10/10；上游11239文件零修改、1572项包装锁、发行版本/链接校验及diff检查通过。隔离工作副本没有上游node_modules，包装锁校验通过NODE_PATH复用本机固定依赖；Docker仍用自己的冻结安装，不依赖此路径。

YAML使用已有js-yaml解析；没有安装新产品依赖。真实tag/pin校验、GitHub CI、dry run结果在随后远端回执中记录，未运行项目不提前声称通过。

## 辅助 SBOM 与 registry 只读探测

已安装 Docker Scout v1.24.0 生成 SPDX-2.3（1126 package records，含工具识别的嵌套元数据）；[回执](sbom.json)记录hash，不据此放行源码义务。没有为CI添加大型扫描工具或新的写权限。

匿名只读 `docker buildx imagetools inspect --raw ghcr.io/develata/laorenyun:0.2.1` 返回 token endpoint 403；未发生push，不把认证失败当tag不存在，也不声称匿名pull可用。

新审计/浏览器临时文件位于gitignored artifacts；同时从Docker build context排除，防止本地诊断进入上下文。

## 远端实际执行

[手动 dry run 35525639258](https://github.com/Develata/laorenyun/actions/runs/35525639258) 使用 main 上的工作流验证原始 v0.2.0，`dry_run=true`、`allow_backfill=false`。输入、release tests、Buildx单次构建、真实Chromium新卷/文字/重启、实际清单和材料打包均 success；source gate failure；publish skipped。没有保存/上传待发布image artifact，没有登录/push GHCR。

[运行摘要](dry-run.json) 区分工作流commit与被构建的历史tag commit；[远端容器验收](remote-acceptance.json)记录实际镜像ID。该流程整体为failure，属于预期拒绝，不称镜像发行PASS。完整失败条目和不完整材料包可在运行的distribution-audit artifact中下载（保留7天）；本地副本和hash另行保留。

应用基础设施由[PR 1](https://github.com/Develata/laorenyun/pull/1)经两项Distribution CI通过合入，插件文档由[PR 1](https://github.com/Develata/dsh-laorenyun/pull/1)与[PR 2](https://github.com/Develata/dsh-laorenyun/pull/2)正常合入。未使用admin bypass、未直接push main、未移动tag。

README参考StickyMD的产品首屏、少量badge、单主图与折叠深读；参考dsh-learning-helper用可观察的用户流程解释能力和区分演示/真实验收。未参考learning-helper的上游README作为产品文案模板。RC6图片复用，无新增假截图。

## 最后材料稳定性复核

复核本地/远端材料时发现ldd输出含ASLR虚拟地址，可能使同镜像审计包漂移。仅在报告中去掉地址，库名/路径不变；新增确定性测试，最终配置+release测试11/11。对同一固定镜像两次独立获取和收集后，tar.gz与manifest均由cmp确认逐字节相同，见[回执](determinism.json)。这是材料包的同输入稳定性，不是镜像可重复构建证明；两次source gate仍不允许发布。先前远端dry-run回执保持原样，未为此重复构建或付费云测试。
