'use strict';
const path=require('node:path'),fs=require('node:fs/promises');
function createSpotifyLauncher({app,shell,platform=process.platform,realpath=fs.realpath,stat=fs.stat}){
 let pending;
 function valid(file){
  if(typeof file!=='string'||/[\x00-\x1f]/.test(file))return false;
  const p=platform==='win32'?path.win32:path.posix;
  if(!p.isAbsolute(file)||p.normalize(file)!==file)return false;
  if(platform==='win32')return /^[a-z]:\\/i.test(file)&&p.basename(file).toLowerCase()==='spotify.exe';
  return platform==='darwin'&&p.basename(file)==='Spotify.app';
 }
 async function launch(){
  if(!['win32','darwin'].includes(platform))throw new Error('Spotify-Desktop-Start ist nur unter Windows und macOS verfügbar.');
  let info;
  try{info=await app.getApplicationInfoForProtocol('spotify://')}
  catch{throw new Error('Spotify-Desktop-App nicht gefunden. Bitte die offizielle Spotify-App installieren und einmal öffnen.')}
  if(!valid(info?.path))throw new Error('Die registrierte Anwendung ist kein unterstützter Spotify-Desktop-Client.');
  const target=await realpath(info.path);
  if(!valid(target))throw new Error('Ungültiger Spotify-Anwendungspfad.');
  const entry=await stat(target);
  if(!(platform==='win32'?entry.isFile():entry.isDirectory()))throw new Error('Ungültige Spotify-Installation.');
  const error=await shell.openPath(target);
  if(error)throw new Error('Spotify konnte nicht gestartet werden. Bitte die Desktop-Installation prüfen.');
  // OS handoff is not proof of a running process or a controllable window.
  return {ok:true,launchRequested:true};
 }
 return Object.freeze({launch(){
  if(!pending)pending=launch().finally(()=>{pending=null});
  return pending;
 }});
}
module.exports={createSpotifyLauncher};
