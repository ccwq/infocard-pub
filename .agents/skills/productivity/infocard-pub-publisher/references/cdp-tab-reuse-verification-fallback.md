# CDP tab-reuse: X.com navigation + image fallback (updated 2026-06-18)

## 已知问题

`browser_navigate` 对 x.com 超时（`CDP command timed out: Page.enable`），连续重试均失败。解决：复用已有 CDP tab 导航。

## Pattern 1：复用已有 tab 导航全新 URL（x.com 推文采集）

当浏览器中没有目标 URL 时，用任意已有 page tab 加载新 URL：

```javascript
// Step 1: 列出现有 tabs，找任意 page 类型 tab
browser_cdp(method='Target.getTargets', params={})
// → 找 type="page" 的 targetId，不需要 URL 匹配

// Step 2: 在该 tab 导航到目标 URL（可以是全新域名）
browser_cdp(method='Page.navigate',
  params={'url': 'https://x.com/i/status/2066873934243340478'},
  target_id='<任意page类型targetId>')

// Step 3: 启用 Page（必须）
browser_cdp(method='Page.enable', params={}, target_id='<同targetId>')

// Step 4: 等待加载后抓取内容
browser_snapshot(full=false)
```

**关键发现**：不需要 URL 匹配 — 任意已有的 `type="page"` tab 都可用来加载全新 URL（跨域完全可行）。

## Pattern 2：已有 tab 重新导航（已加载页面的刷新）

当浏览器已加载目标页面只需刷新时：

```javascript
browser_cdp(method='Target.getTargets', params={})
// → 找 url 匹配的 targetId

browser_cdp(method='Page.navigate',
  params={'url': 'https://example.com/page'},
  target_id='<匹配的targetId>')

browser_cdp(method='Page.enable', params={}, target_id='<同targetId>')
```

## Base64 解码 CDP screenshot

CDP 返回的是大块 base64 PNG 数据：
```python
import base64
# 从工具输出文件中提取 base64 数据
start = content.index('"data": "') + 8
end = content.rindex('", "target_id"')
b64 = content[start:end]
img = base64.b64decode(b64)
with open('/tmp/screenshot.png', 'wb') as f:
    f.write(img)
```

## Twitter Snowflake ID 估算发布时间

当只知道推文 ID（如 `2066873934243340478`）时：

```python
tweet_id = 2066873934243340478
twitter_epoch = 1288834974657  # 毫秒
ts_offset = tweet_id >> 22
ts_ms = ts_offset + twitter_epoch
import datetime
dt = datetime.datetime.fromtimestamp(ts_ms / 1000, tz=datetime.timezone.utc)
print(dt)
# 2026-06-16 13:22:01.241000+00:00
```

**注意：** 如果解码结果早于 2020 年，X 可能已切换 snowflake 格式。尝试 `(tweet_id >> 26) + 1700000000000`。

## 不要做的事

- `browser_navigate` 超过 2 次失败立即切换 tab 复用模式。
- 不要假设浏览器已加载目标 URL，即使是同一会话。
- 不要用 `Page.navigate` 不带 `Page.enable`——内容抓取会失败。

## 相关参考

- `references/browser-cdp-verification-fallback.md` — 通用 CDP 兜底
- `references/git-home-env-and-cdp-screenshot-fallback.md` — 系统 Chrome headless 截图兜底
