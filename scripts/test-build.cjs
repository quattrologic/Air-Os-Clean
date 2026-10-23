'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const REQUIRED=['main.cjs','preload.cjs','index.html','app.js','air-modern-dock.css','air-island.js','air-island.css','air-notes.js','air-launchpad.js','air-spotlight.js','air-app-store.js','air-app-bootstrap.js','src/core/app-registry.js','src/core/app-lifecycle.js','src/main/airapp-runtime.cjs','src/main/airapp-manager.cjs','src/main/airapp-package.cjs','src/main/preferences.cjs','src/main/notes-store.cjs','src/main/reminders-store.cjs','src/main/file-ops.cjs','src/main/spotify-launcher.cjs','src/main/chatgpt-installation.cjs','store/catalog/demo-timer.airapp','store/keys/demo-publisher-public.txt'];
function prepare(root,commit,run){
 if(!/^[a-f0-9]{40}$/.test(commit)||!/^\d{1,12}$/.test(run))throw Error('Invalid build identity.');
 const file=path.join(root,'package.json'),pkg=JSON.parse(fs.readFileSync(file,'utf8'));
 const version=pkg.version.split('-')[0]+'-dev.'+run+'.sha'+commit.slice(0,12);
 pkg.version=version;
 pkg.airOSDevelopmentBuild={commit,version,testOnly:true,unsigned:true,notarized:false,
  limitations:['Legacy Electron 32 / known dependency advisories','No native hardware acceptance','ChatGPT candidate probe only','Offline Store uses public demo verification key; no private signing key','Cloud sync unavailable']};
 fs.writeFileSync(file,JSON.stringify(pkg,null,2)+'\n');
 return pkg.airOSDevelopmentBuild;
}
function verifyPackage(archive,expected,asar){
 const entries=asar.listPackage(archive).map(name=>name.replace(/^[\\/]+/,'').replace(/\\/g,'/'));
 for(const file of ['package.json',...REQUIRED])if(!entries.includes(file))throw Error('Missing packaged file: '+file);
 const pkg=JSON.parse(asar.extractFile(archive,'package.json').toString());
 if(pkg.airOSDevelopmentBuild?.commit!==expected.commit||pkg.version!==expected.version||pkg.airOSDevelopmentBuild?.testOnly!==true)throw Error('Packaged build identity mismatch.');
 for(const file of entries){
  if(/(^|\/)(\.env($|\.)|accounts\.json$|profiles\/|id_(rsa|ed25519)$)|\.(p12|pfx|pem|key)$|(^|\/)tests\//i.test(file))throw Error('Forbidden packaged path: '+file);
  if(/\.(js|cjs|json|txt)$/.test(file)){
   const bytes=asar.extractFile(archive,file);
   if(/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(bytes.toString()))throw Error('Private key in package: '+file);
  }
 }
 // The offline Store requires this PUBLIC verification key at host startup.
 crypto.createPublicKey(asar.extractFile(archive,'store/keys/demo-publisher-public.txt'));
}
function verifyArchitecture(file,expected){
 const bytes=fs.readFileSync(file);
 if(expected==='universal'){
  if(bytes.length<8||bytes.readUInt32BE(0)!==0xcafebabe)throw Error('Expected universal Mach-O binary.');
  const count=bytes.readUInt32BE(4),types=[];
  if(count>16||bytes.length<8+count*20)throw Error('Invalid universal Mach-O header.');
  for(let i=0;i<count;i++)types.push(bytes.readUInt32BE(8+i*20));
  if(!types.includes(0x01000007)||!types.includes(0x0100000c))throw Error('Missing Intel/Apple Silicon slice.');
 }else{
  if(bytes.length<64||bytes.subarray(0,2).toString()!=='MZ')throw Error('Expected Windows executable.');
  const offset=bytes.readUInt32LE(60);
  if(offset>bytes.length-6||bytes.readUInt32LE(offset)!==0x4550||bytes.readUInt16LE(offset+4)!==(expected==='x64'?0x8664:0xaa64))throw Error('Windows executable architecture mismatch.');
 }
}
function collect(root,platform,asar){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),build=pkg.airOSDevelopmentBuild;
 if(!build?.testOnly||!pkg.version.includes('-dev.')||!build.commit)throw Error('Not a prepared development build.');
 const dist=path.join(root,'dist');
 const layouts=platform==='windows'?['win-unpacked/resources/app.asar','win-arm64-unpacked/resources/app.asar']
  :platform==='macos'?['mac-universal/Air-OS.app/Contents/Resources/app.asar']:null;
 if(!layouts)throw Error('Unsupported build platform.');
 for(const file of layouts)verifyPackage(path.join(dist,file),build,asar);
 if(platform==='windows'){
  verifyArchitecture(path.join(dist,'win-unpacked/Air-OS.exe'),'x64');
  verifyArchitecture(path.join(dist,'win-arm64-unpacked/Air-OS.exe'),'arm64');
 }else verifyArchitecture(path.join(dist,'mac-universal/Air-OS.app/Contents/MacOS/Air-OS'),'universal');
 const groups=platform==='windows'?{'windows-x64':/-Windows-x64\.exe$/,'windows-arm64':/-Windows-arm64\.exe$/}
  :{'macos-universal-dmg':/-universal\.dmg$/,'macos-universal-zip':/-universal\.zip$/};
 const output=path.join(dist,'test-artifacts');
 // Fail on stale output rather than uploading files from an earlier collection.
 fs.mkdirSync(output);
 for(const [name,pattern] of Object.entries(groups)){
  const files=fs.readdirSync(dist).filter(file=>pattern.test(file));
  if(files.length!==1)throw Error('Expected exactly one installer for '+name);
  const file=files[0];
  if(!file.includes(pkg.version))throw Error('Installer version mismatch: '+file);
  const source=path.join(dist,file),stat=fs.lstatSync(source);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size<65536)throw Error('Invalid installer file: '+file);
  const data=fs.readFileSync(source),extension=path.extname(file);
  const valid=extension==='.exe'?data.subarray(0,2).toString()==='MZ':extension==='.zip'?data.subarray(0,4).equals(Buffer.from([80,75,3,4])):data.subarray(-512,-508).toString()==='koly';
  if(!valid)throw Error('Invalid installer signature: '+file);
  const sha256=crypto.createHash('sha256').update(data).digest('hex'),destination=path.join(output,name);
  fs.mkdirSync(destination);
  fs.copyFileSync(source,path.join(destination,file),fs.constants.COPYFILE_EXCL);
  fs.writeFileSync(path.join(destination,'SHA256SUMS.txt'),sha256+'  '+file+'\n');
  fs.writeFileSync(path.join(destination,'BUILD-INFO.json'),JSON.stringify({...build,platform,artifact:name,file,bytes:stat.size,sha256},null,2)+'\n');
 }
 return Object.keys(groups);
}
if(require.main===module){
 const root=path.join(__dirname,'..');
 if(process.argv[2]==='prepare'){
  const commit=require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  console.log(JSON.stringify(prepare(root,commit,process.env.GITHUB_RUN_NUMBER||'')));
 }else if(process.argv[2]==='collect')console.log(collect(root,process.argv[3],require('@electron/asar')));
 else throw Error('Usage: test-build.cjs prepare | collect windows|macos');
}
module.exports={prepare,verifyPackage,collect,REQUIRED};
