# 首页 taxonomy 重构：保留 archive 紧凑骨架，不做大改版

适用场景：
- 用户要求改 `https://ccwq.github.io/infocard-pub/` 首页标签 / taxonomy / 分类系统
- 用户明确强调“恢复原来的底蕴 / 紧凑风格 / 原设计语言”
- 目标是改筛选模型，不是重做首页视觉

## 用户明确校正（本次会话）

用户连续两次纠正了方向：
1. “失去了底蕴 原本是紧凑风格，现在信息密度太低了”
2. “同时首页布局需要恢复到先前版本, 现在信息密度松散, tag喧宾夺主；在原来的基础上适当进行优化, 而不是现在这样完全离开原来的设计语言”

这说明：首页 taxonomy 改造必须被视为**信息架构优化**，不是**视觉重设计**。

## 正确做法

### 1. 先回退到已验证的旧首页骨架
优先用最近一个用户认可的首页版本作为骨架（例如本次使用 `7c6ddb1` 时的 `assets/home/index.js` / `assets/home/index.css`），再叠加 taxonomy。

原则：
- 保留 poster / rail / dense row / archive 节奏
- 保留紧凑信息密度
- 不把 taxonomy 做成大块面板、卡片网格或 landing-page 风格

### 2. taxonomy 只做“轻量增强”
推荐模式：
- 5 个主维度保留
- 每个维度**只占 1 行**
- 默认只显示该行前 **6–8 个高频项**
- 行尾 `+` **只展开当前这一行**
- 旧 `tags` 退化为“关键词区 / 搜索关键词”，不要和 taxonomy 混成主视觉区

### 3. 用户已确认的 grill-me 决策
本次用户已确认：
- 保留 taxonomy，但压缩成“每维 1 行 + 单独展开”
- 5 个主维度默认显示，但每行只显示前 6–8 个高频项
- 点击 `+` 只展开当前这一行，不展开全部 taxonomy 区

后续同类任务可以直接默认采用这组交互规则，除非用户另行指定。

## DOM / 验收口径

本地或公网验收时，至少确认：
- 存在紧凑标题文案，如 `标签 + taxonomy 紧凑筛选`
- 不再出现大面板文案 `多维 taxonomy 筛选`
- 存在主维度行：`平台 / 领域`、`工具类型` 等
- 存在 `+` 单行展开按钮
- 存在 `全部关键词` 区，说明 legacy tags 已降级为关键词区
- 390px 无横向溢出

## git staging 坑点（本次同时暴露）

taxonomy 批量迁移时，`git add docs/**/*.meta.yaml` 不能可靠 stage 全部递归 sidecar，导致：
- 本地工作区 verify 正常
- CI 用干净 checkout 仍失败

安全做法改为：
```bash
find docs -name '*.meta.yaml' -print0 | xargs -0 git add
```

如果是大规模 taxonomy backfill（几百个 `.meta.yaml`），必须显式统计 `git status --short` 中剩余未 stage 的 `.meta.yaml` 数量，再 commit。

## 一句话原则

**改 taxonomy，不改首页气质；先恢复旧骨架，再把 taxonomy 压成一行式的轻量筛选层。**
