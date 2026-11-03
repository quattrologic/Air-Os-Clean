'use strict';

// Runs separately installed Reboot components. No third-party code is bundled.
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const COMPONENTS = Object.freeze({
  launcher: Object.freeze({ type: 'file' }),
  backend: Object.freeze({ type: 'service', packageName: 'lawinserver' }),
  matchmaker: Object.freeze({ type: 'service', packageName: 'fortmatchmaker' })
});

function validComponent(value) {
  if (typeof value !== 'string' || !Object.hasOwn(COMPONENTS, value)) {
    throw new Error('Unbekannte Reboot-Komponente.');
  }
  return value;
}

function checkSelection(kind, selectedPath, platform) {
  validComponent(kind);
  if (typeof selectedPath !== 'string' || !path.isAbsolute(selectedPath)) {
    throw new Error('Ungültiger Pfad.');
  }
  const absolute = fs.realpathSync(selectedPath);
  if (kind === 'launcher') {
    if (platform !== 'win32') throw new Error('Der Reboot-Launcher wird hier nur unter Windows unterstützt.');
    if (path.extname(absolute).toLowerCase() !== '.exe' || !fs.statSync(absolute).isFile()) {
      throw new Error('Bitte eine lokale Windows-EXE des Reboot-Launchers auswählen.');
    }
    return absolute;
  }
  if (!fs.statSync(absolute).isDirectory()) throw new Error('Bitte einen Projektordner auswählen.');
  const packagePath = path.join(absolute, 'package.json');
  const entryPath = path.join(absolute, 'index.js');
  if (!fs.statSync(packagePath).isFile() || !fs.statSync(entryPath).isFile()) {
    throw new Error('Im ausgewählten Ordner fehlen package.json oder index.js.');
  }
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (pkg.name !== COMPONENTS[kind].packageName) {
    throw new Error('Dieser Ordner gehört nicht zur ausgewählten Komponente.');
  }
  return absolute;
}

function registerRebootIpc({ app, ipcMain, dialog, shell, BrowserWindow, requireAccess, spawnProcess = spawn }) {
  const settingsFile = path.join(app.getPath('userData'), 'reboot-components.json');
  const children = new Map();
  const messages = new Map();
  let configured = {};
  try {
    const raw = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const key of Object.keys(COMPONENTS)) {
        if (typeof raw[key] === 'string') configured[key] = raw[key];
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Reboot-Konfiguration konnte nicht gelesen werden:', error.message);
  }

  function persist() {
    fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
    const temporary = settingsFile + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(configured, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporary, settingsFile);
  }
  function stopService(kind) {
    const child = children.get(kind);
    if (!child) return false;
    children.delete(kind);
    if (child.exitCode === null && !child.killed) child.kill();
    messages.set(kind, 'Stopp angefordert');
    return true;
  }
  function stopAll() {
    for (const kind of [...children.keys()]) stopService(kind);
  }
  function snapshot() {
    const entries = {};
    for (const kind of Object.keys(COMPONENTS)) {
      const child = children.get(kind);
      entries[kind] = {
        path: configured[kind] || null,
        running: Boolean(child && child.exitCode === null && !child.killed),
        pid: child && child.exitCode === null && !child.killed ? child.pid || null : null,
        message: messages.get(kind) || ''
      };
    }
    return { platform: process.platform, components: entries };
  }
  function guard(event) {
    requireAccess(event);
  }
  ipcMain.handle('air-os:reboot:state', event => {
    guard(event);
    return snapshot();
  });
  ipcMain.handle('air-os:reboot:configure', async (event, requestedKind) => {
    guard(event);
    const kind = validComponent(requestedKind);
    if (children.has(kind)) throw new Error('Bitte zuerst den laufenden Dienst stoppen.');
    const owner = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(owner, kind === 'launcher' ? {
      title: 'Reboot Launcher auswählen',
      properties: ['openFile'],
      filters: [{ name: 'Windows-Programme', extensions: ['exe'] }]
    } : {
      title: kind === 'backend' ? 'LawinServer-Ordner auswählen' : 'FortMatchmaker-Ordner auswählen',
      properties: ['openDirectory']
    });
    // A logout can happen while the native file dialog is open.
    guard(event);
    if (result.canceled || !result.filePaths?.length) return snapshot();
    const selected = checkSelection(kind, result.filePaths[0], process.platform);
    configured[kind] = selected;
    persist();
    messages.set(kind, 'Lokale Komponente ausgewählt');
    return snapshot();
  });
  ipcMain.handle('air-os:reboot:start', async (event, requestedKind) => {
    guard(event);
    const kind = validComponent(requestedKind);
    if (!configured[kind]) throw new Error('Bitte zuerst den lokalen Installationspfad auswählen.');
    const target = checkSelection(kind, configured[kind], process.platform);
    if (kind === 'launcher') {
      const error = await shell.openPath(target);
      if (error) throw new Error(error);
      messages.set(kind, 'Start an Windows übergeben; der Spielstatus wird nicht überwacht.');
      return snapshot();
    }
    if (children.has(kind)) return snapshot();
    const child = spawnProcess(process.platform === 'win32' ? 'node.exe' : 'node', ['index.js'], {
      cwd: target,
      stdio: 'ignore',
      shell: false,
      windowsHide: true,
      env: process.env
    });
    children.set(kind, child);
    messages.set(kind, 'Dienst wird gestartet …');
    child.once('exit', (code, signal) => {
      if (children.get(kind) === child) {
        children.delete(kind);
        messages.set(kind, 'Dienst beendet (' + (signal || code) + ')');
      }
    });
    child.once('error', error => {
      if (children.get(kind) === child) children.delete(kind);
      messages.set(kind, error.message);
    });
    await new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    messages.set(kind, 'Lokaler Node.js-Prozess gestartet');
    return snapshot();
  });
  ipcMain.handle('air-os:reboot:stop', (event, requestedKind) => {
    guard(event);
    const kind = validComponent(requestedKind);
    if (kind === 'launcher') throw new Error('Den externen Launcher bitte in seinem eigenen Fenster schließen.');
    stopService(kind);
    return snapshot();
  });
  app.on('before-quit', stopAll);
  return { stopAll, snapshot };
}

module.exports = { COMPONENTS, checkSelection, registerRebootIpc };
