'use strict';
// Optional real Electron check: isolated userData only; external Playwright, no project dependency.
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use an isolated Electron test profile');
const{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9246');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],measurements=[];
  page.on('pageerror',e=>errors.push(e.message));assert.match(page.url(),/login\.html$/);
  const password=crypto.randomBytes(20).toString('hex'),alice='k1alice'+crypto.randomBytes(4).toString('hex'),bob='k1bob'+crypto.randomBytes(4).toString('hex');
  async function create(username){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   for(const[id,value]of [['create-display-name',username===alice?'K1 Alice':'K1 Bob'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airHomeReminders);await page.emulateMedia({reducedMotion:'reduce'});
  }
  async function clear(){await page.evaluate(()=>{for(const win of openApps.values())win.querySelector('.close').click()});await page.waitForFunction(()=>openApps.size===0)}
  async function home(){await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('Air Home');await page.locator('[data-start-app="home"]').click();await page.waitForFunction(()=>document.querySelector('.air-home-reminders-status')?.textContent!=='Erinnerungen werden geladen …')}
  page.on('dialog',dialog=>dialog.accept());
  const baselineCommit='617b1b293ef5a5b075c2c5819c0b84238731e1a3';
  const baselineCSS=require('node:child_process').execFileSync('git',['show',baselineCommit+':styles.css'],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
  const notes=page.locator('.air-notes-window');
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  async function before(){await page.evaluate(css=>{document.querySelector('link[href="styles.css"]').disabled=true;const style=document.createElement('style');style.id='k1-parent-style';style.textContent=css;document.head.append(style)},baselineCSS)}
  async function after(){await page.evaluate(()=>{document.querySelector('#k1-parent-style').remove();document.querySelector('link[href="styles.css"]').disabled=false})}
  async function snapshot(){const result=await page.evaluate(async()=>{
   await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));
   const win=openApps.get('notes'),q=s=>win.querySelector(s),r=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}},c=el=>getComputedStyle(el);
   const read=el=>{const style=c(el);return Object.fromEntries(['color','backgroundColor','backgroundImage','fontFamily','fontSize','lineHeight','padding','borderColor','borderWidth','borderRadius','opacity'].map(k=>[k,style[k]]))};
   return{geometry:[win,...win.querySelectorAll('*')].map(el=>({tag:el.tagName,id:el.id,classes:el.className,...r(el)})),window:r(win),colors:{status:c(q('#note-status')).color,statusBackground:c(q('.note-actions')).backgroundColor,placeholder:getComputedStyle(q('#note-body'),'::placeholder').color,placeholderOpacity:getComputedStyle(q('#note-body'),'::placeholder').opacity,editorBackground:c(q('.note-workspace')).backgroundColor,titlePlaceholder:getComputedStyle(q('#note-title'),'::placeholder').color},notesStyle:[win,...win.querySelectorAll('*')].map(read),others:Object.fromEntries(['.air-home-main','.air-home-nav','.air-home-inbox','.air-home-notes-status','.air-home-due','.dock','#air-island-toggle','#air-island-panel'].map(s=>{const el=document.querySelector(s);return[s,{...read(el),...r(el)}]}))};
  });
   // Chromium128 getComputedStyle(::placeholder) returns parent text color. Inspect the actual UA placeholder node.
   const doc=await cdp.send('DOM.getDocument',{depth:0});
   for(const selector of ['#note-body','#note-title']){
    const{nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector});const{node}=await cdp.send('DOM.describeNode',{nodeId,depth:4,pierce:true});let placeholder;
    const walk=n=>{if(n.attributes?.includes('-webkit-input-placeholder'))placeholder=n;for(const child of [...n.children||[],...n.shadowRoots||[]])walk(child)};walk(node);assert.ok(placeholder,'actual rendered placeholder node');
    const{nodeIds}=await cdp.send('DOM.pushNodesByBackendIdsToFrontend',{backendNodeIds:[placeholder.backendNodeId]});const{computedStyle}=await cdp.send('CSS.getComputedStyleForNode',{nodeId:nodeIds[0]});const style=Object.fromEntries(computedStyle.map(x=>[x.name,x.value]));assert.equal(style.display,'block');
    if(selector==='#note-body'){result.colors.placeholder=style.color;result.colors.placeholderOpacity=style.opacity}else result.colors.titlePlaceholder=style.color;
   }
   return result;
  }
  function contrast(fg,bg){const L=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).reduce((a,v,i)=>a+(v<=.04045?v/12.92:((v+.055)/1.055)**2.4)*[.2126,.7152,.0722][i],0);const [a,b]=[L(fg),L(bg)].sort((a,b)=>a-b);return(b+.05)/(a+.05)}
  function ratios(state){return{status:contrast(state.colors.status,state.colors.statusBackground),placeholder:contrast(state.colors.placeholder,state.colors.editorBackground)}}
  await create(alice);await page.evaluate(()=>persistAirDockTheme('modern'));await clear();await page.evaluate(()=>window.airOS.notes.save({title:'K1 Vorhandene Testnotiz',body:'Nur synthetische Testdaten'}));
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await clear();await home();await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notizen');await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent==='Notiz geladen.');await page.locator('#new-note').click();
   // Render original parent styles in this same real Electron viewport, with exactly the same DOM/data.
   await before();const original=await snapshot();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-notes-k1-before-'+width+'.png')});await after();const updated=await snapshot();await page.screenshot({path:path.join(__dirname,'../docs/visual/air-notes-k1-after-'+width+'.png')});
   assert.deepEqual(updated.geometry,original.geometry,'no layout shift');assert.deepEqual(updated.others,original.others,'other app surfaces and dock/island unchanged');
   const changedColors=[];for(let i=0;i<updated.notesStyle.length;i++){const a={...updated.notesStyle[i]},b={...original.notesStyle[i]};if(a.color!==b.color){changedColors.push(updated.geometry[i].id);delete a.color;delete b.color;if(updated.geometry[i].id==='note-status'){assert.equal(a.borderWidth,'0px');assert.equal(b.borderWidth,'0px');delete a.borderColor;delete b.borderColor}}assert.deepEqual(a,b,'all non-color Notes styles unchanged')}
   assert.deepEqual(changedColors,['note-status']);assert.equal(updated.colors.status,'rgb(95, 116, 100)');assert.equal(updated.colors.placeholder,'rgb(95, 116, 100)');assert.equal(updated.colors.titlePlaceholder,'rgb(95, 116, 100)');assert.equal(updated.colors.placeholderOpacity,'1');assert.equal(updated.colors.editorBackground,'rgb(248, 247, 243)');assert.equal(updated.colors.statusBackground,'rgb(248, 247, 243)');
   const oldRatio=ratios(original),newRatio=ratios(updated);for(const key of ['status','placeholder']){assert.ok(oldRatio[key]<4.5);assert.ok(newRatio[key]>=4.5);assert.ok(Math.abs(newRatio[key]-4.6992)<.00001)}
   await page.evaluate(()=>persistAirDesktopTheme('classic'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='classic');await before();const classicBefore=await snapshot();await after();const classicAfter=await snapshot();assert.deepEqual(classicAfter,classicBefore,'Classic is exactly unchanged');await page.evaluate(()=>persistAirDesktopTheme('modern'));await page.waitForFunction(()=>document.documentElement.dataset.desktopTheme==='modern');
   const title='K1 Gespeichert '+width;await page.locator('#note-title').fill(title);await page.locator('#note-body').fill('K1 synthetischer Inhalt');await page.locator('#save-note').click();await page.waitForFunction(title=>document.querySelector('.air-home-notes-list').textContent.includes(title),title);await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz im Benutzerprofil gespeichert.');assert.equal(await page.locator('#air-island-note-notice').getAttribute('hidden'),null);await page.locator('#delete-note').click();await page.waitForFunction(title=>!document.querySelector('.air-home-notes-list').textContent.includes(title),title);await page.waitForFunction(()=>document.querySelector('#note-status').textContent==='Notiz gelöscht.');
   measurements.push({viewport:[width,height],window:updated.window,statusStyle:updated.notesStyle[updated.geometry.findIndex(el=>el.id==='note-status')],before:original.colors,after:updated.colors,contrastBefore:oldRatio,contrastAfter:newRatio,geometryComparedElements:updated.geometry.length,layoutUnchanged:true,classicUnchanged:true,otherSurfacesUnchanged:true});
   console.log('PASS true Electron before/after, computed contrast, identical geometry/Classic/other surfaces, Notes CRUD and E3',width,JSON.stringify(newRatio));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/air-notes-k1-measurements.json'),JSON.stringify({baselineCommit,platform:process.platform,placeholderMeasurement:'CDP CSS.getComputedStyleForNode on actual UA shadow placeholder',viewports:measurements},null,2)+'\n');console.log('PASS no renderer errors; Linux only, no native Windows/macOS claim');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
