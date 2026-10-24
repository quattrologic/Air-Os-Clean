'use strict';
// Optional manual Electron GUI check. Requires an isolated test userData directory,
// a running Electron/CDP endpoint and externally available Playwright (no new dependency).
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Run only against an isolated Electron test profile: AIR_GUI_TEST_ISOLATED=1');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9241');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  assert.match(page.url(),/login\.html$/,'Start at login in the isolated test profile');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(20).toString('hex'),username='d1gui'+crypto.randomBytes(4).toString('hex');
  for(const [id,value] of [['create-display-name','D1 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');
  await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>persistAirDockTheme('modern'));
  async function clearWindows(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  await clearWindows();
  const snapshots=[],dock=page.locator('.dock');
  const originalIcons=await dock.locator('.dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML));
  for(const [width,height] of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clearWindows();
   await dock.locator('[data-app="launchpad"]').click();await page.locator('#air-start-search').fill('air home');
   assert.equal(await page.locator('[data-start-app="home"]').count(),1);await page.locator('[data-start-app="home"]').click();
   const home=page.locator('.air-home-window');await home.waitFor();
   const geometry=await page.evaluate(()=>{const win=openApps.get('home'),r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{window:r(win),sidebar:r(win.querySelector('.air-home-nav')),main:r(win.querySelector('.air-home-main')),cards:[...win.querySelectorAll('.air-home-card')].map(r),dock:r(document.querySelector('.dock')),island:r(document.querySelector('#air-island-toggle')),horizontalOverflow:win.querySelector('.air-home-main').scrollWidth>win.querySelector('.air-home-main').clientWidth}});
   assert.equal(geometry.dock.y+geometry.dock.height,height);assert.equal(geometry.dock.width,358);assert.equal(geometry.island.y,0);assert.equal(geometry.horizontalOverflow,false);assert.ok(geometry.window.y+geometry.window.height<=geometry.dock.y);assert.ok(geometry.window.x>=0);assert.ok(geometry.window.x+geometry.window.width<=width);
   if(width===1920){assert.ok(Math.abs(geometry.window.x-200)<1);assert.ok(Math.abs(geometry.window.y-103)<1);assert.ok(Math.abs(geometry.window.width-1522)<1);assert.ok(Math.abs(geometry.window.height-849)<1);assert.ok(Math.abs(geometry.sidebar.width-212)<1);assert.ok(Math.abs(geometry.cards[0].width-380)<1);assert.ok(Math.abs(geometry.cards[3].x-872)<1);assert.ok(Math.abs(geometry.cards[6].x-1272)<1)}
   assert.deepEqual(await dock.locator('.dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML)),originalIcons);
   await page.waitForFunction(()=>!document.querySelector('#toast').classList.contains('show')&&Number(getComputedStyle(document.querySelector('#toast')).opacity)===0);await page.screenshot({path:path.join(__dirname,'../docs/visual/air-home-d1-'+width+'.png')});snapshots.push({viewport:[width,height],...geometry});
   for(const [action,id] of [['finder','finder'],['launchpad','launchpad'],['settings','settings']]){
    await home.locator('[data-home-action="'+action+'"]').click();await page.waitForFunction(id=>openApps.has(id),id);
    await page.evaluate(id=>openApps.get(id).querySelector('.close').click(),id);await page.waitForFunction(id=>!openApps.has(id),id);
   }
   const before=await home.boundingBox();const bar=home.locator('.window-titlebar');const bb=await bar.boundingBox();await page.mouse.move(bb.x+bb.width-12,bb.y+20);await page.mouse.down();await page.mouse.move(bb.x+bb.width-2,bb.y+30);await page.mouse.up();const after=await home.boundingBox();assert.ok(after.x>before.x,'existing drag moves Air Home');
   await home.locator('.maximize').click();assert.ok(await home.evaluate(el=>el.classList.contains('maximized')));await home.locator('.maximize').click();
   await home.locator('.minimize').click();await home.waitFor({state:'hidden'});await page.evaluate(()=>openApp('home'));await home.waitFor();assert.equal(await page.locator('.air-home-window').count(),1);
   await home.locator('.close').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!openApps.has('home'));
   console.log('PASS Home geometry/navigation/existing drag/maximize/minimize/close',width,JSON.stringify(geometry.window));
  }
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='classic');await page.evaluate(()=>openApp('home'));assert.ok(await page.locator('.menubar').isVisible());assert.equal(await dock.locator('[data-app="launchpad"] svg image').count(),0);await clearWindows();
  require('node:fs').writeFileSync(path.join(__dirname,'../docs/visual/air-home-d1-measurements.json'),JSON.stringify(snapshots,null,2)+'\n');
  assert.deepEqual(errors,[]);console.log('PASS Classic, original dock/icons, no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
