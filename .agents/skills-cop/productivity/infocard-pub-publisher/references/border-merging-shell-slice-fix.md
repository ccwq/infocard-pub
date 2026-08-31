# Border merging: shell-as-big-box vs independent floating cards

**症状语言（用户原话）**：
- "边框合并在一起，造成设计感丢失"
- 卡片像"一张大表格被黑线切开"，不像"几块独立卡片飘在底色上"
- 节号块（如红色 01）"压在水平线交叉点上"，和外框黑线重合
- hero 和下方 stats、section 之间没有可见 gutter，连续黑线把页面分块

**适用风格**：米黄/纸感底 + 直角厚黑边 + 错位硬阴影 + swiss grid（即 `infocard-q-style` 的硬版变体；2026-06 还没有专门 skill 覆盖这种"米黄硬瑞士 / paper-warm-swiss"，最近的卡是 `docs/20260616-agentic-code-review.html`）。

## 根因模式（一定要先证明，不要先动手改）

错误骨架（会把整页变成"大表格内分隔线"）：

```css
.shell {
  border: 3px solid #111;
  box-shadow: 8px 8px 0 rgba(17,17,17,.12);
  padding: 18px;          /* 内层一切都贴 shell 内边 */
}
.hero        { border-bottom: 3px solid #111; }   /* 切片，不是独立卡 */
.hero-copy   { border-right: 3px solid #111; }    /* 双栏靠共享黑线分 */
.stats       { /* 无 border、无 shadow，4 个 .stat 直接落在 shell 内 */ }
.section     { border-top: 3px solid #111; }      /* section 也用切片线 */
.section-no  { /* 90x90 红块刚好坐在 section 顶边线上、左边贴 shell 黑边 */ }
```

视觉效果：所有内部黑线（hero-bar、hero border-bottom、hero-copy 右线、section border-top）和 shell 外黑边粘成一张大网。stats 和 card 子卡虽然有自己的 box-shadow，但被外层大盒子压扁了独立感。

## 诊断脚本（先证后改）

通过 browser_console 直接读取 computed style + bounding rect。**不要先靠 vision_analyze 判断**——本次 vision_analyze 在桌面/移动两次都把"明显合并的边框"判读成"刻意的极简表格风/独立卡片"，与实测 DOM 数据完全相反。computed style 是唯一可信的初步证据。

```js
(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const dump = el => {
    if (!el) return null;
    const c = cs(el), r = el.getBoundingClientRect();
    return {
      sel: el.tagName + (el.className ? '.'+el.className.split(' ').join('.') : ''),
      box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      borderTop: c.borderTop, borderRight: c.borderRight,
      borderBottom: c.borderBottom, borderLeft: c.borderLeft,
      boxShadow: c.boxShadow, margin: c.margin, padding: c.padding,
    };
  };
  return {
    shell: dump(document.querySelector('.shell')),
    hero: dump(document.querySelector('.hero')),
    stats: dump(document.querySelector('.stats')),
    section1: dump(document.querySelectorAll('.section')[0]),
    sectionNo: dump(document.querySelector('.section-no')),
  };
})()
```

红旗信号：
- `shell` 既有 `border` 又有 `box-shadow`，且 `padding > 0`
- `hero` / `section` 的 4 边 border 不一致（只有 bottom 或 top），说明在用切片线分隔
- `stats` 自己 `border:0 / box-shadow:none`（说明它没被升级成独立卡）
- `section-no.x` 与 `shell.x + shell.padding` 相差 ≤ 3px（说明红块贴 shell 黑边）

## 修复模式（4 处 CSS，最小动刀）

```css
/* 1. shell 降级为纯 layout 容器 */
.shell {
  background: transparent; padding: 0;
  display: grid; gap: 24px;        /* 让卡之间产生可见米色 gutter */
}

/* 2. hero 升级为独立黑边卡 */
.hero {
  border: 3px solid #111;
  background: #fffdf8;
  box-shadow: 10px 10px 0 rgba(17,17,17,.14);
}

/* 3. stats 包成独立外框，4 张子卡内嵌 */
.stats {
  display: grid; grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 14px; padding: 18px;
  border: 3px solid #111; background: #fffdf8;
  box-shadow: 10px 10px 0 rgba(17,17,17,.14);
}
.stat { box-shadow: 6px 6px 0 rgba(17,17,17,.12); }  /* 子卡降级 6px 避免和外框重叠 */

/* 4. section 取消 border-top 切片，整体升为独立卡 */
.section {
  margin: 0;                       /* 不再靠 margin-top + border-top 分隔 */
  border: 3px solid #111;
  background: #fffdf8; padding: 22px;
  box-shadow: 10px 10px 0 rgba(17,17,17,.14);
}
.section-no { box-shadow: 6px 6px 0 rgba(17,17,17,.12); }
```

移动端 720px 同步把 `box-shadow` 缩到 `6px 6px 0`，避免阴影出血或局促。

## 验收口径（必须双端 + computed style 三件套）

1. **computed style 复核**（再跑一次诊断脚本）：每个升级后的卡都应有 `border:3px solid rgb(17,17,17)` + `boxShadow:rgba(17,17,17,0.14) 10px 10px 0px 0px`，shell 应当 `border:0 / boxShadow:none`。
2. **桌面 1280px 截图**：肉眼检查 hero / stats / section 之间有可见米黄 gutter；右下错位硬阴影各自存在。
3. **移动 390px 截图**：单列堆叠、无横向溢出、卡间留白清晰、节号块落在 section 卡内边距区域而不是边线交叉点。
4. **公网 computed style** 与本地一致才算 deploy 完成（CDP 直接拉 `https://...?v=$(date +%s)` 跑同一段诊断脚本）。

## 未来方向

- 这种"米黄硬瑞士"风目前没有 style skill。如果再出现一张同类卡（直角厚黑边 + 米黄底 + 红蓝双强调 + 错位硬阴影 + 严格 swiss grid），考虑沉淀为 `infocard-paper-warm-swiss-style`，把上面的修复模式作为骨架默认值，而不是每次靠这份 reference 二次修复。
- 决策线：**纸感 + 圆角 + 贴纸 → q-style**；**纸感 + 直角 + 硬阴影 → 待建 paper-warm-swiss**；**红黑无米黄 → redswiss**；**米黄 + 手绘抖动边框 → handline**。

## 实战记录

- 2026-06-17 修 `docs/20260616-agentic-code-review.html`：commit `8ec4cc7`，桌面 + 390px 双 PASS，公网 computed style 与本地一致。
- 教训：vision_analyze 对"边框合并 vs 共享分隔线 vs 独立卡片"的判读不可靠（同一截图给出"完全没问题 / 独立卡片各自带阴影"的错误结论），必须用 computed style + 视觉**双轨验收**，DOM 数据为准、视觉为辅。
