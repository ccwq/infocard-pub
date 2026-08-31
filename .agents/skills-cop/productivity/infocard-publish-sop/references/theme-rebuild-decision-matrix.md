# 主题重建决策矩阵

## 主题选择指南

| 内容类型 | 推荐主题 | 理由 |
|---|---|---|
| 工具/截图生成器 | color-material | 暖米纸 + 紫绿蓝，专业感强 |
| 技术手册/教学/架构 | hardblue | 红蓝双色顶栏，手册感 |
| AI/Agent 深色工作台 | darkblue | 渐变深蓝，技术氛围 |
| 知识库/内容管理 | darkgreen | 深绿监控台，安全感 |
| 设计/创意/瑞士编辑 | redswiss | 红黑瑞士风，视觉张力 |
| 通用/工具合集 | main | 红黑白主骨架 |

## 主题重建决策矩阵

| CSS vs meta 一致？ | facts.json 存在？ | 动作 |
|---|---|---|
| CSS 对，meta 错 | — | 只修 meta.yaml |
| CSS 错，meta 对 | 有 | 重建 HTML，按 theme/*.html 骨架 |
| CSS 错，meta 错 | 有 | 同时重建 HTML + 修 meta |
| CSS 错 | 无 | 重建 HTML + 从 GitHub API 重建 facts.json |

## CDN 缓存问题处理（用户看到旧样式时）

**错误示范**：
> "那是浏览器 CDN 缓存，Ctrl+Shift+R 刷新即可"

**正确做法**：
1. 立即 puppeteer 截图 → vision_analyze → 发送给用户看
2. 再说明情况

原因：用户说"我看到了"是事实反馈，不是要解释。工具可以验证的事情先验证再回答。

验证命令：
```bash
curl -s "https://ccwq.github.io/infocard-pub/docs/<slug>.html?$(date +%s)" | python3 -c "
import sys; h=sys.stdin.read()
for token in ['#6e3fd6','#d80018','#f7f2e8']:
    print(token, '✓' if token in h else '✗')
"
```
