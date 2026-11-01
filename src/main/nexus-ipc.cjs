'use strict';
// Narrow authenticated commands; no renderer-controlled filesystem or shell API.
module.exports=function register({ipcMain,app,dialog,nativeImage,clipboard,window:windowFor,authorize,user,preferences,workspace,destination}){
 const fs=require('node:fs'),path=require('node:path'),shelf=require('./nexus-shelf.cjs').create({tempRoot:()=>app.getPath('temp'),nativeImage,clipboard});
 const send=(channel,value)=>{const w=windowFor();if(w&&!w.isDestroyed())w.webContents.send(channel,value);};
 const timer=require('./nexus-timer.cjs').create({load:()=>user()?preferences.load(user().username).nexusTimer:null,save:value=>preferences.update(user().username,{nexusTimer:value}),emit:value=>send('air-os:nexus:timer-changed',value)});
 const changed=owner=>send('air-os:nexus:shelf-changed',{owner});
 async function request(event,action,data,owner){authorize(event,owner);if(typeof action!=='string')throw Error('Ungültige Ablageaktion.');
 const check=()=>authorize(event,owner);
 if(action==='list')return {...shelf.list(),ownCopies:preferences.load(user().username).nexusOwnCopies===true};
 if(action==='consent'){if(typeof data!=='boolean')throw Error('Ungültige Freigabe.');if(data){const r=await dialog.showMessageBox(windowFor(),{type:'question',title:'Air-OS-Kopieraktionen merken?',message:'Nur ausdrücklich in Air-OS kopierte Texte automatisch in der temporären Ablage behalten?',detail:'Keine globale Clipboard-Überwachung. Inhalte anderer Apps nur über die einzelne Übernehmen-Aktion. Private Informationen nur bewusst übernehmen. Löschung bei Abmeldung; keine Cloudübertragung.',buttons:['Abbrechen','Air-OS-Kopieraktionen erlauben'],defaultId:0,cancelId:0,noLink:true});check();if(r.response!==1)return {cancelled:true};}preferences.update(user().username,{nexusOwnCopies:data});if(!data)await shelf.forgetClipboard();check();changed(owner);return {enabled:data};}
 return shelf.serial(async epoch=>{check();let result;
 switch(action){
 case 'text':result=shelf.text(data);break;
 case 'capture':result=shelf.capture();break;
 case 'pick':{const response=await dialog.showOpenDialog(windowFor(),{title:'Dateien ausdrücklich zur temporären Ablage hinzufügen',properties:['openFile','multiSelections']});check();if(response.canceled)return {cancelled:true};if(response.filePaths.length>32)throw Error('Maximal 32 Dateien pro Auswahl.');result=[];for(const filename of response.filePaths){check();result.push(await shelf.file(filename,epoch));}break;}
 case 'drop':{if(!Array.isArray(data)||data.length<1||data.length>32||data.some(p=>typeof p!=='string'||p.length>32768))throw Error('Ungültige Dateiauswahl.');const r=await dialog.showMessageBox(windowFor(),{type:'question',title:'Dateien ablegen',message:data.length+' ausgewählte Dateien in die temporäre Air-OS-Ablage kopieren?',detail:'Originaldateien bleiben unverändert. Maximal 16 MB je Datei, insgesamt 64 MB. Die Ablage wird bei Abmeldung gelöscht.',buttons:['Abbrechen','Kopien ablegen'],defaultId:0,cancelId:0,noLink:true});check();if(r.response!==1)return {cancelled:true};result=[];for(const filename of data){check();result.push(await shelf.file(filename,epoch));}break;}
 case 'folder':{const response=await dialog.showOpenDialog(windowFor(),{title:'Ordner als temporären Dateistapel kopieren (nur direkte Dateien)',properties:['openDirectory']});check();if(response.canceled)return {cancelled:true};const folder=response.filePaths[0],entries=await fs.promises.readdir(folder,{withFileTypes:true});check();const files=entries.filter(e=>e.isFile()&&!e.name.startsWith('.'));if(files.length<2||files.length>32)throw Error('Ordnerstapel benötigt 2–32 direkte Dateien; Unterordner werden nicht importiert.');const ids=[];for(const f of files){check();ids.push((await shelf.file(path.join(folder,f.name),epoch)).id);}result=shelf.group([...new Set(ids)],path.basename(folder));break;}
 case 'export':{if(!data||typeof data.id!=='string'||typeof data.folder!=='string')throw Error('Ungültiges Finder-Ziel.');const value=await shelf.contents(data.id);check();if(!value.name||/[\\/:\0]/.test(value.name)||value.name==='.'||value.name==='..'||value.name.length>200)throw Error('Für den Dateiexport bitte einen einfachen Dateinamen verwenden.');const relative=(data.folder?data.folder+'/':'')+value.name;const target=destination(relative);require('./file-ops.cjs').createBytesExclusive(target,value.bytes);check();result={ok:true,path:relative};break;}
 case 'workspace':{if(typeof data!=='string')throw Error('Ungültige Finder-Datei.');const source=workspace(data);result=await shelf.file(source,epoch);break;}
 case 'group':if(!data||Object.keys(data).some(k=>!['ids','name'].includes(k)))throw Error('Ungültiger Stapel.');result=shelf.group(data.ids,data.name);break;
 case 'children':result=shelf.children(data);break;
 case 'take':if(!data||typeof data.bundle!=='string'||typeof data.id!=='string')throw Error('Ungültiges Element.');result=shelf.take(data.bundle,data.id);break;
 case 'rename':result=shelf.rename(data?.id,data?.name);break;
 case 'favorite':result=shelf.favorite(data?.id,data?.value);break;
 case 'remove':result=await shelf.remove(data);break;
 case 'copy':result=shelf.copy(data);break;
 case 'clear':result=await shelf.clear();break;
 default:throw Error('Nicht unterstützte Ablageaktion.');
 }check();changed(owner);return result;});
 }
 ipcMain.handle('air-os:nexus:shelf',request);
 ipcMain.on('air-os:nexus:drag',(event,id,owner)=>{try{authorize(event,owner);const files=shelf.files(id);if(!files.length||files.length>32)return;event.sender.startDrag({files,file:files[0],icon:nativeImage.createFromPath(path.join(app.getAppPath(),'assets/brand/png/app-64.png'))});}catch{send('air-os:nexus:shelf-changed',{owner,error:'Herausziehen nicht verfügbar. Die Ablage bleibt erhalten.'});}});
 ipcMain.handle('air-os:nexus:timer',(event,action,data,owner)=>{authorize(event,owner);return action==='read'?timer.snapshot():timer.act(action,data);});
 return {begin:owner=>timer.begin(owner),end:()=>{timer.stop();void shelf.clear().catch(()=>{});},ownCopy:(text,owner)=>{if(user()?.preferenceSession!==owner)return;if(preferences.load(user().username).nexusOwnCopies===true){try{shelf.text(text,'own-copy');changed(owner);}catch{}}},shelf};
};
