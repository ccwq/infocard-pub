# infocard-pub PWA 版本可见性与缓存规避

适用场景：
- 用户要求“每次修改都要能看到变化”
- GitHub Pages + Service Worker + 浏览器缓存叠加，导致用户以为部署未生效
- PWA 安装或升级后，旧版本内容顽固停留

## 核心做法

1. 在页面上放置显眼版本号（footer 或顶部版本条）
2. 把版本信息抽到 `docs/version.json`
3. 页面读取 `version.json` 时加时间戳查询串并使用 `cache: 'no-store'`
4. Service Worker 不预缓存 `version.json`
5. 若已错误缓存过 `version.json`，升级 `CACHE_NAME`

## 推荐代码

```js
const verEl = document.getElementById('ver');
if (verEl) {
  const versionUrl = `./docs/version.json?t=${Date.now()}`;
  fetch(versionUrl, { cache: 'no-store' })
    .then(r => r.json())
    .then(d => { verEl.textContent = d.version; })
    .catch(() => { verEl.textContent = 'v?'; });
}
```

## 验证要点

### 1) 验证版本文件线上是否已更新
```bash
curl -s https://ccwq.github.io/infocard-pub/docs/version.json
```

### 2) 验证页面源码是否已带防缓存逻辑
```bash
curl -s https://ccwq.github.io/infocard-pub/index.html | grep -A6 "Load version"
```

### 3) 认清 curl 与真实渲染的区别
`curl` 只能看到 HTML 初始占位符，例如：
```html
<span id="ver">加载中…</span>
```
这不代表失败。版本号是浏览器执行 JS 后再写入 DOM 的。

## PWA / manifest 相关补充

### 图标陷阱
- `icon-512.png` 若写进 manifest，文件必须真实存在，否则安装时报 404
- 只想用 SVG 时，保留：
```json
{ "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" }
```
- 不要伪造 SVG 的 `512x512 maskable` 条目

### 路径陷阱
- 资源文件放在 `docs/` 下时：
  - `index.html` 引用必须写 `./docs/manifest.json` / `./docs/icon.svg` / `./docs/sw.js`
- 但 `manifest.json` 内部的 `src: "icon.svg"` 是相对 manifest 文件本身解析，因此正确指向 `docs/icon.svg`

## 经验结论

如果目标是“让用户一眼看到改动已上线”，**版本号可见化 + 版本请求防缓存** 比单纯依赖部署成功提示更可靠。
