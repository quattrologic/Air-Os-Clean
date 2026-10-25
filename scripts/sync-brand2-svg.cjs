'use strict';
const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'../assets/brand'),master=fs.readFileSync(path.join(dir,'air-os-master.svg'),'utf8'),p=master.match(/<path d="([^"]+)"/)[1];
fs.writeFileSync(path.join(dir,'air-os-black.svg'),master);fs.writeFileSync(path.join(dir,'air-os-white.svg'),master.replace('fill="#000"','fill="#fff"'));
for(const f of ['air-os-app.svg','air-os-maskable.svg']){const file=path.join(dir,f);fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace(/<path d="[^"]+"/, '<path d="'+p+'"'))}
console.log('Derived variants from official SVG master; shape unchanged.');

const root=path.join(__dirname,'..'),box=master.match(/viewBox="([^"]+)"/)[1];
let index=fs.readFileSync(path.join(root,'index.html'),'utf8');index=index.replace(/<svg viewBox="180 180 900 900".*?<\/svg>/, '<svg viewBox="'+box+'" role="img" aria-label="Air-OS" xmlns="http://www.w3.org/2000/svg"><path d="'+p+'" fill="#000"/></svg>');fs.writeFileSync(path.join(root,'index.html'),index);
let launcher=fs.readFileSync(path.join(root,'air-launchpad.js'),'utf8');launcher=launcher.replace(/ const airLaunchpadLogo=.*?;\n/, ' const airLaunchpadLogo=\'<svg viewBox="'+box+'" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="'+p+'" fill="#fff"/></svg>\';\n');fs.writeFileSync(path.join(root,'air-launchpad.js'),launcher);
