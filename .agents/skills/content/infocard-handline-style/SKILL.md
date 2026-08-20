---
name: infocard-handline-style
description: 手绘便签 / 白板草图风信息卡主题。适合把复杂工作流、并行调度、方法论与策略拆成像手绘草图一样直观的知识图。可允许使用第三方手绘风前端框架（如 rough.js / hand-drawn SVG 工具链）来增强线条抖动与草稿感，但主题约束必须由本 skill 统一定义。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, hand-drawn, sketch, workflow, theme, svg]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher]
---

# infocard-handline-style

## Overview

`infocard-handline-style` 是一套“手绘草图 / 白板便签 / 纸上讲解”风格的信息卡主题。

它不是极简科技风，也不是严肃技术手册风，而是用“手写笔触 + 草图框线 + 便签 + 流程箭头 + 中心隐喻图”把复杂概念讲得像在白板前边画边解释。

这套主题最适合：
- 并行调度、编排、工作流
- 方法论拆解、策略图、流程图
- 技术博客分享、Recent Articles 导读、内容入口地图
- 复杂系统的“视觉隐喻 + 分层说明”
- 需要降低说教感、增强亲和力的知识图

## Use Cases

### 适合
- AI agent 工作流
- 多项目并行与 orchestration
- 提示词 / 方法论 / 教程
- 产品策略拆解
- 个人知识管理图解
- 让复杂概念“像手绘笔记一样”易读的内容

### 不适合
- 法律、财务、合规等需要强正式性的内容
- 纯数据密集报表
- 需要极简品牌感或强科技感的页面
- 必须严格网格化、工业化、冷感的系统说明

### 典型触发词
- 手绘
- 草图
- 便签
- 白板
- 指挥 / 调度 / 并行
- 工作流图
- 讲解图
- sketch
- doodle
- hand-drawn

## Design DNA

### 核心气质
- 像在米黄色纸张上用黑笔和橙笔快速讲解
- 有“草稿未完工”的亲和力，但信息结构必须清楚
- 视觉中心通常是一个隐喻图，而不是一堆文字
- 文字是解释隐喻，不是替代隐喻
- 风格关键词：whiteboard / doodle / sketch / sticky note / workflow map / orchestration diagram

### 视觉母题
这套主题优先吸收三类图像母题：
1. **对话驱动的工作流图**：左侧聊天窗口 + 中央步骤图 + 底部总结句，强调“你发一个 prompt，系统替你调度”。
2. **代码到运行结果的三段式图**：设计原型 → 代码实现 → 模拟器/部署结果，强调“草图、实现、验收”三步闭环。
3. **Before / After 技能系统图**：技能创建模板 → 安装/调用 → 实际运行效果，强调“从 prompt 到可复用 skill”的转化。

### 视觉原则
1. 先有一个中心隐喻，再展开说明。
2. 使用少量强调色，主色永远是黑/米白，橙色只负责引导视线。
3. 所有线条都应该带一点“手写抖动”或“笔刷毛边”，避免几何完美。
4. 模块之间保持明显的手工分隔感，不追求过度精致。
5. 节奏上要像“边画边讲”，不是像工业产品页。
6. 视觉层级优先于装饰密度：标题、流程、便签、注释必须一眼分明。
7. 允许局部使用手绘 SVG / rough.js 之类第三方框架，但它们只能增强“笔触感”，不能替代结构设计。
8. **禁止全页过度规整**：handline 不应像 dashboard 或组件文档。主模块允许存在轻微错位、尺度不完全一致、手工留白节奏变化，但阅读顺序必须稳定。
9. **必须存在批注层**：除正文层外，至少要有一层“批注 / 圈点 / 箭头 / 划线 / 贴纸注释”来制造思考痕迹，不能只靠印刷体内容块完成页面。
10. **中心隐喻必须压过说明卡片**：首屏最强视觉锚点应是手绘隐喻图或流程草图，而不是右侧说明框或整齐卡片阵列。

## Color Tokens

```css
:root {
  --bg: #f5efe6;
  --paper: #fbf6ee;
  --ink: #2d2926;
  --muted: #6b6258;
  --line: #2f2a27;
  --accent: #e67e22;
  --accent-dark: #d35400;
  --note: #fff3df;
  --note-line: #b57a43;
}
```

### 使用规则
- `--bg`: 整体纸张底色
- `--paper`: 卡片/便签浅底
- `--ink`: 主文字与主轮廓
- `--muted`: 辅助说明
- `--line`: 框线、箭头、分隔线
- `--accent`: 箭头、标题强调、重点标注
- `--accent-dark`: 更强的橙色高亮
- `--note`: sticky note 背景
- `--note-line`: 便签边缘与贴纸辅助线
- **正文颜色分层必须克制**：正文主文默认用 `--ink` 的柔化深墨版本（接近 #3a342e ~ #4a433b），避免纯黑大段文字压得太硬；只有标题、关键短标签、极短结论才用最深墨色。
- **线条颜色分层**：主骨架线用 `--line`；次级分组线、虚线、批注连接线应降到更浅、更暖的墨褐色，不要整页所有线都同一黑度。
- **线条粗细也必须分层**：主骨架线最稳，次级线更细，虚线更轻，禁止所有边框使用同一 stroke weight。
- **橙色只做点状强调**：优先用于箭头、圈点、虚线高亮框、批注标签、手绘下划线；默认不应用作大面积主背景。
- **边框颜色底线（强制）**：所有结构性边框颜色必须 ≥ `#2c2723`（深墨褐），禁止使用 `#d0c8be`、`#c0b8a8` 等浅色作为 topbar 底边、footer 边框、section 分隔线等任何结构性线条；浅色边框在米纸底上无法形成视觉锚点，必须替换为深墨褐。
- **参考图色值（2026-06-12 实测）**：
  - 标题纯黑：`#171513` 或 `#181614`
  - 正文深灰：`#2d2926` 或 `#2c2723`
  - 辅助灰：`#5a5248` ~ `#6b6258`
  - 蓝色强调：`#1e5cb5`（非浅蓝）
  - 土橘背景：`#c99d78` ~ `#b07b51`
  - 深色块：`#111111`（纯黑背景）
  - 边框：`#2c2723`（不淡、不灰）
  - **底线：边框绝不能是 `#d0c8be` 这类浅色；在纸张底上必须足够深才能成为视觉锚点。**
- chip / label 的目标是“单层外框”，不是“双层边框的壳”。
- 若截图出现内壳或右下角双线，先检查 rough-box / SVG path 的叠线与角部处理，再动 chip CSS。
- chip 填充尽量向纸色靠拢；避免独立色块把边框变成一个内部容器。
- 除非视觉验收证明没有双线，否则不要用更粗的 border / shadow 去“压住”问题。

## Typography

### 字体策略
- 主标题：手绘感标题字体，优先粗糙、笔画不完全统一的字形
- 正文：可读性优先，允许使用清晰无衬线字体
- 备注 / 标签 / 箭头注释：可使用更窄、更像手写标注的字重
- 文字层级不只靠字号，也要靠墨色深浅区分：标题最深、正文次深、说明/脚注更浅

### 层级建议
- Hero title: 30–56px
- Subtitle: 13–16px
- Section title: 18–24px
- Body: 12.8–14.5px
- Caption / note / label: 10.5–12px
- 最小字号底线：11.2px

### 笔触要求
- 标题可略显不规则，但不能像花体装饰字
- 正文不应过度手写化，否则会影响密度阅读
- 注释与框内标签可以更像“手绘标注”
- 大段正文避免纯黑；正文与说明层要形成柔和的墨色梯度，而不是三层都用同一深度

## Layout Skeleton

默认骨架：

```text
hero/title
subtitle/underline
central metaphor block
supporting workflow diagram
side note / sticky note
sections or callout blocks
footer/source note
save button
```

### 默认结构偏好
- 上：标题 + 核心判断
- 中：中心隐喻（手、轨道、指挥棒、手机、代码编辑器、表单、便签等）
- 下：流程、步骤、原则、便签式总结
- 右侧或角落：sticky note / tip note / summary note
- 若内容是“工具链 / 开发流程 / 自动化”，可用三段式：**输入界面 → 工作流步骤 → 结果/启用状态**

### 版式特征
- 不追求严丝合缝的工业网格
- 允许“手工感”的不完全对齐
- 但整体阅读路径必须稳定：标题 → 隐喻 → 结构说明 → 结论
- 若有多块流程图，优先“中心大图 + 底部摘要”，而不是平均分配所有模块
- **去容器化优先**：不是所有信息都必须放进重边框卡片。能用留白、邻近关系、虚线、批注连接表达分组时，优先不用实体卡片壳。
- **垂直节奏必须有松紧变化**：不同段落/模块之间的留白不应完全等距，允许像白板讲解一样出现“停顿区”和“密集区”。
- **间距要比 dashboard 更松一点**：handline 允许局部紧凑，但整体不应所有模块都贴得很近；标题区、隐喻区、批注区之间必须有可感知呼吸。
- **间距也是颜色的一部分**：若文字已变柔，仍需要通过模块间呼吸把视觉压强降下来，不要只调色不调空白。

### Blog archive / recent articles pattern
- 把“最近文章列表”视为阅读入口，不要只是标题堆叠
- 先识别连续系列：最近 2-4 篇是否构成同一条教程线或主题演进
- 抽取三类信息：`系列主线`、`观点类文章`、`适合分享的阅读顺序`
- 推荐结构：hero 判断句 + 右侧黑盒（列表 ≠ 随机链接）+ 中部阅读流程 + 底部文章条目/主题雷达/分享格式
- 每篇条目至少保留：日期、标题、阅读时长、链接或路径、1 句摘要
- 分享文案优先写“这组文章说明了什么”，而不是“站点最近更新了什么”
- 若页面是 blog recent / archive / index 类列表，handline 的中心隐喻可以是“reading map / route / radar / guide”，而不必强行做成生产力 workflow 图

## Component Rules

### 1. Hand-drawn frame
- 使用略带抖动的边框、圆角或不规则闭合线
- 线宽要统一，但边缘可以略有噪点
- 不可使用过于光滑的现代卡片边框
- 相邻模块不应全部严丝合缝平行对齐；允许轻微错位或边距差，避免 dashboard 感

### 2. Arrow
- 用于表达“流程”“调度”“指向”“因果”
- 箭头尽量短而明确，不要过度装饰
- 橙色箭头是主题的核心强调方式
- 优先让箭头承担层级引导，而不是让纯色块承担层级

### 3. Sticky note
- 用于放“核心原则”“提醒”“一句话总结”
- 要有贴纸感：卷角、阴影、贴住纸面的感觉
- 常放在右下角或图右侧
- sticky note 应像批注层，而不是普通内容卡换底色

### 4. Central metaphor block
- 必须是页面最强的视觉锚点
- 例如：手、铁轨、导线、机械臂、白板草图、流程节点
- 用来代替单纯的大段文字
- 若首屏出现多列说明卡，中央隐喻图的视觉权重必须仍然大于说明卡阵列

### 5. Workflow diagram
- 适合用流程块、轨道、箭头、编号节点表达
- 节点可以不完全对齐，但逻辑必须严格对齐
- 如果内容复杂，优先拆成两层流程
- 移动端应允许简化为更少节点/更短连接，不保留桌面级复杂线网

### 6. Callout box
- 用于“核心原则”“总结”“边界条件”
- 深底浅字或浅底深字均可，但必须和主纸面形成明确对比
- 数量要克制；不能靠大量整齐 box 堆出结构

### 7. Annotation layer（新增，强制）
- 每张 handline 卡至少要有一层独立的批注语言：圈点、手写短标签、箭头批注、下划线、虚线框、划掉重写、贴纸提示等
- 这层的作用是制造“思考痕迹”，让页面看起来像边画边讲，而不是一次性排版完成的印刷页面
- annotation layer 可以轻量，但不能缺席
- annotation layer 应参与组织内容关系：连接跨区块信息、提示阅读顺序、制造局部强调；不能只是贴在单个卡片上的装饰贴纸

### 8. Save button
- 必须保留在卡片底部或安全浮层
- **底部主按钮默认居右对齐**，不要居中或居左
- 若底部有多个操作，主按钮放最右，次级操作靠左或降级为轻量文本链接
- 不得遮挡正文
- 移动端优先落在正常流末尾，必要时再做轻量浮层
- 任何 handline 卡的底部 CTA / 保存按钮 / 导出按钮都应遵守同一右对齐规则，避免像居中工具条

## Mobile Rules

### 720px 以下
- 单列化优先
- 流程图要减少并排节点
- sticky note 下沉到正文后面
- 文本字号不能过小
- 优先保结构，不要保留过多手绘小组件
- 优先减少重边框容器数量，让移动端首先像一张可读草图，而不是一串 stacked cards
- 如果页面用了 JS 生成的 rough-box / hand-drawn SVG 边框，改完视口后先触发一次 `resize` 再判断 overflow；见 `references/rough-box-mobile-regeneration.md`

### 390px 验收重点
- 不允许横向溢出
- 关键隐喻图不能被裁切
- 节点与箭头不能太密
- save button 不能盖住正文
- 便签内容要能完整读完
- 不能出现“桌面整页缩小稿”观感
- 边框和装饰不能压过正文可读性
- **任何正文/说明文字都不能出现“几乎看不见”的浅灰状态**

### 移动端密度退化原则（强制）
1. 先减列数，再减装饰
2. 先保留结构，再简化图形
3. 先保留核心隐喻，再压缩边缘注释
4. 若出现 card-in-card-in-card 拥挤感，先减少最内层手绘容器，而不是继续缩字体
5. workflow / principles / defense 这类区块在移动端优先改为上下堆叠，不硬保并排
6. **禁止桌面缩小稿观感**：如果移动端只是把桌面多块规整模块整体压窄，视为失败；应主动减少模块并列、简化线网、增加呼吸留白
7. **边框层级少于桌面端**：移动端允许主动隐藏次级轮廓，只保留核心结构边界，避免黑线密度压过正文

### 可读性底线（新增，强制）
- 文字可读性高于风格氛围；任何时候都不能为了“轻”“纸感”“编辑感”把正文降到近乎不可见
- 浅色底上的正文、说明文、英文副标题、标签字都必须保持明确对比，禁止使用接近背景色的浅灰
- 如果某个模块需要靠很细的灰字才能成立，该模块设计应被视为失败，优先改文字深度、字号和间距，而不是保留原样
- 手绘双线、抖动边框、装饰虚线都必须服从阅读；一旦边框存在感比文字更强，就应降权边框

## Third-party Hand-drawn Framework Policy

允许使用第三方手绘风前端框架。对 *infocard-handline-style* 来说，`wired-elements` 和 rough 系列不是"点缀"，而是这类主题的**核心视觉语言**。

### 可以使用
- rough.js
- `wired-elements`
- 手绘 SVG / canvas 工具链
- 手写风字体配合的草图框架
- 任何能帮助制造"笔触抖动 / 线条粗糙感"的前端库

### Tag / Chip 元素规则（强制）

**handline 风格中的 tag / chip 标签（如 `.tag-chip`）必须遵守以下规则：**

1. **只用 rough-box 外边框**：tag 元素应同时带 `rough-box` 类，只靠 JS SVG 抖动路径生成手绘外边框
2. **禁止同时加 CSS border**：`border: 1.5px solid #...` 这类 CSS border 属性会与 rough-box SVG 边框叠加，形成内外双层边框（内 solid + 外 sketchy），视觉上错误且冗余
3. **正确做法**：`.tag-chip { background: ...; color: ...; ... }` — 只保留背景色、文字颜色、圆角，不加 border
4. **色值变体**（`.tag-chip.blue`、`.tag-chip.orange` 等）：继承 `.tag-chip` 基类，不单独声明 border
5. **验证方法**：截图放大 tag 区域，若出现内外两层边框 → 基类或变体有 CSS border、outline 或 box-shadow 未清理，需移除
6. **同类禁区**：任何已经挂了 `rough-box` 的容器（尤其 footer、label、summary band、quote band）都不要再叠加 `border` / `outline` / `box-shadow` 充当第二层框；要么用 rough-box，要么用 CSS border，不能两者并存
7. **发布时区联动**：如果卡片的发布日期需要写进正文或页脚，统一用 Asia/Shanghai 壁钟时间（UTC+8），避免首页时间与正文时间不一致。

### ⚠️ 核心原则：边框线条手绘，文字必须清晰（Text-Clean / Borders-Sketchy）

这是 handline 风格实现时最重要的设计原则：**装饰性元素（边框、线条、容器）手绘抖动，文字保持干净印刷体。**

错误做法 ❌：
- CSS SVG `feTurbulence + feDisplacementMap` 滤镜：作用于整块内容，包括文字笔画，文字会被抖歪模糊
- 任何让正文段落出现笔触抖动的方案

正确做法 ✅：
- 纯 JS SVG 抖动路径生成边框线条（每边分 4 段，每端点加 `±roughness*2` 随机偏移）
- 文字层完全不参与抖动，始终保持清晰可读

验证方法：截图后放大看文字边缘——若有锯齿/模糊感，说明文字被滤镜波及，需切回纯 JS SVG 方案。

### ⚠️ CDN 访问限制与兜底方案（关键）

**在受限网络环境（如某些服务器环境）中，`unpkg.com`、`cdn.jsdelivr.net` 等 CDN 会被阻塞，导致 wired-elements 和 rough.js 无法加载。**

因此，**必须优先使用纯 JS SVG 抖动路径方案**，它不依赖任何外部 CDN，100% 可靠：

```javascript
// 纯 JS SVG 手绘边框生成器（已验证 PASS，2026-06-12）
function jitter(v, amt) { return v + (Math.random() - 0.5) * amt; }
function applyHandDrawnBorder(el, r) {
  r = r || 3;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;overflow:visible';
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  var w = el.offsetWidth, h = el.offsetHeight;
  var r2 = r * 2;
  var d = 'M ' + jitter(0, r2) + ' ' + jitter(0, r2);
  d += ' L ' + jitter(w, r2) + ' ' + jitter(0, r2);
  d += ' L ' + jitter(w, r2) + ' ' + jitter(h, r2);
  d += ' L ' + jitter(0, r2) + ' ' + jitter(h, r2);
  d += ' Z';
  path.setAttribute('d', d);
  path.setAttribute('stroke', 'var(--line, #2c2723)');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  el.style.position = 'relative';
  el.insertBefore(svg, el.firstChild);
}
document.querySelectorAll('.wired-card, .sketch-card, [data-handdrawn]').forEach(applyHandDrawnBorder);
```

**SVG 抖动算法核心**：每条边分 4 段，每段端点加 `±roughness*2` 的随机偏移，strokeLinecap round，产生手绘抖动感。

**wired-elements shadow DOM 问题**：即使 CDN 正常加载，`wired-card` 的 shadow DOM 在复杂页面嵌套结构中 shadow innerHTML 可能为空（SVG 未正确挂载），且 shadow DOM 内的 SVG 会被子元素背景覆盖。**纯 JS SVG 生成器对 DOM 结构无依赖，更可靠。**

**方案优先级**：
1. ✅ 纯 JS SVG 抖动路径（首选，不依赖 CDN，**文字保持清晰**）
2. ❌ rough.js CDN（网络受限环境不可用）
3. ❌ wired-elements CDN（shadow DOM 在复杂结构中不稳定）
4. ❌ CSS SVG feTurbulence 滤镜（**文字会被抖动感干扰**，只抖动边框线条、不抖文字的正确做法是纯 JS SVG 路径，**不能**用 CSS filter 方案）

**⚠️ 关键坑：CSS SVG filter 会抖动整块内容，包括文字**
- `filter: url(#rough)` 作用于 `.rough-box` 时，`feTurbulence` + `feDisplacementMap` 会把**文字笔画也抖歪**，造成阅读障碍
- 正确做法：只用 JS 生成 SVG `<path>` 边框线条，`filter` 方案必须废弃
- 验证方法：截图后放大看文字边缘——若有锯齿/模糊感，说明文字被滤镜波及，需切回纯 JS SVG 方案

**验证方法**：截图后检查边框线条是否明显不规则/有抖动；若边框是完美直线则方案失效。

### 结构优先级（强制）
当 handline 主题用于 **workflow 图 / 产品流程图 / 白板说明图 / infographic** 时，必须采用下面的层级：

1. **骨架层：rough.js / 手绘 SVG 优先**
   - 外框
   - 箭头
   - 流程连接
   - 批注圈 / 放射线
   - 虚线高亮框
   - 便签轮廓 / 胶带
   - section outline
2. **主结构层：`wired-elements` 的卡片 / 标签语言**
   - 主要内容块
   - 对比框
   - 步骤条
   - label / badge / chip
   - CTA / 次级操作按钮
3. **内容层：普通 HTML/CSS**
   - 标题 / 副标题 / 正文
   - 列表 / 表格退化后的堆叠结构
   - 栅格密度、断点、移动端阅读顺序

> 原则：**handline 的风格辨识度，必须同时来自 rough 的骨架笔触和 wired 的边框卡片 / label 语言。**

### 必须满足
- 主题定义仍以本 skill 为准
- 框架不是“自动出图工具”，它只负责提供统一的手绘边框语言
- 不能让框架把正文可读性拉低
- 不能把所有模块都做成装饰，导致信息阅读断裂
- 当参考图本身具有强 editorial 骨架时，应优先重建其结构语言（topbar / serif hero / quote banner / process bar / multi-column body），再叠加 wired 卡片与标签；不要只抽色值和氛围
- 当用户明确给出白板 / 流程图 / sketch 风参考图时，**rough.js + wired-elements 的组合优先于纯 CSS 直边框**
- 预览页 `theme/*.html` 只是示例实现，不能反过来绑架 style skill；**skill 才是主规范，preview 只是样张**
- 橙色只能做点状强调：按钮、放射线、虚线框、重点标记；不能大面积铺色
- 必须显式防浏览器自动深色污染：根节点加 `color-scheme: light`

### handline × wired-elements 专项边界
- `wired-elements` 在 handline 里是**主视觉骨架之一**，不是只给按钮用的轻量点缀
- 允许大块使用 `wired-card`，并配合 label / badge 形成“手绘卡片群”
- 不能把每个细碎文本都单独组件化，避免 `card-in-card-in-card` 的组件展板感
- 对 workflow / 调度 / whiteboard 内容，优先用 rough 骨架 + wired 卡片 + 普通排版的三层组合；不要退回成平面硬边框

### wired-elements 视觉控制规则
- 重点不是“有没有 wired”，而是**边框语言是不是 wired 风格**
- `wired-card` / `wired-button` 的存在是为了获得抖动边框、手绘轮廓和手工感，不是为了把文字颜色交给组件默认值
- 文本层仍然要由你自己的 CSS 明确控制：标题纯黑、正文深灰、辅助蓝 / 土橘分层不可丢
- 如果某个组件里的文字可读性差，优先改字号 / 对比 / 间距 / 载荷，而不是取消 wired 语言

### 禁止
- 只靠第三方框架“自动生成”视觉而不定义版式
- 用过度动画掩盖结构混乱
- 用复杂 SVG 堆出花哨效果，牺牲内容识别速度
- 只做“米纸底 + 圆角盒子 + 橙色强调”的浅层 retheme，却没有形成明确的 handline / whiteboard identity
- 把所有内层小块都 wired 化，做成“组件展板”而不是“手绘信息图”
- 为了追求全局手绘，把深色重点块全部交给深色容器；移动端易被自动深色模式 / 浏览器强制配色错误干预
- 用过度动画掩盖结构混乱
- 用复杂 SVG 堆出花哨效果，牺牲内容识别速度
- 只做“米纸底 + 圆角盒子 + 橙色强调”的浅层 retheme，却没有形成明确的 handline / whiteboard identity
- 把所有内层小块都 wired 化，做成“组件展板”而不是“手绘信息图”
- 为了追求全局手绘，把深色重点块全部交给深色容器；移动端易被自动深色模式 / 浏览器强制配色错误干预

## References（长期查阅价值）
- `references/handline-text-clean-borders-sketchy.md`：**核心渲染规则**——Text-Clean / Borders-Sketchy 原则、纯 JS SVG 抖动路径算法（含代码）、tag/chip 双层边框 Bug 修复、验证方法、已验证参数、commit 记录，以及三次回归笔记（CSS filter 抖歪文字、tag 双层边框、浅色边框消失）。
- `references/handline-double-border-and-utc8-publish-time.md`：本次回炉笔记——rough-box 不能叠 CSS border、footer 也算二次边框风险、发布时间必须用 UTC+8 壁钟时间
- `references/handline-tech-blog-sharing-pattern.md`：技术博客 Recent Articles / archive 页面如何转成 handline 阅读地图（系列主线、主题雷达、分享格式、条目字段）
- `references/handline-wired-full-surface-rebuild.md`：full-wired 边框语言重建记录（含 wired shadow DOM CSS 覆盖问题）
- `references/handline-visual-review-rounds.md`：会话级视觉校调记录（多轮预览→评判→修订循环）
- `references/handline-wired-editorial-rebuild.md`：wired-elements + editorial skeleton 重建主题预览页的方法
- `references/handline-screenshot-verify.md`：发布后截图验收的标准流程（CDP 截图 + VLM 视觉验证 + 边框颜色检查命令）
## Naming / Aliases

- 不要做成严肃技术手册风
- 不要做成极简冷感海报
- 不要让所有线条都光滑得像工业 UI
- 不要让橙色泛滥到失去重点
- 不要把手绘感做成低可读性的涂鸦
- 不要让便签抢走标题层级
- 不要让中心隐喻消失，变成普通信息卡

## Naming / Aliases

- 英文名：`infocard-handline-style`
- 中文名：手绘草图风 / 白板便签风
- 常用别名：handline、doodle-note、sketch-workflow
- 触发词：手绘、草图、白板、便签、调度、并行、工作流图
- 对应主题 slug：`handline`

## Deployment Discipline（关键）

### skill 规则必须同步到 live 页面
- `theme/handline.html` 是 handline 风格的 **live 真相源**，不是临时 demo
- 本 skill 的所有规则（Color / Typography / Mobile / Framework）**必须同时更新到 `theme/handline.html`**，不能只在 skill 文档里"有规则"但 live 页不应用
- `/tmp/handline-skill-r*.html` 这类文件只是**验证样本**，不是风格部署目标
- 每次 skill 修订后，必须把对应的 CSS 改动 commit 到 `theme/handline.html`

### 已知工作流陷阱（2026-06-12）
本次会话中：skill 通过三轮预览→评判→修订循环不断变强，但所有修订都写进了 `/tmp/` 的临时文件，`theme/handline.html` 持续保持"文字极浅、字号极小"的失败状态，直到用户截图报告"严重不可读"才被强制修复。

**正确流程**：
```
skill 修订 → 同步改动到 theme/handline.html → commit → push → 截图验收公网页
```

## 已验证可读的 CSS Baseline

以下数值经 VLM 视觉审查确认为 390px mobile PASS。不要把正文改得更浅、更小：

| 元素 | 字号底线 | 颜色底线 | 说明 |
|---|---|---|---|
| 顶部元信息 | ≥12px | ≥#2a4f9e | 深蓝不可用浅蓝 |
| 标签 chip | ≥11.5px | ≥#4a4238 | 底色浅时字必须够深 |
| 对比框正文（深色底） | ≥12px | ≥#c8bfb3 | 深底上灰字最低值 |
| 对比框标题（深色底） | ≥12.5px | ≥#f2ede5 | 白字够亮 |
| 流程步骤正文 | ≥11.8px | ≥#d4cdc2 | 暖灰不可更浅 |
| 流程步骤标题 | ≥13.8px | — | 保持对比 |
| 英文副标签 | ≥11px | ≥#3d5f9e | 深蓝不可浅蓝 |
| 原则正文 | ≥11.8px | ≥#3e3830 | 深灰不可接近背景 |
| subcard 正文 | ≥11.8px | ≥#4a4238 | — |
| tiny-rail | ≥11.5px | — | — |
| 移动端 720px 正文 | ≥12.5px | — | MQ 里必须整体抬高 |
| 移动端 420px 正文 | ≥12px | — | 不能再缩 |

**对比框深层规则**：深色底（`#171617` 类背景）上的浅色字必须与背景保持足够对比；建议正文灰度不低于 `#c0bab0`，不要用接近米白的极浅色。

## Acceptance Checklist

- [ ] 主题定位清晰：手绘草图 / 白板便签 / 工作流图
- [ ] 配色 token 明确且稳定（参考实测色值已写入）
- [ ] 手写 / 笔触 / 框线 / 箭头规则明确
- [ ] 中心隐喻是结构核心，不是装饰
- [ ] 适合与不适合的内容类型已写清
- [ ] 720px / 390px 移动端规则明确
- [ ] 允许第三方手绘风框架，但结构控制权仍在本 skill
- [ ] 没有与其他主题混淆
- [ ] **CSS baseline 数值已写入 skill，不在 live 页降级**
- [ ] **手绘边框必须使用纯 JS SVG 抖动路径（CDN 受限时的唯一可靠方案）；边框线条必须明显不规则，不是完美直线**
- [ ] **手绘效果不得使用 CSS SVG feTurbulence 滤镜**（会同时抖歪文字，必须只用 JS SVG 路径方案）
- [ ] **文字必须清晰可读，不得被任何滤镜或手绘效果波及；截图放大后文字边缘必须干净无锯齿**
- [ ] **tag/chip 元素（如 `.tag-chip`）只使用 rough-box SVG 外边框，禁止同时加 CSS border 属性；验证方法：截图放大 tag 区域无内外双层边框**
- [ ] **结构层不用 wired-card（shadow DOM 问题）；导出按钮可酌情使用 wired-button**
- [ ] **边框颜色底线已固化**：所有结构性边框（topbar 底边 `border-bottom`、footer 边框 `border`、section 分隔 `border-bottom`）使用深墨褐 ≥ `#2c2723`；`grep -rn "d0c8be\|c0b8a8\|c9c0b3" docs/YYYYMMDD-*.html` 扫描后无结果才算 PASS
- [ ] **发布后必须截图验收（强制）**：每次发布 handline 卡后用 CDP 截图验证首屏边框颜色是否正确，用户已明确说"你截图首屏像我证明"，截图验收是用户的硬性标准，不是可选步骤；验证方法见 `references/handline-screenshot-verify.md`

## 已知的 CSS border 坑（新增，2026-06-13）

### 坑：新建 handline 卡时只写 HTML 骨架、漏掉 JS 脚本（2026-06-13 新增）

**症状**：写了新的 handline HTML 但没有 handline 风格——看起来像"白底细黑线普通卡片"。

**根因**：handline 的视觉识别度来自两套机制：
1. 内联 CSS（完整 token 系统 + `.tag-chip`、`.stats-box`、`.quote-band` 等组件类）
2. **内联 JS 脚本**（SVG 手绘边框生成器：`jitter` → `mk` → `roughRect` → `drawRough` → `initRough`）

这两套机制都在 ponuta 卡的 `<style>` 和 `<script>` 块里，不是从外部文件加载。`/theme/handline.js` 这个文件**不存在**，引用它会 404。

**正确做法**：
1. `cp docs/20260613-ponytail.html docs/YYYYMMDD-newcard.html` — 从 ponuta 复制完整骨架
2. 清空正文内容，**保留全部 CSS / JS 脚本 / class 名称**
3. 只替换文字内容，不改 class 名称和 HTML 结构层级
4. 推送到 GitHub Pages 后截图验收

详细操作步骤见 `references/handline-card-authoring-from-ponytail.md`。

### 坑：浅色纯 CSS 边框在米纸底不可见

### 坑：浅色纯 CSS 边框在米纸底不可见

**症状**：topbar 底边、footer 边框、section 分隔线用了 `#d0c8be` / `#c0b8a8` 等浅色，在 `#f5efe6` 米纸底上对比度极低，视觉上"消失"了。用户截图反馈"边框看不见"。

**根因**：handline 的米纸底背景是 `#f5efe6`（暖米黄），`#d0c8be`（浅暖灰）与之太接近，无法形成视觉锚点。

**批量修复**（已发布后发现）：
```bash
for f in docs/YYYYMMDD-*.html; do
  sed -i 's/#d0c8be/#2c2723/g; s/#c0b8a8/#2c2723/g; s/#c9c0b3/#2c2723/g' "$f"
done
```

**验证**：
```bash
grep -rn "d0c8be\|c0b8a8\|c9c0b3" docs/YYYYMMDD-*.html  # 空 → PASS
```

**相关 commit**：`f0c7408` — `Fix handline border colors: #d0c8be/#c0b8a8 → #2c2723`

## Implementation Notes

如果要真正落地为可发布信息卡，建议在 HTML 中使用：
- 手绘感主标题字体
- 米纸纹理背景
- 轻微噪点或手工阴影
- 关键箭头 / 便签 / 边框用橙色强调
- 中央隐喻图尽量用 SVG 或插图表达
- 内容层次控制在"标题 → 隐喻 → 解释 → 结论"
- 若使用 `wired-elements`，优先把它当作**大区块骨架增强器**，不要把所有内层小组件都 wired 化，否则页面容易像组件展板而不是 editorial cheat sheet
- theme/demo 落地后，默认执行 **两轮视觉审核**：桌面 + 390px 移动端各审一轮，修改后再重复一次；单轮验收通常会残留对齐问题或"桌面缩小稿"问题
- 本主题的会话级视觉校调记录见 `references/handline-visual-review-rounds.md`

### 已验证通过的 live 实现（Text-Clean / Borders-Sketchy）

**commit `8ddbd17`**（2026-06-12）：`theme/handline.html`
- 移除了 CSS `feTurbulence` SVG filter（原导致文字被抖歪）
- 只保留 JS 纯 SVG 抖动路径生成器（`jitter` + `roughRect` + `drawRough`）
- `rough-box` 类元素：边框线条手绘抖动，文字层完全不参与抖动
- 视觉验证：桌面 + 390px 移动端均 PASS
- 线上：https://ccwq.github.io/infocard-pub/theme/handline.html

**commit `ead6d9a`**（2026-06-12）：`docs/20260612-repo-to-agent-context.html`、`docs/20260612-murphys-law.html`、`docs/20260612-matthew-effect.html`
- 移除 `.tag-chip` 基类的 `border: 1.5px solid #2c2723`（与其他 rough-box 元素叠加形成内外双层边框）
- 三张卡各移除 1 行 border；验证后 tag 区域只有单层 sketchy SVG 边框
- skill Acceptance Checklist 新增 tag/chip 双层边框验收条目

**commit `255c627`**（2026-06-12）：`docs/sn-cc-gui.html`
- 发布 CC GUI 工具分享卡（含本地截图 assets）
- 验证：界面截图正常、tag 无双层边框、文字清晰、边框手绘感成立
- 线上：https://ccwq.github.io/infocard-pub/docs/sn-cc-gui.html

## Style Boundary


- `references/handline-card-authoring-from-ponytail.md`：新建 handline 卡时**必须从 ponuta 复制完整骨架**（HTML + CSS + JS 脚本），不是从零写 HTML；ponuta 卡是唯一可信的已验证实现，`/theme/handline.js` 不存在。
- `references/handline-wired-editorial-rebuild.md`：当用户嫌 handline 主题"只是换肤、不够像真正手绘 editorial 卡"时，如何用 `wired-elements` + editorial skeleton 重建主题预览页。
- `references/handline-html-first-authoring.md`：复杂 handline 信息卡何时应直接写成完整 HTML，以及 meta 里必须补齐 `slug/path/category` 的发布约束。

## Authoring Workflow

- 对于需要多个自定义块（表格、skill grid、use-case grid、定制 footer/CTA）的 handline 卡，**必须从 `docs/20260613-ponytail.html` 复制完整 HTML 骨架**，然后替换正文内容；不要从零写 HTML，不要引用不存在的 `/theme/handline.js`。
- 写完 HTML 后，先补齐同名 `.meta.yaml`，并明确写出 `slug`、`path`、`category`，否则 `npm run build` 会在索引阶段直接失败。
- 如果你临时给页面挂了主题脚本或 DOM 初始化 hook，必须确认对应的 live 主题/页面真的提供了这些函数；不要留下依赖不存在初始化逻辑的脚本尾巴。
- **禁止行为**：写了新的 `.html` 文件后，没有完整复制 ponuta 的 CSS + JS 脚本，就直接"看起来像普通 HTML 卡片"；这类卡片的根本问题是缺少 JS 脚本生成的手绘边框，不是 CSS 色值问题。
- **Build index 工件必须同 commit（2026-06-13 新增）**：`npm run build` 会修改 `_index.yaml` 和 `index.html`。如果只 commit 新卡文件而漏掉这两项，CI 的 "Verify Generated Index Artifacts" 会失败，Pages 部署也会因为 `_index.yaml` 不含新卡 slug 而无法访问。**正确顺序：`npm run build` → `git add` 新卡文件 + `_index.yaml` + `index.html` → 同一 commit → push。**

## Style Boundary

这套主题强调“像人在纸上边画边讲”，不是“像软件产品页面”。

如果页面看起来过于精致、过于几何、过于理工 UI 化，说明已经偏离 handline 风格。
