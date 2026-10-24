'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function setup(options = {}) {
  const elements = {};
  let active = null, now = new Date('2026-10-22T13:04:00Z'), settings = {clock24:true,...options.settings};
  function element(id) {
    const handlers = new Map();
    const el = {dataset:{},children:[],append(...children){this.children.push(...children)},replaceChildren(){this.children=[]},contains(target){return this===target||this.children.some(child=>child.contains(target))},hidden:id==='air-island-panel'||id==='air-island-note-notice', attrs:{}, textContent:'',
      addEventListener(type, fn) { handlers.set(type, fn); },
      removeEventListener(type, fn) { if(handlers.get(type)===fn) handlers.delete(type); },
      emit(type, event={}) { return handlers.get(type)?.(event); },
      focus() { active=el; },
      setAttribute(key, value) { el.attrs[key]=value; },
      getAttribute(key) { return el.attrs[key]; },
      classList:{add(){},remove(){}},scrollIntoView(){}
    };
    elements[id]=el; return el;
  }
  const document=element('document'), window=element('window');
  for(const id of ['air-island','air-island-toggle','air-island-panel','air-island-close','air-island-clock','desktop','air-control-dock-theme','air-control-dock-value','air-control-dock-status','air-island-note-notice','air-island-note-message','air-island-note-time']) element(id);
  if(options.controls){for(const id of ['air-control-desktop-theme','air-control-desktop-value','air-control-clock','air-control-notice','air-control-volume','air-control-volume-value','air-control-apps','air-control-settings','air-control-refresh'])element(id);elements['air-control-notice'].disabled=true;}
  if(options.quick){for(const id of ['air-island-title','air-island-views','air-island-controls','air-island-quick','air-island-quick-cards','air-island-view-control','air-island-view-quick','air-island-quick-status'])element(id);document.createElement=()=>element('');window.airAppRegistry={get:id=>options.apps?.[id],onChange:fn=>{window.registryChanged=fn;return()=>{window.registryStopped=true}}};}
  if(options.audio)window.Amplitude={getAudio:()=>options.audio};
  document.querySelector=selector=>elements[selector.slice(1)];
  if(options.available!==false)window.airOS={preferences:{}};
  const motions=[];window.matchMedia=()=>({matches:!!options.reduced});
  if(options.motion)elements['air-island-panel'].animate=(frames,config)=>{const motion={frames,config,playbackRate:1,pause(){},play(){},reverse(){this.playbackRate*=-1;this.reversals=(this.reversals||0)+1},cancel(){this.cancelled=true},finish(){this.onfinish?.()}};motions.push(motion);return motion};
  if(options.startMenu){elements['air-start-menu']={hidden:false};window.airStartMenu={toggle(){elements['air-start-menu'].hidden=true}};}
  const save=options.save || (async dockTheme=>{settings={...settings,dockTheme};document.emit('air-settings-changed');});
  const inside=new Set(Object.values(elements).filter(el=>el!==document && el!==window));
  elements['air-island'].contains=target=>inside.has(target);
  const timers=new Map(); let serial=0;
  class Clock extends Date { constructor(){super(now.getTime());} }
  vm.runInNewContext(fs.readFileSync(path.join(root,'air-island.js'),'utf8'), {
    window, document, Date:Clock, vectorIcon:options.icons||{},openApp:options.launch||(()=>({ok:true})),openApps:options.openApps||new Map(), readAirSettings:()=>settings, persistAirDockTheme:save, persistAirDesktopTheme:options.desktopSave||(async value=>{settings={...settings,desktopTheme:value};document.emit('air-settings-changed')}),
    setInterval(fn){timers.set(++serial,fn);return serial;},clearInterval(id){timers.delete(id);}
  });
  return {elements,document,window,timers,motions,get active(){return active;},
    settings(value){settings=value;document.emit('air-settings-changed');},
    tick(){now=new Date(now.getTime()+60000);for(const fn of timers.values())fn();return now;}
  };
}
test('Island clock uses real date formatting, live preference changes and visibility cleanup',()=>{
  const h=setup(), clock=h.elements['air-island-clock'];
  const format=(date,hour12)=>date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12});
  assert.equal(clock.textContent,format(new Date('2026-10-22T13:04:00Z'),false));
  h.settings({clock24:false});
  assert.equal(clock.textContent,format(new Date('2026-10-22T13:04:00Z'),true));
  const next=h.tick();assert.equal(clock.textContent,format(next,true));
  assert(h.elements['air-island-toggle'].attrs['aria-label'].includes(clock.textContent));
  h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.timers.size,0);
  h.document.hidden=false;h.document.emit('visibilitychange');assert.equal(h.timers.size,1);
  h.window.emit('pagehide');assert.equal(h.timers.size,0);
});
test('Island opens into panel, Escape restores focus and outside navigation keeps its target',()=>{
  const h=setup(),trigger=h.elements['air-island-toggle'],panel=h.elements['air-island-panel'],close=h.elements['air-island-close'];
  assert.equal(panel.hidden,true);
  trigger.emit('click');assert.equal(panel.hidden,false);assert.equal(trigger.attrs['aria-expanded'],'true');assert.equal(h.active,close);
  let prevented=false;
  h.document.emit('keydown',{key:'Escape',preventDefault(){prevented=true;},stopPropagation(){}});
  assert(prevented);assert.equal(panel.hidden,true);assert.equal(h.active,trigger);
  trigger.emit('click');close.emit('click');assert.equal(panel.hidden,true);assert.equal(h.active,trigger);
  trigger.emit('click');
  const outside={};h.document.emit('focusin',{target:outside});
  assert.equal(panel.hidden,true);assert.equal(h.active,close,'Outside dismissal must not force trigger focus');
  trigger.emit('click');h.document.emit('pointerdown',{target:outside});assert.equal(panel.hidden,true);
});
test('Island resources are included in the desktop and installer',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  for(const file of ['air-island.js','air-island.css']){assert(html.includes(file));assert(pkg.build.files.includes(file));}
  assert(html.includes('aria-controls="air-island-panel"'));
});

test('Control Center tile confirms saves, ignores double activation and reflects external changes',async()=>{
  let resolve, calls=0;
  const h=setup({save:()=>{calls++;return new Promise(done=>{resolve=done;});}});
  const tile=h.elements['air-control-dock-theme'],value=h.elements['air-control-dock-value'];
  assert.equal(tile.attrs['aria-pressed'],'false');
  const pending=tile.emit('click');
  assert.equal(tile.attrs['aria-busy'],'true');
  await tile.emit('click');assert.equal(calls,1);
  assert.equal(value.textContent,'Air Classic','No unconfirmed applied state');
  h.settings({dockTheme:'modern'});resolve();await pending;
  assert.equal(tile.attrs['aria-pressed'],'true');assert.equal(tile.attrs['aria-busy'],'false');
  assert.equal(value.textContent,'Air Modern');assert.match(h.elements['air-control-dock-status'].textContent,/gespeichert/);
  h.settings({dockTheme:'classic'});
  assert.equal(tile.attrs['aria-pressed'],'false');assert.equal(value.textContent,'Air Classic');
  assert.doesNotMatch(h.elements['air-control-dock-status'].textContent,/Modern gespeichert/);
});
test('Control Center tile reports failed save, allows retry and explains unavailable preferences',async()=>{
  let fail=true;
  const h=setup({save:async()=>{if(fail)throw new Error('disk full');h.settings({dockTheme:'modern'});}});
  const tile=h.elements['air-control-dock-theme'];
  await tile.emit('click');
  assert.equal(tile.attrs['aria-pressed'],'false');assert.equal(tile.attrs['aria-disabled'],'false');
  assert.match(h.elements['air-control-dock-status'].textContent,/nicht gespeichert/);
  fail=false;await tile.emit('click');assert.equal(tile.attrs['aria-pressed'],'true');
  let calls=0;
  const missing=setup({available:false,save:async()=>{calls++;}});
  assert.equal(missing.elements['air-control-dock-theme'].attrs['aria-disabled'],'true');
  await missing.elements['air-control-dock-theme'].emit('click');assert.equal(calls,0);
  assert.match(missing.elements['air-control-dock-status'].textContent,/nur in der angemeldeten/);
});
test('Control Center save adapter uses real profile store, survives restart and recovers after IO failure',async()=>{
  const os=require('node:os');
  const {createStore}=require('../src/main/preferences.cjs');
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'air-control-prefs-'));
  try {
    const store=createStore({root:()=>folder});
    const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
    let cache=store.load('alice'),fail=false,applied=0;
    const context={airSettingsWrites:Promise.resolve(),airSettingsLoad:Promise.resolve(),
      window:{airOS:{preferences:{update(patch){if(fail)throw new Error('disk full');return store.update('alice',patch);}}}},
      readAirSettings:()=>({...cache}),applyAirSettings(value){cache=value;applied++;},airSettingsCache:cache};
    vm.createContext(context);
    vm.runInContext(source.slice(source.indexOf('function persistAirDockTheme('),source.indexOf('const airSettingsLoad=')),context);
    await context.persistAirDockTheme('modern');
    assert.equal(cache.dockTheme,'modern');assert.equal(applied,1);
    assert.equal(createStore({root:()=>folder}).load('alice').dockTheme,'modern');
    assert.equal(store.load('bob').dockTheme,'classic');
    fail=true;await assert.rejects(context.persistAirDockTheme('classic'),/disk full/);
    assert.equal(cache.dockTheme,'modern');assert.equal(applied,1);
    assert.equal(store.load('alice').dockTheme,'modern');
    fail=false;await context.persistAirDockTheme('classic');
    assert.equal(cache.dockTheme,'classic');assert.equal(store.load('alice').dockTheme,'classic');
    await assert.rejects(context.persistAirDockTheme('unknown'),/Dock-Theme/);
  }finally{fs.rmSync(folder,{recursive:true,force:true});}
});

test('Island shows only the latest real Notes save signal without content or focus interruption',()=>{
  const h=setup(),notice=h.elements['air-island-note-notice'],message=h.elements['air-island-note-message'],time=h.elements['air-island-note-time'];
  assert.equal(notice.hidden,true);assert.equal(message.textContent,'');
  h.document.emit('air-notes-saved',{detail:{title:'Private title',body:'<script>secret</script>'}});
  assert.equal(notice.hidden,false);assert.equal(message.textContent,'Notiz im Air-OS-Profil gespeichert.');
  assert.equal(time.dateTime,'2026-10-22T13:04:00.000Z');
  assert.equal(h.elements['air-island-panel'].hidden,true);assert.equal(h.active,null);
  h.tick();h.document.emit('air-notes-saved');assert.equal(time.dateTime,'2026-10-22T13:05:00.000Z');
  assert.equal(message.textContent,'Notiz im Air-OS-Profil gespeichert.');
  h.window.emit('pagehide');assert.equal(notice.hidden,true);assert.equal(message.textContent,'');
  assert.equal(time.dateTime,'');
  h.document.emit('air-notes-saved');assert.equal(notice.hidden,true,'Disposed document no longer receives notifications');
  const fresh=setup();assert.equal(fresh.elements['air-island-note-notice'].hidden,true,'New profile document starts empty');
});

test('Modern exit is brief and inert immediately; Escape returns focus before visual completion',()=>{
 const h=setup({settings:{desktopTheme:'modern'},motion:true}),trigger=h.elements['air-island-toggle'],panel=h.elements['air-island-panel'];
 trigger.emit('click');h.elements['air-island-close'].emit('click');
 assert.equal(trigger.attrs['aria-expanded'],'false');assert.equal(panel.inert,true);assert.equal(panel.hidden,false);assert.equal(h.active,trigger);
 assert.equal(h.motions.length,1);assert.equal(h.motions[0].config.duration,140);h.motions[0].finish();assert.equal(panel.hidden,true);assert.equal(panel.inert,false);
});
test('reopening cancels stale exit; switching theme, hiding document and disposing cancel animations safely',()=>{
 const h=setup({settings:{desktopTheme:'modern'},motion:true}),trigger=h.elements['air-island-toggle'],panel=h.elements['air-island-panel'];
 trigger.emit('click');h.elements['air-island-close'].emit('click');const old=h.motions[0],stale=old.onfinish;trigger.emit('click');
 assert.equal(old.cancelled,undefined);assert.equal(old.reversals,2);assert.equal(panel.hidden,false);assert.equal(panel.inert,false);stale();assert.equal(panel.hidden,false);old.finish();assert.equal(panel.hidden,false);
 h.elements['air-island-close'].emit('click');h.settings({desktopTheme:'classic'});assert.equal(panel.hidden,true);
 h.settings({desktopTheme:'modern'});trigger.emit('click');h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(panel.hidden,true);assert.equal(h.timers.size,0);
 h.document.hidden=false;h.document.emit('visibilitychange');trigger.emit('click');h.elements['air-island-close'].emit('click');h.window.emit('pagehide');assert.equal(panel.hidden,true);assert.equal(h.timers.size,0);
});
test('both reduced-motion preferences bypass Modern exit animation; Classic stays immediate',()=>{
 for(const options of [{settings:{desktopTheme:'modern',reduceMotion:true}},{settings:{desktopTheme:'modern'},reduced:true},{settings:{desktopTheme:'classic'}}]){
  const h=setup({...options,motion:true});h.elements['air-island-toggle'].emit('click');h.elements['air-island-close'].emit('click');assert.equal(h.elements['air-island-panel'].hidden,true);assert.equal(h.motions.length,0);
 }
});
test('opening Island first dismisses the existing start menu without replacing either component',()=>{
 const h=setup({startMenu:true});h.elements['air-island-toggle'].emit('click');assert.equal(h.elements['air-start-menu'].hidden,true);assert.equal(h.elements['air-island-panel'].hidden,false);assert.equal(h.active,h.elements['air-island-close']);
});

test('reference status line shares the real clock; Desktop tile confirms writes and reports failed writes',async()=>{
 let fail=true;const h=setup({controls:true,settings:{desktopTheme:'modern'},desktopSave:async()=>{if(fail)throw Error('disk full');h.settings({desktopTheme:'classic'})}}),tile=h.elements['air-control-desktop-theme'];
 assert.equal(h.elements['air-control-clock'].textContent,h.elements['air-island-clock'].textContent);
 await tile.emit('click');assert.match(h.elements['air-control-dock-status'].textContent,/nicht gespeichert/);assert.equal(tile.attrs['aria-pressed'],'true');
 fail=false;await tile.emit('click');assert.equal(tile.attrs['aria-pressed'],'false');assert.match(h.elements['air-control-dock-status'].textContent,/gespeichert/);
 h.window.emit('pagehide');await tile.emit('click');assert.equal(tile.attrs['aria-pressed'],'false');
});
test('Volume controls only a loaded local Air Music audio element and releases its listener on close',()=>{
 const handlers=new Map(),audio={src:'blob:local-test',volume:.75,addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:name=>handlers.delete(name)};
 const h=setup({controls:true,audio}),volume=h.elements['air-control-volume'];h.elements['air-island-toggle'].emit('click');
 assert.equal(volume.disabled,false);assert.equal(h.elements['air-control-volume-value'].textContent,'75%');volume.value='32';volume.emit('input');assert.equal(audio.volume,.32);
 audio.volume=.6;handlers.get('volumechange')();assert.equal(volume.value,'60');h.elements['air-island-close'].emit('click');assert.equal(handlers.size,0);
 const unavailable=setup({controls:true});unavailable.elements['air-island-toggle'].emit('click');assert.equal(unavailable.elements['air-control-volume'].disabled,true);assert.equal(unavailable.elements['air-control-volume-value'].textContent,'—');
});
test('notification shortcut is available only after a real Notes signal and is cleared on profile disposal',()=>{
 const h=setup({controls:true}),button=h.elements['air-control-notice'];assert.equal(button.disabled,true);
 h.document.emit('air-notes-saved');assert.equal(button.disabled,false);button.emit('click');assert.equal(h.active,h.elements['air-island-note-notice']);
 h.window.emit('pagehide');assert.equal(button.disabled,true);assert.equal(h.elements['air-island-note-message'].textContent,'');
});
const quickApps={home:{id:'home',name:'Air Home'},notes:{id:'notes',name:'Notizen',iconClass:'notes-icon'},reminders:{id:'reminders',name:'Air Erinnerungen',iconClass:'reminders-icon'},finder:{id:'finder',name:'Finder',iconClass:'finder-icon'}};
const quickIcons={launchpad:'<svg data-icon="pear"></svg>',notes:'<svg data-icon="notes"></svg>',reminders:'<svg data-icon="reminders"></svg>',finder:'<svg data-icon="finder"></svg>'};
function quickSetup(extra={}){return setup({quick:true,apps:quickApps,icons:quickIcons,settings:{desktopTheme:'modern'},...extra})}
test('Island defaults to Control Center; view buttons switch hidden/inert content and reset on next open',()=>{
 const h=quickSetup(),e=h.elements;e['air-island-toggle'].emit('click');assert.equal(e['air-island-view-control'].attrs['aria-pressed'],'true');assert.equal(e['air-island-quick'].hidden,true);assert.equal(e['air-island-quick'].inert,true);
 e['air-island-view-quick'].emit('click');assert.equal(e['air-island-controls'].hidden,true);assert.equal(e['air-island-controls'].inert,true);assert.equal(e['air-island-view-quick'].attrs['aria-pressed'],'true');assert.equal(e['air-island-title'].textContent,'Schnellzugriff');assert.equal(e['air-island-quick-cards'].children.length,4);
 e['air-island-view-control'].emit('click');assert.equal(e['air-island-controls'].hidden,false);e['air-island-view-quick'].emit('click');e['air-island-close'].emit('click');e['air-island-toggle'].emit('click');assert.equal(e['air-island-controls'].hidden,false);assert.equal(e['air-island-quick'].hidden,true);
});
test('quick cards use registered names and existing icons; four launches reuse openApp then close and focus existing window',async()=>{
 for(const id of ['home','notes','reminders','finder']){
  const calls=[];let focused=false;const openApps=new Map([[id,{querySelectorAll:()=>[{getClientRects:()=>[{}],closest:()=>null,focus(){focused=true}}]}]]);
  const h=quickSetup({openApps,launch:app=>{calls.push(app);assert.equal(h.elements['air-island-panel'].hidden,false);return{ok:true}}}),e=h.elements;
  e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');const card=e['air-island-quick-cards'].children.find(card=>card.dataset.quickApp===id);
  assert.equal(card.children[1].children[0].textContent,quickApps[id].name);assert.equal(card.children[0].innerHTML,quickIcons[id==='home'?'launchpad':id]);
  await card.emit('click',{stopPropagation(){}});assert.deepEqual(calls,[id]);assert.equal(e['air-island-panel'].hidden,true);assert.equal(focused,true);
 }
});
test('quick launch failure keeps retry and suppresses duplicate starts; stale completion does not alter reopened panel',async()=>{
 let resolve,calls=0;const h=quickSetup({launch:()=>{calls++;return new Promise(r=>resolve=r)}}),e=h.elements;e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');const card=e['air-island-quick-cards'].children[0];const first=card.emit('click',{stopPropagation(){}});await card.emit('click',{stopPropagation(){}});assert.equal(calls,1);resolve({ok:false});await first;assert.match(e['air-island-quick-status'].textContent,/erneut versuchen/);assert.equal(e['air-island-panel'].hidden,false);
 const retry=card.emit('click',{stopPropagation(){}});e['air-island-close'].emit('click');e['air-island-toggle'].emit('click');resolve({ok:true});await retry;assert.equal(e['air-island-panel'].hidden,false);assert.equal(e['air-island-controls'].hidden,false);
});
test('Classic hides new navigation and quick content; switching profiles/pagehide removes registry listener',()=>{
 const h=quickSetup(),e=h.elements;e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');h.settings({desktopTheme:'classic'});assert.equal(e['air-island-views'].hidden,true);assert.equal(e['air-island-quick'].hidden,true);assert.equal(e['air-island-controls'].hidden,false);h.window.emit('pagehide');assert.equal(e['air-island-panel'].hidden,true);assert.equal(h.window.registryStopped,true);
});
test('registry names remain safe text and missing app cannot falsely launch',async()=>{
 const apps={...quickApps,notes:{id:'notes',name:'<img src=x onerror=alert(1)>'},finder:undefined};const calls=[],h=quickSetup({apps,launch:id=>calls.push(id)}),e=h.elements;e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');const cards=e['air-island-quick-cards'].children;assert.equal(cards[1].children[1].children[0].textContent,'<img src=x onerror=alert(1)>');assert.equal(cards[1].children[1].children[0].innerHTML,undefined);assert.equal(cards[3].disabled,true);await cards[3].emit('click',{stopPropagation(){}});assert.deepEqual(calls,[]);
});
test('quick app focus skips hidden Finder editor and uses visible existing content',async()=>{
 let focused=false;const openApps=new Map([['finder',{querySelectorAll:()=>[{getClientRects:()=>[],focus(){assert.fail('hidden editor focused')}},{getClientRects:()=>[{}],closest:()=>null,focus(){focused=true}}]}]]);
 const h=quickSetup({openApps}),e=h.elements;e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');await e['air-island-quick-cards'].children[3].emit('click',{stopPropagation(){}});assert.equal(focused,true);assert.equal(e['air-island-panel'].hidden,true);
});

test('M1 reverses the same timeline from its live time, including rapid repeated direction changes',()=>{
 const h=setup({settings:{desktopTheme:'modern'},motion:true}),e=h.elements;
 e['air-island-toggle'].emit('click');const motion=h.motions[0];assert.equal(motion.currentTime,0);assert.equal(motion.playbackRate,1);
 motion.currentTime=57;const staleOpen=motion.onfinish;e['air-island-close'].emit('click');const staleClose=motion.onfinish;
 assert.equal(motion.currentTime,57);assert.equal(motion.playbackRate,-1);assert.equal(e['air-island-panel'].inert,true);
 e['air-island-toggle'].emit('click');assert.equal(motion.currentTime,57);assert.equal(motion.playbackRate,1);assert.equal(e['air-island-panel'].inert,false);
 staleOpen();staleClose();assert.equal(motion.cancelled,undefined);assert.equal(e['air-island-panel'].hidden,false);
 for(let i=0;i<10;i++)e['air-island-toggle'].emit('click');assert.equal(h.motions.length,1);assert.equal(motion.currentTime,57);
 motion.finish();assert.equal(motion.cancelled,true);assert.equal(e['air-island-panel'].hidden,false);
 e['air-island-close'].emit('click');assert.equal(h.motions[1].currentTime,140);assert.equal(h.motions[1].playbackRate,-1);h.motions[1].finish();assert.equal(e['air-island-panel'].hidden,true);
});
test('M1 interrupted quick view keeps its contents, fresh open resets control, close invalidates pending launch',async()=>{
 let resolve;const h=quickSetup({motion:true,launch:()=>new Promise(r=>resolve=r)}),e=h.elements;
 e['air-island-toggle'].emit('click');e['air-island-view-quick'].emit('click');
 const pending=e['air-island-quick-cards'].children[0].emit('click',{stopPropagation(){}});
 e['air-island-close'].emit('click');e['air-island-toggle'].emit('click');resolve({ok:true});await pending;
 assert.equal(e['air-island-panel'].hidden,false);assert.equal(e['air-island-quick'].hidden,false);
 e['air-island-close'].emit('click');h.motions[0].finish();e['air-island-toggle'].emit('click');assert.equal(e['air-island-controls'].hidden,false);
});
test('M1 reduced-motion changes settle safely and stale callbacks after disposal cannot reopen',()=>{
 const h=setup({settings:{desktopTheme:'modern'},motion:true}),e=h.elements;
 e['air-island-toggle'].emit('click');const stale=h.motions[0].onfinish;
 h.settings({desktopTheme:'modern',reduceMotion:true});assert.equal(h.motions[0].cancelled,true);assert.equal(e['air-island-panel'].hidden,false);
 e['air-island-close'].emit('click');assert.equal(e['air-island-panel'].hidden,true);
 h.window.emit('pagehide');stale();assert.equal(e['air-island-panel'].hidden,true);
});
