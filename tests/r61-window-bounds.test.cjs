'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{pathToFileURL,fileURLToPath}=require('node:url');
test('R6.1 Modern host has no Dock/Island reservation; Classic layout and M2 source stay scoped',()=>{
 const s=fs.readFileSync('styles.css','utf8');a.match(s,/html\[data-desktop-theme=modern\] \.desktop\{inset:24px 0 0!important\}/);a.match(s,/html\[data-desktop-theme=modern\] \.desktop \.windows\{inset:0!important\}/);
 const c=fs.readFileSync('air-platform-system.css','utf8');a.match(c,/height:24px/);a.doesNotMatch(c,/26px/);
 a.match(fs.readFileSync('air-window-system.js','utf8'),/stopFullscreen\?\.\(\)/);
});
test('R6.1 real native F11 handler toggles only authenticated desktop and ignores repeat/key-up',()=>{
 const s=fs.readFileSync('main.cjs','utf8'),events={},native={};let full=false,count=0;const root=path.resolve('/synthetic');
 const ctx={path,fileURLToPath,activeUser:{preferenceSession:'owner'},app:{getAppPath:()=>root},mainWindow:{isDestroyed:()=>false,isFullScreen:()=>full,setFullScreen:x=>{full=x;count++},on:(n,fn)=>native[n]=fn,webContents:{mainFrame:{url:pathToFileURL(path.join(root,'index.html')).href},on:(n,fn)=>events[n]=fn,send:()=>{}}}};
 vm.createContext(ctx);vm.runInContext(s.slice(s.indexOf('  // Native F11'),s.indexOf('  mainWindow.webContents.setWindowOpenHandler')),ctx);
 const key=extra=>events['before-input-event']({preventDefault(){}},{key:'F11',type:'keyDown',...extra});key();a.equal(full,true);key();a.equal(full,false);key({isAutoRepeat:true});key({type:'keyUp'});a.equal(count,2);ctx.activeUser=null;key();a.equal(count,2);ctx.activeUser={};ctx.mainWindow.webContents.mainFrame.url=pathToFileURL(path.join(root,'login.html')).href;key();a.equal(count,2);
});
