'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9235');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='b2gui'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','B2 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  const dock=page.locator('.dock'),trigger=dock.locator('[data-app="launchpad"]'),menu=page.locator('#air-start-menu'),input=page.locator('#air-start-search');
  async function settings(){await page.locator('#air-system-toggle').click();await page.locator('#air-system-panel [data-app="settings"]').click();await page.waitForSelector('#air-dock-theme')}
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function open(){if(!await menu.isVisible())await trigger.click();await input.waitFor({state:'visible'})}
  await page.emulateMedia({reducedMotion:'reduce'});
  await settings();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  const prefs=await page.evaluate(()=>window.airOS.preferences.get());
  await page.emulateMedia({reducedMotion:'no-preference'});await open();assert.equal(await menu.evaluate(el=>getComputedStyle(el).animationName),'air-start-in');await page.keyboard.press('Escape');await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await open();
   const bounds=await menu.boundingBox(),db=await dock.boundingBox();assert.equal(db.width,358);assert.equal(db.height,68);assert.ok(Math.abs(bounds.x+bounds.width/2-width/2)<1);assert.ok(bounds.y>=80&&bounds.y+bounds.height<db.y&&bounds.x>=0&&bounds.x+bounds.width<=width);
   assert.equal(await dock.evaluate(el=>{el.scrollLeft=100;return el.scrollLeft}),0);
   const ids=await menu.locator('[data-start-app]').evaluateAll(nodes=>nodes.map(el=>el.dataset.startApp)),registered=await page.evaluate(()=>window.airAppRegistry.list().map(app=>app.id));assert.deepEqual(ids,registered);assert.equal(new Set(ids).size,ids.length);assert.equal(ids.includes('chatgpt'),false);
   const original=await dock.locator('[data-app="finder"] .dock-icon').innerHTML(),copy=await menu.locator('[data-start-app="finder"] .air-start-icon').innerHTML();assert.equal(copy,original);
   assert.equal(await menu.evaluate(el=>getComputedStyle(el).animationName),'none');
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-start-b2-${width}.png`)});
   await input.fill('fInDeR');assert.equal(await menu.locator('[data-start-app]').count(),1);await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForFunction(()=>openApps.has('finder'));await page.waitForFunction(()=>document.querySelector('#air-start-menu').hidden);assert.ok(await trigger.evaluate(el=>el===document.activeElement));await clearWindows();
   await trigger.focus();await page.keyboard.press('Space');await input.fill('no-such-application');assert.match(await menu.locator('#air-start-status').innerText(),/Keine passenden/);await page.keyboard.press('Enter');assert.ok(await menu.isVisible());await page.keyboard.press('Escape');assert.equal(await menu.isVisible(),false);
   await trigger.focus();await page.keyboard.press('Enter');await page.locator('.wallpaper').click({position:{x:width-5,y:100},force:true});assert.equal(await menu.isVisible(),false);assert.ok(await trigger.evaluate(el=>el===document.activeElement));
   await open();await page.locator('#air-start-full').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#air-start-full').evaluate(el=>el===document.activeElement),false);await page.keyboard.press('Escape');
   console.log('PASS',width,height,JSON.stringify({menu:bounds,dock:db,apps:ids.length}));
  }
  await open();await input.fill('spotify');await menu.locator('[data-start-app="spotify"]').click();await page.waitForFunction(()=>!document.querySelector('#air-start-search').disabled);assert.ok(await menu.isVisible());assert.match(await menu.locator('#air-start-status').innerText(),/Spotify|Plattform/);await page.screenshot({path:path.join(__dirname,'../docs/visual/air-start-b2-error-390.png')});await page.keyboard.press('Escape');
  await open();await page.locator('#air-start-full').click();await page.waitForSelector('.alp-search');assert.equal(await menu.isVisible(),false);await clearWindows();
  await settings();await page.locator('#air-dock-theme').selectOption('classic');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='classic');await clearWindows();await trigger.click();await page.waitForSelector('.alp-search');assert.equal(await menu.isVisible(),false);await page.setViewportSize({width:1650,height:930});await page.screenshot({path:path.join(__dirname,'../docs/visual/air-start-b2-classic-1650.png')});await clearWindows();
  await settings();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  const after=await page.evaluate(()=>window.airOS.preferences.get());assert.deepEqual(after,prefs);
  assert.deepEqual(errors,[]);console.log('PASS safe native failure, full Launchpad, Classic routing, unchanged preferences/pins; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
