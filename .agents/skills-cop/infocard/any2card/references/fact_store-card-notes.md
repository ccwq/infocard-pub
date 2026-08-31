# fact_store 信息卡制作与发布记录

## 本次任务目标
将 Hermes 的 `fact_store`（Holographic 外挂记忆）做成一张可直接发布的高密度信息卡，面向新用户解释：
- 常用工作流
- 使用技巧
- `fact_store` 的全能力
- 上手建议与典型场景

## 这次内容组织上最有效的结构
1. **常用工作流**
   - 写入
   - 检索
   - 关联
   - 校验
   - 维护
2. **使用技巧**
   - 实体化记录
   - 相关事实合并存储
   - 先 search / probe，再 update / remove
   - 用 trust 管理可信度
3. **能力全景**
   - `add / search / probe / related / reason / contradict / update / remove / list`
4. **上手建议与典型场景**
   - 用户偏好、机器环境、工具 workaround、项目约定

## 审查反馈中值得固化的改进点
- 新用户更容易上手的关键，不只是“列出动作”，而是给出 **推荐使用顺序**：
  `add → search/probe → related/reason → contradict → update/remove`
- 需要补一段“**什么时候不该用 fact_store**”：
  临时日志、一次性任务、短期噪音、未确认猜测。
- 对能力的描述要收敛，避免把 `reason` / `related` / `contradict` 说成通用大模型推理；应明确它们是**事实检索 / 关联 / 冲突检测 / 组合查询**。
- 对外发布前，先做一次“内容覆盖 + 新手可用性 + 视觉边界”的审查，再决定是否直接发布。

## 发布过程中的实用约定
- `raw` 链接通常比 GitHub Pages 更快可用，可先交付 raw。
- Pages 可能短暂 404，通常是构建刷新延迟，不要误判为发布失败。
- 适合先由内容审核（是否适合发布），再做最终发布。
