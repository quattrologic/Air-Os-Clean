'use strict';
// Development-only preview renderer. No application main/preload/profile is loaded.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {app,BrowserWindow}=require('electron');
if(process.env.AIR_BRAND_PREVIEW!=='1')throw Error('Explicit isolated brand preview required.');
const folder=path.resolve(__dirname,'../docs/brand/brand-1');
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1440,height:1000,show:true,frame:false,transparent:true,backgroundColor:'#00000000',webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true,backgroundThrottling:false}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 const report={renderer:process.versions.electron,platform:process.platform,dpr:1,source:'Actual SVGs rendered by Chromium; no generated proxy images',files:[]};
 async function render(name,query,width,height){
  await win.loadFile(path.join(folder,'preview.html'),{query});win.webContents.debugger.attach('1.3');
  try{
   await win.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   await win.webContents.debugger.sendCommand('Emulation.setDefaultBackgroundColorOverride',{color:{r:0,g:0,b:0,a:0}});
   await win.webContents.executeJavaScript('Promise.all([...document.images].map(i=>i.decode())).then(()=>document.fonts.ready)');
   await win.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
   if(query.mode!=='icon'){
    height=await win.webContents.executeJavaScript('Math.ceil(document.documentElement.scrollHeight)');
    await win.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   }
   const result=await win.webContents.debugger.sendCommand('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,clip:{x:0,y:0,width,height,scale:1}}),bytes=Buffer.from(result.data,'base64');
   fs.writeFileSync(path.join(folder,name),bytes);report.files.push({file:name,width,height,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
  }finally{win.webContents.debugger.detach()}
 }
 try{
  await render('comparison.png',{},1440,1000);
  for(const design of ['fold','flow','prism']){
   await render(design+'-preview.png',{mode:'sheet',design},1280,1200);
   for(const size of [16,32,64,256,512])await render('png/'+design+'-'+size+'.png',{mode:'icon',design},size,size);
  }
  fs.writeFileSync(path.join(folder,'render-report.json'),JSON.stringify(report,null,2)+'\n');console.log('Rendered '+report.files.length+' real SVG previews using Electron '+report.renderer);
 }finally{win.destroy();app.quit()}
}).catch(error=>{console.error(error);app.exit(1)});
