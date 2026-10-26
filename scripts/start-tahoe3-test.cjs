'use strict';
// Non-shipping test host: substitute only native picker selection, never file IO or IPC authorization.
if(process.env.AIR_GUI_TEST_ISOLATED!=='1'||!process.argv.includes('--tahoe-test-picker'))throw Error('Explicit isolated picker fixture required');
const electron=require('electron'),Module=require('node:module'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const arg=process.argv.find(s=>s.startsWith('--user-data-dir='));if(!arg)throw Error('Temporary profile required');
const profile=path.resolve(arg.slice('--user-data-dir='.length));
if(path.dirname(profile)!==path.resolve(os.tmpdir())||!path.basename(profile).startsWith('air-r1-gui-'))throw Error('Refusing non-fixture profile');
const root=path.resolve(__dirname,'..'),entry=path.join(root,'main.cjs'),load=Module._load;
electron.app.setAppPath(root);electron.app.setName(require('../package.json').name);
const picker=new Proxy(electron.dialog,{get:(target,key)=>key==='showOpenDialog'?async()=>{
 if(fs.readFileSync(path.join(profile,'.tahoe-fixture'),'utf8')!=='PUBLIC TAHOE3 FIXTURE')throw Error('Fixture marker missing');
 const directory=path.join(profile,'fixtures');if(fs.realpathSync(directory)!==directory)throw Error('Refusing redirected fixture');
 return {canceled:false,filePaths:[directory]};
}:Reflect.get(target,key)});
Module._load=function(request,parent,isMain){const value=load.apply(this,arguments);return request==='electron'&&parent?.filename===entry?new Proxy(value,{get:(target,key)=>key==='dialog'?picker:Reflect.get(target,key)}):value;};
require(entry);
