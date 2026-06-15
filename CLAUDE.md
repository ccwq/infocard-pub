# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`infocard-pub` 是一个静态发布仓库：信息卡 HTML 与配套元数据提交到仓库后，由 GitHub Pages 直接部署。

核心发布链路：

1. 在 `docs/` 下新增或更新信息卡页面。
2. 为每个页面维护同名 `.meta.yaml`。
3. 先运行 `npm run build`，确认本地可以成功生成 `_index.yaml` 并把索引数据注入 `index.html`。
4. 通过后再提交并推送到 `main`；GitHub Actions 只校验这些生成产物是否已经提交，然后部署 Pages。

## Common commands

### Preview

```bash
# 本地预览静态站点
npm run preview
```

默认使用 Python 内置静态服务器启动在 `http://localhost:4173`。

### Build / verify scripts

仓库的正式生成链路已切到本地 Node 脚本；Python 仅保留少量辅助脚本。

```bash
# 正式构建：先补齐缺失的 meta.date，再生成 _index.yaml，并把索引数据注入首页
npm run build

# 校验 repo 中的 _index.yaml 与首页注入数据是否最新
npm run verify

# 仅补齐缺失的 meta.date（默认使用首次提交时间）
node scripts/fix-meta-date.js --write --date-source first

# 如需按最后一次提交时间回填，并覆盖已有 date
node scripts/fix-meta-date.js --write --date-source last --force

# 样式审计：从已发布 HTML 中抽取样式信号，输出到 tmp_infocard_style_audit.json
python scripts/extract_infocard_styles.py
```

### Single check / targeted verification

仓库没有独立测试框架；“测试”主要是生成产物一致性校验。

```bash
# 作为单次完整校验使用
npm run verify
```

如果只想验证某张卡，通常做法仍然是：修改对应 `docs/**/index.html` 或 `docs/*.html` 与同名 `.meta.yaml` 后，重新运行 `npm run build` + `npm run verify`，因为校验逻辑是全量一致性检查，不提供按单文件筛选参数。

## Important files and architecture

### Content model

- `docs/`：主内容目录，绝大多数已发布信息卡都在这里。
- `docs/**/*.meta.yaml`：索引源数据；正式构建脚本只扫描 `docs/` 下的 `.meta.yaml`，不扫描仓库其他目录。
- `_index.yaml`：派生文件，不应手工维护；由本地 `npm run build` 生成并提交。
- `index.html`：站点首页；构建时注入 `home-index-data`，客户端直接读取这份 JSON 完成搜索、标签筛选、排序与列表渲染。
- `docs/version.json`：首页 footer 的版本信息来源；`index.html` 会以 `no-store` 方式拉取它。
- `sw.js` / `manifest.json`：PWA 相关入口。Service Worker 对 `/_index.yaml` 与 `/docs/version.json` 使用 network-first / no-store，避免首页卡片计数与线上索引缓存过期。

### Metadata contract

`_index.yaml` 中每张卡的必填字段与 `npm run verify` 一致：

- `slug`
- `path`
- `category`
- `title`
- `date`：支持 `YYYY-MM-DD`，也支持 `YYYY-MM-DD HH:MM:SS`
- `tags`

常见可选字段还包括：

- `note`
- `updated`
- `desc`

构建脚本会把元数据复制进索引项，并额外补充：

- `_sort_ts`：由 HTML 文件和对应 `.meta.yaml` 的最新 mtime 推导
- `_modified_date`：由 `_sort_ts` 格式化出的 UTC 日期时间字符串，格式 `YYYY-MM-DD HH:MM:SS`

首页 `index.html` 依赖这些衍生字段做“按修改时间倒序”的展示逻辑，因此如果你改了索引生成规则，也要同步考虑首页时间显示行为。

如果 `date` 带有时分秒，首页会按原始精度展示到秒，不会再强制截断成日期。

### Homepage behavior

`index.html` 不是纯静态列表页，而是一个“构建时注入数据 + 客户端交互壳”：

- 页面加载时读取已注入的 `#home-index-data`
- 按 `_modified_date` / 相关时间字段构造展示时间
- 支持标题、slug、分类、tag 的前端搜索
- 默认只展开一行热门标签，更多标签按折叠/展开处理

因此，新增内容是否“出现在首页”，不只取决于 HTML 是否存在，更取决于：

1. `.meta.yaml` 是否存在且字段齐全
2. `path` 是否指向真实 HTML 文件
3. `npm run build` 是否已重新生成 `_index.yaml` 并同步注入首页

### CI / deployment architecture

- `.github/workflows/pages.yml`
  - 推送到 `main` 后执行
  - 安装 Node.js
  - 运行 `npm run verify`
  - 检查 repo 中生成产物是否已提交
  - 部署整个仓库到 GitHub Pages
  - 部署后轮询线上 `/_index.yaml` 做 smoke test，确认线上产物与仓库提交一致

- `.github/workflows/index.yml`
  - 同样在 `main` 推送后执行
  - 只运行 `npm run verify`
  - 检查构建后是否仍然工作区干净

这意味着：**索引规则只有一套，来源是本地 Node 构建脚本与校验脚本；不要手工修 `_index.yaml` 或首页注入数据来“补结果”。**

## Repository conventions that are easy to miss

- 只有 `docs/` 下的 `.meta.yaml` 会进入 `_index.yaml`；仓库其他目录中的示例或特殊页面默认不会被首页索引到。
- 内容形态既有 `docs/YYYYMMDD-slug.html`，也有 `docs/YYYYMMDD-slug/index.html`；元数据里的 `path` 必须精确匹配实际发布路径。
- `docs/index.html` 是一个跳转壳，真正的首页实现位于仓库根目录 `index.html`。
- `README.md` 明确要求不要手工编辑 `_index.yaml` 或 `index.html` 中的注入数据；任何发布异常优先检查 meta、HTML 路径与本地构建脚本，而不是直接改索引产物。

## LLM Wiki 同步（2026-06-15）

高价值 infocard 发布后必须同步到 LLM Wiki；wiki 同步失败 = 发布未完成。

**Wiki 路径**：`/home/ccwq/hehome/hermes-data/home/wiki`（`WIKI_PATH` 在 `~/.hermes/.env` 中定义）

**同步模型**：每张高价值卡生成两层
1. **raw 记录**：`raw/articles/YYYY-MM-DD-infocard-<slug>.md`（不可变，修改时追加版本）
2. **知识页**：根据内容类型放入 `entities/` / `concepts/` / `queries/` / `comparisons/`

**高价值卡定义**：人物/调查卡、技术方法论卡、工具/工作流卡、科研/自动化卡、重要舆论/政策卡。

**完整流程**：调研 → 生成 HTML/meta → build → verify → commit/push → 公网验证 → 写入 wiki（raw + 知识页 + index.md + log.md）→ 验证 wiki → 报告完成

**修改/删除同步**：raw 保留版本；wiki 页加 `archived: true` 标记，不物理删除。

详细规范见 `WIKI_SYNC.md` 和 `infocard-pub-publisher` skill。

## Style / content hints from the existing codebase

- 首页与多张信息卡都在使用红黑瑞士风 / high-density archive 风格；如果修改首页或新增公共展示壳，先参考现有 `index.html` 的视觉与信息密度约定。
- `scripts/extract_infocard_styles.py` 可用于从已发布 HTML 中提取颜色、class、selector 等信号，适合在需要统一视觉语言时做样式盘点。
