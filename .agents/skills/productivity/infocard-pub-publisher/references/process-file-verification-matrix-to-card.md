# 过程文件验证矩阵 → 信息卡的传递契约（2026-07-09 实录）

适用场景：agent1 已经核验完毕并产出 `/tmp/infocard-process-YYYYMMDD-HHmm.md`，明确给出每条用户陈述的 ✅/⚠️/❌ 结论；agent2 现在要把这些**带核验状态的事实**写进信息卡，绝不允许把 ❌ 静默升级为 ✅。

## 为什么这是一个独立的失败模式

agent2 的最高频踩坑不是写错 HTML 语法，而是**让未核实陈述在信息卡里看起来像已核实**——这会污染发布物，让读者误信。  
经验教训（mattpocock/skills 卡 2026-07-09 实录）：

| 用户原文 | 真实状态 | 错误做法 | 正确做法 |
|---|---|---|---|
| "Kunkun 在校读研学生" | ❌ 无证据，作者是 Matt Pocock | 改写成"作者 Matt Pocock（学生）"或干脆删掉"学生" | 保留"用户原文称...但核验...无证据"，并起一节"身份核验 callout" |
| "HTML 后台 + 三维标签" | ❌ 仓库无此实现 | 写成"提供 HTML 后台管理 skill"，丢掉 ❌ | 在该概念出现的位置插入 ⚠️ 存疑 callout，末尾用核验表对照 |
| "Mermaid 流程图" | ❌ SKILL.md 无 Mermaid | 按字面意思"画一个 Mermaid 流程图"塞进卡里 | 原文要复述 SKILL.md 实际呈现方式（纯 Markdown 列表），并标注 ❌ |

## agent2 的 4 层保持策略（强制）

### 第 1 层：HTML 主体内联存疑 callout
对每条 ❌/⚠️ 陈述，在它"本来应该出现"的那个位置放一条带边框的小 callout，不丢、不藏、不重写。模板：
```html
<div class="callout" style="border:1.5px solid #e8c200;background:#fff1b0;padding:.6rem .8rem;margin:.5rem 0;font-size:11.5px;line-height:1.65;color:#6b4e00">
  <b>⚠️ 名称核验：</b>
  原始文本称<b>"X"</b>；仓库实际是 <code>Y</code>（连接符、无空格）。
</div>
```
视觉风格：
- ❌：红边 #c8102e + 浅红底 #fff5f6，文案「未核实 / 无证据支持」
- ⚠️：黄边 #e8c200 + 浅黄底 #fff1b0，文案「部分核实 / 表述偏差」
- ✅：可在 body 里直述，无需 callout

### 第 2 层：专设"事实核验表"section（必备）
无论 agent1 给了几条结论，agent2 都必须在 HTML 内建立一张表格，逐条对照原始陈述 × 结论 × 依据。三色行底色 + 第一列加粗：
```html
<tr class="verify-row failed"><td>"原始陈述"</td><td>❌ 未核实</td><td>依据...</td></tr>
<tr class="verify-row warn"><td>"..."</td><td>⚠️ 部分核实</td><td>...</td></tr>
<tr class="verify-row pass"><td>"..."</td><td>✅ 核实</td><td>...</td></tr>
```
CSS 行底色：
```css
.verify-row.failed td{background:#fff5f6}
.verify-row.warn td{background:#fff1b0}
.verify-row.pass td{background:#dcfce7}
```

### 第 3 层：meta.yaml 的 `note:` 字段总览
在 `meta.yaml` 顶层加 `note: ` 一行可读中文摘要，列出本卡保留的 ❌/⚠️ 项及其位置。这一步让主线程发布前无需读 HTML 就能预警：
```yaml
note: 原始文本 "Kunkun 在校读研学生 / HTML 后台 / 三维标签 / Mermaid 流程图" 四项在仓库与公开资料中均未核实，已在卡内 §01 §02 §03 §04 §05 §06 逐条标 ❌ / ⚠️ 存疑。
```
**注意**：`note` 是顶层字段（不是 taxonomy 内），且保持单行，避免多行 YAML 解析陷阱。

### 第 4 层：wiki 草稿"调查结论候选"小节
在 `/tmp/infocard-wiki-draft.md` 中保留一个 "存疑 / 误读项" 表格镜像（指向主卡对应章节）。这让发布成功后，wiki 同步也能保留传播溯源。

## 防呆 checklist（agent2 退出前必查）

- [ ] 每个 ❌ 项在 HTML 中可被 grep 到（`grep -n '未核实\|❌' docs/<slug>.html`）至少一处
- [ ] 每条 agent1 给的 ⚠️ 项在 HTML 中有 callout 或核验表条目
- [ ] 核验表（✅/⚠️/❌）行数 ≥ agent1 核验结果表行数
- [ ] meta.yaml 的 `note:` 字段非空，且至少命中一个 ❌/⚠️ 关键词
- [ ] 标题与 slug 与 agent1 主体一致，未跑题
- [ ] 用户原文与"agent2 改写后"的措辞差距有据可查（agent1 过程文件 §4)

## 反模式（不要做）

1. **不要"翻译"未核实陈述**：把"在校读研学生"改成"工程教育者"——这不是核验，是替 agent1 重写结论。
2. **不要补未在 agent1 过程文件里出现的核实证据**：agent2 不被允许二次调研。
3. **不要删除原始用户的措辞**：即使觉得"他写错了"，也要在卡里显式说出"原始称 X / 实际为 Y"，让读者看到差异。
4. **不要把存疑项塞进 closing 一句话**：必须放在主体可见位置（§06 或 callout），不要在结论里悄悄代过。
5. **不要让 ❌ 行只出现在核验表里而不内联 callout**：读者不一定看到末尾那张表，关键 ❌ 项需就近提示。

## 例子：mattpocock/skills 卡的最终结构

```
§01 主体（含 ⚠️ 身份 callout 顶部固定）
§02 唯一分类轴（含 ❌ 标签 callout）
§03 ask-matt（含 ⚠️ 名称 + 机制偏差 callout）
§04 Flow 结构（含 ❌ Mermaid callout）
§05 项目动机（动机核实 / 机制 ❌ callout）
§06 事实核验表（7 行：2 错 1 ⚠️4 1 ✅）
§07 安装 / 使用
§08 适用 vs 不适用
```

经验：**身份核验 callout 放在 §01 顶部**比放在末尾更不容易被读者漏掉。  
如果主体作者是用户原本就错认的（如 Kunkun ≠ Matt Pocock），callout 必须出现在第一屏可见位置，而不是埋在 §06 表格里。
