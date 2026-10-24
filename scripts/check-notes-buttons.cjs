'use strict';
// Real Linux Electron captures/hit tests; requires an isolated profile and external Playwright.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use isolated Electron profiles');
const before=process.env.AIR_GUI_BASELINE==='1',phase=before?'before':'after';
const{chromium}=require('playwright');
(async()=>{const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||`http://127.0.0.1:${before?9256:9257}`);
 try{
 const page=browser.contexts()[0].pages()[0],rows=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!page.url().endsWith('login.html')){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html')}
 const password=crypto.randomBytes(20).toString('hex'),username='cb02'+crypto.randomBytes(4).toString('hex');
 if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();for(const[id,value]of [['create-display-name','CB02 Test'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
 const baseline=before?null:JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/cb02-before-measurements.json')));
 const settle=()=>page.waitForFunction(()=>[...openApps.values()].every(w=>!w._airOSMotion));
 const clear=async()=>{await page.evaluate(()=>{for(const w of openApps.values())w.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)};
 async function notes(){await page.evaluate(()=>openApp('notes'));await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Neue Notiz');await settle()}
 async function measure(id='notes'){return page.evaluate(id=>{
  const w=openApps.get(id),rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}},skin=e=>{const c=getComputedStyle(e);return Object.fromEntries(['backgroundColor','color','borderRadius','padding','fontSize','fontFamily','boxShadow'].map(k=>[k,c[k]]))};
  const selectors=id==='notes'?['.window-titlebar','.window-title','.window-content','.note-layout','.note-list','.note-workspace','.note-title-input','.note-editor','.note-actions']:['.window-titlebar','.window-title','.air-home-nav','.air-home-main'];
  return{window:rect(w),layout:Object.fromEntries(selectors.map(s=>[s,{...rect(w.querySelector(s)),...skin(w.querySelector(s))}])),buttons:[...w.querySelectorAll('.traffic button')].map(e=>({label:e.getAttribute('aria-label'),...rect(e),...skin(e)}))};
 },id)}
 const shot=label=>page.screenshot({path:path.join(__dirname,`../docs/visual/cb02-${phase}-${label}.png`)});
 async function corner(type){const b=await page.locator('.air-notes-window .traffic .'+type).boundingBox();await page.mouse.click(b.x+1,b.y+1)}
 const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');
 await clear();
 for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
  await page.setViewportSize({width,height});await notes();await page.mouse.move(2,height/2);const g=await measure();const bar=g.layout['.window-titlebar'];
  await shot('notes-'+width);await page.screenshot({path:path.join(__dirname,`../docs/visual/cb02-${phase}-buttons-${width}.png`),clip:{x:g.window.x+6,y:bar.y,width:180,height:36}});
  const circles=[];
  if(!before){
   const old=baseline.find(r=>r.viewport[0]===width);assert.deepEqual(g.window,old.modern.window);assert.deepEqual(g.layout,old.modern.layout);
   for(let i=0;i<3;i++){
    const b=g.buttons[i];assert.ok(b.width>=24&&b.height>=24);assert.equal(b.y+b.height/2,bar.y+bar.height/2);if(i)assert.equal(b.x-(g.buttons[i-1].x+g.buttons[i-1].width),4);
    const{root}=await cdp.send('DOM.getDocument');const{nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.air-notes-window .traffic button:nth-child('+(i+1)+')'});const{node}=await cdp.send('DOM.describeNode',{nodeId,depth:1});const pseudo=node.pseudoElements.find(e=>e.pseudoType==='before');const{model}=await cdp.send('DOM.getBoxModel',{nodeId:pseudo.nodeId});const q=model.content;
    const circle={x:q[0],y:q[1],width:q[2]-q[0],height:q[7]-q[1]};assert.equal(circle.width,10);assert.equal(circle.height,10);assert.equal(circle.x+5,b.x+b.width/2);assert.equal(circle.y+5,b.y+b.height/2);circles.push(circle);
   }
   const hits=await page.locator('.air-notes-window .traffic button').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return[1,r.width/2,r.width-1].flatMap(x=>[1,r.height/2,r.height-1].map(y=>e.contains(document.elementFromPoint(r.x+x,r.y+y))))}));assert.ok(hits.flat().every(Boolean));
   // Actual mouse clicks in the transparent corner, seven pixels away from the colored disc.
   await corner('maximize');assert.ok(await page.locator('.air-notes-window').evaluate(e=>e.classList.contains('maximized')));assert.equal(await page.locator('.air-notes-window .maximize').evaluate(e=>e.matches(':focus-visible')),false);await corner('maximize');assert.deepEqual((await measure()).window,g.window);
   await corner('minimize');assert.ok(await page.evaluate(()=>!!openApps.get('notes')._airOSMotion));await settle();assert.equal(await page.evaluate(()=>openApps.get('notes').style.display),'none');await page.locator('.dock [data-app="notes"]').click();await settle();assert.deepEqual((await measure()).window,g.window);
   await corner('close');await page.waitForFunction(()=>!openApps.has('notes'));await page.locator('.dock [data-app="notes"]').click();await notes();
   // Keyboard traversal reaches each real button, not a synthetic click handler.
   const close=page.locator('.air-notes-window .close'),min=page.locator('.air-notes-window .minimize'),max=page.locator('.air-notes-window .maximize');await close.focus();await page.keyboard.press('Tab');assert.ok(await min.evaluate(e=>e===document.activeElement));await page.keyboard.press('Tab');assert.ok(await max.evaluate(e=>e===document.activeElement));await page.keyboard.press('Shift+Tab');await page.keyboard.press('Shift+Tab');assert.ok(await close.evaluate(e=>e===document.activeElement));
   assert.equal(await close.evaluate(e=>getComputedStyle(e).outlineWidth),'2px');assert.ok(await close.evaluate(e=>e.matches(':focus-visible')));if(width===390)await shot('focus-390');
   await max.focus();await page.keyboard.press('Space');assert.ok(await page.locator('.air-notes-window').evaluate(e=>e.classList.contains('maximized')));await page.keyboard.press('Enter');assert.deepEqual((await measure()).window,g.window);
   await min.focus();await page.keyboard.press('Enter');await settle();await page.locator('.dock [data-app="notes"]').click();await settle();await close.focus();await page.keyboard.press('Space');await page.waitForFunction(()=>!openApps.has('notes'));await notes();
   await close.hover();assert.notEqual(await close.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');if(width===390)await shot('hover-390');
   const original=(await measure()).window;const start={x:original.x+original.width-40,y:original.y+18};await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(start.x+12,start.y+8,{steps:3});await page.mouse.up();const moved=(await measure()).window;assert.equal(moved.width,original.width);assert.equal(moved.height,original.height);assert.ok(moved.x>original.x||moved.y>original.y,'Titlebar drag remains possible');
   await clear();await notes();
  }
  await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.mouse.move(2,height/2);const classic=await measure();await shot('classic-notes-'+width);if(!before)assert.deepEqual(classic,baseline.find(r=>r.viewport[0]===width).classic);await clear();
  await page.evaluate(()=>persistAirDesktopTheme('modern'));await page.evaluate(()=>openApp('home'));const home=await measure('home');if(!before)assert.deepEqual(home,baseline.find(r=>r.viewport[0]===width).home);await clear();
  rows.push({viewport:[width,height],modern:g,circles,classic,home});console.log('PASS',phase,width,before?'baseline captures':'24px hitboxes, centered 10px pseudo-discs, 27 hit points, real corner clicks, M2/keyboard/focus/hover/drag, unchanged window/title/Classic/Home');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,`../docs/visual/cb02-${phase}-measurements.json`),JSON.stringify(rows,null,2)+'\n');console.log('PASS no renderer errors, Linux only');await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
