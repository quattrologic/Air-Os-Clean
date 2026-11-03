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
  for (const file of ['index.html','app.js','styles.css','manifest.webmanifest','air-logo.png','sw.js']) {
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
  const sw = read('sw.js');
  const handlers = {};
  const stored = new Map();
  const installedAssets = [];
  class FakeResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
      this.statusText = init.statusText || 'OK';
      this.headers = init.headers || { get: name => name === 'content-type' ? 'text/html' : null };
      this.ok = this.status >= 200 && this.status < 300;
      this.redirected = false;
    }
    clone() { return new FakeResponse(this.body, { status: this.status, statusText: this.statusText, headers: this.headers }); }
  }
  const live = new FakeResponse('Air-OS HTML');
  live.redirected = true; // Tailscale can redirect /index.html to /
  const cache = {
    addAll: async urls => { installedAssets.push(...urls); },
    put: async (url, response) => { stored.set(url, response); },
    match: async url => stored.get(url)
  };
  const mockCaches = {
    open: async () => cache,
    match: async () => undefined,
    keys: async () => ['air-os-ipad-v1'],
    delete: async () => true
  };
  const self = {
    location: { origin: 'https://air-os.example.ts.net' },
    registration: { scope: 'https://air-os.example.ts.net/' },
    addEventListener: (name, fn) => { handlers[name] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  const fetched = [];
  const fetch = async url => { fetched.push(url); return live; };
  vm.runInNewContext(sw, { self, caches: mockCaches, URL, Promise, Response: FakeResponse, fetch });
  let install;
  handlers.install({ waitUntil: promise => { install = promise; } });
  await install;
  assert.deepEqual(fetched, ['./']);
  assert.deepEqual(installedAssets, ['./styles.css', './app.js', './manifest.webmanifest', './air-logo.png']);
  assert.equal(stored.get('./').redirected, false);

  let navigation;
  handlers.fetch({
    request: { method: 'GET', url: 'https://air-os.example.ts.net/', mode: 'navigate' },
    respondWith: promise => { navigation = promise; }
  });
  const offline = await navigation;
  assert.equal(offline.body, 'Air-OS HTML');
  assert.equal(offline.redirected, false);
  assert.equal(offline.status, 200);
});
