'use strict';
const { app, BrowserWindow, protocol, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');

// Standard origin semantics allow ES modules, local model fetches and storage.
protocol.registerSchemesAsPrivileged([{
  scheme: 'air-game', privileges: { standard: true, secure: true, supportFetchAPI: true }
}]);
const GAME_URL = 'air-game://tiny-strike/index.html';
const CSP = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; media-src 'self' blob:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'";
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
let gameWindow = null;
const configuredSessions = new WeakSet();

function isGameURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'air-game:' && url.hostname === 'tiny-strike' && !url.port && !url.username && !url.password;
  } catch { return false; }
}
function resolveGameFile(root, value) {
  if (!isGameURL(value)) return null;
  try {
    const pathname = decodeURIComponent(new URL(value).pathname);
    if (pathname.includes('\\') || pathname.includes('\0')) return null;
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, target);
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return null;
    return target;
  } catch { return null; }
}
function configureSession(gameSession) {
  if (configuredSessions.has(gameSession)) return;
  const root = path.join(app.getAppPath(), 'games', 'tiny-strike');
  gameSession.protocol.handle('air-game', async request => {
    const file = resolveGameFile(root, request.url);
    if (!file || request.method !== 'GET') return new Response('Forbidden', { status: 403 });
    try {
      return new Response(await fs.readFile(file), { headers: {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Content-Security-Policy': CSP,
        'X-Content-Type-Options': 'nosniff'
      } });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  gameSession.webRequest.onBeforeRequest((details, callback) => {
    // No HTTP, WebSockets, external files, telemetry or remote assets.
    callback({ cancel: !isGameURL(details.url) && !/^(data|blob):/.test(details.url) });
  });
  const canLockPointer = (contents, permission) => permission === 'pointerLock' &&
    !!gameWindow && contents === gameWindow.webContents && isGameURL(contents.getURL());
  gameSession.setPermissionRequestHandler((contents, permission, callback) => callback(canLockPointer(contents, permission)));
  gameSession.setPermissionCheckHandler(canLockPointer);
  gameSession.on('will-download', event => event.preventDefault());
  configuredSessions.add(gameSession);
}
async function open(username) {
  if (gameWindow && !gameWindow.isDestroyed()) {
    if (gameWindow.isMinimized()) gameWindow.restore();
    gameWindow.show(); gameWindow.focus();
    return;
  }
  const profileKey = crypto.createHash('sha256').update(String(username).toLowerCase()).digest('hex');
  const gameSession = session.fromPartition('persist:tiny-strike-' + profileKey);
  configureSession(gameSession);
  const win = gameWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 800, minHeight: 600,
    title: 'Tiny Strike — Offline gegen Bots', backgroundColor: '#101820',
    autoHideMenuBar: true, show: false,
    webPreferences: { session: gameSession, nodeIntegration: false, contextIsolation: true,
      sandbox: true, webSecurity: true }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== GAME_URL) event.preventDefault();
  });
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  win.on('page-title-updated', event => event.preventDefault());
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { if (gameWindow === win) gameWindow = null; });
  try { await win.loadURL(GAME_URL); }
  catch (error) { if (!win.isDestroyed()) win.close(); throw error; }
}
function close() {
  if (gameWindow && !gameWindow.isDestroyed()) gameWindow.close();
  gameWindow = null;
}
module.exports = { open, close, isGameURL, resolveGameFile, GAME_URL };
