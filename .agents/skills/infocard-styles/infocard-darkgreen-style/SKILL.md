---
name: infocard-darkgreen-style
description: 深绿色监控工作台信息卡风格。适用于终端状态总览、绿色安全感、本地运行、健康度监测、系统仪表盘与轻量效率类主题；主视觉是深绿/墨绿/薄荷绿渐变、终端感面板、状态条与监控仪表。
version: 1.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, darkgreen, monitor, terminal, status, dashboard, style]
    related_skills: [infocard-style-man-skill, infocard-pub-publisher, infocard-mobile-verifier]
---

# infocard-darkgreen-style · 深绿色监控工作台风格

## Overview

`infocard-darkgreen-style` 是面向**终端状态总览、监控面板、运行健康度、轻量工具发布**的深绿色信息卡风格。

它的目标不是“炫酷”，而是把复杂状态做成一个有秩序、可信赖、可快速扫读的绿色工作台：
- 深色背景 + 绿色主强调
- 高对比但不刺眼
- 监控面板、状态条、标签、终端提示一体化
- 传达“稳定、在线、可观察、本地运行、安全”

## Use Cases

适合：
- AI agent / CLI / TUI / 监控工具
- 系统状态总览、健康面板、运维工具
- 本地运行、隐私、安全、只读模式类工具
- 终端风、仪表盘风、状态监控风的信息卡

不适合：
- 文艺散文、人物故事、情绪化海报
- 需要大量暖色或纸感质感的内容
- 轻便教程 / 白板草图类内容

触发词：
- 终端监控
- 仪表盘
- 绿色工作台
- 本地运行
- 只读安全
- 状态总览
- 监控面板

## Design DNA

- **气质**：克制、稳定、专业、可观察
- **视觉锚点**：绿色状态条、终端标题栏、分区面板、仪表数据
- **信息密度**：高，但要层级清楚
- **情绪强度**：中低，偏可靠而非张扬
- **关键词**：monitor / dashboard / terminal / local-first / read-only / live / ready

## Color Tokens

```css
:root{
  --bg:#07120d;
  --bg-2:#0b1711;
  --panel:#102018;
  --panel-2:#15261d;
  --ink:#eaf7ef;
  --muted:#9fbeab;
  --line:rgba(180,255,210,.12);
  --green:#33d17a;
  --mint:#78f2b0;
  --lime:#b7f171;
  --cyan:#57d7c0;
  --yellow:#f2d45c;
  --red:#ff7474;
}
```

说明：
- `--green` 是主强调色，用于状态正常、在线、已连接、通过
- `--mint` 用于高亮、进度条、轻量强调
- `--lime` 用于 secondary accent 或小面积提示
- `--cyan` 用于次要技术感强调
- `--red` 只用于警告和错误状态

## Typography

- **Hero title**：52–88px，粗黑，强对比
- **Subtitle / lead**：15–20px，说明工具价值
- **Section title**：12–14px，大写或半大写，终端感
- **Body**：12–14px
- **Caption / meta / pill**：10–12px
- **最小字号底线**：11.2px

移动端：
- 标题缩到 34–60px
- 关键数据保持 12px 以上
- 避免一屏塞入过多列

## Layout Skeleton

建议结构：

- hero / topbar
- status summary / live indicator
- main dashboard panels
- metric cards / progress bars
- legend / shortcuts
- footer / source / install commands

典型 HTML 结构：

```text
page
├─ hero
│  ├─ kicker / source
│  ├─ title / subtitle
│  └─ visual summary panel
├─ shell
│  ├─ session overview panel
│  ├─ monitor / rate-limit panel
│  └─ quick start / shortcuts panel
└─ footer note
```

## Component Rules

### Badge / pill / tag
- 使用深绿、青绿、薄荷绿系
- 只能作为状态或分类提示，不要喧宾夺主
- 外边框比填充更克制，避免霓虹化

### Stat card
- 用于数字、进度条、星标、实时值
- 进度条以绿色为主，黄/红仅作告警

### Panel
- 深色块面 + 轻边框 + 圆角
- 面板之间留出明显间距
- 不要让边框颜色过亮

### Warning / alert
- 黄 = attention
- 红 = tense/error
- 仅在必要时使用，不要把整卡做成警报页

### Code / command block
- 用终端风黑底块 + 绿色命令高亮
- 命令保持可复制、短而明确

## Mobile Rules

- 720px 以下默认单列退化
- 390px 视口必须检查可读性与溢出
- 三栏以上布局要压成两段或单列
- 关键状态条和数字保留，次要装饰压缩或隐藏
- 不能让标签挤压正文
- 不能让安装命令和快捷键过密

## Anti-patterns

- 不能把绿色做得像荧光贴纸
- 不能把终端风做成纯霓虹游戏 UI
- 不能让标签边框和面板边框重复叠加
- 不能为了“科技感”使用过多蓝紫色
- 不能让正文颜色过灰导致可读性下降
- 不能在移动端保留过多并列面板

## Acceptance Checklist

- [ ] 背景为深绿/墨绿系，不跑偏到蓝黑
- [ ] 主强调以绿色/薄荷绿为主
- [ ] 状态条清晰，黄/红只用于告警
- [ ] 面板层级清楚，信息扫描顺畅
- [ ] 文字清晰，最小字号不低于 11.2px
- [ ] 390px 下无横向溢出
- [ ] 适合终端状态总览 / 监控仪表盘 / 本地运行工具
- [ ] 不混入纸感、手绘草图、瑞士海报风
- [ ] 发布时 date/updated 使用实际系统时间，不用 slug 猜

## Naming / Aliases

- 英文名：`infocard-darkgreen-style`
- 中文名：深绿色监控工作台风格
- 常用别名：darkgreen、绿色监控风、绿色工作台
- 适用 slug：`darkgreen`
- 对应 theme：后续可落到 `theme/darkgreen.html`

## References

- `references/darkgreen-style-creation-note.md`：记录本次从“误发布 abtop 内容卡”回滚到“创建 darkgreen 风格 skill”的抽象过程，以及该风格的设计边界。

## Live Notes

- 该风格优先适配“终端状态总览、监控工具、运行面板、只读安全、本地运行”类主题。
- 如果内容更偏白板、教程、说明书、评论卡，不应使用该风格。
- 创建卡片时，优先让“状态、数值、面板、终端提示”成为第一视觉层。
