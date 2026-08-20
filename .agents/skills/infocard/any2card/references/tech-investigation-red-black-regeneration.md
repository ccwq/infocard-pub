# 技术调查卡 red-black 重生笔记

## 触发条件
当用户明确指出以下任一问题时，不能只在现有 HTML 上修补颜色或局部样式，而应从当前 any2card 技术手册红黑路径重新生成：
- "时间不对"
- "风格没按 any2card"
- "像旧版模板"
- "太像报告页 / 紫色模板"

## 处理原则
1. 优先修正源文件：report.md、index.html、meta sidecar 的时间与内容。
2. 技术类调查卡默认使用 any2card 的技术手册红黑骨架：黑头部、红强调、编号分段、stats/warn/section/footer。
3. 发布前检查是否仍有 legacy purple/report-like 视觉痕迹；有则视为未通过。
4. 发布时间与元数据尽量使用 Asia/Shanghai/CST，并在报告页脚、meta 与 visible version 中保持一致。
5. 若卡片使用 `docs/<slug>/index.html` 目录形态，sidecar 必须是 `index.html.meta.yaml`，否则首页索引可能缺卡。

## 验收
- 手机首屏可读。
- 视觉上是红黑技术手册，不是旧式报告模板。
- 时间字段与发布时区一致。
- 线上详情页和首页索引都能命中。
