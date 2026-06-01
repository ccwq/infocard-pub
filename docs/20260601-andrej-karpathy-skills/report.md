# Karpathy 风格 Claude Code 指南 报告

## 核心判断
这是一个**行为约束文件**，不是模型能力扩展包。

## 关键事实
- 它用四个原则约束 Claude Code：Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution。
- 目标是减少错误假设、过度抽象、无关改动和无验收执行。
- 适合写入项目级 CLAUDE.md 或 Cursor rule，让规则随项目生效。

## 适合场景
- 代码修改前需要先澄清歧义
- 希望减少过度设计和“顺手重构”
- 需要测试/验收驱动的开发流程

## 结论
它的价值在于把“写得更聪明”改成“做得更可控”。