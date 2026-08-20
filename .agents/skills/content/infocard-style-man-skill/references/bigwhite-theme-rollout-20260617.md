# BigWhite 主题上线回顾（2026-06-17）

这次会话暴露了两个需要固化的点：

1. **新主题不只是写 `theme/*.html`**
   - 必须同步更新 `_themes.yaml`
   - 必须重建 `themes.html`
   - 必须确认公网 `themes.html` 真的出现新主题

2. **GitHub Pages 失败的直接原因是生成产物未同步**
   - Pages workflow 的 `Verify committed generated artifacts` 步骤会先跑 `npm run verify`
   - 失败报错：`_index.yaml is out of date; run npm run build and commit the result`
   - 根因：提交了新主题与 demo，但没有把 `npm run build` 产出的 `_index.yaml` 和 `index.html` 一起提交

## 修复链路

1. 运行 `npm run build`
2. 确认 `git status` 只剩生成产物变更
3. 重新 `npm run verify`
4. 提交 `_index.yaml` 与 `index.html`
5. push 到 `main`
6. 等待 Pages workflow 成功后，再复查公网 `themes.html`

## 验证结果

- 公网 `themes.html` 在重新 push + 生成产物补齐后出现了 `infocard-bigwhite-style`
- 这说明主题可见性问题本质上是“注册 + 构建产物 + Pages 同步”三者缺一不可
