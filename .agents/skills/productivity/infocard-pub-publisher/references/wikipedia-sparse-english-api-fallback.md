# Wikipedia 中文页面内容稀疏时的英文 API 回退

## 触发条件

中文 Wikipedia 词条内容极少（< 1500 字符），英文 Wikipedia 同名词条内容丰富（> 10 KB），需要科普卡有足够深度。

## 回退方案：英文 Wikipedia API

```bash
# 用主 API 获取英文词条全文（plain-text）
curl -sL --max-time 30 \
  "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&titles=Voxel" \
  -o /tmp/voxel-api.json

# 提取正文
python3 -c "
import json
d = json.load(open('/tmp/voxel-api.json'))
pages = d['query']['pages']
ext = list(pages.values())[0].get('extract', '')
print(ext)
" > /tmp/voxel-en-full.txt
```

## 已确认案例

| 词条 | 中文维基 | 英文维基 API | 结果 |
|---|---|---|---|
| 体素 / Voxel | ~700 chars | ~15.5 KB | 英文 API 补全了全部渲染方法、应用、游戏列表、扩展概念 |

## 边界

- 英文 API 返回的纯文本不含 Wikipedia 内部链接、图片 URL、引用——这些需要额外从 HTML 提取
- 中文和英文内容合并时，**优先使用中文定义和词源**，英文补充技术细节
- 如果英文词条也不存在或很短，直接接受中文维基的内容量，不要强行拉长

## 相关

- `references/wikimedia-image-download-browser-first.md` — 图片下载（已升级为 SVG 自绘回退）
- `references/scientific-explainer-card-pattern.md` — 科普卡整体结构