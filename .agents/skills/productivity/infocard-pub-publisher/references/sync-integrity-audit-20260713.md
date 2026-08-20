# infocard-pub → LLM Wiki Raw Sync 完整性审计

**日期：** 2026-07-13
**触发：** 对抗审查——不信任单一来源的交叉验证

---

## 审计范围

| 路径 | 内容 |
|------|------|
| `REPO` = `$REPO_ROOT/docs/`（由 active repo root 解析） | 501 个 HTML 文件（公网信息卡） |
| `WIKI_RAW` = `~/hehome/hermes-data/home/wiki/raw/articles/` | 802 个 .md 文件（含重复 slug） |

---

## 已知 Frontmatter 格式类型

Wiki raw 文件经历了多次格式演变，当前存在 **3 种** frontmatter 格式：

### 类型 A — 当前标准格式（334/802）
```yaml
---
title: "标题"
desc: "描述（实质内容，非空）"
source: "raw/articles/<card_slug>"
tags: ['tag1', 'tag2']
created: 2026-07-09
---
```
- `created` 字段混用两种格式，**均不是纯 `YYYY-MM-DD`**
  - `YYYY-MM-DD HH:MM:SS`（空格分隔，无时区）：192 张
  - `YYYY-MM-DDTHH:MM:SS+08:00`（ISO8601，带东八区时区）：153 张

### 类型 B — 旧格式（300/802）
```yaml
---
source_url: https://ccwq.github.io/infocard-pub/docs/<slug>.html
infocard_url: https://ccwq.github.io/infocard-pub/docs/<slug>.html
slug: <slug>
ingested: 2026-06-15
sha256: <hash>
---
```
无 `title`/`desc`/`source`/`tags`/`created` 字段，由批量同步或旧版脚本生成。

### 类型 C — 无 frontmatter（121/802）
仅有 `--` 行或完全裸文，来自手工创建或非标准写入流程。

### 类型 D — 单分隔符（10/802）
```markdown
---
# 文件内容...
```
只有 opening `---`，无 closing `---`，frontmatter 未闭合。

---

## 已发现的系统性腐蚀问题

### 问题 1：`created` 日期格式漂移（高危）
345 张（含类型 A+B）全部使用非纯 `YYYY-MM-MM` 格式。
**根因：** 同步脚本生成 `created` 时未强制格式化，直接使用语言默认的 datetime 字符串。
**影响：** 任何基于 `YYYY-MM-DD` 的前端matter验证脚本会全部失败。
**修复：** 同步脚本写入前统一截断为 `YYYY-MM-DD`。

### 问题 2：128 个 slug 被重复写入（覆盖）
同一 slug 出现 2–3 次，后写入的覆盖先写入的。
最高重复：`infocard-20260607-mattpocock-skills-redswiss` 和 `infocard-20260607-agent-reach` 各 3 次。
**根因：** 同步脚本在 slug 冲突时选择覆盖而非跳过或版本化。
**影响：** 丢失中间版本的 raw 记录。

### 问题 3：覆盖率 99.2%（4 张缺失）
| 缺失 slug | 说明 |
|-----------|------|
| `hermes-security-deployment` | repo 有 HTML，wiki 无 raw |
| `20250615-niyazov-turkmenbashi` | 非 infocard- 前缀的调查卡 |
| `fact-store` | 无日期前缀的裸名文件 |
| `claude-code-skill清单-full` | 含中文字符 |

### 问题 4：空 `desc` 字段（4 张）
- `2026-06-14-infocard-hermes-memory-system.md`
- `2026-06-21-infocard-boogu-image-open-source-model-family-darkblue.md`
- `2026-06-21-infocard-deepanalyze-agentic-autonomous-data-science.md`
- `2026-06-21-infocard-wechat-article-to-markdown-camoufox-fetcher.md`

### 问题 5：文件名规范（2 张不合规）
- `js-avo-inspector.md`
- `visual-style-history-2026-05-30.md`

---

## 审计命令模板

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
REPO="$REPO_ROOT/docs"
WIKI_RAW=~/hehome/hermes-data/home/wiki/raw/articles

# 1. 覆盖率：缺失的 HTML slug
cd "$REPO"
for f in *.html; do
  name="${f%.html}"
  if [[ "$name" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}-(.+)$ ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
done | sort -u > /tmp/repo_slugs.txt

cd "$WIKI_RAW"
for f in *.md; do
  name="${f%.md}"
  suffix="${name#????-??-??-}"
  echo "$suffix"
done | sort -u > /tmp/wiki_slugs.txt

comm -23 /tmp/repo_slugs.txt /tmp/wiki_slugs.txt  # 缺失的

# 2. 重复 slug
cd "$WIKI_RAW"
ls | sed 's/^[0-9-]*-//' | sed 's/.md$//' | sort | uniq -c | sort -rn | grep -v '  1 '

# 3. Frontmatter 格式分类
echo "含 title:" && grep -l '^title:' "$WIKI_RAW"/*.md | wc -l
echo "无frontmatter:" && grep -L '^---' "$WIKI_RAW"/*.md | wc -l
echo "单分隔符:" && for f in "$WIKI_RAW"/*.md; do
  [ $(grep -c '^---$' "$f") -eq 1 ] && echo "$(basename "$f")"
done | wc -l

# 4. 日期格式分布
echo "ISO T+timezone:" && grep '^created:' "$WIKI_RAW"/*.md | grep 'T' | grep '+08:00' | wc -l
echo "space format:" && grep '^created:' "$WIKI_RAW"/*.md | grep ' ' | grep -v 'T' | wc -l
echo "纯 YYYY-MM-DD:" && grep '^created:' "$WIKI_RAW"/*.md | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | wc -l
```

---

## 结论

同步机制已覆盖 497/501（99.2%），但存在 **日期格式漂移、重复覆盖、空 desc** 三个慢性腐蚀问题。
审计方法本身（repo HTML slug 提取 vs wiki raw slug 提取 + `comm` 差集）可作为定期巡检脚本固化。
