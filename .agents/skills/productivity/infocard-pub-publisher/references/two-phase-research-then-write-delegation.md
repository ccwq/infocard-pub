# 两阶段调研-写卡标准流程（2026-07-09 固化）

## 触发条件

用户明确要求：
```
# agent1：只调研（输出结构化报告、素材、要点、事实核验）
# agent2：只写卡（HTML / meta.yaml / wiki 草稿）
# 主线程完成：build / verify / git / Pages / HTTP 验收 / wiki
```

## 三阶段职责

### agent1（只调研）
- **输出**：结构化报告（一句话定位 / 已核实事实 / 说法核验 / 素材清单 / 推荐结构 / 来源列表）
- **禁止**：HTML、meta.yaml、wiki 任何文件写入，不 build/commit/push
- **必核**：GitHub star/commit/license、README 原文交叉验证、用户说法核实
- **超时处理**：agent1 超时 = 无报告 → 主线程用搜索工具补核实 + 直接进入写卡

### agent2（只写卡）
- **输入**：用户原始素材 + agent1 调研报告（两者缺一不可）
- **输出**：HTML 信息卡 + meta.yaml + wiki 草稿（放 `wiki/drafts/`）
- **禁止**：build、commit、push、Pages 验收、wiki index 最终同步
- **防呆条款（必须写入 prompt）**：
  ```
  禁止写【项目A】的内容。本任务只写【项目B】。
  项目名称（重复3遍防止跑题）：Claudian
  禁止写：Claude Code CLI 本身、通用 AI 编程工具对比
  只写：Claudian（YishenTu/claudian），Obsidian 插件
  ```
- **内容核实**：写完后必须 `grep` 核验关键词出现（如 `grep -c "obsidian" html`）
- **超时处理**：agent2 超时 → 主线程检查文件是否落盘 → 落盘但内容错 → 主线程直接重建

### 主线程（发布闭环）
1. `npm run build` → 检查 errors=0
2. `git add` → `git commit` → `git push`
3. `sleep 55` → `curl HTTP 200`
4. wiki 同步：draft → `concepts/` → `index.md` 写入

## 主线程直接绕过的判定

满足以下任一，主线程直接写卡（跳过 agent2）：

| 条件 | 说明 |
|------|------|
| 用户已提供完整素材 | 主素材齐，不需要调研补内容 |
| agent2 写错内容 | `grep` 核实不符 → 主线程重建 |
| agent1/2 全超时且无报告 | 主线程搜索核实 + 直接写卡 |

## 参考案例

| 任务 | agent1 结果 | agent2 结果 | 主线程动作 |
|------|------------|------------|-----------|
| Claudian | 超时（32 API，无报告） | completed，但写错内容（Claude Code CLI） | 主线程直接重建 20260709-claudian.html → HTTP 200 |
| llm_wiki v0.6 | 超时（32 API，无报告） | 未派 | 主线程待补 |
| Seedance Prompt Skill | 超时（运行中） | 未派 | 待 agent1 结果回来后继续 |

## 两阶段 vs 并行双轨选择

| 模式 | 适用 |
|------|------|
| **两阶段**（用户明确要求调研） | 用户给了复杂长文，需要 agent1 深度核验后再写 |
| **并行双轨**（素材已齐，主线程先写） | 用户给了完整结构，主线程不等待直接写，同时 agent1 做外围调研 |
