# SPEC: 20260819 批次主题塌缩调查与整改

## Problem Statement

2026-08-19 全天发布的 16 张 `20260819-*` 信息卡全部硬编码 `darkblue` 主题，违反 `infocard-theme-assignment` skill 中定义的内容形态→主题分流矩阵（20 主题注册池）。根本原因是轻路线（light-route）主线程写卡跳过了 `infocard-authoring-workflow` 的强制主题选择步骤，导致主题分配被旁路。

## Root Cause Analysis

### 直接原因
主线程执行 `light-route` 写卡时：
1. **跳过 content-shape 分类**：未输出 `content_shape` / `theme_primary` / `theme_fallback` / `theme_reject` 四行预发布门禁
2. **跳过 infocard-theme-assignment skill 调用**：未查询内容形态→主题矩阵
3. **未加载对应 style skill**：直接写 HTML 而不读取 `theme/<name>.html` 骨架

### 结构性漏洞
| 门禁 | 状态 | 后果 |
|------|------|------|
| `infocard-authoring-workflow` 强制步骤 | 已定义但 light-route 绕过 | 写卡前无主题分流 |
| 批次多样性门禁（>=2 卡必须独立分类）| 形同虚设 | 全天 16 卡同主题 |
| `meta.yaml.style` 声明 | 可绕过 | style 值可与实际 CSS 完全不同 |
| Mechanical theme implementation gate（4 项检查）| 无脚本化 | 人工可跳过 |

### 今日批次主题分配审计

| slug | 执行主题 | 矩阵推荐 | 判定 |
|------|---------|---------|------|
| `rakazo-grok-bot` | darkblue | hardblue（单工具/CLI） | ❌ 应改 hardblue |
| `awesome-design-md` | darkblue | darkblue（UI组件/演示核心） | ✅ 正确 |
| `zip0-movie-search` | darkblue | hardblue 或 darkblue（网站工具） | ⚠️ 勉强接受 |
| `awesome-dsh-plugin` | darkblue | redswiss（多工具目录/生态对比） | ❌ 应改 redswiss |
| `best-rules` | darkblue | **white-purple**（提示词/笔记方法论） | ❌ 应改 white-purple |
| `cliproxyapi-failover` | darkblue | **black-head**（技术调查/故障复盘） | ❌ 应改 black-head |
| `ljg-skills` | darkblue | hardblue 或 redswiss（技能库目录） | ❌ 应改 hardblue |
| `dashi-ppt-skill` | darkblue | hardblue（工具/CLI手册） | ❌ 应改 hardblue |
| `needle2` | darkblue | hardblue（模型/量化工具） | ❌ 应改 hardblue |
| `easycopy-chrome-extension` | darkblue | hardblue（浏览器扩展/工具） | ❌ 应改 hardblue |
| `teamai-cli` | darkblue | hardblue 或 darkblue（团队工具） | ⚠️ 勉强接受 |
| `openmontage` | darkblue | darkblue（AI视频系统/架构） | ✅ 正确 |
| `diagram-design` | darkblue | hardblue（工具/CLI手册） | ❌ 应改 hardblue |
| `qwen38-27b-uncensored-mlx` | darkblue | hardblue（量化工具/本地LLM） | ❌ 应改 hardblue |
| `json-render` | darkblue | darkblue（AI架构/生成式UI框架） | ✅ 正确 |
| `cc-sessions-viewer` | darkblue | darkblue（桌面应用/多Agent视图） | ✅ 正确 |

**统计**：✅ 正确 5 / 16，⚠️ 勉强接受 2 / 16，❌ 应改 9 / 16

## Solution

### 立即整改（当前批次）

1. **确认是否需要重建**：用户明确偏好"整改方案"，需要判断是"接受现状 darkblue 作为今日批次唯一主题"还是"重建全部 9 张错配卡"
2. **制定重建优先级**：若重建，按 `best-rules`（white-purple）> `cliproxyapi-failover`（black-head）> `ljg-skills` / `dashi-ppt-skill` / `needle2` / `easycopy` / `diagram-design` / `rakazo` / `awesome-dsh-plugin` 顺序

### 结构性修复

#### A. 轻路线门禁加固
在 `infocard-authoring-workflow` 或 `infocard-theme-assignment` skill 中新增：
- 轻路线主线程写卡前**必须**输出预发布四行门禁
- 门禁不完整则阻塞写卡，强制加载 `infocard-theme-assignment` skill
- `meta.yaml.style` 与 HTML 内 `data-theme` 属性一致性检查

#### B. 批次主题多样性门禁（≥2 卡）
- 每张卡独立执行 content-shape 分类
- 同主题超过阈值（如 3 张）自动报警 `THEME_BLOCKED`
- 允许例外：`same_theme_exception` 记录三元理由（content_shape / reader_scenario / information_density 全一致）

#### C. Mechanical theme gate 脚本化
在 `npm run verify` 中新增检查项：
1. `meta.yaml.style` 标准化为注册裸 slug
2. HTML 含 `data-theme="<bare-slug>"`
3. 目标主题 CSS token 存在（`:root` 变量签名）
4. 至少 2 个目标结构签名存在（如 hardblue: `hero-bar` + `section-no`）

#### D. Skill 关系梳理
- `infocard-authoring-workflow`（light-route 短名单）未整合 theme-assignment gate
- `infocard-theme-assignment` 已有完整决策树但未被调用
- 建议合并：在 `infocard-authoring-workflow` 的 light-route 路径中强制插入 theme-assignment 查询

## User Stories

1. 作为信息卡发布者，我希望写卡前有清晰的主题分流依据（content_shape → theme 矩阵），避免凭直觉选主题
2. 作为信息卡发布者，我希望在批次发布（≥2 卡）时自动获得主题多样性检查，避免同一批次主题塌缩
3. 作为质量审核者，我希望在 build/push 前有自动化的 mechanical gate 验证 meta.yaml 声明与实际 HTML 主题实现一致
4. 作为历史追溯者，我希望每张卡片的 `meta.yaml` 记录其 content_shape、theme_primary、theme_reject 决策链，无需读取 HTML 即可判断主题选择是否合理

## Implementation Decisions

- **门禁时机**：写卡前（预发布）vs build 前（机械验证）分离，前者指导创作，后者强制合规
- **theme skill 加载时机**：content-shape 分类后、读 `theme/<name>.html` 骨架前，不可跳过
- **批次门禁粒度**：以单次 `git commit` 中的所有 `2026MMDD-*` 文件为批次评估单元
- **不做的事**：不强制重建历史卡（成本过高），不推翻当前 darkblue 作为高频默认主题的地位（合理），只在新建/重建卡时强制执行矩阵

## Testing Decisions

- 批次发布后人工抽查 3 张卡验证 content_shape 输出是否在 `meta.yaml` 中记录
- `npm run verify` 新增 4 项机械检查，任何一项失败则 exit non-zero
- 未来批次（≥2 卡）发布后检查主题分布，不超过 3 种同主题卡

## Out of Scope

- 历史卡片的批量重建
- 推翻 `darkblue` 作为工具/CLI 类主题的合理性（矩阵中 darkblue 对 AI 架构/Agent 工作台是正确推荐）
- `infocard-publish-sop` 的并行子智能体路径主题治理（子智能体应有独立主题选择能力）

## Further Notes

- `infocard-authoring-workflow` 的 light-route（4 项默认）和 standard-route（完整 SOP）边界已模糊，需要在 skill 内重新明确两者的强制/可选步骤
- 当前轻路线由主线程执行，缺少子智能体的独立 skill 加载上下文，导致 `infocard-theme-assignment` 等 skill 无法被自动触发
- `tabbit-ai-native-browser` 来历不明，可能与本次主题塌缩同批或更早批次遗留，建议后续清理
