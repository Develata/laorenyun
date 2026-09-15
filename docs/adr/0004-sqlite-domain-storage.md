# ADR-0004：独立 SQLite 领域库

状态：接受为实现设计；运行验证另列。日期：2026-09-15。Owner：laorenyun。

## 决策

SQLite+filesystem；媒体只存元数据/hash/受控路径，原件不做BLOB。使用固定Node的node:sqlite，领域DB与DSH自己的会话存储分离。SQL与迁移集中一处，无ORM。同步数据库调用在一个worker串行执行，队列/请求都有上限。

## 替代、代价与失败边界

DSH的storage-sqlite已使用node:sqlite，但公开backend仅KV，没有领域需要的关系查询和跨表事务面，不能偷偷导入上游内部DB句柄。better-sqlite3是有实证缺口时的后备，当前增加native维护无收益。PostgreSQL/图数据库不符合本机单使用者规模。

node:sqlite仍是RC，固定Node并接受升级回归。单writer/WAL/FK/版本CAS、停机整卷备份、文件journal弥补DB与filesystem非原子提交。worker终止并不证明事务没有提交。

## 依据与验收

[Node固定版文档](https://nodejs.org/download/release/v24.21.0/docs/api/sqlite.html)；[存储映射](https://github.com/Develata/dsh-laorenyun/blob/main/docs/memory.md)。
