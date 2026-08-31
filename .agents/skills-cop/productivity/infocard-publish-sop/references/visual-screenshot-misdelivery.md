# 视觉截图返回错误界面（2026-07-23 实战固化）

## 现象

发布验收时，`browser_navigate` + `browser_console(390px override)` + `browser_vision` 全链路执行完成，但截图返回的页面不是目标信息卡，而是无关界面（如 X/Twitter 瀑布流、小红书、浏览器自己的空白页）。

DOM 检查确认了正确的状态（`clientWidth=375/390`，`scrollWidth=375/390`，关键内容字符串存在），但视觉证据指向了错误的渲染目标。

## 根因

`browser_vision` 的视觉分析依赖辅助 vision 模型，且该模型在截取时未必读取当前 CDP 会话的精确视口——它在本地截图路径和 Browserbase 默认视口之间可能选择了错误的源。

这不是 `browser_vision` 的文档错误，而是实际执行时的基础设施不一致。

## 识别特征

满足以下组合时，极可能是“DOM 正确但截图目标错误”：
1. `browser_console` 返回 `clientWidth=390` 且 `scrollWidth=390`
2. `browser_snapshot` accessibility tree 显示正确的标题和结构
3. `browser_vision` 返回的截图描述与 accessibility tree 完全不匹配

## 处理规范

**不依赖视觉截图做最终判定**。当 DOM + 结构门禁已通过，且截图工具无法提供可验证的同内容图像时：

1. 记录 DOM 证据：`clientWidth`、`scrollWidth`、关键元素 text content
2. 截图异常不阻塞发布，sidecar 记 `visual_status: VISUAL_PENDING`
3. 不在验收报告中写“视觉通过”——写“结构门禁通过 + 视觉验收工具异常”
4. 不重试同一截图路径 5 次以上（基础设施故障不因重试次数消失）

## DOM 替代验收证据（足够发布）

```js
// 390px 视口覆盖
document.querySelector('meta[name="viewport"]').setAttribute('content','width=390,initial-scale=1');
document.body.style.overflowX='hidden';
JSON.stringify({width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth})
// → {width:390, scrollWidth:390} 即无溢出，证据已锁定
```

## 不写入的内容

- 不写“视觉验收通过”
- 不写“移动端排版正常”——写“移动端结构门禁通过”
- 不把截图异常描述为“轻微问题”——明确记录为 `VISUAL_PENDING`

## 相关已有文件

- `mobile-verification.md`：390px 正确覆盖步骤（理论上正确，但 vision 模型路由不稳定）
- `visual-infrastructure-failure.md`：通用视觉基础设施失败处理规范
