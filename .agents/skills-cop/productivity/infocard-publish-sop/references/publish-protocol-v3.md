# Infocard Publish Protocol v3

本文件是 `infocard-publish-sop` 的唯一执行参考。主 SOP 只保留生命周期、职责、状态和入口；详细字段与边界在这里维护。

## Canonical lifecycle

```text
Research
→ .docs/<run-id>/<slug>/ candidate
→ frozen theme-decision.json
→ Author card.html + sidecar + promotion-manifest.json
→ Publisher validates and promotes exact files
→ local visual gate
→ build / verify / taxonomy / leak
→ narrow stage / commit / push
→ public detail/index/home and visual recheck
```

## Authoring contract

Author 只能写 `.docs/<run-id>/<slug>/`，至少包含：

- `card.html`
- `card.html.meta.yaml`
- `theme-decision.json`
- `promotion-manifest.json`
- `facts.json` 或 `research.md`
- `visual/`（如流程要求）

Author 不得写正式 `docs/`、`assets/`、`_index.yaml`、`index.html`、Git state 或 worktree。

## Theme contract

唯一主题注册表：`theme/themes.json`。

唯一决策文件：`.docs/<run-id>/<slug>/theme-decision.json`。

最终候选必须满足：

```text
theme-decision.json.selected_theme
= HTML data-theme
= sidecar style
= manifest bundle.style
```

`theme/<slug>.html` 是完整模板骨架，不是 stylesheet。最终 `card.html` 必须自包含；不得使用隐式默认主题或仅修改 accent 冒充换主题。

## Promotion contract

Publisher 通过：

```bash
node scripts/promote-infocard.js --manifest .docs/<run-id>/<slug>/promotion-manifest.json
```

只提升 manifest 声明的 HTML、sidecar 和 assets。禁止提升过程文件、截图、bundle、生成索引或未声明输出。

## Release gates

Promotion 后依次执行：

```bash
npm run verify:visual-gate -- docs/<slug>.html
npm run build
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
```

构建会修改共享索引。Publisher 必须记录 ambient changes，并只 stage 当前发布范围与必要生成索引；禁止 `git add -A`。

## Public verification

Push 后使用 cache-busting 验证：

- `https://ccwq.github.io/infocard-pub/docs/<slug>.html`
- `https://ccwq.github.io/infocard-pub/_index.yaml`
- `https://ccwq.github.io/infocard-pub/index.html`

验证状态码、页面身份、目标主题、release-specific fingerprint；再重新进行公网桌面与 390px 移动视觉检查。HTTP 200 单独不足以证明发布完成。

## Exceptions

视觉失败尝试、修复轮次、`VISUAL_EXCEPTION_AFTER_MAX_REPAIRS` 和 `VISUAL_PENDING` 的字段与判定全部由 `visual-verification-gate` 所有。本协议只消费其结果，不复制规则。

## Error states

- `THEME_BLOCKED`：主题决策缺失、无效或三方不一致。
- `VISUAL_BLOCKED`：存在 critical/major 缺陷。
- `BLOCKED_AT_LOCAL_GATE`：本地静态门禁失败且定向修复后仍失败。
- `BLOCKED_AT_INTEGRATION`：非 fast-forward 等集成失败，受控 reconcile 一次仍失败。
- `VISUAL_PENDING`：视觉基础设施不足，不能伪装成通过。

## Closeout

保留 `.docs/<run-id>/<slug>/` 证据。报告 authoring path、manifest、promotion、local gates、commit、public identity/index、local/public visual 和终态。不要自动同步 Wiki，不要清理历史 worktree。

## Ownership

- `AGENTS.md`：仓库与 Git 安全边界。
- `infocard-theme-assignment`：主题选择与决策记录。
- `visual-verification-gate`：视觉证据与视觉例外。
- 本文件：Protocol v3 发布执行字段与状态。
- `infocard-publish-sop`：生命周期与角色编排。

出现冲突时，以上所有权边界优先于旧 reference 或历史经验。
