# 日期创建时预防规则

## 问题

每次新建 infocard，meta.yaml 的 `date` 和 HTML 里的可见日期都会出错——日期比实际发布早一天或几天。

## 根因（2026-06-15 实测确认）

当创建 meta.yaml 时，agent 基于文件名 slug `YYYYMMDD` 前缀猜日期，而不是查当前系统时间：

```
文件名 slug：20260614-image-layer
→ agent 猜：date: "2026-06-14"  ← 错误
→ 实际系统时间：2026-06-15      ← 正确
```

fix-meta-date.js 的安全策略（不覆盖已有 date）此时不会介入，因为它从 HTML 的 git commit 时间取值，而 HTML 和 meta.yaml 一起提交，commit 时间也是 2026-06-14，两个值碰巧相同，脚本认为"无需变更"。

结果：错误日期绕过所有检查，直达公网。

## 新增根因（2026-06-18 实测确认）

如果 `date` / `updated` 写成**未加引号的裸时间字符串**，YAML 解析器可能把它当成 timestamp 对象，而不是普通字符串；随后 build 过程会按时间对象再做一次格式化，导致首页时间偏移甚至出现“未来时间”。

例子：
- `date: 2026-06-18 13:15:15`  ← 风险写法
- `date: "2026-06-18 13:15:15"` ← 安全写法


## 预防规则（强制）

### 创建 meta.yaml 时
- 禁止用文件名 slug 推算日期
- 必须用 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"` 查实际系统时间
- date 和 updated 均用该时间
- 格式：`date: "2026-06-15 08:41:20"`（带引号，含时分秒）

### 创建 HTML 时
- HTML visible date 必须和 meta.yaml 一致
- 页脚、数据来源行、status-bar 均同步

### fix-meta-date.js 的正确用法
- 创建新卡后，运行 `node scripts/fix-meta-date.js --write --date-source first --sync-updated --force`
- `--force` 强制覆盖，不依赖 git commit 时间兜底
- 如果仍然跳过，说明 HTML 还没 commit，先 commit 再跑脚本

### 验证命令
```bash
TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"
# 输出即为当前上海时间，写入 meta.yaml
```

## 快速模板

创建新 meta.yaml 时，直接用以下模板替换 date 行：

```yaml
# 模板：创建时替换为实际时间
date: "TZ=Asia/Shanghai date 输出值"
updated: "同上"
```

执行顺序：
1. `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"` 查时间
2. 填入 meta.yaml 的 date 和 updated
3. 同步 HTML visible date
4. commit
5. `fix-meta-date.js --write --date-source first --sync-updated --force`

## 2026-06-15 实例

- 错误：`date: "2026-06-14"`（基于 slug 猜）
- 正确：`date: "2026-06-15 08:41:20"`（系统时间）

