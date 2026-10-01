---
name: infocard-codex-notebook-style
description: Codex 笔记本 / 手账拼贴风信息卡主题。适合教程、方法论、入门到进阶的技术叙事内容，用便签、贴纸、活页分隔与手写批注制造亲和力。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, notebook, scrapbook, tutorial]
    related_skills: [any2card, infocard-style-man-skill]
---

# infocard-codex-notebook-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

`infocard-codex-notebook-style` 是「Codex 笔记本 / 手账拼贴」风信息卡主题：米黄纸底、活页卡片、彩色便签（note yellow/green/blue/pink）、贴纸标签（sticker）、大头针（pin）与涂鸦点缀。适合教程、路线图、方法论叙事。

## Design DNA

- 纸感底色 + 卡片活页拼贴，卡片带轻旋转与硬阴影
- 便签四色语义：黄=核心观点 / 绿=可执行 / 蓝=事实背景 / 粉=人群提醒
- hero 区 banner 色带 + 大标题红色强调 span
- preview 模拟「内页预览」，mini 网格承载命令与前提
- footer 强结论 + tag 出处；doodles 字符点缀（✦ ☁︎ ✎）

## Color / Layout tokens

见 `theme/codex-notebook.html`（:root 变量与全部组件类）。布局骨架：hero card → section-grid（spiral aside + preview）→ benefits card → footer card。

## Use When

- 教程/上手路线/方法论叙事
- 需要亲和力、收藏感的内容
- 信息层级清晰且可分块讲述

## Avoid

- 严肃合规、财务、法律内容
- 纯数据密集报表
