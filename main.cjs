'use strict';

const { app, BrowserWindow, ipcMain, shell, session, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { fileURLToPath } = require('node:url');
const { execFileSync } = require('node:child_process');
const { createFolder, duplicateFile, renameFile, createEmptyTextExclusive } = require('./src/main/file-ops.cjs');
const { findFileNames } = require('./src/main/file-search.cjs');

const spotifyLauncher=require('./src/main/spotify-launcher.cjs').createSpotifyLauncher({app,shell});

let mainWindow = null;
let activeUser = null;
let fileWorkspaceRoot = null;
const preferenceStore=require('./src/main/preferences.cjs').createStore({
 root:()=>app.getPath('userData'),
 isNewProfile:username=>readAccounts().some(account=>account.usernameKey===username.toLocaleLowerCase('en-US')&&account.profileSchemaVersion===2)
});
const notesStore=require('./src/main/notes-store.cjs').createStore({root:()=>app.getPath('userData')});
const reminderStore=require('./src/main/reminders-store.cjs').createStore({root:()=>app.getPath('userData')});
const airAppManager=require('./src/main/airapp-manager.cjs').createManager({
 root:()=>app.getPath('userData'),appPath:()=>app.getAppPath(),
 publicKeys:{demo:fs.readFileSync(path.join(__dirname,'store','keys','demo-publisher-public.txt'),'utf8')}
});
const airAppRuntime=require('./src/main/airapp-runtime.cjs').createRuntime({BrowserWindow,protocol:require('electron').protocol,session,manager:airAppManager});
const accountFile = () => path.join(app.getPath('userData'), 'accounts.json');
const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function readAccounts() {
  try {
    const parsed = JSON.parse(fs.readFileSync(accountFile(), 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('Could not read Air-OS accounts:', error);
    return [];
  }
}
function writeAccounts(accounts) {
  const folder = app.getPath('userData');
  fs.mkdirSync(folder, { recursive: true });
  const file = accountFile();
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(accounts, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, file);
}
function publicAccount(account) {
  return { username: account.username, displayName: account.displayName, createdAt: account.createdAt };
}
function safeUser(value) {
  return String(value || '').normalize('NFKC').trim();
}
function localAppFile(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'file:') return false;
    const localPath = path.resolve(fileURLToPath(parsed));
    return localPath === path.resolve(app.getAppPath(), 'login.html') ||
      localPath === path.resolve(app.getAppPath(), 'index.html');
  } catch {
    return false;
  }
}
function requireTrusted(event) {
  if (!event.senderFrame || !localAppFile(event.senderFrame.url)) throw new Error('Nicht autorisierter Aufruf.');
}
function openLogin() {
  airAppRuntime.closeAll();
  activeUser = null;
  fileWorkspaceRoot = null;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadFile(path.join(app.getAppPath(), 'login.html'));
    mainWindow.setTitle('Air-OS – Anmeldung');
  }
}
function openDesktop(account) {
  activeUser = {...publicAccount(account),preferenceSession:crypto.randomBytes(16).toString('hex')};
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadFile(path.join(app.getAppPath(), 'index.html'));
    mainWindow.setTitle('Air-OS');
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 760, minHeight: 540,
    backgroundColor: '#142847', title: 'Air-OS – Anmeldung', show: false, autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true,
      // Chromium switches alone do not reliably disable WebGL in Electron on
      // Windows. Honor the explicit recovery flag at the native window boundary.
      webgl: !app.commandLine?.hasSwitch('disable-webgl')
    }
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Only open well-formed HTTPS URLs. Reject embedded credentials and deceptive schemes.
    try {
      const target = new URL(url);
      if (target.protocol === 'https:' && !target.username && !target.password && target.hostname && !target.hostname.endsWith('.')) {
        void shell.openExternal(target.href).catch(error => console.error('External link failed:', error));
      }
    } catch { /* Ignore malformed external URLs. */ }
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!localAppFile(url)) event.preventDefault();
  });
  mainWindow.on('closed', () => { airAppRuntime.closeAll(); mainWindow = null; });
  openLogin();
}
function requirePreferenceUser(event){requireTrusted(event);if(!activeUser)throw new Error('Bitte zuerst anmelden.');return activeUser.username}
ipcMain.handle('air-os:spotify:launch',event=>{requirePreferenceUser(event);return spotifyLauncher.launch()});
ipcMain.handle('air-os:preferences:get',event=>preferenceStore.load(requirePreferenceUser(event)));
ipcMain.handle('air-os:preferences:update',(event,patch,expectedSession)=>{
 const user=requirePreferenceUser(event);
 if(expectedSession!==undefined&&(typeof expectedSession!=='string'||expectedSession!==activeUser.preferenceSession))throw new Error('Die Anmeldung hat sich geändert.');
 return preferenceStore.update(user,patch);
});
ipcMain.handle('air-os:preferences:reset',event=>preferenceStore.reset(requirePreferenceUser(event)));
ipcMain.handle('air-os:reminders:list',event=>reminderStore.list(requirePreferenceUser(event)));
ipcMain.handle('air-os:reminders:save',(event,item)=>reminderStore.save(requirePreferenceUser(event),item));
ipcMain.handle('air-os:reminders:remove',(event,id)=>reminderStore.remove(requirePreferenceUser(event),id));
ipcMain.handle('air-os:notes:list',event=>notesStore.list(requirePreferenceUser(event)));
ipcMain.handle('air-os:notes:save',(event,note)=>notesStore.save(requirePreferenceUser(event),note));
ipcMain.handle('air-os:notes:remove',(event,id)=>notesStore.remove(requirePreferenceUser(event),id));
ipcMain.handle('air-os:store:catalog',event=>{requirePreferenceUser(event);return airAppManager.catalog()});
ipcMain.handle('air-os:store:installed',event=>airAppManager.installed(requirePreferenceUser(event)));
ipcMain.handle('air-os:store:install',(event,id)=>airAppManager.install(requirePreferenceUser(event),id));
ipcMain.handle('air-os:store:remove',(event,id)=>{const user=requirePreferenceUser(event);airAppRuntime.close(user,id);return airAppManager.remove(user,id)});
ipcMain.handle('air-os:store:launch',(event,id)=>airAppRuntime.open(requirePreferenceUser(event),id));
ipcMain.handle('air-os:accounts', event => {
  requireTrusted(event);
  return readAccounts().map(publicAccount);
});
ipcMain.handle('air-os:create-account', (event, input = {}) => {
  requireTrusted(event);
  const displayName = safeUser(input.displayName).slice(0, 40);
  const username = safeUser(input.username);
  const password = String(input.password || '');
  const usernameKey = username.toLocaleLowerCase('en-US');
  if (displayName.length < 1) return { ok: false, error: 'Bitte gib deinen Namen ein.' };
  if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) return { ok: false, error: 'Der Benutzername braucht 3–24 Zeichen (Buchstaben, Zahlen, Punkt, _ oder -).' };
  if (password.length < 8) return { ok: false, error: 'Dein Passwort muss mindestens 8 Zeichen haben.' };
  const accounts = readAccounts();
  if (accounts.some(item => item.usernameKey === usernameKey)) return { ok: false, error: 'Dieser Benutzername ist schon vergeben.' };
  const salt = crypto.randomBytes(16);
  const passwordHash = crypto.scryptSync(password, salt, 64, scryptOptions).toString('hex');
  const account = { username, usernameKey, displayName, salt: salt.toString('hex'), passwordHash, createdAt: new Date().toISOString(), profileSchemaVersion: 2 };
  accounts.push(account);
  writeAccounts(accounts);
  setImmediate(() => openDesktop(account));
  return { ok: true };
});
ipcMain.handle('air-os:login', (event, input = {}) => {
  requireTrusted(event);
  const usernameKey = safeUser(input.username).toLocaleLowerCase('en-US');
  const password = String(input.password || '');
  const account = readAccounts().find(item => item.usernameKey === usernameKey);
  if (!account) {
    crypto.scryptSync(password, 'air-os-unknown-user-salt', 64, scryptOptions);
    return { ok: false, error: 'Benutzername oder Passwort stimmen nicht.' };
  }
  const actual = crypto.scryptSync(password, Buffer.from(account.salt, 'hex'), 64, scryptOptions);
  const expected = Buffer.from(account.passwordHash, 'hex');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return { ok: false, error: 'Benutzername oder Passwort stimmen nicht.' };
  }
  setImmediate(() => openDesktop(account));
  return { ok: true };
});
ipcMain.handle('air-os:current-user', event => {
  requireTrusted(event);
  return activeUser;
});
ipcMain.handle('air-os:logout', event => {
  requireTrusted(event);
  openLogin();
  return { ok: true };
});
ipcMain.handle('air-os:restart-app', event => {
  requireTrusted(event);
  setImmediate(() => { app.relaunch(); app.exit(0); });
  return { ok: true };
});
ipcMain.handle('air-os:quit-app', event => {
  requireTrusted(event);
  setImmediate(() => app.quit());
  return { ok: true };
});


function requireAirCardAccess(event) {
  requireTrusted(event);
  if (!activeUser) throw new Error('Bitte melde dich zuerst bei Air-OS an.');
}
function airCardSafeID(value, fieldName) {
  const id = String(value || '');
  if (!/^[A-Za-z0-9._:-]{1,160}$/.test(id)) throw new Error('Ungültige ' + fieldName + '-Kennung.');
  return id;
}
function airCardArtworkDir() {
  const dir = path.join(app.getPath('userData'), 'AirCard-Lite', 'Artwork');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function airCardIndexPath() { return path.join(airCardArtworkDir(), 'artwork-index.json'); }
function airCardReadIndex() {
  try {
    const index = JSON.parse(fs.readFileSync(airCardIndexPath(), 'utf8'));
    return index && typeof index === 'object' && !Array.isArray(index) ? index : {};
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw new Error('Der lokale Artwork-Index ist beschädigt.');
  }
}
function airCardWriteIndex(index) {
  const file = airCardIndexPath(), tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(index, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, file);
}
function airCardDiskName(cardID, extension) {
  return crypto.createHash('sha256').update(cardID).digest('hex').slice(0, 32) + '.' + extension;
}
function airCardBackendExecutable() {
  const candidates = [
    path.join(process.resourcesPath, 'aircard', 'AirCardBackendCLI'),
    path.join(app.getPath('userData'), 'AirCard-Lite', 'backend', 'AirCardBackendCLI'),
    path.join(__dirname, 'aircard', 'AirCardBackendCLI')
  ];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) {
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      }
    } catch {}
  }
  return null;
}
function airCardRunBackend(args) {
  if (process.platform !== 'darwin') throw new Error('Wallet-Scan und Skin-Anwendung sind nur unter macOS verfügbar.');
  const executable = airCardBackendExecutable();
  if (!executable) throw new Error('AirCardBackendCLI fehlt. Das AirCard-Lite-Repo enthält die Oberfläche und den Adapter-Vertrag, aber nicht das eigentliche iPhone-Backend.');
  try {
    return execFileSync(executable, args, { encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024, windowsHide: true }).trim();
  } catch (error) {
    const detail = String(error.stderr || error.message || '').trim().slice(-1200);
    throw new Error(detail || 'Das lokale AirCard-Backend ist fehlgeschlagen.');
  }
}
function airCardParseArray(output, kind) {
  let value;
  try { value = JSON.parse(output); } catch { throw new Error('Das AirCard-Backend lieferte keine gültigen JSON-Daten.'); }
  if (!Array.isArray(value)) throw new Error('Das AirCard-Backend lieferte keine gültige ' + kind + '-Liste.');
  return value;
}
ipcMain.handle('aircard:list-devices', event => {
  requireAirCardAccess(event);
  const devices = airCardParseArray(airCardRunBackend(['list-devices']), 'Geräte');
  return devices.filter(item => item && typeof item.id === 'string' && /^[A-Za-z0-9._:-]{1,160}$/.test(item.id))
    .map(item => ({ id: item.id, name: String(item.name || 'iPhone').slice(0, 120), product: String(item.product || '').slice(0, 120), osVersion: String(item.osVersion || '').slice(0, 80) }));
});
ipcMain.handle('aircard:scan-cards', (event, deviceValue) => {
  requireAirCardAccess(event);
  const deviceID = airCardSafeID(deviceValue, 'Geräte');
  const cards = airCardParseArray(airCardRunBackend(['scan-cards', '--device', deviceID]), 'Karten');
  return cards.filter(item => item && typeof item.id === 'string' && /^[A-Za-z0-9._:-]{1,160}$/.test(item.id))
    .map(item => ({ id: item.id, name: String(item.name || 'Wallet-Karte').slice(0, 120) }));
});
ipcMain.handle('aircard:save-artwork', (event, cardValue, fileNameValue, dataUrlValue) => {
  requireAirCardAccess(event);
  const cardID = airCardSafeID(cardValue, 'Karten');
  const fileName = path.basename(String(fileNameValue || 'artwork.png')).slice(0, 180);
  const extension = path.extname(fileName).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.heic', '.tif', '.tiff'].includes(extension)) throw new Error('Erlaubt sind PNG, JPEG, HEIC und TIFF.');
  const match = /^data:[^;,]+;base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(dataUrlValue || ''));
  if (!match) throw new Error('Die Bilddaten haben ein ungültiges Format.');
  const bytes = Buffer.from(match[1].replace(/\s/g, ''), 'base64');
  if (!bytes.length || bytes.length > 12 * 1024 * 1024) throw new Error('Das Artwork muss kleiner als 12 MB sein.');
  let actualExt, mime;
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) { actualExt = 'png'; mime = 'image/png'; }
  else if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) { actualExt = 'jpg'; mime = 'image/jpeg'; }
  else if (bytes.length >= 4 && (bytes.subarray(0, 4).equals(Buffer.from([73, 73, 42, 0])) || bytes.subarray(0, 4).equals(Buffer.from([77, 77, 0, 42])))) { actualExt = 'tiff'; mime = 'image/tiff'; }
  else if (bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(bytes.toString('ascii', 8, 12))) { actualExt = 'heic'; mime = 'image/heic'; }
  else throw new Error('Die Datei ist kein unterstütztes PNG-, JPEG-, HEIC- oder TIFF-Bild.');
  const dir = airCardArtworkDir(), index = airCardReadIndex(), storedName = airCardDiskName(cardID, actualExt);
  const existing = index[cardID];
  if (existing && existing.storedName && path.basename(existing.storedName) === existing.storedName) {
    try { fs.unlinkSync(path.join(dir, existing.storedName)); } catch {}
  }
  fs.writeFileSync(path.join(dir, storedName), bytes, { mode: 0o600 });
  index[cardID] = { storedName, originalName: fileName, mime };
  airCardWriteIndex(index);
  return { fileName };
});
ipcMain.handle('aircard:get-artwork', (event, cardValue) => {
  requireAirCardAccess(event);
  const cardID = airCardSafeID(cardValue, 'Karten'), record = airCardReadIndex()[cardID];
  if (!record || typeof record.storedName !== 'string' || path.basename(record.storedName) !== record.storedName) return null;
  try {
    const data = fs.readFileSync(path.join(airCardArtworkDir(), record.storedName));
    return { fileName: String(record.originalName || record.storedName).slice(0, 180), dataUrl: 'data:' + String(record.mime || 'image/png') + ';base64,' + data.toString('base64') };
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error('Das gespeicherte Artwork konnte nicht gelesen werden.');
  }
});
ipcMain.handle('aircard:apply-skin', (event, deviceValue, cardValue) => {
  requireAirCardAccess(event);
  const deviceID = airCardSafeID(deviceValue, 'Geräte'), cardID = airCardSafeID(cardValue, 'Karten');
  const record = airCardReadIndex()[cardID];
  if (!record || typeof record.storedName !== 'string' || path.basename(record.storedName) !== record.storedName) throw new Error('Bitte zuerst ein Artwork für diese Karte speichern.');
  const artworkPath = path.join(airCardArtworkDir(), record.storedName);
  if (!fs.existsSync(artworkPath)) throw new Error('Das gespeicherte Artwork fehlt.');
  airCardRunBackend(['apply-skin', '--device', deviceID, '--card', cardID, '--artwork', artworkPath]);
  return { ok: true };
});


const AIR_OS_TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.markdown', '.json', '.js', '.cjs', '.mjs', '.css',
  '.html', '.htm', '.csv', '.tsv', '.log', '.xml', '.yaml', '.yml',
  '.toml', '.ini', '.conf', '.sh', '.py', '.sql'
]);
const AIR_OS_TEXT_LIMIT = 2 * 1024 * 1024;

function requireFileAccess(event) {
  requireTrusted(event);
  if (!activeUser) throw new Error('Bitte melde dich zuerst bei Air-OS an.');
}
function ensureFileWorkspace() {
  if (!fileWorkspaceRoot) throw new Error('Bitte wähle zuerst im Finder einen Ordner aus.');
  let root;
  try { root = fs.realpathSync(fileWorkspaceRoot); }
  catch { fileWorkspaceRoot = null; throw new Error('Der ausgewählte Ordner ist nicht mehr verfügbar.'); }
  const stat = fs.statSync(root);
  if (!stat.isDirectory()) { fileWorkspaceRoot = null; throw new Error('Der ausgewählte Pfad ist kein Ordner.'); }
  fileWorkspaceRoot = root;
  return root;
}
function normalizeFileRelative(value) {
  const raw = String(value == null ? '' : value);
  if (raw.indexOf(String.fromCharCode(0)) !== -1) throw new Error('Ungültiger Dateipfad.');
  const slashPath = raw.replace(/\\/g, '/');
  if (slashPath.startsWith('/') || /^[A-Za-z]:\//.test(slashPath)) throw new Error('Absolute Pfade sind nicht erlaubt.');
  const segments = slashPath.split('/').filter(part => part && part !== '.');
  if (segments.some(part => part === '..')) throw new Error('Der Pfad darf den ausgewählten Ordner nicht verlassen.');
  if (segments.some(part => part.includes(':'))) throw new Error('Ungültiger Dateipfad.');
  return segments.join(path.sep);
}
function resolveWorkspacePath(relativeValue, options = {}) {
  const root = ensureFileWorkspace();
  const relative = normalizeFileRelative(relativeValue);
  if (!relative) {
    if (options.allowRoot) return root;
    throw new Error('Bitte gib eine Datei an.');
  }
  const segments = relative.split(path.sep);
  let current = root;
  for (let i = 0; i < segments.length; i += 1) {
    current = path.join(current, segments[i]);
    try {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error('Symbolische Links werden im Finder aus Sicherheitsgründen nicht geöffnet.');
      if (i < segments.length - 1 && !stat.isDirectory()) throw new Error('Ein Pfadbestandteil ist kein Ordner.');
      if (i === segments.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Dieser Dateityp wird nicht unterstützt.');
    } catch (error) {
      if (error.code === 'ENOENT' && options.allowMissingFinal && i === segments.length - 1) return current;
      throw error;
    }
  }
  const canonical = path.resolve(current);
  const relFromRoot = path.relative(root, canonical);
  if (relFromRoot === '..' || relFromRoot.startsWith('..' + path.sep) || path.isAbsolute(relFromRoot)) {
    throw new Error('Der Pfad darf den ausgewählten Ordner nicht verlassen.');
  }
  return canonical;
}
function fileRelativeForUI(absolutePath) {
  return path.relative(ensureFileWorkspace(), absolutePath).split(path.sep).join('/');
}
ipcMain.handle('air-os:files:select-folder', async event => {
  requireFileAccess(event);
  const result = await dialog.showOpenDialog(mainWindow || undefined, {
    title: 'Ordner für Air-OS auswählen',
    properties: ['openDirectory']
  });
  if (result.canceled || !result.filePaths || !result.filePaths[0]) return null;
  fileWorkspaceRoot = fs.realpathSync(result.filePaths[0]);
  return { name: path.basename(fileWorkspaceRoot) || fileWorkspaceRoot, path: '' };
});
ipcMain.handle('air-os:files:current-folder', event => {
  requireFileAccess(event);
  if (!fileWorkspaceRoot) return null;
  try {
    const root = ensureFileWorkspace();
    return { name: path.basename(root) || root, path: '' };
  } catch {
    return null;
  }
});
ipcMain.handle('air-os:files:search', async (event, query) => {
  requireFileAccess(event);
  const root=ensureFileWorkspace();
  return findFileNames(root,query);
});
ipcMain.handle('air-os:files:list-directory', (event, relativeValue = '') => {
  requireFileAccess(event);
  const directory = resolveWorkspacePath(relativeValue, { allowRoot: true });
  if (!fs.statSync(directory).isDirectory()) throw new Error('Das ausgewählte Element ist kein Ordner.');
  const baseRelative = normalizeFileRelative(relativeValue).split(path.sep).filter(Boolean).join('/');
  const items = [];
  for (const name of fs.readdirSync(directory)) {
    if (name === '.DS_Store' || name === 'Thumbs.db') continue;
    const absolutePath = path.join(directory, name);
    let stat;
    try { stat = fs.lstatSync(absolutePath); } catch { continue; }
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) continue;
    const relativePath = [baseRelative, name].filter(Boolean).join('/');
    items.push({
      name,
      path: relativePath,
      kind: stat.isDirectory() ? 'folder' : 'file',
      size: stat.isFile() ? stat.size : 0,
      modifiedAt: stat.mtime.toISOString(),
      extension: stat.isFile() ? path.extname(name).toLowerCase() : ''
    });
  }
  items.sort((a, b) => a.kind === b.kind
    ? a.name.localeCompare(b.name, 'de', { sensitivity: 'base', numeric: true })
    : (a.kind === 'folder' ? -1 : 1));
  const root = ensureFileWorkspace();
  return {
    rootName: path.basename(root) || root,
    path: baseRelative,
    parentPath: baseRelative.includes('/') ? baseRelative.slice(0, baseRelative.lastIndexOf('/')) : '',
    items
  };
});
ipcMain.handle('air-os:files:read-text', (event, relativeValue) => {
  requireFileAccess(event);
  const filePath = resolveWorkspacePath(relativeValue);
  const extension = path.extname(filePath).toLowerCase();
  if (!AIR_OS_TEXT_EXTENSIONS.has(extension)) throw new Error('Diese Datei ist keine unterstützte Textdatei. Öffne sie mit der zugehörigen Computer-App.');
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) throw new Error('Das Element ist keine Datei.');
  if (stat.size > AIR_OS_TEXT_LIMIT) throw new Error('Textdateien über 2 MB können im Air-OS-Editor nicht geöffnet werden.');
  const bytes = fs.readFileSync(filePath);
  if (bytes.includes(0)) throw new Error('Die Datei sieht wie eine Binärdatei aus und wird nicht im Texteditor geöffnet.');
  return { path: normalizeFileRelative(relativeValue).split(path.sep).join('/'), content: bytes.toString('utf8') };
});
ipcMain.handle('air-os:files:create-text', (event, relativeValue) => {
  requireFileAccess(event);
  const relative=normalizeFileRelative(relativeValue);
  if(!relative)throw new Error('Bitte gib einen Dateinamen an.');
  if(!AIR_OS_TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase()))
    throw new Error('Zum Erstellen sind nur unterstützte Textdateien erlaubt.');
  const target=resolveWorkspacePath(relative,{allowMissingFinal:true});
  createEmptyTextExclusive(target);
  return {ok:true,path:relative.split(path.sep).join('/')};
});
ipcMain.handle('air-os:files:write-text', (event, relativeValue, textValue) => {
  requireFileAccess(event);
  const relative = normalizeFileRelative(relativeValue);
  if (!relative) throw new Error('Bitte gib einen Dateinamen an.');
  const content = String(textValue == null ? '' : textValue);
  if (Buffer.byteLength(content, 'utf8') > AIR_OS_TEXT_LIMIT) throw new Error('Der Text darf höchstens 2 MB groß sein.');
  const extension = path.extname(relative).toLowerCase();
  if (!AIR_OS_TEXT_EXTENSIONS.has(extension)) throw new Error('Zum Speichern sind nur unterstützte Textdateien erlaubt.');
  const target = resolveWorkspacePath(relative, { allowMissingFinal: true });
  const parent = path.dirname(target);
  if (!fs.statSync(parent).isDirectory()) throw new Error('Der Zielordner existiert nicht.');
  try {
    const existing = fs.lstatSync(target);
    if (existing.isSymbolicLink() || !existing.isFile()) throw new Error('Die Zieldatei ist kein reguläres Dokument.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temp = path.join(parent, '.airos-save-' + crypto.randomBytes(8).toString('hex') + '.tmp');
  // Reserve exclusively before entering cleanup: an EEXIST path is not ours.
  const descriptor = fs.openSync(temp, 'wx', 0o600);
  try {
    try {
      fs.writeFileSync(descriptor, content, { encoding: 'utf8' });
    } finally {
      fs.closeSync(descriptor);
    }
    fs.renameSync(temp, target);
  } finally {
    try { if (fs.existsSync(temp)) fs.unlinkSync(temp); } catch {}
  }
  return { ok: true, path: relative.split(path.sep).join('/') };
});
ipcMain.handle('air-os:files:create-folder', (event, relativeValue) => {
  requireFileAccess(event);
  const root=ensureFileWorkspace();
  return createFolder(root,relativeValue);
});
ipcMain.handle('air-os:files:duplicate', (event, from, to) => {
  requireFileAccess(event);
  return duplicateFile(ensureFileWorkspace(),from,to);
});
ipcMain.handle('air-os:files:rename', (event, from, to) => {
  requireFileAccess(event);
  return renameFile(ensureFileWorkspace(),from,to);
});
ipcMain.handle('air-os:files:open-native', async (event, relativeValue) => {
  requireFileAccess(event);
  const target = resolveWorkspacePath(relativeValue);
  if (!fs.statSync(target).isFile()) throw new Error('Bitte wähle eine Datei aus.');
  const error = await shell.openPath(target);
  return error ? { ok: false, error } : { ok: true };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.quattrologic.airos');
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
