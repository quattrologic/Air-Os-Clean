'use strict';
// Independent Air-OS component; no host control or external media integration.
(() => {
  const island = document.querySelector('#air-island');
  if (!island) return;
  const trigger = document.querySelector('#air-island-toggle');
  const panel = document.querySelector('#air-island-panel');
  const closeButton = document.querySelector('#air-island-close');
  const clock = document.querySelector('#air-island-clock');
  const desktop = document.querySelector('#desktop');
  const dockTile = document.querySelector('#air-control-dock-theme');
  const dockValue = document.querySelector('#air-control-dock-value');
  const dockStatus = document.querySelector('#air-control-dock-status');
  const noteNotice = document.querySelector('#air-island-note-notice');
  const noteNoticeMessage = document.querySelector('#air-island-note-message');
  const noteNoticeTime = document.querySelector('#air-island-note-time');
  const desktopTile=document.querySelector('#air-control-desktop-theme');
  const desktopValue=document.querySelector('#air-control-desktop-value');
  const controlClock=document.querySelector('#air-control-clock');
  const noticeButton=document.querySelector('#air-control-notice');
  const volume=document.querySelector('#air-control-volume');
  const volumeValue=document.querySelector('#air-control-volume-value');
  const views=document.querySelector('#air-island-views'),controlView=document.querySelector('#air-island-controls');
  const quickView=document.querySelector('#air-island-quick'),quickCards=document.querySelector('#air-island-quick-cards');
  const controlButton=document.querySelector('#air-island-view-control'),quickButton=document.querySelector('#air-island-view-quick');
  const quickStatus=document.querySelector('#air-island-quick-status'),panelTitle=document.querySelector('#air-island-title');
  let selectedView='control',quickVersion=0,launchBusy=false;
  const modernDesktop=()=>typeof readAirSettings==='function'&&readAirSettings().desktopTheme==='modern';
  function showView(value){
    if(!views)return;
    const active=document.activeElement,modern=modernDesktop();
    selectedView=modern&&value==='quick'?'quick':'control';quickVersion++;launchBusy=false;
    if(panelTitle)panelTitle.textContent=selectedView==='quick'?'Schnellzugriff':'Kontrollzentrum';
    views.hidden=!modern;controlView.hidden=selectedView!=='control';controlView.inert=controlView.hidden;
    quickView.hidden=selectedView!=='quick';quickView.inert=quickView.hidden;
    controlButton.setAttribute('aria-pressed',String(selectedView==='control'));quickButton.setAttribute('aria-pressed',String(selectedView==='quick'));
    if(selectedView==='quick')renderQuick();
    if(!panel.hidden&&((quickView.hidden&&quickView.contains(active))||(controlView.hidden&&controlView.contains(active))||(views.hidden&&views.contains(active))))closeButton.focus();
  }
  async function launchQuick(event,id){
    event.stopPropagation();if(launchBusy||panel.hidden||selectedView!=='quick'||!modernDesktop())return;
    if(!window.airAppRegistry?.get(id)){quickStatus.textContent='Diese App ist nicht verfügbar.';return}
    launchBusy=true;const request=++quickVersion;quickStatus.textContent='App wird gestartet …';
    try{
      const outcome=await openApp(id);
      if(request!==quickVersion||panel.hidden)return;
      if(!outcome?.ok)throw new Error('Start fehlgeschlagen');
      close(false,true);
      // Use the existing internal window, not a separate launcher or focus manager.
      const win=typeof openApps==='object'?openApps.get(id):null;
      const targets=win?Array.from(win.querySelectorAll('.window-content input:not([disabled]), .window-content textarea:not([disabled]), .air-home-main, .window-content button:not([disabled])')):[];
      const target=targets.find(element=>element.getClientRects().length&&!element.closest('[hidden],[inert]'));
      (target||win?.querySelector('.window-titlebar .close')||trigger).focus();
    }catch{if(request===quickVersion&&!panel.hidden)quickStatus.textContent='App konnte nicht geöffnet werden. Bitte erneut versuchen.'}
    finally{if(request===quickVersion)launchBusy=false}
  }
  function renderQuick(){
    if(!quickCards)return;
    const focused=document.activeElement?.dataset?.quickApp;
    quickCards.replaceChildren();quickStatus.textContent='';
    for(const [id,description] of [['home','Dein Arbeitsplatz'],['notes','Notizen öffnen'],['reminders','Aufgaben öffnen'],['finder','Dateien öffnen']]){
      const app=window.airAppRegistry?.get(id),card=document.createElement('button'),art=document.createElement('span'),label=document.createElement('span'),name=document.createElement('strong'),detail=document.createElement('small');
      card.type='button';card.dataset.quickApp=id;card.className='air-island-quick-card';card.disabled=!app;
      art.className='air-island-quick-icon';art.setAttribute('aria-hidden','true');
      // Home has no icon metadata; the user selected the existing Air-OS start logo for this card only.
      const original=id==='home'?document.querySelector('.dock .launchpad-icon svg'):app?.iconClass?document.querySelector('.dock-icon.'+app.iconClass+' svg'):null;
      if(original)art.append(original.cloneNode(true));
      else if(typeof vectorIcon==='object'&&vectorIcon[id==='home'?'launchpad':id])art.innerHTML=vectorIcon[id==='home'?'launchpad':id]; // Existing trusted static icon data, never registry HTML.
      else art.textContent=app?.glyph||'';
      name.textContent=app?.name||'App nicht verfügbar';detail.textContent=app?description:'Nicht registriert';
      label.append(name,detail);card.append(art,label);card.addEventListener('click',event=>launchQuick(event,id));quickCards.append(card);
      if(focused===id&&!card.disabled)card.focus();
    }
  }
  function selectControl(){showView('control')}
  function selectQuick(){showView('quick')}
  const stopRegistry=window.airAppRegistry?.onChange?.(()=>{if(selectedView==='quick'&&!panel.hidden)renderQuick()});
  let savingDesktop=false,observedAudio=null;
  function syncDesktop(){
    if(!desktopTile)return;
    desktopTile.setAttribute('aria-pressed',String(readAirSettings().desktopTheme==='modern'));
    desktopTile.setAttribute('aria-disabled',String(savingDesktop||!window.airOS?.preferences));
    desktopValue.textContent=readAirSettings().desktopTheme==='modern'?'Air Modern':'Classic';
  }
  async function changeDesktop(){
    if(savingDesktop||desktopTile.getAttribute('aria-disabled')==='true')return;
    savingDesktop=true;syncDesktop();dockStatus.textContent='Desktop-Design wird gespeichert …';
    try{await persistAirDesktopTheme(readAirSettings().desktopTheme==='modern'?'classic':'modern');dockStatus.textContent='Desktop-Design gespeichert.'}
    catch{dockStatus.textContent='Desktop-Design konnte nicht gespeichert werden. Bitte erneut versuchen.'}
    finally{savingDesktop=false;syncDesktop()}
  }
  function localAudio(){try{const audio=window.Amplitude?.getAudio?.();return audio&&(audio.src||audio.currentSrc)&&typeof audio.volume==='number'?audio:null}catch{return null}}
  function syncVolume(){
    if(!volume)return;
    const audio=localAudio();volume.disabled=!audio;volume.value=audio?String(Math.round(audio.volume*100)):'0';volumeValue.textContent=audio?volume.value+'%':'—';
  }
  function changeVolume(){const audio=localAudio();if(audio)audio.volume=Math.max(0,Math.min(1,Number(volume.value)/100));syncVolume()}
  function watchVolume(){
    observedAudio?.removeEventListener('volumechange',syncVolume);observedAudio=localAudio();
    observedAudio?.addEventListener('volumechange',syncVolume);syncVolume();
  }
  function quickAction(event,action){event.stopPropagation();close(false,true);action()}

  function notesSaved() {
    if(window.airFocusMode?.active)return;
    const now = new Date();
    // No note title/body, event payload or history is retained.
    noteNoticeMessage.textContent = 'Notiz im Air-OS-Profil gespeichert.';
    noteNoticeTime.dateTime = now.toISOString();
    noteNoticeTime.textContent = now.toLocaleString(undefined, {dateStyle:'short', timeStyle:'short'});
    noteNotice.hidden = false;
    if(noticeButton){noticeButton.disabled=false;noticeButton.title='Letzte Notes-Mitteilung lesen'}
  }
  let savingDock = false;
  let timer = null;
  let panelAnimation = null, animationVersion = 0, targetOpen = false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  function motionAllowed() {
    return modernDesktop() && !readAirSettings().reduceMotion && !reducedMotion?.matches && typeof panel.animate === 'function';
  }
  function cancelMotion() {
    const motion=panelAnimation;panelAnimation=null;animationVersion++;
    if(motion){motion.onfinish=null;motion.cancel()}
  }
  function settleMotion() {
    if(!panelAnimation)return;
    if(targetOpen)cancelMotion();else finishClose();
  }
  function motionPreferenceChanged(){if(!motionAllowed())settleMotion()}
  function animatePanel(open) {
    const version=++animationVersion;
    if(!panelAnimation){
      panelAnimation=panel.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:140,easing:'ease-out',fill:'both'});
      // Explicit initial time also permits a reversal before the first rendered frame.
      panelAnimation.pause();panelAnimation.currentTime=open?0:140;
      panelAnimation.playbackRate=open?1:-1;panelAnimation.play();
    }else panelAnimation.reverse();
    const motion=panelAnimation;
    motion.onfinish=()=>{
      if(panelAnimation!==motion||animationVersion!==version)return;
      if(targetOpen)cancelMotion();else finishClose();
    };
  }

  function syncDockTheme() {
    const settings = typeof readAirSettings === 'function' ? readAirSettings() : {};
    const modern = settings.dockTheme === 'modern';
    const available = !!window.airOS?.preferences && typeof persistAirDockTheme === 'function';
    dockTile.setAttribute('aria-pressed', String(modern));
    dockTile.setAttribute('aria-disabled', String(!available || savingDock));
    dockValue.textContent = modern ? 'Air Modern' : 'Air Classic';
    if (!available) dockStatus.textContent = 'Dock-Einstellungen sind nur in der angemeldeten Air-OS-App verfügbar.';
  }
  function settingsChanged() {
    settleMotion();
    updateClock();
    if(views&&!modernDesktop())showView('control');
    else if(views)views.hidden=false;
    syncDockTheme();syncDesktop();
    if (!savingDock && !savingDesktop && dockTile.getAttribute('aria-disabled') !== 'true')
      dockStatus.textContent = 'Dock-Design für dein Air-OS-Profil.';
  }
  async function changeDockTheme() {
    if (savingDock || dockTile.getAttribute('aria-disabled') === 'true') return;
    const next = readAirSettings().dockTheme === 'modern' ? 'classic' : 'modern';
    savingDock = true;
    dockTile.setAttribute('aria-busy', 'true');
    syncDockTheme();
    dockStatus.textContent = 'Dock-Design wird gespeichert …';
    try {
      await persistAirDockTheme(next);
      dockStatus.textContent = (next === 'modern' ? 'Air Modern' : 'Air Classic') + ' gespeichert.';
    } catch {
      dockStatus.textContent = 'Dock-Design konnte nicht gespeichert werden. Bitte erneut versuchen.';
    } finally {
      savingDock = false;
      dockTile.setAttribute('aria-busy', 'false');
      syncDockTheme();
    }
  }

  function updateClock() {
    const settings = typeof readAirSettings === 'function' ? readAirSettings() : {};
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = now.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', hour12: settings.clock24 === false
    });
    if(controlClock){controlClock.dateTime=clock.dateTime;controlClock.textContent=clock.textContent}
    trigger.setAttribute('aria-label', 'Air Island, ' + clock.textContent + ', öffnen oder schließen');
  }
  function finishClose() {
    cancelMotion();targetOpen=false;
    quickVersion++;launchBusy=false;
    panel.hidden=true;panel.inert=false;panel.classList.remove('is-closing');
    observedAudio?.removeEventListener('volumechange',syncVolume);observedAudio=null;
  }
  function close(restoreFocus = false, immediate = false) {
    if (panel.hidden) return;
    trigger.setAttribute('aria-expanded', 'false');
    if(immediate||!motionAllowed())finishClose();
    else if(targetOpen){
      targetOpen=false;quickVersion++;launchBusy=false;
      panel.inert=true;panel.classList.add('is-closing');
      animatePanel(false);
    }
    if (restoreFocus) trigger.focus();
  }
  function toggle() {
    if(!panel.hidden&&targetOpen){close(true);return}
    // A reversal keeps the visible view/height and the same animation timeline.
    const reopening=!panel.hidden;
    const startMenu=document.querySelector('#air-start-menu');
    if(startMenu&&!startMenu.hidden)window.airStartMenu?.toggle();
    if(!reopening)showView('control');
    panel.hidden=false;panel.inert=false;panel.classList.remove('is-closing');targetOpen=true;
    trigger.setAttribute('aria-expanded','true');
    if(motionAllowed())animatePanel(true);else cancelMotion();
    closeButton.focus();watchVolume();
  }
  function keydown(event) {
    if (!panel.hidden && event.key === 'Escape') {
      if(window.airControlCenter?.back?.()){event.preventDefault();event.stopImmediatePropagation();return;}
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  }
  function outside(event) {
    if (!island.contains(event.target)) close();
  }
  function visibility() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    if (document.hidden) { close(false,true); return; }
    updateClock();
    timer = setInterval(updateClock, 15000);
  }
  function dismiss() { close(true); }
  function dispose() {
    close(false,true);
    if (timer !== null) clearInterval(timer);
    trigger.removeEventListener('click', toggle);
    closeButton.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('focusin', outside);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('air-settings-changed', settingsChanged);
    reducedMotion?.removeEventListener?.('change',motionPreferenceChanged);
    dockTile.removeEventListener('click', changeDockTheme);
    controlButton?.removeEventListener('click',selectControl);quickButton?.removeEventListener('click',selectQuick);stopRegistry?.();
    desktopTile?.removeEventListener('click',changeDesktop);volume?.removeEventListener('input',changeVolume);
    document.removeEventListener('air-notes-saved', notesSaved);
    noteNotice.hidden = true;
    noteNoticeMessage.textContent = '';
    noteNoticeTime.textContent = '';
    noteNoticeTime.dateTime = '';
    if(noticeButton)noticeButton.disabled=true;
    desktop.classList.remove('has-air-island');
  }
  controlButton?.addEventListener('click',selectControl);quickButton?.addEventListener('click',selectQuick);
  trigger.addEventListener('click', toggle);
  closeButton.addEventListener('click', dismiss);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('focusin', outside);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('air-settings-changed', settingsChanged);
  reducedMotion?.addEventListener?.('change',motionPreferenceChanged);
  dockTile.addEventListener('click', changeDockTheme);
  desktopTile?.addEventListener('click',changeDesktop);
  volume?.addEventListener('input',changeVolume);
  document.querySelector('#air-control-apps')?.addEventListener('click',event=>quickAction(event,()=>{if(window.airStartMenu?.enabled())window.airStartMenu.toggle();else{openApp('launchpad');document.querySelector('.alp-search')?.focus()}}));
  document.querySelector('#air-control-settings')?.addEventListener('click',event=>quickAction(event,()=>{openApp('settings');document.querySelector('#air-desktop-theme')?.focus()}));
  document.querySelector('#air-control-refresh')?.addEventListener('click',async()=>{
    try{await airSettingsWrites;const saved=await window.airOS.preferences.get();airSettingsCache=saved;applyAirSettings(saved);dockStatus.textContent='Einstellungen aktualisiert.'}
    catch{dockStatus.textContent='Einstellungen konnten nicht aktualisiert werden.'}
  });
  noticeButton?.addEventListener('click',()=>{noteNotice.focus();noteNotice.scrollIntoView({block:'nearest'})});

  document.addEventListener('air-notes-saved', notesSaved);
  window.addEventListener('pagehide', dispose, {once: true});
  desktop.classList.add('has-air-island');
  showView('control');
  settingsChanged();
  visibility();
})();
