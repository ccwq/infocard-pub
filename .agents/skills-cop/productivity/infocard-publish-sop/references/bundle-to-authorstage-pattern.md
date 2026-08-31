# Frozen Bundle → Author-Stage 模式

## 何时使用

用户明确说"基于已冻结 bundle 和研究文件"、"输出到独立目录"、"只创建声明的 HTML/.../Markdown/manifest"、"不要提交、不要推送"时，激活此模式。

典型触发信号：
- 提供了 `publish-bundle.json` 路径
- 提供了 `research-a.json`、`research-b.json`、`outline.json` 路径
- 要求输出到 `author-stage/` 子目录
- 明确说"不要 worktree"、"不要 push"

**不要与直连发布（`infocard-direct-publish`）混淆**：直连发布用于用户给 GitHub URL 的场景，数据由主线程实时抓取；此模式用于用户提供完整冻结 bundle 和研究文件的场景，Research 已经完成。

## 与完整协议的区别

| | 完整协议 v3 | 此模式 |
|---|---|---|
| Research | agent1/agent2 调研 | 跳过（已冻结） |
| Bundle | 主线程构建 | 已提供，直接读取 |
| Author 输出 | integration worktree | 独立 `author-stage/` |
| Git 操作 | worktree → commit → push | **零 Git 操作** |
| 公开验证 | Pages CDN 验收 | 不执行 |
| Wiki 同步 | 可选 | 不执行 |

## 执行步骤

### Step 0 — 读取四个源文件（并行）

```bash
# 四个文件全部读取
cat /tmp/infocard-runs/<run-id>/publish-bundle.json
cat /tmp/infocard-runs/<run-id>/research-a.json
cat /tmp/infocard-runs/<run-id>/research-b.json
cat /tmp/infocard-runs/<run-id>/outline.json
```

`publish-bundle.json` 包含：
- `author.html_path`、`meta_path`、`markdown_path`、`asset_dir`、`manifest_path` — 声明的输出路径
- `author.allowlist` — 允许写入的文件列表
- `author.asset_policy.mode` — 资产下载策略
- `facts.sources` — 来源列表（含 X 原帖 URL、作者、status ID）
- `facts.claims` — 含 `status` 字段（`verified` / `source_claim` / `boundary`）
- `facts.prohibited_conflations` — 禁止混同的声明
- `style` / `language`

### Step 1 — 创建输出目录

```bash
mkdir -p "/tmp/infocard-runs/<run-id>/author-stage/<declared-asset-dir>"
# 例如：
mkdir -p "/tmp/infocard-runs/20260718-x-2078057129060233241/author-stage/assets/img/20260718-sensenova-u1-infographic-v3-x"
```

不要写入共享 worktree 或仓库目录。

### Step 2 — 下载声明资产（若 asset_policy.mode = "declared"）

从 `research-a.json` 的 `tweet.media[].url` 获取图片 URL，按以下模板下载：

```bash
curl -L --max-time 30 \
  -o "<author-stage>/<asset-dir>/x-post.jpg" \
  "https://pbs.twimg.com/media/<media-id>.jpg?name=orig" \
  -A "Mozilla/5.0 (compatible; hermes-agent/1.0)" \
  -w "\nHTTP_STATUS:%{http_code}\nSIZE_DOWNLOAD:%{size_download}"
```

**成功时**：记录 size、HTTP status 到 `manifest.json`
**失败时**：`manifest.json` 中 `assets: []` 并写 `reason`

### Step 3 — 读取主题模板

hardblue 和其他主题模板从 **worktree 副本**读取，不是从 skills 目录：

```bash
# 从 bundle 中推断风格
STYLE=$(jq -r '.author.style' publish-bundle.json)

# 主题模板位于 worktree/theme/ 下
TEMPLATE="/tmp/infocard-runs/<run-id>/publish-worktree/theme/${STYLE}.html"
cat "$TEMPLATE"
```

> 注意：`/home/ccwq/hermes-data/skills/infocard-styles/` 下无主题模板；所有 hardblue / redswiss / darkblue 等 HTML 模板均位于 `publish-worktree/theme/` 目录。

### Step 4 — 写最小文件（顺序）

1. **`manifest.json`** — 先写，即使图片下载失败也要写（空 assets + reason）
2. **`HTML`** — 主要产出，47KB 量级，包含所有 required_sections
3. **`.meta.yaml`** — 元数据：sources、verification_status、boundary_claims、fact_check_notes
4. **`Markdown`** — 纯文本版，与 HTML 内容对齐

**只写 allowlist 中声明的文件**，不写额外文件。

### Step 5 — 验证清单

- [ ] HTML 中可搜索到 X URL、status ID、作者名、handle
- [ ] X 来源作者区三要素齐全：GitHubDaily / @GitHub_Daily / 2078057129060233241
- [ ] V3 版本号全程标注"X 帖子称"+"公开补充核验未能独立确认"或等效边界说明
- [ ] 自主迭代全程标注"路线图规划中"或"非当前已上线功能"
- [ ] 资源链接区分：X 帖子原链接 vs research-b 修正参考链接
- [ ] manifest.json 的 assets 数组与实际下载状态一致
- [ ] 输出路径与 bundle 声明的 allowlist 完全匹配
- [ ] 未对共享 worktree 或仓库执行任何写入或 Git 操作

## 常见陷阱

1. **误写共享 worktree**：author-stage 是独立子目录，不是 integration worktree；不要 `git add` 或 `git commit`。
2. **把路线图写成已上线功能**：自主迭代、路线图功能必须在 HTML 中明确标注为"路线图规划"/"X 帖子称"，不得写成 V3 已实现。
3. **V3 版本号未区分来源**：在 HTML 标题、hero 和边界条件中均需标注来源属性。
4. **HuggingFace/ModelScope 链接直接引用原帖截断 URL**：research-b 发现截断问题后，卡中必须展示 research-b 正确参考链接并说明差异。
5. **图片下载失败但 manifest 声明成功**：manifest 必须如实反映实际下载状态。
6. **图片路径写错**：图片相对于 HTML 的路径须正确（HTML 在 `docs/` 下，图片在 `../assets/img/<slug>/` 下）。

## 来源文件关键字段速查

```
publish-bundle.json:
  author.html_path       → HTML 输出路径
  author.meta_path       → meta.yaml 输出路径
  author.markdown_path   → Markdown 输出路径
  author.asset_dir       → 资产目录（需在 author-stage 下重建）
  author.manifest_path   → manifest.json 路径
  author.allowlist[]     → 允许写入的文件列表
  facts.sources[]        → {type, url, author, role}
  facts.claims[]         → {id, text, status}
  facts.prohibited_conflations[]
  style                  → 主题名（hardblue / redswiss / ...）

research-a.json:
  tweet.id               → status ID
  tweet.author_display_name
  tweet.author_handle
  tweet.author_verified
  tweet.published_at_display
  tweet.body.original_text
  tweet.media[].url      → 图片下载 URL
  tweet.media[].width / height
  tweet.engagement.views / likes / reposts / bookmarks / replies

research-b.json:
  verified_external_facts.*.status
  verified_external_facts.*.detail
  about_v3_claim.status  → "⚠️ 未能确认 V3"
  about_autonomous_iteration.status → "⚠️ 路线图"

outline.json:
  title                  → 信息卡标题
  section_by_section.*   → 各章节内容
  verification.boundary_conditions[]
```

## 本模式的关键决策树

```
用户提供了 frozen bundle + research？
  ├─ YES → bundle-to-authorstage 模式（本文档）
  │         是否要求输出到独立目录 + 不 push？
  │           ├─ YES → 执行 Step 0-5
  │           └─ NO  → 仍按此模式，但可能需要 push（走完整协议）
  └─ NO  → 用户直接给 URL？
            ├─ YES → infocard-direct-publish
            └─ NO  → infocard-publish-sop full route（Research → Author → Publisher）
```
