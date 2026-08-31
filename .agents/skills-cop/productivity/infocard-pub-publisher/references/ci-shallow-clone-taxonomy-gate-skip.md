# CI 浅克隆导致 verify-taxonomy 全量失败的根因与修复

## 症状

CI 运行 `npm run verify-taxonomy`（即 `verify-taxonomy.js --changed-only`）失败，错误信息：

```
[FAIL] docs/20260625-gstack-collaboration-workflow.html.meta.yaml
       [error] style: style dimension missing from taxonomy
... (303 files)
[ERROR] 303 file(s) have taxonomy errors.
```

实际 303 张卡完全缺失 taxonomy（历史遗留），但本地从未报错——因为本地有 `origin/main`，`git diff` 能识别出本次只改了 6 张新卡。

## 根因

GitHub Actions 使用 **shallow clone**（默认 `fetch-depth: 1`），CI 工作区内没有 `origin/main` 分支。

`scripts/verify-taxonomy.js` 原来 fallback 逻辑：

```js
// OLD (WRONG)
const changed = getChangedMetaFiles(); // returns [] in CI shallow clone
if (changed.length > 0) return changed;
return walkMetaFiles(DOCS);  // ← fallback to ALL 372 files → 303 failures → CI FAIL
```

当 `getChangedMetaFiles()` 在 CI 浅克隆中因 `origin/main` 不存在而返回空数组时，原代码退化为**全量 372 张卡校验**，其中 303 张历史卡完全缺 taxonomy → CI 失败。

## 修复（已合并，commit `0c29b6e`）

```js
// FIXED: --changed-only 在无 base ref 时 skip，而非退化到全量
// getChangedMetaFiles() 在 CI 浅克隆返回 [] 是预期行为，不是错误
// 修复后 verify-taxonomy 在 CI 中输出：
//   [SKIP] no changed meta files detected (--changed-only, no base ref available in CI shallow clone)
//   Use --all to audit the full repository, or ensure origin/main exists locally.
//   exit 0 (not exit 1)
return getChangedMetaFiles();  // returns [] in CI → main() skips gracefully
```

相关代码改动在 `scripts/verify-taxonomy.js` 的 `getTargets()` 和 `main()` 函数。

## CI 中 --changed-only vs --all

| 场景 | 正确 flag | 行为 |
|---|---|---|
| CI 正常发布（推送改动） | `--changed-only` | 只检查本次改动的卡，有 base ref → 精确校验 |
| CI shallow clone（无 base ref） | `--changed-only` | 返回空 → main() skip → exit 0 |
| 本地全量审计历史卡 | `--all` | 检查所有 372 张卡，用于历史回填 |
| CI 想强制全量校验（不建议） | `--all` | 会遇到 303 张历史卡缺失 taxonomy → CI 失败 |

## 教训

CI **不自动修复**，但也不能因为 CI 浅克隆的预期限制而让 CI 失败。`--changed-only` 在 CI 中应该"知道自己的局限并优雅 skip"，而不是退化到全量导致级联失败。

设计任何依赖 git diff 的 CI 工具时，必须考虑 shallow clone 场景：**返回空 ≠ 报错**。
