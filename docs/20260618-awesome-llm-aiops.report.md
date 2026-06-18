# Awesome LLM AIOps 调研记录

- 源仓库：<https://github.com/Jun-jie-Huang/awesome-LLM-AIOps>
- 主题：`infocard-hardblue-style`
- 仓库定位：LLM × AIOps 学术研究与工业材料清单

## 直接证据

### GitHub 元数据
- Stars: 495
- Forks: 47
- Watchers: 25
- Open issues: 6
- License: MIT
- 默认分支：main

### README 结构
- 主标题：Awesome LLM AIOps
- Badge 直接给出 `PaperNumber-78`
- 目录按三大主线组织：
  1. LLM for Incident Management
  2. LLM for Log Analysis
  3. LLM for Infrastructure Management

### 子任务分布（从 README 逐节统计）
- 1.0 Survey & Benchmark：5
- 1.1 Incident Management：6
- 1.2 Incident Reporting：6
- 1.3 Root Cause Analysis：20
- 1.4 Incident Mitigation：5
- 1.5 Incident Postmortem Analysis：2
- 1.6 AIOps Question Answering：6
- 2.1 Log Parsing：12
- 2.2 Log Anomaly Detection：7
- 2.3 Logging Statement Generation：4
- 3.1 Benchmark：1
- 3.2 Vision：1
- 3.3 Infrastructure-as-Code：3
- 3.4 LLM Training Platform：1

### 标签约定
README 定义了 `Keywords Convention`：
- 蓝 badge：工作缩写
- 红 badge：所用 LLM 技术（Prompting / Finetuning / Agent / RAG 等）
- 棕 badge：主要任务
- 绿 badge：其它重要信息（Benchmark / System / Domain LLM 等）

## 卡片取舍
- 这张卡没有把 repo 写成普通 papers list，而是强调：
  - 三条主线
  - 14 个子任务
  - 78 篇材料
  - 方法演进（Prompting → Agent → Benchmark / Platform）
- `infocard-hardblue-style` 适合这种高密度研究手册/路线图型内容。

## 没有过度声称的部分
- 没把它说成带自动发现系统或前端产品，因为仓库只有 README + LICENSE
- 没假设存在数据集文件或单独 benchmark 代码仓库，除非 README 明确给了 project 链接
- 没把所有条目都说成论文；仓库自己写的是 academic researches and industrial materials
