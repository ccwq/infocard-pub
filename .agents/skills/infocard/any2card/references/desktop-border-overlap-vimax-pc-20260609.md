# PC 首屏重线感修复记录（ViMax，2026-06-09）

## 触发信号
用户先说“依然存在叠在一起的情况”，随后进一步纠正：**问题出现在 PC 版本**。

这说明“移动端 PASS”不能外推出“桌面端也 PASS”。同一张卡必须按用户指出的视口重新验收。

## 适用场景
- 信息卡首屏在桌面宽度（典型 1440px）出现“线条叠在一起 / 双 border / 阴影贴边 / 角点发黑”
- 右侧 visual 模块、stats 一排、section 首行卡片这些高密度边界区域在 PC 端比移动端更容易暴露重线感

## 本次有效修复
### 1. 右上 visual 模块
目标：去掉标题区、图片区、figcaption 三层交界的重线感。

有效动作：
- 增大 hero 双列间距：`gap: 14px -> 18px`
- 增大 `visual-top` / `visual-body` 内边距，拉开标题区与图片区
- `figure` 去掉 `box-shadow`
- `figcaption` 去掉 `border-top`
- 用浅底色承接 figcaption：`background: #fbf7ef`

结论：**PC 首屏里，视觉重线感很多时候来自“边框 + 阴影 + caption 分隔线”三重叠加。优先减层，不要只加 1-2px spacing。**

### 2. STATS 一排顶部
目标：避免 stats 卡片上边界与外层 shell / hero 下分隔线抢线。

有效动作：
- `stats.margin-top: 24px -> 28px`
- `stats.padding-inline: 22px -> 26px`
- `stats.gap: 10px -> 12px`
- `stat` 去掉 `box-shadow`

结论：**桌面端 stats 若仍保留强投影，会把正常分区线误读成双线。PC 版优先把 stats 影子降到 0，再判断是否还要补留白。**

### 3. `01 SHOWCASE` 下第一行 figure/card
目标：避免 section 标题区下方第一排卡片上边界显得发黑或偏重。

有效动作：
- `.section .grid-2, .section .grid-3 { margin-top: 22px; }`
- `.card, .mini` 去掉 `box-shadow`

结论：**首行卡片的“上边界偏重”在 PC 端经常不是 border 太粗，而是上方 section 线 + 卡片影子叠加。**

## 建议的 PC 排查顺序
1. 先确认是不是 **PC 问题而不是 mobile 问题**。
2. 先查首屏这三组：
   - visual 标题区 / figure / figcaption
   - stats 顶部 / shell 分隔
   - `section-head` 下第一排 figure/card
3. 若是桌面端重线：
   - **先减 shadow**
   - 再增组件间距（gap / margin / padding）
   - 最后才考虑减 border 或改单条边线

## 本次验收口径
PC 版按桌面首屏单独验收，不能用移动端结论替代。

通过标准：
- 右上 visual 模块内部无明显叠线
- stats 顶部无明显抢线
- `01 SHOWCASE` 第一行 figure/card 上边界无明显发黑或双线感

## 反模式
- 看到“线条叠在一起”就默认按移动端修
- 只调小 border，不动 shadow
- 只在单个 figure 上打补丁，不处理 stats / card 这类共享视觉语言
