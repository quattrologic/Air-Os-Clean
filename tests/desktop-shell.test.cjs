'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
function fixture(){
 const elements={};
 function element(id){
  const handlers={};
  const el={id,hidden:false,dataset:{},attrs:{},children:[],parentNode:null,nextSibling:null,
   addEventListener:(type,fn)=>{(handlers[type]??=[]).push(fn)},
   emit:(type,event={})=>{for(const fn of handlers[type]||[])fn(event)},
   contains(target){return target===this||this.children.some(child=>child.contains(target))},
   appendChild(child){child.parentNode?.children.splice(child.parentNode.children.indexOf(child),1);this.children.push(child);child.parentNode=this},
   insertBefore(child){this.appendChild(child)},
   setAttribute(key,value){this.attrs[key]=value},focus(){document.activeElement=this},click(){this.clicks=(this.clicks||0)+1},
   querySelector(){return elements['account-toggle']}
  };elements[id]=el;return el;
 }
 const document=element('document');document.documentElement={dataset:{desktopTheme:'classic'}};
 document.querySelector=id=>elements[id.replace(/^#/,'')];document.getElementById=id=>elements[id];
 for(const id of ['air-modern-shell','air-system-toggle','air-system-panel','account-menu-wrap','air-modern-profile','account-dropdown','account-toggle','air-search-open','.menubar','.desktop-icons','classic-parent'])element(id);
 const e=elements;
 e['classic-parent'].appendChild(e['account-menu-wrap']);e['.menubar'].appendChild(e['classic-parent']);
 e['air-modern-shell'].appendChild(e['air-system-toggle']);e['air-modern-shell'].appendChild(e['air-system-panel']);
 e['air-system-panel'].appendChild(e['air-modern-profile']);e['account-menu-wrap'].appendChild(e['account-toggle']);
 document.activeElement=e['air-search-open'];
 const code=source.slice(source.indexOf('function initAirModernShell(){'),source.indexOf('// Robust launch handlers for Dock'));
 vm.runInNewContext(code,{document});
 return {e,document,theme(value){document.documentElement.dataset.desktopTheme=value;document.emit('air-settings-changed')}};
}
test('Modern relocates original profile controls; Classic restores them and hides compact shell',()=>{
 const {e,theme}=fixture();assert.equal(e['air-modern-shell'].hidden,true);
 for(const mode of ['modern','classic','modern']){
  theme(mode);assert.equal(e['air-modern-shell'].hidden,mode!=='modern');
  assert.equal(e['account-menu-wrap'].parentNode,e[mode==='modern'?'air-modern-profile':'classic-parent']);
  assert.equal(e['air-system-panel'].hidden,true);assert.equal(e['air-system-toggle'].attrs['aria-expanded'],'false');
 }
});
test('disclosure focuses content, Escape restores trigger, Tab leaves without trapping focus',()=>{
 const {e,theme,document}=fixture();theme('modern');
 e['air-system-toggle'].emit('click');assert.equal(document.activeElement,e['account-toggle']);
 let prevented=false,stopped=false;e['air-modern-shell'].emit('keydown',{key:'Escape',preventDefault(){prevented=true},stopPropagation(){stopped=true}});
 assert.ok(prevented&&stopped);assert.equal(document.activeElement,e['air-system-toggle']);assert.equal(e['air-system-panel'].hidden,true);
 e['air-system-toggle'].emit('click');
 e['air-modern-shell'].emit('keydown',{key:'Tab',preventDefault(){assert.fail('Tab must remain native')}});
 e['air-modern-shell'].emit('focusout',{relatedTarget:e['account-toggle']});assert.equal(e['air-system-panel'].hidden,false);
 document.activeElement={};e['air-modern-shell'].emit('focusout',{relatedTarget:document.activeElement});assert.equal(e['air-system-panel'].hidden,true);
});
test('theme switch moves focus off disappearing chrome and closes nested account popup',()=>{
 const {e,theme,document}=fixture();document.activeElement=e['account-toggle'];theme('modern');
 assert.equal(document.activeElement,e['air-system-toggle']);e['air-system-toggle'].emit('click');
 e['account-dropdown'].hidden=false;theme('classic');assert.equal(document.activeElement,e['air-search-open']);
 assert.equal(e['account-dropdown'].hidden,true);assert.equal(e['account-toggle'].attrs['aria-expanded'],'false');
});
test('existing search/menu actions are delegated; app actions stay with existing Registry route; outside click closes',()=>{
 const {e,theme}=fixture();theme('modern');
 for(const systemAction of ['air-search-open','account-toggle']){
  e['air-system-toggle'].emit('click');e['air-system-panel'].emit('click',{target:{closest:()=>({dataset:{systemAction}})}});
  assert.equal(e[systemAction].clicks,1);assert.equal(e['air-system-panel'].hidden,true);
 }
 e['air-system-toggle'].emit('click');e['air-system-panel'].emit('click',{target:{closest:()=>({dataset:{app:'finder'}})}});
 assert.equal(e['air-system-panel'].hidden,true);
 e['air-system-toggle'].emit('click');e.document.emit('click',{target:{}});assert.equal(e['air-system-panel'].hidden,true);
});
