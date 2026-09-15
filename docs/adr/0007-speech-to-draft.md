# ADR-0007：识别只产生草稿

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

原件保存成功后识别，结果成为DSH原生composer草稿。用户可编辑、删除、补充、重录，只有显式提交才开始采访回应。source/draftRevision/session/speaker绑定，过期结果归档不覆盖当前输入。

## 替代、代价与失败边界

自动提交节省一次点击却破坏校订/身份/出处边界，不采用。保留DSH编辑器和IME，不另写聊天编辑器。软件控制UI，不接受模型“开启按钮”的指令。界面blocks不是权限，Host仍验证接纳状态。

## 依据与验收

[speech交互](../05-speech-pipeline.md)；[DSH提交边界验证](0013-dsh-integration-seams.md)。
