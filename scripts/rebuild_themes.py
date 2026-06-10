#!/usr/bin/env python3
"""从 _themes.yaml 重建 themes.html

用法：python3 scripts/rebuild_themes.py
"""
import pathlib
import textwrap

SRC = pathlib.Path('_themes.yaml')
OUT = pathlib.Path('themes.html')


def kw_to_style(kw):
    if not kw:
        return ''
    for prefix, css in [
        ('#', 'background:'),
        ('黑头', 'background:#111;color:#fff'),
        ('蓝流程', 'background:#e8f1ff'),
        ('红判断', 'background:#fde9eb'),
    ]:
        if kw.startswith(prefix):
            return f'style="{css}"'
    return ''


def render_themes_yaml(text):
    import yaml
    data = yaml.safe_load(text)
    return sorted(data.get('themes', []), key=lambda t: t.get('position', 99))


def build_swatch(swatch):
    return '\n          '.join(
        f'<div class="sw" style="background:{hex_color}"></div>'
        for hex_color in swatch
    )


def build_keywords(keywords):
    return '\n          '.join(
        f'<span {kw_to_style(kw)}>{kw}</span>' for kw in keywords
    )


def build_ref_links(ref_links):
    return '\n          '.join(
        f'<a href="{ref["href"]}" target="_blank">{ref["title"]}<small>{ref.get("note", "")}</small></a>'
        for ref in ref_links
    )


def build_iframe(t):
    url = t.get('preview_url', '')
    if not url:
        return ''
    slug = t.get('slug', 'preview')
    return (
        f'<div class="preview-wrap" id="wrap-{slug}">'
        f'<iframe src="{url}" loading="lazy" title="{t["title"]}" '
        f'class="preview-iframe" id="frame-{slug}" referrerpolicy="no-referrer"></iframe>'
        f'</div>'
    )


def build_theme_block(t):
    swatch = build_swatch(t.get('swatch', []))
    keywords = build_keywords(t.get('keywords', []))
    ref_links = build_ref_links(t.get('ref_links', []))
    iframe = build_iframe(t)
    return textwrap.dedent(f'''\
      <article class="theme {t['css_class']}">
        <div class="theme-head">
          <div>
            <h2 class="theme-name">{t['title']}</h2>
            <p class="theme-sub">{t['subtitle']}</p>
          </div>
          <span class="pill">{t['pill']}</span>
        </div>
        <div class="theme-body">
          <p class="desc">{t['description']}</p>
          <div class="chips">{keywords}</div>
          <div class="swatch">{swatch}</div>
          {iframe}
          <div class="samples">{ref_links}</div>
        </div>
        <div class="note">{t.get('note', '')}</div>
      </article>
    ''')


def render_themes_list(themes):
    return '\n    '.join(build_theme_block(t) for t in themes)


def render_themes_toc(themes):
    items = []
    for t in themes:
        name = t.get('title', t.get('slug', ''))
        desc = t.get('subtitle', '')
        items.append(
            f'<li>'
            f'<button class="theme-copy" type="button" data-copy-theme="{name}" '
            f'title="单击复制 {name}">'
            f'<span class="theme-copy-name">{name}</span>'
            f'<span class="theme-copy-desc">：{desc}。</span>'
            f'</button>'
            f'</li>'
        )
    return '\n          '.join(items)


def render(keywords_escaped, themes_html, themes_toc_html=''):
    template = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#C8102E">
  <meta name="description" content="infocard 主题页：集中展示主题名称、定位、视觉特征与参考页面。独立于首页索引与 docs。">
  <title>infocard 主题页</title>
  <style>
    :root{--bg:#f3f0ea;--paper:#fffdf9;--ink:#101010;--muted:#625d56;--line:#111;--shadow:8px 8px 0 rgba(16,16,16,.12);--q-paper:#f8efd9}
    *{box-sizing:border-box} html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;overflow-x:hidden}
    a{color:inherit} code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
    .page{width:min(1160px,calc(100% - 24px));margin:0 auto;padding:18px 0 60px}
    .hero{background:#0a0a0a;color:#fff;border:2px solid #0a0a0a;padding:18px 18px 16px;box-shadow:var(--shadow)}
    .kicker{display:inline-block;padding:4px 8px;border:1.5px solid #fff;background:#111;font:700 11px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase}
    .hero h1{margin:12px 0 8px;font-size:clamp(28px,5vw,56px);line-height:.98;letter-spacing:-.03em}
    .hero p{margin:0;max-width:900px;color:#ece8e1;font-size:15px;line-height:1.65}
    .topbar{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-top:14px}
    .topbar .actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .topbar .meta{font:600 12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#d7d0c8}
    .jump{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:2px solid var(--line);background:#fff;text-decoration:none;font:700 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:4px 4px 0 rgba(16,16,16,.12)}
    .intro{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;margin:16px 0 18px}
    .panel{background:var(--paper);border:2px solid var(--line);padding:14px 14px 12px;box-shadow:var(--shadow)}
    .panel h2{margin:0 0 10px;font-size:20px;line-height:1.1}
    .panel p,.panel li{font-size:14px;line-height:1.62;color:var(--muted)}
    .panel ul{margin:0;padding-left:18px}
    .panel .copy-hint{margin:0 0 10px;font-size:12px;line-height:1.55;color:#7a736a}
    .theme-copy{display:block;width:100%;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .theme-copy-name{font-weight:800;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:2px;text-decoration-color:rgba(16,16,16,.28)}
    .theme-copy:hover .theme-copy-name,.theme-copy:focus-visible .theme-copy-name{text-decoration-color:var(--ink)}
    .theme-copy-desc{color:var(--muted)}
    .themes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .theme{background:var(--paper);border:2px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column;min-width:0}
    .theme-head{padding:14px 14px 10px;border-bottom:2px solid var(--line);display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
    .theme-name{margin:0;font-size:25px;line-height:1.02;letter-spacing:-.03em;overflow-wrap:anywhere}
    .theme-sub{margin:6px 0 0;font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
    .pill{display:inline-block;padding:5px 8px;border:1.5px solid var(--line);font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;background:#fff;white-space:nowrap}
    .theme-body{padding:14px;display:grid;gap:12px}
    .desc{font-size:14.5px;line-height:1.7;margin:0}
    .chips{display:flex;flex-wrap:wrap;gap:8px}
    .chips span{padding:6px 8px;border:1.5px solid var(--line);font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;background:#fff}
    .samples{display:grid;gap:8px}
    .samples a{display:block;padding:10px 12px;border:1.5px solid var(--line);background:#fff;text-decoration:none;font-size:13px;line-height:1.5;overflow-wrap:anywhere}
    .samples a small{display:block;margin-top:4px;color:var(--muted);font-size:11px}
    .swatch{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
    .sw{height:24px;border:1.5px solid var(--line)}
    .preview-wrap{overflow:hidden;border:2px solid var(--line);position:relative;grid-column:1/-1}
    .preview-iframe{width:100%;height:400px;border:none;display:block;min-height:400px;scrolling:auto}
    .note{padding:12px 14px;border-top:2px solid var(--line);background:#faf7f1;font-size:12.5px;line-height:1.65;color:var(--muted)}
    footer{margin-top:18px;padding:12px 14px;border:2px solid var(--line);background:#fff;font-size:12.5px;line-height:1.7;color:var(--muted);box-shadow:var(--shadow)}
    @media (max-width:880px){.intro,.themes{grid-template-columns:1fr}}
    @media (max-width:720px){.page{width:min(100%,calc(100% - 14px));padding:10px 0 44px}.hero{padding:14px 12px 12px}.topbar{flex-direction:column;align-items:flex-start}.theme-name{font-size:22px}.desc{font-size:14px}}
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <span class="kicker">infocard themes</span>
      <h1>infocard 主题页</h1>
      <p>这是独立维护的主题说明页：不进入首页索引，不放进 <code>docs/</code>，但可直接公网访问。它集中展示当前正式主题的名称、定位、视觉特征与参考页面，作为后续选主题与维护命名体系的总入口。</p>
      <div class="topbar"><div class="meta">独立页 / 不写 sidecar / 不参与 <code>_index.yaml</code> / 直接发布于仓库根目录</div><div class="actions"><a class="jump" href="#theme-toc">选择主题</a><a class="jump" href="./" target="_self">返回信息卡首页</a></div></div>
    </section>
    <section class="intro">
      <article class="panel" id="theme-toc"><h2>当前正式主题</h2><p class="copy-hint">点击主题名即可复制，方便在新卡、文档或提示词里直接切换主题。</p>
        <ul>
          __THEMES_TOC__
        </ul>
      </article>
      <article class="panel"><h2>命名规则</h2><p>主题统一采用 <code>infocard-***-style</code> 命名，不再把 <code>swiss</code> 放进技能名里。页面层面的瑞士风格、黑头结构、技术手册骨架，属于主题特征，不再写进顶层命名。</p></article>
    </section>
    <section class="themes">
__THEMES__
    </section>
    <footer>维护原则：修改主题请编辑 <code>_themes.yaml</code>，然后运行 <code>python3 scripts/rebuild_themes.py</code> 重建本页面；若主题新增或改名，还应同步更新对应 Skill 与 fact_store。本页不写 sidecar，不进入 <code>_index.yaml</code>，但通过 GitHub Pages 正常公开访问。</footer>
  </main>
  <script>
    (function() {
      var toc = document.getElementById('theme-toc');
      if (toc) {
        toc.addEventListener('click', async function(e) {
          var btn = e.target.closest('[data-copy-theme]');
          if (!btn) return;
          var text = btn.getAttribute('data-copy-theme');
          try {
            await navigator.clipboard.writeText(text);
          } catch (err) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', 'readonly');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          btn.dataset.copied = '1';
          clearTimeout(btn._copyTimer);
          btn._copyTimer = setTimeout(function() { delete btn.dataset.copied; }, 900);
        });
      }

      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'theme-height') {
          var slug = e.data.slug;
          var h = e.data.height;
          var wrap = document.getElementById('wrap-' + slug);
          var frame = document.getElementById('frame-' + slug);
          if (wrap && h > 0) {
            wrap.style.height = h + 'px';
            frame.style.height = h + 'px';
          }
        }
      });
      function tryDirectHeight() {
        document.querySelectorAll('.preview-iframe').forEach(function(frame) {
          try {
            var doc = frame.contentDocument || frame.contentWindow && frame.contentWindow.document;
            if (doc && doc.body) {
              var h = doc.body.scrollHeight;
              var slug = frame.id.replace('frame-', '');
              var wrap = document.getElementById('wrap-' + slug);
              if (wrap && h > 0) {
                wrap.style.height = h + 'px';
                frame.style.height = h + 'px';
              }
            }
          } catch(ex) {}
        });
      }
      document.addEventListener('DOMContentLoaded', tryDirectHeight);
      setTimeout(tryDirectHeight, 800);
      setTimeout(tryDirectHeight, 2000);
    })();
  </script>
</body>
</html>"""
    return template.replace('__THEMES__', themes_html).replace('__THEMES_TOC__', themes_toc_html)


def main():
    text = SRC.read_text()
    themes = render_themes_yaml(text)
    keywords_escaped = ''  # rendered server-side
    themes_html = render_themes_list(themes)
    themes_toc_html = render_themes_toc(themes)
    html = render(keywords_escaped, themes_html, themes_toc_html)
    OUT.write_text(html, encoding='utf-8')
    print(f'Written {OUT} with {len(themes)} themes')


if __name__ == '__main__':
    main()
