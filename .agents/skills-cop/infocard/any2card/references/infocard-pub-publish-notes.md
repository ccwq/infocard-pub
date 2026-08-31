# any2card × infocard-pub 发布流程 + 已知陷阱

## 发布完整脚本

```bash
REPO_DIR="$(git rev-parse --show-toplevel)" || exit 1
SLUG="YYYYMMDD-keyword"
cp /tmp/info-card-*.html "$REPO_DIR/docs/$SLUG.html"

# meta.yaml（heredoc 规避中文引号 YAML linter 问题）
cat > "$REPO_DIR/docs/$SLUG.html.meta.yaml" << 'EOF'
slug: YYYYMMDD-keywords
path: docs/YYYYMMDD-keywords.html
category: docs
title: 标题（无中文引号）
date: "YYYY-MM-DD"
tags:
  - tag1
  - tag2
EOF

# commit
cd "$REPO_DIR"
git add docs/$SLUG.html docs/$SLUG.html.meta.yaml
git commit -m "Add {title} · YYYY-MM-DD"
git push origin main

# 重建索引
python3 -c "
import os, glob, yaml
docs = sorted(glob.glob('docs/*.html.meta.yaml'), reverse=True)[:50]
lines = []
for f in docs:
    with open(f) as fh:
        d = yaml.safe_load(fh.read())
    slug = os.path.basename(f).replace('.html.meta.yaml','')
    lines.append(f'  - slug: {slug}')
    lines.append(f'    path: {d.get(\"path","")}')
    lines.append(f'    category: {d.get("category","")}')
    lines.append(f'    title: {d.get("title","")}')
    lines.append(f'    date: {d.get("date","")}')
with open('_index.yaml','w') as f:
    f.write('# _index\n')
    for l in lines:
        f.write(l + '\n')
print('Done, entries:', len(docs))
"
git add _index.yaml
git commit -m "Rebuild index · $(date +%Y-%m-%d)"
git push origin main

# 验证
RAW_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/$SLUG.html)
echo "raw: $RAW_CODE"
PAGES_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  https://ccwq.github.io/infocard-pub/$SLUG.html)
echo "pages: $PAGES_CODE"
```

## 流程概览

```
① 研究完成 → 数据提炼（标题/副标题/4-6要点/金句/来源）
② any2card skill → 瑞士红黑主题生成 /tmp/info-card-{keyword}.html
③ cp → $REPO_DIR/docs/{slug}.html
④ heredoc meta.yaml → $REPO_DIR/docs/{slug}.html.meta.yaml
⑤ git add + commit + push
⑥ 重建 _index.yaml + push
⑦ 验证 raw → 验证 pages
```

## 已知陷阱

| 陷阱 | 后果 | 正确做法 |
|------|------|---------|
| write_file 写含中文引号的 meta.yaml | YAML linter 报错无法写入 | 用 heredoc `<< 'EOF'` |
| 只 push HTML 不 push meta.yaml | 索引不包含该卡片 | 两文件同时 add + commit |
| 不重建 _index.yaml | Pages 列表缺失新卡片 | 每次 push 必须重建 |
| Pages 404 就放弃 | 用户拿不到链接 | raw 立即可访问，先交付 |
| yaml.safe_load 缺 category 字段 | KeyError | meta.yaml 必须含 category 字段 |
| Pages 永远比 raw 慢 1-2 分钟 | 验证顺序错误浪费时间 | raw → pages 顺序验证 |
| git push 报 "fetch first" remote has work | push 被拒，本地 commit 无法推送 | 先 `git stash`（如有 unstaged）→ `git pull --rebase` → `git stash pop` → `git push` |
| rebase 出现冲突 | rebase 卡死，无法继续也无法推送 | `git rebase --abort` → `git fetch origin && git reset --hard origin/main` → 重建 _index.yaml → push |
| push 后再次报 "fetch first" | 远程又有新 commit（Actions workflow 可能自动提交了 _index.yaml） | 重复 stash → pull --rebase → stash pop → push |
| `git pull --rebase` 报 "You have unstaged changes" | 有本地未暂存的修改阻碍 pull | 先 `git stash` 再 pull |

| HTML 文件顶部放 YAML frontmatter `---\nname:...\n---` | 页面顶部渲染出 `---\nname:` 等代码，用户看到"一堆代码" | 元数据只放在 `.meta.yaml`；HTML 文件必须是干净页面，以 `<!-- comment -->` 或 `<style>` 开头，绝不放 `---` frontmatter |
| 声明了主题但没用对应 CSS | 用户说"和主题没有任何关系" | 主题必须通过 CSS 变量和布局结构实际实现（如 Q 版须有 `--q-bg: #faf8f3`、厚黑边框、圆角等），不能只在 frontmatter 写 `layout: q` |
| 给 SKILL.md 类仓库建信息卡时按"仓库概述"而不是"用户使用视角" | 内容与用户期望（安装/使用/示例/记忆）不符 | SKILL.md 类卡片必须走安装命令 → 核心脚本用法 → 真实代码示例（从 `assets/` 或 `example/` 抓取）→ 决策树 → Agent 记忆区结构，见 `any2card` skill 中 "GitHub 技能 / 工具注册表卡的补充规则" 节的 SKILL.md 视角子规则 |
| Pages 延迟处理

若 Pages 返回 404 但 raw 返回 200：
- 等待 1-2 分钟让 GitHub Actions 自动构建
- 或在 GitHub Actions 页面手动 "Run workflow"
- raw URL 立即可用，先交付用户

## Swiss Red 主题参数速查

| 元素 | 值 |
|------|-----|
| 页面宽度 | 780px max-width |
| 标题 | clamp(1.6rem, 5.2vw, 2.8rem)，字重 900，letter-spacing -0.04em |
| 条目标题 | .88rem，字重 900，大写，#e60012 红 |
| 正文 | .78rem，行高 1.52 |
| 标签 | .62rem，字重 800 |
| 间距 | .75rem gap / .95rem padding |
| 红色 | #e60012 |
| 黑色 | #000000 |
| 边框 | 2px solid #000，硬边框（无圆角） |
| 分隔条 | height: .28rem，background: #e60012 |
| 按钮 | linear-gradient(135deg, #e60012, #b3000f) |
| 字体文件 | TsangerJinKai02-W04.ttf / NotoSerifSC-Regular.ttf（本地路径） |
