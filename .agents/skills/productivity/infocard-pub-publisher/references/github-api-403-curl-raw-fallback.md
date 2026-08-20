# GitHub API 403 → curl raw URL fallback（2026-06-27）

## 症状

`curl https://api.github.com/repos/{owner}/{repo}` 返回全 null 字段：
```json
{"name": null, "full_name": null, "description": null, ...}
```

GitHub API 对未认证请求有 60 req/hr 的严格限制，快速连续请求后触发 403（无认证 token 时返回全 null 而非 403 HTTP code）。

## 修复路径（已验证，2026-06-27）

**直接用 `raw.githubusercontent.com` 取 README**：
```bash
curl -sA "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
```

优先级顺序：
1. `raw.githubusercontent.com/{owner}/{repo}/main/README.md`（通常最快）
2. `raw.githubusercontent.com/{owner}/{repo}/master/README.md`（有些仓库用 master）
3. GitHub Contents API + base64 解码（兜底，但多一步解码）

## GitHub Contents API 兜底（JSON + base64）

```python
import urllib.request, base64, json
url = f'https://api.github.com/repos/{owner}/{repo}/contents/README.md'
req = urllib.request.Request(url, headers={'User-Agent': 'Hermes'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = json.load(r)
content = base64.b64decode(data['content']).decode('utf-8')
```

⚠️ `data['content']` 是 base64 字符串（带 `\n` 换行符），`base64.b64decode` 直接解码即可。

## 验证命令

```bash
# 检查 raw README 是否可读
curl -sI "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md" | head -1
# HTTP/2 200 → 可用
# HTTP/2 404 → 换 main/master 分支
# HTTP/2 000 → 网络封锁
```

## 场景记录

- 2026-06-27：`lishuangqiang/backend-agent-resume-scout` — GitHub API 全 null，`raw.githubusercontent.com` 正常返回完整 README（326KB），成功抓取。
- 2026-06-27：`alibaba/page-agent` — GitHub API 全 null，`raw.githubusercontent.com` 同样正常。

## 根因

GitHub API 对未认证请求有速率限制，此环境请求频率触发限制后返回全 null（不一定是 HTTP 403 code）。`raw.githubusercontent.com` 是 CDN 路径，不走 API 限速逻辑。
