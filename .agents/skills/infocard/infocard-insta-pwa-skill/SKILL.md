---
name: infocard-insta-pwa-skill
description: Use when a published infocard needs its own installable PWA (per-card identity, icon, install entry); authorization required.
category: infocard
version: 1.1.0
spec: specs/infocard-insta-pwa-skill.md
---

# 信息卡单卡 PWA

为指定信息卡创建独立可安装的 PWA：专属名称、图标、入口与 standalone 窗口，与全站 PWA 共存。发布一张普通卡后可以询问一次是否需要单卡 PWA；**未获明确授权不得创建，也不得默认给全部信息卡接入**。适用于新卡和已发布卡；历史卡保持原 URL，不因 PWA 接入重做正文。

发布本身不归本 skill 管：一律复用项目权威流程（`AGENTS.md` 生命周期 + `.agents/skills/productivity/infocard-publish-sop/` + `.agents/skills/infocard/infocard-publish-pipeline/`）。本 skill 只负责 PWA 接入与验收，不维护第二套发布 SOP。

## 硬边界

- 不新增单卡 Service Worker，不修改全站 `sw.js` 与根 `manifest.json`。卡页复用站点 SW：`navigator.serviceWorker.register('/infocard-pub/sw.js', { scope: '/infocard-pub/' })`。
- 不新增离线能力，也不要求禁止既有缓存行为；实测并如实说明联网、更新与断网表现（站点 SW 对 HTML 偏好网络、失败回退缓存）。
- 图标格式、尺寸与验收方法由本 skill 固化；图标图案按卡设计，不固定。
- 仅当原卡已有本地状态或相关交互时保留现状：本地状态放在页面独立 localStorage key，不承诺普通网页、已安装 App 和不同设备共享；无此类状态/交互的卡不新增。具体计数与 JSON 迁移要求见「首个实践参照（my-prompts）」。

## 单卡 App 身份（站点基址 `https://ccwq.github.io/infocard-pub/`）

新建 `docs/<slug>.webmanifest`（与卡同目录，由 promotion manifest 提升到正式路径）：

| 字段 | 值 | 原因 |
|---|---|---|
| `id` | `/infocard-pub/docs/<slug>` | 必须与站点 id `/infocard-pub/` 不同，否则安装时合并身份 |
| `name` / `short_name` | 卡的中文名称（用户确认，如「我的提示词」） | 不与全站 PWA 混淆 |
| `start_url` | `/infocard-pub/docs/<YYYYMMDD>-<slug>.html` | 指向已发布卡原 URL |
| `scope` | 优先与 `start_url` 相同的文件路径 | scope 按 URL 前缀判定；检查站点根及其他卡的实际路径，并实测安装后的导航，不能仅凭配置断言完全隔离 |
| `display` | `standalone` | 独立窗口 |
| `icons` | SVG `sizes:any` + 192 PNG + 512 PNG（purpose any）+ 512 PNG（purpose maskable），`src` 用绝对路径 `/infocard-pub/docs/<slug>-icon-*` | SVG 供桌面，PNG 供移动主屏，maskable 供自适应裁切 |

卡页 head 增补：`<link rel="manifest" href="<slug>.webmanifest">`（同目录相对路径即可）、`theme-color`、`apple-mobile-web-app-capable` / `apple-mobile-web-app-title` / `apple-mobile-web-app-status-bar-style`、`<link rel="apple-touch-icon" href="<slug>-icon-512.png">`（iOS 对 webmanifest 的支持程度以实测为准，这些 meta 作为兜底保留）。

页内安装入口（首屏 hero + 页尾 footer 各一个，可连同中部既有工具栏入口；每个入口 = 一个按钮 + 一个 iOS 说明块）。原卡无 footer 时新增最小页尾容器，保留原正文和交互：

- 多个入口共享同一显示/隐藏状态：各入口按钮带统一标记（如 `data-install-trigger`），由共享的状态切换函数（my-prompts 中为 `setInstallVisible()`）统一显示/隐藏；iOS 说明块（my-prompts 中为 `.pwa-ios`，随 `showIosHints()` 显示）一并显示。这些命名是 `a3abf2c3`（my-prompts 实测模式）的参考实现，不是所有项目的唯一实现；此共享状态模式为单卡 PWA 页固化要求，不泛化到普通信息卡。
- 默认全部隐藏：按钮带初始 `hidden` 属性，JS 初始化即全部隐藏（my-prompts 中即 `setInstallVisible(false)`）；仅在捕获 `beforeinstallprompt`（`preventDefault` 后保存事件）或 iOS 手动说明场景出现。
- 支持直接提示的浏览器：任意入口点击均调 `prompt()` 并处理 `userChoice`；接受或取消后全部隐藏。
- iOS / iPadOS 不支持一键安装：UA + `maxTouchPoints` 检测后在各入口位置显示 Safari「分享 → 添加到主屏幕」手动步骤；不支持一键安装的非 iOS 浏览器提示走浏览器菜单手动添加。
- standalone 检测（`matchMedia('(display-mode: standalone)')` 或 `navigator.standalone === true`）：已安装即隐藏全部入口并提示已在独立应用运行，`appinstalled` 后同样隐藏，避免误导性重复安装引导。
- 浏览器能力差异以实测为准，不得凭字段相似推断支持情况。

## 测试与验收（先助手侧，后用户实机）

- 本地预览复现站点路径前缀；先回读卡页、manifest、图标和 Service Worker 的实际 URL，排除 404 后再判断安装提示。
- 测试离线行为时记录在线预访问、缓存状态和断网步骤；区分已访问后的重载与首次离线打开，不把单次缓存命中当作离线保证。

1. 配置测试：`scripts/test/<slug>-pwa.test.js`（Node 原生 test，参照 `my-prompts-pwa.test.js`）断言：id 与站点 id 不同、`start_url` 落在 `scope` 内、其他卡 URL 与站点根不在 scope、icons 四件套齐全、display standalone、安装入口按钮总数与位置（首屏 hero 与页尾 footer 各一）、按钮默认 `hidden` 且由共享状态统一显示/隐藏（实现命名按卡自定，my-prompts 为参照）。随 `npm test` 全量回归。
2. 功能回归：仅当卡存在既有交互时验证其在接入 PWA 后不受影响；无此类交互的卡不适用（my-prompts 的复制、计数、排序、导入导出为首个实践的具体要求，见下节）。
3. scope 实测：以真实浏览器分别从目标卡、站点根 `/infocard-pub/`、其他卡观察导航与窗口行为，验证与全站 PWA 共存。
4. 视觉证据：桌面与移动视口真实截图（统一经 `web-capture`），带可追溯几何；任何 HTML 改动后重新截图。
5. 发布按权威流程执行；上线后回读：卡页、`<slug>.webmanifest`（应为 `application/manifest+json`）、四个图标、站点 `manifest.json`、`sw.js`、索引入口全部 200，线上指纹与本地一致。
6. 状态标记：实机反馈前标记「等待用户验证」。浏览器安装提示、DevTools 模拟或 UA 覆盖都不等于实机安装通过；未经用户在目标设备确认的内容必须标明验证状态。

## 首个实践参照（my-prompts）

- 线上最新提交 `a3abf2c3`（publish: my-prompts install entry at hero + footer）：首屏 hero 与页尾 footer 安装入口，与中部工具栏入口共享 `data-install-trigger` / `setInstallVisible` 状态；按钮默认隐藏，仅由 `beforeinstallprompt` 或 iOS 手动说明路径显示，`appinstalled` / 接受 / 取消后隐藏；测试断言 3 个触发按钮、hero/footer 位置与默认隐藏。
- 基础提交 `e35bf7c8`（publish: my-prompts PWA upgrade）。manifest `docs/my-prompts.webmanifest`：name「我的提示词」，id `/infocard-pub/docs/my-prompts`，start_url/scope 均为 `/infocard-pub/docs/20261115-my-prompts.html`，icons `my-prompts-icon{.svg,-192.png,-512.png,-maskable-512.png}`。本地未跟踪副本（卡页与测试文件）停在 `e35bf7c8` 状态，webmanifest 两版一致；线上已是 `a3abf2c3`。
- 助手侧已验证（2026-11-15 公网实测）：卡页、manifest、4 个图标、站点 `manifest.json`、`sw.js` 全部 HTTP 200，内容与当时的 e35bf7c8 一致；线上更新到 `a3abf2c3` 时附带重新截图的视觉门禁证据（绑定 ad220713，0 critical / 0 major，桌面+移动）。后续上线回读须按当前线上指纹重新核对，不沿用旧结论。
- 实机安装：用户已于 2026-11-15 在自己的设备实机安装并确认安装可用（设备与浏览器型号未记录）；该确认不覆盖图标辨识度（未获用户确认），也不代表所有平台通过，其他平台仍以逐台实测为准。

## 验收

- [ ] 用户明确授权在案；未自动给其他卡接入
- [ ] 原 URL、正文、既有交互保持不变
- [ ] manifest id 独立、start_url∈scope、scope 基于当前路径前缀并经真实安装验证（配置测试 + 真实浏览器实测双重确认；未实测的部分明示）
- [ ] 图标四件套齐全且公网可读；手机尺寸下可辨认
- [ ] 首屏与页尾安装入口就位、共享触发状态；默认隐藏，支持直接提示时可触发，已安装状态无重复引导；不支持时对应平台手动说明可见
- [ ] 复用站点 SW，未新增/修改任何 Service Worker
- [ ] 桌面+移动截图为当前版本，几何可追溯
- [ ] 上线回读全部 200，指纹一致
- [ ] 未实机验证项已标「等待用户验证」
