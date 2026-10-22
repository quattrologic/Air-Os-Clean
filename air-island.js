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
  let timer = null;

  function updateClock() {
    const settings = typeof readAirSettings === 'function' ? readAirSettings() : {};
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = now.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', hour12: settings.clock24 === false
    });
    trigger.setAttribute('aria-label', 'Air Island, ' + clock.textContent + ', öffnen oder schließen');
  }
  function close(restoreFocus = false) {
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }
  function toggle() {
    if (!panel.hidden) { close(true); return; }
    panel.hidden = false;
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
    if (document.hidden) { close(); return; }
    updateClock();
    timer = setInterval(updateClock, 15000);
  }
  function dismiss() { close(true); }
  function dispose() {
    if (timer !== null) clearInterval(timer);
    trigger.removeEventListener('click', toggle);
    closeButton.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('focusin', outside);
    document.removeEventListener('visibilitychange', visibility);
    document.removeEventListener('air-settings-changed', updateClock);
    desktop.classList.remove('has-air-island');
  }
  trigger.addEventListener('click', toggle);
  closeButton.addEventListener('click', dismiss);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('focusin', outside);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('air-settings-changed', updateClock);
  window.addEventListener('pagehide', dispose, {once: true});
  desktop.classList.add('has-air-island');
  updateClock();
  visibility();
})();
