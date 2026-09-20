# v0.2.0 最终发行验证

冻结 RC6 产品实现，仅版本、精确 pin 和发行说明变化；无依赖升级、提示词/迁移/UI/DSH 源码变更。历史 [RC6](../rc6/README.md) 保留。最终双库 SHA/CI/标签回执在 GitHub Release 的 release-manifest.json；不把提交后的事实预写成已完成。

## 验证：实际执行

- 插件 `pnpm check`：82/82 测试、Host/Client typecheck、声明与 esbuild；`pnpm format:check`、`git diff --check` 通过。
- 另行 `node --test tests/river-hardening.test.ts`：4/4。1000节点、700日期/300漂流、2102边、50 BranchMemo；响应142888 bytes。发行不改变 RC6 有界策略。
- 应用 `node scripts/verify-upstream.mjs`：11239 canonical blobs，零 DSH source patches。
- `node scripts/verify-packaging-lock.mjs`：1572项 registry 版本与完整性不变。
- `node scripts/verify-release.mjs`、`node --test scripts/config.test.mjs`（4/4）、`git diff --check`。
- 用 `git archive HEAD` 导出已跟踪应用基线，覆盖仅本轮发行元数据，构成无开发缓存/私密文件的干净构建上下文；复制 `.env.example` 为 `.env`，未填任何云凭据。运行 `LAORENYUN_PORT=3102 docker compose --project-directory <clean-context> -p laorenyun-v020-fresh build` 与 `up -d --wait --wait-timeout 90`。Docker 内也完成插件82测试和打包。
- [容器](container.json)：最终 `laorenyun:0.2.0`，全新卷，healthy，UID/GID10001，cap_drop=ALL，no-new-privileges，localhost3102。`curl` 未授权请求401。镜像内 PLUGIN.json / UPSTREAM.json 与最终精确 pin 一致。镜像环境无凭据键，无 `.env`/Git credentials/构建目录；源构建上下文及 Docker ignore 排除私密输入。未宣称扫描任意第三方二进制所有字节。
- `docker compose ... restart` 后再次 `up -d --wait`；全新卷原生文字 Source/Transcript 保留，mediaId=null；Chromium刷新成功。

## 浏览器

真实 Chromium 使用最终镜像。本地执行既有 `scripts/smoke-rc6.mjs` 的临时副本，只补首次安装“稍后配置”按钮处理，产品源码未改。

- [空安装](fresh-ui.json)：老人云、空人物档案、展开侧栏、采访入口。原生 API key 引导可选择稍后配置。
- [纯文字](typed-local.json)：新一次采访、原生 composer 发送合成1976年证言；Source.status=submitted、mediaId=null，Transcript落盘。无云密钥，模型明确缺少凭据，记忆反馈“讲述已保存，记忆暂未整理完成”。这是本地提交/失败反馈验证，不是新的云抽取成功。成功抽取和实时预览证据沿用未变的 RC6。
- [完整已有内容流程](visual.json)：只读拷贝停止状态RC6合成卷到新`laorenyun-v020-synthetic`卷，localhost3103；年代筛选→漂流→日期、树、右预览、独立详情、来源/取消更正、自传、表达方式折叠/展开、设置。1440/768/360、键盘、reduced-motion，pageErrors=0。
- 本轮无需重做艺术验收：正式视觉引用[已接受RC6截图](../rc6/README.md#截图审查)，不提交重复截图。200%沿用RC6真实浏览器验收，未声称本轮重测。

首次脚本直接点侧栏被原生模型引导遮罩阻挡；修正临时脚本为点击“稍后配置”后通过。没有将 DOM 超时隐瞒为产品通过，也没有修改 DSH 处理这一正常状态。

## 阅读导出

[export.json](export.json)、[扫描/文件哈希](export-audit.json)。在最终镜像对既有接受书稿调用本地 export，再下载三文件：Markdown1363 bytes、HTML4039 bytes、JSON41255 bytes。

- Web/Markdown/HTML共享展示标题，第1章一致。
- HTML实际离线打开，无远程资源/脚本；内部链接无断链。
- 7个使用脚注，0个未用定义；当前1983修理铺故事不引用旧1982说法。
- memories.json仍有1982与1983证言/修订历史；阅读与完整归档语义不混同。
- 输出扫描无秘密/内部绝对路径。原始媒体不在三文件内，不声称完整恢复备份。

## 环境与未运行

最初沙箱内pnpm依赖状态检查无法打开外部store数据库；在授权环境重跑成功，未升级或改变锁。所有临时日志（含访问秘密）留在未跟踪私密缓存，未提交。

未重跑3本真实Biography、Tencent ASR/TTS云探针；生成和语音代码未变，历史 RC4/RC6 的付费验收仍为对应证据。本轮无付费调用，不以替身声称真实云成功。

R2 physical microphone: PENDING
R3 physical-human recovery: PENDING

无实体手机/Safari认证；无词级原声对齐。只发布源码，不发布公共二进制镜像：FFmpeg对应源码交付尚未完成。
