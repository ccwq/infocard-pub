# infocard-darkblue-style · Session Reference

## 视觉来源

**Nezha · Agent-First IDE for Vibe Coding** (`docs/20260611-nezha.html`)

原始素材：用户提供的 Nezha 产品宣传图，深蓝黑底 + 渐变光晕 + 玻璃面板 + 图标化工作台组件。

Key visual signals extracted:
- 背景：`#0c1020` 深蓝黑 + radial-gradient 光晕（青蓝 `#58c3ff` + 紫 `#8459ff`）
- 面板：`#171c2b` + 半透明边框 `rgba(255,255,255,.08)` + 柔和阴影
- 进度条：`linear-gradient(#58c3ff, #2db36a)` 渐变
- 状态色：青蓝（活跃）/ 绿（成功）/ 黄（警告）/ 紫（主 CTA）
- 图标：圆形底座 + 线性 SVG，不依赖 emoji
- Font：Inter + ui-monospace 混排，hero title weight 950

## 主题创建完整链路（2026-06-12）

1. 从图像提取 CSS token 和 layout skeleton
2. 创建 `theme/darkblue.html` 完整预览页（含 hero / shell / feature row / CTA / icons）
3. 在 `_themes.yaml` 添加 entry（position、swatch、preview_url、ref_links）
4. 运行 `python3 scripts/rebuild_themes.py` 重建 `themes.html`
5. commit theme 文件 + _themes.yaml + themes.html
6. 验证 `theme/darkblue.html` HTTP 200

预览页关键结构（可直接复用）：
- `.hero`：双栏 grid，左侧 copy + 右侧 visual panel
- `.shell`：三栏 grid（workspace | tasks+terminal+editor | status+stats）
- `.feature-row`：6 列图标化功能卡
- `.download-btn`：紫蓝渐变 CTA
- SVG icon system：同一图标用 SVG path，内联 color via `currentColor`

## 已知限制

- 深色背景不适合纯文档、纯调查、纸感内容
- 与 hardblue/redswiss 主打高密度文档的方向完全不同，不混用
- 390px 下 shell 三栏必须单列化，feature-row 降为 2 列
