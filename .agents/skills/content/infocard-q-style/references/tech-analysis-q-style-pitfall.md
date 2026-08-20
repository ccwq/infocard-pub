# 技术分析类 Q-style 卡评审坑点（2026-06-06）

这是一次“用户坚持 Q 风格，但页面视觉/结构一度更像桌面缩放稿”的复盘要点。

## 触发信号
- 用户明确要求 `infocard-q-style`
- 但公开页面被评审为“更像桌面页缩小到手机”
- 或者“Q 风格有了，但首屏不够卡片化、保存按钮压正文”

## 正确评审顺序
1. 先看公开 Pages URL，不看本地 HTML 自我感觉。
2. 直接切到 390px 视口。
3. 读 `scrollWidth / clientWidth` 与 `.page` 的实际 computed width。
4. 看保存 PNG 按钮是否进入正文阅读区。
5. 再用 browser vision 判断是否仍有“桌面缩小感”。

## 这次有效的修复方向
- 移动端 `.page` 不要继续保留过大的桌面留白；优先让卡片真正铺满窄屏可用宽度。
- 底部不要只靠“按钮改小”解决；更稳的是给正文侧增加 bottom safe-area padding，让 fixed 按钮落在空白区。
- 420px 以下、390px 视口要再复查一次，不要默认 720px 规则足够。

## 可复用的验证信号
- browser_console 读到的 `.page` 宽度接近 `viewport - gutter`
- `scrollWidth <= clientWidth`
- browser vision 明确说“不是桌面版直接缩小”
- fixed 保存按钮仍可见，但不压住正文末段

## 备注
这类卡片即使内容密度高，也不应牺牲移动端可读性；Q 风格允许高密度，但不允许“高密度 + 桌面缩小感”同时存在。
