# GitHub API base64 解码：raw.githubusercontent.com 失败时的备用路径

## 场景

`raw.githubusercontent.com` 对某些二进制文件（PNG/JPG/GIF）返回 0 字节或空内容（常见于大文件、图片、CDN 限制场景）。GitHub Contents API 通过 base64 编码始终返回文件内容。

## 标准 Python 实现

```python
import urllib.request, base64, json, os
from PIL import Image

owner = 'labring'
repo  = 'FastGPT'
files = [
    ('intro1.png', '.github/imgs/intro1.png'),
    ('intro2.jpg', '.github/imgs/intro2.jpg'),
    ('intro3.png', '.github/imgs/intro3.png'),
    ('intro4.png', '.github/imgs/intro4.png'),
]

for fname, path in files:
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Hermes'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    content = base64.b64decode(data['content'])
    out_path = f'/tmp/fastgpt-{fname}'
    with open(out_path, 'wb') as f:
        f.write(content)

    # PIL resize（宽上限 720px）
    img = Image.open(out_path).convert('RGB')
    w, h = img.size
    if w > 720:
        ratio = 720 / w
        img = img.resize((720, int(h * ratio)), Image.LANCZOS)
    img.save(out_path, quality=85, optimize=True)
    print(f'{fname}: {img.size}, {os.path.getsize(out_path)} bytes, sha={data["sha"][:8]}')
```

## 关键点

- `data['content']` 是 base64 字符串（注意 GitHub API 的 contents endpoint 有 1MB 文件大小限制）。
- `data['sha']` 可用于验证完整性（SHA-1）。
- 大文件（>1MB）需要使用 GitHub 的 `media` API 或 `raw.githubusercontent.com`（在 curl 可用时更高效）。
- 下载后用 PIL resize 到 720px 宽以控制信息卡 HTML 中的文件体积。

## 适用场景

- GitHub README 内嵌的 `.png/.jpg/.gif` 截图
- `raw.githubusercontent.com` 返回空或 0 字节时
- 需要 SHA 验证下载完整性时

## 验证

```bash
curl -sI "https://ccwq.github.io/infocard-pub/docs/assets/images/<slug>/<filename>.png" | head -1
# 期望：HTTP/2 200
```
