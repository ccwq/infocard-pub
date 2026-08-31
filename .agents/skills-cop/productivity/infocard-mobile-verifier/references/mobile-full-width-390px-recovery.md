# 390px 全宽留白问题修复记录

> 适用场景：移动端截图里没有横向溢出，但页面主体仍然比视口窄，右侧/两侧出现明显背景留白，像“桌面版缩小后居中”。

## 诊断顺序
1. 用 390×844 视口复现。
2. 读取这几个值：
   - `innerWidth`
   - `document.documentElement.clientWidth`
   - `document.body.clientWidth`
   - `document.body.scrollWidth`
   - `getComputedStyle(.page).width`
   - `getComputedStyle(.card).width`
3. 先判断是否是**全宽失败**，而不是只看 `scrollWidth <= innerWidth`。

## 典型特征
- `scrollWidth == innerWidth`，但 `.page` 或 `.card` 只有 375/378px，而视口是 390px。
- 视觉上右侧保留一条深色背景边。
- 页面没有溢出，但主体没有铺满。

## 常见修复
- 把移动端 wrapper 从 `calc(100vw - gutter)` 改成 `width: 100vw; max-width: none; margin: 0;`。
- 如果桌面版需要留白，只在桌面断点保留 `calc(...)` 或 `min(...)`，不要把桌面留白逻辑带进移动端。
- 修复后重新截图，确认右侧背景留白消失。

## 验收标准
- 390px 视口下：`pageW` / `cardW` 与 `innerWidth` 一致或几乎一致。
- 视觉上没有明显右侧空隙。
- 不是“无溢出但仍然偏窄”的半失败状态。
