'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {prepare,verifyPackage,collect,REQUIRED}=require('../scripts/test-build.cjs');
// Uses the ASAR tool already supplied by electron-builder, no new dependency.
const asar=require('@electron/asar');
const commit='a'.repeat(40);
async function fixture(platform='windows',change=()=>{}){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-test-build-'));
 try{
  fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({version:'1.0.3'}));
  const info=prepare(root,commit,'123');
  const contents=path.join(root,'contents');fs.mkdirSync(contents);
  for(const file of REQUIRED){fs.mkdirSync(path.dirname(path.join(contents,file)),{recursive:true});fs.writeFileSync(path.join(contents,file),'synthetic test fixture');}
  fs.copyFileSync(path.join(root,'package.json'),path.join(contents,'package.json'));
  const {publicKey}=crypto.generateKeyPairSync('ed25519');
  fs.writeFileSync(path.join(contents,'store/keys/demo-publisher-public.txt'),publicKey.export({type:'spki',format:'pem'}));
  change(contents);
  const layouts=platform==='windows'?['win-unpacked/resources/app.asar','win-arm64-unpacked/resources/app.asar']:['mac-universal/Air-OS.app/Contents/Resources/app.asar'];
  for(const relative of layouts){const archive=path.join(root,'dist',relative);fs.mkdirSync(path.dirname(archive),{recursive:true});await asar.createPackage(contents,archive);}
  if(platform==='windows'){
   for(const [folder,machine] of [['win-unpacked',0x8664],['win-arm64-unpacked',0xaa64]]){
    const bytes=Buffer.alloc(128);bytes.write('MZ');bytes.writeUInt32LE(64,60);bytes.writeUInt32LE(0x4550,64);bytes.writeUInt16LE(machine,68);
    fs.writeFileSync(path.join(root,'dist',folder,'Air-OS.exe'),bytes);
   }
  }else{
   const bytes=Buffer.alloc(48);bytes.writeUInt32BE(0xcafebabe,0);bytes.writeUInt32BE(2,4);bytes.writeUInt32BE(0x01000007,8);bytes.writeUInt32BE(0x0100000c,28);
   const file=path.join(root,'dist/mac-universal/Air-OS.app/Contents/MacOS/Air-OS');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
  }
  // These are deliberately synthetic format fixtures, NOT usable installers;
  // they live only in OS temp and are always removed, never uploaded by CI.
  const suffixes=platform==='windows'?['Windows-x64.exe','Windows-arm64.exe']:['mac-universal.dmg','mac-universal.zip'];
  for(const suffix of suffixes){const data=Buffer.alloc(65536);if(suffix.endsWith('.exe'))data.write('MZ');else if(suffix.endsWith('.zip'))Buffer.from([80,75,3,4]).copy(data);else data.write('koly',data.length-512);fs.writeFileSync(path.join(root,'dist','Air-OS-'+info.version+'-'+suffix),data);}
  return {root,info,archive:path.join(root,'dist',layouts[0]),close:()=>fs.rmSync(root,{recursive:true,force:true})};
 }catch(error){fs.rmSync(root,{recursive:true,force:true});throw error}
}
for(const platform of ['windows','macos'])test(`${platform}: bundles identifiable artifacts with verifiable checksums and packaged features`,async()=>{
 const h=await fixture(platform);try{
  const groups=collect(h.root,platform,asar);assert.equal(groups.length,2);
  for(const group of groups){
   const directory=path.join(h.root,'dist/test-artifacts',group),info=JSON.parse(fs.readFileSync(path.join(directory,'BUILD-INFO.json')));
   assert.equal(info.commit,commit);assert.equal(info.version,'1.0.3-dev.123.shaaaaaaaaaaaaa');
   assert.equal(info.bytes,65536);assert.equal(info.unsigned,true);assert.equal(info.notarized,false);
   assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,info.file))).digest('hex'),info.sha256);
   assert.equal(fs.readFileSync(path.join(directory,'SHA256SUMS.txt'),'utf8'),info.sha256+'  '+info.file+'\n');
  }
  assert.throws(()=>collect(h.root,platform,asar),{code:'EEXIST'});
 }finally{h.close()}
});
for(const damage of ['missing-island','private-key','profile-data','wrong-commit'])test(`package validation rejects ${damage}`,async()=>{
 const h=await fixture('windows',contents=>{
  if(damage==='missing-island')fs.unlinkSync(path.join(contents,'air-island.js'));
  if(damage==='private-key')fs.writeFileSync(path.join(contents,'secret.txt'),'-----BEGIN PRIVATE KEY-----');
  if(damage==='profile-data')fs.writeFileSync(path.join(contents,'accounts.json'),'[]');
  if(damage==='wrong-commit'){const file=path.join(contents,'package.json'),pkg=JSON.parse(fs.readFileSync(file));pkg.airOSDevelopmentBuild.commit='b'.repeat(40);fs.writeFileSync(file,JSON.stringify(pkg));}
 });try{assert.throws(()=>verifyPackage(h.archive,h.info,asar));}finally{h.close()}
});
test('collection rejects absent installer and wrong executable architecture',async()=>{
 for(const damage of ['missing','architecture']){
  const h=await fixture();try{
   if(damage==='missing'){const file=fs.readdirSync(path.join(h.root,'dist')).find(name=>name.endsWith('-Windows-arm64.exe'));fs.unlinkSync(path.join(h.root,'dist',file));}
   else fs.copyFileSync(path.join(h.root,'dist/win-unpacked/Air-OS.exe'),path.join(h.root,'dist/win-arm64-unpacked/Air-OS.exe'));
   assert.throws(()=>collect(h.root,'windows',asar),damage==='missing'?/exactly one/:/architecture mismatch/);
  }finally{h.close()}
 }
});
