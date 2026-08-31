# Local Asset Solidification Pattern

This pattern was established in Session 2026-05-31 when investigating the `ian-xiaohei-illustrations` repository.

## Problem
Information cards often reference external images (e.g., GitHub raw URLs, third-party hosting). These are prone to:
- Hotlink protection (403 errors)
- Broken links if the source repo is deleted/moved
- Privacy/tracking concerns
- Inconsistent loading in offline/restricted environments

## Solution: Solidification
Instead of hotlinking, download all external visual assets to a shared local directory and use relative paths.

### 1. Directory Structure
All shared assets belong in:
`docs/assets/images/`

### 2. Implementation Workflow
1. **Discovery**: Identify external image URLs in the content or target repo.
2. **Download**: Use `curl -L` or `wget` to save them locally.
   ```bash
   mkdir -p docs/assets/images/
   curl -L -o docs/assets/images/example.png https://.../image.png
   ```
3. **Reference**: In the info-card `index.html`, use a relative path.
   ```html
   <!-- If the card is at docs/YYYYMMDD-slug/index.html -->
   <img src="../../assets/images/example.png" alt="...">
   ```
4. **Bundle**: Commit the images along with the card and metadata.
   ```bash
   git add docs/assets/images/example.png docs/YYYYMMDD-slug/
   ```

## Example: Ian Xiaohei Illustrations
- **Source**: `https://github.com/helloianneo/ian-xiaohei-illustrations/raw/main/examples/images/03-one-fish-many-uses.png`
- **Local Path**: `docs/assets/images/03-one-fish-many-uses.png`
- **HTML Ref**: `../../assets/images/03-one-fish-many-uses.png`

## Benefits
- **Stability**: The card remains visually complete as long as the `infocard-pub` repo exists.
- **Performance**: Assets are served from the same CDN/domain as the HTML.
- **Compliance**: Adheres to the user's preference for local asset ownership.
