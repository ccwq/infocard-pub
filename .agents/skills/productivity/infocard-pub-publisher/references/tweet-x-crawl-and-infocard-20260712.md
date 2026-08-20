# X/Twitter 推文抓取与信息卡化

## 问题背景

用户发来 X/Twitter 推文 URL（如 `https://x.com/i/status/2076273690824806756`），需要将推文内容信息卡化。

## 推文抓取工具链（按优先级）

### 1. `fxtwitter.com`（首选）

X 推文完整内容最可靠的镜像。
```
https://fxtwitter.com/<handle>/status/<tweet_id>
https://fxtwitter.com/i/status/<tweet_id>
```

抓取方法：从 `fxtwitter.com` HTML 中提取 `articleBody` JSON-LD 字段：
```python
import re
html = sys.stdin.read()
m = re.search(r'"articleBody":"(.*?)","author"', html, re.DOTALL)
if m:
    text = m.group(1).replace('\\n', '\n').replace('\\"', '"')
```

**成功率：约 70%。** 当推文被 fxtwitter 完整缓存时，`articleBody` 包含全部推文文本（含多图 alt 文本）。

### 2. OG:description（次选）

当 fxtwitter 无完整 articleBody 时，`<meta property="og:description">` 通常包含推文摘要（约 180 字符）。
```bash
curl -sL "https://x.com/i/status/<ID>" -H "User-Agent: Mozilla/5.0" | \
  grep -oP 'property="og:description"[^>]+content="\K[^"]+'
```

### 3. og:image + vision（降级方案）

当文本完全无法抓取时：
1. 从 og:image 提取配图 URL
2. 用 vision 模型提取图片内文字（`@vision_analyze`）
3. 结合推文元数据（作者、时间戳）重建上下文

```bash
# 提取 og:image
curl -sL "https://x.com/i/status/<ID>" | grep -oP 'property="og:image"[^>]+content="\K[^"]+'
```

### 4. 其他镜像（备选）

- `nitter.net` — 已基本失效（维护不稳定）
- `fxtwitter.com` → 失效时尝试 `vxtwitter.com`
- Google Cache — 可能返回原始 HTML 但含 JS 限制
- `syndication.twitter.com` — 需要认证，公开访问受限

## 推文图片识别模式

推文正文后附图（如多图推文）可能包含额外文字（如项目名、星标数、描述）。推文图片应整体输入 vision 分析，提取图中所有文字。

常见模式：
- **GitHub Trending 合集推文**：配图可能是某项目 README 截图，内含项目名 + 描述 + Stars
- **线程推文**：每条附图可能是数据截图、代码片段
- **引用转发**：引用的原推文可能在图片中

**策略**：先尝试抓文本，文本不足时降级到图片 vision 分析。不要只在文本失败后才想到图片。

## 推文信息卡内容结构

推文信息卡通常包含：
1. **推文嵌入卡片**：作者头像 + 名字 + handle + 日期 + 原文
2. **概览 Hero**：核心信息 + 统计数据
3. **原文全文**：推文完整文本
4. **关联内容**：推文中提到的项目、链接、话题
5. **背景说明**：补充上下文（推文发出时的背景、趋势）

## 部分信息处理原则

推文文本被平台截断（如"…"）时：
- **标注**："（剩余 N 个项目待补充）"
- **搜索**：用已知片段搜索其他来源补全
- **GitHub API**：推文提到的项目名可直接从 API 拉取实时数据
- **直接问用户**：尝试 1-2 次后，直接问用户补全信息，不要无限重试

## GitHub Stars 实时查询

推文提到 GitHub 项目时，用 API 拉实时数据：
```bash
curl -s "https://api.github.com/repos/<owner>/<repo>" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('stars:', d['stargazers_count'])
print('forks:', d['forks_count'])
print('desc:', d.get('description'))
"
```

API 失败时（rate limit / private org）：
- 从推文配图 vision 分析中提取星标数
- 标注"数据来自推文配图，待实时验证"

## GitHub 仓库 URL 修复

用户提供的 GitHub URL 可能不完整（如 `github.com/pewdiepie-arch/odysseus…`）：
1. 先确认 HTTP 状态码（404 = 不存在）
2. 尝试常见变体：`pewdiepie-arch` → `pewdiepie-archdaemon`
3. 用 GitHub Search API 搜索项目名
4. 搜索失败后直接问用户完整 URL（不超过 1 次）

## X 推文信息卡主题选择

- **darkblue**：技术趋势、项目合集、技术社区热点
- **redswiss**：工具推荐、参考指南类内容
- **darkgreen**：数据监控、状态总览类

## 本次经验

- fxtwitter `articleBody` 完整抓取率约 70%，主要失败于长推文（>280 字符）
- 推文 og:image vision 分析是强力的降级方案，不应跳过
- GitHub org 为 `pewdiepie-archdaemon`（非 `pewdiepie-arch`），用户 URL 截断导致误判
- 用户默认直出流程（不询问直接生成）体验良好，符合用户偏好
