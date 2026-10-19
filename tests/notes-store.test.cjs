'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createStore}=require('../src/main/notes-store.cjs');
test('notes create, edit, delete and persist by account',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-notes-'));
 try{
  const store=createStore({root:()=>root});
  const saved=store.save('Alice',{title:'Hallo',body:'Notiz'});
  assert.equal(store.list('Alice').length,1);
  assert.equal(store.list('Bob').length,0);
  const changed=store.save('alice',{id:saved.id,title:'Bearbeitet',body:'Neuer Inhalt'});
  assert.equal(changed.createdAt,saved.createdAt);
  assert.equal(store.list('ALICE')[0].title,'Bearbeitet');
  store.remove('alice',saved.id);assert.deepEqual(store.list('alice'),[]);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('notes reject unsafe IDs and oversized documents',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-notes-'));
 try{
  const store=createStore({root:()=>root});
  assert.throws(()=>store.save('alice',{id:'../../passwd',title:'a',body:'b'}),/Notiz-ID/);
  assert.throws(()=>store.save('alice',{title:'a',body:'x'.repeat(524289)}),/zu groß/);
  assert.throws(()=>store.remove('alice','../../passwd'),/Notiz-ID/);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
