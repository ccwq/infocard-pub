# Trellis 重建案例：多网格 + SOP + 内容扩展

**日期**：2026-07-04
**触发**：用户说 `https://ccwq.github.io/infocard-pub/docs/20260612-trellis.html 重建信息卡 加入更多内容 尤其使用指南`

## 问题诊断

旧卡约 24KB，内容覆盖基础概念和简单 FAQ，但缺少：
- 完整五步使用 SOP
- 四大典型场景（冷启动 / 跨 Agent 迁移 / 团队共享 / 多轮迭代）
- 16 平台完整列表（从 10 扩展到 15）
- Spec 模板速查
- 团队协作指南
- 关键配置文件说明
- 扩展 FAQ（从 1 条到 6 条）

## 解决方案

### 1. 收集更多素材
```bash
# 抓取 README 和子章节
curl -sL "https://raw.githubusercontent.com/mindfold-ai/Trellis/main/README.md"
```

### 2. 重建 HTML（从零写，不 patch 旧卡）
- 删除旧内容，从头构建骨架
- 新增模块：
  - 五步 SOP（sop-steps 5列）
  - 四大典型场景（scenario-grid 4列）
  - 16 平台网格（platform-grid 5列）
  - Spec 模板速查（spec-grid 3列）
  - 团队协作指南（team-grid 3列）
  - 配置说明（config-row 3列）
  - 6 条 FAQ（faq-grid 2列）

### 3. 移动端响应式（必须与内容同步写）
```css
/* 960px 断点：部分网格收起 */
@media (max-width: 960px) {
  .hero,
  .content { grid-template-columns: 1fr; }
  .platform-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .scenario-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sop-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .spec-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .faq-grid,
  .team-grid,
  .config-row { grid-template-columns: 1fr 1fr; }
  .compare-body { display: none; }
}

/* 720px 断点：全部单列 */
@media (max-width: 720px) {
  .platform-grid,
  .scenario-grid,
  .sop-steps,
  .spec-grid,
  .faq-grid,
  .team-grid,
  .config-row { grid-template-columns: 1fr; }
}
```

### 4. 元数据时间戳
```bash
TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S"
# 输出：2026-07-04 05:23:57
```

### 5. 发布链路
```bash
# 写 HTML + meta.yaml
# build + verify
npm run build && npm run verify
# commit + push
git add docs/20260612-trellis.html docs/20260612-trellis.html.meta.yaml _index.yaml index.html
git commit -m "rebuild: Trellis infocard - full usage SOP, 16 platforms, team guide, FAQ expanded"
git push origin main
# 验收
for i in 1 2 3; do sleep 20; code=$(curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/20260612-trellis.html"); [ "$code" = "200" ] && break; done
# 移动端截图
playwright screenshot --viewport-size="390,844" --full-page "https://...html?cb=$(date +%s)" /tmp/trellis-390.png
```

## 结果

| 指标 | 旧卡 | 重建卡 |
|---|---|---|
| HTML 大小 | ~24KB | ~40KB（+67%） |
| FAQ 条目 | 1 条 | 6 条 |
| 平台列表 | ~10 个 | 15 个 |
| 新增模块 | — | SOP / 场景 / 团队协作 / 配置 |
| 移动端验收 | 未知 | PASS（无横向溢出） |

## 教训

- **重建 = 从零写结构 + CSS**，不接受旧卡换色
- **响应式必须与内容同步写**，不要写完内容再补 CSS
- **meta.yaml 的 updated 时间戳**用当前时间，不用旧卡时间
