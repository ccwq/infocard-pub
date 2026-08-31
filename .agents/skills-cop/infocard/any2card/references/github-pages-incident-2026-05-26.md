# GitHub Pages 发布与故障排查（2026-05-26）

这份备忘录记录了 any2card / infocard-pub 在本机上的一次真实发布排障路径，供后续类似信息卡发布复用。

## 现场现象
- `raw.githubusercontent.com` 上 HTML 已更新
- `https://ccwq.github.io/infocard-pub/docs/<slug>.html` 返回 404
- GitHub Actions 的 Pages 部署在同一时段出现失败

## 关键确认
1. 先看 raw：
   - `curl -s https://raw.githubusercontent.com/<owner>/<repo>/main/docs/<slug>.html`
2. 再看 Pages：
   - `curl -I https://<user>.github.io/<repo>/docs/<slug>.html`
3. 再看 Actions：
   - `GET /repos/<owner>/<repo>/actions/runs`
4. 再看 GitHub Status：
   - 是否存在 Actions / Pages incident

## 这次的根因模式
- Pages run 不是代码错误，而是 GitHub Actions / Pages 基础设施侧异常
- 失败日志里可见：`Internal server error`
- 具体 annotation 里可见：`Failed to download archive ... configure-pages`、`An action could not be found at the URI ...`

## 发布时的实用原则
- raw 正确 ≠ Pages 已生效；必须两边都核对
- `docs/` 文件存在 ≠ 公开链接一定可访问；优先确认 Pages 部署状态
- 遇到 404 先别急着改 HTML，先确认是否是 GitHub 侧 incident
- 需要公开链接时，可以先把截图直接交付，再等 Pages 恢复后补公开 URL
