'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8'),registry=require('../src/core/app-registry.js'),{createStore}=require('../src/main/preferences.cjs');
const helpers=source.slice(source.indexOf('function airDockReferences('),source.indexOf('function initAirDockLayout('));
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-start-pins-')),store=createStore({root:()=>root});
 let user={username:'alice',preferenceSession:'alice-1'},fail=false,before=false,after=false,release,applied=0;
 const context={window:{airAppRegistry:registry,airOS:{currentUser:async()=>user,preferences:{get:async()=>store.load(user.username),update:async(patch,session)=>{
  if(before)await new Promise(resolve=>{release=resolve});
  if(session!==user?.preferenceSession)throw Error('Session changed');if(fail)throw Error('disk full');
  const saved=store.update(user.username,patch);if(after)await new Promise(resolve=>{release=resolve});return saved;
 }}}},document:{querySelector:()=>null},vectorIcon:{finder:'svg',notes:'svg',spotify:'svg',browser:'svg',music:'svg',settings:'svg'},
 airSettingsCache:store.load('alice'),readAirSettings:()=>context.airSettingsCache,applyAirSettings:()=>{applied++},airSettingsWrites:Promise.resolve(),airSettingsLoad:Promise.resolve()};
 vm.runInNewContext(helpers+source.slice(source.indexOf('function persistAirDockPin('),source.indexOf('const airSettingsLoad=')),context);
 return {root,store,context,pin:(id,value)=>context.persistAirDockPin(id,value),applied:()=>applied,fail:value=>{fail=value},delay:(a,b)=>{before=a;after=b},release:()=>release(),switchUser(value){user=value},close(){fs.rmSync(root,{recursive:true,force:true})}};
}
test('null materializes the complete default list; [] remains explicit; remove/re-add preserves order and unknown references',()=>{
 const h=fixture();try{
  const update=(pins,id,pinned)=>Array.from(h.context.airDockPinUpdate(registry,pins,id,pinned,h.context.airDockCanPin));
  assert.deepEqual(update(null,'notes',false),['finder','browser','music','settings']);
  assert.deepEqual(update([],'notes',true),['notes']);assert.deepEqual(update(['notes'],'notes',true),['notes']);
  const pins=['future-app','notes','finder','com.example.offline'];
  assert.deepEqual(update(pins,'notes',false),['future-app','finder','com.example.offline']);
  assert.deepEqual(update(update(pins,'notes',false),'notes',true),['future-app','finder','com.example.offline','notes']);assert.deepEqual(pins,['future-app','notes','finder','com.example.offline']);
 }finally{h.close()}
});
test('invalid IDs, protected launcher, unsupported original icon and 64-pin limit fail without writes',async()=>{
 const h=fixture();try{
  for(const id of ['../notes','unknown','launchpad','about'])await assert.rejects(h.pin(id,true),/Dock/);
  const pins=Array.from({length:64},(_,i)=>'future-'+i);h.store.update('alice',{dockPins:pins});
  await assert.rejects(h.pin('notes',true),/64/);assert.deepEqual(h.store.load('alice').dockPins,pins);
  assert.equal(h.applied(),0);
 }finally{h.close()}
});
test('serialized confirmed writes preserve parallel pins, unrelated settings, Bob, and fresh-store persistence',async()=>{
 const h=fixture();try{
  h.store.update('alice',{dockPins:[],wallpaper:'aurora',dockTheme:'modern',desktopTheme:'classic'});h.store.update('bob',{dockPins:['finder']});
  await Promise.all([h.pin('notes',true),h.pin('spotify',true),h.pin('notes',true)]);
  assert.deepEqual(h.store.load('alice').dockPins,['notes','spotify']);assert.deepEqual(h.store.load('bob').dockPins,['finder']);
  const fresh=createStore({root:()=>h.root}).load('alice');assert.deepEqual(fresh.dockPins,['notes','spotify']);assert.equal(fresh.wallpaper,'aurora');assert.equal(fresh.desktopTheme,'classic');
  await h.pin('notes',false);assert.deepEqual(h.store.load('alice').dockPins,['spotify']);
 }finally{h.close()}
});
test('failed save leaves cache/store unchanged; retry applies only after acknowledgement',async()=>{
 const h=fixture();try{
  h.store.update('alice',{dockPins:[]});h.context.airSettingsCache=h.store.load('alice');h.fail(true);
  await assert.rejects(h.pin('notes',true),/disk full/);assert.deepEqual(h.store.load('alice').dockPins,[]);assert.equal(h.applied(),0);
  h.fail(false);h.delay(false,true);const pending=h.pin('notes',true);await new Promise(r=>setImmediate(r));
  assert.deepEqual(h.context.airSettingsCache.dockPins,[]);assert.equal(h.applied(),0);
  h.release();await pending;assert.deepEqual(h.context.airSettingsCache.dockPins,['notes']);assert.equal(h.applied(),1);
 }finally{h.close()}
});
test('profile change before guarded write cannot write Bob, nor a new Alice session',async()=>{
 for(const next of [{username:'bob',preferenceSession:'bob-1'},{username:'alice',preferenceSession:'alice-2'}]){
  const h=fixture();try{
   h.delay(true,false);const pending=h.pin('notes',true);await new Promise(r=>setImmediate(r));h.switchUser(next);h.release();
   await assert.rejects(pending,{code:'AIR_PROFILE_CHANGED'});assert.equal(h.store.load('alice').dockPins,null);assert.equal(h.store.load('bob').dockPins,null);assert.equal(h.applied(),0);
  }finally{h.close()}
 }
});
test('profile change after disk commit suppresses stale renderer response',async()=>{
 const h=fixture();try{
  h.delay(false,true);const pending=h.pin('spotify',true);await new Promise(r=>setImmediate(r));h.switchUser({username:'bob',preferenceSession:'bob-1'});h.release();
  await assert.rejects(pending,{code:'AIR_PROFILE_CHANGED'});assert.ok(h.store.load('alice').dockPins.includes('spotify'));assert.equal(h.store.load('bob').dockPins,null);assert.equal(h.applied(),0);
 }finally{h.close()}
});
test('production Main creates a new ephemeral preference session on each login, including the same account',()=>{
 const main=fs.readFileSync(require.resolve('../main.cjs'),'utf8'),context={crypto,lockPresentation:{clear(){}},keepAwake:{release(){}},mainWindow:null,activeUser:null,publicAccount:account=>({username:account.username})};
 vm.runInNewContext(main.slice(main.indexOf('function openDesktop('),main.indexOf('function createWindow(')),context);
 context.openDesktop({username:'alice'});const first=context.activeUser.preferenceSession;context.openDesktop({username:'alice'});
 assert.match(first,/^[a-f0-9]{32}$/);assert.notEqual(first,context.activeUser.preferenceSession);
});
