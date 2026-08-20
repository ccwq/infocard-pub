# Chinese-first public card copy

## Trigger
- 用户指出卡片没有遵守中文母语约定
- 用户要求“减少非必要英文内容”
- 面向中文读者的信息卡出现大量可替换英文标签

## Rule
中文读者优先。公开卡面的默认展示语言应是中文，而不是中英混杂。

## Scope
This rule applies not only to final card copy, but also to source collection and drafting during the card-making process: when extracting facts, drafting headings, writing stat labels, or composing explanatory copy, prefer Chinese first and keep English only for necessary source fidelity.

## Rewrite order
1. 先改标题、副标题、标签条、stats 标签、章节标题、按钮、页脚说明。
2. 再改 flow / route / grid / skill chip 中可直译的英文标签。
3. 最后保留必要英文：人名、产品名、仓库名、命令名、接口名、必须追溯来源的术语。

## Keep in English only when necessary
- Claude Code / Codex / Addy Osmani / Loop Engineering 这类专名
- `hooks` `cron` `worktree` `meta.yaml` 这类直接对应代码/命令/文件的术语
- 用户明确要求保留英文原词做对照

## Avoid
- 把 hero、stats、section label 做成英文主导
- 为了“国际化观感”保留一批其实可以直接中文化的标签
- 在中文句子里无必要地夹一串英文名词列表

## Acceptance
- 中文读者首屏扫读无需先翻译界面标签
- 英文只承担专名/证据职责，不承担主要说明职责
- 公网 HTML 验证时，grep 至少能直接命中主要中文标签而不是只能命中英文
