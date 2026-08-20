# Q-style 插件/工具合集卡模式

> 来源：2026-07-24 Pi 插件精选卡（`20260724-pi-plugins精选`）会话记录。

## 适用场景

工具/插件集合类信息卡，特征是：

- 多个条目（插件、工具、扩展包），每个有独立安装命令
- 批量展示，需要让读者快速复制安装指令
- 通常从 X 帖文或工具推荐帖抓取，带版本号和周下载量

**区分**：
- GitHub 仓库主页型 Q-style 卡（`references/github-repo-q-style-card-note.md`）→ **单仓深度分析**，每仓占满一张卡
- 本模式 → **多工具横向合集**，每个工具只占一张卡宽度

## 标准骨架

```text
.hero                    # kicker + h1 + subtitle + badges + 4-stat grid
.section (×N)            # 每个 section = 一类工具
  .section-head
    .section-no          # 01 02 03 …
    .section-title       # h2 + 描述
  .plugin-grid           # 该类下的插件卡片列
    .plugin-card         # 每个插件一张卡
```

## Plugin Card 组件结构

```html
<article class="plugin-card" style="--accent: var(--green);">
  <div class="plugin-inner">
    <div class="plugin-header">
      <span class="plugin-name">插件名</span>
      <span class="plugin-version">v0.1.0</span>
    </div>
    <p class="plugin-desc">一段话描述核心能力。</p>
    <div class="plugin-tags">
      <span class="tag" data-accent="green">标签A</span>
      <span class="tag" data-accent="blue">标签B</span>
    </div>
    <div class="install-block">
      <code class="install-cmd">npm install 包名</code>
      <button class="copy-btn" data-cmd="npm install 包名">复制</button>
    </div>
  </div>
</article>
```

## 关键 CSS

```css
.plugin-card {
  border: 2px solid var(--line);
  border-radius: 18px;
  background: #fff;
  box-shadow: 4px 4px 0 rgba(29,27,22,.08);
  overflow: hidden;
}
/* 顶部彩色强调条 */
.plugin-card::before {
  content: "";
  display: block;
  height: 7px;
  background: var(--accent, var(--blue));
  border-bottom: 3px solid var(--line);
}
.plugin-inner    { padding: 13px 14px 12px; }
.plugin-name     { font-size: 14px; font-weight: 800; }
.plugin-version  { font-size: 10.5px; background: #f0ede8; border: 1.5px solid var(--line); border-radius: 999px; padding: 2px 8px; }
.plugin-desc     { font-size: 12.5px; line-height: 1.6; margin-bottom: 10px; }
.plugin-tags     { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 11px; }
.tag             { border: 1.5px solid var(--line); border-radius: 999px; padding: 2px 9px; font-size: 10.5px; font-weight: 600; }

/* 安装命令块：深色终端风格 */
.install-block {
  background: #1d1b16;
  border: 2px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.install-cmd {
  font-family: "SF Mono","Fira Code","Consolas",monospace;
  font-size: 11.5px;
  color: #a8e6a3;           /* 终端绿色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.copy-btn {
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  background: #2d2d2d;
  color: #c8c8c8;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .15s, color .15s;
}
.copy-btn:hover   { background: #4a4a4a; color: #fff; }
.copy-btn.copied  { background: var(--green); color: var(--ink); border-color: var(--green); }
```

## 复制按钮 JS

```js
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    navigator.clipboard.writeText(cmd).then(() => {
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '复制';
        btn.classList.remove('copied');
      }, 1800);
    });
  });
});
```

## 移动端行为（390px）

- `body` max-width: 420px，外边距 `20px 16px`
- hero-stats 4 列在 400px 退化为 2 列（`@media (max-width: 400px)`）
- `.install-cmd` 用 `text-overflow: ellipsis` 截断长命令，不换行
- `.plugin-header` 用 flex + gap，`version` badge `flex-shrink: 0` 防挤压

## YAML meta 要点

```yaml
category: toolkit
style: q
tags: [工具名关键词, multi-agent, context-engineering, ...]
desc: 80–210 字符，概括合集价值主张
```

## 来源块写法

```html
<div class="source-row">
  <div class="source-label">📌 来源</div>
  <div class="source-url">@handle · X 帖文 · YYYY-MM-DD · N ❤️ / N RT / N views</div>
</div>
```

```css
.source-row {
  margin-top: 28px; padding: 12px 14px;
  border: 2px solid var(--line); border-radius: 16px;
  background: #fff; box-shadow: 4px 4px 0 rgba(29,27,22,.08);
}
.source-label { font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; }
.source-url   { font-size: 12px; color: #3a6bcc; word-break: break-all; line-height: 1.5; }
```
