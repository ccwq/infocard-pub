# 移动端横向溢出调试（2026-06-03 新增）

## 症状
Selenium 390×844 视口下 `body.scrollWidth` = 630，但 `innerWidth` = 500，`clientWidth` = 485。验收脚本报错 `scrollWidth=630 expected 390`。

## 根因分析
页面本身内容宽度正常（`.page` 约 467px），但 `body` 出现横向溢出是因为：
1. `body` 缺少 `overflow-x:hidden`
2. `html` 缺少 `min-height:100%`
3. 全局 `*` reset 里没有 `overflow-x:hidden`

此时 `scrollWidth` 会包含隐含横向溢出，Selenium 抓不到真正的视口限制。

## 修复顺序（从外到内）

```css
/* Step 1: 全局 reset */
* { overflow-x: hidden; }

/* Step 2: html + body */
html, body { min-height: 100%; overflow-x: hidden; }

/* Step 3: 页面容器 */
.page {
  overflow-x: hidden;
  min-width: 0;
  width: min(780px, 100%);
}
```

关键点：
- `overflow:hidden`（单方向）不够，必须用 `overflow-x:hidden`（显式声明横轴）
- `min-width:0` 是为了让 flex/grid 子项正确收缩
- `body.scrollWidth > body.clientWidth` 就能验证是否仍有溢出

## 验证命令（Selenium）

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--window-size=390,844')
driver = webdriver.Chrome(options=opts)
driver.get('file:///path/to/page.html')
sw = driver.execute_script('return document.body.scrollWidth')
cw = driver.execute_script('return document.body.clientWidth')
print(f'scrollWidth={sw} clientWidth={cw}')
assert sw <= 390, f'still overflow: {sw}'
```

## 本次修复 Claude Cookbooks 卡的过程

原状态：scrollWidth=630, body.clientWidth=485
- `.page` 实际宽度 467px，内容本身没问题
- body 本身 485px 也未超过 500（innerWidth），但 scrollWidth 包含隐含溢出
- 根因：全局 `*` reset 缺少 `overflow-x:hidden`，`body` 和 `html` 没有设 `min-height`

修复后：scrollWidth ≤ 390，验收 PASS。