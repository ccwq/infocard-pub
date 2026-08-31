# GitHub 配图优先原则

## 核心规则

当 X 帖子内容是**推广 GitHub 开源项目**时（正文含 `github.com/<user>/<repo>` 链接），配图应优先从 GitHub 仓库中获取，而非从 X 帖子提取嵌入图片。

**原因：**
1. X 嵌入的图片是 Twitter CDN 压缩后的缩略图，分辨率低
2. GitHub 仓库中的截图是原始高质量图片（通常 1x-3x 分辨率）
3. GitHub README 通常有 `docs/assets/` 或 `design/` 目录存放产品截图
4. GitHub 图片通常有明确的 MIT/Apache 许可，版权清晰

## 查找路径（按优先级）

```
https://github.com/<user>/<repo>/tree/main/docs/assets/
https://github.com/<user>/<repo>/tree/main/docs/
https://github.com/<user>/<repo>/tree/main/design/
https://github.com/<user>/<repo>/tree/main/
```

常见截图文件名模式：`screenshot*.png`, `preview.png`, `demo.gif`, `hero.png`, `*.gif`

## 下载与压缩流程

```bash
# 1. 创建图片目录
mkdir -p docs/assets/images/<slug>/

# 2. 下载原始图
BASE="https://raw.githubusercontent.com/<user>/<repo>/main/docs/assets"
curl -sL -o "docs/assets/images/<slug>/preview.png" "$BASE/preview.png"

# 3. PIL 压缩（宽上限 1200px）
python3 -c "
from PIL import Image
im = Image.open('preview.png').convert('RGB')
w, h = im.size
if w > 1200:
    im = im.resize((1200, int(h*1200/w)), Image.LANCZOS)
im.save('preview_web.png', 'PNG', optimize=True)
"

# 4. 清理中间文件（只保留 _web.png 或 _compressed.gif）
rm -f preview.png screenshot.png original.gif
```

## 压缩 GIF（无 ffmpeg 时用 PIL）

```python
from PIL import Image
def compress_gif(src, dst, max_w=600, max_frames=15):
    im = Image.open(src)
    ratio = min(1.0, max_w / im.size[0])
    nw, nh = int(im.size[0]*ratio), int(im.size[1]*ratio)
    dur = im.info.get('duration', 100)
    frames = []
    try:
        step = max(1, im.n_frames // max_frames)
        for i in range(0, im.n_frames, step):
            im.seek(i)
            frames.append(im.copy().resize((nw, nh), Image.LANCZOS))
    except EOFError:
        pass
    frames[0].save(dst, save_all=True, append_images=frames[1:],
                   loop=0, duration=dur*3, optimize=True)
```

## HTML 引用写法

```html
<div class="img-gallery">
  <div class="img-row img-row-1">
    <figure>
      <img src="assets/images/<slug>/preview_web.png"
           alt="<项目名> 界面预览"
           loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
      <figcaption class="img-caption">
        <strong>界面预览：</strong>描述图片内容...
      </figcaption>
    </figure>
  </div>
  <div class="img-row img-row-2" style="display: grid !important; grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; gap: 8px !important;">
    <!-- 双列图片 -->
  </div>
</div>
```

## 许可说明

GitHub 仓库截图的许可跟随仓库本身（通常 MIT / Apache 2.0）。在 caption 中注明来源：
```
来源：<user>/<repo>/docs/assets（<许可> 许可）
```

## 验证

发布后用 curl 确认所有图片 HTTP 200：
```bash
curl -sI "https://ccwq.github.io/infocard-pub/$(grep -o 'assets/images/[^"]*' card.html | head -1)" | head -1
```