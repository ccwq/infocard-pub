# Rumor Investigation Cards — Historical Mirror Pattern

For infocards that debunk a recurring rumor or viral claim (e.g., "华为停产", supply-chain break rumors, product discontinuation panic), apply this workflow in addition to the standard `any2card` authoring steps.

## Why the mirror step matters

A card that debunks one instance of a recurring rumor without the mirror is incomplete. Readers encounter the *next* instance of the same template weeks or months later and have no framework to recognize it. The historical mirror teaches pattern recognition, not just fact-checking.

## Step-by-step

### Step 1: Cross-platform evidence check

After extracting the primary source (小红书/微博/X post):

1. **Grok/搜索引擎** — search the core claim with different date keywords. For "华为断供" type rumors: `华为 长鑫 中芯 停产 供应链 2026`
2. **微博** — delegate to subagent with CDP. Note: 微博 has visitor wall (sina visitor system), full post pages often return 403. Extract from search snippets instead.
3. **If nothing found** — explicitly state "no supporting evidence on other platforms found" in the card.

### Step 2: Build the historical mirror

Search for prior instances of the same rumor template. Common patterns:

| 谣言模板 | 历史实例 |
|---|---|
| "华为停产/断供" | 2020-05 中芯国际纪要, 2024-03 Mate60停产, 2025-04 三星撤出 |
| "XX公司退出中国" | 三星/苹果/特斯拉撤出谣言，周期性出现 |
| "XX芯片断供" | 每次美国出口管制更新后必有 |

For each historical instance, record:
- Date of occurrence
- What the rumor claimed
- How it was resolved (official denial, stock reaction, policy clarification)
- Source of the resolution

### Step 3: Structure the HTML section

Insert before the verdict section. Use this structure:

```html
<div class="section">
  <div class="section-title">历史镜像 · 同类谣言规律</div>
  <p>「[核心谣言模板]」是周期性复发的经典谣言模板。每次均有官方辟谣或反转为结局。</p>
  <!-- one card per historical instance -->
  <div class="historical-card">
    <div class="card-header">
      <strong>YYYY-MM · [事件]</strong>
      <span class="badge [green|orange|blue]">[官方辟谣|华为辟谣|官方动态]</span>
    </div>
    <div>具体描述...</div>
  </div>
  <!-- note if applicable -->
  <div class="note">注：[区分政策与恐慌的说明]</div>
</div>
```

### Step 4: Distinguish policy from panic

Many supply-chain rumors conflate two very different things:

| 类型 | 说明 |
|---|---|
| **政策** | 政府采购禁令（2027年生效）、出口管制（针对特定实体）、实体清单更新 |
| **恐慌** | "供应链彻底断裂"、"工厂停产"、"产品下市" |

The note should be factual: e.g., "美国2027年联邦采购禁令针对政府采购，非全面断供，与本帖所称'华为停产'性质不同。"

## Example: 华为供应链恐慌镜像

| 时间 | 事件 | 结论 |
|---|---|---|
| 2020-05 | 《中芯国际-泰康一对一交流纪要》流传，港股跌4%，A股蒸发872亿 | 官方辟谣：纪要纯属捏造 |
| 2025-04 | 三星撤出中国代工谣言，多股跌停 | 官方辟谣：合作一切正常 |
| 2024-03 | Mate60 停产传言 | 华为知情人士微博辟谣 |
| 2026-05 | 何庭波宣布麒麟逻辑折叠技术商用 | 官方动态（正面） |
