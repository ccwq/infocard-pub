# 已发布信息卡文案 / 翻译校对工作流

> **何时用**：用户对已有卡的标题、正文、翻译、术语提出修正（如"牛肉项目雷达 → 真材实料项目雷达"），而不是新建卡。

## 标准链路

### 1. 全库搜索锚点字符串

用 `search_files` 在整个 `infocard-pub/` 仓库中搜索旧字符串，找出所有出现位置：

```bash
search_files(path="<active-repository-root>", pattern="牛肉项目雷达", target="content")
```

常见命中位置（按优先级）：
- `docs/<slug>.html` — 标题 banner / hero / footer
- `docs/<slug>.html.meta.yaml` — title / desc
- `_index.yaml` — 索引中的 title / desc
- `index.html` — 首页注入的 `#home-index-data`

### 2. 同步替换四处

| 文件 | 改动类型 |
|------|---------|
| `docs/<slug>.html` | 正文替换（banner/title/hero/footer/body） |
| `docs/<slug>.html.meta.yaml` | title + desc |
| `_index.yaml` | 索引数据（由 build 生成，也可手动同步） |
| `index.html` | 首页注入数据（由 build 生成，也可手动同步） |

**注意**：_index.yaml 和 index.html 通常由 `npm run build` 自动从 meta.yaml 重新生成，但若 build 后仍保留旧值（stale），需要手动 patch。 safest 做法：build 前手动 patch 所有四处。

### 3. 构建 + 提交 + 推送

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
git fetch && git status -sb   # 先确认无分叉
npm run build                # 生成 _index.yaml 和注入 index.html
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "refactor: <旧词> → <新词>，<修正原因>"
git push
```

### 4. 验收

GitHub Pages 部署延迟 60-150 秒，push 成功后不能立即报告成功：

```bash
sleep 90
curl -sI "https://<user>.github.io/<repo>/docs/<slug>.html"
# 等待 HTTP 200
```

## 常见翻译修正案例

### 案例：网络黑话 → 直译

- **牛肉项目雷达**（互联网黑话 = "有料/实在"）→ **真材实料项目雷达**（直译，表意更干净）
- 判断方法：黑话有歧义风险（"牛肉"可误解为掐架），直译更稳

### 案例：英文专有名词 → 中文表述

当 GitHub 原始名称是英文但中文读者需要更自然的表达时，优先保留：
- 工具名 / 项目名：保留原文（如 Codex Skill、Backend Agent）
- 普通功能描述：翻译为中文正文
- 中文优先规则：内容区标题、正文、说明、标签全部中文

## 坑点

- **Stale index 数据**：build 后若 _index.yaml / index.html 仍有旧值，手动 patch 这两个文件，不要等下次 build 自动修复
- **git status 空输出 ≠ 失败**：检查 exit code
- **Pages 延迟**：push 后 90s 内 404 正常，轮询直到 200 才报告成功
- **搜索要包含 docs/ 子目录**：某些卡有两个 slug（如 beef-radar + backend-agent-resume-scout），两处都要改
