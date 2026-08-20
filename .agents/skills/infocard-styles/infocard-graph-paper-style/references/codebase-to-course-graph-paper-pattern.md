# codebase-to-course graph-paper pattern

适用对象：把“代码知识重表达 / 代码解释 / 课程化 / 图谱化 / walkthrough”类仓库做成 graph-paper 风格信息卡时使用。

## 这类仓库的主叙事

不要把它写成普通 GitHub 仓库介绍，也不要先讲 stars / 安装命令。

优先主线：
1. **输入是什么**（repo / codebase / skill / source）
2. **中间如何被翻译**（analysis / modules / briefs / references / assets / scoring / diagrams）
3. **输出给谁看**（agent / 非技术读者 / vibe coders / 审计读者）
4. **为什么这种重表达有价值**（理解、debug、准入、沟通、教学）

这类卡不是“工具清单”，而是“知识转译流水线”。

## graph-paper 主视觉建议

首屏图谱优先画 **转换链路图**，不要只放 logo 或大数字：
- repo → analysis → modules → course
- skill → static read → evidence → report
- code → graph/index → query/teaching surface

要求：
- 首屏图谱承担“全景索引”角色
- 正文章节再拆每个节点职责
- 不要在首屏和正文重复同一张图

## 推荐章节顺序

1. 一句话定位
2. 转换链路 / 主流程图
3. 输入对象与输出对象
4. 中间资产（references / scripts / templates / briefs / schemas 等）
5. 适用边界 / 不适用边界
6. 为什么值得做成这类系统（而不是单篇 README / prompt / 静态文档）
7. 与相邻工具的区别（如 codegraph vs codebase-to-course）

## 文案取舍

- stars / forks 只作为次级信号，不要盖过主流程
- 如果仓库真正稀缺的是 workflow / pedagogy / audit contract，就优先解释这个稀缺点
- 中文优先，但保留必要术语：repo、module briefs、glossary tooltip、code ↔ English 等

## 常见误区

1. **把它讲成营销页**
   错。graph-paper 更像研究手册，应先讲结构和链路。

2. **只有 features，没有 conversion pipeline**
   错。对于“重表达”类仓库，feature 只是结果，pipeline 才是核心。

3. **只放大数字，不放图谱**
   错。graph-paper 的主锚点应该是节点和连线，不是 hero metric。

4. **把输入/中间层/输出混成一段文案**
   错。要把三层拆开，不然读者不知道系统到底在翻译什么。

## 适配示例

- codebase-to-course：repo → analysis → modules → course
- Yao Interpreter Skill：skill → static read → evidence / score → report
- codegraph：codebase → graph index → query / teaching / navigation
