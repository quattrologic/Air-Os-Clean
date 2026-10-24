'use strict';
// Optional real Linux Electron/CDP test. Use an isolated profile; no runtime dependencies.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use isolated Electron profiles only');
const{chromium}=require('playwright');
(async()=>{const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9255');
 try{
 const page=browser.contexts()[0].pages()[0],errors=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
 if(!page.url().endsWith('login.html')){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html')}
 const password=crypto.randomBytes(20).toString('hex');
 async function create(){if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();const username='m2'+crypto.randomBytes(5).toString('hex');for(const[id,value]of [['create-display-name','M2 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu)}
 await create();await page.emulateMedia({reducedMotion:'no-preference'});
 const settle=()=>page.waitForFunction(()=>[...openApps.values()].every(w=>!w._airOSDockMotion));
 const clear=async()=>{await page.evaluate(()=>{for(const w of openApps.values())w.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)};
 const prefs=patch=>page.evaluate(async patch=>{persistAirSettings(patch);await airSettingsWrites},patch);
 const skin=()=>page.evaluate(()=>{const r=s=>{const e=document.querySelector(s),b=e.getBoundingClientRect(),c=getComputedStyle(e);return{x:b.x,y:b.y,width:b.width,height:b.height,backgroundColor:c.backgroundColor,borderRadius:c.borderRadius}};return{dock:r('.dock'),island:r('#air-island-toggle'),icons:Array.from(document.querySelectorAll('.dock-app:not([hidden]) .dock-icon'),e=>e.innerHTML)}});
 await clear();
 for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{openApp('finder');openApp('notes')});await settle();
  const initialSkin=await skin(),geometry=await page.evaluate(()=>{const w=openApps.get('notes'),r=w.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});
  await page.screenshot({path:path.join(__dirname,`../docs/visual/air-window-m2-rest-${width}.png`)});
  const trials=await page.evaluate(async()=>{
   const w=openApps.get('notes'),button=document.querySelector('.dock [data-app="notes"]'),frame=()=>new Promise(requestAnimationFrame);
   const sample=()=>{const r=w.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,opacity:Number(getComputedStyle(w).opacity),time:w._airOSMotion?.currentTime}};
   w.querySelector('#note-title').focus();w.querySelector('.minimize').click();const motion=w._airOSMotion;do{await frame()}while(motion.currentTime<170);
   const results=[];let stale=motion.onfinish;
   for(let i=0;i<8;i++){
    const before=sample();button.click();const after=sample();stale?.();
    if(w._airOSMotion!==motion)throw Error('Live motion was replaced');if(w.style.display==='none')throw Error('Stale callback hid window');
    await motion.ready;results.push({before,after,rate:motion.playbackRate,state:window.airAppLifecycle.get('notes'),pointerEvents:w.style.pointerEvents});stale=motion.onfinish;await frame();
   }
   return results;
  });
  for(const t of trials)for(const k of ['x','y','width','height','opacity','time'])assert.equal(t.before[k],t.after[k],k+' jumped on reversal');
  await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'none');assert.equal(await page.evaluate(()=>window.airAppLifecycle.get('notes')),'minimized');
  // Actual mouse clicks reverse an ongoing restore back toward the Dock.
  const dockNotes=page.locator('.dock [data-app="notes"]');await dockNotes.click();await dockNotes.click();await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'none');
  await dockNotes.click();await settle();assert.ok(await page.evaluate(()=>openApps.get('notes').contains(document.activeElement)));assert.equal(await page.evaluate(()=>window.airAppLifecycle.get('notes')),'focused');assert.ok(await dockNotes.evaluate(e=>e.classList.contains('is-active')));
  const restored=await page.evaluate(()=>{const r=openApps.get('notes').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});assert.deepEqual(restored,geometry);assert.deepEqual(await skin(),initialSkin);
  // Genuine WAAPI midpoint capture, deliberately paused and labelled.
  await page.evaluate(()=>{const w=openApps.get('notes');w.querySelector('.minimize').click();w._airOSMotion.pause();w._airOSMotion.currentTime=205});await page.screenshot({path:path.join(__dirname,`../docs/visual/air-window-m2-midpoint-${width}.png`)});await page.evaluate(()=>openApps.get('notes')._airOSMotion.play());await settle();
  // Close during minimize, reopen before its callback; then close during restore.
  await page.evaluate(()=>{openApp('notes');const w=openApps.get('notes');w.querySelector('.minimize').click();const stale=w._airOSMotion.onfinish;w.querySelector('.close').click();const closing=w._airOSMotion.onfinish;openApp('notes');stale();closing()});await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'flex');
  await page.evaluate(()=>{const w=openApps.get('notes');w.querySelector('.minimize').click();w._airOSMotion.finish()});await settle();await page.evaluate(()=>{openApp('notes');openApps.get('notes').querySelector('.close').click()});await page.waitForFunction(()=>!openApps.has('notes'));assert.ok(await page.evaluate(()=>openApps.has('finder')));
  await page.evaluate(()=>openApp('notes'));await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'flex');
  // Maximized bounds survive a complete round trip too.
  await page.evaluate(()=>openApps.get('notes').querySelector('.maximize').click());const max=await page.evaluate(()=>{const r=openApps.get('notes').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});await page.evaluate(()=>openApps.get('notes').querySelector('.minimize').click());await settle();await dockNotes.click();await settle();assert.deepEqual(await page.evaluate(()=>{const r=openApps.get('notes').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}),max);
  await prefs({reduceMotion:true});await page.evaluate(()=>openApps.get('notes').querySelector('.minimize').click());assert.equal(await page.evaluate(()=>openApps.get('notes')._airOSMotion),null);await dockNotes.click();assert.equal(await page.evaluate(()=>openApps.get('notes')._airOSDockMotion),null);await prefs({reduceMotion:false});
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>openApps.get('notes').querySelector('.minimize').click());assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'none');await dockNotes.click();await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.evaluate(()=>openApps.get('notes').querySelector('.minimize').click());assert.equal(await page.evaluate(()=>openApps.get('notes')._airOSDockMotion),null);await page.waitForFunction(()=>openApps.get('notes').style.display==='none');await dockNotes.click();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'flex');await page.evaluate(()=>persistAirDesktopTheme('modern'));await clear();
  rows.push({viewport:[width,height],geometry,restored,max,skin:initialSkin,trials});console.log('PASS',width,'8 continuous reversals, mouse reversal, stale close callbacks, focus/lifecycle, multiple windows, maximized bounds, both Reduced Motion paths and Classic');
 }
 // Runtime motion preference and logout while an effect exists.
 await page.evaluate(()=>{openApp('notes');openApps.get('notes').querySelector('.minimize').click()});await page.emulateMedia({reducedMotion:'reduce'});await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'none');await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>openApp('notes'));await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await create();assert.equal(await page.evaluate(()=>openApps.has('notes')),false);assert.equal(await page.evaluate(()=>window.airAppLifecycle.get('notes')),'closed');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/air-window-m2-measurements.json'),JSON.stringify({rows,errors},null,2)+'\n');console.log('PASS runtime media change/logout/new profile; no renderer errors; Linux only');await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
