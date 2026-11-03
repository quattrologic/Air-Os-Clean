'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { checkSelection, registerRebootIpc } = require('../reboot-integration.cjs');

function fixture(t, name = 'lawinserver') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'airos-reboot-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const folder = path.join(root, 'component');
  fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify({ name }));
  fs.writeFileSync(path.join(folder, 'index.js'), '/* Test fixture. Never executed. */');
  return { root, folder };
}

test('only the correct LawinServer directory is accepted', t => {
  const { folder } = fixture(t);
  assert.equal(checkSelection('backend', folder, process.platform), fs.realpathSync(folder));
  assert.throws(() => checkSelection('matchmaker', folder, process.platform), /gehört nicht/);
  assert.throws(() => checkSelection('__proto__', folder, process.platform), /Unbekannte/);
});

test('FortMatchmaker directory is accepted and arbitrary files are rejected', t => {
  const { root, folder } = fixture(t, 'fortmatchmaker');
  assert.equal(checkSelection('matchmaker', folder, process.platform), fs.realpathSync(folder));
  assert.throws(() => checkSelection('backend', root, process.platform));
});

test('launcher must be an explicit local EXE on Windows', t => {
  const { root } = fixture(t);
  const exe = path.join(root, 'launcher.exe');
  fs.writeFileSync(exe, 'fixture');
  assert.throws(() => checkSelection('launcher', path.join(root, 'launcher.bat'), 'win32'));
  assert.throws(() => checkSelection('launcher', exe, 'darwin'), /Windows/);
  assert.equal(checkSelection('launcher', exe, 'win32'), fs.realpathSync(exe));
});

test('IPC requires an authorized Air-OS session and controls only selected service', async t => {
  const { root, folder } = fixture(t);
  const handlers = new Map();
  let allowed = true;
  let lastSpawn = null;
  const mock = {
    app: {
      getPath: () => root,
      on: () => {}
    },
    ipcMain: {
      handle(name, fn) { handlers.set(name, fn); }
    },
    dialog: {
      async showOpenDialog() { return { canceled: false, filePaths: [folder] }; }
    },
    shell: { async openPath() { return ''; } },
    BrowserWindow: { fromWebContents() { return {}; } },
    requireAccess() {
      if (!allowed) throw new Error('Nicht autorisiert');
    },
    spawnProcess(command, args, options) {
      lastSpawn = { command, args, options };
      const child = new EventEmitter();
      child.exitCode = null;
      child.killed = false;
      child.pid = 1234;
      child.kill = () => {
        child.killed = true;
        child.emit('exit', null, 'SIGTERM');
        return true;
      };
      process.nextTick(() => child.emit('spawn'));
      return child;
    }
  };
  const manager = registerRebootIpc(mock);
  const event = { sender: {} };
  const call = (name, ...args) => handlers.get('air-os:reboot:' + name)(event, ...args);
  assert.equal((await call('state')).components.backend.path, null);
  await call('configure', 'backend');
  assert.equal((await call('state')).components.backend.path, fs.realpathSync(folder));
  await call('start', 'backend');
  assert.equal(lastSpawn.args[0], 'index.js');
  assert.equal(lastSpawn.options.shell, false);
  assert.equal(lastSpawn.options.cwd, folder);
  assert.equal((await call('state')).components.backend.running, true);
  await call('stop', 'backend');
  assert.equal((await call('state')).components.backend.running, false);
  allowed = false;
  await assert.rejects(() => Promise.resolve(call('start', 'backend')), /Nicht autorisiert/);
  assert.throws(() => call('state'), /Nicht autorisiert/);
  manager.stopAll();
});
