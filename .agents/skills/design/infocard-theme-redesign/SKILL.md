---
name: infocard-theme-redesign
description: Decision-tree redesign of infocard themes. e.g. crayon R6.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, theme, redesign, editorial, crayon]
    related_skills: [infocard-crayon-style, infocard-style-man-skill]
---

# infocard-theme-redesign · 信息卡主题改造工作流

## 触发条件

- 用户提供了参考图，要求信息卡"接近这个审美"
- 用户说"不符合图1/图2审美"、"要改主题"
- 主题版本迭代（crayon R5→R6）

## 核心原则

1. **直接写入项目文件**：不写临时目录 → 写完直接 build → commit → push
2. **决策树先行**：用 6 问厘清需求，用户确认后再执行
3. **泛化约束**：改造必须保持主题通用性，不绑定固定内容或固定尺寸
4. **CSS 变量暴露**：所有设计值通过 `:root` CSS 变量暴露

## 决策树（6问）

每问只问一件事，用户确认后继续。已确认的答案直接执行，不等全问完。

| # | 问题 | 决策内容 |
|---|---|---|
| 1 | 字号层级如何调整？ | 主标题/序号/条目/正文各层级放大或保持 |
| 2 | 编号与正文布局是否改时间轴骨架？ | 左侧大号编号 + 赭石色虚线/圆点 + 右侧正文 |
| 3 | 五色系统如何处理？ | 保留/降饱和/−去除 |
| 4 | 字体是否混排？ | 标题衬线/正文无衬线/全局统一 |
| 5 | 主标题区是否改为编辑海报式？ | 眉标+大衬线主标题+赭石副标题+装饰线 |
| 6 | 底部工作流如何处理？是否有泛化约束？ | 轻量编辑化/保留卡片；确认泛化要求 |

## 执行流程

```
1. 加载 infocard-crayon-style skill（了解当前 poster-shell CSS）
2. 读取 theme/crayon.html 确认最新值
3. vision_analyze 分析参考图提取 CSS 设计值
4. 执行决策树（逐问确认）
5. 直接修改 theme/crayon.html（CSS 变量 + poster-shell 区块）
6. 同步修改目标卡片内联 CSS（或引用 theme/crayon.html）
7. npm run build && npm run verify && node scripts/check-info-leak.js
8. git add / commit / push
9. sleep 55 && curl 核验公网交付
```

## crayon R6 纸感编辑风参考值（2026-07-26 实战）

### 参考图关键值
```
背景: #F5F1E8  | 强调色: #B8924A 赭石  | 序号色: #6B7B8C 灰蓝
主标题: 72px 衬线  | 序号: 64px 衬线  | 列表主名: 22px  | 正文: 16px
页边距: 40px×32px  | 圆角: 0
```

### crayon R6 落地值
```css
/* 容器 */
.poster-shell { padding: 40px 40px 32px; }

/* 标题 */
.hero-title { font: 700 clamp(42px,8vw,72px)/.95 Georgia,serif; letter-spacing:-.04em; }
.hero-subtitle { color: var(--crayon-accent); font-size: 16px; }
.hero-inner::after {
  content:""; position:absolute; bottom:-6px; left:0;
  width:100%; height:1px;
  background: repeating-linear-gradient(to right,
    var(--crayon-accent) 0,var(--crayon-accent) 5px,
    transparent 5px,transparent 10px);
}

/* 统计行 */
.stat-item b { font: 700 26px/1 Georgia,serif; }

/* 卡片网格 */
.skill-card { grid-template-columns: 76px 1fr; min-height: 120px; }

/* 时间轴 */
.card-stripe {
  left:72px; top:18px; bottom:18px; width:1px;
  background: repeating-linear-gradient(to bottom,
    var(--crayon-accent) 0,var(--crayon-accent) 5px,
    transparent 5px,transparent 9px);
  opacity:.7;
}
.card-stripe::before {
  content:""; position:absolute; top:50%; left:-3px;
  transform:translateY(-50%);
  width:7px; height:7px; border-radius:50%;
  background:var(--crayon-accent);
}

/* 编号 */
.card-num { font: 400 62px/.88 Georgia,serif; letter-spacing:-.05em; text-align:right; }

/* 条目 */
.card-title { font: 700 20px/1.2 Arial,"PingFang SC",sans-serif; }
.card-desc  { font: 14px/1.65 Arial,"PingFang SC",sans-serif; }

/* 移动端 */
@media(max-width:720px){
  .skill-card { grid-template-columns:52px 1fr; }
  .card-num   { font-size:44px; padding-right:8px; }
  .card-stripe{ left:50px; }
}
```

## 批量主题重建门禁（2026-08-09）

批量卡片不得默认复用同一套嵌入 CSS。三张以上卡片在 authoring 前必须建立逐卡主题表：`slug | content_form | primary_theme | alternative_theme | rejection_rationale`；只有内容形态、受众场景和信息密度完全一致时，才允许同主题批次。

主题重建必须先保真再换壳：提取原 `<body>`，记录 body hash、可见文本长度、section/article 数量和来源链接数量；只替换外层 CSS/主题元数据/响应式结构，重建后重新比较这些指标，异常变化立即停止。`meta.style` 只是声明，HTML 必须同步设置规范化的 `data-theme`，并实际出现目标主题的 token 与至少两个结构签名。

视觉验收前必须校验截图身份：精确 URL/端口 HTTP 200、正确 `<title>`、卡片专属关键词，且不得包含 `Error response`、`404` 或无关标题。旧端口或错误目录产生的截图全部作废，必须从正确服务重新截图。任何 CSS/结构修改都会使旧视觉证据失效。

## 常见失败模式

| 问题 | 根因 | 修复 |
|---|---|---|
| 正文只有 56px 宽 | `.card-stripe` 绝对定位导致 `.card-body` 落入第1列 | 加 `grid-column:2` |
| 五色过于饱和抢视觉 | 未降饱和 | 五色整体 −30~35% |
| 编辑海报感不足 | 字号太小、衬线缺失、无装饰系统 | 按 R6 参考值放大字号、加赭石装饰 |

## 参考
- 主题骨架：`infocard-pub/theme/crayon.html`
- 演示：`https://ccwq.github.io/infocard-pub/theme/crayon.html`
