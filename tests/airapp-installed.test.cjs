'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createManager}=require('../src/main/airapp-manager.cjs');
const appPath=path.join(__dirname,'..');
test('bundled demo signature and file hashes pass and install survives restart',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-test-'));
 try{
  const key=fs.readFileSync(path.join(appPath,'store','keys','demo-publisher-public.txt'),'utf8');
  const manager=createManager({root:()=>dir,appPath:()=>appPath,publicKeys:{demo:key}});
  const app=manager.catalog().find(a=>a.id==='com.airos.demo.timer');
  assert.equal(app.compatible,['darwin','win32'].includes(process.platform));
  if(!app.compatible)return;
  assert.equal(manager.install('Alice',app.id).alreadyInstalled,false);
  assert.equal(manager.install('alice',app.id).alreadyInstalled,true);
  assert.equal(manager.installed('Bob').length,0);
  assert.equal(manager.installed('alice').length,1);
  const installedPath=manager.installedFolder('alice',app.id);
  assert.ok(fs.readFileSync(path.join(installedPath,'index.html'),'utf8').includes('Air Timer'));
  fs.appendFileSync(path.join(installedPath,'timer.js'),'// tampered');
  assert.throws(()=>manager.installedFolder('alice',app.id),/integrity/);
  assert.equal(manager.remove('alice',app.id).ok,true);
  assert.equal(manager.installed('alice').length,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('catalog rejects corrupt signatures instead of installing',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-bad-'));
 try{
  const key='-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAYXVfgvF32KpBg7s4S0P2vMYQQTCpN7gWDgFxJueIXGk=\n-----END PUBLIC KEY-----\n';
  const manager=createManager({root:()=>dir,appPath:()=>appPath,publicKeys:{demo:key}});
  assert.throws(()=>manager.install('Alice','../../escape'),/trusted local catalog/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

test('removal rolls back when the installed index cannot be written',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-rollback-'));
 try{
  const key=fs.readFileSync(path.join(appPath,'store','keys','demo-publisher-public.txt'),'utf8');
  const manager=createManager({root:()=>dir,appPath:()=>appPath,publicKeys:{demo:key}});
  const app=manager.catalog().find(a=>a.id==='com.airos.demo.timer');
  if(!app.compatible)return;
  manager.install('Alice',app.id);
  const original=manager.installedFolder('Alice',app.id);
  const index=path.join(path.dirname(original),'installed-v1.json');
  // Force a legitimate filesystem write error: replace index parent permissions
  // using an injected rename failure so the test also works under root.
  const originalRename=fs.renameSync;
  fs.renameSync=(source,destination)=>{
   if(source.includes('installed-v1.json.')&&destination===index)throw new Error('Simulated storage failure');
   return originalRename(source,destination);
  };
  try{assert.throws(()=>manager.remove('Alice',app.id),/Simulated storage failure/)}
  finally{fs.renameSync=originalRename}
  assert.equal(manager.installed('Alice').length,1);
  assert.equal(manager.installedFolder('Alice',app.id),original);
  assert.equal(fs.readdirSync(path.dirname(original)).some(n=>n.startsWith('.uninstall-')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('removal rejects replaced symlink app folders',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-uninstall-link-'));
 try{
  const key=fs.readFileSync(path.join(appPath,'store','keys','demo-publisher-public.txt'),'utf8');
  const manager=createManager({root:()=>dir,appPath:()=>appPath,publicKeys:{demo:key}});
  const app=manager.catalog().find(a=>a.id==='com.airos.demo.timer');
  if(!app.compatible)return;
  manager.install('Alice',app.id);
  const folder=manager.installedFolder('Alice',app.id);
  fs.renameSync(folder,folder+'.saved');
  try{fs.symlinkSync(dir,folder,'dir')}
  catch(error){if(process.platform==='win32'&&error.code==='EPERM')return;throw error}
  assert.throws(()=>manager.remove('Alice',app.id),/Invalid installation directory/);
  assert.equal(manager.installed('Alice').length,1);
  assert.ok(fs.statSync(dir).isDirectory());
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});

function installedDemoFixture(prefix){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),prefix));
 const key=fs.readFileSync(path.join(appPath,'store','keys','demo-publisher-public.txt'),'utf8');
 const manager=()=>createManager({root:()=>dir,appPath:()=>appPath,publicKeys:{demo:key}});
 const app=manager().catalog().find(a=>a.id==='com.airos.demo.timer');
 return {dir,manager,id:app.id,compatible:app.compatible,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('journal recovers interrupted uninstall before index commit without losing assets',()=>{
 const f=installedDemoFixture('airapp-interrupted-');
 try{
  if(!f.compatible)return;
  const manager=f.manager();manager.install('Alice',f.id);
  const folder=manager.installedFolder('Alice',f.id),base=path.dirname(folder);
  const staged='.uninstall-'+'a'.repeat(24);
  fs.writeFileSync(path.join(base,'uninstall-transaction-v1.json'),JSON.stringify({version:1,id:f.id,staged}));
  fs.renameSync(folder,path.join(base,staged));
  const recovered=f.manager();
  assert.equal(recovered.installed('Alice').length,1);
  assert.equal(recovered.installedFolder('Alice',f.id),folder);
  assert.equal(fs.existsSync(path.join(base,staged)),false);
  assert.equal(fs.existsSync(path.join(base,'uninstall-transaction-v1.json')),false);
 }finally{f.cleanup()}
});
test('journal completes interrupted uninstall after index commit',()=>{
 const f=installedDemoFixture('airapp-interrupted-after-');
 try{
  if(!f.compatible)return;
  const manager=f.manager();manager.install('Alice',f.id);
  const folder=manager.installedFolder('Alice',f.id),base=path.dirname(folder);
  const staged='.uninstall-'+'b'.repeat(24);
  fs.writeFileSync(path.join(base,'uninstall-transaction-v1.json'),JSON.stringify({version:1,id:f.id,staged}));
  fs.renameSync(folder,path.join(base,staged));
  fs.writeFileSync(path.join(base,'installed-v1.json'),JSON.stringify({schemaVersion:1,apps:[]}));
  assert.deepEqual(f.manager().installed('Alice'),[]);
  assert.equal(fs.existsSync(path.join(base,staged)),false);
  assert.equal(fs.existsSync(path.join(base,'uninstall-transaction-v1.json')),false);
 }finally{f.cleanup()}
});
test('invalid recovery journal fails closed without changing installed files',()=>{
 const f=installedDemoFixture('airapp-corrupt-journal-');
 try{
  if(!f.compatible)return;
  const manager=f.manager();manager.install('Alice',f.id);
  const folder=manager.installedFolder('Alice',f.id),base=path.dirname(folder);
  fs.writeFileSync(path.join(base,'uninstall-transaction-v1.json'),JSON.stringify({version:1,id:f.id,staged:'../../outside'}));
  assert.throws(()=>f.manager().installed('Alice'),/Invalid removal journal/);
  assert.ok(fs.statSync(folder).isDirectory());
 }finally{f.cleanup()}
});
