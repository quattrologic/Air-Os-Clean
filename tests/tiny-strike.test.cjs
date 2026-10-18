'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const root = path.resolve(__dirname, '..');
function fixture() {
  const sessions = [];
  class Window extends EventEmitter {
    constructor(options) { super(); this.options = options; this.webContents = new EventEmitter(); this.webContents.setWindowOpenHandler = fn => { this.popups = fn; }; this.webContents.getURL = () => this.url; }
    isDestroyed() { return !!this.destroyed; }
    isMinimized() { return false; }
    show() {} focus() {}
    async loadURL(url) { this.url = url; }
    close() { this.destroyed = true; this.emit('closed'); }
  }
  const electron = {
    app: { getAppPath: () => root }, BrowserWindow: Window,
    protocol: { registerSchemesAsPrivileged() {} },
    session: { fromPartition(partition) {
      const s = { partition, protocol: { handle(_scheme, fn) { s.handle = fn; } },
        webRequest: { onBeforeRequest(fn) { s.request = fn; } },
        setPermissionRequestHandler(fn) { s.permission = fn; },
        setPermissionCheckHandler(fn) { s.check = fn; }, on() {} };
      sessions.push(s); return s;
    } }
  };
  const context = { require: name => name === 'electron' ? electron : require(name), module: { exports: {} }, URL, Response };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'tiny-strike.cjs'), 'utf8'), context);
  return { controller: context.module.exports, sessions };
}
test('game serves only its bundled files and blocks external requests', async () => {
  const { controller: c, sessions } = fixture();
  await c.open('Tester');
  const s = sessions[0];
  const response = await s.handle({ url: c.GAME_URL, method: 'GET' });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /vendor\/three\/build\/three.module.js/);
  assert.match(response.headers.get('Content-Security-Policy'), /connect-src 'self'/);
  for (const url of ['https://example.com', 'http://127.0.0.1:1234', 'wss://example.com', 'file:///etc/passwd', 'air-game://other/index.html']) {
    let cancelled; s.request({ url }, result => { cancelled = result.cancel; });
    assert.equal(cancelled, true, url);
  }
  let allowed; s.request({ url: c.GAME_URL }, r => { allowed = !r.cancel; });
  assert.equal(allowed, true);
  assert.equal((await s.handle({ url: c.GAME_URL, method: 'POST' })).status, 403);
  c.close();
});
test('encoded traversal, deceptive origins and invalid paths are rejected', () => {
  const { controller: c } = fixture();
  const gameRoot = path.join(root, 'games', 'tiny-strike');
  for (const value of ['air-game://tiny-strike/%2f..%2f..%2fmain.cjs', 'air-game://tiny-strike/%5c..%5cmain.cjs', 'air-game://tiny-strike/%00', 'air-game://user@tiny-strike/index.html', 'air-game://tiny-strike:999/index.html', 'https://tiny-strike/index.html']) {
    assert.equal(c.resolveGameFile(gameRoot, value), null, value);
  }
  assert.equal(c.resolveGameFile(gameRoot, c.GAME_URL), path.join(gameRoot, 'index.html'));
});
test('game uses profile-specific sessions and closes on controller cleanup', async () => {
  const { controller: c, sessions } = fixture();
  await c.open('Alice'); await c.open('Alice');
  assert.equal(sessions.length, 1, 'reuse the existing game window');
  assert.equal(sessions[0].check(null, 'media'), false);
  assert.equal(sessions[0].check(null, 'pointerLock'), false);
  c.close(); await c.open('Bob');
  assert.notEqual(sessions[0].partition, sessions[1].partition);
  c.close();
});
