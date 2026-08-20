# `fix-taxonomy` + CI rebuild diff failure — root cause and fix

## 症状

- 本地 `npm run verify` 通过
- CI `verify-generated` → `git diff --exit-code` 失败（exit 1）
- CI `Deploy GitHub Pages` → `conclusion: failure`
- detail page URL 返回 404（即使 git push 已成功）

## 根因：两条独立问题叠加

### 问题 A：`fix-taxonomy` 不回写 meta.yaml（老版本认知）

`npm run fix-taxonomy` 的行为：
- 扫描所有 `docs/*.meta.yaml`
- 推断每张卡的 `taxonomy.domains`、`taxonomy.tool_types` 等字段
- **只写入 `_index.yaml`**
- **不写回 individual `docs/*.meta.yaml`**

结果：
- 已 committed 的 `_index.yaml` 保留旧值（不含推断的 domains/tool_types）
- 新 commit 后，CI 全新 clone，重新运行 `fix-taxonomy`，推断值生效
- CI 拿到的 `_index.yaml` 与 committed 版本内容不同
- `git diff --exit-code` → diff found → exit 1

典型案例（2026-07-02）：
- Nim 卡（20260701-nim）的 `domains: []` 和 `tool_types: []` 被 `fix-taxonomy` 推断为 `domains: [Python, JavaScript]` 和 `tool_types: [脚本工具]`
- 这些值写入了 `_index.yaml` 但没有写回 `docs/20260701-nim.html.meta.yaml`
- CI rebuild 后 diff 产生

### 问题 B：CI workflow 步骤顺序错误（2026-07-04 最终修复验证）

**错误的顺序**（会导致 `git diff --exit-code` 失败）：
```yaml
- name: Build site
  run: npm run build
- name: Fix taxonomy completeness
  run: npm run fix-taxonomy    # ← build 后才 fix，改动了 meta.yaml 但未 commit
- name: Verify
  run: npm run verify
- name: Ensure no uncommitted changes
  run: git diff --exit-code    # ← 有未 commit 改动 → exit 1
```

**正确的顺序（2026-07-04 验证有效）**：
```yaml
- name: Verify committed generated artifacts
  run: npm run verify

- name: Fix taxonomy completeness
  run: npm run fix-taxonomy

- name: Commit taxonomy fixes           # ← fix 后立即 commit
  run: |
    if ! git diff --exit-code; then
      git config user.name "ci" && git config user.email "ci@github"
      git add -u
      git commit -m "ci: auto-fix taxonomy"
    fi

- name: Verify taxonomy completeness
  run: npm run verify-taxonomy

- name: Ensure generated artifacts are committed
  run: git diff --exit-code              # ← 现在 diff 为 clean
```

**受影响的 Workflows**：
- `.github/workflows/index.yml`（Verify Generated Index Artifacts）
- `.github/workflows/pages.yml`（Deploy GitHub Pages）

两个 workflow 都必须包含 `Commit taxonomy fixes` 步骤。

## 本地修复步骤（当 CI 已失败时）

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"

# 1. fix-taxonomy 产生 dirty worktree
npm run fix-taxonomy

# 2. 提交所有被改动的 meta.yaml
git add -u && git commit -m "ci: auto-fix taxonomy"

# 3. 推送，触发新 CI
git push origin main
```

## 预防清单（每次发布前执行）

1. `npm run build`
2. `git diff -- _index.yaml` — 确认 diff 量是否合理（只应有本次新卡相关变化）
3. `git diff --stat docs/*.meta.yaml` — 确认没有已有卡被改动
4. 若有已有卡 meta.yaml 被改动：`find docs -name '*.meta.yaml' -print0 | xargs -0 git add`
5. `git add _index.yaml index.html`
6. `git commit`
7. `git diff --exit-code` — 确认为 0 再 push

## 相关

- `references/bare-date-12pm-display-bug.md` — 裸日期导致的 12:00 展示问题
- `references/ci-taxonomy-fix-workflow.md` — CI workflow 正确步骤顺序
