## SEC 11 — HSL 色阶的技术原理

为什么用 HSL 而不是 HEX 或 RGB？

RGB/HEX 的问题：调整亮度时需要同时修改 R/G/B 三个通道，生成完整色阶需要手动计算。

HSL 的优势：
- Hue（色相）不变：蓝色始终是蓝色
- Saturation（饱和度）调整：控制颜色的鲜艳程度
- Lightness（亮度）调整：生成浅色到深色的完整阶梯

原文实现（JS 色阶生成脚本）：
输入主色 HSL 值（如 hsl(211, 100%, 56%)）
自动生成 --color-primary-50 ~ --color-primary-950

与业界方案对齐：
- Tailwind CSS：使用 HSL 生成色阶
- Material Design：使用 HSL 调整亮度层级
- Vue 三件套：与两者一致，确保设计师和开发者使用同一套逻辑

## SEC 12 — 8 套预设主题的实际应用

切换到绿色主题（一个 CSS 变量赋值）：
```css
/* 默认蓝色主题 */
[data-theme="blue"] {
  --color-primary: hsl(211, 100%, 56%);
}

/* 绿色主题 */
[data-theme="green"] {
  --color-primary: hsl(152, 69%, 45%);
}
```

使用方式：给 HTML 根元素加 data-theme 属性即可。

8 套主题一览：

| 主题 | HSL 值 | 适用场景 |
|------|--------|----------|
| 蓝（默认） | hsl(211, 100%, 56%) | 企业后台、工具类 |
| 绿 | hsl(152, 69%, 45%) | 金融、健康 |
| 紫 | hsl(262, 83%, 58%) | 创意、时尚 |
| 红 | hsl(0, 84%, 60%) | 警告、紧急 |
| 橙 | hsl(33, 100%, 56%) | 促销、CTA |
| 青 | hsl(180, 77%, 47%) | 科技、数据 |
| 粉 | hsl(330, 81%, 60%) | 女性、消费品 |
| 灰 | hsl(220, 9%, 46%) | 工具、低调 |

## SEC 13 — 与 Element Plus / Ant Design 的本质区别

Element Plus 和 Ant Design Vue 是成熟的 UI 组件库，封装了完整的设计系统。

Vue 三件套不是组件库，而是规范体系：

| 维度 | Element Plus / Ant Design | Vue 三件套 |
|------|------------------------|------------|
| 代码归属 | 封装在 npm 包里 | 源码在你项目里 |
| 样式修改 | 覆盖 !important 或 CSS 变量 | 直接改 CSS 变量值 |
| 主题定制 | 依赖组件库的变量体系 | 自己的 Design Token |
| 包体积 | 随组件数量增长 | 零额外依赖 |
| AI 生成友好度 | 需记忆组件 API | 只要知道 CSS 变量名 |
| 适用场景 | 快速出活、后台系统 | VibeCoding、展示型页面 |

两者是互补关系，不是竞争关系。Vue 三件套适合从零构建有品牌调性的项目。

## SEC 14 — 为什么不用 axios

红线规则：不用 axios，必须用 fetch。

fetch 的优势：
- 原生支持，无需安装依赖
- Service Worker 原生集成
- Streams API 支持
- 与前端-request-skill 规范对齐

axios 的局限：
- 需要额外安装
- 拦截器模式在 TypeScript 下类型推断复杂
- Vite 生态下 fetch 已经足够强大

## SEC 15 — frontend-request-skill 的角色

vue-generate-skill 要求「严格复用 frontend-request-skill，不自己写 request.ts」。

frontend-request-skill 的职责：
- 统一的错误处理（401 重定向 / 500 上报 / 超时处理）
- 请求拦截器（注入 Token / 统一 headers）
- 响应拦截器（数据解构 / 错误语义化）
- 统一上传下载封装

这确保了前端请求层与后端契约的一致性，前后端约定优先。

## SEC 16 — VibeCoding 场景下的 AI 协作方式

AI 生成代码时，Vue 三件套提供了明确的约束：

设计师给定主色 → vue-theme-skill 生成完整 Design Token → AI 生成代码时直接引用 CSS 变量

具体流程：
1. 产品经理给定品牌主色（HEX 值）
2. vue-theme-skill 自动生成 50-950 色阶 + 尺寸阶梯 + 圆角变量
3. AI 生成组件时，引用这些变量而非硬编码值
4. 换主题时，只改根变量，全局生效

AI 的约束来自：
- CLAUDE.md ≤ 50 行：项目规范
- vue-style-skill：样式规范
- vue-theme-skill：变量命名规范
- 不用 Element Plus 等红线规则

## SEC 17 — 与 Tailwind CSS 的关系

Vue 三件套使用 CSS 变量，与 Tailwind CSS 不是替代关系，而是互补关系：

- Tailwind：原子化 CSS 类，提供布局和间距工具
- Vue 三件套 Design Token：定义语义化变量（颜色/字号/间距的语义名称）

推荐用法：
- Tailwind 负责布局（grid/flex/间距工具类）
- CSS 变量负责语义化主题（primary/secondary/danger 颜色）
- 两者配合使用

## SEC 18 — 适用边界与局限性

适用场景：
- 从零开始的 VibeCoding 项目
- 需要统一品牌调性的多页面应用
- AI 代码生成场景（Design Token 给 AI 明确约束）
- 需要快速换肤的 SaaS 产品

不适用场景：
- 已有 Element Plus / Ant Design 依赖的项目（迁移成本高）
- 快速出活的后台管理系统（自建组件体系需要初始投入）
- 非 Vue 技术栈

局限性：
- 自建组件体系需要初始建设成本
- 没有第三方组件库的丰富组件（如下拉菜单、日期选择器）
- Design Token 维护需要设计师和开发者共同参与
