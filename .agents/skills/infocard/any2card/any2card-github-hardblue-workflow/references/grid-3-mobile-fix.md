# hardblue/redswiss `.grid-3` 移动端修复参考

## 问题

120+ 个卡片使用 `.grid-3` 三列布局（`grid-template-columns: repeat(3, minmax(0,1fr))`），但 CSS 无 `@media (max-width:720px)` 折叠规则。用户在移动端看到的是桌面三列等比压缩后的极窄列，文字无法阅读。

## 注入的响应式断点

```css
/* ======= RESPONSIVE GRID ======= */
@media (max-width:720px){
  .grid-3,.grid-4{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .engagement-grid{grid-template-columns:repeat(3,1fr)}
  .section-head{grid-template-columns:52px 1fr}
}
```

## 批量修复脚本

```python
import re, os, glob

REPO = "/path/to/infocard-pub"
MEDIA_QUERY = """

    /* ======= RESPONSIVE GRID ======= */
    @media (max-width:720px){
      .grid-3,.grid-4{grid-template-columns:1fr}
      .grid-2{grid-template-columns:1fr}
      .engagement-grid{grid-template-columns:repeat(3,1fr)}
      .section-head{grid-template-columns:52px 1fr}
    }
"""

count = 0
fixed = []
for path in glob.glob(os.path.join(REPO, "docs", "*.html")):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Only process files that have grid-3
    if 'grid-template-columns:repeat(3,minmax' not in content:
        continue
    # Already has our rules
    if '.grid-3,.grid-4{grid-template-columns:1fr}' in content:
        continue
    if '@media(max-width:720px)' in content or '@media (max-width:720px)' in content:
        # Append to existing 720px block
        pattern = r'(@media\(max-width:720px\)\{)'
        def add_rules(m):
            return m.group(1) + MEDIA_QUERY.strip()
        new_content = re.sub(pattern, add_rules, content, count=1)
    elif '@media' in content:
        # Has other media queries but not 720px - inject after .grid-4 or .grid-3
        m = re.search(r'\.grid-4\{grid-template-columns:[^}]+\}', content)
        if m:
            new_content = content[:m.end()] + MEDIA_QUERY + content[m.end():]
        else:
            m3 = re.search(r'\.grid-3\{grid-template-columns:[^}]+\}', content)
            if m3:
                new_content = content[:m3.end()] + MEDIA_QUERY + content[m3.end():]
            else:
                continue
    else:
        # No @media at all - inject after .grid-3 definition
        anchor = '.grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}'
        if anchor not in content:
            continue
        new_content = content.replace(anchor, anchor + MEDIA_QUERY, 1)

    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        fixed.append(os.path.basename(path))

print(f'Fixed {count} files')
```

## CSS anchor 差异（扫描发现）

不同批次的卡片 CSS 结构不同：

| Pattern | Example |
|---------|---------|
| `repeat(3,minmax(0,1fr))` | 早期卡片 |
| `repeat(3,1fr)` | 后期卡片 |
| `.grid-4{...}` 存在 | 可作为 inject anchor |
| 只有 `.grid-3{...}` 无 `.grid-4` | 用 `.grid-3` 作为 anchor |
| 已有 `@media(max-width:720px)` | append 而非 inject |

## 验证命令

```bash
# CDN 验证
curl -sS -I "https://<user>.github.io/<repo>/docs/<slug>.html" | grep 'age\|content-length'
curl -sS -o /dev/null -w '%{http_code}' "https://<user>.github.io/<repo>/assets/img/<slug>/x-post.jpg"

# 静态验证（相对路径问题）
# HTML 在 docs/ 下，../assets/ 会 404，必须是绝对 URL
```

## Git commit 流程

```bash
cd $REPO
git add docs/
git commit -m "fix: add mobile responsive breakpoints (720px) for grid-2/3/4 across N infocards"
git push origin main
# CDN 需 ~10-30s 刷新
```
