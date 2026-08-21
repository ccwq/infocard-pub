---
name: infocard-direct-publish
description: 用户直接给 GitHub URL 时的主线程直连发布流程——无需子智能体，无需三阶段，直接完成调研+写卡+发布。
---

# Infocard 直连发布（单 URL 主线程模式）

> 用户直接给 GitHub URL + 描述时，绕过三阶段子智能体，直接在主线程完成全部流程。

## 触发条件

两类输入都可触发本技能：

1. **URL 驱动**：用户直接发送 GitHub URL（`github.com/xxx/yyy`）并带有「发布信息卡」意图。
2. **主题驱动**：用户没有给 URL，但给了可落地的调研材料、报告、标题偏好或已存在的候选卡，且意图是「发布信息卡」。

**典型信号词**：`发布信息卡`、`做个信息卡`、`把这个发成卡`、`整理后发布`。

**注意**：
- 当用户只给出一个明确对象或 URL，且没有要求多阶段分工时，用主线程直连。
- 当用户给的是研究报告/提纲而不是 URL，先做候选审计；如存在多个可发布对象或多个既有卡片可复用，先问**一个**澄清问题，不要默认替用户挑对象。
- 用户明确说「调研→写卡→发布」三阶段分工时，改用 `infocard-three-stage-pipeline`。


## STOP GATE — 先视觉验收，后 build/commit/push

直连发布不是视觉门禁豁免。任何 `docs/*.html` 写入或修改后，顺序必须是：

1. 本地预览当前 worktree 的目标 HTML。
2. 采集桌面与移动截图，得到明确 `critical / major / minor` 结论。
3. 写入或更新 `.visual-evidence/<slug>/manifest.json`，绑定当前 HTML sha256。
4. 运行 `npm run verify:visual-gate -- docs/<slug>.html`。
5. 只有 `0 critical / 0 major` 且 manifest hash 匹配，才允许 `npm run build`、commit、push。
6. push 后必须 cache-bust 打开公网 URL，重新截图复核；公网 PASS 与本地 PASS 分开报告。

禁止：先 push 后补截图；把 HTTP 200/build 成功当视觉通过；把 `theme/*.html` 当 stylesheet 引入；HTML/CSS/结构变更后复用旧截图。

## 执行步骤

### Step 1 — 调研（主线程，直接 curl）
```bash
# GitHub API（stars/forks/desc/lang/topics）
curl -sH "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/AUTHOR/REPO" | python3 -c "import sys,json; d=json.load(sys.stdin); ..."

# README
curl -s "https://raw.githubusercontent.com/AUTHOR/REPO/main/README.md" > /tmp/xxx-readme.md

# 语言统计（可选）
curl -sH "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/AUTHOR/REPO/languages" | python3 -c "import sys,json; d=json.load(sys.stdin); ..."
```

**不需要子智能体**：单 URL 调研数据量小，主线程直接抓取即可，子智能体会增加超时风险和链路复杂度。

#### 用户稿件断言审计（必须做）
用户提供的介绍稿是候选叙事，不是事实来源。把稿件中的每个可核验断言拆成清单，逐项对照 GitHub API、README、安装脚本、`go.mod`/package manifest 和官方文档：

- **保留**：一手来源明确支持的能力、平台、安装命令、许可证、版本和统计数据；
- **降级**：来源只有项目自述、无法独立验证的宣传性表述，改写为“项目自称/README 声称”；
- **删除**：官方仓库中不存在的组件、协议、算法、排序机制或集成，不要因为它出现在用户稿件里就写入卡片；
- **纠正**：安装命令和路径以当前 README/脚本为准，特别检查仓库大小写、默认分支、Windows 支持范围和脚本是否真的存在。

建议在写卡前生成内部断言表：`claim | source | status(confirmed/claimed/unsupported) | final wording`。卡片正文只使用 `confirmed` 和明确标注的 `claimed`，禁止把 `unsupported` 断言“修辞化”后保留。

本次核验细节与可复用命令见 `references/github-claim-audit.md`。

### Step 2 — 选风格
| 主题 | 风格 |
|------|------|
| AI/WebGPU/端侧 AI/记忆系统 | `darkblue`（深蓝工作台） |
| 开源工具/CLI/方法论/Skill | `redswiss`（红黑瑞士风） |
| 技术手册/调研报告 | `hardblue`（蓝黑手册风） |

Style 治理规范见 memory 或 `infocard-style-man-skill`（不要用旧卡换色的方式）。

### Step 3 — 写卡（主线程）
```bash
TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"  # 获取时间戳
```
- HTML：`docs/[slug].html`
- meta.yaml：`docs/[slug].html.meta.yaml`
- 时间戳：`YYYY-MM-DD HH:MM:SS` Asia/Shanghai，**禁止裸日期**

### Step 4 — 本地视觉门禁（必须在 build / commit / push 前）

**不要 commit `_index.yaml` 和 `index.html`**。CI 在每次 push main 后自动从 `docs/` rebuild 并部署到 GitHub Pages。commit 根级 index 文件会在 rebase 时产生冲突。

```bash
# 先生成/更新 .visual-evidence/<slug>/manifest.json，必须绑定当前 HTML sha256
npm run verify:visual-gate -- docs/20260714-[slug].html
```

### Step 5 — Build + Verify

```bash
npm run build           # 生成 _index.yaml（仅用于本地验证，不 commit）
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
# 确认新卡已写入：grep "slug" _index.yaml
```

### Step 6 — Commit + Push

```bash
# 只 add 本卡 docs/meta、必要生成产物与本卡视觉证据 manifest；禁止 git add -A
git add docs/20260714-[slug].html docs/20260714-[slug].html.meta.yaml .visual-evidence/[slug]/manifest.json
git commit -m "feat: publish [slug] (style) — description"
git push origin main
```

### Step 7 — HTTP + 公网视觉复核

GitHub Pages 部署约需 25-35s（CI build + CDN 传播）。不要在 push 后立即查询，会得到 404。

#### 视觉证据与预览端口前置检查

- 视觉门禁必须针对当前 worktree / 当前卡的实际渲染结果；旧进程占用标准预览端口时，不要把旧页面的 HTTP 200 当作当前卡证据。
- 启动预览前先探测端口并确认目标文件正文/标题来自当前 worktree；若端口被旧服务占用，使用明确记录的替代端口，或只清理由本次任务创建的服务，不要杀未知/用户进程。
- 若截图或视觉分析基础设施持续超时，静态 build、verify、HTTP 结果不能升级为视觉通过；在 report 中记录 `VISUAL_PENDING`，不要 commit/push。
- 任何 HTML/CSS/结构修改都会使先前截图失效，必须重新渲染移动端与桌面端后再提交。

```bash
sleep 30
curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/[slug].html"
# 期望：200

# 验收内容
curl -s "https://...html" | grep "<title>"
```

首次查询 404 属于正常（CDN 传播延迟），10s 后再查即可得到 200。
  sleep 10
done
```

### Step 6 — Wiki 同步
```bash
WIKI_PATH="${WIKI_PATH:?Set WIKI_PATH to the active wiki checkout}"
TS=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")

# raw article
cat > "$WIKI_PATH/raw/articles/[date]-infocard-[slug].md" << 'EOF'
# [Title] 信息卡存档
...
EOF

# concepts
cat > "$WIKI_PATH/concepts/[slug-or-name].md" << 'EOF'
---
title: [Title]
tags: [...]
desc: ...
---
# [Title]
...
EOF

# log
echo "## $TS — [Title] 信息卡" >> "$WIKI_PATH/log.md"
```

## 风格快速参考

**darkblue**（AI/Agent架构/技术工具）：
- 变量：`--bg:#0c1020`, `--cyan:#58c3ff`
- 装饰：radial-gradient 四个圆点（cyan/purple/green/yellow）
- 字体：Inter + PingFang SC + Microsoft YaHei
- 内容块：`.shell`（双栏）/ `.bug-card`（2x2 问题卡）/ `.graph-flow`（4列节点流）/ `.anchor-list`（锚点列表）/ `.langgraph-box`（代码框）
- 响应式：1080px 单栏 + 720px graph-flow 单列
- 2026-07-22 Graph Engineering 实操 CSS 片段见下方（可直接复用）

**redswiss**（本次用于 Shifu）：
- 红色斜切 Hero + 纯红徽章
- 变量：`--red:#c8102e`, `--bg:#f5f2ec`
- 3px 黑线边框，box-shadow `6px 6px 0`

**hardblue**（用于 Humanize）：
- 米白纸感背景 + 蓝黑线框
- 变量：`--bg:#f6f4ef`, `--red:#d80018`
- 网格背景线 + box-shadow `8px 8px 0`

## 常见陷阱

- **不要先派子智能体调研再回来写卡**（单 URL / 单主题场景）：子智能体调研+超时风险 + 主线程写卡 ≈ 2x 链路，直接主线程反而更快。
- **主题驱动场景不要默认替用户选卡**：当用户只给报告或素材但仓库里有多个候选卡时，先问一个关键澄清问题。
- **meta.yaml 时间戳必须用 Asia/Shanghai**，禁止裸日期（UTC+8 会导致显示 12:00）。
- **build 后立即 git add**，不要跨会话混入其他 untracked 文件。
- **Pages 轮询最多 18 次（3 分钟）**，超时就报告失败，不要无限等待。
- **worktree 发布遇到 non-fast-forward**：先 `git fetch origin main` 再 `git merge origin/main`，不要直接归因于发布失败或重做全文。
- **子智能体全部 HTTP 429 / Token Plan 配额耗尽时**（见 Pitfall 2026-07-28）：当并行 Author 子智能体在 15-20 秒内全部以 `HTTP 429: Token Plan 用量上限` 失败时，**不要再分发**——是平台配额问题，不是内容问题。Orchestrator 直接接管，按本文件 Step 3 写卡模板克隆 `theme/<style>.html` → 替换 `<main class="page">…</main>` 内容 → 标准 build/commit/push 链路。不要把失败归因于子智能体 prompt 质量。
8. **meta.yaml "single document in the stream, but found more" 排错**（见 Pitfall 2026-07-28）：build 报 `expected a single document in the stream, but found more` 时，本质是 js-yaml 把 `meta.yaml` 解析成多文档。常见触发：①title/desc 含 em-dash `—`；②文件结尾没有换行；③结尾有多余 `---` 闭合；④`path: "docs/<slug>.html"` 双引号包裹的 `.html` 被识别为文档结束标记。诊断命令 `node -e "const y=require('./assets/home/vendor/js-yaml.min.js');const fs=require('fs');for(const f of fs.readdirSync('docs')){if(f.endsWith('.meta.yaml')){try{const d=y.loadAll(fs.readFileSync('docs/'+f,'utf8'));if(d.length>1)console.log(f);}catch(e){}}}"`。修复顺序：先去 em-dash → 补尾换行 → 删尾 `---` → 单引号包裹 `path` 的 `.html`。

## 与三阶段流水线的区别

| | 直连发布（本文档） | 三阶段流水线 |
|---|---|---|
| 触发 | 单个 GitHub URL | 复杂任务/多文档 |
| 子智能体 | ❌ 不需要 | agent1 调研 + agent2 写卡 |
| 链路 | 主线程全链路 | 主线程接管发布 |
| 超时风险 | 低 | 中高 |
| 适用规模 | 1-3 张卡 | 5+ 张卡 |

## 参考文件
- `references/infocard-style-governance.md` — 风格治理规范（含 darkblue 内容块 CSS 模板）
- `references/infocard-http-verification.md` — HTTP 验收命令模板
- `references/github-claim-audit.md` — 用户介绍稿的断言审计 SOP：拆解、核验源、分类、修复策略和实战样本（IRIS）
- `references/worktree-isolated-commit.md` — worktree 隔离提交模式（冷启动/验证命令/假阳性防坑）
- `references/topic-driven-direct-publish-pattern.md` — 主题驱动发布的候选锚定与 worktree 非快进修复记录（Resilio 实例）
- `references/pitfall-20260728-subagent-429-fallback.md` — 子智能体全部 HTTP 429 时 orchestrator 接管写卡的完整恢复路径（2026-07-28）
- `references/pitfall-20260728-meta-yaml-multi-doc-trap.md` — meta.yaml "single document in the stream, but found more" 排错：em-dash / 尾换行 / 尾 `---` / `.html` 引号四种触发条件与修复顺序（2026-07-28）
