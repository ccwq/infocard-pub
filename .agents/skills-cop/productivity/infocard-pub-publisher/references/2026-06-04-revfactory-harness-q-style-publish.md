# Q版风格 GitHub 开源项目信息卡发布流程

## 触发条件
用户说"创建发布 Q 版风格信息卡 + GitHub 仓库 URL"

## 核心步骤

### 1. 抓取源材料
- `git clone --depth=1` 到 /tmp（无需完整历史）
- 读取 README.md（英文 + i18n 翻译版）
- 读取 docs/*.md（快速入门、贡献指南等）
- 读取 SKILL.md（完整 workflow 技能）
- 读取 references/*.md（设计模式、模板、示例）
- 读取 plugin.json（metadata：version、license、keywords）
- 读取 CHANGELOG.md、贡献指南、issue/PR 模板

### 2. SKILL 视角内容规划
信息卡应从"技能使用者"角度出发，而非通用介绍：

| 模块 | 内容要点 |
|------|----------|
| 安装 | Marketplace 安装命令 + Direct 方式 + 前置要求 |
| 触发方式 | 核心触发短语（中英双语） |
| 核心概念 | 架构模式、执行模式、工作流阶段 |
| 实际示例 | 真实使用命令、代码片段 |
| 决策树 | 帮助 Agent 正确选择的判断逻辑 |
| 长期记忆 | 仓库地址、安装方式、核心约束、输出路径 |

### 3. Q 版风格 CSS 要点
- 暖米纸背景 `#faf8f3`，白色卡片体
- 厚黑边框 3px，box-shadow 偏移
- 圆角 16px，字体 Noto Sans SC / PingFang SC
- 橙色点缀 `#e85d04`，深绿 `#2d6a4f`
- 最小字号 11.2px+，720px 断点
- 移动端单列堆叠

### 4. 文件命名与 meta.yaml
- HTML: `docs/YYYYMMDD-{slug}.html`
- meta.yaml: `docs/YYYYMMDD-{slug}.html.meta.yaml`
- 必须有 `slug`、`path`、`category`、`title`、`desc`、`date`、`updated`

### 5. 发布与验证
1. `python3 scripts/rebuild_index.py`
2. `git add` → `git commit` → `git push`
3. 推送后 90~120 秒 GitHub Pages 刷新
4. 三层验证：HEAD 200 → size 合理 → 关键字抽检

### 坑点
- git rebase 冲突时用 `--theirs _index.yaml` 恢复远程版本，然后 rebuild_index 重建
- `--no-edit` 绕过 rebase 后 EDITOR 未设置问题
- detached HEAD 时用 `git checkout main && git reset --hard origin/main` 恢复
- 推送后不要只看 HTTP 200，要验证内容完整性（截断假象用完整字节数排除）
- Pages 可能回退旧版本，验证时强制 cache-bust（加 ?t=timestamp）

## 相关文件
- `references/rebuild-vs-expand-republish.md` — rebuild 理解
- `references/infocard-pub-rebase-conflict-resolution.md` — rebase 冲突恢复
- `references/post-publish-three-way-verification.md` — 推送后三段验证