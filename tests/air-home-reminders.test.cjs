'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const{createStore}=require('../src/main/reminders-store.cjs');
const source=fs.readFileSync(require.resolve('../air-reminders.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
class Element extends EventTarget{
 constructor(){super();this.children=[];this.dataset={};this.textContent='';this.disabled=false}
 replaceChildren(){this.children=[]}append(...items){this.children.push(...items)}
 set innerHTML(value){throw Error('Reminder titles must never enter innerHTML')}
}
function fixture(options={}){
 const nodes=Object.fromEntries(['list','status','retry','open','close'].map(k=>[k,new Element()]));
 const root={dataset:{},querySelector:s=>nodes[{'air-home-reminders-list':'list','air-home-reminders-status':'status','air-home-reminders-refresh':'retry','air-home-reminders-open':'open'}[s.slice(1)]]};
 const win={isConnected:true,parentNode:{},querySelector:s=>s==='.air-home-due'?root:nodes.close};
 const document=new EventTarget();document.createElement=()=>new Element();
 let session='alice-session',calls=0,disconnected=false,removed;
 const window=new EventTarget();window.airOS={currentUser:async()=>session?{preferenceSession:session}:null,reminders:{list:async()=>{calls++;return options.list?options.list():[]}}};
 const opened=[];
 class MutationObserver{constructor(fn){removed=fn}observe(){}disconnect(){disconnected=true}}
 vm.runInNewContext(source,{window,document,MutationObserver,openApp:id=>opened.push(id),Date,console,Event});
 const control=window.airHomeReminders.mount(win);
 return{...nodes,win,control,opened,document,window,preview:window.airHomeReminders.preview,session:value=>session=value,removed:()=>removed(),get calls(){return calls},get disconnected(){return disconnected},titles:()=>nodes.list.children.map(n=>n.children[0].textContent)};
}
const task=(title,dueDate=null,completed=false)=>({title,dueDate,completed,details:'PRIVATE DETAILS'});
test('Home reminders order overdue/today/future/undated, ignore completed and limit three',()=>{
 const f=fixture(),now=new Date(2026,9,24,23,45),all=[task('No date'),task('Future','2026-10-25'),task('Done','2026-01-01',true),task('Today','2026-10-24'),task('Overdue','2026-10-23')];
 assert.deepEqual(Array.from(f.preview(all,now),x=>x.title),['Overdue','Today','Future']);
 assert.equal(f.preview(all,now)[0].overdue,true);assert.equal(f.preview(all,now)[1].label,'Heute');
 assert.deepEqual(Array.from(f.preview(all.filter(t=>t.title!=='Overdue'),now),x=>x.title),['Today','Future','No date']);
 assert.equal(f.preview([task('No date')],now)[0].label,'Ohne Datum');
});
test('date-only validation handles leap dates and invalid values conservatively',()=>{
 const f=fixture(),now=new Date(2026,9,24);
 for(const due of ['2026-02-29','2026-02-30','2026-13-01','2026-00-10','2026-10-24T00:00Z','garbage',null])assert.equal(f.preview([task('A',due)],now)[0].label,'Ohne Datum');
 assert.equal(f.preview([task('Leap','2024-02-29')],now)[0].label,'Überfällig · 29.02.2024');
});
test('local calendar days stay correct west/east of UTC and across DST boundaries',()=>{
 for(const [zone,instant,date]of [['America/Los_Angeles','2026-03-08T07:30:00Z','2026-03-07'],['Pacific/Kiritimati','2026-10-23T11:00:00Z','2026-10-24'],['Europe/Berlin','2026-10-24T22:30:00Z','2026-10-25'],['America/Los_Angeles','2026-11-01T08:30:00Z','2026-11-01']]){
  const script=`const fs=require('node:fs'),vm=require('node:vm'),w={};vm.runInNewContext(fs.readFileSync('air-reminders.js','utf8'),{window:w,Date});process.stdout.write(w.airHomeReminders.preview([{title:'A',dueDate:${JSON.stringify(date)},completed:false}],new Date(${JSON.stringify(instant)}))[0].label);`;
  const result=spawnSync(process.execPath,['-e',script],{cwd:path.join(__dirname,'..'),env:{...process.env,TZ:zone},encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'Heute',zone);
 }
});
test('real persisted Alice reminders reload on reopening; Bob and descriptions stay separate',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-home-reminders-'));
 try{
  let store=createStore({root:()=>root});const a=store.save('Alice',task('Alice only','2026-10-24'));store.save('Alice',task('Completed',null,true));store.save('Bob',task('Bob only'));
  const f=fixture({list:()=>store.list('Alice')});await tick();assert.deepEqual(f.titles(),['Alice only']);assert.doesNotMatch(JSON.stringify(f.titles()),/PRIVATE|Bob/);f.close.dispatchEvent(new Event('click'));
  store.save('Alice',{...a,title:'Updated on disk'});store=createStore({root:()=>root});const again=fixture({list:()=>store.list('Alice')});await tick();assert.deepEqual(again.titles(),['Updated on disk']);assert.equal(store.list('Bob')[0].title,'Bob only');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('empty and completed-only profiles offer existing reminders app',async()=>{
 for(const items of [[],[task('Done',null,true)]]){const f=fixture({list:async()=>items});await tick();assert.equal(f.status.textContent,'Keine offenen Aufgaben.');f.open.dispatchEvent(new Event('click'));assert.deepEqual(f.opened,['reminders'])}
});
test('hostile title renders as text; details never render; ties keep store order',async()=>{
 const hostile='<img src=x onerror=alert(1)>',f=fixture({list:async()=>[task(hostile),task('Second')]});await tick();assert.deepEqual(f.titles(),[hostile,'Second']);assert.equal(f.list.children[0].children[0].children.length,0);assert.doesNotMatch(f.status.textContent,/PRIVATE/);
});
test('load failure provides a working retry without disclosing private error text',async()=>{
 let fail=true;const f=fixture({list:async()=>{if(fail)throw Error('PRIVATE path');return[task('Recovered')]}});await tick();assert.match(f.status.textContent,/erneut versuchen/);assert.equal(f.retry.textContent,'Erneut laden');assert.doesNotMatch(f.status.textContent,/PRIVATE/);fail=false;f.retry.dispatchEvent(new Event('click'));await tick();assert.deepEqual(f.titles(),['Recovered']);assert.equal(f.retry.textContent,'Aktualisieren');
});
test('changed profile rejects a late response and disables old widget',async()=>{
 let resolve;const f=fixture({list:()=>new Promise(r=>resolve=r)});await tick();f.session('bob-session');resolve([task('Alice secret')]);await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.open.disabled,true);assert.equal(f.disconnected,true);
});
test('logout scrubs titles synchronously and rejects pending data',async()=>{
 let resolve,pending=false;const f=fixture({list:async()=>pending?new Promise(r=>resolve=r):[task('Alice secret')]});await tick();assert.deepEqual(f.titles(),['Alice secret']);pending=true;f.control.refresh();await tick();f.document.dispatchEvent(new Event('air-profile-changing'));f.session(null);resolve([task('Late secret')]);await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.status.textContent,'');assert.equal(f.retry.disabled,true);
});
test('close, removal and pagehide scrub data and ignore future results',async()=>{
 for(const action of ['close','removed','pagehide']){
  let resolve;const f=fixture({list:()=>new Promise(r=>resolve=r)});await tick();if(action==='close')f.close.dispatchEvent(new Event('click'));else if(action==='removed'){f.win.isConnected=false;f.removed()}else f.window.dispatchEvent(new Event('pagehide'));resolve([task('Secret')]);await tick();assert.deepEqual(f.titles(),[]);assert.equal(f.disconnected,true);
 }
});
test('new refresh wins over an older pending response',async()=>{
 const pending=[],f=fixture({list:()=>new Promise(r=>pending.push(r))});await tick();f.retry.dispatchEvent(new Event('click'));await tick();pending[1]([task('New')]);await tick();pending[0]([task('Old')]);await tick();assert.deepEqual(f.titles(),['New']);
});
