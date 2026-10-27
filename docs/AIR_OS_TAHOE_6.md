# Air-OS Tahoe 6 – Shell Deep Port

Basis **95b79f63e7ad1bf64fb2b985127ed90bd68982b8** (aktueller R2-Abschluss, enthält Tahoe5). Branch **feat/air-os-tahoe-6-deep-port**. 27. Oktober 2026. Produktcheckpoints **ee7cc83610661e67b301623ff2a47db97e91af43** (Port/komplette GUI) und **b2b5e3a550cb6bd687d8c48cb06ff34c6befde78** (begrenzte Async-Statusabsicherung, gezielte Kaltstart-/Widget-/Diagnoseabnahme). Der Dokumentationsabschluss-SHA steht im Abschlussbericht. Keine neue Registry, kein Fenster-/Audio-/Authersatz, keine zusätzlichen Dependencies, kein neuer Build oder Release.

## Tatsächliche Übernahmen und Ausführungspfade

| Quelle | Direkt übernommen / weiterverwendet | Electron-Anpassung und realer Ausführungspfad |
|---|---|---|
| MacShell `MacBar.qml` am Pin `1bdb51870b621100fd2709f66c8f8e00ab17b9c4` | `menuTitles`-Reihenfolge App/File/Edit/View/Window/Help; aktive App aus bestehendem Fokusmodell. Originale `Glyph`-Zeichenbefehle für **search, cc, bell**, unveränderte Pfadkoordinaten. | `air-tahoe6-shell.js` belegt die bereits vorhandene obere Shell; `airTahoe6Glyphs` zeichnet eigene HTML-2D-Canvases bei Einrichtung/Theme-/Forced-Color-Wechsel, ohne Renderloop. Bestehender Such-/Historybutton wird verschoben und behält seinen Handler; für Classic werden Parent, Inhalt, Beschriftung und Titel wiederhergestellt. Keine erfundenen Batterie-/WLANwerte. |
| MacShell `SPopUp.qml` / MacBar-Menümodell | 26px-Auslöser, 6px-Innenraum, 13px-Schrift, Escape/Outside-Close und Popup-Fokus; MacBar-Appmenüstruktur. | Native DOM-Buttons/Menuitems, Pfeile/Home/End, horizontaler Menüwechsel, Hoverwechsel nur bei offenem Menü, Escape stellt Fokus wieder her. Menüzeile28px und Radius12 aus Tahoe. Bei schmalem Platz ist das App-Menü ein zusammengefasstes, scrollbar begrenztes Menü aller Gruppen; Aktionen bleiben erreichbar. Keine Hyprland-/Wayland-Kommandos. |
| Bestehende Air-OS-Controller | Keine neue Implementierung ihrer Datenfunktionen. | Ablage öffnet Finder/Notes/Downloads und **speichert über den vorhandenen Notes-/Reminders-Button**. Bearbeiten verwendet nur das zuletzt fokussierte Nicht-Passwort-Textfeld mit nativen Browser-Undo/Redo/SelectAll. Darstellung öffnet vorhandenes Launchpad/Spotlight/CC/History. Fenster nutzt vorhandenen MRU-/Snap-/M2-/Close-Pfad; Hilfe vorhandenes About. Nicht verfügbare Aktionen deaktiviert. Sperren nutzt den vorhandenen Notes-Schutz/Sessionvertrag. |
| MacShell `MacDock.qml` | Originale Kosinusformel `f=0.5*(1+cos(PI*dist/R))` innerhalb `R=(iconSize+spacing)*2.6`, ursprünglicher Maximalfaktor1.7; originaler Abstand6; finite160ms-OutCubic-Bewegung. | `airTahoe6Math` → Pointer-/Tastaturfokus im bestehenden Dock. **Nur Iconskalierung**, effektives Maximum auf Zellbreite/Iconbreite gekappt, keine QML-Zellverbreiterung. Ein RAF pro anstehendem Pointerupdate, kein Dauerloop. Fokus-/Pressed-/Running-/Minimized-Zustand aus derselben Lifecyclequelle. Existing Kontextmenüs/Pinning/Reihenfolge/M2 bleiben. |
| MacShell `ClockWidget.qml`, bestehende WidgetVisual-/MacWidgets-Ports | Originale dunkle Gradientenstopps `#38393D / #303135 / #242529`; Dialtext64u mit `u=min(W,H)/158` und .94/1.14-Streckung. Bestehende Kalender-/Tick-/Größenalgorithmen aus Tahoe4 weiterverwendet. | Vorhandener Widgetmanager/View: Dialschrift erhält die original berechnete Größe. Today bleibt die **echte** bestehende Zeit/Datum/Reminder-/Schnellaktionsdarstellung, jetzt dichtes Zweispaltenlayout. Kalenderdatumsflächen zentriert, keine breiten ovalen Tagespillen. Der kompakte390px-Kalender lässt nur den redundanten Footer weg: alle42 Datumsaktionen öffnen weiter die Kalender-App, Monatsnavigation und CC-Kalenderaktion bleiben. |
| MacTahoe GTK, bestehender Pin `1e45e19f510edb8cde18fa84d6cd5319f60b086b` | Bereits originale `air-tahoe.css`-Tokens: Header#333/Base#242424/Workspace#f8f7f3,4px-Raster,28px-Menüzeile,6/8/12px-Radien,100/150ms-Zeiten. | Gemeinsame Schicht wird nach den Desktop-Styles geladen; einheitlichere Titel-/Toolbar-/Sidebar-/Listen-/Suchhierarchie, aktive/inaktive Header, Spotlight/Launchpad/CC-Menüradien. Keine zusätzlichen Appcontroller. Finder/Notes/Reminders/Kalender/Musik/Settings verwenden weiter dieselben Daten-/Fensterpfade. |
| MacTahoe Icons, Pin `839848b9a8a38a92a6936e30c4abe35cc6f2546d`, GPL-3.0 | Bestehende **14 unveränderte Original-SVGs** und zentrales Mapping, zusätzlich im bisher generischen Fenster-Titelicon und Finder-Leerzustand verwendet. | Ein CSS-Pseudoicon aus dem vorhandenen Mapping pro vorhandenem Fenster; keine Registrykopie. Richtiger Notiz-/Musik-/Finder-/Settings-Titel statt generischem blauem Ordner. Finder-Leerzustand zeigt Originalfolder statt Emoji. Classic erhält seine bisherige Darstellung zurück. |
| GLASS-3 / MacShell-Shaderpipeline | Bestehende `liquidglass`, `dockglass`, `contourglow` und Ressourcenverträge unverändert. | Neue Menüs tragen bereits unterstützte `.deep-dock-menu`-Klasse; deshalb keine Änderung der Engine nötig. Normaler erkannter Softwarepfad bleibt CSS, Hardwarezweig unverändert. Refraction bleibt **Wallpaper-only**; keine Fenster-/Systemaufnahme. |

**Quellen/Lizenzen:** [Originalauszüge, Hashes und Portgrenzen](../third_party/tahoe6/provenance.json), [MIT-Copyright](../third_party/tahoe6/LICENSE), [NOTICE](../third_party/tahoe6/NOTICE); bestehende [Tahoe-Pins und GPL-Herkunft](../third_party/tahoe/provenance.json) samt COPYING/AUTHORS/NOTICE unverändert. Acht kleine Originalauszüge statt ungenutzter QML-Kopien. Keine Apple-Logos, privaten Dateien oder fremden Medien hinzugefügt. Vergleich gegen fixierte Originalwerte; Quickshell-Originaloberfläche hier nicht als gleich große Referenz ausgeführt. Keine Pixelgleichheit behauptet.

## Geometrie, Verhalten und Schutzgrenzen

Die bestehende Dockhülle bleibt gerade bei bottom0 und besitzt dieselben konkaven Masken. Der Originalabstand6 ersetzt3; horizontales Padding10 wird auf2.5 kompensiert. **Außen325×62** bleibt erhalten, Icons/Apps bleiben in derselben Reihenfolge, Buttons behalten ihre Größe. Originalpeak1.7 wird bewusst nicht als volle Zellmagnifikation verwendet, weil das die verbindliche Hülle und M2-Ziele verändern würde. Die tatsächliche Kurve läuft sichtbar auf den Iconflächen.

Die zentrale Island/M1 bleibt im bisherigen Desktopkontext. Neue Systemmenüs besitzen eine eigene begrenzte Overlayebene, ohne Fenster-Z-Ownership zu übernehmen. Im GUI wurde ein bestehender Konflikt gefunden: Benachrichtigungsbanner lagen über Launchpad/Spotlight. Diese aktiven Root-Popovers und der Kalender liegen nun darüber; beim geöffneten Islandpanel werden Banner vorübergehend unter den Desktopkontext geschichtet. Die asynchron erstellte vorhandene History-Schaltfläche wird auch bei langsamem IPC übernommen; kein zweiter Statusdienst entsteht. **Daten, History, Timer und kritische Events bleiben beim bestehenden Dienst**, kein Notificationstore wird geleert oder dupliziert. Direkter Renderer-Hittest prüft die Bedienbarkeit des CC bei gleichzeitig erzeugten Meldungen.

Nur die zentrale Island bleibt dauerhaft obere Uhr. Das Widget darf zusätzlich Zeit/Datum zeigen. Titel-/Icon-/Menütexte werden aus der Registry gelesen; kein privater Profilinhalt in Symbolcanvases. Eventlistener/Pointer-RAF werden bei Pagehide/Profilwechsel beendet, Popup und Editierreferenz entfernt. Notes-, Datei-, Playlist- und Kalenderdaten weder migriert noch anders zugeordnet. Main/Preload/Auth, Dockform-/M1-/M2-Code, MacLock, Cloud und R2-Workflows bleiben unverändert. Keine Cloudanmeldung, keine PWA-Veröffentlichung.

## Tests und tatsächliche Plattformgrenzen

**448/448 Tests bestanden,0Fehler/Skips;214 Laufzeitressourcen validiert, PWA mit202 Assets gebaut.** Neuer Status-Bootstraptest prüft eine verspätet eintreffende History-Schaltfläche, einmalige Übernahme und Originalinhalts-/Classic-Erhaltung; der begrenzte Beobachter endet bei Erfolg/Logout. Neue Regressionen prüfen Kosinus/Radien/Grenzen, Clockformel, Original-/Glyphfragmenthashes, echte Canvas-Pfade/Forced-Color-Ink, Adaptercleanup/Ownership und Überlagerungspolicy. Sämtliche bisherigen439 Tests bleiben bestehen.

Echte sandboxed Linux-x64-Electron44.9.3-Läufe mit1920×1080,1650×930 und390×600: zwei Profile, Login/Fehler/Logout/Neustart, bestehende Apps und Persistenz, Classic/Modern/Reduced Motion, M1/M2-Reverse, WebGL1+2-Ausfall, MRU/Snap und echter lokaler Wavtransport samt Widget/CC/Island. Zusätzliche T6-Prüfungen: Appmenü/Escape/Horizontalnavigation, **Notes speichern durch Menü mit anschließendem Main-Store-Vergleich**, Hovertransform und unveränderte Shellrechtecke, CC-Hittest bei Toasts und kompakter Kalender ohne unnötigen Scroll. Bei390 bleibt ein virtueller schmaler Renderer mit nativer Mindestfensterbreite760; keine physische390px-Touch-/iPad-Abnahme. Es kommen reale CDP-Maus-/Tastaturereignisse zum Einsatz, keine direkten Handlerersatz-Mocks.

Isolierte integrierte GL-Diagnose separat gekennzeichnet: SwiftShader, Context Loss/Restore, Reduced Glass/Transparency/Forced Colors/Motion, Idle und Logoutcleanup. **Kein Hardware-GPU-/Windows-/macOS-Nachweis für Tahoe6**. R2 bleibt der separat geprüfte Tahoe5-Windowsinstaller. Keine neue60fps- oder Live-Backdropbehauptung. Anfängliche abgebrochene Testversuche (Präferenzschema, Überlagerung, schmaler Kalender) wurden korrigiert/archiviert, nicht als Erfolg gezählt.

## Bewusst offen

- Kein vollständiger MacShell-Port: native Netz-/Bluetooth-/Display-/Batterieadapter, komplette MacBar-Untermenüs, zusätzliche Dockvorschauen und Widgetdesigns bleiben getrennte Aufgaben.
- Wetter bleibt ohne autorisierte Quelle sichtbar nicht verfügbar; kein Standortzugriff und keine erfundenen Werte. Musik-/Coverdaten nur aus dem bestehenden realen Transport.
- Today ist ein Air-OS-Informationslayout, keine Behauptung einer1:1-Kopie des reinen Originaluhrwidgets. Einige Originalparameter stehen als Vergleichswerte im Mathematikmodul, ersetzen aber nicht GLASS-3-Uniforms.
- Keine zusätzlichen Iconimporte, Shaderdurchgänge, Lockscreen-/Audioänderungen. Bestehende Legacy-Untermenüs außerhalb der neuen Menübrücke wurden nicht vollständig neu portiert.
- Native DPI/Pointer/Touch, Windows/macOS und physische GPU müssen den neuen Stand separat abnehmen. Für PWA wurde der Build geprüft, keine neue Safari-/iPad-Hardwareabnahme oder Veröffentlichung.

## Echte Vorher-/Nachherbilder

Identisches normales Wolkenwallpaper und dieselben synthetischen lokalen Szenarien. Die Uhren zeigen echte Laufzeit und deshalb unterschiedliche Minuten; Notes-Inhalt nachher belegt zusätzlich den neuen Menü-Speicherpfad. Keine künstlich nachgezeichneten Bilder. Software-GPU/CSS-Produktpfad; Diagnosebilder ausdrücklich separat.


Messwerte vor/nach identisch: Dock325×62/bottom0 in allen Größen; Island220×40 bei1920,189.078×36 bei1650,144×36 bei390, jeweils top0. Reine Widgetansichten im Kaltstart zeigen beide Widgets ohne Scroll: Content/Client121/121 (Today) und130/130 (Kalender) auf großen Flächen,112/112 jeweils bei390. Shaderdiagnose:3→0→3 Programme bei Loss/Restore,0 zusätzliche Draws/700ms Ruhe. Kein Hardwarebeleg.

Rohbelege: [Gesamtabnahme vorher](visual/tahoe6-before/r1-gui-report.json), [Gesamtabnahme nachher](visual/tahoe6-after/r1-gui-report.json), [Widgets vorher](visual/tahoe6-widgets-before/widget-report.json)/[nachher](visual/tahoe6-widgets-after/widget-report.json), [isolierte Diagnose](visual/tahoe6-diagnostic/report.json), [alle Bild-/Quellhashes und Zuschnittkoordinaten](visual/tahoe6-evidence.json).

### 1920 Pixel

| Bereich | Vorher | Nachher |
|---|---|---|
| Desktop gesamt | ![Vorher Desktop gesamt 1920](visual/tahoe6-before/t6-desktop-1920.png) | ![Nachher Desktop gesamt 1920](visual/tahoe6-after/t6-desktop-1920.png) |
| Dock | ![Vorher Dock 1920](visual/tahoe6-before/r1-dock-1920.png) | ![Nachher Dock 1920](visual/tahoe6-after/r1-dock-1920.png) |
| Menü-/Statusleiste | ![Vorher Menü-/Statusleiste 1920](visual/tahoe6-before/bar-detail-1920.png) | ![Nachher Menü-/Statusleiste 1920](visual/tahoe6-after/bar-detail-1920.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 1920](visual/tahoe6-before/t6-control-1920.png) | ![Nachher Kontrollzentrum 1920](visual/tahoe6-after/t6-control-1920.png) |
| Notizen | ![Vorher Notizen 1920](visual/tahoe6-before/r1-notes-1920.png) | ![Nachher Notizen 1920](visual/tahoe6-after/r1-notes-1920.png) |
| Finder und zweites Fenster | ![Vorher Finder und zweites Fenster 1920](visual/tahoe6-before/t6-apps-1920.png) | ![Nachher Finder und zweites Fenster 1920](visual/tahoe6-after/t6-apps-1920.png) |
| Spotlight | ![Vorher Spotlight 1920](visual/tahoe6-before/deep-spotlight-1920.png) | ![Nachher Spotlight 1920](visual/tahoe6-after/deep-spotlight-1920.png) |
| Mitteilungen | ![Vorher Mitteilungen 1920](visual/tahoe6-before/deep-notifications-1920.png) | ![Nachher Mitteilungen 1920](visual/tahoe6-after/deep-notifications-1920.png) |
| Widgetspalte, eigener unbedeckter Kaltstart | ![Widgets vorher 1920](visual/tahoe6-before/widgets-detail-1920.png) | ![Widgets nachher 1920](visual/tahoe6-after/widgets-detail-1920.png) |

[Neues Appmenü](visual/tahoe6-after/t6-menu-1920.png) · [Dock-Magnifikation im echten Hover](visual/tahoe6-after/dock-hover-detail-1920.png) · [CC-Hittest mit laufenden Mitteilungen](visual/tahoe6-after/t6-control-live-1920.png).

### 1650 Pixel

| Bereich | Vorher | Nachher |
|---|---|---|
| Desktop gesamt | ![Vorher Desktop gesamt 1650](visual/tahoe6-before/t6-desktop-1650.png) | ![Nachher Desktop gesamt 1650](visual/tahoe6-after/t6-desktop-1650.png) |
| Dock | ![Vorher Dock 1650](visual/tahoe6-before/r1-dock-1650.png) | ![Nachher Dock 1650](visual/tahoe6-after/r1-dock-1650.png) |
| Menü-/Statusleiste | ![Vorher Menü-/Statusleiste 1650](visual/tahoe6-before/bar-detail-1650.png) | ![Nachher Menü-/Statusleiste 1650](visual/tahoe6-after/bar-detail-1650.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 1650](visual/tahoe6-before/t6-control-1650.png) | ![Nachher Kontrollzentrum 1650](visual/tahoe6-after/t6-control-1650.png) |
| Notizen | ![Vorher Notizen 1650](visual/tahoe6-before/r1-notes-1650.png) | ![Nachher Notizen 1650](visual/tahoe6-after/r1-notes-1650.png) |
| Finder und zweites Fenster | ![Vorher Finder und zweites Fenster 1650](visual/tahoe6-before/t6-apps-1650.png) | ![Nachher Finder und zweites Fenster 1650](visual/tahoe6-after/t6-apps-1650.png) |
| Spotlight | ![Vorher Spotlight 1650](visual/tahoe6-before/deep-spotlight-1650.png) | ![Nachher Spotlight 1650](visual/tahoe6-after/deep-spotlight-1650.png) |
| Mitteilungen | ![Vorher Mitteilungen 1650](visual/tahoe6-before/deep-notifications-1650.png) | ![Nachher Mitteilungen 1650](visual/tahoe6-after/deep-notifications-1650.png) |
| Widgetspalte, eigener unbedeckter Kaltstart | ![Widgets vorher 1650](visual/tahoe6-before/widgets-detail-1650.png) | ![Widgets nachher 1650](visual/tahoe6-after/widgets-detail-1650.png) |

[Neues Appmenü](visual/tahoe6-after/t6-menu-1650.png) · [Dock-Magnifikation im echten Hover](visual/tahoe6-after/dock-hover-detail-1650.png) · [CC-Hittest mit laufenden Mitteilungen](visual/tahoe6-after/t6-control-live-1650.png).

### 390 Pixel

| Bereich | Vorher | Nachher |
|---|---|---|
| Desktop gesamt | ![Vorher Desktop gesamt 390](visual/tahoe6-before/t6-desktop-390.png) | ![Nachher Desktop gesamt 390](visual/tahoe6-after/t6-desktop-390.png) |
| Dock | ![Vorher Dock 390](visual/tahoe6-before/r1-dock-390.png) | ![Nachher Dock 390](visual/tahoe6-after/r1-dock-390.png) |
| Menü-/Statusleiste | ![Vorher Menü-/Statusleiste 390](visual/tahoe6-before/bar-detail-390.png) | ![Nachher Menü-/Statusleiste 390](visual/tahoe6-after/bar-detail-390.png) |
| Kontrollzentrum | ![Vorher Kontrollzentrum 390](visual/tahoe6-before/t6-control-390.png) | ![Nachher Kontrollzentrum 390](visual/tahoe6-after/t6-control-390.png) |
| Notizen | ![Vorher Notizen 390](visual/tahoe6-before/r1-notes-390.png) | ![Nachher Notizen 390](visual/tahoe6-after/r1-notes-390.png) |
| Finder und zweites Fenster | ![Vorher Finder und zweites Fenster 390](visual/tahoe6-before/t6-apps-390.png) | ![Nachher Finder und zweites Fenster 390](visual/tahoe6-after/t6-apps-390.png) |
| Spotlight | ![Vorher Spotlight 390](visual/tahoe6-before/deep-spotlight-390.png) | ![Nachher Spotlight 390](visual/tahoe6-after/deep-spotlight-390.png) |
| Mitteilungen | ![Vorher Mitteilungen 390](visual/tahoe6-before/deep-notifications-390.png) | ![Nachher Mitteilungen 390](visual/tahoe6-after/deep-notifications-390.png) |
| Widgetspalte, eigener unbedeckter Kaltstart | ![Widgets vorher 390](visual/tahoe6-before/widgets-detail-390.png) | ![Widgets nachher 390](visual/tahoe6-after/widgets-detail-390.png) |

[Neues Appmenü](visual/tahoe6-after/t6-menu-390.png) · [Dock-Magnifikation im echten Hover](visual/tahoe6-after/dock-hover-detail-390.png) · [CC-Hittest mit laufenden Mitteilungen](visual/tahoe6-after/t6-control-live-390.png).

145 echte PNG-Dateien inklusive unverfälschter Ausschnitte; Ursprung und Pixelrechtecke im Manifest. Diagnose: [Kontextverlust](visual/tahoe6-diagnostic/context-loss-css-fallback.png), [Restore](visual/tahoe6-diagnostic/context-restored.png), [Reduced Motion](visual/tahoe6-diagnostic/switcher-reduced-motion.png).

Reproduktion: `node scripts/run-test-gate.cjs`; `node scripts/windows-test-build.cjs validate`; `npm run build:pwa`. GUI: `scripts/check-tahoe6.cjs` mit `AIR_GUI_TEST_ISOLATED=1`, tatsächlichem `AIR_R1_EXE`, getrenntem `AIR_R1_APP`/`AIR_R1_OUTPUT`, X11/Xvfb; `AIR_TAHOE6_WIDGETS_ONLY=1` für den kurzen dedizierten Kaltstart-/Widgetvergleich. Vorher aus separatem unverändertem Checkout der genannten Basis, Nachher aus dem Featurebranch. Native Folder-/Consent-/Audioausgabe nicht simuliert als Abnahme ausgegeben. STOP nach gesichertem Abschluss.
