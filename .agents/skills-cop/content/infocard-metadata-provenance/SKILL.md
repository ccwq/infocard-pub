---
name: infocard-metadata-provenance
description: 信息卡元数据规范管理员。负责 meta.yaml 字段标准、来源追溯、描述语言一致性，防止 desc 字段出现英文、字段名错误、date 缺失等元数据腐化问题。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, metadata, provenance, quality, desc, anti-pattern]
    related_skills: [infocard-style-man-skill, infocard-pub-publisher, any2card]
---

# infocard-metadata-provenance · 信息卡元数据规范

## Overview

`infocard-metadata-provenance` 是信息卡元数据规范管理员，负责：
1. meta.yaml 字段标准（字段名、类型、语言）
2. 来源追溯（source URL、author）
3. 描述语言一致性（desc 必须为中文）
4. 防止腐化（desc 字段名错误、英文、date 缺失）

## Provenance ownership and release-time semantics

The matching `docs/**/*.meta.yaml` sidecar is authoritative input; `_index.yaml` and homepage payloads are derived index artifacts. Generation/publish workflows own `slug`, `path`, `category`, `title`, `date`, `updated`, `tags`, and `desc`. Index rebuild scripts validate/read sidecars and must not be treated as a repair layer.

For this repository, `date` and `updated` are card release/issuance timestamps in Asia/Shanghai with seconds unless the user explicitly requests archival source-time preservation. Keep upstream publication time separately as source evidence. If a timestamp is wrong, inspect the sidecar and the publish timestamp gate before debugging the index. See `references/source-time-and-release-time.md` and `references/date-source-provenance.md`.

## 字段标准

### 必填字段

> ⚠️ **`date` 必须带时分秒（2026-07-04）：** 用 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"` 取实际值。裸日期 `YYYY-MM-DD` 会被 `rebuild_index.py` 解释为上海 00:00 → UTC 08:00 → `fmt_date` UTC→SH 显示 `12:00:00`。批量修复脚本见 `infocard-pub-publisher/scripts/fix-bare-dates.py`。

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | string | URL slug，通常为 `YYYYMMDD-title-slug` |
| `path` | string | HTML 文件相对路径，如 `docs/20260612-foo.html` |
| `category` | string | 分类，如 `open-source`、`person`、`ai-agent` **← 必填，缺失则 build 硬失败** |
| `title` | string | 卡片标题 |
| `date` | string | 发布日期，格式 `YYYY-MM-DD HH:MM:SS`（精确到秒） |
| `updated` | string | 更新时间，格式同 `date` **← 必填，且必须与 date 等值** |
| `tags` | list | 标签列表 **← 必填，缺失则 build 硬失败** |
| `desc` | string | **中文描述摘要**（必填，见下方语言规则） |
| `style` | string | 主题名，如 `darkblue`、`redswiss`、`hardblue` **← 建议填写** |

### release_audit（发布审计字段）

发布审计在公网验收完成后写入已有卡片的 `.meta.yaml`，在顶层与 `note` 同级。**仅追加不覆盖**，已有 `release_audit` 时只更新 `published_commit` 和追加 `added_sections`。

```yaml
release_audit:
  schema: 1              # 固定值，协议版本
  published_commit: "bb14473"   # 内容 commit SHA（不是 audit commit）
  pages_url: "https://ccwq.github.io/infocard-pub/docs/20260723-unknowns-ai-guideline.html"
  verified_at: "2026-07-23T17:00:00"  # ISO 8601
  visual_status: "VISUAL_PENDING"      # PASS | VISUAL_PENDING
  added_sections: "07快捷键速查表,08场景化配置方式"  # 逗号分隔；新建卡留空
  content_delta: "+201 lines (shortcuts/config/keymap/plugins)"  # 简短变更说明
```

> **注意**：`published_commit` 是**内容 commit SHA**（第一次 push 的 commit），不是 audit commit SHA。`visual_status: VISUAL_PENDING` 是截图工具异常时记录，不等于"视觉失败"。

### taxonomy v2.0（条件必填）

当用户约束中明确指定 taxonomy 字段时（如 `taxonomy v2.0: tech_stack / topics / primary_content_type 必填`），所有命名字段均为**阻塞性必填**：

```yaml
taxonomy:
  tech_stack:
    - Python
    - Claude Code
  topics:
    - academic research
    - llm pipeline
  primary_content_type: open-source toolkit
```

> **教训（2026-07-13）：** Academic Research Skills 卡首次写 meta.yaml 时完全遗漏 taxonomy 字段，build 通过但卡片语义不完整。下次遇到用户明确要求 taxonomy 结构时，必须在第一版 meta.yaml 中写入全部命名字段，不得后补。

### 选填字段

| 字段 | 类型 | 说明 |
|---|---|
| `source` | string | 来源 URL |
| `author` | string | 作者/来源平台 |
| `highlights` | list | 亮点列表（用户约束明确要求时填写） |
| `taxonomy` | object | 见上方条件必填规则 |

## 字段名规则（强制）

### `desc` vs `description`

**必须用 `desc`，禁止用 `description` 或其他名称。**

```yaml
# ✅ 正确
desc: 这是一段中文描述摘要

# ❌ 错误
description: This is English description
description: 这是一段描述摘要
```

**症状**：若 meta.yaml 写 `description`，build 后 `_index.yaml` 存 `description`；但首页渲染 JS 读取 `desc`，两边字段名不一致 → 首页列表中该卡描述为空。

**防止**：meta.yaml 一律写 `desc`，build 脚本有 normalize 兜底（`description` → `desc`），但源文件仍应统一。

## 语言规则（强制）

### `desc` 必须为中文

**所有 meta.yaml 的 `desc` 字段必须使用简体中文**，不得使用纯英文或混合语言。

```yaml
# ✅ 正确：中文描述摘要
desc: 把 Claude Code、Codex CLI、OpenCode 装进图形界面——文件树、Git 面板、用量统计全透明

# ❌ 错误：纯英文
desc: A curated awesome list of public autoresearch use cases

# ❌ 错误：前半中后半英
desc: Awesome Autoresearch 公开使用案例精选列表 — A curated awesome list of public autoresearch use cases
```

**允许的情况**：
- 产品名称、工具名、GitHub slug 等专有名词保留英文：`Claude Code`、`Codex`、`draw.io`
- 代码片段保留原文：`npm install --save-dev`

**检测方法**（发布前必做）：

```bash
python3 - <<'PY'
import yaml, pathlib, re

docs = pathlib.Path('docs')
for m in docs.glob('*.meta.yaml'):
    data = yaml.safe_load(m.read_text())
    desc = data.get('desc','') or data.get('description','') or ''
    if not desc: continue
    # Check: desc must start with Chinese char
    chinese_start = bool(re.search(r'^[\u4e00-\u9fff]', desc))
    if not chinese_start:
        print(f'NON-CHINESE START: {m.name}: {desc[:60]}')
PY
```

**历史教训（2026-06-12）**：5 张卡的 `desc` 全为英文（awesome-autoresearch、drawio-skill、openskynet、plannotator、trinity），已在 commit `1590b3d` 中统一翻译为中文。

## 日期规则

### `date` 必须精确到秒

```yaml
# ✅ 正确
date: 2026-06-12 20:20:00
updated: 2026-06-12 20:20:00

# ❌ 错误：只到日期
date: 2026-06-12
```

**症状**：若只写日期，首页显示粒度不足，排序精度下降。

**规范**：所有卡必须使用 `YYYY-MM-DD HH:MM:SS` 格式（24 小时制，东八区时间）。

## 来源追溯规则

### `source` 和 `author`

来源明确的卡应同时填写：
```yaml
source: https://github.com/user/repo
author: github-username
```

若来源是 Wikipedia / 公开文档：
```yaml
source: https://zh.wikipedia.org/wiki/...
author: Wikipedia
```

无外部来源时可不填 `source`。

## Anti-patterns

1. **字段名错误**：`description` 而非 `desc` → 首页描述为空
2. **英文 desc**：纯英文或前半中后半英 → 发布到中文平台不专业
3. **date 粒度不足**：只写 `YYYY-MM-DD` → 排序精度不足
4. **date 缺失**：无 `date` 字段 → build 脚本报错或回退到 mtime
5. **slug 与 path 不一致**：`slug: foo` 但 `path: docs/bar.html` → 索引错乱
6. **path 指向不存在文件**：build 时报错
7. **中文 YAML key 缩进不足**（高发陷阱）：list item 子键使用中文标识符（`可信度`、`备注` 等）时，若缩进少 1 空格，YAML 解析报 `expected <block end>, but found '<block mapping start>'`

### 中文 YAML key 缩进陷阱（Anti-pattern #7 详解）

**触发场景**：在 meta.yaml 的 list（如 `sources:`、`data_accuracy_notes:`）下，用中文作为子键名。

**错误写法**：
```yaml
sources:
  - title: "GitHub 官方仓库"
    url: https://github.com/opendatalab/MinerU
   可信度: 高        # ← 少 1 空格！视觉对齐但 YAML 解析失败
    备注: "Stars 66.9k"
```

**正确写法**：
```yaml
sources:
  - title: "GitHub 官方仓库"
    url: https://github.com/opendatalab/MinerU
    可信度: 高       # ← 4 空格，与 url/title 对齐
    备注: "Stars 66.9k"
```

**根因**：中文字符视觉宽度与等宽 ASCII 不同，写入时容易"看起来对齐"但实际少 1 空格。

**验证命令**：
```bash
python3 -c "import yaml; yaml.safe_load(open('meta.yaml')); print('YAML OK')"
```

**防呆建议**：
- 避免在 list item 子键中使用无引号中文字符串，改用英文 key（`credibility` / `note`）
- 或确保所有 key 统一加英文双引号 `"可信度":`（YAML 解析器对引号键更严格，会拒绝缩进错误）

## 发布前检查清单

每次发布 meta.yaml 前必须确认：

- [ ] 字段名是 `desc` 而非 `description`
- [ ] `desc` 首字符是中文（`[\u4e00-\u9fff]`）
- [ ] `desc` 无前半中后半英的混合结构
- [ ] `date` 精确到秒（`YYYY-MM-DD HH:MM:SS`）
- [ ] `slug` 与文件名一致
- [ ] `path` 指向真实存在的 HTML 文件
- [ ] 发布前可用 `references/check_desc_required.py` 扫描缺失摘要的 sidecar

## Redundancy Policy

本技能不负责：
- 视觉风格（归 `infocard-style-man-skill`）
- 发布流程 / build / git（归 `infocard-pub-publisher`）
- 内容抽取 / 网页转卡（归 `any2card`）

## Verification Checklist

- [ ] 所有 meta.yaml 使用 `desc` 而非 `description`
- [ ] 所有 `desc` 首字符为中文
- [ ] 所有 `desc` 无混合语言结构
- [ ] 所有 `date` 精确到秒
- [ ] 所有 `path` 指向真实文件
- [ ] slug 与文件名一致
