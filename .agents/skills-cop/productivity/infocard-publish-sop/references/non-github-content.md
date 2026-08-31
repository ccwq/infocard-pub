# 非 GitHub 内容处理参考

## 本会话实际案例

### 案例 1：Lilian Weng 博客文章
- **URL**：`https://pandatalk8.com/blog/harness-engineering-self-improvement/document`
- **原文**：`https://lilianweng.github.io/posts/2025-06-23-harness-self-improvement/`
- **性质**：博客全译（pandatalk8.com）+ 原文（Lilian Weng / OpenAI）
- **处理方式**：source_url 填 pandatalk8.com（中文全译版），在信息卡中同时标注 Lilian Weng 原站链接
- **Stars 数**：不适用，不写入
- **图片**：从 pandatalk8.com 页面提取 17 张图片，下载到 `assets/img/pandatalk-self-improvement/`

### 文章内容抓取方法

```python
import re
raw = open('page.html','rb').read().decode('utf-8','ignore')
# Remove scripts/styles
raw = re.sub(r'<script[^>]*>.*?</script>','',raw,flags=re.DOTALL|re.I)
raw = re.sub(r'<style[^>]*>.*?</style>','',raw,flags=re.DOTALL|re.I)
# Extract headings
for tag in ['h1','h2','h3','h4']:
    hs = re.findall(f'<{tag}[^>]*>(.*?)</{tag}>', raw, re.DOTALL)
    for h in hs:
        t = re.sub(r'<[^>]+>','',h).strip()
        if t: print(f'{tag.upper()}: {t[:120]}')
# Extract paragraphs
paras = re.findall(r'<p[^>]*>(.*?)</p>', raw2, re.DOTALL)
# Extract all image URLs
imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|gif|webp|svg)[^\s"\'<>]*', raw)
```

### 标签 / 分类处理

| 字段 | GitHub repo | 博客/论文文章 |
|------|------------|--------------|
| category | 从项目类型判断 | 从内容主题判断（AI工具/生产力工具/开发工具等）|
| style | 从工具类型判断 | 从内容形式判断（技术手册→hardblue，架构方法论→darkblue）|
| tags | 项目 topics + 功能标签 | 文章主题标签 + 作者标签 |

### OG Image 抓取

```python
og = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', raw)
if not og:
    og = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', raw)
print('OG:', og.group(1) if og else 'none')
```
