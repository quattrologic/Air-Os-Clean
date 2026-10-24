'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),api=require('../maclock-morph.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('MorphText defaults and real clock overrides remain distinct, including disabled stretch/width animation',()=>{
 assert.deepEqual(api.TEXT,{duration:420,alignDuration:650,blurMax:44,scaleIn:1.06,scaleOut:.94,stretch:true,animateWidth:true,useBlur:true});assert.equal(api.CLOCK.duration,560);assert.equal(api.CLOCK.blurMax,48);assert.equal(api.CLOCK.scaleIn,1.03);assert.equal(api.CLOCK.scaleOut,.97);assert.equal(api.CLOCK.stretch,false);assert.equal(api.CLOCK.animateWidth,false);assert.equal(api.CLOCK.useBlur,false);
});
test('clock uses two layers with exact OutQuint in and 75-percent OutCubic out, external blur and scale',()=>{
 for(const p of [.25,.5,.75]){const m=api.textModel('9:59',200,api.CLOCK);m.set('10:00',260,100);const s=m.sample(100+560*p),q=api.quint(p),o=api.cubic(p/.75);assert.equal(s.layers.length,2);near(s.values['1.opacity'],q);near(s.values['0.opacity'],1-o);near(s.values['1.scale'],1.03-.03*q);near(s.values['0.scale'],1-.03*q);near(s.values.morphBlur,1-q);assert.equal(s.values.width,260);assert.equal(s.values['1.sx'],1)}
});
test('default text stretches with clamped original ratios and smoothly animates width and alignment',()=>{
 const m=api.textModel('A',20);m.set('long',200,0);let s=m.sample(0);near(s.values['1.sx'],.35);m.align(0,0);s=m.sample(210);near(s.values.width,20+180*api.quint(.5));near(s.values.align,.5-.5*api.quint(210/650));near(s.values['0.sx'],1+1.5*api.quint(.5));
});
test('reversing to an existing text retains every currently visible transform and opacity at the new start',()=>{
 const m=api.textModel('A',100,api.CLOCK);m.set('B',120,0);const before=m.sample(160);m.set('A',100,160);const after=m.sample(160);for(const k of Object.keys(before.values))if(k!=='width')near(before.values[k],after.values[k]);assert.equal(after.layers[after.current].text,'A');assert.equal(m.sample(720).active,false);
});
test('rapid third text reuses only two layers and the latest authoritative content wins',()=>{
 const m=api.textModel('10:24',200,api.CLOCK);for(let i=0;i<40;i++)m.set('10:'+String(25+i),220+i,i*17);const s=m.sample(2000);assert.equal(s.layers.length,2);assert.equal(s.layers[s.current].text,'10:64');near(s.values[s.current+'.opacity'],1);near(s.values[(1-s.current)+'.opacity'],0);assert.equal(s.active,false);
});
test('unchanged text does not restart motion and completed transitions leave no active tracks',()=>{
 const m=api.textModel('10:24',200,api.CLOCK);assert.equal(m.set('10:24',200,100),false);assert.equal(m.active(),false);m.set('10:25',200,200);const a=m.sample(300);assert.equal(m.set('10:25',200,350),false);assert.equal(m.sample(760).active,false);assert.equal(m.sample(1000).revision,a.revision);
});
test('Reduced Motion directly settles both layers, blur, width and alignment without callbacks',()=>{
 const m=api.textModel('A',100);m.set('B',200,0,true);const s=m.sample(0);assert.equal(s.active,false);assert.equal(s.values.morphBlur,0);assert.equal(s.values['1.opacity'],1);assert.equal(s.values['1.scale'],1);assert.equal(s.values.width,200);m.cancel();assert.equal(m.active(),false);
});
test('scalar reversals interpolate from live values rather than restarting the prior endpoint',()=>{
 const m=api.motion({x:1});m.target('x',1.045,140,'quint',0);const old=m.sample(50).x;m.target('x',1,420,'quint',50);near(m.sample(50).x,old);near(m.sample(470).x,1);assert.equal(m.active(),false);
});
test('shake retains the six QML targets, exact per-step easings and 435ms total',()=>{
 assert.deepEqual(api.SHAKE,[[-16,55,'quint'],[14,80,'quad'],[-10,75,'quad'],[7,70,'quad'],[-3,65,'quad'],[0,90,'quint']]);assert.equal(api.SHAKE.reduce((n,s)=>n+s[1],0),435);
});
test('original QML audit sources are byte exact, MIT remains bundled and original fonts keep OFL',()=>{
 const manifest=require('../third_party/maclock/SOURCE_MANIFEST.json');for(const name of ['MorphText.qml','MorphGlyph.qml','ClockGlyph.qml']){const b=fs.readFileSync(require.resolve('../third_party/maclock/original/'+name));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),manifest.files.find(f=>f.path==='MacLock/'+name).sha256)}assert.match(fs.readFileSync(require.resolve('../third_party/maclock/LICENSE'),'utf8'),/Rickky/);assert.match(fs.readFileSync(require.resolve('../third_party/maclock/OpenRunde-LICENSE.txt'),'utf8'),/SIL OPEN FONT LICENSE/);
});
test('morph module has no credential, IPC, profile, HTML injection, timer or new GPU program path',()=>{
 const s=fs.readFileSync(require.resolve('../maclock-morph.js'),'utf8');assert.doesNotMatch(s,/\.value\b|innerHTML|airOS\.|getContext\(['"]webgl|setInterval|setTimeout|createProgram|\.login\(/);assert.match(s,/textContent=/);assert.match(s,/owner!==generation\|\|frame!==ticket/);assert.match(s,/events.abort\(\)/);assert.match(s,/observer.disconnect\(\)/);
});
test('authentication and account notifications carry no payload, rejected events only follow a confirmed failure',()=>{
 const s=fs.readFileSync(require.resolve('../login.js'),'utf8');assert.match(s,/if \(!disposed && \(!result \|\| !result.ok\)\).*air-login-rejected/);assert.match(s,/new Event\("air-login-account-changed"\)/);assert.doesNotMatch(s,/CustomEvent|setTimeout.*login|morph.*password/);
});
test('Caps Lock preserves the original idle12u/submit36u anchors and accommodates the existing mobile24px submit button',()=>{
 const s=fs.readFileSync(require.resolve('../login.css'),'utf8');assert.match(s,/not\(\.has-password\):not\(\.is-auth-busy\) #login-caps\{right:calc\(12px/);assert.match(s,/right:calc\(24px \+ 12px \* var\(--maclock-u\)\)/);assert.match(s,/maclock-morph-source\{opacity:0!important\}/);assert.doesNotMatch(s.split('/* L1B.3:')[1],/\.dock|\.air-home|\.air-notes|\.air-island/);
});
