# Vue 三件套信息卡：progressive-doc

## SEC 01 — 背景：前端组件选型的两条弯路

第一条弯路：直接用 Element Plus / Ant Design 等成熟组件库：
- 样式黑盒：改一个圆角或间距要覆盖 !important
- 主题定制成本高：组件库 CSS 变量与 Design Token 体系不一致
- 包体积大：按需引入配置繁琐
- AI 生成不可控：AI 不熟悉 API 细节

第二条弯路：不用任何组件库，直接写原生 HTML 标签：
- 无规范约束：每个页面按钮、卡片写法各异
- 重复劳动：同样卡片布局写了 10 遍
- 无障碍缺失：不带 ARIA 属性
- AI 记忆负担重：没有组件规范，AI 每次重新发明轮子

第三条路：自建组件体系，用技能约束（Vue 三件套的核心思路）：
样式基于 CSS 变量，组件基于纯 HTML/CSS，所有规范由技能文档约束。

---

## SEC 02 — 核心定位：Vue 三件套是什么

| 技能 | 定位 | 核心职责 |
|------|------|----------|
| vue-generate-skill | 项目骨架 | 项目初始化、目录结构、TypeScript 严格模式、请求层集成 |
| vue-theme-skill | 设计 Token 层 | 颜色系统、尺寸阶梯、圆角阴影、CSS 变量、多主题切换 |
| vue-style-skill | 样式基础设施 | CSS 变量系统、动画库、工具类、重置样式 |

体系架构：
```
vue-generate-skill（骨架）
  ↓
项目初始化 + 请求层（frontend-request-skill）
  ↓
vue-theme-skill（主题）
  ↓
Design Tokens（颜色/尺寸/圆角/阴影）
  ↓
vue-style-skill（样式）
  ↓
动画/工具类/重置样式
  ↓
vue-base-skill（组件库）
  ↓
base-card / base-button / base-table / ...
```

---

## SEC 03 — vue-generate-skill：项目骨架

一句话：输入「帮我做一个 Vue3 项目」→ 输出完整项目结构 + 请求层 + TypeScript 严格配置 + Pinia Store

核心能力：
- 项目初始化：create-vue 脚手架 + 完整目录结构
- TypeScript 严格模式：strict / noImplicitAny / strictNullChecks 等全开
- 请求层集成：严格复用 frontend-request-skill，不自己写 request.ts
- Pinia Setup 风格：所有 Store 必须用 Setup 风格
- CLAUDE.md ≤ 50 行：AI 开发助手指南，简洁明确

目录结构规范：
```
src/
├── api/     # 严格按 frontend-request-skill 划分
│   ├── request.ts
│   ├── upload.ts
│   └── modules/
├── services/  # 业务服务层
├── config/    # 配置（api.config.ts / error.config.ts）
├── stores/modules/  # Pinia Setup 风格
├── composables/  # 组合式函数
├── views/   # 页面
├── types/    # TypeScript 类型
└── utils/    # 工具函数
```

红线规则：
- 不用 axios：必须用 fetch
- 不用 any 类型：严格类型检查
- 不用 console.log：生产环境无日志
- 不用 Options API：必须用 Composition API
- 不用裸色值：必须用 CSS 变量
- 不用 Element Plus 等组件库：自建组件体系，可控可维护

---

## SEC 04 — vue-theme-skill：设计 Token 层

一句话：输入主色（如 #4a90e2）→ 自动生成 50-950 完整色阶 + 尺寸阶梯 + 圆角阴影 + 一键换肤

动态色阶生成（50-950）：
```css
--color-primary-50: hsl(211, 100%, 96%);
--color-primary-100: hsl(211, 100%, 92%);
--color-primary-200: hsl(211, 100%, 86%);
--color-primary-300: hsl(211, 100%, 76%);
--color-primary-400: hsl(211, 100%, 66%);
--color-primary-500: hsl(211, 100%, 56%); /* 主色 */
--color-primary-600: hsl(211, 100%, 48%);
--color-primary-700: hsl(211, 100%, 40%);
--color-primary-800: hsl(211, 100%, 32%);
--color-primary-950: hsl(211, 100%, 16%);
```

为什么用 HSL？色相绝对稳定（hue 不变），调整饱和度/亮度即可生成色阶，与 Tailwind / Material 等业界方案对齐。

8 套预设主题：

| 主题 | HSL 值 | 命名 |
|------|--------|------|
| 蓝（默认） | hsl(211, 100%, 56%) | blue |
| 绿 | hsl(152, 69%, 45%) | green |
| 紫 | hsl(262, 83%, 58%) | purple |
| 红 | hsl(0, 84%, 60%) | red |
| 橙 | hsl(33, 100%, 56%) | orange |
| 青 | hsl(180, 77%, 47%) | cyan |
| 粉 | hsl(330, 81%, 60%) | pink |
| 灰 | hsl(220, 9%, 46%) | slate |

尺寸阶梯：
```css
/* 字号 */
--font-xs: 12px;
--font-sm: 13px;
--font-base: 14px;
--font-lg: 16px;

/* 间距 */
--space-1: 4px;
--space-2: 8px;
--space-4: 16px;
--space-6: 24px;

/* 圆角 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
```

---

## SEC 05 — vue-style-skill：样式基础设施

定位：CSS 变量系统、动画库、工具类、重置样式

核心设计：
- 纯 CSS 实现：不依赖 Element Plus 等第三方组件库
- 样式完全基于 CSS 变量：可控可维护
- 与 vue-theme-skill 配合：theme 提供 Design Token，style 提供使用规范

核心追求：
- 分层解耦：骨架不关心样式，主题不关心组件，职责边界清晰
- 标准复用：严格依赖 frontend-request-skill 的请求层规范，与后端契约完美对齐
- TypeScript 严格模式：vue-tsc --noEmit 必须 0 error

---

## SEC 06 — Design Token 的实际价值

解决文章开头列出的硬编码问题：

| 换主题时 | 旧方案（硬编码） | Vue 三件套 |
|----------|-----------------|-----------|
| 全局搜索替换主色 | 漏了 5 处 | 改 CSS 变量值 → 全局生效 |
| 手动修改圆角 | 漏了 3 处 | CSS 变量统一管理 |
| TypeScript 类型错误 | 到处是 any | 严格类型检查 |

---

## SEC 07 — 与 Element Plus / Ant Design 的本质区别

| 维度 | Element Plus / Ant Design | Vue 三件套 |
|------|--------------------------|------------|
| 代码归属 | 封装在 npm 包里 | 源码在你项目里 |
| 样式修改 | 覆盖 !important | 直接改 CSS 变量值 |
| 主题定制 | 依赖组件库的变量体系 | 自己的 Design Token |
| 包体积 | 随组件数量增长 | 零额外依赖 |
| AI 生成友好度 | 需记忆组件 API | 只要知道 CSS 变量名 |
| 适用场景 | 快速出活、后台系统 | VibeCoding、展示型页面 |

两者是互补关系，不是竞争关系。

---

## SEC 08 — 不用 axios：用 fetch 替代

红线规则：不用 axios，必须用 fetch。

fetch 的优势：
- 原生支持，无需安装依赖
- Service Worker 原生集成
- Streams API 支持
- 与 frontend-request-skill 规范对齐

---

## SEC 09 — VibeCoding 场景的适用性

三件套特别适合 VibeCoding 场景：
- **Design Token 体系让 AI 知道该用什么变量**
- **不依赖组件库 API，AI 无需记忆复杂的组件用法**
- **源码归你：AI 生成的代码直接可用，不需要适配第三方组件**
- **体系化分工明确：AI 可以按 skill 职责生成不同层的代码**

典型 VibeCoding 工作流：
```bash
1. 调用 vue-generate-skill → 生成项目骨架 + CLAUDE.md
2. 调用 vue-theme-skill → 定义主色 → 生成 Design Token
3. 调用 vue-style-skill → 注入动画/工具类
4. AI 开发者按规范生成 base-card / base-button 等组件
5. 组装业务页面 → 所有样式引用 CSS 变量
```

---

## SEC 10 — 使用前提与边界

前置条件：Vue 3 + TypeScript + Vite + Pinia 项目

建议使用顺序：
1. 先跑 vue-generate-skill：初始化项目骨架和请求层
2. 再接 vue-theme-skill：定义主色和 Design Token
3. 最后 vue-style-skill：建立样式基础设施

适用场景：
- 从零开始的 VibeCoding 项目
- 需要统一品牌调性的多页面应用
- AI 代码生成场景（Design Token 给 AI 明确约束）
- 需要快速换肤的 SaaS 产品

不适用场景：
- 已有 Element Plus / Ant Design 依赖的项目（迁移成本高）
- 快速出活的后台管理系统
- 非 Vue 技术栈

局限性：
- 自建组件体系需要初始建设成本
- 没有第三方组件库的丰富组件
- Design Token 维护需要设计师和开发者共同参与
