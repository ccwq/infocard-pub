# read_file 行号前缀陷阱与 HTML 文件编辑规范

> 来源：free-claude-guides 卡修复会话（2026-06-01）
> 适用于：`infocard-pub` 仓库 HTML 文件的原地编辑

## 陷阱描述

`read_file()` 返回的内容带 `行号|内容` 格式的前缀，例如：

```
    1|<!DOCTYPE html>
    2|<html lang="zh-CN">
    3|<head>
```

如果直接把 `read_file` 的返回值传给 `write_file` 做写入，**行号前缀会变成文件的实际内容**，导致 HTML 文件带上 `1|<!DOCTYPE` 这样的脏数据。

## 触发条件

在 `execute_code` 中执行以下模式时会触发：

```python
from hermes_tools import read_file, write_file

text = read_file(path)['content']   # 带了 "N|..." 前缀
# ... 做字符串替换 ...
write_file(path, text)                  # 行号前缀被写进文件
```

## 修复方案（按推荐顺序）

### 方案 A（推荐）：用 `patch` 工具做原地编辑

`patch` 直接在文件系统层面操作，不经过 `read_file` 的编号格式化：

```python
from hermes_tools import patch

patch(mode='replace', path='/path/to/file.html',
      old_string='<title>旧标题</title>',
      new_string='<title>新标题</title>')
```

`patch` 比 `read_file + write_file` 更安全，不会引入行号前缀污染。

### 方案 B：用 `terminal` + `cat` 读干净内容

```python
from hermes_tools import terminal

raw = terminal('cat /path/to/file.html')['output']
# raw 是干净的原始文件内容
```

### 方案 C：双次正则清除（不推荐，仅限紧急修复）

如果在 `execute_code` 中已经读了带前缀的内容，用正则清理后再写：

```python
import re

lines = []
for line in text.splitlines():
    line = re.sub(r'^\s*\d+\|', '', line)   # 清除一行前缀
    line = re.sub(r'^\s*\d+\|', '', line)   # 双次清除（防止二次污染）
    lines.append(line)
write_file(path, '\n'.join(lines))
```

⚠️ 方案 C 慎用：双次 `re.sub` 只是临时兜底，如果文件已经被写入一次带前缀的内容，再次 `read_file` 时那些前缀本身会变成行号，再次写入会再次污染。

## 根本原则

`execute_code` 适合处理数据、生成内容或做复杂计算，**不适合做 HTML 源码的读取-修改-写入循环**。

对于 HTML 源码编辑，始终优先：
1. **直接用 `patch`**（单次替换，不读文件）
2. **直接用 `write_file`** 写入完整新内容（不依赖读出的中间状态）
3. **用 `terminal('cat')`** 读取干净内容后再处理
