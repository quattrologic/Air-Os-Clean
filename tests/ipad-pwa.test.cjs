'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dir = path.join(__dirname, '../ipad');
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');

test('PWA assets parse, stay same-origin and do not depend on Electron', () => {
  const html = read('index.html');
  const js = read('app.js');
  const sw = read('sw.js');
  const manifest = JSON.parse(read('manifest.webmanifest'));
  new vm.Script(js);
  new vm.Script(sw);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  for (const file of ['index.html','app.js','styles.css','manifest.webmanifest','air-os-official.png','sw.js']) {
    assert.ok(fs.existsSync(path.join(dir,file)), 'Missing offline asset: ' + file);
  }
  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(js, /navigator\.serviceWorker\.register\('\.\/sw\.js'/);
  assert.doesNotMatch(html, /<script[^>]+https?:\/\//i);
  assert.doesNotMatch(js, /(?:fetch|XMLHttpRequest)\(['"]https?:\/\//);
  assert.doesNotMatch(js, /ipcRenderer|window\.airOS|require\(['"]electron/);
});

test('every queried element exists in iPad HTML', () => {
  const html = read('index.html');
  const js = read('app.js');
  const matchedIds = [...js.matchAll(/\$\('#([^']+)'\)/g)].map(match => match[1]);
  const uniqueIds = new Set(matchedIds);
  for (const id of uniqueIds) {
    assert.ok(html.includes('id="' + id + '"'), 'Missing HTML element: ' + id);
  }
});

test('Safari navigation receives a non-redirected offline response', async () => {
  const handlers={},stored=new Map(),fetched=[];
  const cache={put:async (url,r)=>stored.set(url,r),match:async url=>stored.get(url)};
  const scope='https://air-os.example.ts.net/';
  const fetch=async url=>{fetched.push(url);const file=url==='./'?'index.html':url.slice(2);const r=new Response(fs.readFileSync(path.join(dir,file)),{headers:{'content-type':file.endsWith('.html')?'text/html':'application/octet-stream'}});Object.defineProperty(r,'url',{value:scope+file});Object.defineProperty(r,'redirected',{value:url==='./'});return r;};
  const self={registration:{scope},addEventListener:(n,fn)=>handlers[n]=fn,clients:{claim:async()=>{}}};
  vm.runInNewContext(read('sw.js'),{self,caches:{open:async()=>cache,delete:async()=>true,keys:async()=>[]},URL,Response,fetch,crypto:require('node:crypto').webcrypto,Uint8Array});
  let install;handlers.install({waitUntil:p=>install=p});await install;
  assert.equal(fetched[0],'./');for(const file of ['./styles.css','./app.js','./manifest.webmanifest','./air-os-official.png','./storage.js','./desktop.js','./apps.js','./backup.js'])assert.ok(fetched.includes(file),'Offline asset missing: '+file);
  assert.equal(stored.get('./').redirected,false);
  let nav;handlers.fetch({request:{method:'GET',url:scope,mode:'navigate'},respondWith:p=>nav=p});const offline=await nav;
  assert.equal(await offline.text(),read('index.html'));assert.equal(offline.redirected,false);assert.equal(offline.status,200);
});
