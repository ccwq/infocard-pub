# Wiki Raw Sources 同步规范

## 触发时机

每张 infocard 公网验收（HTTP 200）通过后**立即执行**，不得跳过。Wiki 同步是发布链路的第 11 步，不得延后。

## 标准路径

- **Wiki raw sources**：`~/hehome/hermes-data/home/wiki/raw/articles/`
- **Wiki index**：`~/hehome/hermes-data/home/wiki/index.md`
- **Wiki entity**：`~/hehome/hermes-data/home/wiki/entities/<slug>.md`
- **Wiki log**：`~/hehome/hermes-data/home/wiki/log.md`

## 核心原则

1. **读取 meta.yaml 优先**：每张卡的 frontmatter 数据从 `.html.meta.yaml` 提取，desc 禁止为空
2. **slug 提取必须处理所有日期前缀格式**：
   - `20260524-xxx.html` → `xxx`（8位无连字符）
   - `2026-07-10-xxx.html` → `xxx`（带连字符）
   - `20250615-xxx.html` → `xxx`（早期格式）
   - **正确正则**：`^(?:20\d{6}|2026-\d{2}-\d{2})-([a-zA-Z0-9_\-\u4e00-\u9fff]+)\.html$`
   - 错误正则：`^20\d{6}-`（漏掉 `2026-07-10-` 等带连字符格式）
3. **created 日期格式**：必须是纯 `YYYY-MM-DD`，禁止 `HH:MM:SS` 或 `T...+08:00`
4. **desc 禁止空值**：从 meta.yaml 提取，若 meta.yaml 无 desc 则从 HTML `<title>` + `<meta name="description">` 合成
5. **若目标文件已存在则跳过**（不要覆盖已有内容）

## Raw Article 格式

```yaml
---
title: "<从meta.yaml title或HTML title提取>"
desc: "<从meta.yaml desc提取，禁止空字符串>"
source: raw/articles/<slug去掉日期前缀>
tags: [<从meta.yaml tags提取>]
created: <YYYY-MM-DD，从文件名或meta.yaml date提取>
---

# 标题

<正文摘要，从HTML正文提取，至少200字>
```

## 覆盖率验证（发布后必做）

```bash
python3 -c "
import os, re
repo_dir = '~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub/docs'
wiki_dir = '~/hehome/hermes-data/home/wiki/raw/articles'
repo_slugs = set()
for f in os.listdir(repo_dir):
    if not f.endswith('.html'): continue
    m = re.match(r'^(?:20\d{6}|2026-\d{2}-\d{2})-([a-zA-Z0-9_\-\u4e00-\u9fff]+)\.html\$', f)
    if m: repo_slugs.add(m.group(1))
wiki_slugs = set()
for f in os.listdir(wiki_dir):
    m = re.match(r'\d{4}-\d{2}-\d{2}-infocard-(.+)\.md\$', f)
    if m: wiki_slugs.add(m.group(1))
both = repo_slugs & wiki_slugs
print(f'Repo: {len(repo_slugs)} | Wiki: {len(wiki_slugs)} | Both: {len(both)} | Missing: {len(repo_slugs - wiki_slugs)} | Coverage: {100*len(both)/len(repo_slugs):.1f}%')
if repo_slugs - wiki_slugs:
    print('Missing:', sorted(repo_slugs - wiki_slugs))
"
```

## 2026-07-13 踩坑记录

本轮批量同步（303张新卡 + 10张补漏）发现：

### Bug 1：slug 提取正则遗漏带连字符的日期前缀

- **触发条件**：文件名格式为 `2026-07-10-xxx.html`（含连字符）
- **错误正则**：`^20\d{6}-` 只匹配 `20260710-`，不匹配 `2026-07-10-`
- **后果**：6 张卡（hermes-security-deployment、odysseus、supabase 等）从未被正确处理
- **正确正则**：`^(?:20\d{6}|2026-\d{2}-\d{2})-([a-zA-Z0-9_\-\u4e00-\u9fff]+)\.html$`

### Bug 2：Agent 写入了含日期前缀的完整 slug

- **触发条件**：Agent 用 `20260625-agents-best-practices` 作为完整 slug
- **后果**：写入文件名 `2026-06-25-infocard-20260625-agents-best-practices.md`，包含双重日期前缀
- **修复**：批量重命名脚本，去掉 wiki 文件名中多余的前缀日期部分

### Bug 3：meta.yaml 无 desc 时 Agent 未做 HTML 兜底

- **触发条件**：`desc: ""`（空字符串）时，Agent 仍写入了空值
- **后果**：4 张卡（hermes-memory-system、wechat-article-to-markdown 等）的 desc 为空
- **修复**：手动补写实质性 desc

### Bug 4：created 日期格式混乱

- **两种错误格式**：`YYYY-MM-DD HH:MM:SS`（192张）和 `YYYY-MM-DDTHH:MM:SS+08:00`（153张）
- **正确格式**：纯 `YYYY-MM-DD`
- **修复**：Python 脚本批量正则替换，统一为纯 `YYYY-MM-DD`

## 批量修复脚本

```python
# 修复 created 日期格式
import re, glob
for path in glob.glob("*-infocard-*.md"):
    with open(path) as f: content = f.read()
    new = re.sub(r'^created: "[0-9]{4}-[0-9]{2}-[0-9]{2} [^"]+"$',
        lambda m: 'created: "' + m.group(0).split('"')[1][:10] + '"', content, flags=re.MULTILINE)
    new = re.sub(r"^created: '[0-9]{4}-[0-9]{2}-[0-9]{2}[^']*'$",
        lambda m: "created: '" + m.group(0).split("'")[1][:10] + "'", new, flags=re.MULTILINE)
    new = re.sub(r'^created: [0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:]+[+-][0-9:]+$',
        lambda m: 'created: "' + m.group(0).split('"')[0].split()[-1][:10] + '"', new, flags=re.MULTILINE)
    if new != content:
        with open(path, 'w') as f: f.write(new)

# 修复 wiki 文件名双重日期前缀
import re, os
for fname in sorted(os.listdir('.')):
    m = re.match(r"(\d{4}-\d{2}-\d{2})-infocard-(.+)\.md$", fname)
    if not m: continue
    date_part, full_slug = m.group(1), m.group(2)
    real_slug = re.sub(r"^\d{8}-", "", full_slug)
    if real_slug == full_slug: continue
    new_fname = f"{date_part}-infocard-{real_slug}.md"
    new_path = os.path.join(os.path.dirname(fname) or '.', new_fname)
    if os.path.exists(new_path): os.remove(fname)
    else: os.rename(fname, new_path)
```
