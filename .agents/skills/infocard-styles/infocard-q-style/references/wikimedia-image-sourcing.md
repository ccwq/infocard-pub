# Wikimedia Commons 图片抓取：已验证可行的方法

## 方法 A：浏览器 CDP + Runtime.evaluate（第一优先）

**适用场景：** Wikimedia 返回小文件（<5KB）或 429 时，CDP 浏览器可以正常加载。

```bash
# 1. 浏览器导航到 Wikipedia 词条
browser_cdp(method="Page.navigate",
            params={"url": "https://en.wikipedia.org/wiki/Hilbert_curve"},
            target_id="<tab_id>", timeout=20)

# 2. 提取页面上所有 Wikimedia 图片 URL
browser_cdp(method="Runtime.evaluate",
            params={"expression": """
[...document.querySelectorAll('img[src*="upload.wikimedia.org"]')]
  .map(i => i.src)
""", "returnByValue": true},
            target_id="<tab_id>", timeout=10)

# 3. 用 curl 下载（Referer 头防止 429）
curl -sL --max-time 20 \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ..." \
  -H "Referer: https://en.wikipedia.org/" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Hilbert_curve_3.svg/500px-Hilbert_curve_3.svg.png" \
  -o DEST/hilbert_3.png
```

## 方法 B：Wikimedia API 直接查询（需加 sleep 防 429）

```python
import urllib.request, json, os, time, urllib.parse

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'

def get_wikimedia_url(title, dest_path):
    """通过 Wikimedia API 获取文件直链并下载。"""
    time.sleep(1)
    encoded = urllib.parse.quote(title)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles={encoded}&prop=imageinfo&iiprop=url&iilimit=1'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=8) as r:
        d = json.loads(r.read())
    pages = d['query']['pages']
    direct_url = list(pages.values())[0]['imageinfo'][0]['url']
    req2 = urllib.request.Request(direct_url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req2, timeout=15) as r2:
        data = r2.read()
    with open(dest_path, 'wb') as f:
        f.write(data)
    return os.path.getsize(dest_path)
```

## 已知成功 thumb 路径（已验证）

| 曲线 | thumb URL |
|---|---|
| Hilbert 4阶 | `commons/thumb/2/28/Hilbert_curve_4.svg/440px-Hilbert_curve_4.svg.png` |
| Moore | `commons/thumb/3/3e/Moore_curve.svg/440px-Moore_curve.svg.png` |
| Morton Z | `commons/thumb/9/9c/Z-curve.svg/440px-Z-curve.svg.png` |
| Dragon 12阶 | `commons/thumb/3/35/Dragon_curve_iteration_12.svg/440px-Dragon_curve_iteration_12.svg.png` |
| Gosper | `commons/thumb/7/73/Gosper_curve.svg/440px-Gosper_curve.svg.png` |
| Sierpinski 曲线 | `commons/thumb/4/43/Sierpinski_curve.svg/440px-Sierpinski_curve.svg.png` |
| Sierpinski 三角 3阶 | `commons/thumb/e/e6/Sierpinski_Triangle_3.svg/440px-Sierpinski_Triangle_3.svg.png` |
| Koch 雪花 4阶 | `commons/thumb/4/4d/Koch_snowflake_4th_iteration.svg/440px-Koch_snowflake_4th_iteration.svg.png` |
| Vicsek | `commons/thumb/8/8f/Vicsek_fractal_2.svg/440px-Vicsek_fractal_2.svg.png` |
| Pythagoras 树 | `commons/thumb/3/36/Pythagoras_tree_3.svg/440px-Pythagoras_tree_3.svg.png` |
| Osgood | `commons/thumb/7/7f/Osgood_curve.png/500px-Osgood_curve.png` |
| Lévy C | `commons/thumb/b/bc/L%C3%A9vy_C_curve.png/500px-L%C3%A9vy_C_curve.png` |
| Mandelbrot | `commons/thumb/2/21/Mandel_zoom_00_mandelbrot_set.jpg/500px-Mandel_zoom_00_mandelbrot_set.jpg` |

## 常见失败模式
## 常见失败模式
| 现象 | 原因 | 解法 |
|---|---|---|
| curl 返回 ~1928B 小文件 | Referer 缺失导致 Wikimedia anti-hotlink | 加 `-H "Referer: https://en.wikipedia.org/"` |
| curl 返回 ~619B SVG | Special:FilePath 重定向到 HTML 错误页 | 改用 CDP 浏览器加载词条再提取 img.src |
| API 返回 429 | 请求过快无 sleep | 加 `time.sleep(1)` |
| 文件 <5KB | 实际下载到的是错误提示页 | 用浏览器打开 CDN URL 确认后再下载 |
| hilbert_1/2/3.svg 只有几百字节 | 这些是极简示意图，无实际内容 | 从 Wikipedia 词条提取含更多迭代的版本 |
| thumb 路径返回 404 | **文件名或路径猜错了** | **永远不要猜路径；先 API 取直链再下载** |

## ⚠️ 关键规则：永远不要猜 Wikimedia 路径

**失败案例（2026-06-12 awesome-math 卡）：**
- 想当然用了 `commons/thumb/2/21/Mandel_zoom_00_mandelbrot_CB.jpg/500px-Mandel_zoom_00_mandelbrot_CB.jpg`
- 结果：HTTP/2 404
- 修复：换用毕达哥拉斯定理图（API 直接取直链成功）

**正确做法永远是两步：**
```python
# Step 1: 用 API 拿到实际的 canonical 直链
def get_wiki_url(file_title):
    url = (f'https://commons.wikimedia.org/w/api.php'
           f'?action=query&titles={urllib.parse.quote(file_title)}'
           f'&prop=imageinfo&iiprop=url&format=json')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        d = json.load(r)
    return list(d['query']['pages'].values())[0]['imageinfo'][0]['url']

# Step 2: 下载 API 返回的直链（不要再拼接 thumb 路径！）
url = get_wiki_url('File:Pythagorean_theorem_proof.svg')
# → https://upload.wikimedia.org/wikipedia/commons/a/ab/...
curl -sL --max-time 20 -H "User-Agent: ..." "$url" -o dest.svg
```

**规则：API 返回什么 URL 就用什么 URL，绝对不要自己在 URL 上拼接 `thumb/…/500px-…` 路径。**

## 推荐下载流程（数学/科学类信息卡）

1. 浏览器 CDP 导航到 Wikipedia 词条页面
2. `Runtime.evaluate` 提取所有 `img[src*=upload.wikimedia.org]` URL
3. 选最大尺寸（通常 500px 或 960px 优先于 250px）
4. curl 下载时加 `Referer: https://en.wikipedia.org/` 头
5. 验证文件 >5KB，否则换方法