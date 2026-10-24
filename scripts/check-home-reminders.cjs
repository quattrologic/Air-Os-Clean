'use strict';
// Optional real Electron check: isolated userData only; external Playwright, no project dependency.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron test profile');
const{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9243');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],measurements=[];
  page.on('pageerror',e=>errors.push(e.message));assert.match(page.url(),/login\.html$/);
  const password=crypto.randomBytes(20).toString('hex'),alice='e2alice'+crypto.randomBytes(4).toString('hex'),bob='e2bob'+crypto.randomBytes(4).toString('hex');
  async function create(username){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   for(const[id,value]of [['create-display-name',username===alice?'E2 Alice':'E2 Bob'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeReminders);await page.emulateMedia({reducedMotion:'reduce'});
  }
  async function clear(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function home(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Air Home');await page.locator('[data-start-app="home"]').click();await page.waitForFunction(()=>document.querySelector('.air-home-reminders-status')?.textContent!=='Erinnerungen werden geladen …')}
  const titles=()=>page.locator('.air-home-reminders-list li span').allTextContents();
  async function signout(){
   assert.equal(await page.evaluate(()=>{const tile=document.querySelector('.air-home-due');document.querySelector('#sign-out-button').click();return tile.querySelectorAll('li').length}),0);
   await page.waitForURL('**/login.html');
  }
  await create(alice);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.equal(await page.locator('.air-home-reminders-status').textContent(),'Keine offenen Aufgaben.');
  await page.setViewportSize({width:390,height:600});await page.locator('.air-home-due').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-reminders-e2-empty-390.png')});
  await page.evaluate(async()=>{
   const now=new Date(),day=offset=>{const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset);return String(d.getFullYear()).padStart(4,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
   for(const [title,dueDate,completed]of [['E2 Ohne Datum',null,false],['E2 Morgen',day(1),false],['E2 Erledigt',day(-2),true],['E2 Heute',day(0),false],['E2 Überfällig',day(-1),false]])await window.airOS.reminders.save({title,dueDate,completed,details:'E2 PRIVATE DETAILS - never in Home'});
   await window.airOS.notes.save({title:'E1 bleibt erhalten',body:'E1 PRIVATE BODY'});
  });await clear();
  const expected=['E2 Überfällig','E2 Heute','E2 Morgen'];
  const icons=await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML));
  for(const [width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clear();await home();assert.deepEqual(await titles(),expected);await page.waitForFunction(()=>document.querySelector('.air-home-notes-list')?.textContent.includes('E1 bleibt erhalten'));
   assert.doesNotMatch(await page.locator('.air-home-due').innerText(),/PRIVATE|Erledigt/);assert.equal(await page.locator('.air-home-reminders-list .is-overdue').count(),1);assert.equal(await page.locator('.air-home-reminders-list small').nth(1).textContent(),'Heute');
   const metrics=await page.evaluate(()=>{const r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{window:r(openApps.get('home')),sidebar:r(document.querySelector('.air-home-nav')),tile:r(document.querySelector('.air-home-due')),notesTile:r(document.querySelector('.air-home-inbox')),dock:r(document.querySelector('.dock')),island:r(document.querySelector('#air-island-toggle'))}});
   assert.equal(metrics.dock.width,358);assert.equal(metrics.dock.y+metrics.dock.height,height);assert.equal(metrics.island.y,0);if(width===1920){assert.deepEqual(metrics.window,{x:200,y:103,width:1522,height:849});assert.equal(metrics.notesTile.height,384)}
   assert.deepEqual(await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML)),icons);
   await page.locator('.air-home-due').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-reminders-e2-'+width+'.png')});measurements.push({viewport:[width,height],...metrics});
   await page.locator('.air-home-reminders-open').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>openApps.has('reminders'));await page.waitForFunction(()=>document.querySelector('.arem-status')?.textContent==='Nur auf diesem Gerät.');
   await page.evaluate(()=>openApps.get('reminders').querySelector('.close').click());await page.waitForFunction(()=>!openApps.has('reminders'));
   console.log('PASS authentic reminders/order/dates/limit, E1 unchanged, geometry, Notes and Reminders integration',width);
  }
  await page.locator('.air-home-reminders-open').click();await page.waitForSelector('.arem-row');await page.locator('.arem-row').filter({hasText:'E2 Überfällig'}).locator('input[type=checkbox]').check();await page.waitForFunction(()=>document.querySelector('.arem-status').textContent==='Aufgabe gespeichert.');await page.evaluate(()=>openApps.get('reminders').querySelector('.close').click());await page.waitForFunction(()=>!openApps.has('reminders'));await page.locator('.air-home-reminders-refresh').click();await page.waitForFunction(()=>!document.querySelector('.air-home-reminders-list').textContent.includes('E2 Überfällig')&&document.querySelector('.air-home-reminders-list li'));
  assert.deepEqual(await titles(),['E2 Heute','E2 Morgen','E2 Ohne Datum']);await clear();await home();assert.deepEqual(await titles(),['E2 Heute','E2 Morgen','E2 Ohne Datum']);
  await page.reload();await page.waitForFunction(()=>!!window.airHomeReminders);await clear();await home();assert.deepEqual(await titles(),['E2 Heute','E2 Morgen','E2 Ohne Datum']);
  await page.evaluate(()=>window.airOS.reminders.save({title:'E2 <img src=x onerror=alert(1)>',completed:false,dueDate:'2020-01-01'}));await page.locator('.air-home-reminders-refresh').click();await page.waitForFunction(()=>document.querySelector('.air-home-reminders-list span')?.textContent==='E2 <img src=x onerror=alert(1)>');assert.equal(await page.locator('.air-home-reminders-list img').count(),0);
  await signout();await create(bob);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.equal(await page.locator('.air-home-reminders-status').textContent(),'Keine offenen Aufgaben.');assert.equal(await page.locator('.air-home-notes-status').textContent(),'Noch keine Notizen vorhanden.');
  await page.evaluate(()=>window.airOS.reminders.save({title:'E2 Bob only',completed:false}));await clear();await home();assert.deepEqual(await titles(),['E2 Bob only']);await signout();
  await page.getByTitle('Als '+alice+' anmelden',{exact:true}).click();await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeReminders);await clear();await home();assert.ok((await titles()).includes('E2 <img src=x onerror=alert(1)>'));assert.ok(!(await titles()).includes('E2 Bob only'));
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='classic');assert.ok(await page.locator('.menubar').isVisible());assert.equal(await page.locator('.dock [data-app="launchpad"] svg image').count(),0);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/air-home-reminders-e2-measurements.json'),JSON.stringify(measurements,null,2)+'\n');console.log('PASS real completion update, manual refresh, reopen/reload persistence, literal HTML, logout scrub, Alice/Bob re-login separation, Classic; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
