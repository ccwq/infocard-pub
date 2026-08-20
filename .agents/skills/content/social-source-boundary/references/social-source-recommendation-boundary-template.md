# Social-source recommendation boundary template

## Suggested card taxonomy

1. **推荐触发源**
   - 原帖作者/时间/摘要（注明是否由原页核验）
   - 原帖实际给出的推荐入口
   - 互动数据仅作动态上下文

2. **视觉证据**
   - 配图可见文字与 OCR 摘要
   - 标注“图像提取 / OCR 对齐”
   - 不把图片归属、制作人或授权关系写死

3. **教程内容层**
   - 教程仓库/站点、章节、双版本、阅读入口
   - 公开范围与许可证差异

4. **官方上游层**
   - 官方包结构、运行模式、能力缺失项
   - 权限与沙箱边界

## Safe sentence patterns

- “原帖给出的入口是 `<entry-url>`；原帖未直接点名 `<repo>`。”
- “配图章节与 `<repo>` 教程目录高度一致 / 交叉匹配。”
- “这说明内容体系相符，不等同于作者、仓库或授权关系已被确认。”
- “教程主体为阅读型材料，部分配套课程代码未公开。”
- “教程基于并引用官方项目，但属于第三方学习/解读内容。”
- “官方项目默认权限边界依赖运行环境；更强隔离需要外部容器或沙箱。”

## Minimal forbidden-conflation scan

Check the authored HTML/meta for these classes of errors:

- Entry URL rewritten as a repository URL.
- “直接点名” when only content matching exists.
- Tutorial Python comparison described as official Python implementation.
- Unpublished course code described as fully public.
- Tutorial positioning (“生产级”“可上线”) rewritten as official safety or deployment guarantee.
- Social-post author equated with tutorial repository author without explicit evidence.
- Relative image path used from `docs/`, risking GitHub Pages 404.
