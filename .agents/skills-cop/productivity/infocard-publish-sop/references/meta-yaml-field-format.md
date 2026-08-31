# meta.yaml 字段规范

**slug**：纯 identifier，**不含日期前缀**。
- ✅ `fresh-terminal-editor`
- ❌ `20260711-fresh-terminal-editor`
- ❌ `20260711-slug`
历次踩坑（agent2 反复写成完整文件名）：fresh、tau、webify-mcp、psmux、fireworks 均触发 fix-meta-shape slug mismatch 警告。

**style**：必须存在且值与 HTML 模板一致，如 `redswiss`、`darkblue`、`hardblue`、`main-style`。

**date/updated**：禁止手写，由 `npm run build` 时工具链自动填充（新卡：date=updated；旧卡：保留 date、刷新 updated）。

**category**：无格式约束，但不得为空。**缺失则 build 硬失败**。

**tags**：无格式约束，但不得为空。**缺失则 build 硬失败**（错误：`missing fields category, tags`）。

**taxonomy**：当用户约束明确要求时（如 `taxonomy v2.0: tech_stack / topics / primary_content_type 必填`），所有命名字段为**阻塞性必填**。首次写卡即应写入，不得后补。

# 修复命令（主线程直接执行，不退回 agent2）
```bash
# slug 带前缀 → 裸 identifier
patch: `slug: 20260711-{slug}` → `slug: {slug}`

# style 缺失 → 补全
patch: 在 slug 行后加 `style: darkblue`（或 redswiss/hardblue 等实际使用的风格）

# category / tags 缺失 → build 硬失败，补全后重跑 build
patch: 在 meta.yaml 添加 category + tags 行

# taxonomy 缺失 → 用户要求了但没写，补全 taxonomy 后重跑 build
```

> **教训（2026-07-13）：** Academic Research Skills 首次写 meta.yaml 时遗漏所有 taxonomy 字段，build 通过但卡片语义不完整。此后 session 发现并补全。正确的做法是：当用户约束中明确列出 `taxonomy v2.0: tech_stack / topics / primary_content_type 必填` 时，在写卡的第一版 meta.yaml 中就写入全部 taxonomy 字段。
