# 周远山：合成课程演示

本目录是演示工具，不是产品运行时。全部姓名、讲述和生成内容均为虚构；没有真人音频。`seed/build.ts` 是可审阅的种子规格，通过固定插件的证言、抽取提案、纠正、支线和派生存储接口构建数据。UUID、创建时间和数据库字节不是固定值，生活材料和结构固定。

## 准备与操作

在仓库根目录运行（Docker/Compose、Node 24；首次构建需联网）：

```sh
cp demo/.env.example demo/.env
# 可选：仅在本机编辑云服务凭据，或登录后通过设置填写
node demo/demo.mjs prepare
node demo/demo.mjs status
node demo/demo.mjs stop
node demo/demo.mjs start
node demo/demo.mjs reset
node demo/demo.mjs restart
node demo/demo.mjs smoke
```

访问 `http://127.0.0.1:3085` 需要原生 DSH 授权。在私有终端使用 `docker compose -f demo/compose.yml logs` 取得登录链接；不要将链接贴到文档、截图或视频。展开人物档案，选择 **周远山（合成演示）**。

项目固定为 `laorenyun-demo`，卷固定为 `laorenyun-demo-data`。reset 验证卷所有权标签与所有附着容器的 Compose 项目标记，拒绝不匹配的卷；仅删除该演示卷。不要在此卷存放任何真实资料。保留密钥在 `demo/.env`；reset 会删除通过 Web 设置存入演示卷的凭据。

种子服务离线运行，未注册进产品。Persona/自传为显式 `synthetic-offline-v1` fixture，不是新的模型验收。现场真实调用与预置结果必须区分。种子不伪造 DSH 聊天日志，已有讲述通过记忆出处演示；真实采访使用“新一次采访”。

`.private/receipt.json` 记录应用/插件/DSH SHA、镜像 ID、人物档案 ID。`.env`、`.private/`、`output/` 不入 Git。不要公开生成的数据库或认证日志。

[七分钟讲稿](../docs/demo.md) · [公网备用部署](../docs/demo-public.md)

## Fixture 与生产的明确边界

BranchMemo 生产接口当前只允许空关联列表。此处沿用插件 `tests/fixtures/river-scale.ts` 的显式投影 fixture 机制，在离线数据库中给已合法生成的 memo 关联两条实际支线记忆；不新增图边，不声称是支线模型自动关联。其余证言/修订/抽取/派生均走现有领域操作。演示作品使用 narrative-v2 契约，但 Writer/Reviewer 是确定性 fixture，不是事实准确率或文学质量的模型验收。

生命周期操作有互斥锁。进程被强制杀死后若留下 `demo/.private/operation.lock`，先确认没有仍在执行的操作，再只移除这个空锁目录；不得通过清理卷来绕过错误。prepare 中断后如无有效 receipt，明确执行 reset 重建，不合并半完成种子。

浏览器复演（开发机已具备项目 Playwright 时）：`node demo/scripts/browser.mjs`。可用 `DEMO_BROWSER_RUNTIME` 指向已有 Playwright 包目录；它不是部署运行依赖。无云配置时预置浏览仍可用。

若开发机尚无 Playwright，可把固定版本仅安装到忽略的测试目录（不是产品依赖）：

```sh
npm install --prefix demo/.private/browser --no-save --package-lock=false playwright@1.61.1
./demo/.private/browser/node_modules/.bin/playwright install --with-deps chromium
DEMO_BROWSER_RUNTIME="$PWD/demo/.private/browser" node demo/scripts/rehearse.mjs
```

复演会三次重置演示卷，第三次临时使用本机不可达模型端点，结束后恢复 `.env` 并重新应用原配置。运行前不要在此卷存放真实资料。`node demo/scripts/export.mjs` 检查并复制预置阅读输出至 `demo/output/export/`；GitHub中的 `demo/assets/export/` 是一次明确标记的合成快照，可直接离线展示。
