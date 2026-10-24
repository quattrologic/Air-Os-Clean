'use strict';
// Optional real Linux Electron GUI verification. No emulated Windows/macOS claim.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron profile');
const before=process.env.AIR_GUI_BASELINE==='1',phase=before?'before':'after';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||`http://127.0.0.1:${before?9252:9253}`);
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
  if(!/login\.html$/.test(page.url())){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html')}
  assert.match(page.url(),/login\.html$/);
  const username='glass'+crypto.randomBytes(5).toString('hex'),password=crypto.randomBytes(20).toString('hex');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  for(const [id,value]of [['create-display-name','Design-Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
  const defaults=await page.evaluate(()=>window.airOS.preferences.get());assert.equal(defaults.desktopTheme,'modern');assert.equal(defaults.dockTheme,before?'classic':'modern');
  await page.evaluate(()=>persistAirDockTheme('modern'));await page.emulateMedia({reducedMotion:'reduce'});
  const baseline=before?null:JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/air-soft-glass-before.json')));
  const clear=async()=>{await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)};
  const prefs=patch=>page.evaluate(async patch=>{persistAirSettings(patch);await airSettingsWrites},patch);
  const shot=label=>page.screenshot({path:path.join(__dirname,`../docs/visual/air-soft-glass-${phase}-${label}.png`)});
  async function measure(){return page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
   const skin=s=>{const c=getComputedStyle(document.querySelector(s));return Object.fromEntries(['backgroundColor','borderRadius','borderColor','boxShadow','backdropFilter','filter','color'].map(k=>[k,c[k]]))};
   return{dock:rect('.dock'),island:rect('#air-island-toggle'),system:rect('#air-system-toggle'),dockSkin:skin('.dock'),islandSkin:skin('#air-island-toggle'),systemSkin:skin('#air-system-toggle'),icons:Array.from(document.querySelectorAll('.dock-app:not([hidden]) .dock-icon'),e=>e.innerHTML),dockOverflow:document.querySelector('.dock').scrollWidth>document.querySelector('.dock').clientWidth};
  })}
  await clear();
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await page.mouse.move(2,height/2);const g=await measure();
   assert.equal(g.dock.y+g.dock.height,height);assert.equal(g.island.y,0);assert.equal(g.island.x+g.island.width/2,width/2);assert.equal(g.dockOverflow,false);assert.equal(g.dock.width,358);assert.equal(g.dock.height,68);
   if(!before){const old=baseline.rows.find(r=>r.viewport[0]===width);assert.deepEqual(g.dock,old.dock);assert.deepEqual(g.island,old.island);assert.deepEqual(g.icons.slice(1),old.icons.slice(1));assert.match(g.dockSkin.backgroundColor,/.+0\.84\)/);assert.equal(g.dockSkin.borderRadius,'20px');assert.equal(g.systemSkin.backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(g.systemSkin.boxShadow,'none');assert.match(g.icons[0],/fill="#fff"/);assert.doesNotMatch(g.icons[0],/<image|<rect| id=|mask=/)}
   await shot('desktop-'+width);
   await page.locator('#air-system-toggle').focus();await page.keyboard.press('Enter');await page.locator('#air-system-panel').waitFor();await page.keyboard.press('Escape');assert.ok(await page.locator('#air-system-toggle').evaluate(e=>e===document.activeElement));
   await page.locator('.dock [data-app="launchpad"]').focus();await page.keyboard.press('Space');await page.locator('#air-start-search').waitFor();await page.locator('#air-start-search').fill('notes');assert.equal(await page.locator('[data-start-app="notes"]').count(),1);
   await page.keyboard.press('Escape');
   await page.locator('#air-island-toggle').click();await page.locator('#air-island-panel').waitFor();await shot('control-'+width);await page.locator('#air-island-view-quick').click();assert.equal(await page.locator('#air-island-quick-cards button').count(),4);await page.keyboard.press('Escape');assert.ok(await page.locator('#air-island-toggle').evaluate(e=>e===document.activeElement));
   await page.evaluate(()=>openApp('home'));await page.waitForSelector('.air-home');
   const home=await page.locator('.air-home').evaluate(e=>{const r=openApps.get('home').getBoundingClientRect(),n=e.querySelector('.air-home-nav').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,navWidth:n.width}});
   if(!before)assert.deepEqual(home,baseline.rows.find(r=>r.viewport[0]===width).home);
   await shot('home-'+width);await clear();
   await prefs({desktopTheme:'classic',dockTheme:'classic'});
   const classic=await measure();if(!before)assert.deepEqual(classic,baseline.rows.find(r=>r.viewport[0]===width).classic);
   await page.locator('.dock [data-app="launchpad"]').click();await page.waitForFunction(()=>openApps.has('launchpad'));await clear();
   await prefs({desktopTheme:'modern',dockTheme:'modern'});
   rows.push({viewport:[width,height],...g,home,classic});console.log('PASS',phase,width,'geometry, original icons, menus/keys/focus, Home and Classic');
  }
  if(!before){
   await prefs({dockPins:['notes','unknown-reference'],desktopTheme:'classic',dockTheme:'classic'});await page.reload();await page.waitForFunction(()=>!!window.airStartMenu);await clear();const saved=await page.evaluate(()=>window.airOS.preferences.get());assert.deepEqual(saved.dockPins,['notes','unknown-reference']);assert.equal(saved.desktopTheme,'classic');assert.equal(saved.dockTheme,'classic');
   await prefs({dockPins:null,desktopTheme:'modern',dockTheme:'modern',reduceGlass:true});
   const reduced=await measure();assert.equal(reduced.dockSkin.backgroundColor,'rgb(9, 11, 12)');assert.equal(reduced.dockSkin.backdropFilter,'none');assert.equal(reduced.islandSkin.backgroundColor,'rgb(9, 11, 12)');assert.equal(reduced.islandSkin.backdropFilter,'none');await prefs({reduceGlass:false});
   await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('.dock').evaluate(e=>getComputedStyle(e).backdropFilter),'none');await page.emulateMedia({forcedColors:'none'});
   await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>!airDockReferences(readAirSettings().dockPins).includes('notes'));assert.ok(await page.locator('#air-start-menu').isVisible());await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>airDockReferences(readAirSettings().dockPins).includes('notes'));await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Neue Notiz');await page.locator('#note-title').fill('Isolierte Testnotiz');await page.locator('#note-body').fill('Synthetischer Testinhalt');await page.locator('#save-note').click();await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');await clear();
   console.log('PASS saved choices/pins after reload, reduced glass, forced colors, pin/unpin and real Notes save');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,`../docs/visual/air-soft-glass-${phase}.json`),JSON.stringify({defaults,rows,errors},null,2)+'\n');
  console.log('PASS real Linux Electron; no renderer errors');await page.evaluate(()=>window.airOS.quit());
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
