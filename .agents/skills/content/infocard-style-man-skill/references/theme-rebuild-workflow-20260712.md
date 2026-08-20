# 主题重建工作流（2026-07-12 实测）

## 触发条件

需要重建信息卡主题时（如 meta style 声明与实际 CSS 不符、facts.json 缺失）：

1. 读取 `docs/<slug>.html` 提取 `:root` CSS token，与主题签名表对照，确认实际主题。
2. 检查 `.tmp/infocard/<slug>/facts.json` 是否存在：
   - **存在** → 读取 facts，按主题重建 HTML
   - **不存在** → 先从 meta.yaml 反查 source_url，从 GitHub API 重新收集 repo meta（stars/forks/license/language），从 README 提取 claims，再创建 facts.json

## 实测流程

### Step 1：判断实际主题

```bash
python3 -c "
import re
h=open('docs/<slug>.html').read()
m=re.search(r':root\s*\{([^}]+)\}',h,re.DOTALL)
if m: print(m.group(0)[:400])
"
```

对照 CSS 签名表（见 SKILL.md Live Registry）确定实际主题。

### Step 2：收集事实数据

```bash
# GitHub API 元数据
curl -s https://api.github.com/repos/<owner>/<repo> | python3 -c \
  "import json,sys; d=json.load(sys.stdin); print(f'Stars:{d.get(\"stargazers_count\",\"N/A\")} Forks:{d.get(\"fork_count\",\"N/A\")} Lang:{d.get(\"language\",\"N/A\")} License:{d.get(\"license\",{}).get(\"key\",\"N/A\")}')"

# README 内容
curl -fsSL 'https://raw.githubusercontent.com/<owner>/<repo>/main/README.md' 2>/dev/null | head -120
```

### Step 3：创建 facts.json

```json
{
  "source_url": "https://github.com/<owner>/<repo>",
  "retrieved_at": "2026-07-12Txx:xx:xxZ",
  "repo_meta": {"name":"<repo>","title":"<title>","full_name":"<owner>/<repo>","stars":NNNN,"forks":null,"license":"MIT","language":"Python"},
  "title": "<title>",
  "claims": ["Stars数字","MIT","核心特性A","核心特性B","..."],
  "required_sections": ["项目名","Stars数字","MIT","特性A","特性B","..."],
  "min_claim_coverage": 8,
  "assets": []
}
```

### Step 4：加载主题 Skill + 读取 theme/*.html

```bash
# 读取主题 CSS token
python3 -c "
import re
h=open('theme/<theme>.html').read()
m=re.search(r':root\s*\{([^}]+)\}',h,re.DOTALL)
if m: print(m.group(0)[:600])
"
```

### Step 5：重建 HTML

- 使用主题 CSS token 和 layout skeleton
- section aria-label 必须包含所有 required_sections 中的关键词
- 每个 semantic section 的第一个子元素必须是 `<h2>`（内容门禁要求）
- 重建完成后运行 `node scripts/verify-card-content.js --bundle .tmp/publish-bundles/<slug>.json`

### Step 6：门禁修复模式

内容门禁报错 "missing semantic section evidence for X"：
- 对应 required_sections 中的 claim X
- 修复方式：将 X 加入对应 section 的 `aria-label` 属性（逗号分隔多个关键词）
- 示例：`section aria-label="分层索引 Parent Chunk Child Chunk"` 补入 "Parent Chunk" 和 "Child Chunk"

## 主题重建决策矩阵

| 情况 | 动作 |
|------|------|
| meta 标 A、CSS 是 B（主题不符） | 重建 HTML + 修正 meta |
| CSS 和 meta 都是 B，但 B 不适合内容 | 重建 HTML + 修正 meta |
| facts.json 缺失 | 先重建 facts，再重建 HTML |
| facts.json 存在，CSS 和 meta 一致 | 仅修正 meta style 声明 |
| CSS 和 meta 一致，且主题匹配内容 | 无需改动 |

## 实测教训（2026-07-12）

1. **hardblue token 变体**：repo 中 `theme/hardblue.html` 与 canonical template `docs/20260610-obscura.html` 的 hardblue token 有差异：
   - `theme/hardblue.html` 用 `--red:#d80018` + `--blue:#1f63ff`
   - `obscura.html` 用 `--red:#c8102e` + `--blue:#0036a3`
   - 重建卡以 repo theme 为准，obscura.html 作组件结构参考

2. **内容门禁 h2 规则**：每个 semantic section 的第一个子元素必须是 `<h2>`，`<h3>` 不能替代 `<h2>`。

3. **section aria-label 关键词**：关键词必须出现在 `section[aria-label]` 属性中，不能只出现在 HTML body 文本里。

4. **facts.json 缺失的根因**：子智能体超时导致 `.tmp/infocard/` 下facts 未创建时，该卡无法重建。必须在重建前先补 facts。
