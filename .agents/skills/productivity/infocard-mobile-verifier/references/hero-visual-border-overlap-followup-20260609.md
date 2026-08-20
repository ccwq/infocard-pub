# Hero / Visual 封面卡边框重叠复盘（2026-06-09）

## 触发场景
同一批信息卡已做过一轮“模板级 spacing 修复”后，用户继续指出 **ViMax** 页面首屏“依然存在叠在一起的情况”。

这说明：
- 第一轮模板级修复解决了 `stats / section / card` 的共性重线感；
- 但某些页面仍然会残留**封面卡内部**的边框冲突，不能误判成同一个外层问题。

## 本次定位结论
最明显的残留重线感在：

1. **hero 右侧 visual 封面卡内部**
   - 结构：`.visual-top`（深色标题区） + `.visual-body` + `.figure` + `figcaption`
   - 真实根因：
     - `.visual-top` 额外画了 `border-bottom: 3px`
     - `.visual-body .figure` 仍保留 `border-top`
     - `figcaption` 自己又有 `border-top: 2px`
   - 视觉结果：标题条底线、figure 顶边、figcaption 分隔线在首屏形成“多层横线”，用户会直接看成“线条叠在一起”。

2. **STATS 一排顶部仍偏重**
   - 不是双 border 主因；
   - 更像 `stats` 离上方模块太近 + card 阴影过重，导致 shell/上方模块的边界和 stats 顶部一起显得“压线”。

## 有效修法
### A. 封面卡内部优先修法
优先级：**减交界线 > 加留白 > 再调 shadow**

具体命中：
```css
.visual-top {
  /* 去掉额外底线 */
  border-bottom: 0;
  padding: 16px 14px 12px;
}

.visual-body {
  padding: 16px 14px 14px;
}

.visual-body .figure {
  /* 去掉和 visual-top 相撞的顶边 */
  border-top: 0;
}

.figure figcaption {
  /* 从 2px 减薄到 1~1.5px */
  border-top: 1.5px solid var(--line);
}
```

### B. STATS 顶部压线修法
```css
.stats {
  margin-top: 18px;
  padding: 0 18px;
}

.stat {
  box-shadow: 6px 6px 0 rgba(29,27,22,.10);
}
```

含义：
- 先把 stats 与上方模块拉开；
- 再减轻阴影；
- 不要先删 `.stat` 边框。

### C. SHOWCASE 首屏补间距
```css
.section .grid-2,
.section .grid-3 {
  margin-top: 14px;
}
```
移动端同步保留一份较小值（如 `12px`）。

## 判定规则
当用户说“还是叠在一起”时，先区分是这三种哪一种：

1. **外层模板共性问题**：`stats / section / section-head / first card`
2. **封面卡内部问题**：`visual-top / figure / figcaption`
3. **阴影过重伪重线**：边框没撞上，但 shadow 把边缘托厚

不要把三者混成一个 bug。

## 验收口径
至少看这 3 处：
1. 右上官方封面图卡：标题区 → 图片 → figcaption 交界是否只剩单一分隔感
2. STATS 一排顶部：是否还有明显双线/压线
3. `01 / SHOWCASE` 首屏：是否还有角点发黑或边框叠压

PASS 标准：
- 无明显双 border
- 无发黑角点
- 有边框层次，但不再像 bug

## 这次有效的经验
- 第一轮模板级 spacing 修复后，如果仍有个别页面残留问题，优先怀疑**组件内部边框相撞**，不要机械继续加大外层 section/stats 间距。
- 封面卡常见误区不是“内容太挤”，而是**标题条底线 + figure 顶边 + figcaption 顶线三层同屏**。
- 视觉上“还有一条重线”时，删一条线通常比继续加大阴影或继续外扩容器更有效。