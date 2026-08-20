# AI Model / LLM 仓库信息卡结构（MiniMind 2026-07-07 实测）

## 适用场景
- GitHub 仓库类型：开源模型、LLM 训练框架、AI 模型库
- 用户要求包含：模型参数、训练链路、技术栈对比
- 主题色倾向：redswiss（重型技术手册）/ hardblue（调查手册）/ blue（技术手册）

## 推荐内容结构（7 sections）

### S01 · Tech Highlights
- 2列 grid，第一列「核心创新」（全链路从0实现、结构对齐Qwen3、完整RLHF），第二列「生态兼容」（推理引擎/训练框架/可视化/评测）
- 用 `.hl-box` + `.hl-box.red-box` 分隔不同维度

### S02 · Model Family
- 用 `.model-item` CSS 类做紧凑列表（name / size / date 三列）
- 表头行用 `background:var(--ink)` 深色背景
- 延伸项目用 `.grid-3` 并排展示

### S03 · Training Pipeline
- 顶部放 `.step-flow`（步骤流程条：Pretrain → Tokenizer → SFT → DPO → Agentic RL → 推理）
- 下方 2 列 grid，左列 Pretrain+Tokenizer+SFT，右列 RLHF+DPO/GRPO/CISPO
- 步骤条 `.step-flow` 用 `flex` + `border-right: 2px solid var(--red)` 做箭头分隔

### S04 · Parameter Scale Comparison Table
- 用标准 `table` + `th` 深色背景 + `tr:nth-child(even)` 斑马纹
- MiniMind 系列行用 `color:var(--red); font-weight:800` 高亮
- GPT-3 / Llama 作为对照行用普通样式
- 底部加 `.hl-red` 收口洞察

### S05 · Quick Start
- 训练命令用 `.code-block`（深色背景）展示
- 硬件要求用 2 列 `.gcell` + `.hl-box`
- 数据下载用 `.hl-box` + `a[style="color:var(--red)"]` 链接

### S06 · Scenarios
- 4 列 `.grid-2` 场景卡，每格大标题 + `.hl-box` 描述

### S07 · Datasets & Extensions
- 数据集用 table（数据集/用途/规模/格式四列）
- 扩展用 `.pills` 标签行

## redswiss 风格关键 CSS 变量
```css
:root {
  --bg: #f5f2ec;        /* 暖米背景 */
  --paper: #fffdf9;     /* 卡片白 */
  --ink: #0a0a0a;       /* 纯黑 */
  --red: #c8102e;       /* 品牌红 */
  --soft-red: #fff5f6;  /* 淡红底 */
  --line: #0a0a0a;      /* 边框线 */
  --shadow: 6px 6px 0 rgba(10,10,10,.10);
}
```

## 顶栏结构（diagonal red-black hero）
```
+------------------+------------+
|  diagonal hero   | meta grid  |
|  (red→black渐变) | (pill列)  |
+------------------+------------+
```
- Hero: `linear-gradient(135deg, var(--red) 0%, #d92a45 58%, #111 58%, #111 100%)`
- 右侧 meta grid: 2 行，第一行 2 个 `.meta-pill-lg`（Stars / Forks），第二行 3 个 pill
- 左下角 tagline 用 `.tagline`（红底白字 uppercase）

## 关键 CSS 组件
```css
/* Stats 行 */
.stats { display:flex; flex-wrap:wrap; border:2px solid var(--line); }
.stat { flex:1; min-width:80px; border-right:2px solid var(--line); text-align:center; }
.stat.red-bg strong { color: var(--red); }
.stat.ink-bg { background:var(--ink); border-right-color:var(--red); }
.stat.ink-bg strong { color:#fff; }

/* Model 列表行 */
.model-item { display:grid; grid-template-columns:1.6fr 1fr 1fr; border-bottom:1px solid #ddd; padding:5px 8px; }
.model-item .name { font-weight:800; }
.model-item .size { color:var(--red); font-weight:800; }

/* Step 流程条 */
.step-flow { display:flex; align-items:center; flex-wrap:wrap; }
.step { background:var(--ink); color:#fff; padding:5px 10px; font-size:11px; font-weight:800; border-right:2px solid var(--red); }
.step.red { background:var(--red); }

/* 移动端折叠 */
@media(max-width:720px) {
  .step-flow { flex-direction:column; align-items:flex-start; }
  .step { border-right:none; border-bottom:2px solid var(--red); }
  .step.last { border-bottom:none; }
}
```

## 实际文件参考
`docs/20260707-minimind.html`（相对于当前 active repository root；565行，33KB，redswiss 风格）

## 来源数据采集命令
```bash
# GitHub API（星数/Fork/许可证/语言）
curl -s "https://api.github.com/repos/{owner}/{repo}" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(f'Stars: {d[\"stargazers_count\"]}, Forks: {d[\"forks_count\"]}, License: {d[\"license\"][\"spdx_id\"] if d.get(\"license\") else \"N/A\"}, Language: {d[\"language\"]}')"

# README（master 分支，可能 404，用 master 而非 main）
curl -s "https://raw.githubusercontent.com/{owner}/{repo}/master/README.md" | head -300

# 模型列表：从 README 提取 | Model | Params | Release | 表格
```

## wiki 同步（高价值卡必须执行）
1. `raw/articles/YYYY-MM-DD-infocard-{slug}.md` — 原始记录
2. `concepts/{slug}.md` — 知识页（type: concept）
3. 更新 `index.md`（加到 Concepts 第一行，页数+1）
4. 更新 `log.md`（顶部加一行）
5. `git add + commit + push`

## 发布验收
```bash
# 轮询等待 Pages 部署（通常50-120s）
for i in 1 2 3 4 5 6; do sleep 25; code=$(curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/{slug}.html"); echo "[$i] HTTP $code"; [ "$code" = "200" ] && break; done

# 390px 移动端截图（Python playwright，绕过 Node.js 模块缺失问题）
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://ccwq.github.io/infocard-pub/docs/{slug}.html', wait_until='networkidle')
    page.screenshot(path='/tmp/{slug}-mobile.png', full_page=True)
    browser.close()
print('Screenshot saved')
"
```
