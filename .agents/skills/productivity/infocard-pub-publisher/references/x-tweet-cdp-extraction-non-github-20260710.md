# 推文内容 CDP 提取：非 GitHub 型（X 长文 → Telegram / 纯叙事）

> 用户给了 X/Twitter 推文链接，内容为 Telegram 频道分享或纯叙事长文，无 GitHub repo。
> 通过 CDP 直接提取推文正文，避免登录依赖和 curl 绕过反爬。

## 典型场景

- 推文链接到 Telegram 频道（`t.me/...`）
- 纯叙事型长文，无外部链接
- `t.co` 短链接展开后不是 GitHub，而是其他平台

## 已知问题与绕过

### 问题：`browser_navigate` 多 tab 下 `Page.enable` 超时

**原因**：Chrome 有多个已开标签，`Page.enable` 握手卡住。

**绕过路径（已验证）**：

```
1. browser_cdp → Target.getTargets  → 获取所有 tab，找 attached=true
2. browser_cdp → Target.activateTarget → {targetId: "xxx"}
   ⚠ params 必须是 {targetId} 格式，空对象 {} 会报 -32602 Invalid parameters
3. browser_cdp → Page.navigate  → 导航到 tweet URL（可省略，CDP 支持直接操作）
4. browser_cdp → Runtime.evaluate → 提取正文
```

**提取正文脚本**：

```javascript
document.title + ' ||| ' +
(document.querySelector('[data-testid="tweetText"]')?.innerText ||
 document.body.innerText.slice(0, 3000))
```

**提取作者**：`document.querySelector('[data-testid="User-Name"]')?.innerText`

**提取时间**：`document.querySelector('time')?.dateTime`

**提取 t.co 链接**：`document.querySelector('a[href*="t.co"]')?.href`

### 问题：`Page.captureScreenshot` 在 X.com tab 超时

**原因**：X.com 的 CSP/反爬机制干扰该 tab 的渲染上下文。

**表现**：`browser_vision` 截图超时；`Runtime.evaluate` 文本提取正常。

**结论**：截图不可用时，`Runtime.evaluate` 文本提取仍可用，是 CDP 的降级保底手段。

### 问题：`Runtime.evaluate` 返回空

**原因**：tab 未完全激活或 SPA 未完成渲染。

**解决**：先 `Target.activateTarget`，再等 3 秒后执行 evaluate：

```javascript
new Promise(r=>setTimeout(r,3000)).then(()=>{...})
```

## 短链接展开判断类型

```bash
curl -sI "https://t.co/xxx" -L --max-redirs 5 2>/dev/null | grep -i "^location:" | tail -1
```

判断规则：
- 含 `github.com` → GitHub 型，走 `tweet-to-github-resolution-20260709.md`
- 含 `t.me` → Telegram 型，无 repo，记录频道名
- 其他 URL → 独立文章型，提取标题 + 描述

## 工具依赖

- `browser_cdp`（Hermes 原生 CDP 工具）
- `curl` + Python3（备用 HTML 提取）
- Chrome 调试 endpoint 由运行环境提供

## 关键教训

1. `browser_navigate` 在多 tab 时不可靠，改用 CDP 直接操作目标 tab
2. `Target.activateTarget` 的 params 是 `{targetId}` 而非 `{}`
3. 截图超时 ≠ 文本提取不可用；降级到 `Runtime.evaluate` 文本提取
4. X.com 长文可含完整教程，无需 GitHub 也能做卡（选 darkblue 风格）
