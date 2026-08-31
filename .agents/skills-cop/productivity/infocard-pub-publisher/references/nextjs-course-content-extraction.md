# Next.js 课程/内容站点完整正文提取

## 问题

Next.js App Router + RSC 的站点（如 JumpX AI、Vercel 部署的课程平台），用普通 curl 只能拿到 HTML shell，内容在客户端 JS 里渲染。传统爬虫策略失效。

## 解决方案

**优先走 API 端点**，Next.js App Router 通常暴露数据端点。

### 规律 1：课程内容在 `/api/mini-courses/[slug]` 等 API 路由

```
# 典型 Next.js 课程站点结构
https://jumpxai.vercel.app/zh-CN/mini-courses/loop-engineering
    ↓
https://jumpxai.vercel.app/api/mini-courses/loop-engineering   ← 返回完整 HTML 正文
```

步骤：
1. 先探查主 URL 的 HTML，搜索 `api/` 路径（出现在 JS bundle 或 RSC payload 里）
2. 尝试 `/{path}/api/{slug}`、`/api/{path}/{slug}` 等常见模式
3. 直接 curl 该 API 地址，`-H "User-Agent: Mozilla/5.0"` 避免被拦截

### 规律 2：RSC payload 里有路由信息

RSC 格式的 HTML 里会出现类似：
```json
{"b":"SQm3cYIHHMDlUjKCe5OtR","f":[["children",["lang","zh-CN","d"],[["lang","zh-CN","d"],{"children":["(root)",{"children":["mini-courses",{"children":[["slug","loop-engineering"...```

搜索 `api/` 字符串可以找到 API 端点。

### 规律 3：浏览器导航（备选方案）

如果 API 端点找不到，用 `browser_navigate` 访问主 URL，然后 `browser_snapshot(full=true)` 读正文。CDP 模式可等待 JS 执行完毕。缺点是慢，不适合批量抓取。

### 规律 4：页面 metadata 有 title/desc/manifest

RSC HTML 里的 `6:["$","$L13",null,{"lang":"zh-CN","slug":"loop-engineering","manifest":{"contractVersion":...}}` 块通常包含课程 metadata（slug、title、duration、level 等），可以直接解析 JSON 拿到结构化信息。

## 代码模板

```bash
# 探查 API 端点（示例：JumpX Loop Engineering 课程）
curl -sL "https://jumpxai.vercel.app/api/mini-courses/loop-engineering" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  > /tmp/course.html

# 检查是否拿到了完整正文（通常 >50KB）
wc -c /tmp/course.html

# 提取正文文本
python3 -c "
import re
with open('/tmp/course.html') as f:
    content = f.read()
text = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
text = re.sub(r'<[^>]+>', ' ', text)
text = re.sub(r'\s+', ' ', text).strip()
print(text[:30000])
"
```

## YAML 多行字符串 quoting 修复

提取的 HTML 内容写回 YAML meta 文件时，如果内容含换行符，会报 YAML 解析错误：
```
YAMLError: found unexpected end of stream
```

修复：YAML 中的多行描述统一用单行 JSON-safe 字符串，不含裸换行符。desc/note 字段中禁止出现未转义的换行符。

## 已知站点

| 站点 | 内容路由 | API 路由 |
|---|---|---|
| jumpxai.vercel.app | `/zh-CN/mini-courses/[slug]` | `/api/mini-courses/[slug]` |
