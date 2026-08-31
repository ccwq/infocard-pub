# 主题视觉参考工具链

## 场景

用户需要看到所有可用主题的视觉预览，再决定某张卡用哪个主题重建。
不能用 CDP browser tool（会超时），用 Puppeteer 直接截 `theme/*.html`。

## 工具链（已验证可用）

```bash
# Puppeteer 截图（/tmp 有写权限）
cd /tmp && node -e "
const puppeteer = require('puppeteer');
const themes = ['hardblue','redswiss','darkblue','darkgreen','color-material','main','black','blue','green','q'];
(async () => {
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  page.setViewport({width:1280,height:720});
  for(const t of themes){
    await page.goto('https://ccwq.github.io/infocard-pub/theme/'+t+'.html',{waitUntil:'networkidle2',timeout:20000});
    await page.screenshot({path:'/tmp/theme-'+t+'.png',fullPage:false});
  }
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1);});
"
```

输出文件：`/tmp/theme-<name>.png`，用 `MEDIA:/tmp/theme-<name>.png` 发送给用户。

## 截图后用 vision_analyze 核验实际渲染

```bash
# 先截目标卡（公网）
node -e "..."
# vision 分析
```

## 所有可用主题（截至 2026-07-12）

| 文件名 | 风格描述 |
|---|---|
| hardblue | 红蓝双色顶栏、硬阴影、手册风 |
| redswiss | 红黑瑞士编辑风 |
| darkblue | 深蓝工作台、渐变背景 |
| darkgreen | 深绿监控台、绿色安全感 |
| color-material | 暖米纸、紫绿蓝调色板、纸感网格 |
| main | 主风格、红黑白骨架 |
| black | 黑头主题、红色强调 |
| blue | 蓝技术手册 |
| green | 青绿/Swiss editorial 风 |
| q | 纸感手作、彩色卡片对比 |
| paper-warm | 暖米纸背景 |
| white-purple | 白紫轻科技工作台 |
| sage-swiss | 鼠尾草瑞士风 |
| archive-green | 档案绿 |
| graph-paper | 纸感图谱手册 |
| handline | 手绘便签/白板草图风 |
| scrapbook | 手账拼贴风 |
| pixelstack | 像素堆叠、复古手作 |
| wood | 木感编辑风 |
| bigwhite | 大白商务风 |
| codex-notebook | Codex 笔记本风 |
| black-head | 黑头主题 |

## CDN 缓存问题

GitHub Pages 有 CDN 缓存（最长 ~5 分钟）。用户看到旧样式时：
- 告知：`Ctrl+Shift+R`（Chrome）或开隐身窗口
- 同时：用 cache-bust 参数 `?v=<timestamp>` 确认公网已是新版本
- 若仍不一致：用 puppeteer 截图验证（无缓存）

验证命令：
```bash
curl -s "https://ccwq.github.io/infocard-pub/docs/<slug>.html?$(date +%s)" | python3 -c "
import sys
h=sys.stdin.read()
for token in ['#6e3fd6','#d80018','#f7f2e8','color-material','hardblue']:
    print(token, '✓' if token in h else '✗')
"
```
