'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const m=require('../src/core/stage-model.js'),p=require('../src/main/preferences.cjs'),known=id=>['finder','notes','reminders','settings'].includes(id);
const group={id:'g-abcdef12',apps:['finder','notes']};
test('Stage metadata validates bounded real registry identities and excludes duplicate ownership',()=>{
 a.deepEqual(m.validate({enabled:true,groups:[group],order:[group.id,'settings']},known),{enabled:true,groups:[group],order:[group.id,'settings']});
 for(const value of [{...m.empty(),enabled:'true'},{...m.empty(),groups:[{...group,apps:['finder','unknown']}]},{...m.empty(),groups:[group,{id:'g-abcdef13',apps:['notes','settings']}]},{...m.empty(),groups:[{...group,apps:['finder']}]},{...m.empty(),order:['finder','finder']},{...m.empty(),shell:'command'}])a.throws(()=>m.validate(value,known));
});
test('Stage view derives exclusively from live internal windows without creating or reviving apps',()=>{
 const prefs={enabled:true,groups:[group],order:['settings',group.id]};a.deepEqual(m.stages(['finder','settings','reminders'],prefs),[{id:'settings',apps:['settings']},{id:group.id,apps:['finder']},{id:'reminders',apps:['reminders']}]);
 a.deepEqual(m.stages([],prefs),[]);a.deepEqual(m.stages(['finder','finder'],m.empty()),[{id:'finder',apps:['finder']}]);a.deepEqual(m.move(['a','b','c'],'c','a'),['c','a','b']);
});
test('Schematic previews stay bounded after offscreen resize and do not read window contents',()=>{
 for(const box of [{left:-100,top:-40,width:900,height:1000},{left:1200,top:1200,width:5,height:2}]){const b=m.miniature(box,{width:390,height:576});a.ok(b.left>=0&&b.top>=0&&b.left+b.width<=224&&b.top+b.height<=130);}
});
test('Stage and intelligent dock settings persist per profile with existing atomic preferences store',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'air-stage-unit-'));try{let store=p.createStore({root:()=>dir});store.update('synthetic-a',{stageManager:{enabled:true,groups:[group],order:[group.id]},dockIntellihide:true});store=p.createStore({root:()=>dir});a.equal(store.load('synthetic-a').stageManager.enabled,true);a.deepEqual(store.load('synthetic-a').stageManager.groups,[group]);a.equal(store.load('synthetic-b').stageManager.enabled,false);a.equal(store.load('synthetic-b').dockIntellihide,false);store.reset('synthetic-a');a.deepEqual(store.load('synthetic-a').stageManager,m.empty());}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Dock overlap excludes touching edges and handles actual positive intersection',()=>{
 const dock={left:10,top:80,width:100,height:20};a.equal(m.overlap(dock,{left:0,top:0,width:500,height:80}),false);a.equal(m.overlap(dock,{left:110,top:80,width:10,height:20}),false);a.equal(m.overlap(dock,{left:0,top:0,width:500,height:81}),true);a.equal(m.overlap(dock,{left:0,top:0,width:0,height:900}),false);
});
test('Stage model executes in a browser realm without Node, Electron, native APIs or storage',()=>{
 const vm=require('node:vm'),sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/core/stage-model.js'),'utf8'),sandbox);const web=sandbox.window.airStageMath;
 const input={enabled:true,groups:[group],order:['reminders',group.id]},ids=['finder','notes','reminders'];
 a.deepEqual(JSON.parse(JSON.stringify(web.stages(ids,input))),m.stages(ids,input));a.deepEqual(JSON.parse(JSON.stringify(web.validate(input,known))),m.validate(input,known));a.equal(sandbox.window.airOS,undefined);
});
test('Main and renderer share all shipped app identities for stage and workspace persistence',()=>{
 const registry=require('../src/core/app-registry.js');for(const id of ['reminders','launchpad','store','arcade'])a.ok(registry.get(id),id+' must exist before renderer-only controllers mount');
 const value={enabled:true,groups:[{id:'g-abcdef12',apps:['finder','reminders']}],order:['g-abcdef12','launchpad','store','arcade']};a.deepEqual(p.validate({stageManager:value}).stageManager,value);
 a.equal(p.validate({desktopLayout:{mode:'dwindle',ratio:.55,workspace:1,assignments:{reminders:1,launchpad:1,arcade:2,store:3}}}).desktopLayout.assignments.reminders,1);
});
