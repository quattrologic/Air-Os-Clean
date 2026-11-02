/* Air-OS Notch — independent desktop UI; no native macOS APIs required. */
(() => {
  'use strict';

  const menubar = document.querySelector('.menubar');
  if (!menubar) return;

  const notch = document.createElement('section');
  notch.id = 'air-notch';
  notch.className = 'air-notch';
  notch.setAttribute('aria-label', 'Air-OS Notch');
  notch.innerHTML = `
    <button type="button" class="air-notch-trigger" aria-controls="air-notch-panel" aria-expanded="false" aria-label="Notch öffnen">
      <span class="air-notch-indicator" aria-hidden="true"></span>
      <span class="air-notch-trigger-label">Air-OS</span>
      <span class="air-notch-chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="air-notch-panel" class="air-notch-panel" hidden>
      <header class="air-notch-header">
        <div><span class="air-notch-eyebrow">AIR-OS NOTCH</span><strong class="air-notch-time">--:--</strong></div>
        <button type="button" class="air-notch-close" data-notch-close aria-label="Notch schließen">×</button>
      </header>
      <section class="air-notch-section" aria-label="Musik">
        <div class="air-notch-section-label">MUSIK</div>
        <div class="air-notch-now">
          <span class="air-notch-art" aria-hidden="true">♫</span>
          <div class="air-notch-track"><strong class="air-notch-track-title">Keine Musik</strong><small class="air-notch-track-artist">Öffne Air Music für lokale Songs.</small></div>
        </div>
        <div class="air-notch-player">
          <button type="button" data-notch-music="previous" aria-label="Vorheriger Titel" disabled>⏮</button>
          <button type="button" data-notch-music="toggle" class="air-notch-play" aria-label="Musik abspielen" disabled>▶</button>
          <button type="button" data-notch-music="next" aria-label="Nächster Titel" disabled>⏭</button>
          <button type="button" data-notch-open="music" class="air-notch-open-app">Air Music öffnen</button>
        </div>
      </section>
      <section class="air-notch-section" aria-label="Timer">
        <div class="air-notch-section-label">TIMER</div>
        <div class="air-notch-timer-top"><strong class="air-notch-countdown" role="timer">05:00</strong><span class="air-notch-timer-status" role="status" aria-live="polite">Bereit</span></div>
        <div class="air-notch-presets" aria-label="Timerdauer">
          <button type="button" data-notch-minutes="5" class="is-selected" aria-pressed="true">5 Min</button>
          <button type="button" data-notch-minutes="10" aria-pressed="false">10 Min</button>
          <button type="button" data-notch-minutes="25" aria-pressed="false">25 Min</button>
        </div>
        <div class="air-notch-timer-actions">
          <button type="button" data-notch-timer="toggle" class="air-notch-primary">Starten</button>
          <button type="button" data-notch-timer="reset">Zurücksetzen</button>
        </div>
      </section>
      <section class="air-notch-section air-notch-calendar" aria-label="Kalender">
        <div class="air-notch-section-label">NÄCHSTER TERMIN</div>
        <div class="air-notch-event"><strong class="air-notch-event-title">Keine anstehenden Termine</strong><small class="air-notch-event-time">Dein lokaler Air-OS-Kalender</small></div>
        <button type="button" data-notch-open="calendar" class="air-notch-calendar-open">Kalender öffnen ↗</button>
      </section>
    </div>`;
  menubar.insertAdjacentElement('afterend', notch);

  const find = selector => notch.querySelector(selector);
  const panel = find('#air-notch-panel');
  const trigger = find('.air-notch-trigger');
  const timer = { duration: 300, remaining: 300, endAt: null, done: false };
  let media = { available: false, playable: false };
  let musicEventVersion = 0;
  let expanded = false;
  let audioContext = null;

  function setOpen(open) {
    if (open && notch.hidden) return;
    expanded = !!open;
    notch.classList.toggle('is-open', expanded);
    panel.hidden = !expanded;
    trigger.setAttribute('aria-expanded', String(expanded));
    trigger.setAttribute('aria-label', expanded ? 'Notch schließen' : 'Notch öffnen');
    if (expanded) updateCalendar();
  }

  function setEnabled(enabled) {
    notch.hidden = !enabled;
    if (!enabled) setOpen(false);
  }

  function format(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
  }

  function updateTimer() {
    find('.air-notch-countdown').textContent = format(timer.remaining);
    const status = find('.air-notch-timer-status');
    status.textContent = timer.done ? 'Zeit abgelaufen' : timer.endAt ? 'Läuft' : timer.remaining < timer.duration ? 'Pausiert' : 'Bereit';
    notch.classList.toggle('is-timer-done', timer.done);
    const control = find('[data-notch-timer="toggle"]');
    control.textContent = timer.done ? 'Fertig' : timer.endAt ? 'Pause' : timer.remaining < timer.duration ? 'Fortsetzen' : 'Starten';
    notch.querySelectorAll('[data-notch-minutes]').forEach(button => {
      const selected = Number(button.dataset.notchMinutes) * 60 === timer.duration;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function prepareSound() {
    if (audioContext || !window.AudioContext) return;
    try {
      audioContext = new AudioContext();
      void audioContext.resume().catch(() => {});
    } catch { audioContext = null; }
  }

  function signalTimerDone() {
    if (!audioContext || audioContext.state !== 'running') return;
    try {
      [0, 0.22, 0.44].forEach(delay => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        const start = audioContext.currentTime + delay;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.09, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.17);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.18);
      });
    } catch { /* Timer remains visible even without sound. */ }
  }

  function tick() {
    if (timer.endAt !== null) {
      timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
      if (timer.remaining === 0) {
        timer.endAt = null;
        timer.done = true;
        signalTimerDone();
      }
      updateTimer();
    }
  }

  function controlTimer(action) {
    if (action === 'reset' || timer.done) {
      timer.endAt = null;
      timer.remaining = timer.duration;
      timer.done = false;
    } else if (timer.endAt !== null) {
      tick();
      timer.endAt = null;
    } else {
      prepareSound();
      timer.endAt = Date.now() + timer.remaining * 1000;
    }
    updateTimer();
  }

  function updateMusic() {
    const hasTrack = !!media.available;
    const playable = hasTrack && !!media.playable;
    find('.air-notch-track-title').textContent = hasTrack ? media.title : 'Keine Musik';
    find('.air-notch-track-artist').textContent = hasTrack
      ? (media.playing ? media.artist : 'Zuletzt gespielt · ' + media.artist)
      : 'Öffne Air Music für lokale Songs.';
    const cover = find('.air-notch-art');
    if (cover) {
      cover.textContent = media.artwork ? '' : '♫';
      cover.style.backgroundImage = media.artwork ? 'url("' + media.artwork + '")' : '';
      cover.classList.toggle('has-artwork', !!media.artwork);
    }
    notch.querySelectorAll('[data-notch-music]').forEach(button => {
      button.disabled = !playable;
      button.title = playable ? '' : 'Zuerst Air Music mit lokalen Dateien öffnen';
    });
    const play = find('[data-notch-music="toggle"]');
    play.textContent = media.playing ? '❚❚' : '▶';
    play.setAttribute('aria-label', media.playing ? 'Musik pausieren' : 'Musik abspielen');
    find('.air-notch-indicator').classList.toggle('is-playing', !!media.playing);
    notch.classList.toggle('has-last-song', hasTrack);
    find('.air-notch-trigger-label').textContent = timer.done ? 'Timer fertig' : hasTrack ? media.title : 'Air-OS';
    trigger.title = hasTrack ? 'Zuletzt gespielt: ' + media.title + ' – ' + media.artist : 'Air-OS Notch';
  }

  async function loadLastMusic() {
    if (!window.airOS?.media?.getLast) return;
    const version = musicEventVersion;
    try {
      const saved = await window.airOS.media.getLast();
      if (version !== musicEventVersion || !saved?.title) return;
      media = {
        ...saved, available: true, playable: false, playing: false
      };
      updateMusic();
    } catch { /* The notch still works when local media history is unavailable. */ }
  }

  function updateClock() {
    find('.air-notch-time').textContent = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (timer.done) find('.air-notch-trigger-label').textContent = 'Timer fertig';
    else updateMusic();
  }

  function updateCalendar() {
    let events = [];
    try {
      const raw = JSON.parse(localStorage.getItem('air-os-calendar-events-v1') || '[]');
      if (Array.isArray(raw)) events = raw;
    } catch { /* Local calendar might not be available. */ }
    const now = Date.now();
    const next = events
      .filter(event => event && /^\d{4}-\d{2}-\d{2}$/.test(event.date) && /^\d{2}:\d{2}$/.test(event.time) && typeof event.title === 'string')
      .map(event => ({ event, timestamp: new Date(event.date + 'T' + event.time).getTime() }))
      .filter(item => Number.isFinite(item.timestamp) && item.timestamp >= now)
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    find('.air-notch-event-title').textContent = next ? next.event.title : 'Keine anstehenden Termine';
    find('.air-notch-event-time').textContent = next
      ? new Date(next.timestamp).toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Dein lokaler Air-OS-Kalender';
  }

  trigger.addEventListener('click', () => setOpen(!expanded));
  notch.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button === trigger) return;
    if (button.hasAttribute('data-notch-close')) {
      setOpen(false);
      trigger.focus();
    } else if (button.dataset.notchMusic) {
      window.dispatchEvent(new CustomEvent('air-os:music-control', { detail: { action: button.dataset.notchMusic } }));
    } else if (button.dataset.notchMinutes) {
      timer.duration = Number(button.dataset.notchMinutes) * 60;
      timer.remaining = timer.duration;
      timer.endAt = null;
      timer.done = false;
      updateTimer();
      updateMusic();
    } else if (button.dataset.notchTimer) {
      controlTimer(button.dataset.notchTimer);
      updateMusic();
    } else if (button.dataset.notchOpen) {
      document.querySelector('.dock-app[data-app="' + button.dataset.notchOpen + '"]')?.click();
      setOpen(false);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (expanded && !notch.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) { setOpen(false); trigger.focus(); }
  });
  window.addEventListener('air-os:music-state', event => {
    musicEventVersion++;
    if (event.detail?.available) media = event.detail;
    else media = { ...media, playable: false, playing: false };
    updateMusic();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'air-os-calendar-events-v1') updateCalendar();
  });

  setInterval(() => {
    tick();
    updateClock();
    if (expanded) updateCalendar();
  }, 1000);
  updateTimer();
  updateMusic();
  updateClock();
  void loadLastMusic();
  try {
    const settings = JSON.parse(localStorage.getItem('air-os-desktop-settings-v2') || '{}');
    setEnabled(settings.notchEnabled !== false);
  } catch { setEnabled(true); }

  window.airNotch = Object.freeze({ setEnabled });
})();
