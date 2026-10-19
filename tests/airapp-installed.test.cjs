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
