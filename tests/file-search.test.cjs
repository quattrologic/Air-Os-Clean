'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {findFileNames}=require('../src/main/file-search.cjs');
function fixture(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-search-'));fs.mkdirSync(path.join(root,'Docs'));fs.writeFileSync(path.join(root,'Docs','Urlaub.txt'),'Private CONTENT');fs.writeFileSync(path.join(root,'Docs','important.md'),'Private');fs.writeFileSync(path.join(root,'urlaub-karte.png'),'PNG');fs.writeFileSync(path.join(root,'.private-urlaub'),'secret');return root}
test('only searches filenames inside approved root; returns immutable relative paths',async()=>{
 const root=fixture();try{
  const r=await findFileNames(root,'urlaub');
  assert.deepEqual(r.items.map(x=>x.path),['urlaub-karte.png','Docs/Urlaub.txt'].sort((a,b)=>a.localeCompare(b,'de-DE',{numeric:true,sensitivity:'base'})).sort((a,b)=> a.includes('/')?1:-1));
  assert.ok(r.items.every(x=>!path.isAbsolute(x.path)));
  assert.ok(Object.isFrozen(r)&&Object.isFrozen(r.items)&&Object.isFrozen(r.items[0]));
  assert.deepEqual((await findFileNames(root,'private')).items,[]);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('does not traverse symlinked files or directories outside workspace',async()=>{
 const root=fixture(),outside=fs.mkdtempSync(path.join(os.tmpdir(),'air-search-outside-'));
 try{
  fs.writeFileSync(path.join(outside,'urlaub-external.txt'),'private');
  try{fs.symlinkSync(outside,path.join(root,'Docs','external'),'dir');fs.symlinkSync(path.join(outside,'urlaub-external.txt'),path.join(root,'urlaub-link.txt'))}
  catch(e){if(process.platform==='win32'&&e.code==='EPERM')return;throw e}
  const r=await findFileNames(root,'urlaub');
  assert.equal(r.items.some(x=>x.path.includes('external')||x.path.includes('link')),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(outside,{recursive:true,force:true})}
});
test('search limits, query validation and bounded traversal',async()=>{
 const root=fixture();try{
  assert.equal((await findFileNames(root,'ur',{limit:1})).items.length,1);
  assert.equal((await findFileNames(root,'ur',{maxEntries:1})).truncated,true);
  assert.deepEqual((await findFileNames(root,'ur',{maxDepth:0})).items.map(x=>x.path),['urlaub-karte.png']);
  for(const input of ['','u','  ','x'.repeat(101),'bad\0key',null])await assert.rejects(()=>findFileNames(root,input),TypeError);
  await assert.rejects(()=>findFileNames(root,'urlaub',{limit:0}),TypeError);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
