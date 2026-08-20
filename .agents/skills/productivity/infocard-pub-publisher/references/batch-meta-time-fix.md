# 批量修复 infocard meta 时间

## 根因（2026-07-07）

子智能体 prompt 里的硬编码 `当前时间戳：2026-07-07 10:xx:xx` 被照抄进 meta，首页时间全部错误（实际发布在傍晚）。

## 修复口径

采用 **commit 时间**（每张卡自己的 git commit 时间），不用当前时间，不用任务创建时间，不用素材时间。

## 批量修复步骤

### 第一步：获取所有卡的真实 commit 时间

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
for f in docs/20260707-*.html; do
  slug=$(basename "$f" .html)
  ts=$(git log --format="%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- "docs/${slug}.html")
  echo "$slug|$ts"
done
```

### 第二步：用 Python 批量替换

```python
from pathlib import Path
import re, subprocess
root = Path(subprocess.check_output(
    ["git", "rev-parse", "--show-toplevel"], text=True
).strip()).resolve()
commit_times = {
    '20260707-zvec': '2026-07-07 18:40:12',
    '20260707-tutti': '2026-07-07 18:37:56',
    # ... 其他卡
}
for slug, ts in commit_times.items():
    meta = root / 'docs' / f'{slug}.html.meta.yaml'
    if not meta.exists():
        continue
    raw = meta.read_text()
    new_raw = re.sub(r'^date:\s*["\']?[^\n"\']*["\']?', f'date: "{ts}"', raw, flags=re.M)
    if re.search(r'^updated:', new_raw, re.M):
        new_raw = re.sub(r'^updated:\s*["\']?[^\n"\']*["\']?', f'updated: "{ts}"', new_raw, flags=re.M)
    else:
        new_raw = re.sub(r'^(date:\s*["\'][^"\']*["\'])', f'\\1\nupdated: "{ts}"', new_raw, flags=re.M)
    if new_raw != raw:
        meta.write_text(new_raw)
        print(f'FIXED: {slug}')
```

### 第三步：rebuild + verify

```bash
npm run build && npm run verify
```

### 第四步：单独 git add

```bash
git add docs/20260707-*.meta.yaml _index.yaml index.html
git commit -m "fix: correct timestamps for 20260707 batch (commit-time based)"
git push origin main
```

> **Pitfall**：不要用 `git add .`，fix-taxonomy 会同时修改无关 taxonomy 字段，混入本次 commit。

## 门禁 execFileSync glob bug

Node.js `execFileSync` 不会展开 shell glob，导致 `git diff -- docs/**/*.meta.yaml` 匹配失败。正确做法：先取全部 diff 文件列表，再用 JS 过滤 `.meta.yaml` 后缀。
