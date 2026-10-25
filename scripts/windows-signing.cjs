'use strict';
// R1.1 build-only policy. Never serialize private key material or credentials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const required={certificate:['AIR_SIGNING_PUBLISHER','AIR_WINDOWS_CERTIFICATE_PFX','AIR_WINDOWS_CERTIFICATE_PASSWORD'],artifact:['AIR_SIGNING_PUBLISHER','AIR_ARTIFACT_ENDPOINT','AIR_ARTIFACT_ACCOUNT','AIR_ARTIFACT_PROFILE','AZURE_TENANT_ID','AZURE_CLIENT_ID','AZURE_CLIENT_SECRET']};
function status(mode,env){
 if(!Object.hasOwn(required,mode))throw Error('Unsupported signing mode.');
 const missing=required[mode].filter(k=>!env[k]?.trim());
 return{status:missing.length?'BLOCKED':'CONFIGURED_NOT_VERIFIED',mode,missing,smartAppControl:'NOT_TESTED'};
}
function config(mode,env){
 const s=status(mode,env);if(s.missing.length)throw Error('BLOCKED: missing protected signing prerequisites: '+s.missing.join(', '));
 for(const k of required[mode].filter(k=>!['AIR_WINDOWS_CERTIFICATE_PFX','AIR_WINDOWS_CERTIFICATE_PASSWORD','AZURE_CLIENT_SECRET'].includes(k)))if(/[\r\n\0]/.test(env[k]))throw Error('Invalid public signing configuration.');
 const win={signExecutable:true,signAndEditExecutable:true,signExts:['.exe','.dll','.node']};
 if(mode==='certificate'){
  if(!/^[A-Fa-f0-9]{40}$/.test(env.AIR_SIGNING_CERT_SHA1||''))throw Error('BLOCKED: validated temporary certificate identity required.');
  win.signtoolOptions={certificateSha1:env.AIR_SIGNING_CERT_SHA1,publisherName:env.AIR_SIGNING_PUBLISHER,signingHashAlgorithms:['sha256'],rfc3161TimeStampServer:'http://timestamp.digicert.com'};
 }else{
  if(!/^https:\/\/[a-z0-9-]+\.codesigning\.azure\.net\/?$/.test(env.AIR_ARTIFACT_ENDPOINT)||![env.AIR_ARTIFACT_ACCOUNT,env.AIR_ARTIFACT_PROFILE].every(x=>/^[A-Za-z0-9_-]{1,100}$/.test(x)))throw Error('Invalid Artifact Signing endpoint/account/profile.');
  win.azureSignOptions={publisherName:env.AIR_SIGNING_PUBLISHER,endpoint:env.AIR_ARTIFACT_ENDPOINT,codeSigningAccountName:env.AIR_ARTIFACT_ACCOUNT,certificateProfileName:env.AIR_ARTIFACT_PROFILE,fileDigest:'SHA256',timestampDigest:'SHA256',timestampRfc3161:'http://timestamp.acs.microsoft.com'};
 }
 return{forceCodeSigning:true,win};
}
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function finalize(root,packageReport,installedReport){
 const dir=path.join(root,'dist/test-artifacts/windows-x64'),infoFile=path.join(dir,'BUILD-INFO.json'),info=JSON.parse(fs.readFileSync(infoFile));
 for(const r of [packageReport,installedReport]){
  if(r.schema!==1||r.status!=='VERIFIED'||r.platform!=='win32'||r.commit!==info.commit||r.smartAppControl!=='NOT_TESTED'||!r.files?.length)throw Error('Unverified or mismatched signing evidence.');
  for(const f of r.files)if(f.status!=='Valid'||!f.timestamp||!f.chainVerified||!f.signToolVerified||!f.rsa||!/^[a-f0-9]{64}$/.test(f.sha256))throw Error('Incomplete Authenticode evidence.');
 }
 if(packageReport.scope!=='package'||installedReport.scope!=='installed'||!installedReport.files.some(f=>/uninstall.*\.exe$/i.test(f.file))||!installedReport.files.some(f=>f.file==='Air-OS.exe'))throw Error('Installed app and uninstaller evidence required.');
 const installer=packageReport.files.find(f=>f.file===info.file);
 if(!installer||installer.sha256!==hash(path.join(dir,info.file))||info.sha256!==installer.sha256)throw Error('Installer changed after signature verification.');
 for(const f of packageReport.files){
  if(f.file!==info.file&&!f.file.startsWith('win-unpacked/'))throw Error('Invalid packaged signature path.');
  const absolute=path.resolve(root,'dist',f.file),base=path.resolve(root,'dist')+path.sep;if(!absolute.startsWith(base)||!fs.existsSync(absolute)||hash(absolute)!==f.sha256)throw Error('Packaged executable changed after signature verification.');
 }
 const unpacked=packageReport.files.find(f=>f.file==='win-unpacked/Air-OS.exe'),installed=installedReport.files.find(f=>f.file==='Air-OS.exe');if(!unpacked||unpacked.sha256!==installed.sha256)throw Error('Installed executable differs from verified package.');
 info.unsigned=false;info.signing='AUTHENTICODE_VERIFIED';info.evidence.signing='AUTHENTICODE_VERIFIED';info.evidence.smartAppControl='NOT_TESTED';info.evidence.runnerInstallation='success';info.evidence.runnerGui='success';
 info.limitations=info.limitations.map(x=>x.startsWith('Unsigned technical')?'Authenticode-verified technical test build; not a production release':x);
 fs.writeFileSync(path.join(dir,'SIGNATURE-REPORT.json'),JSON.stringify({package:packageReport,installed:installedReport},null,2)+'\n');fs.writeFileSync(infoFile,JSON.stringify(info,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'SHA256SUMS.txt'),installer.sha256+'  '+info.file+'\n');return info;
}
if(require.main===module){
 try{
  const [action,mode]=process.argv.slice(2);
  if(action==='status')console.log(JSON.stringify(status(mode,process.env)));
  else if(action==='config'){
   const base=JSON.parse(fs.readFileSync('package.json')).build,options=config(mode,process.env);const output=path.join(process.env.RUNNER_TEMP,'air-r11-signing/config.json');fs.writeFileSync(output,JSON.stringify({...base,...options,win:{...base.win,...options.win}},null,2));console.log('Prepared signing policy; no credentials serialized.');
  }else if(action==='finalize'){
   const p=JSON.parse(fs.readFileSync('dist/r11-package-signatures.json')),i=JSON.parse(fs.readFileSync('dist/r11-installed-signatures.json'));const info=finalize(process.cwd(),p,i);if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`sha256=${info.sha256}\nbytes=${info.bytes}\n`);console.log('Authenticode verified; Smart App Control NOT TESTED.');
  }else throw Error('Use status|config|finalize.');
 }catch(e){console.error(e.message);process.exitCode=1}
}
module.exports={status,config,finalize};
