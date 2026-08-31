# md2wechat-skill 信息卡参考（2026-07-11）

## 项目概要

| 字段 | 值 |
|------|-----|
| GitHub | https://github.com/geekjourneyx/md2wechat-skill |
| NPM | @geekjourneyx/md2wechat |
| 语言 | Go 1.26.1+ |
| 许可 | Source Available License |
| Stars | 3,198 |
| 主题数 | 48（专业API）/ 3（免费） |
| 排版模块 | 43 |
| Agent 支持 | Claude Code, Codex, WorkBuddy, Kimi Work, Hermes Agent, OpenClaw |

## 核心功能（4 项，2×2 grid）

1. **Markdown → 公众号** — convert 命令，Markdown 转微信 HTML，支持预览、上传、创建草稿
2. **40+ 样式** — 免费 3 基础主题，专业 API 48 精调主题 + 43 高级排版模块
3. **AI 配图** — 封面图/信息图生成，支持 Volcengine、ModelScope、OpenRouter、OpenAI、Gemini
4. **多账号管理** — 命名公众号账号，本地只读发现，不输出 Secret

## Agent 工作流（flow + cli-grid）

```
capabilities --json → doctor --json → inspect --json → convert --draft
```

| 命令 | 用途 |
|------|------|
| `capabilities --json` | 列出 CLI 支持的所有命令 |
| `doctor --json` | 检查 API/草稿/上传就绪 |
| `inspect article.md --json` | 文章元数据和发布就绪性 |
| `themes list --json` | 可用主题列表 |
| `layout list --json` | 可用排版模块列表 |
| `title suggest --json` | 生成标题建议 |
| `skills list --json` | 内置 Agent SOP 列表 |
| `skills read md2wechat --json` | 读取特定 SOP |

## API 模式对比

| 能力 | 免费 AI | 专业 API |
|------|---------|----------|
| 输出 | prompt → 外部 LLM | 直接 HTML |
| 主题 | 3 个 | 48 个 |
| 模块 | ❌ | 43 个 `:::module` |
| 一致性 | 取决于 LLM | 确定性 |
| 速度 | 取决于 LLM | 秒级 |
| 适用 | 实验 | 团队/矩阵号 |

## 安装命令

```bash
npm install -g @geekjourneyx/md2wechat
md2wechat config init
md2wechat inspect article.md --json
md2wechat convert article.md --draft --cover cover.jpg
```

## 输出文件

- HTML：`docs/20260711-md2wechat-skill.html`
- meta：`docs/20260711-md2wechat-skill.html.meta.yaml`
- 素材：`assets/img/md2wechat-skill/`（含 readme-header.gif、wechat.png、theme-showcase/）
