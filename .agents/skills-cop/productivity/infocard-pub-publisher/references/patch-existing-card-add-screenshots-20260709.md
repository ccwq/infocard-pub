# Patch Existing Card: Add Screenshots / Content Mid-Session

## 触发场景

用户已有已发布的卡片，后来要求追加截图/图片/内容。典型信号：
- "把 xxx 的截图也加进去"
- "图片也放入信息卡"
- 已发布卡片文件存在于 `docs/` 目录，需要修改

## 完整流程

```
1. 克隆/下载图片到 assets/img/<project>/
   cp /tmp/repo/assets/images/*.png ~/infocard-pub/assets/img/<project>/

2. Patch HTML（不要重建整个卡！）
   - 用 <img> 嵌入图片，src 指向 assets/ 相对路径
   - 保留原有 CSS / 主题不变
   - 避免 rewrite 整卡（容易引入风格漂移）

3. npm run build

4. git add + commit + push
   git commit -m "feat: embed screenshots into <card-name> infocard"

5. 等待 GitHub Pages 部署（10-30s）

6. 验收：curl 关键词 200 + 图片 200
   curl -sI "https://ccwq.github.io/infocard-pub/assets/img/<project>/xxx.png" | head -1

7. Wiki 更新（如需要）
```

## 图片验收命令（批量）

```bash
for img in img1 img2 img3; do
  status=$(curl -sI "https://ccwq.github.io/infocard-pub/assets/img/<project>/$img.png" | head -1)
  echo "$img: $status"
done
```

## 关键约束

- 不要换主题/重建——patch 现有 HTML 即可
- 图片 src 使用 `../assets/img/<project>/xxx.png`（相对于 docs/ 目录）
- meta.yaml 无需改动（不变更内容元数据）
- commit message 明确标注 patch 内容，不要泛泛写 "fix"

## 实测案例（2026-07-09）

- CacheCloud 信息卡追加 7 张截图：patch HTML hero + overview + gallery 区块 → npm run build → push → 全部 200 OK
