# hardblue dark-block text contrast

## 场景

hardblue / hardblue-family 卡片中，不止 `.alert` 会出现黑底黑字；任何深色 hero / panel / note 区块里的说明文字，只要继承了通用段落颜色，都可能在发布后出现低对比度或直接不可读。

## 典型根因

- 深色块（如 `.hero-visual .panel-top`）本身背景是黑/深灰
- 区块内的 `p` 没有被更强选择器锁成浅色
- 通用 `p` / `.card p` / `.mini p` / 其它后置规则在层叠中覆盖了它

## 这次实录（2026-06-26）

目标页：`docs/20260623-mihomo-toolkit-hardblue.html`

用户截图反馈：
- `README SIGNAL`
- 标题 `核心卖点已经从首屏说透`
- 标题下方三行说明文字发黑不可读

视觉定位：
- 问题点不是标题，不是 `.alert`
- 是 `hero-visual` 黑底模块中 `.panel-top p`

## 修复方式

在对应页面 `<style>` 中追加更强选择器：

```css
.hero-visual .panel-top p{color:#ece8dc!important}
```

## 使用规则

当用户反馈“又出现了黑底黑字”时，按下面顺序排查：

1. 不要默认还是 `.alert p` 旧问题
2. 先确认黑底区块的准确位置（alert / hero / panel / note / caption）
3. 找到该区块内的具体文本元素：通常是 `p`、`small`、`caption`、`meta`
4. 用 **区块级更强选择器 + `!important`** 锁浅色
5. build / verify / push 后，至少验证线上 HTML 已包含这条修复规则

## 推荐排查清单

- `.alert p`
- `.hero-visual .panel-top p`
- `.panel-top p`
- `.quote p`
- `.hero-note p`
- `.caption`
- `.meta`

## 备注

这不是环境问题，而是 hardblue 深色模块的可复发层叠坑。应作为发布类技能的稳定坑点保留，而不是仅记在 session 里。
