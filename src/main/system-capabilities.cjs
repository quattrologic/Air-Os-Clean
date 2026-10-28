'use strict';
// Strict capabilities. All renderer requests are gated again in main.cjs.
const settings=Object.freeze({
 win32:Object.freeze({network:'ms-settings:network-status',bluetooth:'ms-settings:bluetooth',display:'ms-settings:display',sound:'ms-settings:sound',power:'ms-settings:powersleep'}),
 darwin:Object.freeze({network:'x-apple.systempreferences:com.apple.Network-Settings.extension',bluetooth:'x-apple.systempreferences:com.apple.BluetoothSettings',display:'x-apple.systempreferences:com.apple.Displays-Settings.extension',sound:'x-apple.systempreferences:com.apple.Sound-Settings.extension',power:'x-apple.systempreferences:com.apple.Battery-Settings.extension'})
});
function fitWindow(bounds,areas){
 if(!areas.length||areas.some(a=>bounds.x+Math.min(bounds.width,64)>a.x&&bounds.x<a.x+a.width-32&&bounds.y>=a.y&&bounds.y<a.y+a.height-32))return null;
 const a=areas[0],width=Math.min(bounds.width,a.width),height=Math.min(bounds.height,a.height);
 return{x:Math.max(a.x,Math.min(bounds.x,a.x+a.width-width)),y:Math.max(a.y,Math.min(bounds.y,a.y+a.height-height)),width,height};
}
function create({platform,screen,powerMonitor,net,shell,clipboard,onChange=()=>{},hyprland}){
 let suspended=false,disposed=false,revision=0;const listeners=[];
 const bind=(emitter,name,fn)=>{emitter.on(name,fn);listeners.push(()=>emitter.removeListener(name,fn));};
 function displays(){try{return screen.getAllDisplays().slice(0,16).map(d=>({bounds:{x:d.bounds.x,y:d.bounds.y,width:d.bounds.width,height:d.bounds.height},workArea:{x:d.workArea.x,y:d.workArea.y,width:d.workArea.width,height:d.workArea.height},scaleFactor:d.scaleFactor,rotation:d.rotation}));}catch{return[];}}
 function snapshot(){if(disposed)throw Error('Systemdienst beendet.');let battery=null,online=null;try{battery=!!powerMonitor.isOnBatteryPower();}catch{}try{online=!!net.isOnline();}catch{}
  return{platform,revision,online,power:{onBattery:battery,percentage:null,suspended},displays:displays(),capabilities:{network:'status',display:'status',power:'status',bluetooth:'unsupported',systemAudio:'unsupported',brightness:'unsupported',batteryLevel:'unsupported',clipboard:'user-action',hyprland:hyprland?.supported?'permission-required':'unsupported'},settings:Object.keys(settings[platform]||{})};
 }
 function changed(){if(disposed)return;revision++;onChange(snapshot());}
 for(const type of ['display-added','display-removed','display-metrics-changed'])bind(screen,type,changed);
 for(const type of ['on-ac','on-battery','lock-screen','unlock-screen'])bind(powerMonitor,type,changed);
 bind(powerMonitor,'suspend',()=>{suspended=true;changed();});bind(powerMonitor,'resume',()=>{suspended=false;changed();});
 async function openSettings(kind){if(disposed||typeof kind!=='string'||!Object.hasOwn(settings[platform]||{},kind))throw Error('Diese Systemeinstellung ist nicht verfügbar.');await shell.openExternal(settings[platform][kind]);return{opened:true,kind};}
 async function copy(text){if(disposed||typeof text!=='string'||Buffer.byteLength(text,'utf8')>65536||text.includes('\0'))throw Error('Ungültiger Zwischenablagetext.');await clipboard.writeText(text);return{copied:true};}
 async function paste(){if(disposed)throw Error('Systemdienst beendet.');const text=await clipboard.readText();if(typeof text!=='string')throw Error('Zwischenablage nicht verfügbar.');if(Buffer.byteLength(text,'utf8')>65536)throw Error('Zwischenablagetext zu groß.');return text;}
 function dispose(){if(disposed)return;disposed=true;for(const off of listeners.splice(0))off();}
 return Object.freeze({snapshot,openSettings,copy,paste,dispose});
}
module.exports={create,settings,fitWindow};
