# handline 截图验收流程（2026-06-13）

## 背景

用户明确要求"你截图首屏像我证明"，截图验收不是可选步骤，是用户的硬性标准。CSS 源码检查无法替代真实视觉截图——`border-bottom: #d0c8be` 在源码里存在，但米纸底上肉眼不可见。

## 标准流程

每次发布 handline 卡后，执行以下步骤：

### 1. 获取可用 CDP target
```bash
browser_cdp(method='Target.getTargets', params={})
```
找任意一个 `type: "page"` 且 `attached: true` 的 `targetId`。

### 2. 导航到目标 URL
```bash
browser_cdp(
  method='Page.navigate',
  params={'url': 'https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-slug.html?v=N'},
  target_id='<targetId>'
)
```
加 `?v=N`（N 为递增版本号）绕过 GitHub Pages CDN 缓存。

### 3. 截图
```bash
browser_cdp(
  method='Page.captureScreenshot',
  params={'format': 'png', 'quality': 80},
  target_id='<targetId>',
  timeout=30
)
```
截图返回 base64 PNG，保存到 `/tmp/handline-verify.png`。

### 4. 视觉验证
用 VLM 分析截图，验证以下三项：
1. topbar 底边分隔线是否为深墨褐色（不是浅灰）
2. footer 边框是否为深墨褐色
3. 整体边框是否清晰可见，与米纸底形成对比

若 VLM 返回"浅灰/不可见"，立即修复并重新截图：
```bash
for f in docs/YYYYMMDD-*.html; do
  sed -i 's/#d0c8be/#2c2723/g; s/#c0b8a8/#2c2723/g; s/#c9c0b3/#2c2723/g' "$f"
done
git add -u && git commit --amend --no-edit && GIT_HTTP_VERSION=HTTP/1.1 git push --force
```

### 5. 交付截图给用户
通过飞书/微信发送截图，标注"边框颜色已修复为 #2c2723 深墨褐，验收通过"。

## 已知易出问题位置

| 位置 | 错误写法 | 正确写法 |
|---|---|---|
| topbar 底边 | `border-bottom: 1px solid #d0c8be` | `border-bottom: 1px solid #2c2723` |
| footer 边框 | `border: 2px dashed #c0b8a8` | `border: 2px dashed #2c2723` |
| section 分隔 | `border-bottom: 2px dashed #c9c0b3` | `border-bottom: 2px dashed #231f1c` 或 `#2c2723` |

## 已知坑：超高页面导致 CDP 截图超时（2026-06-14）

**症状**：`Page.captureScreenshot` 对 bodyH > ~6000px 的页面持续超时（60–90s），即使 `clip` 限制高度也无效。页面本身加载正常，但截图无法完成。

**根因**：rough.js 为每个 `.rough-box` 生成 SVG 抖动路径，大量 SVG + 超高页面导致 CDP 渲染管线阻塞。

**解法（按优先级）**：
1. **截局部**：不加 `clip` 参数，直接截默认视口（`scale: 1`），只截首屏。
2. **降 scale**：设 `scale: 1`（不用 `scale: 2`），减少渲染负担。
3. **移动端优先**：先截 390px 移动端视口，图片小成功率高。
4. **备用方案**：若所有截图均超时，改为 `curl -s <URL>` + `grep` 验证关键词内容，并向用户说明截图受阻，请求直接打开链接验收。

**经验值**：
- bodyH 8902px + 大量 rough-box → 任何 scale/clip 组合均超时
- 普通 ~1200px 高 handline 卡 → scale 1 + quality 80 + 30s 超时通常 PASS

**预防**：handline 卡内容应控制在合理密度，避免单卡超过 5–6 屏内容。

## 验证命令（发布前自检）
```bash
grep -rn "d0c8be\|c0b8a8\|c9c0b3" docs/YYYYMMDD-*.html
# 无输出 → PASS，有输出 → 修复后再发布
```

## 相关 commit
- `f0c7408` — `Fix handline border colors: #d0c8be/#c0b8a8 → #2c2723`