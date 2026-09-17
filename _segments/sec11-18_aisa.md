## SEC 11 — 图片与视频生成（media-gen）

AIsa media-gen 支持 4 个图片模型 + 4 个视频模型，一个 API key 全部可用：

图片生成（4 个模型）：
- Google Gemini 3 Pro Image
- Alibaba Wan 2.7 image
- Alibaba Wan 2.7 image-pro
- ByteDance Seedream

视频生成（4 个变体）：
- wan2.6 t2v（文生视频）
- wan2.6 i2v（图生视频）
- wan2.7 t2v（文生视频）
- wan2.7 i2v（图生视频）

一个 API key，客户端自动路由到最优模型。

---

## SEC 12 — LLM Router：70+ 模型统一网关

llm-router skill：用一个 API key 路由到 70+ AI 模型。

支持的模型家族：
- OpenAI：GPT-4 系列
- Anthropic：Claude 系列
- Google：Gemini 系列
- DeepSeek：DeepSeek 系列
- Qwen：通义千问系列
- Grok：Grok 系列

使用场景：
- 按请求选择最优模型（成本/速度/推理能力）
- 同一应用内多模型对比
- 中国特有：cn-llm skill 专门路由中文 LLM（Qwen / DeepSeek / GLM / Baichuan）

---

## SEC 13 — OpenAI-compatible 的实际含义

AIsa 的 OpenAI-compatible 不是「类似」，而是「完全兼容」：

```
# 不需要改任何代码
# 只需要换 base_url
import openai

client = openai.OpenAI(
    api_key="YOUR_AISA_API_KEY",
    base_url="https://api.aisa.one/v1"  # 换这里
)

# 现有 SDK 代码继续工作
response = client.chat.completions.create(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "Hello"}]
)
```

优势：
- 无需修改应用逻辑
- 现有 OpenAI SDK 插件直接可用
- 模型按调用量计费，无月费

---

## SEC 14 — 与 OpenRouter / APIFY 的核心区别

| 维度 | OpenRouter | APIFY | AIsa |
|------|-----------|-------|------|
| 覆盖 | 模型为主 | 爬虫/API 聚合 | 模型 + 数据 API 全覆盖 |
| 自主支付 | 无 | 无 | x402 协议 |
| Agent Skills | 无 | 无 | 42 可安装技能包 |
| 5000+ 接口 | 否 | 是（爬虫） | 是（结构化 API） |
| 中国 LLM | 有限 | 否 | cn-llm 专门支持 |

---

## SEC 15 — SEO 与营销技能

SEO 技能：
- seo-keyword-research：爬取网站 → DataForSEO 验证关键词 → 聚类分析 → SERP 策略

KOL/创作者发现：
- kol-creator-discovery：输入 YouTube/TikTok/Instagram 账号 → 输出联系邮件 + 相似创作者列表

---

## SEC 16 — 定价模式

核心定价逻辑：
- 按调用量计费（per-call pricing）
- 每个端点在调用前显示精确价格
- 无供应商合同，无月费
- 支持用法币或 USDC 充值

无供应商锁定：
- 一个 key 覆盖平台上所有资源
- 不需要为每个供应商单独注册账号
- 不需要轮换多个凭证

---

## SEC 17 — 接入门槛

接入方式（按难度从低到高）：

方式 1：复制提示词（最简单）
控制台复制一段提示词 → 粘贴到 Claude Code / Codex → 发送即可使用

方式 2：换 base_url（SDK 集成）
OpenAI SDK base_url 指向 aisa.one → 现有代码零改动

方式 3：MCP（深度集成）
配置 Claude Desktop / Cursor 的 MCP server → Agent 原生调用

方式 4：A2A Agent Card（自主发现）
Agent 程序化发现 AIsa 能力并自主接入

---

## SEC 18 — 适用边界与竞品对照

适用场景：
- 需要多模型路由（Claude / GPT / Gemini / Qwen 随时切换）
- Agent 需要自主获取外部数据（社媒/金融/搜索）
- 需要自主支付能力（x402）
- VibeCoding 场景下的快速 API 接入

不适用场景：
- 只需要单一模型（直接用官方 API 更便宜）
- 大批量稳定生产（供应商直签可能有折扣）
- 需要复杂客服支持

竞品对照：
- vs OpenRouter：多了数据 API + Agent Skills + 自主支付
- vs APIFY：多了模型路由 + 自主支付 + 结构化 API
- vs 各平台直签：多了统一账单 + 跨供应商路由
