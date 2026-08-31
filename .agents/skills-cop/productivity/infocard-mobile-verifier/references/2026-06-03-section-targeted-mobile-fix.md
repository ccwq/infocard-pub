# 2026-06-03 章节级移动端修复：female-portrait-director

## 触发信号
用户提供真机截图，明确指出某一节（第 06 节「仓库结构」）存在问题，并要求：
1. 修复该节结构问题
2. 整体最小字号放大 1.4 倍

## 这次有效的修复策略

### 1. 不再泛化修全页，先锁定截图问题区
截图指向两个具体块：
- 白底「关键文件」卡
- 黑底「路由目录」卡

这时应优先把这两个块做成**章节级重构**，而不是继续只调全局字号和 spacing。

### 2. 文件列表从行内混排改成块式结构
原结构：
- `num/file-name + title/desc` 混在同一行
- 手机上容易出现重叠、错层、密度过高

替换为：
- `.file-grid`
- `.file-item`
- `.file-name`
- `.file-role`

效果：文件名与解释分层，扫描路径更清楚。

### 3. 路由目录从 list item 改成两段式 route item
原结构：
- `.item > .num + .it-desc`
- 在黑底卡上字体过小、对比弱、层级混乱

替换为：
- `.route-list`
- `.route-item`
- `.route-name`
- `.route-desc`

移动端 720px 下再把 `route-item` 改成单列堆叠，避免窄屏横向拥挤。

### 4. “最小字放大 1.4 倍”要系统处理
不要只放正文。最低文本层应一起抬高，包括：
- meta
- stats label
- sec-title small label
- note / warn2
- figcaption
- code
- table th / td
- footer
- pill / badge
- list desc / route desc / file role

## 额外修复
移动端回归脚本还暴露了一个问题：底部保存按钮遮挡正文。
最终把 sticky/fixed 式底部按钮改成正常流布局底部区块，避免覆盖内容。

## 验收
- 本地移动端回归脚本 PASS
- 问题区结构已重做，而不是只靠放大字体硬撑
- 适合用在“用户发截图点名具体章节”的信息卡移动端修复场景
