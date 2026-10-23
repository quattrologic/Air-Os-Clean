'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9234');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='b1gui'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','B1 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  const dock=page.locator('.dock');
  async function viewport(width,height){await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))))}
  const original=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.dock-app')].map(el=>[el.dataset.app,el.querySelector('.dock-icon').innerHTML])));
  async function settings(){await page.locator('#air-system-toggle').click();await page.locator('#air-system-panel [data-app="settings"]').click();await page.waitForSelector('#air-dock-theme')}
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function pins(value){await page.evaluate(async dockPins=>applyAirSettings(airSettingsCache=await window.airOS.preferences.update({dockPins})),value)}
  async function measure(){return dock.evaluate(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);el.scrollLeft=100;return {width:r.width,height:r.height,center:r.x+r.width/2,scroll:el.scrollLeft,client:el.clientWidth,content:el.scrollWidth,bg:style.backgroundColor,overflow:style.overflowX,ids:[...el.querySelectorAll('.dock-app:not([hidden])')].map(b=>b.dataset.app)}})}
  await page.emulateMedia({reducedMotion:'reduce'});
  await settings();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  for(const [width,height]of [[1920,1080],[1650,930],[390,600]]){
   await viewport(width,height);
   const m=await measure();assert.equal(m.bg,'rgb(9, 11, 12)');assert.equal(m.overflow,'clip');assert.equal(m.scroll,0);assert.equal(m.client,m.content);assert.ok(Math.abs(m.center-width/2)<1);assert.ok(m.width>=350&&m.width<=440);assert.ok(m.height>=60&&m.height<=68);assert.equal(m.ids.length,6);
   for(const id of m.ids){const button=dock.locator(`[data-app="${id}"]`),r=await button.boundingBox();assert.ok(r.x>=0&&r.x+r.width<=width);assert.equal(await button.locator('.dock-icon').innerHTML(),original[id]);assert.equal(await button.locator('.dock-icon').evaluate(el=>getComputedStyle(el).filter.includes('grayscale')),false);}
   await dock.locator('[data-app="finder"]').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>openApps.has('finder'));assert.ok(await dock.locator('[data-app="finder"]').evaluate(el=>el.classList.contains('is-active')));assert.equal(await dock.locator('[data-app="finder"] .dock-icon').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');await clearWindows();
   await dock.locator('[data-app="browser"]').click();await page.waitForFunction(()=>openApps.has('browser'));await clearWindows();
   await dock.locator('[data-app="launchpad"]').focus();await page.keyboard.press('Space');await page.waitForSelector('.alp-search');await page.locator('.alp-search').fill('Notizen');await page.locator('.alp-grid [data-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await clearWindows();
   await page.mouse.move(width-5,100);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-modern-b1-${width}.png`)});
   console.log('PASS default',width,height,JSON.stringify(m));
  }
  const all=await page.evaluate(()=>window.airAppRegistry.list().map(app=>app.id));await pins(all);
  await viewport(1920,1080);await dock.locator('.dock-app:not([hidden])').last().focus();await viewport(390,600);assert.equal(await page.evaluate(()=>document.activeElement.dataset.app),'launchpad');
  const first=dock.locator('[data-app="launchpad"]');await first.focus();await viewport(400,600);assert.equal(await page.evaluate(()=>document.activeElement.dataset.app),'launchpad');await viewport(390,600);
  assert.match(await dock.locator('[data-app="launchpad"]').getAttribute('aria-label'),/weitere angeheftete Apps/);
  assert.equal((await measure()).scroll,0);assert.equal((await measure()).client,(await measure()).content);
  assert.deepEqual(await page.evaluate(async()=> (await window.airOS.preferences.get()).dockPins),all);
  await pins(['spotify','finder','settings']);assert.equal(await dock.locator('[data-app="spotify"] .dock-icon').innerHTML(),original.spotify);
  await page.screenshot({path:path.join(__dirname,'../docs/visual/air-modern-b1-pins-390.png')});
  await pins(['weather','finder']);assert.ok(await dock.locator('[data-app="weather"]').isVisible());await dock.locator('[data-app="weather"]').click();await page.waitForFunction(()=>openApps.has('weather'));await clearWindows();
  await pins([]);assert.deepEqual((await measure()).ids,['launchpad']);await dock.locator('[data-app="launchpad"]').click();await page.waitForSelector('.alp-search');await clearWindows();
  await pins(null);await settings();await page.locator('#air-dock-theme').selectOption('classic');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='classic');await clearWindows();
  const classicIds=await dock.locator('.dock-app:not([hidden])').evaluateAll(nodes=>nodes.map(el=>el.dataset.app));assert.deepEqual(classicIds,Object.keys(original));
  await viewport(1650,930);await page.screenshot({path:path.join(__dirname,'../docs/visual/air-classic-b1-1650.png')});
  await settings();assert.equal(await page.locator('#air-desktop-theme').inputValue(),'modern');await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  await page.reload();await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');assert.equal((await measure()).ids.length,6);
  assert.equal(await page.evaluate(async()=> (await window.airOS.preferences.get()).dockPins),null);
  assert.deepEqual(errors,[]);console.log('PASS pins/overflow/empty/new original icon/Classic/independent themes/persistence; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
