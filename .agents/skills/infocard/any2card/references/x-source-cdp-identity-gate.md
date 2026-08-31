# X 来源与 CDP 验收门禁

适用：用户提供 X/Twitter status URL，要求制作或发布信息卡。

## 来源身份

1. 保留用户提供的原始 status URL 与 status ID。
2. 先用现有 Chrome/CDP 或可靠 API 提取正文、显示名、handle、发布时间、媒体和链接。
3. 若 URL 重定向到 `/<handle>/status/<id>`，只能把 handle 作为候选身份；必须由 rendered post 或 API payload 再确认显示名与作者。
4. 页面只有登录壳、导航文本或空 `article` 时，状态为身份/内容未验证；不得从 profile URL、页面标题、搜索摘要或用户名猜测作者和正文。
5. bundle 至少记录：`source_url`、`status_id`、`author_display_name`、`author_handle`、`author_source`、`confidence`、`body_status`。

## agent-browser + CDP

```bash
agent-browser --namespace <unique-run> --session <unique-session> --json tab list
agent-browser --namespace <unique-run> --session <unique-session> --json open http://<preview-host>:<port>/
agent-browser --namespace <unique-run> --session <unique-session> --json get url
agent-browser --namespace <unique-run> --session <unique-session> --json close
```

`/json/version` 只证明 HTTP 调试端点可达，不证明 WebSocket 可用。`Page.enable` 超时通常应先换全新的 namespace/session，避免复用陈旧 daemon。若 WebSocket 握手返回 403 并提示 `remote-allow-origins`，在专用 Chrome 启动脚本中加入明确的本地 Origin allowlist，重启 Chrome 后再验收。只有 `tab list`、本地预览 `open`、`get url` 都成功，才可将 CDP 视觉链路视为可用。

## 交付边界

- X 正文或作者未验证：可以交付阻塞报告，但不能写成详细事实卡。
- 作者已验证但正文仅有摘要：可以做摘要卡，但必须显式标注摘要边界。
- 正文、作者和引用链接均已验证：才进入详细写卡、视觉验收与发布。
