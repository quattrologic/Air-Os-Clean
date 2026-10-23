'use strict';
// Host-side per-account appearance settings. No renderer-supplied paths.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const DEFAULTS=Object.freeze({schemaVersion:1,wallpaper:'yosemite',customWallpaper:'',accent:'#75aeea',dockSize:48,dockTheme:'classic',dockPins:null,reduceGlass:false,reduceMotion:false,clock24:true});
const WALLPAPERS=new Set(['yosemite','coast','aurora','midnight']);
function validate(patch){
 if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new TypeError('Ungültige Einstellungen.');
 const result={};
 for(const [key,value] of Object.entries(patch)){
  if(!Object.prototype.hasOwnProperty.call(DEFAULTS,key)||key==='schemaVersion')throw new TypeError('Unbekannte Einstellung.');
  if(key==='wallpaper'&&(!WALLPAPERS.has(value)))throw new TypeError('Ungültiges Hintergrundbild.');
  if(key==='accent'&&(typeof value!=='string'||!/^#[0-9a-fA-F]{6}$/.test(value)))throw new TypeError('Ungültige Akzentfarbe.');
  if(key==='dockTheme'&&!['classic','modern'].includes(value))throw new TypeError('Ungültiges Dock-Theme.');
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
function createStore({root}){
 if(typeof root!=='function')throw new TypeError('root must be a function');
 function filename(username){
  if(typeof username!=='string'||!username||username.length>80)throw new TypeError('Ungültiger Benutzername.');
  const id=crypto.createHash('sha256').update(username.toLocaleLowerCase('en-US')).digest('hex');
  return path.join(root(),'profiles',id,'appearance-v1.json');
 }
 function load(username){
  let settings;try{settings=JSON.parse(fs.readFileSync(filename(username),'utf8'))}
  catch(error){if(error.code==='ENOENT')return {...DEFAULTS};throw error}
  const safe={};if(settings&&typeof settings==='object'&&!Array.isArray(settings)){
   for(const [key,value] of Object.entries(settings)){try{Object.assign(safe,validate({[key]:value}))}catch{}}
  }
  return {...DEFAULTS,...safe};
 }
 function write(username,settings){
  const file=filename(username);fs.mkdirSync(path.dirname(file),{recursive:true});
  const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
  try{fs.writeFileSync(temp,JSON.stringify(settings,null,2),{encoding:'utf8',mode:0o600});fs.renameSync(temp,file)}
  finally{try{fs.unlinkSync(temp)}catch(error){if(error.code!=='ENOENT')throw error}}
  return settings;
 }
 function update(username,patch){return write(username,{...load(username),...validate(patch)})}
 function reset(username){return write(username,{...DEFAULTS})}
 return Object.freeze({load,update,reset});
}
module.exports={createStore,validate,DEFAULTS};
