# Qwen3.8-27B 本地部署卡报告

## 交付范围

- HTML：`docs/20260817-qwen38-27b-local-deploy.html`
- 元数据：同名 `.meta.yaml`
- 主题：`hardblue`，实际沿用 `theme/hardblue.html` 骨架并重写业务内容
- 内容形态：single high-density deployment decision manual

## 主题决策记录

- `content_shape`: single high-density deployment decision manual
- `theme_primary`: hardblue
- `theme_fallback`: blue-technical-manual
- `theme_reject`: darkblue（架构叙事不是中心）；redswiss（不是多工具目录/横评）
- 实现签名：`data-theme="hardblue"`、42px 网格底纹、3px 黑边、红/黑/蓝 `hero-bar`、96px 编号块、`risk-grid`、`matrix`、代码块与移动端卡片化替代。

## 事实边界

官方模型卡确认：27B dense、vision encoder、图像/视频理解、262144 context、Apache-2.0、BF16/FP8 方向。卡内没有把约 1M 上下文写成默认能力，也没有伪造统一显存或吞吐排名。Qwen3.6 部署信息仅作为“不可无条件迁移”的边界提醒。

Smartpig Article 快照被保留为社区体验/数字线索层，不升级为官方性能结论。

## 部署决策

- 24GB：Q4、短/中上下文、LM Studio 或 llama.cpp，先做健康检查。
- 48GB：Q5/FP8，先验证视觉后端与 KV cache 预算。
- 80GB：BF16/FP8，可做服务化试验，但吞吐必须绑定硬件、后端、量化、上下文和 batch/concurrency。

## 验收记录

- 视觉要求：先 `390x844`，再 `1440x900`。
- 每个视口必须确认 URL、title、readyState，并给出 `critical / major / minor`。
- 本文件在视觉验收完成后更新为最终状态；视觉未通过时不得 push。
