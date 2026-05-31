# Scrapling 调研报告

**调查对象**：D4Vinci/Scrapling  
**调查时间**：2026-05-30 13:06  
**结论一句话**：Scrapling 是一个完整的 Python Web Scraping 框架，不只是 HTML 选择器库；基础安装与核心解析能力已验证可用，带 `fetchers` 的完整安装也可用；官方提供了容器化路径，但容器运行时如果存在存储配置冲突，构建仍会受阻。

## 一、核心判断

- Scrapling 的定位不是“单点 parser”，而是 **parser + fetchers + spiders + CLI + MCP** 一体化抓取框架。
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

## 三、验证结果

### 1) 直接安装：成功

在独立 Python 环境中实测：

- `pip install -e ./Scrapling` ✅
- `pip install -e './Scrapling[fetchers]'` ✅
- `from scrapling import Selector, Fetcher, DynamicFetcher, StealthyFetcher` ✅

### 2) 解析能力：成功

用本地 HTML 片段做了最小验证：

- `Selector(html)` ✅
- `.css('.product h2::text').get()` ✅ 返回 `Demo`
- `.css('.price::text').get()` ✅ 返回 `$9`

这说明核心选择器层可以正常工作，不只是“装上了而已”。

### 3) 容器化：概念上支持，但构建依赖可用的运行时

官方 `Dockerfile` 路径清晰，流程也完整：

- `python:3.12-slim-trixie`
- `uv sync --no-install-project --all-extras`
- `playwright install-deps chromium`
- `playwright install chromium`
- 最终入口：`uv run scrapling`

但如果容器运行时的存储配置存在冲突，`podman build` / `docker build` 这类步骤仍可能卡住。也就是说，**容器路线是官方支持的，但前提是运行时本身先正常**。

## 四、直接安装 vs 容器化

### 直接安装更适合：

- 主要用的是：
  - `Selector` / `parser`
  - `Fetcher` / `AsyncFetcher`
  - 轻量 HTTP 抓取
- 想要最快开发闭环
- 不想先处理容器 runtime、镜像缓存、浏览器层依赖
- 需要把库嵌入现有 Python 工程

### 容器化更适合：

- 要跑 `DynamicFetcher` / `StealthyFetcher`
- 需要可复现环境
- 要把 MCP server、Playwright、Chromium 以及系统依赖一起封装
- 想避免本机 Python 环境污染

**但前提**：容器 runtime 必须可用。只要运行时存储配置冲突没有解决，容器路线就还不能算“开箱即用”。

## 五、推荐结论

- **只做解析 / 轻量抓取**：直接安装优先。
- **要浏览器自动化 / 反检测 / MCP 服务化**：容器化更稳，但要先确保容器运行时正常。
- **落地建议**：先用直接安装完成开发和验证；需要浏览器栈时再切到容器；若要长期稳定跑动态抓取，建议把容器运行时问题修掉后再切换。

## 六、可复现命令

```bash
# 直接安装（推荐的起步方式）
python3 -m venv .venv-scrapling-test
source .venv-scrapling-test/bin/activate
pip install -e ./Scrapling
pip install -e './Scrapling[fetchers]'

# 最小解析验证
python - <<'PY'
from scrapling.parser import Selector
html='<html><body><div class="product"><h2>Demo</h2><span class="price">$9</span></div></body></html>'
sel=Selector(html)
print(sel.css('.product h2::text').get())
print(sel.css('.price::text').get())
PY

# 容器化（官方支持，但前提是容器运行时可用）
podman build -t scrapling-local ./Scrapling
```

## 七、证据来源

- GitHub API：仓库元数据、release、stars/forks
- PyPI JSON：版本、依赖、Python 版本要求
- `README.md`：功能定位与使用示例
- `pyproject.toml`：依赖与 extras
- `Dockerfile`：官方容器路线
- `server.json`：MCP server 运行方式
- 独立环境实测：安装、导入、HTML 解析
- 容器构建测试：运行时存储冲突会阻塞 build
