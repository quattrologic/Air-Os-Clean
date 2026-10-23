'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8');
function fixture(overrides={}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-finder-save-'));
 const handlers=new Map(),temp=path.join(root,'.airos-save-0000000000000000.tmp'),target=path.join(root,'document.txt');
 const context={fs:{...fs,...overrides},path,Buffer,activeUser:{username:'alice'},fileWorkspaceRoot:root,
  requireTrusted(event){if(!event.trusted)throw Error('Untrusted');},
  AIR_OS_TEXT_EXTENSIONS:new Set(['.txt']),AIR_OS_TEXT_LIMIT:2*1024*1024,
  crypto:{randomBytes:()=>Buffer.alloc(8)},ipcMain:{handle:(name,fn)=>handlers.set(name,fn)}};
 const helpers=source.slice(source.indexOf('function requireFileAccess('),source.indexOf("ipcMain.handle('air-os:files:select-folder'"));
 const handler=source.slice(source.indexOf("ipcMain.handle('air-os:files:write-text'"),source.indexOf("ipcMain.handle('air-os:files:create-folder'"));
 vm.runInNewContext(helpers+handler,context);
 return {root,temp,target,context,save:(name='document.txt',text='new contents',event={trusted:true})=>handlers.get('air-os:files:write-text')(event,name,text),
  close(){fs.rmSync(root,{recursive:true,force:true});}};
}
test('Finder text save creates new files and replaces an explicitly selected regular document',()=>{
 const h=fixture();
 try{
  assert.equal(h.save().ok,true);assert.equal(fs.readFileSync(h.target,'utf8'),'new contents');assert.equal(fs.existsSync(h.temp),false);
  assert.equal(h.save('document.txt','updated').path,'document.txt');assert.equal(fs.readFileSync(h.target,'utf8'),'updated');
  assert.deepEqual(fs.readdirSync(h.root),['document.txt']);
 }finally{h.close();}
});
test('temporary-name collision preserves unrelated file bytes and existing or absent destination',()=>{
 for(const existing of [false,true]){
  const h=fixture();
  try{
   if(existing)fs.writeFileSync(h.target,'ORIGINAL DOCUMENT');
   fs.writeFileSync(h.temp,'UNRELATED USER FILE');
   assert.throws(()=>h.save(),{code:'EEXIST'});
   assert.equal(fs.readFileSync(h.temp,'utf8'),'UNRELATED USER FILE');
   assert.equal(fs.existsSync(h.target),existing);
   if(existing)assert.equal(fs.readFileSync(h.target,'utf8'),'ORIGINAL DOCUMENT');
  }finally{h.close();}
 }
});
test('temporary symlink collisions preserve the link and never modify its target',t=>{
 const h=fixture(),outside=fs.mkdtempSync(path.join(os.tmpdir(),'air-finder-save-outside-'));
 try{
  const other=path.join(outside,'private.txt');fs.writeFileSync(other,'OUTSIDE DATA');
  try{fs.symlinkSync(other,h.temp);}catch(error){if(process.platform==='win32'&&error.code==='EPERM'){t.skip('Symlink creation requires platform permission');return;}throw error;}
  assert.throws(()=>h.save(),{code:'EEXIST'});
  assert(fs.lstatSync(h.temp).isSymbolicLink());assert.equal(fs.readlinkSync(h.temp),other);
  assert.equal(fs.readFileSync(other,'utf8'),'OUTSIDE DATA');assert.equal(fs.existsSync(h.target),false);
 }finally{h.close();fs.rmSync(outside,{recursive:true,force:true});}
});
test('partial temporary write failure preserves document and cleans only this attempt with no leaked descriptor',()=>{
 let descriptor=null;
 const h=fixture({writeFileSync(file,_content,options){
  if(typeof file==='number')descriptor=file;
  fs.writeFileSync(file,'PARTIAL',options);
  throw Object.assign(new Error('Simulated disk full'),{code:'ENOSPC'});
 }});
 try{
  fs.writeFileSync(h.target,'ORIGINAL DOCUMENT');
  assert.throws(()=>h.save(),{code:'ENOSPC'});
  assert.equal(fs.readFileSync(h.target,'utf8'),'ORIGINAL DOCUMENT');assert.equal(fs.existsSync(h.temp),false);
  if(descriptor!==null)assert.throws(()=>fs.fstatSync(descriptor),{code:'EBADF'});
 }finally{h.close();}
});
test('failed replacement preserves the document and removes only its own temporary output',()=>{
 const h=fixture({renameSync(){throw Object.assign(new Error('Simulated replacement failure'),{code:'EACCES'});}});
 try{
  fs.writeFileSync(h.target,'ORIGINAL DOCUMENT');
  assert.throws(()=>h.save(),{code:'EACCES'});
  assert.equal(fs.readFileSync(h.target,'utf8'),'ORIGINAL DOCUMENT');assert.equal(fs.existsSync(h.temp),false);
 }finally{h.close();}
});
test('write handler rejects missing authorization/workspace, traversal, unsupported types and existing directories',()=>{
 const h=fixture();
 try{
  fs.writeFileSync(h.target,'KEEP');fs.mkdirSync(path.join(h.root,'directory.txt'));
  assert.throws(()=>h.save('document.txt','new',{trusted:false}),/Untrusted/);
  h.context.activeUser=null;assert.throws(()=>h.save(),/melde dich/);h.context.activeUser={username:'alice'};
  h.context.fileWorkspaceRoot=null;assert.throws(()=>h.save(),/Ordner/);h.context.fileWorkspaceRoot=h.root;
  for(const name of ['../outside.txt','/outside.txt','file.exe','directory.txt'])assert.throws(()=>h.save(name));
  assert.equal(fs.readFileSync(h.target,'utf8'),'KEEP');assert.equal(fs.existsSync(h.temp),false);
 }finally{h.close();}
});
