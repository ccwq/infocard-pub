# CLI 手册卡模式（完整 CLI Reference 类卡片）

适用：当源是某个工具的官方 CLI 文档（Tailscale、kubectl、gh、aws、git 子命令…）且用户明确要求"完整手册 / 可作为速查 / 包含全部命令 flag"时。

兄弟模式：`dotfile-config-framework-card-pattern.md`（dotfile / shell-config / tmux-config / vim-distro）—— dotfile 卡讲"自带主题 + 配置层 + 安装卸载 + 快捷键"，CLI 卡讲"按职责分组 + 每条命令 flag 表 + 平台/版本边界"。两个都属于"工具说明书"卡，但骨架不同，不要混。

## 触发关键词

- "完整 CLI 手册"、"可以作为手册来使用"、"包含所有命令 / 所有 flag"
- 源 URL 是 `/docs/reference/<tool>-cli`、`/cli`、`/commands`、`/man/...` 等结构化命令参考页

## 默认主题

`hardblue`（technical manual）。CLI 文档的本质就是 systems tool / technical reference，hardblue token 系统已经为它准备好黑色 header、蓝色编号、`.flag-table` 双色行、shell 代码块、note-box 四色。

不要选：
- `darkgreen`（终端监控 / 状态盘）—— 视觉同质化太严重
- `redswiss`（工具目录 / 生态盘点）—— CLI 单工具不是"目录"
- `q-style`（轻量教程）—— 容不下手册级密度

## 卡骨架（13 节标准切分）

```
01  Getting started · 二进制位置 · Tab 补全 · 通用 flag
02  Command map · 按职责分组的 N 条主命令（4 列 cmd-card 网格）
03+ 每条核心命令独立 section：
       - 一句话定位
       - shell 调用语法块
       - flag-table（width:36% Flag | 64% 说明）
       - 子命令 sub-list（grid 130px name + 1fr desc）
       - note-box（warn / danger / ok）标注边界
N-1 速查 · 边界陷阱
       - 不可用平台 / 不可 sudo / 不可降级 等"反向能力"卡
       - 三命令决策（up vs set vs login 这类）
       - 诊断推荐顺序（status → netcheck → ping → bugreport）
N   footer · source + last validated + card meta
```

## 命令分组模板（按职责）

通用骨架，可按工具裁剪：

- **A. 连接生命周期 / 启停**：start / stop / login / logout / restart / switch
- **B. 状态与诊断**：status / version / ip / whois / netcheck / ping / bugreport / metrics
- **C. 内置服务**：serve / proxy / cert / ssh / port-forward
- **D. 数据 / 文件 / 共享**：file / drive / cp / push / pull
- **E. 网络与管理**：dns / route / lock / configure / policy / web / wait / update
- **F. 其它**：completion / licenses / scripts / shell-helpers

每条命令在 Command map 网格用 `cmd-card` 呈现：一句话定位 + 类别 tag + 命令名加色（蓝 = 默认、红 = 终止 / 危险、绿 = 只读、黄 = 诊断）。

## flag-table CSS 关键点

```css
.flag-table{
  width:100%;border:1.5px solid #000;
  background:#fff;font-size:.72rem;
  display:block;overflow-x:auto;max-width:100%;
}
.flag-table table{width:100%;border-collapse:collapse;min-width:480px}
.flag-table th{
  background:#0a1326;color:#fff;font-weight:800;font-size:.62rem;
  letter-spacing:.08em;text-transform:uppercase;
}
.flag-table tr:nth-child(even) td{background:#f1ece1}
.flag-table code.flag{
  background:#eaf1ff;color:#1e3a8a;
  border:1px solid #cdddff;padding:1px 5px;
  font-weight:700;white-space:nowrap;
}
.flag-table .platform{
  color:#d11f2d;font-weight:800;font-size:.6rem;
  text-transform:uppercase;margin-left:4px;
}
```

- `.flag-table` 必须 `display:block; overflow-x:auto`，让宽表在 390px 下用横向滚动，而不是撑爆容器。
- `min-width:480px` 内部 table —— 保证 flag 列不会因为说明列长文本压成一字。
- `.platform` span 用于在 flag 名旁标注 `LINUX` / `WINDOWS` / `MACOS` / `ALPHA` / `BETA`。

## 数据采集与解析陷阱

官方 CLI docs 经常是 SPA 渲染，但服务端会回包含完整内容的 HTML。优先 `curl -sL <url>` 拿原始 HTML，再用 `HTMLParser` 提取。

**坑：上一节内容被归到下一节标题**。Tailscale docs 用的版式是"标题 + 上一节的尾部内容"（标题被插在 section 之间作为视觉切分），用普通 `<h2>` 收尾不能直接切分内容。修法：把 section content 累积到 buffer，遇到下一个 `<h2>/<h3>/<h4>` 时 flush，但 flush 时要意识到 buffer 里堆的是"前一标题的内容"。最稳妥是先把 raw HTML 落盘成 markdown 让自己肉眼校对一遍，再按节生成卡内容。

可重用 Python 解析模板：

```python
class CliParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []   # [(level, title, content_str), ...]
        self.current_buf = []
        self._h_buf = ''
        self._in_h = None
        # ... 略：跳过 nav/header/footer/script/style 子树
    def handle_endtag(self, tag):
        if tag in ('h1','h2','h3','h4'):
            level = int(tag[1])
            title = self._h_buf.strip()
            # 关键：把 buffer flush 给"上一个标题"，不是当前标题
            self.sections.append((level, title, ''.join(self.current_buf)))
            self.current_buf = []
            self._in_h = None
```

输出落盘后，按标题对照原网页人工校对一遍再写卡——这一步比相信解析器结果省得多返工。

## 内容密度规则

CLI 手册卡天然信息密度高，但要**严格中文化正文**（标题、说明、tag）。允许保留的英文：

- 命令名本身：`tailscale up`、`kubectl apply`
- flag 字面：`--accept-routes`、`--exit-node=<ip|name>`
- 专有名词：`MagicDNS`、`Taildrop`、`WireGuard`、`PortMapping`、`DERP`、`OAuth`
- 平台标签：`LINUX` / `WINDOWS` / `MACOS` / `ALPHA` / `BETA`

不允许的英文：完整描述句、子命令解释、边界说明、章节文案。这部分必须中文。

## 边界陷阱章节（最后一节，红色编号）

必出现的四类内容：

1. **平台不支持矩阵**：iOS / Android 没 CLI、macOS sandbox 不支持某命令、Linux only flag…
2. **不可 sudo / 不可 root**：systray 一类禁特权运行的命令必须显著警告。
3. **不可回滚 / 一次性副作用**：降级到没有 update 的版本之后无法用 CLI 回滚；删除 lock signature 后需要重新走信任流程……
4. **决策表**：相似命令的对比，例如 `up` vs `set` vs `login`——三列 cmd-card + 一句话各自适用场景。

## 验收差异（相对普通卡）

- flag-table 必须用 `browser_console` 跑 `document.body.scrollWidth <= window.innerWidth` 校验；如果有溢出，先检查是不是 `<code class="flag">` 里有超长 flag（如 `--exit-node-allow-lan-access`）没 `word-break:break-word`。
- 390px 移动端截图除了看溢出，还要确认 flag-table 的横向滚动是"只表格滚动"，不是整个 section 滚动——见 `references/mobile-overflow-fixes.md` 的 `.table-scroll` 隔离模式。
- vision_analyze 时明确问"表格列是否完整可读、shell 代码块是否被截断、flag 表 width:36/64% 比例是否合适"。

## 典型时长

完整手册卡（≥20 条主命令、≥80 个 flag）单卡耗时 ≈ 12-15 分钟。比 dotfile-config 卡略长，主要花在 HTML 解析 + 校对、flag-table HTML 生成。Build / push / 验收 / wiki 同步阶段与其他卡持平。

## Canonical reference

`docs/20260622-tailscale-cli.html`（hardblue 主题，26 条主命令、~120 个 flag，13 节切分，~61KB）。
