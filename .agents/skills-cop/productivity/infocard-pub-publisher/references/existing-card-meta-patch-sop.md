# Patch-before-patch rule & existing-card edit SOP（2026-06-27）

## 核心规则

**修改已有卡的任意字段前，必须先完整读取 `.meta.yaml` 再 patch。**

违反这条规则会导致 YAML 重复键（YAML 规范禁止 `key: value` 出现两次），lint 可能通过但 `_index.yaml` 解析行为不确定。

## 症状（2026-06-27 实录）

用户纠正翻译（"牛肉雷达" → "真材实料项目雷达"），直接对 `docs/20260627-backend-agent-resume-scout.html.meta.yaml` 执行 patch：

```yaml
# 错误做法：直接 patch 而不先读
date: '2026-06-27T13:42:03+08:00'
updated: '2026-06-27T16:30:00+08:00'   # 新增行
updated: '2026-06-27T13:42:03+08:00'   # 旧值残留 → 重复键
```

**根因**：文件里已经有一个 `updated:`，patch 的 `old_string` 没有包含它，导致新增一行而非替换。

## 正确 SOP

### 场景 A：只改单个字段

1. `read_file(meta.yaml)` — 完整读取
2. 检查该字段是否已存在
3. 若已存在：`patch(old=完整旧行, new=新行)`
4. 若不存在：`patch(old=相邻字段, new=相邻字段\n新字段行)`
5. 写完后：`read_file` 验证无重复键

### 场景 B：批量修改（多个字段）

1. `read_file(meta.yaml)` 完整读取
2. 一次 `patch` 操作包含所有需要改动的 `old_string → new_string`
3. 验证：`python3 -c "import yaml; yaml.safe_load(open(meta.yaml))"`

### 场景 C：修改后 add `updated` 字段

对于任何实质性内容修改（翻译纠正、描述更新、新增信息），必须同步添加 `updated`：

```yaml
date: '2026-06-27T13:42:03+08:00'
updated: '2026-06-27T16:30:00+08:00'   # 本次修改时间（东八区）
```

`updated` 用实际修改时间，`TZ=Asia/Shanghai date '+%Y-%m-%dT%H:%M:%S+08:00'` 获取，不得硬编码。

## 验证命令

```bash
# YAML 重复键检测
python3 -c "import yaml; yaml.safe_load(open('docs/<slug>.html.meta.yaml'))" && echo "PASS"

# 重复 updated 检测
grep -c "^updated:" docs/<slug>.html.meta.yaml   # 应输出 1
```

## GitHub repo 卡修改后的完整流程

```
1. read_file(meta.yaml)           ← 必须先读
2. patch 内容 + 添加 updated
3. python3 -c "import yaml..."  ← 验证无重复键
4. npm run build
5. git add _index.yaml index.html meta.yaml
6. git commit -m "fix: <简短说明>"
7. git push
```

## 参考：meta.yaml 字段修改场景速查

| 场景 | 操作 |
|------|------|
| 只改 `desc`/`title` | 先读再 patch，添加 `updated` |
| 添加缺失的 `updated` | 先读，确认无重复 `updated` 再 patch |
| `style` 修正 | 先读再 patch，添加 `updated` |
| 翻译纠正 | 先读再 patch，添加 `updated` |
| taxonomy 补全 | `npm run fix-taxonomy`，自动补全 |
| 批量补全多卡 taxonomy | `find docs -name '*.meta.yaml' -print0 \| xargs -0 git add` + 批量 commit |
