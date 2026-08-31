---
name: infocard-style-man-skill
description: 信息卡主题体系管理员。用于创建、审查、维护、合并和废弃 infocard style skill、主题预览页及注册关系；统一 Style Skill Schema，检查职责边界、命名和 skill/theme 一致性。涉及具体主题视觉细节时，必须转到对应的 infocard-xxx-style。
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, governance, theme, schema, review, maintenance]
related_skills: [infocard-theme-assignment, infocard-theme-validation, infocard-mobile-verifier]
---

# infocard-style-man-skill · 信息卡主题体系管理员

## 定位

本 skill 是主题体系的治理入口，不是具体视觉主题，也不是信息卡发布工具。

负责：

- 创建、审查、维护、合并和废弃 `infocard-xxx-style`；
- 维护 style skill、`theme/*.html`、`_themes.yaml`、`themes.html` 之间的关系；
- 统一 Style Skill Schema、命名、职责边界和引用完整性；
- 识别重复入口、越界内容、失效引用和 style/theme 结构漂移。

不负责：

- 内容分类或内容—主题选择：归 `infocard-theme-assignment`；
- 正式信息卡 authoring：归 `any2card` / authoring skills；
- 发布、build、commit、push、Pages：归 publish / publisher skills；
- 移动端截图和 390px 修复：归 `infocard-mobile-verifier`；
- 通用视觉截图和证据链：归视觉验证相关 skills。

具体主题的颜色、字体、布局、组件、反模式、视觉评审和 CSS 踩坑，必须归入对应的 `infocard-xxx-style/SKILL.md` 或其 `references/`，不得复制到本 skill。

## 主题生命周期统一决策树

```text
创建 → Schema 审查 → 创建/更新 style skill 与 theme demo
    → 注册 _themes.yaml → 重建 themes.html → 主题验证

维护/审查 → 检查 skill、theme、注册表和引用的一致性

改造/重设计/精炼 → 由对应具体 style skill 承载视觉决策
                  → 本 skill 只检查纳管关系和边界

合并/废弃 → 迁移有效规范 → 更新注册和引用 → 删除旧入口 → 验证
```

详细的新主题公共流程见：
`references/new-theme-creation-workflow.md`

参考图驱动的公共创建方法见：
`references/image-to-theme-visual-review-loop.md`

## 统一 Style Skill Schema

每个具体 style skill 应按以下结构组织。差异应体现在视觉契约，而不是章节结构：

1. `Overview`：风格定位和解决的问题；
2. `Use Cases`：适用、不适用、触发词和相近主题区分；
3. `Design DNA`：视觉气质、密度和主视觉锚点；
4. `Color Tokens`：稳定的 CSS token 及用途；
5. `Typography`：字号、字重、行高和移动端降级；
6. `Layout Skeleton`：hero、section、grid、footer 等结构骨架；
7. `Component Rules`：标签、卡片、表格、代码块、流程等组件规则；
8. `Mobile Rules`：窄屏退化、溢出和固定控件避让原则；
9. `Anti-patterns`：不能混用的颜色、结构和装饰；
10. `Acceptance Checklist`：纳管前的可检查条件；
11. `Naming / Aliases`：skill 名、slug、theme 文件和触发词。

## 预览与注册边界

- 主题预览 HTML 由主题管理层维护，但预览页中的视觉细节必须以对应具体 style skill 为准；
- `_themes.yaml` 是主题注册事实源；
- `themes.html` 是生成产物，不得手动编辑；
- 新增或改名主题时，必须同步检查 slug、`css_class`、skill 名、theme 文件和预览入口；
- 主题 demo / fixture 不是正式信息卡模板，不得提升到 `docs/`。
- 主题预览路径采用 `theme/<slug>.html`；fixture 仅用于稳定回归，不作为正式卡片模板。

主题变更完成后，把正式交付交给项目既有主题验证和发布流程，不在本 skill 中重复 build、截图、提交或推送步骤。

## 审查流程

按以下顺序审查一个主题：

1. 确认对象：style skill、theme 文件、注册条目和预览入口；
2. 对照 Schema 标记完整、缺失、弱化或越界；
3. 检查名称、slug、`css_class` 和引用是否一致；
4. 检查 style skill 是否描述了不存在的主题资产；
5. 检查 theme 是否有未被 style skill 约束的新核心结构；
6. 检查内容是否重复了 authoring、theme assignment、mobile 或 publish 流程；
7. 给出结论：`PASS`、`NEEDS NORMALIZATION`、`NEEDS SPLIT` 或 `FAIL`。

## 冗余与归位规则

| 内容 | 正确归属 |
|---|---|
| 具体主题 token、组件、布局、视觉案例 | 对应 `infocard-xxx-style` |
| 内容类型到主题的选择 | `infocard-theme-assignment` |
| 内容抽取和 HTML authoring | `any2card` / authoring |
| 移动端截图、390px、overflow 修复 | `infocard-mobile-verifier` |
| 截图、CDP、视觉证据 | 视觉验证相关 skill |
| build、verify、commit、push、Pages | publisher / publish SOP |
| metadata、date、path、sidecar | metadata skill |
| 一次性且无明确归属的历史记录 | 删除 |

发现越界内容时，默认先报告归属；用户明确授权迁移、重构或删除后再写入。迁移时只保留对目标 skill 当前维护有用的结论，不机械复制历史全文。主题管理员不得按内容类型自行选择主题，只消费 `infocard-theme-assignment` 的决策结果。

## 合并与废弃

合并主题或 skill 时：

1. 先确定保留入口和目标 style；
2. 迁移仍有效的视觉契约和必要 references；
3. 合并注册、预览和引用；
4. 删除旧 skill、旧 references 和重复入口；
5. 全仓库搜索旧名称及失效路径；
6. 运行针对性验证。

没有明确目标、没有当前使用价值或已被其他职责 skill 完整覆盖的内容，不建立新的 archive 目录，直接删除。

## 输出格式

### Style Skill 审查

```text
结论：PASS / NEEDS NORMALIZATION / NEEDS SPLIT / FAIL
对象：infocard-xxx-style

Schema：Overview / Use Cases / Design DNA / Tokens / Typography /
Layout / Components / Mobile / Anti-patterns / Checklist / Naming

一致性：skill ↔ theme ↔ _themes.yaml ↔ themes.html
越界：...
重复：...
建议：...
```

### 新主题骨架

```text
# infocard-xxx-style
## Overview
## Use Cases
## Design DNA
## Color Tokens
## Typography
## Layout Skeleton
## Component Rules
## Mobile Rules
## Anti-patterns
## Acceptance Checklist
## Naming / Aliases
```

## 验收清单

- [ ] 已明确是 style-only、style + theme，还是完整主题纳管任务；
- [ ] 已使用统一 Schema；
- [ ] 具体视觉经验位于对应 style skill；
- [ ] 内容选择、移动端、截图和发布职责没有重复；
- [ ] skill、theme、注册表和预览入口名称一致；
- [ ] 没有悬空引用或已废弃的旁路入口；
- [ ] 合并/删除范围经过用户授权；
- [ ] 未修改 `.git-up-plan.yaml`，未顺带处理无关工作区变更。
