# 2026-06-03 · SkillOpt Cookbook 首屏移动端布局修复

## 现象
- 用户真机截图显示首屏 `header + stats` 布局明显损坏：左侧内容挤成窄列，右侧大片留白，看起来像双栏响应式失效。
- 自动脚本同时报：`scrollWidth=418 expected 390`。

## 根因
不是单纯字号或 spacing 问题，而是一次大面积 CSS 重写后，**基础布局选择器丢失**：
- `.stats`
- `.stat`
- `.stat:last-child`
- `.meta .rev`
- `.warn strong`

结果：
- 统计区从 grid 退化成普通 block 流
- 首屏元信息徽标失去布局锚点
- 再叠加 `body { width: 100vw }`，手机端更容易出现左右错位 / 视觉挤压

## 有效修复
1. 补回基础布局规则，而不是只调字号：
   - `.stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); ... }`
   - `.stat { ... min-width:0 }`
   - `.meta .rev { ... }`
   - `.warn strong { color:#fff }`
2. 手机端首屏单独重排：
   - `body { width:100%; max-width:100%; overflow-x:hidden }`
   - `.card { width:100%; max-width:100% }`
   - `.header { grid-template-columns:1fr; ... }`
   - `.header > :nth-child(2) { display:none }`（隐藏桌面占位列）
   - `.meta` 改成 `flex-wrap` 的元信息行
   - `.stats { grid-template-columns:repeat(2,minmax(0,1fr)) }`
3. 兜底防溢出：
   - `.card, .card * { max-width:100%; min-width:0; overflow-wrap:anywhere; word-break:break-word }`

## 诊断方法（值得复用）
当 `verify_mobile_infocard.py` 只告诉你 `scrollWidth > 390`，但看不出具体是谁撑宽时，用 Selenium 在 390px 视口下直接枚举 offender：

```python
const vw = document.documentElement.clientWidth;
for (const el of document.querySelectorAll('body *')) {
  const r = el.getBoundingClientRect();
  const sw = el.scrollWidth || 0;
  if (r.right > vw + 1 || sw > vw + 1) {
    // 记录 tag / class / right / width / text snippet
  }
}
```

这次就是靠这一步发现：**不是单一内容块太宽，而是整张 card / header / stats 都退化成 494px block**，从而把问题定位到基础 CSS 规则丢失。

## 验收标准
- 不只看 `scrollWidth` 数值，还要确认：
  - 首屏 `stats` 真正恢复为 2×2 卡片
  - `meta` 不再形成右侧孤岛
  - 用户点名的首屏区域视觉上已恢复正常
- 再跑：
  - `python scripts/verify_mobile_infocard.py <page> --browser`
  - 公网 `?v=timestamp` 复验 200
