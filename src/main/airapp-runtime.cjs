'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const CSP="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; font-src 'self'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'";
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
function createRuntime({BrowserWindow,protocol,session,manager}){
 protocol.registerSchemesAsPrivileged([{scheme:'airapp',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
 const windows=new Map(),configured=new WeakSet(),opening=new Map();
 function key(user,id){return crypto.createHash('sha256').update(user.toLowerCase()).digest('hex')+'/'+id}
 function isAllowed(url,id){
  try{const p=new URL(url);return p.protocol==='airapp:'&&p.hostname===id&&!p.port&&!p.username&&!p.password&&!p.search&&!p.hash}
  catch{return false}
 }
 async function open(user,id){
  const k=key(user,id);
  const pending=opening.get(k);
  if(pending){
   await pending;
   const ready=windows.get(k);
   if(!ready||ready.isDestroyed())throw new Error('App window closed during startup.');
   ready.show();ready.focus();return{ok:true,alreadyOpen:true};
  }
  const task=launch(user,id,k);
  opening.set(k,task);
  try{return await task}
  finally{if(opening.get(k)===task)opening.delete(k)}
 }
 async function launch(user,id,k){
  const folder=manager.installedFolder(user,id),record=manager.installed(user).find(a=>a.id===id);
  if(!record)throw new Error('App not installed.');
  const existing=windows.get(k);
  if(existing&&!existing.isDestroyed()){existing.show();existing.focus();return{ok:true,alreadyOpen:true}}
  const partition=session.fromPartition('persist:airapp-'+k.replace('/','-'));
  if(!configured.has(partition)){
  partition.protocol.handle('airapp',async request=>{
   if(request.method!=='GET'||!isAllowed(request.url,id))return new Response('Forbidden',{status:403});
   let name;try{name=decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/,'')}catch{return new Response('Forbidden',{status:403})}
   try{
    // A partition can outlive its BrowserWindow. On every request, verify the
    // *currently installed* signed package, not a stale first-launch manifest.
    const verified=manager.installedFolder(user,id);
    const current=JSON.parse(await fs.readFile(path.join(verified,'manifest.airapp.json'),'utf8'));
    const asset=Array.isArray(current.files)?current.files.find(item=>item.path===name):null;
    if(!asset||typeof asset.sha256!=='string')return new Response('Forbidden',{status:403});
    const file=path.resolve(verified,name);
    const canonicalRoot=await fs.realpath(verified);
    const canonicalFile=await fs.realpath(file);
    const relative=path.relative(canonicalRoot,canonicalFile);
    if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return new Response('Forbidden',{status:403});
    const stat=await fs.lstat(file);
    if(!stat.isFile()||stat.isSymbolicLink())return new Response('Forbidden',{status:403});
    const data=await fs.readFile(file);
    if(crypto.createHash('sha256').update(data).digest('hex')!==asset.sha256)return new Response('Integrity check failed',{status:403});
    return new Response(data,{headers:{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff'}});
   }catch{return new Response('Not found',{status:404})}
  });
  partition.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!isAllowed(details.url,id)&&!details.url.startsWith('data:')}));
  partition.setPermissionRequestHandler((wc,permission,callback)=>callback(false));
  partition.setPermissionCheckHandler(()=>false);
  partition.on('will-download',e=>e.preventDefault());
  configured.add(partition);
  }
  const win=new BrowserWindow({width:660,height:540,minWidth:440,minHeight:400,title:record.name,show:false,backgroundColor:'#d9edfc',autoHideMenuBar:true,webPreferences:{session:partition,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,webviewTag:false}});
  windows.set(k,win);
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  const entry='airapp://'+id+'/'+record.entry;
  win.webContents.on('will-navigate',(event,url)=>{if(url!==entry)event.preventDefault()});
  win.webContents.on('will-attach-webview',event=>event.preventDefault());
  win.once('ready-to-show',()=>{if(!win.isDestroyed())win.show()});
  win.on('closed',()=>{if(windows.get(k)===win)windows.delete(k)});
  try{await win.loadURL(entry)}catch(error){if(!win.isDestroyed())win.close();throw error}
  return{ok:true,alreadyOpen:false};
 }
 function close(user,id){const win=windows.get(key(user,id));if(win&&!win.isDestroyed())win.close()}
 function closeAll(){for(const win of windows.values())if(!win.isDestroyed())win.close();windows.clear()}
 return Object.freeze({open,close,closeAll,isAllowed});
}
module.exports={createRuntime,CSP};
