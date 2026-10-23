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
  function notesSaved() {
    const now = new Date();
    // No note title/body, event payload or history is retained.
    noteNoticeMessage.textContent = 'Notiz im Air-OS-Profil gespeichert.';
    noteNoticeTime.dateTime = now.toISOString();
    noteNoticeTime.textContent = now.toLocaleString(undefined, {dateStyle:'short', timeStyle:'short'});
    noteNotice.hidden = false;
  }
  let savingDock = false;
  let timer = null;
  let closingAnimation = null;

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
    if(closingAnimation)finishClose();
    updateClock();
    syncDockTheme();
    if (!savingDock && dockTile.getAttribute('aria-disabled') !== 'true')
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
    trigger.setAttribute('aria-label', 'Air Island, ' + clock.textContent + ', öffnen oder schließen');
  }
  function finishClose() {
    const motion=closingAnimation;closingAnimation=null;
    if(motion){motion.onfinish=null;motion.cancel()}
    panel.hidden=true;panel.inert=false;panel.classList.remove('is-closing');
  }
  function close(restoreFocus = false, immediate = false) {
    if (panel.hidden) return;
    trigger.setAttribute('aria-expanded', 'false');
    const settings=typeof readAirSettings==='function'?readAirSettings():{};
    const modern=settings.desktopTheme==='modern';
    const reduced=settings.reduceMotion||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(immediate||!modern||reduced||typeof panel.animate!=='function')finishClose();
    else if(!closingAnimation){
      // Stop interaction at once; WAAPI owns only the short visual exit.
      panel.inert=true;panel.classList.add('is-closing');
      const style=window.getComputedStyle?.(panel);
      closingAnimation=panel.animate([{opacity:style?.opacity||1,transform:style?.transform||'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],{duration:120,easing:'ease-in'});
      const motion=closingAnimation;
      motion.onfinish=()=>{if(closingAnimation===motion)finishClose()};
    }
    if (restoreFocus) trigger.focus();
  }
  function toggle() {
    if(closingAnimation)finishClose();
    else if (!panel.hidden) { close(true); return; }
    // Dismiss the existing start menu before taking focus, without changing it.
    const startMenu=document.querySelector('#air-start-menu');
    if(startMenu&&!startMenu.hidden)window.airStartMenu?.toggle();
    panel.hidden = false;panel.inert=false;
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  }
  function keydown(event) {
    if (!panel.hidden && event.key === 'Escape') {
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
    dockTile.removeEventListener('click', changeDockTheme);
    document.removeEventListener('air-notes-saved', notesSaved);
    noteNotice.hidden = true;
    noteNoticeMessage.textContent = '';
    noteNoticeTime.textContent = '';
    noteNoticeTime.dateTime = '';
    desktop.classList.remove('has-air-island');
  }
  trigger.addEventListener('click', toggle);
  closeButton.addEventListener('click', dismiss);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('focusin', outside);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('air-settings-changed', settingsChanged);
  dockTile.addEventListener('click', changeDockTheme);
  document.addEventListener('air-notes-saved', notesSaved);
  window.addEventListener('pagehide', dispose, {once: true});
  desktop.classList.add('has-air-island');
  settingsChanged();
  visibility();
})();
