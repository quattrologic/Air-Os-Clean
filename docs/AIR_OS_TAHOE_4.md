# AIR-OS Tahoe 4 – gemeinsamer Desktop-Port

26. Oktober 2026. Basis **b17b45a8d81bf7a6b12fd01e854e195c3ff9601b** (`feat/air-os-tahoe-3-apps`), Branch **feat/air-os-tahoe-4-desktop**. Erster Produktcheckpoint **2111a0e146e6600f0ed3768c617f0efe0738fc31**, geprüfte Korrekturen **a60b12bff10b0d0d45208eea4bbcc66971ca548d**. Weitere geprüfte Korrekturen und Dokumentationsabschluss stehen in der Branch-Historie; kein Commit nimmt seinen eigenen SHA vorweg.

## Tatsächlich integriert

| Bereich | Realer Air-OS-Ausführungspfad | Grenze |
|---|---|---|
| Widgetgalerie | Bestehende Island → Widgets: sieben Typseiten, Hinzufügen/Entfernen, drei Größen, digitale Tagesübersicht/Zifferblatt. Bestätigte Preferences-Writes, Größen und Positionen nach Prozessneustart wiederhergestellt. | Eine Instanz je Typ. Keine zusätzliche Desktop-Shell oder Datenbank. |
| Raster und Bedienung | `src/core/desktop-widgets.js` → vorhandener Manager in `air-deep-desktop.js`; Kollisionstest, nächster freier Platz, Dock-Schutz, tastaturbedienbare Header. Schmale Displays mit Widgetseiten. | Automatische Platzsuche bevorzugt links statt original rechts. Bestehende manuelle 8px-Bewegung bleibt; keine identische QML-Bearbeitungsszene. |
| Heute/Uhr | Bestehender Today-/Reminders-Dienst, Datum, Tagesleiste, echte nächste offene Erinnerung und Appaktionen. Wahlweise echtes MacShell-Rechteckzifferblatt mit 60 berechneten Strichen. | Digitales Zifferblatt, keine analogen Zeiger. Vorhandener sichtbarkeitsgebundener 15s-Takt statt originaler permanenter 33ms-Schleife. |
| Kalender | Bestehender profilgebundener Kalenderdienst → Monatsraster, Monatswechsel, Datum, vorhandene Termine in größeren Widgets; Tageswahl öffnet/selektiert denselben Tag in der bestehenden App. | Kleine/mittlere Karte zeigt Monatsraster und Appöffner, keine gequetschten Termintexte. Unzugeordnete Legacy-Termine bleiben unverändert und werden nicht übernommen. |
| Notizen/Reminders | Bestehende authentifizierte APIs → Titelprojektionen, bestätigte Änderungsereignisse, Fehler/Retry, Appaktionen. Keine Notiztexte oder Beschreibungen in Widgetmodellen. | Bearbeiten erfolgt in bestehenden Apps. Keine Markdown-Zweitablage aus `ExtraWidgets.qml`. |
| Now Playing | `airMusic.transport` delegiert an dieselbe vorhandene Amplitude-Instanz: echter Titel/Künstler/Fortschritt, Play/Pause, Skip bei mehreren Titeln. Widget und Kontrollzentrum konsumieren denselben Transport. | Keine zweite Audioengine, keine Spotify-/MPRIS-Behauptung. Vorhandene Metadatenquelle liefert derzeit kein Cover; keine erfundene Albumgrafik. Lokale Dateien nach Neustart wie bisher erneut auswählen. |
| Bild | Expliziter Dateiauswahleingang, PNG/JPEG/WebP bis 2MiB, lokal im authentifizierten Preferences-Store gespeichert; Hauptprozess erlaubt nur begrenzte Raster-Data-URIs. | Keine automatischen Datei-/Ordner-/Netzzugriffe. Keine fremden Bilder oder Fotoarchive übernommen. |
| Wetter | Ehrliche nicht verfügbare Karte/Galerie. | Kein Anbieter, keine Orts-/IP-Abfrage, keine Fantasiedaten; kein vollständiger `WeatherWidget.qml`-Port. |
| Kontrollzentrum | Bestehender Zwölfkatalog und Vier-Spalten-First-Fit samt Seiten/Editor bleiben. Gemeinsame echte Musikaktionen und kurze Unterseitenübergänge ergänzt. Fokus, Darstellung und vorhandene Keep-Awake-Bridge bleiben zuständig. | Keine OS-Lautstärke/WLAN/Bluetooth/Helligkeit vorgetäuscht. Keep Awake im isolierten Testhost absichtlich nicht aktiviert; vorhandene Main-Lebenszyklusregressionen bleiben erhalten. |
| Spotlight | Bestehende Registry-/Notes-/Dateisuche und Rechnerlogik. Sitzung vor/nach asynchronen Reads geprüft, Auswahl bleibt bei nachladenden Ergebnissen stabil, aktive Option semantisch markiert. Originalnahe Ergebnis-Einblendung. | Dateiresultate nur aus Main-freigegebenen Ordnern. Sie selektieren die Datei im Finder; Enter öffnet sie über vorhandene Dateiaktionen. Kein neuer Index. |
| Dock | Bestehende Aktionen erweitert um bestätigtes Pinning und interne Fensterübersicht; tatsächliche Lifecycle-Anzeige, minimierte Apps mit hohlem Marker. Tastaturkontextmenü und Fokuswiederkehr. | Übersicht zeigt ausschließlich Appname/Icon/Zustand, keine aufgenommenen privaten Fensterinhalte. Kein neues Dock, keine neue Window-Engine, keine M2-Änderung. |
| Mitteilungen | Tatsächliche Notes-/Reminders-/Kalender-Bestätigungen, gemeinsame Tahoe-Appicons, Zeitangaben, Appgruppen, gelesen/entfernen/alles löschen und Banner schließen. Bestehende 60er-Historie/4er-Bannergrenze, Fokusunterdrückung und kritische Ausnahmen. | Kein Betriebssystem-Notification-Listener. Keine privaten Titel/Bodies in der Historie. Nach Logout leer; noch kein persistenter OS-Mitteilungsdienst. |
| Glas | Dieselbe GLASS-3-Engine zeichnet neue Widget-/Systemhosts. Mehrschichtiger dunkler CSS-Fallback, reduzierte Transparenz/Forced Colors berücksichtigt. Context-Restore invalidiert die bestehende Engine wieder. | Weiterhin **Wallpaper-only**; keine privaten Fenstertexturen und keine Bildschirmaufnahme. Kein neuer Shader oder permanenter GPU-Loop. |

## Originalcode, Werte und Lizenzen

MacShell unverändert gepinnt: **1bdb51870b621100fd2709f66c8f8e00ab17b9c4**. [Übernahmemanifest mit Quelldatei-SHA256](../third_party/deep-port/tahoe4-port.json), [MIT / Copyright © 2026 Rickky](../third_party/deep-port/LICENSE). Bestehende MacLock-/Font-OFL-, MacTahoe-MIT- und GPL-Iconnachweise bleiben erhalten. **Keine neuen Drittanbieterassets oder Abhängigkeiten**, vorhandene 14 Tahoe-SVGs/Registry-Zuordnungen weiterverwendet.

| Fixierte Originalquelle | Tatsächliche Übernahme / Electron-Anpassung |
|---|---|
| [MacWidgets.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/MacWidgets.qml#L60) | Numerische Körper von `dims`, `gridInfo`, Überlappung und quadratischer `nearestFreeSlot`-Distanz portiert:185×185,395×185,375×385;179px Zelle,28/23px Lücken,21/56/21/24px Ränder. Browserbreite/78px Dockreserve und linke Platzpräferenz angepasst. Vorhandene Legacy232×180/272×232-Heute-/200×184-Kalenderboxen bleiben bis zur expliziten Galerieauswahl erhalten. |
| [ClockWidget.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/ClockWidget.qml#L334) | `tickGeo`-Strahl-/Kreisschnittrechnung nach SVG portiert;60 Striche,9u inset,5.6u Länge. Keine Neuberechnung ohne relevante Zeit-/Größenänderung. |
| [WidgetVisual.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/WidgetVisual.qml), [CalendarWidget.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/CalendarWidget.qml), [ImageWidget.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/ImageWidget.qml), [PlayerWidget.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/PlayerWidget.qml) | Vorhandene Host-/Größen-/Materialstruktur weitergeführt. Kalender-/Player-/Bilddaten gezielt an bestehende Air-OS-Dienste angeschlossen; kein vollständiges Kopieren dieser QML-Komponenten behauptet. |
| [MacBar.qml](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/MacBar.qml#L1634) | `NotifBody`:340px Breite,min74px,44px Icon,14/15px Insets und Minuten-/Stunden-/Tagesformel tatsächlich übernommen/lokalisiert. Spotlight46px Ergebniszeilen,160ms OutCubic/4px,16ms Staffel bis Index7. Kurze160ms OutCubic-Detailbewegung innerhalb der vorhandenen Island; kein zweiter M1-Ablauf. Bestehender Originalkatalog/First-Fit/Glyphenport bleibt. |
| [liquidglass.frag](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/liquidglass.frag), [dockglass.frag](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/dockglass.frag), [contourglow.frag](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/MacShell/contourglow.frag) | Bestehende drei GLASS-3-ES300-Programme weiterverwendet, keine erneute Shaderkopie. Normale SwiftShader-Erkennung bleibt CSS; separat gekennzeichneter Diagnosehost prüft reale integrierte Programme/Canvas, kein Hardwarebeleg. |

MacShell/QML war hier nicht als Originaloberfläche ausführbar. Vergleich gegen fixierte Quelldateien und Originalwerte; **keine Pixelgleichheit**. Unterschiede: Air-OS-Islandhülle, bestehende Paging-/Radienvorgabe, linke Rasterpräferenz, eine Instanz/Typ, reduzierte Tickrate und native Browsercontrols. Originale Spring-/Glyph-Morphs, große Player-Cover/Lyrics, Mehrfachinstanzen und volle Wetterkomponente bleiben offen.

## Sicherheit und geprüfte Grenzen

Widgets lesen nur bei aktivierter sichtbarer Modern-Ansicht. Sitzungskennung und Requestversion vor/nach Datenreads; Profile/Logout/Pagehide entsorgen Modelle, ausgewähltes Bild, Widgets, Timer, Listener und Mitteilungsverlauf. Bilder nur nach ausdrücklicher Auswahl; keine Passwort-/Profilgeheimnisse in Canvas, Logs oder Screenshots. Testprofile, WAV, Rasterbild und Textdatei sind ausschließlich erzeugte öffentliche Testdaten. Kein Supabase-Login oder privates Laptopverzeichnis.

Lokale alte Kalender-/Playlistkeys weder gelöscht noch still zugeordnet. Main-/Preload-Authentifizierungs-/Dateirechtegrenzen, Dock-Pinning und App-Registry bleiben maßgeblich. Keine Cloud-/PWA-/Installer-/Signierungslogik geändert; nur additive Frontend-Assets in der vorhandenen Paket-Allowlist und validierte Preferences-Felder. Kein Deployment, kein Release, keine main-/PR-Änderung.

## Tests und Messwerte

- **419/419 Tests**,0Fehler/Skips: alle407 bisherigen plus12 gezielte Regressionen. Originalmaße/Kollisionen/60Ticks/Paging, streng begrenzte Preferences, zwei Profile/Neustart, Datenprojektionen/Fehler/Retry/stale Replies/Logout und ein echter gemeinsamer Musiktransport-Vertrag.
- **192 Runtime-Ressourcen/Syntax**, PWA-Build **181 erlaubte Assets**. Keine Safari-/iPad-Veröffentlichung oder neue Windowsbuild-Abnahme.
- Echte sandboxed **Linux-x64 Electron44.9.3**, Xvfb, DPR1, SwiftShader.1920×1080,1650×930 sowie390×600-Renderer mit nativer Fenstergrößenanpassung soweit möglich;390px ist **kein physisches/natives390px-Display**. Testuhr nur für reproduzierbare Bilder fixiert, kein FPS-Nachweis.
- Galerieklicks für alle sieben Typen,375×385-Großuhr/60SVG-Striche, bestätigte Keyboardposition; echte Notes/Reminders/Kalenderdaten; explizites Rasterbild decodiert; erzeugtes WAV über vorhandene Engine abgespielt und im Widget pausiert. Alle12 Kontrollkacheln über Seiten/Editor erreichbar, Fokusmodus unterdrückt normale Banner und erhält Verlauf, gelesen/entfernen; minimiertes Notes über echte Dock-Fensterübersicht wiederhergestellt. Reload und kompletter Prozessneustart erhalten Auswahl/Größen/Positionen/Bild; zweites Profil erhält keine dieser Daten.
- Spotlight: echter Main-Ordnergrant auf isoliert erzeugten Fixture-Ordner, echte relative Datei-/Notiztreffer, Enter im Finder liest Text, Rechner20, Registry-Appfokus ohne Duplikat, zweites Profil ohne fremde Treffer. **Nur der native Ordnerpicker wird im bereits bestehenden, streng geschützten Nichtversand-Testhost ersetzt**; kein erfolgreicher nativer Dialog behauptet.
- Vollständiger bestehender App-/Zwei-Profil-/Logout-/Neustart-/Classic-/M1-/M2-Reverse-/Reduced-Motion-/WebGL-Ausfalllauf erneut bestanden. WebGL1 **und**2 ohne Kontext im echten Fallbackhost. Bestehende Tahoe-3-Fünfapp-/Rechte-/Legacytests erhalten.
- Dock vor/nach in allen drei Ansichten **325×62px**, bottom=Viewporthöhe; Island1920/1650 **220×40px**,390 **144×36px**,top0. Rechtecke vor/nach exakt gleich; Masken/CSS der Dockform und M1/M2 unverändert.
- Isolierte reale GL-Diagnose390: drei Programme/eine Textur aktiv; Reduce Glass oder Context Loss gibt alle Programme/Texturen frei, Context Restore stellt denselben Pfad wieder her; **0 zusätzliche Draws in700ms** Ruhe. Messwerte inklusive Zeichnen/Transferzeiten im JSON; kein60fps-Versprechen. Softwarediagnose braucht bis ca.995ms kumulierte Paint-Walltime – keine Hardwareleistungsfreigabe.
- Beim ersten Klick unmittelbar nach einer Größenänderung ignorierte Xvfb teilweise einen Pointerklick. Der letzte Durchlauf protokolliert die tatsächlich benötigten Klickaktionen getrennt von den4 Widgetseiten; nicht als5 Seiten ausgegeben. Separater gesetzter Layoutzustand prüft jede der vier Seiten per Assertion. Der CDP-Mausdrag verlor Pointer-Capture; echter X11-XTest-Drag bestätigte dagegen gespeicherte Position und kollisionsfreie Boxen. Kein CDP-Drag-Erfolg behauptet. Native Touch-/Resize-Rennen bleiben Hardware-Prüfpunkt.
- GitHub-PR-/Actions-API weiterhin **403 Forbidden**; Remote-Refs lesbar, kein CI-Erfolg behauptet. Native Windows/macOS/Safari/Hardware-GPU-/Code-Signing-Abnahmen bleiben offen.

Rohbelege: [Vorher](visual/tahoe4-before/report.json), [Nachher](visual/tahoe4-after/report.json), [echte Daten/Neustart](visual/tahoe4-integrated/report.json), [Native Maus/Widgetseiten](visual/tahoe4-pages/report.json), [Spotlight-Dateirechte](visual/tahoe4-search/report.json), [WebGL/Cleanup](visual/tahoe4-diagnostic/report.json), [Bestandsregression](visual/tahoe4-regression/r1-gui-report.json). Testlauncher: `scripts/check-tahoe4*.cjs`; bestehender `scripts/check-tahoe2-regression.cjs` für vollständige gemeinsame Regression, temporäre isolierte Profile, Sandbox erhalten.

## Echte Vorher-/Nachherbilder

Gleiche Wolkenwallpaper-/Zeit-/Appfixtures. Vorher ist der unveränderte Tahoe-3-Commit; Nachher derselbe Standardszenenlauf auf Tahoe4. Weitere konfigurierte Widgetansichten zeigen explizit zusätzliche Auswahl/Größen und sind entsprechend gekennzeichnet. Alle Bilder stammen aus Electron, keine nachgezeichneten Oberflächen.

### 1920×1080 – regulärer Software-/CSS-Pfad

| Szene | Vorher | Nachher |
|---|---|---|
| Gesamter Desktop | ![Vorher Gesamter Desktop 1920](visual/tahoe4-before/desktop-1920.png) | ![Nachher Gesamter Desktop 1920](visual/tahoe4-after/desktop-1920.png) |
| Mehrere Tahoe-Fenster | ![Vorher Mehrere Tahoe-Fenster 1920](visual/tahoe4-before/apps-1920.png) | ![Nachher Mehrere Tahoe-Fenster 1920](visual/tahoe4-after/apps-1920.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 1920](visual/tahoe4-before/control-1920.png) | ![Nachher Kontrollzentrum 1920](visual/tahoe4-after/control-1920.png) |
| Widget-Einstieg | ![Vorher Widget-Einstieg 1920](visual/tahoe4-before/gallery-1920.png) | ![Nachher Widget-Einstieg 1920](visual/tahoe4-after/gallery-1920.png) |
| Spotlight | ![Vorher Spotlight 1920](visual/tahoe4-before/spotlight-1920.png) | ![Nachher Spotlight 1920](visual/tahoe4-after/spotlight-1920.png) |
| Mitteilungsverlauf | ![Vorher Mitteilungsverlauf 1920](visual/tahoe4-before/notifications-1920.png) | ![Nachher Mitteilungsverlauf 1920](visual/tahoe4-after/notifications-1920.png) |

### 1650×930 – regulärer Software-/CSS-Pfad

| Szene | Vorher | Nachher |
|---|---|---|
| Gesamter Desktop | ![Vorher Gesamter Desktop 1650](visual/tahoe4-before/desktop-1650.png) | ![Nachher Gesamter Desktop 1650](visual/tahoe4-after/desktop-1650.png) |
| Mehrere Tahoe-Fenster | ![Vorher Mehrere Tahoe-Fenster 1650](visual/tahoe4-before/apps-1650.png) | ![Nachher Mehrere Tahoe-Fenster 1650](visual/tahoe4-after/apps-1650.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 1650](visual/tahoe4-before/control-1650.png) | ![Nachher Kontrollzentrum 1650](visual/tahoe4-after/control-1650.png) |
| Widget-Einstieg | ![Vorher Widget-Einstieg 1650](visual/tahoe4-before/gallery-1650.png) | ![Nachher Widget-Einstieg 1650](visual/tahoe4-after/gallery-1650.png) |
| Spotlight | ![Vorher Spotlight 1650](visual/tahoe4-before/spotlight-1650.png) | ![Nachher Spotlight 1650](visual/tahoe4-after/spotlight-1650.png) |
| Mitteilungsverlauf | ![Vorher Mitteilungsverlauf 1650](visual/tahoe4-before/notifications-1650.png) | ![Nachher Mitteilungsverlauf 1650](visual/tahoe4-after/notifications-1650.png) |

### 390×600 – regulärer Software-/CSS-Pfad

| Szene | Vorher | Nachher |
|---|---|---|
| Gesamter Desktop | ![Vorher Gesamter Desktop 390](visual/tahoe4-before/desktop-390.png) | ![Nachher Gesamter Desktop 390](visual/tahoe4-after/desktop-390.png) |
| Mehrere Tahoe-Fenster | ![Vorher Mehrere Tahoe-Fenster 390](visual/tahoe4-before/apps-390.png) | ![Nachher Mehrere Tahoe-Fenster 390](visual/tahoe4-after/apps-390.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 390](visual/tahoe4-before/control-390.png) | ![Nachher Kontrollzentrum 390](visual/tahoe4-after/control-390.png) |
| Widget-Einstieg | ![Vorher Widget-Einstieg 390](visual/tahoe4-before/gallery-390.png) | ![Nachher Widget-Einstieg 390](visual/tahoe4-after/gallery-390.png) |
| Spotlight | ![Vorher Spotlight 390](visual/tahoe4-before/spotlight-390.png) | ![Nachher Spotlight 390](visual/tahoe4-after/spotlight-390.png) |
| Mitteilungsverlauf | ![Vorher Mitteilungsverlauf 390](visual/tahoe4-before/notifications-390.png) | ![Nachher Mitteilungsverlauf 390](visual/tahoe4-after/notifications-390.png) |

## Zusätzliche echte Integration – keine Hardwareabnahme

| Nachweis | Bild |
|---|---|
| Sieben konfigurierte Widgets, echte Testnotiz/Reminder/Kalender/Musik, explizit gewähltes Testbild | ![Sieben konfigurierte Widgets, echte Testnotiz/Reminder/Kalender/Musik, explizit gewähltes Testbild](visual/tahoe4-integrated/desktop-real-data.png) |
| Galerie: Größe und Zifferblatt | ![Galerie: Größe und Zifferblatt](visual/tahoe4-integrated/gallery-large-dial.png) |
| Dockkontext mit echten Aktionen | ![Dockkontext mit echten Aktionen](visual/tahoe4-integrated/dock-menu.png) |
| Fensterübersicht ohne Inhaltsscreenshots | ![Fensterübersicht ohne Inhaltsscreenshots](visual/tahoe4-integrated/window-overview.png) |

![Konfigurierte Widgetspalte – echte öffentliche Testdaten, regulärer CSS-Pfad](visual/tahoe4-integrated/desktop-composition.png)

![Dieselbe Widgetspalte mit mehreren Tahoe-Appfenstern](visual/tahoe4-integrated/desktop-workspace.png)

Großer Kalender mit echtem profilgebundenem Testtermin: [Screenshot](visual/tahoe4-integrated/large-calendar-real-event.png). Mittlere Kalenderkarte separat auf `scrollHeight <= clientHeight + 1` geprüft; alle sechs Wochen ohne Clipping. Widgetseiten390: [1](visual/tahoe4-pages/page-1.png), [2](visual/tahoe4-pages/page-2.png), [3](visual/tahoe4-pages/page-3.png), [4](visual/tahoe4-pages/page-4.png). Galerietypen: [Heute](visual/tahoe4-integrated/gallery-clock.png), [Kalender](visual/tahoe4-integrated/gallery-calendar.png), [Notizen](visual/tahoe4-integrated/gallery-notes.png), [Reminders](visual/tahoe4-integrated/gallery-reminders.png), [Musik](visual/tahoe4-integrated/gallery-music.png), [Bild](visual/tahoe4-integrated/gallery-image.png), [Wetterstatus](visual/tahoe4-integrated/gallery-weather.png).

Separat gekennzeichneter Software-WebGL-Diagnosepfad: [aktiv](visual/tahoe4-diagnostic/integrated-diagnostic.png), [reduzierte Transparenz](visual/tahoe4-diagnostic/reduced-transparency.png), [Context Loss/CSS](visual/tahoe4-diagnostic/context-loss-css-fallback.png), [Context Restore](visual/tahoe4-diagnostic/context-restored.png). Keine dieser Aufnahmen gilt als Hardware-GPU-Abnahme.

Weitere echte Screenshots:

| Auflösung | Widgets | Editor | CC | Spotlight | Apps | Mitteilungen |
|---|---|---|---|---|---|---|
| 1920 | [Bild](visual/tahoe4-integrated/desktop-1920.png) | [Bild](visual/tahoe4-integrated/editor-1920.png) | [Bild](visual/tahoe4-integrated/control-1920.png) | [Bild](visual/tahoe4-integrated/spotlight-1920.png) | [Bild](visual/tahoe4-integrated/apps-1920.png) | [Bild](visual/tahoe4-integrated/notifications-1920.png) |
| 1650 | [Bild](visual/tahoe4-integrated/desktop-1650.png) | [Bild](visual/tahoe4-integrated/editor-1650.png) | [Bild](visual/tahoe4-integrated/control-1650.png) | [Bild](visual/tahoe4-integrated/spotlight-1650.png) | [Bild](visual/tahoe4-integrated/apps-1650.png) | [Bild](visual/tahoe4-integrated/notifications-1650.png) |
| 390 | [Bild](visual/tahoe4-integrated/desktop-390.png) | [Bild](visual/tahoe4-integrated/editor-390.png) | [Bild](visual/tahoe4-integrated/control-390.png) | [Bild](visual/tahoe4-integrated/spotlight-390.png) | [Bild](visual/tahoe4-integrated/apps-390.png) | [Bild](visual/tahoe4-integrated/notifications-390.png) |

[Datei-/Notiztreffer](visual/tahoe4-search/real-note-and-file-results.png) · [Rechner](visual/tahoe4-search/calculator.png). [Vollständige Bildliste und Prüfsummen](visual/tahoe4-evidence.json).

## Offene Arbeiten

Native Plattform-/Touch-/GPU-/Pickerabnahmen, tatsächliche Cover-/Metadatenquelle, analoger Zeigermodus, vollständige Original-Widgetstile/Mehrfachinstanzen und freigegebene Wetterquelle bleiben offen. Keine echte OS-Sperre/Benachrichtigungsüberwachung oder aktuelle produktive Releasefreigabe. Historische Audit-/Signierungs-/Legacy-Blocker bleiben bestehen. Nach diesem geprüften Paket STOP.

## Reproduktion und Quellenprüfung

`node --test tests/*.test.cjs`, `node scripts/windows-test-build.cjs validate`, `npm run build:pwa`.

Die GUI-Skripte benötigen einen tatsächlich gestarteten Linux-X11/Xvfb-Server (1920×1080), Node mit WebSocket sowie `AIR_GUI_TEST_ISOLATED=1`, `AIR_R1_APP`=absoluter Repositorypfad, `AIR_R1_EXE`=echtes Linux-Electron-Binary und einen getrennten `AIR_R1_OUTPUT`-Ordner. `check-tahoe4.cjs` nutzt `AIR_TAHOE_REFERENCE=1` nur zum Lauf auf einem separaten unveränderten Basis-Checkout; danach0 auf dem neuen Branch. `check-tahoe4-integrated.cjs` prüft normale Produktpfade. `check-tahoe4-pages.cjs` verwendet echte libX11/libXtst-Eingaben für Drag und CDP nur für Seitenbuttons. `check-tahoe4-search.cjs` benötigt zusätzlich `AIR_TAHOE_TEST_PICKER=1`, dessen vorhandener Nichtversand-Launcher ausschließlich den klar markierten eigenen Fixture-Ordner auswählt. `check-tahoe4-diagnostic.cjs` nur mit `AIR_GLASS_DIAGNOSTIC=1` im schon geschützten Diagnosehost; kein Produktions-Software-GPU-Bypass.

Die einmalig beobachteten fehlgeschlagenen CDP-Drag-/zu frühen Layout-Klickversuche wurden nicht als bestanden gezählt. Der letzte native Draglauf, settled Paging, der korrigierte reale Finder-Selektions-/Enterablauf und die finale Bild-/Kalender-/Neustartprüfung sind getrennt belegt. Frühere Fehler-/Prozesslogs bleiben außerhalb des Versand-/Bildverzeichnisses archiviert. Der Basis-Checkout wurde nicht verändert; nur der eigene neue Branch wird gepusht.
