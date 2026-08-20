# X 推文内容抓取方案（2026-06-03 新增）

## 已知限制

X.com（twitter.com）对未认证抓取有限流和重定向：
- `api.vxtwitter.com` 返回截断文本（len < 200 时正文在配图）
- `r.jina.ai` 可以抓取 `https://x.com/i/status/{id}`，但返回仍是摘要而非全文
- `fxtwitter.com` / `xcancel.com` 重定向到登录墙或返回空
- `threadreaderapp.com` API 存在但格式不稳定

## 推荐抓取顺序

1. **`r.jina.ai/https://x.com/i/status/{id}`**（成功率最高，返回较完整文本）
2. **`api.vxtwitter.com/status/{id}`**（返回 JSON，含 user/timestamp/media；文本截断时正文在配图）
3. **CDP 方案**（最后兜底）：如果有已登录的浏览器会话，用 `Runtime.evaluate` 提取 `document.querySelector('article').innerText`

## vxtwitter 截断行为

- 当 `len(text) < 200` 且 `mediaURLs` 非空：推文正文在配图中
- 此时标题不要只复述 URL，应从截断文本提炼"这条帖在主张什么"，并标注"完整内容在配图中"
- `mediaURLs[0]`（按 width 降序第一张）是 hero image

## 本次记录

- Thariq 的 Claude Code 动态工作流推文（2061907337154367865）：`r.jina.ai` 成功抓取，返回约 2500 字符完整文本（推文本身 + thread 展开内容）
- 直接抓取失败时，Jina reader 是最稳定的备选方案，优先于其他第三方镜像