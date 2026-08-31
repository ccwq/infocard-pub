# Wikipedia URL → 信息卡工作流（修订版 2026-06-15）

## 触发条件
用户提供了 Wikipedia URL + "发布信息卡"，可能附带图片说明风格方向。

## 完整工作流

### 1. Wikipedia API 优先读取
用户给了 Wikipedia URL，直接用 API 取原文，不走 general search：

```bash
curl -sL --max-time 15 \
  "https://zh.wikipedia.org/w/api.php?action=query&titles={slug}&prop=revisions&rvprop=content&format=json&rvslots=main"
# 提取内容
python3 - <<'PY'
import json,sys
d=json.load(sys.stdin)
content=list(d['query']['pages'].values())[0]['revisions'][0]['slots']['main']['*']
print(content[:5000])
PY
```

英文版：
```bash
curl -sL "https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=revisions&rvprop=content&format=json&rvslots=main"
```

### 2. 补充搜索（次要）
Wikipedia 内容覆盖基本生平 + 主要事件后，用 general search 补充：
- 中文搜索：搜"尼亚佐夫 + 奇葩政策/个人崇拜/禁令"找中文媒体报道
- 英文搜索：搜"Niyazov banned word / golden statue / Ruhnama"找英文细节

### 3. 风格参考图处理规则（纠正版 2026-06-15）

**核心原则：用户提供的图 = 风格参考，不混入卡内容。**

当用户发图并说"包含这两张图 不是其他"时，这张图的定位是**风格参考**（指导 CSS/排版方向），不是卡内容的一部分。

**判断逻辑：**
| 用户意图 | 处理方式 |
|----------|----------|
| 用户图含该人物真实照片/现场图 | 判断为内容来源 → 本地化后嵌入 HTML |
| 用户图是其他项目的 UI 截图/流程图/示意图 | **风格参考** → 不嵌入内容 |
| 用户明确说"参考这个风格" | 风格参考 → 不嵌入内容 |

**典型错误（2026-06-15 实录）：**
用户发了两张图：RD-Agent 量化金融流水线图 + Agent Skills 开发流程图，配合"调查此人做过的奇葩事"。Agent 将两张图嵌入尼亚佐夫信息卡的内容 section，用户纠正："不收风格参考就是加入内容"。

**正确处理步骤：**
1. 图片已缓存到 `/home/ccwq/hehome/hermes-data/image_cache/`
2. **不复制到 `docs/assets/images/`**
3. **不在 HTML 中引用**
4. **不写入 `.meta.yaml` 的 `images` 字段**
5. 纯风格参考用 memory 记录即可

**恢复流程（当错误嵌入后被纠正）：**
```bash
# 1. 删除图片目录
rm -rf docs/assets/images/{slug}/
# 2. 从 HTML 删除 <img src="assets/images/..."> 区块
# 3. 从 meta.yaml 删除 images: 字段
# 4. rebuild
npm run build
# 5. git add + commit + push
git add -A
git commit -m "Remove reference images from {card} - style refs only"
git push
```

### 4. 奇葩事信息卡结构模板
对于"人物奇葩事"类信息卡，推荐 redswiss 风格：
- `topbar-hero`：姓名 + 别名 + 生卒年 + 执政时长
- `topbar-meta`：2行元数据格（核心标签 + 国家/资源/分类 pill）
- 禁令/奇葩事 section：用 ban-item 列表（ban-icon 色块 + 标题 + 描述）
- 个人崇拜体系 section：3列 card 网格
- 时间线 section：双栏时间线
- 死后遗留 section
- **无参考图 section**（除非用户提供的是真实内容图）

## 坑点
- **不要先 general search 再读 Wikipedia**：用户明确给了 Wikipedia URL 时，先读 API 获取一手内容，再用搜索补充。
- **风格参考图 ≠ 内容图**：混入后需删除 + rebuild + 重新 commit，浪费时间。
- **git add 资产目录**：如果确实需要嵌入图片（含子目录的图片资产）必须显式 `git add docs/assets/images/{slug}/`，否则 Pages 404。