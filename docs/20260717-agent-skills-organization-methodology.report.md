# 调查报告：Agent Skills 组织方法论

## 1. 任务与边界

- 主题：Agent Skills 组织方法论。
- 事实包：`/home/ccwq/fact-package-agent-skills-org.md`，核查日期 2026-07-17。
- 仅使用事实包列出的一手项目资料与已验证事实。
- 不将第三方线索写入 HTML、meta.yaml、报告或可见内容。
- “42 个 Skills”无法从一手来源核实，因此不作为项目规模事实。

## 2. 核查结论

事实包记录：Hermes Agent 内置目录有 73 个 SKILL.md，可选目录有 103 个 SKILL.md；合计文件计数为 176，但该数字依赖统计对象、时间和是否计入索引缓存等口径。成品采用更谨慎的“约 170+”表达，并在正文说明口径；Addy Osmani agent-skills 记录为 24 个技能。

## 3. 组织轴线

- Hermes Agent：以领域和场景组织，内置与可选技能分布于多个分类目录，适合管理广泛能力覆盖面。
- Addy Osmani agent-skills：以软件开发生命周期组织，沿 Define → Plan → Build → Verify → Review → Ship 串起工程步骤。
- 共通方法：YAML frontmatter + Markdown；通过元数据、主体正文与引用文件实现三层渐进加载。

## 4. 成品包含

1. 数字核查与稳健统计口径。
2. 两条组织轴线对比。
3. YAML frontmatter 与三层渐进加载。
4. 两个项目的安装方式。
5. 核心设计哲学：核心收窄、能力外置、技能可执行、工程流程托底。
6. 风险边界与一手来源清单。

## 5. 视觉与响应式

采用蓝色技术手册/硬核蓝方向：蓝色网格背景、深蓝结构线、红色风险强调、分段编号块、对比矩阵、代码块与移动端断点。宽表格使用局部横向滚动容器，不缩小整个页面。

## 6. 成品来源

- https://github.com/NousResearch/hermes-agent
- https://github.com/NousResearch/hermes-agent/blob/main/AGENTS.md
- https://github.com/NousResearch/hermes-agent/tree/main/skills
- https://github.com/NousResearch/hermes-agent/tree/main/optional-skills
- https://github.com/NousResearch/hermes-agent/blob/main/skills/software-development/requesting-code-review/SKILL.md
- https://github.com/addyosmani/agent-skills
- https://github.com/addyosmani/agent-skills/blob/main/README.md
- https://github.com/addyosmani/agent-skills/blob/main/AGENTS.md

## 7. 验证记录

验证命令及结果见任务回执；提交前应运行 `npm run build`、`npm run verify`、`npm run verify-taxonomy` 与 `npm run check-leak`。
