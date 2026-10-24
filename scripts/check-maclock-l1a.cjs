'use strict';
// Real Linux Electron only, isolated synthetic credentials. No OS-lock/PAM claim.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright'),geometry=require('../maclock-layout.js');
if(process.env.AIR_GUI_TEST_ISOLATED!=='1')throw Error('Isolated test profile required');
(async()=>{
 const browser=await chromium.connectOverCDP(process.env.AIR_GUI_CDP||'http://127.0.0.1:9265');
 try{
  const page=browser.contexts()[0].pages()[0],errors=[],remote=[],rows=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  const screenshot=name=>page.screenshot({path:path.join(__dirname,'../docs/visual/maclock-l1a-'+name+'.png')});
  const password=crypto.randomBytes(24).toString('hex'),alice='l1a'+crypto.randomBytes(5).toString('hex'),bob='l1b'+crypto.randomBytes(5).toString('hex');
  async function create(username,name){
   if(await page.locator('#switch-create').isVisible())await page.locator('#switch-create').click();
   await page.locator('#create-form').waitFor();
   for(const [id,value] of [['create-display-name',name],['create-username',username],['create-password',password],['create-confirm',password]])await page.locator('#'+id).fill(value);
   await page.locator('#create-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu);
  }
  async function logout(){await page.evaluate(()=>window.airOS.logout());await page.waitForURL('**/login.html');await page.waitForFunction(()=>document.querySelector('#login-username').value.length>0);await page.evaluate(()=>document.fonts.ready)}
  async function login(){await page.locator('#login-password').fill(password);await page.locator('#login-submit').click();await page.waitForURL('**/index.html');await page.waitForFunction(()=>!!window.airStartMenu)}
  assert.match(page.url(),/login.html$/);await page.setViewportSize({width:1920,height:1080});await create(alice,'Air-OS Testprofil');
  const prefs=await page.evaluate(()=>window.airOS.preferences.get());assert.equal(prefs.desktopTheme,'modern');
  await page.evaluate(()=>window.airOS.notes.save({title:'Isolierte Testnotiz A',body:'Synthetischer Testinhalt'}));
  await logout();
  for(const [width,height] of [[1920,1080],[1650,930],[390,600]]){
   await page.setViewportSize({width,height});await page.keyboard.press('Escape');await page.mouse.move(1,height/2);
   const g=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
    const text=s=>{const r=document.createRange();r.selectNodeContents(document.querySelector(s));return r.getBoundingClientRect().toJSON()};
    return {clock:rect('.maclock-clock'),digits:text('#login-clock'),date:text('#maclock-date'),profile:rect('#login-profile'),avatar:rect('.profile-picture'),stage:rect('#login-stage'),password:rect('.password-row'),dateFont:getComputedStyle(document.querySelector('#maclock-date')).fontSize,clockFont:getComputedStyle(document.querySelector('#login-clock')).fontSize,font:getComputedStyle(document.querySelector('#login-clock')).fontFamily,fontReady:document.fonts.check('16px "Open Runde"'),wallpaper:getComputedStyle(document.querySelector('.login-wallpaper')).backgroundImage,filter:getComputedStyle(document.querySelector('.login-wallpaper')).filter,time:document.querySelector('#login-clock').textContent,expectedTime:window.airMacLockLayout.time(new Date()),scroll:document.documentElement.scrollWidth>innerWidth};
   });
   const expected=geometry.layout(height);assert.equal(g.clock.y,expected.clockTop);assert.ok(Math.abs(parseFloat(g.clockFont)-expected.clockPx)<.01);assert.ok(Math.abs((height-g.stage.bottom)-expected.loginBottom)<.02);assert.equal(g.time,g.expectedTime);assert.equal(g.scroll,false);assert.equal(g.fontReady,true);assert.match(g.wallpaper,/maclock-wallpaper.svg/);assert.equal(g.filter,'none');
   assert.ok(g.password.x>=0&&g.password.right<=width&&g.stage.y>g.digits.bottom&&g.stage.bottom<height);
   await screenshot('clock-'+width);
   const profileBox={x:Math.max(0,width/2-180),y:g.stage.y-8,width:Math.min(360,width),height:Math.ceil(g.stage.height+16)};
   await page.screenshot({path:path.join(__dirname,'../docs/visual/maclock-l1a-profile-'+width+'.png'),clip:profileBox});
   await page.locator('#login-password').click();assert.ok(await page.locator('#login-password').evaluate(e=>e===document.activeElement));await screenshot('focused-'+width);
   const focused=await page.locator('.password-row').boundingBox();assert.ok(focused.width>=g.password.width);assert.equal(await page.locator('#login-password').getAttribute('type'),'password');
   await page.keyboard.press('Tab');assert.equal(await page.locator('#switch-create').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#login-password').evaluate(e=>e===document.activeElement),true);
   await page.keyboard.press('Escape');await page.keyboard.type('synthetic-wrong-password');assert.ok(await page.locator('#login-password').evaluate(e=>e===document.activeElement));assert.equal(await page.locator('#login-password').inputValue(),'synthetic-wrong-password');await screenshot('entry-'+width);await page.keyboard.press('Enter');
   await page.waitForFunction(()=>!document.querySelector('#login-error').hidden);assert.match(await page.locator('#login-error').innerText(),/stimmen nicht/);assert.equal(await page.locator('#login-password').inputValue(),'');assert.equal(await page.evaluate(()=>window.airOS.currentUser()),null);
   assert.equal(await page.evaluate(async()=>{try{await window.airOS.notes.list();return false}catch{return true}}),true);
   await screenshot('error-'+width);await login();
   const notes=await page.evaluate(()=>window.airOS.notes.list());assert.equal(notes[0].title,'Isolierte Testnotiz A');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('.dock [data-app="launchpad"]').click();await page.locator('#air-start-search').fill('notes');await page.locator('[data-start-app="notes"]').click();await page.waitForFunction(()=>openApps.has('notes'));await page.waitForFunction(()=>document.querySelector('#note-status')?.textContent);
   await page.locator('.air-notes-window .minimize').click();await page.waitForFunction(()=>openApps.get('notes').style.display==='none');await page.locator('.dock [data-app="notes"]').click();await page.waitForFunction(()=>openApps.get('notes').style.display!=='none');
   await page.locator('#air-island-toggle').click();await page.locator('#air-island-view-quick').click();assert.equal(await page.locator('#air-island-quick-cards button').count(),4);await page.keyboard.press('Escape');
   await page.evaluate(()=>openApp('home'));await page.waitForSelector('.air-home');
   const desktop=await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{dock:r('.dock'),island:r('#air-island-toggle'),home:r('.air-home-window')}});
   assert.equal(desktop.dock.width,358);assert.equal(desktop.dock.bottom,height);assert.equal(desktop.island.y,0);
   await page.evaluate(async()=>{await persistAirDesktopTheme('classic');persistAirDockTheme('classic');await airSettingsWrites});assert.equal(await page.locator('html').getAttribute('data-desktop-theme'),'classic');
   await page.evaluate(async()=>{await persistAirDesktopTheme('modern');persistAirDockTheme('modern');await airSettingsWrites});
   rows.push({viewport:[width,height],expected,...g,focused,desktop});console.log('PASS',width,'source geometry, native password/keyboard, failed auth, real retry, app lifecycle, Classic/Modern');
   await logout();
  }
  assert.deepEqual(remote,[],'login and tested local apps make no remote asset requests');
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#login-password').focus();assert.ok(await page.locator('#login-password').evaluate(e=>e===document.activeElement));await screenshot('forced-colors-390');await page.emulateMedia({forcedColors:'none'});
  await page.locator('#sleep-button').click();await page.locator('#sleep-overlay').waitFor();await page.keyboard.press('Space');assert.equal(await page.locator('#sleep-overlay').isVisible(),false);
  await create(bob,'Air-OS Zweitprofil');assert.deepEqual(await page.evaluate(()=>window.airOS.notes.list()),[]);await page.evaluate(async()=>{persistAirSettings({desktopTheme:'classic',dockTheme:'classic',clock24:false,dockPins:['notes','unavailable-reference']});await airSettingsWrites});await logout();
  await page.locator('.saved-account[title="Als '+bob+' anmelden"]').click();await login();assert.deepEqual(await page.evaluate(()=>window.airOS.notes.list()),[]);const saved=await page.evaluate(()=>window.airOS.preferences.get());assert.equal(saved.desktopTheme,'classic');assert.equal(saved.dockTheme,'classic');assert.equal(saved.clock24,false);assert.deepEqual(saved.dockPins,['notes','unavailable-reference']);await logout();await page.locator('.saved-account[title="Als '+alice+' anmelden"]').click();await login();assert.equal((await page.evaluate(()=>window.airOS.notes.list()))[0].title,'Isolierte Testnotiz A');await logout();await screenshot('profile-picker-390');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../docs/visual/maclock-l1a-measurements.json'),JSON.stringify({platform:'Linux Debian 13 x64 / Electron 32.3.3',dpr:1,originalRuntime:'BLOCKED: no Quickshell/Qt6/Hyprland; upstream README attachment HTTP403',rows,remoteRequests:remote,rendererErrors:errors,profileSeparation:true,preservedClassicPinsClock:true},null,2)+'\n');console.log('PASS reduced motion/forced colors, app-only sleep, profile separation, no remote requests or renderer errors');
  await page.evaluate(()=>window.airOS.quit()).catch(e=>{if(!/Target page|Execution context/.test(e.message))throw e});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
