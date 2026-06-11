# Agentic Engineering Patterns · 发布报告

## 来源
- 标题：Agentic Engineering Patterns
- 作者：Simon Willison
- 来源：https://simonwillison.net/guides/agentic-engineering-patterns/

## 结论
这篇 guide 的核心不是“AI 会写代码”，而是**把 coding agents 嵌入工程循环**：先定义原则，再把 LLM、system prompt、tools、Git、TDD、浏览器自动化与 subagents 组合成可重复、可审查的 workflow。

## 选题理由
- 技术属性强，适合 hardblue 风格
- 主题本身是“工程实践 / 工作流 / 调试 / 测试”，适合高密度多章节排版
- 原文的结构足够明确，可直接拆成 principles / mechanics / git / QA / appendix 五层

## 卡片结构映射
1. Principles：代码更便宜，但好代码仍有成本；知识要 hoard 并 recombine
2. Working with agents：LLM + system prompt + tools in a loop
3. Git + subagents：用版本控制和并行子代理兜底
4. Testing & QA：TDD、browser automation、manual testing、理解代码
5. Appendix：prompts、artifacts、proofreader、alt text 等延伸工作流

## 关键信号
- 原文明确强调："Writing code is cheap now. Good code still has a cost."
- 文章不是在讲“随便让模型写”，而是在讲“compound engineering loop”
- 浏览器自动化、Showboat、Present、subagents 都是把 agent 工作流工程化的手段

## 发布说明
- HTML + meta 已同步到 `docs/`
- 已设置 `style: hardblue`
- 将由 `npm run build` 生成 `_index.yaml` 与 `index.html`
