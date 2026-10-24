'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../air-launchpad.js'),'utf8');
function fixture(launch=()=>({ok:true}),save=async()=>{}){
 const nodes={},calls=[];let mode='modern',desktop='modern',pins=null,changed,active;
 function element(id){const events={};const el={id,hidden:id==='air-start-menu',children:[],dataset:{},style:{},value:'',textContent:'',disabled:false,
  addEventListener(type,fn){(events[type]??=[]).push(fn)},emit(type,event={}){return Promise.all((events[type]||[]).map(fn=>fn(event)))},
  click(){return this.emit('click',{target:this})},focus(){active=this},setAttribute(key,value){this[key]=value},append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},
  contains(target){return target===this||this.children.some(child=>child.contains(target))},getBoundingClientRect(){return {top:532}},
  querySelector(selector){return nodes[selector.slice(1)]||null},querySelectorAll(selector){return this.children.flatMap(el=>[...(el.type==='button'&&(!selector.includes('data-start-app')||el.dataset.startApp)&&(!selector.includes('data-pin-app')||el.dataset.pinApp)&&(!selector.includes(':not')||!el.disabled)?[el]:[]),...el.querySelectorAll(selector)])}
 };if(id)nodes[id]=el;return el}
 for(const id of ['air-start-menu','air-start-search','air-start-results','air-start-status','air-start-close','air-start-full','air-start-filters','air-start-filter-all','air-start-filter-pinned','trigger','dock'])element(id);
 nodes['air-start-menu'].append(nodes['air-start-search'],nodes['air-start-results']);
 const document=element('document');document.querySelector=s=>s==='.dock [data-app="launchpad"]'?nodes.trigger:s==='.dock'?nodes.dock:nodes[s.slice(1)]||null;
 Object.defineProperty(document,'activeElement',{get:()=>active});document.createElement=()=>element();
 let apps=[{id:'finder',name:'Finder',iconClass:'finder-icon'},{id:'notes',name:'Notizen',iconClass:'notes-icon'},{id:'test',name:'<img src=x onerror=alert(1)>',glyph:''}];
 const registry={get:id=>apps.find(a=>a.id===id),list:()=>apps,onChange:fn=>{changed=fn}};
 const window={innerHeight:600,innerWidth:390,addEventListener(){}};
 const helpers={};const appSource=fs.readFileSync(require.resolve('../app.js'),'utf8');vm.runInNewContext(appSource.slice(appSource.indexOf('function airDockReferences('),appSource.indexOf('function initAirDockLayout(')),helpers);
 vm.runInNewContext('(function(){'+source.slice(source.indexOf(' // B2:')),{...helpers,airDockCanPin:id=>['finder','notes'].includes(id),persistAirDockPin:save,registry,window,document,vectorIcon:{},readAirSettings:()=>({dockTheme:mode,desktopTheme:desktop,dockPins:pins}),openApp:id=>{calls.push(id);return launch(id)}});
 return {nodes,window,document,calls,active:()=>active,setPins(value){pins=value;return document.emit('air-settings-changed')},getPins:()=>pins,setDesktop(value){desktop=value;return document.emit('air-settings-changed')},setMode(value){mode=value;return document.emit('air-settings-changed')},setApps(value){apps=value;changed()},key(key,target=nodes['air-start-search']){return nodes['air-start-menu'].emit('keydown',{key,target,preventDefault(){},stopPropagation(){}})}};
}
test('Modern opens focused search, Classic leaves legacy route available, Escape returns focus',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();assert.equal(h.nodes['air-start-menu'].hidden,false);assert.equal(h.active(),h.nodes['air-start-search']);
 await h.key('Escape');assert.equal(h.nodes['air-start-menu'].hidden,true);assert.equal(h.active(),h.nodes.trigger);
 await h.setMode('classic');h.window.airStartMenu.toggle();assert.equal(h.nodes['air-start-menu'].hidden,true);
});
test('name/id search is case-insensitive, empty query shows all, names use textContent and registry changes refresh',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();const input=h.nodes['air-start-search'],results=h.nodes['air-start-results'];
 assert.equal(results.children.length,3);assert.equal(results.children[2].children[0].children[1].children[0].textContent,'<img src=x onerror=alert(1)>');assert.equal(results.children[2].children[0].children[1].children[0].innerHTML,undefined);
 input.value='NoTI';await input.emit('input');assert.equal(results.children.length,1);assert.equal(results.children[0].children[0].dataset.startApp,'notes');
 input.value='../not-an-app';await input.emit('input');assert.equal(results.children.length,0);assert.match(h.nodes['air-start-status'].textContent,/Keine passenden/);await h.key('Enter');assert.deepEqual(h.calls,[]);
 input.value='';await input.emit('input');h.setApps([{id:'new-app',name:'New'}]);assert.equal(results.children.length,1);assert.equal(results.children[0].children[0].dataset.startApp,'new-app');
});
test('arrow navigation and Enter use existing launch path once; successful launch closes',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();await h.key('ArrowUp');assert.equal(h.active().dataset.startApp,'test');
 await h.key('ArrowDown');assert.equal(h.active().dataset.startApp,'finder');await h.key('Enter');await new Promise(r=>setImmediate(r));
 assert.deepEqual(h.calls,['finder']);assert.equal(h.nodes['air-start-menu'].hidden,true);
});
test('pending/failing launch stays visible, blocks duplicate launch and supports retry',async()=>{
 let resolve;const h=fixture(()=>new Promise(r=>{resolve=r}));h.window.airStartMenu.toggle();const button=h.nodes['air-start-results'].children[0].children[0];
 const first=button.click();await button.click();assert.deepEqual(h.calls,['finder']);assert.equal(h.nodes['air-start-menu'].hidden,false);
 resolve({ok:false,error:"Error invoking remote method 'air-os:test': Error: Permission denied"});await first;assert.equal(h.nodes['air-start-menu'].hidden,false);assert.equal(h.nodes['air-start-status'].textContent,'Permission denied');assert.equal(h.nodes['air-start-search'].disabled,false);
 const retry=h.nodes['air-start-results'].children[0].children[0].click();resolve({ok:true});await retry;assert.equal(h.nodes['air-start-menu'].hidden,true);
});
test('outside click and theme switch close; cancelled pending launch cannot reopen or overwrite reopened menu',async()=>{
 let resolve;const h=fixture(()=>new Promise(r=>{resolve=r}));h.window.airStartMenu.toggle();const pending=h.nodes['air-start-results'].children[0].children[0].click();
 await h.document.emit('click',{target:{}});assert.equal(h.nodes['air-start-menu'].hidden,true);assert.equal(h.active(),h.nodes.trigger);
 h.window.airStartMenu.toggle();resolve({ok:false,error:'stale failure'});await pending;assert.doesNotMatch(h.nodes['air-start-status'].textContent,/stale/);
 await h.setMode('classic');assert.equal(h.nodes['air-start-menu'].hidden,true);
});
test('production native launcher returns truthful success/failure without rejecting legacy fire-and-forget callers',async()=>{
 const app=fs.readFileSync(require.resolve('../app.js'),'utf8'),start=app.indexOf('function openApp(id){');
 const context={window:{airOS:{launchSpotify:()=>Promise.reject(Error('Not installed'))}},toast(){}};
 vm.runInNewContext(app.slice(start,app.indexOf(' const registered=',start))+'}',context);
 assert.equal((await context.openApp('spotify')).ok,false);assert.equal((await context.openApp('spotify')).error,'Not installed');
 context.window.airOS.launchSpotify=async()=>({ok:true});assert.equal((await context.openApp('spotify')).ok,true);
});

test('pin action never launches app, blocks duplicate saves and returns focus without closing menu',async()=>{
 let resolve,saves=0;const h=fixture(()=>assert.fail('Pin must not launch'),()=>{saves++;return new Promise(r=>{resolve=r})});h.window.airStartMenu.toggle();
 const pin=h.nodes['air-start-results'].querySelectorAll('[data-pin-app]')[0];const pending=pin.click();await pin.click();assert.equal(saves,1);assert.match(h.nodes['air-start-status'].textContent,/werden gespeichert/);assert.equal(h.nodes['air-start-menu'].hidden,false);
 resolve();await pending;assert.match(h.nodes['air-start-status'].textContent,/gelöst/);assert.equal(h.active().dataset.pinApp,'finder');assert.equal(h.nodes['air-start-menu'].hidden,false);assert.deepEqual(h.calls,[]);
});
test('pin error is visible and retry remains possible; search arrows skip sibling pin buttons',async()=>{
 let fail=true;const h=fixture(()=>({ok:true}),async()=>{if(fail)throw Error('disk full')});h.window.airStartMenu.toggle();
 await h.nodes['air-start-results'].querySelectorAll('[data-pin-app]')[0].click();assert.match(h.nodes['air-start-status'].textContent,/nicht gespeichert.*disk full/);fail=false;
 await h.nodes['air-start-results'].querySelectorAll('[data-pin-app]')[0].click();assert.match(h.nodes['air-start-status'].textContent,/gelöst/);
 await h.key('ArrowDown');assert.equal(h.active().dataset.startApp,'finder');assert.equal(h.active().dataset.pinApp,undefined);
});

test('rerendering a clicked pin does not turn its original menu event path into an outside click',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();
 await h.document.emit('click',{target:{},composedPath:()=>[{},h.nodes['air-start-menu']]});
 assert.equal(h.nodes['air-start-menu'].hidden,false);
});
test('pinned filter uses full default references for null and respects explicit empty or unknown pins',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();await h.nodes['air-start-filter-pinned'].click();
 const ids=()=>h.nodes['air-start-results'].children.map(row=>row.children[0].dataset.startApp);
 assert.deepEqual(ids(),['finder','notes']);assert.equal(h.nodes['air-start-filter-pinned']['aria-pressed'],'true');assert.equal(h.nodes['air-start-filter-all']['aria-pressed'],'false');
 await h.setPins([]);assert.deepEqual(ids(),[]);assert.match(h.nodes['air-start-status'].textContent,/Keine angehefteten/);
 await h.setPins(['unknown-reference','notes']);assert.deepEqual(ids(),['notes']);assert.deepEqual(h.getPins(),['unknown-reference','notes']);
});
test('search by name/id combines with each filter and empty matches launch nothing',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();await h.setPins(['notes']);h.nodes['air-start-search'].value='FINDER';await h.nodes['air-start-search'].emit('input');assert.equal(h.nodes['air-start-results'].children.length,1);
 await h.nodes['air-start-filter-pinned'].click();assert.equal(h.nodes['air-start-results'].children.length,0);await h.key('Enter');assert.deepEqual(h.calls,[]);
 h.nodes['air-start-search'].value='nOtI';await h.nodes['air-start-search'].emit('input');assert.equal(h.nodes['air-start-results'].children[0].children[0].dataset.startApp,'notes');
 await h.nodes['air-start-filter-all'].click();assert.equal(h.nodes['air-start-search'].value,'nOtI');assert.equal(h.nodes['air-start-results'].children.length,1);
});
test('confirmed pin changes update filtered rows, preserve references and never launch',async()=>{
 let release;const h=fixture(()=>assert.fail('pin must not launch'),async(id,pinned)=>{await new Promise(r=>release=r);await h.setPins(pinned?[...h.getPins(),id]:h.getPins().filter(x=>x!==id))});
 await h.setPins(['unknown-reference']);h.window.airStartMenu.toggle();let action=h.nodes['air-start-results'].children[1].children[1];const pending=action.click();
 await h.nodes['air-start-filter-pinned'].click();assert.equal(h.nodes['air-start-results'].children.length,0,'unconfirmed pin not displayed');release();await pending;assert.equal(h.nodes['air-start-results'].children[0].children[0].dataset.startApp,'notes');
 const removal=h.nodes['air-start-results'].children[0].children[1].click();release();await removal;assert.equal(h.nodes['air-start-results'].children.length,0);assert.deepEqual(h.getPins(),['unknown-reference']);assert.equal(h.active(),h.nodes['air-start-search']);assert.deepEqual(h.calls,[]);
});
test('typing during pending pin is preserved and delayed completion does not steal search focus',async()=>{
 let release;const h=fixture(()=>({ok:true}),()=>new Promise(r=>release=r));h.window.airStartMenu.toggle();const pending=h.nodes['air-start-results'].children[0].children[1].click();h.nodes['air-start-search'].focus();h.nodes['air-start-search'].value='notes';await h.nodes['air-start-search'].emit('input');assert.match(h.nodes['air-start-status'].textContent,/werden gespeichert/);release();await pending;assert.equal(h.nodes['air-start-search'].value,'notes');assert.equal(h.active(),h.nodes['air-start-search']);assert.equal(h.nodes['air-start-results'].children[0].children[0].dataset.startApp,'notes');
});
test('pending launch keeps input/filter responsive; failed launch preserves query and allows retry',async()=>{
 let resolve;const h=fixture(()=>new Promise(r=>resolve=r));h.window.airStartMenu.toggle();const pending=h.nodes['air-start-results'].children[0].children[0].click();assert.equal(h.nodes['air-start-search'].disabled,false);h.nodes['air-start-search'].value='notes';await h.nodes['air-start-search'].emit('input');await h.nodes['air-start-filter-pinned'].click();assert.match(h.nodes['air-start-status'].textContent,/gestartet/);resolve({ok:false,error:'Unavailable'});await pending;assert.equal(h.nodes['air-start-search'].value,'notes');assert.equal(h.nodes['air-start-filter-pinned']['aria-pressed'],'true');const retry=h.nodes['air-start-results'].children[0].children[0].click();resolve({ok:true});await retry;assert.deepEqual(h.calls,['finder','notes']);assert.equal(h.nodes['air-start-menu'].hidden,true);
});
test('Classic desktop retains all-app menu when Modern dock is chosen; filter state is transient',async()=>{
 const h=fixture();h.window.airStartMenu.toggle();await h.setPins([]);await h.nodes['air-start-filter-pinned'].click();await h.setDesktop('classic');assert.equal(h.nodes['air-start-filters'].hidden,true);assert.equal(h.nodes['air-start-results'].children.length,3);await h.setDesktop('modern');assert.equal(h.nodes['air-start-filters'].hidden,false);assert.equal(h.nodes['air-start-filter-all']['aria-pressed'],'true');await h.key('Escape');h.window.airStartMenu.toggle();assert.equal(h.nodes['air-start-filter-all']['aria-pressed'],'true');
});
test('filtered results read updated profile preferences and pin failures do not pretend success',async()=>{
 const h=fixture(()=>({ok:true}),async()=>{throw Error('write denied')});h.window.airStartMenu.toggle();await h.setPins(['notes']);await h.nodes['air-start-filter-pinned'].click();await h.nodes['air-start-results'].children[0].children[1].click();assert.match(h.nodes['air-start-status'].textContent,/nicht gespeichert/);assert.equal(h.nodes['air-start-results'].children[0].children[0].dataset.startApp,'notes');await h.setPins(['finder']);assert.equal(h.nodes['air-start-results'].children[0].children[0].dataset.startApp,'finder');assert.deepEqual(h.getPins(),['finder']);
});
test('arrow-selected result survives pending pin confirmation instead of returning to pin action',async()=>{
 let release;const h=fixture(()=>({ok:true}),()=>new Promise(r=>release=r));h.window.airStartMenu.toggle();const action=h.nodes['air-start-results'].children[1].children[1];action.focus();const pending=action.click();assert.equal(h.active(),h.nodes['air-start-search']);await h.key('ArrowDown');assert.equal(h.active().dataset.startApp,'finder');release();await pending;assert.equal(h.active().dataset.startApp,'finder');assert.deepEqual(h.calls,[]);
});
