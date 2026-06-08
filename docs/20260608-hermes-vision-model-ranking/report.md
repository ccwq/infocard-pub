# Hermes 识图模型排名报告

## 结论

如果你只想给 Hermes 的识图能力配**一个默认模型**，我的结论是：

**首选：`openrouter / google/gemini-3-flash-preview`**；如果拿不到 preview，就退回到 `google/gemini-2.5-flash`。

原因很直接：Hermes 官方文档已经把 vision 当作独立的 auxiliary 任务来配置，并明确写了“Gemini Flash on OpenRouter for vision and web extraction”；社区教程里也直接把 Hermes 的视觉分析实现指向 `Gemini 3 Flash Preview`。这意味着它不是“凭感觉流行”，而是官方可配、社区在用、成本也相对友好的默认解。

如果你更看重**极难图片、复杂截图、OCR/图表细节**，第二选择是 **`openai/gpt-4o`**。

---

## A. 排名前 5

### 1）`google/gemini-3-flash-preview` / `google/gemini-2.5-flash`
- **适合**：日常截图、网页截图、图文混排、网页抓取辅助、批量轻量识图。
- **为什么排第一**：官方文档直接把 Gemini Flash 作为 vision 的推荐示例；社区教程明确写 Hermes 的视觉分析用 `Gemini 3 Flash Preview` 走 OpenRouter。
- **证据**：
  - 官方 docs：`auxiliary.vision` 示例写了 `openrouter` + `google/gemini-2.5-flash`，并明确说“Gemini Flash on OpenRouter for vision and web extraction”。
  - 社区教程：`Hermes Agent 的视觉分析` 文章写到 vision_tools 使用 `Gemini 3 Flash Preview` 通过 OpenRouter API 提供图像理解能力。

### 2）`openai/gpt-4o`
- **适合**：高精度识图、复杂布局、图表、难 OCR、边缘案例兜底。
- **为什么排第二**：Hermes 官方文档把它写成“替代 Gemini Flash 的 vision 模型”，属于官方明确支持且容易理解的高精度兜底方案。
- **证据**：
  - 官方 docs：`Using OpenAI API key for vision` 里直接给出 `model: "gpt-4o"`，并写明“To use GPT-4o instead of Gemini Flash for image analysis”。
  - 社区讨论：大量 GPT-4o 相关文章集中在“原生多模态 / 视觉微调 / 图像理解能力”上，说明它在开发者社区里是视觉任务的稳定基线。

### 3）`qwen2.5-vl`
- **适合**：本地部署、中文文档、表格、截图 OCR、布局理解、离线场景。
- **为什么排第三**：它是最像“工程可控型识图后备”的开源选项，强项不是纯品牌热度，而是结构化理解和自部署弹性。
- **证据**：
  - 官方 docs：Hermes 配置页给了 `auxiliary.vision` 的自定义 endpoint 示例，明确可以直接指向本地/自建模型。
  - 社区材料：多篇 Qwen2.5-VL 评测/技术解读都强调它对文本、图表、图标、布局、结构化输出、长视频理解的能力，尤其适合文档与表格类识图。

### 4）`codex` / `gpt-5.3-codex`
- **适合**：你已经在用 ChatGPT Pro/Plus，想要“一个账号搞定 vision + 代理 + 工具链”。
- **为什么排第四**：它有很强的工程协作属性，且 Hermes 官方明确说 Codex 支持 vision；但它更像 agentic coding 侧的顺手方案，而不是纯识图最佳解。
- **证据**：
  - 官方 docs：`codex` provider 说明写明 “Supports vision (gpt-5.3-codex)”。
  - 社区文章：GPT-5.3-Codex 的讨论集中在“代理式编程 / 长流程协作 / 工程执行”，说明它更偏代码与工作流，不是专门为图像理解做的第一顺位。

### 5）`minimax-oauth` / `MiniMax-M2.7-highspeed`
- **适合**：你想少折腾账号、偏大陆网络、希望 OAuth 即用。
- **为什么排第五**：官方支持没问题，但社区讨论更多集中在它的 agent/coding 能力，纯识图口碑不如前四个明确；适合“顺手能用”，不适合当 Hermes 识图主力。
- **证据**：
  - 官方 docs：`minimax-oauth` 会把 auxiliary tasks 路由到 `MiniMax-M2.7-highspeed`。
  - 社区文章：Hermes + MiniMax 的教程很多，但重点多在模型接入、编码和 Agent 工作流，直接围绕识图质量的证据相对少。

---

## B. 一句话建议

### 我会怎么配

```yaml
auxiliary:
  vision:
    provider: "openrouter"
    model: "google/gemini-3-flash-preview"
```

### 什么时候改成 GPT-4o

```yaml
auxiliary:
  vision:
    provider: "main"
    model: "gpt-4o"
```

- 如果你在做**高难 OCR、图表、版面复杂截图**，优先切 GPT-4o。
- 如果你在做**常规截图、网页理解、批量轻量识图**，Gemini Flash 更均衡。
- 如果你在做**本地/离线/自建**，再考虑 Qwen2.5-VL。

---

## C. 我核到的关键边界

1. Hermes 的 `vision` 默认不是一个单独“固定最优模型”，而是 auxiliary 任务；**默认 `auto` 会先走你的主模型**，所以如果主模型很贵，识图会跟着一起贵。
2. 官方文档明确给了三条实用路径：
   - `openrouter` 路线：可直接塞任意模型（Gemini / GPT-4o / Claude 等）
   - `main` 路线：直接用你当前主模型
   - `codex` 路线：ChatGPT 账号即可，vision 可自动工作
3. 所谓“最适合 Hermes 的识图模型”，更像是**成本 / 延迟 / OCR 能力 / 接入便利**的平衡题，而不是单纯榜单题。

---

## D. 结论

**默认推荐：Gemini Flash 系列，优先 `google/gemini-3-flash-preview`。**

如果你要我把它压成一句配置建议：
> Hermes 识图别挂在 `auto/main` 上；默认用 `OpenRouter + Gemini Flash`，遇到高难 OCR 再切 `GPT-4o`。

---

## 参考来源

- Hermes 官方配置文档：<https://hermes-agent.nousresearch.com/docs/user-guide/configuration>
- Hermes 官方文档首页：<https://hermes-agent.nousresearch.com/docs>
- 社区教程：`Hermes Agent 的视觉分析:强大的AI图像理解工具详解`
- 社区教程：`Qwen2.5-VL:更强大的多模态大模型附实测结果`
- 社区教程：`Hermes Agent 配置和使用完全指南`
- 社区教程：`GPT-5.3-Codex深度测评`
