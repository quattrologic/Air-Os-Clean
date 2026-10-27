'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const api=require('../scripts/windows-r3-build.cjs'),root=path.resolve(__dirname,'..');
test('R3 requires its exact feature branch, Tahoe6 ancestor and requested CI commit',()=>{
 a.equal(api.BASE,'87cb80eaedc93793423420109f87e9bf1aca872a');a.equal(api.BRANCH,'feat/air-os-tahoe-7-full-shell');
 for(const [ref,sha,error]of [['refs/heads/main','','dedicated build branch'],['refs/heads/'+api.BRANCH,'a'.repeat(40),'Checkout differs']]){
  const r=spawnSync(process.execPath,[path.join(root,'scripts/windows-r3-build.cjs'),'source'],{cwd:root,encoding:'utf8',env:{...process.env,GITHUB_REF:ref,GITHUB_SHA:sha}});a.notEqual(r.status,0);a.ok(r.stderr.includes(error));
 }
});
test('R3 inventories every Tahoe7 runtime and both original and browser icon exports',()=>{
 const all=require('../scripts/windows-test-build.cjs').runtimeFiles(root);for(const f of api.REQUIRED)a.ok(all.includes(f),f);
 for(const e of require('../third_party/tahoe/provenance.json').icons.browserExports)a.ok(all.includes(e.asset));
 for(const f of ['third_party/tahoe7/LICENSE','third_party/tahoe7/NOTICE','third_party/tahoe7/original/Spring.qml','third_party/tahoe7/original/WGlyph.qml'])a.ok(all.includes(f),f);
});
test('R3 keeps audit, full tests, installed ASAR/payload checks and real Windows GUI mandatory',()=>{
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/build-windows-r3.yml'),'utf8');
 for(const s of ['windows-2022','44.9.3','npm audit --prefix build/windows-x64 --audit-level=high','scripts/run-test-gate.cjs','scripts/windows-r3-build.cjs installed','scripts/check-tahoe7.cjs','AIR_TAHOE7_WINDOWS','--publish never','runnerGui'])a.ok(workflow.includes(s),s);
 a.doesNotMatch(workflow,/continue-on-error|--no-sandbox|audit.*\|\|/);
 const gui=fs.readFileSync(path.join(root,'scripts/check-tahoe7.cjs'),'utf8');a.match(gui,/R3 must test actual installed native Windows x64/);a.match(gui,/fallbackContexts,\{webgl:true,webgl2:true\}/);a.match(gui,/hardwareGPU:'NOT_TESTED'/);
});
