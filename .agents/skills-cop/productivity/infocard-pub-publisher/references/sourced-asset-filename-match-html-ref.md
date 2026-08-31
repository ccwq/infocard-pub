# sourced-asset-filename-match-html-ref

## Session: ponytail publish (2026-06-14)

## 问题

发布 ponytail 卡时，GitHub 上的 benchmark SVG 文件名是 `assets/benchmark-3model.svg`。下载到本地后命名为 `ponytail-benchmark.svg`，但 HTML 中 `<img src="./assets/images/ponytail/benchmark-3model.svg">` 引用的是原文件名：

```
HTTP/2 404 — benchmark-3model.svg 不存在于仓库路径
HTTP/2 200 — ponytail-benchmark.svg 存在
```

## 根因

下载外部资源时文件名可能与 HTML 引用路径不一致。两处路径必须对齐。

## 正确做法

**方案 A：保持文件名一致**（推荐）
- 下载时就用与 HTML 引用相同的文件名
- 避免本地重命名，直接 `cp benchmark-3model.svg docs/assets/images/{slug}/`

**方案 B：改 HTML 引用路径**
- 本地重命名后，`patch` HTML 中 `src` 为实际本地文件名
- 同一 commit 包含 HTML 改动 + 资产文件

## 验证步骤

发布后对每张含图片的卡必须验证：
```bash
# 1. HTML HTTP 200
curl -sI https://ccwq.github.io/infocard-pub/docs/{slug}.html | head -1

# 2. 页面内容含关键词
curl -s https://ccwq.github.io/infocard-pub/docs/{slug}.html | grep -c 'keyword'

# 3. 资产图片 HTTP 200（关键！不能跳过）
curl -sI https://ccwq.github.io/infocard-pub/docs/assets/images/{slug}/{filename} | head -1
```

## 预防规则

在 `write_file` 写 HTML 时，`<img src>` 路径必须与实际本地文件路径完全一致。如果不确定文件名，先 `curl -sI` 验证源文件 URL，再用相同文件名保存本地。