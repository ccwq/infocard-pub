# GitHub 仓库技术分析卡：纯仓库输入模式

**适用场景**：用户直接给 GitHub URL，要求生成技术分析信息卡（非 X 引用、非 awesome-list、无上游帖子主张）。目标是从仓库自身文档结构中提炼出高密度技术分析。

## 内容组织原则

### 优先级 1：README + README.product.md
- 先抓 `README.md`（仓库定位、一句话描述、安装路径）
- 再抓 `README.product.md`（产品定位、功能矩阵、文档地图）—— 大型仓库通常有这个文件，比 root README 更面向产品使用者
- 两个文件都抓，取互补信息，不要只靠 root README

### 优先级 2：docs/ 目录结构
- 大型项目有 `docs/` 子目录，按功能模块拆文档
- 优先级顺序：
  1. `docs/features/*.md` — 各核心功能详细说明（必抓 3-5 个）
  2. `docs/README.md` — 文档索引（确认有哪些功能文档）
  3. `docs/quickstart.md` — 快速入门（安装和运行路径）
  4. `docs/configuration.md` — 配置说明（Provider、Router、Channels 等）

### 优先级 3：releases/ 目录
- `releases/N.N.N.md` — 版本发布说明（当前版本信息、功能里程碑）
- 优先抓当前最新 release 的 notes

### 内容组织结构（OpenSquilla 参考模板）

| 章节 | 内容来源 | 说明 |
|---|---|---|
| 01 核心定位 | README.md overview | 微内核架构、一句话定位、共享 Turn Loop |
| 02 特色功能 N | docs/features/{feature}.md | SquillaRouter / Tool Compression / MetaSkills 等 |
| 03 特色功能 N+1 | docs/features/{feature}.md | 下一个核心功能模块 |
| ... | ... | 视仓库复杂度 3-6 个功能章节 |
| N 架构总览 | README + docs/ | 统一运行时路径、入口点、安全审批 |
| N+1 安装路径 | README 安装节 / quickstart.md | 推荐路径 + 备选路径 + 配置命令 |

**章节数量经验法则**：
- 简单工具（< 3 个核心功能）：4-5 个章节
- 中等复杂度（3-6 个功能）：6-8 个章节
- 大型系统（6+ 功能）：8-10 个章节，但优先保留最重要的 8 个

### Q-style 专用结构

GitHub 技术分析卡在 Q-style 下的推荐布局：

```
.hero
  .hero-copy (标题 + 一句话定位 + kicker + hero-badges)
  .hero-visual (仓库名 + 版本 + 可视化 icon)
  .hero-stats (版本 / 支持数量 / 架构标签 / 语言)

.section (×N)
  .section-head (.section-no 编号方块 + .section-title h2 + p)
  .section-body (.intro-grid / .feature-grid / .arch-grid / .method-grid 等)

.footer-block
  资源链接（仓库 / 官网 / 文档）
```

**method-grid 适用**：路由模式对比（如 SquillaRouter 的 3 种模式对比）

**feature-grid 适用**：能力矩阵（如工具压缩 3 种模式 / 记忆系统 3 个子系统）

**arch-grid 适用**：架构说明（统一运行时路径 / 入口点 / 安全审批）

**case-grid 适用**：功能合集（内置 MetaSkills 目录 / 安装路径 4 选 1）

**install-card 适用**：安装命令和配置示例（带 pre 代码块）

## 技术分析卡 vs 仓库概览卡区分

| 类型 | 目标 | 内容重心 |
|---|---|---|
| **技术分析卡** | 决策辅助 | 架构原理 + 能力边界 + 使用条件 + 替代方案 |
| **仓库概览卡** | 快速了解 | 仓库定位 + 安装命令 + 主要功能列表 |
| **Awesome List 卡** | 资源导航 | 分类清单 + 链接 + 收录标准 |

技术分析卡必须包含：
- ✅ 核心定位（为什么存在，与什么不同）
- ✅ 架构/机制说明（不是功能列表，而是工作原理）
- ✅ 能力边界（适合什么 / 不适合什么）
- ✅ 使用前提（Python 版本 / Provider 配置 / 网络要求）
- ✅ 快速上手（最小命令集）

## OpenSquilla 示例（本次固坑）

**来源结构**：
```
README.md              → 核心定位 + 安装路径 + 配置
README.product.md      → 功能矩阵 + 文档地图
docs/features/squilla-router.md      → 本地模型路由细节
docs/features/tool-compression.md     → 工具压缩机制
docs/features/meta-skills.md         → 元技能系统
docs/features/memory.md              → 记忆系统
docs/features/skills.md             → 技能系统
docs/releases/0.3.1.md             → 当前版本信息
```

**最终章节**（8 节）：
01 核心定位（微内核 + 统一 Turn Loop）
02 SquillaRouter（3 种路由模式）
03 工具压缩（3 种压缩模式）
04 MetaSkills（8 内置工作流 + Skill vs MetaSkill 区分）
05 Memory + Skills（记忆 / 技能 / 压缩缓存）
06 LLM Providers（20+ 支持列表）
07 架构总览（统一路径 / 入口点 / 安全）
08 安装路径（4 种路径 + 配置命令）

## 常见坑

- ❌ 只抓 root README，不抓 `README.product.md` 和 `docs/features/` → 内容浅薄
- ❌ 把 README 自述直接当结论，不做"它是什么 + 怎么用 + 边界"分析
- ❌ 功能章节平铺列表，没有按能力域分组
- ❌ 缺少安装/配置路径 → 读者不知道从哪里开始
- ❌ Q-style 中用了 feature-grid 而非 method-grid 来对比路由模式（应该用 method-card）

## 发布验收

发布到 infocard-pub 后必须验证：
1. `curl -sI https://ccwq.github.io/infocard-pub/docs/{slug}.html | grep HTTP` → 200
2. `_index.yaml` 包含该 slug（`grep opensquilla _index.yaml`）
3. 浏览器截图确认 Q-style 暖米纸背景、厚黑边框、彩色 chips 可见
4. 工作区 `git status --short` 为空（clean）