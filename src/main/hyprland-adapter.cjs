'use strict';
// Optional, read-only, consent-gated. No titles, app IDs, paths or dispatch commands.
const {execFile}=require('node:child_process');
function available(platform,env){return platform==='linux'&&/hyprland/i.test(env.XDG_CURRENT_DESKTOP||'')&&/^[a-zA-Z0-9_.-]{1,160}$/.test(env.HYPRLAND_INSTANCE_SIGNATURE||'');}
function create({platform=process.platform,env=process.env,run=execFile,exists=require('node:fs').existsSync}={}){
 const supported=available(platform,env)&&exists('/usr/bin/hyprctl');
 async function read(authorized=false){
  if(!supported)throw Error('Hyprland nicht verfügbar.');if(authorized!==true)throw Error('Explizite Freigabe erforderlich.');
  const result=await new Promise((resolve,reject)=>run('/usr/bin/hyprctl',['-j','activeworkspace'],{timeout:1500,maxBuffer:65536,windowsHide:true,env:{...env,LANG:'C'}},(error,out)=>error?reject(Error('Hyprland-Abfrage fehlgeschlagen.')):resolve(out)));
  let data;try{data=JSON.parse(result);}catch{throw Error('Ungültiger Hyprland-Status.');}
  if(!data||!Number.isInteger(data.id)||data.id<1||data.id>100000||!Number.isInteger(data.windows)||data.windows<0||data.windows>100000)throw Error('Ungültiger Hyprland-Status.');
  return{workspace:data.id,windowCount:data.windows,readOnly:true,nativeAcceptance:false};
 }
 return Object.freeze({supported,read});
}
module.exports={create,available};
