# Repo Course / Curriculum Card Pattern

Session-derived notes for repo cards that are structured as a course, curriculum, or learning path.

## What to treat as source of truth

- Treat the README lesson list / directory tree as the canonical curriculum, not the marketing headline.
- If the title says one count and the README lists another, surface the discrepancy explicitly in the card.
- Prefer the current README and lesson folders over stale repo descriptions or badges.

## What to emphasize in the card

- First fold: what the course teaches and why the sequence matters.
- Second: curriculum table or lesson grid with lesson number, topic, and takeaway.
- Third: environment / stack / setup path.
- Fourth: learning SOP: setup → first lesson → patterns → production / capstone.
- Fifth: suitability and quick-start shortcuts.

## Media / evidence

- If the repo exposes a cover image or thumbnail, localize it and use it as hero evidence.
- For course repos, a curriculum map is usually a better hero support than a generic logo.
- Use GitHub Contents API to download repo assets when available; preserve the original file extension.

## Practical checks

- Mention multilingual support if the repo explicitly provides it.
- Mention sparse checkout if the repo warns about large translation trees or heavy assets.
- Keep all body copy in Chinese for Chinese-reader cards; leave only repo names, framework names, and command tokens in English.
