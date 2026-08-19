# SPEC: amto-officecli 信息卡 + 公众号文章发布

## Problem Statement

用户要求同时发布 amto/OfficeCLI 的信息卡和公众号文章草稿。来源为 X 推文 @XAMTO_AI (612 views)，GitHub 指向 iOfficeAI/OfficeCLI，28k Stars。

## Source

- **X 推文**: https://x.com/XAMTO_AI/status/2089976659810156881
- **GitHub**: https://github.com/iOfficeAI/OfficeCLI
- **作者**: Amto (@XAMTO_AI)

## Content Summary

**Amto OfficeCLI** —— 专为 AI Agent 设计的文档操作工具（PPT/Excel/Word）。

核心痛点：传统方式做 Office 文档，要手动排版或让 AI 写 Python 代码调用各种库，改个颜色得重跑一遍才能看到效果。

**核心亮点**：
- 自带渲染引擎，文档转 HTML 或截图，让 AI "看见" 排版效果，自己判断颜色、字体、布局哪里不对，反复迭代
- 支持模板替换、批量操作、路径寻址、SQL 风格查询
- **350+ Excel 函数**自动计算
- MCP Server 集成到 AI 工具
- **单二进制**，无依赖，不用装 Office

**数据**：28k Stars，MIT License

---

## Solution

### 1. 信息卡（darkblue 主题）

- **主题**: darkblue（AI Agent 工具 / 文档操作类）
- **内容**:
  - 标题: Amto OfficeCLI — AI Agent 文档工具
  - 核心亮点（见上文）
  - 28k Stars，MIT License
  - MCP Server 集成
  - 安装方式（npm / 二进制）
  - GitHub + X 来源
- **变更说明**: 新建卡片（2026-08-19），首次发布

### 2. 公众号文章（white-purple-workbench 主题）

- **主题**: white-purple-workbench
- **内容**: 基于推文内容改写，面向普通读者
- **结构**:
  - 标题: 告别手动排版：让 AI Agent 自己看懂并修改 Office 文档
  - 导读: 痛点引入
  - 01 痛点分析
  - 02 核心能力
  - 03 快速上手
  - 资料来源
- **图片**: 封面图（白紫工作台风格）+ 可选插图
- **作者**: AG雷达

---

## Implementation Decisions

### 信息卡
- 写 `docs/20260819-amto-officecli.html`
- 写 `docs/20260819-amto-officecli.html.meta.yaml`，`style: darkblue`
- npm run build
- git add + commit + push
- HTTP 200 验证

### 公众号文章
- 写 Markdown 草稿（含 frontmatter，status: ready）
- 写 HTML 排版（white-purple，遵循 wechat-css-compatibility 规则：无 `leaf` 包装空行陷阱）
- assets/ 目录放封面图和插图
- prepare-baoyu-html.js 生成 baoyu.html
- baoyu:check 预检
- npm run wechat:draft 创建草稿
- API 回读验证

### 并行发布
- 信息卡和公众号文章草稿并行执行
- 信息卡先 push 到 main
- 公众号草稿 API 创建后回写 media_id 到 baoyu.md

---

## Testing Decisions

- 信息卡: curl HTTP 200 验证
- 公众号: API 回读 title/author/images/digest
- 草稿 ID 写入 baoyu.md

## Out of Scope

- 正式群发（只创建草稿）
- ChatGPT 封面图生成（用户手动用推文图片或 PIL 程序生成）
