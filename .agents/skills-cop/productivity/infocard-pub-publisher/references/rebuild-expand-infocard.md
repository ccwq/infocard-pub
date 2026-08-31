# 重建扩格 + 主智能体并行工作流

## 何时触发

- 用户说"重建"、"rebuild"、或"补充信息卡"
- 当前卡内容太少（如 8 格但实际可以到 12 格）
- 子智能体发布同时，主智能体也参与另一个卡的工作

## 模式一：主智能体重建扩格（自己写，子智能体处理别的）

当用户说"重建"时，主智能体可以直接做，不一定派子智能体：
1. 调研补充：拉 README + 搜索补充技术细节
2. 扩格：8格→12格，补充遗漏的核心模块
3. 更新 meta.yaml 的 `date` 为当前时间戳
4. `npm run build && npm run verify`
5. `git commit && git push`
6. 验证 HTTP 200
7. **wiki 同步**：更新已有 raw 文件（in-place），不是创建新文件
8. 检查子智能体任务是否已完成（如果有并行任务）

### Wiki 重建卡同步

```bash
# 查找已有 wiki raw 文件
grep -l "<slug>" ~/hehome/hermes-data/home/wiki/raw/articles/*.md

# 重建卡同步：更新已有 raw 文件内容，不创建新的
# 在原文件末尾追加版本记录，或更新核心事实表
```

## 模式二：子智能体超时后主智能体接手

```bash
# 检查文件是否已写
ls ~/infocard-pub/docs/<slug>.html 2>/dev/null && echo EXISTS

# 若存在
git add docs/<slug>.html docs/<slug>.html.meta.yaml
git log --oneline -1  # 确认是否已有 commit
# 有 commit → 检查是否已 push
# 无 commit → build → commit → push → 验收
```

## 模式三：多任务并行 dispatch

用户同时发多个任务时，可并行：
```
子智能体A：调研发布 Schedule-X
子智能体B：调研发布 shadcn/improve
主智能体：重建 Memvid（同时进行）
```

收到所有结果后统一验收。检查逻辑：
```bash
# 每个 slug 检查
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html | head -1
git log --oneline | grep <slug>  # 确认 commit
```

## 重建扩格内容检查清单

| 检查项 | 说明 |
|--------|------|
| 格数 | 目标 12 格，不够则扩充 |
| 技术细节 | README / 搜索补充 API / feature flags / 版本号 |
| 对比表 | 有竞品对比则加维度对比格 |
| 代码示例 | 核心 API 调用示例 |
| 性能数据 | 基准测试 / 延迟 / 吞吐量数据 |
| 授权协议 | MIT / Apache / GPL 等 |
| wiki 同步 | 更新已有 raw 文件，追加版本记录 |

## 已知坑

- **时间戳**：重建时必须更新 date 为当前时间（`TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"`），不能用原卡日期
- **Wiki in-place**：重建卡已有 wiki raw 文件时，追加版本记录而非覆盖核心事实
- **格数估算**：调研后如果发现可扩充内容多，直接写 12 格；内容少则保持 8 格但确保每格信息密度够高
- **⚠️ 样式重建必须从零写 HTML，不能打补丁**：打补丁导致 HTML 结构损坏级联——`patch` 替换导致 div 未闭合，闭合标签跑到错误位置，后续 patch 在错误上下文中继续破坏，再修要更多 patch，最终比从零写还慢。正确做法：读取 `theme/<name>.html` 完整 CSS 骨架，从零写完整 HTML 保存到目标路径（保留原文数据和关键词），再 build。实测案例：`20260708-harness-self-improv.html` 首次 patch 失败后，从零写完整个文件，1 次完成。
