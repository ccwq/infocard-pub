# Current-channel delivery + index rebase recovery

Session lesson: when taking over an interrupted infocard-pub release, do not treat the card page alone as success. The complete release lifecycle is: analysis → card creation/repair → publish → public card URL verification → `_index.yaml` verification → homepage/listing verification → final response in the current conversation channel.

## Delivery channel rule

- Return final results to the current channel/conversation where the user is asking.
- Do not redirect deliverables to WeChat/Telegram/enterprise WeChat unless the user explicitly asks for that platform.
- If a prior turn sent media to the wrong platform, correct it and call out the correction briefly.

## Homepage verification nuance

The homepage is client-rendered, so raw `curl https://ccwq.github.io/infocard-pub/` may not contain the card slug even when the browser UI shows it. Verify both layers:

1. `_index.yaml` contains the slug:
   ```bash
   curl -s "https://ccwq.github.io/infocard-pub/_index.yaml?t=$(date +%s)" | grep "<slug>"
   ```
2. Browser/DOM homepage shows the card link after JS fetches `_index.yaml`:
   ```js
   [...document.querySelectorAll('a')]
     .some(a => a.href.includes('<slug>') || a.innerText.includes('<title fragment>'))
   ```

A raw homepage HTML check is insufficient for client-rendered list entries.

## Missing index entry recovery

If a card HTML exists and the page returns 200, but `_index.yaml` does not include it, inspect the sidecar first. Every card sidecar must include at least:

```yaml
slug: YYYYMMDD-slug
path: docs/YYYYMMDD-slug.html
category: docs
title: Card Title
date: "YYYY-MM-DD"
tags: []
```

Legacy sidecars with only `title`/`desc`/`version`/`path` will not satisfy the index contract. Add `slug` and `category` before rebuilding the index.

## Rebase / conflict pattern with unrelated local changes

When the repo has unrelated dirty files, do not mix them into the infocard fix commit.

1. Stage and commit only the relevant sidecar/index files.
2. If `git pull --rebase` refuses because unrelated files are dirty, stash only those files:
   ```bash
   git stash push -m keep-unrelated-local docs/unrelated-file.html
   git pull --rebase
   ```
3. If `_index.yaml` conflicts during rebase, regenerate it from all valid `*.meta.yaml`, skipping legacy/no-slug entries, then continue:
   ```bash
   python3 scripts/rebuild-index.py || python3 - <<'PY'
   import glob, subprocess, yaml
   from datetime import datetime, timezone
   entries=[]
   for f in sorted(glob.glob('**/*.meta.yaml', recursive=True)):
       if '.git' in f: continue
       data=yaml.safe_load(open(f, encoding='utf-8'))
       if not isinstance(data, dict) or 'slug' not in data: continue
       data.setdefault('category','docs')
       try:
           ts=subprocess.check_output(['git','log','-1','--format=%ct','--',f], text=True).strip()
           data['_sort_ts']=int(ts) if ts else 0
       except Exception:
           data['_sort_ts']=0
       entries.append(data)
   index={'_count':len(entries),'_updated':datetime.now(timezone.utc).isoformat(),
          'cards':sorted(entries,key=lambda x:(x.get('_sort_ts',0),x.get('date','')), reverse=True)}
   yaml.safe_dump(index, open('_index.yaml','w',encoding='utf-8'), allow_unicode=True, sort_keys=False)
   PY
   git add _index.yaml docs/<slug>.html.meta.yaml
   GIT_EDITOR=true git rebase --continue
   ```
4. Restore the unrelated stash and leave it unstaged unless the user asked to include it.
5. Push the focused commit.

## Mobile sanity check for takeover tasks

For card pages involved in the release, a quick CDP/mobile check is enough before final response:

- page title is correct
- viewport disables zoom if that is the card standard
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- visible text begins with expected card content

Record the result in the final response only after homepage visibility is confirmed.