'use strict';
(() => {
  if (typeof window.appBody !== 'function') return;
  const previousAppBody = window.appBody;
  appNames.reboot = 'Reboot';
  iconClasses.reboot = 'reboot-icon';
  iconGlyphs.reboot = 'R';
  vectorIcon.reboot = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="rebootGradient" x2="1" y2="1"><stop stop-color="#1e2d55"/><stop offset="1" stop-color="#060d1d"/></linearGradient></defs><rect x="2" y="2" width="60" height="60" rx="15" fill="url(#rebootGradient)"/><path d="M22 47V16h16a10 10 0 0 1 0 20H22m14 0 10 11" fill="none" stroke="#61d6ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="16" r="4" fill="#a5f6dd"/></svg>';
  if (typeof paintAppIcons === 'function') paintAppIcons();

  function body() {
    return [
      '<div class="air-reboot">',
      '<header class="air-reboot-header"><div><small>AIR OS · GAMING</small><h2>Reboot</h2><p>Verwalte lokal installierte Reboot-Komponenten direkt vom Air-OS-Desktop.</p></div><span class="air-reboot-logo">R</span></header>',
      '<div class="air-reboot-note" role="note">Dies ist eine native Steuerungs-App – keine Kopie des Reboot Launchers. Fortnite und der originale Launcher laufen in eigenen Windows-Fenstern. Es werden keine Spiel- oder Serverdateien automatisch heruntergeladen.</div>',
      '<div id="air-reboot-feedback" class="air-reboot-feedback" role="status" aria-live="polite">Lokale Komponenten werden geprüft …</div>',
      '<div class="air-reboot-grid">',
      '<section class="air-reboot-card" data-reboot-component="launcher"><div class="air-reboot-card-top"><span class="air-reboot-number">01</span><span class="air-reboot-state" data-reboot-state>Prüfen …</span></div><h3>Reboot Launcher</h3><p>Den originalen Reboot-Launcher unter Windows öffnen. Seine Spieleverwaltung bleibt unverändert.</p><div class="air-reboot-path" data-reboot-path>Nicht ausgewählt</div><div class="air-reboot-actions"><button type="button" data-reboot-action="configure" data-reboot-kind="launcher">EXE auswählen</button><button type="button" class="primary" data-reboot-action="start" data-reboot-kind="launcher">Launcher öffnen</button></div><small data-reboot-message></small></section>',
      '<section class="air-reboot-card" data-reboot-component="backend"><div class="air-reboot-card-top"><span class="air-reboot-number">02</span><span class="air-reboot-state" data-reboot-state>Prüfen …</span></div><h3>LawinServer</h3><p>Den separat installierten Fortnite-Backend-Dienst starten und stoppen. Benötigt Node.js und installierte npm-Pakete.</p><div class="air-reboot-path" data-reboot-path>Nicht ausgewählt</div><div class="air-reboot-actions"><button type="button" data-reboot-action="configure" data-reboot-kind="backend">Ordner auswählen</button><button type="button" class="primary" data-reboot-action="start" data-reboot-kind="backend">Starten</button><button type="button" data-reboot-action="stop" data-reboot-kind="backend">Stoppen</button></div><small data-reboot-message></small></section>',
      '<section class="air-reboot-card" data-reboot-component="matchmaker"><div class="air-reboot-card-top"><span class="air-reboot-number">03</span><span class="air-reboot-state" data-reboot-state>Prüfen …</span></div><h3>FortMatchmaker</h3><p>Den separat installierten WebSocket-Matchmaker starten und stoppen. Ein Gameserver wird zusätzlich benötigt.</p><div class="air-reboot-path" data-reboot-path>Nicht ausgewählt</div><div class="air-reboot-actions"><button type="button" data-reboot-action="configure" data-reboot-kind="matchmaker">Ordner auswählen</button><button type="button" class="primary" data-reboot-action="start" data-reboot-kind="matchmaker">Starten</button><button type="button" data-reboot-action="stop" data-reboot-kind="matchmaker">Stoppen</button></div><small data-reboot-message></small></section>',
      '</div>',
      '<footer class="air-reboot-footer"><strong>Project Reboot 3.0</strong><p>Der eigentliche Gameserver muss separat gebaut und über den kompatiblen Launcher eingerichtet werden. Ein gestarteter Node-Prozess bestätigt noch keine Verbindung zum Spiel.</p><div class="air-reboot-links"><button type="button" data-url="https://github.com/Auties00/Reboot-Launcher">Launcher-Repository ↗</button><button type="button" data-url="https://github.com/Milxnor/Project-Reboot-3.0">Gameserver-Repository ↗</button></div></footer>',
      '</div>'
    ].join('');
  }

  function mount(win) {
    const api = window.airOS && window.airOS.reboot;
    const feedback = win.querySelector('#air-reboot-feedback');
    if (!api) {
      feedback.textContent = 'Die native Reboot-Schnittstelle ist nicht verfügbar. Bitte die Desktop-App neu bauen.';
      return;
    }
    async function refresh() {
      const data = await api.state();
      const platformSupported = data.platform === 'win32';
      for (const [kind, status] of Object.entries(data.components)) {
        const card = win.querySelector('[data-reboot-component="' + kind + '"]');
        if (!card) continue;
        const state = card.querySelector('[data-reboot-state]');
        const path = card.querySelector('[data-reboot-path]');
        const message = card.querySelector('[data-reboot-message]');
        state.textContent = status.running ? 'Läuft' : (status.path ? 'Eingerichtet' : 'Nicht eingerichtet');
        state.classList.toggle('running', status.running);
        path.textContent = status.path || 'Noch keine lokale Installation ausgewählt';
        path.title = status.path || '';
        message.textContent = status.message || '';
        const choose = card.querySelector('[data-reboot-action="configure"]');
        const start = card.querySelector('[data-reboot-action="start"]');
        const stop = card.querySelector('[data-reboot-action="stop"]');
        choose.disabled = Boolean(status.running) || (kind === 'launcher' && !platformSupported);
        start.disabled = Boolean(status.running) || !status.path || (kind === 'launcher' && !platformSupported);
        if (stop) stop.disabled = !status.running;
      }
      feedback.textContent = platformSupported
        ? 'Bereit. Wähle für jede Komponente die bereits installierte Datei bzw. den Projektordner aus.'
        : 'Reboot Launcher: nur Windows. Die Node.js-Dienste können auf unterstützten Systemen separat laufen.';
    }
    win.addEventListener('click', async event => {
      const button = event.target.closest('[data-reboot-action]');
      if (!button || button.disabled) return;
      const kind = button.dataset.rebootKind;
      const action = button.dataset.rebootAction;
      button.disabled = true;
      feedback.textContent = 'Aktion wird ausgeführt …';
      try {
        await api[action](kind);
        await refresh();
        if (action === 'start' && kind === 'launcher') feedback.textContent = 'Öffnen an Windows übergeben. Bitte das Launcher-Fenster prüfen.';
      } catch (error) {
        feedback.textContent = 'Aktion fehlgeschlagen: ' + (error && error.message ? error.message : String(error));
        try { await refresh(); } catch { /* Keep primary error visible. */ }
        feedback.textContent = 'Aktion fehlgeschlagen: ' + (error && error.message ? error.message : String(error));
      }

    });
    refresh().catch(error => { feedback.textContent = 'Reboot-Status konnte nicht geladen werden: ' + error.message; });
  }
  window.appBody = function(id) {
    return id === 'reboot' ? body() : previousAppBody(id);
  };
  window.rebootApp = Object.freeze({ init: mount });
})();