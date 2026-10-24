'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createSpotifyLauncher}=require('../src/main/spotify-launcher.cjs');
function setup(platform,file,extra={}){
 const calls=[];
 const launcher=createSpotifyLauncher({platform,app:{getApplicationInfoForProtocol:async uri=>{assert.equal(uri,'spotify://');return {path:file}}},shell:{openPath:async p=>{calls.push(p);return ''}},realpath:async p=>p,stat:async()=>({isFile:()=>true,isDirectory:()=>true}),...extra});
 return {launcher,calls};
}
for(const [platform,file] of [['win32','C:\\Users\\Alice\\Spotify\\Spotify.exe'],['darwin','/Applications/Spotify.app']]){
 test(`${platform}: opens only the native app and coalesces simultaneous clicks`,async()=>{
  const c=setup(platform,file);const a=c.launcher.launch(),b=c.launcher.launch();
  assert.equal(a,b);assert.deepEqual(await a,{ok:true,launchRequested:true});
  assert.deepEqual(c.calls,[file]);await c.launcher.launch();assert.equal(c.calls.length,2);
 });
}
test('rejects URLs, browsers, relative paths, UNC paths and traversal',async()=>{
 for(const file of ['https://open.spotify.com/','Spotify.exe','C:\\Chrome.exe','\\\\server\\Spotify.exe','C:\\Apps\\..\\Spotify.exe','C:\\Spotify.exe\0']){
  const c=setup('win32',file);await assert.rejects(c.launcher.launch());assert.deepEqual(c.calls,[]);
 }
 const c=setup('darwin','/Applications/Safari.app');await assert.rejects(c.launcher.launch());assert.deepEqual(c.calls,[]);
});
test('missing app, changed canonical target, unsupported OS and launch failure fail closed',async()=>{
 const missing=setup('win32','C:\\Spotify.exe',{app:{getApplicationInfoForProtocol:async()=>{throw Error('absent')}}});
 await assert.rejects(missing.launcher.launch(),/nicht gefunden/);
 const changed=setup('win32','C:\\Spotify.exe',{realpath:async()=> 'C:\\Browser.exe'});
 await assert.rejects(changed.launcher.launch(),/Ungültiger/);assert.deepEqual(changed.calls,[]);
 await assert.rejects(setup('linux','/Spotify.app').launcher.launch(),/Windows und macOS/);
 await assert.rejects(setup('win32','C:\\Spotify.exe',{shell:{openPath:async()=> 'failed'}}).launcher.launch(),/nicht gestartet/);
});
test('renderer routes Spotify directly through native bridge without a browser or fake window',async()=>{
 const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
 const fn=source.slice(source.indexOf('function openApp(id){'),source.indexOf(' const registered=',source.indexOf('function openApp(id){')))+'}';
 let launches=0;const messages=[];
 const context=vm.createContext({window:{airOS:{launchSpotify:async()=>{launches++}}},toast:s=>messages.push(s)});
 vm.runInContext(fn,context);context.openApp('spotify');await new Promise(r=>setImmediate(r));
 assert.equal(launches,1);assert.match(messages[0],/Betriebssystem/);
 assert.ok(JSON.parse(fs.readFileSync(require.resolve('../package.json'),'utf8')).build.files.includes('src/main/spotify-launcher.cjs'));
 assert.ok(!fs.readFileSync(require.resolve('../air-os-enhancements.js'),'utf8').includes('https://open.spotify.com/'));
});
test('IPC requires trusted authenticated access before native launch',async()=>{
 const source=fs.readFileSync(require.resolve('../main.cjs'),'utf8');
 const line=source.split('\n').find(s=>s.startsWith("ipcMain.handle('air-os:spotify:launch'"));
 let handler,authorized=false,calls=0;
 vm.runInNewContext(line,{ipcMain:{handle:(channel,fn)=>{assert.equal(channel,'air-os:spotify:launch');handler=fn}},requirePreferenceUser:()=>{if(!authorized)throw Error('Denied')},spotifyLauncher:{launch:async()=>{calls++;return {ok:true}}}});
 assert.throws(()=>handler({}),/Denied/);assert.equal(calls,0);
 authorized=true;await handler({});assert.equal(calls,1);
 let api;const ipc=[];
 vm.runInNewContext(fs.readFileSync(require.resolve('../preload.cjs'),'utf8'),{process:{platform:'win32'},require:()=>({contextBridge:{exposeInMainWorld:(_name,value)=>{api=value}},ipcRenderer:{invoke:(...args)=>ipc.push(args)}})});
 api.launchSpotify('https://evil.example');assert.deepEqual(ipc,[['air-os:spotify:launch']]);
});

// Synthetic OS responses: these contract tests do not prove native compatibility.
test('native path matrix: regular Windows, packaged Windows path and macOS user bundle',async()=>{
 for(const [platform,file] of [
  ['win32','C:\\Users\\Alice\\AppData\\Roaming\\Spotify\\Spotify.exe'],
  ['win32','C:\\Program Files\\WindowsApps\\SpotifyAB.SpotifyMusic_fixture_x64__fixture\\Spotify.exe'],
  ['darwin','/Users/Alice/Applications/Spotify.app']
 ]){
  const c=setup(platform,file,{stat:async()=>({isFile:()=>platform==='win32',isDirectory:()=>platform==='darwin'})});
  assert.deepEqual(await c.launcher.launch(),{ok:true,launchRequested:true});
  assert.deepEqual(await c.launcher.launch(),{ok:true,launchRequested:true});
  assert.deepEqual(c.calls,[file,file]); // A second OS request, not a claim of window activation.
 }
});
test('unsupported Store activation identifiers fail without browser fallback',async()=>{
 for(const file of ['shell:AppsFolder\\SpotifyAB.SpotifyMusic_fixture!Spotify','SpotifyAB.SpotifyMusic_fixture!Spotify','C:\\Windows\\System32\\ApplicationFrameHost.exe']){
  const c=setup('win32',file);
  await assert.rejects(c.launcher.launch(),/kein unterstützter Spotify/);
  assert.deepEqual(c.calls,[]);
 }
});
test('unreadable Store path fails closed and a later request can retry',async()=>{
 let unavailable=true;
 const c=setup('win32','C:\\Program Files\\WindowsApps\\Spotify_fixture\\Spotify.exe',{
  realpath:async p=>{if(unavailable)throw Object.assign(Error('Access denied'),{code:'EACCES'});return p}
 });
 await assert.rejects(c.launcher.launch(),{code:'EACCES'});assert.deepEqual(c.calls,[]);
 unavailable=false;assert.deepEqual(await c.launcher.launch(),{ok:true,launchRequested:true});assert.equal(c.calls.length,1);
});
test('Dock and Launchpad routing reach native bridge and surface missing-client errors',async()=>{
 const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
 const start=source.indexOf('function openApp(id){');
 const nativeBranch=source.slice(start,source.indexOf(' const registered=',start))+'}';
 const registry=require('../src/core/app-registry.js');assert.equal(registry.get('spotify').name,'Spotify');
 const messages=[],listeners=new Map(),button={dataset:{app:'spotify'},addEventListener:(type,fn)=>listeners.set(type,fn)};
 const native=setup('win32','',{app:{getApplicationInfoForProtocol:async()=>{throw Error('not installed')}}});
 const context=vm.createContext({openApps:new Map(),modernWindowMotion:()=>true,window:{airAppRegistry:registry,airOS:{launchSpotify:()=>native.launcher.launch()}},
  toast:message=>messages.push(message),document:{querySelectorAll:()=>[button]}});
 vm.runInContext(nativeBranch,context);
 const dockHandlers=source.slice(source.indexOf('for (const launcher of document.querySelectorAll(".dock-app[data-app], .desktop-icon[data-app]"))'));
 vm.runInContext(dockHandlers,context);
 listeners.get('click')({preventDefault(){},stopPropagation(){}});
 await new Promise(r=>setImmediate(r));assert.match(messages.pop(),/Spotify-Desktop-App nicht gefunden.*installieren/);
 // Execute the existing delegated Launchpad/window route with its data-app entry.
 const route=source.split('\n').find(line=>line.includes('const app=e.target.closest("[data-app]")'));
 vm.runInContext('function click(e){'+route+'}',context);
 context.click({target:{closest:selector=>{assert.equal(selector,'[data-app]');return button}}});
 await new Promise(r=>setImmediate(r));assert.match(messages.pop(),/Spotify-Desktop-App nicht gefunden.*installieren/);
 assert.deepEqual(native.calls,[]);
 const installed=setup('win32','C:\\Users\\Alice\\Spotify\\Spotify.exe');
 context.window.airOS.launchSpotify=()=>installed.launcher.launch();
 listeners.get('click')({preventDefault(){},stopPropagation(){}});
 await new Promise(r=>setImmediate(r));assert.match(messages.pop(),/Betriebssystem/);
 context.click({target:{closest:()=>button}});
 await new Promise(r=>setImmediate(r));assert.match(messages.pop(),/Betriebssystem/);
 assert.equal(installed.calls.length,2);
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
 assert.match(html, /class="dock-app[^"\n]*"[^>]*data-app="spotify"/);
 assert.ok(html.includes('air-modern-dock.css'));
 assert.ok(fs.readFileSync(require.resolve('../air-launchpad.js'),'utf8').includes('b.dataset.app=app.id'));
});
