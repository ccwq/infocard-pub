# Homepage Time Display Priority — date vs updated

## The Rule

- `date` = **source date**（内容原始发布时间，如 X 帖子日期、博客发布日期、仓库创建日期）。创建卡片时写入，之后不应改变。
- `updated` = **最后内容更新时间**。仅在内容有实质修改时才更新。

## The Bug Pattern

首页 `buildTimeMeta()` 的优先级：
1. `updated_at` / `updated`
2. `date` / `_modified_date`
3. ...

如果发布流程在 republish 时把 `updated` 写成当前时间，而 `date` 保留原始来源时间，则列表页显示的时间会是"今天"，而不是实际来源时间。

**受影响的卡（共 2 张）**：
- `20260303-harvard-girl-liu-yiting-report`：`date=2026-03-03`，`updated` 曾被误写成 `2026-06-03` → 已修复
- `20260602-search-as-code-agent-search`：`date=2026-06-02 14:49:59`，`updated` 曾被误写成 `2026-06-03` → 已修复

## 修复原则

当 `updated` 被误写成当前时间，但 `date` 是正确来源时间时：
```
updated → 应与 date 保持一致
```

当内容有实质修改时（新增章节、重大修正）：
```
date → 保持原始来源时间（不变）
updated → 写入新的修改时间
```

## 验证命令

```python
# 检查所有卡的 updated 是否被误写成今天（而 date 不是今天）
python3 - <<'PY'
import yaml, pathlib
from datetime import datetime, timezone, timedelta
SHANGHAI = timezone(timedelta(hours=8))
NOW = datetime.now(SHANGHAI)
TODAY = NOW.strftime('%Y-%m-%d')
for meta_path in pathlib.Path('docs').glob('**/*.meta.yaml'):
    data = yaml.safe_load(meta_path.read_text())
    if not isinstance(data, dict) or 'slug' not in data: continue
    d = str(data.get('date','')).strip()
    u = str(data.get('updated','')).strip()
    if u.startswith(TODAY) and not d.startswith(TODAY):
        print(f'FIX: {data["slug"]} | date={d} updated={u} -> updated should be {d}')
PY
```

## 相关文件

- `references/homepage-time-display-priority.md` — 首页时间展示优先级
- `references/homepage-utc8-time-display.md` — UTC+8 墙钟时间规则