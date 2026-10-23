'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../air-notes.js'),'utf8');
function fixture(save) {
  const events=[],elements=new Map();
  function element(){
    const listeners=new Map();
    return {dataset:{},value:'',textContent:'',disabled:false,
      addEventListener(type,fn){listeners.set(type,fn);},
      emit(type){return listeners.get(type)?.();},replaceChildren(){},append(){}};
  }
  for(const id of ['#note-title','#note-body','#air-note-list','#note-status','#save-note','#delete-note','#new-note'])elements.set(id,element());
  const root=element();root.querySelector=id=>elements.get(id);
  const win={isConnected:true,querySelector:()=>root};
  // Production saves return the canonical saved note, not just its ID.
  const window={airOS:{notes:{list:async()=>[],save:async input=>({...input,...await save(input)}),remove:async()=>{}}}};
  const document={createElement:element,dispatchEvent(event){events.push(event);}};
  vm.runInNewContext(source,{window,document,Event,Date,console:{error(){}},confirm:()=>false});
  window.airNotes.mount(win);
  return {elements,events};
}
const loaded=()=>new Promise(resolve=>setImmediate(resolve));
test('Notes emits no notification until save acknowledgement and never transmits note content',async()=>{
  let resolve,calls=0,input;
  const h=fixture(value=>{calls++;input=value;return new Promise(done=>{resolve=done;});});
  await loaded();
  h.elements.get('#note-title').value='Private title';h.elements.get('#note-body').value='Private body';
  const pending=h.elements.get('#save-note').emit('click');
  assert.equal(h.events.length,0);assert.equal(h.elements.get('#save-note').disabled,true);
  await h.elements.get('#save-note').emit('click');assert.equal(calls,1);
  assert.equal(input.title,'Private title');assert.equal(input.body,'Private body');
  resolve({id:'saved-note'});await pending;
  assert.equal(h.events.length,1);assert.equal(h.events[0].type,'air-notes-saved');
  assert.equal(h.events[0].detail,undefined);assert.equal(h.elements.get('#save-note').disabled,false);
});
test('Failed Notes save produces no success signal; retry emits only after success',async()=>{
  let fail=true;
  const h=fixture(async()=>{if(fail)throw new Error('Save failed');return{id:'saved-note'};});
  await loaded();await h.elements.get('#save-note').emit('click');
  assert.equal(h.events.length,0);assert.equal(h.elements.get('#note-status').textContent,'Save failed');
  assert.equal(h.elements.get('#save-note').disabled,false);
  fail=false;await h.elements.get('#save-note').emit('click');
  assert.equal(h.events.length,1);assert.equal(h.events[0].type,'air-notes-saved');
});
