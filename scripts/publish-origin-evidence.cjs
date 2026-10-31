'use strict';
// Only allowlisted synthetic CI screenshots and the structured, secret-free scene report.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const branch='feat/air-os-infinityos-origin-port-1';
function publish(root){
 const sha=process.env.GITHUB_SHA,run=process.env.GITHUB_RUN_ID;
 if(process.platform!=='linux'||process.env.GITHUB_REF!=='refs/heads/'+branch||!/^[a-f0-9]{40}$/.test(sha)||!/^\d+$/.test(run))throw Error('Dedicated Linux feature-branch evidence only.');
 const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
 if(git(['ls-remote','--heads','origin',branch]).split(/\s/)[0]!==sha){console.log('Newer source exists; evidence stays in its Actions artifact.');return;}
 const relative='docs/visual/origin1/'+sha,dir=path.join(root,relative);fs.mkdirSync(dir,{recursive:true});
 const debug=process.env.ORIGIN_EVIDENCE_DEBUG==='1',reports={};for(const phase of ['before','after']){
  const source=path.join(root,'dist/origin-evidence',phase),r=fs.existsSync(path.join(source,'origin-report.json'))?JSON.parse(fs.readFileSync(path.join(source,'origin-report.json'),'utf8')):{status:'incomplete',platform:'linux',physicalHardware:false,baseline:phase==='before'};
  if((r.status!=='passed'&&!debug)||r.platform!=='linux'||r.physicalHardware!==false||r.baseline!==(phase==='before'))throw Error('Successful real Linux scenes required.');reports[phase]=r;
  fs.mkdirSync(path.join(dir,phase));for(const file of (fs.existsSync(source)?fs.readdirSync(source):[])){
   if(!/^(desktop|finder-maximized|control-center|stages)-(1920|1688|1650|390)\.png$|^(r1-failure|grouped-stages|active-stage-group|notification-stack|overlap-dock-hidden|native-fullscreen|restored-desktop|neutral-maclock|reduced-stage)\.png$/.test(file))continue;
   const bytes=fs.readFileSync(path.join(source,file));if(bytes.length>15*1024*1024||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid screenshot.');fs.writeFileSync(path.join(dir,phase,file),bytes);
  }
 }
 const file=path.join(root,'dist/origin-evidence/materials/material-report.json');const material=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{status:'incomplete',hardwareAcceptance:false};if(!debug&&(material.status!=='passed'||material.hardwareAcceptance!==false||material.cleanup.programs!==0||material.cleanup.textures!==0))throw Error('Material cleanup evidence missing.');reports.material=material;
 const materialDir=path.join(root,'dist/origin-evidence/materials');fs.mkdirSync(path.join(dir,'materials'));for(const file of fs.existsSync(materialDir)?fs.readdirSync(materialDir):[]){if(!/^(stage-shader-dpr-[123]|stage-context-lost|stage-reduced|r1-failure)\.png$/.test(file))continue;const b=fs.readFileSync(path.join(materialDir,file));if(b.length>15*1024*1024||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Invalid material screenshot.');fs.writeFileSync(path.join(dir,'materials',file),b);}

 fs.writeFileSync(path.join(dir,'evidence.json'),JSON.stringify({sourceCommit:sha,run:'https://github.com/quattrologic/Air-Os-Clean/actions/runs/'+run,hardwareAcceptance:false,acceptance:debug?'INCOMPLETE / FAILED; visual debugging only':'passed',...reports},null,2)+'\n');
 git(['add','--',relative]);if(git(['diff','--cached','--name-only']).split('\n').some(f=>!f.startsWith(relative+'/')))throw Error('Unexpected staged path.');
 git(['-c','user.name=github-actions[bot]','-c','user.email=41898282+github-actions[bot]@users.noreply.github.com','commit','-m',(debug?'docs(origin): save incomplete synthetic GUI debug scenes for ':'docs(origin): save synthetic Linux Electron evidence for ')+sha.slice(0,12)]);git(['push','origin','HEAD:refs/heads/'+branch]);
}
if(require.main===module)publish(path.resolve(__dirname,'..'));
