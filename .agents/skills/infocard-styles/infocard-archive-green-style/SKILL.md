---
name: infocard-archive-green-style
description: Archive Green 风格信息卡主题。用于高密度维修手册、证据记录与编号流程的细线档案版式。
version: 1.0.0
---

# infocard-archive-green-style

## Design DNA
暖骨纸白画布、鼠尾草绿单强调、零圆角、1px 细线、编号信号、档案/现场手册气质。避免装饰性渐变和厚重阴影。

## Layout Skeleton
header → signal-block → hero/stats → numbered sections → process strip → matrices → risk panel → closing.

## Components
使用 `.header`、`.signal`、`.hero`、`.stats`、`.section`、`.num`、`.process`、`.step`、`.matrix`、`.risk` 与 `.closing` 形成信息记录结构。正文优先细线分隔和连续阅读，不使用通用彩色卡片堆叠。

## Mobile Rules
720px 以下主区单列；process 改为纵向步骤；表格置于独立横向滚动容器；页面不得横向溢出；正文最小字号约 12px。

## Color Rules
组件颜色通过 `:root` token 消费；背景、正文和风险提示保持高对比。