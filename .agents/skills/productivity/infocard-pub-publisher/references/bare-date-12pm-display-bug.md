# 裸日期 → 12:00 UTC+8 展示 bug（2026-07-04 新发现）

## 症状

用户反馈"最近的信息卡时间都不对"，发现多张卡片的 `_modified_date` 显示为 `12:00:00`，而非实际发布时间。

## 根因路径

```
1. 子智能体写 meta.yaml 时用了裸日期：date: '2026-07-04'（无时分秒）
2. fix-meta-date.js 的 force=false 不覆盖已有值 → 裸日期原样保留
3. rebuild_index.py 把 '2026-07-04' 解析为 UTC 00:00 → 显示时区转换后 = 12:00 UTC+8
```

关键：`fix-meta-date.js --write --date-source first --force` 才会覆盖已有值；默认 `force=false` 跳过已有 date。

## 批量检测脚本

```python
import re, glob
from datetime import datetime, timezone, timedelta

# 裸日期检测正则
bare_re = re.compile(r"^date:\s*['\"](20\d\d-\d\d-\d\d)['\"]", re.MULTILINE)

fixed = []
for path in sorted(glob.glob('docs/*.meta.yaml')):
    content = open(path).read()
    m = bare_re.search(content)
    if m:
        bare = m.group(0)
        fixed_date = f'{m.group(1)} 23:59:00'
        new = f'date: "{fixed_date}"'
        content = content.replace(bare, new, 1)
        open(path, 'w').write(content)
        fixed.append((path.split('/')[-1], bare, new))

print(f"Fixed {len(fixed)} bare dates")
for name, old, new in fixed:
    print(f"  {name}: {old} → {new}")
```

## 正确做法（预防）

写 meta.yaml 时永远取实际时间戳，不要硬编码：

```bash
PUBLISH_TS=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')
# $PUBLISH_TS = "2026-07-04 17:40:00"
```

写入 meta.yaml：
```yaml
date: "2026-07-04 17:40:00"
updated: "2026-07-04 17:40:00"
```

**禁止**：裸日期 `date: '2026-07-04'`、固定占位 `date: '2026-07-04 12:00:00'`。

## 验证命令

```bash
# 检测所有裸日期
grep -l "^date: '20" docs/*.meta.yaml

# 验证 Pages 上 _modified_date 不含 12:00 艺术值
curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | \
  python3 -c "import yaml,sys; [print(c['slug'], c['_modified_date']) for c in yaml.safe_load(sys.stdin)['cards'] if '12:00:' in str(c.get('_modified_date',''))]"
```

## 相关文件

- `scripts/fix-bare-dates.py` — 批量修复裸日期脚本
- `references/hardcoded-timestamp-prevention.md` — 预防硬编码时间戳
