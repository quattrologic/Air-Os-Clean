# F2.1 – Windows-Prüfanleitung für Glass-Design, M1 und M2

24. Oktober 2026 · Produktbasis: **`bc5b8dae196aabc62df5ffc3d1710da02289aed2`**, Branch `fix/air-window-interruptible-m2-20261024`. Diese Anleitung liegt auf dem eigenen Dokumentationsbranch `docs/air-windows-f21-m2-guide-20261024`; dessen Produktcode ist identisch mit M2.

**Stand:** Anleitung vorbereitet, native Windows-Abnahme **OFFEN**. Der Benutzer berichtet einen erfolgreichen Windows-Start. Windows-Version, verwendeter Commit und weitere Ergebnisse dieses Starts sind noch nicht belegt. Codex hat hier ausschließlich Debian13/Linux und kein Windows-/Remote-Desktop-Werkzeug; eigene native Prüfung **BLOCKIERT**. Es wurden in dieser Einheit keine Windows-Screenshots oder Windows-Messwerte erzeugt. Die folgenden Erwartungen sind Prüfkriterien, keine bestandenen Tests.

## 1. Richtigen Stand und Testumgebung festhalten

Bestehende Air-OS-Installation und Daten erhalten. Ausschließlich zwei neue Air-OS-Testprofile, z.B. „F21 Alice“ und „F21 Bob“, sowie synthetische Notizen verwenden; keine privaten Notizen für Screenshots öffnen. Ein separates Windows-Testkonto kann zusätzlich vom Alltag trennen. Keine Profilordner löschen, keine Sicherheits-/Sandboxoptionen abschalten.

Bei bereits gestarteter EXE: Herkunft/Dateiname/Version und zugehörigen Build-Commit festhalten. Ist der Commit unbekannt oder älter als M2, ist der Lauf ein **Start-/Altbuild-Test**, keine M1/M2-Abnahme. Diese Dokumentation baut keinen neuen Installer.

Falls Git und Node/npm auf Windows vorhanden sind, kann stattdessen exakt M2 ohne Installation der Air-OS-App aus einem **neuen, noch nicht vorhandenen** Quellordner gestartet werden. Vorher andere Air-OS-Instanzen schließen. PowerShell:

```powershell
git clone --branch fix/air-window-interruptible-m2-20261024 --single-branch https://github.com/quattrologic/Air-Os-Clean.git C:\Air-OS-F21
Set-Location C:\Air-OS-F21
git rev-parse HEAD
```

Nur fortfahren, wenn die Ausgabe **bc5b8dae196aabc62df5ffc3d1710da02289aed2** ist. Falls der Branch inzwischen weitergelaufen ist: hier stoppen und Stand klären; keine fremden Änderungen überschreiben. Danach:

```powershell
node --version
npm --version
npm ci
npm start
```

Kein `npm audit fix`, kein Upgrade und keine Änderung an Konfiguration/Installer nötig. Fehler des Starts/Setups mit genauer Meldung dokumentieren, nicht durch deaktivierte Sicherheitschecks umgehen. Eine neue Quellkopie allein garantiert keine getrennten App-Profildateien: deshalb neue Testprofile oder separates Windows-Testkonto verwenden.

Vor dem Test diesen Kopf ausfüllen:

| Angabe | Tatsächlicher Wert |
| --- | --- |
| Windows-Edition, Version, Build (`winver`), Architektur | OFFEN |
| EXE-Herkunft oder Quellstart; verifizierter Produktcommit | OFFEN |
| Electron-Version (Runtime/User-Agent; nicht nur Versionsnummer der App) | OFFEN |
| Monitor, physische/native Auflösung, aktuell eingestellte Windows-Auflösung | OFFEN |
| Windows-Anzeigeskalierung unter System → Anzeige | OFFEN, z.B.100/125/150% |
| Windows-Textgröße unter Barrierefreiheit | OFFEN |
| Air-OS-Fenster: maximiert/normal; App-Zoom | OFFEN |
| Gemessener Inhalt: innerWidth × innerHeight; devicePixelRatio | OFFEN |
| Animationen/Glas reduzieren in Air-OS; Windows-Animationseffekte/Kontrastdesign | OFFEN |

## 2. Kurzer Testlauf auf deinem Windows-PC

Ein Durchlauf dauert ungefähr15–20Minuten. Pro Zeile **BESTANDEN / FEHLER / NICHT GEPRÜFT / NICHT ERREICHBAR** eintragen und Beleg nennen. Bei Fehlern kurz erwartetes/tatsächliches Verhalten und Wiederholungsschritte notieren; keine Designkorrektur in diesem Auftrag.

| ID | Aktion | Erwartetes Verhalten | Ergebnis / Beleg |
| --- | --- | --- | --- |
| W01 | Neues Profil Alice anlegen. Einstellungen öffnen. | Desktop **und** Dock Air Modern, Wolken sichtbar. Zum Vergleich bestehendes Profil nur ansehen: gespeicherte Classic-/Modern-Wahl bleibt erhalten; nichts zurücksetzen. | OFFEN |
| W02 | Desktop ohne offene App betrachten; dann Air Home öffnen. | Dock klein, unten bündig, an allen Ecken rund, dezent glasig. Weiße Birne ohne schwarzen Kasten, andere Icons original/farbig. Island oben bündig/zentriert, dezent glasig; links nur „Air-OS“, Menü weiterhin erreichbar. Home mint/creme, keine unbeabsichtigt verschobenen Fenster oder abgeschnittenen Aktionen. Screenshot. | OFFEN |
| W03 | Startmenü öffnen, „notes“ suchen, Notes starten; Pin/Unpin einmal versuchen. Island → Kontrollzentrum/Schnellzugriff, Finder/Home starten. | Suche und Start funktionieren, Pin-Aktion startet keine App. Uhr echt lokal. Keine erfundenen Hardwarewerte; deaktivierte Hostkacheln bleiben deaktiviert. | OFFEN |
| W04 | In Notes synthetische Notiz erstellen, speichern, ändern, speichern, löschen; Home parallel offen lassen. | Sichtbare Speicherbestätigung, Live-Aktualisierung von Home, generische Island-Mitteilung ohne privaten Inhalt. Nach Notes-Schließen/Neustart vor Löschen gespeicherte Notiz wieder vorhanden. | OFFEN |
| W05 M2 | Notes minimieren; vor Animationsende Dock-Notes anklicken, während Restore erneut klicken.5–10mal mit kurzem Abstand wiederholen. Finder parallel offen lassen. Danach normal minimieren/restore; einmal maximiert wiederholen. Während Restore schließen, erneut öffnen. | Bewegung kehrt ohne Sprung/Flackern bei Lage, Größe oder Transparenz um. Am Ende bleibt das zuletzt gewünschte Fenster sichtbar oder minimiert; kein verspätetes Verstecken. Kein unsichtbarer Klickblocker, kein Fokusklau durch das andere Fenster. Maße nach vollständigem Restore gleich. Close vor Abschluss durch Reopen aufgehoben oder nach abgeschlossenem Close normale neue Instanz. Kurze Bildschirmaufnahme hilft mehr als ein Einzelbild. | OFFEN |
| W06 M1 | Island öffnen; per Schließen-Button/Escape schließen und sofort Trigger wieder öffnen.5–10mal. Bei geöffnetem Panel kann der Trigger auf großen Displays überdeckt sein: vorhandenen Schließen-Button/Escape nutzen. Auch Schnellzugriff → Close → Reopen während Bewegung. | Kein sichtbarer Sprung/Reset der Bewegung, keine alte Completion versteckt wieder geöffnetes Panel. Unterbrochenes Reopen behält sichtbare Ansicht; nach vollständigem Schließen startet Kontrollzentrum. | OFFEN |
| W07 | Mit Tab/Shift+Tab, Enter und Space Systemmenü, Startmenü, Pin-Aktionen, Island/Ansichten und Notes-Fensterbuttons bedienen. Escape und Outside-Click prüfen. | Sichtbarer Fokus, keine Tastaturfalle; Enter/Space betätigen Buttons. Escape schließt Menüs/Island und gibt Fokus sinnvoll zurück; es muss nicht das Notes-Fenster schließen. Restore fokussiert vorhandenes Fenster. Keine verdeckten fokussierbaren Bedienelemente. | OFFEN |
| W08 CB-02/03 | Notes-Schließen/Minimieren/Maximieren separat mit Maus und Tastatur prüfen; danach Umrandungen und Schrift bei verschiedenen Größen ansehen, siehe Abschnitt4. | Trefferflächen/Abstände nachvollziehbar; keine unbeabsichtigte Nachbaraktion oder Verschiebung. Funktional nötige Konturen und Fokus erkennbar. | OFFEN |
| W09 | Air-OS „Animationen reduzieren“ einschalten, W05/W06 kurz wiederholen. Danach ausschalten und **nur** Windows-Animationseffekte deaktivieren, wiederholen. „Glaseffekte reduzieren“ separat prüfen. Kontrastdesign separat ansehen. | Bei aktivem tatsächlichem Reduced-Motion-Signal keine langen Bewegungen; sichtbare Endzustände bedienbar. Glasreduktion deckend. Text/Fokus/Controls in Kontrastdarstellung erreichbar. Aktivierte Signale notieren, nicht bloß Schalterstellung annehmen. Ursprüngliche Windows-Einstellungen danach wiederherstellen. | OFFEN |
| W10 | Alice auf Classic umstellen, kurz prüfen, zurück Modern. Alice abmelden, neues Bob-Profil öffnen, zurück Alice; App anschließend regulär neu starten. | Classic bleibt benutzbar, Desktop-/Dock-Wahl unabhängig. Bob ohne Alice-Notizen; Alice-Daten und gespeicherte Auswahl bleiben. Kein altes Fenster/Panel oder Fokuszustand aus anderem Profil. | OFFEN |

## 3. Tatsächliche Bildschirmgrößen und Skalierung

W01–W10 einmal bei deiner normalen Konfiguration durchführen. Danach W02/W05/W06/W07/W08 bei einer zweiten **tatsächlich verfügbaren** Größe/Skalierung wiederholen.1920×1080 und1650×930 sind Zielgrößen, keine Pflicht, eine nicht unterstützte Windows-Auflösung zu erzwingen. Auch „maximiertes Fenster auf Monitor1920×1080 bei125%“ notieren: das ist gewöhnlich **kein**1920×1080-CSS-Viewport. Windows-Titelleiste/Taskleiste und DPI beeinflussen den Inhalt.

| Lauf | Eingestellte Displayauflösung | Anzeigeskalierung / Textgröße / App-Zoom | Echtes Fenster, Inhalt innerWidth×innerHeight / DPR | W02/05/06/07/08 |
| --- | --- | --- | --- | --- |
| A: normale Konfiguration | OFFEN | OFFEN | OFFEN | OFFEN |
| B: zweite verfügbare Größe oder Skalierung | OFFEN | OFFEN | OFFEN | OFFEN |
|1920×1080-Ziel | NICHT GEPRÜFT | OFFEN | OFFEN | OFFEN |
|1650×930-Ziel | NICHT GEPRÜFT | OFFEN | OFFEN | OFFEN |
|390×600-Ziel | Erreichbarkeit OFFEN | OFFEN | OFFEN | OFFEN |

**390px:** Der Quellcode setzt eine native BrowserWindow-Mindestbreite760 und Mindesthöhe540. Ob und wie klein das echte Fenster auf deinem Windows/DPI-Setup wird, muss gemessen werden. Grenzen nicht verändern. Ist390×600 als echter Inhalt nicht erreichbar, **NICHT ERREICHBAR** mit tatsächlichem Mindestmaß eintragen. DevTools-Gerätemodus, CDP-Viewport, Seitenzoom oder verkleinerte Screenshots sind separat als Simulation/Diagnostik auszuweisen und gelten nicht als natives390px-Fenster.

Bei veränderter Windows-Skalierung Fenster/Anwendung nötigenfalls neu starten und den neuen DPR erneut erfassen.200%-App-Zoom und200%-Windows-Textgröße sind separate optionale Lesbarkeitstests: verwendete Methode notieren, keine erfolgreiche Prüfung des anderen daraus ableiten.

## 4. CB-02, CB-03 und Schriftarten konkret erfassen

**CB-02:** Notes-Titelleiste: jeden der drei Buttons in Mitte und an Randpunkten treffen. Keine echten Arbeitsnotizen verwenden. Button-DOMRect (CSS-Pixel) und sichtbaren Kreis unterscheiden. Bereiche zwischen Buttons testen: keine falsche Nachbaraktion/ungewolltes Drag. Mit Tab/Enter/Space erreichbar? Eine gemessene Fläche unter24×24CSS-Pixel ist ein Prüfbefund; mögliche WCAG2.2-Abstands-/andere Ausnahmen müssen tatsächlich nachgewiesen werden, nicht allein aus der Kreisgröße ein pauschales Urteil ableiten. Nicht bereits als behoben markieren.

**CB-03:** Notes-Titelfeld-Unterstrich, Trennlinie und Löschen-Button-Kontur im Normal-, Hover- und Fokuszustand ansehen. Welche Grenze ist nötig, um die Eingabe/den Button zu erkennen, welche rein dekorativ? Relevante Bedienkonturen gegen3:1 prüfen; normaler Text gegen4,5:1. Der historische Quellwert#b8bcb6 auf Creme#f8f7f3 ergibt ungefähr1,796:1, ist aber **keine neue Windows-Messung** und nicht jede Trennlinie automatisch ein Verstoß. K1 hat kleinen Notes-Sekundärtext bereits auf#5f7464 korrigiert, rechnerisch≈4,699:1; die alte4,1:1-Angabe nicht als aktuellen Ist-Zustand übernehmen.

**Windows-Schriften:** Titel/Editor/Navigation auf Umbruch, abgeschnittene Zeichen, Zeilenhöhe, Caret und Scrollbars prüfen. Optional DevTools → Elements → Computed → **Rendered Fonts** für Editor und große Überschrift notieren. Ein font-family-Stack allein belegt nicht die tatsächlich verwendete Schrift. Bei Fallback Schriftname und Screenshot nennen; keine Fontinstallation zur Kaschierung vornehmen.

Optional für genaue Geometrie: DevTools mit Ctrl+Shift+I oder F12 öffnen, möglichst **in eigenem Fenster**, Gerätemodus ausgeschaltet. Falls das im verwendeten Build nicht möglich ist, Messfelder offen lassen; keine Sicherheits-/Laufzeitkonfiguration dafür ändern. Notes offen, Animation abwarten. Docked DevTools verkleinert den gemessenen Inhalt; in diesem Fall ausdrücklich notieren. Folgenden lesenden Ausschnitt in der Konsole ausführen. Er liest keine Notizwerte, Titel, Profilkennung oder Sitzungsdaten und verändert keine Einstellungen:

```js
JSON.stringify((() => {
  const inspect = selector => {
    const e = document.querySelector(selector);
    if (!e) return { selector, vorhanden: false };
    const r = e.getBoundingClientRect(), c = getComputedStyle(e);
    const visible = r.width > 0 && r.height > 0 && c.visibility !== 'hidden';
    const hit = visible ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null;
    return {
      selector, rectCSS: { x:r.x, y:r.y, width:r.width, height:r.height },
      display:c.display, fontFamily:c.fontFamily, fontSize:c.fontSize,
      lineHeight:c.lineHeight, color:c.color, background:c.backgroundColor,
      borderColor:c.borderColor, borderWidth:c.borderWidth,
      outline:c.outline, pointerEvents:c.pointerEvents,
      mitteTrifftElement: !!hit && (hit === e || e.contains(hit))
    };
  };
  return {
    userAgent: navigator.userAgent,
    viewportCSS: { width:innerWidth, height:innerHeight },
    dpr:devicePixelRatio,
    screenCSS: { width:screen.width, height:screen.height },
    reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
    forcedColors:matchMedia('(forced-colors: active)').matches,
    desktopTheme:document.documentElement.dataset.desktopTheme,
    controls:[
      '.dock','#air-island-toggle','.air-notes-window',
      '.air-notes-window .traffic .close',
      '.air-notes-window .traffic .minimize',
      '.air-notes-window .traffic .maximize',
      '#note-title','#note-body','#note-status',
      '.air-notes-window .secondary-button'
    ].map(inspect)
  };
})(), null, 2)
```

Ausgabe als Text sichern. screen.width/height sind CSS-Werte, **nicht** die native physische Auflösung; letztere aus Windows-Anzeige übernehmen. Mitte-Hit-Test ersetzt keine Rand-/Mausprüfung. Transparente Hintergründe, Überlagerungen und Forced Colors bei Kontrastrechnung berücksichtigen; computedStyle für Placeholder ist unter dieser Chromium-Version kein verlässlicher Beleg des tatsächlich gerenderten Placeholder-Farbtons. Keine beliebigen Konsolenskripte aus anderen Quellen ausführen oder Sicherheitswarnungen abschalten.

## 5. Was zur Auswertung zurückgeben

- Ausgefüllten Umgebungskopf und Testtabelle, auch „nicht geprüft/nicht erreichbar“ ist ein verwertbares ehrliches Ergebnis.
- Echte Windows-PNGs vom Desktop, Air Home, Notes, Startmenü und Kontrollzentrum; bei Bedarf Notes mit Tastaturfokus/Kontrastdesign. Beispielname `F21-Windows-LaufA-Notes.png`. Unverkleinert und ohne private Inhalte; sichtbare Windows-Skalierung gesondert festhalten. Keine Simulation als Hardwarebeleg benennen.
- Möglichst kurze Bildschirmaufnahme der M1/M2-Richtungswechsel. Ein Einzelbild belegt weder flüssigen Verlauf noch fehlende Zwischenframe-Sprünge. Bei Aufnahme Aufnahmerate nennen, wenn bekannt; keine garantierten FPS daraus ableiten.
- Falls verwendet: obige JSON-Ausgabe je Lauf und tatsächliche Rendered-Fonts-Namen. Für jeden Fehler Test-ID, Schritte, Erwartung, Beobachtung und Reproduzierbarkeit, z.B.3/5Versuchen.

Screenshots/Messwerte werden **erst nach Bereitstellung** als Windows-Nachweis ausgewertet. Bis dahin sind alle W01–W10 und CB-02/CB-03 auf M2 nativ offen. Keine Daten unter docs/visual mit „Windows“ erzeugt. F2.2macOS bleibt separat offen.

## Validierung dieser Dokumentation

Produktcode, Installer und Design unverändert. M2-Remote-HEAD und sauberer Ausgangsarbeitsbaum bestätigt, fehlenden Windows-Zugriff erneut geprüft; PR-/Actions-API Forbidden. Dokumentlinks, Selektoren, JS-Syntax des lesenden Ausschnitts und Docs-only-Diff geprüft. **Tatsächlich ausgeführt: npm test unter Linux/Node24.19.0,242/242 bestanden,0 Fehler/Skips.** Dies ist ein neuer Linux-Regressionslauf dieser Dokumentationseinheit, ausdrücklich kein Windows-Ergebnis. Keine GUI dieser Sitzung gestartet. Bekannte Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben bestehen.
