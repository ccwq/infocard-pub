# Subagent 超时 Rescue：ISO 时间戳 + Duplicate Key 修复实录（2026-07-09）

## 场景

子智能体超时（600s），文件已写出但未 push，主线程接手完成发布。

两次典型失败：

### Case 1：OpenSpec（`openspec-ai-coding-framework`）

- **问题**：子智能体 patch 过程中误造 duplicate `updated` key + 丢失 `category`/`title`
- **表现**：`build` 报错 `missing fields category, title`
- **修复**：读取完整 meta.yaml → 补 `category` + `title` → rebuild 通过
- **教训**：subagent 的 old_string → new_string 替换若 old_string 含多个字段，patch 可能只替换中间部分，导致字段丢失；先读完整文件再 patch 更安全

### Case 2：Mammalia（`mammalia-evolution-tree`）

- **问题**：子智能体写入的时间戳是 ISO 格式 `2026-07-09T10:30:00+08:00`
- **表现**：`verify-meta-timestamps.js` gate 拒绝 → `npm run build` 报错
- **错误信息**：
  ```
  Error: Timestamp metadata gate failed:
    - docs/20260709-mammalia-evolution-tree.html.meta.yaml:
      invalid timestamp format "2026-07-09T10:30:00+08:00"
  ```
- **根因**：子智能体使用了 `new Date().toISOString()` 或类似生成方式
- **修复**：
  ```bash
  NOW=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
  # 替换 meta.yaml 中的 ISO 格式为纯格式
  ```
- **教训**：subagent prompt 里必须强调"用 `TZ=Asia/Shanghai date` 不用 `new Date()`"；当前 SKILL.md 规则已在但执行时被忽略

## 标准化接手流程

```bash
cd /home/ccwq/infocard-pub
git fetch && git status -sb

# Step 1: 检查文件存在
ls docs/ | grep <slug>

# Step 2: 读取完整 meta.yaml（不做假设）
cat docs/<slug>.meta.yaml

# Step 3: 诊断三类典型问题
#   A. ISO 时间戳 → 替换为 NOW=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
#   B. 缺字段 → 补上
#   C. duplicate key → 重写完整文件

# Step 4: 验证
node /home/ccwq/infocard-pub/scripts/verify-meta-timestamps.js

# Step 5: build
npm run build

# Step 6: CI 等待（第一次 404 就再等 40s）
sleep 65
curl -s -o /dev/null -w "%{http_code}" https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

## 防呆规则（2026-07-09 更新）

1. subagent prompt 里的时间戳指令改为：`TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"`（明确禁用 ISO 格式）
2. meta.yaml 涉及多字段 patch 时，先 `cat` 完整文件再 patch，避免字段被截断
3. duplicate key 出现后不要反复 patch，直接重写整个文件
