# 课程演示：5–8分钟

Owner：发行/演示操作。合成内容不是历史事实，预生成内容不是现场AI成功。

## 准备独立演示卷

先按README构建镜像。以下命令只使用新的`laorenyun-demo`项目；**若该项目已有DB，种子会拒绝，不覆盖**。需要重新演示时换新project名，不清理真实卷。

```bash
# 用户当前生产服务无需停止；演示尚未启动时离线写独立卷
LAORENYUN_PORT=3085 docker compose -p laorenyun-demo run --rm --no-deps \
  -e LAORENYUN_DEMO=true --entrypoint node laorenyun \
  /opt/dsh-laorenyun/lib/demo.js /app/data --confirm-synthetic-demo
LAORENYUN_PORT=3085 docker compose -p laorenyun-demo up -d --wait
```

DEMO.json标明fixture/记录数/生成ID。含8条当前记忆、漂流、同年学校开放冲突、工作年份resolved纠正、self/family、关系、老师支线memo、1秒静音WAV、Persona、自传、三个文件。固定合成文字；UUID/时间每次不同。种子通过领域验证，不伪造DSH原生聊天记录，演示实时采访另开会话。

从自己的终端取原生访问链接，端口改3085，授权浏览器；链接/密钥不可入录屏。采用老人profile。提前打开长河，并下载三个文件。离线HTML在断网状态打开一次。

## 一屏检查

- [ ] Compose healthy，独立demo卷，正常老人profile
- [ ] 模型/腾讯凭据可用（不展示配置值）
- [ ] 浏览器已授权，麦克风权限/扬声器已检查
- [ ] 合成数据可見，无真实私人经历
- [ ] 已生成自传、人物表达和离线HTML
- [ ] 备用本地HTML已打开，演示不依赖每次现场生成

## 现场顺序

1. 0:00–0:40：介绍讲故事/人生长河/我的自传，说明语音到草稿、由人发送。
2. 0:40–2:00：新采访首问，短文字或实际语音答复，修改草稿再发送，展示真实追问/朗读。无真人麦克风时明确使用键盘，不声称录音验收。
3. 2:00–3:30：长河年代、漂流、记忆出处和“这里不对”预览；可取消避免演示中改预置档案。
4. 3:30–4:20：解释已整理的老师故事、五答上限和同年学校冲突。BranchMemo由合成种子预置，不冒充现场子会话。
5. 4:20–5:40：打开“我的自传”阅读，再展开“我的表达方式”及查看来源；说明WHAT/HOW、家人代述和开放冲突不选边。
6. 5:40–6:40：下载Markdown/HTML/JSON，打开断网HTML；说明未包含音频、不是完整备份。
7. 6:40–7:30：一个Compose服务、SQLite worker、固定DSH+插件，以及硬件验收状态。

## 云失败备用

Tencent失败：指出原声/转写已保留，展示已有出处，不伪装实时识别。模型失败：继续长河/纠正预览/预生成作品。完全断网：打开已下载index.html展示自传与内部来源链接。明确区分实时结果与合成预置。

## 收尾

`LAORENYUN_PORT=3085 docker compose -p laorenyun-demo stop`停止演示，保留卷。不要使用`down -v`清理任何真实档案；本课程不提供一键删除原件。

## 作者真人验收（仍需完成）

1. 新真实采访，实体麦克风说短段非敏感内容，确认原件与独立WAV保存。
2. `16k_zh`识别后手工改一处，原生发送，收到真实模型/TTS；第二答可打字。
3. 刷新、restart，核对历史、raw/edited、speaker、原件hash不变，无重复首问/旧TTS，继续一轮。
4. 仅记录格式/时长/hash/字数/延迟，不公开录音和私密故事。手机需HTTPS和DSH访问保护。
