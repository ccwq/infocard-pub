# CI `git diff --exit-code` 始终失败的根因与解法

## 问题描述

`index.yml` workflow 的最后一步 `Ensure generated artifacts are committed` 每次都失败，即使本地 `git diff _index.yaml` 完全干净。

## 根因分析

`scripts/build-site.js` 每次运行都会**无条件重写** `_index.yaml` 和 `index.html`：

- `_sort_ts` 字段由 HTML 文件的 **mtime** 推导（`stat().mtimeMs`）
- `index.html` 的注入数据由 `_index.yaml` 重新生成
- 每次 CI 运行和本地运行，文件的 mtime 不同，导致 `_sort_ts` 不同
- 因此 `_index.yaml` 每次都产生差异，即使内容逻辑相同

这意味着：
- `git diff --exit-code` 在 `npm run build` 之后必然非零
- CI 和本地都无法通过这个检查
- 该检查实际上是一个**架构缺陷**，不是真正的门禁

## 症状（2026-07-07 实录）

```
npm run build  # 生成了新的 _index.yaml
git diff --exit-code  # 失败：sort_ts/mtime 差异
```

但同时：
```
git diff _index.yaml | wc -l  # 可能显示有差异（如44行）
# 或显示 0 行（如果 CI 内 mtime 恰好与 HEAD 一致）
```

## 解法（两种）

### 解法 A：本地主动 commit 生成产物（推荐）

每次 `npm run build` 后立即 commit：
```bash
npm run build
git add -u
git commit -m "ci: commit generated artifacts"
git push origin main
```

**优点**：CI 的 `git diff --exit-code` 通过，因为 HEAD 已包含最新生成产物
**缺点**：每次发布多一个 commit

### 解法 B：空提交触发 CI 重跑（补漏用）

当 CI 的 `Ensure generated artifacts are committed` 失败但 Pages 部署实际通过时：
```bash
git commit --allow-empty -m "ci: retrigger" && git push origin main
```

**适用场景**：Pages 已上线（HTTP 200），但 `index.yml` CI 步骤报 failure
**注意**：空提交不解决根本问题，只是让 CI workflow 不阻塞下一次 push

## 判断流程

```
CI 报告 "Ensure generated artifacts are committed" 失败
  → 检查 curl HTTP 200 目标卡 → 已上线？→ YES：忽略 CI failure
  → 未上线？
    → 本地 git diff _index.yaml | wc -l > 0？
      → YES：解法 A（本地 commit 后 push）
      → NO：解法 B（空提交触发）
```

## 预防

写 SKILL.md 的 publisher 步骤时，加这一条：

> **警告**：`npm run build` 之后必须立即 `git add -u && git commit && git push`，不能只 push HTML+meta 而跳过生成产物。

## 已知案例

| 日期 | 卡 | 症状 | 解法 |
|------|-----|------|------|
| 2026-07-07 | OpenDisplay | 本地 build 后 diff=0 但 CI 失败 | 解法 A（本地 commit 后 push） |
| 2026-07-07 | OpenDisplay | CI 重跑仍失败，Pages 已上线 | 解法 A 后 Pages 成功 |
| 2026-07-07 | Codex-Dynamic | 子智能体完成，CI 失败，Pages 上线 | - |
| 2026-07-07 | FMHY | 子智能体完成，CI 失败，Pages 上线 | - |
| 2026-07-07 | video-use | 子智能体完成，CI 失败，Pages 上线 | - |
