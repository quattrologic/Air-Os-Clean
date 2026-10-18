(() => {
  "use strict";

  const body = () => `<div class="aircard-app">
    <header class="aircard-header">
      <div><div class="aircard-eyebrow">AIR-OS · PRIVAT & LOKAL</div><h2>AirCard Lite</h2><p>Artwork für deine Wallet-Karten vorbereiten und lokal ansehen.</p></div>
      <div id="aircard-status" class="aircard-status" role="status">Bereit</div>
    </header>
    <div id="aircard-platform-notice" class="aircard-platform-notice" hidden></div>
    <div class="aircard-setup-grid">
      <section class="aircard-panel">
        <div class="aircard-section-heading"><span>01</span><div><h3>iPhone verbinden</h3><p>Über das vorhandene lokale AirCard-Backend</p></div></div>
        <label class="aircard-field-label" for="aircard-device">Gerät</label>
        <select id="aircard-device" class="aircard-select"><option value="">Noch nicht gesucht</option></select>
        <button id="aircard-refresh" class="aircard-secondary-button" type="button">⌕　Geräte suchen</button>
      </section>
      <section class="aircard-panel">
        <div class="aircard-section-heading"><span>02</span><div><h3>Wallet-Karte wählen</h3><p>Die Kartenliste kommt vom iPhone-Scan</p></div></div>
        <label class="aircard-field-label" for="aircard-card">Karte</label>
        <select id="aircard-card" class="aircard-select" disabled><option value="">Erst Wallet scannen</option></select>
        <button id="aircard-scan" class="aircard-secondary-button" type="button" disabled>↻　Wallet scannen</button>
      </section>
    </div>
    <div class="aircard-editor-grid">
      <section class="aircard-panel aircard-drop-panel" id="aircard-drop" tabindex="0" role="button" aria-label="Artwork hier ablegen oder Datei auswählen">
        <div class="aircard-drop-art"><span>＋</span></div><h3>Artwork hinzufügen</h3><p>PNG, JPEG, HEIC oder TIFF hier ablegen.</p>
        <span class="aircard-drop-hint">Die Bilddatei bleibt lokal auf diesem Gerät.</span>
        <input id="aircard-file" type="file" accept=".png,.jpg,.jpeg,.heic,.tif,.tiff,image/png,image/jpeg,image/heic,image/tiff" hidden>
      </section>
      <section class="aircard-preview-panel">
        <div class="aircard-preview-heading"><div><span class="aircard-eyebrow">VORSCHAU</span><h3 id="aircard-preview-name">Deine Wallet-Karte</h3></div><span class="aircard-preview-badge">AirCard</span></div>
        <div id="aircard-card-preview" class="aircard-card-preview">
          <img id="aircard-preview-artwork" class="aircard-preview-artwork" alt="Ausgewähltes Karten-Artwork" hidden>
          <div class="aircard-preview-shade"></div><div class="aircard-preview-top"><span class="aircard-mini-mark">A</span><span>AIR CARD</span><span class="aircard-chip">▦</span></div>
          <div class="aircard-preview-bottom"><strong id="aircard-preview-card-label">Wallet-Karte</strong><span>Designvorschau · keine echte Zahlungskarte</span></div>
        </div>
        <div class="aircard-action-row"><button id="aircard-select-artwork" class="aircard-secondary-button" type="button">Artwork auswählen…</button><button id="aircard-apply" class="aircard-primary-button" type="button" disabled>Skin anwenden</button></div>
        <div id="aircard-artwork-label" class="aircard-artwork-label">Kein Artwork ausgewählt</div>
      </section>
    </div>
    <div id="aircard-message" class="aircard-message" role="status" aria-live="polite">Wähle ein Gerät und scanne die Wallet, um verfügbare Karten zu laden.</div>
    <div class="aircard-footnote">Kein Cloud-Katalog und keine Telemetrie. Scan und Anwenden benötigen macOS sowie das vorhandene AirCardBackendCLI.</div>
  </div>`;

  function message(win, text, error = false) {
    const el = win.querySelector("#aircard-message");
    if (el) { el.textContent = text; el.classList.toggle("is-error", error); }
  }
  function status(win, text) {
    const el = win.querySelector("#aircard-status");
    if (el) el.textContent = text;
  }
  function isMac() { return window.airOS?.platform === "darwin"; }
  function syncActions(win) {
    const mac = isMac(), device = win.querySelector("#aircard-device")?.value;
    const card = win.querySelector("#aircard-card")?.value;
    const apply = win.querySelector("#aircard-apply");
    if (apply) apply.disabled = !mac || !device || !card || !win._airCardCurrentArtwork;
    const choose = win.querySelector("#aircard-select-artwork"); if (choose) choose.disabled = !mac || !card;
    const file = win.querySelector("#aircard-file"); if (file) file.disabled = !mac;
    const scan = win.querySelector("#aircard-scan");
    if (scan) scan.disabled = !mac || !device;
    const refresh = win.querySelector("#aircard-refresh");
    if (refresh) refresh.disabled = !mac;
  }
  function setPreview(win, dataUrl, fileName, cardName) {
    const img = win.querySelector("#aircard-preview-artwork");
    const preview = win.querySelector("#aircard-card-preview");
    const label = win.querySelector("#aircard-artwork-label");
    const name = win.querySelector("#aircard-preview-name");
    const cardLabel = win.querySelector("#aircard-preview-card-label");
    if (name) name.textContent = cardName || "Deine Wallet-Karte";
    if (cardLabel) cardLabel.textContent = cardName || "Wallet-Karte";
    if (img) {
      if (dataUrl) { img.src = dataUrl; img.hidden = false; img.style.display = "block"; }
      else { img.removeAttribute("src"); img.hidden = true; img.style.display = "none"; }
    }
    if (label) label.textContent = fileName || "Kein Artwork ausgewählt";
    win._airCardCurrentArtwork = !!dataUrl;
    if (preview) preview.classList.toggle("has-artwork", !!dataUrl);
    syncActions(win);
  }
  async function loadArtwork(win, cardID, cardName) {
    setPreview(win, null, "Kein Artwork ausgewählt", cardName);
    if (!cardID || !window.airOS?.airCardLite?.getArtwork) return;
    try {
      const result = await window.airOS.airCardLite.getArtwork(cardID);
      if (result?.dataUrl) setPreview(win, result.dataUrl, result.fileName, cardName);
    } catch (err) { message(win, err.message || "Lokales Artwork konnte nicht geladen werden.", true); }
  }
  async function refreshDevices(win) {
    if (!isMac()) { message(win, "Geräte- und Wallet-Funktionen sind nur unter macOS verfügbar."); return; }
    status(win, "Suche …"); message(win, "Das lokale AirCard-Backend wird aufgerufen.");
    const select = win.querySelector("#aircard-device");
    try {
      const devices = await window.airOS.airCardLite.listDevices();
      select.replaceChildren(new Option(devices.length ? "Gerät auswählen" : "Kein iPhone gefunden", ""));
      devices.forEach(device => select.add(new Option([device.name, device.product].filter(Boolean).join(" · "), device.id)));
      select.disabled = !devices.length; win._airCardDevices = devices;
      const remembered = localStorage.getItem("aircard-lite-device");
      if (remembered && devices.some(item => item.id === remembered)) select.value = remembered;
      status(win, devices.length ? devices.length + " Gerät(e) gefunden" : "Kein Gerät");
      message(win, devices.length ? "iPhone gefunden. Du kannst jetzt die Wallet scannen." : "Kein iPhone gefunden. Prüfe Verbindung und AirCard-Backend.");
    } catch (err) {
      select.replaceChildren(new Option("Backend nicht verfügbar", "")); select.disabled = true;
      status(win, "Backend fehlt"); message(win, err.message || "AirCardBackendCLI ist nicht verfügbar.", true);
    }
    syncActions(win);
  }
  async function scanCards(win) {
    const deviceID = win.querySelector("#aircard-device")?.value;
    if (!isMac()) { message(win, "Wallet-Scan ist nur unter macOS verfügbar."); return; }
    if (!deviceID) { message(win, "Bitte zuerst ein iPhone auswählen.", true); return; }
    status(win, "Wallet wird gescannt …"); message(win, "Karten werden vom vorhandenen lokalen Backend gelesen.");
    try {
      const cards = await window.airOS.airCardLite.scanCards(deviceID);
      const select = win.querySelector("#aircard-card");
      select.replaceChildren(new Option(cards.length ? "Karte auswählen" : "Keine Karte gefunden", ""));
      cards.forEach(card => select.add(new Option(card.name, card.id)));
      select.disabled = !cards.length; win._airCardCards = cards;
      const previous = localStorage.getItem("aircard-lite-card");
      if (previous && cards.some(item => item.id === previous)) select.value = previous;
      if (!select.value && cards.length) select.value = cards[0].id;
      const active = cards.find(item => item.id === select.value);
      status(win, cards.length ? cards.length + " Karte(n) gefunden" : "Keine Karten");
      message(win, cards.length ? "Karte ausgewählt. Lade Artwork oder nutze ein bereits gespeichertes Design." : "Das Backend hat keine Karten zurückgegeben.");
      await loadArtwork(win, active?.id, active?.name);
    } catch (err) { status(win, "Scan fehlgeschlagen"); message(win, err.message || "Die Wallet konnte nicht gescannt werden.", true); }
    syncActions(win);
  }
  async function importFile(win, file) {
    if (!isMac()) { message(win, "AirCard Lite ist unter Windows nur als App sichtbar. Artwork-Import und Wallet-Funktionen sind macOS-only."); return; }
    const cardID = win.querySelector("#aircard-card")?.value;
    if (!cardID) { message(win, "Bitte zuerst eine Wallet-Karte scannen und auswählen.", true); return; }
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) { message(win, "Die Datei ist zu groß. Maximal 12 MB.", true); return; }
    const reader = new FileReader();
    reader.onerror = () => message(win, "Die Artwork-Datei konnte nicht gelesen werden.", true);
    reader.onload = async () => {
      try {
        const result = await window.airOS.airCardLite.saveArtwork(cardID, file.name, String(reader.result || ""));
        const card = (win._airCardCards || []).find(item => item.id === cardID);
        setPreview(win, String(reader.result || ""), result.fileName || file.name, card?.name);
        status(win, "Artwork lokal gespeichert");
        message(win, "Artwork wurde nur auf diesem Gerät für die ausgewählte Karte gespeichert.");
      } catch (err) { message(win, err.message || "Artwork konnte nicht gespeichert werden.", true); status(win, "Import fehlgeschlagen"); }
    };
    reader.readAsDataURL(file);
  }
  function init(win) {
    const mac = isMac();
    const notice = win.querySelector("#aircard-platform-notice");
    if (notice && !mac) {
      notice.hidden = false;
      notice.textContent = "Windows-Modus: AirCard Lite ist hier als Air-OS-App sichtbar, die Bedienfunktionen sind aber deaktiviert. Artwork-Import, iPhone-Erkennung, Wallet-Scan und Skin anwenden benötigen macOS.";
    }
    const device = win.querySelector("#aircard-device"), card = win.querySelector("#aircard-card");
    const refresh = win.querySelector("#aircard-refresh"), scan = win.querySelector("#aircard-scan");
    const file = win.querySelector("#aircard-file"), choose = win.querySelector("#aircard-select-artwork");
    const apply = win.querySelector("#aircard-apply"), drop = win.querySelector("#aircard-drop");
    refresh?.addEventListener("click", () => refreshDevices(win));
    scan?.addEventListener("click", () => scanCards(win));
    device?.addEventListener("change", () => { localStorage.setItem("aircard-lite-device", device.value); syncActions(win); });
    card?.addEventListener("change", async () => {
      localStorage.setItem("aircard-lite-card", card.value);
      const selected = (win._airCardCards || []).find(item => item.id === card.value);
      await loadArtwork(win, card.value, selected?.name); syncActions(win);
    });
    choose?.addEventListener("click", () => { if (!card?.value) { message(win, "Bitte zuerst eine Wallet-Karte auswählen.", true); return; } file?.click(); });
    file?.addEventListener("change", () => { const picked = file.files?.[0]; if (picked) importFile(win, picked); file.value = ""; });
    const handleDrop = event => { event.preventDefault(); drop?.classList.remove("is-dragging"); const picked = event.dataTransfer?.files?.[0]; if (picked) importFile(win, picked); };
    drop?.addEventListener("click", () => { if (!card?.value) { message(win, "Bitte zuerst eine Wallet-Karte auswählen.", true); return; } file?.click(); });
    drop?.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (card?.value) file?.click(); else message(win, "Bitte zuerst eine Wallet-Karte auswählen.", true); } });
    drop?.addEventListener("dragover", event => { event.preventDefault(); drop.classList.add("is-dragging"); });
    drop?.addEventListener("dragleave", () => drop?.classList.remove("is-dragging"));
    drop?.addEventListener("drop", handleDrop);
    apply?.addEventListener("click", async () => {
      if (!isMac()) { message(win, "Skin anwenden ist nur unter macOS verfügbar."); return; }
      const deviceID = device?.value, cardID = card?.value;
      if (!deviceID || !cardID || !win._airCardCurrentArtwork) { message(win, "Bitte iPhone, Karte und Artwork auswählen.", true); return; }
      apply.disabled = true; status(win, "Wende Skin an …"); message(win, "Das vorhandene AirCard-Backend wird ausgeführt.");
      try { await window.airOS.airCardLite.applySkin(deviceID, cardID); status(win, "Skin angewendet"); message(win, "Das Backend hat den Auftrag erfolgreich abgeschlossen."); }
      catch (err) { status(win, "Anwenden fehlgeschlagen"); message(win, err.message || "Der Skin konnte nicht angewendet werden.", true); }
      syncActions(win);
    });
    if (drop) { drop.setAttribute("aria-disabled", String(!mac)); drop.classList.toggle("is-locked", !mac); }
    status(win, mac ? "Bereit" : "Windows · nur Anzeige"); syncActions(win);
  }
  window.airCardLiteApp = Object.freeze({ body, init });
})();
