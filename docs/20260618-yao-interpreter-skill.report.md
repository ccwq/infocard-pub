# Yao Interpreter Skill 调研记录

- 源地址：<https://github.com/yaojingang/yao-open-skills/tree/main/skills/yao-interpreter-skill>
- 仓库：`yaojingang/yao-open-skills`
- 技能版本：`0.1.0`
- 主题：`infocard-bigwhite-style`

## 直接证据

### README.md
- 定位：静态解读已有 Agent Skill
- 输入：本地目录、`SKILL.md`、安全 zip
- 输出：`report.zh-CN.html`、`analysis.json`、`findings.json`、`qa_report.json`、`summary.md`
- 快速命令：
  - `python3 scripts/cli.py analyze ./target-skill --out reports/generated`
  - `--lang zh-CN,en` 额外生成独立英文文件

### SKILL.md
- 明确写出：目标 Skill 一律作为不可信输入
- 禁止：执行目标脚本、安装器、测试、模型提示、远程调用
- 默认流程：静态读取 → 评分 → 渲染中文 HTML → 验证首屏/图表/证据卡/路线图
- 路由边界：
  - 解读/评估/准入审查/学习已有 Skill → 用本 Skill
  - 创建或重构 Skill → 用 `yao-meta-skill`
  - 导出 Word/PDF 学习报告 → 优先 `yao-skill-reader-skill`

### manifest.json
- `maturity_tier: production`
- `lifecycle_stage: production`
- `target_platforms`: openai / claude / generic / agent-skills-compatible / vscode
- `factory_components`: references / scripts / templates / schemas / evals / reports

### references/
- `rubric.zh-CN.md`：九维 100 分评分 + 红线
- `report-contract.zh-CN.md`：报告模块顺序、中文优先、QA 标准
- `html-report-design.zh-CN.md`：白底、高信任、sticky 顶栏、左目录、右指标栏、内联 SVG
- `safety-boundary.zh-CN.md`：不可信输入原则与 zip 安全边界

### scripts/
- `cli.py`：主分析器
- `smoke_test.py`：确定性 smoke test，要求 good_skill 达到可用分，risky_skill 打出 high/critical

## 卡片取舍
- 这张卡没有把它讲成“又一个 Skill 包”，而是突出它是“Skill 解释器 / Skill 审计器”。
- 首屏强调三件事：
  1. 输入边界
  2. 不执行目标内容
  3. 证据化评分输出
- 中段重点补了：
  - 默认产物
  - 三类输入
  - 九维评分模型
  - 红线规则
  - smoke test 的好/坏样例机制
  - 报告 UI 规范

## 没有过度声称的部分
- 没把它写成运行时沙箱，因为仓库自己明确否认这一点
- 没把 `production` 状态解读成“适合任何外部 Skill 自动接入”，因为它本质上仍是静态分析与采用建议
- 没假设它会访问目标外部服务，因为安全边界明确禁止
