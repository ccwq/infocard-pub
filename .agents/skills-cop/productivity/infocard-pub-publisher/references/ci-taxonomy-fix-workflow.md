# CI / GitHub Actions 索引发布流程

## 两个 Workflow 的职责

| Workflow | 职责 | 触发 |
|----------|------|------|
| `pages.yml` | fix-taxonomy → commit → verify → build → deploy Pages | push 到 main |
| `index.yml` | fix-taxonomy → commit → verify | push 到 main |

## 正确顺序（2026-07-04 固化）

```
fix-taxonomy → commit → build → verify → git diff --exit-code
```
`fix-taxonomy` 必须在 `build` **之前**运行并 commit。

### 为什么顺序很重要

`fix-taxonomy` 会修改 `meta.yaml` 的 `taxonomy.domains` / `taxonomy.tool_types` 等字段。如果在 `build` 之后才运行：
1. `fix-taxonomy` 修改了本地 meta.yaml
2. `build` 重新生成 `_index.yaml`（基于修改后的 meta）
3. 但 `_index.yaml` 变化未被 commit
4. CI 的 `git diff --exit-code` 检测到未提交差异 → **失败**

正确顺序下，`build` 之前 `fix-taxonomy` 已 commit，后续 `_index.yaml` 变化是 build 的确定性产物。

## `git diff --exit-code` 失败：两种场景两种解法

**场景 A：子智能体 push，未在 CI 内 build**

subagent push 后 CI 内 fix-taxonomy → commit → build → verify → `git diff --exit-code` 失败。

→ 推送空提交触发 CI 重跑（第二次运行时 `_index.yaml` 已被 commit）：
```bash
git commit --allow-empty -m "ci: retrigger" && git push origin main
```

**场景 B：本地 build 后直接 push**

主智能体或本地 `npm run build` 后未 commit 生成产物就 push，CI `diff --exit-code` 失败。

→ 先 commit 生成产物再 push：
```bash
git add -u && git commit -m "ci: commit generated artifacts" && git push origin main
```

**区分方法**：
```bash
git diff _index.yaml | wc -l
# > 0 → 场景 B，先 commit 再 push
# = 0 → 场景 A，用空提交重跑
```

详见：`references/ci-build-always-regenerates-index.md`
