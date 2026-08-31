# TradingAgents 开源技术卡扩写与移动端按钮修复案例（2026-06-03）

## 触发场景
用户指出已发布 X 技术卡“内容太空洞，需要按开源技术信息卡规范补全”。原卡只整合了 X 帖与配图，缺少仓库事实、运行入口、工程边界和适用场景。

## 内容补全模式
1. **先分层事实**：
   - X 帖主张：原帖说“10 个好到不该免费的 GitHub 仓库”，但公开抓取正文只展开第 1 个 TradingAgents。
   - 仓库事实：README、pyproject、代码树、关键模块与运行入口。
   - 配图证据：X 附图可描述系统形态，但不能把相邻系统截图合并成主仓库事实。
2. **GitHub API 403 回退链**：公开 GitHub HTML stars → raw README → shallow clone → 本地统计代码树。
3. **开源技术卡应补齐**：一句话结论、主张 vs 仓库事实、系统流、关键能力矩阵、安装/CLI/Python API、依赖和目录结构、适用/不适用、风险边界、核心来源。
4. **不要臆造缺失清单**：如果 X 帖号称 N 个仓库但公开正文只展开 1 个，卡片要显式写“未确认项”，不要补造剩余仓库。

## 移动端修复模式
- 390px 下，2×2 stats 仍可能被视觉判定为“桌面缩小稿”；对密集技术卡可改成单列 label-value stats。
- 底部 fixed PNG FAB 若遮挡首屏正文/标签，可改为**移动端右上角 icon-only fixed 按钮**，同时给 kicker/hero 右侧留白（如 `padding-right:56px`），避免压住标题。
- 按钮仍应保留 PNG 导出逻辑（html2canvas + `a.download`），不可退化成 print。

## 验收
- 本地 `scripts/rebuild_index.py && scripts/verify_index.py`。
- 390px 截图/DOM：无横向溢出、最小字号达标、表格/矩阵移动端堆叠、PNG 按钮不遮挡正文。
- 推送后验证 detail page 200，public `_index.yaml` 以 UTF-8 decode 后包含 slug/title/updated，首页 DOM 显示新标题与摘要。
