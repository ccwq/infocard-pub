# Redswiss header absorption pattern

This note captures the session where the `fact-store` card header was intentionally absorbed into `infocard-redswiss-style`.

## Pattern
- **Left hero block**: use a diagonal red→black gradient background.
- **Kicker**: white-outlined label at the top of the hero block.
- **Title**: compact, strong, headline-first, with line break support.
- **Subtitle**: one high-signal sentence directly under the title.
- **Right meta column**: stacked white pills on a pale background, each pill holding one fact (positioning, capability, config, etc.).
- **Mobile**: collapse to one column; meta column becomes a top border separated block.

## Why this matters
- A plain text-only top bar makes the first fold feel generic.
- Dense technical cards often need a stronger hero to communicate the card’s thesis immediately.
- The right-side meta pill stack is a good place for local-first / no-external-dependency positioning, core actions, and config surface.

## Pitfalls
- Do not keep a generic black badge-only top bar if the source material has a stronger visual thesis.
- Do not mix blue/yellow/green accent semantics into redswiss; keep the system strictly red/black/white.
- If the hero becomes too tall on mobile, reduce title size before reducing the number of meta pills.

## CSS token reference (2026-06-06 refinement)

```css
/* Header: 1.28fr / 0.72fr grid, diagonal hero */
.topbar {
  display: grid;
  grid-template-columns: 1.28fr .72fr;
  border-bottom: 3px solid var(--line);
  margin-bottom: 14px;
  overflow: hidden;
}
.topbar-hero {
  padding: 18px 18px 14px;
  background: linear-gradient(135deg, var(--red) 0%, #d92a45 58%, #111 58%, #111 100%);
  color: #fff;
}
.kicker {
  display: inline-block;
  border: 2px solid #fff;
  padding: 4px 8px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: 11px; /* ← compact */
}
h1.demo-title {
  margin: 10px 0 6px;
  font-size: clamp(20px, 3.2vw, 38px);
  font-weight: 800;
  letter-spacing: -.03em;
  line-height: 1.05;
}
.sub-line {
  font-size: 13px;
  line-height: 1.55;
  color: #fff8f8;
  margin: 6px 0 0;
  max-width: 52ch;
}
.tagline {
  display: inline-block;
  padding: 3px 8px;
  border: 2px solid #fff;
  background: var(--red);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-top: 8px;
}
.topbar-meta {
  padding: 16px;
  border-left: 3px solid var(--line);
  display: grid;
  gap: 8px;
  align-content: start;
  background: #f6f1f1;
}
.meta-pill {
  border: 2px solid var(--line);
  padding: 6px 10px;
  background: #fff;
  font-weight: 700;
  font-size: 11.5px;
}

/* Mobile @720px */
@media (max-width: 720px) {
  .topbar { grid-template-columns: 1fr; }
  .topbar-meta { border-left: 0; border-top: 3px solid var(--line); }
  h1.demo-title { font-size: clamp(18px, 6vw, 28px); }
}
```

## Reuse rule
When a redswiss card needs a stronger header, borrow the `fact_store` layout as the default absorption pattern:
`topbar-hero` (diagonal gradient + kicker + title + tagline) + `topbar-meta` (stacked pills).
