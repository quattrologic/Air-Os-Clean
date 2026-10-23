'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/main/preferences.cjs'),'utf8');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-prefs-write-'));
 const filesystem={...fs},module={exports:{}};
 // Production store, real temporary filesystem. Only random names and explicit
 // I/O failures are controlled; no Electron/native-platform claim.
 vm.runInNewContext(source,{module,require:name=>name==='node:fs'?filesystem:name==='node:crypto'?{...crypto,randomBytes:()=>Buffer.alloc(8)}:require(name)});
 const create=()=>module.exports.createStore({root:()=>root});
 const store=create();
 store.update('Alice',{dockTheme:'modern',clock24:false});
 store.update('Bob',{accent:'#abcdef'});
 const fileFor=user=>path.join(root,'profiles',crypto.createHash('sha256').update(user.toLowerCase()).digest('hex'),'appearance-v1.json');
 const file=fileFor('Alice'),bob=fileFor('Bob'),temp=file+'.0000000000000000.tmp';
 return {root,filesystem,create,store,file,bob,temp,close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
const actions={update:store=>store.update('Alice',{dockTheme:'classic'}),reset:store=>store.reset('Alice')};
test('preferences update/reset persist using private temporary output and preserve the other profile',()=>{
 const h=fixture();try{
  const bob=fs.readFileSync(h.bob);
  h.store.update('Alice',{clock24:true});
  assert.equal(h.create().load('Alice').clock24,true);
  assert.equal(h.create().load('Alice').dockTheme,'modern');
  h.store.reset('Alice');assert.equal(h.create().load('Alice').dockTheme,'classic');
  assert.deepEqual(fs.readFileSync(h.bob),bob);
  assert.equal(fs.existsSync(h.temp),false);
  if(process.platform!=='win32')assert.equal(fs.statSync(h.file).mode&0o777,0o600);
 }finally{h.close()}
});
test('update/reset reject temporary file collisions without changing foreign bytes or existing/missing settings',()=>{
 for(const action of Object.values(actions))for(const existing of [true,false]){
  const h=fixture();try{
   const before=fs.readFileSync(h.file),bob=fs.readFileSync(h.bob);
   if(!existing)fs.unlinkSync(h.file);
   fs.writeFileSync(h.temp,'UNRELATED FILE');
   assert.throws(()=>action(h.store),{code:'EEXIST'});
   assert.equal(fs.readFileSync(h.temp,'utf8'),'UNRELATED FILE');
   assert.equal(fs.existsSync(h.file),existing);
   if(existing)assert.deepEqual(fs.readFileSync(h.file),before);
   assert.deepEqual(fs.readFileSync(h.bob),bob);
  }finally{h.close()}
 }
});
test('temporary symlink to another profile is neither followed nor removed by update/reset',t=>{
 for(const action of Object.values(actions)){
  const h=fixture();try{
   const before=fs.readFileSync(h.file),bob=fs.readFileSync(h.bob);
   try{fs.symlinkSync(h.bob,h.temp)}catch(error){if(process.platform==='win32'&&error.code==='EPERM'){t.skip('Symlink permission unavailable');return}throw error}
   assert.throws(()=>action(h.store),{code:'EEXIST'});
   assert.equal(fs.lstatSync(h.temp).isSymbolicLink(),true);
   assert.equal(fs.readlinkSync(h.temp),h.bob);
   assert.deepEqual(fs.readFileSync(h.file),before);
   assert.deepEqual(fs.readFileSync(h.bob),bob);
  }finally{h.close()}
 }
});
test('dangling temporary symlink cannot create its target and remains untouched',t=>{
 const h=fixture();try{
  const missing=path.join(h.root,'must-not-create.json'),before=fs.readFileSync(h.file);
  try{fs.symlinkSync(missing,h.temp)}catch(error){if(process.platform==='win32'&&error.code==='EPERM'){t.skip('Symlink permission unavailable');return}throw error}
  assert.throws(()=>h.store.update('Alice',{clock24:true}),{code:'EEXIST'});
  assert.equal(fs.existsSync(missing),false);assert.equal(fs.readlinkSync(h.temp),missing);
  assert.deepEqual(fs.readFileSync(h.file),before);
 }finally{h.close()}
});
test('Windows-style dangling-link open is rejected before it can create a target',t=>{
 for(const action of Object.values(actions)){
  const h=fixture();try{
   const missing=path.join(h.root,'must-not-create.json'),before=fs.readFileSync(h.file);
   try{fs.symlinkSync(missing,h.temp)}catch(error){if(process.platform==='win32'&&error.code==='EPERM'){t.skip('Symlink permission unavailable');return}throw error}
   let opens=0;
   // Explicit filesystem double for the observed Windows behavior. Linux's
   // native wx would reject this link, concealing a missing preflight check.
   h.filesystem.openSync=(file,flags,mode)=>{
    opens++;
    if(file===h.temp&&fs.lstatSync(file).isSymbolicLink()&&!fs.existsSync(file))return fs.openSync(file,'w',mode);
    return fs.openSync(file,flags,mode);
   };
   assert.throws(()=>action(h.store),{code:'EEXIST'});
   assert.equal(opens,0);assert.equal(fs.existsSync(missing),false);
   assert.equal(fs.readlinkSync(h.temp),missing);assert.deepEqual(fs.readFileSync(h.file),before);
  }finally{h.close()}
 }
});
test('temporary path inspection errors fail closed without replacing saved settings',()=>{
 const h=fixture();try{
  const before=fs.readFileSync(h.file);
  h.filesystem.lstatSync=file=>{if(file===h.temp)throw Object.assign(new Error('Inspection denied'),{code:'EACCES'});return fs.lstatSync(file)};
  assert.throws(()=>h.store.update('Alice',{clock24:true}),{code:'EACCES'});
  assert.deepEqual(fs.readFileSync(h.file),before);assert.equal(fs.existsSync(h.temp),false);
 }finally{h.close()}
});
test('partial write closes its descriptor, preserves saved preferences and permits retry',()=>{
 const h=fixture();let descriptor;
 try{
  const before=fs.readFileSync(h.file),bob=fs.readFileSync(h.bob);
  h.filesystem.writeFileSync=(target,_data,options)=>{
   if(typeof target==='number')descriptor=target;
   fs.writeFileSync(target,'PARTIAL',options);
   throw Object.assign(new Error('Disk full'),{code:'ENOSPC'});
  };
  assert.throws(()=>h.store.update('Alice',{clock24:true}),{code:'ENOSPC'});
  assert.deepEqual(fs.readFileSync(h.file),before);assert.deepEqual(fs.readFileSync(h.bob),bob);
  assert.equal(fs.existsSync(h.temp),false);
  assert.equal(typeof descriptor,'number');assert.throws(()=>fs.fstatSync(descriptor),{code:'EBADF'});
  h.filesystem.writeFileSync=fs.writeFileSync;
  h.store.update('Alice',{clock24:true});assert.equal(h.create().load('Alice').clock24,true);
 }finally{h.close()}
});
test('failed rename preserves both profiles, removes own temporary output and permits retry',()=>{
 for(const action of Object.values(actions)){
  const h=fixture();try{
   const before=fs.readFileSync(h.file),bob=fs.readFileSync(h.bob);
   h.filesystem.renameSync=()=>{throw Object.assign(new Error('Replacement denied'),{code:'EACCES'})};
   assert.throws(()=>action(h.store),{code:'EACCES'});
   assert.deepEqual(fs.readFileSync(h.file),before);assert.deepEqual(fs.readFileSync(h.bob),bob);
   assert.equal(fs.existsSync(h.temp),false);
   h.filesystem.renameSync=fs.renameSync;
   action(h.store);assert.equal(h.create().load('Alice').dockTheme,'classic');
  }finally{h.close()}
 }
});
