'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
function setup(options={}){
 let settings={desktopTheme:'modern',...options.settings},focused=null;const motions=[],events=[],raf=[],listeners={},openApps=new Map(),dock={hidden:false,focus(){focused=dock}};
 const media={matches:!!options.reduced,addEventListener(_,fn){this.change=fn},removeEventListener(){this.change=null}};
 const document={hidden:false,get activeElement(){return focused},querySelector:()=>dock,addEventListener:(n,fn)=>listeners[n]=fn,removeEventListener:n=>delete listeners[n],querySelectorAll:()=>[]};
 const window={matchMedia:()=>media,addEventListener:(n,fn)=>listeners[n]=fn};
 const context={window,document,openApps,readAirSettings:()=>settings,appDockRect:()=>({left:500,top:900,width:52,height:52}),zIndex:1,requestAnimationFrame:fn=>raf.push(fn),innerWidth:1920,innerHeight:1080,appNames:{notes:'Notizen',finder:'Finder'},lifecycle:{transition:(id,state)=>events.push({id,state})},$:()=>({textContent:''})};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function dockMotionValues('),source.indexOf('function clampAppWindow(')),context);
 function win(id='notes'){
  const classes=new Set(),style={display:'flex',transition:'',pointerEvents:'auto',removeProperty(k){delete this[k]}};
  const close={focus(){focused=close},isConnected:true};
  const w={style,isConnected:true,classList:{contains:c=>classes.has(c),add(...c){c.forEach(v=>classes.add(v))},remove(...c){c.forEach(v=>classes.delete(v))}},contains:e=>e===close,querySelector:()=>close,getBoundingClientRect:()=>({left:100,top:100,width:800,height:500})};
  if(options.animate!==false)w.animate=(frames,config)=>{const a={frames,config,playbackRate:1,pause(){},play(){},reverse(){this.playbackRate*=-1},cancel(){this.cancelled=true},finish(){this.onfinish?.()}};motions.push(a);return a};
  openApps.set(id,w);return w;
 }
 return{...context,context,win,motions,events,raf,listeners,media,dock,get focused(){return focused},settings:s=>{settings=s;listeners['air-settings-changed']?.()}};
}
test('Modern uses one live timeline for minimize/restore/minimize, rejecting stale callbacks and preserving geometry',()=>{
 const h=setup(),w=h.win();h.animateAppWindowIntoDock(w,'notes');const a=h.motions[0];a.currentTime=187;const old=a.onfinish;
 h.animateAppWindowFromDock(w,'notes');assert.equal(h.motions.length,1);assert.equal(a.currentTime,187);assert.equal(a.playbackRate,-1);assert.equal(w.style.pointerEvents,'auto');old();assert.equal(w.style.display,'flex');assert.equal(a.cancelled,undefined);
 const restore=a.onfinish;h.animateAppWindowIntoDock(w,'notes');assert.equal(a.currentTime,187);assert.equal(a.playbackRate,1);assert.equal(w.style.pointerEvents,'none');restore();assert.equal(w.style.display,'flex');a.finish();assert.equal(w.style.display,'none');assert.equal(w._airOSMotion,null);assert.equal(w.style.transition,'');
 h.animateAppWindowFromDock(w,'notes');assert.equal(h.motions[1].currentTime,410);assert.equal(h.motions[1].playbackRate,-1);h.motions[1].finish();assert.equal(w.style.display,'flex');assert.equal(w.style.pointerEvents,'auto');assert.deepEqual(w.getBoundingClientRect(),{left:100,top:100,width:800,height:500});
});
test('close during minimizing replaces completion, reopening cancels close; close during restoring runs once',()=>{
 const h=setup(),w=h.win();let closed=0;h.animateAppWindowIntoDock(w,'notes');const a=h.motions[0],old=a.onfinish;
 h.animateAppWindowIntoDock(w,'notes',()=>closed++);old();assert.equal(closed,0);const closing=a.onfinish;h.animateAppWindowFromDock(w,'notes');closing();assert.equal(closed,0);assert.equal(w.style.display,'flex');
 h.animateAppWindowIntoDock(w,'notes',()=>closed++);a.finish();a.finish();assert.equal(closed,1);assert.equal(w.style.display,'none');
});
test('separate windows keep independent motions; cleanup/disconnected old windows cannot hide a reopened instance',()=>{
 const h=setup(),a=h.win('notes'),b=h.win('finder');h.animateAppWindowIntoDock(a,'notes');h.animateAppWindowIntoDock(b,'finder');const stale=h.motions[0].onfinish;
 h.clearDockMotion(a);const fresh=h.win('notes');stale();assert.equal(fresh.style.display,'flex');assert.equal(a.style.pointerEvents,'auto');assert.equal(a._airOSMotion,null);h.motions[1].finish();assert.equal(b.style.display,'none');
 h.animateAppWindowIntoDock(fresh,'notes');fresh.isConnected=false;h.motions[2].finish();assert.equal(fresh.style.display,'flex');h.listeners.pagehide();assert.ok(h.motions[2].cancelled);assert.equal(h.media.change,null);
});
test('Reduced Motion, unsupported WAAPI and runtime settings/media/visibility changes settle the latest intent',()=>{
 for(const options of [{settings:{reduceMotion:true}},{reduced:true},{animate:false}]){
  const h=setup(options),w=h.win();h.animateAppWindowIntoDock(w,'notes');assert.equal(w.style.display,'none');h.animateAppWindowFromDock(w,'notes');assert.equal(w.style.display,'flex');assert.equal(h.motions.length,0);
 }
 const h=setup(),w=h.win();h.animateAppWindowIntoDock(w,'notes');h.settings({desktopTheme:'modern',reduceMotion:true});assert.equal(w.style.display,'none');assert.ok(h.motions[0].cancelled);
 h.settings({desktopTheme:'modern'});h.animateAppWindowFromDock(w,'notes');h.media.matches=true;h.media.change();assert.equal(w.style.display,'flex');assert.equal(w._airOSMotion,null);
 h.media.matches=false;h.animateAppWindowIntoDock(w,'notes');h.document.hidden=true;h.listeners.visibilitychange();assert.equal(w.style.display,'none');
});
test('closing an already hidden Modern window never flashes it or starts another animation',()=>{
 const h=setup(),w=h.win();w.style.display='none';let closed=0;h.animateAppWindowIntoDock(w,'notes',()=>closed++);assert.equal(closed,1);assert.equal(w.style.display,'none');assert.equal(h.motions.length,0);
});
test('Classic retains original 410ms minimization frames and synchronous restore path',()=>{
 const h=setup({settings:{desktopTheme:'classic'}}),w=h.win();h.animateAppWindowIntoDock(w,'notes');assert.equal(w._airOSDockMotion,undefined);assert.equal(h.motions[0].config.duration,410);assert.equal(h.motions[0].frames[1].borderRadius,'24px');h.motions[0].finish();assert.equal(w.style.display,'none');h.animateAppWindowFromDock(w,'notes');assert.equal(w.style.display,'flex');assert.equal(h.raf.length,1);
});
test('existing openApp restores an in-flight minimized window, lifecycle focused; repeated restore launch does not reverse',()=>{
 const h=setup(),w=h.win();vm.runInContext(source.slice(source.indexOf('function openApp(id){'),source.indexOf(' const win=document.createElement("section");'))+'return {ok:false};}',h.context);
 h.animateAppWindowIntoDock(w,'notes');const a=h.motions[0];a.currentTime=200;h.context.openApp('notes');assert.equal(a.playbackRate,-1);assert.equal(w.style.pointerEvents,'auto');assert.equal(h.events.at(-1).state,'focused');h.context.openApp('notes');assert.equal(a.playbackRate,-1);assert.equal(h.motions.length,1);
});
