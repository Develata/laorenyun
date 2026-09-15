# ADR-0013：公开接入面的验证门槛

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

保留DSH编辑器、会话及子代理，用公开slots/Remote/pre-step适配。以下是**静态源码可行性与未验证行为的边界**，Phase1先做可丢弃/最小集成验证，再开展依赖其正确性的业务。不得写成已经跑通。

| 门槛 | 必须证明 | 失败时最小替代 |
|---|---|---|
| G1 提交接纳 | native prompt后composer可能清空；pre-step在inbox claim后。最终文本/speaker/source binding在领域提交前可恢复，Enter/按钮/IME/刷新/多tab/DB失败不丢稿、不重复入图；blocks和模型选择器兼容 | 先实现本地IndexedDB草稿镜像和Host binding对账；若公开面仍不能保证，提出窄的官方可组合提交/receipt扩展或受控调用既有InputActions.submit，不静默patch loop、不另写编辑器 |
| G2 支线 | 冷启动恢复continuable会话、真人作者归属、第五答在接纳处关门、memo/merge重试幂等，interrupt后等待实际终止 | 在插件coordinator持久化并重建公开子会话；若生命周期仍无法保证，记录阻塞/修订ADR再推进Branch，不能用prompt提醒代替计数 |
| G3 发行profile | webserver profile实际0.0.0.0监听、回环映射、原生访问保护、工具确实被移除、非root卷/重启/SIGTERM | 调整profile/启动适配与最小运行闭包；不能删除认证/改CLI parser来绕过 |

Theme使用register/setTheme/overrideTokens；自定义theme ID不靠内置settings持久化。上游字号schema只到17，18–20px目标用插件作用域CSS/产品容器继承验证，不把非法值写入上游设置。settings隐藏靠profile组合，不虚构万能API。

## 替代、代价与失败边界

pre-step拒绝不是提交前原子事务，原生prompt回执也不是领域保存回执。文档保留独立的失败状态/镜像恢复责任，不能仅凭UI禁用声称不会丢数据。上述限制不是已证明DSH无法使用，但它们是依赖链上的真实技术风险。

Phase1可从G1/G2/G3验证任务开始；全部通过前不得声明采访链与Docker可交付。若发现具体阻塞，应留下源码/复现证据，更新此ADR并选最小公开接入改进，不泛化为换整个基础栈。

## 依据与验收

[上游能力矩阵](../research/upstream.md)；[插件UI](https://github.com/Develata/dsh-laorenyun/blob/main/docs/ui.md)；[验证矩阵](../11-testing-strategy.md)。
