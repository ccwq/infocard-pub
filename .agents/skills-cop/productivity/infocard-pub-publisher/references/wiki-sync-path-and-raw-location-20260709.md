# Wiki Sync 路径规范（2026-07-09 实录）

## WIKI_PATH 来源与定义

Wiki 同步的根路径从 `~/.hermes/.env` 中读取 `WIKI_PATH` 环境变量。
**当前值**：`/home/ccwq/hehome/hermes-data/home/wiki`

**绝对不能用**：
- `/home/ccwq/wiki/` ❌（非 env 指定的路径）
- 任何不含 `hermes-data/home/wiki` 的路径 ❌

## 两个必须同步的路径

Wiki 同步需要写 **两个** 文件，均以 `WIKI_PATH` 为根：

| 文件类型 | 路径 | 命名规范 |
|----------|------|----------|
| raw 记录 | `WIKI_PATH/raw/` | `YYYY-MM-DD-infocard-<slug>.md` |
| 知识页 | `WIKI_PATH/concepts/` | `<slug>.md` |

## 2026-07-09 踩坑记录

- 初始 raw 写到了 `/home/ccwq/wiki/raw/2026-07-09-infocard-longcat-video-avatar.md`（错误路径）
- 知识页写到了 `/home/ccwq/hehome/hermes-data/home/wiki/concepts/longcat-video-avatar.md`（正确路径）
- 原因：直接用了 `~/wiki/raw` 而未从 env 读取 `WIKI_PATH`

## 防呆检查

发布完成后，验证 wiki 文件位置：
```bash
# 正确路径（基于 env WIKI_PATH）
ls ~/hehome/hermes-data/home/wiki/raw/
ls ~/hehome/hermes-data/home/wiki/concepts/

# 错误路径（不应存在）
ls ~/wiki/raw/   # 不应该有任何 raw 文件
```

## 高价值卡判定与同步清单

| 卡类型 | 同步 raw | 同步知识页 | 目录 |
|--------|----------|------------|------|
| 人物 | ✅ | ✅ | `entities/` |
| 调查/事件 | ✅ | ✅ | `entities/` |
| 工具/开源项目 | ✅ | ✅ | `concepts/` |
| 技术方法论 | ✅ | ✅ | `concepts/` |
| Agent 工作流 | ✅ | ✅ | `concepts/` |
| 简单工具卡 | ✅ | ❌ | — |
| 日常查询 | ❌ | ❌ | — |
