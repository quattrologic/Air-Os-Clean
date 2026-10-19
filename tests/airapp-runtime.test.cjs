'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {createRuntime}=require('../src/main/airapp-runtime.cjs');
function setup(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'airos-runtime-'));
 fs.writeFileSync(path.join(root,'index.html'),'<h1>Safe app</h1>');
 fs.writeFileSync(path.join(root,'app.js'),'console.log("safe")');
 fs.writeFileSync(path.join(root,'manifest.airapp.json'),JSON.stringify({files:[{path:'index.html'},{path:'app.js'}]}));
 let route;
 const partition={protocol:{handle(_scheme,fn){route=fn}},webRequest:{onBeforeRequest(){}},setPermissionRequestHandler(){},setPermissionCheckHandler(){},on(){}};
 class Window extends EventEmitter{
  constructor(options){super();this.options=options;this.webContents=new EventEmitter();this.webContents.setWindowOpenHandler=()=>{};this.show=()=>{};this.focus=()=>{};this.isDestroyed=()=>false;this.loadURL=async url=>{this.url=url};this.close=()=>this.emit('closed')}
 }
 const manager={installedFolder(){return root},installed(){return [{id:'com.airos.demo.timer',name:'Air Timer',entry:'index.html'}]}};
 const runtime=createRuntime({BrowserWindow:Window,protocol:{registerSchemesAsPrivileged(){}},session:{fromPartition:()=>partition},manager});
 return {root,runtime,manager,route:()=>route,close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('signed runtime serves bundled files but refuses foreign origins and unlisted files',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  const request=(url,method='GET')=>c.route()({url,method});
  assert.equal((await request('airapp://com.airos.demo.timer/index.html')).status,200);
  assert.equal((await request('https://evil.example.com/app.js')).status,403);
  assert.equal((await request('airapp://com.airos.demo.timer/secret.txt')).status,403);
  assert.equal((await request('airapp://com.airos.demo.timer/index.html','POST')).status,403);
 }finally{c.close()}
});
test('runtime refuses symlinked assets and parent directory escape',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  fs.renameSync(path.join(c.root,'app.js'),path.join(c.root,'app.js.orig'));
  try{fs.symlinkSync(path.join(c.root,'index.html'),path.join(c.root,'app.js'))}
  catch(error){if(process.platform==='win32'&&error.code==='EPERM')return;throw error}
  const r=await c.route()({url:'airapp://com.airos.demo.timer/app.js',method:'GET'});
  assert.equal(r.status,403);
 }finally{c.close()}
});
