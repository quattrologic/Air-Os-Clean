'use strict';
// R4 uses the unchanged frozen R1 toolchain/verifier and R3 payload verifier.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const r1=require('./windows-test-build.cjs'),r3=require('./windows-r3-build.cjs');
const BASE='d6af14b2089db5f35386da2969d13b4e558d8fba',BRANCH='feat/air-os-system-evolution-1';
const REQUIRED=[...r3.REQUIRED,'air-platform-system.js','air-platform-system.css','src/core/clipboard-edit.js','src/main/system-capabilities.cjs','src/main/hyprland-adapter.cjs','src/core/glass-geometry.js','third_party/glass2/materials-8a.json','third_party/glass2/NOTICE','third_party/evolution1/provenance.json','third_party/evolution1/LICENSE','third_party/evolution1/NOTICE'];
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function source(root){
 execFileSync('git',['merge-base','--is-ancestor',BASE,'HEAD'],{cwd:root});
 if(process.env.GITHUB_REF&&process.env.GITHUB_REF!=='refs/heads/'+BRANCH)throw Error('R4 requires its dedicated evolution branch.');
 const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();if(process.env.GITHUB_SHA&&process.env.GITHUB_SHA!==commit)throw Error('Checkout differs from requested CI SHA.');
 const files=r1.runtimeFiles(root),have=new Set(files);for(const f of REQUIRED)if(!have.has(f))throw Error('Missing R4 runtime asset: '+f);
 for(const f of files.filter(f=>!f.startsWith('node_modules/'))){const original=execFileSync('git',['show',commit+':'+f],{cwd:root,maxBuffer:16*1024*1024});if(!fs.readFileSync(path.join(root,f)).equals(original))throw Error('Dirty R4 runtime source: '+f);}
 return{commit,base:BASE,runtimeFiles:files.length};
}
function prepare(root,run){
 const identity=source(root),build=r1.prepare(root,identity.commit,run),file=path.join(root,'package.json'),pkg=json(file);
 Object.assign(build,{releaseChannel:'R4',tahoeBase:BASE,branch:BRANCH,ciRun:process.env.GITHUB_RUN_ID?'https://github.com/quattrologic/Air-Os-Clean/actions/runs/'+process.env.GITHUB_RUN_ID:null,features:['All actual Tahoe1–8A features','Shared cached WebGL2 preblur / GlassSlab / CornerBorder','Authenticated OS status: online, battery-power, display geometry/DPI','Explicit allowlisted Windows settings links / text clipboard','Native copy/cut/paste in existing Edit menu, undo preserved and stale editor results rejected','26px menu row, unchanged Dock/Island/M1/M2','Session-safe Finder folder grants','Optional one-shot read-only Hyprland bridge, consent required'],limitations:['UNSIGNED technical test build; Smart App Control may block it; NOT production approved','CI is not physical Windows GPU/audio/picker/SAC or macOS acceptance','Wallpaper-only refraction; software GPU fallback remains active','Qt local-track lenses, tintcard album transition and content blur masks remain incomplete','No native system volume/brightness/Bluetooth/battery percentage adapter','Hyprland Linux native host not available; no native acceptance','No cloud credentials, sync, iPad deployment or private files used']});
 pkg.airOSDevelopmentBuild=build;pkg.build.win.artifactName='Air-OS-Ultimate-R4-${version}-Windows-${arch}.${ext}';fs.writeFileSync(file,JSON.stringify(pkg,null,2)+'\n');return build;
}
function collect(root,asar){
 const pkg=json(path.join(root,'package.json'));if(pkg.airOSDevelopmentBuild?.releaseChannel!=='R4'||pkg.airOSDevelopmentBuild.tahoeBase!==BASE)throw Error('Not a prepared R4 build.');
 const info=r1.collect(root,asar);if(!info.file.startsWith('Air-OS-Ultimate-R4-'))throw Error('Wrong R4 installer name.');
 info.payload=r3.inventory(path.join(root,'dist/win-unpacked'));Object.assign(info.evidence,{runnerInstallation:'NOT_RUN',runnerGui:'NOT_RUN',capabilitiesGui:'NOT_RUN',smartAppControl:'NOT_TESTED'});
 const dir=path.join(root,'dist/test-artifacts/windows-x64');fs.writeFileSync(path.join(dir,'BUILD-INFO.json'),JSON.stringify(info,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'INSTALL-R4.txt'),'Air-OS Ultimate R4 — UNSIGNED technical Windows x64 test build.\nCompare Get-FileHash -Algorithm SHA256 with SHA256SUMS.txt.\nDo not disable Defender or Smart App Control; unsigned publisher blocking remains open.\nInstall manually on your own test PC only, create synthetic local profiles. No cloud sync.\nCI results in BUILD-INFO.json are not physical hardware approval.\n');return info;
}
function installed(root,dir){const info=json(path.join(root,'dist/test-artifacts/windows-x64/BUILD-INFO.json'));if(info.releaseChannel!=='R4')throw Error('Wrong installed R4 identity.');return{verifiedPayloadFiles:r3.verifyPayload(dir,info.payload),verifiedRuntimeFiles:r1.verifyRuntime(root,path.join(dir,'resources/app.asar'),require('@electron/asar')).length};}
if(require.main===module){process.on('uncaughtException',error=>{console.error('::error title=R4 build verification::'+String(error.message).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A').slice(0,1800));process.exitCode=1;});const root=path.resolve(__dirname,'..'),action=process.argv[2];let value;if(action==='source')value=source(root);else if(action==='prepare')value=prepare(root,process.env.GITHUB_RUN_NUMBER||'1');else if(action==='collect')value=collect(root,require('@electron/asar'));else if(action==='installed')value=installed(root,process.argv[3]);else throw Error('Usage: source|prepare|collect|installed');console.log(JSON.stringify(value));}
module.exports={BASE,BRANCH,REQUIRED,source,prepare,collect,installed};
