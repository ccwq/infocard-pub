---
name: infocard-three-stage-pipeline
description: 管理 agent1（调研）→ agent2（写卡）→ 主线程（发布）的分工流水线，用于信息卡发布。
---

# Infocard 三阶段调研写卡流水线

> 管理 agent1（调研）→ agent2（写卡）→ 主线程（发布）的分工流水线。

## 仓库选择规则（重要）

| 内容类型 | 目标仓库 | 本地路径 | GitHub Pages URL |
|---------|----------|----------|------------------|
| 信息卡（docs/*.html） | `wt-pake` (infocard-pub) | `/home/ccwq/wt-pake/` | `ccwq.github.io/wt-pake/docs/...` |
| 公众号主题预览（*.html） | `wx-publish-open-preview` | `/home/ccwq/wx-publish-open-preview/` | `ccwq.github.io/wx-publish-open-preview/...` |

**常见错误**：把公众号主题 HTML 推送到 wt-pake 是错误的，应该推送到 wx-publish-open-preview。若目标仓库不存在，先 clone：
```bash
git clone https://github.com/ccwq/wx-publish-open-preview.git
```

## 状态报告要求

每次报告必须包含四要素：
1. ✅ 仓库位置正确性（哪个仓库）
2. ✅ 公网访问状态（HTTP 200/404）
3. ✅ git commit hash
4. ✅ 公众号草稿状态（是否已创建/发布）

## 触发条件

用户发送「结合我提供的文本，完成信息卡的调研、撰写、发布」且指定三阶段分工时激活。

## 三阶段职责

### agent1（调研核验）
- **职责**：只调研核验，不产出 HTML/meta.yaml/wiki
- **输出**：`/tmp/infocard-process-YYYYMMDD-HHmmss.md`（过程文件）
- **过程文件必须包含**：主体、用户原始内容、调查内容（含来源）、事实核验结果（含存疑标注：❌未核实 / ⚠️存疑）、推荐标题、推荐 slug、禁止混淆对象列表
- **GitHub Stars 提取**：参看 `references/process-file-template.md` 的「GitHub Stars 提取方法」章节，按 API → gitstarclub.com → HTML grep → browser_vision 优先级
- **约束**：信息不足时标注「未核实/存疑」继续，不臆测补全；不写 HTML / meta.yaml / wiki
- **返回**：过程文件绝对路径 + 推荐标题 + 推荐 slug + 禁止混淆对象列表

### agent2（写卡）
- **职责**：基于过程文件写卡，不调研、不核验、不发布
- **输出**：HTML + meta.yaml + wiki草稿（`/tmp/infocard-wiki-draft-*.md`）
- **写卡前自检**：标题对应正确主体、slug唯一、保留存疑项标注
- **约束**：存疑项保留标注，不擅自转确定表述；不写 build/verify/push/wiki

### Wiki 同步（发布后必做）
详见 `references/wiki-raw-sync.md`——包含 raw article 格式规范、slug 提取正则（含所有日期前缀格式）、覆盖率验证脚本、已发现的 4 类 Bug 及修复脚本。每张卡公网验收后立即执行，不得跳过。

### 主线程（构建发布）
**顺序执行**：
1. `git fetch && git pull` 确保最新
2. 检查 agent2 产物文件是否存在；若 **路径/slug 轻微错位但内容主体正确**，主线程可修正路径后继续，但必须在报告中明确说明
3. 检查 meta.yaml 是否有 `date` + `updated`（**Asia/Shanghai `YYYY-MM-DD HH:MM:SS`**）
4. 缺失或格式错误则补全/修正后再 build
5. `npm run build`（timeout=180，不要用默认值 60）
6. `npm run verify`
7. **verify 通过后立刻核验 `_index.yaml` 包含新卡**（见下方核验命令）
8. `git add / commit / push`
9. Pages 轮询验证（最多 3 次重试：10s / 30s / 60s）
10. HTTP 200 验收（注意路径前缀 `/docs/`）
11. wiki 同步（raw + concepts）

## 浏览器截图验收（主线程视觉门禁）

每张卡的视觉验收必须遵守以下规则，**不可跨任务共享 browser session**：

### 浏览器 session 生命周期（强制）
1. **每任务独立 session**：每个 infocard 的截图验收使用独立的 `browser_navigate` 会话，不复用上一个 infocard 任务的 session
2. **验收后关闭 tab**：`browser_press(key='w')` 关闭当前标签页，再开始下一个任务
3. **禁止 session 泄漏**：不得在多个 infocard 验收之间保留同一个 browser session 状态

### 截图方式优先级
1. **优先** `browser_navigate` → `browser_vision`（CDP 截图，精确）
2. **fallback**：`browser_vision` 超时（30s）时，用 headless Chrome 兜底；必须遵循 `chrome-automation-safety` 的实例归属、独立 profile 与精确清理契约：
   ```bash
   PROFILE_DIR="$(mktemp -d /tmp/hermes-card-profile.XXXXXX)"
   google-chrome --headless=new --disable-gpu \
     --user-data-dir="$PROFILE_DIR" \
     --window-size=390,1400 --hide-scrollbars \
     --screenshot=/tmp/<slug>-mobile.png \
     'https://ccwq.github.io/infocard-pub/docs/<slug>.html'
   rm -rf "$PROFILE_DIR"
   ```
   然后 `vision_analyze(image_url='/tmp/<slug>-mobile.png', question='...')` 验收

### 表格移动端溢出修复（高频 Bug）
当 infocard 包含宽表格（多栏对比表），在 `.card` 内部直接给 `<table>` 加 `overflow-x: auto` 无效（被 card 的 block formatting context 吞噬）。正确做法：

```html
<!-- 错误：overflow 被 card 吞噬 -->
<table class="comp-table" style="overflow-x:auto">

<!-- 正确：table 外层加 wrapper div -->
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
<table class="comp-table">
  ...表格内容...
</table>
</div>
```

每个 `</table>` 后必须对应一个 `</div>`（wrapper 闭合），不得遗漏。

---

**`_index.yaml` 卡片数核验（build 后必做）**：

build 成功不等于索引写入正确——超时可能让 `_index.yaml` 停留在旧版本（常见：500 cards，但实际有 510 个 meta.yaml）。

```bash
python3 -c "
import yaml
with open('_index.yaml') as f:
    d = yaml.safe_load(f)
cards = d.get('cards', [])
print(f'_count: {d.get(\"_count\")}, YAML cards: {len(cards)}')
found = [c for c in cards if isinstance(c,dict) and c.get('slug')=='YOUR-SLUG']
print(f'Card found: {len(found)}')
"
```

若 `_count` 或实际卡片数少于预期，用 Node 直接覆写后再 commit：
```bash
node --eval "
const { buildIndexData, serializeIndexYaml } = require('./scripts/index-build-lib');
const fs = require('fs');
const result = buildIndexData();
fs.writeFileSync('_index.yaml', serializeIndexYaml(result), 'utf8');
console.log('_count:', result._count, 'cards:', result.cards.length);
"
```

**GitHub Pages 路径规则**：索引 `path: docs/xxx.html` → URL 为 `/docs/xxx.html`，不是根目录 `/xxx.html`。验收时用 `/docs/` 前缀。

**失败处理**：
- verify 失败：中止，报告详情
- Pages/HTTP 验收失败：重试 3 次，仍失败则保留现场
- agent2 主体写错：视为失败，不得直接发布
- meta 时间戳若被写成 ISO / 带 T / 带时区后缀，必须回写为 Asia/Shanghai wall-clock 格式后再验证
- build/verify 期间若发现 meta shape 警告，先判断是否仅为历史遗留；新产物的 slug/path/date/updated 问题必须优先修正

### 参考文件
- `references/timestamp-and-path-pitfalls.md`：时间戳与路径坑点
- `references/pages-path-and-index-count-20260709.md`：Pages 路径规则与 build 超时导致索引不完整陷阱

## 何时用流水线 vs 直连发布

| 场景 | 技能 |
|------|------|
| 用户只给了一个 GitHub URL，无复杂多文档 | `infocard-direct-publish`（主线程直连，跳过子智能体） |
| 用户给了大量外部文本/多文档/复杂背景 | `infocard-three-stage-pipeline`（子智能体调研+写卡） |
| 用户明确要求「调研→写卡→发布」分工 | `infocard-three-stage-pipeline` |
| 并行发布多张卡（用户说「并行发布」） | 优先 `infocard-direct-publish` 主线程并行，主线程写多张卡更快更稳 |

## 主线程自检清单
- [ ] HTML / meta.yaml 文件存在
- [ ] meta.yaml 包含所有必填字段：`title`, `desc`, `slug`, `date`, `updated`, `path`, `category`
- [ ] `date` / `updated` 为带引号字符串（`"YYYY-MM-DD HH:MM:SS"`），不是裸数字（YAML 会解析为 timestamp 导致 build 报错）
- [ ] `path` 含 `docs/` 前缀（如 `docs/xxx.html`）
- [ ] `npm run build` 成功（无 `missing fields` 报错）
- [ ] `npm run verify` 通过
- [ ] `_index.yaml` 中 `_count` 和实际卡片数一致（build 超时会导致 500 张截断）
- [ ] git push 成功
- [ ] HTTP 200（Pages 部署，注意 `/docs/` 前缀）
- [ ] wiki raw + concepts 已创建

## 约束
- 三阶段严格按职责边界执行，不越权
- 主线程不默认信任子智能体口头报告，必须核验实际产物
- 过程文件路径返回而非内容
