'use strict';
// Host-side per-account appearance settings. No renderer-supplied paths.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const DEFAULTS=Object.freeze({schemaVersion:1,wallpaper:'clouds',customWallpaper:'',accent:'#75aeea',dockSize:48,dockTheme:'classic',desktopTheme:'classic',dockPins:null,reduceGlass:false,reduceMotion:false,clock24:true,desktopWidgets:false,widgetPositions:{},controlOrder:[0,1,2,3],controlTiles:null,focusMode:false,todaySize:'compact',widgetSet:null,widgetLayout:{},widgetImage:'',windowLayout:{}});
const WALLPAPERS=new Set(['clouds','yosemite','coast','aurora','midnight']);
function validate(patch){
 if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new TypeError('Ungültige Einstellungen.');
 const result={};
 for(const [key,value] of Object.entries(patch)){
  if(!Object.prototype.hasOwnProperty.call(DEFAULTS,key)||key==='schemaVersion')throw new TypeError('Unbekannte Einstellung.');
  if(key==='controlTiles'){if(value!==null&&(!Array.isArray(value)||value.length>12||new Set(value).size!==value.length||value.some(id=>!require('../core/macshell-math.js').ccCatalog.some(d=>d.id===id))))throw new TypeError('Ungültiger Kachelkatalog.');result[key]=value===null?null:[...value];continue;}
  if(key==='windowLayout'){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>60)throw new TypeError('Ungültiges Fensterlayout.');const clean={};for(const [id,b]of Object.entries(value)){if(!require('../core/app-registry.js').get(id)||!b||Object.keys(b).some(k=>!['left','top','width','height','mode','restore'].includes(k))||!['normal','maximized','left','right'].includes(b.mode))throw new TypeError('Ungültiges Fensterlayout.');const box=n=>n&&Object.keys(n).length===4&&['left','top','width','height'].every(k=>Number.isFinite(n[k])&&n[k]>=0&&n[k]<=10000)&&n.width>0&&n.height>0;if(!box({left:b.left,top:b.top,width:b.width,height:b.height})||(b.restore&&!box(b.restore)))throw new TypeError('Ungültige Fenstergrenzen.');clean[id]={left:b.left,top:b.top,width:b.width,height:b.height,mode:b.mode,...(b.restore?{restore:{...b.restore}}:{})};}result[key]=clean;continue;}
  if(key==='widgetSet'){if(value!==null&&(!Array.isArray(value)||value.length>7||new Set(value).size!==value.length||value.some(id=>!require('../core/desktop-widgets.js').ids.includes(id))))throw new TypeError('Ungültige Widgets.');result[key]=value===null?null:[...value];continue;}
  if(key==='widgetLayout'){if(!value||typeof value!=='object'||Array.isArray(value))throw new TypeError('Ungültiges Widgetlayout.');const clean={};for(const [id,layout]of Object.entries(value)){if(!require('../core/desktop-widgets.js').ids.includes(id)||!layout||Object.keys(layout).some(k=>!['size','style'].includes(k))||!['small','medium','large'].includes(layout.size)||!['digital','dial'].includes(layout.style))throw new TypeError('Ungültiges Widgetlayout.');clean[id]={size:layout.size,style:layout.style};}result[key]=clean;continue;}
  if(key==='widgetImage'&&(typeof value!=='string'||value.length>3*1024*1024||(value!==''&&!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))))throw new TypeError('Ungültiges Widgetbild.');
  if(key==='todaySize'&&!['compact','expanded'].includes(value))throw new TypeError('Ungültige Widgetgröße.');
  if(key==='focusMode'&&typeof value!=='boolean')throw new TypeError('Ungültiger Fokusmodus.');
  if(key==='desktopWidgets'&&typeof value!=='boolean')throw new TypeError('Ungültige Widgets.');
  if(key==='controlOrder'){
   if(!Array.isArray(value)||value.length!==4||new Set(value).size!==4||value.some(i=>!Number.isInteger(i)||i<0||i>3))throw new TypeError('Ungültige Kachelreihenfolge.');
   result[key]=[...value];continue;
  }
  if(key==='widgetPositions'){
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!require('../core/desktop-widgets.js').ids.includes(k)))throw new TypeError('Ungültige Widgetposition.');
   const positions={};for(const [k,v]of Object.entries(value)){if(!v||Object.keys(v).length!==2||!Number.isFinite(v.x)||!Number.isFinite(v.y)||v.x<0||v.y<0||v.x>10000||v.y>10000)throw new TypeError('Ungültige Widgetposition.');positions[k]={x:v.x,y:v.y};}result[key]=positions;continue;
  }
  if(key==='wallpaper'&&(!WALLPAPERS.has(value)))throw new TypeError('Ungültiges Hintergrundbild.');
  if(key==='accent'&&(typeof value!=='string'||!/^#[0-9a-fA-F]{6}$/.test(value)))throw new TypeError('Ungültige Akzentfarbe.');
  if(key==='dockTheme'&&!['classic','modern'].includes(value))throw new TypeError('Ungültiges Dock-Theme.');
  if(key==='desktopTheme'&&!['classic','modern'].includes(value))throw new TypeError('Ungültiges Desktop-Design.');
  if(key==='dockPins'){
   // References only: null inherits the default dock; [] explicitly pins nothing.
   // Existence, metadata and launch authorization remain with Registry/Main services.
   if(value!==null){
    if(!Array.isArray(value)||value.length>64)throw new TypeError('Ungültige Dock-Pins.');
    const seen=new Set();
    for(const id of value){
     if(typeof id!=='string'||(!/^[a-z][a-z0-9-]{0,63}$/.test(id)&&
        !(id.length<=90&&/^com\.[a-z0-9-]+(?:\.[a-z0-9-]+){1,8}$/.test(id)))||seen.has(id))
      throw new TypeError('Ungültige Dock-Pins.');
     seen.add(id);
    }
   }
   result[key]=value===null?null:[...value];
   continue;
  }
  if(key==='dockSize'&&(!Number.isInteger(value)||value<36||value>64))throw new TypeError('Ungültige Dock-Größe.');
  if(['reduceGlass','reduceMotion','clock24'].includes(key)&&typeof value!=='boolean')throw new TypeError('Ungültiger Schalter.');
  if(key==='customWallpaper'&&(typeof value!=='string'||(value.length>7*1024*1024)|| (value!==''&&!/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))))throw new TypeError('Ungültiges Hintergrundbild.');
  result[key]=value;
 }
 return result;
}
function createStore({root,isNewProfile=()=>false}){
 if(typeof root!=='function')throw new TypeError('root must be a function');
 if(typeof isNewProfile!=='function')throw new TypeError('Profile classifier must be a function');
 // Only Main can classify accounts explicitly created after this feature.
 // Missing files, dates and renderer input are not evidence of a new profile.
 function defaultsFor(username){return {...DEFAULTS,...(isNewProfile(username)===true?{desktopTheme:'modern',dockTheme:'modern'}:{})}}
 function filename(username){
  if(typeof username!=='string'||!username||username.length>80)throw new TypeError('Ungültiger Benutzername.');
  const id=crypto.createHash('sha256').update(username.toLocaleLowerCase('en-US')).digest('hex');
  return path.join(root(),'profiles',id,'appearance-v1.json');
 }
 function load(username){
  let settings;try{settings=JSON.parse(fs.readFileSync(filename(username),'utf8'))}
  catch(error){if(error.code==='ENOENT')return defaultsFor(username);throw error}
  const safe={};if(settings&&typeof settings==='object'&&!Array.isArray(settings)){
   for(const [key,value] of Object.entries(settings)){try{Object.assign(safe,validate({[key]:value}))}catch{}}
  }
  return {...DEFAULTS,...safe};
 }
 function write(username,settings){
  const file=filename(username);fs.mkdirSync(path.dirname(file),{recursive:true});
  const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
  // Windows can follow a dangling reparse point even for an exclusive open.
  // existsSync follows links, so inspect the directory entry itself first.
  let occupied=false;
  try{fs.lstatSync(temp);occupied=true}catch(error){if(error.code!=='ENOENT')throw error}
  if(occupied)throw Object.assign(new Error('Temporärer Einstellungspfad bereits vorhanden. Bitte erneut versuchen.'),{code:'EEXIST'});
  // Reserve before entering cleanup: a collision belongs to someone else.
  // Write through the exclusive descriptor so an existing symlink is not followed.
  const descriptor=fs.openSync(temp,'wx',0o600);
  try{
   try{fs.writeFileSync(descriptor,JSON.stringify(settings,null,2),{encoding:'utf8'})}
   finally{fs.closeSync(descriptor)}
   fs.renameSync(temp,file);
  }
  finally{try{fs.unlinkSync(temp)}catch(error){if(error.code!=='ENOENT')throw error}}
  return settings;
 }
 function update(username,patch){return write(username,{...load(username),...validate(patch)})}
 function reset(username){return write(username,defaultsFor(username))}
 return Object.freeze({load,update,reset});
}
module.exports={createStore,validate,DEFAULTS};
