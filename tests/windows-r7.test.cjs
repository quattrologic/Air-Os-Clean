'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs');
test('R7 native build pins R6.1 ancestry and includes new licensed executable assets',()=>{
 const b=require('../scripts/windows-r7-build.cjs');a.equal(b.BASE,'7be272a61d43db03810817755adf9615629ac89b');a.equal(b.BRANCH,'feat/air-os-r7-final-experience');
 const runtime=new Set(require('../scripts/windows-test-build.cjs').runtimeFiles(process.cwd()));
 for(const p of ['air-r7.css','hyprland-shaders.js','third_party/r7-macshell/LICENSE','third_party/r7-macshell/original/LockScreen.qml']){a.ok(b.REQUIRED.includes(p));a.ok(runtime.has(p),p+' must actually ship');}
});
test('R7 Windows gate retains audit, exact bytes, installed full GUI, R6.1 bounds and new scenes',()=>{
 const s=fs.readFileSync('.github/workflows/build-windows-r7.yml','utf8');for(const text of ['npm audit --prefix','scripts/run-test-gate.cjs','--publish never','scripts/windows-r7-build.cjs installed',"AIR_R61_BOUNDS_ONLY: '1'","AIR_R7_TEST: '1'","AIR_R7_VISUAL_ONLY: '1'",'steps.experience.outcome'])a.ok(s.includes(text),text);
 a.doesNotMatch(s,/continue-on-error|--no-sandbox|release:|refs\/heads\/main/);
 const p=fs.readFileSync('scripts/publish-r7-evidence.cjs','utf8');a.match(p,/experienceGui!=='success'/);a.match(p,/remote!==sha/);
});
