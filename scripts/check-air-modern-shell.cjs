'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9233');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='a3gui'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','A3 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  const panel=page.locator('#air-system-panel'),toggle=page.locator('#air-system-toggle');
  async function open(){if(!await panel.isVisible())await toggle.click()}
  async function app(id){await open();await panel.locator(`[data-app="${id}"]`).click();await page.waitForFunction(id=>openApps.has(id),id)}
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function theme(value){await app('settings');await page.locator('#air-desktop-theme').selectOption(value);await page.waitForFunction(t=>document.documentElement.dataset.desktopTheme===t,value);await page.waitForFunction(()=>!document.querySelector('#air-desktop-theme').disabled)}
  await page.emulateMedia({reducedMotion:'reduce'});
  await clearWindows();
  for(const [width,height] of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});
   // Classic must restore the original chrome; use the original settings route there.
   await theme('classic');await clearWindows();
   assert.ok(await page.locator('.menubar').isVisible());assert.ok(await page.locator('.desktop-icons').isVisible());
   assert.equal(await toggle.isVisible(),false);
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-classic-a3-${width}.png`)});
   await page.locator('.dock [data-app="settings"]').evaluate(button=>button.click());
   await page.locator('#air-desktop-theme').selectOption('modern');await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');await clearWindows();
   assert.equal(await page.locator('.menubar').isVisible(),false);assert.equal(await page.locator('.desktop-icons').isVisible(),false);
   assert.ok(await page.locator('.dock').isVisible());assert.ok(await page.locator('#air-island-toggle').isVisible());
   assert.equal(await page.locator('.desktop-icon').first().evaluate(el=>el.getClientRects().length),0);
   await toggle.focus();await page.keyboard.press('Enter');assert.ok(await panel.isVisible());
   await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),false);assert.ok(await toggle.evaluate(el=>el===document.activeElement));
   await page.keyboard.press('Space');assert.ok(await panel.isVisible());
   await page.keyboard.press('Escape');await page.keyboard.press('Tab');assert.equal(await toggle.evaluate(el=>el===document.activeElement),false);
   await page.locator('#air-island-toggle').click();assert.ok(await page.locator('#air-island-panel').isVisible());await page.keyboard.press('Escape');
   await app('finder');await page.evaluate(()=>{openApps.get('finder').querySelector('.maximize').click()});
   const controls=page.locator('.app-window .traffic');const frame=await controls.boundingBox();assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.width<=width&&frame.y+frame.height<=height);
   await page.locator('.app-window .minimize').click();await page.waitForFunction(()=>openApps.get('finder').style.display==='none');await app('finder');
   await page.locator('.dock [data-app="launchpad"]').click();await page.waitForFunction(()=>openApps.has('launchpad'));await page.locator('.air-launchpad [data-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await clearWindows();
   await open();await panel.locator('[data-system-action="air-search-open"]').click();
   await page.locator('.air-search-field').fill('Notizen');assert.ok(await page.locator('.air-search-overlay').isVisible());await page.keyboard.press('Escape');
   await page.keyboard.press('Control+k');assert.ok(await page.locator('.air-search-overlay').isVisible());await page.keyboard.press('Escape');
   // Native profile controls remain in the accessible, scrollable system popup.
   await open();await page.locator('#account-toggle').click();assert.ok(await page.locator('#sign-out-button').isVisible());
   const bounds=await panel.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width&&bounds.y+bounds.height<=height);
   if(width===390)await page.screenshot({path:path.join(__dirname,'../docs/visual/air-modern-a3-menu-390.png')});
   await page.keyboard.press('Escape');
   await open();if(!await panel.locator('details').evaluate(el=>el.open))await panel.locator('summary').click();await panel.locator('[data-system-action="help-menu"]').click();await page.waitForFunction(()=>openApps.has('about'));await clearWindows();
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-modern-a3-${width}.png`)});
   console.log(`PASS ${width}x${height}: themes/chrome, keyboard, apps, search, profile, viewport`);
  }
  await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  await app('settings');assert.equal(await page.locator('#air-desktop-theme').inputValue(),'modern');
  await clearWindows();await open();await page.locator('#account-toggle').click();await page.locator('#sign-out-button').click();await page.waitForURL('**/login.html');
  // New renderer/Main session reads the same persisted account preferences.
  await page.locator('#login-username').evaluate((el,value)=>{el.value=value},username);await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  assert.deepEqual(errors,[]);console.log('PASS persistence after reload and logout/login; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
