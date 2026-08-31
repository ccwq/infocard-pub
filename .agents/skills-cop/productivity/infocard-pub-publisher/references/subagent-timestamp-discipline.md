# Subagent Timestamp Discipline (2026-07-07)

## Root Cause
主 Agent 派发给子智能体的 prompt 写死了硬编码时间（如 `当前时间戳：2026-07-07 10:30:00`），子智能体照抄进 meta.yaml，导致首页时间显示错误（commit 18:40，meta 10:30）。

## Prevention
子智能体 prompt 禁止硬编码时间，必须执行：
```bash
publish_ts=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
```
meta.yaml 必须写：
```yaml
date: "$publish_ts"
updated: "$publish_ts"
```
禁止：裸日期、ISO T/Z 格式、未加引号。

## CI Gate Bug (known)
`git diff -- "docs/**/*.meta.yaml"` 在 Node execFileSync 里不展开路径。正确做法：先 `git diff --name-only` 取全量文件，JS filter 过滤 `.meta.yaml`。

## Scenario 2: CI Gate Catches Pre-Existing Meta Missing `updated`
**现象**：`npm run build && npm run verify` 报错 `docs/YYYYMMDD-xxx.html.meta.yaml: missing required updated`
**根因**：另一个子智能体之前创建了该 meta.yaml 但漏掉了 `updated` 字段，CI gate 检查所有 changed/new 文件。
**处理**：
1. `read_file` 该 meta.yaml
2. `patch` 加一行 `updated: "<与 date 同值>"`
3. `git add` 该文件 → 合并到当前 commit

不要另起 commit——和当前卡一起提交，减少分支碎片。

## Batch Fix Old Cards
用 `terminal()` 执行 shell/Python，不用 `execute_code`（heredoc 不稳定）。`fix-taxonomy` 变更不要混入修时间的 commit，分开提交。

## Homepage Sorting
首页按 `_index.yaml` 的 `updated || date` 排序，按秒级时间戳处理。只要 meta 写对，首页排序就正确。
