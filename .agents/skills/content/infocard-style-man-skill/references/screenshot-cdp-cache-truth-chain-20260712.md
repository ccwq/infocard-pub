# 截图验收与 CSS 验证链路

## 验证链路（永远按此顺序，不跳步）

```
Step 1  curl HTML → grep CSS token   ← 唯一 ground truth
Step 2  puppeteer screenshot → vision 分析（仅在 step 1 通过后用）
Step 3  用户浏览器看旧图 → 说明是本地浏览器缓存
```

**永远先执行 Step 1**，再说"截图给用户看"。Step 1 是 ground truth，step 2/3 可能被本机缓存误导。

## Step 1：curl 验证（ground truth）

CDN HTTP 响应已包含正确 HTML 时，curl 是唯一可信验证方式：

```bash
curl -s "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | python3 -c "
import sys; h=sys.stdin.read()
checks = {
  'darkgreen': '#0d2b1a' in h or '#07120d' in h,
  'redswiss':  '#f5f2ec' in h and '#c8102e' in h,
  'hardblue':  '#f6f4ef' in h and '#d80018' in h,
  'green':     '#15803d' in h,
  'white-purple': '#8a5cf5' in h,
  'color-material': '#6e3fd6' in h,
  'old-darkblue': '#070b18' in h,   # ← 错误旧主题
}
for t,v in checks.items():
    print(t, '✓' if v else '✗')
"
```

## Step 2：puppeteer 截图（step 1 通过后才用）

⚠️ **headless Chrome 会复用本机磁盘缓存**（来自之前浏览器访问过的 URL），与 CDN 无关。必须隔离：

```bash
cd /tmp && npm install puppeteer 2>/dev/null | tail -1
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox',
           '--disable-cache','--disable-application-cache',
           '--disk-cache-size=0']
  });
  const ctx = await browser.createIncognitoBrowserContext(); // 隔离缓存
  const page = await ctx.newPage();
  page.setViewport({width:1280, height:720});
  await page.goto(url, {waitUntil:'networkidle2', timeout:25000});
  await page.screenshot({path, fullPage:false});
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
"
```

## Step 3：用户看到旧图

- **不是 CDN 问题**，是用户本地浏览器缓存
- 解决方案：DevTools → Network → Disable cache（devtools 开着时全局禁用缓存）
- 或：`Ctrl+Shift+R`（Chrome/Edge）强制刷新
- 或：开隐身/无痕窗口

## 经验来源

2026-07-12：重建 5 张卡后（chinese-independent redswiss、aitoearn redswiss、ai-content-kb darkgreen、humla green、emilkowalski white-purple），puppeteer 截图被 vision 模型判断为"深蓝旧主题"，但 curl 验证 HTML CSS token 全部正确。根因：puppeteer headless Chrome 从本机磁盘读取了缓存，与 CDN 是否更新无关。
