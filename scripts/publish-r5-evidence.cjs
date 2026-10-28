'use strict';
// Only synthetic, installed-renderer screenshots; no raw logs/profile files.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const BRANCH='feat/air-os-r5-macshell-fidelity';
function stage(root,sha,run){
 if(!/^[a-f0-9]{40}$/.test(sha)||!/^\d+$/.test(run))throw Error('Invalid evidence identity.');
 const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),info=read('dist/test-artifacts/windows-x64/BUILD-INFO.json'),gui=read('dist/r5-gui/r1-gui-report.json'),caps=read('dist/r5-capabilities/material-report.json'),diag=read('dist/r5-diagnostic/material-report.json');
 if(info.commit!==sha||info.releaseChannel!=='R5'||gui.os!=='win32'||caps.os!=='win32'||info.evidence.runnerInstallation!=='success'||info.evidence.runnerGui!=='success'||info.evidence.capabilitiesGui!=='success'||info.evidence.diagnosticGui!=='success'||diag.os!=='win32')throw Error('Successful installed native Windows evidence required.');
 const relative='docs/visual/r5/windows-r5/'+sha,dir=path.join(root,relative);fs.mkdirSync(dir,{recursive:true});
 const names={};for(const w of [1920,1650,390]){for(const n of ['desktop','system-status','island-open','player-art'])names[n+'-'+w+'.png']='dist/r5-capabilities/'+n+'-'+w+'.png';for(const n of ['r1-lockscreen','r1-notes','deep-spotlight','r1-desktop'])names[n+'-'+w+'.png']='dist/r5-gui/'+n+'-'+w+'.png';}
 for(const n of ['r2-snap','r2-music-widget','r2-switcher','r2-locked-neutral'])names[n+'.png']='dist/r5-gui/'+n+'.png';names['native-edit-notes.png']='dist/r5-capabilities/native-edit-notes.png';
 for(const n of ['glass-slider-held','glass-switch','scroll-under','spotlight','artwork-transition','player-art-blue','reduced-transparency'])names[n+'.png']='dist/r5-capabilities/'+n+'.png';for(const n of ['desktop-1920','stripes-1920','stripes-no-refraction-1920','player-art-1920','glass-slider-held'])names['diagnostic-'+n+'.png']='dist/r5-diagnostic/'+n+'.png';
 for(const [dest,src]of Object.entries(names)){const bytes=fs.readFileSync(path.join(root,src));if(bytes.length>20*1024*1024||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid public screenshot.');fs.writeFileSync(path.join(dir,dest),bytes);}
 const report={sourceCommit:sha,run:'https://github.com/quattrologic/Air-Os-Clean/actions/runs/'+run,installer:{file:info.file,bytes:info.bytes,sha256:info.sha256,builtAt:info.builtAt,electron:info.electron,builder:info.builder,unsigned:true},evidence:info.evidence,windows:{os:gui.os,osRelease:gui.osRelease,userAgent:gui.userAgent,profileIsolation:gui.profileIsolation,processRestartPersistence:gui.processRestartPersistence,fallbackContextsNull:gui.fallbackContextsNull},capabilities:{system:caps.system,nativeSettingsRequests:caps.nativeSettingsRequests,nativeSettingsAcceptance:caps.nativeSettingsAcceptance,nativeEditMenu:caps.nativeEditMenu,clipboardRoundtrip:caps.clipboardRoundtrip,m1m2Reverse:caps.m1m2Reverse,surfaces:caps.surfaces.map(s=>({name:s.name,glass:s.glass}))},diagnostic:{kind:diag.kind,hardwareAcceptance:false,idleDraws:diag.idleDraws,nativeControls:diag.nativeControls,surfaces:diag.surfaces.map(s=>({name:s.name,glass:s.glass}))},hardwareAcceptance:false,screenshots:names};
 fs.writeFileSync(path.join(dir,'evidence.json'),JSON.stringify(report,null,2)+'\n');return relative;
}
function publish(root){
 if(process.platform!=='win32'||process.arch!=='x64'||process.env.GITHUB_REF!=='refs/heads/'+BRANCH)throw Error('Dedicated native R5 branch required.');
 const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim(),sha=process.env.GITHUB_SHA,run=process.env.GITHUB_RUN_ID;
 const remote=git(['ls-remote','--heads','origin',BRANCH]).split(/\s/)[0];if(remote!==sha){console.log('::warning::Newer branch commit exists; screenshots remain in Actions artifacts.');return;}
 const dir=stage(root,sha,run);git(['add','--',dir]);for(const f of git(['diff','--cached','--name-only']).split('\n'))if(!f.startsWith(dir+'/'))throw Error('Unexpected staged file.');
 git(['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m','Save verified installed Windows R5 screenshots for '+sha.slice(0,12)]);
 git(['push','origin','HEAD:refs/heads/'+BRANCH]);console.log('::notice title=R5 evidence committed::'+git(['rev-parse','HEAD'])+' '+dir);
}
if(require.main===module)publish(path.resolve(__dirname,'..'));
module.exports={stage};
