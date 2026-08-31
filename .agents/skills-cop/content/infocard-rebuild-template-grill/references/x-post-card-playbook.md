# X / social-post infocard playbook

This reference captures the workflow learned from this session for high-density cards based on X posts.

## When to use
- The user provides an X/Twitter status URL and asks to create a publishable infocard.
- The post contains an image or screenshot that must be embedded in the card.
- The user prefers a denser card rather than a thin summary.

## Extraction workflow
1. Fetch post metadata with a JSON endpoint when possible.
   - Prefer the tweet JSON that exposes: author, handle, date, likes, replies, reposts, text, media URLs.
2. Treat the post image as first-class content.
   - Use vision analysis on the media URL or image file.
   - Describe the visible UI/details, metrics, and text inside the image.
3. Build the card with a high-density structure.
   - Core thesis
   - Key facts / metrics
   - Image breakdown
   - Why it matters
   - Audience / use case
4. If the post text is short, expand with:
   - author identity
   - engagement stats
   - image analysis
   - system / product interpretation
   - practical takeaways

## Density rules
- Do not stop at a short paraphrase when the user asks for a rich card.
- Preserve the embedded image in the final HTML when publishing.
- Use the image as evidence, not decoration.
- Keep the card legible on mobile while still packing in facts.

## Useful extraction patterns
- `api.vxtwitter.com/status/<tweet_id>` often exposes a JSON payload with text and media URLs.
- If JSON text is truncated, use the image and any available metadata to recover context.
- If the card is meant for publication, verify the final public URL after push.
