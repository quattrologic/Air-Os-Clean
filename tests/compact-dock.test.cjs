'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const registry=require('../src/core/app-registry.js');
if(!registry.get('launchpad'))registry.register('launchpad',{name:'Launchpad',iconClass:'launchpad-icon'});
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const context={};vm.runInNewContext(source.slice(source.indexOf('function airDockReferences('),source.indexOf('function initAirDockLayout(')),context);
const select=(pins,width=1920,size=48)=>JSON.parse(JSON.stringify(context.airDockSelection(registry,pins,width,size)));
test('compact default is six registered apps, with existing Launchpad access and no unsupported ChatGPT entry',()=>{
 assert.deepEqual(select(null).visible,['launchpad','finder','browser','notes','music','settings']);
 assert.equal(select(null).overflow,0);assert.ok(select(null).visible.every(id=>registry.get(id)));
 assert.equal(select(null).visible.includes('chatgpt'),false);
});
test('pins preserve order, de-duplicate Launchpad, filter unavailable apps and leave stored references intact',()=>{
 const pins=['spotify','finder','launchpad','missing','notes'],before=pins.slice();
 assert.deepEqual(select(pins).visible,['launchpad','spotify','finder','notes']);assert.deepEqual(pins,before);
 assert.deepEqual(select([]).visible,['launchpad']);assert.notDeepEqual(select(null),select([]));
});
test('large pin lists have a bounded visible subset, stable overflow count and a permanently reachable app launcher',()=>{
 const pins=registry.list().map(app=>app.id),before=pins.slice();
 for(const width of [1920,1650,390,250,120])for(const size of [36,48,64]){
  const result=select(pins,width,size),icon=Math.max(30,Math.min(42,size-6));
  assert.equal(result.visible[0],'launchpad');assert.ok(result.visible.length<=10);
  if(width>=120)assert.ok(result.visible.length*(icon+10)+(result.visible.length-1)*4+26<=width-24);
  assert.equal(result.overflow,pins.filter(id=>registry.get(id).iconClass).length-result.visible.length);
 }
 assert.deepEqual(pins,before);
});
test('installed entries without original icon assets remain in Registry/Launchpad, without monochrome dock substitutes',()=>{
 try{
  const pins=['com.airos.test.tool','finder'];assert.deepEqual(select(pins).visible,['launchpad','finder']);
  registry.syncInstalled([{id:'com.airos.test.tool',name:'Test Tool'}]);assert.ok(registry.get('com.airos.test.tool'));assert.deepEqual(select(pins).visible,['launchpad','finder']);
  registry.syncInstalled([]);assert.deepEqual(select(pins).visible,['launchpad','finder']);
 }finally{registry.syncInstalled([])}
});

test('window animation targets the dock instead of a hidden icon with empty bounds',()=>{
 const dockRect={left:100,top:800,width:358,height:68},buttonRect={left:120,top:810,width:52,height:52};
 const button={hidden:true,getBoundingClientRect:()=>buttonRect};
 const document={querySelector:selector=>selector==='.dock'?{getBoundingClientRect:()=>dockRect}:button};
 const target={document};vm.runInNewContext(source.slice(source.indexOf('function appDockRect('),source.indexOf('function dockMotionValues(')),target);
 assert.equal(target.appDockRect('finder'),dockRect);button.hidden=false;assert.equal(target.appDockRect('finder'),buttonRect);
});
