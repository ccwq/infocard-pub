# last30days-skill 发布报告

## 来源
- 标题：last30days-skill
- 仓库：https://github.com/mvanhorn/last30days-skill
- 主题：近 30 天社媒/社区/预测市场信号研究

## 结论
last30days-skill 的价值不在“搜得更多”，而在**把多个平台的近 30 天人群信号并行拉齐，再交给 agent 合成一份 grounded summary**。它把 Reddit、X、YouTube、Hacker News、Polymarket 和 Web 变成一条研究流水线，适合会前准备、工具对比、热点追踪和实体背景摸底。

## 选题理由
- 这是典型的 AI skill / research tool，适合 handline 的工作流草图气质
- 内容核心是“多源信号 → 评分 → 合流 → brief”，有天然的流程图结构
- README 里同时有平台清单、使用场景、v3 新能力，信息密度足够做成高密度卡片

## 卡片结构映射
1. Hero：一句话讲清它不是搜索引擎，而是人群信号研究引擎
2. 对比框：传统搜索 vs last30days
3. 流程条：平台并行 → 人群评分 → cluster merging → HTML brief
4. 章节一：为什么值得用
5. 章节二：v3 新东西
6. 章节三：适合谁 / 不适合谁
7. 代码示例：常见命令入口

## 关键信号
- 40K 级 stars，说明项目已经有很强的社区关注
- README 明确强调“Google aggregates editors. /last30days searches people.”
- v3 的重点是 shareable HTML briefs、intelligent search、best takes、cross-source cluster merging
- 目标不是单一检索，而是跨平台合成可转述的研究 brief

## 发布说明
- 已生成 HTML + meta
- 已按 handline 风格组织结构，底部按钮居右
- 接下来需要运行 build / verify，再做 Pages 与首页命中验证
