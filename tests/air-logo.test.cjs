'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Modern uses the official geometric symbol in white without a tile or shared SVG IDs; Classic restores Grid',()=>{
 const source=fs.readFileSync(require.resolve('../air-launchpad.js'),'utf8');let theme='modern',listener;
 const icon={innerHTML:''};const context={vectorIcon:{},readAirSettings:()=>({desktopTheme:theme}),document:{querySelectorAll:selector=>{assert.equal(selector,'.launchpad-icon');return[icon]},addEventListener:(event,fn)=>{assert.equal(event,'air-settings-changed');listener=fn}}};
 vm.runInNewContext(source.slice(source.indexOf(' const classicLaunchpadIcon='),source.indexOf(' window.airLaunchpad=')),context);
 const original=fs.readFileSync(require.resolve('../index.html'),'utf8').match(/<svg viewBox="180 180 900 900".*?<path d="([^"]+)"/)[1];
 assert.equal(icon.innerHTML.match(/<path d="([^"]+)"/)[1],original);
 assert.match(icon.innerHTML,/fill="#fff"/);assert.doesNotMatch(icon.innerHTML,/<image|<rect| id=|mask=/);
 const logo=icon.innerHTML;theme='classic';listener();assert.notEqual(icon.innerHTML,logo);assert.match(icon.innerHTML,/#b8dffa/);theme='modern';listener();assert.equal(icon.innerHTML,logo);
});
