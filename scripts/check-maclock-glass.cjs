'use strict';
// Genuine isolated Linux Electron captures. SwiftShader is reported, not native GPU/OS evidence.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Isolated test profile required');
const phase=process.env.AIR_GUI_PHASE||'after',before=phase==='before',fallback=phase==='fallback',port=before?9268:fallback?9270:9269;
(async()=>{
 let browser;for(let attempt=0;attempt<30;attempt++){try{browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:'+port);break}catch(error){if(!/ECONNREFUSED/.test(error.message)||attempt===29)throw error;await new Promise(r=>setTimeout(r,100))}}
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],cleanup=[],rows=[];page.on('pageerror',e=>errors.push(e.message));
  await page.exposeFunction('captureMaterialCleanup',s=>cleanup.push(s));
  // Only the synthetic comparison clock is fixed, so glyph positions can be compared exactly.
  await page.addInitScript(()=>{const Original=Date,value=new Original(2026,9,24,10,24,0).getTime();globalThis.Date=class extends Original{constructor(...args){super(...(args.length?args:[value]))}static now(){return value}}});
  await page.reload();await page.setViewportSize({width:1920,height:1080});
  if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
  const password=crypto.randomBytes(24).toString('hex'),username='glass'+crypto.randomBytes(5).toString('hex');
  for(const[id,value]of [['create-display-name','Material-Testprofil'],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
  await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0);
  const expected=before?null:JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/maclock-glass-before.json')));
  const shot=(name,clip)=>page.screenshot({path:path.join(__dirname,'../docs/visual/maclock-glass-'+phase+'-'+name+'.png'),...(clip?{clip}:{})});
  async function ready(){await page.evaluate(()=>document.fonts.ready);if(!before)await page.waitForFunction(mode=>{const s=window.airMacLockGlassController?.snapshot();return s&&s.status===mode&&!s.pendingFrame},fallback?'fallback':'webgl')}
  async function measure(){return page.evaluate(()=>{
   const r=s=>{const p=document.querySelector(s).getBoundingClientRect();return{x:p.x,y:p.y,width:p.width,height:p.height}};
   const range=document.createRange();range.selectNodeContents(document.querySelector('#login-clock'));const t=range.getBoundingClientRect();
   return{clock:{x:t.x,y:t.y,width:t.width,height:t.height},profile:r('#login-profile'),stage:r('#login-stage'),field:r('.password-row'),font:getComputedStyle(document.querySelector('#login-clock')).font,time:document.querySelector('#login-clock').textContent,scroll:document.documentElement.scrollWidth>innerWidth,material:window.airMacLockGlassController?.snapshot()||null};
  })}
  for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await page.keyboard.press('Escape');await page.mouse.move(1,height/2);await ready();const g=await measure();assert.equal(g.time,'10:24');assert.equal(g.scroll,false);
   if(!before){const old=expected.rows.find(r=>r.viewport[0]===width);for(const key of ['clock','profile','stage','field','font'])assert.deepEqual(g[key],old[key]);assert.equal(g.material.status,fallback?'fallback':'webgl');}
   if(fallback)assert.equal(await page.evaluate(()=>['webgl','webgl2'].every(type=>document.createElement('canvas').getContext(type)===null)),true,'real Electron webPreferences.webgl=false, not a renderer mock');
   const c=g.clock,f=g.field;
   if(!fallback){
    await shot('desktop-'+width);
    await shot('clock-'+width,{x:c.x-20,y:Math.max(0,c.y-10),width:c.width+40,height:c.height+20});
    await shot('profile-'+width,{x:Math.max(0,width/2-180),y:g.stage.y-8,width:Math.min(360,width),height:Math.ceil(g.stage.height+16)});
    await shot('edge-'+width,{x:f.x-12,y:f.y-12,width:Math.min(90,width-f.x+12),height:f.height+24});
    if(before)await shot('fallback-'+width);
   }else await shot('desktop-'+width);
   await page.locator('#login-password').click();assert.equal(await page.locator('#login-password').evaluate(e=>e===document.activeElement),true);
   if(!before&&!fallback){await ready();const focused=await page.locator('.password-row').boundingBox(),material=await page.evaluate(()=>airMacLockGlassController.snapshot());assert.ok(Math.abs(material.last.fieldRect.width-focused.width)<.02);assert.equal(await page.locator('.maclock-material').evaluate(e=>getComputedStyle(e).pointerEvents),'none');}
   await page.keyboard.press('Escape');await page.keyboard.type('wrong-synthetic-password');await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#login-error').hidden);assert.equal(await page.evaluate(()=>window.airOS.currentUser()),null);assert.equal(await page.locator('#login-password').inputValue(),'');
   if(!before){await page.evaluate(()=>window.addEventListener('pagehide',()=>captureMaterialCleanup(airMacLockGlassController.snapshot()),{once:true}));}
   await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
   const prefs=await page.evaluate(()=>window.airOS.preferences.get());assert.equal(prefs.desktopTheme,'modern');assert.equal(prefs.dockTheme,'modern');assert.equal(prefs.reduceGlass,false);
   await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.locator('.air-notes-window .minimize').click();await page.waitForFunction(()=>openApps.get('notes').style.display==='none');await page.locator('.dock [data-app="notes"]').click();await page.waitForFunction(()=>openApps.get('notes').style.display!=='none');
   await page.locator('#air-island-toggle').click();await page.locator('#air-island-view-quick').click();assert.equal(await page.locator('#air-island-quick-cards button').count(),4);await page.keyboard.press('Escape');await page.evaluate(()=>openApp('home'));await page.waitForSelector('.air-home');
   const desktop=await page.evaluate(()=>{const r=s=>{const p=document.querySelector(s).getBoundingClientRect();return{x:p.x,y:p.y,width:p.width,height:p.height}};return{dock:r('.dock'),island:r('#air-island-toggle'),home:r('.air-home-window')}});
   if(!before)assert.deepEqual(desktop,expected.rows.find(r=>r.viewport[0]===width).desktop);
   await page.evaluate(async()=>{await persistAirDesktopTheme('classic');persistAirDockTheme('classic');await airSettingsWrites});assert.equal(await page.locator('html').getAttribute('data-desktop-theme'),'classic');await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0);
   await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');assert.equal(await page.locator('html').getAttribute('data-desktop-theme'),'classic');await page.evaluate(async()=>{await persistAirDesktopTheme('modern');persistAirDockTheme('modern');await airSettingsWrites});await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0);await ready();
   rows.push({viewport:[width,height],...g,desktop});console.log('PASS',phase,width,'exact L1A geometry, shader/fallback, real native input/auth, protected desktop, saved Classic');
  }
  let gpuProbe=null;
  if(!before&&!fallback){
   gpuProbe=await page.evaluate(()=>{
    const canvas=document.createElement('canvas'),r=airMacLockGlass.createRenderer(canvas,airMacLockShaders),src=document.createElement('canvas');src.width=src.height=256;const cx=src.getContext('2d');
    for(let y=0;y<256;y+=8)for(let x=0;x<256;x+=8){cx.fillStyle=((x+y)/8)%2?'#1020ee':'#ffbd08';cx.fillRect(x,y,8,8)}
    const mask=document.createElement('canvas');mask.width=128;mask.height=96;const mx=mask.getContext('2d');mx.fillStyle='#fff';mx.beginPath();mx.ellipse(64,48,48,34,0,0,Math.PI*2);mx.fill();
    r.setScene(src,0);r.setMask(mask,6.3);const gl=canvas.getContext('webgl2'),params=airMacLockGlass.parameters(1080,36),job={width:256,height:256,clockRect:{x:32,y:16,width:128,height:96},fieldRect:{x:20,y:160,width:210,height:36},params};
    function read(){r.draw(job);const p=new Uint8Array(256*256*4);gl.readPixels(0,0,256,256,gl.RGBA,gl.UNSIGNED_BYTE,p);return p}
    const actual=read();job.params={...params,clock:{...params.clock,refractPx:0},field:{...params.field,thickness:0,magnify:0}};const flat=read();
    let clockChanges=0,fieldChanges=0,maxClock=0,maxField=0;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=((255-y)*256+x)*4,d=Math.max(...[0,1,2].map(k=>Math.abs(actual[i+k]-flat[i+k])));if(y<130&&d>8){clockChanges++;maxClock=Math.max(maxClock,d)}if(y>145&&d>8){fieldChanges++;maxField=Math.max(maxField,d)}}
    const debug=gl.getExtension('WEBGL_debug_renderer_info'),rendererName=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),error=gl.getError();r.destroy();return{clockChanges,fieldChanges,maxClock,maxField,rendererName,error,resourcesAfter:r.snapshot()};
   });assert.ok(gpuProbe.clockChanges>100);assert.ok(gpuProbe.fieldChanges>100);assert.equal(gpuProbe.error,0);assert.equal(gpuProbe.resourcesAfter.contextAlive,false);
   await page.locator('#maclock-reduce-glass').click();await page.waitForFunction(()=>airMacLockGlassController.snapshot().status==='reduced');assert.equal(await page.locator('.maclock-material').count(),0);await shot('reduced-390');await page.locator('#maclock-reduce-glass').click();await ready();
   const frames=await page.evaluate(()=>airMacLockGlassController.snapshot().frames);await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>airMacLockGlassController.snapshot().frames),frames,'static materials do not run a frame loop');
   await page.emulateMedia({forcedColors:'active'});await page.waitForFunction(()=>airMacLockGlassController.snapshot().status==='reduced');assert.equal(await page.locator('.maclock-material').count(),0);await shot('forced-390');await page.emulateMedia({forcedColors:'none'});await ready();
   await page.evaluate(()=>document.documentElement.classList.add('air-reduced-glass'));await page.waitForFunction(()=>airMacLockGlassController.snapshot().status==='reduced');await page.evaluate(()=>document.documentElement.classList.remove('air-reduced-glass'));await ready();
   await page.evaluate(()=>document.querySelector('.maclock-material').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>airMacLockGlassController.snapshot().reason==='context-lost');assert.equal(await page.locator('.maclock-material').count(),0);await page.locator('#login-password').fill(password);await page.keyboard.press('Enter');await page.waitForURL('**/index.html');
  }
  if(!before){assert.equal(cleanup.length,3,'one registered pagehide cleanup probe per viewport');assert.ok(cleanup.every(s=>s.disposed&&!s.renderer.contextAlive&&Object.values(s.renderer.resources).every(n=>n===0)&&!s.pendingFrame));}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/maclock-glass-'+phase+'.json'),JSON.stringify({phase,platform:'Linux Electron 32.3.3 / DPR1',comparisonClock:'2026-10-24 10:24 local; test-only fixed clock, not production',rows,gpuProbe,cleanup,errors},null,2)+'\n');console.log('PASS',phase,'renderer errors absent; GPU/readback and cleanup checks',gpuProbe);
  await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
