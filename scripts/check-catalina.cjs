'use strict';
// Electron 33+ cannot run on macOS Catalina 10.15.
const p = require('../package.json');
const major = Number(p.devDependencies.electron.split('.')[0]);
if (!Number.isInteger(major) || major > 32 || major < 27) throw new Error('Catalina benötigt Electron 27–32.');
if (p.build.mac.minimumSystemVersion !== '10.15.0') throw new Error('macOS minimumSystemVersion muss 10.15.0 sein.');
if (!p.build.files.includes('air-music.js') || !p.build.files.includes('air-arcade-games.js')) throw new Error('Neue Apps fehlen im Build.');
console.log('Catalina-Konfiguration OK: Electron '+p.devDependencies.electron+', macOS >= '+p.build.mac.minimumSystemVersion);
