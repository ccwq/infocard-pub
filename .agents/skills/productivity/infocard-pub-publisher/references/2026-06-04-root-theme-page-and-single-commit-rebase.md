# 2026-06-04: infocard Theme Gallery + iframe CSP 验证

## 背景

用户要求"维护一个事实清单，后续 infocard 主题增删改查都要从这个事实清单里"，并要求主题预览不只是色块 swatch，必须包含真实 UI 元素（结构/文字/布局/交互）。

## grill-me 5 轮对齐结论

| 轮次 | 维度 | 选择 |
|------|------|------|
| 1 | UI 元素范围 | E（全部） |
| 2 | 预览载体 | A（Mini 信息卡） |
| 3 | 展示方式 | A（直接嵌入） |
| 4 | 内容 | D（标志性截图 + 换色固定套） |
| 5 | 技术方案 | D（iframe 嵌入，截图 fallback） |

## iframe CSP 验证（2026-06-04）

**验证页面**：`iframe-test.html`（根目录）

**测试结果**：4 个主题参考页全部成功嵌入，无 CSP 限制。

| 主题 | iframe 内容 | 状态 |
|------|------------|------|
| Q 风格 | Harness 卡完整渲染 | ✅ |
| 黑头风格 | 西安调查卡完整渲染 | ✅ |
| 绿色风格 | Hermes Learning Resources 完整渲染 | ✅ |
| 主骨架风格 | Duix Avatar 完整渲染 | ✅ |

**结论**：GitHub Pages 对同域 iframe 无 `X-Frame-Options` 或 `frame-ancestors` 限制，iframe 方案完全可用。

## 解法：`_themes.yaml` + iframe 预览

### 新增文件

| 文件 | 作用 |
|------|------|
| `_themes.yaml` | 主题单一事实源，YAML 格式，含 `preview_url` 字段 |
| `themes.html` | 从 YAML 重建的展示页（含 iframe 嵌入预览） |
| `scripts/rebuild_themes.py` | 构建脚本 |
| `scripts/capture_theme_previews.py` | 截图 fallback（Playwright，780×480px） |
| `iframe-test.html` | CSP 验证测试页（可保留作参考） |

### 核心约束

1. **不要直接编辑 `themes.html`** — 它是从 `_themes.yaml` 生成的，手写会丢失
2. **增删改查主题的标准流程**：改 YAML → 运行脚本 → 两个文件一起 commit
3. **主题删改时同步 Skill**：每个主题对应一个 `skills/content/infocard-{slug}-style/`，删除主题时同步删除或更新 Skill
4. **`_themes.yaml` 不进 `_index.yaml`** — 是根级元数据，不是信息卡

## 关键发现（教训固化）

- **rebase 中 write_file 会丢失**：在 interactive rebase 中，`themes.html` 在 `git rebase --continue` 后消失（rebase 重放时丢弃 untracked 新文件）。解决：先完成 rebase，再创建 `themes.html`，单独 commit。
- **自作主张换方案**：grill-me 第 5 轮用户明确选 D（iframe），我自作主张换成了截图。踩坑后立即回退，验证 iframe 可用后再继续。教训：**grill-me 结论是约束，不是建议**。
- **push rejected 的标准处理**：远端有新提交 → `git pull --rebase` → 解决冲突（本地重建 `_index.yaml`）→ `git push`
- **Pages 部署延迟**：push 后 Pages 需 1-2 分钟同步，用 `?t=<ts>` 轮询

## 后续维护原则

- 新增主题：写 YAML（含 `preview_url`）→ 跑脚本 → commit → 如需要同步建 Skill
- 修改主题：改 YAML → 跑脚本 → commit → 如涉及 Skill 同步改 Skill
- 删除主题：改 YAML → 跑脚本 → commit → 同步删除 Skill
- fact_store 也同步更新（fact_id 86 已写入）

## 参考命令

```bash
# 重建主题页
python3 scripts/rebuild_themes.py

# 截图 fallback（如 iframe 不可用）
python3 scripts/capture_theme_previews.py

# 验证 Pages 可访问
curl -s 'https://ccwq.github.io/infocard-pub/themes.html?t=1780550000' | grep 'infocard-q-style'

# 验证 iframe CSP
curl -s 'https://ccwq.github.io/infocard-pub/iframe-test.html' | grep 'iframe'
```

## 6 个正式主题（2026-06-04 → 2026-06-06）

| position | slug | 定位 | preview_url |
|---|---|---|---|
| 1 | q-style | Q 版 / 纸感卡片风 | ./docs/20260604-revfactory-harness-q-style.html |
| 2 | green-style | 绿色 / 冷静编辑风 | ./docs/20260603-hermes-agent-learning-resources/index.html |
| 3 | black-head-style | 黑头 / 调查拆解风 | ./docs/20260604-xi-an-34-floor-fraud/index.html |
| 4 | main-style | 主要 / 默认主骨架 | ./docs/20260530-duix-avatar.html |
| 5 | blue-technical-manual-style | 蓝色技术手册 | ./docs/20260603-claude-code-web-skill-stack-swiss-blue.html |
| 6 | hardblue-style | 硬核蓝手册 / 网格底纹 + 编号块 + 多版式 | ./theme/hardblue.html |

**主题差异判定**（何时独立，何时归入）：见主 SKILL.md "何时建新主题，何时归入已有主题"小节。简言之：同色系但 ≥ 2 项版式差异 → 独立；只 1 项差异 → 归入 ref_links。

**2026-06-06 新增 hardblue-style 的关键差异点**（与 blue-technical-manual-style 对比）：
- 顶部 hero-bar 三色拼接（左红 190px / 中黑 / 右蓝 136px）vs blue 的单色 hero
- 42px 网格纸底纹 + 红/蓝色径向光斑 vs blue 的纯暖白
- 96×96 大数字编号方块（红/蓝/黑变体）vs blue 的小号编号
- 多 grid 变体：grid-2/3/4 + matrix 4 列 + risk-grid 3 列（data-accent 顶部色带）
- 3px 厚边框 vs blue 的 1.5-2px