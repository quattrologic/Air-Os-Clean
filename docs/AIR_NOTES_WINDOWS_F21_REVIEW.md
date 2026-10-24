# F2.1 – Air Notes: native Windows-Abnahme

24. Oktober 2026 · Prüfgegenstand `1866281571b04ad74efdf549d665eae68842d254` · Berichtszweig `docs/air-notes-windows-f21-20261024`.

**Gesamtergebnis: BLOCKIERT – keine echte Windows-Umgebung verfügbar. Keine native Windows-Freigabe.** Die Dokumentationsarbeit ist abgeschlossen; die eigentliche Windows-Abnahme bleibt offen. Keine produktive Korrektur und keine weitere Funktion implementiert.

## 1. Umgebung und Beleggrenzen

| Feld | Tatsächlicher Stand |
| --- | --- |
| Verfügbare Umgebung |Debian GNU/Linux13.6 (trixie), Linux6.18.55, x86_64 |
| Node |24.19.0, process.platform=linux, process.arch=x64 |
| Electron |32.3.3 im installierten Paket und package.json; in dieser Sitzung keine Electron-GUI gestartet |
| Windows-Version / Build / Architektur |Nicht verfügbar, nicht getestet |
| Angebundener Windows-Ausführungs-/Desktopzugang |Keiner in den verfügbaren Werkzeugen/Umgebungskontexten vorhanden |
| Lokale Windows-/Kompatibilitätswerkzeuge |powershell.exe, pwsh, cmd.exe, wine, wine64 nicht im PATH; selbst deren Vorhandensein wäre kein Beleg einer nativen Windows-Sitzung |
| Auflösung / OS-Skalierung / devicePixelRatio auf Windows |Nicht erhoben |
| Tatsächliche Windows-Schriftauflösung und Glyphmetriken |Nicht erhoben; deklarierte Familien system-ui/Georgia sind keine Messwerte |
| Native Fenster-/Hitbox-/Scrollbar-Messwerte |Nicht erhoben |
| Neue Screenshots/Messdateien |Keine erzeugt; bestehende F1-Linux-Belege nicht als Windows-Belege umbenannt |

Prüfbasis und Remote-HEAD stimmen überein. AGENTS.md, Hybrid-Plan, Air-Modern-Plan und neueste Fortschrittsdokumente gelesen. Userauftrag autorisiert F2.1 als reine Prüfung; keine weitere Konzeptfreigabe vorausgesetzt. Supaste bleibt laut bereits dokumentiertem Befund403-blockiert; keine neuen Supaste-Messwerte behauptet. Apple-Design-Referenz dient als Prinzipienkatalog, nicht als Ersatz für Windows-Belege.

## 2. Native Prüfmatrix

**BLOCKIERT** bedeutet hier nicht fehlgeschlagen, sondern nicht ausführbar mangels nativer Umgebung. Die drei Auflösungen werden nicht durch Linux-CDP, einen Windows-User-Agent oder CSS-Simulation ersetzt.

| Prüfpunkt |1920×1080 |1650×930 |390×600 |
| --- | --- | --- | --- |
| Windows-Systemfonts / Georgia / Umbruch |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Fensterlage, Titelleiste, Liste, Editor, Scrollbalken |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Tatsächliche Close-/Minimize-/Maximize-Trefferflächen |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Keine abgeschnittenen Eingaben/Aktionen |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Kontrast aus tatsächlich berechneten Windows-Styles |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Fokus, Enter/Space/Tab/Escape, Listen-/Editorzugang |BLOCKIERT |BLOCKIERT |BLOCKIERT |
|200% Textvergrößerung |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| OS-Reduced-Motion und Air-OS-Bewegungsreduktion einzeln |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Windows-Hochkontrast / Forced Colors |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Notes-Neu/Bearbeiten/Speichern/Löschen |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Sichtbarer Speicherfehler und Retry / neuer ungespeicherter Text |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| E3-Live-Aktualisierung / Island-Speichermitteilung |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Drag/Minimize/Maximize/Restore/Close |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Classic/Modern-Wechsel und Startmenü-App-Start |BLOCKIERT |BLOCKIERT |BLOCKIERT |
| Alice/Bob, Logout/Re-Login, verspätete Antworten |BLOCKIERT |BLOCKIERT |BLOCKIERT |

## 3. Bestätigte Code-/Rechenbefunde – ausdrücklich keine Windows-Darstellungsmessung

Die folgenden Werte wurden jetzt aus den festgelegten CSS-Farben nach WCAG-sRGB berechnet, nicht von einem Windows-Screenshot abgenommen. Annahme: opake deklarierte Modern-Standardflächen ohne Forced-Colors-Ersetzung. Schwellen: normaler Text4,5:1; große Schrift3:1; relevante UI-Konturen3:1. Tatsächliche Anzeige, Zoom, Zustandsüberlagerung und OS-Farbsubstitution bleiben offen.

### CB-01 – kleiner Sekundärtext: bestätigte rechnerische Unterschreitung

`#677e6c` auf `#f8f7f3` ergibt **4,10035:1**, unter4,5:1. Betroffene Modern-Selektoren:

- `html[data-desktop-theme="modern"] .air-notes-window #note-status`:12px, auf kleinen Displays11px; [styles.css:826](../styles.css#L826), [mobile:843](../styles.css#L843). Hintergrund der Aktionen#f8f7f3, [Zeile825](../styles.css#L825).
- `html[data-desktop-theme="modern"] .air-notes-window textarea::placeholder`: Farbe und opacity1 in [styles.css:824](../styles.css#L824), Editorfont14px bzw.13px [823](../styles.css#L823)/[841](../styles.css#L841), Cremefläche [821](../styles.css#L821).

Der Titel-Placeholder erhält dieselbe Farbe, ist bei30px bzw.24px regulärer Schrift jedoch als große Schrift gegen3:1 zu bewerten. Nicht pauschal als derselbe4,5:1-Verstoß verbuchen. Auf Windows muss bestätigt werden, dass die deklarierte Standardkombination tatsächlich wirksam ist. **Keine native Windows-Fehlerbeobachtung**, aber ein belegter Farb-/CSS-Befund für eine spätere K1-Entscheidung.

`#5f7464` auf Creme ergibt **4,69920:1** und bleibt ausschließlich ein Kandidat. Kein CSS-Wert wurde geändert.

### CB-02 – deklarierte Fensterbuttongröße: bestätigt; native Hitbox offen

Modern Notes deklariert width/height/min-width/min-height10px an `.air-notes-window .traffic button`, [styles.css:812](../styles.css#L812). Die generische Regel setzt padding0, [styles.css:33](../styles.css#L33); Abstand der Modern-Traffic-Gruppe8px, [811](../styles.css#L811).

Das ist ein konkreter Anlass für eine Trefferflächenprüfung gegen mindestens24×24CSS-Pixel oder eine tatsächlich nachgewiesene Ausnahme. **10×10 ist hier der gelesene CSS-Wert, kein gemessenes Windows-DOMRect und kein vollständiger Hit-Test.** Sichtbarer Kreis, tatsächlicher Buttonkasten, Pseudoelemente/Überlagerung, Randpunkte und Nachbarabstände müssen nativ geprüft werden. Eine zusätzliche Klickfläche darf später weder Drag noch Nachbarbuttons verdecken. Jetzt keine Änderung und keine vorschnelle native Erfolgs-/Fehlerfreigabe.

### CB-03 – Konturen: rechnerisch schwach; Relevanz nativ bewerten

`#b8bcb6` auf Creme ergibt **1,79610:1**. Vorkommen: Titel-Unterstrich [822](../styles.css#L822), Aktions-Trennlinie [825](../styles.css#L825), `.secondary-button`-Kontur [827](../styles.css#L827). Ein dekorativer Trenner muss nicht automatisch eine relevante Bedienkontur sein. Ob eine Grenze zum Erkennen des Controls benötigt wird, ist in der tatsächlichen Darstellung zu beurteilen; daher **Prüfkandidat**, kein pauschaler bestätigter Windows-WCAG-Verstoß.

### Rechnerische Vergleichswerte und vorhandene Fokusdeklaration

| Kombination | Aktuelle Rechnung | Einordnung |
| --- | --- | --- |
|#2c3b31 auf Creme |11,02390:1 |Primärtext über4,5:1, nur unter den genannten Annahmen |
|#365e43 auf Creme |6,90029:1 |Dunkler Button-/Fokuston, rechnerisch ausreichender Abstand |
|#365e43 auf Hellgrün#b0e5ad |5,16282:1 |Rechnerische Fokus-/Textreserve |
|#365e43 auf Mint#9cdaa1 |4,56388:1 |Rechnerische Fokusreserve |

`:is(button,input,textarea):focus-visible` ist mit2px-Outline und2px-Offset deklariert, [styles.css:833](../styles.css#L833). Ob der Ring auf Windows tatsächlich sichtbar, korrekt ausgelöst und nicht abgeschnitten ist, bleibt BLOCKIERT. Vorhandene Media-/Settings-Wege für reduzierte Bewegung ersetzen keinen Lauf mit beiden realen Signalen. Forced Colors,200%-Text, Caret/Selection und Scrollbar-Kontrast wurden nicht simuliert oder abgenommen.

## 4. Designverbesserungen – Vorschläge, keine Änderungen

1. Für K1 kann genau CB-01 als erste kleine Farbkorrektur gewählt werden. Falls beauftragt, nur kleinen Sekundärtext korrigieren und Modern/Classic sowie echte Kontraste erneut prüfen; nicht automatisch alle Grüntöne austauschen.
2. Alternativ kann nach tatsächlicher Hitbox-Beobachtung genau CB-02 priorisiert werden. Sichtbare10px-Kreise müssen nicht zwingend wachsen; Trefferflächen erfordern trotzdem saubere Abstände und Regressionen.
3. Windows-Fontmetriken,200%-Textfluss und Forced-Colors-Konturen erst nach nativer Erhebung gestalten. Keine freie Neuinterpretation oder pauschale Typografieänderung aus Linux-Eindrücken.

Mint-Rahmen, Sidebar, Editor, E3-Events, Profile, Originalicons, Dock und Island werden in F2.1 nicht verändert.

## 5. Tatsächlich ausgeführte Prüfungen dieser Sitzung

- `npm test` auf **Linux/Node24.19.0:216 Tests,216 bestanden,0 Fehler,0 Skips**. Neuer Lauf, nicht bloß Wiederholung der historischen Angabe. Deckt bestehende Notes-/Profil-/Race-/E3-Regressionsfälle ab; kein Beleg nativer Windows-Interaktion. Tests mit Windows/macOS im Namen enthalten auch synthetische Paket-Fixtures und sind keine native Installer-/GUI-Abnahme.
- `npm run check:catalina`: bestanden, Konfiguration Electron32.3.3/macOS≥10.15.0. **Nur Konfigurationsprüfung**, weder Windows- noch macOS-Hardwaretest.
- CSS-/HTML-Quellprüfung, Kontrastrechnung, Umgebungsprobe, Remote-HEAD und Dokument-/Whitespaceprüfung.
- GitHub-PR-/Actions-Abfrage erneut **Forbidden**. Keine CI-Läufe oder PR-Zustände als aktuell erfolgreich bestätigt, keine Builds ausgelöst.
- **Keine App-GUI, Screenshots oder native Messdateien erzeugt.** Kein Windows, keine Emulation und keine Linux-GUI als Ersatz. Alte F1-Linux-Bilder bleiben nur historische Referenz: [F1-Bericht](AIR_NOTES_MODERN_F1.md).

## 6. Exakter nächster Windows-Prüfablauf

Sobald eine echte Windows-Electron-Sitzung verfügbar ist, an derselben geprüften F1/Hybrid-Codebasis fortsetzen; neue HEADs vorher vergleichen. Nur isolierte synthetische Profile und Daten verwenden.

1. Windows-Edition/Build/Architektur, Electron-Runtimeversion, Startcommit und Paket-/Entwicklungsstartart erfassen. OS-Anzeigeskalierung, Textskalierung, Browserzoom, physische Displayauflösung, innerWidth/innerHeight und devicePixelRatio getrennt notieren.
2.1920×1080,1650×930 und390×600 als tatsächlich gemessene Content-Viewports prüfen. Der vorhandene BrowserWindow-Mindestwert beträgt760px Breite [main.cjs:87](../main.cjs#L87): falls390px im nativen Fenster nicht erreichbar ist, genau das als Plattform-/Umgebungsgrenze dokumentieren. Windows-CDP-Viewportdiagnostik ausdrücklich als solche ausweisen, nicht als physisch390px breites natives Fenster. Kein Windows-User-Agent auf Linux als Ersatz.
3. Moderne und klassische Notes erfassen: geladene Schrift, DOMRects/Textbreiten/Zeilen, Caret, Scrollbars und reale Hintergrund-/Text-/Randfarben; Referenzvergleich zu unverändertem Air Home. Farbwerte aus computed styles und Zustände dokumentieren, nicht allein antialiaste Glyphpixel messen.
4. Button-DOMRects plus reale elementFromPoint-/Klickprüfungen an Mitte/Rand und Zwischenräumen; Drag-Griff und Nachbarbuttons nicht verwechseln. Tastatur Tab/Shift+Tab, Enter/Space und Escape in Menüs/Popups prüfen; kein unbeauftragtes Escape-schließt-Editor-Verhalten voraussetzen.
5. OS-Textgröße200% und App-/Seitenzoom200% getrennt prüfen und Skalierungen benennen. Hochkontrast/Forced Colors, OS-Bewegungsreduktion und Air-OS-Einstellung jeweils einzeln aktivieren; tatsächliche Media-/Setting-Zustände aufzeichnen.
6. Notes-CRUD, sichtbares Speichern, kontrollierter Fehler/Retry nur im isolierten Profil, neuerer Draft während ausstehendem Save, Home-/Island-Ereignisse, Fensteraktionen und Alice/Bob-Re-Login testen. Tests mit Doubles klar von nativen realen Aktionen trennen.
7. Erst dann echte Windows-Screenshots und Messwerte unter docs/visual anlegen. Abweichung, erwartetes Verhalten, Reproduktionsschritte, Version/Skalierung und Status pro Punkt eintragen; kein grünes Gesamturteil bei offenen Punkten.

Der760px-Mindestwert ist ein weiterer **Quellbefund**, keine jetzt beobachtete Windows-Resize-Grenze. Für die Abnahme keine Laufzeitgrenzen ändern.

## 7. Übergabe und Grenzen

F2.1 als native Abnahme bleibt **BLOCKIERT**. F2.2 ist eine separate echte macOS-Prüfung; die hiesige Linux-Umgebung gilt auch dafür nicht als Nachweis. K1 nur als ausdrücklich beauftragte einzelne Korrektur; K2 separat. Keine Änderung von Produktcode, Installer, Releases, main, bestehenden PRs oder anderen Entwicklungsbranches. Bestehende Audit-/Legacy-Electron-/Signing-/Notarisierungsblocker unverändert.
