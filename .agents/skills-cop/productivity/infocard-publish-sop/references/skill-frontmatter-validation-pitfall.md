# Skill YAML Frontmatter 验证陷阱（2026-07-16）

## 教训

用正则表达式扫描 `name:` 字段会出现假阴性——肉眼看到 frontmatter 里有 `name: xxx`，但 regex 匹配失败，因为 YAML 是有语法的结构化格式，简单行首匹配不能处理多行值、嵌套、或特殊字符。

**错误方式（conversation turn 1）：**
```python
# ❌ 假阴性：匹配不到合法的 name 字段
if not re.search(r'^name\s*:\s*\S.*$', m.group(1), re.M):
    missing.append(p)
```

**正确方式（conversation turn 4）：**
```python
# ✅ 用 PyYAML 解析，精确判断 name 是否为非空字符串
import yaml
data = yaml.safe_load(frontmatter_text)
if not isinstance(data, dict) or not isinstance(data.get('name'), str) or not data['name'].strip():
    missing.append(p)
```

完整扫描脚本模板（`PYYAML` 可用时优先使用）：

```python
from pathlib import Path
import re, yaml

root = Path('/home/ccwq/hehome/hermes-data/skills')
missing = []
for p in root.rglob('SKILL.md'):
    s = p.read_text('utf-8', errors='replace')
    m = re.match(r'^---\r?\n(.*?)\r?\n---(?:\r?\n|$)', s, re.S)
    if not m:
        missing.append((p, 'no YAML frontmatter'))
        continue
    try:
        data = yaml.safe_load(m.group(1))
    except Exception as e:
        missing.append((p, f'invalid YAML: {e}'))
        continue
    if not isinstance(data, dict) or not isinstance(data.get('name'), str) or not data['name'].strip():
        missing.append(p)

print(f'MISSING_NAME: {len(missing)}')
for p in missing:
    print(p)
```

## 影响

- 首次扫描报告"0 个缺少 name"，实际 infocard-publish-sop 本身就有 name 字段
- 导致误判 skill 合规性，花了两个额外 conversation turn 才定位根因
- 浪费用户时间和 token

## 固化规则

- 扫描 skill 合规性用 `yaml.safe_load()` 而不是正则表达式
- regex 可用于前端预筛（如检测 BOM、frontmatter 分隔符），但字段存在性判断必须走 YAML 解析
