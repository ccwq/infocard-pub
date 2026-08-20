# Wikipedia / 百科知识卡 Q-style 会话笔记
**生成时间：** 2026-06-12  
**触发场景：** `https://zh.wikipedia.org/wiki/遗忘曲线` → Q-style 知识分享卡（20260612-forgetting-curve）

---

## 卡片结构（简化版知识卡）

本次生成的卡片采用了简化版 Q-style 结构，适合单主题科普（< 10 个要点）：

```
hero（kicker + title + subtitle + pills + hero-stats 4格）
section-01: intro-grid（4列，每格一个关键数据点）
section-02: interval-grid（5列时间点数据）+ formula（近似公式）
section-03: workflow-grid（4列学习应用步骤）
section-04: tone-grid（3列误区）
section-05: fit-grid（3列适用边界）+ callout
section-06: footer-grid（关键词）+ footer-block（原文信息）
```

### 关键组件选择逻辑

| 组件 | 用途 | 何时用 |
|---|---|---|
| `intro-grid` | 把关键数据点/概念拆成独立卡片 | 5 个以内的核心数据点 |
| `interval-grid` | 统一量纲的时间/数量序列 | 有明确时间点/比例序列 |
| `workflow-grid` | 步骤型操作流程 | 可排序的动作步骤 |
| `tone-grid` | 误区/误读对照 | 需要说"它不是X"的边界澄清 |
| `fit-grid` | 适合/不适合/真正有用处 | 决策类内容 |
| `formula` | 代码/公式块 | 有数学表达式或命令模板 |
| `callout` | 收尾强结论 | 需要一句压住全篇的判断 |

### 本次卡片内容提炼逻辑

1. **标题要写结论**，不是词条名：`遗忘曲线：记忆不是线性消失，而是先快后慢地掉`
2. **数据单独成格**：把 20min/1h/1day/1week/1month 的数据拆成 5 格 `interval`，让规律一目了然
3. **误区是知识卡的价值所在**：正文可以总结定义，但读者最需要的是"它不是什么 / 不能怎么用"
4. **来源标注**：正文可做提炼，但 source note 标注来自中文维基百科，避免把二手解释当原文

---

## Wikimedia 图片抓取（已验证路径）

**标准路径（已知 File:xxx 时）：**
```python
import urllib.request, urllib.parse, json
file_title = 'File:ForgettingCurve.svg'
url = (f'https://commons.wikimedia.org/w/api.php?action=query'
       f'&titles={urllib.parse.quote(file_title)}'
       f'&prop=imageinfo&iiprop=url|size|mime&format=json')
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20) as r:
    d = json.load(r)
url = next(iter(d['query']['pages'].values()))['imageinfo'][0]['url']
# → https://upload.wikimedia.org/wikipedia/commons/4/4e/ForgettingCurve.svg
```

**SVG 直接下载（已知直链时）：**
```bash
curl -L --fail --silent --show-error \
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/ForgettingCurve.svg' \
  -o "$DEST/forgetting-curve.svg"
# 直接 curl -L 即可，无需 Referer，SVG 文件通常很小（< 50KB）
```

**关键验证：** 下载后用 `file` 命令确认 MIME type：`SVG Scalable Vector Graphics image` 则成功；返回 `< 1KB` 则说明 URL 错误。

---

## 陷阱记录

- **简化版 vs 完整版的判断**：如果内容只有"定义 + 时间点 + 建议"，走简化版即可，不需要完整版的 method-grid；方法体系 > 10 个时必须走完整版。
- **维基百科词条的"中文名/英文名"**：caption 应包含对照，如 `Forgetting Curve / 遗忘曲线`。
- **interval-grid 移动端**：默认 5 列，720px 以下自动变 2 列，无需手写额外 MQ。