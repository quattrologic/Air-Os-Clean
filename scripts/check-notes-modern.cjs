'use strict';
// Optional real Electron check: isolated userData only; external Playwright, no project dependency.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron test profile');
const{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9245');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],measurements=[];
  page.on('pageerror',e=>errors.push(e.message));assert.match(page.url(),/login\.html$/);
  const password=crypto.randomBytes(20).toString('hex'),alice='f1alice'+crypto.randomBytes(4).toString('hex'),bob='f1bob'+crypto.randomBytes(4).toString('hex');
  async function create(username){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   for(const[id,value]of [['create-display-name',username===alice?'F1 Alice':'F1 Bob'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeReminders);await page.emulateMedia({reducedMotion:'reduce'});
  }
  async function clear(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function home(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Air Home');await page.locator('[data-start-app="home"]').click();await page.waitForFunction(()=>document.querySelector('.air-home-reminders-status')?.textContent!=='Erinnerungen werden geladen …')}
  page.on('dialog',dialog=>dialog.accept());
  const notes=page.locator('.air-notes-window');
  async function launchNotes(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notizen');await page.locator('[data-start-app="notes"]').click();await notes.waitFor();await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Notiz geladen.')}
  async function contains(title,present=true){await page.waitForFunction(({title,present})=>[...document.querySelectorAll('.air-home-notes-list li')].some(el=>el.textContent===title)===present,{title,present})}
  async function skin(){await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))});return page.evaluate(()=>{
   const win=openApps.get('notes'),selectors=['.window-titlebar','.window-title','.note-list','.note-workspace','.note-title-input','.note-editor','.note-actions','#save-note','#delete-note','#new-note','.air-note-item.selected'];
   const read=el=>{const c=getComputedStyle(el);return Object.fromEntries(['backgroundColor','backgroundImage','color','borderRadius','borderColor','fontFamily','fontSize','padding','display','gridTemplateColumns','backdropFilter'].map(k=>[k,c[k]]))};
   return{window:read(win),...Object.fromEntries(selectors.map(s=>[s,read(win.querySelector(s))]))};
  })}
  async function baselineSkin(expectedOthers){
   const css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8').split('/* F1: Notes only,')[0];
   await page.evaluate(css=>{document.querySelector('link[href="styles.css"]').disabled=true;const s=document.createElement('style');s.id='f1-baseline-css';s.textContent=css;document.head.append(s)},css);
   try{const result=await skin();if(expectedOthers)assert.deepEqual(await others(),expectedOthers);return result}finally{await page.evaluate(()=>{document.querySelector('#f1-baseline-css').remove();document.querySelector('link[href="styles.css"]').disabled=false})}
  }
  async function others(){return page.evaluate(()=>Object.fromEntries(['.air-home-main','.air-home-nav','.air-home-inbox','.dock','#air-island-toggle'].map(s=>{const c=getComputedStyle(document.querySelector(s));return[s,[c.backgroundColor,c.backgroundImage,c.color,c.borderRadius,c.padding,c.fontFamily]]})))}
  await create(alice);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await page.evaluate(()=>window.airOS.notes.save({title:'F1 Gedanken für morgen',body:'Eine synthetische Testnotiz.\nMintgrüne Navigation und ein ruhiger Platz zum Schreiben.'}));
  const icons=await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML));
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clear();await home();await launchNotes();
   const modern=await skin();assert.equal(modern.window.backgroundColor,'rgb(156, 218, 161)');assert.equal(modern['.note-list'].backgroundColor,'rgb(176, 229, 173)');assert.equal(modern['.note-workspace'].backgroundColor,'rgb(248, 247, 243)');assert.equal(modern['.note-title-input'].color,'rgb(44, 59, 49)');assert.equal(modern.window.backdropFilter,'none');assert.equal(modern['#save-note'].backgroundImage,'none');
   const unaffected=await others();await baselineSkin(unaffected);assert.deepEqual(await others(),unaffected);
   // Compare Classic with the complete pre-F1 stylesheet, not a guessed fallback color.
   await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='classic');const classic=await skin();assert.deepEqual(classic,await baselineSkin());await page.screenshot({path:path.join(__dirname,'../docs/visual/air-notes-f1-classic-'+width+'.png')});
   await page.evaluate(()=>persistAirDesktopTheme('modern'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');assert.deepEqual(await skin(),modern);
   const metrics=await notes.evaluate(win=>{const r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{window:r(win),sidebar:r(win.querySelector('.note-list')),editor:r(win.querySelector('.note-workspace')),title:r(win.querySelector('#note-title')),body:r(win.querySelector('#note-body')),save:r(win.querySelector('#save-note')),remove:r(win.querySelector('#delete-note')),newNote:r(win.querySelector('#new-note')),contentOverflow:win.querySelector('.window-content').scrollWidth>win.querySelector('.window-content').clientWidth}});
   assert.equal(metrics.contentOverflow,false);for(const id of ['save','remove','newNote','title','body']){const b=metrics[id];assert.ok(b.x>=metrics.window.x&&b.x+b.width<=metrics.window.x+metrics.window.width+1,id+' horizontal bounds');assert.ok(b.y>=metrics.window.y&&b.y+b.height<=metrics.window.y+metrics.window.height+1,id+' vertical bounds')}
   await page.locator('#note-title').focus();assert.equal(await page.locator('#note-title').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');await page.screenshot({path:path.join(__dirname,'../docs/visual/air-notes-f1-modern-'+width+'.png')});
   await page.locator('#new-note').click();await page.locator('#note-title').fill('F1 Neue Notiz '+width);await page.locator('#note-body').fill('F1 synthetischer Inhalt');await page.locator('#save-note').click();await contains('F1 Neue Notiz '+width);await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');
   await page.locator('#note-title').fill('F1 Bearbeitet '+width);await page.locator('#save-note').click();await contains('F1 Bearbeitet '+width);assert.equal(await page.locator('#air-island-note-notice').getAttribute('hidden'),null);await page.locator('#delete-note').click();await contains('F1 Bearbeitet '+width,false);await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz gelöscht.');await page.locator('.air-note-item').filter({hasText:'F1 Gedanken für morgen'}).click();assert.equal(await page.locator('#note-title').inputValue(),'F1 Gedanken für morgen');
   const before=await notes.boundingBox(),bar=await notes.locator('.window-titlebar').boundingBox();await page.mouse.move(bar.x+bar.width-40,bar.y+16);await page.mouse.down();await page.mouse.move(bar.x+bar.width-50,bar.y+26);await page.mouse.up();const moved=await notes.boundingBox();assert.notEqual(moved.x,before.x);
   await notes.locator('.maximize').click();assert.ok(await notes.evaluate(el=>el.classList.contains('maximized')));await notes.locator('.maximize').click();await notes.locator('.minimize').click();await notes.waitFor({state:'hidden'});await page.evaluate(()=>openApp('notes'));await notes.waitFor();await notes.locator('.close').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!openApps.has('notes'));
   assert.deepEqual(await page.locator('.dock .dock-icon').evaluateAll(nodes=>nodes.map(el=>el.innerHTML)),icons);measurements.push({viewport:[width,height],...metrics,modern,classic});console.log('PASS computed Mint design, Classic baseline equivalence, Notes CRUD/E3/Island, keyboard/focus, existing window controls',width);
  }
  await launchNotes();assert.equal(await page.evaluate(()=>{const t=document.querySelector('.air-home-inbox');document.querySelector('#sign-out-button').click();return t.querySelectorAll('li').length}),0);await page.waitForURL('**/login.html');await create(bob);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await home();assert.equal(await page.locator('.air-home-notes-status').textContent(),'Noch keine Notizen vorhanden.');
  await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.getByTitle('Als '+alice+' anmelden',{exact:true}).click();await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeNotes);await clear();await home();await launchNotes();assert.equal(await page.locator('#note-title').inputValue(),'F1 Gedanken für morgen');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'../docs/visual/air-notes-f1-measurements.json'),JSON.stringify(measurements,null,2)+'\n');console.log('PASS Alice/Bob profile separation and re-login persistence, no renderer errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
