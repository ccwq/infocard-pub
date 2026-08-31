# 风格选择 + 仓库截图提取工作流（2026-07-09 固化）

## 一、风格选择补充规则

在 `style-selection-by-content-type.md` 基础上补充：

### AI Agent / WebGPU 类 → darkblue

| 内容类型 | 风格 | 实证 |
|----------|------|------|
| AI Agent 记忆系统 | `darkblue` | TencentDB Agent Memory ✅ |
| WebGPU / 浏览器原生 AI 工具 | `darkblue` | AIDEKIN ✅ |
| AI Agent 工程 / 协议层（偏系统） | `darkblue` | 优先于 `hardblue` |

**判断逻辑**：
- 工具是"运行在用户环境里的 AI 子系统"（记忆、推理引擎、WebGPU 运行时）→ `darkblue`
- 工具是"给 Agent 用的规范/协议文档" → `hardblue`

---

## 二、仓库截图提取工作流

适用于目标项目有 README 截图或 `assets/` / `public/` 目录的情况。

### 步骤 1：浅克隆
```bash
git clone --depth=1 https://github.com/<owner>/<repo>.git /tmp/<repo>
```

### 步骤 2：过滤噪音文件
```bash
find /tmp/<repo> -type f \( -iname "*.png" -o -iname "*.jpg" \) \
  | grep -v fontawesome | grep -v vendor | grep -v webfonts \
  | grep -v "sort_" | grep -v data-tables | grep -v node_modules
```

常见噪音模式：
- `fontawesome-free/` / `vendor/` / `webfonts/` — 第三方 UI 库图标
- `data-tables/images/sort_*.png` — 表格排序按钮
- `node_modules/` — 依赖包资源
- `remixicon/`
- 外部 logo（`redis_labs_logo.png` 等）

### 步骤 3：选图标准
- ✅ README / README_CN 目录下的架构图、功能截图
- ✅ `assets/images/`、`public/`、`static/img/` 中的项目专属截图
- ✅ `logo.png`、`og.png`、`head.png`（Hero 区装饰，复制时缩放至 ≤ 80px）
- ✅ `flowchart`、`architecture`、`demo`、`screenshot` 关键字
- ❌ 字体图标文件（SVG/PNG）
- ❌ 第三方品牌 logo（Redis Labs 等）
- ❌ data-tables、fontawesome 等 UI 库内置资源

### 步骤 4：复制到仓库
```bash
mkdir -p ~/infocard-pub/assets/img/<slug>/
cp /tmp/<repo>/path/to/relevant-image.png ~/infocard-pub/assets/img/<slug>/
```

### 步骤 5：HTML 引用路径
```html
<!-- docs/ 下的 HTML 相对于 assets/ 使用 ../assets/img/<slug>/ -->
<img src="../assets/img/slug/xxx.png" alt="..." />
```

### 已知注意事项

1. **中文文件名正常工作**：GitHub Pages 对中文文件名做 URL-encode，HTML `<img src="中文.png">` 浏览器自动解码，无需 `encodeURIComponent`。
2. **尺寸参考**：
   - Hero 装饰 logo：width ≤ 80px
   - 全宽截图：`screenshot-wrap` / `screenshot` class，width 100%
   - 4 格画廊：`gallery-grid` class，`minmax(200px, 1fr)`
3. **首次 clone 选 `--depth=1`**：只取最新 commit，大量历史文件无需下载，节省时间。
4. **图片验收**：push 后用 `curl -sI` 确认 HTTP 200，文件名含中文时用 URL-encoded 路径测试。

### 实证记录

| 项目 | 风格 | 截图策略 |
|------|------|----------|
| sohutv/cachecloud | `redswiss` | README/static/img/ 下 7 张截图，含架构图 + 功能图 |
| stfurkan/aidekin | `darkblue` | public/ 下 copperleaf-demo-poster.jpg + og.png |
| harshaneel/humanize | `hardblue` | 无合适截图，跳过 |
| TencentCloud/TencentDB-Agent-Memory | `darkblue` | assets/images/ 下 logo + memory-pyramid + 2×flowchart |
