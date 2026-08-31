# GitHub API Rate Limit Recovery (2026-07-09)

## Trigger
`api.github.com` 返回 `{"message":"API rate limit exceeded for 43.198.86.110...","documentation_url":"..."}`。

## Fallback Stack（按顺序尝试）

### 1. raw.githubusercontent.com（最快）
```bash
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md" | head -100
```
适用于 README.md、内容文件。不需要 auth，不走 API 层。

### 2. GitHub HTML 页面（结构化数据提取）
```bash
# Stars 从页面 HTML 提取
curl -s "https://github.com/{owner}/{repo}" | grep -oP '"star[^"]*":\s*\d+' | head -5

# 或从 shields.io badge
curl -sL "https://img.shields.io/github/stars/{owner}/{repo}?logo=github&color=yellow"
```
适用于：无 auth 时获取 stars/forks/watchers 等基础数据。

### 3. 轮询等待（限本次请求的 rate limit 恢复）
GitHub API 限流（未认证）：60 req/hr = 每请求约 1 分钟恢复。
```bash
# 等待 60s 后重试（不推荐优先使用，耽误发布流程）
sleep 60
```
适用于：没有备用数据源时最后手段。

### 4. 搜索引擎补充（快速事实核查）
```javascript
// node fetch 走 HTTPS，无需 auth
const https = require('https');
https.get('https://api.github.com/repos/{owner}/{repo}',
  { headers: { 'User-Agent': 'curl/7.88.1', 'Accept': 'application/vnd.github.v3+json' } },
  res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>console.log(JSON.parse(d).stargazers_count)); }
);
```

## 本次教训
| 失败场景 | 备用方案 |
|---------|---------|
| `node -e` Node fetch GitHub API 超限 | `curl -s raw.githubusercontent.com` |
| GitHub API 429/403 | `shields.io` badge URL → 直接下载 SVG/PNG |
| 无网络/无法访问 | 从 README 内容提取字段 |

## 最佳实践
- 并行发布多张卡时，先用 `raw.githubusercontent.com` 获取 README 内容，再决定是否需要调用 API
- Stars/Forks 等基础数据可以降级为 shields.io badge 抓取
- API 限流后直接跳过，不等待，用降级数据源继续发布流程
