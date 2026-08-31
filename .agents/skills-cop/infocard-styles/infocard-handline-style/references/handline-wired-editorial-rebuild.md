# handline wired-editorial rebuild note

## Trigger
- 用户明确说现有 handline 主题“效果差”，并给出一张 editorial cheat sheet / infographic 作为视觉参考。
- 用户允许使用公开 CDN 的手绘 UI 库来辅助实现。
- 后续方向被纠正为：**最终要沉淀的是 skill，不是持续打磨 demo 预览页。**

## Durable lesson
手绘主题如果只做“米纸底 + 圆角卡片 + 橙色强调”，通常会显得像普通信息卡换肤，不足以形成真正的 handline / whiteboard identity。

当参考图本身已经有很强的 **版式骨架** 时，应该优先重建它的结构语言，而不是只抽配色：
- 顶部信息条 / topbar
- 大号 serif 标题
- 右侧黑底对照框
- 棕橙色 quote banner
- 黑色 process bar
- 三列主体信息区
- 底部轻量 footer

## Key correction from this round
本轮最大的纠偏不是“把 wired 用得更多”，而是：

1. **preview 不是规范本体，skill 才是规范本体**
2. 对 handline / whiteboard / workflow 类主题，应该默认：
   - rough.js / 手绘 SVG 负责骨架层
   - 普通 HTML/CSS 负责内容层
   - `wired-elements` 只做少量增强层
3. full-wired 只在用户明确要求时才成立，不能反向变成该主题的默认定义
4. 必须把浏览器自动深色污染作为 style 级风险写入 skill，而不是只在某个 demo 页面临时修 CSS

## Recommended implementation
### For style skill definition
skill 里应先写清三层结构：
1. 骨架层：rough.js / 手绘 SVG（外框、箭头、连接、便签轮廓、批注、虚线高亮）
2. 内容层：普通 HTML/CSS（标题、段落、列表、说明文字、断点）
3. 增强层：`wired-elements`（重点卡片、CTA、极少量强调块）

### For preview themes (`theme/*.html`)
预览页只是样张，用来验证该 skill 是否可落地。可以直接使用公开 CDN：

```html
<script type="module" src="https://unpkg.com/wired-elements?module"></script>
```

但不要因为 preview 暂时采用 full-wired 方案，就把它升级为长期默认规范。

### Export support
若主题预览页保留 PNG 导出按钮，可直接用公开 CDN 引入 `html2canvas`：

```html
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
```

## Design rule
**先重建 editorial skeleton，再叠加 hand-drawn texture。**

顺序应为：
1. 先复刻参考图的信息组织方式
2. 再把手绘骨架（rough / sketch SVG）放到适合的区块
3. 最后才补充少量 wired、纸张纹理、胶带、噪点、按钮等装饰

## Anti-pattern
- 只抽颜色，不重建结构
- 把所有区块都换成手绘组件，导致主次失焦
- 为了“更手绘”而降低正文可读性
- 把 theme refinement 误扩展到首页 / index / link 调整；若用户只要求 theme 页面，就只改 theme 页面
- 让 preview 的实现细节反过来绑架 skill 的设计边界
