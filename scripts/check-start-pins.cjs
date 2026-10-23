'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9236');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='b22alice'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','Alice Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  const dock=page.locator('.dock'),trigger=dock.locator('[data-app="launchpad"]'),menu=page.locator('#air-start-menu'),input=page.locator('#air-start-search');
  async function open(){if(!await menu.isVisible())await trigger.click();await input.waitFor({state:'visible'})}
  async function query(value){await open();await input.fill(value)}
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function prefs(){return page.evaluate(()=>window.airOS.preferences.get())}
  async function setupPins(dockPins){await page.evaluate(async dockPins=>{const user=await window.airOS.currentUser();applyAirSettings(airSettingsCache=await window.airOS.preferences.update({dockPins},user.preferenceSession))},dockPins)}
  async function pin(id,action,key){await query(id);const button=menu.locator(`[data-pin-app="${id}"]`);assert.match(await button.innerText(),action);if(key){await button.focus();await page.keyboard.press(key)}else await button.click();await page.waitForFunction(()=>!document.querySelector('#air-start-status').textContent.includes('werden gespeichert'));assert.ok(await menu.isVisible());assert.equal(await page.evaluate(()=>openApps.size),0)}
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#air-system-toggle').click();await page.locator('#air-system-panel [data-app="settings"]').click();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  for(const [width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await setupPins(null);
   await query('music');await input.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.startApp),'music');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.pinApp),'music');
   await pin('music',/Vom Dock lösen/,'Enter');assert.deepEqual((await prefs()).dockPins,['finder','browser','notes','settings']);
   await pin('spotify',/Anheften/,'Space');assert.deepEqual((await prefs()).dockPins,['finder','browser','notes','settings','spotify']);assert.ok(await dock.locator('[data-app="spotify"]').isVisible());
   assert.ok(await menu.locator('[data-pin-app="spotify"]').evaluate(el=>el===document.activeElement));
   let d=await dock.boundingBox();assert.equal(d.width,358);assert.equal(d.height,68);assert.equal(await dock.evaluate(el=>{el.scrollLeft=100;return el.scrollLeft}),0);
   await input.fill('');await page.mouse.move(width-5,100);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-start-pins-b22-${width}.png`)});
   await pin('spotify',/Vom Dock lösen/);assert.equal(await dock.locator('[data-app="spotify"]').isVisible(),false);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-start-unpinned-b22-${width}.png`)});
   await pin('spotify',/Anheften/);await input.fill('finder');await input.focus();await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement.dataset.startApp),'finder');await page.keyboard.press('Enter');await page.waitForFunction(()=>openApps.has('finder'));await clearWindows();
   console.log('PASS pin/unpin/re-pin and app start',width,height);
  }
  await setupPins(null);await pin('spotify',/Anheften/);assert.match(await menu.locator('[data-start-app="spotify"]').evaluate(el=>el.parentElement.innerText),/unter Alle Apps/);assert.equal(await dock.locator('[data-app="spotify"]').isVisible(),false);await page.screenshot({path:path.join(__dirname,'../docs/visual/air-start-overflow-b22-390.png')});
  await query('about');assert.equal(await menu.locator('[data-pin-app="about"]').isDisabled(),true);
  await query('finder');const before=await prefs();
  const file=path.join('/workspace/.air-os-onboarding/modern-b22-profile/air-os-desktop/profiles',crypto.createHash('sha256').update(username.toLowerCase()).digest('hex'),'appearance-v1.json'),fs=require('node:fs');
  fs.renameSync(file,file+'.gui-backup');fs.mkdirSync(file);
  try{await menu.locator('[data-pin-app="finder"]').click();await page.waitForFunction(()=>document.querySelector('#air-start-status').textContent.includes('konnten nicht gespeichert'));assert.match(await menu.locator('[data-pin-app="finder"]').innerText(),/Vom Dock lösen/)}finally{fs.rmdirSync(file);fs.renameSync(file+'.gui-backup',file)}
  assert.deepEqual(await prefs(),before);await pin('finder',/Vom Dock lösen/);assert.equal((await prefs()).dockPins.includes('finder'),false);
  const alicePins=(await prefs()).dockPins;
  await page.reload();await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');assert.deepEqual((await prefs()).dockPins,alicePins);await clearWindows();
  await page.locator('#air-system-toggle').click();await page.locator('#air-system-panel [data-app="settings"]').click();await page.locator('#air-dock-theme').selectOption('classic');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='classic');assert.deepEqual((await prefs()).dockPins,alicePins);await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.locator('#switch-create').click();
  const bob='b22bob'+crypto.randomBytes(4).toString('hex');for(const[id,value]of [['create-display-name','Bob Test'],['create-username',bob],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');assert.equal((await prefs()).dockPins,null);
  await page.locator('#air-system-toggle').click();await page.locator('#air-system-panel [data-app="settings"]').click();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();await pin('notes',/Vom Dock lösen/);assert.equal((await prefs()).dockPins.includes('notes'),false);
  await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.locator('#login-username').evaluate((el,value)=>{el.value=value},username);await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');assert.deepEqual((await prefs()).dockPins,alicePins);
  assert.deepEqual(errors,[]);console.log('PASS overflow badge/no icon, real storage failure/retry, reload, Classic and Alice/Bob/logout-login isolation; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
