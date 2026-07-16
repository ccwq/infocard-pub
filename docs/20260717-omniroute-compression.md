# OmniRoute Token 压缩用户设置指南

> **事实来源**：OmniRoute v3.8.49 官方仓库
> `docs/compression/COMPRESSION_GUIDE.md`、`COMPRESSION_ENGINES.md`、`RTK_COMPRESSION.md`、`docs/guides/FEATURES.md`
> **基线版本**：v3.8.49
> **仓库**：https://github.com/diegosouzapw/OmniRoute

---

## 一、定位与核心概念

OmniRoute 在请求到达上游提供商前执行主动式压缩，无需更改工作流。压缩节省比例取决于模式、内容类型和上游基准，非固定承诺。

**双层决策框架**：
1. **第一步**：识别会话类型（普通对话 / 代码工具输出 / 混合上下文 / 长会话 / 上下文紧张 / 调试审计）
2. **第二步**：在场景内匹配模式强度（Off → Lite → Standard → Aggressive → Ultra → RTK → Stacked）

**内部引擎（了解即可，不开放配置）**：
- **CCR**（Content-Compress-Retrieve）：大块重复文本用内容寻址引用替换，H4 级别实现
- **Headroom**（SmartCrusher）：同类 JSON 数组列式压缩为 `[N rows]` 格式，H3+N5 级别
- **Ionizer**：对大均匀块首/中/尾采样，中间部分作为 CCR 引用存储
- **Session Dedup**：跨会话轮次内容去重（TokenMizer 启发）
- **LLMLingua-2**：小 ONNX token 分类器语义剪枝，需 co-locate 可选依赖否则 fail-open

---

## 二、七种压缩模式

| 模式 | 引擎 | 原理 | 适用场景 | 节省量级 | 风险 | 操作入口 |
|------|------|------|----------|----------|------|----------|
| Off | 无 | 完全不动，原样传递 | 调试、审计、精确复现 | 0% | 无 | Dashboard → Context & Cache → 全局设置 |
| Lite | Caveman 辅助 | 空白/格式清理，零语义变更 | Always-On 安全模式 | ~15% | 低 | Dashboard → Context & Cache → Caveman |
| Standard | Caveman | 去除填充词、冗长措辞，保留代码/URL/JSON | 日常编码、对话、写作 | ~30% | 中低 | Dashboard → Context & Cache → Caveman |
| Aggressive | Caveman + 历史摘要 | 消息老化 + 工具结果摘要 + 上下文窗口感知 | 长会话、扩展调试、大型代码库 | ~50% | 中 | Dashboard → Context & Cache → Caveman |
| Ultra | Caveman + 剪枝辅助 | 启发式剪枝 + 代码块精简 + 二分截断找最优切点 | 反复触及上下文上限 | ~75% | 高 | Dashboard → Context & Cache → Caveman |
| RTK | RTK | 命令感知过滤：识别 git/build/test/shell 输出，去除 ANSI/进度条/重复行 | Agent 会话含大量终端/工具日志 | 60–90% | 中 | Dashboard → Context & Cache → RTK |
| Stacked | RTK → Caveman | RTK 先压工具输出（60–90%），Caveman 再压剩余自然语言（~30%） | 工具日志 + 人类指令混合，最大节省 | 78–95% | 高 | Combo 配置 + Compression Combos |

---

## 三、场景决策

### 场景 1：普通对话（Q&A / 写作 / 头脑风暴）
- **默认**：Standard（Caveman）
- **激进**：Aggressive
- 入口：`Dashboard → Context & Cache → Caveman → 模式选 Standard`
- 注意：de/fr/ja 语言包只有 context+filler+structural，无 dedup/ultra，ultra 等同 full

### 场景 2：代码工具输出（git / build / test / shell）
- **默认**：RTK
- **激进**：Stacked（RTK→Caveman）
- 入口：`Dashboard → Context & Cache → RTK`
- RTK 默认流水线：stripAnsi → filterStderr → replace → matchOutput → drop/include → truncate
- 保留：错误类型、失败信息、摘要行、变更文件、尾部上下文

### 场景 3：混合上下文（对话 + 工具输出交叉）
- **默认**：Stacked（RTK→Caveman）
- 在 Combo 的 `compressionOverride` 中设置 `modePack: "stacked"`
- 公式：`1-(1-RTK节省)×(1-Caveman节省)`，范围 78–95%

### 场景 4：长会话（多轮对话 / 项目回顾）
- **默认**：Aggressive
- **激进**：Ultra
- Progressive Aging：最近 3 轮完整 → 4–8 轮轻压 → 9–20 轮 Caveman → 21+ 轮重度摘要或丢弃

### 场景 5：上下文紧张（触及上下文上限）
- **默认**：Ultra
- **最大**：Stacked
- Ultra 包含 Aggressive 全部功能 + 启发式剪枝 + 二分截断

### 场景 6：调试 / 审计（需保留原始输出）
- **默认**：Off
- **轻量**：Lite + Raw Output
- Raw Output：在 Combo config 中设 `rawOutput.enabled: true, maxBytes: 1048576`
- 恢复：`GET /api/context/rtk/raw-output/[id]`（需管理认证）
- 注意：默认关闭，每天 1000 请求约 50–500MB，建议仅调试时开启

---

## 四、RTK / Caveman 可操作参数

### RTK 引擎

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `intensity` | `"standard"` | minimal / standard / aggressive；aggressive 下仍保留错误和堆栈 |
| `enableGrouping` | `false` | 相似行分组压缩，默认关闭以避免误判 |
| `deduplicateThreshold` | `3` | ≥3 行相同连续行时折叠；范围 2–100 |
| `customFiltersEnabled` | `true` | 是否加载用户/项目自定义过滤器 |
| `trustProjectFilters` | `false` | 信任项目过滤器（需 SHA-256 trust.json 或环境变量） |
| `rawOutput.enabled` | `false` | 存储原始输出供恢复；调试专用 |
| `rawOutput.maxBytes` | `1048576` | 单次原始输出存储上限，默认 1MB |

**RTK 49 个内置过滤器**：覆盖 git / test / build / package / shell / docker / infra / generic 8 大类别。

### Caveman 引擎

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `mode` | `"standard"` | off / lite / standard / aggressive / ultra |
| `languagePack` | `"en"` | en/es/id/pt-BR 完整；de/fr/ja 部分 |
| `skipSystemPrompt` | `true` | 跳过系统提示词压缩 |
| `deterministicOnly` | `true` | 仅使用确定性规则（非 LLM 辅助） |
| `outputMode` | `"auto"` | caveman / auto；通过 Combo config 设置 |

---

## 五、全局设置、Combo Override 与预览

### 决策优先级
1. Combo Override → 使用 Combo 专属设置
2. Auto-Trigger 阈值 → 使用自动模式
3. 全局设置 → 使用默认模式
4. Off → 跳过压缩

### Combo Override 示例
```json
{
  "id": "coding-combo",
  "strategy": "priority",
  "compressionOverride": {
    "mode": "aggressive",
    "stackedPipelines": ["rtk", "caveman"],
    "preserveToolDefinitions": true
  }
}
```

### 关键 API 端点
| API 端点 | 方法 | 用途 |
|----------|------|------|
| `/api/settings/compression` | GET/PUT | 全局压缩设置 |
| `/api/compression/preview` | POST | 预览任意压缩模式 |
| `/api/compression/language-packs` | GET | 列出可用 Caveman 语言包 |
| `/api/context/rtk/config` | GET/PUT | RTK 默认设置 |
| `/api/context/rtk/filters` | GET | RTK 过滤器目录 |
| `/api/context/rtk/test` | POST | RTK 过滤器测试 |
| `/api/context/rtk/raw-output/[id]` | GET | 原始输出恢复（需管理认证） |
| `/api/context/combos` | CRUD | Compression Combo CRUD |
| `/api/context/combos/[id]/assignments` | CRUD | 路由 Combo 分配管理 |
| `/api/context/analytics` | GET | 压缩分析数据 |

---

## 六、官方节省比例与数字来源

> ⚠️ **重要**：以下数字均来自上游项目基准或 OmniRoute 组合计算，不承诺固定收益。实际节省取决于内容类型和模式配置。

| 数据项 | 来源 | 数字 | 性质 |
|--------|------|------|------|
| RTK 上游样本 | RTK 上游 README：30 分钟 Claude Code 会话 | ~118,000→~23,900 tokens，79.7%（约 80%） | 上游单一样本，非 OmniRoute 保证 |
| RTK 上游范围 | RTK 上游 README | 60–90% | 上游基准范围 |
| Caveman 输出节省 | Caveman 上游 benchmark | ~75% fewer output / 65% 平均 / 22–87% 范围 | 上游基准（OmniRoute 用输入侧 46%） |
| Caveman 输入节省 | Caveman 上游 benchmark（输入压缩工具） | ~46% | 上游基准，用于 Stacked 计算 |
| Stacked 节省 | OmniRoute 组合计算（RTK 80% × Caveman 46%） | 89.2% 平均；78.4–94.6% 范围 | 组合计算，非实测数据 |
| Lite 节省 | 官方文档 | ~15% | 官方参考值 |
| Standard 节省 | 官方文档 | ~30% | 官方参考值 |
| Aggressive 节省 | 官方文档 | ~50% | 官方参考值 |
| Ultra 节省 | 官方文档 | ~75% | 官方参考值 |

**Stacked 组合公式**：
```
combined = 1 - (1 - RTK savings) * (1 - Caveman input savings)
average  = 1 - (1 - 0.80) * (1 - 0.46) = 89.2%
range    = 1 - (1 - 0.60..0.90) * (1 - 0.46) = 78.4-94.6%
```

---

## 七、已知限制

1. **LLMLingua-2 依赖 co-locate**：需 `@atjsh/llmlingua-2` 共置到 `dist/node_modules`（`scripts/build/colocateOptionals.mjs`），否则 fail-open 返回原文
2. **de/fr/ja 语言包不完整**：缺少 `dedup.json` 和 `ultra.json`，ultra 强度等同于 full
3. **Stacked telemetry 盲区**：0% 节省的引擎步骤返回 `stats:null`，无法区分"运行了但无节省"和"跳过了"
4. **Raw Output 存储成本**：开启后每 1000 请求/天约 50–500MB，建议仅调试期间启用

---

## 八、官方链接

- **GitHub 仓库**：https://github.com/diegosouzapw/OmniRoute
- **压缩指南**：`docs/compression/COMPRESSION_GUIDE.md`
- **引擎参考**：`docs/compression/COMPRESSION_ENGINES.md`
- **RTK 详细配置**：`docs/compression/RTK_COMPRESSION.md`
- **功能总览**：`docs/guides/FEATURES.md`
