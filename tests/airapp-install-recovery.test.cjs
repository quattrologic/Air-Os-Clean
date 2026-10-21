'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createManager}=require('../src/main/airapp-manager.cjs');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-install-recovery-'));
 const app=path.join(root,'host'),data=path.join(root,'data');
 const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'../store/catalog/demo-timer.airapp'),'utf8'));
 // Independent test key and valid signed package for the actual test platform.
 const keys=crypto.generateKeyPairSync('ed25519');
 pkg.manifest.platforms=[process.platform];
 pkg.signature=crypto.sign(null,Buffer.from(JSON.stringify(pkg.manifest)),keys.privateKey).toString('base64');
 fs.mkdirSync(path.join(app,'store/catalog'),{recursive:true});
 fs.writeFileSync(path.join(app,'store/catalog/demo-timer.airapp'),JSON.stringify(pkg));
 const manager=()=>createManager({root:()=>data,appPath:()=>app,publicKeys:{demo:keys.publicKey}});
 const id=pkg.manifest.id;
 manager().install('Alice',id);
 const folder=manager().installedFolder('Alice',id),index=path.join(path.dirname(folder),'installed-v1.json');
 // Exact durable state after package rename but before first index commit.
 fs.unlinkSync(index);
 return {manager,id,folder,index,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('retry adopts a verified orphan installation without replacing its files',()=>{
 const f=fixture();try{
  fs.writeFileSync(path.join(f.folder,'user-data.txt'),'preserve me');
  assert.deepEqual(f.manager().installed('Alice'),[]);
  assert.equal(f.manager().install('Alice',f.id).alreadyInstalled,false);
  assert.equal(f.manager().installedFolder('Alice',f.id),f.folder);
  assert.equal(fs.readFileSync(path.join(f.folder,'user-data.txt'),'utf8'),'preserve me');
  assert.equal(f.manager().install('Alice',f.id).alreadyInstalled,true);
  assert.deepEqual(f.manager().installed('Bob'),[]);
 }finally{f.cleanup()}
});
for(const damage of ['tamper','missing']){
 test(`retry rejects ${damage} orphan assets without registering or deleting them`,()=>{
  const f=fixture();try{
   const asset=path.join(f.folder,'timer.js');
   if(damage==='tamper')fs.appendFileSync(asset,'// changed');else fs.unlinkSync(asset);
   const before=fs.readFileSync(path.join(f.folder,'index.html'));
   assert.throws(()=>f.manager().install('Alice',f.id));
   assert.deepEqual(f.manager().installed('Alice'),[]);
   assert.deepEqual(fs.readFileSync(path.join(f.folder,'index.html')),before);
   assert.equal(fs.existsSync(asset),damage==='tamper');
  }finally{f.cleanup()}
 });
}
test('failed recovery index write preserves orphan files for another retry',t=>{
 const f=fixture();try{
  const rename=fs.renameSync;
  t.mock.method(fs,'renameSync',(source,dest)=>{
   if(dest===f.index)throw new Error('Simulated index failure');
   return rename(source,dest);
  });
  assert.throws(()=>f.manager().install('Alice',f.id),/Simulated index failure/);
  assert.ok(fs.existsSync(path.join(f.folder,'timer.js')));
  assert.deepEqual(f.manager().installed('Alice'),[]);
  t.mock.restoreAll();
  f.manager().install('Alice',f.id);
  assert.equal(f.manager().installedFolder('Alice',f.id),f.folder);
 }finally{t.mock.restoreAll();f.cleanup()}
});
test('retry rejects a symlinked orphan folder without touching its target',t=>{
 const f=fixture();try{
  const saved=f.folder+'.saved';fs.renameSync(f.folder,saved);
  try{fs.symlinkSync(saved,f.folder,process.platform==='win32'?'junction':'dir')}
  catch(error){if(error.code==='EPERM'){t.skip('Symlinks unavailable');return}throw error}
  assert.throws(()=>f.manager().install('Alice',f.id),/Invalid installation directory/);
  assert.deepEqual(f.manager().installed('Alice'),[]);
  assert.ok(fs.existsSync(path.join(saved,'timer.js')));
  assert.ok(fs.lstatSync(f.folder).isSymbolicLink());
 }finally{f.cleanup()}
});
