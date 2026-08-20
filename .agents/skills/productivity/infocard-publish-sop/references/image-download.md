# 图片下载参考

## 本会话实际下载记录

### Harness Engineering（pandatalk8.com）
- **图片数量**：17 张
- **URL 前缀**：`https://course-media.xlearnity.ai/pandatalk/`
- **文件命名**：1.jpg ~ 17.jpg（共 17 张）
- **大小范围**：26KB（1.jpg，工具调用循环图）~ 1MB（4.jpg，MCE 框架图）
- **格式**：PNG（非 JPEG，只是用 .jpg 扩展名保存）
- **下载方式**：分两批后台 `&` 并发下载，每批 8-9 个，最后 `wait`

### 下载陷阱记录

第一次下载（2026-07-11）失败：
```bash
# 错误：用 ~ 路径在 curl -o 中不展开
curl -sL "$BASE/$img" -o "~/infocard-pub/assets/img/.../$name" &
```
结果：0 文件写入，进程正常退出但文件为空/未创建。

**根因**：`~` 在某些 shell 链式调用（`&&` 或 `;` 分隔的复合命令）中不会由 bash 展开为 `$HOME`。

**修复**：始终使用绝对路径 `/home/ccwq/infocard-pub/...`。

## 图片验证命令

```bash
# 检查文件数量
ls assets/img/{slug}/ | wc -l

# 检查文件大小（排除小于 1KB 的失败下载）
find assets/img/{slug}/ -name '*.jpg' -size +1k | wc -l

# 验证 PNG magic bytes（89504e47 = .PNG）
for f in assets/img/{slug}/*.jpg; do
  bytes=$(xxd -l 3 -s 0 "$f" 2>/dev/null | awk '{print $2$3$4}')
  echo "$(basename $f): $bytes"
done
```

## 图片嵌入 HTML 的路径

信息卡 HTML 中的图片路径使用**相对路径**（相对于 `docs/` 目录）：
```html
<img src="../assets/img/pandatalk-self-improvement/4.jpg" alt="MCE Framework" loading="lazy" />
```

注意：`../assets/` 从 `docs/YYYYMMDD-slug.html` 向上跳一级到仓库根目录，再进入 `assets/img/`。
