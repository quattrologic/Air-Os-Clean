'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Modern uses original Air-OS logo PNG bytes; Classic restores Grid without repainting other app icons',()=>{
 const source=fs.readFileSync(require.resolve('../air-launchpad.js'),'utf8');let theme='modern',listener;
 const icon={innerHTML:''};const context={vectorIcon:{},readAirSettings:()=>({desktopTheme:theme}),document:{querySelectorAll:selector=>{assert.equal(selector,'.launchpad-icon');return[icon]},addEventListener:(event,fn)=>{assert.equal(event,'air-settings-changed');listener=fn}}};
 vm.runInNewContext(source.slice(source.indexOf(' const classicLaunchpadIcon='),source.indexOf(' window.airLaunchpad=')),context);
 const data=icon.innerHTML.match(/data:image\/png;base64,([^" ]+)/)[1];assert.deepEqual(Buffer.from(data,'base64'),fs.readFileSync(require.resolve('../assets/air-logo.png')));
 const logo=icon.innerHTML;theme='classic';listener();assert.notEqual(icon.innerHTML,logo);assert.match(icon.innerHTML,/#b8dffa/);theme='modern';listener();assert.equal(icon.innerHTML,logo);
});
