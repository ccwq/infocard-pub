#!/usr/bin/env python3
"""
fix-bare-dates.py
批量修复 meta.yaml 中的裸日期（YYYY-MM-DD），给所有无时分秒的日期补上时分秒。
原始日期保留，补 23:59:00（适用于历史卡；若要精确时间需用 git log 查原始提交时间）。
"""
import re, glob

fixed = []
for path in sorted(glob.glob('docs/*.meta.yaml')):
    with open(path) as f:
        content = f.read()
    bare = re.search(r"^date:\s*['\"](20\d\d-\d\d-\d\d)['\"]", content, re.MULTILINE)
    if bare:
        old = bare.group(0)
        new = f'date: "{bare.group(1)} 23:59:00"'
        if old != new:
            content = content.replace(old, new, 1)
            with open(path, 'w') as f:
                f.write(content)
            fixed.append((path.split('/')[-1], old, new))

print(f"Fixed {len(fixed)} files:")
for name, old, new in fixed:
    print(f"  {name}: {old}")
