# Ornith 1.0 发布复盘：子智能体并发覆盖 + 移动端/PNG 最终门禁

## 触发场景

用户要求“搜集信息并使用子智能体发布信息卡”。主 Agent 派发子智能体后，为避免等待，也继续本地创建同一 slug 的信息卡。最终本地文件内容与主 Agent 预期不一致：子智能体/并发路径写入了另一版 HTML，导致：

- 页面标题与主 Agent 写入稿不同；
- 保存按钮仍是 `window.print()` / `SAVE PRINT` 风格；
- 390px 公网 Playwright 实测 `scrollWidth > innerWidth`；
- 初次提交只包含 HTML/meta，`npm run build` 后的 `_index.yaml` / `index.html` 被留在工作区，必须追加提交。

## 可复用规则

### 1. 子智能体发布同一 slug 时，主 Agent 不要并发写同一文件

如果已派发子智能体去创建/发布某张卡：

- 主 Agent 可以继续做只读核查、准备素材、验证公开源；
- 不要同时写同一个 `docs/<slug>.html` / `.meta.yaml`；
- 若必须接手，先确认子智能体已超时/失败或目标文件尚不存在；
- 接手前读取当前文件内容，确认不是另一路刚写入的版本。

快速检查：

```bash
cd /home/ccwq/infocard-pub
git status -sb
ls docs/*ornith* 2>/dev/null || true
grep -n "<title>\|save\|html2canvas\|window.print" docs/<slug>.html | head -30
```

### 2. build 后提交前必须二次 `git status`

`npm run build` 会改 `_index.yaml` 和 `index.html`。即使刚提交了 HTML/meta，也不能立刻 push；必须确认 build artifacts 是否已提交。

正确序列：

```bash
npm run build && npm run verify
git status --short
# 若 _index.yaml / index.html 修改，和本次卡一起 commit 或 amend
# 不要先 push 再补一个 index commit，除非已经误 push
```

### 3. 最终公网验收必须查“源代码 + 运行时布局”

只看 HTTP 200 不够。至少确认：

```bash
url="https://ccwq.github.io/infocard-pub/docs/<slug>.html"
curl -L -s "$url?cb=$(date +%s)" -o /tmp/card.html
grep -q "保存 PNG" /tmp/card.html
grep -q "html2canvas" /tmp/card.html
```

并用 Playwright 检查移动端：

```python
from playwright.sync_api import sync_playwright
url='https://ccwq.github.io/infocard-pub/docs/<slug>.html?cb=final'
with sync_playwright() as p:
    b=p.chromium.launch()
    page=b.new_page(viewport={'width':390,'height':844})
    page.goto(url, wait_until='networkidle')
    print(page.evaluate('''() => ({
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      buttonText: document.querySelector('.save,.save-btn')?.innerText,
      hasPNG: document.body.innerHTML.includes('html2canvas')
    })'''))
    b.close()
```

合格口径：`scrollWidth <= innerWidth`，按钮文字是“保存 PNG”或等价中文，且真实引用/调用 `html2canvas`，不能是 `window.print()`。

### 4. 表格和 hero 是 390px 溢出的高发点

如果 `scrollWidth > innerWidth`，用 DOM 定位超宽元素：

```python
els = page.evaluate('''() => Array.from(document.querySelectorAll('*')).map(e=>{
  const r=e.getBoundingClientRect();
  return {tag:e.tagName, cls:e.className, text:(e.innerText||'').slice(0,40), left:r.left, right:r.right, width:r.width, sw:e.scrollWidth}
}).filter(x=>x.right>innerWidth||x.left<0||x.sw>x.width+2).slice(0,30)''')
```

常见修法：

```css
body{overflow-x:hidden}
@media(max-width:720px){
  .hero{display:block!important;grid-template-columns:1fr!important;width:100%!important;overflow:hidden}
  .hero-bar,.hero-copy,.hero-visual,.panel-top,.panel-body{width:100%!important;max-width:100%!important;left:auto!important;right:auto!important}
  .matrix-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
  .matrix{min-width:680px}
}
```

## 适用范围

适用于 infocard-pub 中“子智能体调研/写卡 + 主 Agent 发布验收”的所有任务，尤其是模型发布、Agent 工作流、benchmark 技术卡这类高密度 HTML。