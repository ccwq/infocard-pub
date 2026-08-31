---
name: infocard-blue-technical-manual-style
description: 蓝色技术手册主题的信息卡技能。用于把 Claude Code / Skill / Agent / workflow / 技术拆解类内容切换为黑头标题、红蓝双强调、暖白纸底的高密度技术手册风格，统一章节编号、stats、warning、流程块、代码块与移动端表现。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, blue, red, technical-manual, editorial, ui, theming, agent, workflow]
    related_skills: [any2card, infocard-black-head-style, infocard-green-style, infocard-pub-publisher]
---

# infocard-blue-technical-manual-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

这是技术手册蓝主题，适合 Claude Code / Skill / Agent / workflow 的分层案例与实施手册卡。

核心特征：
- 黑头标题
- 红蓝双强调
- 暖白纸底
- 技术手册骨架
- stats / warning / flow / code 组件完整

## When to Use
- 用户说“蓝色技术手册主题”
- 用户说“技术手册红黑 + 蓝色辅助”
- 用户要 Claude Code / Skill / Agent workflow 拆解卡
- 用户要 **PPT / Office 自动化 / 文档到演示文稿** 这类工作流分享卡
- 用户要 **课程 / 教程 / curriculum repo** 风格的信息卡，尤其是带 lesson 目录、多语言翻译和可运行示例的仓库
- 用户要求把现有卡从 redswiss / warm paper / other theme 重建为蓝色技术手册风

## Retheme rule
A blue-technical-manual migration is a full visual-system rewrite, not a palette swap. Update the hero, section heads, stats, pills, quote blocks, route boxes, skill chips, footer, save button, and metadata together so the first fold reads as a manual rather than a warm poster.

See `references/blue-technical-manual-theme-migration.md` for the compact migration checklist and verification points.

## Incident hardening: theme implementation must be rendered

`meta.style`, `data-theme`, CSS tokens, or expected class names are declarations/checks, not proof of visual success. Before release, render the actual HTML at desktop and 390px and verify the hardblue hierarchy visually: warm-white/grid background, black/red/blue Hero bar, numbered section blocks, bordered cards, readable tables, dark code boxes, and a distinct risk area. A bare white document or mismatched custom class structure is FAIL.

Chinese-first copy is part of the visual/content gate: explanatory UI text, headings, labels, warnings, and source notes should be Chinese; retain English only for proper names, commands, APIs, parameters, and necessary technical terms.

## ⚠️ Universal rebuild rule — applies to ALL infocard style work

When user says "重建 / rebuild / 样式有问题 / fix style" on an existing infocard HTML, the correct approach is **from-scratch rebuild**, NOT patch.

**Why patching fails:**
Patching broken or mis-structured HTML causes structural cascades — unclosed divs compound across sections, fix-on-patch creates broken sections that require more patches, eventually the file is worse than the original. This happened in-session with `20260708-harness-self-improv.html` where a failed patch left the MCE card with orphaned open divs, broken into multiple conflicting patches.

**Correct rebuild sequence:**
1. `read_file` the corresponding `theme/<name>.html` template in full — all CSS classes and component styles
2. Write a fresh, complete HTML from scratch using the template's CSS skeleton — do NOT read the broken target file first
3. Preserve all original content (source data, keywords, section structure) from user input or existing file content
4. Write the new HTML to replace the old one
5. Verify HTML structure (unclosed tags, `div` balance) before build
6. Run `npm run build` → `git add + commit + push`
7. CI/CD verify: HTTP 200 + keyword check

**When this rule does NOT apply:** minor factual corrections (adding a missing keyword, updating a timestamp, fixing a broken link) — these are safe patches. Style/layout breakage always requires full rebuild.

## Chinese-first 文案规则（新增）

当信息卡面向中文读者，默认文案必须以中文为主，不要把英文当成默认展示语言。

执行规则：
- 先用中文写标题、摘要、章节名、说明句、按钮、标签、风险提示。
- 仅保留以下几类必要英文：
  - 人名 / 产品名 / 项目名 / 仓库名
  - 不宜硬翻的接口名、命令名、文件名、参数名
  - 为了保持来源可追溯而必须出现的原术语
- 如果用户明确指出“未遵守母语中文约定”或“减少非必要英文”，要把公开卡面的英文标签进一步收缩，只保留必要术语；不要把整张卡做成中英混杂的半翻译态。
- 蓝技手册风尤其要避免以下位置出现无必要英文堆积：
  - hero tagline
  - stats 标签
  - section label
  - flow / route / skill chip 文案
  - footer 来源说明与按钮
- 当来源是 coding-agent / docsified handbook / e-book 时，优先把“分步教程、源码对照、章节结构、实践路径”放进首屏，避免把封面做成营销海报。
- 这类卡的 hero 优先级通常是“页面结构截图 > 纯 logo / banner”。如果截图里有侧栏目录、章节列表和终端示例，那往往比品牌图更适合当 hero 证据。
- 验收标准：首屏扫读时，中文读者不需要先经过英文标签翻译，仍能直接理解主张；英文只作为专名或证据存在，而不是界面主语言。

## Typography
- 标题强，正文稳，流程清楚
- 正文建议 `14–16px`
- 标签建议 `12–13px`

- When retheming an existing card into the blue technical-manual style, treat blue as the dominant system color and keep warm yellow/paper tones only as minor accents. If browser vision still reads the first fold as warm, the fix order is: page background → hero top bar → pills/badges → section-number blocks → code-box framing → only then typography.
- If the page is meant to look like a manual or technical guide, prefer black-head labels, cold blue dividers, and blue-white surfaces; do not let parchment or golden gradients dominate the hero area.
- For style-conversion work, preserve the full content bundle unless the user explicitly asks to add/remove material. Use a visible-text proxy (headline count / section count / approximate text length) before and after the rewrite so the card does not silently get thinner.
- Browser-vision verification should answer a single question: does the first fold now read as blue technical manual rather than warm paper? If not, keep tuning color hierarchy before declaring success.

## Resource-pack cards
当开源仓库是“资源包”而非单一 demo 时，卡片结构应显式覆盖：
- code / entrypoints
- weights / checkpoints
- cases / examples
- demo / UI
- benchmark / arena / evaluation assets

## Mobile reflow / 390px 验收

蓝技手册类卡片在移动端不要只靠缩字号硬扛。若 390px 视口里出现以下任一情况，就应先改结构再验收：
- 四列对比表过窄、频繁换行
- 固定定位的保存/下载按钮遮挡正文
- 流程图横向排列导致卡片边缘挤压

推荐做法：
1. 将多列表格改成纵向堆叠的工具卡 / key-value 列表
2. 把 CTA 从 `position: fixed` 改为文末正常流按钮，避免覆盖正文
3. 再跑 390px 浏览器检查，确认 `scrollWidth <= innerWidth` 且按钮不遮字

相关细节见 `references/mobile-cta-and-table-reflow.md`。

## CSS Token System
蓝技手册使用以下 CSS 变量体系（重建时必须完整应用，不能省略）：

```css
:root {
  --black:   #0a0a0a;   /* 主背景/外框 */
  --white:   #f5f2ec;   /* 页面底色（暖白） */
  --red:     #c8102e;   /* 结论/警示/章节编号竖条 */
  --blue:    #0036a3;   /* 系统/配置/流程主色 */
  --green:   #006b3c;   /* 记忆/持久化 */
  --yellow:  #e8c200;   /* 警告/注意事项 */
}
```

## Structural Skeleton
蓝技手册的技术手册骨架（重建时必须包含全部组件）：

```
.header    — 黑头标题，红渐变三栏（H1/副标题/标签行）
.stats     — 四列数字锚点（repos / skills / plugins / stars）
.warning   — 红竖条警告框（上手前提/依赖/边界）
.section   — 编号章节（01 / 02 …），章节标题左红竖条
.flow      — 横向 SVG 流程图（深色底，彩色节点）
.code-box  — 深灰背景代码块，Mono 字体
.grid2     — 双列网格（适合"适合 / 不适合"对照）
.box       — 普通强调框
.footer    — 灰底来源行 + 保存按钮
```

## grid2 列宽被 stealth 扩展覆盖（高优先级修复）

蓝技手册的 `.grid2`（双列卡片）和 `.fit-grid`（适合/不适合）容器在 Hermes Browserbase 会话中可能被 stealth 扩展注入 `grid` 简写覆盖，导致列宽不等（如 80px vs 275px 而不是 178px 178px）。

这两项（inline style on grid2 div + min-width:0 on .box）同时应用才能保证列宽真正等分。

**根因说明**：stealth 扩展注入的 `grid` 简写覆盖了 `display` 属性本身，只压制 `grid-template-columns` 是不够的，必须同时压制 `display` 和 `gap`。

**必须在 div 上同时加三行 `!important` 内联样式**：
```html
<div class="grid2" style="display: grid !important; grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; gap: 8px !important;">
```
同样适用于所有自定义 grid 类（如 `.img-row-2`、`.gallery-row.row-2` 等）。

**验收**：390px 视口下 `getComputedStyle(grid2).gridTemplateColumns` 应为 `178px 178px`（等分），所有 grid 行 left=13, right=377 完全对齐。

**同步修复 `.box` 元素**：为了让 grid 列不受内容 min-width 影响，还需给 `.box` CSS 加：
```css
.box {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
```

## .img-gallery — 图片画廊（蓝技手册插图标准结构）

### CSS

```css
/* ── 图片画廊 ── */
.img-gallery { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.gallery-row { display: grid; gap: 8px; }
.gallery-row.row-1 { grid-template-columns: 1fr; }
.gallery-row.row-2 { grid-template-columns: 1fr 1fr; }
.gallery-row.row-3 { grid-template-columns: 1fr 1fr 1fr; }
.gallery-item { background: #f5f2ec; border: 1px solid var(--gray-5); overflow: hidden; }
.gallery-item img { width: 100%; height: auto; display: block; border: none; }
figure { margin: 0; }  /* 防止浏览器默认 figure margin 破坏 caption 对齐 */
.gallery-caption { padding: 4px 8px; font-size: 10px; color: var(--gray-6); margin-top: 4px; line-height: 1.4; text-align: left; }
.gallery-caption strong { color: var(--blue); font-weight: 700; }
```

### HTML 结构

```html
<section class="section">
  <div class="sec-head">
    <div class="sec-no" style="background:var(--blue);">📷</div>
    <div class="sec-title">
      <h2>配图说明：工作流架构与实操界面</h2>
      <p>来源：XXX · CC 4.0 BY-SA 协议</p>
    </div>
  </div>
  <div class="img-gallery">
    <!-- 单行大图（主图） -->
    <div class="gallery-row row-1">
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/main-diagram.png"
             alt="描述"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
             loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠ 图片加载失败</div>
        <div class="gallery-caption"><strong>图1：标题</strong><br/>图内要点说明</div>
      </div>
    </div>
    <!-- 双列图片 -->
    <div class="gallery-row row-2">
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/diagram-a.png" alt="描述" loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠</div>
        <div class="gallery-caption"><strong>图2：标题A</strong><br/>说明A</div>
      </div>
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/diagram-b.png" alt="描述" loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠</div>
        <div class="gallery-caption"><strong>图3：标题B</strong><br/>说明B</div>
      </div>
    </div>
  </div>
</section>
```

### 图片压缩（本地化 + 降体积）

**PNG / WebP 截图压缩**（>500KB 时必须压缩）：
```bash
python3 -c "
from PIL import Image
im = Image.open('src.png').convert('RGB')
im_resized = im.resize((1200, int(im.height*(1200/im.width))), Image.LANCZOS)
im_resized.save('out.webp', 'WEBP', quality=85, method=6)
"
```
→ 6.5MB 截图可压到 ~120KB (1200px wide, WEBP)

**GIF 压缩**（>1MB 时必须压缩）：
```bash
python3 << 'EOF'
from PIL import Image
import os

def compress_gif(src, dst, max_w=600, max_frames=16, duration_mult=3):
    im = Image.open(src)
    w, h = im.size
    ratio = min(1.0, max_w / w)
    nw, nh = int(w * ratio), int(h * ratio)
    base_dur = im.info.get('duration', 100)
    scaled_dur = max(80, base_dur * duration_mult)

    frames, step = [], max(1, im.n_frames // max_frames)
    try:
        for idx in range(0, im.n_frames, step):
            im.seek(idx)
            frames.append(im.copy().resize((nw, nh), Image.LANCZOS))
    except EOFError:
        pass

    if frames:
        frames[0].save(dst, save_all=True, append_images=frames[1:],
                       loop=0, duration=scaled_dur, optimize=True)
        print(f'{dst}: {nw}x{nh}, {len(frames)} frames, {os.path.getsize(dst)//1024}KB')
EOF
```
→ 5.5MB GIF 可压到 ~2MB (600px, 16帧)。`max_frames=16` 和 `duration_mult=3` 在体积和质量间平衡。

**注意**：PIL `im.n_frames` 访问前必须先 `im.seek(0)` 初始化帧迭代器；`im.copy()` 是必须的（直接 `im.resize()` 会修改原对象）；`duration_mult` 放大帧间隔，`max(80, ...)` 防止帧间隔低于 80ms（浏览器限制）。

### 图片获取标准流程

**⚠️ 先判断图片来源类型，再决定从哪提取**

| X 帖类型 | 图片在哪 | 处理策略 |
|---|---|---|
| 帖子内有嵌入图片/视频 | X 帖子本身 | `browser_get_images()` → 提取 URL → 下载本地化 |
| 帖子只是引用 GitHub/博客 | **GitHub `docs/assets/`、`web/public/`、`assets/`** 或原博客 | 先找 `docs/assets/`、`web/public/`、`README assets` 目录，再下载 |
| 帖子引用项目 demo | 项目的 live demo 站 | 访问 `username.github.io/repo/` 或 `imcuttle.github.io/flipbook-app` 找图 |

**判断方法**：当 `browser_get_images()` 返回空、`browser_console` 遍历 `article img` 也找不到大图（>200px），且 X 帖正文是 GitHub 链接或项目介绍时，默认图片在 GitHub 仓库而非 X 帖子本身。

**标准提取步骤（X → GitHub repo 型）**：

1. 从 X 帖提取 GitHub URL（如 `github.com/imcuttle/flipbook-app`）
2. 访问 `https://github.com/{user}/{repo}/tree/main/docs/assets`（或其他常见 assets 目录）
3. 找 `.png`、`.gif`、`.webp` 文件，下载到 `docs/assets/images/YYYYMMDD-slug/`
4. 本地化后引用，**不要**直接热链 GitHub raw URLs（可能被限流）

**PNG/WebP 截图压缩**（>500KB 时必须压缩）：
```bash
python3 -c "
from PIL import Image
im = Image.open('src.png').convert('RGB')
w, h = im.size
im_resized = im.resize((1200, int(h*(1200/w))), Image.LANCZOS)
im_resized.save('out.webp', 'WEBP', quality=85, method=6)
print(f'{1200}x{int(h*(1200/w))} -> {os.path.getsize(\"out.webp\")//1024}KB')
import os
"
```
→ 6.5MB 截图可压到 **~120KB**（1200px 宽，WEBP），质量损失肉眼不可见。
**推荐优先用 WebP** 而非 PNG，体积差距通常 20-50 倍。

**GIF 压缩**（>1MB 时必须压缩）：
```bash
python3 << 'EOF'
from PIL import Image, os

def compress_gif(src, dst, max_w=600, max_frames=16, duration_mult=3):
    im = Image.open(src)
    ratio = min(1.0, max_w / im.size[0])
    nw, nh = int(im.size[0]*ratio), int(im.size[1]*ratio)
    base_dur = im.info.get('duration', 100)
    frames, step = [], max(1, im.n_frames // max_frames)
    try:
        for idx in range(0, im.n_frames, step):
            im.seek(idx); frames.append(im.copy().resize((nw,nh), Image.LANCZOS))
    except EOFError: pass
    if frames:
        frames[0].save(dst, save_all=True, append_images=frames[1:],
                       loop=0, duration=max(80, base_dur*duration_mult), optimize=True)
        print(f'{dst}: {nw}x{nh}, {len(frames)} frames, {os.path.getsize(dst)//1024//1024}MB')
compress_gif('demo.gif', 'demo_compressed.gif')
compress_gif('woodpecker.gif', 'woodpecker_compressed.gif')
EOF
```
→ 5.5MB GIF 可压到 **~2MB**（600px，16帧，duration×3）。

**⚠️ PIL 循环超时陷阱**：大 GIF（如 5.5MB）用 `for idx in range(0, im.n_frames, step)` 循环时，如果帧数很多（>100帧）且 step 很小，`im.seek()` 会逐帧初始化帧迭代器，导致命令超时。`max_frames=16` 通过增大 step（`im.n_frames // 16`）来大幅减少循环次数，是必须的。`im.copy()` 是必须的，直接 `im.resize()` 会修改原对象。

**PIL `im.n_frames` 陷阱**：必须在第一次 `im.seek(0)` 之后才能正确读取 `im.n_frames`，否则值可能为 0 或不准确。安全写法是先 `try im.seek(0)` 再访问 `im.n_frames`。

**注意**：PIL `im.n_frames` 和 `im.seek()` 需先调用一次 `im.seek(0)` 初始化帧迭代器，否则报错。`im.copy()` 是必须的，直接 `im.resize()` 会修改原对象。

**本地化**：下载到 `docs/assets/images/YYYYMMDD-card-slug/` 再引用，**不要**直接引用外部 URL
**下载命令**：`curl -sL -o filename.png -H "User-Agent: Mozilla/5.0" '<url>'`
**先压缩再 commit**：大图（>500KB PNG、>1MB GIF）必须先压缩再提交，避免仓库膨胀
**验收**：`curl -sI '<pages-url>/docs/assets/images/...'` 返回 HTTP 200；`browser_console` 确认 `img.complete && img.naturalWidth > 0`
**onerror 处理**：每个 `<img>` 必须有 `onerror` + 备用 caption，防止单图失败破坏整卡

### 布局原则

- `row-1` 单行大图放对比图/架构图；`row-2` 双列放概念图或截图对；可混合使用
- caption 必须包含：图号 + 标题 + 图内关键信息（不描述图片质量）
- 来源说明放在 section 标题副文本里（如"来源：CSDN · CC 4.0 BY-SA"）
- 移动端全部降级为 `grid-template-columns: 1fr`

## Browser CDP target_id 路由（多标签页必读）

当浏览器有多个标签页时，CDP 方法调用必须指定 `target_id`，否则报错 `-32601 'xxx' wasn't found`。

**标准诊断序列**：
```javascript
// Step 1: 获取所有标签页
browser_cdp(method='Target.getTargets', params={})
// → 返回 targetInfos[]，找 url 匹配当前页面的 targetId

// Step 2: 用该 targetId 调用页面级方法
browser_cdp(method='Emulation.setDeviceMetricsOverride',
           params={...},
           target_id='<matched_targetId>')
```

**常见报错**：
- `Emulation.setDeviceMetricsOverride wasn't found` → 未指定 `target_id` 或指定了错误的 tab
- 解决方法：重新调用 `Target.getTargets`，找当前 URL 对应的 `targetId`

**验收**：`browser_console` 返回值中 `scrollWidth` = 390，`header` computed `background` 为红渐变时即 PASS。

**⚠️ Emulation 方法必须指定 `target_id`**：`Emulation.setDeviceMetricsOverride` 等页面级方法报错 `-32601 'xxx' wasn't found` 时，原因通常是未指定或指定了错误的 tab。标准诊断序列：先用 `Target.getTargets` 获取所有标签页列表，再从返回的 `targetInfos[]` 中找 URL 匹配当前页面的 `targetId`，用该 ID 作为 `target_id` 参数重新调用。

## Rebuild vs Template-Replacement（2026-06-07 教训固化）
⚠️ **"重建"≠"换皮"**：当用户要求"用蓝技手册风格重建"时，必须：
1. 从零开始使用本技能的 CSS token 系统和 structural skeleton
2. 不能从其他卡片（如 `20260606-open-design.html`）复制 HTML 骨架后改颜色
3. 必须包含 `.card`（红色 3px 外框）、`.header`（红渐变黑头）、`.stats`、`.section` 编号红线、`.code-box`、`.flow` 等完整组件
4. 重建完成后，用 live browser 验收确认：第一屏读感是蓝技手册（黑头红渐变 + 暖白纸底），不是旧模板

**验收标准**：390px 无横向溢出；header 背景 = `#c8102e` 红渐变；首屏可见 stats + warning。

**⚠️ 插图必须嵌入**：当来源内容（X 帖、GitHub README、技术文章）有配图/插图时，必须：
1. 下载到 `docs/assets/images/YYYYMMDD-card-slug/` 本地化
2. 以 `.img-gallery` 结构（见上方标准结构）嵌入信息卡
3. 不能只靠文字描述；配图是内容的一部分，用户会说"存在很多插图也需要合并到信息卡之中 这个工作之前没做"
4. 插入位置：通常在 pattern-grid / scenario-list 之后、fit-grid 之前，作为独立编号 section

**图片来源判断优先级**：
| 来源类型 | 图片在哪 | 处理策略 |
|---|---|---|
| X 帖本身含嵌入图 | X 帖子本身 | `browser_console` 遍历 `article` → 下载 → 本地化 |
| 帖子引用 GitHub/博客 | **GitHub `docs/assets/`、`web/public/`、`README assets`** 或原博客 | 访问 GitHub assets 目录找图 |
| 帖子引用项目 demo | 项目的 live demo 站 | 访问 `username.github.io/repo/` 找图 |

**标准提取步骤（X → GitHub repo 型）**：
1. 从 X 帖提取 GitHub URL（如 `github.com/imcuttle/flipbook-app`）
2. 访问 `https://github.com/{user}/{repo}/tree/main/docs/assets`（或其他常见 assets 目录）
3. 找 `.png`、`.gif`、`.webp` 文件，用 browser_cdp 提取 img src → `curl -sL` 下载本地化
4. 本地化后引用，**不要**直接热链 GitHub raw URLs（可能被限流）

## Session reference
- `references/resource-pack-pattern.md` — 资源包卡结构、移动端减噪规则和验收清单
- `references/blue-technical-manual-css-skeleton.md` — 完整 HTML/CSS 骨架参考（重建时从此文件复制基础结构）

## Naming
中文名：**蓝色技术手册主题**
别名：蓝技手册风、红蓝技术手册风

## Active theme adapter contract

This package implements `infocard-theme-contract@1` as a visual-only adapter. Earlier generic authoring, browser verification and publishing instructions are deprecated compatibility guidance; the core authoring, quality and delivery stages own them.
