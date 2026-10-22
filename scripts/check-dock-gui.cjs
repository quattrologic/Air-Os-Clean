'use strict';
// Opt-in real Electron renderer check; Node >=22, no extra test dependencies.
// Start Electron with a disposable signed-in profile and --remote-debugging-port=9223.
// Run: node scripts/check-dock-gui.cjs [port]. Screenshots go to ignored dist/dock-gui/.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

(async () => {
  const port = Number(process.argv[2] || 9223);
  assert(Number.isInteger(port) && port > 0 && port < 65536, 'Valid local CDP port required');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  const target = targets.find(t => t.type === 'page' && t.url === url);
  assert(target, 'Sign in to Air-OS using a disposable test profile first');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let next = 0;
  const pending = new Map();
  const exceptions = [];
  const failures = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if (!message.id || !pending.has(message.id)) return;
    const {resolve, reject, timeout} = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(timeout);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  };
  const cdp = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 10000);
    pending.set(id, {resolve, reject, timeout});
    ws.send(JSON.stringify({id, method, params}));
  });
  const evaluate = async expression => {
    const reply = await cdp('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
    assert(!reply.exceptionDetails, reply.exceptionDetails?.exception?.description || 'Renderer evaluation failed');
    return reply.result.value;
  };
  const settled = () => evaluate('Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})))');
  async function click(selector) {
    const point = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) throw new Error('Missing element: ' + ${JSON.stringify(selector)});
      el.scrollIntoView({block:'nearest',inline:'nearest'});
      const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
    })()`);
    await cdp('Input.dispatchMouseEvent', {type:'mouseMoved', ...point});
    await cdp('Input.dispatchMouseEvent', {type:'mousePressed', button:'left', clickCount:1, ...point});
    await cdp('Input.dispatchMouseEvent', {type:'mouseReleased', button:'left', clickCount:1, ...point});
    await settled();
  }
  const dockApp = id => `.dock-app[data-app="${id}"]`;
  async function theme(value) {
    await click(dockApp('settings'));
    await evaluate(`(() => { const select=document.querySelector('#air-dock-theme'); select.value=${JSON.stringify(value)}; select.dispatchEvent(new Event('change',{bubbles:true})); })()`);
    for (let n=0; n<50; n++) {
      if (await evaluate(`document.querySelector('.dock').dataset.theme===${JSON.stringify(value)}`)) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error('Theme change did not reach rendered dock');
  }
  const output = path.resolve(__dirname, '../dist/dock-gui');
  fs.mkdirSync(output, {recursive:true});
  const screenshot = async name => {
    const {data} = await cdp('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(data, 'base64'));
  };
  let original;
  try {
    await cdp('Runtime.enable');
    original = await evaluate('window.airOS.preferences.get()');
    // Reset only test app windows so reruns exercise a fresh launch.
    await evaluate(`document.querySelectorAll('.app-window').forEach(w=>{if(['Notizen','Air-Rechner'].includes(w.querySelector('.window-title')?.textContent)) w.querySelector('.close').click();})`);
    await settled();
    assert(await evaluate('(async()=>!!(await window.airOS.currentUser()))()'), 'Authenticated test profile required');
    await cdp('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await theme('classic');
    assert.equal(await evaluate('document.querySelector(".dock").dataset.theme'), 'classic');
    await screenshot('classic');
    await theme('modern');
    await click(dockApp('notes'));
    assert.equal(await evaluate('window.airAppLifecycle.get("notes")'), 'focused');
    assert(await evaluate('document.querySelector(".dock-app[data-app=notes]").classList.contains("is-open")'));
    assert(await evaluate('getComputedStyle(document.querySelector(".dock-app[data-app=notes]")).backgroundColor !== "rgba(0, 0, 0, 0)"'), 'Active Modern app must have a visible background, not Classic transparent override');
    console.log('PASS Classic/Modern UI switch, app launch and rendered active indicator');
    await click(dockApp('calculator'));
    assert(await evaluate('document.querySelector(".dock-app[data-app=calculator]").classList.contains("is-active")'));
    assert(!await evaluate('document.querySelector(".dock-app[data-app=notes]").classList.contains("is-active")'));
    await click(dockApp('notes'));
    if (!await evaluate('document.querySelector(".dock-app[data-app=notes]").classList.contains("is-active")')) {
      failures.push('Repeated focus leaves the active dock marker on the previous app');
      console.error('FAIL '+failures.at(-1));
    }
    const noteSelector = await evaluate(`(() => {const list=[...document.querySelectorAll('.app-window')]; const index=list.findIndex(w=>w.querySelector('.window-title').textContent==='Notizen'); return '.app-window:nth-child('+(index+1)+')';})()`);
    assert(await evaluate(`(() => { const w=document.querySelector(${JSON.stringify(noteSelector)}); return [...document.querySelectorAll('.app-window')].every(other=>Number(w.style.zIndex)>=Number(other.style.zIndex)); })()`), 'Focused Notes window must be on top');
    await click(noteSelector+' .minimize');
    assert.equal(await evaluate('window.airAppLifecycle.get("notes")'), 'minimized');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(noteSelector)})).display`), 'none');
    await click(dockApp('notes'));
    assert.equal(await evaluate('window.airAppLifecycle.get("notes")'), 'focused');
    assert.notEqual(await evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(noteSelector)})).display`), 'none');
    console.log('PASS focus transfer, frontmost window, minimize and dock restore');

    for (const width of [1440,1024,760,600,390]) {
      await cdp('Emulation.setDeviceMetricsOverride', {width,height:900,deviceScaleFactor:1,mobile:false});
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const metrics=await evaluate(`(() => {const d=document.querySelector('.dock'),r=d.getBoundingClientRect();return {left:r.left,right:r.right,center:r.left+r.width/2,bottom:r.bottom,scroll:d.scrollWidth>d.clientWidth};})()`);
      assert(metrics.left>=0 && metrics.right<=width+1, 'Dock stays inside viewport');
      assert(Math.abs(metrics.center-width/2)<1, 'Dock is centered');
      assert(Math.abs(metrics.bottom-888)<1, 'Dock floats 12px above bottom');
      assert(metrics.scroll, 'Overflow apps remain scrollable');
      await screenshot('modern-'+width);
      console.log(`PASS Modern geometry and overflow at renderer width ${width}`);
    }
    await click(dockApp('settings'));
    await evaluate('document.querySelector(".dock-app[data-app=trash]").focus()');
    await cdp('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
    await cdp('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await settled();
    assert.equal(await evaluate('window.airAppLifecycle.get("trash")'), 'focused');
    assert(await evaluate('(() => {const b=document.activeElement,r=b.getBoundingClientRect(),d=document.querySelector(".dock").getBoundingClientRect();return b.dataset.app==="trash" && r.left>=d.left && r.right<=d.right;})()'), 'Keyboard focus scrolls the last dock item into view');
    console.log('PASS keyboard activation and focus scrolling at narrow width');
    await cdp('Emulation.setDeviceMetricsOverride', {width:1024,height:768,deviceScaleFactor:1,mobile:false});
    await theme('classic');
    await theme('modern');
    assert.equal((await evaluate('window.airOS.preferences.get()')).dockTheme, 'modern');
    await screenshot('modern-active');
    assert.deepEqual(exceptions, [], 'No uncaught renderer errors during checks');
    console.log('PASS repeated theme switch and real profile persistence');
    assert.deepEqual(failures, [], 'Unresolved dock regression(s); see individual FAIL output');
  } finally {
    try {
      if(original) await evaluate(`window.airOS.preferences.update(${JSON.stringify(Object.fromEntries(Object.entries(original).filter(([key])=>key!=='schemaVersion')))}).then(saved=>applyAirSettings(saved))`);
      await cdp('Emulation.clearDeviceMetricsOverride');
    } finally {
      for(const item of pending.values())clearTimeout(item.timeout);
      ws.close();
    }
  }
})().catch(error => { console.error(error.message); process.exitCode=1; });
