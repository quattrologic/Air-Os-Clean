'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const layout=require('../maclock-layout.js');
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
class El extends EventTarget{
 constructor(){super();this.children=[];this.value='';this.hidden=false;this.textContent='';this.disabled=false;this.attrs={};this.classes=new Set();this.classList={toggle:(k,v)=>{if(v===undefined)v=!this.classes.has(k);v?this.classes.add(k):this.classes.delete(k)},contains:k=>this.classes.has(k)};this.style={setProperty:(k,v)=>this.attrs[k]=v};this.nodes={};}
 setAttribute(k,v){this.attrs[k]=v}replaceChildren(){this.children=[]}appendChild(e){this.children.push(e)}
 querySelectorAll(){return this.children}querySelector(s){return s==='button'?this.children[0]:(this.nodes[s]||=new El())}
 set innerHTML(s){assert.equal(s,'<span class="saved-account-avatar"></span><span></span>');this.markup=s}
 focus(){if(this.doc.activeElement===this)return;const previous=this.doc.activeElement;this.doc.activeElement=this;previous?.dispatchEvent(new Event('blur'));this.dispatchEvent(new Event('focus'))}
 blur(){if(this.doc.activeElement===this)this.doc.activeElement=null;this.dispatchEvent(new Event('blur'))}
}
function fixture(options={}){
 const ids=['login-form','create-form','saved-accounts','login-error','create-error','login-password','login-submit','switch-create','switch-login','login-username','login-profile-name','login-profile-subtitle','login-avatar','retry-accounts','create-display-name','create-username','create-password','create-confirm','create-submit','login-clock','maclock-date','login-caps','sleep-overlay','sleep-button','restart-button','shutdown-button'];
 const nodes=Object.fromEntries(ids.map(k=>[k,new El()]));nodes['sleep-overlay'].hidden=true;
 const document=new EventTarget();document.body=new El();document.documentElement={lang:'de'};document.querySelector=s=>nodes[s.slice(1)];document.createElement=()=>{const e=new El();e.doc=document;return e};document.activeElement=null;document.hidden=false;document.body.doc=document;for(const e of Object.values(nodes))e.doc=document;
 const window=new EventTarget(),calls=[];window.innerHeight=1080;window.airMacLockLayout=layout;window.airOS={accounts:options.accounts||async function(){return[{username:'alice',displayName:'Alice'},{username:'bob',displayName:'<img src=x onerror=1>'}]},login:async p=>{calls.push(p);return options.login?options.login(p):{ok:false,error:'Incorrect Air-OS password'}},createAccount:async p=>{calls.push(p);return options.create?options.create(p):{ok:false,error:'Already exists'}}};
 const timers=new Map();let id=0;vm.runInNewContext(fs.readFileSync(require.resolve('../login.js'),'utf8'),{window,document,AbortController,Date,Intl,Event,setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:id=>timers.delete(id),console});
 const emit=(target,type,extras={})=>{const e=new Event(type,{cancelable:true});Object.defineProperties(e,Object.fromEntries(Object.entries(extras).map(([k,value])=>[k,{value}])));target.dispatchEvent(e);return e};
 return{nodes,document,window,calls,timers,emit,input:value=>{nodes['login-password'].value=value;emit(nodes['login-password'],'input')}};
}
test('MacLock settled geometry retains original height unit, anchors and sizes at all target viewports',()=>{
 for(const [h,u] of [[1080,.9],[930,.775],[600,.6]]){
  const a=layout.layout(h),b=layout.layout(h,true);assert.equal(a.u,u);assert.equal(a.clockTop,h*.075);assert.equal(a.clockPx,176*u);assert.equal(a.loginBottom,78*u);assert.equal(a.avatar,70*u);assert.equal(a.passwordWidth,210*u);assert.equal(b.passwordWidth,236*u);assert.equal(a.passwordHeight,36*u);
 }
});
test('original H:mm and 12-hour clock have no suffix; date retains localized dddd MMMM d pattern',()=>{
 const midnight=new Date(2026,9,24,0,3);assert.equal(layout.time(midnight),'0:03');assert.equal(layout.time(midnight,false),'12:03');assert.equal(layout.time(new Date(2026,9,24,14,9),false),'2:09');assert.equal(layout.date(midnight,'en-US'),'Saturday, October 24');assert.equal(layout.date(midnight,'de-DE'),'Samstag, Oktober 24');
});
test('public profile names and avatar fallback are text, existing account identity reaches only the existing login bridge',async()=>{
 const h=fixture();await tick();h.nodes['saved-accounts'].children[1].dispatchEvent(new Event('click'));assert.equal(h.nodes['login-profile-name'].textContent,'<img src=x onerror=1>');assert.equal(h.nodes['login-avatar'].textContent,'<');h.input('test-password');h.emit(h.nodes['login-form'],'submit');await tick();assert.equal(h.calls[0].username,'bob');assert.equal(h.calls[0].password,'test-password');assert.equal(h.nodes['login-password'].value,'');assert.match(h.nodes['login-error'].textContent,/Incorrect/);
});
test('pending login blocks duplicate submissions, mode and profile switches; failure preserves selected profile and allows retry',async()=>{
 const pending=deferred(),h=fixture({login:()=>pending.promise});await tick();h.input('one');h.emit(h.nodes['login-form'],'submit');h.emit(h.nodes['login-form'],'submit');h.nodes['saved-accounts'].children[1].dispatchEvent(new Event('click'));h.emit(h.nodes['switch-create'],'click');assert.equal(h.calls.length,1);assert.equal(h.nodes['login-username'].value,'alice');assert.equal(h.document.body.classList.contains('is-creating'),false);assert.equal(h.nodes['login-password'].readOnly,true);pending.resolve({ok:false,error:'Denied'});await tick();assert.equal(h.nodes['login-submit'].disabled,false);assert.equal(h.nodes['login-password'].value,'');h.input('retry');h.emit(h.nodes['login-form'],'submit');await tick();assert.equal(h.calls.length,2);
});
test('bridge failure is visible, empty submissions do not authenticate, and client success never pretends to unlock',async()=>{
 const h=fixture({login:()=>Promise.reject(Error('failure'))});await tick();h.emit(h.nodes['login-form'],'submit');assert.equal(h.calls.length,0);h.input('value');h.emit(h.nodes['login-form'],'submit');await tick();assert.match(h.nodes['login-error'].textContent,/erneut/);assert.equal(h.nodes['login-password'].value,'');
 const good=fixture({login:async()=>({ok:true})});await tick();good.input('value');good.emit(good.nodes['login-form'],'submit');await tick();assert.equal(good.calls.length,1);assert.equal(good.nodes['login-error'].textContent,'');assert.equal(good.nodes['login-password'].value,'');
});
test('first profile uses the existing account creation path, mismatch avoids writes and failures allow retry',async()=>{
 const h=fixture({accounts:async()=>[]});await tick();assert.equal(h.document.body.classList.contains('is-creating'),true);h.nodes['create-password'].value='one';h.nodes['create-confirm'].value='two';h.emit(h.nodes['create-form'],'submit');assert.equal(h.calls.length,0);assert.match(h.nodes['create-error'].textContent,/überein/);h.nodes['create-confirm'].value='one';h.nodes['create-display-name'].value='Test';h.nodes['create-username'].value='test';h.emit(h.nodes['create-form'],'submit');await tick();assert.equal(h.calls.length,1);assert.equal(h.calls[0].displayName,'Test');assert.equal(h.nodes['create-password'].value,'');assert.equal(h.nodes['create-submit'].disabled,false);
});
test('account read failure remains locked and exposes retry without inventing an authenticated user',async()=>{
 let fail=true;const h=fixture({accounts:async()=>{if(fail)throw Error('read failure');return[{username:'alice',displayName:'Alice'}]}});await tick();assert.equal(h.nodes['retry-accounts'].hidden,false);assert.equal(h.nodes['login-submit'].disabled,true);h.input('secret');h.emit(h.nodes['login-form'],'submit');assert.equal(h.calls.length,0);fail=false;h.emit(h.nodes['retry-accounts'],'click');await tick();assert.equal(h.nodes['retry-accounts'].hidden,true);assert.equal(h.nodes['login-submit'].disabled,false);
});
test('keyboard activates the actual password input, Escape clears it, and Caps Lock only reflects real key state',async()=>{
 const h=fixture();await tick();h.emit(h.document,'keydown',{key:'x',target:h.document.body});assert.equal(h.nodes['login-password'].value,'x');assert.equal(h.document.activeElement,h.nodes['login-password']);h.emit(h.nodes['login-password'],'keydown',{getModifierState:()=>true});assert.equal(h.nodes['login-caps'].hidden,false);h.emit(h.document,'keydown',{key:'Escape'});assert.equal(h.nodes['login-password'].value,'');assert.equal(h.document.body.classList.contains('is-engaged'),false);
});
test('clock pauses while hidden; pagehide clears secrets, timers and late account/auth responses',async()=>{
 const pending=deferred(),h=fixture({login:()=>pending.promise});await tick();assert.equal(h.timers.size,1);h.document.hidden=true;h.emit(h.document,'visibilitychange');assert.equal(h.timers.size,0);h.document.hidden=false;h.emit(h.document,'visibilitychange');assert.equal(h.timers.size,1);h.input('secret');h.emit(h.nodes['login-form'],'submit');h.emit(h.window,'pagehide');assert.equal(h.nodes['login-password'].value,'');assert.equal(h.timers.size,0);pending.resolve({ok:false,error:'Late private error'});await tick();assert.equal(h.nodes['login-error'].textContent,'');const load=deferred(),late=fixture({accounts:()=>load.promise});late.emit(late.window,'pagehide');load.resolve([{username:'late',displayName:'Late'}]);await tick();assert.equal(late.nodes['login-profile-name'].textContent,'');
});
test('ported source, exact original font assets, separate OFL/MIT notices and local resources ship with the existing package',()=>{
 const pkg=require('../package.json');for(const name of ['maclock-layout.js','maclock-wallpaper.svg','third_party/maclock/**/*'])assert.ok(pkg.build.files.includes(name));
 const hash=n=>crypto.createHash('sha256').update(fs.readFileSync(require.resolve('../third_party/maclock/fonts/OpenRunde-'+n+'.otf'))).digest('hex');assert.equal(hash('Regular'),'8398c8adfc2b41a21cd1c0e00dbbd81c2ce3877cc5c9843bebd3e0b7b43cfbcc');assert.equal(hash('Semibold'),'39d6c706cfbb9cad2a7ea2bfdbe12c4384185d8625a21208a39cbdfe1ea1790c');
 assert.match(fs.readFileSync(require.resolve('../third_party/maclock/LICENSE'),'utf8'),/Copyright \(c\) 2026 Rickky/);assert.match(fs.readFileSync(require.resolve('../third_party/maclock/OpenRunde-LICENSE.txt'),'utf8'),/SIL OPEN FONT LICENSE/);
 const html=fs.readFileSync(require.resolve('../login.html'),'utf8'),css=fs.readFileSync(require.resolve('../login.css'),'utf8');assert.doesNotMatch(html,/status-battery|status-wifi|100%/);assert.match(html,/font-src 'self'/);assert.match(html,/Air-OS-Passwort/);assert.match(css,/prefers-reduced-motion/);
 const old=fs.readFileSync(require.resolve('../app.js'),'utf8'),svg=old.split('const AIR_MODERN_CLOUDS=`')[1].split('`;')[0];assert.equal(fs.readFileSync(require.resolve('../maclock-wallpaper.svg'),'utf8'),svg+'\n');
});
