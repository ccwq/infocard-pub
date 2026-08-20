# 本地化资产路径：`docs/*.html` 的相对引用规则

本记录来自一次真实修复：信息卡页面位于 `docs/<slug>.html`，但嵌入图片时把路径写成了 `../assets/...`，导致浏览器显示 broken image。最终正确做法是：

- **如果 HTML 在 `docs/<slug>.html`**，且资产放在仓库内 `docs/assets/...`，HTML 中应写：`assets/...`
- **不要**默认写 `../assets/...`；这会指向仓库根目录外层，常见于误把页面当成深层子目录
- **先确认文件真实位置**：`docs/assets/...`、`assets/...`、`docs/<slug>/assets/...` 三者的相对路径不同，不能凭感觉拼
- **验收时优先看 broken image icon / alt text**，再回头核对实际文件扩展名（`.png/.jpg/.svg`）和路径
- 若图像是用户提供的 evidence image，最好把资产放在 `docs/assets/images/<slug>/`，并在 HTML 中用 `assets/images/<slug>/...` 引用

这个规则适合所有 `infocard-pub` 发布卡，尤其是“用户附加配图 / 封面图 / 证据图”场景。