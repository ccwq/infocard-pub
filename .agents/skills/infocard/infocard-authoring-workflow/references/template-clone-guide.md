# Template Clone Reference Guide

## Available templates

| Style | File | Trigger |
|---|---|---|
| darkblue | `theme/darkblue.html` | AI 架构 / 方法论 / Agent 架构 / Multi-Agent |
| hardblue | `theme/hardblue.html` | 硬核工具 / CLI / 技术手册 / 开源图鉴 |
| redswiss | `theme/redswiss.html` | 开源对比 / 红黑瑞士风 |
| white-purple | `theme/white-purple.html` | 知识型 / 教程 / 方法论 |
| q-style | `theme/q-style.html` | 本地部署 / 工具类 |
| pixelstack | `theme/pixelstack.html` | 像素风 / 复古 |
| crayon | `theme/crayon.html` | 编辑海报 / 视觉丰富 |

## Template title tag

Every template has a `<title>` that must be replaced before body replacement.

```
darkblue:      <title>infocard-darkblue-style 元素演示</title>
hardblue:      <title>infocard-hardblue-style 元素演示</title>
redswiss:      <title>infocard-redswiss-style 元素演示</title>
white-purple:  <title>infocard-white-purple-style 元素演示</title>
```

## Full clone command sequence (always use --detach)

⚠️ **Do not use `git worktree add -b <branch> origin/main`** when the primary checkout HEAD is not `main` — it fails with `fatal: invalid reference`. The repo's primary checkout is often on a named work-branch (e.g. `infocard/20260804-qm-agent`). Use `--detach` instead:

```bash
STYLE=darkblue
SLUG=my-card-name
REPO="$(git rev-parse --show-toplevel)" || exit 1
WORKTREE=/home/ccwq/infocard-${SLUG}-wt   # avoid /tmp if disk is tight (~same partition as /)

# 1. Fetch origin/main so rev-parse works
git -C "$REPO" fetch origin main --depth=1

# 2. Get SHA and create detached-HEAD worktree
SHA=$(git -C "$REPO" rev-parse origin/main)
git -C "$REPO" worktree add --detach "$WORKTREE" "$SHA"

# 3. Copy template
cp "$WORKTREE/theme/$STYLE.html" "$WORKTREE/docs/$SLUG.html"

# After authoring:
# git -C "$WORKTREE" add docs/$SLUG.html docs/$SLUG.html.meta.yaml _index.yaml index.html
# git -C "$WORKTREE" commit -m "feat: publish $SLUG"
# git -C "$WORKTREE" push origin HEAD:refs/heads/main   # NOTE: HEAD not a branch name
```

**Why `--detach` is safer**: it bypasses branch tracking entirely. The primary checkout's HEAD ref does not matter.

**Disk space note**: `/tmp` may be on the same partition as `/` (69G total, 80% used). A ~2,258-file repo clone can fail mid-write with "Could not write new index file". Use `/home/ccwq/<slug>-wt` as the worktree root instead.

**Verified 2026-08-12**: Primary checkout at `infocard/20260804-qm-agent`, `origin/main` not locally available → `worktree add -b origin/main` failed. `--detach` + `fetch` + `HEAD:refs/heads/main` succeeded.

## Body replacement pattern

```python
import re
path = 'wt-<slug>/docs/<slug>.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<title>OLD_TITLE</title>', '<title>NEW_TITLE</title>')

new_body = r'''<main class="page">
...your content...
</main>
</body>
</html>'''

html_new = re.sub(r'<main class="page">.*?</html>', new_body, html, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f:
    f.write(html_new)
```

## Validate the replacement

```bash
python3 -c "
import re
with open('wt-<slug>/docs/<slug>.html') as f:
    html = f.read()
assert '<main class=\"page\">' in html
assert '<title>OLD_TITLE</title>' not in html
assert 'REPLACED_TITLE' in html
print('OK:', len(html), 'bytes')
"
```

## Practical notes

- If a worktree already exists, do not create a second one.
- Prefer writing directly into the existing docs path when the card is being authored in place.
- If the HTML is modest in size, direct `write_file` is usually the fastest and safest option.
- Keep `meta.yaml` as a single YAML document with quoted paths and publication timestamps.
