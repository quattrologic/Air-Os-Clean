'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const {createStore}=require('../src/main/preferences.cjs');
const renderer=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-desktop-theme-'));
 const create=()=>createStore({root:()=>root,isNewProfile:user=>user.toLowerCase()==='new'});
 const file=user=>path.join(root,'profiles',crypto.createHash('sha256').update(user.toLowerCase()).digest('hex'),'appearance-v1.json');
 return {root,create,store:create(),file,close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('only explicitly new accounts default to Modern; ambiguous/legacy preferences stay Classic without rewriting',()=>{
 const h=fixture();try{
  assert.equal(h.store.load('OldWithoutFile').desktopTheme,'classic');
  assert.equal(h.store.load('new').desktopTheme,'modern');
  assert.equal(createStore({root:()=>h.root}).load('unknown').desktopTheme,'classic');
  fs.mkdirSync(path.dirname(h.file('new')),{recursive:true});
  for(const desktopTheme of [undefined,'unsupported',null]){
   const bytes=JSON.stringify({wallpaper:'coast',dockTheme:'modern',desktopTheme});
   fs.writeFileSync(h.file('new'),bytes);
   assert.equal(h.store.load('new').desktopTheme,'classic');
   assert.equal(h.store.load('new').dockTheme,'modern');
   assert.equal(fs.readFileSync(h.file('new'),'utf8'),bytes);
  }
 }finally{h.close()}
});
test('Modern / Classic switches persist independently from Dock, wallpaper, other profiles and app files',()=>{
 const h=fixture();try{
  h.store.update('old',{wallpaper:'aurora',customWallpaper:'data:image/png;base64,AAAA',dockTheme:'modern',dockPins:['notes'],clock24:false});
  h.store.update('new',{desktopTheme:'classic',dockTheme:'classic'});
  const other=fs.readFileSync(h.file('new')),notes=path.join(path.dirname(h.file('old')),'notes-v1.json');
  fs.writeFileSync(notes,'PRESERVED APP DATA');
  for(const desktopTheme of ['modern','classic','modern']){
   h.store.update('old',{desktopTheme});
   const saved=h.create().load('OLD');
   assert.equal(saved.desktopTheme,desktopTheme);assert.equal(saved.dockTheme,'modern');
   assert.equal(saved.wallpaper,'aurora');assert.equal(saved.customWallpaper,'data:image/png;base64,AAAA');
   assert.deepEqual(saved.dockPins,['notes']);assert.equal(saved.clock24,false);
  }
  h.store.update('old',{dockTheme:'classic'});assert.equal(h.create().load('old').desktopTheme,'modern');
  assert.deepEqual(fs.readFileSync(h.file('new')),other);assert.equal(fs.readFileSync(notes,'utf8'),'PRESERVED APP DATA');
  const before=fs.readFileSync(h.file('old'));
  for(const desktopTheme of ['Modern','',false,null,{},[],123])assert.throws(()=>h.store.update('old',{desktopTheme}),/Desktop-Design/);
  assert.deepEqual(fs.readFileSync(h.file('old')),before);
 }finally{h.close()}
});
test('reset uses account generation defaults and does not reset other profiles or remove app data',()=>{
 const h=fixture();try{
  h.store.update('old',{desktopTheme:'modern',dockTheme:'modern'});
  h.store.update('new',{desktopTheme:'classic',dockTheme:'modern'});
  assert.equal(h.create().load('new').desktopTheme,'classic','Saved user choice wins over new-account default');
  const other=fs.readFileSync(h.file('new')),notes=path.join(path.dirname(h.file('old')),'notes-v1.json');
  fs.writeFileSync(notes,'PRESERVED AFTER RESET');
  assert.equal(h.store.reset('old').desktopTheme,'classic');
  assert.equal(fs.readFileSync(notes,'utf8'),'PRESERVED AFTER RESET');
  assert.deepEqual(fs.readFileSync(h.file('new')),other);
  assert.equal(h.store.reset('new').desktopTheme,'modern');
  assert.equal(h.create().load('new').desktopTheme,'modern');
  assert.equal(h.store.load('old').dockTheme,'classic');
 }finally{h.close()}
});
test('production Main account marker classifies only accounts created by the new registration handler',()=>{
 const h=fixture();try{
  const source=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8');
  let accounts=[{username:'Old',usernameKey:'old'}],handler;
  const context={require:()=>({createStore}),app:{getPath:()=>h.root},readAccounts:()=>accounts,
   ipcMain:{handle:(_channel,fn)=>{handler=fn}},requireTrusted:e=>{if(!e.trusted)throw Error('Untrusted')},
   safeUser:String,crypto:{...crypto,scryptSync:()=>Buffer.alloc(64)},scryptOptions:{},
   writeAccounts:value=>{accounts=value},setImmediate(){}};
  vm.createContext(context);
  const registration=source.slice(source.indexOf("ipcMain.handle('air-os:create-account'"),source.indexOf("ipcMain.handle('air-os:login'"));
  vm.runInContext(registration,context);
  assert.throws(()=>handler({trusted:false},{}),/Untrusted/);
  assert.equal(handler({trusted:true},{displayName:'New',username:'New',password:'test-only-password',profileSchemaVersion:1}).ok,true);
  assert.equal(accounts[1].profileSchemaVersion,2);assert.equal(accounts[0].profileSchemaVersion,undefined);
  const constructor=source.slice(source.indexOf('const preferenceStore='),source.indexOf('const notesStore='));
  vm.runInContext(constructor+'globalThis.store=preferenceStore;',context);
  assert.equal(context.store.load('Old').desktopTheme,'classic');
  assert.equal(context.store.load('NEW').desktopTheme,'modern');
 }finally{h.close()}
});
function uiFixture(h){
 const cache=h.store.load('old');let fail=false,release;
 const attrs={},status={textContent:''},select={value:'classic',disabled:false,addEventListener:(_type,fn)=>{select.change=fn}};
 const root={dataset:attrs,style:{setProperty(){},removeProperty(){}},classList:{toggle(){}}};
 const document={documentElement:root,querySelector:()=>null,querySelectorAll:s=>s==='#air-desktop-theme'?[select]:[],dispatchEvent(){}};
 const context={window:{airOS:{preferences:{update:async patch=>{await new Promise(resolve=>{release=resolve});if(fail)throw Error('disk full');return h.store.update('old',patch)}}}},
  document,Event,Date,AIR_WALLPAPERS:{clouds:'offline'},readAirSettings:()=>({...context.airSettingsCache}),airSettingsCache:cache,
  airSettingsWrites:Promise.resolve(),airSettingsLoad:Promise.resolve()};
 vm.createContext(context);
 vm.runInContext(renderer.slice(renderer.indexOf('function persistAirDesktopTheme('),renderer.indexOf('const airSettingsLoad=')),context);
 vm.runInContext(renderer.slice(renderer.indexOf('function applyAirSettings('),renderer.indexOf('function initAirSettings(')),context);
 const binding=renderer.slice(renderer.indexOf(" desktopTheme?.addEventListener('change'"),renderer.indexOf(' win.querySelectorAll("[data-wallpaper]").forEach(button=>button.addEventListener'));
 // Run the actual Settings binding and adapter, not a duplicate save handler.
 context.desktopTheme=select;context.announce=message=>{status.textContent=message};
 vm.runInContext(binding,context);
 return {context,attrs,status,select,allow:()=>release(),fail:value=>{fail=value}};
}
test('renderer selection/root await acknowledgement, preserve other fields, report errors and allow retry',async()=>{
 const h=fixture();try{
  h.store.update('old',{dockTheme:'modern',wallpaper:'coast'});
  const ui=uiFixture(h);ui.context.applyAirSettings(h.store.load('old'));
  assert.equal(ui.attrs.desktopTheme,'classic');
  ui.select.value='modern';const pending=ui.select.change();
  assert.equal(ui.attrs.desktopTheme,'classic');assert.equal(ui.select.value,'classic');assert.equal(ui.select.disabled,true);
  await new Promise(resolve=>setImmediate(resolve));ui.allow();await pending;
  assert.equal(ui.attrs.desktopTheme,'modern');assert.equal(ui.select.value,'modern');assert.equal(ui.select.disabled,false);
  assert.equal(h.create().load('old').desktopTheme,'modern');assert.equal(h.store.load('old').dockTheme,'modern');
  const before=fs.readFileSync(h.file('old'));
  ui.fail(true);ui.select.value='classic';const rejected=ui.select.change();
  await new Promise(resolve=>setImmediate(resolve));ui.allow();await rejected;
  assert.equal(ui.attrs.desktopTheme,'modern');assert.equal(ui.select.value,'modern');assert.equal(ui.select.disabled,false);
  assert.match(ui.status.textContent,/nicht gespeichert.*disk full/);assert.deepEqual(fs.readFileSync(h.file('old')),before);
  ui.fail(false);ui.select.value='classic';const retry=ui.select.change();
  await new Promise(resolve=>setImmediate(resolve));ui.allow();await retry;
  assert.equal(ui.attrs.desktopTheme,'classic');assert.equal(h.store.load('old').wallpaper,'coast');
 }finally{h.close()}
});
