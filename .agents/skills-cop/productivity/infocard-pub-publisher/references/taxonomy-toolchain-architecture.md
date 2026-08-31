# Taxonomy 工具链架构（2026-06-27）

## 设计原则

```
taxonomy-lib.js  (共享库)
      ↑
fix-taxonomy.js    → 写入 .meta.yaml
verify-taxonomy.js → CI 门禁（exit 1）
verify-filter-index.js → filter 数据验收
```

**为什么这样分层：**

- `taxonomy-lib.js` 是纯函数库：读取 `_taxonomy.yaml`、推断逻辑、canonicalize、校验、merge。不涉及文件系统写操作，便于测试和复用。
- `fix-taxonomy.js` 负责 I/O：遍历 meta 文件、调用 lib 函数、有 `--write` 才写磁盘。
- `verify-taxonomy.js` 只读不写：用于 CI 门禁，失败才 exit 1。
- `verify-filter-index.js` 独立验证 filter 链路：模拟前端 facet 筛选逻辑，不依赖 CI 环境。

## CLI 速查

```bash
# 自动补 taxonomy（写入 .meta.yaml）
npm run fix-taxonomy                                    # 默认：只处理 git diff --changed-only
node scripts/fix-taxonomy.js --write --changed-only    # 同上，显式写法
node scripts/fix-taxonomy.js --write --all            # 全仓
node scripts/fix-taxonomy.js --write docs/foo.meta.yaml  # 指定文件
node scripts/fix-taxonomy.js --dry-run --changed-only  # 只报告，不写入

# 校验 taxonomy（CI 门禁）
npm run verify-taxonomy                                # 默认 changed-only
node scripts/verify-taxonomy.js --changed-only         # 同上
node scripts/verify-taxonomy.js --all                  # 全仓
node scripts/verify-taxonomy.js --strict               # warnings 当 errors
node scripts/verify-taxonomy.js docs/foo.meta.yaml     # 指定文件

# filter 数据验收
node scripts/verify-filter-index.js --slug <slug>      # 单卡
node scripts/verify-filter-index.js --all               # 全仓审计
node scripts/verify-filter-index.js --verbose           # 详细输出
```

## taxonomy-lib.js 导出速查

```js
const {
  buildTaxonomy,     // 从 meta data 推断完整 taxonomy 对象
  mergeTaxonomy,     // 保留已有 + 补空缺
  validateTaxonomy,   // 校验维度值是否在 _taxonomy.yaml 允许列表
  canonicalizeStyle, // 统一 style 别名
  inferSource,       // 从 source_url 推断 taxonomy.source
  inferStyle,        // 从顶层 style 推断 taxonomy.style
  inferRisk,         // 从 title/tags/category 推断 risk
  inferContentType,  // 从 category/来源推断 content_type
  inferDomains,      // 从语言/框架推断 domains
  inferToolTypes,    // 从功能关键词推断 tool_types
  inferStages,       // 从阶段关键词推断 stages
  inferInteraction,  // 从交互形态推断 interaction
  getAllAllowedValues,  // 加载 _taxonomy.yaml 允许值
  REQUIRED_NON_EMPTY,   // ['source','style','risk','content_type']
} = require('./scripts/taxonomy-lib');
```

## 推断优先级

```
taxonomy.source  ← source_url（GitHub/X/Twitter/Paper/PDF/Video/Website）
                ← 顶层 source 字段
                ← 无法推断 → 报错（source 必须非空）

taxonomy.style   ← taxonomy.style（已存在则保留）
                ← 顶层 style（canonicalize 后写入）
                ← 无法推断 → 报错（style 必须非空）

taxonomy.risk    ← 关键词升级（安全敏感 / 政策敏感）
                ← 默认：低风险

其他维度         ← title + desc + note + tags 关键词推断
                ← 保留已有值，只补空缺
```

## canonicalize 规则（style 别名）

| 原始值 | 标准值 |
|---|---|
| `hardblue-style` / `infocard-hardblue-style` | `hardblue` |
| `redswiss-style` / `infocard-redswiss-style` | `redswiss` |
| `graph-paper-style` | `graph-paper` |
| `infocard-darkblue-style` | `darkblue` |
| `infocard-pixelstack-style` | `pixelstack` |
| `infocard-darkgreen-style` | `darkgreen` |
| `infocard-blue-technical-manual-style` | `blue-technical-manual` |
| `q` | `q-style` |

所有 style 推断后都会过 canonicalize，确保 `_taxonomy.yaml` 允许列表外的别名不进入 filter 链路。

## verify-filter-index.js 验证逻辑

该脚本复刻了前端 `index.js` 的 facet 筛选逻辑：

1. 加载 `_index.yaml`（权威来源）或 `index.html` 注入数据
2. 对每张卡：`normalizeCard()` 构建 `__facets`（含 style fallback）
3. 对每个 taxonomy 值构造 `selectedFacets = { dim: [value] }`
4. 调用 `cardMatchesFacets()` 模拟筛选
5. 断言：该卡在该 facet 下应出现

如果该脚本输出 PASS，说明该卡：
- 有完整 taxonomy 结构
- 所有值在允许列表内
- 点击对应 facet 能被筛选出来

## CI changed-only 判断

```js
// taxonomy-lib.js getChangedMetaFiles()
const base = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : 'origin/main';
git diff --name-only ${base}...HEAD -- 'docs/**/*.meta.yaml'
```

- CI 环境：使用 GitHub Actions 的 `GITHUB_BASE_REF`
- 本地：fallback 到 `origin/main`
- 无网络：降级为全仓处理

## 常见失败代码路径

### "source must be non-empty (can be auto-inferred)"

meta 没有 `source_url` 或 `source`，且无法从 title/tags 推断。
修复：手动在 meta 里加 `source: Website` 或 `source: User-provided`。

### "invalid value X for style"

style 值不在 `_taxonomy.yaml` 的 `style.tags` 允许列表中，且 canonicalize 后也找不到。
修复：检查 `_taxonomy.yaml` 是否缺少该 style，或在 meta 里用标准 slug。

### 工具链本身报错 "failed to read meta"

js-yaml 解析 meta.yaml 失败（常见：重复 key）。`taxonomy-lib.js` 已内建 deduplicate 逻辑处理 `duplicated mapping key` 错误。
