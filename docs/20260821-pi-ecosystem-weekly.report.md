# Pi 生态周报｜研究与发布报告

## 来源与查重

- 主来源：X `https://x.com/yibie/status/2088808780733821402`，作者 `yibie`。
- 已通过 API 读取原帖正文与互动快照；正文把 `99.93%`、`$2.65`、近十亿 token、`$0.25/M` 写成用户实测/社区转述，不写成官方承诺。
- 已查重项目内 Pi 相关卡片（Pi extensions、Pi workflow、Pi Bifrost、Pi peer 等）；本卡对象是新的“Pi 生态周报”周度汇总，不覆盖既有单项目卡。

## 官方版本核验

- [v0.84.0](https://github.com/earendil-works/pi/releases/tag/v0.84.0)：`AGENTS.override.md`、fullscreen TUI、Mermaid/LaTeX、advanced custom model sampling。
- [v0.84.1](https://github.com/earendil-works/pi/releases/tag/v0.84.1)：Qwen Token Plan Individual、`pi auth check`、扩展 tool_call terminate。
- [v0.84.2](https://github.com/earendil-works/pi/releases/tag/v0.84.2)：fullscreen transcript search、`defaultTools`、实验性 strict JSON Schema constrained sampling；修复 custom tools 保留与 DeepSeek 不支持 output limit 等问题。

## 价格与缓存边界

- 官方价格来源：[DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)。
- 官方机制来源：[Context Caching](https://api-docs.deepseek.com/guides/kv_cache/)。官方说明缓存按 prefix、best-effort 工作，并通过 `prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` 回报命中状态。
- 社区插件来源：[pi-cache-optimizer](https://www.npmjs.com/package/pi-cache-optimizer)。其稳定前缀、session affinity、compat 诊断与只读统计属于插件实现/建议，不改变 provider-side cache 的 best-effort 属性。
- 任何命中率、节省金额、倍率只能按具体实验的 provider、路由、模型、时间窗口与 usage 解释；生产预算按全 miss 设计。

## 主题覆盖

- `pi-cache-optimizer`
- `AGENTS.override.md`
- `defaultTools`
- JSON Schema constrained sampling
- `deep_think`（明确标注为社区工作流技巧）
- 插件生态：research、sandbox、CDP、runtime、skills、subagent、code intelligence

## 本轮变更

- `docs/20260821-pi-ecosystem-weekly.html`
- `docs/20260821-pi-ecosystem-weekly.html.meta.yaml`
- `docs/20260821-pi-ecosystem-weekly.report.md`
- 构建生成：`_index.yaml`、`index.html`

## 视觉状态

`PUBLISHED_PENDING_VISUAL`：本轮 Chrome 视觉检查按已知超时处理，未取得可靠的 desktop/mobile 截图与结构化结论；不将静态检查或 HTTP 200 说成视觉通过。

本卡包含多列布局、表格、代码块与 fixed 保存按钮，视觉门禁为必需。若本轮视觉基础设施无法提供可靠的 desktop/mobile 截图与结构化结论，则终态必须写为 `PUBLISHED_PENDING_VISUAL`，不能把静态检查或 HTTP 200 说成视觉通过。
