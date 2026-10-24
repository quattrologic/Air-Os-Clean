'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const registry=require('../src/core/app-registry.js');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8').split('function airHomeBody(){')[1].split('function appBody(id){')[0];
function fixture(width,height){
 const handlers={},opened=[],main={focus(){this.focused=true}},host={left:0,top:93,width,height:height-169};let bounds;
 const buttons=['home','launchpad','finder','settings','arbitrary-path'].map(id=>({dataset:{homeAction:id},addEventListener(type,fn){handlers[id]=fn}}));
 const context={window:{},innerWidth:width,innerHeight:height,appWindowHostRect:()=>host,setWindowToViewportRect:(win,rect)=>{bounds=rect},openApp:id=>opened.push(id)};
 vm.createContext(context);vm.runInContext('function airHomeBody(){'+source,context);
 const win={querySelectorAll:()=>buttons,querySelector:()=>main};context.mountAirHome(win);
 return{context,handlers,opened,main,get bounds(){return bounds}};
}
test('Air Home is a single built-in app with explicit empty widget states',()=>{
 assert.equal(registry.get('home').name,'Air Home');assert.equal(registry.list().filter(a=>a.id==='home').length,1);
 const body=fixture(1920,1080).context.airHomeBody();assert.match(body,/Demnächst/);assert.doesNotMatch(body,/<iframe|https:|33%|00:56/);
});
test('Air Home navigation reuses trusted app starts and rejects arbitrary actions',()=>{
 const f=fixture(1920,1080);for(const id of ['home','launchpad','finder','settings','arbitrary-path'])f.handlers[id]();
 assert.deepEqual(f.opened,['launchpad','finder','settings']);assert.equal(f.main.focused,true);
});
test('Air Home initial viewport bounds match reference and preserve narrow workspace',()=>{
 let f=fixture(1920,1080);assert.deepEqual(JSON.parse(JSON.stringify(f.bounds)),{left:200,top:103,width:1522,height:849});
 f=fixture(1650,930);assert.ok(Math.abs(f.bounds.width-1307.96875)<.01);assert.ok(Math.abs(f.bounds.top-88.6944)<.01);
 f=fixture(390,600);assert.equal(f.bounds.left,12);assert.equal(f.bounds.width,366);assert.equal(f.bounds.height,430);assert.ok(f.bounds.top>=f.context.appWindowHostRect().top);
});
