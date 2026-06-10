# ApkMCP-Auto 技术分享卡复盘

## 结论
ApkMCP-Auto 是 Android 逆向工程的 MCP 工具套件，核心卖点是"让 AI Agent 变成懂 Android 逆向的助手"。它把 7 个工具（JADX、APKTool、ADB、Sign Tools、Static Analyzer、Diff Tool、Frida）封装成 MCP Server，通过 MCP 协议连接 AI 助手，实现智能化 APK 分析与修改，自动生成 Markdown 报告。Python + Java，Windows only，Apache 2.0。

## 取材依据
- GitHub API：96 stars, 22 forks, Python, Apache 2.0, visibility: public
- README 定位：Android 逆向工程 MCP 工具套件，通过 MCP 协议将 AI 助手与专业反编译工具连接
- 7 个组件及其端口：JADX(8651), APKTool(8652), ADB(8653), Sign(8654), Static(8655), Diff(8656), Frida(8657)
- 系统要求：Python 3.10+, Java 17 (内嵌 JRE), Windows 10/11, 8GB+ RAM
- Quick Start：`python apkmcp.py install` → `python apkmcp.py config` → `python apkmcp.py start <tool>`
- 提示词模板：广告分析/会员分析/加固分析/网络分析/逆向分析
- 统一命令行工具：apkmcp.py 支持 install/config/status/list/start
- MCP 工作流：AI → MCP Server → 工具 → 自动生成 Markdown 报告

## 卡片结构
1. 核心定位：AI Agent + Android 逆向
2. 7 个 MCP Server 全览
3. 安装与入口：统一命令行工具
4. 提示词模板：5 类报告场景
5. 适合 / 不适合

## 风格判断
- 采用蓝技手册风格
- Hero 用 MCP protocol badge 作为视觉锚点
- 架构图展示 AI → MCP Server → APK Tools 的工作流
- 重点强调"AI + 工具协同"而非"单个工具功能"

## 来源链接
https://github.com/kggzs/ApkMCP-Auto