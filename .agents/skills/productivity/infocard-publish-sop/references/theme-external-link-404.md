# 信息卡 CSS 内联门禁（2026-07-13 强制执行）

## 4. 主题外部引用 `/theme/*.html` 会 404（2026-07-13 教训）

**现象**：Card HTML 使用 `<link rel="stylesheet" href="/theme/redswiss.html">` 后，页面渲染为裸白底（CSS 完全未加载）。

**根因**：GitHub Pages 部署到 `ccwq.github.io/infocard-pub/`，HTML 中 `/theme/redswiss.html` 被浏览器解析为 `https://ccwq.github.io/theme/redswiss.html`（404），而不是 `https://ccwq.github.io/infocard-pub/theme/redswiss.html`。

**实测 Colibri 卡（2026-07-13）**：
- HTML 写入 `<link rel="stylesheet" href="/theme/redswiss.html">`
- `curl https://ccwq.github.io/infocard-pub/theme/redswiss.html` → HTTP 200
- 浏览器打开 HTML → 裸白底，浏览器 console `document.querySelector('link[rel="stylesheet"]').href` → `https://ccwq.github.io/theme/redswiss.html`（错误路径）
- 必须重建并内联 CSS 才恢复正常

## 强制门禁（每张卡生成后必检）

```bash
# 门禁：不得有任何外部 theme 引用
if grep -q 'stylesheet.*href="/theme' docs/<slug>.html; then
  echo "❌ FAIL: 外部 theme 引用存在，必须内联 CSS"
  exit 1
fi

# 门禁：必须有内联 style 块
if ! grep -q '<style>' docs/<slug>.html; then
  echo "❌ FAIL: 缺少内联 <style> 块"
  exit 1
fi

echo "✅ CSS 内联验证通过"
```

## 解法（生成时执行）

从 theme 文件提取内联，不使用外部 link：

```bash
# 提取 theme CSS 到本地文件
curl -s "https://ccwq.github.io/infocard-pub/theme/redswiss.html" | \
  python3 -c "
import re, sys
content = sys.stdin.read()
m = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if m: print(m.group(0))
" > /tmp/redswiss.css

# 验证提取成功
wc -c /tmp/redswiss.css
```

写入 HTML 时用 `<style>` 标签包裹，不写 `<link>` 标签。

**注意**：`theme/*.html` 仅作为开发参考文件，不作为生产引用。
