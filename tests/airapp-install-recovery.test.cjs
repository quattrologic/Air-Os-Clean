'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createManager}=require('../src/main/airapp-manager.cjs');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'airapp-install-recovery-'));
 const app=path.join(root,'host'),data=path.join(root,'data');
 const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'../store/catalog/demo-timer.airapp'),'utf8'));
 // Independent test key and valid signed package for the actual test platform.
 const keys=crypto.generateKeyPairSync('ed25519');
 pkg.manifest.platforms=[process.platform];
 pkg.signature=crypto.sign(null,Buffer.from(JSON.stringify(pkg.manifest)),keys.privateKey).toString('base64');
 fs.mkdirSync(path.join(app,'store/catalog'),{recursive:true});
 fs.writeFileSync(path.join(app,'store/catalog/demo-timer.airapp'),JSON.stringify(pkg));
 const manager=()=>createManager({root:()=>data,appPath:()=>app,publicKeys:{demo:keys.publicKey}});
 const id=pkg.manifest.id;
 manager().install('Alice',id);
 const folder=manager().installedFolder('Alice',id),index=path.join(path.dirname(folder),'installed-v1.json');
 // Exact durable state after package rename but before first index commit.
 fs.unlinkSync(index);
 return {manager,id,folder,index,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('retry adopts a verified orphan installation without replacing its files',()=>{
 const f=fixture();try{
  fs.writeFileSync(path.join(f.folder,'user-data.txt'),'preserve me');
  assert.deepEqual(f.manager().installed('Alice'),[]);
  assert.equal(f.manager().install('Alice',f.id).alreadyInstalled,false);
  assert.equal(f.manager().installedFolder('Alice',f.id),f.folder);
  assert.equal(fs.readFileSync(path.join(f.folder,'user-data.txt'),'utf8'),'preserve me');
  assert.equal(f.manager().install('Alice',f.id).alreadyInstalled,true);
  assert.deepEqual(f.manager().installed('Bob'),[]);
 }finally{f.cleanup()}
});
for(const damage of ['tamper','missing']){
 test(`retry rejects ${damage} orphan assets without registering or deleting them`,()=>{
  const f=fixture();try{
   const asset=path.join(f.folder,'timer.js');
   if(damage==='tamper')fs.appendFileSync(asset,'// changed');else fs.unlinkSync(asset);
   const before=fs.readFileSync(path.join(f.folder,'index.html'));
   assert.throws(()=>f.manager().install('Alice',f.id));
   assert.deepEqual(f.manager().installed('Alice'),[]);
   assert.deepEqual(fs.readFileSync(path.join(f.folder,'index.html')),before);
   assert.equal(fs.existsSync(asset),damage==='tamper');
  }finally{f.cleanup()}
 });
}
test('failed recovery index write preserves orphan files for another retry',t=>{
 const f=fixture();try{
  const rename=fs.renameSync;
  t.mock.method(fs,'renameSync',(source,dest)=>{
   if(dest===f.index)throw new Error('Simulated index failure');
   return rename(source,dest);
  });
  assert.throws(()=>f.manager().install('Alice',f.id),/Simulated index failure/);
  assert.ok(fs.existsSync(path.join(f.folder,'timer.js')));
  assert.deepEqual(f.manager().installed('Alice'),[]);
  t.mock.restoreAll();
  f.manager().install('Alice',f.id);
  assert.equal(f.manager().installedFolder('Alice',f.id),f.folder);
 }finally{t.mock.restoreAll();f.cleanup()}
});
test('retry rejects a symlinked orphan folder without touching its target',t=>{
 const f=fixture();try{
  const saved=f.folder+'.saved';fs.renameSync(f.folder,saved);
  try{fs.symlinkSync(saved,f.folder,process.platform==='win32'?'junction':'dir')}
  catch(error){if(error.code==='EPERM'){t.skip('Symlinks unavailable');return}throw error}
  assert.throws(()=>f.manager().install('Alice',f.id),/Invalid installation directory/);
  assert.deepEqual(f.manager().installed('Alice'),[]);
  assert.ok(fs.existsSync(path.join(saved,'timer.js')));
  assert.ok(fs.lstatSync(f.folder).isSymbolicLink());
 }finally{f.cleanup()}
});

// Minimal DOM surface used by the real Store and Launchpad modules. This is
// a component integration test, not an Electron layout or IPC security test.
class Element {
 constructor(tag='div',className=''){
  this.tag=tag;this.className=className;this.children=[];this.dataset={};
  this.listeners=new Map();this.value='';this.isConnected=true;
  this.classList={toggle(){}};
 }
 set textContent(value){this.text=String(value);this.children=[]}
 get textContent(){return (this.text||'')+this.children.map(c=>c.textContent).join('')}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.text='';this.children=[...nodes]}
 addEventListener(type,fn){this.listeners.set(type,fn)}
 async click(){assert.equal(this.disabled,false);await this.listeners.get('click')()}
 querySelectorAll(selector){
  const matches=node=>selector.startsWith('.')?node.className.split(' ').includes(selector.slice(1)):node.tag===selector;
  return this.children.flatMap(child=>[...(matches(child)?[child]:[]),...child.querySelectorAll(selector)]);
 }
 querySelector(selector){return this.querySelectorAll(selector)[0]||null}
}
function renderer(manager){
 const vm=require('node:vm');
 const launchWin=new Element(),launchRoot=new Element('section','air-launchpad');
 launchWin.append(launchRoot);
 for(const name of ['alp-search','alp-categories','alp-grid','alp-count'])launchRoot.append(new Element('div',name));
 const storeWin=new Element(),storeRoot=new Element('section','air-store');storeWin.append(storeRoot);
 storeRoot.append(new Element('div','as-list'),new Element('p','as-status'));
 const errors=[];
 const context=vm.createContext({window:{airOS:{appStore:{
  catalog:async()=>manager.catalog(),installed:async()=>manager.installed('Alice'),
  install:async id=>manager.install('Alice',id)
 }}},document:{createElement:tag=>new Element(tag),querySelector:()=>null},vectorIcon:{},console:{error:e=>errors.push(e),warn:e=>errors.push(e)}});
 // Execute production sources unchanged, including their shared registry and
 // subscription wiring. No duplicate registry or handwritten refresh logic.
 for(const file of ['src/core/app-registry.js','air-launchpad.js','air-app-store.js']){
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
 }
 context.window.airLaunchpad.mount(launchWin);
 context.window.airAppStore.mount(storeWin);
 return {registry:context.window.airAppRegistry,grid:launchRoot.querySelector('.alp-grid'),
  list:storeRoot.querySelector('.as-list'),status:storeRoot.querySelector('.as-status'),errors};
}
function fileSnapshot(folder){
 const result={};
 for(const item of fs.readdirSync(folder,{withFileTypes:true})){
  const file=path.join(folder,item.name);
  result[item.name]=item.isDirectory()?fileSnapshot(file):fs.readFileSync(file).toString('hex');
 }
 return result;
}
for(const outcome of ['success','tampered','index-failure']){
 test(`Store recovery ${outcome} updates the shared Registry and mounted Launchpad safely`,async t=>{
  const f=fixture();try{
   const manager=f.manager();
   manager.install('Bob',f.id);
   const bobFolder=manager.installedFolder('Bob',f.id);
   fs.writeFileSync(path.join(bobFolder,'user-data.txt'),'Bob saved data');
   fs.writeFileSync(path.join(f.folder,'user-data.txt'),'Alice saved data');
   if(outcome==='tampered')fs.appendFileSync(path.join(f.folder,'timer.js'),'// invalid');
   const aliceBefore=fileSnapshot(f.folder),bobBefore=fileSnapshot(path.dirname(bobFolder));
   const ui=renderer(manager);
   // Initial Store refresh has only resolved IPC promises, no polling needed.
   await new Promise(resolve=>setImmediate(resolve));
   assert.deepEqual(ui.errors,[]);
   const existing=JSON.stringify(ui.registry.list());
   const tiles=()=>ui.grid.children.map(tile=>({id:tile.dataset.app,text:tile.textContent}));
   const oldTiles=tiles();
   assert.ok(oldTiles.some(tile=>tile.id==='finder'));
   assert.equal(ui.registry.get(f.id),null);
   assert.equal(oldTiles.some(tile=>tile.id===f.id),false);
   const install=ui.list.querySelectorAll('button').find(b=>b.textContent==='Installieren');
   assert.ok(install,'real Store renders the recovery action');
   if(outcome==='index-failure'){
    const rename=fs.renameSync;
    t.mock.method(fs,'renameSync',(source,dest)=>{
     if(dest===f.index)throw new Error('Simulated index failure');
     return rename(source,dest);
    });
   }
   await install.click(); // Includes production handler's finally/refresh.
   if(outcome==='success'){
    assert.equal(manager.installed('Alice').length,1);
    assert.equal(ui.registry.get(f.id).origin,'store');
    const recovered=tiles().filter(tile=>tile.id===f.id);
    assert.equal(recovered.length,1);
    assert.ok(recovered[0].text.includes(ui.registry.get(f.id).name));
    assert.ok(ui.list.querySelectorAll('button').some(b=>b.textContent==='Starten'));
    assert.equal(ui.status.textContent,'Aktion erfolgreich.');
    assert.deepEqual(ui.errors,[]);
   }else{
    assert.equal(manager.installed('Alice').length,0);
    assert.equal(ui.registry.get(f.id),null);
    assert.equal(tiles().some(tile=>tile.id===f.id),false);
    assert.equal(ui.errors.length,1);
    assert.match(ui.status.textContent,outcome==='tampered'?/integrity/:/Simulated index failure/);
    assert.ok(ui.list.querySelectorAll('button').some(b=>b.textContent==='Installieren'));
   }
   assert.equal(JSON.stringify(ui.registry.list().filter(app=>app.id!==f.id)),existing);
   assert.deepEqual(tiles().filter(tile=>tile.id!==f.id),oldTiles);
   assert.deepEqual(fileSnapshot(f.folder),aliceBefore);
   assert.deepEqual(fileSnapshot(path.dirname(bobFolder)),bobBefore);
  }finally{t.mock.restoreAll();f.cleanup()}
 });
}
