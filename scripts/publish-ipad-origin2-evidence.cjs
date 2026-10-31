'use strict';
// Allowlisted synthetic browser evidence only. No browser profiles or storage exports.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const BRANCH='feat/air-os-infinityos-origin-port-2-ipad',root=path.resolve(__dirname,'..');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const sha=process.env.GITHUB_SHA,run=process.env.GITHUB_RUN_ID;
if(process.platform!=='linux'||process.env.GITHUB_REF!=='refs/heads/'+BRANCH||!/^[a-f0-9]{40}$/.test(sha)||!/^\d+$/.test(run))throw Error('Dedicated browser evidence branch required.');
if(git(['ls-remote','--heads','origin',BRANCH]).split(/\s/)[0]!==sha){console.log('New source exists; browser evidence remains in Actions artifact.');process.exit(0);}
const rel='docs/visual/origin2-ipad/'+sha,dir=path.join(root,rel);fs.mkdirSync(dir,{recursive:true});const reports={};
for(const [name,folder]of [['before','before/chromium'],['chromium','chromium'],['webkit','webkit'],['pages-chromium','pages/chromium'],['pages-webkit','pages/webkit']]){
 const src=path.join(root,'dist/ipad-evidence',folder),report=JSON.parse(fs.readFileSync(path.join(src,'results.json'),'utf8'));
 if((report.status!=='passed'&&!(process.env.IPAD_EVIDENCE_DEBUG==='1'&&report.status==='failed'))||report.physicalIPad!==false||!['chromium','webkit'].includes(report.browser))throw Error('Successful synthetic browser checks required.');reports[name]=report;
 fs.mkdirSync(path.join(dir,name));for(const f of fs.readdirSync(src)){
  if(!/^(?:\d{3,4}x\d{3,4})-(?:desktop|stage-manager|stage-groups|notes|finder|music|two-apps|spotlight|launchpad|control-center|notifications|overview|start-screen|settings|storage-tools|offline-notes|airwrite)\.jpg$/.test(f))continue;
  const b=fs.readFileSync(path.join(src,f));if(b.length>10*1024*1024||b[0]!==255||b[1]!==216)throw Error('Invalid renderer image.');fs.writeFileSync(path.join(dir,name,f),b);
 }
}
const build=JSON.parse(fs.readFileSync(path.join(root,'dist/ipad/BUILD-INFO.json'),'utf8'));
fs.writeFileSync(path.join(dir,'evidence.json'),JSON.stringify({acceptance:process.env.IPAD_EVIDENCE_DEBUG==='1'?'INCOMPLETE/FAILED':'passed',source:sha,run:'https://github.com/quattrologic/Air-Os-Clean/actions/runs/'+run,physicalIPad:false,build,reports},null,2)+'\n');
git(['add','--',rel]);for(const f of git(['diff','--cached','--name-only']).split('\n'))if(!f.startsWith(rel+'/'))throw Error('Unexpected staged file.');git(['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m','Save verified synthetic iPad Stage 2 browser evidence for '+sha.slice(0,12)]);git(['push','origin','HEAD:refs/heads/'+BRANCH]);
