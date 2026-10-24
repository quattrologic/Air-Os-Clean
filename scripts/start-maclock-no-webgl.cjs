'use strict';
// Test-only Electron entry point. Use an isolated userData/config directory.
// Native WebGL is disabled at BrowserWindow creation, never mocked in a renderer.
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Isolated GUI profile required');
const electron=require('electron'),Module=require('node:module'),path=require('node:path');
const root=path.resolve(__dirname,'..'),entry=path.join(root,'main.cjs'),load=Module._load;
electron.app.setAppPath(root);electron.app.setName(require('../package.json').name);
const TestWindow=class extends electron.BrowserWindow{
 constructor(options){super({...options,webPreferences:{...options.webPreferences,webgl:false}})}
};
Module._load=function(request,parent,isMain){
 const value=load.apply(this,arguments);
 if(request==='electron'&&parent?.filename===entry)return new Proxy(value,{get:(target,key)=>key==='BrowserWindow'?TestWindow:Reflect.get(target,key)});
 return value;
};
require(entry);
