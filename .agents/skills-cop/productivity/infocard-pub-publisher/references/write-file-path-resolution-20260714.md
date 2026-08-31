# write_file 路径解析与终端工作目录陷阱

## 核心问题

`write_file` 的路径解析与 `terminal` 的 `workdir` 参数**工作原理不同**：

| 环境 | 解析规则 |
|------|---------|
| `terminal` | `workdir=` 参数直接设置 cwd，相对路径以此为基础 |
| `write_file` | **始终以 session 工作目录（`/home/ccwq`）为基础**，不展开 `~`，不接受 `workdir` 参数 |

**结果**：把 `~/hehome/hermes-data/...` 传给 `write_file`，文件会写到 `/home/ccwq/hehome/hermes-data/...`，**而不是** `~/...`。因为 `~/` 恰好展开为 `/home/ccwq`，这个问题在某些路径模式下**巧合地没暴露**——但路径缺少父级前缀时会立刻写入错误位置。

**受影响的路径模式**：
- `hehome/hermes-data/...` → 写入到 `/home/ccwq/hehome/...`（相对路径从 session cwd `/home/ccwq` 开始）
- 正确写法：`/home/ccwq/hehome/hermes-data/...`（绝对路径）

## 实测案例（2026-07-14）

```
目标：/home/ccwq/hehome/hermes-data/home/wiki/raw/articles/2026-07-14-infocard-mattpocock-skills-v12.md
错误调用（少了一层 home）：
  write_file path="hehome/hermes-data/home/wiki/raw/articles/..." → 实际写到 /home/ccwq/hehome/hermes-data/home/...
ls 找不到：No such file or directory
```

## 识别方法

当文件 `write_file` 成功但 `ls` 找不到时：

```bash
find ~/hehome -name "2026-07-14-infocard-mattpocock-skills-v12.md" 2>/dev/null
```

## 解法

1. **始终使用绝对路径**：`/home/ccwq/hehome/hermes-data/...`
2. `write_file` 后立即 `ls` 验证文件存在
3. 不要把终端 `workdir` 概念类比到 `write_file`
