# 调研报告：OpenRouter Fusion / OrcaRouter / DRACO

## 调研目标
核查以下主张是否站得住：
- 多模型融合是否已进入公开工程化阶段
- OpenRouter Fusion / OrcaRouter 代表的是什么路线
- DRACO 结果是否足以支持“轻量开源模型通过融合反超高阶闭源模型”
- 这是否意味着竞争点从卷单模迁移到卷应用工程架构

## 核心结论
1. **是，公开工程化已成立。** 公开 repo 已能验证 router + panel + judge 这条路线真实存在。
2. **“全面反超高阶闭源模型”不成立；“在特定 benchmark / 配置下逼近或压过部分闭源单模型”成立。**
3. **系统上限更多由 judge、retrieval 与 agentic loop 决定，而不是简单多路投票。**
4. **“从卷模型到卷架构”这个判断是合理推断，并且有足够工程信号支撑。**

## 证据分层

### A. 一手公开证据
#### 1) Continuum-AI-Corp/OrcaRouter-Lite
- GitHub: https://github.com/Continuum-AI-Corp/OrcaRouter-Lite
- README 定位：Self-hosted LLM router with a managed safety net
- 明确特征：OpenAI-compatible / BYOK / single-workspace / streaming / `model="auto"`
- GitHub API 核查（2026-06-18）：503 stars / 47 forks / Python / created 2026-05-03

#### 2) vcup-date/local-llm-fusion
- GitHub: https://github.com/vcup-date/local-llm-fusion
- README 定位：Local fusion inference for llama.cpp models，N 个 panelists + 1 个 judge，复现 OpenRouter Fusion / fusion-fable pattern
- 明确特征：OpenAI-compatible API、DRACO benchmark、RAG、MTP speed tests
- GitHub API 核查（2026-06-18）：created 2026-06-14 / Python

### B. 一手 repo 直接可引述结论
来自 `local-llm-fusion` README：
- synthesis helps a little, retrieval helps a lot
- judge matters more than the panel
- budget panel ≈ frontier solo（但 local economics 可能反转）
- 与 deep-research system tier 仍有明显差距，差在 retrieval / agentic-loop quality

### C. 二手公开报道
检索结果中存在多篇 2026-06-15 ~ 2026-06-17 中文技术媒体报道，核心叙事一致：
- OpenRouter 上线 Fusion
- 预算级模型组合在 DRACO 上逼近 / 打平部分前沿模型
- 成本约为前沿模型的一半或更低

这些报道可作为佐证，但不应单独作为最终定论。

## 未证实项 / 限制
- 当前环境直连 `https://openrouter.ai/`、`/docs`、`/api/v1/models` 遭遇 TLS EOF，未拿到官方 Fusion 原文说明。
- 因此：
  - 不能把 OpenRouter 官方内部实现细节写成铁证
  - 不能把某些二手媒体里的具体分数全部视为官方最终口径

## 最终口径
适合公开写法：
> 多模型融合技术已经证明：通过统一路由、并行面板、judge 裁决和检索增强，预算级开源模型可以在部分深度研究 benchmark 上逼近、乃至压过部分高阶闭源单模型；但它的真正上限仍取决于 retrieval 与 agentic loop 等系统工程能力，而不是投票本身。

不适合公开写法：
> 开源小模型已经全面反超最强闭源模型。
