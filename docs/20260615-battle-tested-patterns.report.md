# 把生产代码里的编程模式做成交互式图谱

- 信息卡：`docs/20260615-battle-tested-patterns.html`
- 来源：GitHub `https://github.com/Totoro-jam/battle-tested-patterns`
- 作者：Totoro-jam
- 取证方式：优先读取 `README.md` / `README.zh-CN.md`，并本地化截图资产

## 原帖/仓库核心

`battle-tested-patterns` 不是抽象的设计模式百科，也不是单纯的刷题目录，而是把真实生产代码中的稳定做法拆成 46 个可交互、可追溯、可练习的模式图谱。它强调“代码级”与“可验证来源”——每个模式都带源码链接，并配有可视化与练习入口。

## 关键事实

- 总量：46 个 patterns
- 家族：5 个核心家族（Data Structures / Concurrency / Systems / Memory / Behavioral）
- 语言：英文主文档 + 中文文档
- 形态：交互式可视化、时间旅行回放、精确源码链接、可运行练习
- 证据来源：React、Linux、Go、Chromium、Redis、PostgreSQL、Kafka、Tokio、Erlang/OTP、LevelDB、RocksDB、etcd、Nginx、Akka、LLVM、Vue、Godot、PyTorch、CPython、ZFS

## 内容组织

1. **核心定位**：从生产代码中提炼工程模式，而不是从理论书中搬运概念。
2. **模式家族**：把 46 个模式按能力域组织，便于阅读与检索。
3. **阅读路径**：先看一句话解释，再看可视化，再跳源码，再做练习。
4. **适用边界**：适合团队教学、代码阅读、设计复盘；不适合只想看抽象定义或纯刷题列表的人。
5. **交付形式**：页面既是文档，也是实验台，也是证据索引。

## 资产说明

- 采用 `infocard-darkblue-style`
- 视觉锚点使用了仓库 README 中的 LRU Cache 截图，并本地化到：
  - `docs/assets/images/20260615-battle-tested-patterns/lru-cache-zh.png`

## 交付说明

该卡完成后应在公开页确认：
1. HTML 可访问
2. 首页索引可检索到标题关键词
3. 图片资源 200
4. 移动端不横向溢出
