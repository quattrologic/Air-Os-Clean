'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createStore}=require('../src/main/reminders-store.cjs');
test('Air Reminders persist, update, complete and separate user profiles',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'air-reminders-'));
 try{
  const store=createStore({root:()=>dir});
  const reminder=store.save('Alice',{title:'  Urlaub buchen  ',details:'Reise vorbereiten',dueDate:'2026-12-24',priority:'high'});
  assert.equal(reminder.title,'Urlaub buchen');
  assert.equal(store.list('Bob').length,0);
  assert.equal(store.list('ALICE').length,1);
  const updated=store.save('alice',{...reminder,completed:true});
  assert.equal(updated.completed,true);assert.equal(updated.createdAt,reminder.createdAt);
  assert.equal(store.list('Alice')[0].completed,true);
  assert.equal(store.remove('Alice',reminder.id).ok,true);
  assert.equal(store.list('alice').length,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('malformed reminders fail without changing existing data',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'air-reminders-invalid-'));
 try{
  const store=createStore({root:()=>dir}),r=store.save('Alice',{title:'Keep'});
  for(const payload of [{title:''},{title:'A',dueDate:'2026-02-30'},{title:'A',priority:'admin'},{title:'A',completed:'true'},{title:'A',details:'x'.repeat(2001)},{id:'../../escape',title:'Unsafe'}])
   assert.throws(()=>store.save('Alice',payload));
  assert.deepEqual(store.list('Alice').map(n=>n.id),[r.id]);
  assert.throws(()=>store.remove('Alice','../escape'));
  assert.throws(()=>store.save('Bob',{...r,title:'Move'}),/not found/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('a failed atomic save preserves the prior reminder contents',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'air-reminders-rollback-'));
 try{
  const store=createStore({root:()=>dir}),r=store.save('Alice',{title:'Keep'});
  const rename=fs.renameSync;
  fs.renameSync=()=>{throw new Error('simulated disk fault')};
  try{assert.throws(()=>store.save('Alice',{...r,title:'Lost'}),/disk fault/)}
  finally{fs.renameSync=rename}
  assert.equal(store.list('Alice')[0].title,'Keep');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
