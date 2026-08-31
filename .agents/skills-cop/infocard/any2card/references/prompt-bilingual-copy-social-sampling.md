# 双语提示词与社媒采样补充笔记

## 适用场景

当 any2card 生成的是**提示词类信息卡**（AI 图像生成、AI 人像、写作提示词、可复用模板库）时，默认遵循以下补充规则：

### 1) 提示词必须中英双语并排
- 每条可复用提示词都应保留 **英文原文** 与 **中文理解/翻译**。
- 英文用于真正复制与投喂模型；中文用于读者快速理解意图、边界和风格。
- 只给英文不够；只给中文也不够。

### 2) 每条可复制提示词必须带按钮
- 可复制项使用 `.prompt-card` 组件。
- 同一条提示词建议提供两个复制按钮：
  - `复制英文`
  - `复制中文`
- 复制内容分别来自 `data-en` / `data-cn`，不要从页面显示文本里临时截取。
- 点击后应给出短暂状态反馈（例如 `✅ 已复制`），再恢复原文按钮文案。

### 3) 视觉结构建议
- 英文块与中文块要用稳定的视觉区分，例如：
  - 英文：蓝系/冷色标签、等宽字体、上半块
  - 中文：粉系/暖色标签、正文体、下半块
- 双语内容属于同一提示词组，不要拆成两个互不相干的卡片。
- 按钮要与标题同层，避免把“复制”做成卡尾附属功能。

### 4) 社媒采样用于扩充词库，不用于伪造事实
当提示词库需要扩充时，可以参考 X / 小红书上的高热内容，提炼用户真正关注的方向：
- 去塑料感
- 更真实的皮肤纹理
- 更自然的光线 / 阴影
- 更像抓拍而不是摆拍
- 更真实的生活场景和背景痕迹

**注意**：社媒采样只用于抽取高频关键词和用户目标，不把“点赞数/收藏数”写成事实结论。

### 5) 常见可扩充关键词池
- realistic skin texture
- subtle facial expression
- natural lighting
- imperfect composition
- off-center framing
- candid moment
- natural shadows
- soft contrast
- background clutter
- slight motion blur
- film grain
- environmental context

### 6) 适合复制的结构模板

```html
<div class="prompt-card">
  <div class="prompt-head">
    <span class="prompt-name">模板名</span>
    <div class="prompt-btns">
      <button class="prompt-copy-btn" data-en="..." data-cn="..." onclick="copyPrompt(this)">📋 复制英文</button>
      <button class="prompt-copy-btn" data-en="..." data-cn="..." onclick="copyPrompt(this)">📋 复制中文</button>
    </div>
  </div>
  <div class="prompt-en">...</div>
  <div class="prompt-cn">...</div>
</div>
```

## 验收清单

- [ ] 每条提示词都有英文版和中文版
- [ ] 每条提示词都有复制按钮
- [ ] 英文 / 中文复制各自独立
- [ ] 双语块在视觉上属于同一模板
- [ ] 社媒采样只用于扩词，不用于制造未经核实的事实
