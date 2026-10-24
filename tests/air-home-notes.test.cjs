'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const{createStore}=require('../src/main/notes-store.cjs');
const source=fs.readFileSync(require.resolve('../air-notes.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
class Element extends EventTarget{
 constructor(){super();this.children=[];this.dataset={};this.textContent='';this.hidden=false;this.disabled=false}
 replaceChildren(){this.children=[]}append(item){this.children.push(item)}
 set innerHTML(value){throw Error('Dynamic HTML is forbidden in the notes widget')}
}
function fixture(options={}){
 const nodes=Object.fromEntries(['list','status','retry','open','close'].map(k=>[k,new Element()]));
 const root={dataset:{},querySelector:s=>nodes[{'air-home-notes-list':'list','air-home-notes-status':'status','air-home-notes-retry':'retry','air-home-notes-open':'open'}[s.slice(1)]]};
 const win={isConnected:true,parentNode:{},querySelector:s=>s==='.air-home-inbox'?root:nodes.close};
 const document=new EventTarget();document.createElement=()=>new Element();
 let session='alice-session',calls=0,disconnected=false,removed;
 const window=new EventTarget();window.airOS={currentUser:async()=>session?{preferenceSession:session}:null,notes:{list:async()=>{calls++;return options.list?options.list():[]}}};
 const opened=[];
 class MutationObserver{constructor(fn){removed=fn}observe(){}disconnect(){disconnected=true}}
 vm.runInNewContext(source,{window,document,MutationObserver,openApp:id=>opened.push(id),Date,console,Event});
 const control=window.airHomeNotes.mount(win);
 return{...nodes,win,control,opened,document,window,session:value=>session=value,removed:()=>removed(),get calls(){return calls},get disconnected(){return disconnected},titles:()=>nodes.list.children.map(n=>n.textContent)};
}
test('Home loads real profile store titles, sorts valid dates and limits to three without bodies',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-home-notes-'));
 try{
  const store=createStore({root:()=>root});for(const title of ['First','Second','Third','Fourth'])store.save('Alice',{title,body:'PRIVATE BODY'});
  store.save('Bob',{title:'Bob secret',body:'Bob private'});
  const f=fixture({list:()=>store.list('Alice')});await tick();
  assert.equal(f.titles().length,3);assert.deepEqual(f.titles(),store.list('Alice').slice().sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).slice(0,3).map(n=>n.title));
  assert.doesNotMatch(JSON.stringify(f.titles()),/PRIVATE|Bob/);assert.equal(f.calls,1);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('empty profile offers existing Notes app and confirmed saves refresh widget',async()=>{
 const f=fixture();await tick();assert.equal(f.status.textContent,'Noch keine Notizen vorhanden.');
 f.open.dispatchEvent(new Event('click'));assert.deepEqual(f.opened,['notes']);
 f.document.dispatchEvent(new Event('air-notes-saved'));await tick();assert.equal(f.calls,2);
});
test('sorting puts invalid dates last, keeps ties and renders hostile titles only as text',async()=>{
 const title='<img src=x onerror=alert(1)>';
 const f=fixture({list:async()=>[{title:'invalid',updatedAt:'broken'},{title:'older',updatedAt:'2026-01-01'},{title,updatedAt:'2026-10-24'},{title:'tie',updatedAt:'2026-10-24'},{title:'last',updatedAt:null}]});await tick();
 assert.deepEqual(f.titles(),[title,'tie','older']);assert.equal(f.list.children[0].children.length,0);
});
test('loading failure has retry and successful retry clears error',async()=>{
 let fail=true;const f=fixture({list:async()=>{if(fail)throw Error('private path');return[{title:'Recovered',updatedAt:'2026-10-24'}]}});await tick();
 assert.match(f.status.textContent,/erneut versuchen/);assert.doesNotMatch(f.status.textContent,/private path/);assert.equal(f.retry.hidden,false);
 fail=false;f.retry.dispatchEvent(new Event('click'));await tick();assert.deepEqual(f.titles(),['Recovered']);assert.equal(f.retry.hidden,true);
});
test('late response from Alice cannot render into a changed Bob session',async()=>{
 let resolve;const f=fixture({list:()=>new Promise(r=>resolve=r)});await tick();f.session('bob-session');resolve([{title:'Alice secret'}]);await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.open.disabled,true);assert.equal(f.disconnected,true);
});
test('logout immediately erases rendered titles and ignores pending responses',async()=>{
 let resolve;let pending=false;const f=fixture({list:async()=>pending?new Promise(r=>resolve=r):[{title:'Alice secret'}]});await tick();assert.deepEqual(f.titles(),['Alice secret']);pending=true;f.control.refresh();await tick();
 f.document.dispatchEvent(new Event('air-profile-changing'));f.session(null);resolve([{title:'Late private title'}]);await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.status.textContent,'');
 f.document.dispatchEvent(new Event('air-notes-saved'));await tick();assert.equal(f.calls,2);
});
test('closing immediately scrubs titles, ignores late response; fresh window loads current data',async()=>{
 let resolve;const old=fixture({list:()=>new Promise(r=>resolve=r)});await tick();old.close.dispatchEvent(new Event('click'));resolve([{title:'Old title'}]);await tick();assert.deepEqual(old.titles(),[]);assert.equal(old.open.disabled,true);
 const fresh=fixture({list:async()=>[{title:'New data'}]});await tick();assert.deepEqual(fresh.titles(),['New data']);assert.equal(fresh.open.disabled,false);
});
test('removed window and pagehide both clear data and detach global listeners',async()=>{
 for(const action of ['removed','pagehide']){const f=fixture({list:async()=>[{title:'Private'}]});await tick();if(action==='removed'){f.win.isConnected=false;f.removed()}else f.window.dispatchEvent(new Event('pagehide'));assert.deepEqual(f.titles(),[]);assert.equal(f.disconnected,true);f.document.dispatchEvent(new Event('air-notes-saved'));await tick();assert.equal(f.calls,1)}
});
test('superseded load cannot overwrite a newer confirmed-save refresh',async()=>{
 const pending=[];const f=fixture({list:()=>new Promise(resolve=>pending.push(resolve))});await tick();
 f.document.dispatchEvent(new Event('air-notes-saved'));await tick();
 pending[1]([{title:'New snapshot'}]);await tick();assert.deepEqual(f.titles(),['New snapshot']);
 pending[0]([{title:'Old snapshot'}]);await tick();assert.deepEqual(f.titles(),['New snapshot']);
});
test('confirmed deletion change reloads Notes once and stops after widget close',async()=>{
 let notes=[{title:'Before'}];const f=fixture({list:async()=>notes});await tick();notes=[];f.document.dispatchEvent(new Event('air-notes-changed'));await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.calls,2);f.close.dispatchEvent(new Event('click'));f.document.dispatchEvent(new Event('air-notes-changed'));await tick();assert.equal(f.calls,2);
});
