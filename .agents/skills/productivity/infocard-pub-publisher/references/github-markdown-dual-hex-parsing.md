# Dual-hex per line parsing for GitHub markdown color lists

## The problem
Some markdown color-master-list files encode TWO colors per line using markdown bold markers or inline formatting. A raw regex `#[A-Fa-f0-9]{6}` approach only captures the first hex per line.

Example from `zhongguo-traditional-colors/chinese-color-master-list.md`:
```
淡松烟 #4D4030 #4A4035
```
The line contains TWO colors: 淡松烟=#4D4030 and 鹤灰=#4A4035. Simple regex picks up only the first hex.

## Reliable parsing approach

```python
import re

with open('file.md') as f:
    content = f.read()

lines = content.split('\n')
colors = []
for line in lines:
    line = line.strip()
    # Skip metadata lines
    if not line or line.startswith('# 中国色') or line.startswith('本文件') or \
       line.startswith('```') or line.startswith('共') or line.startswith('/Users'):
        continue
    # Split on hex pattern, preserving surrounding text
    parts = re.split(r'#([A-Fa-f0-9]{6})', line)
    if len(parts) > 1:
        for i in range(1, len(parts), 2):
            hex_val = parts[i].upper()
            # Name is the text BEFORE this hex
            name = parts[i-1].strip() if i > 0 else ''
            # If name is empty, grab from text AFTER this hex (second color on same line)
            if not name or len(name) < 2:
                if i+1 < len(parts):
                    name = parts[i+1].strip().split()[0]
            if name and len(name) >= 1:
                colors.append((name, f'#{hex_val}'))
```

## Key insight
The `re.split(r'#([A-Fa-f0-9]{6})', line)` approach preserves context on both sides of each hex. For dual-hex lines, the loop processes both colors in order — the first color's name comes from text before the first hex, the second color's name comes from text between the two hexes.

## Categorization by luminance/chroma

```python
def categorize(hex_val):
    h = hex_val.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    max_c, min_c = max(r,g,b), min(r,g,b)
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

## Applying to infocard generation
For a color palette info card, generate rows of N color chips using a programmatic row builder. For a full 736-color palette at 8 chips per row:

```python
def gen_row(items, n=8):
    html = ''
    for i in range(0, len(items), n):
        chunk = items[i:i+n]
        html += f'<div class="color-grid color-grid-8">\n'
        for name, hex_val in chunk:
            # Auto-contrast text color
            h = hex_val.lstrip('#')
            r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
            l = (max(r,g,b) + min(r,g,b)) / 2 / 255
            text_color = '#111' if l > 0.4 else '#fff'
            html += f'<div class="color-chip"><div class="swatch" style="background:{hex_val}"></div>'
            html += f'<div class="name" style="color:{text_color}">{name}</div>'
            html += f'<div class="hex">{hex_val}</div></div>\n'
        html += '</div>\n'
    return html
```

## Result (2026-06-06)
- Source: nevertoday/zhongguo-traditional-colors `chinese-color-master-list.md`
- Parsed: 736 colors across 9 categories
- GitHub API was rate-limited; README fetched via `raw.githubusercontent.com` instead
