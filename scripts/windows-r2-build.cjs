'use strict';
// R2 composes the frozen R1 packaging verifier; it does not alter R1 or signing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const r1=require('./windows-test-build.cjs');
const BASE='e71aa3bd71094ba6597dc8eb073181f374f8428e';
const BRANCH='build/air-ultimate-windows-x64-r2-20261027';
const REQUIRED=['air-tahoe.css','air-settings-tahoe.js','air-tahoe-apps.js','air-widget-views.js','air-deep-desktop.js','air-desktop-glass.js','macshell-glass2-shaders.js','air-music.js','src/core/music-metadata.js','src/core/window-system.js','src/main/lock-presentation.cjs','air-window-system.js','air-system-integration.js','air-system-integration.css','maclock-system.js','third_party/tahoe/provenance.json'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function source(root){
 const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
 execFileSync('git',['merge-base','--is-ancestor',BASE,'HEAD'],{cwd:root});
 if(process.env.GITHUB_REF&&process.env.GITHUB_REF!=='refs/heads/'+BRANCH)throw Error('R2 requires its dedicated build branch.');
 const commit=git(['rev-parse','HEAD']);
 if(process.env.GITHUB_SHA&&process.env.GITHUB_SHA!==commit)throw Error('Checkout differs from requested CI SHA.');
 const files=r1.runtimeFiles(root),have=new Set(files);
 for(const p of REQUIRED)if(!have.has(p))throw Error('Missing Tahoe 5 runtime asset: '+p);
 for(const p of files.filter(p=>!p.startsWith('node_modules/'))){
  const original=execFileSync('git',['show',commit+':'+p],{cwd:root,maxBuffer:16*1024*1024});
  if(!fs.readFileSync(path.join(root,p)).equals(original))throw Error('Dirty runtime source: '+p);
 }
 return{commit,base:BASE,runtimeFiles:files.length};
}
function prepare(root,run){
 const identity=source(root),build=r1.prepare(root,identity.commit,run),file=path.join(root,'package.json'),pkg=json(file);
 Object.assign(build,{releaseChannel:'R2',tahoeBase:BASE,branch:BRANCH,ciRun:process.env.GITHUB_RUN_ID?'https://github.com/quattrologic/Air-Os-Clean/actions/runs/'+process.env.GITHUB_RUN_ID:null,features:['Tahoe 1–5','Settings/Finder/Notes/Reminders/Calendar/Music','Widgets/Control Center/Spotlight','GLASS-3/CSS fallback/MacLock','Shared local media/metadata/notifications','MRU/snap/profile window geometry','M1/M2 reverse/Classic/Modern'],limitations:[
  'UNSIGNED technical test build; Smart App Control may block it; NOT production approved',
  'Native physical Windows/macOS, trusted signing, native dialogs and hardware GPU remain unaccepted',
  'Tahoe 1–5 integrated; MacLock only neutral or explicitly approved stopped public preview, not native OS lock',
  'No cloud login/sync or external Spotify service tested; legacy Catalina audit remains separate'
 ]});
 pkg.airOSDevelopmentBuild=build;pkg.build.win.artifactName='Air-OS-Ultimate-R2-${version}-Windows-${arch}.${ext}';
 fs.writeFileSync(file,JSON.stringify(pkg,null,2)+'\n');return build;
}
function inventory(root){const out=[];function visit(p){for(const n of fs.readdirSync(path.join(root,p))){const f=path.posix.join(p,n),s=fs.lstatSync(path.join(root,f));if(s.isSymbolicLink())throw Error('Payload symlink: '+f);if(s.isDirectory())visit(f);else out.push({file:f,bytes:s.size,sha256:hash(fs.readFileSync(path.join(root,f)))});}}visit('');return out.sort((a,b)=>a.file.localeCompare(b.file));}
function verifyPayload(root,expected){for(const e of expected){const p=path.join(root,e.file);if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink()||fs.statSync(p).size!==e.bytes||hash(fs.readFileSync(p))!==e.sha256)throw Error('Installed payload mismatch: '+e.file);}return expected.length;}
function collect(root,asar){
 const pkg=json(path.join(root,'package.json'));if(pkg.airOSDevelopmentBuild?.releaseChannel!=='R2'||pkg.airOSDevelopmentBuild.tahoeBase!==BASE)throw Error('Not a prepared R2 build.');
 const info=r1.collect(root,asar);if(!info.file.startsWith('Air-OS-Ultimate-R2-'))throw Error('Wrong R2 installer name.');
 info.payload=inventory(path.join(root,'dist/win-unpacked'));info.evidence.runnerInstallation='NOT_RUN';info.evidence.runnerGui='NOT_RUN';info.evidence.smartAppControl='NOT_TESTED';
 const dir=path.join(root,'dist/test-artifacts/windows-x64');fs.writeFileSync(path.join(dir,'BUILD-INFO.json'),JSON.stringify(info,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'INSTALL-R2.txt'),'Air-OS Ultimate R2 — UNSIGNED technical Windows x64 test build.\nCheck SHA256SUMS.txt with Get-FileHash -Algorithm SHA256 before installation.\nDo not disable Defender or Smart App Control. A publisher/SAC block remains open.\nInstall manually on your own test PC only. Create a synthetic local profile; do not enable cloud sync.\nCI runner results are recorded in BUILD-INFO.json; they are not physical hardware approval.\n');return info;
}
function installed(root,dir){const info=json(path.join(root,'dist/test-artifacts/windows-x64/BUILD-INFO.json'));if(info.releaseChannel!=='R2')throw Error('Wrong installed evidence identity.');const count=verifyPayload(dir,info.payload);const packed=require('@electron/asar');const files=r1.verifyRuntime(root,path.join(dir,'resources/app.asar'),packed);return{verifiedPayloadFiles:count,verifiedRuntimeFiles:files.length};}
if(require.main===module){const root=path.resolve(__dirname,'..'),action=process.argv[2];let value;if(action==='source')value=source(root);else if(action==='prepare')value=prepare(root,process.env.GITHUB_RUN_NUMBER||'1');else if(action==='collect')value=collect(root,require('@electron/asar'));else if(action==='installed')value=installed(root,process.argv[3]);else throw Error('Usage: windows-r2-build.cjs source|prepare|collect|installed <directory>');console.log(JSON.stringify(value));}
module.exports={BASE,BRANCH,REQUIRED,source,prepare,inventory,verifyPayload,collect,installed};
