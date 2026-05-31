# Kappa Graph — κ(G)：具备“知识权重”与“证据追溯”的语义知识图谱

**调查对象**：GitHub 仓库 `aaronsb/knowledge-graph-system` (Kappa Graph)

**一句话结论**：Kappa Graph 是一个强调“认识论可靠性”的语义知识图谱系统，它通过计算 Grounding Scores（落地得分）来衡量知识的稳固程度，支持矛盾检测与全链路证据追溯，是 RAG 和 AI Agent 长期记忆的强有力补充。

## A. 简报

### 1) 什么是 Kappa Graph？
- **核心定义**：一个语义知识图谱，能从文档中提取概念，衡量支持力度，保留分歧，并追踪到源。
- **命名含义**：
  - **κ(G)**：图论中的顶点连通度，衡量结构的稳健性。
  - **kg**：质量单位，寓意“知识在这里是有重量的”。

### 2) 核心能力
- **自动提取**：从 PDF、Markdown、文本甚至图像中提取概念与关系。
- **语义搜索**：基于含义而非关键词进行检索（如搜“经济下行”能找到“衰退”）。
- **Grounding Scores**：为每个概念计算权重（-1 到 +1），区分“广受支持”与“存疑”的断言。
- **矛盾保留**：当源数据冲突时，系统保留双方观点而非强行合并。
- **多模态支持**：处理图像并提取空间拓扑关系（如“在...对面”），无需坐标。

### 3) 独特技术栈
- **后端**：FastAPI + PostgreSQL + Apache AGE (图数据库)。
- **加速**：`graph_accel` (Rust 编写的 PostgreSQL 扩展)，实现内存级 BFS/最短路径遍历。
- **存储**：Garage (S3 兼容存储) 用于文档资产。
- **交互**：React + D3 可视化，TypeScript CLI，MCP Server (对接 AI 助手)，甚至支持 FUSE 文件系统挂载。

### 4) 为什么值得关注？
Kappa Graph 解决了主流语义存储（如 Vector DB、传统 Knowledge Graph）的一个痛点：**它们能告诉你什么匹配，但不能告诉你匹配的内容有多可靠、谁反对它、证据在哪。** 它为图谱增加了一个“认识论层”。

## B. 核心架构与原理

### 1) 认识论层 (Epistemic Layer)
- **落地得分 (Grounding Scores)**：基于证据的支持与反驳数量计算。
- **语义多样性 (Semantic Diversity)**：通过 claim 跨领域的程度来识别“真实信号”与“回声室效应”。

### 2) 架构图 (ASCII)
```text
Documents ──→ [FastAPI] ──→ LLM Extraction ──→ [PostgreSQL + AGE]
                  │                                    │
              [Garage S3]                        [graph_accel]
               doc storage                     in-memory traversal
```

## C. 对标分析

| 特性 | kg (Kappa Graph) | GraphRAG | Vector DBs |
|---|---|---|---|
| **矛盾检测** | 原生 (数学计算) | 依赖 LLM 总结 | 无 |
| **落地评分** | 连续值 (-1 到 +1) | 仅来源引用 | 仅相似度 |
| **文件系统** | 支持 (FUSE) | 不支持 | 不支持 |
| **本地运行** | 支持 (Ollama) | 极难/依赖云 | 支持 |

## D. 最终判断
Kappa Graph 是目前开源界少数几个将**图论健壮性**与**语义可靠性**深度结合的项目。它不仅是一个数据库，更是一套处理“不确定信息”的认识论工具，非常适合科研综述、合规审计、以及对可靠性要求极高的 AI Agent 记忆层。
