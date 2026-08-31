# GitHub markdown color list parsing

When extracting structured color data from a markdown file hosted on GitHub:

## Data source pattern

Many Chinese traditional color repos store data as markdown tables or raw text lists:
```
色名 #HEX
色名 #HEX #HEX 色名2   ← multiple colors per line
```

## Parsing technique: re.split on #HEX

```python
import re

with open('/tmp/color-list.txt') as f:
    content = f.read()

lines = content.split('\n')
colors = []
for line in lines:
    line = line.strip()
    # Skip markdown noise
    if not line or line.startswith('# 中国色') or line.startswith('本文件') \
       or line.startswith('```') or line.startswith('共') or line.startswith('/'):
        continue
    # Split on #HEX to isolate name from value
    parts = re.split(r'#([A-Fa-f0-9]{6})', line)
    if len(parts) > 1:
        for i in range(1, len(parts), 2):
            hex_val = parts[i].upper()
            prev_text = parts[i-1] if i > 0 else ''
            name = prev_text.strip()
            if not name or len(name) < 2:
                # Try text after hex as fallback
                if i+1 < len(parts):
                    name = parts[i+1].strip().split()[0]
            if name and len(name) >= 1:
                colors.append((name, f'#{hex_val}'))
```

**Why this works**: Lines can have multiple hex codes (e.g. `绀青 #4F84FF #A0D8D8` two colors on one line). Using `re.split` on `#HEX` gives you alternating [text_before, hex, text_between, hex, ...] which handles both single and multi-color lines correctly.

**Key failure**: Using `re.findall` alone loses the association between name and hex when multiple hexes appear on the same line.

## Color categorization

```python
def categorize(hex_val):
    h = hex_val.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    max_c, min_c = max(r, g, b), min(r, g, b)
    l = (max_c + min_c) / 2 / 255
    diff = max_c - min_c

    if diff < 25:
        if l > 0.82: return '白/粉白'
        if l < 0.12: return '黑/墨'
        return '灰'

    if r > g and r > b:
        if g > b + 20: return '黄/棕'
        if b > g + 20: return '红/橙'
        return '红'
    if g > r and g > b: return '绿'
    if b > r and b > g: return '蓝/青/紫'
    if r > g: return '橙'
    return '其他'
```

## When to use this

- Chinese traditional color repositories with 700+ color entries
- Any markdown file where data is structured as `name #HEX` pairs across many lines
- Fall back to `curl https://raw.githubusercontent.com/{owner}/{repo}/{branch}/path` when GitHub API is rate-limited
