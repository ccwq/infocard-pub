# handline × wired-elements full-surface rebuild note

## Trigger
当用户对 `infocard-handline-style` 明确提出以下要求时：
- 不能只做局部手绘点缀
- 边框线条要整体切到 wired 风格
- 同时还要保持高密度、紧凑、不发散

## Session takeaway
这类任务的核心不是“加一个库”，而是 **把边框语言统一成 wired 体系，同时保住 editorial 骨架和高密度阅读节奏**。

错误路径：
- 只把 `wired-elements` 用在按钮、少量卡片、或 footer 上
- 其余主体仍是普通 `div + border`
- 最终会被用户判断为“只是局部 wired 点缀”

正确路径：
1. 先保留 editorial 骨架：
   - topbar
   - serif hero
   - compare box
   - quote banner
   - process bar
   - 3-column body
2. 再把主要块级结构整体切到 `wired-card` / wired 风格 label：
   - outer paper frame
   - hero compare box
   - quote banner
   - process steps
   - principle items
   - mechanism cards
   - testing / defense cards
   - footer block
3. 最后控制密度，避免变成控件展示页：
   - 收紧 card padding
   - 收紧 card gap
   - 保留高信息密度
   - 对 chip / tiny rail / 微标签使用 wired 风格边框，但不要再套一层大 card

## Visual review pattern
建议至少两轮：

### Round 1
检查：
- 是否仍存在大面积普通硬边框块
- wired 是否只停留在少数元素
- 页面是否因为全面 wired 而变松、变空、像 showcase
- 移动端是否出现 `card-in-card-in-card` 拥挤

### Round 2
检查：
- 边框语言是否全局统一
- 主要块是否都进入 wired 体系
- 是否仍保留 editorial cheat-sheet 的阅读节奏
- 移动端是否还需要 6–8px 级别的间距微调

## Compactness rule
这类卡的优先级是：

`统一 wired 边框语言 > 保留 editorial 骨架 > 高密度紧凑 > 大留白美观`

如果为了“更好看”而把页面做成宽松海报，通常不符合用户预期。

## Practical implementation notes
- 对于 `wired-elements`：大块用 `wired-card`，小块不必机械地全部 `wired-card` 化。
- 当移动端 full-wired 后显得太挤：
  1. 先轻微增加外层 section padding；
  2. 再增加块间距；
  3. 最后才减少最内层卡片数量。
- 不要因为拥挤就退回普通直线边框；用户要的是 **统一 wired 语言**，不是“局部有线条抖动即可”。
