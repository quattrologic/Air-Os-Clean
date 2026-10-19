'use strict';
(() => {
  const baseAppBody = window.appBody;
  if (typeof baseAppBody !== 'function') {
    console.error('Air-OS Erweiterungen konnten appBody nicht finden.');
    return;
  }

  window.airAppRegistry.register('arcade',{name:'Air Arcade',iconClass:'arcade-icon',glyph:'★'});
  vectorIcon.arcade = '<svg viewBox="0 0 301 280" aria-hidden="true"><defs><linearGradient id="airarcadeblue" x2="0.8" y2="1"><stop stop-color="#1dbaf0"/><stop offset="1" stop-color="#2085f4"/></linearGradient></defs><path d="M144 6 L127 13 L118 22 L111 38 L111 54 L116 67 L126 78 L140 85 L156 86 L172 80 L183 70 L190 54 L190 38 L185 25 L174 13 L157 6Z" fill="#1eb8ef"/><path d="M295 160 L287 149 L190 104 L166 97 L166 164 L164 169 L157 174 L144 174 L136 167 L136 98 L116 102 L14 149 L8 155 L6 162 L8 168 L16 175 L112 219 L138 226 L164 226 L189 219 L285 175 L293 168Z" fill="url(#airarcadeblue)"/><path d="M6 196 L7 213 L22 225 L118 268 L143 273 L168 272 L193 264 L279 225 L290 218 L295 209 L295 196 L291 192 L185 240 L166 245 L145 246 L111 238 L9 192Z" fill="#208af5"/><path d="M41 158 L47 152 L55 149 L69 149 L77 152 L83 158 L83 164 L74 172 L58 174 L45 169 L41 164Z" fill="#f9f9fc"/></svg>';

  const textExtensions = new Set([
    '.txt', '.md', '.markdown', '.json', '.js', '.cjs', '.mjs', '.css',
    '.html', '.htm', '.csv', '.tsv', '.log', '.xml', '.yaml', '.yml',
    '.toml', '.ini', '.conf', '.sh', '.py', '.sql'
  ]);
  const fileStates = new WeakMap();
  const arcadeStates = new WeakMap();

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
  function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' KB';
    return (bytes / 1024 / 1024).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' MB';
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function fileIcon(item) {
    if (item.kind === 'folder') return '📁';
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic', '.svg'].includes(item.extension)) return '🖼️';
    if (['.mp3', '.wav', '.m4a', '.flac', '.ogg'].includes(item.extension)) return '♫';
    if (item.extension === '.pdf') return '📕';
    if (['.zip', '.7z', '.rar', '.tar', '.gz'].includes(item.extension)) return '📦';
    if (textExtensions.has(item.extension)) return '📝';
    return '📄';
  }
  function filesBody() {
    return `
      <div class="air-files-app">
        <aside class="air-files-sidebar">
          <div class="air-files-brand"><span class="air-files-brand-icon">▣</span><span><strong>Air-OS</strong><small>Dateien</small></span></div>
          <div class="air-files-section-label">SPEICHERORTE</div>
          <button class="air-files-place active" type="button" data-air-action="choose-folder"><span>▱</span><span><strong>Ordner öffnen …</strong><small>Auf diesem Computer</small></span></button>
          <div class="air-files-place-hint">Wähle einen Ordner, den Air-OS in diesem Fenster anzeigen darf.</div>
          <div class="air-files-sidebar-footer"><span class="air-files-lock">⌑</span><span>Lokaler Dateizugriff<br><small>Nur ausgewählte Ordner</small></span></div>
        </aside>
        <section class="air-files-main">
          <div class="air-files-toolbar">
            <button type="button" class="air-files-tool" data-air-action="up" title="Übergeordneter Ordner" disabled>‹</button>
            <button type="button" class="air-files-tool" data-air-action="refresh" title="Aktualisieren" disabled>↻</button>
            <div class="air-files-location" id="air-files-location">Kein Ordner ausgewählt</div>
            <input id="air-files-search" class="air-files-search" type="search" placeholder="Suchen" aria-label="Dateien suchen" disabled>
            <button type="button" class="air-files-new" data-air-action="new-file" disabled>＋ Neu</button>
          </div>
          <div class="air-files-workspace">
            <div class="air-files-empty" id="air-files-empty">
              <div class="air-files-empty-icon">📂</div>
              <h2>Deine Dateien. An einem Ort.</h2>
              <p>Öffne einen Ordner von diesem Computer, um echte Dateien anzuzeigen, Textdateien zu bearbeiten und Änderungen direkt zu speichern.</p>
              <button class="air-files-primary" type="button" data-air-action="choose-folder">Ordner auswählen …</button>
              <small>Air-OS liest keine Ordner ohne deine Auswahl.</small>
            </div>
            <div class="air-files-list" id="air-files-list" hidden>
              <div class="air-files-columns"><span>Name</span><span>Art</span><span>Größe</span><span>Geändert</span></div>
              <div id="air-files-entries"></div>
              <div class="air-files-no-results" id="air-files-no-results" hidden>Keine passenden Dateien gefunden.</div>
            </div>
            <section class="air-files-editor" id="air-files-editor" hidden>
              <div class="air-files-editor-head"><div><strong id="air-files-editor-title">Dokument.txt</strong><small id="air-files-editor-path"></small></div><span>Texteditor</span></div>
              <textarea id="air-files-editor-text" spellcheck="false" aria-label="Datei bearbeiten"></textarea>
              <div class="air-files-editor-foot"><span id="air-files-editor-status">Ungespeicherte Änderungen werden nicht automatisch gesichert.</span><div><button type="button" class="air-files-secondary" data-air-action="close-editor">Zurück</button><button type="button" class="air-files-primary" data-air-action="save-file">Speichern</button></div></div>
            </section>
          </div>
          <footer class="air-files-status"><span class="air-files-status-dot"></span><span id="air-files-status-text">Bereit</span><span id="air-files-item-count"></span></footer>
        </section>
      </div>`;
  }
  function arcadeBody() {
    if (window.airArcadeGames) return window.airArcadeGames.body();
    return `
      <div class="air-arcade-app">
        <div class="air-arcade-top">
          <div><div class="air-arcade-eyebrow">AIR-OS ARCADE · 01</div><h2>Snake</h2><p>Ein kleiner Klassiker für deine Pause.</p></div>
          <div class="air-arcade-stats"><div><small>PUNKTE</small><strong id="air-arcade-score">0</strong></div><div><small>BESTWERT</small><strong id="air-arcade-best">0</strong></div></div>
        </div>
        <div class="air-arcade-board-wrap"><canvas id="air-arcade-canvas" width="560" height="360" tabindex="0" aria-label="Snake-Spielbereich"></canvas><div class="air-arcade-overlay" id="air-arcade-overlay"><span class="air-arcade-overlay-icon">✦</span><strong id="air-arcade-overlay-title">Bereit?</strong><span id="air-arcade-overlay-copy">Sammle Sterne und pass auf deinen Schwanz auf.</span><button type="button" data-air-arcade-action="start">Spiel starten</button></div></div>
        <div class="air-arcade-controls"><span><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> oder WASD</span><div class="air-arcade-buttons"><button type="button" data-air-arcade-dir="up" aria-label="Nach oben">↑</button><div><button type="button" data-air-arcade-dir="left" aria-label="Nach links">←</button><button type="button" data-air-arcade-dir="down" aria-label="Nach unten">↓</button><button type="button" data-air-arcade-dir="right" aria-label="Nach rechts">→</button></div></div></div>
        <div class="air-arcade-foot"><span id="air-arcade-status">Mit den Pfeiltasten steuern.</span><button type="button" data-air-arcade-action="restart">Neu starten ↻</button></div>
      </div>`;
  }

  function spotifyBody() {
    return '<div class="air-spotify-app"><div class="air-spotify-logo">● <strong>Spotify</strong></div><h2>Deine Musik wartet.</h2><p>Melde dich mit deinem Spotify-Konto im offiziellen Web Player an. Die Anmeldung und Wiedergabe laufen direkt bei Spotify in deinem Standardbrowser.</p><button type="button" class="air-spotify-open" data-url="https://open.spotify.com/">Spotify Web Player öffnen <span>↗</span></button><div class="air-spotify-note">Air-OS speichert keine Spotify-Zugangsdaten. Premium-Funktionen und Wiedergabe hängen von deinem Spotify-Konto ab.</div></div>';
  }

  function calendarBody() {
    const today = new Date(); const date = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    return '<div class="air-calendar-app"><header><div><span>KALENDER</span><h2>Dein Kalender</h2><p>Termine werden lokal auf diesem Gerät gespeichert.</p></div><button type="button" class="air-photos-import" data-calendar-export>Exportieren (.ics)</button></header><form id="air-calendar-form"><label>Titel<input id="air-calendar-title" required maxlength="120" placeholder="z. B. Projektbesprechung"></label><label>Datum<input id="air-calendar-date" type="date" required value="'+date+'"></label><label>Uhrzeit<input id="air-calendar-time" type="time" value="09:00" required></label><label>Notiz<input id="air-calendar-note" maxlength="300" placeholder="Optional"></label><button class="air-photos-import" type="submit">＋ Termin hinzufügen</button></form><div class="air-calendar-list" id="air-calendar-list"></div><p class="air-calendar-foot">Ohne Cloud-Sync: Termine sind nur in diesem Air-OS-Profil verfügbar. Exportiere eine .ics-Datei für andere Kalender.</p></div>';
  }
  function mailBody() {
    return '<div class="air-mail-app"><div class="air-mail-mark">✉</div><h2>Mail verbinden</h2><p>Öffne deinen vorhandenen E-Mail-Dienst. Air-OS fragt keine Mail-Passwörter ab und zeigt keine erfundenen Nachrichten.</p><div class="air-mail-links"><button type="button" data-url="https://mail.google.com/">Gmail öffnen ↗</button><button type="button" data-url="https://outlook.live.com/mail/">Outlook öffnen ↗</button><button type="button" data-url="https://www.icloud.com/mail/">iCloud Mail öffnen ↗</button></div><p class="air-calendar-foot">Ein eingebauter Posteingang mit synchronisierten Nachrichten benötigt später eine sichere OAuth-Anbindung an deinen Anbieter.</p></div>';
  }
  const AIR_EVENTS_KEY='air-os-calendar-events-v1';
  function calendarRead() { try { const data=JSON.parse(localStorage.getItem(AIR_EVENTS_KEY)||'[]');return Array.isArray(data)?data:[] } catch { return [] } }
  function calendarWrite(events) { localStorage.setItem(AIR_EVENTS_KEY,JSON.stringify(events)); }
  function calendarRender(win) {
    const list=win.querySelector('#air-calendar-list');if(!list)return;
    const events=calendarRead().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));list.replaceChildren();
    if(!events.length){const empty=document.createElement('p');empty.className='air-calendar-empty';empty.textContent='Noch keine Termine. Füge oben deinen ersten Termin hinzu.';list.appendChild(empty);return}
    for(const event of events){const row=document.createElement('article');row.className='air-calendar-event';const date=document.createElement('time');date.textContent=new Date(event.date+'T'+(event.time||'00:00')).toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})+' · '+event.time;const body=document.createElement('div');const title=document.createElement('strong');title.textContent=event.title;body.append(title);if(event.note){const note=document.createElement('p');note.textContent=event.note;body.append(note)}const remove=document.createElement('button');remove.type='button';remove.textContent='Entfernen';remove.setAttribute('aria-label','Termin '+event.title+' entfernen');remove.addEventListener('click',()=>{calendarWrite(calendarRead().filter(item=>item.id!==event.id));calendarRender(win)});row.append(date,body,remove);list.appendChild(row)}
  }
  function calendarExport(win) {
    const events=calendarRead();if(!events.length){toast('Noch keine Termine zum Exportieren.');return}
    const stamp=value=>value.replace(/[-:]/g,'');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Air-OS//Calendar//DE'];
    for (const event of events) {
      const dt = stamp(event.date) + 'T' + stamp(event.time || '0900') + '00';
      const escapeIcs = value => String(value || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');
      const stampNow = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      ics.push('BEGIN:VEVENT', 'UID:' + event.id + '@air-os.local', 'DTSTAMP:' + stampNow, 'DTSTART:' + dt, 'SUMMARY:' + escapeIcs(event.title));
      if (event.note) ics.push('DESCRIPTION:' + escapeIcs(event.note));
      ics.push('END:VEVENT');
    }
    ics.push('END:VCALENDAR'); const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'air-os-kalender.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function photosBody() {
    return '<div class="air-photos-app"><header><div><span>PHOTOS</span><h2>Deine Bilder</h2><p>Öffne Bilder von deinem Computer – nichts wird automatisch hochgeladen.</p></div><label class="air-photos-import">Bilder hinzufügen<input type="file" id="air-photos-input" accept="image/*" multiple hidden></label></header><div class="air-photos-empty" id="air-photos-empty"><span>▧</span><strong>Noch keine Bilder geöffnet</strong><small>Wähle JPG, PNG, GIF oder WEBP von deinem Computer.</small></div><div class="air-photos-grid" id="air-photos-grid"></div><footer id="air-photos-status">Bilder bleiben lokal in dieser Sitzung.</footer></div>';
  }
  function downloadsBody() {
    return '<div class="air-downloads-app"><span class="air-downloads-icon">↓</span><h2>Downloads</h2><p>Öffne deinen echten Downloads-Ordner, um Dateien anzusehen. Air-OS erfindet keine Beispiel-Downloads.</p><button type="button" class="air-photos-import" data-air-open-downloads>Downloads-Ordner im Finder öffnen</button><small>Wähle im Finder deinen Downloads-Ordner aus, wenn er nicht automatisch geöffnet wird.</small></div>';
  }
  function musicBody() {
    if(window.airMusic)return window.airMusic.body();
    return '<div class="air-music-app"><div class="air-music-orb">♫</div><h2>Musik</h2><p>Spiele lokale Audiodateien auf diesem Computer ab.</p><label class="air-photos-import">Audiodatei auswählen<input id="air-music-file" type="file" accept="audio/*" hidden></label><audio id="air-music-audio" controls preload="metadata"></audio><div class="air-music-note">Die Wiedergabe erfolgt lokal im Air-OS-Fenster. Dateien werden nicht hochgeladen.</div></div>';
  }
  window.appBody = function (id) {
    if (id === 'finder') return filesBody();
    if (id === 'arcade') return arcadeBody();
    if (id === 'spotify') return spotifyBody();
    if (id === 'photos') return photosBody();
    if (id === 'downloads') return downloadsBody();
    if (id === 'music') return musicBody();
    if (id === 'calendar') return calendarBody();
    if (id === 'mail') return mailBody();
    return baseAppBody(id);
  };

  document.addEventListener('submit', event => {
    if(event.target && event.target.id==='air-calendar-form'){
      event.preventDefault();const win=event.target.closest('.app-window');const title=win.querySelector('#air-calendar-title').value.trim();const date=win.querySelector('#air-calendar-date').value;const time=win.querySelector('#air-calendar-time').value;const note=win.querySelector('#air-calendar-note').value.trim();
      if(!title||!date||!time)return;
      const events=calendarRead();events.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),title,date,time,note});
      try{calendarWrite(events);event.target.reset();win.querySelector('#air-calendar-date').value=date;win.querySelector('#air-calendar-time').value='09:00';calendarRender(win)}catch{toast('Termin konnte nicht lokal gespeichert werden.')}
    }
  });
  document.addEventListener('click',event=>{
    const exportButton=event.target.closest('[data-calendar-export]');if(exportButton){calendarExport(exportButton.closest('.app-window'));return}
  });

  document.addEventListener('change', event => {
    const input = event.target;
    if (input && input.id === 'air-photos-input') {
      const win = input.closest('.app-window');
      const grid = win && win.querySelector('#air-photos-grid');
      const empty = win && win.querySelector('#air-photos-empty');
      const status = win && win.querySelector('#air-photos-status');
      if (!grid) return;
      const files = Array.from(input.files || []).filter(file => file.type.startsWith('image/')).slice(0, 80);
      grid.replaceChildren();
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const card = document.createElement('button'); card.type='button'; card.className='air-photo-card'; card.title=file.name;
        const img=document.createElement('img'); img.src=url; img.alt=file.name; img.loading='lazy';
        const label=document.createElement('span'); label.textContent=file.name;
        card.append(img,label);
        card.addEventListener('click',()=>{const overlay=document.createElement('div');overlay.className='air-photo-lightbox';overlay.innerHTML='<button type="button" aria-label="Schließen">×</button><img alt="">';overlay.querySelector('img').src=url;overlay.querySelector('img').alt=file.name;overlay.querySelector('button').addEventListener('click',()=>overlay.remove());overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});win.appendChild(overlay)});
        grid.appendChild(card);
      }
      if(empty)empty.hidden=files.length>0;
      if(status)status.textContent=files.length+' Bild(er) geladen · lokal auf diesem Gerät';
    }
    if (input && input.id === 'air-music-file' && !input.closest('.airmusic')) {
      const win=input.closest('.app-window'), audio=win&&win.querySelector('#air-music-audio'), file=input.files&&input.files[0];
      if(audio&&file){if(audio.dataset.objectUrl)URL.revokeObjectURL(audio.dataset.objectUrl);const url=URL.createObjectURL(file);audio.dataset.objectUrl=url;audio.src=url;audio.load();audio.play().catch(()=>{});}
    }
  });
  document.addEventListener('click', event => {
    const openDownloads=event.target.closest('[data-air-open-downloads]');
    if(openDownloads){const win=openDownloads.closest('.app-window');const finder=document.querySelector('.dock-app[data-app="finder"]');if(finder)finder.click();const choose=win&&win.querySelector('[data-air-action="choose-folder"]');if(choose)setTimeout(()=>choose.click(),0);}
  });

  document.addEventListener('click',event=>{const cal=event.target.closest('.app-window');if(cal&&cal.querySelector('#air-calendar-list')&&!cal.dataset.calendarReady){cal.dataset.calendarReady='1';calendarRender(cal)}});

  function setFileStatus(win, message) {
    const label = win.querySelector('#air-files-status-text');
    if (label) label.textContent = message;
  }
  function setEditorStatus(win, message) {
    const label = win.querySelector('#air-files-editor-status');
    if (label) label.textContent = message;
  }
  function setWorkspaceUI(win, ready) {
    const empty = win.querySelector('#air-files-empty');
    const list = win.querySelector('#air-files-list');
    const search = win.querySelector('#air-files-search');
    const chooseButtons = win.querySelectorAll('[data-air-action="choose-folder"]');
    if (empty) empty.hidden = ready;
    if (list) list.hidden = !ready;
    if (search) search.disabled = !ready;
    win.querySelectorAll('[data-air-action="up"], [data-air-action="refresh"], [data-air-action="new-file"]').forEach(button => button.disabled = !ready);
    chooseButtons.forEach(button => button.classList.toggle('active', !ready));
  }
  async function loadDirectory(win, relativePath) {
    const state = fileStates.get(win);
    if (!state) return;
    try {
      const result = await window.airOS.files.listDirectory(relativePath || '');
      state.currentPath = result.path || '';
      state.parentPath = result.parentPath || '';
      state.rootName = result.rootName || 'Ordner';
      state.items = result.items || [];
      const location = win.querySelector('#air-files-location');
      if (location) location.textContent = [state.rootName, state.currentPath].filter(Boolean).join(' › ');
      const up = win.querySelector('[data-air-action="up"]');
      if (up) up.disabled = !state.currentPath;
      setWorkspaceUI(win, true);
      renderFileEntries(win);
      const editor = win.querySelector('#air-files-editor');
      if (editor && !editor.hidden && state.editorPath) {
        const stillExists = state.items.some(item => item.path === state.editorPath);
        if (!stillExists) closeFileEditor(win);
      }
      setFileStatus(win, state.items.length + (state.items.length === 1 ? ' Objekt' : ' Objekte'));
    } catch (error) {
      setWorkspaceUI(win, false);
      setFileStatus(win, error && error.message ? error.message : 'Der Ordner konnte nicht geöffnet werden.');
    }
  }
  function renderFileEntries(win) {
    const state = fileStates.get(win);
    const container = win.querySelector('#air-files-entries');
    const noResults = win.querySelector('#air-files-no-results');
    if (!state || !container) return;
    const query = (win.querySelector('#air-files-search')?.value || '').trim().toLocaleLowerCase('de-DE');
    const items = state.items.filter(item => !query || item.name.toLocaleLowerCase('de-DE').includes(query));
    container.innerHTML = items.map(item => `
      <button type="button" class="air-file-entry" data-air-action="open-item" data-path="${escapeHTML(item.path)}" data-kind="${item.kind}">
        <span class="air-file-name"><span class="air-file-icon">${fileIcon(item)}</span><span class="air-file-name-copy"><strong>${escapeHTML(item.name)}</strong><small>${item.kind === 'folder' ? 'Ordner' : escapeHTML(item.extension ? item.extension.slice(1).toUpperCase() + '-Datei' : 'Datei')}</small></span></span>
        <span class="air-file-type">${item.kind === 'folder' ? 'Ordner' : escapeHTML(item.extension ? item.extension.slice(1).toUpperCase() : 'Datei')}</span>
        <span class="air-file-size">${item.kind === 'folder' ? '—' : formatBytes(item.size)}</span>
        <span class="air-file-date">${formatDate(item.modifiedAt)}</span>
      </button>`).join('');
    if (noResults) noResults.hidden = items.length > 0;
    container.hidden = false;
  }
  function closeFileEditor(win) {
    const state = fileStates.get(win);
    if (state) state.editorPath = '';
    const editor = win.querySelector('#air-files-editor');
    if (editor) editor.hidden = true;
    const list = win.querySelector('#air-files-list');
    if (list) list.hidden = false;
  }
  function openTextEditor(win, result) {
    const state = fileStates.get(win);
    if (!state) return;
    state.editorPath = result.path;
    const list = win.querySelector('#air-files-list');
    const editor = win.querySelector('#air-files-editor');
    const title = win.querySelector('#air-files-editor-title');
    const pathLabel = win.querySelector('#air-files-editor-path');
    const text = win.querySelector('#air-files-editor-text');
    if (list) list.hidden = true;
    if (editor) editor.hidden = false;
    if (title) title.textContent = result.path.split('/').pop();
    if (pathLabel) pathLabel.textContent = result.path;
    if (text) text.value = result.content;
    setEditorStatus(win, 'Datei geöffnet · Änderungen werden erst beim Speichern übernommen.');
    text?.focus();
  }
  async function openFileEntry(win, button) {
    const path = button.dataset.path;
    if (!path) return;
    if (button.dataset.kind === 'folder') {
      const search = win.querySelector('#air-files-search');
      if (search) search.value = '';
      await loadDirectory(win, path);
      return;
    }
    const extension = path.includes('.') ? '.' + path.split('.').pop().toLowerCase() : '';
    if (textExtensions.has(extension)) {
      try {
        const result = await window.airOS.files.readTextFile(path);
        openTextEditor(win, result);
      } catch (error) {
        setFileStatus(win, error && error.message ? error.message : 'Datei konnte nicht gelesen werden.');
      }
      return;
    }
    try {
      const result = await window.airOS.files.openNative(path);
      if (!result || !result.ok) setFileStatus(win, result && result.error || 'Die Datei konnte nicht mit der Computer-App geöffnet werden.');
      else setFileStatus(win, 'Datei an die zugehörige Computer-App übergeben.');
    } catch (error) {
      setFileStatus(win, error && error.message ? error.message : 'Datei konnte nicht geöffnet werden.');
    }
  }
  async function createTextFile(win) {
    const state = fileStates.get(win);
    if (!state || state.rootName == null) return;
    let name = window.prompt('Name der neuen Textdatei:', 'Neue Notiz.txt');
    if (name == null) return;
    name = name.trim();
    if (!name || name === '.' || name === '..' || /[\\/]/.test(name) || name.length > 120) {
      setFileStatus(win, 'Bitte gib einen gültigen Dateinamen ohne Pfad ein.');
      return;
    }
    if (!/\.[A-Za-z0-9]{1,8}$/.test(name)) name += '.txt';
    const extension = '.' + name.split('.').pop().toLowerCase();
    if (!textExtensions.has(extension)) {
      setFileStatus(win, 'Bitte verwende eine unterstützte Text-Endung, zum Beispiel .txt oder .md.');
      return;
    }
    const relativePath = [state.currentPath, name].filter(Boolean).join('/');
    if (state.items.some(item => item.name.toLocaleLowerCase('de-DE') === name.toLocaleLowerCase('de-DE'))) {
      const overwrite = window.confirm('Diese Datei existiert bereits. Soll ihr Inhalt geleert werden?');
      if (!overwrite) return;
    }
    try {
      await window.airOS.files.writeTextFile(relativePath, '');
      await loadDirectory(win, state.currentPath);
      openTextEditor(win, { path: relativePath, content: '' });
      setEditorStatus(win, 'Neue Datei · noch nicht mit Inhalt gespeichert.');
    } catch (error) {
      setFileStatus(win, error && error.message ? error.message : 'Datei konnte nicht erstellt werden.');
    }
  }
  async function saveTextFile(win) {
    const state = fileStates.get(win);
    const text = win.querySelector('#air-files-editor-text');
    if (!state || !state.editorPath || !text) return;
    const saveButton = win.querySelector('[data-air-action="save-file"]');
    if (saveButton) saveButton.disabled = true;
    try {
      await window.airOS.files.writeTextFile(state.editorPath, text.value);
      setEditorStatus(win, 'Gespeichert · ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
      await loadDirectory(win, state.currentPath);
    } catch (error) {
      setEditorStatus(win, error && error.message ? error.message : 'Speichern fehlgeschlagen.');
    } finally {
      if (saveButton) saveButton.disabled = false;
    }
  }
  async function mountFiles(win) {
    if (fileStates.has(win)) return;
    fileStates.set(win, { currentPath: '', parentPath: '', rootName: null, items: [], editorPath: '' });
    win.addEventListener('click', async event => {
      const control = event.target.closest('[data-air-action]');
      if (!control) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const state = fileStates.get(win);
      const action = control.dataset.airAction;
      try {
        if (action === 'choose-folder') {
          const selected = await window.airOS.files.selectFolder();
          if (!selected) return;
          state.currentPath = '';
          state.rootName = selected.name;
          const search = win.querySelector('#air-files-search');
          if (search) search.value = '';
          await loadDirectory(win, '');
        } else if (action === 'refresh') {
          await loadDirectory(win, state.currentPath);
        } else if (action === 'up') {
          await loadDirectory(win, state.parentPath);
          const search = win.querySelector('#air-files-search');
          if (search) search.value = '';
        } else if (action === 'open-item') {
          await openFileEntry(win, control);
        } else if (action === 'new-file') {
          await createTextFile(win);
        } else if (action === 'save-file') {
          await saveTextFile(win);
        } else if (action === 'close-editor') {
          closeFileEditor(win);
        }
      } catch (error) {
        setFileStatus(win, error && error.message ? error.message : 'Aktion fehlgeschlagen.');
      }
    }, true);
    win.querySelector('#air-files-search')?.addEventListener('input', () => renderFileEntries(win));
    win.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && !win.querySelector('#air-files-editor')?.hidden) {
        event.preventDefault();
        event.stopPropagation();
        saveTextFile(win);
      }
    }, true);
    try {
      const current = await window.airOS.files.currentFolder();
      if (current) {
        const state = fileStates.get(win);
        state.rootName = current.name;
        await loadDirectory(win, '');
      }
    } catch {}
  }

  function drawSnake(win) {
    const state = arcadeStates.get(win);
    const canvas = win.querySelector('#air-arcade-canvas');
    if (!state || !canvas) return;
    const ctx = canvas.getContext('2d');
    const cell = 20, cols = Math.floor(canvas.width / cell), rows = Math.floor(canvas.height / cell);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#eefcff');
    gradient.addColorStop(1, '#d7e9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(76, 132, 178, 0.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x * cell + .5, 0); ctx.lineTo(x * cell + .5, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell + .5); ctx.lineTo(canvas.width, y * cell + .5); ctx.stroke(); }
    if (state.food) {
      const [fx, fy] = state.food;
      ctx.save();
      ctx.shadowColor = 'rgba(233, 74, 111, .36)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#f05b77';
      ctx.beginPath();
      ctx.arc(fx * cell + cell / 2, fy * cell + cell / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(fx * cell + cell / 2 - 2, fy * cell + cell / 2 - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    state.snake.forEach((segment, index) => {
      const [x, y] = segment;
      const inset = index === 0 ? 2 : 3;
      ctx.fillStyle = index === 0 ? '#1d87c7' : '#37b4a5';
      ctx.beginPath();
      ctx.roundRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2, 5);
      ctx.fill();
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        const eyes = state.direction.x !== 0
          ? [[state.direction.x > 0 ? 13 : 7, 6], [state.direction.x > 0 ? 13 : 7, 13]]
          : [[6, state.direction.y > 0 ? 13 : 7], [13, state.direction.y > 0 ? 13 : 7]];
        eyes.forEach(([ex, ey]) => { ctx.beginPath(); ctx.arc(x * cell + ex, y * cell + ey, 2, 0, Math.PI * 2); ctx.fill(); });
      }
    });
  }
  function spawnFood(state) {
    const cols = 28, rows = 18;
    for (let attempts = 0; attempts < 200; attempts++) {
      const food = [Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)];
      if (!state.snake.some(segment => segment[0] === food[0] && segment[1] === food[1])) {
        state.food = food;
        return;
      }
    }
    state.food = null;
  }
  function updateArcadeUI(win) {
    const state = arcadeStates.get(win);
    if (!state) return;
    const score = win.querySelector('#air-arcade-score');
    const best = win.querySelector('#air-arcade-best');
    const overlay = win.querySelector('#air-arcade-overlay');
    const title = win.querySelector('#air-arcade-overlay-title');
    const copy = win.querySelector('#air-arcade-overlay-copy');
    if (score) score.textContent = String(state.score);
    if (best) best.textContent = String(state.best);
    if (overlay) overlay.hidden = state.running;
    if (title) title.textContent = state.gameOver ? 'Game Over' : (state.paused ? 'Pause' : 'Bereit?');
    if (copy) copy.textContent = state.gameOver ? 'Punkte: ' + state.score + ' · Bereit für eine neue Runde?' : (state.paused ? 'Drücke Fortsetzen, wenn du weiterspielen möchtest.' : 'Sammle Sterne und pass auf deinen Schwanz auf.');
    const start = win.querySelector('[data-air-arcade-action="start"]');
    if (start) start.textContent = state.gameOver ? 'Nochmal spielen' : (state.paused ? 'Fortsetzen' : 'Spiel starten');
    const status = win.querySelector('#air-arcade-status');
    if (status) status.textContent = state.running ? 'Läuft · viel Glück!' : (state.gameOver ? 'Runde beendet.' : 'Mit den Pfeiltasten steuern.');
  }
  function stopArcade(win) {
    const state = arcadeStates.get(win);
    if (state && state.timer) clearInterval(state.timer);
    if (state) { state.timer = null; state.running = false; }
  }
  function resetSnake(win) {
    const state = arcadeStates.get(win);
    if (!state) return;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    state.snake = [[8, 9], [7, 9], [6, 9]];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.score = 0;
    state.gameOver = false;
    state.paused = false;
    state.running = false;
    spawnFood(state);
    drawSnake(win);
    updateArcadeUI(win);
  }
  function tickSnake(win) {
    const state = arcadeStates.get(win);
    if (!state || !state.running) return;
    if (!win.isConnected || win.style.display === 'none') { stopArcade(win); return; }
    state.direction = state.nextDirection;
    const head = state.snake[0];
    const next = [head[0] + state.direction.x, head[1] + state.direction.y];
    const hitsWall = next[0] < 0 || next[0] >= 28 || next[1] < 0 || next[1] >= 18;
    const eating = state.food && next[0] === state.food[0] && next[1] === state.food[1];
    const collisionBody = eating ? state.snake : state.snake.slice(0, -1);
    const hitsSelf = collisionBody.some(segment => segment[0] === next[0] && segment[1] === next[1]);
    if (hitsWall || hitsSelf) {
      state.gameOver = true;
      stopArcade(win);
      updateArcadeUI(win);
      return;
    }
    state.snake.unshift(next);
    if (eating) {
      state.score += 10;
      state.best = Math.max(state.best, state.score);
      try { localStorage.setItem('air-os-arcade-best', String(state.best)); } catch {}
      spawnFood(state);
    } else {
      state.snake.pop();
    }
    drawSnake(win);
    updateArcadeUI(win);
  }
  function changeSnakeDirection(win, direction) {
    const state = arcadeStates.get(win);
    if (!state) return;
    const directions = {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
    };
    const next = directions[direction];
    if (!next || (next.x === -state.direction.x && next.y === -state.direction.y)) return;
    state.nextDirection = next;
    if (!state.running && !state.gameOver && !state.paused) startArcade(win);
  }
  function startArcade(win) {
    const state = arcadeStates.get(win);
    if (!state) return;
    if (state.gameOver) resetSnake(win);
    if (state.timer) clearInterval(state.timer);
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.timer = setInterval(() => tickSnake(win), 125);
    updateArcadeUI(win);
    win.querySelector('#air-arcade-canvas')?.focus();
  }
  function mountArcade(win) {
    if (arcadeStates.has(win)) return;
    let best = 0;
    try { best = Number(localStorage.getItem('air-os-arcade-best') || 0) || 0; } catch {}
    arcadeStates.set(win, {
      snake: [[8, 9], [7, 9], [6, 9]],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: null, score: 0, best, running: false, paused: false,
      gameOver: false, timer: null
    });
    spawnFood(arcadeStates.get(win));
    drawSnake(win);
    updateArcadeUI(win);
    win.addEventListener('click', event => {
      const control = event.target.closest('[data-air-arcade-action], [data-air-arcade-dir]');
      if (!control) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (control.dataset.airArcadeDir) {
        changeSnakeDirection(win, control.dataset.airArcadeDir);
        return;
      }
      const action = control.dataset.airArcadeAction;
      const state = arcadeStates.get(win);
      if (action === 'start') startArcade(win);
      else if (action === 'restart') resetSnake(win);
      else if (action === 'pause' && state && state.running) {
        stopArcade(win); state.paused = true; updateArcadeUI(win);
      }
    }, true);
    win.addEventListener('keydown', event => {
      const keyMap = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };
      if (keyMap[event.key]) {
        event.preventDefault();
        event.stopPropagation();
        changeSnakeDirection(win, keyMap[event.key]);
      } else if (event.key === ' ' && arcadeStates.get(win)?.running) {
        event.preventDefault();
        const state = arcadeStates.get(win);
        stopArcade(win); state.paused = true; updateArcadeUI(win);
      }
    }, true);
  }

  function initializeWindow(win) {
    if (!(win instanceof HTMLElement)) return;
    if (win.querySelector('.airmusic')) window.airMusic?.mount(win);
    if (win.querySelector('.air-files-app')) mountFiles(win);
    if (win.querySelector('.arcade-library')) window.airArcadeGames?.mount(win);
    else if (win.querySelector('.air-arcade-app')) mountArcade(win);
  }
  function patchDockIcon() {
    document.querySelectorAll('.arcade-icon').forEach(icon => {
      icon.innerHTML = vectorIcon.arcade;
      icon.setAttribute('aria-hidden', 'true');
    });
  }
  function enhanceExistingFinder() {
    const finder = document.querySelector('.app-window .window-content .finder-app')?.closest('.app-window');
    if (!finder) return;
    const slot = finder.querySelector('.window-content');
    if (slot) slot.innerHTML = filesBody();
    const title = finder.querySelector('.window-title');
    if (title) title.textContent = 'Finder';
    initializeWindow(finder);
  }
  patchDockIcon();
  enhanceExistingFinder();
  document.querySelectorAll('.app-window').forEach(initializeWindow);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.classList.contains('app-window')) initializeWindow(node);
          node.querySelectorAll?.('.app-window').forEach(initializeWindow);
        }
      }
      for (const node of record.removedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const gameWindows = [];
        if (node.classList.contains('app-window')) gameWindows.push(node);
        node.querySelectorAll?.('.app-window').forEach(win => gameWindows.push(win));
        gameWindows.forEach(win => { if (arcadeStates.has(win)) stopArcade(win); });
      }
    }
    patchDockIcon();
  });
  const windowHost = document.querySelector('#windows');
  if (windowHost) observer.observe(windowHost, { childList: true, subtree: true });
})();