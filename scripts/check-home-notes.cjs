'use strict';
// Optional real Electron check: isolated userData only; external Playwright, no project dependency.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron test profile');
const{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9242');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],measurements=[];
  page.on('pageerror',e=>errors.push(e.message));assert.match(page.url(),/login\.html$/);
  const password=crypto.randomBytes(20).toString('hex'),alice='e1alice'+crypto.randomBytes(4).toString('hex'),bob='e1bob'+crypto.randomBytes(4).toString('hex');
  async function create(username){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   for(const[id,value]of [['create-display-name',username===alice?'E1 Alice':'E1 Bob'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeNotes);await page.emulateMedia({reducedMotion:'reduce'});
  }
  async function clear(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function home(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Air Home');await page.locator('[data-start-app="home"]').click();await page.waitForFunction(()=>document.querySelector('.air-home-notes-status')?.textContent!=='Notizen werden geladen …')}
  const titles=()=>page.locator('.air-home-notes-list li').allTextContents();
  async function signout(){
   assert.equal(await page.evaluate(()=>{const tile=document.querySelector('.air-home-inbox');document.querySelector('#sign-out-button').click();return tile.querySelectorAll('li').length}),0);
   await page.waitForURL('**/login.html');
  }
  await create(alice);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.equal(await page.locator('.air-home-notes-status').textContent(),'Noch keine Notizen vorhanden.');
  await page.setViewportSize({width:390,height:600});await page.locator('.air-home-inbox').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-notes-e1-empty-390.png')});
  await page.evaluate(async()=>{for(const title of ['E1 Erste Idee','E1 Reiseplanung','E1 Einkaufsliste','E1 Ideen für morgen'])await window.airOS.notes.save({title,body:'E1 PRIVATE BODY - never in Home'})});
  await clear();
  const expected=await page.evaluate(async()=>{const notes=await window.airOS.notes.list();return notes.sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).slice(0,3).map(n=>n.title)});
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clear();await home();assert.deepEqual(await titles(),expected);assert.doesNotMatch(await page.locator('.air-home-inbox').innerText(),/PRIVATE BODY/);
   const metrics=await page.evaluate(()=>{const r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{window:r(openApps.get('home')),sidebar:r(document.querySelector('.air-home-nav')),tile:r(document.querySelector('.air-home-inbox')),dock:r(document.querySelector('.dock')),island:r(document.querySelector('#air-island-toggle'))}});
   assert.equal(metrics.dock.width,358);assert.equal(metrics.dock.y+metrics.dock.height,height);assert.equal(metrics.island.y,0);if(width===390)assert.equal(metrics.tile.height,180);if(width===1920)assert.deepEqual(metrics.window,{x:200,y:103,width:1522,height:849});
   if(width===390)await page.locator('.air-home-inbox').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-notes-e1-'+width+'.png')});measurements.push({viewport:[width,height],...metrics});
   await page.locator('.air-home-notes-open').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>openApps.has('notes'));
   await page.evaluate(()=>openApps.get('notes').querySelector('.close').click());await page.waitForFunction(()=>!openApps.has('notes'));
   console.log('PASS actual profile notes, top-three order, private-body exclusion, Notes start, geometry',width);
  }
  await page.reload();await page.waitForFunction(()=>!!window.airHomeNotes);await clear();await home();assert.deepEqual(await titles(),expected);
  await page.locator('.air-home-notes-open').click();await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Notiz geladen.');await page.locator('#note-title').fill('E1 <img src=x onerror=alert(1)>');await page.locator('#save-note').click();await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');await page.waitForFunction(()=>[...document.querySelectorAll('.air-home-notes-list li')].some(el=>el.textContent==='E1 <img src=x onerror=alert(1)>'));assert.equal(await page.locator('.air-home-notes-list img').count(),0);
  await signout();await create(bob);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.equal(await page.locator('.air-home-notes-status').textContent(),'Noch keine Notizen vorhanden.');assert.deepEqual(await titles(),[]);
  await page.evaluate(()=>window.airOS.notes.save({title:'E1 Bob only',body:'Bob private'}));await clear();await home();assert.deepEqual(await titles(),['E1 Bob only']);await signout();
  await page.getByTitle('Als '+alice+' anmelden',{exact:true}).click();await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeNotes);await clear();await home();assert.ok((await titles()).includes('E1 <img src=x onerror=alert(1)>'));assert.ok(!(await titles()).includes('E1 Bob only'));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/air-home-notes-e1-measurements.json'),JSON.stringify(measurements,null,2)+'\n');console.log('PASS reload, confirmed-save refresh, literal HTML title, immediate logout scrub, Alice/Bob isolation and re-login; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
