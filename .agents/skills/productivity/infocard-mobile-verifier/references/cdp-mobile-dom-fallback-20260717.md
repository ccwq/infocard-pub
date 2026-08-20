# CDP Mobile DOM Fallback（2026-07-17）

## 场景
信息卡公网页面需要 390px 移动端验收，但本地 Chrome headless 截图持续超时。页面已在可访问的浏览器 tab 中打开时，可用 CDP 做确定性结构/可读性验收；这不能替代真实视觉截图。

## 复现流程

1. 通过 `Target.getTargets` 找到目标 page tab。
2. 用 `Emulation.setDeviceMetricsOverride` 设置：`width=390`、`height=844`、`mobile=true`、`deviceScaleFactor=1`。
3. 用 `Runtime.evaluate` 读取：
   - `innerWidth`
   - `document.documentElement.clientWidth`
   - `document.documentElement.scrollWidth`
   - `document.documentElement.scrollHeight`
   - 关键文字节点的 `getComputedStyle(...).fontSize`
4. 判定：
   - `scrollWidth <= clientWidth` 才算无横向溢出；
   - 正文/证据标签不得低于 11.2px；
   - 关键内容元素不得超出视口；
   - 仍将视觉状态记为 `VISUAL_PENDING`，除非取得真实截图并完成视觉检查。

## 实际修复案例

贾浅浅舆情信息卡最初在 390px CDP 检查中发现 12 个 `.source` 证据标签为 11px。通过独立 worktree 做最小 CSS 修改，在 `@media(max-width:720px)` 中增加 `.source{font-size:11.5px}`，然后执行：

- `npm run build`
- `npm run verify`
- `npm run check-leak -- --file docs/<slug>.html`
- rebase 到最新 `origin/main` 后 push
- 公网 `curl` HTTP 200 与源码规则核验
- reload 公网页面，再次读取 computed style

最终结果：390px 下 `scrollWidth=375`、`clientWidth=375`，12 个证据标签均为 11.5px，低于 11.2px 的可见文字为 0。

## 注意

- 不要把截图超时写成页面失败；应报告为“结构性门禁可验证，真实视觉证据缺失”。
- 不要把 DOM 门禁写成“视觉通过”。
- 修改后必须验证公网部署版本，而不是只看本地 worktree。
- Pages/CDN 可能缓存旧 HTML；先用 `curl` 看远端源码，再 reload 浏览器 tab。
