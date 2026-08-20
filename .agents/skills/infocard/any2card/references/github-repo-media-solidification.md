# GitHub 仓库媒体本地化与验证

用于 GitHub repo 技术卡/技术分享卡：README 中的 GIF、MP4、PNG、SVG、GitHub user-attachments 资源，尽量先本地化，再发布到公开信息卡。

## 适用场景
- README 里有 hero 图、动图、演示录屏
- 仓库使用 `github.com/user-attachments/assets/...` 或 `github-production-user-asset...` 之类的媒体链接
- 页面需要引用仓库媒体作为第一屏证据或代表图

## 经验规则
1. 先用 README / 官方页面确定内容定位，再决定是否保留代表图。
2. 对 GitHub 资产链接，`HEAD` 可能返回 403 或签名跳转；不要把 `HEAD 失败` 当成资源不可用。
3. 优先用 `GET` 跟随重定向下载真实媒体，再保存到 `docs/assets/images/`。
4. 发布页面引用本地相对路径，不热链 GitHub 资产 URL。
5. 如果媒体是动图/视频，确保本地文件格式与原始用途一致，并在卡内注明它是示意图或演示图。

## 验证建议
- 用 `curl -I` 检查响应头只是辅助；最终以 `GET` 下载成功为准。
- 浏览器侧确认图片 `src` 指向仓库内相对路径。
- 在公开 Pages 上再次确认图片可见且无 404。

## 常见坑
- 只看到 `HEAD 403` 就放弃，导致漏掉可用的媒体资源。
- 直接把 GitHub user-attachments 热链到公开卡，后续失效或跳转失败。
- 只检查详情页 200，不确认图片本身已经成功加载。
- 仓库动图可用，但公开卡未本地化，造成发布后证据缺失。
