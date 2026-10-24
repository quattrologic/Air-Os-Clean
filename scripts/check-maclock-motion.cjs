'use strict';
// Real Linux Electron; exact screenshots use a paused test clock, natural traces do not.
const{chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Use isolated test credentials/profile');
const phase=process.env.AIR_GUI_PHASE||'after',before=phase==='before',fallback=phase==='fallback',port=before?9271:fallback?9273:9272;
const near=(a,b,t=.035)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`),q=t=>1-(1-Math.max(0,Math.min(1,t)))**5;
(async()=>{
 let browser;for(let i=0;i<30;i++)try{browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:'+port);break}catch(e){if(i===29||!/ECONNREFUSED/.test(e.message))throw e;await new Promise(r=>setTimeout(r,100))}
 try{
 const page=browser.contexts()[0].pages()[0],errors=[],cleanups=[],rows=[];page.on('pageerror',e=>errors.push(e.message));await page.exposeFunction('motionCleanup',s=>cleanups.push(s));
 await page.addInitScript(()=>{
  const Real=Date,epoch=new Real(2026,9,24,10,24).getTime();globalThis.Date=class extends Real{constructor(...args){super(...(args.length?args:[epoch]))}static now(){return epoch}};
  window.__motionTrace=[];window.__confirmedAt=null;
  document.addEventListener('air-maclock-frame',()=>{const s=window.airMacLockMotionController?.snapshot();if(s)window.__motionTrace.push({time:s.paintTime,start:s.startedAt,values:s.values,active:s.active})});
  document.addEventListener('air-login-confirmed',()=>window.__confirmedAt=performance.now());
  document.addEventListener('DOMContentLoaded',()=>window.addEventListener('pagehide',()=>{if(window.airMacLockMotionController)motionCleanup({motion:airMacLockMotionController.snapshot(),glass:airMacLockGlassController.snapshot(),confirmedToHide:window.__confirmedAt===null?null:performance.now()-window.__confirmedAt})}));
 });
 await page.reload();
 if(fallback)assert.equal(await page.evaluate(()=>!document.createElement('canvas').getContext('webgl2')&&!document.createElement('canvas').getContext('webgl')),true);
 const password=crypto.randomBytes(24).toString('hex'),alice='anim'+crypto.randomBytes(5).toString('hex'),bob='anim'+crypto.randomBytes(5).toString('hex');
 async function create(name,display){if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();for(const[id,value]of [['create-display-name',display],['create-username',name],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu)}
 async function logout(){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0)}
 async function login(){await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu)}
 async function settled(){await page.evaluate(()=>document.fonts.ready);if(!before)await page.waitForFunction(()=>{const s=airMacLockMotionController.snapshot();return s.ready&&!s.active&&!s.pendingFrame})}
 await create(alice,'Animations-Testprofil');await page.evaluate(()=>window.airOS.notes.save({title:'Only synthetic profile A',body:'Synthetic fixture'}));await logout();
 const baseline=before?null:JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/visual/maclock-motion-before.json')));
 const shot=(name,clip)=>page.screenshot({path:path.join(__dirname,`../docs/visual/maclock-motion-${phase}-${name}.png`),...(clip?{clip}:{})});
 async function measure(){return page.evaluate(()=>{
  const r=s=>{const p=document.querySelector(s).getBoundingClientRect();return{x:p.x,y:p.y,width:p.width,height:p.height}};const range=document.createRange();range.selectNodeContents(document.querySelector('#login-clock'));const t=range.getBoundingClientRect();
  return{clock:{x:t.x,y:t.y,width:t.width,height:t.height},stage:r('#login-stage'),field:r('.password-row'),profile:r('#login-profile'),wallTransform:getComputedStyle(document.querySelector('.login-wallpaper')).transform,blur:getComputedStyle(document.querySelector('.login-focus-wallpaper')||document.querySelector('.login-wallpaper')).filter,motion:window.airMacLockMotionController?.snapshot()||null,glass:airMacLockGlassController.snapshot()};
 })}
 async function controlledReady(){await page.evaluate(()=>document.fonts.ready);for(let n=0;n<50;n++){if(await page.evaluate(()=>airMacLockMotionController.snapshot().ready))return;await page.clock.runFor(16)}throw Error('controlled startup never ready')}
 async function advanceTo(time){const current=await page.evaluate(()=>performance.now());if(time>current)await page.clock.runFor(time-current);await page.evaluate(()=>window.dispatchEvent(new Event('resize')))}
 for(const[width,height]of [[1920,1080],[1650,930],[390,600]]){
  await page.setViewportSize({width,height});await page.reload();await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0);await settled();
  let natural=null,reversals=[];
  if(!before){natural=await page.evaluate(()=>({snapshot:airMacLockMotionController.snapshot(),trace:__motionTrace}));assert.ok(natural.snapshot.paintTime-natural.snapshot.startedAt>=650);assert.equal(natural.snapshot.values.zoom,1);assert.equal(natural.snapshot.values.opacity,1);
   for(let n=0;n<4;n++){
    if(n%2===0)await page.locator('#login-password').focus();else await page.locator('#login-password').blur();await page.waitForTimeout(65);
    const pair=await page.evaluate(async()=>{const c=airMacLockMotionController,before=c.snapshot(),input=document.querySelector('#login-password');document.activeElement===input?input.blur():input.focus();await Promise.resolve();return{before,after:c.snapshot(),width:document.querySelector('.password-row').getBoundingClientRect().width}});
    for(const key of ['fieldWidth','blur']){const old=pair.before.tracks[key],fresh=pair.after.tracks[key];if(fresh){const expected=old?old.from+(old.to-old.from)*(1-(1-Math.max(0,Math.min(1,(fresh.start-old.start)/old.duration)))**5):pair.before.values[key];near(fresh.from,expected,1e-8)}}
    near(pair.width,Math.max(width<=600?210:0,pair.after.values.fieldWidth*Math.max(.6,height/1200)));reversals.push(pair);
   }
   await page.keyboard.press('Escape');await settled();
  }
  if(!before){await page.clock.install({time:new Date('2026-10-24T10:24:00Z')});await page.clock.pauseAt(new Date('2026-10-24T10:24:01Z'));await page.reload();await controlledReady();}
  const quarters=[];
  if(!before){const start=await page.evaluate(()=>airMacLockMotionController.snapshot().startedAt);for(const[p,label]of [[.25,'25'],[.5,'50'],[.75,'75']]){await advanceTo(start+650*p);const m=await measure(),progress=(m.motion.paintTime-start)/650;near(m.motion.values.opacity,q(progress),1e-9);near(m.motion.values.zoom,1.09-.09*q(progress),1e-9);if(!fallback)near(m.glass.last.sceneState.opacity,m.motion.values.opacity,1e-9);if(!fallback)assert.equal(m.glass.status,'webgl');await shot('entry'+label+'-'+width);quarters.push({requested:p,actual:progress,...m})}await advanceTo(start+700);}
  const idle=await measure();
  if(!before){for(const key of ['clock','stage','field','profile'])assert.deepEqual(idle[key],baseline.rows.find(r=>r.viewport[0]===width).idle[key]);assert.equal(idle.motion.active,false);assert.equal(idle.motion.pendingFrame,false);assert.equal(idle.glass.status,fallback?'fallback':'webgl')}
  await shot('desktop-'+width);await shot('unfocused-'+width,{x:Math.max(0,width/2-180),y:idle.stage.y-10,width:Math.min(width,360),height:Math.ceil(idle.stage.height+20)});
  await page.locator('#login-password').focus();
  if(!before){const start=await page.evaluate(()=>airMacLockMotionController.snapshot().now);await advanceTo(start+225);const mid=await measure();assert.ok(mid.motion.values.blur>0&&mid.motion.values.blur<.55);await shot('focus50-'+width);await advanceTo(start+700)}
  const focused=await measure();if(!before){assert.equal(focused.motion.values.blur,.55);assert.equal(focused.motion.values.fieldWidth,236);near(parseFloat(focused.blur.slice(5)),8.8,.001);if(!fallback){near(focused.glass.last.fieldRect.width,focused.field.width,.001);assert.equal(focused.glass.last.sceneState.blur,.55)}}
  await shot('focused-'+width);await shot('glass-'+width,{x:focused.field.x-12,y:focused.field.y-12,width:Math.min(240,width-focused.field.x+12),height:focused.field.height+24});
  if(!before){
   // Safe presentation-only exit sampling; this does not authenticate or navigate.
   await page.evaluate(()=>airMacLockMotionController.leave());const start=await page.evaluate(()=>performance.now());await advanceTo(start+210);const exit=await measure();assert.ok(exit.motion.values.opacity<1&&exit.motion.values.opacity>0);await shot('exit50-'+width);await page.evaluate(()=>airMacLockMotionController.enter());await advanceTo(start+1000);await page.keyboard.press('Escape');await page.clock.runFor(700);await page.clock.resume();
  }
  await page.locator('#login-password').fill('wrong-synthetic-password');await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#login-error').hidden);assert.equal(await page.evaluate(()=>window.airOS.currentUser()),null);if(!before)assert.equal(await page.evaluate(()=>airMacLockMotionController.snapshot().leaving),false);await login();
  assert.equal((await page.evaluate(()=>window.airOS.notes.list()))[0].title,'Only synthetic profile A');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.locator('.air-notes-window .minimize').click();await page.waitForFunction(()=>openApps.get('notes').style.display==='none');await page.locator('.dock [data-app="notes"]').click();await page.waitForFunction(()=>openApps.get('notes').style.display!=='none');await page.locator('#air-island-toggle').click();await page.locator('#air-island-view-quick').click();assert.equal(await page.locator('#air-island-quick-cards button').count(),4);await page.keyboard.press('Escape');await page.evaluate(()=>openApp('home'));await page.waitForSelector('.air-home');
  const desktop=await page.evaluate(()=>{const r=s=>{const p=document.querySelector(s).getBoundingClientRect();return{x:p.x,y:p.y,width:p.width,height:p.height}};return{dock:r('.dock'),island:r('#air-island-toggle'),home:r('.air-home-window')}});if(!before)assert.deepEqual(desktop,baseline.rows.find(r=>r.viewport[0]===width).desktop);
  rows.push({viewport:[width,height],natural,reversals,quarters,idle,focused,desktop});console.log('PASS',phase,width,'original targets/frames, focus reversals, real auth/cleanup, protected desktop');await logout();await page.emulateMedia({reducedMotion:'no-preference'});
 }
 if(!before){
  await page.emulateMedia({reducedMotion:'reduce'});await settled();const reduced=await measure();assert.equal(reduced.motion.pendingFrame,false);assert.equal(reduced.motion.values.opacity,1);await shot('reduced-390');await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#login-password').focus();await page.waitForTimeout(80);
  if(!fallback){await page.evaluate(()=>document.querySelector('.maclock-material').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>airMacLockGlassController.snapshot().reason==='context-lost');await settled();assert.equal(await page.evaluate(()=>airMacLockMotionController.snapshot().pendingFrame),false)}
  await login();await logout();await create(bob,'Zweites Testprofil');assert.deepEqual(await page.evaluate(()=>window.airOS.notes.list()),[]);await page.evaluate(async()=>{persistAirSettings({desktopTheme:'classic',dockTheme:'classic',clock24:false,dockPins:['notes','missing-reference']});await airSettingsWrites});await logout();await page.locator('.saved-account[title="Als '+bob+' anmelden"]').click();await login();assert.deepEqual((await page.evaluate(()=>window.airOS.preferences.get())).dockPins,['notes','missing-reference']);assert.deepEqual(await page.evaluate(()=>window.airOS.notes.list()),[]);
  assert.ok(cleanups.length>=6);assert.ok(cleanups.every(c=>c.motion.disposed&&!c.motion.pendingFrame&&!c.motion.deadlinePending&&!c.glass.renderer.contextAlive&&Object.values(c.glass.renderer.resources).every(n=>n===0)));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,`../docs/visual/maclock-motion-${phase}.json`),JSON.stringify({phase,platform:fallback?'Linux Electron32.3.3 / native webgl=false / DPR1':'Linux Electron32.3.3 / ANGLE SwiftShader software / DPR1',screenshots:'Fixed test clock; intermediate images use controlled Playwright time, natural traces recorded separately',rows,cleanups,errors},null,2)+'\n');console.log('PASS',phase,'no renderer errors; cleanup records',cleanups.length);await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
