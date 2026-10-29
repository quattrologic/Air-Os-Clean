'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('browser and native reminders use one strict model',()=>{
 const f=require('../src/core/reminders-format.js');
 assert.deepEqual(f.make({title:' Test ',dueDate:'2028-02-29',priority:'high'},null,'now','id'),{id:'id',title:'Test',details:'',dueDate:'2028-02-29',priority:'high',completed:false,createdAt:'now',updatedAt:'now'});
 for(const value of [{title:''},{title:'x',dueDate:'2027-02-29'},{title:'x',priority:'urgent'},{title:'x',completed:1},{title:'x',id:'../x'}])assert.throws(()=>f.validate(value));
 assert.match(read('src/main/reminders-store.cjs'),/format.make/);
});
test('IndexedDB upgrade preserves v1 and rejects stale sessions and conflicting collection writes',()=>{
 const s=read('pwa/storage.js');assert.match(s,/indexedDB.open\('air-os-pwa-local-v1',2\)/);assert.match(s,/objectStoreNames.contains/);assert.match(s,/oncomplete/);assert.match(s,/onblocked/);assert.match(s,/versionchange/);assert.match(s,/tx.abort/);assert.match(s,/QuotaExceededError/);assert.match(s,/Daten inzwischen geändert/);assert.match(s,/sessionStorage.getItem\('air-pwa-session'\)!==session/);
});
test('browser backup has explicit replacement, bounded binary data and an atomic transaction',()=>{
 const s=read('pwa/storage.js');assert.match(s,/confirmed!==true/);assert.match(s,/48\*1024\*1024/);assert.match(s,/airBrowserValidateBackup/);assert.match(s,/version:2/);assert.match(s,/for\(const key of keys\).*s.put/);assert.doesNotMatch(s,/fetch\(|localStorage/);
});
test('virtual Finder rejects host paths and exposes bounded explicit Blob imports',()=>{
 const s=read('pwa/files.js');for(const value of ['readTextFile','writeTextFile','renameFile','duplicateFile','createFolder','searchNames','remove','import','export'])assert.ok(s.includes(value));assert.match(s,/instanceof Blob/);assert.match(s,/8\*1024\*1024/);assert.ok(s.includes("p==='..'"));assert.doesNotMatch(s,/showDirectoryPicker|require\(|ipcRenderer|shell\./);
});
test('PWA keeps real controllers and uses safe browser services before app startup',()=>{
 const b=read('scripts/build-pwa.cjs');assert.ok(b.indexOf('storage.js')<b.indexOf('adapter.js'));assert.doesNotMatch(b,/air-app-bootstrap\|air-os-enhancements/);for(const f of ['air-music.js','air-os-enhancements.js','air-reminders.js'])assert.ok(fs.existsSync(path.join(root,f)));
 const s=read('pwa/desktop.js');assert.doesNotMatch(s,/supported=new Set/);assert.match(s,/openApps/);assert.match(s,/airWindowSystem.configure/);assert.match(s,/pointercancel/);
});
test('iPad adaptive shell uses safe areas, keyboard viewport and usable touch controls',()=>{
 const s=read('pwa/pwa.css')+read('pwa/desktop.js');for(const value of ['100dvh','safe-area-inset-bottom','safe-area-inset-top','visualViewport','ResizeObserver','pwa-keyboard','44px'])assert.ok(s.includes(value));assert.match(read('pwa/viewport.js'),/visualViewport/);
});
test('local start screen and quality modes do not claim authentication or override GPU guards',()=>{
 assert.match(read('pwa/lock.js'),/keine sichere Anmeldung/);assert.match(read('pwa/adapter.js'),/localAuthentication:false/);assert.match(read('pwa/adapter.js'),/configured:false/);assert.match(read('air-desktop-glass.js'),/browser-standard-css/);assert.match(read('air-desktop-glass.js'),/software&&!diagnostic/);assert.match(read('pwa/desktop.js'),/Reduzierte Transparenz/);
});
test('PWA actions preserve dirty Notes and do not enable native cloud or public deployment',()=>{
 assert.match(read('pwa/adapter.js'),/airNotes\?\.hasUnsaved/);assert.match(read('pwa/apps.js'),/beforeunload/);
 const workflow=read('.github/workflows/deploy-pwa-preview.yml');assert.match(workflow,/publish-public-pwa-test/);assert.doesNotMatch(workflow,/\n  push:|\n  pull_request:/);
});
