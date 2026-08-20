# CDP Screenshot 交付给用户（2026-07-14）

## 问题

`browser_vision` 工具的 `screenshot_path` 返回值是浏览器 CDP supervisor 内存中的路径，不是真实文件系统路径。文件不存在于磁盘，无法直接通过 `MEDIA:` 交付给用户。

```
browser_vision 返回: screenshot_path="/home/ccwq/.../browser_screenshot_xxx.png"
实际文件: 不存在（工具内部持有，MEDIA: 无法访问）
```

## 正确流程：Page.captureScreenshot → 保存文件 → MEDIA: 交付

### Step 1：获取 Tab ID
```javascript
browser_cdp(method='Target.getTargets', params={})
// 找到 type="page" 且 title 含目标卡名的 targetId（如 8B9D1362...）
```

### Step 2：截图（返回 base64）
```javascript
browser_cdp(
  method='Page.captureScreenshot',
  params={'captureBeyondViewport': true, 'format': 'png'},
  target_id='<上面找到的targetId>',
  timeout=60
)
// 返回 {"success": true, "method": "...", "result": {"data": "iVBORw0KGgo..."}}
```

### Step 3：解码保存
```python
import base64
with open('/tmp/hermes-results/call_function_xxx.txt') as f:
    raw = f.read()  # 完整工具输出
# 从原始输出文件中提取 data 字段
start = raw.find('"data":"') + 8
end = raw.find('"}}', start)
img_data = base64.b64decode(raw[start:end])
with open('/tmp/card.png', 'wb') as f:
    f.write(img_data)
```

### Step 4：交付
```
MEDIA:/tmp/card.png
```

## 备选：browser_vision 只做分析，不做交付

`browser_vision` 的 `screenshot_path` 只对 Hermes 内部工具链有意义。**不要**向用户承诺"截图路径 = 可用路径"。分析用 `browser_vision`，交付用上面的 base64 流程。

## 已知限制

- `Page.captureScreenshot` 在某些 CDP 版本中不存在（如某些 Browserbase 配置），此时工具返回 `{'code': -32601, 'message': "'Page.captureScreenshot' wasn't found"}`。
- `captureBeyondViewport: true` 可能超时（30s），设 `timeout=60`。
- tab 必须是 `type="page"`，iframe（`type="iframe"`）不支持截图。
