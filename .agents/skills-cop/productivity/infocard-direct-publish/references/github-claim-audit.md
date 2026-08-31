# GitHub 项目介绍稿 · 断言审计 SOP

## 背景

用户经常会把一段关于某 GitHub 项目的"介绍稿"（带 Markdown 排版、有标题和模块）发给 agent，要求"调查补充信息，然后发布信息卡"。这段介绍稿本身不是事实来源，而是一份**带主观措辞的候选叙事**。如果直接照搬，会把稿件里出现的项目方未声明的能力、协议、排序机制或集成写成卡片正文，造成事实性错误。

本参考记录一次实际审计过程中产生的清单和修复手法，可作为后续同类卡片的事实审计模板。

## 流程

### 1. 拆解用户稿的断言

把稿件里所有可核验的声明拆成一行一行的断言，至少覆盖：

- 项目全称 / 缩写 / Slogan
- 一句话定位 / 目标
- 功能/补全来源列表（README、history、alias、AI provider、文件目录……）
- 第三方依赖（Cobra、frequency、ShellGPT、Fig……）
- 平台支持（macOS/Linux/Windows/SSH/Tmux）
- 安装方式（brew、curl | sh、go install、deb/rpm、AUR、Nix、asdf）
- 许可证
- 关键数据（stars、forks、license、beta/stable）

### 2. 核验源优先级

按以下顺序核验每一个断言：

1. **GitHub API**：`/repos/{owner}/{repo}` 拉 stars/forks/license/created_at/pushed_at/description/default_branch/topics。
2. **README 当前 main 分支**：`raw.githubusercontent.com/{owner}/{repo}/main/README.md` 拉完整文本。
3. **默认分支 raw**：很多仓库不是 `main`（`master` / `develop`），先查 API 的 `default_branch`，再拉对应分支。
4. **关键 manifest**：`go.mod`、`Cargo.toml`、`package.json`、`pyproject.toml` 用于语言、依赖、构建系统核对。
5. **安装脚本**：`scripts/install.sh` 等，确认路径、release URL 模式、Linux/macOS 区分、Windows 是否真的不支持。
6. **示例配置 / theme 文件**：确认 AI provider、模式（spec/history/last）、键位、shell init 等。

### 3. 断言分类

| 类别 | 处理方式 |
|---|---|
| `confirmed` | 一手来源完全支持，原文/小改写后可入卡。 |
| `claimed` | 仅出现在项目自述、无法独立验证，标注为"项目自称/README 声称"或换中性词。 |
| `unsupported` | 仓库根本不存在该组件/协议/算法；删除，不"修辞化"后保留。 |

### 4. 常见错误形态

- **虚构第三方依赖**：用户稿件说"结合 Cobra CLI 的 `__complete`"，但 README 完全不提 Cobra。直接删除该项，改为实际的补全来源。
- **虚构产品名**：用户稿件说"ShellGPT"，但仓库里没有该名字；直接删除整段或用"AI suggestion（可选）"等中性表述。
- **频率排序错位**：用户稿件写"frequency 排序"，但 README 实际是 `mode = "last/spec/history"` 三态切换；改写为 README 实际支持的语义。
- **Windows 支持虚标**：README 顶部写了 `Currently, Windows is not supported`，但用户稿件若漏掉，平台一栏必须补回。
- **仓库大小写混淆**：GitHub 仓库是 `versenilvis/IRIS`（全大写），但 README 内部引用很多地方写成 `versenilvis/iris`（全小写）。引用时遵循仓库页面大小写，文中可补一句"仓库页面写作 IRIS，内部 README 多处使用小写 iris"。
- **Slogan 一字不差 vs 意译**：英文 Slogan 应原样保留；中文小标题可以用意译，但不要"为了对仗"加原文没有的内容。

### 5. 修复策略

- **删除 > 改写**：能删就删，绝不用"事实上是…"的修辞去救一个 unsupprted 断言。
- **降级 > 删除**：如果只是表述过度（"AI 像你的代码编辑器一样"在 README 里有同义表述），降级到 "项目称" + 中性改写。
- **统一术语**：同一份卡里，同一概念只用一个中译。AI suggestion、实时输入建议、IntelliSense 不要交叉出现。
- **安装命令固化**：复制 README 当前的命令原样，**不要**改成用户稿件里的"等价但不同"的命令。

### 6. 验收清单

写卡前对照：

- [ ] 每个对外能力（补全源、模式、AI provider、平台、安装方式）在 README 里有原文对应
- [ ] 没有"项目 README 没有"的虚构产品/协议/算法
- [ ] 平台支持一行带 "Windows: ❌ 不支持"（如果 README 明确不支持）
- [ ] 安装命令从 README/install.sh 复制，不从用户稿里"凭印象"重写
- [ ] Stars/Forks/License 来自 GitHub API 实时值（写卡当下），不要用用户稿里的旧数字
- [ ] 默认分支、tag 与 GitHub API 一致

## 实战样本（IRIS · 2026-08-08）

| 用户稿断言 | 一手来源 | 分类 | 处理 |
|---|---|---|---|
| "shell 中的智能实时输入提示工具" | README 头标语 | confirmed | 保留 |
| 全称 Intelligent Real-time Input Suggestion | README 副标题 | confirmed | 保留 |
| 实时输入建议 | README 内多处 | confirmed | 保留 |
| "内置命令规格 / shell history / alias / 文件和目录 / Cobra CLI 的 `__complete` / frequency 排序 / 可选 AI suggestion" | README 列出的补全来源 + 模式 | **3 项 unsupported**（Cobra/frequency/ShellGPT） | 删除 Cobra、删除 frequency、删除 ShellGPT；保留 history / alias / 文件目录 / AI |
| 可选 AI suggestion 接 Groq 或 Ollama | README `[ai.providers.groq/ollama]` | confirmed | 保留 |
| `brew install versenilvis/iris/iris` | README tap 安装段 | confirmed | 保留 |
| `curl -sSL ... install.sh \| sh` | README install.sh URL + install.sh 脚本 | confirmed | 保留 |
| 1,050 stars / 32 forks / BSD Zero Clause License | GitHub API | confirmed | 写卡时再确认（数字会变） |
| 替代 Fig | README "Why IRIS instead of Fig" 段，README 写 Fig 在 2024-09 被 Amazon Q Developer 收购 | confirmed | 保留并补一句时间点 |
| 平台 macOS / Linux | README "Currently, Windows is not supported" | confirmed | 必须明确标注 Windows 不支持 |
| "建议性安全/审计提示" | 无 | unsupported | 不写入 |

## 实用命令

```bash
# GitHub API metadata
curl -sH "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/{owner}/{repo}"

# README raw
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"

# 默认分支检测 + raw
branch=$(curl -sH "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/{owner}/{repo}" | python3 -c "import sys,json;print(json.load(sys.stdin)['default_branch'])")
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/${branch}/README.md"
```

## 不要做

- **不要把"用户写"等同于"事实"**。用户稿件是参考输入，不是信源。
- **不要在卡片里说"项目声称…"**。这是负面表述，会破坏卡片基调；改用"根据 README" + 客观描述。
- **不要为了"信息密度"补充 README 没有的东西**。少而准 > 多而错。
