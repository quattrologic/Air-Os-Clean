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
  for (const file of ['index.html','app.js','styles.css','manifest.webmanifest','icon.svg','sw.js']) {
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

test('offline service worker pre-caches the entire app shell', async () => {
  const sw = read('sw.js');
  const handlers = {};
  const cached = new Map();
  const events = [];
  const fakeCaches = {
    open: async name => ({
      addAll: async urls => {
        assert.ok(name.startsWith('air-os-ipad-v'));
        for (const url of urls) cached.set(url, 'offline:' + url);
      }
    }),
    match: async request => cached.get(request),
    keys: async () => ['air-os-ipad-old'],
    delete: async () => true
  };
  const self = {
    location: { origin: 'https://air-os.example.ts.net' },
    registration: { scope: 'https://air-os.example.ts.net/' },
    addEventListener: (name,fn) => { handlers[name] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  vm.runInNewContext(sw,{self,caches:fakeCaches,URL,Promise,fetch:async()=>{throw new Error('Simulated offline');}});
  const install = {waitUntil: promise => events.push(promise)};
  handlers.install(install);
  await Promise.all(events);
  assert.deepEqual([...cached.keys()],['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg']);
  assert.ok(cached.get('./index.html'));
  let response;
  handlers.fetch({
    request:{method:'GET',url:'https://air-os.example.ts.net/',mode:'navigate'},
    respondWith: promise => { response = promise; }
  });
  assert.equal(await response,'offline:./index.html');
});
