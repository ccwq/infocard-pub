# infocard-pub PWA 安装后打开 404：根因与修复

## 症状
- 用户反馈：PWA 可以安装
- 但安装后从桌面图标打开显示 404
- 浏览器直接访问站点首页正常

## 根因
正式安装入口使用了 `docs/manifest.json`，且 manifest 中写的是：

```json
{
  "start_url": "./",
  "scope": "./"
}
```

manifest 的相对路径是**相对 manifest 自身位置**解析的，不是相对首页 HTML。

因此：
- manifest URL = `https://ccwq.github.io/infocard-pub/docs/manifest.json`
- `start_url: "./"` 会解析成 `https://ccwq.github.io/infocard-pub/docs/`

结果：PWA 安装后实际打开的是 `/infocard-pub/docs/`，不是 `/infocard-pub/`。

## 二次放大问题
如果 `sw.js` 也放在 `docs/`，那么默认 scope 只能覆盖 `/docs/`，整个 PWA 的结构就会围绕错误子目录展开。

## 正确修复
### 方案 A（推荐）
把正式安装入口迁到仓库根目录：
- `manifest.json` 放根目录
- `sw.js` 放根目录
- `index.html` 引用根目录 manifest / sw
- manifest 使用绝对路径：

```json
{
  "id": "/infocard-pub/",
  "start_url": "/infocard-pub/",
  "scope": "/infocard-pub/"
}
```

### 方案 B（兜底兼容）
如果历史上已经有人安装过旧版，新增 `docs/index.html`：

```html
<meta http-equiv="refresh" content="0; url=../">
<script>location.replace('../');</script>
```

这样旧安装即使还打开 `/docs/`，也会自动跳回首页。

## 验证方法
### 验证解析基准
```python
from urllib.parse import urljoin
print(urljoin('https://ccwq.github.io/infocard-pub/docs/manifest.json','./'))
# -> https://ccwq.github.io/infocard-pub/docs/
```

### 验证线上状态
```bash
curl -sI https://ccwq.github.io/infocard-pub/ | head -2
curl -sI https://ccwq.github.io/infocard-pub/docs/ | head -5
curl -s https://ccwq.github.io/infocard-pub/manifest.json
curl -s https://ccwq.github.io/infocard-pub/docs/ | head -12
```

预期：
- `/infocard-pub/` 返回 200
- `/infocard-pub/docs/` 返回 200，且内容是自动跳转页
- 根目录 manifest 的 `start_url/scope/id` 都指向 `/infocard-pub/`

## 结论
“能安装但打开 404” 在 GitHub Pages 子路径站点里，优先排查：
1. manifest 是否放错目录
2. `start_url/scope` 是否用相对路径导致解析到错误子目录
3. sw.js 是否也被放到子目录导致 scope 错位
4. 是否需要为历史安装增加 `/docs/` 跳转兜底
