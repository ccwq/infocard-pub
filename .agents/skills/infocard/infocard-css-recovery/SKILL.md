---
name: infocard-css-recovery
description: 信息卡 CSS 崩溃诊断与重建。当移动端 body 22px、序号居中异常、patch 3 次失败时，判定重建。
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [infocard, css, mobile, layout, recovery]
    related_skills: [infocard-crayon-style, infocard-publish-sop]
---

# infocard-css-recovery · 信息卡 CSS 崩溃诊断与重建决策

## 发布事故硬门禁

CSS/HTML 结构修复后，不能用 build、HTTP 200、DOM 或无溢出检查代替真实视觉验收。重建完成后必须重新截取桌面与 390px 移动端渲染图，逐区检查 Hero、章节、表格、代码块、风险区和页尾；缺少当前截图或存在 critical/major 时禁止 push。发布后修复会使旧证据失效，必须在 CDN 更新后对 exact 公网 URL 重新审核。

## 触发条件

满足任一即进入本技能：

1. 同一 CSS 属性 **3 次 patch 后仍失败**
2. 移动端 `.card-body` 实测宽度 **≤ 30px**（正常应 ≥ 200px）
3. `.card-num` 垂直居中异常（CDP 测量 `num_center ≠ card_center`）
4. 发现 `@media` 内外**两条同名规则**互相覆盖

## 诊断流程

### Step 1：CDP 精确测量（不依赖截图）

```javascript
// 桌面端 1280px 测量
document.querySelectorAll('.skill-card').forEach((c,i)=>{
  if(i>1)return;
  var n=c.querySelector('.card-num'), b=c.querySelector('.card-body');
  if(!n||!b)return;
  var nR=n.getBoundingClientRect(), bR=b.getBoundingClientRect(), cR=c.getBoundingClientRect();
  console.log(i, 'num_c:'+Math.round(nR.top+nR.height/2), 'body_c:'+Math.round(bR.top+bR.height/2), 'card_c:'+Math.round(cR.top+cR.height/2), 'body_w:'+Math.round(bR.width));
});
```

移动端测量：先用 `Emulation.setDeviceMetricsOverride({width:390,height:844,mobile:true})`，再执行同样 JS。

**通过标准**：`num_center ≈ card_center`（±3px），`body_w ≥ 200px`

### Step 2：检查 CSS 双规则

```bash
grep -n '\.card-body' docs/xxx.html | grep -v '@media'
grep -n '\.card-body' docs/xxx.html | grep '@media'
# 两条都存在 → 双重规则陷阱
```

### Step 3：判定 patch 或重建

| 信号 | 决策 |
|------|------|
| 单属性笔误（color 写错、padding 差 2px）| 继续 patch |
| `@media` 内外都有同名规则，且移动端崩溃 | **重建** |
| grid 改 flex 后引入新崩溃 | **回滚 + 重建** |
| 已 patch 3 次仍失败 | **重建** |
| 桌面正常，移动崩溃 | **重建** |

## 重建标准操作

1. 提取所有 `.skill-card` 文字内容（section 编号、颜色、title、desc）
2. 回滚基线：`git checkout <clean_commit> -- docs/xxx.html`
3. 以目标 theme 的 `theme.html` 为骨架从零写 CSS
4. **必加项（crayon poster-shell）**：
   - `.card-body { width: 100%; grid-column: 2; }`（桌面端）
   - `@media(max-width:720px) { .card-body { width: 100%; } }`（移动端）
   - `.card-num { align-self: center; }`（垂直居中）
5. CDP 双重验证（1280px + 390px）
6. 验收后才 commit

## 关键教训（qwable-v1，2026-07-28）

| 教训 | 规则 |
|------|------|
| grid `1fr` = `minmax(auto,1fr)`，内容少时被 min-content 压扁 | `.card-body` 必须 `width: 100%` |
| `@media` 内外同名规则特异性相同，完全覆盖 | 移动端规则必须独立完整 |
| `align-self: start` = 顶部对齐，不是居中 | 居中用 `align-self: center` |
| CDP `getBoundingClientRect` 是 ground truth | 优先测量，截图只是辅助 |
| 4 次 patch 失败后用户才说"重建" | **3 次失败即触发重建阈值** |

## 关键教训补充（2026-08-04）

| 教训 | 规则 |
|------|------|
| 子智能体写卡时可能用错模板类名 | 写卡前 `grep` 确认模板文件，用模板的结构和类名填充 |
| 同一 slug 的 CSS 可能被错误模板覆盖 | 发布前在浏览器 console 验证实际 CSS token（`--bg` 值） |
| GitHub Contents API PUT 对已存在文件必须先 GET 获取 SHA | 不提供 sha → HTTP 422，无法推送 |

### 预防：CSS 主题验证脚本

发布前在浏览器执行：
```javascript
// 检查实际渲染的主题 vs meta.yaml 声明
var style = document.querySelector('style');
var cssText = style?.textContent || '';
var bgToken = cssText.match(/--bg:\s*(#[0-9a-f]+)/i)?.[1];
var meta = document.querySelector('meta[name="style"]')?.content;
console.log('实际 --bg:', bgToken, '| meta 声明:', meta);

// 主题 token 速查
// redswiss: #f5f2ec | darkblue: #0c1020 | hardblue: #f6f4ef | paper-warm: #f5f2ec
// redswiss 特征类: .topbar / .sec-head
// darkblue 特征类: .hero-bar / .orb
// hardblue 特征类: .hero-bar / .hero-copy
// paper-warm 特征类: .page-wrapper / .content-card
```

## 参考

- `infocard-crayon-style/references/crayon-r5-poster-shell-20260726.md` — R8 重大发现（body width:100%、双规则陷阱）
- `infocard-crayon-style/references/grid-column-trap.md` — grid + 绝对定位陷阱
