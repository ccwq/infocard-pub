# X Status / Twitter Post Content Extraction

## When to Use

When a user provides a Twitter/X post URL and asks to create an infocard, extract the full post content before building the card.

## Extraction Method (Browser Console, Preferred)

Navigate to the X post URL, then run in browser console:

```js
var arts = document.querySelectorAll('article');
var results = [];
arts.forEach(function(a){
  var txt = a.innerText || '';
  results.push({idx:results.length, len:txt.length, preview:txt.substring(0,200)});
});
JSON.stringify(results);
```

Pick the article with the longest `len` — that's the main post content. Then extract full text:

```js
var arts = document.querySelectorAll('article');
arts[0].innerText;  // or arts[index with max len]
```

## API Fallback: fxtwitter (Preferred API)

When browser extraction is blocked (login wall, rate limit), use `api.fxtwitter.com`:

```bash
curl -s "https://api.fxtwitter.com/status/{id}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
t = d.get('tweet', {})
print('text:', t.get('text'))
print('likes:', t.get('likes'))
print('retweets:', t.get('retweets'))
print('views:', t.get('views'))
print('media:', json.dumps(t.get('media', {}), indent=2, ensure_ascii=False)[:1000])
"
```

Key advantages over vxtwitter:
- Complete untruncated text (vxtwitter truncates at ~100 chars for long posts)
- `raw_text.facets` resolves t.co short links to full URLs — critical for tool-list posts
- Returns engagement stats (likes/retweets/replies/views) in one call
- vxtwitter can return HTML redirect page instead of JSON when it fails

## Why This Over API

- `innerText` from rendered DOM gets complete post + comments + quoted tweet
- Works regardless of login state in the browser session
- Includes engagement numbers (replies, reposts, likes, views) from the rendered UI
- API fallback (`api.fxtwitter.com`) also works well when browser is blocked — see API section above

## Supplementary: Get Engagement Stats

```js
var arts = document.querySelectorAll('article');
var txt = arts[0].innerText;
// Stats are in the "group" element or as plain text in the article
// Pattern: lines with numbers followed by 回复/转帖/喜欢/观看
```

## Supplementary: Get Images

```js
var imgs = document.querySelectorAll('img');
var results = [];
for (var i=0; i<imgs.length; i++) {
  var src = imgs[i].src;
  if (!src.includes('profile') && !src.includes('emoji') && !src.includes('icon')) {
    results.push({src: src, alt: imgs[i].alt, w: imgs[i].naturalWidth, h: imgs[i].naturalHeight});
  }
}
JSON.stringify(results);
```

Filter out profile pictures, emoji images, and UI icons — keep only post images.

## Handling Long Threads

For thread posts, the main article contains the full thread text. Comments/replies appear in separate article elements. The first article (longest `len`) is the primary content.

## Post-Processing

After extraction, structure the content into:
- Title (from first line or main claim)
- Author (@handle + display name)
- Engagement (views / likes / reposts / replies)
- Key points (bulleted from the post body)
- Links (GitHub repo URLs, article links)
- Source URL (the X post URL)

Then build the infocard using the appropriate style skill.