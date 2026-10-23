'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createStore,validate}=require('../src/main/preferences.cjs');
test('preferences persist independently for each account and survive restart',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-os-prefs-'));
 try{
  const store=createStore({root:()=>root});
  assert.equal(store.load('alice').wallpaper,'clouds');
  store.update('alice',{accent:'#abcdef',dockSize:62,wallpaper:'aurora'});
  assert.equal(store.load('bob').accent,'#75aeea');
  const restarted=createStore({root:()=>root});
  assert.equal(restarted.load('ALICE').dockSize,62);
  assert.equal(restarted.load('bob').wallpaper,'clouds');
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
test('dock theme is validated, persisted per profile and resets to classic',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-dock-theme-'));
 try{
  const store=createStore({root:()=>root});
  assert.equal(store.load('Alice').dockTheme,'classic');
  store.update('Alice',{dockTheme:'modern'});
  assert.equal(createStore({root:()=>root}).load('alice').dockTheme,'modern');
  assert.equal(store.load('Bob').dockTheme,'classic');
  assert.throws(()=>store.update('Alice',{dockTheme:'unknown'}),/Dock-Theme/);
  assert.equal(store.load('Alice').dockTheme,'modern');
  assert.equal(store.reset('Alice').dockTheme,'classic');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});

test('offline clouds default preserves explicit Classic wallpapers and custom images by profile',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-cloud-wallpaper-'));
 try{
  const store=createStore({root:()=>root});
  assert.equal(store.load('New').wallpaper,'clouds');
  store.update('Alice',{wallpaper:'yosemite'});
  store.update('Bob',{wallpaper:'coast',customWallpaper:'data:image/png;base64,AAAA'});
  const restarted=createStore({root:()=>root});
  assert.equal(restarted.load('Alice').wallpaper,'yosemite');
  assert.equal(restarted.load('Bob').customWallpaper,'data:image/png;base64,AAAA');
  store.update('Alice',{wallpaper:'clouds'});
  assert.equal(restarted.load('Alice').wallpaper,'clouds');
  assert.equal(restarted.load('Bob').wallpaper,'coast');
  assert.equal(store.reset('Alice').wallpaper,'clouds');
  assert.throws(()=>store.update('Alice',{wallpaper:'https://foreign.example/image.png'}));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
