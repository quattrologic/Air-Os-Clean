# Air-OS Tahoe 3 – fünf gemeinsame App-Arbeitsflächen

26. Oktober2026. Basis **adf6c9eb13081e0d79fc15ff4da39a86a2982d47**, Branch **feat/air-os-tahoe-3-apps**, gesicherter Produktcommit **0610ca5b36493ec1d3d23e410c9a19022dc9ebc6**. Arbeitsbaum war sauber; Remote-Basis verifiziert. Vorhandene Tahoe2-/WinBox-Evaluationsfortschritte erhalten. Keine zweite Registry oder Window-Engine.

## Tatsächlich umgesetzt

| App | Reale Integration / Ausführungspfad |
|---|---|
| Finder | Bestehender `air-files-app`-Controller: dunkle Sidebar mit dem tatsächlich erlaubten Ordnerzugang, helle Datei-/Texteditoransicht, gemeinsame Toolbar/Suche, Vier-Spaltenliste, Original-Ordner-/Bild-/Papier-/Musikicons, Fokus-/Hoverzustände und Pfeiltasten/Home/End. Kontextmenü delegiert Öffnen/Umbenennen/Duplizieren an die existierenden Buttons/Handler. Neue gemeinsame HTML-Dialoge ersetzen in Electron nicht unterstützte `window.prompt`-Aufrufe. Laden/Fehler/Refresh, veraltete Navigationsantworten und deaktivierter Up-Button am Freigabewurzelordner verbessert. Main-Dateirechte unverändert. |
| Notes | Vorhandene profilgebundene Notes-API und Speichersnapshots erhalten. Dunkle Titel-Suchliste mit Auswahl/Leerzustand, cremeweißer Editor, einheitliche Bearbeitungsaktionen/Fokus, lange Titel mit Ellipse in der Liste und vollem Tooltip. Tastaturnavigation, neuere Editoränderungen nach Save-Acknowledge weiterhin geschützt; verspätete Listenantworten nach Schließen/Profilwechsel verworfen. Retry beim Speichern bleibt derselbe echte Speicherbutton. Keine Body-Vorschauen oder zweite Notes-Datenbank. |
| Reminders | Bestehende Aufgaben-API/Form/Checkboxen/Fälligkeit/Prioritäten erhalten. Neue echte Titel-Suche und Filter Alle/Offen/Erledigt/Heute/Überfällig aus derselben geladenen Liste, keine zweite Aufgabenverwaltung. Dunkle Navigation, heller Editor, gemeinsame Felder/Buttons, ehrlicher Filter-Leerzustand. Lokale Datum-ohne-Uhrzeit-Vergleiche; Heute-Widget-/Home-Liveevents bleiben unverändert. |
| Kalender | Vorhandenes Terminformular, echte lokale Termine, Entfernen und ICS-Export weiterverwendet. Zusätzliche echte Monats-/Tagesansicht mit42 lokalen Datumszellen, Montagbeginn, Monatsnavigation/Heute/Alle Termine und Tagesfilter; Tagesauswahl setzt das vorhandene Datumsfeld. Kein erfundener Termin. Kalenderpopover/-widget und deren Öffner unverändert. |
| Musik | Vorhandene AmplitudeJS-Engine/Dateiauswahl/Transport/Seeking/Lautstärke/Playlists weiterverwendet. Gemeinsame Sidebar/Toolbar/Listen und helle Playerfläche, echte Spiel-/Pausenzustände, deaktivierte Controls ohne Track. Playlistname über den gemeinsamen funktionierenden Dialog, sichtbarer Speicherfehler/Retry, Cleanup/Audio-Pause/Blobfreigabe bei Schließen/Logout/Pagehide und Schutz vor mehrfacher asynchroner Montage. Defaultlautstärke auf die korrekte Amplitude-Skala75/100 korrigiert. Kein zweiter Audiotransport. |

`air-tahoe-apps.js` ist eine Präsentations-/Tastatur-/Dialogschicht über bestehenden DOM-Nodes und Handlern. `air-tahoe.css` ist weiterhin die einzige gemeinsame Tahoe-Komponentenebene; keine unabhängigen App-Skins oder Shaderengines. Mobile Such-/Filterflächen sind erreichbar, Listen/Editorbereiche scrollen statt Bedienelemente per overflow:hidden abzuschneiden. Classic verwendet seine vorherigen Styles/Grafiken; neue Suchfilter/Monatsfläche werden dort ausgeblendet, aktive Filter beim Umschalten zurückgesetzt. Finder-Artwork wird bei Classic wiederhergestellt.

## Originalwerte und Lizenzen

Unveränderte fixierte Quellen des Masterports: MacTahoe GTK **1e45e19f510edb8cde18fa84d6cd5319f60b086b** (MIT), Icons **839848b9a8a38a92a6936e30c4abe35cc6f2546d** (separat GPL-3.0), MacShell **1bdb51870b621100fd2709f66c8f8e00ab17b9c4** (MIT/OFL-Nachweise erhalten). Keine neuen Fremdassets importiert; vorhandene14 Original-SVGs mit COPYING/AUTHORS/NOTICE bleiben unverändert.

Quellen: `third_party/tahoe/gtk/source/_variables.scss`, `_colors.scss`, `_colors-palette.scss` und vorhandene GTK-Common-Referenzen. Laptop-Padding/-Spacing4px, Menüzeilen28px, Button-/Feld-/Menüradius6/8/12px; dunkle Basis#242424, Header#333333, Text#dedede, Sekundärtext#afafaf, Akzent#0088ff, heller Hinweistext#565656. Die erhaltene Creme#f8f7f3 ist die Air-OS-Arbeitsfläche. Sidebarbreiten/Umbrüche sind responsive Electron-Anpassungen, keine unbelegte GTK-Pixelgleichheit. Kalenderzellen portieren die bereits vorhandene MacBar/calCells-Formel mit lokaler Mittagserzeugung; Month/Day-Controls sind echte Browserbedienelemente. GLASS-3 bleibt für vorhandene transparente Hosts zuständig; neue GTK-artige Listen/Dialoge verwenden den gemeinsamen CSS-Materialfallback.

## Nachgewiesene Speichergrenze und Bestandsdaten

Der frühere Kalender und die Playlists verwendeten **nicht profilgebundene** Browserkeys `air-os-calendar-events-v1` / `air-music-playlists-v1`. Diese Daten werden weder gelöscht noch ungeprüft dem gerade angemeldeten Nutzer zugeordnet. Neue Datensätze verwenden dasselbe JSON-Format im vorhandenen Browser-Speicher mit einem ausdrücklich profilbezogenen Schlüssel. `profile-local.js` prüft die authentifizierte Sitzung vor Initialisierung und verwirft alte Instanzen bei Profilwechsel; keine neue Datenbank oder IPC-Berechtigung.

**Wichtige Einschränkung:** Alte nicht zugeordnete Kalender-/Playlistdaten werden in der neuen Profilansicht noch nicht automatisch angezeigt. Die Oberfläche meldet die ausgesetzte Übernahme. Ihre spätere explizite Eigentümerzuordnung ist offen; keine stille Migration und kein behaupteter Importer. Browser-Namespacing ist keine zusätzliche verschlüsselte Main-Process-Datenbank oder Sicherheitsgrenze gegen kompromittierten gleichoriginigen Renderer-Code. Notes/Reminders bleiben in ihren bestehenden authentifizierten Stores. Auf dem unauthentifizierten MacLock wird nichts davon freigegeben.

## Tatsächliche Prüfungen

- **407/407 Tests bestanden**: alle bisherigen400 erhalten plus sieben neue Regressionen für Datum-/Schaltjahr-/Monatswechsel, Such-/Aufgabenfilter, zwei profilgebundene Instanzen, Legacy-Erhalt, Fehler/Disposition und Packaging. Bestehende Notes-/Liveevent-Assertions unverändert; deren minimale DOM-Doubles um die jetzt tatsächlich verwendeten DOM-Methoden erweitert. Der alte CSS-Test erlaubt ausschließlich die neue Kontextmenü-Overlayebene; Fenster-/Shell-Ownership bleibt geschützt.
- Runtime-Validierung: **187 Ressourcen** einschließlich JS-Syntaxprüfung. PWA-Build: **176 erlaubte Assets**; keine Veröffentlichung oder neue Safari-Abnahme. Paketliste ergänzt nur die drei neuen UI/Core-Dateien, keine Abhängigkeit. Main/Preload/Signing/Installerlogik unverändert.
- Echter sandboxed **Linux Electron44/x64**, regulärer SwiftShader-/CSS-Fallback. Alle fünf Apps bei1920×1080,1650×930,390×600 gestartet, geschlossen und aufgenommen; mehrere bestehende Fenster gleichzeitig. Schmale Ansicht durch Renderermetriken, kein physischer390px-/iPad-Nachweis.
- Echte Notes-Suche/Speicherung, Reminderänderung/erledigt/wieder offen,42-Tage-Kalender/Monatswechsel/Termin speichern, lokale selbst erzeugte8s-WAV-Datei dekodiert/abgespielt/pausiert, echte Playlist per Dialog. Audiofortschritt ist kein Nachweis physischer Lautsprecherfunktion; hier stehen keine realen Audiogeräte zur Verfügung. Keine MP3-/FLAC-Codec- oder Album-Metadaten-Abnahme behauptet; Cover bleibt ohne Metadaten ein ehrlicher musikalischer Platzhalter.
- Zwei tatsächliche Testprofile: Kalendertermin und Playlist von Alice in Bob nicht sichtbar. Getrennte temporäre Speicher-/Wiederöffnungsinstanzen zusätzlich im Unit-Test. [Original-Produktlauf](visual/tahoe3-after/report.json), [abschließender Fixture-Arbeitslauf](visual/tahoe3-finder-fixture/report.json).
- Bestehender vollständiger App-/Zwei-Profil-/Logout-/Neustart-/Notes-/Home-/Finder-/Reminders-/Classic-/M1-/M2-/Reduced-Motion-/WebGL1+2-Ausfalllauf erneut ausgeführt; [Messbericht](visual/tahoe3-regression/r1-gui-report.json). Gemeinsame Context-Loss-/Reduced-Transparency-Regressionen erhalten. Keine neue Hardware-GPU-/60fps-/Windows-/macOS-/Safari-Abnahme behauptet.
- Exakt unveränderte Shell-Rechtecke vor/nach: Dock325×62/bottom0; Island220×40 bei1920,189,078125×36 bei1650,144×36 bei390/top0. Offizielles Logo, Iconreihenfolge, App-Registry, Fensterverwaltung, M1/M2/MacLock sowie Einstellungen-Tahoe2 erhalten.
- PR-/CI-API hierHTTP403; kein neuer CI-Erfolg behauptet. main/PRs/Installer unverändert; keine Cloudanmeldung, privaten Laptopdateien oder Zugangsdaten.

### Finder-Abnahme sauber getrennt

**Native Picker-Abnahme BLOCKIERT:** In der headless Xvfb-Umgebung konnte der originale Ordnerdialog nicht zuverlässig bedient/identifiziert werden. Der normale Produktlauf meldet `finderNative:false`; das ist kein erfolgreicher nativer Dateidialogtest.

Der separat gekennzeichnete, nicht ausgelieferte Teststarter `scripts/start-tahoe3-test.cjs` ersetzt **nur** die Auswahlantwort für einen eigens erzeugten synthetischen Ordner. Er verlangt ausdrücklich AIR_GUI_TEST_ISOLATED, einen zusätzlichen CLI-Schalter, einen temporären air-r1-gui-Profilpfad und einen festen Fixturemarker; keine Produktions-Brücke geändert. Hier liefen nachweislich echte Main-Dateirechte/Datei-I/O: Zugriff ohne Freigabe verweigert, Unterordner/Up, Kontextmenü/Escape, Text öffnen/bearbeiten/speichern, Umbenennen/Duplizieren über gemeinsame Dialoge und Such-Leerzustand. Ergebnis `finderFileWorkflow:true`, `pickerMode:isolated-main-picker-fixture`. Keine gemockten Dateilisten oder behauptete native Pickerfreigabe. [Liste](visual/tahoe3-finder-fixture/finder-files.png) · [Kontextmenü](visual/tahoe3-finder-fixture/finder-menu.png) · [bestätigte Dateiaktionen](visual/tahoe3-finder-fixture/finder-confirmed-actions.png).

## Echte Bildvergleiche

Gleiches Wolkenwallpaper, deterministische Testzeit und ausschließlich öffentliche synthetische Notiz-/Aufgabentitel. Keine Bilder künstlich nachgezeichnet. Originale GTK/QML-Laufzeit hier nicht ausgeführt, keine1:1-Pixelgleichheit behauptet.

| App / Renderer | Vorher | Nachher |
|---|---|---|
| finder · 1920 | ![Vorher](visual/tahoe3-before/finder-1920.png) | ![Nachher](visual/tahoe3-after/finder-1920.png) |
| notes · 1920 | ![Vorher](visual/tahoe3-before/notes-1920.png) | ![Nachher](visual/tahoe3-after/notes-1920.png) |
| reminders · 1920 | ![Vorher](visual/tahoe3-before/reminders-1920.png) | ![Nachher](visual/tahoe3-after/reminders-1920.png) |
| calendar · 1920 | ![Vorher](visual/tahoe3-before/calendar-1920.png) | ![Nachher](visual/tahoe3-after/calendar-1920.png) |
| music · 1920 | ![Vorher](visual/tahoe3-before/music-1920.png) | ![Nachher](visual/tahoe3-after/music-1920.png) |
| finder · 1650 | ![Vorher](visual/tahoe3-before/finder-1650.png) | ![Nachher](visual/tahoe3-after/finder-1650.png) |
| notes · 1650 | ![Vorher](visual/tahoe3-before/notes-1650.png) | ![Nachher](visual/tahoe3-after/notes-1650.png) |
| reminders · 1650 | ![Vorher](visual/tahoe3-before/reminders-1650.png) | ![Nachher](visual/tahoe3-after/reminders-1650.png) |
| calendar · 1650 | ![Vorher](visual/tahoe3-before/calendar-1650.png) | ![Nachher](visual/tahoe3-after/calendar-1650.png) |
| music · 1650 | ![Vorher](visual/tahoe3-before/music-1650.png) | ![Nachher](visual/tahoe3-after/music-1650.png) |
| finder · 390 | ![Vorher](visual/tahoe3-before/finder-390.png) | ![Nachher](visual/tahoe3-after/finder-390.png) |
| notes · 390 | ![Vorher](visual/tahoe3-before/notes-390.png) | ![Nachher](visual/tahoe3-after/notes-390.png) |
| reminders · 390 | ![Vorher](visual/tahoe3-before/reminders-390.png) | ![Nachher](visual/tahoe3-after/reminders-390.png) |
| calendar · 390 | ![Vorher](visual/tahoe3-before/calendar-390.png) | ![Nachher](visual/tahoe3-after/calendar-390.png) |
| music · 390 | ![Vorher](visual/tahoe3-before/music-390.png) | ![Nachher](visual/tahoe3-after/music-390.png) |

[Mehrere Apps gleichzeitig](visual/tahoe3-after/multiple-apps.png) · [echter Kalendertermin](visual/tahoe3-finder-fixture/calendar-event.png) · [echte lokale Playlist/Wiedergabe](visual/tahoe3-finder-fixture/music-playlist.png).

## Verbleibende Grenzen

Native Ordnerdialog-/Windows-/macOS-/Hardware-GPU-Abnahmen; bewusste Zuordnung unowned Legacy-Termine/Playlists; Albumcover-/Metadaten- und weitere Codecprüfungen. Keine neue Spotify-Anbindung, NewAmp-Engine, Cloud-/iPad-Veröffentlichung oder Kalender-Cloudsync. Auf kleinen Fenstern vertikales Scrollen weiterhin erforderlich; native Textvergrößerung separat abnehmen. Keine weitere App oder Roadmap begonnen. Nach gesichertem Commit/Push STOP.
