# 科学普及卡结构模板

## 适用场景

Wikipedia 科普词条 / 科学概念 / 专业术语向非专业读者解释。目标：从定义到应用一条线讲清楚，图文并茂，有一定深度但不堆砌技术参数。

## 默认 9 段结构

1. **Hero**：定义一句话 + 词源 + 日常类比（如"像素→体素"）+ 2 个 recall card 对比框
2. **关键数字**：4 格数字卡片（尺寸/词源/扩展/里程碑算法），用 `numbers` grid
3. **对比表**（`versus` + `table.cmp`）：与 2–3 个相关概念做三栏对比（维度 / 位置 / 存储 / 优势 / 弱点 / 应用）
4. **方法分层**（`layers`）：3 种技术路径按 L1/L2/L3 分层（基础 → 进阶 → 历史）
5. **应用领域**（`sections` + `sec-grid`）：6 格应用卡片，每格 1 个小标题 + 1 句说明
6. **里程碑年表**（`games` + `game-grid`）：9 格时间线卡片（年份 + 名称 + 作者 + 一句话）
7. **反直觉笔记**（`note.pix`）：1 段总结，提 2–3 个常见误区 / 深层理解
8. **Footer**：来源 + 主题

## 图像要求

- 必须有 1 张插图放在 Hero 的 `.stage` 区域
- 优先从 Wikipedia 下载（见 `references/wikimedia-image-download-browser-first.md`），失败则自绘 SVG
- SVG 必须含 `<title>` + `<desc>` + 中文 `alt`
- 图片下方必须有 caption（`.stage-caption`）说明"这个图展示的是什么"

## 主题选择

| 主题 | 适合场景 |
|---|---|
| `pixelstack` | 像素/体素/网格/程式化概念（视觉与概念互文） |
| `graph-paper` | 数学/几何/算法/图论 |
| `black-head` | 调查/事实核查/证据型 |
| `scrapbook` | 生物/自然/历史/人文 |

## 使用示例

体素卡（`docs/20260622-voxel.html`）是 canonical 首张科普卡，采用了 pixelstack 主题，自绘 SVG 等距投影体素图。

## 互动

- 资源引用可在 Hero 正文中嵌入（如 `references/wikimedia-image-download-browser-first.md`），并在 Footer 列出
- 如果用户明确要求"发布信息卡"，直接走全链路发布（含 wiki 同步），不中途确认