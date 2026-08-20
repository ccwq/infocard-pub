# infocard-pub · GitHub Research + Wiki Sync 完整流水线（2026-07-07）

## 标准发布流程（8 步）

```
调研 → 写卡 → 写 meta.yaml → 构建 → 发布 → HTTP 验收 → 截图 → Wiki 同步
```

### Step 1: 调研（4 源并行）
> **数据来源职责划分（2026-07-07 实测确认）**：GitHub API 和 README 各司其职，不混用。

```bash
# A. GitHub REST API（数值）
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/<owner>/<repo>" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('stars:', d['stargazers_count'])
print('forks:', d['forks_count'])
print('license:', d['license']['spdx_id'])
print('language:', d['language'])
print('topics:', d['topics'])
"

# B. README.md（功能描述 / 工作流 / 技术栈 / 安装命令 / 作者信息）
curl -s "https://raw.githubusercontent.com/<owner>/<repo>/main/README.md" | head -200
```

| 数据 | 来源 | 说明 |
|------|------|------|
| Stars / Forks / Language / License | GitHub API | 数值权威来源 |
| 项目定位 / 功能描述 / 工作流步骤 / 技术栈 / 安装命令 | README.md | 卡内容的 primary source |
| 官方来源 / 作者信息 | README 中的官方链接区块 | 通常在头部或底部 |

### Step 2–4: 写卡 + meta.yaml + build（见 skill `infocard-redswiss-style`）

### Step 5: 发布

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
node scripts/build-site.js 2>&1 | tail -5
node scripts/verify-index.js 2>&1 | tail -3
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish <name> infocard"
git push origin main
```

### Step 6: HTTP 验收

```bash
# GitHub Pages CDN 缓存约 60-120s，需等待
for i in 1 2 3 4 5; do sleep 20
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/<slug>.html")
  echo "[$i] HTTP $code"
  [ "$code" = "200" ] && break
done
```

### Step 7: 390px 截图

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://ccwq.github.io/infocard-pub/docs/<slug>.html',
              wait_until='networkidle')
    page.screenshot(path='/tmp/<slug>-mobile.png', full_page=True)
    browser.close()
```

### Step 8: Wiki 同步

**Wiki 根**：`/home/ccwq/hehome/hermes-data/home/wiki`

```bash
# 1. 发布前先检查是否已有条目（避免重复）
find <WIKI> -name "*<slug>*" 2>/dev/null
grep -n "<Name>" <WIKI>/index.md

# 2. 写 2 个新文件
# raw/articles/YYYY-MM-DD-infocard-<slug>.md
# concepts/<slug>.md  或  entities/<slug>.md

# 3. 更新已有条目（如果存在）
# grep -n 找到行 → patch 更新 Stars/描述

# 4. 更新 index.md 条目描述

# 5. 追加 log.md

# 6. ⚠️ Git add 顺序陷阱：新文件必须先 add 再 commit
git add raw/articles/<new>.md concepts/<slug>.md index.md log.md
git commit -m "wiki: add <slug> infocard 2026-07-07"
git status   # 确认工作区干净
```

## 单开源项目信息卡典型节结构（RedSwiss）

| 节号 | 标题 | CSS 组件 | 适用内容 |
|------|------|----------|----------|
| 01 | 核心爽点 | `.feature-grid`（2列） | 4-6个卖点卡片 |
| 02 | 技术架构 | `.arch-diagram`（3列） | 应用→引擎→存储 三层 |
| 03 | vs 对比 | `.comparison-table`（4列） | ★项目 vs 同类A vs B vs C |
| 04 | 适用场景 | `.scenario-list` | 场景名+描述列表 |
| 05 | 快速上手 | `.quick-cmd` + `.code-block` | pip install + 代码示例 |
| 06 | 版本新特性 | `.cli-grid`（4列） | 新版本亮点 |

参考卡：`docs/20260707-zvec.html`（相对于当前 active repository root）
