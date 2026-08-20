# 关晓彤人物舆情卡 · 发布小结（2026-07-16）

## 任务性质

用户对已发布的 `20260716-guan-xiaotong-recent-public-opinion.html`（仅一条工作室声明转引 + 三节点时间线）给出“内容太过空洞 没有实质内容”的反馈，并提示“京圈背后大佬的传言 鹿晗等等”。

按 `wang-reporter-investigation-standard` 的“调查档卡升级触发条件”，默认动作是把这张单条核查卡升级为 Investigation Dossier 结构，而不是补几段。

## 升级动作

1. 新增调查报告 `docs/20260716-guan-xiaotong-recent-public-opinion.research.md`，与 HTML 同目录提交。
2. 新增扩展事实包 `.tmp/infocard/guan-xiaotong-recent-public-opinion/facts-v2.json`。
3. 重写卡片正文为 7 章节：人物档案 / 12 节点时间线 / 京圈标签审计 / 天然呆商业线（含责任边界审计表） / 鹿晗与王安宇 / 三方博弈 / 证据链与未证实边界。
4. 用事实包里的 (2022)川01民初4078号之二、(2023)川知民终282号作为“个人责任边界”的硬证据。
5. 重新写 meta.yaml：标题/描述/标签均围绕“京圈标签 + 商业关联 + 传言审计”，与旧版“单条声明核查”严格区分。

## 发布证据

- 本地门禁：`verify-bundle` PASS；`verify-card-content` 3/3 claims 命中；`verify-local-assets` PASS；`check-info-leak` 0 issues；`verify-mobile-card` 静默分支 PASS viewport meta + mobile media query。
- 移动端真实 390px 截图：SKIPPED（本地 Chrome headless 与用户桌面 Chrome 冲突 + user-data-dir 锁 + virtual-time-budget 不收敛，按 `references/chrome-headless-screenshot-trap.md` 标 `browserUnavailable`，未伪造 PASS）。
- 静态/curl 替代证据：HTTP 200，20921 字节，7 个 `<section>`，关键字符串（`人物档案 / 12节点时间线 / 京圈标签审计 / 天然呆商业线 / 鹿晗与王安宇 / 证据链与未证实边界 / (2023)川知民终282号`）全部命中。
- 远程：推送 `d02c01b`，远程 HEAD 同步为 `d02c01b38303a15fce98ef5c795bc38bebfd2796`。
- Wiki：raw articles + entities（关晓彤）已写入并推送。

## 升级后值得保留的工作流

- “单条核查卡” 是工具，不是终点。当用户明确要求“充分调查/补充信息卡”，把它当作 Investigation Dossier 触发。
- 三类材料（公开履历 / 商业风险 / 私生活传言）永远不要混写在同一段；每类单独成节，每节挂信源等级。
- 匿名爆料只能以“未找到可验证材料”作为研究结论出现，不能改写为正文事实。
- research.md + facts-v2.json 同目录落盘，保证 Wiki 同步时直接读本地文件，不依赖重新检索。