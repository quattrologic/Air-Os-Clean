'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const api=require('../scripts/windows-signing.cjs');
const env={AIR_SIGNING_PUBLISHER:'Example Verified Publisher',AIR_WINDOWS_CERTIFICATE_PFX:'PRIVATE_TEST_BYTES',AIR_WINDOWS_CERTIFICATE_PASSWORD:'PASSWORD_NEVER_SERIALIZE',AIR_SIGNING_CERT_SHA1:'a'.repeat(40),AIR_ARTIFACT_ENDPOINT:'https://eus.codesigning.azure.net/',AIR_ARTIFACT_ACCOUNT:'example',AIR_ARTIFACT_PROFILE:'public',AZURE_TENANT_ID:'tenant',AZURE_CLIENT_ID:'client',AZURE_CLIENT_SECRET:'CLIENT_SECRET_NEVER_SERIALIZE'};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('R1.1 absent identities are BLOCKED and configuration never falls back to unsigned',()=>{
 for(const mode of ['certificate','artifact']){const s=api.status(mode,{});assert.equal(s.status,'BLOCKED');assert.ok(s.missing.includes('AIR_SIGNING_PUBLISHER'));assert.equal(s.smartAppControl,'NOT_TESTED');assert.throws(()=>api.config(mode,{}),/BLOCKED/)}
 for(const mode of ['unsigned','auto','__proto__'])assert.throws(()=>api.config(mode,env),/Unsupported/);
});
test('R1.1 certificate policy requires native validated identity and enforces SHA256/RFC3161/full PE coverage',()=>{
 assert.throws(()=>api.config('certificate',{...env,AIR_SIGNING_CERT_SHA1:''}),/validated/);
 const c=api.config('certificate',env);assert.equal(c.forceCodeSigning,true);assert.equal(c.win.signExecutable,true);assert.equal(c.win.signAndEditExecutable,true);assert.deepEqual(c.win.signExts,['.exe','.dll','.node']);assert.deepEqual(c.win.signtoolOptions.signingHashAlgorithms,['sha256']);assert.equal(c.win.signtoolOptions.rfc3161TimeStampServer,'http://timestamp.digicert.com');assert.equal(c.win.azureSignOptions,undefined);
});
test('R1.1 Artifact Signing config uses supported native builder options without credential serialization',()=>{
 const c=api.config('artifact',env);assert.equal(c.win.azureSignOptions.fileDigest,'SHA256');assert.equal(c.win.azureSignOptions.timestampDigest,'SHA256');assert.equal(c.win.signtoolOptions,undefined);assert.equal(api.status('artifact',env).status,'CONFIGURED_NOT_VERIFIED');
 for(const mode of ['certificate','artifact']){const s=JSON.stringify(api.config(mode,env));for(const value of [env.AIR_WINDOWS_CERTIFICATE_PFX,env.AIR_WINDOWS_CERTIFICATE_PASSWORD,env.AZURE_CLIENT_SECRET])assert.ok(!s.includes(value))}
});
test('R1.1 malformed public input, unapproved endpoints and incomplete credentials are rejected',()=>{
 for(const [key,value]of [['AIR_ARTIFACT_ENDPOINT','https://evil.example/'],['AIR_ARTIFACT_PROFILE',"x';evil"],['AIR_SIGNING_PUBLISHER','name\n::error::injection'],['AZURE_CLIENT_SECRET','']])assert.throws(()=>api.config('artifact',{...env,[key]:value}));
 const missing=api.status('artifact',{...env,AIR_SIGNING_PUBLISHER:''});assert.ok(!JSON.stringify(missing).includes(env.AZURE_CLIENT_SECRET));
});
test('R1.1 signing options validate against the actual installed electron-builder schema',async()=>{
 const frozen=path.join(__dirname,'../build/windows-x64/node_modules/app-builder-lib/out/util/config/config.js');const {validateConfiguration}=require(fs.existsSync(frozen)?frozen:'app-builder-lib/out/util/config/config');
 for(const mode of ['certificate','artifact'])await validateConfiguration(api.config(mode,env),{add(){}});
});
// Synthetic metadata fixtures test receipt handling, not native Authenticode trust.
// Only the protected Windows job's separate SignTool/chain gates can publish.
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'air-r11-signing-')),dir=path.join(root,'dist/test-artifacts/windows-x64'),file='Air-OS-dev-Windows-x64.exe';fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'dist/win-unpacked'),{recursive:true});
 fs.writeFileSync(path.join(dir,file),'synthetic installer');fs.writeFileSync(path.join(root,'dist',file),'synthetic installer');fs.writeFileSync(path.join(root,'dist/win-unpacked/Air-OS.exe'),'synthetic application');
 const info={commit:'a'.repeat(40),file,sha256:hash('synthetic installer'),unsigned:true,evidence:{signing:'UNSIGNED'},limitations:['Unsigned technical test build; not a production release']};fs.writeFileSync(path.join(dir,'BUILD-INFO.json'),JSON.stringify(info));
 const record=(file,bytes)=>({file,status:'Valid',timestamp:'public timestamp receipt',chainVerified:true,signToolVerified:true,rsa:true,sha256:hash(bytes)}),base={schema:1,status:'VERIFIED',platform:'win32',commit:info.commit,smartAppControl:'NOT_TESTED'};
 return{root,dir,file,p:{...base,scope:'package',files:[record(file,'synthetic installer'),record('win-unpacked/Air-OS.exe','synthetic application')]},i:{...base,scope:'installed',files:[record('Air-OS.exe','synthetic application'),record('Uninstall Air-OS.exe','synthetic uninstaller')]},close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('R1.1 receipt finalization preserves SAC NOT_TESTED, records post-signing hash and no release approval',()=>{
 const f=fixture();try{const r=api.finalize(f.root,f.p,f.i);assert.equal(r.unsigned,false);assert.equal(r.evidence.signing,'AUTHENTICODE_VERIFIED');assert.equal(r.evidence.smartAppControl,'NOT_TESTED');assert.ok(r.limitations[0].includes('not a production release'));assert.equal(fs.readFileSync(path.join(f.dir,'SHA256SUMS.txt'),'utf8'),r.sha256+'  '+f.file+'\n');assert.ok(fs.existsSync(path.join(f.dir,'SIGNATURE-REPORT.json')))}finally{f.close()}
});
for(const mutation of ['unsigned','timestamp','chain','signtool','commit','installer-modified','app-modified','uninstaller-missing','path-traversal'])test('R1.1 refuses signing receipt: '+mutation,()=>{
 const f=fixture();try{
  if(mutation==='unsigned')f.p.status='UNSIGNED';if(mutation==='timestamp')f.p.files[0].timestamp=null;if(mutation==='chain')f.p.files[0].chainVerified=false;if(mutation==='signtool')f.p.files[0].signToolVerified=false;if(mutation==='commit')f.i.commit='b'.repeat(40);
  if(mutation==='installer-modified')fs.appendFileSync(path.join(f.dir,f.file),'changed');if(mutation==='app-modified')fs.appendFileSync(path.join(f.root,'dist/win-unpacked/Air-OS.exe'),'changed');if(mutation==='uninstaller-missing')f.i.files.pop();if(mutation==='path-traversal')f.p.files.push({...f.p.files[1],file:'win-unpacked/../../outside.exe'});
  assert.throws(()=>api.finalize(f.root,f.p,f.i));assert.equal(JSON.parse(fs.readFileSync(path.join(f.dir,'BUILD-INFO.json'))).unsigned,true);assert.equal(fs.existsSync(path.join(f.dir,'SIGNATURE-REPORT.json')),false);
 }finally{f.close()}
});
test('R1.1 workflow is opt-in, environment-protected, secret-only, fail-closed and retains all R1 security/GUI gates',()=>{
 const y=fs.readFileSync(path.join(__dirname,'../.github/workflows/build-windows-signed-r11.yml'),'utf8');assert.match(y,/environment: windows-code-signing/);assert.match(y,/github.event_name == 'workflow_dispatch'/);assert.match(y,/secrets\.AIR_WINDOWS_CERTIFICATE_PFX/);assert.match(y,/if: success\(\) && steps.verified.outcome == 'success'/);for(const name of ['npm audit','run-test-gate.cjs','VerifyPackage','VerifyInstalled','check-windows-package.cjs','-Action Cleanup','SAC-NOT-TESTED'])assert.ok(y.includes(name));assert.doesNotMatch(y,/pull_request:|continue-on-error|--no-sandbox|Set-MpPreference|reg add/);
 const ps=fs.readFileSync(path.join(__dirname,'../scripts/windows-signing.ps1'),'utf8');for(const value of ['verify /pa /all /v /tw','TimeStamperCertificate','RevocationMode = \'Online\'','ApplicationPolicy','-DeleteKey','SetAccessRuleProtection($true,$false)'])assert.ok(ps.includes(value));assert.doesNotMatch(ps,/Export-PfxCertificate|Exportable|Set-MpPreference|Set-AuthenticodeSignature|New-SelfSignedCertificate/);
});
