# Visual Skill Repository Investigation and Gallery Integration

Notes derived from the investigation of visual-generation repositories (e.g., `ian-xiaohei-illustrations`).

## Repository Investigation Patterns
When the target is a visual IP or illustration-focused Codex Skill:
1. **Identify the "Visual DNA"**: Extract the core rules (e.g., 16:9, hand-drawn, specific character IP, white background, accent colors).
2. **IP Characterization**: Define the character/mascot not just as a visual but as an "actor" in the system (e.g., "The Little Black Man is an absurd worker participating in the system").
3. **Capture Metaphors/Concepts**: List the symbolic examples provided (e.g., "Idea Press", "Trust Bridge").
4. **Identify the Ingest-to-Visual Workflow**: How does the skill process text into a "Shot List" or visual plan.

## Information Card Gallery Layout
For repositories that provide visual examples, integrate them into the info card using a **Gallery** module.

### HTML/CSS Pattern
```html
<section class="section">
  <div class="section-hd"><h2 class="section-title">示例效果图</h2><div class="section-tag">gallery</div></div>
  <div class="gallery">
    <div class="img-card">
      <img src="..." alt="Example 1">
      <div class="img-label">Description of Example 1</div>
    </div>
    <!-- ... more cards ... -->
  </div>
</section>
```

### CSS Guidelines
- **Grid**: Use `grid-template-columns: 1fr 1fr` for desktop/tablet and `1fr` for small mobile screens.
- **Card Styling**: Add a thin border or soft shadow to separate images from the white background if the images themselves are white-heavy.
- **Labels**: Use small, bold, centered captions (`.img-label`) to explain the metaphor or structural type shown.

## Best Practices
- **Respect Aspect Ratio**: Always use the repository's native aspect ratio (e.g., 16:9) in the layout.
- **Include Meta-Labels**: Annotate each image with its "Metaphor Name" or "Structural Type" to reinforce the cognitive value of the skill.
- **Source Direct Links**: Use `raw.githubusercontent.com` or the main repo raw image links to ensure high-resolution rendering inside the card.
