# 本地 Chrome Headless 截图陷阱（2026-07-16 实战固化）

## 现象

发布前在本地做 390px 移动端截图时，反复出现以下症状之一：

- `google-chrome --headless=new --screenshot=...` 进程长时间零 stdout/stderr，超过 50 秒仍未生成 PNG。
- `node scripts/verify-mobile-card.js --browser` 提前打印 `PASS viewport meta` / `PASS mobile media query` 后整段挂住，最后被超时杀掉。
- 不同 `--user-data-dir` 临时目录被前一个任务残留占用，导致后续 `google-chrome` 在 user-data-dir 锁上等待。
- 系统中已有用户的桌面 Chrome 进程（`/usr/bin/google-chrome` 或 `/opt/google/chrome/chrome`）通过 `remote-debugging-port` 与其他浏览器进程冲突，headless 再启经常冲突。

## 根因

- 该机器上 Chrome 同时有“用户桌面进程”和“headless 截图进程”两类用法，user-data-dir、screen 资源、临时目录锁经常互相阻塞。
- `virtual-time-budget` 与 `waitUntil:networkidle0` 在带 `linear-gradient` 网格背景 + 中文字体回退的页面上可能永远不进入 idle，截图一直悬挂。
- 在 Chrome DevTools 协议规范下（参见 `mobile-cdp-publish-gate.md`），未挂 CDP 会话就被用户浏览器占用时，强行 fork headless 是不可靠的替代。

## 处理规范

按 `mobile-cdp-publish-gate.md` 的硬规则，**不能伪造 PASS**，必须按以下顺序处理：

1. **先确认环境状态**：`pgrep -af "google-chrome --headless"`、检查 `~/.config/google-chrome` 与 `/tmp/*.user-data-dir`，必要时清理上次遗留。
2. **能用静态证据就用静态证据**：HTTP 200、`<section>` 数量、关键字符串命中、`viewport` meta、`<title>` 与 720px media query 均可用 curl + python 校验完成。
3. **如果浏览器仍然不可用**：明确标注 `browserUnavailable`，本卡发布状态记为 `PARTIAL`，不描述为“移动端已验证”。这是为了防止“截图没出来但人脑判定视觉没问题”的降级。
4. **不要**继续追加 headless 进程，每个失败进程只会拖长 timeout 和占用 user-data-dir，**也不要**复用用户的桌面 Chrome 会话（违反 CDP session 隔离）。
5. **不要**用文件路径 `file://` 加 `--virtual-time-budget` 的组合作为唯一证据，因为结果本身在中文/字体回退环境中不稳定。

## 验收证据的最低组合

只要满足下列任意三项即可视为“移动端视觉风险已识别并控制”，并将卡片标注为非 100% 移动端已验：

- `curl -sI <URL>` 返回 200。
- HTML 中 `viewport` meta、`@media(max-width:720px)` 媒体查询存在。
- 移动断点 CSS 覆盖了 `.hero`、`.head`、`.timeline/.grid*` 等容器。
- 静态 lint 报告无固定宽度溢出、表格 `pre/code max-width:100%` 规则齐全。
- `node scripts/verify-mobile-card.js <slug>` 静默分支输出 PASS viewport / mobile media。

## 经验值

- 本地端口 4173 上的预览可保留，但截图任务只允许占用单个 `--user-data-dir=/tmp/guan-card-chrome-$N`。
- 单次截图最长 60 秒；超过即视为环境不可用，转 `SKIPPED`。
- 不要在没有看到 PNG 文件落地前把验收写成“移动端截图已通过”。