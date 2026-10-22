'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function setup() {
  const elements = {};
  let active = null, now = new Date('2026-10-22T13:04:00Z'), settings = {clock24:true};
  function element(id) {
    const handlers = new Map();
    const el = {hidden:id==='air-island-panel', attrs:{}, textContent:'',
      addEventListener(type, fn) { handlers.set(type, fn); },
      removeEventListener(type, fn) { if(handlers.get(type)===fn) handlers.delete(type); },
      emit(type, event={}) { handlers.get(type)?.(event); },
      focus() { active=el; },
      setAttribute(key, value) { el.attrs[key]=value; },
      classList:{add(){},remove(){}}
    };
    elements[id]=el; return el;
  }
  const document=element('document'), window=element('window');
  for(const id of ['air-island','air-island-toggle','air-island-panel','air-island-close','air-island-clock','desktop']) element(id);
  document.querySelector=selector=>elements[selector.slice(1)];
  const inside=new Set(Object.values(elements).filter(el=>el!==document && el!==window));
  elements['air-island'].contains=target=>inside.has(target);
  const timers=new Map(); let serial=0;
  class Clock extends Date { constructor(){super(now.getTime());} }
  vm.runInNewContext(fs.readFileSync(path.join(root,'air-island.js'),'utf8'), {
    window, document, Date:Clock, readAirSettings:()=>settings,
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
