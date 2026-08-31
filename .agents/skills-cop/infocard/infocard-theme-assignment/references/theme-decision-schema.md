# theme-decision.json 契约

文件位置固定为 `.docs/<run-id>/<slug>/theme-decision.json`，它是一次 authoring run 的唯一主题决策源。

```json
{
  "version": 1,
  "content_type": "tool",
  "content_subtype": "cli",
  "content_shape": "single technical tool",
  "required_capabilities": ["long_title", "code_blocks", "mobile_layout"],
  "candidate_themes": ["hardblue", "redswiss", "blue"],
  "excluded_themes": [{ "theme": "q", "reason": "dense code is unsupported" }],
  "selection_weights": { "hardblue": 0.5, "redswiss": 0.3, "blue": 0.2 },
  "seed": "run-20260827-01",
  "selected_theme": "hardblue",
  "user_override": { "requested": null, "accepted": false, "reason": null },
  "batch_context": {
    "recent_themes": [],
    "diversity_review_required": false,
    "diversity_exception": false,
    "diversity_exception_reason": null
  }
}
```

验证规则：

- 所有主题均为 `theme/*.html` 的 registered bare slug；`selected_theme` 必须在 `candidate_themes` 中。
- `excluded_themes` 的主题不得进入候选池，且每项必须有非空 `reason`。
- `selection_weights` 只能包含候选主题，权重为有限的非负数，至少一个权重为正。
- `seed` 非空且在同一 run 内固定；它用于复现选择，不是放宽能力过滤的凭据。
- `user_override.requested` 非空时，`accepted=true` 只能在请求主题注册且能力校验通过时成立。
- `selected_theme`、HTML `data-theme` 与 sidecar 规范化 `style` 必须一致。
