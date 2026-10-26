'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const src=fs.readFileSync('app.js','utf8'),start=src.indexOf('function persistAirSettingsConfirmed('),end=src.indexOf('function initAirSettings(',start);
 let session='alice',release,fail=false;const applied=[],requests=[];
 const c=vm.createContext({airSettingsWrites:Promise.resolve(),airSettingsLoad:Promise.resolve(),airSettingsCache:{dockSize:48},readAirSettings:()=>c.airSettingsCache,applyAirSettings:p=>applied.push(p),window:{airOS:{currentUser:async()=>({preferenceSession:session}),preferences:{update:(patch,owner)=>{requests.push(owner);return new Promise((yes,no)=>release=()=>fail?no(Error('offline')):yes(patch));}}}}});
 vm.runInContext(src.slice(start,end),c);return{c,applied,requests,release:()=>release(),session:v=>session=v,fail:v=>fail=v};
}
const tick=()=>new Promise(r=>setImmediate(r));
test('Tahoe settings applies only confirmed values through existing serialized queue',async()=>{const f=fixture(),pending=f.c.persistAirSettingsConfirmed({dockSize:50});await tick();a.equal(f.applied.length,0);a.deepEqual(f.requests,['alice']);f.release();await pending;a.equal(f.applied[0].dockSize,50);});
test('Tahoe failed save preserves acknowledged values and permits retry',async()=>{const f=fixture();f.fail(true);let p=f.c.persistAirSettingsConfirmed({reduceGlass:true});const rejected=a.rejects(p,/offline/);await tick();f.release();await rejected;a.equal(f.applied.length,0);f.fail(false);p=f.c.persistAirSettingsConfirmed({reduceGlass:true});await tick();f.release();await p;a.equal(f.applied.length,1);});
test('Tahoe rejects a stale profile response without applying settings',async()=>{const f=fixture(),p=f.c.persistAirSettingsConfirmed({dockSize:50});const rejected=a.rejects(p,/Sitzung/);await tick();f.session('bob');f.release();await rejected;a.equal(f.applied.length,0);});
test('Tahoe presentation retains original nodes, Classic restoration and cleanup',()=>{const s=fs.readFileSync('air-settings-tahoe.js','utf8');a.match(s,/replaceChildren\(\.\.\.original\)/);a.match(s,/observer.disconnect\(\)/);a.match(s,/air-profile-changing/);a.doesNotMatch(s,/innerHTML|localStorage|preferences\.update/);const css=fs.readFileSync('air-tahoe.css','utf8');a.match(css,/tahoe-settings \[hidden\]\{display:none!important/);a.match(css,/grid-template-rows:auto minmax\(0,1fr\)/);});
