# 网格重叠与 min-content 挤压

当移动端出现卡片重叠、双边框、中文逐字竖排或右侧装饰越界时，先查 computed layout，不要只看源码。

- 窄屏多列块显式改为单列 grid，并使用正的 `gap`；移除遗留的 `border-right`，必要时改用行分隔。
- 网格和 flex 子项设置 `min-width:0`，弹性轨道使用 `minmax(0,1fr)`；长 URL、代码和表格只在局部换行或滚动。
- 检查父级链、`display`、`grid-template-columns`、子元素矩形和页面/局部 `scrollWidth`。
- 截图中的光标、扩展注入或裁切伪影需与 DOM 几何交叉核对；机械无溢出不等于视觉通过。

修复任何可见布局后，重新加载目标 revision，重测并截取受影响区域。
