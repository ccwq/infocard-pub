# 移动端 CDP 发布门禁：隔离、安全与证据优先级

## 适用范围

用于信息卡发布前的 390px 浏览器验收。该门禁必须产出可复核证据；浏览器不可用时只能 `SKIPPED` 并阻断发布，不能静默降级为静态 PASS，也不能擅自启动本地 headless 替代用户指定的浏览器环境。

## CDP 生命周期

- 连接已有 browser-level CDP endpoint（默认或显式配置），不要选择并导航用户现有标签页。
- 创建专用 target；条件允许时创建独立 browser context。
- 使用 `Target.attachToTarget(flatten=true)`，所有 Page/Runtime/Emulation 命令携带专用 `sessionId`。
- `finally` 中只 detach/close 本次创建的 session、target、context；不得关闭或改变用户原有页面。
- WebSocket 必须覆盖连接超时、命令超时、close/error、畸形 JSON；连接失败返回 `SKIPPED` 非零退出。

## 页面与截图证据

- 固定 `width=390`、`deviceScaleFactor=1`；runner 返回后由门禁重算 `scrollWidth > clientWidth + 1`，不信任自报布尔值。
- `Page.navigate` 报错、readyState/字体/图片在硬超时前未稳定，均为 FAIL。
- 截图路径必须精确为 `artifacts/mobile/<slug>.png`。
- 在删除、创建和读取截图前，检查 repo、artifacts 父目录及目标的 realpath/符号链接 containment；目录 symlink 指向仓库外必须拒绝。
- 证据至少验证 PNG 8-byte signature、IHDR、合理宽高及非零大小；任意字节文件不能冒充截图。

## 批量状态优先级

- 单卡横溢、断图、静态规则失败、截图失败：`FAIL`，继续检查后续卡。
- 在任何真实 FAIL 已发生后，即使后续 CDP 不可用，总体仍为 `FAIL`；可附带 `browserUnavailable`，但不得被 `SKIPPED` 覆盖。
- 若尚无卡完成验证且 CDP 全局不可用：`SKIPPED`，非零退出，等待人工决策。
- 参数或 bundle 配置错误使用 usage/config 非零状态，不能伪装成 PASS。

## 静态门禁

- 去除 HTML/CSS 注释及字符串干扰后检查 viewport、移动端 media rule。
- `table`、`pre`、`code`必须具有 `max-width:100%`与 `overflow-x:auto`或语义等价规则。
- 静态门禁不能替代真实 390px CDP 截图。

## 回归测试清单

1. 不导航现有 target；专用 target/session 总会清理。
2. artifacts 目录 symlink 外逃被拒绝，外部 sentinel 不变。
3. 先 FAIL、后 BROWSER_UNAVAILABLE，总体仍 FAIL。
4. WebSocket connect/close/parse timeout 不挂起。
5. readyState 超时为 FAIL。
6. 假 PNG、空文件、错误尺寸为 FAIL。
7. CDP 缺失为 `SKIPPED`非零，不启动本地 headless。
