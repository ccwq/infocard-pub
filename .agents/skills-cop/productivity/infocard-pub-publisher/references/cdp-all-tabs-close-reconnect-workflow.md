# CDP Browser：关闭全部 Tab 后重连（2026-06-26 实测）

## 场景

浏览器积累大量 tab 导致内存/CPU 压力，或需要干净的浏览器状态。

## 标准关闭全部 Tab 流程

```bash
# 1. 列出所有 page tab
browser_cdp(method='Target.getTargets', params={})

# 2. 逐个关闭（排除 service_worker）
browser_cdp(method='Target.closeTarget', params={"targetId": "<targetId>"})

# 3. 验证：只剩 service_worker
browser_cdp(method='Target.getTargets', params={})
```

## 重连

关闭所有 page tab 后，`browser_navigate` 可重新成功连接。

## 已知坑：Page.enable 超时

若 tab 的 CDP 会话异常（如目标页面有验证码 iframe 导致阻塞），
`browser_navigate` 可能卡在 `Page.enable` 超时。

**判断**：连续 2 次 `browser_navigate` 超时 → CDP 端点仍活着但会话阻塞。

**兜底**：直接用 `browser_cdp` 操作特定 target_id：

```bash
# 找当前存活的 tab
browser_cdp(method='Target.getTargets', params={})

# 激活
browser_cdp(method='Target.activateTarget', params={"targetId": "<id>"}, target_id="<id>")

# 直接导航
browser_cdp(method='Page.navigate', params={"url": "https://..."}, target_id="<id>")
sleep 3

# 截图
browser_cdp(method='Page.captureScreenshot', params={"format": "png"}, target_id="<id>")
```

## 根因

MiniMax 平台页面（含验证码 iframe）导致 CDP supervisor `Page.enable` 阻塞。
关闭相关 tab 后重连即可恢复。
