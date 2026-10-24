'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const {createStore}=require('../src/main/notes-store.cjs');
const source=fs.readFileSync(path.join(__dirname,'../air-notes.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(initial=[]){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-notes-save-ui-'));
 const store=createStore({root:()=>root});
 for(const note of initial)store.save('Alice',note);
 const bob=store.save('Bob',{title:'Bob',body:'Private'});
 const inputs=[],events=[],elements=new Map();let finish,fail,listCalls=0,removals=0;
 function element(){
  const listeners=new Map();
  return {dataset:{},value:'',textContent:'',disabled:false,children:[],
   addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:(type)=>listeners.delete(type),emit:type=>listeners.get(type)?.(),
   replaceChildren(){this.children=[]},append(node){this.children.push(node)}};
 }
 for(const id of ['note-title','note-body','air-note-list','note-status','save-note','delete-note','new-note'])elements.set(id,element());
 const editor=element();editor.querySelector=selector=>elements.get(selector.slice(1));
 const win={isConnected:true,querySelector:()=>editor};
 const window=Object.assign(new EventTarget(),{airOS:{currentUser:async()=>({preferenceSession:"alice-session"}),notes:{
  list:async()=>{listCalls++;return store.list('Alice')},
  save:async input=>{inputs.push({...input});await new Promise((resolve,reject)=>{finish=resolve;fail=reject});return store.save('Alice',input)},
  remove:async id=>{removals++;return store.remove('Alice',id)}
 }}});
 const document=Object.assign(new EventTarget(),{createElement:element,dispatchEvent:e=>{events.push(e);return true}});
 vm.runInNewContext(source,{window,document,Event,Date,confirm:()=>true,console:{error(){}}});
 window.airNotes.mount(win);
 return {get:id=>elements.get(id),store,root,bob,inputs,events,window,
  complete:()=>finish(),reject:()=>fail(new Error('Disk unavailable')),
  listCalls:()=>listCalls,removals:()=>removals,
  cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('acknowledged save preserves newer editor text and persists only the requested snapshot; retry updates same note',async()=>{
 const h=fixture();try{
  await tick();h.get('note-title').value='Draft';h.get('note-body').value='First snapshot';
  const saving=h.get('save-note').emit('click');
  h.get('note-title').value='Newer title';h.get('note-body').value='Newer unsaved text';
  await h.get('save-note').emit('click');assert.equal(h.inputs.length,1);
  h.complete();await saving;
  assert.equal(h.get('note-title').value,'Newer title');
  assert.equal(h.get('note-body').value,'Newer unsaved text');
  assert.match(h.get('note-status').textContent,/noch nicht gespeichert/);
  assert.equal(h.listCalls(),1,'save must not reload stale editor contents');
  assert.equal(h.store.list('Alice')[0].body,'First snapshot');
  const id=h.store.list('Alice')[0].id;
  const retry=h.get('save-note').emit('click');h.complete();await retry;
  assert.equal(h.inputs[1].id,id);
  const reopened=createStore({root:()=>h.root});
  assert.equal(reopened.list('Alice').length,1);
  assert.equal(reopened.list('Alice')[0].body,'Newer unsaved text');
  assert.equal(reopened.list('Alice')[0].title,'Newer title');
  assert.deepEqual(reopened.list('Bob'),[h.bob]);
  assert.match(h.get('note-status').textContent,/im Benutzerprofil gespeichert/);
 }finally{h.cleanup()}
});
test('pending save cannot be retargeted by new, delete, list selection or Spotlight navigation',async()=>{
 const h=fixture([{title:'Older',body:'B'},{title:'Current',body:'A'}]);try{
  await tick();const [current,other]=h.store.list('Alice');
  h.get('note-body').value='Edited';const saving=h.get('save-note').emit('click');
  h.get('new-note').emit('click');
  h.get('air-note-list').children[1].emit('click');
  await h.get('delete-note').emit('click');
  h.window.airNotes.focusNote(other.id);await tick();
  assert.equal(h.get('note-title').value,'Current');
  assert.equal(h.get('note-body').value,'Edited');
  assert.equal(h.removals(),0);assert.equal(h.listCalls(),1);
  h.complete();await saving;
  assert.equal(h.store.list('Alice').find(note=>note.id===current.id).body,'Edited');
  assert.equal(h.store.list('Alice').length,2);
  h.get('air-note-list').children[1].emit('click');assert.equal(h.get('note-title').value,'Older');
  h.get('new-note').emit('click');assert.equal(h.get('note-title').value,'');
 }finally{h.cleanup()}
});
test('failed save preserves draft and saved data, emits no success and permits explicit retry',async()=>{
 const h=fixture([{title:'Saved',body:'Original'}]);try{
  await tick();const before=h.store.list('Alice');
  h.get('note-body').value='Draft';const saving=h.get('save-note').emit('click');
  h.get('note-body').value='Newer draft';h.reject();await saving;
  assert.equal(h.get('note-body').value,'Newer draft');
  assert.deepEqual(h.store.list('Alice'),before);assert.equal(h.events.length,0);
  assert.equal(h.get('save-note').disabled,false);
  assert.equal(h.get('note-status').textContent,'Disk unavailable');
  const retry=h.get('save-note').emit('click');h.complete();await retry;
  assert.equal(h.store.list('Alice')[0].body,'Newer draft');assert.equal(h.events.length,1);
 }finally{h.cleanup()}
});
