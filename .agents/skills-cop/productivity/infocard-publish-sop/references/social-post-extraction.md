# Social Post Extraction Reference

## X/Twitter (原 Twitter)

### vxtwitter API（无需登录）

```bash
# 纯文本推文数据（JSON）
TID=2080624069742043176
curl -sL "https://api.vxtwitter.com/status/$TID" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d['user_name'], '/', d['date'])
print(d['text'])
print('likes:', d['likes'], 'retweets:', d['retweets'])
print('media:', d['mediaURLs'])
"
```

返回字段：`user_name`/`user_handle`、`date`、`text`、`likes`、`retweets`、`mediaURLs[]`、`qrt`（引用转推对象）。

**注意**：vxtwitter 返回 `user_handle: null` 时用 `user_name`。

### 不依赖登录的提取链路

1. `api.vxtwitter.com/status/{id}` → 获取正文 + 互动数据 + 图片 URL
2. 用图片 URL 单独下载
3. 浏览器/CDP 备用（用于图片内容分析）

## 小红书

### 浏览器 CDP 提取

```javascript
// 获取笔记正文
document.querySelector('.note-content')?.textContent?.trim()
```

正文提取后立即截图，用于后续 vision 分析。

## 提取后处理

- 原帖链接中的**平台名称**（x.com、小红书域名）**不得出现在信息卡正文或描述中**
- 信息卡 `source` 字段填平台名，`source_url` 填原帖链接
- 活跃数据（点赞/转发）注明「发帖时数据」，不建议写死

## 平台命名规范

| 平台 | `source` 字段 | `source_url` |
|---|---|---|
| X/Twitter | `Twitter` | 原帖链接 |
| 小红书 | `小红书` | 原帖链接 |

**信息卡正文内容不得出现 x.com 或 xiaohongshu.com 等域名标识**。
