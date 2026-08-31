# 2026-08-12 Qwen-MM-Plugins 信息卡发布 · 证据验证实录

## 会话背景

发布 Qwen-MM-Plugins 信息卡（hardblue，费用详解重点）。发布过程本身顺利，但视觉验收环节暴露两类证据陷阱，均被交叉验证拦截。

## 陷阱 1：agent-browser screenshot 截错 tab

**现象**：
- `agent-browser --json screenshot /tmp/qm-desktop.png` 返回 success，但内容是被误判为卡片的 **ChatGPT 404 登录页**（后续 vision 分析发现"Your session has expired"弹窗 + 404）
- 第二次截图截到了 **Trigger.dev Chat Agent 预览页**（`http://127.0.0.1:8891/docs/20260812-trigger-chat-agent.html`）
- 关键迷惑点：错误页截图与正确卡片截图**字节数完全相同（281167 bytes）**——之前同一 session 截的 qm-mobile.png 也是 104794 bytes 与 qm-mobile-pin.png 相同

**根因**：共享 CDP endpoint 上多个 tab 并存，`screenshot` 命令没有绑定到 `open` 返回的 targetId；agent-browser 会话指向了其他 tab（用户浏览器里正好开着 ChatGPT 登录页、本地 8891 预览服务）。

**修复**：
1. 用 `--pin-tab` 从第一个命令开始绑定 session
2. 每次截图前用 CDP `Runtime.evaluate` 在 pinned targetId 上验证 `location.href` + `document.title`
3. 目标 tab 定位用 `Target.getTargets`（按 URL 前缀匹配，不能只按 title——多个 tab 可能同名）

**验证命令**：
```bash
# 找目标 tab
browser_cdp(method='Target.getTargets')  # 匹配 type="page" 且 url 含 slug

# 验证 tab 身份
browser_cdp(method='Runtime.evaluate',
  params={'expression': 'JSON.stringify({url: location.href, title: document.title, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})'},
  target_id='<targetId>')
```

## 陷阱 2：视觉模型误报

**误报 1（critical）**：视觉模型报告 hero 面板 `ARCHITURE` 拼写错误（应为 ARCHITECTURE）。
**验证**：`grep -o "ARCHI[A-Z]*" docs/20260812-qwen-mm-plugins.html` → `ARCHITECTURE`（正确）。误报。

**误报 2（major）**：视觉模型报告"底部蓝色提示框右侧贴边、左右不对称"。
**验证**：`getBoundingClientRect()` 对比 `.quote` 与父容器：
```json
{"quote":{"left":25,"right":350,"width":325},
 "parent":{"left":11,"right":364,"width":353},
 "gapLeft":14,"gapRight":14,"pageW":375}
```
gapLeft=gapRight=14，完全对称。误报。

**结论**：视觉模型文本与布局判断必须对照 artifact 验证后才能作为 critical/major 证据；否则会把有效发布错误阻塞。

## 陷阱 3：Vision API 失败形态

- `503 chat_admission_busy`（多次）：基础设施繁忙，等待 20-30s 重试即可；最终成功
- `400 invalid_request_error`（`messages[0]: unknown variant image_url`）：**图像太大**，把 1440x900 桌面截图缩小到 1300px JPEG q82 后成功
- 整页移动截图 375×11457 必须缩小后才能分析

## 陷阱 4：build 超时 ≠ 失败

`npm run build` 600s 超时，但实际已完成：
- `grep -c "qwen-mm-plugins" _index.yaml` → 2（索引已含卡片）
- `ls -la docs/20260812-qwen-mm-plugins.html*` → 文件 mtime 已更新
验证后再继续，不必重跑 build。

## 陷阱 5：git push 凭据恢复

**事故**：工具输出把真实 token 脱敏显示（`ghp_Us....git`），期间误用占位符 `ghp_UsErReDaCtEd` 执行 `git remote set-url --push`，真实 pushurl 被覆盖 → push 报 `Invalid username or token`。

**恢复流程**：
```python
# 从 ~/.git-credentials 读取真实 token（不要 echo/打印）
import re, subprocess
lines = open('/home/ccwq/.git-credentials').read().strip().splitlines()
token = next(m.group(2) for l in lines
             if (m := re.match(r'https://([^:/]+):([^@]+)@github\.com', l))
             and m.group(1) == 'ccwq')
url = f'https://ccwq:{token}@github.com/ccwq/infocard-pub.git'
subprocess.run(['git', 'remote', 'set-url', 'origin', url], check=True)      # fetch
subprocess.run(['git', 'remote', 'set-url', '--push', 'origin', url], check=True)  # push
```

**关键**：必须同时设置 `origin`（fetch）和 `--push origin`（push）两个 URL——只设 push 会让 fetch 留在 SSH，报 `Permission denied (publickey)`。

**其他教训**：
- `git push origin HEAD:main` 在命名分支 worktree 上是正确推法（非 fast-forward 时先 `git fetch origin main && git rebase origin/main`）
- 远程有其他并行提交时（如 Trigger.dev、Semantica 卡），先 rebase 再 push，不要 force push

## 验收最终状态

- 卡片公网 HTTP 200 + `_index.yaml` 索引含 slug ✅
- 移动端 sw=cw=375 无横向溢出 ✅
- 桌面端 sw=cw=1425 无横向溢出 ✅
- leak 扫描 0 问题 ✅
- 视觉：0 critical / 0 major（两处报告均经验证为误报）
