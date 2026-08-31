# 调研过程文件 → 信息卡三件套模式

## 适用场景

用户提供了调研过程文件（如 `/tmp/infocard-process-YYYYMMDD-HHMMSS.md`），要求生成：
1. **HTML** 信息卡
2. **meta.yaml** 元数据
3. **wiki.md** 维基草稿

典型指令：
- "基于 /tmp/xxx.md 写 MinerU 信息卡 HTML + meta.yaml + wiki 草稿，不做 build/commit/push"
- "把调研报告转成信息卡"

## 标准输出结构

```
{output_dir}/
├── {slug}-infocard.html       # 主 HTML 信息卡
├── {slug}-infocard-meta.yaml  # 元数据 sidecar
└── {slug}-infocard-wiki.md    # Wiki 草稿
```

## 各文件内容规范

### HTML 信息卡

- 加载目标主题 skill（如 `infocard-main-style`）
- 读取 CSS skeleton reference，从零构建
- 包含模块（按需组合）：
  - `.header` — 标题 / 组织 / 标签
  - `.stats-bar` — 4 列数字锚点（Stars / Forks / 首发 / 引擎数）
  - `.lead` — 一句话结论 + 存疑数据脚注
  - `.section` × N — 核心功能验证表 / 技术架构 / 处理流程 / 安装部署 / License / Closing
  - `.footer` — 来源索引（带 `<a>` 链接）
- `#save-btn` 固定右下角，`window.print()` 触发导出
- `.page { padding-bottom: ≥ 9rem }` 确保底部不被按钮遮挡
- 移动端：390px 无横向溢出，stats 退化 2×2，grid2 单列

### meta.yaml（infocard-pub 专用格式）

必填字段（参考 `infocard-metadata-provenance`）：
```yaml
slug: mineru-infocard
path: mineru-infocard.html
category: 开源项目 / 数据处理工具
title: "MinerU — PDF 智能解析与数据提取工具"
date: "2026-07-09 08:55:00"
updated: "2026-07-09 08:55:00"
tags:
  - PDF解析
  - 数据提取
  - 开源工具
desc: >
  中文描述摘要，必须以中文字符开头，
  包含核心定位和关键数据点。
```

**⚠️ 中文 YAML key 缩进陷阱**：
sources / data_accuracy_notes 等 list 下的子键若用中文（如 `可信度`、`备注`），**必须确保 4 空格缩进与上行 key 完全对齐**。中文字符视觉宽度与 ASCII 不同，写入时容易"看起来对齐"但实际少 1 空格 → YAML 解析报 `expected <block end>, but found '<block mapping start>'`。

验证：
```bash
python3 -c "import yaml; yaml.safe_load(open('meta.yaml')); print('YAML OK')"
```

### wiki.md 草稿

包含以下章节：
1. 基本信息（table：名称 / GitHub / 组织 / Stars / Forks / License / 首发 / Trending）
2. 项目定位（一句话定位 + 核心价值主张）
3. 核心功能核验（markdown table，带 ✅/⚠️ 标记）
4. 技术架构（模型层 table / 解析引擎 table / 2.5 新能力 list）
5. 安装与部署（table：方式 / 难度 / 命令）
6. License 条款（table）
7. 数据可信度说明（🟢🟡⚠️ 分级 + 存疑数据 table）
8. 来源索引（numbered list，带 URL）
9. 关联工具对比（table）
10. 发布记录（table：日期 / 操作 / 说明）

> wiki.md 是**内部存档**，不是面向读者的发布物，无需遵循 `desc` 必须是中文的规范。

## 典型工作流

```
1. 读取 /tmp/process-YYYYMMDD-HHMMSS.md 过程文件
2. 加载目标 infocard 主题 skill（如 infocard-main-style）
3. 读取 skill CSS skeleton reference
4. 从零构建 HTML（不用现成 HTML 换皮）
5. 写入 meta.yaml（验证 YAML 语法）
6. 写入 wiki.md
7. 验证三文件结构完整性
8. 如需截图验收：browser_navigate → browser_vision
9. 不执行 build / commit / push（按用户指令跳过）
```

## 关键陷阱

| 陷阱 | 症状 | 解法 |
|------|------|------|
| 中文 YAML key 缩进不足 | `YAMLError: expected <block end>...` | 4 空格缩进验证，或用英文 key |
| 旧模板回退 | 输出是 `.wrap/.banner` 结构而非目标风格骨架 | 从 skill CSS skeleton 从零构建 |
| 保存按钮遮挡 | `.page padding-bottom` 不足 | 设置 `≥ 9rem`，桌面 `≥ 7rem` |
| 390px 横向溢出 | grid2 / table 超出容器 | `.table-wrap { overflow-x: auto }` + grid2 单列退化 |
