# Wikimedia 图片下载：浏览器优先工作流 + SVG 自我回退

## 核心结论（2026-06-22 更新 — 环境级封锁已确认）

Wikimedia 对 curl 直链访问做了多层级限流，**且当前 agent 环境（无住宅代理）已触发全局封锁**：所有 curl 直链（无论 thumb URL、原始 SVG、带不带 Referer/UA、`--noproxy '*'`）均返回 **~2000 字节的 HTML 错误页**，HTTP 状态码看起来正常，文件用 `ls` 看也"有内容"，必须用 `file <path>` 才能识破：

```bash
file docs/assets/<slug>/image.png
# 真实图片: "PNG image data" / "SVG Scalable Vector Graphics"
# 伪装错误页: "HTML document, ASCII text, with very long lines"
```

**触发该陷阱的检查清单（必做）**：
1. `curl` 下载后立刻 `file <path>` 验证类型
2. 若返回 `HTML document`，**不要继续重试不同 URL 变体**——直接切换到 SVG 自绘回退
3. `ls -la` 仅看大小不够：2007 字节看起来合理，但实际是 Wikimedia 错误页

| 响应大小 | 含义 | 处理 |
|---|---|---|
| ~1928-2007 bytes | Wikimedia 错误页（403 / Rate Limited / 全局封锁） | 删除并切到 SVG 自绘 |
| 0 bytes | 连接拒绝 / 网络问题 | 等几秒重试 |
| > 5 KB + file=PNG/SVG | 真实图片 | 使用 |

## 唯一可靠方案：SVG 自绘回退（2026-06-22 确认）

当 curl + browser CDP 提取均失败时，**用内联 SVG 自绘示意图代替**：

1. 用 `write_file` 在 `docs/assets/<slug>/<name>.svg` 写入完整 SVG
2. SVG 必须包含 `<title>` 和 `<desc>` 满足可访问性，`<img>` 标签必须有清晰中文 `alt`
3. caption 必须如实标注图源：如果是等距示意图，不能沿用 "Marching Cubes 渲染" 之类外链图片的原说明——caption 与图实际内容必须对齐
4. SVG 自绘适合科普卡（图的作用是"帮助理解概念"，不是"展示原始数据"）；不适合需要真实摄影 / 历史图像的卡

### 示例：体素立方体等距投影 SVG（科学普及卡）

`/home/ccwq/qbox/opendir/project/infocard-pub/docs/assets/20260622-voxel/voxels-cube.svg`：用 isometric polygon（top / left / right 三面菱形）堆叠成 3×3×3 + 上层方块，高亮单个体素并用引线标 "1 voxel"，配 x/y/z 三轴箭头。9 KB，浏览器直接渲染。

## 不可靠的备选尝试（2026-06-22 全部失败）

以下方法均产生伪装成图片的 2000 字节错误页，**不再值得尝试**：

1. ❌ curl + `Referer: https://en.wikipedia.org/` header
2. ❌ curl + `--noproxy '*'` + 完整 User-Agent
3. ❌ 原始 SVG 文件（不带 `/thumb/` 前缀）
4. ❌ 不同 thumb 尺寸（256px / 512px / 960px）
5. ⚠️ `browser_cdp` 提取 img URL：URL 能拿到，但 curl 下载仍被限流

## 历史背景：原始浏览器优先工作流（部分仍可用）

`browser_cdp` 加载 Wikipedia 词条 → `Runtime.evaluate` 提取 `img[src*="upload.wikimedia.org"]` 数组，这一步**仍然可用**。但下载步骤（curl 带 Referer）在 2026-06-22 已不再可靠。

## Wikimedia 多层级限流（历史观察）

- `upload.wikimedia.org/wikipedia/commons/thumb/.../500px-xxx.svg.png` → **403 / 1928 字节错误页**
- `upload.wikimedia.org/wikipedia/commons/.../xxx.svg`（原始文件路径）→ **有时成功，有时 403**

**当前环境（2026-06-22）**：两条路径均失败。直接走 SVG 自绘回退。

## 工作流（确定性版本）

### 步骤 1：在浏览器 CDP 中打开 Wikipedia 词条

```javascript
// browser_cdp target_id=你的CDP_target_id
Runtime.evaluate
expression: "[...document.querySelectorAll('img')].filter(i=>i.src.includes('upload.wikimedia')&&!i.src.includes('logo')).map(i=>i.src).slice(0,8)"
returnByValue: true
```

### 步骤 2：找到合适的图片 URL

选择标准：
- `.../thumb/.../500px-...` 是安全的 500px 缩略图
- `.../thumb/.../960px-...` 是大图（质量更好）
- 不要选 Wikipedia UI 元素图片（logo.svg, Commons-logo.svg 等）

### 步骤 3：用 curl 下载

```bash
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
REF="https://en.wikipedia.org/"
DEST="docs/assets/images/<slug>/"

curl -sL --max-time 15 \
  -A "$UA" \
  -H "Referer: $REF" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Dragon_curve_iterations_%282%29.svg/960px-Dragon_curve_iterations_%282%29.svg.png" \
  -o "$DEST/dragon.png"

# 验证
sz=$(stat -c%s "$DEST/dragon.png")
[ "$sz" -gt 5000 ] && echo "OK: ${sz}B" || echo "FAIL: ${sz}B"
```

### 步骤 4：批量处理

```bash
do_one() {
  name=$1; url=$2; dst=$3
  sz=$(stat -c%s "$DEST/$dst" 2>/dev/null || echo 0)
  if [ "$sz" -gt 5000 ]; then
    echo "SKIP $name: ${sz}B"
  else
    curl -sL --max-time 15 -A "$UA" -H "Referer: $REF" "$url" -o "$DEST/$dst"
    sz=$(stat -c%s "$DEST/$dst" 2>/dev/null || echo 0)
    [ "$sz" -gt 5000 ] && echo "OK $name: ${sz}B" || { echo "FAIL $name: ${sz}B"; rm -f "$DEST/$dst"; }
  fi
}
```

## Wikimedia 限流特征表（已确认）

| 响应大小 | 含义 | 处理 |
|---|---|---|
| ~1928 bytes | Wikimedia 403 / Rate Limited | 放弃，换方案或等几分钟 |
| 0 bytes | 连接拒绝 / 网络问题 | 等几秒重试 |
| > 5 KB | 真实图片 | 使用 |
| ≤ 5 KB | 错误页 | 删除文件并换方案 |

## 备选方案：SVG 原始文件直链

当 thumb URL 失败时，尝试下载不带 `/thumb/` 前缀的原始文件：

```bash
# Levy C curve SVG 原文件（69 KB）→ 成功
# 但 thumb URL（/thumb/.../500px-...）→ 403

curl -sL --max-time 15 \
  -A "$UA" -H "Referer: $REF" \
  "https://upload.wikimedia.org/wikipedia/commons/1/1e/Levy_C_Curve.svg" \
  -o levy_c.svg
```

注意：SVG 原始文件有时可用，有时也被限流。无规律，不可靠，只能作为尝试项。

## 已测试可用的 Wikipedia 词条图片列表

| 曲线 | Wikipedia 词条 | 可用图片 |
|---|---|---|
| Dragon curve | `en.wikipedia.org/wiki/Dragon_curve` | iteration SVG, paper strip PNG |
| Gosper curve | `en.wikipedia.org/wiki/Gosper_curve` | curve 4 SVG (500px), Gosper Island SVG |
| Sierpinski curve | `en.wikipedia.org/wiki/Sierpinski_curve` | Arrowhead 1-6 PNG (500px) |
| Lévy C curve | `en.wikipedia.org/wiki/Lévy_C_curve` | Construction PNG, Levy C SVG (原始直链) |
| Z-order / Morton | `en.wikipedia.org/wiki/Z-order_curve` | Z-curve45 SVG (500px) |
| Moore curve | `en.wikipedia.org/wiki/Moore_curve` | Moore-curve-stages PNG |
| Koch snowflake | `en.wikipedia.org/wiki/Koch_snowflake` | KochFlake SVG (500px), Kochsim GIF |
| Sierpiński triangle | `en.wikipedia.org/wiki/Sierpiński_triangle` | evolution SVG (500px) |
| Pythagoras tree | `en.wikipedia.org/wiki/Pythagoras_tree_(fractal)` | Colored PNG (500px) |

## 浏览器工具差异

| 工具 | 是否可用 | 说明 |
|---|---|---|
| `browser_navigate` | ⚠️ 依赖 node | 系统无 node 时失败 |
| `browser_cdp` | ✅ 可用 | 推荐，用 `Page.navigate` + `Runtime.evaluate` |
| `browser_vision` | ⚠️ 依赖 node | 系统无 node 时失败 |

**推荐组合**：`browser_cdp(Page.navigate)` 加载页面 + `Runtime.evaluate` 提取 URL + `terminal(curl)` 下载文件。

## 坑：浏览器 CDP target 复用问题

同一个 `target_id` 可连续导航多个 Wikipedia 词条，无需重新连接。每次 `Page.navigate` 后等 `loaderId` 出现再执行 `Runtime.evaluate`。

但 subagent 模式中 CDP 容易超时（600s），适合手动单张处理，不适合 subagent 批量。