# Showcase Section — 2-Col Image Grid Pattern

## Pattern Name
`showcase-grid` — used for GitHub repo cards where UI screenshots are the primary evidence.

## When to Use
- GitHub repo with admin/management UI screenshots
- Product showcase with multiple interface images
- Any infocard where images are the primary content differentiation

## HTML Structure

```html
<div class="showcase-grid">
  <div class="showcase-item">
    <div class="showcase-img-wrap">
      <img src="..." alt="..." loading="lazy" />
    </div>
    <div class="showcase-body">
      <div class="showcase-name">English Name / 中文名</div>
      <div class="showcase-meta">Category · Sub-label</div>
      <div class="showcase-desc">Description text.</div>
    </div>
  </div>
</div>
```

## CSS

```css
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .55rem;
}
.showcase-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
  overflow: hidden;
}
.showcase-img-wrap {
  overflow: hidden;
  border-bottom: 1px solid var(--border);
}
.showcase-img-wrap img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform .3s;
}
.showcase-item:hover .showcase-img-wrap img {
  transform: scale(1.03);
}
.showcase-body {
  padding: .5rem .55rem;
}
.showcase-name {
  font-size: .7rem;
  font-weight: 900;
  color: var(--black);
  margin-bottom: .2rem;
}
.showcase-meta {
  font-size: .58rem;
  color: var(--red);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: .3rem;
}
.showcase-desc {
  font-size: .65rem;
  color: var(--muted);
  line-height: 1.55;
}
```

## Mobile Override

```css
@media (max-width: 720px) {
  .showcase-grid { grid-template-columns: 1fr; }
}
```

## Naming Convention for Images
Downloaded images should use descriptive English names:
- `admin.png` (management UI)
- `agent.png` (agent management panel)
- `dashboard.png`
- `settings.png`

NOT `image1.png`, `screenshot_001.png`, etc.

## Example: FastClaw Card

| Image | alt text | Name | Meta |
|-------|----------|------|------|
| admin.png | Platform Admin Dashboard | Platform Admin / 平台管理 | Dashboard · 管理员 |
| agent.png | Per-Agent Management | Per-Agent Management / 单 Agent 管理 | Dashboard · Agent Owner |