## SEC 12 — 与Claude Code Agent Teams的架构对比

floodsung/gongzhonghao_agent_team 与 Claude Code 内置 Agent Teams 是两套不同维度的并行方案：

| 维度 | gongzhonghao_agent_team | Claude Code Agent Teams |
|------|-------------------------|------------------------|
| 通信机制 | 主编到编辑单向分派，无横向通信 | 队友间直接通信（Mailbox） |
| 协调机制 | 主编（Claude Code主进程）统一管理 | 共享任务清单（Task List）自协调 |
| 并行粒度 | 跨账号并行（8个独立公众号） | 同会话内多队友并行 |
| AI引擎 | Claude Code（subprocess，无头） | Claude Code（同进程，teams模式） |
| 发布能力 | 微信公众号原生集成（wenyan-mcp） | 通用CLI，无公众号发布 |
| 凭证隔离 | 每个账号独立MCP.json/AppID | 共享会话环境 |
| 适用场景 | 公众号矩阵运营、跨领域内容生产 | 复杂代码审查/并行研究/跨层开发 |

**核心差异：**

- Agent Teams 解决的是同会话内多智能体协作（并行评审、竞争假设调试）
- gongzhonghao_agent_team 解决的是跨平台内容生产自动化（选题到研究到写作到发布全链路）

**两者可以结合使用：**
在 Editor Agent 内部使用 Agent Teams，让写手和审核并行迭代，再由编辑统一汇总发布。

### Token成本对比

| 方案 | Token消耗 | 说明 |
|------|-----------|------|
| Agent Teams | 随队友数线性增长 | 每个队友独立上下文窗口 |
| gongzhonghao_agent_team | 按公众号数线性增长 | 每个账号独立Claude Code进程 |
| 子代理 | 仅子任务会话消耗 | 主会话上下文复用 |

**结论：规模扩张方向不同。Agent Teams适合单项目内协作深化；gongzhonghao_agent_team适合内容矩阵扩张。**

## SEC 13 — 垂直领域特殊配置与合规要求

各账号的智能体定义文件（.claude/agents/*.md）包含领域特定规则：

### 投资洞察（investment_insights）
- **硬性禁止**：禁止推荐具体股票买卖价格、禁止预测短期走势
- **内容要求**：财报数据引用必须标注来源、分析框架透明化
- **免责声明**：文章末尾自动附合规声明

### 反洗钱合规（aml_compliance）
- **双语要求**：中英双语输出，术语统一使用OFAC/FATF官方用语
- **数据源**：仅使用公开监管文件、央行报告、FATF评估报告
- **格式规范**：Markdown含中英双语标题、段落级对照

### 军事前沿（military_frontier）
- **信息来源**：仅使用公开资料（防务新闻、政府公告、学术论文）
- **写作风格**：事实陈述为主，避免主观军事实力对比
- **术语规范**：使用官方命名（如J-20、Su-57，不得使用非正式代号）

### arXiv论文（intelligent_unit）
- **论文检索**：arxiv-mcp-server按关键词/作者/时间范围检索
- **引用格式**：arXiv ID + 标题 + 作者 + 发布时间
- **Reviewer迭代**：2-3轮质量审核，重点检查技术准确性

### 数字游民（digital_nomad）
- **政策时效**：签证/入境政策需标注查询时间点
- **信息来源**：各国移民局官网、大使馆公告
- **免责声明**：不构成法律建议

**通用规则（所有账号）：**
- 图片：3-8张，必须通过Read工具验证有效性
- 封面：必须与文章主题相关，禁止使用无关素材图
- frontmatter：`title` + `cover` 字段，不含其他元数据

## SEC 14 — 调度脚本核心代码

daily_ai_news.py（AI科技资讯调度脚本）核心结构：

```python
import argparse
import schedule
import time
import subprocess
from datetime import datetime

def parse_args():
    parser = argparse.ArgumentParser(description="AI科技资讯自动生成")
    parser.add_argument("--now", action="store_true", help="立即执行")
    parser.add_argument("--count", type=int, default=1, help="生成文章数量")
    parser.add_argument("--time", nargs="+", help="每日执行时间(BJT)")
    parser.add_argument("-v", "--verbose", action="store_true")
    return parser.parse_args()

def run_claude_code(topic_count: int, verbose: bool):
    prompt = f"生成{topic_count}篇AI科技资讯文章。"
    cmd = ["claude", "--print", prompt]
    if verbose:
        print(f"[{datetime.now()}] 启动Claude Code...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def main():
    args = parse_args()
    if args.now:
        run_claude_code(args.count, args.verbose)
        return
    for t in args.time or ["08:00", "20:00"]:
        schedule.every().day.at(t).do(
            run_claude_code, args.count, args.verbose
        )
    while True:
        schedule.run_pending()
        time.sleep(60)
```

### 关键设计点

- **subprocess.run vs Popen**：演示用run（同步），生产用Popen（异步后台）
- **cwd参数**：确保Claude Code在正确公众号目录执行
- **动态Prompt注入**：时间戳、已发表文章列表在运行时拼入prompt
- **错误处理**：subprocess返回码非0时记录日志，不阻塞后续调度

## SEC 15 — wenyan-mcp公众号发布管线

wenyan-mcp是将Claude生成内容推送到微信公众号草稿箱的核心工具：

### 工作原理

```
Claude Code生成Markdown文章
    ↓
Editor Agent: 排版调整 + 图片下载验证
    ↓
wenyan-mcp draft/create API调用
    ↓
微信公众平台API接收 → 创建草稿
    ↓
草稿箱可见 → 人工审核 → 正式发布
```

### .mcp.json配置（wenyan-mcp部分）

```json
{
  "mcpServers": {
    "wenyan-mcp": {
      "command": "node",
      "args": ["/path/to/wenyan-mcp/dist/index.js"],
      "env": {
        "WECHAT_APP_ID": "wx_xxxxxxxxxxxxx",
        "WECHAT_APP_SECRET": "xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 微信凭证获取步骤

1. 登录微信公众平台 mp.weixin.qq.com
2. 进入「开发」→「基本配置」
3. 获取 AppID 和 AppSecret
4. 注意：每个公众号有独立的一对凭证

### 草稿vs正式发布

| 步骤 | 方式 | 说明 |
|------|------|------|
| 草稿创建 | wenyan-mcp draft/create | 推送到草稿箱，待人工审核 |
| 正式发布 | 微信公众平台后台手动发布 | 草稿审核后一键发布 |

**设计意图：草稿箱审核是质量把控的最后一道门，所有正式发布前必须人工确认。**

## SEC 16 — 图片采集与验证规范

### 图片采集流程

```
文章主题确定
    ↓
Claude Code: curl下载封面图
    ↓
Read工具: 验证图片完整性（文件大小/格式/尺寸）
    ↓
不合格 → 重新下载或跳过
    ↓
合格 → 保留到文章目录
    ↓
wenyan-mcp: 上传封面图获取thumb_media_id
```

### 图片质量标准

| 检查项 | 标准 | 说明 |
|--------|------|------|
| 文件格式 | JPG/PNG/WebP | file命令验证 |
| 文件大小 | 100KB - 5MB | ls -l检查 |
| 图片尺寸 | 宽度>=900px（封面需900x383） | identify验证 |
| 完整性 | 无截断/损坏 | Read工具读取验证 |

### 常见问题

- **图片链接失效**：使用失效链接重试3次，仍失败则跳过
- **版权问题**：必须使用原创图片或CC协议图片，禁止盗用
- **封面图ID**：thumb_media_id需从微信素材库获取，不可随意指定

## SEC 17 — 竞品对照与方案选型

### 现有公众号自动化方案对比

| 方案 | 核心能力 | 智能体架构 | 多账号支持 | 开源 |
|------|----------|-----------|-----------|------|
| gongzhonghao_agent_team | 选题到写作到发布全链路 | Manager-Editor双层 | 8账号并行 | MIT |
| wechat-agent-studio | Discord协作+通义生图 | 12个Discord Agent | 多账号 | MIT |
| Agent Teams（Claude内置） | 同会话多智能体协作 | 共享任务清单 | 单会话 | 内置 |
| 自建脚本 | 定制化 | 无固定架构 | 手动扩展 | 自建 |

### 选型决策树

```
是否需要多账号并行运营？
    ├─ 否 → 是否需要同会话多智能体协作？
    │         ├─ 是 → Claude Code Agent Teams
    │         └─ 否 → 自建单账号脚本
    └─ 是 → 是否需要公众号原生发布集成？
              ├─ 是 → gongzhonghao_agent_team
              └─ 否 → wechat-agent-studio（Discord版）
```

### gongzhonghao_agent_team的独特优势

1. 微信公众号原生集成：wenyan-mcp直接调用微信公众平台API，草稿箱发布
2. 8账号并行隔离：每个账号独立Claude Code进程、独立MCP凭证，互不干扰
3. 垂直领域深度：.claude/agents/定义领域专属写作风格，非通用模板
4. 开源MIT：可自由修改、二次开发、商业使用

## SEC 18 — 局限性与改进方向

### 当前局限性

| 局限 | 影响 | 缓解方案 |
|------|------|----------|
| 人工审核门槛 | 无法完全无人值守 | 草稿箱审核仍是最后把关 |
| Claude Code无头稳定性 | subprocess调用可能中断 | supervisor守护进程+自动重试 |
| 微信API频率限制 | 高频发布触发限流 | 间隔调度+指数退避 |
| 图片版权风险 | 盗用素材可能侵权 | 仅使用原创/CC协议图片 |
| 反AI检测绕过 | 部分平台有AI内容检测 | 各账号反AI写作规则持续迭代 |
| 热点时效性 | Google News覆盖有延迟 | 多源抓取（Twitter/X + Google News）|

### 改进方向

**短期（1-3月）：**
- 接入更多数据源：Twitter/X API、Reddit、Hacker News
- 增强Reviewer Agent核查能力（加入事实核查API）
- 接入通义万象生图（参考wechat-agent-studio方案）

**中期（3-6月）：**
- 支持更多平台：知乎专栏、微博、B站专栏
- 引入Agent Teams优化编辑Agent内部协作
- 建立文章数据库：按账号/时间/主题索引，支持历史文章去重

**长期（6月+）：**
- 多语言版本自动翻译（英文公众号）
- A/B测试标题效果（不同标题生成CTR报告）
- 接入自建LLM作为降本方案

### 运维监控建议

```bash
# 日志监控（实时）
tail -f output.log | grep -E "ERROR|WARN|SUCCESS"

# 进程守护（systemd）
# /etc/systemd/system/gzh-agent@.service
[Unit]
Description=公众号智能体 %i

[Service]
Type=simple
ExecStart=/usr/bin/python3 /path/to/daily_ai_news.py --time 08:00 20:00
Restart=always
RestartSec=60
```

**核心原则：系统越自动化，人的角色越重要——从执行者变成审核者和策略制定者。**
