'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
test('R7 copied MacLock source and copyright are exact and declared',()=>{
 const p=require('../third_party/r7-macshell/provenance.json');a.equal(p.commit,'1bdb51870b621100fd2709f66c8f8e00ab17b9c4');a.equal(crypto.createHash('sha256').update(fs.readFileSync(p.local)).digest('hex'),p.sha256);a.match(fs.readFileSync('third_party/r7-macshell/LICENSE','utf8'),/MIT/);
});
test('R7 MacLock original card sizes fit narrow/short layouts without private content',()=>{
 const m=require('../maclock-layout.js');a.equal(m.media(1200,1920,900,true).width,372);a.equal(m.media(1200,1920,900,true).height,138);
 for(const [h,w,room]of [[600,390,150],[864,1536,420],[1080,1920,500]]){const v=m.media(h,w,room,true);a.ok(v.width<=w-32);a.ok(v.art>=0);a.ok(v.art+v.height+v.gap<=Math.max(room,v.height+v.gap)+.01);}
 const s=fs.readFileSync('maclock-system.js','utf8');a.match(s,/data.publicPreview/);a.match(s,/data.playing!==false/);a.doesNotMatch(s,/notifications\.|transport\.act|setInterval/);a.match(s,/expand.hidden=true/);
});
test('R7 native MacWidgets scale range is profile validated with compatible default sizes',()=>{
 const m=require('../src/core/desktop-widgets.js'),p=require('../src/main/preferences.cjs');a.deepEqual(m.dims('small',1920),{width:185,height:185});a.deepEqual(m.dims('small',1536,.8),{width:148,height:148});a.deepEqual(m.dims('medium',1536,.8),{width:316,height:148});
 a.equal(p.validate({widgetScale:.8}).widgetScale,.8);for(const v of [0,2,NaN,'1'])a.throws(()=>p.validate({widgetScale:v}));a.equal(p.validate({referenceBackup:{widgetScale:1}}).referenceBackup.widgetScale,1);
});
test('R7 scale survives restart in one profile without changing another',()=>{
 const os=require('node:os'),path=require('node:path'),root=fs.mkdtempSync(path.join(os.tmpdir(),'r7-prefs-'));
 try{const create=require('../src/main/preferences.cjs').createStore;create({root:()=>root}).update('a',{widgetScale:.8});a.equal(create({root:()=>root}).load('a').widgetScale,.8);a.equal(create({root:()=>root}).load('b').widgetScale,1);}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('R7 snap hit-test uses R6.1 workarea and no hidden external margins',()=>{
 const m=require('../src/core/window-system.js'),b=m.workArea(1688,896);
 a.equal(m.edgeSnap(0,400,b),'left');a.equal(m.edgeSnap(1687,400,b),'right');a.equal(m.edgeSnap(800,24,b),'maximize');a.equal(m.edgeSnap(400,400,b),null);a.equal(m.edgeSnap(400,0,b),null);
});
test('R7 window spring shares original stable integrator and retains interrupted velocity',()=>{
 const m=require('../src/core/macshell-shell7.js');let s={value:0,velocity:0};for(let n=0;n<300&&!s.done;n++)s=m.step(s,100,.016,.18,1,.08);a.equal(s.value,100);
 const moving=m.step({value:50,velocity:80},0,.016,.18,1,.08);a.ok(Number.isFinite(moving.value));const source=fs.readFileSync('air-window-system.js','utf8');a.match(source,/prior\?\.springs/);a.match(source,/edgeTimer=setTimeout/);a.match(source,/,450\)/);a.doesNotMatch(source,/setInterval/);
});
test('R7 original scale changes grid pitches and collision-safe placement without changing margins',()=>{
 const m=require('../src/core/desktop-widgets.js'),g=m.gridInfo(1536,864,.8);a.equal(g.pitchX,165);a.equal(g.pitchY,161);a.equal(g.top,56);
 const box=m.dims('small',1536,.8),first=m.firstLeft(box,[],1536,864,.8),next=m.firstLeft(box,[{...first,...box}],1536,864,.8);a.ok(first&&next);a.equal(m.overlaps({...first,...box},{...next,...box}),false);
});
test('R7 internal workspace shortcuts use the ACK owner, ignore AltGraph and never install OS hotkeys',()=>{
 const s=fs.readFileSync('air-window-system.js','utf8');a.match(s,/getModifierState\?\.\('AltGraph'\)/);a.match(s,/assignments:\{\[id\]:workspace\}/);a.match(s,/\(desk.workspace-1\+\(e.key==='PageDown'\?1:3\)\)%4\+1/);a.doesNotMatch(s,/globalShortcut|hyprctl|execFile|child_process/);
});
