'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function setup(options = {}) {
  const elements = {};
  let active = null, now = new Date('2026-10-22T13:04:00Z'), settings = {clock24:true};
  function element(id) {
    const handlers = new Map();
    const el = {hidden:id==='air-island-panel', attrs:{}, textContent:'',
      addEventListener(type, fn) { handlers.set(type, fn); },
      removeEventListener(type, fn) { if(handlers.get(type)===fn) handlers.delete(type); },
      emit(type, event={}) { return handlers.get(type)?.(event); },
      focus() { active=el; },
      setAttribute(key, value) { el.attrs[key]=value; },
      getAttribute(key) { return el.attrs[key]; },
      classList:{add(){},remove(){}}
    };
    elements[id]=el; return el;
  }
  const document=element('document'), window=element('window');
  for(const id of ['air-island','air-island-toggle','air-island-panel','air-island-close','air-island-clock','desktop','air-control-dock-theme','air-control-dock-value','air-control-dock-status']) element(id);
  document.querySelector=selector=>elements[selector.slice(1)];
  if(options.available!==false)window.airOS={preferences:{}};
  const save=options.save || (async dockTheme=>{settings={...settings,dockTheme};document.emit('air-settings-changed');});
  const inside=new Set(Object.values(elements).filter(el=>el!==document && el!==window));
  elements['air-island'].contains=target=>inside.has(target);
  const timers=new Map(); let serial=0;
  class Clock extends Date { constructor(){super(now.getTime());} }
  vm.runInNewContext(fs.readFileSync(path.join(root,'air-island.js'),'utf8'), {
    window, document, Date:Clock, readAirSettings:()=>settings, persistAirDockTheme:save,
    setInterval(fn){timers.set(++serial,fn);return serial;},clearInterval(id){timers.delete(id);}
  });
  return {elements,document,window,timers,get active(){return active;},
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
