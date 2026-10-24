'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('lighter Modern glass retains readable pill text on a white background and a decorative, non-layout divider',()=>{
 const dock=fs.readFileSync(require.resolve('../air-modern-dock.css'),'utf8'),island=fs.readFileSync(require.resolve('../air-island.css'),'utf8');
 const material=island.split('/* Subtle glass,')[1].match(/background:rgba\((\d+),(\d+),(\d+),([.\d]+)\)/);assert.ok(material);
 const [,r,g,b,a]=material.map(Number),alpha=a;
 assert.ok(alpha>0&&alpha<.84,'more transparent than prior material');
 const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
 const backdrop=[r,g,b].map(v=>v*alpha+255*(1-alpha));
 assert.ok((luminance([248,247,243])+.05)/(luminance(backdrop)+.05)>=4.5,'warm white clock text readable even over white');
 const divider=dock.split('/* A decorative divider')[1];assert.ok(divider);
 assert.match(divider,/html\[data-desktop-theme="modern"\] \.dock\[data-theme="modern"\]/);
 assert.match(divider,/:has\(~ \.dock-app:not\(\[hidden\]\)\)/);assert.match(divider,/position:absolute/);assert.match(divider,/pointer-events:none/);assert.match(divider,/width:1px;height:28px/);
});
