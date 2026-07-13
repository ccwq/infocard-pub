'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const ROOT = path.resolve(__dirname, '../..');
const MODULE = path.join(ROOT, 'scripts/verify-local-assets.js');
const roots = new Set();
test.afterEach(() => { for (const root of roots) fs.rmSync(root, { recursive: true, force: true }); roots.clear(); });
function fixture(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'local-assets-')); roots.add(root);
  const bundle = { slug:'asset-card', html_path:'docs/20260711-asset-card.html', meta_path:'docs/20260711-asset-card.html.meta.yaml', asset_dir:'assets/img/asset-card', manifest_path:'assets/img/asset-card/manifest.json', source_url:'https://github.com/acme/asset-card', style:'darkblue', category:'开发工具', keywords:['asset'], wiki:{raw_path:'raw/a.md',knowledge_path:'concepts/a.md'} };
  fs.mkdirSync(path.join(root, '.tmp/infocard', bundle.slug), {recursive:true}); fs.mkdirSync(path.join(root, 'docs'), {recursive:true}); fs.mkdirSync(path.join(root, bundle.asset_dir), {recursive:true});
  const files = options.files || {'hero.png':Buffer.from('png'), 'diagram.webp':Buffer.from('webp'), 'bg.svg':Buffer.from('<svg/>')};
  for (const [name, data] of Object.entries(files)) { const target=path.join(root,bundle.asset_dir,name); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,data); }
  const manifest = options.manifest || {assets:[{local_path:'hero.png',required:true},{local_path:'diagram.webp',embed:true},{local_path:'bg.svg'}]};
  const html = options.html === undefined ? `<img src="../assets/img/asset-card/hero.png?v=1#x"><img srcset="../assets/img/asset-card/diagram.webp 1x, data:image/png;base64,AAAA 2x"><style>.x{background:url('../assets/img/asset-card/bg.svg')}</style>` : options.html;
  fs.writeFileSync(path.join(root,'bundle.json'),JSON.stringify(bundle)); fs.writeFileSync(path.join(root,bundle.manifest_path),JSON.stringify(manifest)); fs.writeFileSync(path.join(root,bundle.html_path),html);
  return {root,bundle};
}
function verify(f){ delete require.cache[require.resolve(MODULE)]; return require(MODULE).verifyLocalAssets(f.bundle,f.root); }
test('accepts src, srcset, CSS url, data URLs, query/hash and default manifest embed requirement',()=>{ assert.deepEqual(verify(fixture()),{valid:true,errors:[],references:['assets/img/asset-card/bg.svg','assets/img/asset-card/diagram.webp','assets/img/asset-card/hero.png']}); });
test('rejects remote raw/http/protocol-relative resource references but ignores plain text and navigation links',()=>{
 for(const url of ['http://example.com/a.png','https://raw.githubusercontent.com/a/b/x.png','//media.githubusercontent.com/x.png','https:&#47;&#47;raw.githubusercontent.com/a/b/x.gif']){
  const f=fixture({html:`<img src="${url}"><p>https://raw.githubusercontent.com/text/only.png</p><a href="http://example.com/page">nav</a>`}); const r=verify(f); assert.equal(r.valid,false,url); assert.ok(r.errors.some(e=>e.field==='references'));
 }
 const safe=fixture({html:'<p>http://example.com/a.png raw.githubusercontent.com/a/b.png</p><a href="http://example.com/a.png">navigation</a><img src="data:image/png;base64,AAAA"><a href="#top">top</a>',manifest:{assets:[]}}); assert.equal(verify(safe).valid,true);
});
test('rejects network schemes in every resource-bearing HTML and CSS context',()=>{
 const cases=[
  '<img src="https://evil.test/x.png">','<img src="https&colon;//evil.test/x.png">',
  '<svg><image href="https://evil.test/x.svg"/><use xlink:href="//evil.test/x.svg#x"/></svg>',
  '<object data="https://evil.test/x"></object>','<embed src="ftp://evil.test/x">','<iframe src="ws://evil.test/x"></iframe>',
  '<link rel=stylesheet href="https://evil.test/x.css">','<link rel=icon href="//evil.test/x.ico">','<script src="https://evil.test/x.js"></script>',
  '<audio src="https://evil.test/x.mp3"></audio>','<video poster="https://evil.test/x.jpg"><source srcset="https://evil.test/x.mp4 1x"><track src="https://evil.test/x.vtt"></video>',
  '<input type=image src="https://evil.test/x.png">','<style>@import "https://evil.test/x.css";x{background:url(https://evil.test/x.png)}</style>',
  '<div style="background:url(\\68 ttps://evil.test/x.png)"></div>'
 ];
 for(const html of cases){const r=verify(fixture({html,manifest:{assets:[]}}));assert.equal(r.valid,false,html);assert.ok(r.errors.some(e=>e.field==='references'),html);}
});
test('rejects traversal, encoded traversal, outside asset_dir malformed URL encoding',()=>{
 for(const ref of ['../outside.png','../assets/img/other/x.png','../assets/img/asset-card/%2e%2e/escape.png','../assets/img/asset-card/%E0%A4%A']){ const f=fixture({html:`<img src="${ref}">`,manifest:{assets:[]}}); const r=verify(f); assert.equal(r.valid,false,ref); assert.ok(r.errors.some(e=>e.field==='references')); }
});
test('rejects missing directories zero-byte and symlinks escaping repository/asset directory',(t)=>{
 for(const [name,setup] of [['missing.png',()=>{}],['empty.png',f=>fs.writeFileSync(path.join(f.root,f.bundle.asset_dir,'empty.png'),Buffer.alloc(0))],['dir.png',f=>fs.mkdirSync(path.join(f.root,f.bundle.asset_dir,'dir.png'))]]){ const f=fixture({html:`<img src="../assets/img/asset-card/${name}">`,manifest:{assets:[]}}); setup(f); assert.equal(verify(f).valid,false,name); }
 const f=fixture({html:'<img src="../assets/img/asset-card/hero.png">',manifest:{assets:[]}}); const outside=path.join(f.root,'outside.png'); fs.writeFileSync(outside,'x'); fs.unlinkSync(path.join(f.root,f.bundle.asset_dir,'hero.png')); try{fs.symlinkSync(outside,path.join(f.root,f.bundle.asset_dir,'hero.png'));}catch(e){if(['EPERM','EACCES','ENOTSUP'].includes(e.code))return t.skip(e.code);throw e;} assert.equal(verify(f).valid,false);
});
test('requires manifest assets marked required/embed and defaults unflagged assets to required',()=>{
 for(const manifest of [{assets:[{local_path:'hero.png',required:true}]},{assets:[{local_path:'hero.png',embed:true}]},{assets:[{local_path:'hero.png'}]}]){ const f=fixture({html:'<p>No image</p>',manifest}); const r=verify(f); assert.equal(r.valid,false); assert.ok(r.errors.some(e=>e.field.startsWith('manifest.assets'))); }
 const optional=fixture({html:'<p>No image</p>',manifest:{assets:[{local_path:'hero.png',required:false,embed:false}]}}); assert.equal(verify(optional).valid,true);
});
test('rejects malformed manifest flags, duplicate local_path, and unsafe standalone paths',()=>{
 const manifests=[
  {assets:[{local_path:'hero.png',required:'true'}]},
  {assets:[{local_path:'hero.png',embed:1}]},
  {assets:[{local_path:'hero.png'},{local_path:'hero.png'}]},
  {assets:[{local_path:'../hero.png'}]},
  {assets:[{local_path:'/tmp/hero.png'}]}
 ];
 for(const manifest of manifests){const r=verify(fixture({manifest}));assert.equal(r.valid,false,JSON.stringify(manifest));assert.ok(r.errors.some(e=>e.field.startsWith('manifest.assets')));}
});
test('CLI loads validates bundle/manifest returns structured JSON exit codes',()=>{
 const f=fixture(); const ok=spawnSync(process.execPath,[MODULE,'--bundle',path.join(f.root,'bundle.json')],{cwd:f.root,encoding:'utf8'}); assert.equal(ok.status,0); assert.equal(JSON.parse(ok.stdout).valid,true);
 for(const args of [[],['--bundle'],['--bundle','/missing']]){const r=spawnSync(process.execPath,[MODULE,...args],{cwd:f.root,encoding:'utf8'});assert.notEqual(r.status,0);assert.equal(JSON.parse(r.stdout).valid,false);}
 const bad=fixture(); fs.writeFileSync(path.join(bad.root,bad.bundle.manifest_path),'{bad'); assert.equal(verify(bad).valid,false); bad.bundle.keywords=[]; assert.equal(verify(bad).valid,false);
});
