'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {main}=require('../verify-visual-gate');
test('publisher gate accepts exhausted tool budget; rejects short budget and independent theme failure',()=>{
 const root=fs.mkdtempSync(path.join(process.env.TMPDIR || '/home/ccwq/hehome/hermes-data/cache/scratch','visual-budget-e2e-'));
 try {
  fs.mkdirSync(path.join(root,'docs'));fs.writeFileSync(path.join(root,'docs/test.html'),'<html><body>test</body></html>');
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'docs/test.html'))).digest('hex');
  const dir=path.join(root,'.visual-evidence/test');fs.mkdirSync(dir,{recursive:true});
  const m={target:'docs/test.html',html_sha256:hash,review_status:'VISUAL_EXCEPTION_AFTER_BUDGET',theme_match:true,checks:['desktop','mobile'].map(viewport=>({id:viewport,viewport,html_sha256:hash,status:'tool_exhausted',remaining_defects:[],attempts:[1,2,3].map(attempt=>({attempt,type:'infrastructure_failure',error_category:'503',error:'fixture unavailable',strategy:'test-'+attempt,evidence_gap:true}))}))};
  const save=()=>fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(m));save();assert.equal(main(['docs/test.html'],root).code,0);
  m.checks[1].attempts.pop();save();assert.equal(main(['docs/test.html'],root).code,1);
  m.checks[1].attempts.push({...m.checks[0].attempts[2]});m.theme_match=false;save();assert.equal(main(['docs/test.html'],root).code,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
