# ChatGPT URL → Infocard Light-Route Reference

## When to use this reference

User provides a ChatGPT conversation URL (`chatgpt.com/c/<uuid>`) and asks to create an infocard from it. Triggered by the light-route in `infocard-authoring-workflow`.

## Verified workflow

### 1 · Open via `abc` (not raw CDP or browser_navigate)

```bash
# Check abc is alive and list existing tabs
abc --version
abc tab list 2>&1 | head -20

# Navigate to the ChatGPT URL
# If URL not in existing tabs, use --new-tab
abc navigate "https://chatgpt.com/c/<uuid>" --new-tab
# or use existing tab:
abc navigate "https://chatgpt.com/c/<uuid>" --tab t30
```

After navigate, the new tab appears in `abc tab list` output. The active tab becomes the navigated tab.

### 2 · Wait for content to load, then snapshot

```bash
# Give the page 2-3s to render, then get compact snapshot
sleep 3 && abc snapshot -i 2>&1 | head -80
```

Use `grep` to filter output types of interest:
```bash
abc snapshot -i 2>&1 | grep -E "(heading|cell|textbox)" | grep -v "heading \[level=4\]"
```

Table data appears as `<cell>` elements. Code blocks appear as `<textbox>` with `Edit code` labels. Section headings appear as `<heading level=2>` or `<heading level=3>`.

### 3 · Extract key content

From the snapshot, collect:
- Comparison table: all `<cell>` rows in sequence (table headers from `<columnheader>`)
- Code examples: `<textbox>` elements with `Edit code` labels
- Headings: `<heading level=N>` elements for section structure
- Conclusions/recommendations: highlighted cells or cells with special markers

### 4 · Build the infocard

Follow the standard hardblue/redswiss template decision from the skill. For tool comparison cards, hardblue is correct.

Key rules from this session:
- `slug` defaults to date-prefixed full name (e.g. `20260815-windows-search-tools`)
- `style: infocard-hardblue-style`
- `date: "YYYY-MM-DD HH:MM:SS"` (UTC, from `date -u +"%Y-%m-%d %H:%M:%S"`)
- `source: ChatGPT`
- `source_url`: the exact ChatGPT URL provided

### 5 · Visual verification

**Use `abc screenshot` for page capture** — it is more reliable than Chrome headless CLI in this environment:

```bash
abc screenshot
# Output: "Screenshot saved to /path/to/screenshot.png"
```

Then `vision_analyze` on the saved screenshot path.

Do NOT use `google-chrome --headless=new --screenshot=...` — it times out and hits NSS directory errors in this environment.

### 6 · Known limitations

- ChatGPT snapshot may not capture full long-scroll conversations; the last response may be partially visible
- Code block text in snapshots may be truncated or split across multiple `textbox` elements
- Multi-turn threads: only visible content in the current scroll position is captured; scroll down and snapshot again if needed
- `abc resize` command does not exist — mobile viewport testing requires alternative approach (currently skipped)
