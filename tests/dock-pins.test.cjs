'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {createStore,validate}=require('../src/main/preferences.cjs');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-dock-pins-'));
 const store=createStore({root:()=>root});
 const file=user=>path.join(root,'profiles',crypto.createHash('sha256').update(user.toLowerCase()).digest('hex'),'appearance-v1.json');
 return{root,store,file,close(){fs.rmSync(root,{recursive:true,force:true});}};
}
test('ordered Dock pin references persist per profile and survive a new store instance',()=>{
 const h=fixture();
 try{
  assert.equal(h.store.load('alice').dockPins,null,'null means existing default dock, not explicitly empty');
  const pins=['notes','finder','com.airos.demo.timer'];
  h.store.update('Alice',{dockPins:pins});
  pins.reverse();
  assert.deepEqual(createStore({root:()=>h.root}).load('alice').dockPins,['notes','finder','com.airos.demo.timer']);
  assert.equal(h.store.load('bob').dockPins,null);
  h.store.update('alice',{dockPins:['notes','com.airos.demo.timer']});
  assert.deepEqual(h.store.load('alice').dockPins,['notes','com.airos.demo.timer'],'Removing a reference persists');
  h.store.update('bob',{dockPins:['calculator']});
  assert.deepEqual(h.store.load('alice').dockPins,['notes','com.airos.demo.timer']);
  const stored=JSON.parse(fs.readFileSync(h.file('alice'),'utf8'));
  assert(stored.dockPins.every(id=>typeof id==='string'),'Only ID references, no copied app metadata');
 }finally{h.close();}
});
test('invalid Dock pin patches never replace saved preferences and valid arrays are defensively copied',()=>{
 const h=fixture();
 try{
  h.store.update('alice',{dockPins:['notes'],accent:'#abcdef'});
  const before=fs.readFileSync(h.file('alice'));
  const sparse=[];sparse.length=1;
  for(const dockPins of ['notes',{},false,42,['notes','notes'],[{}],[null],sparse,['../notes'],['https://example.com'],['__proto__'],['UPPER'],['com.a'],['a'.repeat(65)],Array.from({length:65},(_,i)=>'app-'+i)]){
   assert.throws(()=>h.store.update('alice',{dockPins}),/Dock-Pins/);
   assert.deepEqual(fs.readFileSync(h.file('alice')),before,'Invalid patch preserves every byte');
  }
  const ids=Array.from({length:64},(_,i)=>'app-'+i),patch=validate({dockPins:ids});
  ids.pop();assert.equal(patch.dockPins.length,64);
  assert.deepEqual(validate({dockPins:['future-tool']}).dockPins,['future-tool'],'Syntactic reference validation does not grant installation or launch rights');
 }finally{h.close();}
});
test('explicit empty pins, default inheritance, reset and pre-pinning preferences stay distinct',()=>{
 const h=fixture();
 try{
  h.store.update('alice',{dockPins:[],dockTheme:'modern'});
  assert.deepEqual(h.store.load('alice').dockPins,[]);
  h.store.update('alice',{accent:'#123456'});
  assert.deepEqual(h.store.load('alice').dockPins,[],'Other appearance changes preserve pins');
  h.store.update('alice',{dockPins:null});assert.equal(h.store.load('alice').dockPins,null);
  h.store.update('alice',{dockPins:['notes']});assert.equal(h.store.reset('alice').dockPins,null);
  fs.writeFileSync(h.file('alice'),JSON.stringify({schemaVersion:1,dockTheme:'modern',accent:'#123456'}));
  assert.equal(h.store.load('alice').dockPins,null);assert.equal(h.store.load('alice').dockTheme,'modern');
  fs.writeFileSync(h.file('alice'),JSON.stringify({dockPins:{id:'notes'},accent:'#123456'}));
  assert.equal(h.store.load('alice').dockPins,null);assert.equal(h.store.load('alice').accent,'#123456');
 }finally{h.close();}
});
test('existing preferences IPC binds pin updates to authenticated user rather than a renderer profile',()=>{
 const h=fixture();
 try{
  const source=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8'),handlers=new Map();
  const auth=source.slice(source.indexOf('function requirePreferenceUser('),source.indexOf("ipcMain.handle('air-os:spotify:launch'"));
  const registrations=source.split('\n').filter(line=>line.startsWith("ipcMain.handle('air-os:preferences:")).join('\n');
  const context={activeUser:null,preferenceStore:h.store,requireTrusted(event){if(!event.trusted)throw Error('Untrusted');},ipcMain:{handle:(channel,fn)=>handlers.set(channel,fn)}};
  vm.runInNewContext(auth+registrations,context);
  const update=handlers.get('air-os:preferences:update'),get=handlers.get('air-os:preferences:get'),reset=handlers.get('air-os:preferences:reset');
  assert.throws(()=>update({trusted:true},{dockPins:['notes']}),/anmelden/);
  context.activeUser={username:'alice'};
  assert.throws(()=>update({trusted:false},{dockPins:['notes']}),/Untrusted/);
  update({trusted:true},{dockPins:['notes']});
  assert.throws(()=>update({trusted:true},{username:'bob',dockPins:[]}),/Unbekannte Einstellung/);
  assert.deepEqual(get({trusted:true}).dockPins,['notes']);
  context.activeUser={username:'bob'};assert.equal(get({trusted:true}).dockPins,null);
  update({trusted:true},{dockPins:[]});reset({trusted:true});
  assert.deepEqual(h.store.load('alice').dockPins,['notes']);
 }finally{h.close();}
});
