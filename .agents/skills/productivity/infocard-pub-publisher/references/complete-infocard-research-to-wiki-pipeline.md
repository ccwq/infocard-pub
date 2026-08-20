# 完整信息卡发布流程（Research → Build → Verify → Wiki 同步）

> 来源：2026-07-07 pocket-tts infocard 实测完整 pipeline
> 适用：首次发布全新卡（不是刷新已有卡）

## 完整 SOP

### 0. 调研阶段（并行）
```bash
# GitHub API + README 并行拉取
curl -sL https://api.github.com/repos/<owner>/<repo>
curl -sL https://raw.githubusercontent.com/<owner>/<repo>/main/README.md

# 检查是否已存在
ls docs/<slug>* 2>/dev/null || echo "NOT EXISTS"
```

### 0b. 数据来源职责划分（2026-07-07 实测确认）

GitHub API 和 README 各司其职，不要混用：

| 数据 | 来源 | 原因 |
|------|------|------|
| Stars / Forks / Language / License | `api.github.com/repos/<owner>/<repo>` | 数值权威来源 |
| 项目定位 / 功能描述 / 工作流步骤 / 技术栈 / 安装命令 | `raw.githubusercontent.com/main/README.md` | README 是卡内容的 primary source |
| 官方来源 / 作者信息 | README 中的官方链接区块 | 通常在 README 头部或底部 |

**反面案例**：用 API 的 `description` 字段（通常只有一句话）作为卡描述 → 内容单薄。README 即为卡内容 primary source。

### 1. 写卡阶段
1. 基于 README + GitHub API 数据 write_file HTML
2. **首次写 meta.yaml 时同时写两个字段**：
   ```yaml
   date: "2026-07-07 20:49:42"   # 东八区时间，YYYY-MM-DD HH:MM:SS
   updated: "2026-07-07 20:49:42"  # 必须写！CI gate 要求
   ```
   ⚠️ 只写 `date` 会触发 CI gate 报错：`missing required updated`

### 2. Build + Verify
```bash
cd /home/ccwq/qbox/opendir/project/infocard-pub
npm run build && npm run verify
```
- 失败常见原因：`updated` 字段缺失 → 补上后重跑

### 3. Git Commit + Push
```bash
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish <slug> infocard"
git push origin main
```

### 4. HTTP 200 验收
```bash
for i in 1 2 3 4 5; do sleep 25
code=$(curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/<slug>.html")
echo "[$i] HTTP $code"
[ "$code" = "200" ] && break
done
```

### 5. 390px 移动端截图（Playwright）
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto(url, wait_until='networkidle')
    page.screenshot(path='/tmp/<slug>-mobile.png', full_page=True)
    browser.close()
```

### 6. Wiki 同步（强制，不询问）
Wiki 路径：`/home/ccwq/hehome/hermes-data/home/wiki/`

需要创建/更新的文件：
| 文件 | 内容 |
|------|------|
| `raw/articles/<date>-infocard-<slug>.md` | 完整文章版内容 |
| `concepts/<slug>.md` | 概念速查页 |
| `index.md` | 更新总页数（+1）|
| `log.md` | 追加日志记录 |

```bash
cd /home/ccwq/hehome/hermes-data/home/wiki
git add raw/articles/<date>-infocard-<slug>.md concepts/<slug>.md index.md log.md
git commit -m "feat: add <slug> wiki"
git push origin main
```

## 关键陷阱

### P1: `updated` 字段缺失
- **现象**：`verify-meta-timestamps` 报错 `missing required updated`
- **修复**：补上 `updated: "$publish_ts"`，重跑 `npm run build && npm run verify`
- **预防**：写 meta.yaml 时永远同时写 `date` 和 `updated`

### P2: GitHub API 限流
- **现象**：`KeyError: 'stargazers_count'`
- **降级**：使用 raw README + shield.io 提取数据

### P3: Wiki push 时 index.lock
- **现象**：`error: unable to resolve .../.git/index.lock`
- **修复**：`rm -f /path/to/wiki/.git/index.lock`

## 典型耗时
| 步骤 | 耗时 |
|------|------|
| 调研（README + API） | 5-10s |
| 写卡（HTML + meta） | 30-90s |
| Build + Verify | 10-30s |
| Git push | 5-15s |
| Pages 部署 | 20-90s |
| HTTP 200 验收 | 5-30s |
| 390px 截图 | 10-20s |
| Wiki push | 5-15s |
| **总计** | **约 5-10 分钟** |
