# TokDoc 信息卡复盘

## 事实收集
- Stars: 59 | Forks: 7 | Language: Python | License: MIT
- 仓库: yaojingang/yao-open-tools (tools/TokDoc 子目录)
- README 字节: 4908 | API 收集正常

## 卡片结构
- Hero: TokDoc + local-first badge + stats bar (stars/forks/lang/license)
- 核心定位: TokDoc 定位为本地文档管理器，无需联网
- 架构图: 上传文件 → TokDoc Engine → 本地短 URL
- 6 个 iconbox: Flask / SQLite / LibreOffice / 目录监听 / 版本快照 / 统计注入
- 安装入口: Docker + 本机 Node 双路径，附带完整访问地址
- 核心功能: 6 项 feature grid（实时编辑 / 阅读器 / 批量导入 / 监听 / 统计 / 回收站）
- API 摘要: 8 行 table（GET/POST/PATCH）
- 数据目录: 7 行 quicklines
- 适合不适合: 2×2 verdict grid

## 坑点记录
- 仓库子路径为 tools/TokDoc，非根目录直接读取
- Word 转 PDF 依赖 LibreOffice，本机 Node 启动需要额外配置

## 发布状态
- commit: 待提交
- 线上: 待验证