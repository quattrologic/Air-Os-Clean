'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/pwa-pages-test');
test('Pages deployment is explicit manual-only, exact branch and confirmation, PWA artifact only',()=>{
 const w=fs.readFileSync(path.join(root,'.github/workflows/deploy-pwa-preview.yml'),'utf8');
 assert.match(w,/workflow_dispatch:/);assert.doesNotMatch(w,/\n\s+(?:push|pull_request|schedule):/);assert.match(w,/inputs.public_confirmation == 'publish-public-pwa-test'/);assert.match(w,/refs\/heads\/feat\/air-ipad-pwa2-20261025/);assert.match(w,/path: dist\/pwa/);assert.match(w,/name: pwa-public-preview/);assert.match(w,/needs: build/);assert.doesNotMatch(w,/secrets\.|configure-pages|npm run pack/);
});
test('Pages package validates favicon/manifest/subpath-safe assets and rejects private/native files',()=>{
 execFileSync(process.execPath,['scripts/build-pwa.cjs',out],{cwd:root});const check=require('../scripts/check-pwa-package.cjs').check;
 assert.ok(check(out).files>100);fs.writeFileSync(path.join(out,'notes-v1.json'),'{}');assert.throws(()=>check(out),/Private/);fs.unlinkSync(path.join(out,'notes-v1.json'));
 fs.writeFileSync(path.join(out,'main.cjs'),'');assert.throws(()=>check(out),/Native/);fs.unlinkSync(path.join(out,'main.cjs'));
 const html=fs.readFileSync(path.join(out,'index.html'),'utf8');assert.match(html,/assets\/brand\/png\/app-32.png/);assert.match(html,/apple-mobile-web-app-status-bar-style/);
});
test('keyboard visual-viewport adjustment touches only focused note editor and cleans up',()=>{
 const vm=require('node:vm'),events={},removed=[],values={};let scrolled=false;
 const editor={style:{set maxHeight(v){values.maxHeight=v},set overflowY(v){values.overflowY=v},removeProperty:p=>removed.push(p)},getBoundingClientRect:()=>({top:100})};
 const field={closest:()=>editor,scrollIntoView:()=>scrolled=true};const document={activeElement:field,addEventListener:(t,h)=>events[t]=h,removeEventListener:()=>{}};
 const viewport={height:500,offsetTop:0,addEventListener:(t,h)=>events[t]=h,removeEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'pwa/viewport.js'),'utf8'),{window:{visualViewport:viewport,addEventListener:(t,h)=>events[t]=h},document,innerHeight:1024});
 events.resize();assert.equal(values.maxHeight,'384px');assert.equal(scrolled,true);viewport.height=1024;events.resize();assert.ok(removed.includes('max-height'));events.pagehide();
});
