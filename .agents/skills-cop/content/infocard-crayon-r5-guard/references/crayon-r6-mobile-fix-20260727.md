# crayon poster-shell 移动端布局修复（2026-07-27）

## 最高频崩溃模式：逐字竖排 / 正文列塌缩

**症状**：Chrome 移动端（390×844）正文被压缩成极窄列，每个中文单字被迫独占一行，英文单词被从中截断。视觉像"竖排"，实为 CSS 布局完全崩溃。

**根因链路（三层叠加）**：

1. **body > main 宽度锚定缺失**：`body` → `main`（无显式宽度，default = fit-content） → `.poster-shell { width: 100% }` → 100% × fit-content main = 最窄子元素宽度 → 正文列完全塌缩。

2. **两个 `@media(max-width:720px)` 块冲突**：历史维护中在两处写了移动端 CSS，后一个块覆盖前一个。若旧块（72px 列宽）未删除，新的 R5 参数（48px）被覆盖。

3. **`@media` 闭合 `}` 后的孤儿规则**：`@media` 块内的样式被错误写到 `}` 后面，变成全局规则，以更高优先级覆盖 `@media` 内的响应式值。

**诊断命令**：
```bash
grep -c '@media(max-width:720px)' docs/xxx.html   # 期待：1
grep -n '@media\|</style>' docs/xxx.html          # } 后应是 </style>
```

**staticCheck 必须通过才能 commit**：`{ok:true, errors:[]}`

**验收标准**（移动端 390×844 截图）：
- ✅ 正文横向正常排版（无逐字竖排）
- ✅ 编号列（48px）与正文列（1fr）两栏并列
- ✅ 时间轴虚线（left:40px）与圆点对齐
- ✅ poster-kicker 单行截断
- ✅ max-width:760px 生效
- ✅ stat-row 单列堆叠
- ✅ footer / save-row 按钮可见
