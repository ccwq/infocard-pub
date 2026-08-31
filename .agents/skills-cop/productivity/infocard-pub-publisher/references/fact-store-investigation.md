# fact_store 三路径写入机制 — 情报调查备忘

**调查人**：希尔（Hill）
**调查时间**：2026-06-05
**调查目标**：核实 fact_store 文档描述"所有操作都是用户手动操作"，安装意义存疑

---

## 核心发现

文档（fact-store.html）只描述了手动工具层（9 个 actions），**完全没提另外两条自动路径**：

---

## 路径 1：手动调用 fact_store 工具

- 9 个 actions：`add / search / probe / related / reason / contradict / update / remove / list`
- 用户主动调用，是显式写入路径

## 路径 2：on_memory_write 自动镜像桥（**默认开启**）

**源码位置**：`agent_runtime_helpers.py:1577-1584`

```python
# Bridge: notify external memory provider of built-in memory writes
if agent._memory_manager and function_args.get("action") in {"add", "replace"}:
    agent._memory_manager.on_memory_write(
        function_args.get("action", ""),
        target,
        function_args.get("content", ""),
        metadata=agent._build_memory_write_metadata(...)
    )
```

**触发条件**：内置 memory 工具（`memory(action=add/replace, target=user)`）被调用时自动同步写入 fact_store。

**写入规则**：
- `target=user` → `category=user_pref`
- 其他 → `category=general`

**结论**：你用内置 memory 说"记住我偏好 uv" → 自动镜像进 fact_store，无需额外操作。

## 路径 3：auto_extract 可选自动抽取

**配置项**：`auto_extract: false`（默认关闭）

**触发时机**：`on_session_end(messages)` 会话结束

**抽取逻辑**（`holographic/__init__.py:359-394`）：

```python
_PREF_PATTERNS = [
    re.compile(r'\bI\s+(?:prefer|like|love|use|want|need)\s+(.+)', re.IGNORECASE),
    re.compile(r'\bmy\s+(?:favorite|preferred|default)\s+\w+\s+is\s+(.+)', re.IGNORECASE),
    re.compile(r'\bI\s+(?:always|never|usually)\s+(.+)', re.IGNORECASE),
]
_DECISION_PATTERNS = [
    re.compile(r'\bwe\s+(?:decided|agreed|chose)\s+(?:to\s+)?(.+)', re.IGNORECASE),
    re.compile(r'\bthe\s+project\s+(?:uses|needs|requires)\s+(.+)', re.IGNORECASE),
]
```

- "I prefer..." → `category=user_pref`
- "we decided..." → `category=project`

**默认关闭原因**：保守策略，避免低质量抽取污染知识库。开启后建议每季度 review。

---

## 接入配置（config.yaml）

```yaml
memory:
  provider: holographic

plugins:
  hermes-memory-store:
    db_path: $HERMES_HOME/memory_store.db
    auto_extract: false          # 默认关闭
    default_trust: 0.5
    min_trust_threshold: 0.3
    hrr_dim: 1024
```

**验证命令**：`hermes memory status`（输出 `holographic: active`）

---

## 情报结论

| 维度 | 内置 memory | Holographic |
|---|---|---|
| 写入方式 | 手动（需你调用） | 手动 + 自动镜像 + auto_extract |
| 生命周期 | 当前会话 | 跨会话 SQLite |
| 检索能力 | 靠上下文注入 | FTS5 + 实体召回 + 组合推理 |
| 冲突管理 | 无 | contradict + fact_feedback |

**安装意义**：三条价值 — **自动同步** + **跨会话持久化** + **结构化检索**。

文档信息卡只讲了手动工具层，漏掉了自动桥和 auto_extract，这是文档不完整，不是功能全貌。

---

## 应用：fact_store v2.0 信息卡重构

本次重构（20260605-fact-store-v2.html）基于本调查：
- 新增顶部"三条写入路径"概览（三栏：手动/自动镜像/auto_extract）
- 新增自动镜像机制说明（含源码位置）
- 新增 auto_extract 机制说明（含正则模式）
- 新增路径标签（auto/manual/opt 区分默认状态）
- 更新速览表（三路径单独列行）

信息卡已发布：https://ccwq.github.io/infocard-pub/docs/20260605-fact-store-v2.html