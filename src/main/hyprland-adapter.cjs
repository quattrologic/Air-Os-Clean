'use strict';
// Optional, read-only, consent-gated. No titles, app IDs, paths or dispatch commands.
const {execFile}=require('node:child_process');
const fs=require('node:fs'),net=require('node:net');
function available(platform,env){return platform==='linux'&&/hyprland/i.test(env.XDG_CURRENT_DESKTOP||'')&&/^[a-zA-Z0-9_.-]{1,160}$/.test(env.HYPRLAND_INSTANCE_SIGNATURE||'');}
function create({platform=process.platform,env=process.env,run=execFile,exists=fs.existsSync,stat=fs.lstatSync,connect=net.createConnection,uid=process.getuid?.()}={}){
 const supported=available(platform,env)&&exists('/usr/bin/hyprctl');let watching=null;
 function stop(){const item=watching;watching=null;item?.stop();}
 async function read(authorized=false){
  if(!supported)throw Error('Hyprland nicht verfügbar.');if(authorized!==true)throw Error('Explizite Freigabe erforderlich.');
  const result=await new Promise((resolve,reject)=>run('/usr/bin/hyprctl',['-j','activeworkspace'],{timeout:1500,maxBuffer:65536,windowsHide:true,env:{...env,LANG:'C'}},(error,out)=>error?reject(Error('Hyprland-Abfrage fehlgeschlagen.')):resolve(out)));
  let data;try{data=JSON.parse(result);}catch{throw Error('Ungültiger Hyprland-Status.');}
  if(!data||!Number.isInteger(data.id)||data.id<1||data.id>100000||!Number.isInteger(data.windows)||data.windows<0||data.windows>100000)throw Error('Ungültiger Hyprland-Status.');
  return{workspace:data.id,windowCount:data.windows,readOnly:true,nativeAcceptance:false};
 }

 function watch(authorized=false,onChange=()=>{}){
  if(!supported)throw Error('Hyprland nicht verfügbar.');if(authorized!==true)throw Error('Explizite Freigabe erforderlich.');if(typeof onChange!=='function')throw Error('Ungültiger Listener.');
  stop();if(!Number.isInteger(uid)||uid<0)throw Error('Sicherer Runtime-Pfad nicht verfügbar.');
  const runtime='/run/user/'+uid;if(env.XDG_RUNTIME_DIR!==runtime)throw Error('Privater Hyprland-Runtime-Pfad erforderlich.');
  const base=runtime+'/hypr/'+env.HYPRLAND_INSTANCE_SIGNATURE,file=base+'/.socket2.sock';
  for(const dir of [runtime,runtime+'/hypr',base]){const st=stat(dir);if(!st.isDirectory()||st.isSymbolicLink()||st.uid!==uid||(st.mode&0o022)!==0)throw Error('Unsicherer Hyprland-Runtime-Pfad.');}
  const endpoint=stat(file);if(!endpoint.isSocket()||endpoint.isSymbolicLink()||endpoint.uid!==uid)throw Error('Ungültiger Hyprland-Socket.');
  let socket,buffer='',closed=false,count=0,started=Date.now(),timer;
  const finish=()=>{if(closed)return;closed=true;clearTimeout(timer);socket?.removeAllListeners();socket?.destroy();if(watching?.stop===finish)watching=null;};
  const emit=value=>{if(!closed)try{onChange({...value,readOnly:true,nativeAcceptance:false});}catch{finish();}};
  try{socket=connect({path:file});watching={stop:finish};timer=setTimeout(()=>{emit({type:'disconnected'});finish();},1500);timer.unref?.();
   socket.on('connect',()=>{clearTimeout(timer);emit({type:'connected'});});
   socket.on('data',chunk=>{
    if(closed)return;if(chunk.length>65536||Buffer.byteLength(buffer)+chunk.length>65536){finish();return;}
    buffer+=chunk.toString('utf8');let at;
    while((at=buffer.indexOf('\n'))!==-1){const line=buffer.slice(0,at);buffer=buffer.slice(at+1);if(line.length>4096){finish();return;}
     const now=Date.now();if(now-started>=1000){count=0;started=now;}if(++count>200){finish();return;}
     const separator=line.indexOf('>>');if(separator<0)continue;const kind=line.slice(0,separator),body=line.slice(separator+2);
     if(kind==='workspacev2'){const token=body.split(',')[0];if(/^[1-9][0-9]{0,5}$/.test(token)&&+token<=100000)emit({type:'workspace',workspace:+token});}
     else if(['monitoradded','monitorremoved','monitoraddedv2','monitorremovedv2'].includes(kind))emit({type:'monitors-changed'});
     // All window/title/app events are discarded; no commands are written to this socket.
    }if(buffer.length>4096)finish();
   });
   for(const name of ['end','error','close'])socket.on(name,()=>{emit({type:'disconnected'});finish();});
  }catch{finish();throw Error('Hyprland-Ereignisse nicht verfügbar.');}
  return{watching:true,readOnly:true,nativeAcceptance:false};
 }
 return Object.freeze({supported,read,watch,stop});
}
module.exports={create,available};
