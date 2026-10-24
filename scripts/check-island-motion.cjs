'use strict';
// Real Electron animation tests; no new runtime dependency or native OS emulation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use isolated Electron profile');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9254');
 try{
 const page=browser.contexts()[0].pages()[0],errors=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
 if(!page.url().endsWith('login.html')){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html')}
 if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
 const password=crypto.randomBytes(20).toString('hex'),username='m1'+crypto.randomBytes(5).toString('hex');
 for(const[id,value]of [['create-display-name','M1 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
 await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
 await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});
 const panel=page.locator('#air-island-panel'),trigger=page.locator('#air-island-toggle');
 const settled=()=>page.waitForFunction(()=>document.querySelector('#air-island-panel').getAnimations().length===0);
 const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/air-soft-glass-after.json')));
 for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'no-preference'});
  const trials=await page.evaluate(async()=>{
   const p=document.querySelector('#air-island-panel'),t=document.querySelector('#air-island-toggle');
   const frame=()=>new Promise(requestAnimationFrame),sample=()=>{const c=getComputedStyle(p),r=p.getBoundingClientRect(),a=p.getAnimations()[0];return{opacity:Number(c.opacity),y:r.y,time:a?.currentTime,rate:a?.playbackRate}};
   const result=[];
   // Immediate opposite inputs before the first rendered frame must also be safe.
   t.click();t.click();t.click();await Promise.all(p.getAnimations().map(a=>a.finished.catch(()=>{})));
   t.click();await Promise.all(p.getAnimations().map(a=>a.finished.catch(()=>{})));
   t.click();do{await frame()}while(p.getAnimations()[0]?.currentTime<60);
   const original=p.getAnimations()[0];let stale=original.onfinish;
   for(let i=0;i<12;i++){
    const before=sample();t.click();const after=sample();stale?.();
    if(p.hidden)throw Error('Stale callback hid panel');
    if(p.getAnimations()[0]!==original)throw Error('Reversal replaced live timeline');
    await original.ready;const settledRate=original.playbackRate;
    result.push({before,after,settledRate});stale=original.onfinish;await frame();
   }
   await Promise.all(p.getAnimations().map(a=>a.finished.catch(()=>{})));
   return result;
  });
  for(const r of trials){assert.equal(r.before.opacity,r.after.opacity);assert.equal(r.before.y,r.after.y);assert.equal(r.before.time,r.after.time);assert.equal(r.before.rate,-r.settledRate)}
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');await settled();
  const geometry=await page.evaluate(()=>{
   const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}},skin=s=>{const c=getComputedStyle(document.querySelector(s));return Object.fromEntries(['backgroundColor','borderRadius','borderColor','boxShadow','backdropFilter','filter','color'].map(k=>[k,c[k]]))};
   return{dock:r('.dock'),island:r('#air-island-toggle'),panel:r('#air-island-panel'),dockSkin:skin('.dock'),islandSkin:skin('#air-island-toggle'),icons:Array.from(document.querySelectorAll('.dock-app:not([hidden]) .dock-icon'),e=>e.innerHTML)};
  });
  const old=baseline.rows.find(r=>r.viewport[0]===width);for(const k of ['dock','island','dockSkin','islandSkin','icons'])assert.deepEqual(geometry[k],old[k]);
  await page.mouse.move(2,height/2);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-island-m1-open-${width}.png`)});
  await page.locator('#air-island-view-quick').click();await page.evaluate(()=>{document.querySelector('#air-island-close').click();document.querySelector('#air-island-toggle').click()});await settled();assert.equal(await page.locator('#air-island-view-quick').getAttribute('aria-pressed'),'true');
  await page.keyboard.press('Escape');assert.ok(await trigger.evaluate(e=>e===document.activeElement));await settled();assert.equal(await panel.isVisible(),false);
  // All four genuine K3 launches retain existing window focus/lifecycle.
  for(const id of ['home','notes','reminders','finder']){
   await trigger.focus();await page.keyboard.press('Space');await settled();await page.locator('#air-island-view-quick').click();await page.locator(`[data-quick-app="${id}"]`).focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>openApps.has(id),id);assert.equal(await panel.isVisible(),false);assert.ok(await page.evaluate(id=>openApps.get(id).contains(document.activeElement),id));await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});
  }
  await trigger.click();await settled();await page.mouse.click(2,height/2);await settled();assert.equal(await panel.isVisible(),false);
  // Capture an actual paused animation at 70ms, clearly labelled (not a performance claim).
  await trigger.click();await page.evaluate(()=>{const a=document.querySelector('#air-island-panel').getAnimations()[0];a.pause();a.currentTime=70});await page.screenshot({path:path.join(__dirname,`../docs/visual/air-island-m1-midpoint-${width}.png`)});await page.evaluate(()=>document.querySelector('#air-island-panel').getAnimations()[0].play());await settled();await page.keyboard.press('Escape');await settled();
  await page.emulateMedia({reducedMotion:'reduce'});await trigger.click();assert.equal(await panel.evaluate(p=>p.getAnimations().length),0);await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),false);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(async()=>{persistAirSettings({reduceMotion:true});await airSettingsWrites});await trigger.click();assert.equal(await panel.evaluate(p=>p.getAnimations().length),0);await page.keyboard.press('Escape');await page.evaluate(async()=>{persistAirSettings({reduceMotion:false});await airSettingsWrites});
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await trigger.click();assert.equal(await panel.evaluate(p=>getComputedStyle(p).animationName),'air-island-open');await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),false);await page.evaluate(()=>persistAirDesktopTheme('modern'));
  rows.push({viewport:[width,height],...geometry,trials});console.log('PASS',width,'12 position/time-continuous reversals, stale callbacks, geometry/glass/icons, K3 starts/focus, Escape/outside, both reduced-motion paths, Classic');
 }
 // Changing OS motion preference while running settles safely, no dangling effect.
 await trigger.click();await page.emulateMedia({reducedMotion:'reduce'});await settled();assert.equal(await panel.isVisible(),true);await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'no-preference'});await trigger.click();await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await settled();assert.equal(await panel.isVisible(),false);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/air-island-m1-measurements.json'),JSON.stringify({rows,errors},null,2)+'\n');console.log('PASS in-flight media change/pagehide cleanup, no renderer errors; Linux only');await page.evaluate(()=>window.airOS.quit()).catch(error=>{if(!/Target page, context or browser has been closed|Execution context was destroyed/.test(error.message))throw error});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
