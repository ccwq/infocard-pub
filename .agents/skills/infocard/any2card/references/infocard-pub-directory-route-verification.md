# infocard-pub 目录路由验收笔记

## 何时会遇到
当 `.meta.yaml` 中的 `path` 指向 `docs/{slug}/index.html` 这类目录页时，公开站点的可访问路由通常应按**目录 URL**验收，而不是只盯 `.html` 直链。

## 这次确认过的现象
- `https://ccwq.github.io/infocard-pub/docs/{slug}/` → 200
- `https://ccwq.github.io/infocard-pub/docs/{slug}/index.html` → 200
- `https://ccwq.github.io/infocard-pub/docs/{slug}.html` → 404
- 首页索引可通过 `_index.yaml` 和站点首页 DOM 搜索命中 `slug/title`

## 验收顺序
1. `curl -sI` 检查目录 URL 是否 200。
2. 再检查 `index.html` 是否 200，确认文件本体发布成功。
3. 用首页源码或浏览器搜索确认卡片被索引到首页。
4. 最后再看工作区是否 clean。

## 容易踩坑
- 不要把 `.html` 直链 404 误判成发布失败；对目录型卡片，真正面向用户的入口常常是目录 URL。
- 不要只验证文件存在，要验证**公开路由**和**首页索引**同时成立。
- 如果用户要的是“发布成功”，`_index.yaml` 命中和首页可见性必须一起交代。