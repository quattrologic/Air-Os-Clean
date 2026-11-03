/* Air-OS iPad: no external requests, trackers, APIs or Electron dependencies. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const audio = $('#audio');
  const STORE = 'air-os-ipad-tracks-v1';
  const KEYS = Object.freeze({ last: 'air-ipad:last-track-v1', progress: 'air-ipad:last-progress-v1',
    events: 'air-ipad:calendar-v1', timer: 'air-ipad:timer-v1' });
  const state = { records: [], currentId: '', lastId: '', objectUrl: null, unlocked: false, db: null,
    registration: null, pendingReload: false, timer: { duration: 300, remaining: 300, endAt: null, done: false } };
  let lastPositionSave = 0;
  let toastTimeout;

  function toast(message) {
    const el = $('#toast');
    el.textContent = String(message);
    el.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { el.hidden = true; }, 4200);
  }
  function safeJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function seconds(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  function time(value) {
    const sec = seconds(value);
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }
  function dateTime() {
    const now = new Date();
    $('#lock-date').textContent = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#lock-time').textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  function setArt(el, data) {
    const valid = typeof data === 'string' &&
      /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data) && data.length < 180000;
    el.style.backgroundImage = valid ? 'url("' + data + '")' : '';
    el.textContent = valid ? '' : '♫';
  }
  function setProgress(prefix, position, duration) {
    $('#' + prefix + '-elapsed').textContent = time(position);
    const total = $('#' + prefix + '-total');
    if (total) total.textContent = time(duration);
    const fill = $('#' + prefix + '-fill');
    fill.style.width = duration > 0 ? Math.min(100, Math.max(0, position / duration * 100)) + '%' : '0%';
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('Lokaler Datenspeicher nicht verfügbar.'));
      const req = indexedDB.open(STORE, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('tracks', { keyPath: 'id' }); };
      req.onerror = () => reject(req.error || new Error('Datenbank konnte nicht geöffnet werden.'));
      req.onsuccess = () => resolve(req.result);
    });
  }
  function database(mode, fn) {
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('tracks', mode);
      const request = fn(tx.objectStore('tracks'));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error || new Error('Lokaler Speicherfehler.'));
      tx.onabort = () => reject(tx.error || new Error('Speichertransaktion abgebrochen.'));
    });
  }
  const song = id => state.records.find(record => record.id === id);
  const current = () => song(state.currentId);
  const last = () => song(state.lastId);
  async function refreshLibrary() {
    state.records = await database('readonly', db => db.getAll());
    state.records.sort((a, b) => a.addedAt - b.addedAt);
    state.lastId = localStorage.getItem(KEYS.last) || '';
    if (!song(state.lastId)) {
      state.lastId = '';
      localStorage.removeItem(KEYS.last);
    }
    if (!current()) state.currentId = state.lastId || state.records[0]?.id || '';
    renderLibrary();
    renderMedia();
  }

  function renderLibrary() {
    const list = $('#song-list');
    list.replaceChildren();
    if (!state.records.length) {
      const note = document.createElement('p');
      note.className = 'hint';
      note.textContent = 'Noch keine Musik importiert. Tippe auf „Musik importieren“.';
      list.append(note);
      return;
    }
    for (const record of state.records) {
      const row = document.createElement('div');
      row.className = 'song-row' + (record.id === state.currentId ? ' active' : '');
      const choose = document.createElement('button');
      choose.type = 'button';
      choose.textContent = record.title;
      choose.title = record.title;
      choose.addEventListener('click', () => { void playTrack(record.id); });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Titel entfernen: ' + record.title);
      remove.textContent = '×';
      remove.addEventListener('click', async () => {
        if (!confirm('Diesen Titel aus Air-OS entfernen?')) return;
        try {
          await database('readwrite', db => db.delete(record.id));
          if (state.currentId === record.id) {
            audio.pause();
            audio.removeAttribute('src');
            if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
            state.objectUrl = null; state.currentId = '';
          }
          if (state.lastId === record.id) localStorage.removeItem(KEYS.last);
          await refreshLibrary();
        } catch (error) { toast('Löschen fehlgeschlagen: ' + error.message); }
      });
      row.append(choose, remove);
      list.append(row);
    }
  }
  function renderMedia() {
    const track = current();
    const recent = last();
    $('#player-title').textContent = track?.title || 'Noch keine Musik';
    $('#player-artist').textContent = track?.artist || 'Füge lokale Musikdateien hinzu';
    setArt($('#player-cover'), track?.artwork);
    $('#notch-title').textContent = recent?.title || 'Keine Musik';
    $('#notch-artist').textContent = recent?.artist || 'Öffne Air Music';
    setArt($('#notch-cover'), recent?.artwork);
    $('#notch-label').textContent = recent?.title || 'Air-OS';
    $('.pulse').classList.toggle('playing', !audio.paused);
    const savedProgress = safeJSON(KEYS.progress, {});
    const position = track?.id === savedProgress.id && !audio.src ? seconds(savedProgress.position) : seconds(audio.currentTime);
    const duration = seconds(audio.duration) || seconds(savedProgress.id === track?.id ? savedProgress.duration : 0);
    setProgress('player', position, duration);
    $('#lock-music').hidden = !recent;
    if (recent) {
      $('#lock-title').textContent = recent.title;
      $('#lock-artist').textContent = 'Zuletzt gespielt · ' + (recent.artist || 'Lokale Musik');
      setArt($('#lock-cover'), recent.artwork);
      const lastProgress = savedProgress.id === recent.id ? savedProgress : {};
      $('#lock-elapsed').textContent = time(lastProgress.position);
      $('#lock-total').textContent = time(lastProgress.duration);
      $('#lock-fill').style.width = lastProgress.duration > 0
        ? Math.min(100, Math.max(0, lastProgress.position / lastProgress.duration * 100)) + '%' : '0%';
    }
    $$('[data-control]').forEach(button => {
      button.disabled = !state.unlocked || !track;
      if (button.dataset.control === 'toggle') {
        button.textContent = audio.paused ? '▶' : '❚❚';
        button.setAttribute('aria-label', audio.paused ? 'Abspielen' : 'Pausieren');
      }
    });
  }
  function rememberPosition() {
    if (!state.lastId || state.currentId !== state.lastId) return;
    const now = Date.now();
    if (now - lastPositionSave < 1500 && !audio.paused) return;
    lastPositionSave = now;
    localStorage.setItem(KEYS.progress, JSON.stringify({
      id: state.lastId,
      position: seconds(audio.currentTime),
      duration: seconds(audio.duration)
    }));
  }
  async function playTrack(id) {
    const record = song(id);
    if (!record) return;
    if (state.currentId !== id || !audio.src) {
      audio.pause();
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = URL.createObjectURL(record.blob);
      state.currentId = id;
      audio.src = state.objectUrl;
      renderLibrary();
    }
    try { await audio.play(); }
    catch (error) { toast('Titel kann nicht abgespielt werden. Prüfe das Audioformat.'); }
    renderMedia();
  }
  function next(delta) {
    if (!state.records.length) return;
    const index = Math.max(0, state.records.findIndex(item => item.id === state.currentId));
    const nextId = state.records[(index + delta + state.records.length) % state.records.length].id;
    void playTrack(nextId);
  }
  async function importTracks(files) {
    let success = 0;
    for (const file of files) {
      if (!file || !file.size || !/^(audio\/|application\/ogg)/.test(file.type) && !/\.(mp3|m4a|wav|ogg|aac)$/i.test(file.name)) continue;
      try {
        await database('readwrite', db => db.put({
          id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, '').slice(0, 150),
          artist: 'Lokale Datei', artwork: '', blob: file, addedAt: Date.now() + success
        }));
        success++;
      } catch (error) {
        toast('Speicherplatz reicht möglicherweise nicht aus. Import angehalten.');
        break;
      }
    }
    if (success) { await refreshLibrary(); toast(success + ' Titel lokal gespeichert.'); }
    else toast('Keine unterstützten Audiodateien importiert.');
  }
  function processCover(file) {
    if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
      toast('Bitte ein PNG/JPG/WebP-Bild unter 5 MB wählen.'); return;
    }
    const record = current();
    if (!record) { toast('Wähle zuerst einen Titel.'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const size = 320;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const ratio = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * ratio, h = img.naturalHeight * ratio;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        const artwork = canvas.toDataURL('image/jpeg', 0.75);
        if (artwork.length >= 180000) throw new Error('Bild ist zu groß.');
        record.artwork = artwork;
        await database('readwrite', db => db.put(record));
        renderMedia(); toast('Cover lokal gespeichert.');
      } catch (error) { toast('Cover konnte nicht gespeichert werden.'); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Bild konnte nicht geladen werden.'); };
    img.src = url;
  }
  function openPanel(name) {
    $$('.app-panel').forEach(panel => { panel.hidden = panel.id !== name + '-panel'; });
  }

  function getEvents() {
    const stored = safeJSON(KEYS.events, []);
    return Array.isArray(stored) ? stored.filter(e => e && typeof e.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && /^\d{2}:\d{2}$/.test(e.time || '')) : [];
  }
  function renderEvents() {
    const list = $('#event-list');
    list.replaceChildren();
    const events = getEvents().sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    if (!events.length) {
      const p = document.createElement('p'); p.className='hint'; p.textContent='Noch keine Termine gespeichert.'; list.append(p); return;
    }
    for (const event of events) {
      const row = document.createElement('div'); row.className='event-row';
      const text = document.createElement('span'); const name = document.createElement('strong'), when = document.createElement('small');
      name.textContent=event.title; when.textContent=event.date+' · '+event.time; text.append(name,when);
      const remove = document.createElement('button'); remove.type='button'; remove.textContent='×'; remove.setAttribute('aria-label','Termin entfernen');
      remove.addEventListener('click',()=>{localStorage.setItem(KEYS.events,JSON.stringify(getEvents().filter(e=>e.id!==event.id))); renderEvents();});
      row.append(text,remove);list.append(row);
    }
  }
  function loadTimer() {
    const saved = safeJSON(KEYS.timer, {});
    if (saved.duration && [300,600,1500].includes(saved.duration)) state.timer.duration=saved.duration;
    if (Number.isFinite(saved.remaining) && saved.remaining>=0 && saved.remaining<=1500) state.timer.remaining=saved.remaining;
    if (Number.isFinite(saved.endAt) && saved.endAt > 0) state.timer.endAt=saved.endAt;
    state.timer.done=!!saved.done;
    tickTimer();
  }
  function saveTimer() { localStorage.setItem(KEYS.timer,JSON.stringify(state.timer)); }
  function tickTimer() {
    const t=state.timer;
    if (t.endAt) {
      t.remaining=Math.max(0,Math.ceil((t.endAt-Date.now())/1000));
      if (!t.remaining) { t.endAt=null;t.done=true;saveTimer();toast('Dein Air-OS Timer ist abgelaufen.'); }
    }
    $('#timer-display').textContent=time(t.remaining);
    $('#notch-timer').textContent=time(t.remaining);
    $('#timer-status').textContent=t.done?'Zeit abgelaufen':t.endAt?'Läuft':t.remaining<t.duration?'Pausiert':'Bereit';
    $('#timer-toggle').textContent=t.done?'Fertig':t.endAt?'Pause':t.remaining<t.duration?'Fortsetzen':'Starten';
    $$('[data-minutes]').forEach(el=>el.classList.toggle('selected',Number(el.dataset.minutes)*60===t.duration));
  }
  function timerAction(reset) {
    const t=state.timer;
    if(reset||t.done){t.endAt=null;t.remaining=t.duration;t.done=false;}
    else if(t.endAt){t.remaining=Math.max(0,Math.ceil((t.endAt-Date.now())/1000));t.endAt=null;}
    else t.endAt=Date.now()+t.remaining*1000;
    saveTimer();tickTimer();
  }

  async function setupUpdates() {
    if (!('serviceWorker' in navigator) || !isSecureContext) {
      $('#settings-offline').textContent='Nicht unterstützt: HTTPS erforderlich';
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      state.registration=registration;
      $('#settings-offline').textContent='Service Worker aktiv';
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if (!audio.paused) {
          state.pendingReload=true;toast('Update geladen. Es wird nach der Wiedergabe aktiviert.');
        } else location.reload();
      });
      const check=async()=>{
        if (!navigator.onLine) return;
        try { await registration.update(); } catch { /* Private server may be asleep. */ }
      };
      $('#check-update').addEventListener('click',async()=>{
        $('#update-state').textContent='Prüfe den privaten Server …';
        await check();
        $('#update-state').textContent='Prüfung abgeschlossen. Ohne Verbindung zum PC bleiben wir offline.';
      });
      window.addEventListener('online',()=>{networkStatus();void check();});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden){tickTimer();void check();}});
      setInterval(check,15*60*1000);
    } catch(error) {
      $('#settings-offline').textContent='Offline-Installation nicht möglich';
      $('#update-state').textContent='Service Worker konnte nicht eingerichtet werden. Bitte HTTPS und Speicher prüfen.';
    }
  }
  function networkStatus() {
    $('#network-state').textContent=navigator.onLine?'Netz bereit':'Offline';
    $('#settings-network').textContent=navigator.onLine?'Netz bereit':'Offline';
  }
  function wire() {
    $('#unlock').addEventListener('click',()=>{
      state.unlocked=true;$('#lockscreen').hidden=true;$('#desktop').hidden=false;
      renderMedia();
    });
    $('#lock-again').addEventListener('click',()=>{
      audio.pause();state.unlocked=false;$('#desktop').hidden=true;$('#lockscreen').hidden=false;
      $('#notch-panel').hidden=true;renderMedia();
    });
    $$('.app-tile').forEach(button=>button.addEventListener('click',()=>openPanel(button.dataset.panel)));
    $$('[data-close]').forEach(button=>button.addEventListener('click',()=>openPanel('')));
    $('#notch-toggle').addEventListener('click',()=>{
      const panel=$('#notch-panel');panel.hidden=!panel.hidden;$('#notch-toggle').setAttribute('aria-expanded',String(!panel.hidden));
    });
    $('#notch-close').addEventListener('click',()=>{
      $('#notch-panel').hidden=true;$('#notch-toggle').setAttribute('aria-expanded','false');
    });
    $$('[data-control]').forEach(button=>button.addEventListener('click',()=>{
      if (!state.unlocked)return;
      const action=button.dataset.control;
      if(action==='prev')next(-1);
      if(action==='next')next(1);
      if(action==='toggle'){if(audio.paused)void playTrack(state.currentId);else audio.pause();}
    }));
    $('#import-audio').addEventListener('change',event=>{
      const files=[...event.target.files];event.target.value='';
      void importTracks(files);
    });
    $('#import-cover').addEventListener('change',event=>{
      const file=event.target.files?.[0];event.target.value='';processCover(file);
    });
    audio.addEventListener('play',()=>{
      state.lastId=state.currentId;localStorage.setItem(KEYS.last,state.lastId);
      rememberPosition();renderMedia();
    });
    audio.addEventListener('pause',()=>{
      rememberPosition();renderMedia();
      if(state.pendingReload)location.reload();
    });
    audio.addEventListener('ended',()=>{rememberPosition();next(1);});
    audio.addEventListener('timeupdate',()=>{rememberPosition();renderMedia();});
    audio.addEventListener('loadedmetadata',()=>{rememberPosition();renderMedia();});
    audio.addEventListener('error',()=>toast('Audio kann nicht abgespielt werden.'));
    $('#timer-toggle').addEventListener('click',()=>timerAction(false));
    $('#timer-reset').addEventListener('click',()=>timerAction(true));
    $$('[data-minutes]').forEach(button=>button.addEventListener('click',()=>{
      state.timer={duration:Number(button.dataset.minutes)*60,remaining:Number(button.dataset.minutes)*60,endAt:null,done:false};
      saveTimer();tickTimer();
    }));
    $('#event-form').addEventListener('submit',event=>{
      event.preventDefault();const form=event.currentTarget;
      const data=new FormData(form);
      const title=String(data.get('title')||'').trim().slice(0,100);
      const date=String(data.get('date')||''),hour=String(data.get('time')||'');
      if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(hour))return;
      const events=getEvents();
      events.push({id:crypto.randomUUID(),title,date,time:hour});
      localStorage.setItem(KEYS.events,JSON.stringify(events));form.reset();renderEvents();toast('Termin lokal gespeichert.');
    });
    window.addEventListener('offline',networkStatus);
    window.addEventListener('beforeunload',()=>{if(state.objectUrl)URL.revokeObjectURL(state.objectUrl);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#notch-panel').hidden=true;$('#notch-toggle').setAttribute('aria-expanded','false');}});
  }

  async function start() {
    wire();networkStatus();dateTime();renderEvents();loadTimer();
    setInterval(()=>{dateTime();tickTimer();},1000);
    try { state.db=await openDB(); await refreshLibrary(); }
    catch(error) {
      toast('Lokaler Musikspeicher nicht verfügbar. Prüfe Safari-Einstellungen und freien Speicherplatz.');
      $('#import-audio').disabled=true;$('#import-cover').disabled=true;
    }
    void setupUpdates();
  }
  start();
})();
