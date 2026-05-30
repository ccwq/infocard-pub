# Scrapling 调查报告

**调查对象**：D4Vinci/Scrapling  
**调查时间**：2026-05-30  
**结论一句话**：Scrapling 是一个完整的 Python Web Scraping 框架，不只是 HTML 选择器库；在这台机器上，**直接安装与核心解析已验证可用**，带 `fetchers` 的完整安装也可用；**容器化是官方支持路径**，但当前本机 Podman 因存储配置冲突无法直接 build，因而“容器化更稳”只在修好容器运行时后成立。

## 一、核心判断

- Scrapling 的定位不是“单点 parser”，而是 **parser + fetchers + spiders + CLI + MCP** 的一体化抓取框架。
- 官方 README 和 `pyproject.toml` 显示：
  - 基础包只要求 `lxml / cssselect / orjson / tld / w3lib / typing_extensions`
  - `fetchers` extra 才把 Playwright、patchright、browserforge 等浏览器/反爬能力拉进来
  - `ai` extra 则补上 MCP 与 markdownify
- 仓库提供了 `Dockerfile`，而且 MCP server 既支持 PyPI `uvx`，也支持 OCI 镜像，说明官方已经把容器化当作一等公民。

## 二、仓库能说明什么

### 1) 功能结构

- `scrapling/parser.py`：核心选择器/HTML 解析能力。
- `scrapling/fetchers/`：
  - `requests.py`：HTTP 请求抓取
  - `chrome.py`：动态浏览器抓取
  - `stealth_chrome.py`：更强的反检测抓取
- `scrapling/spiders/`：类似 Scrapy 的爬虫框架，支持 `Spider / Request / Response / Scheduler / SessionManager`。
- `scrapling/cli.py`：提供 `get / post / put / delete / fetch / stealthy_fetch / shell / mcp` 等命令。
- `server.json`：MCP server 元数据，说明它支持作为模型上下文协议工具运行。

### 2) 版本与生态

- GitHub 仓库：`D4Vinci/Scrapling`
- GitHub stars：约 **55,219**
- forks：约 **5,328**
- 最新 release：`v0.4.8`（2026-05-11）
- PyPI 当前版本：`0.4.8`
- `requires-python >= 3.10`
- license：BSD-3-Clause

### 3) 官方安装入口

- PyPI 包名：`scrapling`
- CLI：`scrapling`
- MCP：可用 `uvx scrapling mcp` 这类方式运行（`server.json` 也写明了 stdio transport）
- Docker：仓库内有官方 `Dockerfile`

## 三、本机实测结果

### 1) 直接安装：成功

我在本机创建了独立 venv 后实测：

- `pip install -e /home/ccwq/workspace/Scrapling` ✅
- `pip install -e /home/ccwq/workspace/Scrapling[fetchers]` ✅
- `from scrapling import Selector, Fetcher, DynamicFetcher, StealthyFetcher` ✅

### 2) 解析能力：成功

用本地 HTML 片段做了最小验证：

- `Selector(html)` ✅
- `.css('.product h2::text').get()` ✅ 返回 `Demo`
- `.css('.price::text').get()` ✅ 返回 `$9`

这说明核心选择器层在当前机器上可以正常工作，不只是“装上了而已”。

### 3) 容器化：概念上支持，但本机当前阻塞

官方 `Dockerfile` 路径清晰，流程也完整：

- `python:3.12-slim-trixie`
- `uv sync --no-install-project --all-extras`
- `playwright install-deps chromium`
- `playwright install chromium`
- 最终入口：`uv run scrapling`

但我在本机用 Podman 实测 `podman build` 时，直接遇到：

- `database static dir "" does not match our static dir ...`

这不是 Scrapling 的问题，而是**本机容器运行时存储配置冲突**。因此当前这台机器上，容器路线是“官方支持，但本机不可直接跑通”。

## 四、直接安装 vs 容器化

### 直接安装更适合：

- 你主要用的是：
  - `Selector` / `parser`
  - `Fetcher` / `AsyncFetcher`
  - 轻量 HTTP 抓取
- 你想要最快开发闭环
- 你不想先处理容器 runtime、镜像缓存、浏览器层依赖
- 你要把库嵌入现有 Python 工程

**本机结论**：这台机器上直接安装已经验证通过，所以这是当前最省事的方案。

### 容器化更适合：

- 你要跑 `DynamicFetcher` / `StealthyFetcher`
- 你需要可复现环境
- 你要把 MCP server、Playwright、Chromium 以及系统依赖一起封装
- 你想避免本机 Python 环境污染

**但前提**：容器 runtime 必须先正常。当前本机 Podman 有存储配置冲突，所以容器路线需要先修环境。

## 五、推荐结论

- **只做解析 / 轻量抓取**：直接安装优先。
- **要浏览器自动化 / 反检测 / MCP 服务化**：容器化更稳，但要先修好 Podman 或换可用的 Docker runtime。
- **就这台机器现在的状态**：
  1. 先用直接安装开始开发和验证；
  2. 需要浏览器栈时再考虑容器；
  3. 如果你想长期稳定跑动态抓取，建议把容器存储问题修掉后再切到容器。

## 六、可复现命令

```bash
# 直接安装（已验证）
python3 -m venv .venv-scrapling-test
source .venv-scrapling-test/bin/activate
pip install -e /home/ccwq/workspace/Scrapling
pip install -e '/home/ccwq/workspace/Scrapling[fetchers]'

# 最小解析验证
python - <<'PY'
from scrapling.parser import Selector
html='<html><body><div class="product"><h2>Demo</h2><span class="price">$9</span></div></body></html>'
sel=Selector(html)
print(sel.css('.product h2::text').get())
print(sel.css('.price::text').get())
PY

# 容器化（官方支持，但本机当前 podman 有冲突）
podman build -t scrapling-local /home/ccwq/workspace/Scrapling
```

## 七、证据来源

- GitHub API：仓库元数据、release、stars/forks
- PyPI JSON：版本、依赖、Python 版本要求
- `README.md`：功能定位与使用示例
- `pyproject.toml`：依赖与 extras
- `Dockerfile`：官方容器路线
- `server.json`：MCP server 运行方式
- 本机 venv 实测：安装、导入、HTML 解析
- 本机 Podman 实测：容器构建阻塞点
