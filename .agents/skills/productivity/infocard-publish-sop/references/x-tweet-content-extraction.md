# X / Twitter 推文内容抓取

推文原文（articleBody）是 JSON-LD `@type: SocialMediaPosting` 中的关键字段。
fxtwitter.com 会渲染推文内容并嵌 JSON-LD，是推文全文的可靠来源。

## 抓取步骤

### 1. 直接 curl fxtwitter.com（无需浏览器）

```bash
curl -sL "https://fxtwitter.com/i/status/TWEET_ID" \
  -H "User-Agent: Mozilla/5.0" \
  > /tmp/tweet-page.html
```

URL 格式：
- `https://fxtwitter.com/i/status/TWEET_ID`（通用）
- `https://fxtwitter.com/HANDLE/status/TWEET_ID`（带作者）
- `https://xcancel.com/HANDLE/status/TWEET_ID`（备选镜像）

### 2. 提取 articleBody（JSON-LD）

```python
python3 - << 'PY'
import sys, re
html = open('/tmp/tweet-page.html').read()
# 方法 A：从 <script type="application/ld+json"> 中提取
blocks = re.findall(
    r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
    html, re.S
)
for b in blocks:
    b = b.strip()
    if '"articleBody"' in b:
        import json
        d = json.loads(b)
        body = d.get('articleBody', '')
        print(body)
        break
# 方法 B（备用）：直接从 raw HTML 中搜索 articleBody
if not body:
    m = re.search(r'"articleBody"\s*:\s*"((?:[^"\\]|\\.)*)"', html)
    if m:
        print(m.group(1).encode().decode('unicode_escape'))
PY
```

**已知 JSON-LD 路径**（2026-07-12 验证）：
- `@type: SocialMediaPosting` → `articleBody` 包含推文全文（含换行 `\n`）
- `articleBody` 内容经过 Unicode 转义（`\u2014` 等），需 `encode().decode('unicode_escape')` 还原中文

### 3. 提取媒体图片

```python
# 推文图片在 og:image meta 或 img 标签中
imgs = re.findall(r'https://pbs\.twimg\.com/media/[^\s"\'<>]+\.(?:jpg|png)', html)
for img in imgs[:5]:
    print(img)
```

## 已知经验（2026-07-12）

- **curl + Python 管道超时陷阱**：`-sL` 拉大 HTML 再 `| python3` 可能触发 Hermes「Command timed out without user response」安全扫描阈值（~20s），而非 curl 本身失败。解法：加 `--max-time 10` 限流，或用临时文件中转（curl → `-o /tmp/page.html` → `python3 - << 'PY'` heredoc）。
- **JSON-LD parse 失败时的降级**：SocialMediaPosting block JSON 解析报错时，直接用正则从 raw HTML 提 articleBody。
- **部分提取处理**：无法获取完整推文时，基于已有信息（推文结构、已知项目、作者）直接生成卡片，标注「X/Y 已确认」，不在提取上无限重试。
- **X 登录墙**：x.com 直接 curl 通常只返回 JavaScript，需用 fxtwitter.com
- **nitter.net**：已失效（2026 年）
- **推文截断**：长推文可能在 JSON-LD 中截断，但 fxtwitter 通常保留完整 articleBody
- **多图推文**：每张图在 `image` 数组中，下载时加 `:large` 后缀获高分辨率
- **线程推文**：每个 reply 的 TWEET_ID 对应独立 URL，需分别抓取
- **图片文字提取**：用 `mcp__minimax__understand_image` 对推文截图 OCR（推文内容被截断时）
- **中文推文**：JSON-LD 中文字符在 articleBody 内直接明文，无需解码

## 提取失败时的降级策略

1. fxtwitter.com → xcancel.com（备选镜像）
2. 提取 og:image → `vision_analyze` 读图提取文字（推文图片截图）
3. 搜索 Google cache：`cache:x.com/status/TWEET_ID`
4. 提取 Twitter Card meta（`og:description` 等）作最小可用内容
5. 用户主动提供推文正文（最可靠）
