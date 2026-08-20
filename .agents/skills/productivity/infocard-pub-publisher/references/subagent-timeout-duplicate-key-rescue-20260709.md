# Subagent 超时 + Duplicate Key 接手规程（2026-07-09）

## 典型场景

subagent 写好了 HTML 和 meta.yaml 但 build/push 前超时。原因：调研阶段耗尽 600s，文件已落盘但未 push。

## 接手流程

```
超时通知到达
  → git status -sb
  → ls docs/<slug>.* （确认文件存在）
  → curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html

判定分支：
  HTTP 200 → 已完成，跳过
  HTTP 404 + 文件存在 → 进入接手流程（见下）
  HTTP 404 + 文件不存在 → 检查 git status untracked，有则接手，无则判定项目不存在
```

### 接手步骤

1. `cat docs/<slug>.meta.yaml` —— 先读文件确认状态
2. 检查字段完整性：`category`、`title`、`date`、`updated`、`desc` 是否存在且无 duplicate key
3. **如发现 duplicate key（如两个 `updated:`）**：
   - 不要 patch，直接重写整个 meta.yaml（write_file）
   - patch 只会在旧行和新行之间留下字段截断区，越补越乱
4. `npm run build` —— 验证通过后再 push
5. `git add docs/<slug>.* _index.yaml index.html`
6. `git commit -m "docs: add <slug> infocard"`
7. `git push`
8. `sleep 30 && curl -sI https://...` —— 验收 HTTP 200

## Duplicate Key 根因分析

对已有 meta.yaml 做 patch 替换时，old_string 只覆盖部分行：
```
原始文件:
  date: "2026-07-09 00:14:28"
  updated: '2026-07-09 00:00:00'   ← old_string 起点
  category: agent-tool
  title: "..."
  desc: "..."

patch old:  updated: '2026-07-09 00:00:00'
patch new:  updated: "2026-07-09 00:15:00"

结果:
  date: "2026-07-09 00:14:28"
  updated: '2026-07-09 00:00:00'   ← 旧行残留
  updated: "2026-07-09 00:15:00"   ← duplicate!
  category: agent-tool              ← 被截在 old_string 外，未删也未保留
  title: "..."
  desc: "..."
```

## 预防规则

1. **meta.yaml 字段变更一律 write_file 重写整个文件**，不做局部 patch
2. subagent prompt 里禁止硬编码时间戳，必须执行 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"`
3. 调研和写卡不要放同一个 subagent——调研耗尽时间导致写卡来不及 push
   - 推荐：调研子智能体 + 主线程写卡并行
   - 或：调研子智能体 + 写卡子智能体串行（先调研再写卡）
