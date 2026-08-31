# Parallel Research + Direct Write: Infocard 发布的标准并行模式

## 何时用此模式

当用户满足以下**全部条件**时，主智能体应同时：

1. **派子智能体调研**（外部搜索、抓取、相关项目、作者背景）
2. **主智能体直接写卡**（从用户提供的文章内容）

具体触发词：
- 用户说 "/q"（快捷发布指令）
- 用户说"主题根据内容选择"或"主题你定"
- 用户提供了完整文章内容（全文、部分段落、或 URL + 摘要）

## 为什么并行而不是串行

串行（先等调研完再写卡）的代价：
- 调研平均耗时 5-10 分钟，子智能体 600s 超时风险高
- 调研结果往往与用户已给的内容高度重叠（用户给了全文，调研只是补充）
- 主智能体在等调研时处于空转状态

并行（调研 + 写卡同时做）的收益：
- 调研由子智能体异步完成，不阻塞主智能体
- 主智能体使用用户提供的原文写卡（100% 准确，无需再读一遍）
- 子智能体调研结果稍后汇入会话，可补充 GitHub 项目、作者背景等额外信息

## 主智能体写卡路径（此路径不需要调研结果）

```
1. 读取 infocard-pub 仓库状态
   REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT" && git status -sb | head-3

2. 选择主题
   - 技术调研/深度分析 → hardblue（网格纸 + 彩色标题）
   - 开源工具图鉴/CLI对比 → redswiss
   - 轻量工具/快速上手 → main-style（红蓝瑞士风）
   - 不确定 → hardblue 或 main-style

3. 写 HTML + meta.yaml（直接用用户提供的内容）
   - HTML 用 write_file 写到 docs/<slug>.html
   - TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S" 生成时间戳

4. npm run build && npm run verify

5. git add + commit + push

6. 验收：curl HTTP 200 + 关键词

7. Wiki 同步（CLAUDE.md 要求：高价值卡必须同步）
   - raw/articles/2026-MM-DD-infocard-<slug>.md
   - concepts/<slug>.md 或 entities/<slug>.md
   - 更新 wiki/index.md（追加一条）

8. 报告完成（含公网 URL + commit SHA + wiki commit）
```

## 子智能体调研路径

```
goal: 调研 <文章标题> 完整信息

tasks:
  - 抓取原文 URL + 中文翻译/摘要
  - 调研相关 GitHub 项目（名称/星标/描述）
  - 作者背景
  - 深度阅读链接

输出：调研报告（稍后汇入会话）
```

## Wiki 同步 SOP（发布完成后必须做）

```bash
# 1. 创建 raw 记录
mkdir -p /home/ccwq/hehome/hermes-data/home/wiki/raw/articles
# → raw/articles/2026-MM-DD-infocard-<slug>.md

# 2. 创建知识页（concepts/ 或 entities/）
# → concepts/<slug>.md 或 entities/<slug>.md

# 3. 更新 wiki/index.md（追加一条）
# → 在适当分类下追加 entry

# 4. 不需要 git push（wiki 在本地，不影响 infocard-pub 发布闭环）
```

**重要**：Wiki 同步是发布闭环的必要步骤，CLAUDE.md 明确"wiki 同步失败 = 发布未完成"。

## 子智能体结果返回时机的处理规则（2026-07-08 实测）

子智能体派出去后，主智能体继续写卡、build、push 都不等它。

子智能体结果回来时，有三种处理方式：

| 情况 | 处理 |
|------|------|
| 子智能体补充了 HTML 之外的细节（例如更完整的 README 结构、竞品、风险提示） | 补 wiki / concepts / index，**不重新发布 HTML** |
| 子智能体返回的信息与已发卡完全重合 | 直接忽略，不重复劳动 |
| 子智能体超时 | 正常，主智能体已有足够信息完成发布 |

**关键原则**：HTML 一旦发布就保持稳定，子智能体回来补充的是知识库，不是正文卡；如果要回写 HTML，必须由用户明确要求“重建/修正”。

## 已确认有效的组合（2026-07-08 实测）

| 用户输入 | 主智能体 | 子智能体 |
|---------|---------|---------|
| 文章全文（URL+内容）| 写 HTML + build + push | 调研 GitHub 项目 + 作者背景 |
| 仅 URL，无全文 | 派子智能体负责全部 | 调研 + 写卡 + push |
| 多张卡并行 | 写卡（多 slug）| 调研（多 slug 并行）|

## 反模式（不要用并行模式）

- 用户只给了 URL，没有全文 → 必须等调研结果，无法直接写卡
- 用户要求先调查再发布 → 串行，不要并行
- 多张卡需要写同一 slug → 不要并行（并发写冲突）

## 与 delegated-infocard-publishing 的关系

`delegated-infocard-publishing` 覆盖**子智能体超时后的恢复验收**（HTTP 200 优先于本地猜测等原则）。此文档覆盖**发布前的并行决策**：何时派子智能体调研、何时主智能体直接写卡。

两者互补，共同构成完整的发布决策框架。
