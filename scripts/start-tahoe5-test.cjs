'use strict';
// Non-shipping consent-response fixture. Actual IPC/auth/policy/navigation remain production code.
if(process.env.AIR_GUI_TEST_ISOLATED!=='1'||!process.argv.includes('--tahoe5-consent-fixture'))throw Error('Explicit isolated consent fixture required');
const electron=require('electron'),Module=require('node:module'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const arg=process.argv.find(s=>s.startsWith('--user-data-dir='));if(!arg)throw Error('Temporary profile required');const profile=path.resolve(arg.slice(16));
if(path.dirname(profile)!==path.resolve(os.tmpdir())||!path.basename(profile).startsWith('air-r1-gui-'))throw Error('Refusing non-fixture profile');
const root=path.resolve(__dirname,'..'),entry=path.join(root,'main.cjs'),load=Module._load;electron.app.setAppPath(root);electron.app.setName(require('../package.json').name);
const dialog=new Proxy(electron.dialog,{get:(target,key)=>key==='showMessageBox'?async(win,options)=>{if(options.title!=='Öffentliche Medienvorschau'||fs.readFileSync(path.join(profile,'.tahoe5-fixture'),'utf8')!=='PUBLIC TAHOE5 FIXTURE')throw Error('Refusing non-public consent fixture');return {response:1};}:Reflect.get(target,key)});
Module._load=function(request,parent,isMain){const result=load.apply(this,arguments);return request==='electron'&&parent?.filename===entry?new Proxy(result,{get:(target,key)=>key==='dialog'?dialog:Reflect.get(target,key)}):result;};
require(entry);
