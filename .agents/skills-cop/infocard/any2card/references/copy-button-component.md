# 复制按钮组件规范

> 当信息卡中包含可复用的提示词、代码片段、命令模板时，应为每个可复制项附加一键复制按钮。
> 此规范适用于 any2card 生成的所有知识型、工具型、提示词型信息卡。

## 何时使用

以下场景**必须**使用复制按钮：
- 提示词模板（AI 图像生成提示词、写作提示词等）
- 代码片段（CLI 命令、API 调用示例、代码模板）
- 配置示例（YAML、JSON、配置文件）
- 公式 / 咒语 / 关键词列表

以下场景**可选**：
- 长引用文本
- 资源链接（非命令类）

## 结构规范

### `.prompt-card` 组件

每个可复制项使用 `.prompt-card` 结构：

```html
<div class="prompt-card">
  <div class="prompt-head">
    <span class="prompt-name">模板一 · 自然人像随手拍</span>
    <button class="prompt-copy-btn"
            data-prompt="这里放完整英文提示词"
            onclick="copyPrompt(this)">📋 复制英文</button>
  </div>
  <div class="prompt-en">英文原文（用于复制）</div>
  <div class="prompt-cn">中文理解说明</div>
</div>
```

### CSS Token

```css
.prompt-card {
  border: 2px solid var(--border);
  border-radius: 10px;
  background: #fff;
  margin-bottom: 10px;
  overflow: hidden;
}
.prompt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  background: var(--ink); /* 深色背景 */
  color: #fff;
}
.prompt-name {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .04em;
}
.prompt-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1.5px solid rgba(255,255,255,.5);
  border-radius: 20px;
  background: transparent;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  flex-shrink: 0; /* 防止按钮被挤压 */
}
.prompt-copy-btn:hover {
  background: rgba(255,255,255,.15);
  border-color: #fff;
}
.prompt-copy-btn.copied {
  background: rgba(155,220,119,.3);
  border-color: #9bdc77;
  color: #fff;
}
.prompt-en {
  padding: 10px 12px 6px;
  font-family: SFMono-Regular, Consolas, Menlo, Monaco, monospace;
  font-size: 11.8px;
  line-height: 1.65;
  color: var(--ink);
  border-bottom: 1px dashed #ddd;
  word-break: break-word;
}
.prompt-cn {
  padding: 8px 12px 10px;
  font-size: 12.3px;
  line-height: 1.68;
  color: #444;
}
```

## JavaScript 规范

```javascript
function copyPrompt(btn) {
  const text = btn.getAttribute('data-prompt');
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '✅ 已复制';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '📋 复制英文';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(function() {
    btn.textContent = '❌ 失败';
    setTimeout(function() {
      btn.textContent = '📋 复制英文';
    }, 2000);
  });
}
```

## 设计原则

1. **`data-prompt` 属性**：复制内容只存在 `data-prompt` 属性中，`.prompt-en` 显示格式仅供参考，不参与复制逻辑。这样可以存储格式化前的干净原文。
2. **`flex-shrink: 0`**：防止按钮在窄屏被挤压变形。
3. **视觉反馈**：复制成功后 2 秒恢复原状，`.copied` 类切换绿色高亮。
4. **失败降级**：catch 块显示"失败"，不阻塞用户体验。
5. **移动端适配**：按钮在 390px 视口仍可点击，字体不小。

## 与其他主题的兼容

此组件兼容所有主题风格：
- 深色主题（黑头/红黑瑞士）：`.prompt-head` 用 `var(--ink)` → `#1d1b16` 或 `#0a0a0a`
- 浅色主题（Q版纸感）：`.prompt-head` 用 `var(--ink)` → `#1d1b16`
- 蓝技手册：`--blue:#0036a3` 作为头部强调色

## 验收清单

- [ ] 每个可复制提示词旁有复制按钮
- [ ] 点击按钮后 2 秒内显示"已复制"反馈
- [ ] 复制失败时显示"失败"而非静默失败
- [ ] 390px 移动端按钮仍可点击，无溢出
- [ ] `data-prompt` 内容与 `.prompt-en` 显示文本一致