# GitHub 仓库主页型 Q-style 卡：会话笔记

适用场景：把 GitHub 仓库主页 / README 做成 Q-style 信息卡，尤其是技术分析、产品基座、agent runtime、工具链 / 工作流仓库。

## 这次会话确认的稳定做法

1. **README 是主事实源**
   - 先从仓库主页抓 README 文本，而不是只看仓库名和 star 数。
   - GitHub API 超限时，直接用 `curl https://raw.githubusercontent.com/{owner}/{repo}/main/README.md`。
   - 先 try `main` 分支，再 try `master`。

2. **hero 图优先取仓库自己的 logo / 横幅**
   - 用 `browser_get_images()` 找 README 内的 hero/logo 图。
   - 优先选能代表仓库定位的横幅图，而不是 badges 或头像。
   - GitHub raw URL 可直接下载时，优先走直链：`curl -sL --max-time 60 -o "$DEST/filename" "https://raw.githubusercontent.com/{owner}/{repo}/main/{filename}"`。不需要 Referer 头（这是 GitHub CDN 行为，与 Wikimedia 不同）。
   - 只有当 curl 返回 404 或 < 5KB 的错误页时，才回退到浏览器 CDP 提取 URL 再下载。
   - 下载后把图片放到 `docs/assets/images/{slug}/` 下，HTML 用相对路径 `assets/images/{slug}/filename` 引用。

3. **Q-style 的标题写"结论"而不是"对象名"**
   - 不要把仓库名当标题。
   - 标题优先抽成一句判断：它解决什么、核心机制是什么、价值在哪里。

4. **章节结构适合技术/产品型仓库**
   - 推荐骨架：核心结构 → 安装/入口 → 能力栈 → 证据与判断 → 风险边界。
   - 如果 README 强调运行时、路由、平台支持或 benchmark，就把这些放入首屏统计和中段证据块。
   - 不需要用简化骨架；完整的 hero + section-head + section 结构可以直接承载技术分析内容。

5. **移动端验收必须做 390px 视口检查**
   - 用 `browser_cdp Emulation.setDeviceMetricsOverride` 设置 390×844。
   - 重点看：是否有横向溢出（`document.documentElement.scrollWidth === document.documentElement.clientWidth`）、表格是否还可读、保存按钮是否压正文。
   - 若按钮轻微贴边，可接受；若影响正文，先加底部安全留白，不要只改按钮位置。

6. **保存按钮保持统一样式**
   - 仍按 Q-style 约定使用右下角固定 PNG 导出按钮（`position: fixed; right: 18px; bottom: 18px`）。
   - 不要回退成底部整条 save bar。