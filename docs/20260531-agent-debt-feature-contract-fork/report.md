# Agent Debt：把特性契约和模型补丁分开，别用今天的 prompt 绑死明天的模型

## 结论

这篇文章的核心不是“把 prompt 写得更长”，而是把 **产品功能的契约** 和 **模型版本的补丁** 分开。

一句话：
- **稳定层**：feature contract，描述用户要完成什么、成功标准是什么、边界是什么
- **适配层**：model-specific fork，只在新模型需要时加入最小脚手架

## 原文主张

作者把 Agent Debt 定义为：
- 团队为了让 AI 功能在当前模型上表现更好，写了大量长、复杂、绕模型弱点的 prompt
- 这些补丁提高了今天的表现，但也让明天的模型更新更难
- 结果就是：要么延迟升级模型，要么升级后漏掉回归和新能力

## 关键判断

文章有三句最重要的话：
1. **Personal workflows can mostly adapt on the fly**
2. **User-facing features need evals, testing, and a higher degree of confidence**
3. **Prompts are technical debt too**

这三句合在一起，就是作者的底层判断：

> 对个人来说，模型变了可以跟着改；对产品来说，不能靠临场适配，必须用评测和测试把回归控制住。

## 解决方案

作者给出的方案不是“删掉所有脚手架”，而是：

### 1）先写 feature contract
把功能写成模型无关的承诺：
- 用户想完成什么
- 成功长什么样
- 哪些上下文和证据重要
- 哪些边界不能越

### 2）再写 model-specific fork
如果新模型还不达标，就基于：
- 当前 prompt
- eval failures
- production issues
- vendor guide

做一个**最小 fork**。

### 3）用评测决定是否发布
工作流是：
- 先拿新模型跑 contract
- 通过就直接 ship contract
- 不通过就生成最小 fork
- 再跑 evals
- 通过后再 ship

## 这套方法为什么重要

因为它把“今天的 prompt”从产品承诺里剥离出来了。

如果把补丁和功能混在一起：
- 新模型来了，旧补丁可能反而变成负担
- 你会舍不得删 prompt
- 你会在回归和维护之间反复拉扯

如果把 contract 和 fork 分开：
- contract 可以长期稳定
- fork 可以随模型变化反复重写
- 评测成为唯一的发布门槛

## 文章里的插图在讲什么

本次信息卡保留了作者站上的 4 张插图，分别对应：
- **缩减脚手架**：少写绕路，写意图
- **典型 prompt 的脚手架过载**：规则太多时，prompt 变成技术债
- **prompt 可移植目录结构**：contract 与模型适配层分离
- **评测闭环流程图**：contract → test → eval → fork → re-eval → ship

## 适用场景

这篇文章尤其适合：
- AI 产品经理
- Agent / Prompt 工程
- 需要频繁跟随模型更新的产品团队
- 想把 prompt 从“个人技巧”升级成“可维护工程资产”的团队

## 边界

这不是说所有 scaffolding 都没用。

作者的意思是：
- **不要把 scaffolding 写进产品契约里**
- **不要把模型补丁误当成长期业务逻辑**
- **不要用今天的模型限制锁死明天的迭代**

## 来源

- X 帖：<https://x.com/pejmanjohn/status/2061091767030825003>
- 原文：<https://pejmanjohn.com/agent-debt-don-t-trap-tomorrow-s-model-in-today-s-prompt>
- 文章发布时间：2026-05-26
- X 帖发布时间：2026-05-31 14:25:45Z（北京时间 2026-05-31 22:25:45）
