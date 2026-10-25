'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/pwa-test');
test('PWA build: manifest, self-contained entry, official icons, no cloud and deterministic safe cache',()=>{
 execFileSync(process.execPath,['scripts/build-pwa.cjs',out],{cwd:root});
 const read=f=>fs.readFileSync(path.join(out,f),'utf8'),m=JSON.parse(read('manifest.webmanifest'));
 assert.equal(m.start_url,'./');assert.equal(m.display,'standalone');assert.equal(m.icons.length,3);for(const i of m.icons)assert.ok(fs.existsSync(path.join(out,i.src)));
 assert.match(read('index.html'),/lock.js/);assert.doesNotMatch(read('index.html'),/src="login.js"|type="module"/);assert.match(read('desktop.html'),/adapter.js/);assert.doesNotMatch(read('desktop.html'),/src="air-cloud.js"/);assert.doesNotMatch(read('app.js'),/openApp\("finder"\); \/\/ Start/);
 const sw=read('sw.js');assert.match(sw,/allowed.has\(target\)/);assert.match(sw,/e.request.method!=='GET'/);assert.match(sw,/k.startsWith\('air-os-pwa-'\)/);assert.doesNotMatch(sw,/skipWaiting\(\).*install/);
 execFileSync(process.execPath,['scripts/build-pwa.cjs',out],{cwd:root});assert.equal(read('sw.js'),sw);
 const lock=read('lock.js');assert.match(lock,/keine sichere Anmeldung/);assert.doesNotMatch(lock,/fetch\(|password.value/);
 const adapter=read('adapter.js');assert.match(adapter,/indexedDB.open\('air-os-pwa-local-v1'/);assert.match(adapter,/cloud:.*configured:false/);assert.match(adapter,/transaction\('readwrite'/);
});
test('PWA and Electron share note creation format and bounds',()=>{
 const f=require('../src/core/notes-format.js'),n=f.make({title:'test',body:'body'},null,'2026-10-25','uuid');assert.deepEqual(Object.keys(n),['id','title','body','createdAt','updatedAt']);assert.equal(f.make({title:'edit',body:'x'},n,'later','other').id,'uuid');assert.throws(()=>f.make({title:'x',body:'ü'.repeat(262145)},null,'now','id'));
 assert.match(fs.readFileSync(path.join(root,'src/main/notes-store.cjs'),'utf8'),/core\/notes-format.js/);
});
test('worker ignores mutations and unlisted requests, deletes only its own old caches',async()=>{
 const handlers={},deleted=[];const scope='https://example.test/air/';const worker=fs.readFileSync(path.join(out,'sw.js'),'utf8');
 const context={URL,Set,self:{registration:{scope},location:{origin:'https://example.test'},clients:{claim:async()=>{}},skipWaiting:()=>{},addEventListener:(t,h)=>handlers[t]=h},caches:{keys:async()=>['unrelated','air-os-pwa-obsolete:'+encodeURIComponent(scope)],delete:async k=>deleted.push(k)}};vm.runInNewContext(worker,context);
 let promise;handlers.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(deleted,['air-os-pwa-obsolete:'+encodeURIComponent(scope)]);
 for(const [method,url]of [['POST',scope+'desktop.html'],['GET',scope+'private.json'],['GET','https://elsewhere.test/']])handlers.fetch({request:{method,url},respondWith:()=>assert.fail('must not cache')});
});
