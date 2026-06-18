# codebase-to-course 调研记录

- 源仓库：<https://github.com/zarazhangrui/codebase-to-course>
- 主题：`infocard-graph-paper-style`
- 仓库定位：把任意代码库转成交互式单页 HTML 课程的 Claude Code skill

## 直接证据

### README.md
- 目标：生成单页 HTML 课程，教非技术用户理解代码库如何工作
- 目标人群：`vibe coders`
- 交互元素：
  - scroll-based modules
  - animated visualizations
  - embedded quizzes
  - code ↔ plain-English side-by-side translations
  - glossary tooltips
- 触发短语：
  - turn this into a course
  - explain this codebase interactively
  - teach this code
  - make a course from this project

### SKILL.md
- 核心产物：一个课程目录，而不是单一 html
- 四阶段流程：
  1. codebase analysis
  2. curriculum design
  2.5 module briefs（复杂仓库）
  3. build course
  4. review and open
- simple / complex 分流：
  - simple repo 直接 sequential
  - complex repo 先 briefs 再并行 subagents
- 明确要求：
  - 不先让用户审批 curriculum，直接 build
  - CSS / JS 骨架从 `references/` 复制，不要重生成

### references/
- `_base.html` / `_footer.html` / `build.sh`
- `styles.css` / `main.js`
- `design-system.md`
- `interactive-elements.md`
- `content-philosophy.md`
- `gotchas.md`
- `module-brief-template.md`

## 关键判断
- 这个 repo 的价值不只是“给课程 prompt”，而是把课程生成流程工程化：
  - 分析
  - 课程拆解
  - brief 下沉
  - assets 复用
  - assemble
  - browser review
- 它和 codegraph 一类 repo 相似点在于都在做“代码知识重表达”，但方向不同：
  - codegraph：面向 agent / 语义索引
  - codebase-to-course：面向人类学习者 / 交互课程
- 图谱风格卡片因此重点放在：
  - 生成链路图
  - assets / interactions / workflow 的结构关系
  - 不把它讲成普通营销卡

## 没有过度声称的部分
- 没把它写成通用教育平台，而是限定为 Claude Code skill
- 没假设它真的支持完全离线课程字体，因为 README 提到唯一外部依赖是 Google Fonts CDN
- 没把它说成“自动理解所有代码库都很准”，只强调它的流程模板和课程生产线价值
