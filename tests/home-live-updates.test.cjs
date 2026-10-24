'use strict';
// Real temporary stores; small DOM/IPC doubles make failure and late-confirmation races deterministic.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const tick=()=>new Promise(r=>setImmediate(r));
class El extends EventTarget{
 constructor(){super();this.dataset={};this.children=[];this.textContent='';this.value='';this.disabled=false;this.checked=false;this.handlers=new Map()}
 addEventListener(type,fn,options){super.addEventListener(type,fn,options);if(!this.handlers.has(type))this.handlers.set(type,new Set());this.handlers.get(type).add(fn)}
 removeEventListener(type,fn,options){super.removeEventListener(type,fn,options);this.handlers.get(type)?.delete(fn)}
 async emit(type){await Promise.all([...this.handlers.get(type)||[]].map(fn=>fn({preventDefault(){}})))}
 replaceChildren(){this.children=[]}append(...nodes){this.children.push(...nodes)}setAttribute(){}focus(){}
 classList={add(){}};
}
class Doc extends EventTarget{
 constructor(){super();this.listeners=new Map()}
 addEventListener(type,fn,o){super.addEventListener(type,fn,o);if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn)}
 removeEventListener(type,fn,o){super.removeEventListener(type,fn,o);this.listeners.get(type)?.delete(fn)}
 count(type){return this.listeners.get(type)?.size||0}
 createElement(){return new El()}
}
function fixture(options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'home-live-'));
 const notes=require('../src/main/notes-store.cjs').createStore({root:()=>dir}),reminders=require('../src/main/reminders-store.cjs').createStore({root:()=>dir});
 notes.save('Alice',{title:'Alice note',body:'PRIVATE'});notes.save('Bob',{title:'Bob note',body:'PRIVATE'});
 let user='Alice',session='alice-1',fail=false,gate=null;const events=[],document=new Doc(),window=new EventTarget();
 for(const type of ['air-notes-saved','air-notes-changed','air-reminders-changed'])document.addEventListener(type,e=>events.push(e));
 const write=async(kind,action,input)=>{const owner=user;if(gate)await gate();if(fail)throw Error('Write failed');return(kind==='notes'?notes:reminders)[action](owner,input)};
 window.airOS={currentUser:async()=>session?{preferenceSession:session}:null,notes:{list:async()=>notes.list(user),save:input=>write('notes','save',input),remove:id=>write('notes','remove',id)},reminders:{list:async()=>reminders.list(user),save:input=>write('reminders','save',input),remove:id=>write('reminders','remove',id)}};
 window.airAppRegistry={register(){}};
 class MutationObserver{observe(){}disconnect(){}}
 vm.createContext(window.context={window,document,MutationObserver,Event,Date,confirm:()=>true,console:{error(){}},openApp(){}});
 for(const file of ['air-notes.js','air-reminders.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),window.context);
 function editor(kind){
  const selectors=kind==='notes'?['#note-title','#note-body','#air-note-list','#note-status','#save-note','#delete-note','#new-note']:['.arem-list','.arem-editor','.arem-title','.arem-details','.arem-date','.arem-priority','.arem-done','.arem-save','.arem-delete','.arem-status','.arem-count','.arem-new'];
  const nodes=Object.fromEntries(selectors.map(s=>[s,new El()])),root=new El(),close=new El();root.querySelector=s=>nodes[s];
  const win={isConnected:true,querySelector:s=>s==='.close'?close:root};(kind==='notes'?window.airNotes:window.airReminders).mount(win);
  return{nodes,close,win};
 }
 function home(){
  const roots={},nodes={};for(const kind of ['notes','reminders']){
   const keys=kind==='notes'?['list','status','retry','open']:['list','status','refresh','open'];nodes[kind]=Object.fromEntries(keys.map(k=>[k,new El()]));const root=new El();root.querySelector=s=>nodes[kind][s.split('-').at(-1)];roots[kind]=root;
  }
  const close=new El(),win={isConnected:true,parentNode:{},querySelector:s=>s==='.close'?close:roots[s==='.air-home-inbox'?'notes':'reminders']};
  window.airHomeNotes.mount(win);window.airHomeReminders.mount(win);
  return{close,win,nodes,titles:kind=>nodes[kind].list.children.map(row=>kind==='notes'?row.textContent:row.children[0].textContent)};
 }
 const n=editor('notes'),r=editor('reminders'),h=home();
 return{notes,reminders,n,r,h,home,document,events,window,fail:value=>fail=value,gate:fn=>gate=fn,profile:(name,key)=>{user=name;session=key},cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('confirmed note deletion refreshes Home with a payload-free change; failure emits none',async()=>{
 const f=fixture();try{await tick();assert.deepEqual(f.h.titles('notes'),['Alice note']);f.fail(true);await f.n.nodes['#delete-note'].emit('click');await tick();assert.equal(f.events.length,0);assert.deepEqual(f.h.titles('notes'),['Alice note']);f.fail(false);await f.n.nodes['#delete-note'].emit('click');await tick();assert.deepEqual(f.h.titles('notes'),[]);assert.equal(f.events[0].type,'air-notes-changed');assert.equal('detail'in f.events[0],false)}finally{f.cleanup()}
});
test('reminder create/edit/complete/reopen/delete all automatically refresh Home',async()=>{
 const f=fixture();try{
  await tick();const q=f.r.nodes;q['.arem-title'].value='First';await q['.arem-editor'].emit('submit');await tick();assert.deepEqual(f.h.titles('reminders'),['First']);
  q['.arem-title'].value='Edited';await q['.arem-editor'].emit('submit');await tick();assert.deepEqual(f.h.titles('reminders'),['Edited']);
  let checkbox=q['.arem-list'].children[0].children[0];assert.equal(checkbox.disabled,false,'checkbox must remain usable after confirmed save');checkbox.checked=true;await checkbox.emit('change');await tick();assert.deepEqual(f.h.titles('reminders'),[]);
  checkbox=q['.arem-list'].children[0].children[0];assert.equal(checkbox.disabled,false);checkbox.checked=false;await checkbox.emit('change');await tick();assert.deepEqual(f.h.titles('reminders'),['Edited']);
  await q['.arem-delete'].emit('click');await tick();assert.deepEqual(f.h.titles('reminders'),[]);assert.equal(f.events.filter(e=>e.type==='air-reminders-changed').length,5);assert.ok(f.events.every(e=>!('detail'in e)));
 }finally{f.cleanup()}
});
test('failed reminder save, toggle and delete publish no successful change',async()=>{
 const f=fixture();try{await tick();const q=f.r.nodes;q['.arem-title'].value='Saved';await q['.arem-editor'].emit('submit');await tick();f.events.length=0;f.fail(true);q['.arem-title'].value='Draft';await q['.arem-editor'].emit('submit');let checkbox=q['.arem-list'].children[0].children[0];checkbox.checked=true;await checkbox.emit('change');await q['.arem-delete'].emit('click');await tick();assert.equal(f.events.length,0);assert.deepEqual(f.h.titles('reminders'),['Saved'])}finally{f.cleanup()}
});
test('old confirmed writes after a profile change never trigger the new profile widgets',async()=>{
 for(const kind of ['notes','reminders']){const f=fixture();try{
  await tick();let release;f.gate(()=>new Promise(r=>release=r));let pending;
  if(kind==='notes')pending=f.n.nodes['#delete-note'].emit('click');else{f.r.nodes['.arem-title'].value='Alice private';pending=f.r.nodes['.arem-editor'].emit('submit')}
  await tick();f.profile('Bob','bob-1');f.h.close.dispatchEvent(new Event('click'));const bob=f.home();await tick();release();await pending;await tick();assert.equal(f.events.length,0);assert.deepEqual(bob.titles('notes'),['Bob note']);assert.deepEqual(bob.titles('reminders'),[]);
 }finally{f.cleanup()}}
});
test('logout invalidates a pending old action even on a new login to the same profile',async()=>{
 const f=fixture();try{await tick();let release;f.gate(()=>new Promise(r=>release=r));const pending=f.n.nodes['#delete-note'].emit('click');await tick();f.document.dispatchEvent(new Event('air-profile-changing'));f.profile('Alice','alice-2');release();await pending;await tick();assert.equal(f.events.length,0);assert.deepEqual(f.h.titles('notes'),[])}finally{f.cleanup()}
});
test('closing/reopening Home adds exactly one listener per event and detached Home never refreshes',async()=>{
 const f=fixture();try{await tick();for(const type of ['air-notes-saved','air-notes-changed','air-reminders-changed'])assert.equal(f.document.count(type),2);f.h.close.dispatchEvent(new Event('click'));for(const type of ['air-notes-saved','air-notes-changed','air-reminders-changed'])assert.equal(f.document.count(type),1);
  const fresh=f.home();f.window.airHomeNotes.mount(fresh.win);f.window.airHomeReminders.mount(fresh.win);await tick();for(const type of ['air-notes-saved','air-notes-changed','air-reminders-changed'])assert.equal(f.document.count(type),2);await f.n.nodes['#delete-note'].emit('click');await tick();assert.deepEqual(f.h.titles('notes'),[]);assert.deepEqual(fresh.titles('notes'),[]);assert.equal(fresh.nodes.notes.status.textContent,'Noch keine Notizen vorhanden.');
 }finally{f.cleanup()}
});
