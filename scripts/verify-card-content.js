#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

// If facts.min_claim_coverage is absent/invalid, require one represented claim.
const DEFAULT_MIN_CLAIM_COVERAGE = 1;
function decode(text) { return text.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))); }
function normalize(text) { return decode(String(text)).normalize('NFKC').toLocaleLowerCase('en-US').replace(/[\p{P}\p{S}\s]+/gu,' ').trim(); }
function visibleText(html) { return normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<!--[^]*?-->/g,' ').replace(/<[^>]+>/g,' ')); }
function heroText(html) { const matches=[]; const re=/<(header|section|div)\b[^>]*(?:class|id)\s*=\s*(?:"[^"]*hero[^"]*"|'[^']*hero[^']*'|[^\s>]*hero[^\s>]*)[^>]*>([\s\S]*?)<\/\1>/gi; let m; while((m=re.exec(html)))matches.push(m[2]); if(!matches.length){ const h=/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html); if(h)matches.push(h[1]); } return visibleText(matches.join(' ')); }
function identities(facts,bundle){ const values=[]; const meta=facts.repo_meta && typeof facts.repo_meta==='object'?facts.repo_meta:{}; for(const key of ['name','title','full_name','fullName'])if(typeof meta[key]==='string')values.push(meta[key]); for(const key of ['name','title'])if(typeof facts[key]==='string')values.push(facts[key]); try{ const u=new URL(facts.source_url||bundle.source_url); const parts=u.pathname.split('/').filter(Boolean).slice(0,2); if(parts.length)values.push(parts.join(' '),parts.join('/'),parts.at(-1)); }catch{} return [...new Set(values.map(normalize).filter(Boolean))]; }
function readJson(file,field,errors){ try{const s=fs.statSync(file);if(!s.isFile()||s.size===0)throw new Error('must exist and be nonempty');return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){errors.push({field,message:e.message});return null;} }
function verifyCardContent(bundle,rootDir=process.cwd()){
 const errors=[]; const contract=validateBundle(bundle); if(!contract.valid)errors.push(...contract.errors.map(e=>({...e,field:`bundle.${e.field}`}))); if(!bundle||typeof bundle.slug!=='string')return {valid:false,errors,claim_coverage:{matched:0,required:DEFAULT_MIN_CLAIM_COVERAGE,total:0}};
 const facts=readJson(path.join(rootDir,'.tmp','infocard',bundle.slug,'facts.json'),'facts',errors); let html=''; try{const p=path.resolve(rootDir,bundle.html_path);const s=fs.statSync(p);if(!s.isFile()||s.size===0)throw new Error('must exist and be nonempty');html=fs.readFileSync(p,'utf8');}catch(e){errors.push({field:'html',message:e.message});}
 let coverage={matched:0,required:DEFAULT_MIN_CLAIM_COVERAGE,total:0};
 if(facts&&typeof facts==='object'&&!Array.isArray(facts)&&html){ const text=visibleText(html), hero=heroText(html); if(!identities(facts,bundle).some(id=>hero.includes(id)))errors.push({field:'hero',message:'must contain project identity inferred from facts or source URL'});
  const sections=Array.isArray(facts.required_sections)?facts.required_sections:[]; sections.forEach((section,i)=>{const key=normalize(section); const headingRe=/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi; let m,hit=false;while((m=headingRe.exec(html)))if(visibleText(m[1]).includes(key)){hit=true;break;} if(!hit&&!text.includes(key))errors.push({field:`required_sections.${i}`,message:`missing evidence for ${section}`});});
  const claims=Array.isArray(facts.claims)?facts.claims.filter(x=>typeof x==='string'&&normalize(x)):[]; const configured=Number.isInteger(facts.min_claim_coverage)&&facts.min_claim_coverage>=0?facts.min_claim_coverage:DEFAULT_MIN_CLAIM_COVERAGE; const required=Math.min(configured,claims.length); const matched=claims.filter(c=>text.includes(normalize(c))).length; coverage={matched,required,total:claims.length}; if(matched<required)errors.push({field:'claims',message:`claim coverage ${matched}/${claims.length} below required ${required}`});
  if(!/<meta\b[^>]*name\s*=\s*["']?viewport["']?[^>]*>/i.test(html))errors.push({field:'viewport',message:'viewport meta required'}); if(!/@media\b[^\{]*(?:max-width|min-width|width)\s*:/i.test(html))errors.push({field:'mobile_media',message:'responsive media rule required'});
 }
 return {valid:errors.length===0,errors,claim_coverage:coverage};
}
function main(argv){const i=argv.indexOf('--bundle');if(i<0||!argv[i+1]){process.stdout.write(JSON.stringify({valid:false,errors:[{field:'bundle',message:'usage: --bundle path'}]})+'\n');return 2;}try{const result=verifyCardContent(loadBundle(path.resolve(argv[i+1])),process.cwd());process.stdout.write(JSON.stringify(result)+'\n');return result.valid?0:1;}catch(e){process.stdout.write(JSON.stringify({valid:false,errors:[{field:'bundle',message:e.message}]})+'\n');return 1;}}
if(require.main===module)process.exitCode=main(process.argv.slice(2));
module.exports={verifyCardContent,main,DEFAULT_MIN_CLAIM_COVERAGE};
