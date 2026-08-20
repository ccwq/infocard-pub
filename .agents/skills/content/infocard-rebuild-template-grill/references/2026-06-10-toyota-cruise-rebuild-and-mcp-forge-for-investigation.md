# Toyota Cruise Investigation Card — mcp-forge Rebuild (2026-06-10)

## Context
用户要求重建 `20260609-toyota-cruise-cn` 信息卡，两个明确要求：
1. 主题换成 `mcp-forge-style`（企业协议枢纽风）
2. 所有信息不减少，反而要保证完整

## Key Decision: mcp-forge for Investigation Reports

mcp-forge 的视觉语言（暖米纸 + 深色控制台 + 协议彩色节点）并不局限于协议网关文档。只要内容具备以下特征，mcp-forge 就是合适的：
- 需要多维度信息汇聚（左侧调查内容 + 中央汇总 + 右侧信息 rail）
- 有大量按分类或时间排列的条目（案例/样本/事件）
- 高密度、需保持信息量

本次调查稿的结构映射：
- hero-bar → 调查主题标识
- hero-copy（左侧）→ 调查结论 + 核心判断
- gateway-column（中央）→ 4类失效机制 + 统计数字
- summary-rail（右侧）→ 样本覆盖车型一览
- section 01 → 国内边界样本（时间线）
- section 02 → 12个海外样本（按时间排，4行3列）
- section 03 → 4类失效机制（risk-grid）
- section 04 → 综合分析（起因/经过/结果/原因）
- section 05 → 来源链接

## Critical Lesson: Post-Rebuild Data Completeness

rebuild 最常见的失误不是配色，而是**信息丢失或排序混乱**。

本次 rebuild 发现：
- 12个样本中，Camry ODI 11450565（2021-06-15）在旧版里按"年款"分组，被错误地排进了 2022 年行
- 视觉模型在截图里发现了这个错误（2021年的条目出现在2022年行末尾）
- 根因：按"年款/车型"分组后再塞进 grid，天然破坏时间顺序

**正确做法**：所有条目统一按时间升序排，然后按 grid 宽度切行——不能先分组再排序。

## Verification Commands Used

```bash
# 1. 确认所有 ODI 编号都在 rebuilt HTML 里
curl -s 'https://ccwq.github.io/infocard-pub/docs/20260609-toyota-cruise-cn.html?cb=<sha>' \
  | grep -o 'ODI [0-9]*' | sort

# 2. 确认时间顺序正确（grep 所有日期行）
curl -s 'https://ccwq.github.io/infocard-pub/docs/20260609-toyota-cruise-cn.html?cb=<sha>' \
  | grep -o '20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]'

# 3. 确认 mcp-forge CSS token 系统已应用
curl -s 'https://ccwq.github.io/infocard-pub/docs/20260609-toyota-cruise-cn.html?cb=<sha>' \
  | grep -c 'hero-bar\|sample-grid\|risk-grid\|gateway-column\|summary-rail'

# 4. 存量卡 rebuild 后检查索引是否变化
git diff --stat _index.yaml index.html
# 如果为空，代表索引未变，只需 commit HTML 文件
```

## NHTSA API Connectivity Note

- 直接 HTTPS 请求 `api.nhtsa.gov` 在这个环境里会 SSL handshake 失败（exit 35）或 EOF（exit 52）
- 改用 `curl --http1.1 -sL` 可以绕过
- 或者通过浏览器 CDP 在已打开 NHTSA 页面的标签里执行 `JSON.parse(document.body.innerText)` 获取数据

## Card Metadata (for reference)

- slug: `20260609-toyota-cruise-cn`
- category: `knowledge`
- tags: 丰田, 定速巡航, 交通安全, 汽车事故, 舆情复盘, 调查
- date/updated: 2026-06-09T16:50:42+08:00
- theme used: mcp-forge-style
