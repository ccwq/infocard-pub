# fix-meta-date mtime 漂移导致 CI verify 失败的根因与解法

## 触发场景

每次 `npm run build`（即 `node scripts/build-site.js`）会先跑 `fix-meta-date.js`，
该脚本会 touching 所有 `docs/**/*.meta.yaml` 的 atime/mtime（即使内容不变，只是 touch）。

这导致两个后果：

1. **`_sort_ts` 失准**：在 `resolveBusinessSortTsNs` 中，如果有 `updated` 字段则用 `updated`，否则用 `date`，再否则 fallback 到 `fileMtimeNs(metaPath)`。由于 `fix-meta-date` touching 改变了 mtime，fallback 路径会产生与 git 提交时间不一致的 `_sort_ts`。

2. **CI 失败**：`npm run verify` 会对比 `_index.yaml` 内容是否与 `buildIndexData()` 重生成结果一致。如果 `_sort_ts` 不稳定，可能产生 diff；如果 `_index.yaml` 在上一次 CI run 后又被本地 build 改写，CI 的 `git diff --exit-code` 步骤会检测到 build 产物未提交。

## CI verify 失败的两层含义

### Layer 1：verify-index.js 报 "_index.yaml is out of date"
- **原因**：本地 `npm run build` 后 `_index.yaml` 内容确实变了（新增卡片、排序变化等），但本次 commit 没有把它一起提交。
- **解法**：确保 `_index.yaml` 和 `index.html` 在同一 commit 中：
  ```bash
  git add docs/xxx.html docs/xxx.meta.yaml _index.yaml index.html
  git commit -m "feat: add xxx card"
  git push
  ```

### Layer 2：CI git diff --exit-code 报 failure（第 4 步 "Verify committed generated artifacts"）
- **原因 A**（本 session 最常见）：commit 中没有 `_index.yaml` 和 `index.html`，CI run 已经在上一轮 push 中触发，用的是旧 index 状态构建 Pages，导致本次新卡 404。
- **解法**：永远把 4 个文件一起 commit（见 Layer 1）。
- **原因 B**（根因更隐蔽）：`fix-meta-date.js` touching 改变了 meta.yaml mtime → `_sort_ts` 在本地 build 时用了新 mtime → `_index.yaml` 内容与 CI 本地跑 `buildIndexData()` 的结果产生差异（`_modified_date` 字段变化导致 diff）。这会让 CI verify 报 `_index.yaml is out of date`，进而触发 CI failure。

## 根因 B 的精确路径

```
本地 build:
  build-site.js
    → runFixMetaDate()      ← touching 所有 meta.yaml → mtime 变为当前时间
    → buildIndexData()
        → parseSortTsNs(item)  ← 没有 updated 字段时 fallback 到 fileMtimeNs(metaPath)
        → _sort_ts = mtime    ← 这是一个文件系统时间，不是 git commit 时间
    → writeGeneratedArtifacts(_index.yaml, index.html)

CI verify（在同一 commit 中无 touching）：
  → buildIndexData()
      → parseSortTsNs(item)  ← CI 环境中 meta.yaml mtime 与本地不同（无 touching）
      → _sort_ts = 不同的值
  → serializeIndexYaml() → 与 committed _index.yaml 不一致
  → 报错："_index.yaml is out of date"
```

## 解法（永久）

**给每个 meta.yaml 补上 `updated` 字段**，让 `_sort_ts` 走 `updated` 而非 fallback 到 mtime：

```yaml
slug: "YYYYMMDD-slug-name"
path: "docs/YYYYMMDD-slug-name.html"
title: "Card Title"
date: "2026-06-06T17:05:00+08:00"
updated: "2026-06-06T17:05:00+08:00"   # ← 加这行，稳定 _sort_ts
desc: "One-line description ≤210 chars"
tags: ["tag1", "tag2"]
category: "knowledge"
```

`updated` 字段与 `date` 同值即可（都用 ISO 8601 +08:00 时区）。这样 `_sort_ts` 由显式时间戳决定，不依赖文件系统 mtime。

## 预防规则

每次创建新卡片的 meta.yaml 时，**同时写入 `date` 和 `updated` 两个字段**，不要只写 `date`。

## 验证命令

```bash
# 本地验证 build 后 index 一致性
npm run build && npm run verify

# 确认 git diff 无变化（CI 的第二道关卡）
git diff --stat _index.yaml index.html   # 应显示 0 lines changed
```

如果 `git diff --stat` 显示有行变化，说明 `_index.yaml` 或 `index.html` 在 build 后被改写了但未 commit，必须补 commit 再 push。

## 根因 C：`fix-meta-date --date-source first` 的非确定性日期问题（2026-06-18）

**问题现象**：即使所有 meta.yaml 都有 `updated` 字段，CI verify 仍然失败，原因是 `fix-meta-date.js --date-source first`（默认行为）从 GitHub API 查询每个文件的最近 commit 日期来决定 `updated`，但 GitHub API 返回的文件列表顺序在不同请求间不一致（受 API 分页、服务器状态等因素影响），导致同一文件在不同 build 运行时被赋予不同的 `updated` 时间戳。

**具体影响**：
- 同一批文件列表在 A 次运行时：`file_a.updated = 05:05, file_b.updated = 05:12`
- 在 B 次运行时（顺序不同）：`file_a.updated = 04:55, file_b.updated = 05:12`
- `_index.yaml` 中 `updated` 字段值不同 → CI smoke test `git diff --exit-code` 失败
- 触发 CI `deploy` 步骤退出码 1（因为 smoke test 在 `deploy` 之前）
- 多轮 commit 均失败：debbbfc（SkillOpt rebuild）、8f67e66（re-trigger）均报 failure

**诊断方法**：
```bash
# 在本地 reset 到 origin/main 后直接 build，观察 diff
git fetch origin && git reset --hard origin/main
npm run build
git diff --exit-code   # exit 1 = 有 diff = 本地 build 改变了 _index.yaml
```

如果 reset 后 build 仍有 diff，说明根因是 `fix-meta-date` 的非确定性，不是遗漏 commit。

**修复步骤**（当遇到此根因时）：
1. 找一次 CI verify 通过的 commit（如 `origin/main`），reset 到该点
2. 本地跑一次 build：`npm run build`（这次生成的是"正确"的 _index.yaml）
3. 验证：`git diff --exit-code` 应为 0
4. 如仍 diff，检查是否是 `--date-source first` 行为：对比 `_index.yaml` 中的 `updated` 字段是否有微小差异
5. 提交本地 build 结果：`git add _index.yaml index.html && git commit -m "fix: sync _index.yaml from local build" && git push`
6. 推送会自动触发新 CI run，verify 应该通过

**预防**：尽量避免在 build 前运行 `fix-meta-date.js --date-source first`（或 `--date-source last`），尤其是当所有卡片已有稳定 `updated` 字段时。如果需要修正日期，优先用 `--date-source file-mtime --force` 而非从 GitHub API 查询。