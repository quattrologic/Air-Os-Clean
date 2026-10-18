'use strict';
// Selection policy only. No file reads, network calls, or uploads.
const path = require('node:path');
const CATEGORIES = Object.freeze(['settings', 'app-data', 'airwrite', 'finder']);
const DEFAULTS = Object.freeze({ enabled: false, categories: Object.freeze({ settings: false, 'app-data': false, airwrite: false, finder: false }), finderItems: Object.freeze([]), appIds: Object.freeze([]) });
function safeId(v) { return typeof v === 'string' && /^[a-zA-Z0-9._-]{1,80}$/.test(v) && v !== '.' && v !== '..'; }
function normalizeRelativeFile(p) {
  if (typeof p !== 'string' || !p || p.length > 1024 || p.includes('\\') || p.includes('\0') || path.posix.isAbsolute(p) || /^[A-Za-z]:/.test(p)) throw new Error('Invalid relative file path');
  const parts = p.split('/');
  if (parts.some(x => !x || x === '.' || x === '..' || x.startsWith('.'))) throw new Error('Invalid path segment');
  if (parts.some(x => /[<>:"|?*]/.test(x))) throw new Error('Invalid filename');
  return parts.join('/');
}
function normalizeSelection(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid sync selection');
  if (typeof value.enabled !== 'boolean') throw new Error('Explicit enabled flag required');
  const categories = {};
  for (const name of CATEGORIES) {
    if (typeof value.categories?.[name] !== 'boolean') throw new Error('Explicit category consent required: ' + name);
    categories[name] = value.categories[name];
  }
  const appIds = value.appIds || [], finderItems = value.finderItems || [];
  if (!Array.isArray(appIds) || !Array.isArray(finderItems) || appIds.length > 100 || finderItems.length > 1000) throw new Error('Invalid selection size');
  if (!appIds.every(safeId)) throw new Error('Invalid app ID');
  const files = finderItems.map(normalizeRelativeFile);
  if (new Set(files).size !== files.length || new Set(appIds).size !== appIds.length) throw new Error('Duplicate selection');
  return { enabled: value.enabled, categories, appIds: [...appIds], finderItems: files };
}
function canSync(selection, kind, id) {
  const s = normalizeSelection(selection);
  if (!s.enabled || !s.categories[kind]) return false;
  if (kind === 'settings') return true;
  if (kind === 'app-data') return safeId(id) && s.appIds.includes(id);
  if (kind === 'airwrite') return id === 'airwrite' && s.appIds.includes('airwrite');
  if (kind === 'finder') {
    try { return s.finderItems.includes(normalizeRelativeFile(id)); } catch { return false; }
  }
  return false;
}
module.exports = { CATEGORIES, DEFAULTS, normalizeSelection, normalizeRelativeFile, canSync };
