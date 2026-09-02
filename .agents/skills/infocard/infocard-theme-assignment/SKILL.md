---
name: infocard-theme-assignment
description: Use before infocard .docs authoring to select a registered theme from content-aware candidates. Owns the only content-to-theme association, capability filtering, bounded reproducible variation, and theme-decision.json.
version: 3.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, theme, assignment, capability, decision-record]
    related_skills: [infocard-content-types, infocard-authoring-workflow, infocard-publish-sop]
---

# 信息卡主题分配

## 职责

本 skill 是唯一的内容—主题关联入口，负责：

- 接收已确定的 `content_type`、`content_shape` 和结构需求；
- 从已注册主题生成候选池；
- 按能力过滤主题并记录排除原因；
- 处理用户指定主题；
- 在合格候选中进行有界加权随机选择；
- 在 `.docs/<run-id>/<slug>/theme-decision.json` 写入唯一决策记录。

内容类型只声明结构需求，选题只判断价值，authoring 只消费决策，publish 只验证决策。不要新增或调用第二个 content-theme router，也不要在这些模块复制具体主题映射。

普通 `project-brief` 单卡只做一次主题决策：在 authoring 前从已验证、满足 `mobile_layout` 与当前内容能力的候选池中冻结选择；authoring 后不重新排名。若视觉证明确认不适配，最多切换一次，生成新 decision 并使旧截图和 visual manifest 全部失效。

## 工作流

1. 确认 `content_type`、`content_subtype`、`content_shape` 和 `required_modules` 已由内容模块确定。缺失时停止并回到内容分类，不猜主题。
2. 从 `theme/themes.json` 读取主题注册表和实际模板；注册表是主题元数据唯一机器来源，不能虚构主题，也不能只依据 sidecar 的 `style` 判断主题存在。
3. 根据内容形态生成候选池。候选是倾向和能力起点，不是固定 Primary/Fallback 绑定；同一内容形态允许多个合格主题。
4. 对每个候选检查：长标题承载、信息密度、表格、代码、流程/关系模块、图片/风险面板和移动端结构。将不支持项写入 `excluded_themes`，不得静默丢弃。
5. 若用户指定主题，先放入校验路径：主题已注册、能力满足、能通过视觉门禁则选择；不满足时记录原因并返回合格替代候选，不能无条件服从或静默改选。
6. 无用户指定主题时，在过滤后的候选池执行 bounded weighted random。随机只用于小范围变化，不能选出池外主题；`seed` 必须保留，便于同一运行复现。
7. 在写 HTML 前完成并冻结 `theme-decision.json`。authoring 不得覆盖已冻结的选择；任何 override 或主题切换都要生成新的记录并使旧视觉证据失效。

## 能力与选择规则

主题能力至少使用以下键表达，不能用主题名称推断能力：

```json
{
  "long_title": true,
  "dense_content": true,
  "tables": false,
  "code_blocks": true,
  "process_blocks": true,
  "imagery": false,
  "risk_panels": true,
  "mobile_layout": true
}
```

候选主题的权重应体现内容可读性和组件覆盖，不能把随机当作无约束抽签。最近重复主题、未注册主题和能力不足主题可排除，但每项都必须有稳定理由。若过滤后为空，返回 `THEME_BLOCKED`，不要降低能力门槛；用户可随后改变内容结构或明确授权主题重建。

## 决策记录

决策记录的最小结构见 [`references/theme-decision-schema.md`](references/theme-decision-schema.md)。实现位于 [`scripts/theme-decision.js`](scripts/theme-decision.js)，供 authoring/publish 读取和校验。至少包含：

`content_type`、`content_shape`、`candidate_themes`、`excluded_themes`（含 reason）、`selection_weights`、`seed`、`selected_theme`、`user_override`。

`selected_theme` 必须是 `theme/themes.json` 中声明且对应 `theme/*.html` 的 bare slug。sidecar、bundle 和 HTML 均使用同一个 bare slug；HTML 使用 `data-theme`，三者不一致即阻塞。决策记录还必须绑定对应的 `style_skill`（例如 `wood` → `infocard-wood-style`），供 Authoring 和 Publisher 校验；不能只写主题名而不执行对应 Style Skill。用户指定主题时，`user_override` 记录请求值、是否接受和理由。

## 批量与重建

- 普通单卡只执行候选能力校验和记录，不强制批量 diversity、重复审查或复杂 fallback 字段。
- 批量复用或主题重建才增加重复主题检查；同主题例外需记录内容形态、读者场景和信息密度理由。
- 视觉失败先修当前主题的 HTML、DOM、CSS、响应式或内容问题。只有确认是主题能力不适配且完成约定修复轮次后，才从合格池切换主题；切换后重新执行完整桌面与移动视觉门禁。

## 边界与验收

本 skill 只选择和验证主题契约，不读取具体 style skill 以外的发布权限，也不直接写 `docs/`、`assets/`、Git state、生成索引或执行 build/commit/push。禁止 worktree、clone、detached HEAD 和 `/tmp/infocard*`。不得维护第二套主题注册表、主题别名表或默认主题。

验收至少确认：决策记录完整且可解析；固定 seed 得到相同选择；不同获批 seed 只在过滤池内变化；用户主题优先但不绕过能力检查；authoring 和 publish 不包含第二套主题选择规则。

## 编排硬门禁（2026-08-27）

- 委派 Author 前必须已经生成并冻结 `.docs/<run-id>/<slug>/theme-decision.json`；缺失时返回 `THEME_BLOCKED`，不得让 Author 自行选择主题或回退到 `hardblue`。
- 委派 prompt/context 不得包含 `Theme: <具体主题>`、`Create a <具体主题> card` 或任何等价的预选指令。只能要求 Author 消费 `theme-decision.json.selected_theme`。
- `selected_theme` 必须来自 `theme/*.html`，并与 HTML `data-theme`、sidecar `style` 三方一致。
- 批量任务必须额外记录近期主题分布和多样性检查结果；重复主题可以被能力门禁保留，但必须有显式 `diversity_exception` 与审查理由。
- 可执行门禁：`npm run verify:theme-delegation -- --context <prompt.txt> --decision <theme-decision.json>`；失败码非 0 时不得启动 Author。批量可用 `npm run verify:theme-diversity -- --themes <theme-sequence.json>`。

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-orchestrator#theme-route`。显式主题必须保持身份；本入口不得形成第二套主题最终判断。
