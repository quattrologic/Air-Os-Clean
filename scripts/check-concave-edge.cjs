'use strict';
// Optional real Linux Electron GUI verification. No emulated Windows/macOS claim.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron profile');
const before=process.env.AIR_GUI_BASELINE==='1',phase=before?'before':'after';
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||`http://127.0.0.1:${before?9262:9263}`);
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
  if(!/login\.html$/.test(page.url())){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html')}
  assert.match(page.url(),/login\.html$/);
  const username='glass'+crypto.randomBytes(5).toString('hex'),password=crypto.randomBytes(20).toString('hex');
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  for(const [id,value]of [['create-display-name','Design-Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
  const defaults=await page.evaluate(()=>window.airOS.preferences.get());assert.equal(defaults.desktopTheme,'modern');assert.equal(defaults.dockTheme,'modern');
  await page.evaluate(()=>persistAirDockTheme('modern'));await page.emulateMedia({reducedMotion:'reduce'});
  const baseline=before?null:JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/air-concave-edge-before.json')));
  const clear=async()=>{await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)};
  const prefs=patch=>page.evaluate(async patch=>{persistAirSettings(patch);await airSettingsWrites},patch);
  const shot=label=>page.screenshot({path:path.join(__dirname,`../docs/visual/air-concave-edge-${phase}-${label}.png`)});
  async function measure(){return page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
   const skin=s=>{const c=getComputedStyle(document.querySelector(s));return Object.fromEntries(['backgroundColor','borderRadius','borderColor','boxShadow','backdropFilter','filter','color'].map(k=>[k,c[k]]))};
   const dockEl=document.querySelector('.dock'),dock=rect('.dock');dockEl.scrollLeft=100;const dockScrollable=dockEl.scrollLeft!==0;dockEl.scrollLeft=0;const lowerRows=[.5,2,8,16,24].map(offset=>({offset,covered:Array.from({length:Math.floor(dock.width)},(_,x)=>document.elementFromPoint(dock.x+x+.5,dock.y+dock.height-offset)?.closest('.dock')?1:0).reduce((a,b)=>a+b,0)}));return{lowerRows,arrow:getComputedStyle(document.querySelector('#air-island-toggle>span')).display,dock:rect('.dock'),island:rect('#air-island-toggle'),system:rect('#air-system-toggle'),dockSkin:skin('.dock'),islandSkin:skin('#air-island-toggle'),systemSkin:skin('#air-system-toggle'),icons:Array.from(document.querySelectorAll('.dock-app:not([hidden]) .dock-icon'),e=>e.innerHTML),dockOverflow:dockScrollable};
  })}
  await clear();
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await page.mouse.move(2,height/2);const g=await measure();
   assert.equal(g.dock.y+g.dock.height,height);assert.equal(g.island.y,0);assert.equal(g.island.x+g.island.width/2,width/2);assert.equal(g.dockOverflow,false);assert.equal(g.dock.width,358);assert.equal(g.dock.height,68);
   if(!before){const old=baseline.rows.find(r=>r.viewport[0]===width);assert.deepEqual(g.dock,old.dock);assert.deepEqual(g.island,old.island);assert.equal(g.lowerRows.find(r=>r.offset===2).covered,358);assert.equal(g.arrow,'none');assert.deepEqual(g.icons,old.icons);assert.match(g.dockSkin.backgroundColor,/.+0\.70?\)/);assert.equal(g.dockSkin.borderRadius,'22px 22px 0px 0px');assert.equal(g.systemSkin.backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(g.systemSkin.boxShadow,'none');assert.match(g.icons[0],/fill="#fff"/);assert.doesNotMatch(g.icons[0],/<image|<rect| id=|mask=/)}
   await page.waitForFunction(()=>!document.querySelector('#toast')?.classList.contains('show')&&Number(getComputedStyle(document.querySelector('#toast')).opacity)===0);
   await shot('desktop-'+width);
   await page.locator('.dock [data-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Neue Notiz');await page.mouse.move(2,height/2);
   await shot('notes-'+width);
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-concave-edge-${phase}-dock-${width}.png`),clip:{x:g.dock.x-16,y:g.dock.y-4,width:g.dock.width+32,height:g.dock.height+4}});
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-concave-edge-${phase}-island-${width}.png`),clip:{x:g.island.x-16,y:0,width:g.island.width+32,height:g.island.height+6}});
   await page.screenshot({path:path.join(__dirname,`../docs/visual/air-concave-edge-${phase}-lower-edge-${width}.png`),clip:{x:g.dock.x-4,y:g.dock.y+g.dock.height-28,width:g.dock.width+8,height:28}});
   for(const [side,x] of [['left',g.dock.x-16],['right',g.dock.x+g.dock.width-36]])await page.screenshot({path:path.join(__dirname,`../docs/visual/air-concave-edge-${phase}-${side}-${width}.png`),clip:{x,y:g.dock.y-4,width:52,height:g.dock.height+4}});
   const {PNG}=require('pngjs'),visible=PNG.sync.read(await page.screenshot());
   await page.locator('.dock').evaluate(e=>e.style.setProperty('display','none','important'));await page.locator('#air-island-toggle').evaluate(e=>e.style.setProperty('display','none','important'));
   const wallpaper=PNG.sync.read(await page.screenshot());
   await page.locator('.dock').evaluate(e=>e.style.removeProperty('display'));await page.locator('#air-island-toggle').evaluate(e=>e.style.removeProperty('display'));
   const coverage=(rect,y)=>{const xs=[];for(let x=Math.ceil(rect.x-12);x<Math.floor(rect.x+rect.width+12);x++){const i=(Math.floor(y)*visible.width+x)*4;if(Math.max(...[0,1,2].map(c=>Math.abs(visible.data[i+c]-wallpaper.data[i+c])))>=20)xs.push(x)}return{covered:xs.length,left:xs[0],right:xs.at(-1)}};
   const silhouette={dock:[2,4,8,12,16,24].map(offset=>({offset,...coverage(g.dock,height-offset)})),island:[2,4,8,12].map(offset=>({offset,...coverage(g.island,offset)}))};
   console.log(JSON.stringify(silhouette));
   if(!before){assert.ok(silhouette.dock[0].covered>=g.dock.width,'straight full-width base plus inverse feet');assert.ok(silhouette.dock[0].covered>silhouette.dock[2].covered,'feet flare towards floor');assert.ok(silhouette.island[0].covered>silhouette.island[2].covered,'mirrored top feet');}
   const hitChecks=await page.evaluate(()=>{
    const dock=document.querySelector('.dock'),r=dock.getBoundingClientRect();
    const buttons=Array.from(dock.querySelectorAll('.dock-app:not([hidden])'),e=>{const b=e.getBoundingClientRect(),icon=e.querySelector('.dock-icon').getBoundingClientRect();return{id:e.dataset.app,width:b.width,height:b.height,inside:b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom,iconInside:icon.left>=b.left&&icon.right<=b.right&&icon.top>=b.top&&icon.bottom<=b.bottom,hit:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('.dock-app')===e}});
    const i=document.querySelector('#air-island-toggle').getBoundingClientRect();
    return{buttons,decorativeFeetBlockClicks:[document.elementFromPoint(r.left-4,r.bottom-2)?.closest('.dock'),document.elementFromPoint(r.right+4,r.bottom-2)?.closest('.dock'),document.elementFromPoint(i.left-4,2)?.closest('#air-island-toggle'),document.elementFromPoint(i.right+4,2)?.closest('#air-island-toggle')].some(Boolean),viewportOverflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.ok(hitChecks.buttons.every(b=>b.hit&&b.inside&&b.iconInside));assert.equal(hitChecks.decorativeFeetBlockClicks,false);assert.equal(hitChecks.viewportOverflow,false);
   const separator=await page.locator('.dock [data-app="launchpad"]').evaluate(e=>{const c=getComputedStyle(e,'::before');return{content:c.content,width:c.width,height:c.height,pointerEvents:c.pointerEvents,position:c.position}});
   if(!before){assert.equal(separator.width,'1px');assert.equal(separator.height,'28px');assert.equal(separator.pointerEvents,'none');assert.equal(separator.position,'absolute');}
   await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.air-notes-window .minimize').click();await page.waitForFunction(()=>openApps.get('notes').style.display==='none');await page.locator('.dock [data-app="notes"]').click();await page.waitForFunction(()=>!openApps.get('notes')._airOSMotion);assert.ok(await page.locator('.air-notes-window').isVisible());await page.emulateMedia({reducedMotion:'reduce'});await clear();
   for(const id of ['finder','browser','music','settings']){await page.locator('.dock [data-app="'+id+'"]').click();await page.waitForFunction(id=>openApps.has(id),id);await clear();}
   await page.locator('#air-system-toggle').focus();await page.keyboard.press('Enter');await page.locator('#air-system-panel').waitFor();await page.keyboard.press('Escape');assert.ok(await page.locator('#air-system-toggle').evaluate(e=>e===document.activeElement));
   await page.locator('.dock [data-app="launchpad"]').focus();await page.keyboard.press('Space');await page.locator('#air-start-search').waitFor();await page.locator('#air-start-search').fill('notes');assert.equal(await page.locator('[data-start-app="notes"]').count(),1);
   await page.keyboard.press('Escape');
   await page.locator('#air-island-toggle').click();await page.locator('#air-island-panel').waitFor();
   const demo=page.locator('.air-island-demo');if(!before){await demo.scrollIntoViewIfNeeded();assert.ok(await demo.isVisible());assert.match(await demo.innerText(),/DEMO.*keine Audiowiedergabe/);assert.equal(await demo.locator('audio,video,button,input').count(),0)}
   await shot('demo-'+width);const panelRect=await page.locator('#air-island-panel').boundingBox();assert.ok(panelRect.y+panelRect.height<g.dock.y);if(!before){const closeRect=await page.locator('#air-island-close').boundingBox();assert.ok(closeRect.y>=panelRect.y&&closeRect.y+closeRect.height<=panelRect.y+panelRect.height);await page.locator('#air-island-close').click();await page.locator('#air-island-panel').waitFor({state:'hidden'});await page.locator('#air-island-toggle').click();await page.locator('#air-island-panel').waitFor()}
   await page.locator('#air-island-view-quick').click();assert.equal(await page.locator('#air-island-quick-cards button').count(),4);await page.keyboard.press('Escape');assert.ok(await page.locator('#air-island-toggle').evaluate(e=>e===document.activeElement));
   await page.keyboard.press('Space');await page.locator('#air-island-panel').waitFor();await page.keyboard.press('Escape');await page.keyboard.press('Enter');await page.locator('#air-island-panel').waitFor();await page.mouse.click(2,height/2);await page.locator('#air-island-panel').waitFor({state:'hidden'});
   await page.evaluate(()=>openApp('home'));await page.waitForSelector('.air-home');
   const home=await page.locator('.air-home').evaluate(e=>{const r=openApps.get('home').getBoundingClientRect(),n=e.querySelector('.air-home-nav').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,navWidth:n.width}});
   if(!before)assert.deepEqual(home,baseline.rows.find(r=>r.viewport[0]===width).home);
   await clear();
   await prefs({desktopTheme:'classic',dockTheme:'classic'});
   const classic=await measure();if(!before)assert.equal(await page.locator('.air-island-demo').isVisible(),false);if(width===390)await shot('classic-390');if(!before)assert.deepEqual(classic,baseline.rows.find(r=>r.viewport[0]===width).classic);
   await page.locator('.dock [data-app="launchpad"]').click();await page.waitForFunction(()=>openApps.has('launchpad'));await clear();
   await prefs({desktopTheme:'modern',dockTheme:'modern'});
   rows.push({viewport:[width,height],...g,silhouette,hitChecks,panelRect,separator,home,classic});console.log('PASS',phase,width,'geometry, original icons, menus/keys/focus, Home and Classic');
  }
  if(!before){
   await prefs({dockPins:['notes','unknown-reference'],desktopTheme:'classic',dockTheme:'classic'});await page.reload();await page.waitForFunction(()=>!!window.airStartMenu);await clear();const saved=await page.evaluate(()=>window.airOS.preferences.get());assert.deepEqual(saved.dockPins,['notes','unknown-reference']);assert.equal(saved.desktopTheme,'classic');assert.equal(saved.dockTheme,'classic');
   await prefs({dockPins:null,desktopTheme:'modern',dockTheme:'modern',reduceGlass:true});
   const reduced=await measure();assert.equal(reduced.dockSkin.backgroundColor,'rgb(9, 11, 12)');assert.equal(reduced.dockSkin.backdropFilter,'none');assert.equal(reduced.islandSkin.backgroundColor,'rgb(9, 11, 12)');assert.equal(reduced.islandSkin.backdropFilter,'none');await prefs({reduceGlass:false});
   await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('.dock').evaluate(e=>getComputedStyle(e).backdropFilter),'none');await page.emulateMedia({forcedColors:'none'});
   await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>!airDockReferences(readAirSettings().dockPins).includes('notes'));assert.ok(await page.locator('#air-start-menu').isVisible());await page.locator('[data-pin-app="notes"]').click();await page.waitForFunction(()=>airDockReferences(readAirSettings().dockPins).includes('notes'));await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Neue Notiz');await page.locator('#note-title').fill('Isolierte Testnotiz');await page.locator('#note-body').fill('Synthetischer Testinhalt');await page.locator('#save-note').click();await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');await clear();
   await prefs({dockPins:[]});assert.equal(await page.locator('.dock [data-app="launchpad"]').evaluate(e=>getComputedStyle(e,'::before').content),'none');await prefs({dockPins:null});
   await page.locator('#air-island-toggle').click();await page.locator('#air-island-note-notice').scrollIntoViewIfNeeded();const notificationPanel=await page.locator('#air-island-panel').boundingBox(),stickyClose=await page.locator('#air-island-close').boundingBox();assert.ok(stickyClose.y>=notificationPanel.y&&stickyClose.y+stickyClose.height<=notificationPanel.y+notificationPanel.height);await page.locator('#air-island-close').click();await page.locator('#air-island-panel').waitFor({state:'hidden'});
   console.log('PASS sticky close after real Notes notice; decorative divider absent for empty pins; saved choices/pins after reload, reduced glass, forced colors, pin/unpin and real Notes save');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,`../docs/visual/air-concave-edge-${phase}.json`),JSON.stringify({defaults,rows,errors},null,2)+'\n');
  console.log('PASS real Linux Electron; no renderer errors');await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
