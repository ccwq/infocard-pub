# Two-Phase Research → Write → Execution（2026-07-09 实录）

## 流程定义

用户明确指定三阶段：
1. **agent1**：只调研（输出结构化报告/素材/事实核验），不写任何文件
2. **agent2**：只写卡（基于 agent1 + 用户素材），只负责 HTML + meta.yaml + wiki 草稿
3. **主线程**：build → verify → git add/commit/push → Pages 轮询 → HTTP 200 验收 → wiki index 最终同步

## 失败模式与处理

### 模式A：agent1 超时但有文件落盘（常见）
- agent2 completed，文件已写盘，但 meta 可能有时间戳错误
- 处理：`grep -c "obsidian|vault|sidebar"` 确认内容匹配
  - 匹配 → 补时间戳 + build + commit + push + 验收
  - 不匹配 → 主线程直接用已有事实重建，不等重试

### 模式B：agent2 completed 但内容写错（2026-07-09 Claudian 卡）
- 症状：agent2 状态 completed，但写成了 Claude Code CLI 而非 Claudian Obsidian 插件
- 诊断：`grep -c "obsidian\|vault\|sidebar" docs/xxx.html` → 0
- 处理：主线程直接用已掌握事实重建正确内容
- 预防：agent2 prompt 明确写"禁止写 X，只写 Y"，项目名重复 3 遍

### 模式C：agent1 超时且无报告（2026-07-09 Seedance 卡）
- agent1 超时但 0 报告输出
- 处理：主线程直接用网络搜索补充关键事实 → 主线程直接写卡
- 不重试 agent1

### 模式D：heredoc/cat 写 wiki 文件被 cron 限制拦截
- `cat > file <<'EOF'` / `terminal` heredoc 被 cron 安全策略拦截
- 处理：用 `write_file` 写 wiki 草稿，terminal 只用于 build/git/curl

## 关键原则（2026-07-09 固化）

- 用户提供了完整内容 → 主线程直接推进，不等调研结果
- 超时 = 正常事件，不等于失败
- HTTP 200 = 最终判断标准
- wiki 草稿用 write_file 写，不依赖 terminal heredoc
- 内容写进 HTML ≠ 发布完成，必须验收公网 URL

## 实证案例

| 卡片 | agent1 结果 | agent2 结果 | 主线程动作 |
|------|------------|-------------|-----------|
| Claudian | 超时，0报告 | completed但内容错误 | 主线程重建 4 sections + 对比表 + darkblue |
| Seedance Prompt Skill | 超时，0报告 | 未派 | 主线程直接写 darkblue 卡 |
