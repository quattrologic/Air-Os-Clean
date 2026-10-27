'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const api=require('../scripts/windows-r2-build.cjs'),root=path.resolve(__dirname,'..');
test('R2 installed payload verifier checks actual bytes and rejects missing or altered resources',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'r2-payload-'));try{
  fs.mkdirSync(path.join(temp,'resources'));fs.writeFileSync(path.join(temp,'resources/app.asar'),'real test bytes');fs.writeFileSync(path.join(temp,'Air-OS.exe'),'test only');
  const manifest=api.inventory(temp);assert.equal(api.verifyPayload(temp,manifest),2);
  fs.writeFileSync(path.join(temp,'resources/app.asar'),'fake test bytes');assert.throws(()=>api.verifyPayload(temp,manifest),/mismatch/);
  fs.unlinkSync(path.join(temp,'resources/app.asar'));assert.throws(()=>api.verifyPayload(temp,manifest),/mismatch/);
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
test('R2 source guard requires the fixed Tahoe 5 ancestor, exact CI SHA and dedicated ref',()=>{
 const cli=path.join(root,'scripts/windows-r2-build.cjs');
 const ref=spawnSync(process.execPath,[cli,'source'],{cwd:root,encoding:'utf8',env:{...process.env,GITHUB_REF:'refs/heads/main',GITHUB_SHA:''}});assert.notEqual(ref.status,0);assert.match(ref.stderr,/dedicated build branch/);
 const sha=spawnSync(process.execPath,[cli,'source'],{cwd:root,encoding:'utf8',env:{...process.env,GITHUB_REF:'refs/heads/'+api.BRANCH,GITHUB_SHA:'a'.repeat(40)}});assert.notEqual(sha.status,0);assert.match(sha.stderr,/Checkout differs/);
});
test('R2 critical modules and original license trees are covered by the existing runtime inventory',()=>{
 const list=require('../scripts/windows-test-build.cjs').runtimeFiles(root);for(const f of api.REQUIRED)assert.ok(list.includes(f),f);
 for(const prefix of ['third_party/tahoe/','third_party/maclock/','third_party/glass2/'])assert.ok(list.some(x=>x.startsWith(prefix)&&/COPYING|LICENSE/.test(x)),prefix);
 assert.equal(api.BASE,'e71aa3bd71094ba6597dc8eb073181f374f8428e');
});
test('R2 workflow keeps audits, installed-payload verification and native GUI mandatory without publishing',()=>{
 const yaml=fs.readFileSync(path.join(root,'.github/workflows/build-windows-r2.yml'),'utf8');
 for(const required of ['windows-2022','npm ci --prefix build/windows-x64','npm audit --prefix build/windows-x64 --audit-level=high','scripts/run-test-gate.cjs','scripts/windows-r2-build.cjs installed','scripts/check-windows-r2.cjs','--publish never','SHA256','runnerGui'])assert.ok(yaml.includes(required),required);
 assert.doesNotMatch(yaml,/continue-on-error|--no-sandbox|audit.*\|\|/);
 const smoke=fs.readFileSync(path.join(root,'scripts/check-windows-r2.cjs'),'utf8');assert.match(smoke,/CI must test the installed Windows x64 application/);assert.match(smoke,/consentDialog:'NOT_TESTED/);assert.doesNotMatch(smoke,/tahoe5-consent-fixture|start-tahoe5-test/);
});
test('R2 Windows autocrlf checkout preserves all pinned Tahoe, MacBar and Deep-Port asset bytes',()=>{
 const {execFileSync}=require('node:child_process'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'r2-eol-test-'));
 try{const files=execFileSync('git',['ls-files','third_party/tahoe','third_party/macbar','third_party/deep-port'],{cwd:root,encoding:'utf8'}).trim().split('\n');execFileSync('git',['-c','core.autocrlf=true','checkout-index','--prefix='+temp.replace(/\\/g,'/')+'/','--stdin'],{cwd:root,input:files.join('\n')+'\n'});for(const f of files)assert.deepEqual(fs.readFileSync(path.join(temp,f)),fs.readFileSync(path.join(root,f)),f);}finally{fs.rmSync(temp,{recursive:true,force:true})}
});
