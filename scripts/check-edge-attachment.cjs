'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9238');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='edgesgui'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','Edge Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  const dock=page.locator('.dock'),island=page.locator('#air-island-toggle'),panel=page.locator('#air-island-panel'),measurements=[];
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function settings(){await dock.locator('[data-app="settings"]').click();await page.waitForSelector('#air-desktop-theme')}
  async function theme(value){await settings();await page.locator('#air-desktop-theme').selectOption(value);await page.waitForFunction(value=>document.documentElement.dataset.desktopTheme===value,value);await clearWindows()}
  await page.emulateMedia({reducedMotion:'reduce'});await settings();await page.locator('#air-dock-theme').selectOption('modern');await page.waitForFunction(()=>document.querySelector('.dock').dataset.theme==='modern');await clearWindows();
  const originals=await dock.locator('.dock-app .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML));
  for(const [width,height] of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await theme('classic');const classicIsland=await island.boundingBox(),classicDock=await dock.boundingBox(),host=await page.locator('#windows').boundingBox();assert.equal(classicIsland.y,width===390?37:39);assert.equal(height-classicDock.y-classicDock.height,6);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-edge-c12-classic-${width}.png`)});
   await theme('modern');assert.deepEqual(await page.locator('#windows').boundingBox(),host);const d=await dock.boundingBox(),i=await island.boundingBox();assert.equal(i.y,0);assert.ok(Math.abs(i.x+i.width/2-width/2)<.1);assert.equal(d.y+d.height,height);assert.equal(d.width,358);assert.equal(d.height,68);assert.ok(Math.abs(d.x+d.width/2-width/2)<.1);assert.equal(await dock.evaluate(el=>{el.scrollLeft=100;return el.scrollLeft}),0);assert.equal(await dock.evaluate(el=>getComputedStyle(el).borderBottomLeftRadius),'0px');assert.equal(await island.evaluate(el=>getComputedStyle(el).borderTopLeftRadius),'0px');
   await page.mouse.move(width-5,100);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-edge-c12-modern-${width}.png`)});
   await island.focus();await page.keyboard.press('Enter');await panel.waitFor({state:'visible'});const p=await panel.boundingBox();assert.ok(p.x>=0&&p.x+p.width<=width&&p.y+p.height<d.y);await page.screenshot({path:path.join(__dirname,`../docs/visual/air-edge-c12-panel-${width}.png`)});await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});assert.ok(await island.evaluate(el=>el===document.activeElement));
   await dock.locator('[data-app="finder"]').click();await page.waitForFunction(()=>openApps.has('finder'));await page.locator('.app-window .maximize').click();assert.ok(await page.locator('.app-window .close').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el}));await clearWindows();
   await dock.locator('[data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Notizen');await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await clearWindows();
   measurements.push({viewport:[width,height],island:i,dock:d,topGap:i.y,bottomGap:height-d.y-d.height,panel:p,classicIsland,classicDock});console.log('PASS',JSON.stringify(measurements.at(-1)));
  }
  assert.deepEqual(await dock.locator('.dock-app .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML)),originals);
  await dock.locator('[data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>readAirSettings().dockPins&&!readAirSettings().dockPins.includes('notes'));assert.ok(await page.locator('#air-start-menu').isVisible());await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>readAirSettings().dockPins.includes('notes'));await page.keyboard.press('Escape');assert.equal(await dock.evaluate(el=>{el.scrollLeft=100;return el.scrollLeft}),0);
  assert.deepEqual(errors,[]);require('node:fs').writeFileSync(path.join(__dirname,'../docs/visual/air-edge-c12-measurements.json'),JSON.stringify(measurements,null,2)+'\n');console.log('PASS unchanged original icons, search/launch, pin/unpin, Classic, focus/window controls; no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
