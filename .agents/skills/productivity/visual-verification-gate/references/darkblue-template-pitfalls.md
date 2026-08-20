# darkblue / hardblue 模板视觉坑清单

本文档是 `visual-verification-gate` 的配套 references，记录模板自带 CSS 与中文/窄屏组合时的具体缺陷 + 修复方案。

## 缺陷 1：`.title` 行距与字距冲突

### 症状
- 中文标题 ≥ 18 字，或包含「」/？/：/——时，多行垂直重叠或字距过窄。
- 视觉读起来像是 `position: absolute` 错位。

### 根因
`theme/darkblue.html` / `theme/hardblue.html` 自带：
```css
.title { line-height: .92; letter-spacing: -.07em; font-size: clamp(40px, 7vw, 88px); }
```
对英文短标题（4-10 单词）视觉冲击力强，但对中文长标题是灾难。

### 修复
**完整覆盖模板默认**：
```css
.title {
  margin: 0;
  font-size: clamp(34px, 5.6vw, 76px);
  line-height: 1.22;
  letter-spacing: -.035em;
  font-weight: 950;
}
```

**移动端再加一层**：
```css
@media (max-width: 768px) {
  .title {
    font-size: clamp(28px, 8.4vw, 42px);
    line-height: 1.36;
    letter-spacing: -.01em;
  }
}
```

### 验证
```bash
grep -A 5 '^    .title{' docs/<slug>.html
# 必须只看到一行 line-height，不能既有 .92 又有 1.22（后定义胜出，会冲突）
```

## 缺陷 2：移动端网格不自动塌缩

### 症状
- 720px / 480px 移动端，`.grid-2` / `.grid-3` / `.matrix` / `.risk-grid` 仍保持 2/3 列。
- 文字挤压、超长单行。

### 根因
`darkblue.html` 自带的 `@media (max-width: 720px)` 只处理 `.hero / .feature-row / .visual-grid`。其他网格类在移动端不响应。

### 修复
**新增（不要改原 media query）**：
```css
@media (max-width: 768px) {
  .grid-2, .grid-3, .matrix, .risk-grid,
  .feature-row, .visual-grid {
    grid-template-columns: 1fr !important;
  }
  .section-head { grid-template-columns: 48px 1fr; }
  .section-no { width: 48px; height: 48px; font-size: 16px; border-radius: 12px; }
  .section-meta h2 { font-size: 18px; }
  p, li, .quote-line { overflow-wrap: anywhere; word-break: break-word; }
}
```

### 为什么必须 `!important`
如果同时用了 `repeat(auto-fit, minmax(220px, 1fr))`，媒体查询的 `1fr` 与其特异性相同但源代码顺序靠后，正常情况胜出。但**模板里 media query 通常在 `.grid-2` 定义之前**，导致特异性 + 源代码顺序都输，必须 `!important` 兜底。

## 缺陷 3：Python heredoc `str.replace` 静默失败

### 症状
- `python3 - <<'PY' txt = txt.replace(old, new); p.write_text(txt) PY` 看起来成功
- `cat` 文件，发现 `old` 还在 / `new` 没进去
- 没有任何错误

### 根因
heredoc 通过 bash 解析时，反斜杠 + `\\n` 在 Python 字符串字面量里可能被解释为换行，导致 `replace` 找不到匹配。也有可能 Python 把 `\\` 当字面 `\` 处理。

### 修复
**方案 A（推荐）**：用 `patch` 工具做精确替换，它会返回 diff。
**方案 B**：heredoc 后必须 grep 验证：
```bash
python3 - <<'PY'
from pathlib import Path
p = Path('docs/<slug>.html')
txt = p.read_text(encoding='utf-8')
txt = txt.replace('OLD_PATTERN', 'NEW_PATTERN')
p.write_text(txt, encoding='utf-8')
PY
grep -c 'NEW_PATTERN' docs/<slug>.html   # 必须 ≥ 1
```

## 缺陷 4：Chrome headless 串行超时

### 症状
- 第一次 `google-chrome --headless --screenshot=...` 成功
- 紧接着第二次同款命令超时（>30s）

### 根因
上一次 Chrome 进程僵尸未清理，端口/锁未释放。

### 修复
每次截图前：
```bash
pkill -9 chrome 2>/dev/null
sleep 2
google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --window-size=720,1600 --virtual-time-budget=8000 \
  --screenshot=/tmp/x.png "URL"
```

`virtual-time-budget=8000` 是关键，让 Chrome 在 8s 虚拟时间内完成渲染再截图，否则容易截到白屏。

## 缺陷 5：Worktree 清理被工具安全门拦截

### 症状
- `git worktree remove wt-xxx` 被命令安全门拒绝
- 提示需要用户确认

### 根因
即使授权了"发布和 push 自动"，`worktree remove` 被视为破坏性操作，仍需单独确认。

### 修复
发布完成后，**不要**在自动化流里直接 `worktree remove`。把它放在交付报告里，作为下一步 ask，让用户单独授权。
