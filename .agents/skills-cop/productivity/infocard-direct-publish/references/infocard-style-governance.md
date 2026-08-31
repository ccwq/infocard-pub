# Infocard 风格治理规范

## 风格 → 主题映射

| 风格名 | 主题气质 | 适用场景 | 关键颜色 |
|--------|----------|----------|----------|
| `darkblue` | 深蓝渐变/玻璃面板/图标化工作台 | AI/WebGPU/端侧AI/Agent记忆/技术工具 | `--bg:#0c1020` `--cyan:#58c3ff` |
| `redswiss` | 红色斜切 Hero + 纯红徽章 + 黑线 | 开源工具/CLI/方法论/Skill/AI写作 | `--red:#c8102e` `--bg:#f5f2ec` |
| `hardblue` | 米白纸感 + 蓝黑线框 + 网格背景 | 技术手册/调研报告/学术工具/基准对比 | `--bg:#f6f4ef` `--red:#d80018` |
| `darkgreen` | 深绿监控工作台 | 终端状态/系统监控/健康度监测 | `--bg:#0a1a10` `--green:#2db36a` |
| `wood` | 木感编辑风/Simon Willison风 | Agentic Engineering/技术手册/长文解析 | 暖棕背景 |
| `graph-paper` | 米白纸底/细线/节点连线 | 代码图谱/知识网络/依赖关系 | `--bg:#fafaf5` |
| `pixelstack` | 像素堆叠/复古手作 | 特殊视觉风格（需本地字体） | 像素风 |
| `handline` | 手绘便签/白板草图 | 复杂工作流/并行调度/方法论拆解 | 手绘感 |
| `main-style` | 红蓝瑞士风（#E60012红+#1A3A5C蓝） | 默认备选 | 780px宽 |

## 风格选择原则

1. **AI/Tech 工具** → `darkblue`（AIDEKIN、TencentDB-Agent-Memory 均用此）
2. **方法论/Skill/开源规范** → `redswiss`（Shifu 用此）
3. **调研报告/学术/基准对比** → `hardblue`（Humanize 用此）
4. **不确定时** → `main-style`（保守备选）
5. **重建必须从零做结构**，不接受旧卡换色

## darkblue 模板片段（快速复制）
```html
<style>
  :root{
    --bg:#0c1020;--bg-2:#11162a;--panel:#171c2b;--panel-2:#0f1424;
    --ink:#eef4ff;--muted:#a8b7df;--line:rgba(255,255,255,.12);
    --cyan:#58c3ff;--blue:#4a78ff;--green:#2db36a;--yellow:#f4c84c;--purple:#8459ff;
    --shadow:0 18px 42px rgba(0,0,0,.34);
  }
  body{
    background-image:
      radial-gradient(circle at 15% 10%, rgba(88,195,255,.14) 0 10%, transparent 11%),
      radial-gradient(circle at 88% 7%, rgba(61,217,196,.16) 0 9%, transparent 10%),
      radial-gradient(circle at 55% 95%, rgba(132,89,255,.10) 0 8%, transparent 9%);
  }
</style>
```

## redswiss 模板片段（快速复制）
```html
<style>
  :root{
    --bg:#f5f2ec; --paper:#fffdf9; --ink:#0a0a0a;
    --red:#c8102e; --soft-red:#fff5f6;
    --line:#0a0a0a; --shadow:6px 6px 0 rgba(10,10,10,.10);
  }
</style>
```

## hardblue 模板片段（快速复制）
```html
<style>
  :root{
    --bg:#f6f4ef; --paper:#fffdf8; --ink:#111111; --muted:#5f5950; --line:#111111;
    --red:#d80018; --blue:#1f63ff; --soft-red:#fde9eb; --soft-blue:#e8f1ff;
    --shadow:8px 8px 0 rgba(17,17,17,.12);
  }
  body{
    background:
      linear-gradient(rgba(17,17,17,.045) 1px, transparent 1px) 0 0/100% 42px,
      linear-gradient(90deg, rgba(17,17,17,.04) 1px, transparent 1px) 0 0/42px 100%,
      var(--bg);
  }
</style>
```

## 新增主题同步要求
每次创建新的 infocard 主题时，**必须同步加入 `themes.html`** 主题列表页。
