# Fresh publish fallback notes

Session-specific detail for infocard publishing when a user asks to read a process file plus manifest.json.

- If the requested process file is missing, do not block. Search for a nearby cache/readme file with the project name (for this session, `/tmp/fresh-readme.md`) and continue with that plus the manifest.
- Treat `assets/img/<slug>/manifest.json` as the authoritative local asset ledger when present. Use it to confirm image paths, source URLs, and captions before writing HTML.
- If the user explicitly forbids build / verify / commit / push, stop after writing the HTML and meta files and report the artifact paths only.
- For redswiss cards, keep the hero concise and make the README preview or key image asset visible if available.
- Prefer absolute local asset paths in HTML (`/infocard-pub/assets/img/...`) rather than remote raw URLs when the file is already cached locally.
