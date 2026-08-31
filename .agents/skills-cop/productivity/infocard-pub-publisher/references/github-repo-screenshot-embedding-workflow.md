# GitHub 仓库截图/插图嵌入工作流

## 何时用

用户发来 GitHub 仓库 URL + 明确表示希望嵌入项目截图时执行。

## 完整流程

### 1. 克隆（--depth=1 轻量）
```bash
cd /tmp && git clone --depth=1 https://github.com/OWNER/REPO.git <slug>-img
```

### 2. 定位图片
```bash
# 常见截图路径（Java/前端项目）
find /tmp/<slug>-img -type f \( -iname "*.png" -o -iname "*.jpg" \) \
  | grep -v fontawesome | grep -v vendor | grep -v webfonts \
  | grep -v "sort_" | grep -v data-tables | sort

# README 中引用的图片（相对路径）
grep -oP '!\[.*?\]\([^)]+\)' /tmp/<slug>-img/README.md
```

典型截图目录：
- `cachecloud-web/src/main/resources/static/img/`（Java Spring 项目）
- `docs/images/` / `assets/img/` / `screenshots/`
- README 中的相对路径图片

### 3. 挑选最有代表性的图片
- **Hero/LOGO**：1 张（如 `cachecloud-head.png`）
- **主界面大图**：1 张（overview 区下方全宽展示）
- **架构/流程图**：1 张
- **Gallery 网格**：2–4 张小图（登录、部署、监控等）

单张 PNG > 1MB → 可选压缩；总体 3–5 张足够。

### 4. 复制到 infocard-pub assets
```bash
mkdir -p ~/infocard-pub/assets/img/<slug>
cp /tmp/<slug>-img/<path>/<img>.png ~/infocard-pub/assets/img/<slug>/
```

### 5. HTML 中引用（相对路径）
HTML 在 `docs/<slug>.html`，assets 在 `assets/img/<slug>/`：
```html
<!-- Hero 装饰 -->
<img src="../assets/img/<slug>/head.png" alt="Logo" style="width:72px" />

<!-- Overview 大图 -->
<div class="screenshot-wrap">
  <img src="../assets/img/<slug>/main-ui.png" alt="主界面" loading="lazy" />
  <div class="screenshot-caption">（来源：OWNER/REPO 仓库截图）</div>
</div>

<!-- Gallery 网格 -->
<div class="gallery-grid">
  <div class="gallery-item">
    <img src="../assets/img/<slug>/xxx.png" alt="说明" loading="lazy" />
    <div class="caption">说明</div>
  </div>
</div>
```

### 6. CSS 类（参考 redswiss / hardblue 已有的 screenshot 样式）
```css
.screenshot-wrap{border:2px solid var(--line);box-shadow:var(--shadow);margin-top:12px;overflow:hidden;background:#fff}
.screenshot-wrap img{width:100%;height:auto;display:block}
.screenshot-caption{padding:5px 10px;font-size:10.5px;color:#666;font-weight:700;background:#f5f2ec;border-top:1.5px solid var(--line);text-transform:uppercase;letter-spacing:.06em}
.gallery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:12px}
.gallery-item{border:2px solid var(--line);overflow:hidden;background:#fff;box-shadow:3px 3px 0 rgba(10,10,10,.08)}
.gallery-item img{width:100%;height:auto;display:block}
.gallery-item .caption{padding:4px 8px;font-size:10px;color:#666;font-weight:700;background:#f5f2ec;border-top:1.5px solid var(--line);letter-spacing:.04em}
```

### 7. Git add（不要只 add HTML，要把资产一起 add）
```bash
git add docs/<slug>.html assets/img/<slug>/   # 一起 add
git commit -m "feat: embed <slug> screenshots into infocard"
```

### 8. Push 后等待 Pages 重建
**新 push 的资产文件**在 GitHub API 里立即可见，但 **GitHub Pages 需要几分钟重建**，期间返回 404。

验收流程：
```bash
# 轮询 HTML 页面
for i in $(seq 1 12); do
  status=$(curl -sI "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | head -1)
  echo "[$i] $status"
  if echo "$status" | grep -q "200"; then break; fi
  sleep 10
done

# 验证每张图片
for img in head main-ui gallery1 gallery2; do
  status=$(curl -sI "https://ccwq.github.io/infocard-pub/assets/img/<slug>/$img.png" | head -1)
  echo "$img: $status"
done
```

## 关键陷阱

1. **中文文件名 URL 编码**：`CacheCloud功能架构.png` → 浏览器自动处理 URL 编码，无需额外转换；用 `curl -sI` 测试时可用 `%E5%8A%9F%E8%83%BD%E6%9E%B6%E6%9E%84` 验证。
2. **不要把所有截图都嵌入**：选 5–7 张最核心的，避免单卡过大。
3. **标注来源**：每个 screenshot-wrap 的 caption 要注明来源仓库，尊重开源协议。
4. **图片尺寸**：大图（>500KB）加 `loading="lazy"` 延迟加载，减少首屏阻塞。

## 实证案例

- **CacheCloud**（2026-07-09）：从 `sohutv/cachecloud` 仓库克隆，`static/img/readme/` 和 `function/` 目录中找到 cachecloud-head / cachecloud-info / 功能架构 / 系统结构 / 登录 / 部署 / 流程图共 7 张，嵌入 redswiss 风信息卡并通过 GitHub Pages 验收。
