# GitHub README 多段提取模式

## 何时用

GitHub README 普遍超 10K 字符，单次 `innerText.slice()` 会截断。
必须在 `browser_console` 中分 slice 多次提取，再用 `read_file` 或内存拼接。

## 标准流程

### Step 1：导航 + 首次提取
```js
browser_navigate → "https://github.com/{owner}/{repo}"
browser_console → expression: "(() => { const r = document.querySelector('article.markdown-body'); return r ? r.innerText.slice(0, 8000) : ''; })()"
```

### Step 2：后续分片（按需）
```js
// 第二片
browser_console → "(() => { const r = document.querySelector('article.markdown-body'); return r ? r.innerText.slice(8000, 16000) : ''; })()"
// 第三片
browser_console → "(() => { const r = document.querySelector('article.markdown-body'); return r ? r.innerText.slice(16000, 22000) : ''; })()"
// 第四片（按需追加 slice 区间）
```

### Step 3：判断内容类型
- `len(text) < 500` 且主要内容是图片链接 → 主要内容在 `images/` 目录或外链图
- README 包含明确目录结构 (`cases/`, `data/`, `script/`) → 仓库型 prompt 大全，用「分类图谱」章节
- README 含 API 调用示例 → 加入 API 接入章节
- 含 `npx` / `curl` 调用 → 标准 API 接入模式（见 `references/api-integration-pattern.md`）

## 提取优先级（知识卡场景）

GitHub README 内容分布规律：

| 区块 | 位置 | 提取优先级 |
|------|------|-----------|
| 项目标题 + 一句话描述 | 最顶部 | 必取 → hero title/subtitle |
| 功能分类 / 目录 | TOC / 开头 | 必取 → 章节规划 |
| 核心能力 / Key features | README 中前 20% | 必取 → 01 章节 |
| API 接入示例 | README 中后 30% | 优先 → API 章节 |
| Prompt 示例 / Case 列表 | 中间分布 | 抽样 → 02-04 章节 |
| 新闻/更新日志 | 底部 | 压缩 → 更新频率 |
| 社区贡献说明 | 底部 | 压缩 → 社区章节 |

## hardblue-style 知识卡章节模板（GitHub 仓库型）

```html
<!-- 01 项目能力总览 -->
<section class="section">
  <div class="section-head">
    <div class="section-no">01</div>
    <div class="section-meta">
      <div class="label">OVERVIEW</div>
      <h2>项目名称 · 核心定位</h2>
      <p>一句话描述项目是什么、解决什么问题。</p>
    </div>
  </div>
  <div class="grid-4">...</div>  <!-- 4 列能力矩阵 -->
</section>

<!-- 02 内容分类图谱 -->
<section class="section">
  <div class="section-head">
    <div class="section-no b">02</div>
    <div class="section-meta">
      <div class="label b">CONTENT CATALOG</div>
      <h2>X 大分类 · N+ 条目</h2>
      <p>内容分类摘要，配 matrix 4 列展示。</p>
    </div>
  </div>
  <div class="grid-3">...</div>
  <div class="matrix" style="margin-top:12px">...</div>
</section>

<!-- 03 API / 快速接入（如适用） -->
<section class="section">
  <div class="section-head">
    <div class="section-no k">03</div>
    <div class="section-meta">
      <div class="label k">INTEGRATION</div>
      <h2>快速接入</h2>
      <p>API 端点 / 安装命令 / curl 示例。</p>
    </div>
  </div>
  <div class="param-row">...</div>
  <div class="prompt-box">...</div>
</section>

<!-- 04 核心用法 / 模式 -->
<section class="section">
  <div class="section-head">
    <div class="section-no">04</div>
    <div class="section-meta">
      <div class="label">USAGE PATTERNS</div>
      <h2>核心用法模式</h2>
      <p>典型使用模式 + risk 块。</p>
    </div>
  </div>
  <div class="risk-grid">...</div>
</section>

<!-- 05 社区与贡献 -->
<section class="section">
  <div class="section-head">
    <div class="section-no b">05</div>
    <div class="section-meta">
      <div class="label b">COMMUNITY</div>
      <h2>社区驱动 · 更新频率</h2>
      <p>维护者 + 更新频率 + 目录结构。</p>
    </div>
  </div>
  <div class="grid-2">...</div>
</section>
```

## 关键 meta.yaml 字段（知识卡）

```yaml
slug: "YYYYMMDD-{topic}-{style}"
path: "docs/{slug}.html"
title: "项目名 · 一句话定位"
desc: "80-210字符摘要，覆盖内容类型、数量、核心价值。"
date: "YYYY-MM-DDTHH:MM:SS+08:00"        # 当前时间
updated: "YYYY-MM-DDTHH:MM:SS+08:00"   # 同 date
tags: ["标签1", "标签2", "标签3"]
category: "knowledge"    # 知识分享类用 knowledge
source: "github"
source_url: "https://github.com/{owner}/{repo}"
author: "{owner}"
```

## 验证标准

1. `npm run build && npm run verify` — 通过
2. `git status --short` — 空（工作区干净）
3. `sleep 80 && curl -sI {live_url}` — HTTP 200
4. 浏览器搜索 "项目关键词" — 命中 1 条

## 常见陷阱

- **单次 slice 截断**：README 超 10K 字符，必须分片；截断的内容往往是 prompt 示例最丰富的部分
- **desc 过短/过长**：要求 80-210 字符，是信息卡搜索引擎的展示依据
- **category 选错**：开源工具用 `open-source-tool`，知识分享用 `knowledge`，不要混用
- **缺少 path 字段**：`npm run build` 会静默失败，必须同时有 `slug` + `path`
- **`fix-meta-date.js` 导致 CI verify 失败**：`path` 字段缺失时 build 静默失败；修复后 build 成功但 CI verify 仍报错 `_index.yaml out of date`，根因是 `fix-meta-date.js` 触摸了所有 `meta.yaml` 导致 `_sort_ts` 变化。解法：所有 `meta.yaml` 都加 `updated` 字段并设为当前时间。