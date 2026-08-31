# GitHub awesome-list / field-guide 信息卡模式

适用场景：用户给 GitHub awesome list、资源导航、案例库、registry、field guide，并要求“高信息密度/容量信息卡并发布”。

## 核心判断
不要把这类仓库做成“链接目录页”。应把它重排为**决策辅助页 / 领域地图**：
- 这个 list 解决什么判断问题？
- 它的收录门槛是什么？
- 分类纪律是什么？
- 最大类别和空白类别暴露了什么生态状态？
- 新手应该按什么顺序读？
- 哪些代表条目最能说明模式迁移？

## 抽取顺序
1. 优先抓 README 原文，提取：Why / Inclusion criteria / Current coverage / category counts / source files / representative entries。
2. 如果 GitHub API rate-limited，不要停；用 raw README + 公开 GitHub HTML 继续。不要把 stars/forks 写成事实，除非已核实。
3. 对 category count 做求和，写入首屏 stats；对 0-entry 类别也要保留，它们常常是“待播种方向”的重要信号。
4. 每个 entry 只抽少量代表项，优先选择能体现不同验证器/应用域的条目，不平铺所有链接。

## 推荐结构
- Header：结论型标题，不复述仓库名。
- Stats：总条目数、主类别数、待播种类别数、分类规则/收录门槛。
- Warning / Boundary：说明不是综合数据库，排除 generic agent / pure theory / inaccessible sources。
- Section 01：一句话读懂 list 的真实价值。
- Section 02：覆盖结构，按类别 + 数量 + 应用域摘要。
- Section 03：首批该看的代表条目。
- Section 04：分类纪律 / 维护策略 / 为什么 0 类别也重要。
- Section 05：如何迁移到自己的项目：抽象验证器、复制实验边界、优先看 infra。
- Section 06：什么不算该领域案例，防止泛化误读。
- Section 07：最快阅读路径。

## 质量门槛
- 可见正文应足够厚：不仅有类别名，还要说明每类“验证信号/应用模式”。
- 不要为了凑信息写未核实 GitHub stars/forks；API 失败时明确写“未核实，不写入”。
- 如果 README 自带收录标准，必须进入卡片首屏或边界区。
- 首页 sidecar `desc` 应概括范围与用途，而不是只写“某仓库摘要”。
