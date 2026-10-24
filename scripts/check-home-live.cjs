'use strict';
// Optional real Electron check: isolated userData only; external Playwright, no project dependency.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron test profile');
const{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9244');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],measurements=[];
  page.on('pageerror',e=>errors.push(e.message));assert.match(page.url(),/login\.html$/);
  const password=crypto.randomBytes(20).toString('hex'),alice='e3alice'+crypto.randomBytes(4).toString('hex'),bob='e3bob'+crypto.randomBytes(4).toString('hex');
  async function create(username){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   for(const[id,value]of [['create-display-name',username===alice?'E3 Alice':'E3 Bob'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeReminders);await page.emulateMedia({reducedMotion:'reduce'});
  }
  async function clear(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function home(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Air Home');await page.locator('[data-start-app="home"]').click();await page.waitForFunction(()=>document.querySelector('.air-home-reminders-status')?.textContent!=='Erinnerungen werden geladen …')}
  page.on('dialog',dialog=>dialog.accept());
  const titles=kind=>page.locator(kind==='notes'?'.air-home-notes-list li':'.air-home-reminders-list li span').allTextContents();
  async function contains(kind,title,present=true){await page.waitForFunction(({kind,title,present})=>[...document.querySelectorAll(kind==='notes'?'.air-home-notes-list li':'.air-home-reminders-list li span')].some(el=>el.textContent===title)===present,{kind,title,present})}
  async function editor(id){await page.evaluate(id=>openApp(id),id);await page.waitForFunction(id=>id==='notes'?document.querySelector('#note-status')?.textContent==='Notiz geladen.':document.querySelector('.arem-status')?.textContent==='Nur auf diesem Gerät.',id)}
  async function close(id){await page.evaluate(id=>openApps.get(id).querySelector('.close').click(),id);await page.waitForFunction(id=>!openApps.has(id),id)}
  await create(alice);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();
  await page.evaluate(async()=>{await window.airOS.notes.save({title:'E3 Gespeicherte Notiz',body:'E3 PRIVATE BODY'});for(const title of ['E3 Einkauf planen','E3 Reise vorbereiten'])await window.airOS.reminders.save({title,details:'E3 PRIVATE DETAILS',completed:false})});
  const icons=await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML));
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clear();await home();await contains('notes','E3 Gespeicherte Notiz');
   await page.evaluate(()=>{window.e3events=[];if(!window.e3observing){window.e3observing=true;for(const type of ['air-notes-saved','air-notes-changed','air-reminders-changed'])document.addEventListener(type,event=>window.e3events.push({type:event.type,hasDetail:'detail'in event}))}});
   await editor('notes');await page.locator('#new-note').click();await page.locator('#note-title').fill('E3 Neue Notiz '+width);await page.locator('#note-body').fill('E3 PRIVATE BODY');await page.locator('#save-note').click();await contains('notes','E3 Neue Notiz '+width);
   await page.locator('#note-title').fill('E3 Bearbeitete Notiz '+width);await page.locator('#save-note').click();await contains('notes','E3 Bearbeitete Notiz '+width);await page.locator('#delete-note').click();await contains('notes','E3 Bearbeitete Notiz '+width,false);await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz gelöscht.');await close('notes');
   await editor('reminders');await page.locator('.arem-new').click();await page.locator('.arem-title').fill('E3 Neue Aufgabe '+width);await page.locator('.arem-details').fill('E3 PRIVATE DETAILS');await page.locator('.arem-save').click();await contains('reminders','E3 Neue Aufgabe '+width);
   await page.waitForFunction(()=>document.querySelector('.arem-status').textContent==='Im Air-OS-Profil gespeichert.');await page.locator('.arem-title').fill('E3 Bearbeitete Aufgabe '+width);await page.locator('.arem-save').click();await contains('reminders','E3 Bearbeitete Aufgabe '+width);
   const row=()=>page.locator('.arem-row').filter({hasText:'E3 Bearbeitete Aufgabe '+width});await row().locator('input').check();await contains('reminders','E3 Bearbeitete Aufgabe '+width,false);await page.waitForFunction(()=>document.querySelector('.arem-status').textContent==='Aufgabe gespeichert.');await row().locator('input').uncheck();await contains('reminders','E3 Bearbeitete Aufgabe '+width);await page.waitForFunction(()=>document.querySelector('.arem-status').textContent==='Aufgabe gespeichert.');await page.locator('.arem-delete').click();await contains('reminders','E3 Bearbeitete Aufgabe '+width,false);await page.waitForFunction(()=>document.querySelector('.arem-status').textContent==='Erinnerung gelöscht.');await close('reminders');
   const events=await page.evaluate(()=>window.e3events);assert.equal(events.filter(e=>e.type==='air-notes-saved').length,2);assert.equal(events.filter(e=>e.type==='air-notes-changed').length,1);assert.equal(events.filter(e=>e.type==='air-reminders-changed').length,5);assert.ok(events.every(e=>!e.hasDetail));
   assert.deepEqual(await titles('notes'),['E3 Gespeicherte Notiz']);assert.deepEqual((await titles('reminders')).sort(),['E3 Einkauf planen','E3 Reise vorbereiten']);assert.doesNotMatch(await page.locator('.air-home').innerText(),/PRIVATE/);
   const metrics=await page.evaluate(()=>{const r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{window:r(openApps.get('home')),notes:r(document.querySelector('.air-home-inbox')),reminders:r(document.querySelector('.air-home-due')),dock:r(document.querySelector('.dock')),island:r(document.querySelector('#air-island-toggle'))}});
   assert.equal(metrics.dock.y+metrics.dock.height,height);assert.equal(metrics.dock.width,358);assert.equal(metrics.island.y,0);if(width===1920)assert.deepEqual(metrics.window,{x:200,y:103,width:1522,height:849});assert.deepEqual(await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML)),icons);
   await page.locator('.air-home-due').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-live-e3-'+width+'.png')});if(width===390){await page.locator('.air-home-inbox').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-live-e3-notes-390.png')})}measurements.push({viewport:[width,height],...metrics,events});
   console.log('PASS automatic Notes save/edit/delete and Reminder create/edit/complete/reopen/delete, content-free events, unchanged design',width);
  }
  // Closing Home removes subscribers; a later fresh Home reads the current profile once.
  await close('home');await editor('notes');await page.locator('#new-note').click();await page.locator('#note-title').fill('E3 Bei geschlossenem Home');await page.locator('#save-note').click();await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');assert.equal(await page.locator('.air-home').count(),0);await close('notes');await home();await contains('notes','E3 Bei geschlossenem Home');
  assert.equal(await page.evaluate(()=>{const a=document.querySelector('.air-home-inbox'),b=document.querySelector('.air-home-due');document.querySelector('#sign-out-button').click();return a.querySelectorAll('li').length+b.querySelectorAll('li').length}),0);await page.waitForURL('**/login.html');await create(bob);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.deepEqual(await titles('notes'),[]);assert.deepEqual(await titles('reminders'),[]);
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='classic');assert.ok(await page.locator('.menubar').isVisible());assert.equal(await page.locator('.dock [data-app="launchpad"] svg image').count(),0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/visual/air-home-live-e3-measurements.json'),JSON.stringify(measurements,null,2)+'\n');console.log('PASS closed/reopened Home, immediate logout scrub, empty Bob profile, Classic, no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
