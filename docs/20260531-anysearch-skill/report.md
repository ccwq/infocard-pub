# AnySearch Skill：给 AI Agent 的实时搜索引擎技能，核心不是“搜一下”，而是把检索、批量发现、全文提取串成一条工作流

**对象**：anysearch-ai/anysearch-skill  
**定位**：面向 AI Agent 的实时搜索技能  
**调查时间**：2026-05-31  
**结论一句话**：AnySearch 不是一个单点搜索命令，而是一套给 Agent 用的检索基础设施：`search` 做通用检索，`batch_search` 做并行多题搜索，`extract` 做 URL 全文提取，`list_domains` 则把垂直领域检索拉到结构化路径上。

## A. 简报

### 1) 这个技能到底干什么
从仓库 README / SKILL.md 看，AnySearch 的目标很明确：
- 给 AI Agent 提供统一的实时搜索能力
- 支持通用网页搜索、垂直领域搜索、并行批量搜索、全文提取
- 通过一套 CLI 工具直接调用，不要求用户额外维护 MCP 服务

### 2) 它和普通“搜索插件”有什么不同
普通搜索插件往往只解决“搜到链接”。AnySearch 的设计更像一个 Agent 可用的检索层：
- `search`：先发现信息
- `batch_search`：同类问题并行搜，适合多个独立查询
- `extract`：把网页正文抓出来，进入可读文本
- `list_domains`：先判断是否属于垂直领域，再选正确的 `sub_domain` 和 `query_format`

这意味着它不仅是“找结果”，还负责“把结果变成可用材料”。

### 3) 它的安装思路也很 Agent 化
README 给出的安装方式是：
- 下载 zip
- 解压
- 移到对应的技能目录
- 再配置 `.env` 或环境变量里的 `ANYSEARCH_API_KEY`
- 用 `doc` 或 `search` 做验证

它的一个明显特点是：**API Key 可选，但建议配置**。匿名也能用，只是限额更低。

### 4) 它最适合的场景
- 调研前的事实发现
- 快速交叉验证
- 垂直领域查询
- 批量搜多个独立问题
- 从 URL 直接提取正文，避免只看 snippet

### 5) API key、收费与用途：官方能确认到什么
- 官方 README 明确写了：API key **可选，但强烈推荐**；没有 key 也能用，但会有更低的 rate limits 和 quota
- 官方给出的获取方式是：进入 `https://anysearch.com/console/api-keys` 注册并创建一个 **free API key**
- 官方还写明优先级：`--api_key` CLI flag > `.env` 文件 > 环境变量 > anonymous
- 本次调查没有在公开页面里看到明确的价格表或订阅页，因此更稳妥的说法是：**官方公开确认了“免费 API key + 匿名可用”，但未在本次核查范围内看到稳定公开的收费价格页**
- 用途上，它不是纯网页搜索工具，而是给 AI Agent 提供实时检索、批量搜索、正文抽取和垂直域检索入口
- 另外，README 强调 `list_domains` 先行，说明它更适合“垂直域先判定，再搜索”的工作流，而不是盲搜

### 6) 一个值得注意的边界
- README 没有显式给出 LICENSE 文件（我在仓库根目录公开文件里没看到）
- 这意味着使用前如果要做正式集成，最好再做一次许可证确认

## B. 核查清单

- **仓库名**：`anysearch-ai/anysearch-skill`
- **公开描述**：Unified real-time search engine skill for AI agents
- **公开能力**：`search` / `batch_search` / `extract` / `list_domains`
- **API Key**：可选，官方建议配置 `.env`
- **运行方式**：以 bundled CLI 为核心，不依赖 MCP 安装
- **文档线索**：README、SKILL.md、.env.example、runtime.conf.example
- **许可证**：本次公开文件未见 LICENSE

## C. 溯源报告

### 1) 传播路径
**GitHub 仓库 README / SKILL.md** → **技能安装与运行说明** → **CLI 工具能力清单** → **Agent 端可直接调用的搜索技能**。

### 2) 结构信号
仓库根目录公开文件里出现：
- `README.md`
- `SKILL.md`
- `.env.example`
- `runtime.conf.example`

这说明它的重点不是“代码库复杂度”，而是“把使用约束和运行配置标准化”。

### 3) 为什么这类技能对 Agent 有价值
对 Agent 来说，最麻烦的不是“能不能搜”，而是：
- 能否批量搜多个独立问题
- 能否先判断是不是垂直领域
- 能否把 URL 直接变成正文
- 能否把配置和运行方式标准化，减少每次临场配置成本

AnySearch 正好在这几件事上把路径收齐了。

## D. 结论

### 结论一句话
**AnySearch Skill 的价值，不在于“再多一个搜索入口”，而在于它把 Agent 常用的检索动作拆成了可组合的四步：发现、批量发现、全文提取、垂直域判定。**

### 适合谁
- 需要高频查资料的 Agent
- 需要并行搜多个问题的工作流
- 需要把网页正文转成可读文本的人
- 需要垂直领域搜索而不是泛搜的人

### 使用建议
- 先配 `.env` 里的 API Key，匿名也能跑，但最好别把低配当默认
- 垂直领域查询先 `list_domains`
- 要正文就用 `extract`
- 多题并行就用 `batch_search`

## E. 资料来源
- GitHub 仓库：`https://github.com/anysearch-ai/anysearch-skill`
- `README.md`
- `SKILL.md`
- `.env.example`
- `runtime.conf.example`

## F. 内省 Checklist
- [x] 已确认仓库公开文件结构
- [x] 已提炼核心能力与安装方式
- [x] 已标出 API Key、runtime.conf、list_domains 的关键约束
- [x] 已避免把“搜索技能”写成单纯搜索框
- [x] 已标注未见 LICENSE 的边界
