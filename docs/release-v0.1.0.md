# Laorenyun v0.1.0 课程源码发行

Owner：本文件是最终发行事实边界。Phase1–4历史报告保留，当前实现规范在各owner文档。日期2026-09-16。

## 状态

发布验证进行中：不能只凭本机测试宣布最终交付。最终Git/CI/镜像/浏览器回执在本文件验收后补齐。

- Phase3：PASS；Phase4：PASS。
- **R2 physical microphone: PENDING**。
- **R3 physical-human recovery: PENDING**。
- WSL无可访问实体录音输入，未用合成声音替代。作者步骤见[演示](demo.md)。

## 发布审查与修复

1. JSON请求在缓冲之后限制大小：改为streaming，80KB/10秒后再做20k字符约束。
2. GENERATION_LIMIT被统一“稍后重试”掩盖：明确显示单次容量上限，保留旧版本。
3. 未报告MIME时错误标WebM：取实际chunk类型，否则未知类型明确失败。
4. schema/发行标签/当前文档陈旧：当前schema5，镜像0.1.0，历史报告不重写。
5. 空卷demo依赖未创建的DSH profile link：改为不依赖DSH运行模块的独立fixture CLI，包外孤立启动已验证。
6. 不可能的部分凭据/协议/timeout/老人fixture配置提前拒绝。空模型+空腾讯允许本地health-only启动，不启用fake云服务。
7. 浏览器发现Renderer顺序可偏离Planner：发布正文按验证后的章节nodeRefs顺序组装，反序模型输出回归通过。
8. 首次真实CI/干净clone暴露上游`.cmd eol=crlf`检出与原LF Git blob比较不一致；校验器只还原该上游声明的换行变换，仍逐文件比对固定blob，不修改上游。
9. 无CI/可复现demo：每仓一个无云密钥CI，独立空卷合成种子与5–8分钟演示。

## 本机回归与规模

插件43项tests、Host/Client typecheck/build/format通过；发行配置4项tests通过。新增恶意证言作为data、HTML转义、AAC/MP4与Ogg/Opus/MP3真实FFmpeg转换，原有WebM/Opus、五答/冷恢复、CAS、冲突、WHAT/HOW保持。

合成规模：500当前节点、1051历史修订、1051来源/转写；有开放/已解决冲突、支线memo和多代派生产物。所有写入通过领域操作；模型为明确fixture。Node24.18.0/WSL单次计量（非SLA/p95）：

| 操作 | ms |
|---|---:|
| SQLite worker启动 | 37.13 |
| 填充规模数据 | 2212.84 |
| 长河初次500条 | 18.42 |
| 年代查询 / 翻页 | 4.02 / 6.59 |
| 单节点来源深读 | 0.77 |
| timeline search | 1.70 |
| scheduler | 28.52 |
| Persona本人80段清单 | 2.48 |
| 超限新自传拒绝 | 2.61 |

进程maxRSS约114MiB（Node与worker所在进程，非全容器峰值）。小档案固定自传清单+fixture章节约23ms，三文件发布约22ms，单纯渲染约0.53ms；不是云模型速度。大档案不会截断生成新自传；仍可导出此前8节点有效版本（JSON约26KB/HTML4.3KB/Markdown1.45KB），不是整个500节点的备份。

单次生成上限200当前节点/1000历史修订/500来源/150万清单字符；Persona最近80段本人、每段模型最多1200字。超过明确失败，不增加复杂批处理服务。长河最多500可见，来源按需10条，模型上下文有界。

## 安全与隐私

原件/文字/图存本地；腾讯处理音频与朗读文本，模型处理采访/抽取/派生所需文字。不是离线AI或云零留存。`.env`不入镜像/Git；DSH原生启动日志含秘密访问链接，需私密保存。

全历史扫描（本阶段初始）：应用11175 blobs、插件297 blobs；比对3个本机秘密值及高置信度Tencent/模型key模式，无命中。模式扫描不能证明绝对无秘密。生成HTML静态转义/CSP禁止网络；没有模型shell/fs/任意SQL权限。路径为opaque IDs，FFmpeg无shell/固定argv/有限时长输出，原件不覆盖。

## 许可与镜像

仅源码发行及本地构建，**无GHCR公共镜像**。FFmpeg Debian7:5.1.9-0+deb12u1含GPL，libvips含LGPL/MPL闭包，对应源码交付未完成，不发布不完整二进制。实际清单和检索命令见[licenses/release](../licenses/release/README.md)。MIT只覆盖原创内容。

Node镜像digest、DSH和插件SHA、npm包版本/integrity固定；OS包仍依赖Debian仓库可获取性。不承诺bit-for-bit重建，也不称全部OS传递依赖已冻结。

## 已知限制

实体麦克风/真人恢复待验；普通话地区口音覆盖有限。Safari/iOS、手机HTTPS仅以实际执行范围声明。无原件↔归一化逐字精确同步、照片采访、ZIP、导入恢复。实体合并保守；抽取不等于历史核实；自传采用受限原话编排，风格变化有限。三文件导出不是完整备份。

## 运行与演示

[README](../README.md)为新使用者入口；[部署](10-deployment.md)解释私密访问、卷和配置；[demo](demo.md)含独立项目、离线预生成与网络中断备用。
