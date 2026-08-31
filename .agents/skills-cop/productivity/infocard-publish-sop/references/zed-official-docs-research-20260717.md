# Zed 官方文档一手调研技巧（2026-07-17）

## 背景

Zed 信息卡制作时，通用搜索（Bing/百度/CSDN）结果质量极差，充斥下载站、汉化帖、转载。官方文档才是唯一可靠水源。

## 核心发现

### 文档在哪里

GitHub 仓库源码 docs 目录（相对于 `zed-industries/zed` 主仓库）：
```
https://github.com/zed-industries/zed/tree/main/docs/src
```

每个 `.md` 文件可直接访问 raw 内容：
```
https://raw.githubusercontent.com/zed-industries/zed/main/docs/src/<filename.md>
```

### 目录索引（截至 2026-07-17）

```
SUMMARY.md              account/              ai/
all-actions.md          appearance.md         authentication.md
business/               collaboration/        command-palette.md
completions.md          configuring-languages.md  configuring-zed.md
debugger.md             dev-containers.md     development/
diagnostics.md          editing-code.md       environment.md
extensions.md           extensions/           finding-navigating.md
getting-started.md      git.md                globs.md
helix.md                icon-themes.md        installation.md
key-bindings.md         languages.md          languages/
linux.md                macos.md              migrate/
modelines.md            multibuffers.md       outline-panel.md
performance.md          project-panel.md      quick-start.md
reference/              remote-development.md  repl.md
roles.md                running-testing.md    semantic-tokens.md
snippets.md             soc2.md               tab-switcher.md
tasks.md                telemetry.md          terminal.md
themes.md               toolchains.md         troubleshooting.md
uninstall.md            update.md             vim.md
visual-customization.md windows-and-projects.md
```

关键文件速查：

| 主题 | 文件 |
|------|------|
| 快捷键体系 | `key-bindings.md` |
| Vim 模式 | `vim.md` |
| 扩展系统 | `extensions.md` + `extensions/installing-extensions.md` + `extensions/developing-extensions.md` |
| 远程开发 | `remote-development.md` |
| AI 集成 | `ai/` 目录 |
| 编辑功能 | `editing-code.md` |
| 多缓冲 | `multibuffers.md` |
| 设置参考 | `configuring-zed.md` |

### 调研命令模板

```bash
# 列表目录（查文件名）
curl -s https://api.github.com/repos/zed-industries/zed/contents/docs/src \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f['name']) for f in d]" \
  | grep -E '\.md$'

# 获取单个文档内容
curl -s https://raw.githubusercontent.com/zed-industries/zed/main/docs/src/<file>.md \
  | head -N   # N=行数，按需截断

# 获取 key-bindings（快捷键权威来源）
curl -s https://raw.githubusercontent.com/zed-industries/zed/main/docs/src/key-bindings.md

# 获取默认 keymap JSON（各平台差异）
curl -s https://raw.githubusercontent.com/zed-industries/zed/main/assets/keymaps/default-macos.json
curl -s https://raw.githubusercontent.com/zed-industries/zed/main/assets/keymaps/default-linux.json
```

### 搜索策略优先级

1. **GitHub raw docs**（`raw.githubusercontent.com/.../docs/src/`）— 最高优先级，结构清晰，可直接 curl
2. **GitHub README.md** — 项目概览和架构说明
3. **zed.dev 官方** — 面向用户的文档，可能需要浏览器（CDP 受限）
4. **通用搜索** — 仅作发现线索，不作引用依据

### 判断标准：搜索结果什么时候放弃

以下情况说明搜索结果不可靠，应直接切官方文档：
- 结果大量来自 CSDN/博客园/简书等转载站
- 结果是"安装教程"、"汉化"、"下载"
- snippet 内容重复且无出处
- 时间戳明显过时（Zed 仍在快速迭代）

### Zed 技术卡调研 checklist

- [ ] 确认 Zed 版本基线（最新 stable 版本号）
- [ ] curl GitHub docs/src 目录，找相关文件名
- [ ] 优先抓 `key-bindings.md`、`vim.md`、`remote-development.md`、`extensions/developing-extensions.md`
- [ ] 记录关键快捷键、配置项、参数名（用等宽字体格式化到信息卡）
- [ ] 区分：Zed 特有功能 vs 从其他编辑器移植的功能（Vim mode、Helix mode）
- [ ] 标注已知限制（如 Windows 不能作远程服务端、Vulkan 1.3+ 要求）

## 教训

本 session 第二次通用搜索结果极差（大量 CSDN/网易/腾讯转载），切到 GitHub raw docs 后才获得可用内容。以后对 Zed 这类新兴工具，默认优先 GitHub 官方文档路径而非通用搜索。
