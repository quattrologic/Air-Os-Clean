'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createStore,validate}=require('../src/main/preferences.cjs');
test('preferences persist independently for each account and survive restart',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-os-prefs-'));
 try{
  const store=createStore({root:()=>root});
  assert.equal(store.load('alice').wallpaper,'yosemite');
  store.update('alice',{accent:'#abcdef',dockSize:62,wallpaper:'aurora'});
  assert.equal(store.load('bob').accent,'#75aeea');
  const restarted=createStore({root:()=>root});
  assert.equal(restarted.load('ALICE').dockSize,62);
  assert.equal(restarted.load('bob').wallpaper,'yosemite');
  assert.equal(restarted.reset('alice').accent,'#75aeea');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('unexpected keys, invalid colors, dangerous payloads and size limits fail',()=>{
 assert.throws(()=>validate({__proto__:null,secret:true}),/Unbekannte/);
 assert.throws(()=>validate({accent:'red'}),/Akzent/);
 assert.throws(()=>validate({wallpaper:'javascript:alert(1)'}),/Hintergrundbild/);
 assert.throws(()=>validate({customWallpaper:'data:text/html;base64,SGk='}),/Hintergrundbild/);
 assert.throws(()=>validate({dockSize:999}),/Dock/);
 assert.deepEqual(validate({reduceMotion:true}),{reduceMotion:true});
});
