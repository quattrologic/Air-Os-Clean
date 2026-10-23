'use strict';
// Guard against accidentally shipping legacy Electron as a modern-channel app.
const fs=require('node:fs'),path=require('node:path');
const p=require('../package.json'),e=require('electron/package.json');
const major=Number(e.version.split('.')[0]);
if(!Number.isInteger(major)||major<44)throw new Error('Modern channel requires Electron 44+ installed in node_modules.');
if(p.build.mac.minimumSystemVersion!=='10.15.0')throw new Error('Keep Catalina legacy settings unchanged in package.json.');
for(const file of ['src/core/app-registry.js','src/main/preferences.cjs','air-launchpad.js','air-spotlight.js']){
 if(!fs.existsSync(path.join(__dirname,'..',file)))throw new Error('Missing modern channel asset: '+file);
}
console.log('Modern Electron',e.version,'macOS >=13.0; legacy package remains on Electron',p.devDependencies.electron);
