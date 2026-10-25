'use strict';
// R1: a separate, audited Windows test channel. Legacy/Catalina metadata stays intact.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {prepare:prepareLegacy,verifyPackage}=require('./test-build.cjs');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function toolchain(root){return JSON.parse(fs.readFileSync(path.join(root,'build/windows-x64/package.json'),'utf8'))}
function linkDependencies(root){
 const source=path.join(root,'build/windows-x64/node_modules'),target=path.join(root,'node_modules');
 if(!fs.statSync(source).isDirectory())throw Error('Install the locked test toolchain first.');
 // Never replace an existing developer installation or junction.
 if(fs.existsSync(target)||(()=>{try{fs.lstatSync(target);return true}catch(e){if(e.code!=='ENOENT')throw e;return false}})())throw Error('Refusing to replace existing node_modules.');
 fs.symlinkSync(source,target,process.platform==='win32'?'junction':'dir');
}
function prepare(root,commit,run){
 const tools=toolchain(root),installed=JSON.parse(fs.readFileSync(path.join(root,'node_modules/electron/package.json'),'utf8'));
 if(installed.version!==tools.devDependencies.electron||Number(installed.version.split('.')[0])<44)throw Error('Wrong modern Electron runtime.');
 const build=prepareLegacy(root,commit,run),file=path.join(root,'package.json'),pkg=JSON.parse(fs.readFileSync(file,'utf8'));
 Object.assign(build,{channel:'windows-x64-modern-test',electron:installed.version,builder:tools.devDependencies['electron-builder'],builtAt:new Date().toISOString(),
  limitations:['Unsigned technical test build; not a production release','Native physical Windows/macOS hardware acceptance remains open','Legacy/Catalina channel has separate unresolved dependency advisories','MacLock L1C and NewAmp AM2+ are not implemented','Cloud sync unavailable; Store uses public demo verification key']});
 pkg.airOSDevelopmentBuild=build;fs.writeFileSync(file,JSON.stringify(pkg,null,2)+'\n');return build;
}
function runtimeFiles(root){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),out=new Set(['package.json','node_modules/amplitudejs/package.json','node_modules/amplitudejs/LICENSE','node_modules/amplitudejs/dist/amplitude.min.js']);
 function visit(relative){
  // electron-builder intentionally excludes nested package README files; this
  // developer guide is not a runtime asset (unlike mandatory third-party notices).
  if(relative==='aircard/README.md')return;
  const file=path.join(root,relative),stat=fs.lstatSync(file);
  if(stat.isSymbolicLink())throw Error('Runtime asset may not be a symlink: '+relative);
  if(stat.isDirectory()){for(const name of fs.readdirSync(file))visit(relative+'/'+name)}
  else if(stat.isFile())out.add(relative);else throw Error('Unsupported runtime asset: '+relative);
 }
 for(const pattern of pkg.build.files){
  if(pattern.endsWith('/**/*'))visit(pattern.slice(0,-5));
  else if(!/[?*]/.test(pattern))visit(pattern);
  else throw Error('Unreviewed package pattern: '+pattern);
 }
 return [...out].sort();
}
function verifyRuntime(root,archive,asar){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),build=pkg.airOSDevelopmentBuild;
 if(build?.channel!=='windows-x64-modern-test'||build.electron!==toolchain(root).devDependencies.electron)throw Error('Wrong Windows test channel.');
 verifyPackage(archive,build,asar);
 for(const entry of asar.listPackage(archive).map(x=>x.replace(/^[\\/]+/,'').replace(/\\/g,'/'))){
  if(entry.startsWith('node_modules/')&&entry!=='node_modules/amplitudejs'&&!entry.startsWith('node_modules/amplitudejs/'))throw Error('Unexpected shipped runtime dependency: '+entry);
 }
 const musicPackage=JSON.parse(asar.extractFile(archive,path.normalize('node_modules/amplitudejs/package.json')));
 if(musicPackage.version!==toolchain(root).dependencies.amplitudejs)throw Error('Unexpected shipped Amplitude version.');
 const files=runtimeFiles(root).map(file=>{
  const expected=fs.readFileSync(path.join(root,file)),actual=asar.extractFile(archive,path.normalize(file));
  if(file==='package.json'||file==='node_modules/amplitudejs/package.json'){
   // electron-builder removes development-only fields and reformats JSON.
   // Compare every shipped application field, not whitespace or discarded tooling.
   const source=JSON.parse(expected),packed=JSON.parse(actual);
   for(const key of file==='package.json'?['scripts','devDependencies','build']:['scripts','keywords','bugs'])delete source[key];
   if(JSON.stringify(packed)!==JSON.stringify(source))throw Error('Packaged application metadata differs from source.');
  }else if(!actual.equals(expected))throw Error('Packaged runtime differs from source: '+file);
  return{file,bytes:actual.length,sha256:sha(actual)};
 });
 // Catch lost local HTML scripts/styles, including Amplitude, beyond the old REQUIRED list.
 const have=new Set(files.map(x=>x.file));
 for(const page of ['index.html','login.html']){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
   const target=m[1];if(/^(?:[a-z]+:|#|\/\/)/i.test(target))continue;
   if(!have.has(target.split(/[?#]/)[0]))throw Error('Unbundled local HTML resource: '+target);
  }
 }
 return files;
}
function collect(root,asar){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),build=pkg.airOSDevelopmentBuild,dist=path.join(root,'dist');
 const files=verifyRuntime(root,path.join(dist,'win-unpacked/resources/app.asar'),asar);
 const executable=fs.readFileSync(path.join(dist,'win-unpacked/Air-OS.exe'));
 const offset=executable.length>=64?executable.readUInt32LE(60):Infinity;
 if(executable.subarray(0,2).toString()!=='MZ'||offset>executable.length-6||executable.readUInt32LE(offset)!==0x4550||executable.readUInt16LE(offset+4)!==0x8664)throw Error('Not a Windows x64 application.');
 const names=fs.readdirSync(dist).filter(x=>x.endsWith('-Windows-x64.exe'));
 if(names.length!==1||!names[0].includes(pkg.version))throw Error('Expected exactly one current x64 installer.');
 const file=names[0],installer=fs.readFileSync(path.join(dist,file));
 if(installer.length<65536||installer.subarray(0,2).toString()!=='MZ')throw Error('Invalid installer.');
 for(const name of ['LICENSE.electron.txt','LICENSES.chromium.html']){
  const data=fs.readFileSync(path.join(dist,'win-unpacked',name));if(!data.length)throw Error('Missing runtime license: '+name);
  files.push({file:'runtime/'+name,bytes:data.length,sha256:sha(data)});
 }
 const destination=path.join(dist,'test-artifacts/windows-x64');fs.mkdirSync(destination,{recursive:true});
 // Exclusive creation rejects stale collection output instead of mixing builds.
 fs.copyFileSync(path.join(dist,file),path.join(destination,file),fs.constants.COPYFILE_EXCL);
 const info={...build,platform:'windows',arch:'x64',file,bytes:installer.length,sha256:sha(installer),packageFiles:files,
  evidence:{nodeTests:'See same-commit Windows CI job',nativeHardware:'BLOCKED: no physical Windows hardware acceptance',signing:'UNSIGNED',release:'NOT APPROVED'}};
 fs.writeFileSync(path.join(destination,'BUILD-INFO.json'),JSON.stringify(info,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(destination,'SHA256SUMS.txt'),info.sha256+'  '+file+'\n',{flag:'wx'});
 const summary=`## Air-OS Ultimate – Windows x64 – technical test build\n\nCommit: ${info.commit}\n\nFile: ${file}\n\nBytes: ${info.bytes}\n\nSHA-256: ${info.sha256}\n\nElectron: ${info.electron}\n\nUnsigned; hardware acceptance and production release remain open.\n`;
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`sha256=${info.sha256}\nbytes=${info.bytes}\nfile=${info.file}\n`);
 return info;
}
if(require.main===module){
 const root=path.resolve(__dirname,'..'),action=process.argv[2];
 if(action==='link')linkDependencies(root);
 else if(action==='validate'){
  const files=runtimeFiles(root);for(const file of files)if(/\.(?:c?js)$/.test(file))require('node:child_process').execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'inherit'});
  console.log('Validated runtime resources:',files.length);
 }
 else if(action==='prepare')console.log(JSON.stringify(prepare(root,require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),process.env.GITHUB_RUN_NUMBER||'')));
 else if(action==='collect')console.log(JSON.stringify(collect(root,require('@electron/asar'))));
 else throw Error('Usage: windows-test-build.cjs link|validate|prepare|collect');
}
module.exports={linkDependencies,prepare,runtimeFiles,verifyRuntime,collect};
