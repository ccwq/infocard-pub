# 抓取 X 长文（article / Note）的正确路径

## 背景

X 平台的"长文 article"（旧称 Note）和普通推文不同：

- 推文本体只是一个 `t.co/...` 短链
- 真正的正文是一篇绑定 article id 的内容，结构化存在 `tweet.article.content.blocks[]`
- 网页直接打开 `x.com/i/article/<article_id>` 会被登录墙拦下

只用 `vxtwitter`、`r.jina.ai` 抓 tweet URL，会拿到 `text=""` 或 `text=<短链>`，外加一个 `article.preview_text` 截断版前几句——**不要**把 preview 当全文写进信息卡。

## 正确流程

### 1. 第一步：用 fxtwitter 拿 tweet + article 全文

```bash
curl -s 'https://api.fxtwitter.com/<screen_name>/status/<tweet_id>' | jq .
```

- 路径里**必须带 `<screen_name>`**，否则部分 article 不会展开 `content.blocks`。
- 返回的 `tweet.article.content.blocks[]` 就是真正全文，每个 block 有 `text` 与 `type`（`unstyled` / `header-one` / `atomic` …）。
- `tweet.article.cover_media.media_info.original_img_url` 是封面图直链，按本地化插图规则下载到 `docs/assets/images/<slug>/hero.jpg`。

提取脚本范例（在 execute_code / 终端里跑）：

```python
import requests
r = requests.get(
    f'https://api.fxtwitter.com/{screen_name}/status/{tweet_id}',
    headers={'User-Agent': 'Mozilla/5.0'},
    timeout=20,
).json()
art = r['tweet']['article']
print(art['title'])
for b in art['content']['blocks']:
    print(f"[{b['type']}] {b['text']}")
print('COVER:', art['cover_media']['media_info']['original_img_url'])
```

### 2. 备用：vxtwitter 只用来确认 article id / 元数据

`api.vxtwitter.com/status/<id>` 即使 `text` 为空，也能给出：

- `article.title`
- `article.preview_text`（仅前几句，**不能当全文**）
- `article.image`（封面）

发现 `text` 为短链或空、`article` 字段非空时——**立刻切到 fxtwitter** 拿 blocks，不要继续浪费时间在 vxtwitter / nitter / `r.jina.ai`。

### 3. 反模式

- ❌ 把 `preview_text` 当成正文写卡 → 内容会被截断，且和原文意思偏差大
- ❌ 用浏览器打开 `x.com/i/article/<id>` 期待正文 → 登录墙
- ❌ 仅用 `r.jina.ai/https://x.com/...` → 通常只拿到登录页骨架
- ❌ 看到 vxtwitter 给了 article preview 就开写 → preview 截断在 ~200 字，会漏掉文章后半部分的论点

## 验收

写卡前自检：

- 是否拿到了至少 5–10 个 `content.blocks`？少于这个量级很可能不是全文。
- 是否包含 `header-one` 类型的小标题？一般长文都会分小节。
- 封面图是否下载到本地 `docs/assets/images/<slug>/`？远程热链在公网会失效。

## 案例

- `https://x.com/gabrielchua/status/2067262326043287852` → tweet.text 仅是 `https://t.co/...`；fxtwitter 路径 `/gabrielchua/status/...` 给出完整 30+ blocks 的《The Inner and Outer Loops of Codex Automations》正文。
