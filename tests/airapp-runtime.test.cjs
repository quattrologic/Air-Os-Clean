'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const {createRuntime}=require('../src/main/airapp-runtime.cjs');
function setup({delayLoad=false,vetoClose=false}={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'airos-runtime-'));
 fs.writeFileSync(path.join(root,'index.html'),'<h1>Safe app</h1>');
 fs.writeFileSync(path.join(root,'app.js'),'console.log("safe")');
 const digest=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
 fs.writeFileSync(path.join(root,'manifest.airapp.json'),JSON.stringify({files:[{path:'index.html',sha256:digest('index.html')},{path:'app.js',sha256:digest('app.js')}]}));
 let route,resumeLoad,rejectLoad,created=0;
 const instances=[];
 const partitions=new Map();
 function fromPartition(name){
  if(!partitions.has(name))partitions.set(name,{protocol:{handle(_scheme,fn){this.route=fn;route=fn}},webRequest:{onBeforeRequest(){}},setPermissionRequestHandler(){},setPermissionCheckHandler(){},on(){}});
  return partitions.get(name);
 }
 class Window extends EventEmitter{
  constructor(options){super();created++;instances.push(this);this.options=options;this.webContents=new EventEmitter();this.webContents.setWindowOpenHandler=()=>{};this.show=()=>{};this.focus=()=>{};this.destroyed=false;this.isDestroyed=()=>this.destroyed;this.loadURL=async url=>{this.url=url;if(delayLoad)await new Promise((resolve,reject)=>{resumeLoad=resolve;rejectLoad=reject})};this.destroy=()=>{if(!this.destroyed){this.destroyed=true;this.emit('closed')}};this.close=()=>{if(!vetoClose)this.destroy()}}
 }
 const manager={installedFolder(){return root},installed(){return [{id:'com.airos.demo.timer',name:'Air Timer',entry:'index.html'}]}};
 const runtime=createRuntime({BrowserWindow:Window,protocol:{registerSchemesAsPrivileged(){}},session:{fromPartition},manager});
 return {root,runtime,manager,instances,route:()=>route,created:()=>created,release:()=>resumeLoad?.(),fail:()=>rejectLoad?.(new Error('Load failed')),close:()=>fs.rmSync(root,{recursive:true,force:true})};
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

test('runtime refuses assets modified after initial verification',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  fs.writeFileSync(path.join(c.root,'app.js'),'console.log("tampered")');
  const result=await c.route()({url:'airapp://com.airos.demo.timer/app.js',method:'GET'});
  assert.equal(result.status,403);
 }finally{c.close()}
});

test('reopened persistent session loads newly verified manifest and rejects removed assets',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  const old=await c.route()({url:'airapp://com.airos.demo.timer/app.js',method:'GET'});
  assert.equal(old.status,200);
  c.runtime.close('Alice','com.airos.demo.timer');
  // Simulate a signed replacement with a different asset listing.
  const revised=Buffer.from('<h1>New signed version</h1>');
  fs.writeFileSync(path.join(c.root,'index.html'),revised);
  const digest=crypto.createHash('sha256').update(revised).digest('hex');
  fs.writeFileSync(path.join(c.root,'manifest.airapp.json'),JSON.stringify({files:[{path:'index.html',sha256:digest}]}));
  await c.runtime.open('Alice','com.airos.demo.timer');
  const updated=await c.route()({url:'airapp://com.airos.demo.timer/index.html',method:'GET'});
  assert.equal(updated.status,200);
  assert.equal(await updated.text(),revised.toString('utf8'));
  const removed=await c.route()({url:'airapp://com.airos.demo.timer/app.js',method:'GET'});
  assert.equal(removed.status,403);
 }finally{c.close()}
});
test('open protocol handler refuses assets when installation is missing',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  c.manager.installedFolder=()=>{throw new Error('App uninstalled')};
  const response=await c.route()({url:'airapp://com.airos.demo.timer/index.html',method:'GET'});
  assert.notEqual(response.status,200);
 }finally{c.close()}
});

test('concurrent launches share one signed app window',async()=>{
 const c=setup({delayLoad:true});
 try{
  const first=c.runtime.open('Alice','com.airos.demo.timer');
  const second=c.runtime.open('Alice','com.airos.demo.timer');
  assert.equal(c.created(),1,'only one BrowserWindow should be created while loading');
  c.release();
  const [initial,reused]=await Promise.all([first,second]);
  assert.deepEqual(initial,{ok:true,alreadyOpen:false});
  assert.deepEqual(reused,{ok:true,alreadyOpen:true});
  assert.equal(c.created(),1);
 }finally{c.close()}
});

for(const action of ['close','closeAll','loadFailure']){
 test(`startup ${action} rejects all waiting launches and allows retry`,async()=>{
  const c=setup({delayLoad:true});
  try{
   const first=c.runtime.open('Alice','com.airos.demo.timer');
   const second=c.runtime.open('Alice','com.airos.demo.timer');
   const failures=Promise.all([
    assert.rejects(first,action==='loadFailure'?/Load failed/:/closed during startup/),
    assert.rejects(second,action==='loadFailure'?/Load failed/:/closed during startup/)
   ]);
   if(action==='loadFailure')c.fail();
   else{
    if(action==='close')c.runtime.close('Alice','com.airos.demo.timer');
    else c.runtime.closeAll();
    c.release();
   }
   await failures;
   const retry=c.runtime.open('Alice','com.airos.demo.timer');
   assert.equal(c.created(),2,'retry must create a fresh window');
   c.release();
   assert.deepEqual(await retry,{ok:true,alreadyOpen:false});
  }finally{c.close()}
 });
}

test('host removal terminates a vetoing app without closing another profile',async()=>{
 const c=setup({vetoClose:true});
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  await c.runtime.open('Bob','com.airos.demo.timer');
  c.runtime.close('Alice','com.airos.demo.timer');
  assert.equal(c.instances[0].isDestroyed(),true);
  assert.equal(c.instances[1].isDestroyed(),false);
  c.runtime.close('Alice','com.airos.demo.timer'); // idempotent
  assert.deepEqual(await c.runtime.open('Alice','com.airos.demo.timer'),{ok:true,alreadyOpen:false});
  assert.equal(c.created(),3);
 }finally{c.runtime.closeAll();c.close()}
});

test('logout terminates every vetoing app and allows a fresh launch',async()=>{
 const c=setup({vetoClose:true});
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  await c.runtime.open('Bob','com.airos.demo.timer');
  c.runtime.closeAll();
  assert.ok(c.instances.every(win=>win.isDestroyed()));
  c.runtime.closeAll(); // idempotent
  assert.deepEqual(await c.runtime.open('Bob','com.airos.demo.timer'),{ok:true,alreadyOpen:false});
  assert.equal(c.created(),3);
 }finally{c.runtime.closeAll();c.close()}
});

test('failed startup destroys a vetoing window before retry',async()=>{
 const c=setup({delayLoad:true,vetoClose:true});
 try{
  const launch=c.runtime.open('Alice','com.airos.demo.timer');
  const failed=assert.rejects(launch,/Load failed/);
  c.fail();await failed;
  assert.equal(c.instances[0].isDestroyed(),true);
  const retry=c.runtime.open('Alice','com.airos.demo.timer');
  assert.equal(c.created(),2);
  c.release();await retry;
 }finally{c.runtime.closeAll();c.close()}
});

const appRequest={url:'airapp://com.airos.demo.timer/index.html',method:'GET'};
for(const action of ['close','closeAll']){
 test(`${action} revokes persistent protocol access until a fresh launch`,async()=>{
  const c=setup();
  try{
   await c.runtime.open('Alice','com.airos.demo.timer');
   const route=c.route();
   assert.equal((await route(appRequest)).status,200);
   if(action==='close')c.runtime.close('Alice','com.airos.demo.timer');
   else c.runtime.closeAll();
   assert.equal((await route(appRequest)).status,403);
   await c.runtime.open('Alice','com.airos.demo.timer');
   assert.equal((await route(appRequest)).status,200);
  }finally{c.runtime.closeAll();c.close()}
 });
}

test('another profile cannot reactivate the closed profile protocol',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  const aliceRoute=c.route();
  c.runtime.closeAll();
  await c.runtime.open('Bob','com.airos.demo.timer');
  const bobRoute=c.route();
  assert.notEqual(c.instances[0].options.webPreferences.session,c.instances[1].options.webPreferences.session);
  assert.equal((await aliceRoute(appRequest)).status,403);
  assert.equal((await bobRoute(appRequest)).status,200);
 }finally{c.runtime.closeAll();c.close()}
});

test('closing and reopening cannot authorize an in-flight old-window response',async()=>{
 const c=setup();
 try{
  await c.runtime.open('Alice','com.airos.demo.timer');
  const route=c.route();
  // The handler yields at its first async file read before it can return bytes.
  const pending=route(appRequest);
  c.runtime.closeAll();
  await c.runtime.open('Alice','com.airos.demo.timer');
  assert.equal((await pending).status,403);
  assert.equal((await route(appRequest)).status,200);
 }finally{c.runtime.closeAll();c.close()}
});
