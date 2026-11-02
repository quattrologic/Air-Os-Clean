'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createMediaStore, normalize } = require('../media-state.cjs');

test('last played track survives reload and stays separated by local account', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'air-os-last-media-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const first = createMediaStore(root);
  assert.equal(first.read('alex'), null);
  const result = first.write('alex', {
    title: 'I Don\'t Know', artist: 'Erika', position: 17, duration: 198,
    artwork: 'data:image/png;base64,AAAA'
  });
  assert.equal(result.ok, true);
  const fresh = createMediaStore(root);
  assert.equal(fresh.read('alex').title, 'I Don\'t Know');
  assert.equal(fresh.read('alex').artist, 'Erika');
  assert.equal(fresh.read('alex').artwork, 'data:image/png;base64,AAAA');
  assert.equal(fresh.read('other'), null);
  assert.ok(fresh.read('alex').updatedAt);
});

test('reject traversal and untrusted artwork, clamp media values', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'air-os-last-media-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const store = createMediaStore(root);
  assert.throws(() => store.read('../secret'));
  assert.throws(() => store.write('../../tmp', {title:'test'}));
  assert.equal(store.write('alex', {title: ''}).ok, false);
  const data = normalize({
    title: 'a'.repeat(300),
    artist: 'b'.repeat(300),
    artwork: 'https://example.com/remote-art.jpg',
    position: -20,
    duration: Number.POSITIVE_INFINITY
  });
  assert.equal(data.title.length, 120);
  assert.equal(data.artist.length, 100);
  assert.equal(data.artwork, '');
  assert.equal(data.position, 0);
  assert.equal(data.duration, 0);
});

test('desktop and login refer to the same scoped media bridge', () => {
  const main = fs.readFileSync(path.join(__dirname, '../main.cjs'), 'utf8');
  const preload = fs.readFileSync(path.join(__dirname, '../preload.cjs'), 'utf8');
  const login = fs.readFileSync(path.join(__dirname, '../login.js'), 'utf8');
  const music = fs.readFileSync(path.join(__dirname, '../air-music.js'), 'utf8');
  const notch = fs.readFileSync(path.join(__dirname, '../air-notch.js'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8');
  assert.match(main, /air-os:media:get-last/);
  assert.match(main, /air-os:media:set-last/);
  assert.match(preload, /media: Object\.freeze/);
  assert.match(login, /loadLockMedia\(account\.username\)/);
  assert.match(music, /media\.setLast/);
  assert.match(notch, /loadLastMusic\(\)/);
  assert.match(html, /id="lock-media"/);
});
