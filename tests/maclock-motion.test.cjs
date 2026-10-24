'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),api=require('../maclock-motion.js');
const tick=()=>new Promise(r=>setImmediate(r)),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);
function fixture(){
 const rafs=new Map(),timers=new Map(),observers=[];let time=0,next=0,resolve,reject;
 class Element extends EventTarget{constructor(){super();this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v}}}
 const doc=new EventTarget();doc.body=new Element();doc.body.classes.add('maclock-motion-pending');doc.documentElement=new Element();doc.fonts={ready:Promise.resolve()};doc.hidden=false;
 const win=new EventTarget(),media=new EventTarget();media.matches=false;
 Object.assign(win,{document:doc,innerHeight:1080,innerWidth:1920,performance:{now:()=>time},AbortController,Event,matchMedia:()=>media,requestAnimationFrame:fn=>{rafs.set(++next,fn);return next},cancelAnimationFrame:id=>rafs.delete(id),setTimeout:(fn,delay)=>{timers.set(++next,{fn,delay});return next},clearTimeout:id=>timers.delete(id)});
 Object.defineProperty(win,'airOS',{get(){throw Error('Motion must not access authentication, passwords or profiles')}});
 win.Image=class{decode(){return new Promise((a,b)=>{resolve=a;reject=b})}removeAttribute(){}};
 win.MutationObserver=class{constructor(fn){this.fn=fn;observers.push(this)}observe(){}disconnect(){this.disconnected=true}};
 const c=api.mount(win);win.airMacLockMotionController=c;
 return{win,doc,media,c,rafs,timers,observers,ready:async()=>{resolve();await tick()},fail:async()=>{reject(Error('asset error'));await tick()},time:t=>time=t,frame:t=>{time=t;const list=[...rafs.values()];rafs.clear();for(const fn of list)fn()},classes:()=>observers.forEach(o=>o.fn())};
}
test('entry uses exact OutQuint, original 650ms targets and measured quarter states',()=>{
 for(const p of [.25,.5,.75,1]){const t=api.timeline();t.target(api.ENTER,650,100);const s=t.sample(100+650*p),q=1-(1-p)**5;near(s.opacity,q);near(s.zoom,1.09-.09*q);near(s.clockPosition,.035+.04*q);near(s.loginBottom,30+48*q);near(s.opacity*s.clockOpacity,q*q)}
});
test('password width is 450ms and blur/opacity use original 650ms 48*.55 controls',()=>{
 const t=api.timeline();t.target({fieldWidth:236,blur:.55,blurOpacity:1},{fieldWidth:450,blur:650,blurOpacity:650},0);const s=t.sample(225);near(s.fieldWidth,210+26*api.outQuint(.5));near(s.blur,.55*api.outQuint(225/650));near(s.blurOpacity,api.outQuint(225/650));assert.equal(t.sample(650).blur,.55);assert.equal(t.active(),false);
});
test('fast focus/blur reversals start exactly from current visible values without stale targets',()=>{
 const t=api.timeline();t.target({fieldWidth:236,blur:.55},{fieldWidth:450,blur:650},0);for(const time of [73,101,174,208,330]){const before=t.sample(time),opening=t.tracks().blur.to===0;t.target({fieldWidth:opening?236:210,blur:opening?.55:0},{fieldWidth:450,blur:650},time);assert.deepEqual(t.sample(time),before)}t.sample(2000);assert.equal(t.active(),false);
});
test('exit retains original per-property durations and can reverse safely without touching authentication',()=>{
 assert.deepEqual(api.EXIT_MS,{opacity:420,zoom:520,clockPosition:420,clockOpacity:300,loginBottom:380,loginOpacity:260});
 const t=api.timeline({...api.INITIAL,...api.ENTER});t.target(api.EXIT,api.EXIT_MS,0);const s=t.sample(260);assert.equal(s.loginOpacity,0);assert.ok(s.opacity>0);assert.ok(s.zoom<1.06);const before=t.sample(270);t.target(api.ENTER,650,270);assert.deepEqual(t.sample(270),before);assert.equal(t.sample(920).opacity,1);
});
test('startup waits for decoded wallpaper/fonts, then retires its 450ms safety timer',async()=>{
 const h=fixture();assert.equal(h.c.snapshot().ready,false);assert.equal(h.rafs.size,0);assert.equal([...h.timers.values()][0].delay,450);await h.ready();assert.equal(h.c.snapshot().reason,'wallpaper-ready');assert.equal(h.timers.size,0);h.frame(162.5);near(h.c.snapshot().values.opacity,api.outQuint(.25));h.frame(650);assert.equal(h.rafs.size,0);assert.equal(h.c.snapshot().active,false);h.c.destroy();
});
test('decoded wallpaper waits for initial material readiness without consuming entry time',async()=>{
 const h=fixture();let status='loading';h.win.airMacLockGlassController={snapshot:()=>({status})};await h.ready();assert.equal(h.c.snapshot().ready,false);assert.equal(h.rafs.size,0);status='webgl';h.time(120);h.doc.dispatchEvent(new CustomEvent('air-maclock-material-state',{detail:{status}}));assert.equal(h.c.snapshot().startedAt,120);assert.equal(h.c.snapshot().ready,true);assert.equal(h.timers.size,0);h.frame(770);assert.equal(h.c.snapshot().values.opacity,1);h.c.destroy();
});
test('confirmed authentication queues exit without synchronous material work or waiting for completion',async()=>{
 const h=fixture();await h.ready();h.frame(650);const paints=h.c.snapshot().paints;h.doc.dispatchEvent(new Event('air-login-confirmed'));assert.equal(h.c.snapshot().leaving,true);assert.equal(h.c.snapshot().paints,paints);assert.equal(h.rafs.size,1);h.win.dispatchEvent(new Event('pagehide'));assert.equal(h.rafs.size,0);assert.equal(h.c.snapshot().disposed,true);
});
test('wallpaper failure and timeout have bounded non-black functional fallback without late entry restart',async()=>{
 const failed=fixture();await failed.fail();assert.equal(failed.c.snapshot().reason,'wallpaper-error-fallback');failed.frame(650);assert.equal(failed.c.snapshot().values.opacity,1);failed.c.destroy();
 const h=fixture();h.time(450);[...h.timers.values()][0].fn();assert.equal(h.c.snapshot().reason,'wallpaper-timeout-fallback');const start=h.c.snapshot().startedAt;await h.ready();assert.equal(h.c.snapshot().startedAt,start);assert.equal(h.c.snapshot().reason,'wallpaper-timeout-fallback');h.c.destroy();
});
test('DOM and material events share the same frame; source geometry and mobile minimum remain unchanged',async()=>{
 const h=fixture();let event=0;h.doc.addEventListener('air-maclock-frame',()=>{event++;const s=h.c.snapshot();near(+h.doc.body.style.values['--maclock-motion-opacity'],s.values.opacity)});await h.ready();h.frame(650);h.doc.body.classes.add('is-engaged');h.classes();h.frame(875);near(h.c.snapshot().values.fieldWidth,210+26*api.outQuint(.5));h.win.innerWidth=390;h.win.innerHeight=600;h.win.dispatchEvent(new Event('resize'));assert.equal(+h.doc.body.style.values['--maclock-motion-fieldWidth'],210);assert.ok(event>0);h.c.destroy();
});
test('Reduced Motion and runtime change settle latest intents and leave no active RAF',async()=>{
 const h=fixture();h.media.matches=true;await h.ready();assert.equal(h.c.snapshot().values.opacity,1);assert.equal(h.rafs.size,0);h.doc.body.classes.add('is-engaged');h.classes();assert.equal(h.c.snapshot().values.blur,.55);assert.equal(h.rafs.size,0);h.media.matches=false;h.media.dispatchEvent(new Event('change'));h.doc.body.classes.delete('is-engaged');h.classes();h.frame(100);h.media.matches=true;h.media.dispatchEvent(new Event('change'));assert.equal(h.c.snapshot().values.blur,0);assert.equal(h.rafs.size,0);h.c.destroy();
});
test('context loss retires old RAF callback without clearing or jumping its replacement CSS continuation',async()=>{
 const h=fixture();await h.ready();h.frame(100);const stale=[...h.rafs.values()][0],before=h.c.snapshot().values;h.doc.dispatchEvent(new CustomEvent('air-maclock-material-state',{detail:{reason:'context-lost'}}));assert.equal(h.rafs.size,1);stale();assert.equal(h.c.snapshot().pendingFrame,true);assert.deepEqual(h.c.snapshot().values,before);h.frame(650);assert.equal(h.c.snapshot().values.opacity,1);assert.equal(h.rafs.size,0);h.c.destroy();
});
test('pagehide cancels timers/observers/frames; stale assets and callbacks never revive the old profile page',async()=>{
 const h=fixture();await h.ready();const stale=[...h.rafs.values()][0];h.win.dispatchEvent(new Event('pagehide'));stale();assert.equal(h.rafs.size,0);assert.equal(h.c.snapshot().disposed,true);assert.ok(h.observers.every(o=>o.disconnected));const late=fixture();late.c.destroy();await late.ready();assert.equal(late.rafs.size,0);assert.equal(late.timers.size,0);
});
test('hidden and account-creation views remain stable without background motion or reusing old exit intent',async()=>{
 const h=fixture();await h.ready();h.frame(100);h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(h.rafs.size,0);assert.equal(h.c.snapshot().values.opacity,1);h.doc.hidden=false;h.doc.dispatchEvent(new Event('visibilitychange'));h.c.leave();h.doc.body.classes.add('is-creating');h.classes();assert.equal(h.c.snapshot().leaving,false);assert.equal(h.c.snapshot().values.opacity,1);h.c.destroy();
});
test('confirmed-login signal contains no secret, no delay or unlock code; original material shaders and scope remain isolated',()=>{
 const login=fs.readFileSync(require.resolve('../login.js'),'utf8'),motion=fs.readFileSync(require.resolve('../maclock-motion.js'),'utf8'),pkg=require('../package.json');
 assert.match(login,/if \(!disposed && result\?\.ok\) document.dispatchEvent\(new Event\("air-login-confirmed"\)\)/);assert.doesNotMatch(motion,/\.value\b|airOS\.|location\.|login\(|createAccount\(/);assert.ok(pkg.build.files.includes('maclock-motion.js'));
});
