# 双语可复制提示词卡模式

> 适用于 AI 图像提示词、人像提示词、写作提示词、命令模板等需要直接复用的内容。

## 触发条件

当卡片包含以下任一内容时，默认启用双语可复制模式：
- 提示词模板
- 命令模板
- 配置样例
- 代码片段
- 需要读者直接复制执行的短文本块

## 结构要求

### 1. 每个模板必须同时有中英两层
- **英文层**：用于复制执行，保持原始术语与关键词密度
- **中文层**：用于解释语义、帮助理解与调参
- 两层应属于同一模板块，不要拆散到不同章节

### 2. 每个可复制块必须带复制按钮
- 每个模板块至少一个复制按钮
- 若用户要求双向复制，则提供两个按钮：`复制英文` / `复制中文`
- 按钮应紧贴模板头部，避免用户滚动寻找

### 3. 必须保留基础可复制块
即使卡片主内容是分析、总结或扩充，提示词类卡片也应保留一个“基础可复制提示词”区块，方便用户先拿到可直接使用的最小可行版本，再继续挑选高级模板。

## 推荐 DOM 结构

```html
<div class="prompt-card">
  <div class="prompt-head">
    <span class="prompt-name">模板名</span>
    <div class="prompt-btns">
      <button class="prompt-copy-btn" data-en="..." data-cn="...">📋 复制英文</button>
      <button class="prompt-copy-btn" data-en="..." data-cn="...">📋 复制中文</button>
    </div>
  </div>
  <div class="prompt-en">英文原文</div>
  <div class="prompt-cn">中文理解</div>
</div>
```

## 文案原则

- 英文层应尽量保留关键词原貌，少做意译。
- 中文层应强调可操作性：像真实照片、自然光、微表情、构图、皮肤质感、背景环境等。
- 适合“真实世界自然照片/人像”的卡片，应优先使用 `photorealistic`、`candid`、`natural lighting`、`realistic skin texture`、`imperfect composition` 等组合词。

## 与 any2card 其他规范的关系

- 与 `copy-button-component.md` 配套使用。
- 如果卡内有提示词池、模板区或“最终推荐”区，优先把基础可复制块放在前面，随后再展开扩充版。
- 如果来源信号来自 X / 小红书等社媒，优先把社媒提到的高频关键词转成可复制模板，而不是只写概念总结。
