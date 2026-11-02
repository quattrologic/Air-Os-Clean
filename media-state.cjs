'use strict';
const fs = require('node:fs');
const path = require('node:path');

const USERNAME = /^[A-Za-z0-9._-]{3,24}$/;
const ARTWORK = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
function limitText(value, length) {
  return typeof value === 'string' ? value.trim().slice(0, length) : '';
}
function seconds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 24 * 3600) : 0;
}
function normalize(input = {}) {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const artwork = typeof data.artwork === 'string' && data.artwork.length <= 250000 && ARTWORK.test(data.artwork)
    ? data.artwork : '';
  return {
    title: limitText(data.title, 120),
    artist: limitText(data.artist, 100),
    artwork,
    position: seconds(data.position),
    duration: seconds(data.duration),
    updatedAt: limitText(data.updatedAt, 32)
  };
}
function createMediaStore(directory) {
  function fileFor(username) {
    if (typeof username !== 'string' || !USERNAME.test(username)) throw new Error('Ungültiger Benutzername.');
    return path.join(directory, 'last-media', username.toLowerCase('en-US') + '.json');
  }
  function read(username) {
    const file = fileFor(username);
    try { return normalize(JSON.parse(fs.readFileSync(file, 'utf8'))); }
    catch (error) {
      if (error.code !== 'ENOENT') console.error('Air Music: Letzten Titel nicht lesbar:', error.message);
      return null;
    }
  }
  function write(username, input) {
    const file = fileFor(username);
    const last = normalize({ ...input, updatedAt: new Date().toISOString() });
    if (!last.title) return { ok: false, error: 'Musiktitel fehlt.' };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = file + '.tmp';
    try {
      fs.writeFileSync(temp, JSON.stringify(last), { encoding: 'utf8', mode: 0o600 });
      fs.renameSync(temp, file);
      return { ok: true };
    } finally {
      try { fs.unlinkSync(temp); } catch { /* Already moved or not created. */ }
    }
  }
  return { read, write };
}
module.exports = { createMediaStore, normalize };
