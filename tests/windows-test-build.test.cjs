'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const asar=require('@electron/asar'),api=require('../scripts/windows-test-build.cjs'),{REQUIRED}=require('../scripts/test-build.cjs');
async function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-r1-fixture-')),content=path.join(root,'packed'),version='44.9.3';
 const write=(f,b)=>{fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true});fs.writeFileSync(path.join(root,f),b)};
 const assets=[...REQUIRED,'login.html','login.css','maclock-morph.js','maclock-shaders.js','third_party/maclock/fonts/OpenRunde-Regular.otf','third_party/maclock/LICENSE','third_party/maclock/OpenRunde-LICENSE.txt'];
 for(const file of assets)write(file,'synthetic fixture '+file);
 write('index.html','<script src="app.js"></script><script src="node_modules/amplitudejs/dist/amplitude.min.js"></script>');write('login.html','<link href="login.css"><script src="maclock-morph.js"></script>');
 write('build/windows-x64/package.json',JSON.stringify({dependencies:{amplitudejs:'5.3.2'},devDependencies:{electron:version,'electron-builder':'26.18.0'}}));write('node_modules/electron/package.json',JSON.stringify({version}));write('node_modules/amplitudejs/package.json',JSON.stringify({version:'5.3.2'}));write('node_modules/amplitudejs/LICENSE','synthetic dependency license');write('node_modules/amplitudejs/dist/amplitude.min.js','synthetic dependency');
 const {publicKey}=crypto.generateKeyPairSync('ed25519');write('store/keys/demo-publisher-public.txt',publicKey.export({type:'spki',format:'pem'}));
 write('package.json',JSON.stringify({version:'1.0.3',devDependencies:{electron:'32.3.3'},build:{files:assets.filter(x=>!x.startsWith('third_party/')).concat('third_party/maclock/**/*'),mac:{minimumSystemVersion:'10.15.0'}}}));
 const build=api.prepare(root,'a'.repeat(40),'123');
 async function pack(change=()=>{}){
  fs.mkdirSync(content,{recursive:true});for(const file of api.runtimeFiles(root)){fs.mkdirSync(path.dirname(path.join(content,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(content,file))}change(content);
  const packed=JSON.parse(fs.readFileSync(path.join(content,'package.json')));for(const key of ['scripts','devDependencies','build'])delete packed[key];fs.writeFileSync(path.join(content,'package.json'),JSON.stringify(packed));
  const archive=path.join(root,'dist/win-unpacked/resources/app.asar');fs.mkdirSync(path.dirname(archive),{recursive:true});await asar.createPackage(content,archive);return archive;
 }
 return{root,write,build,pack,close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('R1 preparation records modern runtime and leaves Catalina declaration intact; wrong runtime fails',async()=>{
 const f=await fixture();try{
  assert.equal(f.build.electron,'44.9.3');assert.equal(f.build.testOnly,true);assert.equal(f.build.unsigned,true);assert.equal(f.build.channel,'windows-x64-modern-test');assert.match(f.build.builtAt,/^\d{4}-\d\d-/);
  const pkg=JSON.parse(fs.readFileSync(path.join(f.root,'package.json')));assert.equal(pkg.devDependencies.electron,'32.3.3');assert.equal(pkg.build.mac.minimumSystemVersion,'10.15.0');
  f.write('node_modules/electron/package.json',JSON.stringify({version:'32.3.3'}));assert.throws(()=>api.prepare(f.root,'a'.repeat(40),'124'),/Wrong modern/);
 }finally{f.close()}
});
test('R1 verifies actual ASAR source hashes including login, fonts, shaders, licenses and local dependencies',async()=>{
 const f=await fixture();try{const a=await f.pack(),files=api.verifyRuntime(f.root,a,asar);for(const file of ['login.html','maclock-shaders.js','third_party/maclock/fonts/OpenRunde-Regular.otf','third_party/maclock/LICENSE','node_modules/amplitudejs/dist/amplitude.min.js'])assert.ok(files.some(x=>x.file===file&&x.sha256.length===64))}finally{f.close()}
});
for(const damage of ['missing-font','wrong-shader','missing-local-script','unexpected-dependency','wrong-music-version'])test('R1 fails closed on '+damage,async()=>{
 const f=await fixture();try{
  if(damage==='missing-local-script')f.write('login.html','<script src="forgotten-runtime.js"></script>');
  const a=await f.pack(c=>{if(damage==='missing-font')fs.unlinkSync(path.join(c,'third_party/maclock/fonts/OpenRunde-Regular.otf'));if(damage==='wrong-shader')fs.writeFileSync(path.join(c,'maclock-shaders.js'),'stale shader');if(damage==='unexpected-dependency'){fs.mkdirSync(path.join(c,'node_modules/unexpected'));fs.writeFileSync(path.join(c,'node_modules/unexpected/index.js'),'unreviewed')}if(damage==='wrong-music-version')fs.writeFileSync(path.join(c,'node_modules/amplitudejs/package.json'),JSON.stringify({version:'0.0.0'}))});
  assert.throws(()=>api.verifyRuntime(f.root,a,asar),damage==='wrong-shader'?/differs from source/:damage==='missing-local-script'?/Unbundled local HTML/:damage==='unexpected-dependency'?/Unexpected shipped runtime/:damage==='wrong-music-version'?/Unexpected shipped Amplitude/:/not found/);
 }finally{f.close()}
});
test('R1 single-x64 collection has installer SHA256, honest hardware status and refuses stale output',async()=>{
 const f=await fixture();try{
  await f.pack();const exe=Buffer.alloc(128);exe.write('MZ');exe.writeUInt32LE(64,60);exe.writeUInt32LE(0x4550,64);exe.writeUInt16LE(0x8664,68);f.write('dist/win-unpacked/Air-OS.exe',exe);
  for(const l of ['LICENSE.electron.txt','LICENSES.chromium.html'])f.write('dist/win-unpacked/'+l,'synthetic fixture license');
  // Synthetic format fixture, NOT a usable installer or upload artifact.
  const installer=Buffer.alloc(65536);installer.write('MZ');f.write('dist/Air-OS-'+f.build.version+'-Windows-x64.exe',installer);
  const info=api.collect(f.root,asar);assert.equal(info.bytes,65536);assert.equal(info.sha256,crypto.createHash('sha256').update(installer).digest('hex'));assert.match(info.evidence.nativeHardware,/BLOCKED/);assert.equal(info.evidence.release,'NOT APPROVED');assert.throws(()=>api.collect(f.root,asar),{code:'EEXIST'});
 }finally{f.close()}
});
test('R1 dependency junction never overwrites an existing installation',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-r1-link-'));try{fs.mkdirSync(path.join(root,'build/windows-x64/node_modules'),{recursive:true});fs.mkdirSync(path.join(root,'node_modules'));assert.throws(()=>api.linkDependencies(root),/Refusing to replace/);assert.ok(fs.statSync(path.join(root,'node_modules')).isDirectory())}finally{fs.rmSync(root,{recursive:true,force:true})}
});
