# Source-identity resolution for X recommendation cards

## Why this exists

An X post may recommend a tutorial through a personal-domain URL while a matching GitHub repository is discovered separately. The post, the website, the repository, and the upstream project are related evidence objects, not interchangeable identities.

## Evidence ladder

1. **Direct post evidence**: the readable X body, expanded URL, author, timestamp, media, and engagement snapshot.
2. **Media/OCR evidence**: chapter labels, product names, version markers, and visible URLs in the attached image. OCR is corroboration, not authoritative text.
3. **First-party tutorial evidence**: the recommended site and the maintainer's GitHub README/source.
4. **Upstream evidence**: the official project repository/docs used to verify architecture and boundaries.

## Safe resolution workflow

1. Extract the exact expanded link from the social post before searching broad candidates.
2. Fetch the linked page or its readable mirror and record its title, chapter/section identifiers, and author/maintainer signals.
3. Search for a first-party repository whose README and chapter structure match the linked page and image. Prefer an exact multi-signal match over popularity or search rank.
4. Verify the upstream project separately. Keep tutorial claims, upstream claims, and social claims in separate evidence rows.
5. If the match is materially stronger than alternatives, continue authoring and state the relationship as **“内容与 `<repo>` 教程体系高度一致/交叉匹配”**.
6. If two or more candidates remain materially plausible and would produce different card subjects, ask one focused question before authoring. If only the repository URL is uncertain but the subject is stable, do not block; preserve the URL/identity distinction in the card.

## Required wording boundaries

- Safe: “原帖推荐入口为 `<site>`；配图章节与 `<repo>` 教程体系高度一致。”
- Safe: “`<repo>` 是第三方学习/解读仓库，引用并拆解 `<upstream>`。”
- Unsafe: “原帖直接推荐 `<repo>`” when the post only contains `<site>`.
- Unsafe: “教程就是官方文档” or “教程作者与上游项目作者相同” without direct evidence.
- Unsafe: upgrading “生产级”“可上线”“可替代” from tutorial positioning into official guarantees.

## Closeout evidence

Record the social URL, expanded recommendation URL, matched repository, upstream URL, match signals, unresolved identity limits, and the exact public wording. This makes the boundary auditable without blocking a user-authorized release.
