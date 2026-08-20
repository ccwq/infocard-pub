# crayon R6 纸感编辑风改造记录（2026-07-26）

## 改造目标
将 crayon poster-shell 从 R5 升级为纸感编辑风，更接近参考图（AI Methodology Skill 榜）的编辑海报审美。

## 参考图视觉参数（vision_analyze 提取）
| 维度 | 值 |
|---|---|
| 背景 | `#F5F1E8` 米白纸色 |
| 强调色 | `#B8924A` 赭石/土黄 |
| 序号色 | `#6B7B8C` 灰蓝 |
| 主标题 | 72px 衬线体 |
| 序号 | 64px 衬线斜体 |
| 列表主名 | 22px |
| 正文 | 16px |
| 页边距 | 40px × 32px |
| 圆角 | 0px |
| 风格 | 编辑杂志 + 时间轴 |

## 决策树确认结果（6问全部通过）
1. ✅ 字号层级大幅提升（标题 72px / 序号 62px / 条目 20px / 正文 14px）
2. ✅ 时间轴骨架（编号列 76px + 赭石色竖虚线 + ::before 圆点）
3. ✅ 五色降饱和 −35%
4. ✅ 衬线/无衬线混排（标题衬线、编号衬线、正文无衬线）
5. ✅ 编辑海报式标题层级（眉标赭石 + 大衬线主标题 + 赭石副标题 + 标题底装饰虚线）
6. ✅ 底部轻量编辑化 + 泛化约束

## 关键 CSS 变量（R6）
```css
:root {
  --crayon-bg:      #f0ead8;
  --crayon-ink:     #1c1c1c;
  --crayon-muted:   #6b6252;
  --crayon-faint:   #9b8e7a;
  --crayon-accent:  #b8924a;   /* 赭石强调色 */
  /* 五色降饱和 -35% */
  --crayon-blue:    #4a7fa8;
  --crayon-green:   #3a8a70;
  --crayon-purple:  #7a5aaa;
  --crayon-orange:  #c06030;
  --crayon-yellow:  #b08830;
  --crayon-dash:    rgba(83,73,57,.45);
  --crayon-radius:  0px;
  --crayon-shadow:  none;
}
```

## Git 记录
- commit `b8b5fbb`：crayon R6 纸感编辑风
- 修改：`theme/crayon.html` + `docs/20260725-ai-methodology-skills.html`
- 公网：`https://ccwq.github.io/infocard-pub/theme/crayon.html`
