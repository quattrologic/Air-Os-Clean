'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createStore}=require('../src/main/preferences.cjs');
test('new profiles inherit both Modern themes; saved Classic and ambiguous profiles remain untouched',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-soft-glass-'));
 try{
  const create=()=>createStore({root:()=>root,isNewProfile:user=>user==='new'}),store=create();
  assert.equal(store.load('new').desktopTheme,'modern');assert.equal(store.load('new').dockTheme,'modern');
  assert.equal(store.load('old').desktopTheme,'classic');assert.equal(store.load('old').dockTheme,'classic');
  store.update('new',{desktopTheme:'classic',dockTheme:'classic',dockPins:['notes','missing'],wallpaper:'coast'});
  const saved=create().load('new');assert.equal(saved.desktopTheme,'classic');assert.equal(saved.dockTheme,'classic');assert.deepEqual(saved.dockPins,['notes','missing']);assert.equal(saved.wallpaper,'coast');
  store.update('new',{desktopTheme:'modern'});assert.equal(create().load('new').dockTheme,'classic');
  assert.equal(store.reset('new').dockTheme,'modern');assert.equal(store.reset('old').dockTheme,'classic');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
