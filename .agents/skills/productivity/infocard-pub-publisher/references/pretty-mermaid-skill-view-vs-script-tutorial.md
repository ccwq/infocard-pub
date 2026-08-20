# Pretty Mermaid Skill 卡：从“脚本教程”回收到“Skill 视角”

## 触发信号
用户虽然让你做的是 GitHub Skill / SKILL.md 信息卡，但又进一步明确说：
- “不要包含脚本使用”
- “这是个 skill”
- “需要生成效果的配图”

这说明用户要的不是“仓库脚本教程卡”，而是 **Skill 能力卡**。

## 正确改法
1. **保留 Skill 入口**：仓库地址、安装入口、主文档、示例目录仍可保留。
2. **删除脚本教学块**：`render.mjs / batch.mjs / themes.mjs`、命令参数表、逐步跑脚本示例都应去掉。
3. **改写为 Skill 视角章节**：
   - 什么时候该让 Agent 调用它
   - 适合谁
   - 不适合什么场景 / 能力边界
   - 真实生成效果
   - Skill 记忆与资源入口
4. **必须补真实效果图**：不要只放 Mermaid 源码片段。优先顺序：
   - 用仓库自带示例实际渲染成 SVG/PNG
   - 再补 README 公开 banner / 效果图
   - 将外部图和本地渲染结果都固化到 `docs/assets/images/`
5. **保留安装入口，但不扩写脚本教程**：如果用户只反对“脚本使用”，不要把安装命令也删光；保留入口即可。

## 实战结果（本次）
- 从 `assets/example_diagrams/` 实际渲染出 `flowchart.svg / sequence.svg / er.svg`
- 下载 README banner 图并本地化
- 将卡片从“脚本怎么用”改为“这个 Skill 怎么被调用 / 真实生成效果 / Skill 记忆与资源入口”

## 一句话规则
**Skill 卡默认可包含安装入口；但如果用户明确说“不要包含脚本使用”，就把页面重心从“如何手动跑脚本”切换为“Agent 何时调用这个 Skill + 真实效果 + 边界”。**
