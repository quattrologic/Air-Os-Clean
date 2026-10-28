# Air-OS System Evolution1

Basis `d6af14b2089db5f35386da2969d13b4e558d8fba`; Branch `feat/air-os-system-evolution-1`. Geprüfte Checkpoints werden unten ergänzt. Keine produktive Releasefreigabe.

## A — gemeinsamer Materialpfad

Vorhandene GLASS-3-Engine erweitert, keine zweite Engine. Dock-/Widget-/Islandprofile aus8A unverändert. Originale GlassSlab-Parameter auch auf Control-Center-Kacheln, Menüs, Fensterwechsler, geeigneten Toolbars und Launchpadhosts. Bestehende Snell-/Squircle-/Dispersion-/Rim-/Meniskus-Formeln aus liquidglass/dockglass und contourglow bleiben erhalten.

MacDock `glassBlur5+8=13`, MacWidgets `5+11=16`, FeatherBlur `radius9`, Island/Popover5, Control0 laufen jetzt als **pro Szenentextur/Radius gecachter separabler WebGL2-Framebuffer-Prepass**. Zwei17-Tap-Passes bei halber Szenentexturauflösung, danach Mipmaps. Das ist eine bewusste Gaussian-Approximation des Qt-MultiEffect-Kernels, keine behauptete Pixelgleichheit. Der bisherige pauschale2px-CPU-Blur entfällt. Kein zusätzlicher Idleloop; ein Kontext, bestehender Renderer, drei Materialprogramme plus ein Prepassprogramm. CornerBorder-Farbmischung, sechs Fade-Stops und0.8px-Linie tatsächlich auf Canvasmaterialien ausgeführt. Konkave Dock-/Islandmasken bleiben maßgeblich.

**Quelle ausschließlich aktives Wallpaper**, keine eigenen/fremden Fenstertexturen und kein Systemcapture. Software-/unbekannte GPUs bleiben im CSS-Fallback; isolierte SwiftShaderdiagnose ist kein Hardwarebeleg. CSS-Blur ist keine Snell-Refraktion. Die vorhandene MacLock-Shaderpipeline bleibt getrennt und unverändert; lokale Tracklinsen der Qt-Slider/Switches, tintcard-Albumtransition, FeatherBlur-/EdgeBlur-Inhaltsmasken sind noch nicht integriert. Nur gespeicherte Originaldateien werden ausdrücklich nicht als implementiert gezählt. Herkunft/Bytehashes/MIT: [Manifest](../third_party/evolution1/provenance.json), [NOTICE](../third_party/evolution1/NOTICE).

A-Abnahme: **470/470 Node-Tests**,297 Runtimeassets. Echter Linux-Electron44.9.3-Lauf mit synthetischen Profilen bei1920×1080/1650×930/390×600: originaler sicherer Softwarefallback, isolierter Shaderpfad, Context Loss/Restore4→0→4, Reduced Glass/Transparency/Motion, Classic/Modern, M1/M2-Reverse und Logout.390px ist ein CDP-Rendererviewport im nativen Mindestfenster, keine iPad-/Hardwareabnahme. [Renderer-Messwerte](visual/system-evolution-1/A/material-report.json), [Tests](visual/system-evolution-1/A/tests.tap). Prepass-/Upload-/Transferzähler und geschätzte Texturbytes sind lokale Diagnosewerte; keine FPS-Zusage.

## B / C

Systemadapter und R4 werden in getrennten geprüften Checkpoints ergänzt. Aktuell keine neue Windows-/macOS-/Hardwareabnahme und noch kein R4-Installer.

## B — echte begrenzte Plattformintegration

Renderer `air-platform-system.js`: Systemstatus-Popover, Tastatur/Escape/Outside-Click, ereignisgetriebene Aktualisierung, authentifizierte Aufrufe. Electron Main: bestehende `requireControlSession` prüft aktives Profil, Sitzungsnonce, MainWindow, MainFrame und index.html. Jeder neue IPC-Pfad nutzt diese Prüfung; asynchrone Clipboard-/Settings-/Hyprland-/Finder-Rückgaben werden danach erneut geprüft. Keine Renderer-Node-Rechte, Shellstrings oder neue Registry.

Adapter `src/main/system-capabilities.cjs`: Electron `net.isOnline`, `powerMonitor.isOnBatteryPower`, Suspend/Resume und screen-Geometrie/DPI/Displayanzahl. Keine Displaynamen/SSID/Gerätekennungen, Akkuprozent oder erfundene Audio-/Bluetooth-/Helligkeitswerte. Display-/Powerereignisse ohne Polltimer; sichtbare Hostfenster werden nicht verschoben, nach Monitorverlust unerreichbare Hostfenster können zurückgeholt werden. Der Glasrenderer pausiert bei tatsächlicher Suspend-Nachricht. Bestehende interne MRU/Snap/Maximize/M2/Fokus/Persistenz weiterverwendet.

| Fähigkeit | Windows | macOS | Linux |
|---|---|---|---|
| Online/Offline | Electron net-Status | gleicher Vertrag | Linux-Electron geprüft |
| Batterie / Energie | Netz-/Batteriebetrieb, kein Prozent | gleicher Vertrag | reales Electron-API, keine physische Batterie geprüft |
| Displays / Skalierung | screen-Geometrie/Ereignisse | gleicher Vertrag | Xvfb1920×1080/1× geprüft |
| OS-Einstellungen |5 feste ms-settings-URIs |5 feste Systempreferences-URIs, nativ ungeprüft | ehrlich nicht angebunden |
| Systemlautstärke / Helligkeit / Bluetooth-Schalter | nicht unterstützt | nicht unterstützt | nicht unterstützt |
| Audio | vorhandener echter Air-Music-Transport | gleicher Vertrag | bestehender gesamter Medientest bestanden |
| Clipboard | explizites begrenztes Textlesen/-schreiben, kein Verlauf | gleicher Vertrag | echter asynchroner Electron44-Roundtrip geprüft |
| Hyprland | deaktiviert | deaktiviert | nur echte Hyprland-Umgebung, separates natives Einmal-Consent, feste read-only-Abfrage |

Optionaler Hyprlandadapter startet **nie automatisch** eine Abfrage. Nur `/usr/bin/hyprctl -j activeworkspace`,1500ms/64KiB-Grenze, validierte ID/Fensteranzahl, keine Titel/Clients/Dispatchs. Einmalige native Bestätigung vor jedem Lesen; keine neue Fremdfenstersteuerung. Mit synthetischem Prozessadapter getestet, **kein echter Hyprlandhost verfügbar**. Kein WSL/Hyprland auf Windows.

Finder-Sicherheitskorrektur: Nach einem offenen Ordnerdialog Sitzungsprüfung und Auswahlrevision; alter Dialog darf kein anderes Profil oder neuere Freigabe überschreiben. Asynchrone Dateisuche prüft Sitzungs- und Rootgültigkeit vor Rückgabe. Bestehende autorisierte Dateiaktionen/Traversal-/Symlink-/Writesicherungen und Notes-Sperrschutz bleiben erhalten. Keine Legacy-Datenmigration.

**26px Menüzeile**, kleinere vertikale Pads, transparente Statusbuttons. Dauerhaftes Datum rechts entfernt; Kalender über bestehende Zugänge erhalten. Island-/Dock-Grundgeometrie/M1/M2 unverändert. Classic separat. Systemzugriff zusätzlich in bestehenden Netzwerk-/Bluetooth-/Displaydetails, kein Fake-Toggle.

B-Abnahme: **484/484 Tests**,301 Runtimeassets,287 PWA-Buildassets; moderne eingefrorene Electron44.9.3/builder26.18.0-Toolchain **0 Auditbefunde**. Vollständiger vorhandener echter Linux-Electron-App-/Zwei-Profil-/Neustart-/Medien-/Notes-/M1/M2-/Fallbacklauf bestanden. Neuer System-GUI-Lauf alle drei Zielgrößen mit echten Display-/Onlinestatusdaten, Clipboard-Roundtrip, Session-Rejection vor/nach Logout,26px-Menüzeile, Escape, Reduced/Classic und M1/M2 bestanden. Frühe GUI-Fehler (gemeinsames Display, dann asynchrones Electron44-Clipboard) wurden nicht als Erfolg gewertet; getrenntes Testdisplay und echter Async-Adapter korrigierten diese. [Messdaten](visual/system-evolution-1/B/material-report.json), [voller Bestandslauf](visual/system-evolution-1/B/regression.json), [Tests](visual/system-evolution-1/B/tests.tap), [Audit](visual/system-evolution-1/B/dependency-audit.json).

## C — R4 vorbereitet, noch keine Windows-Erfolgsbehauptung

Eigener `build-windows-r4.yml` und `windows-r4-build.cjs`; eingefrorener R1-Kanal/R3-Verifier wiederverwendet. R1/R2/R3 unverändert. Exakte8A-Abstammung/Featurebranch/Checkout-SHA; alle lokalen Runtimebytes/Notices im ASAR geprüft, Payloadinventur, PE-x64/Installerhash, native Runnerinstallation und Start aus installiertem Pfad, voller Tahoe7-Bestandslauf plus neuer Capability-/Materiallauf. Kein Publish/Signing/Sicherheitsbypass. Tatsächliche CI-/Artefaktresultate folgen; aktuell noch kein R4-Download freigegeben.


## Echte Bildvergleiche / Messwerte

Alle Bilder sind echte Linux-Electron44.9.3-Aufnahmen mit isolierten synthetischen Profilen. Normaler Software-GPU-Pfad ist CSS; Shaderaufnahmen stammen ausdrücklich aus isolierter SwiftShaderdiagnose. Keine Hardwareabnahme. Uhr läuft natürlich; Wallpaper und Fenster-/Widgetzustand sind vergleichbar, die Zeit ist nicht eingefroren.

| Bereich | Vorher8A | NachherEvolution1 |
|---|---|---|
| Desktop1920 · CSS | ![Vorher](visual/system-evolution-1/before/desktop-1920.png) | ![Nachher](visual/system-evolution-1/B/desktop-1920.png) |
| dock1920 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-dock-1920.png) | ![Nachher](visual/system-evolution-1/details/after-dock-1920.png) |
| island1920 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-island-1920.png) | ![Nachher](visual/system-evolution-1/details/after-island-1920.png) |
| Desktop1650 · CSS | ![Vorher](visual/system-evolution-1/before/desktop-1650.png) | ![Nachher](visual/system-evolution-1/B/desktop-1650.png) |
| dock1650 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-dock-1650.png) | ![Nachher](visual/system-evolution-1/details/after-dock-1650.png) |
| island1650 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-island-1650.png) | ![Nachher](visual/system-evolution-1/details/after-island-1650.png) |
| Desktop390 · CSS | ![Vorher](visual/system-evolution-1/before/desktop-390.png) | ![Nachher](visual/system-evolution-1/B/desktop-390.png) |
| dock390 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-dock-390.png) | ![Nachher](visual/system-evolution-1/details/after-dock-390.png) |
| island390 · echter Ausschnitt | ![Vorher](visual/system-evolution-1/details/before-island-390.png) | ![Nachher](visual/system-evolution-1/details/after-island-390.png) |

[1920Systemstatus](visual/system-evolution-1/B/system-status-1920.png) · [1650Systemstatus](visual/system-evolution-1/B/system-status-1650.png) · [390Systemstatus](visual/system-evolution-1/B/system-status-390.png).

| Kontrollzentrum |1920|1650|390|
|---|---|---|---|
|CSS-Fallback|![CC](visual/system-evolution-1/B/island-open-1920.png)|![CC](visual/system-evolution-1/B/island-open-1650.png)|![CC](visual/system-evolution-1/B/island-open-390.png)|

| Synthetischer Shadernachweis | Refraktion an | Refraktion aus, gleicher Preblur/Tint |
|---|---|---|
| 1920 · Softwarediagnose | ![Snell an](visual/system-evolution-1/final-diagnostic/stripes-1920.png) | ![Snell aus](visual/system-evolution-1/final-diagnostic/stripes-no-refraction-1920.png) |
| 1650 · Softwarediagnose | ![Snell an](visual/system-evolution-1/final-diagnostic/stripes-1650.png) | ![Snell aus](visual/system-evolution-1/final-diagnostic/stripes-no-refraction-1650.png) |
| 390 · Softwarediagnose | ![Snell an](visual/system-evolution-1/final-diagnostic/stripes-390.png) | ![Snell aus](visual/system-evolution-1/final-diagnostic/stripes-no-refraction-390.png) |

[Cropkoordinaten/Bildhashes/Geometrievergleich](visual/system-evolution-1/measurements.json). Dock-/Island-/Widgetrechtecke bei allen drei Größen exakt identisch. Refraction-on/off verändert bei gleichem Preblur/Tint tatsächlich gerenderte Pixel: mittlere absolute RGB-Differenz im4px hohen Dockkantenstreifen1920:0.133;1650:0.256;390:0.688 (0–255). Der originale stärkere13px-Preblur glättet das hochfrequente Streifenmuster; keine große Pixelwirkung oder Hardwareframerate behauptet.

[Finale numerische Shaderdiagnose](visual/system-evolution-1/final-diagnostic/material-report.json). Vier Programme (3 originale Materialports +1 Gaussianprepass), pro Radius maximal2 gecachte Prepassdraws je Szeneninvalidierung. Im isolierten390px-Idlesample **0 zusätzliche Draws/700ms**. Nach Kontextverlust0 Programme/Texturen, nach Restore4 Programme. DPR1 und emuliertes DPR2 tatsächlich geprüft, physische Retina-/Windows-GPU offen; DPR-Budget-/Grenzlogik zusätzlich per Unit-Test. Transfer-/Prepass-Wallzeiten sind CPU-seitige kumulative Messungen inklusive synchroner Treiberkosten und keine GPU-Timer-/FPS-Messung. Speicherwert ist geschätzter WebGL-Texturfußabdruck, keine komplette Prozessspeichermessung.

Offen bleiben insbesondere echte Qt-Tracklinsen der Slider/Switches, tintcard-Albumfarben, komplementäre Inhaltsmasken von EdgeBlur/FeatherBlur, native Notification-/Systemaudio-/Brightness-/Bluetoothadapter, Hyprland-Ereignissocket, physische Multi-Monitor-/DPI-/Suspend-/Dialog-/Audio-/SAC-Abnahme und macOS. Vorhandene interne Fenster-/App-/Notiz-/Medienfunktionen wurden geprüft, nicht als neue Implementierung ausgegeben. Legacy-Kalender-/Playlistdaten bleiben unverändert und werden nicht automatisch zugeordnet.


### Ergänzende Architektur und tatsächliche Originalmaterialien

```
Aktives Wallpaper → einmaliger Upload / Mipmaps
                   → gecachte Gaussian-FBO-Paare je5/9/13/16px-Radius
                   → bestehendes liquidglass / dockglass + interaktives contourglow
                   → vorhandener Canvastransfer + CornerBorder → DOM-Inhalte
```

| Originalprofil | tatsächlich gebundene Werte |
|---|---|
| MacDock |thickness30; dispersion.06; blurPx1.5; tintMix.231; saturation1.25; rim.09; grain.009; magnify.08; shadowAmt0; eigener Dockshader ohne flatInner-Uniform; Preblur13|
| WidgetVisual→Clock |thickness30; dispersion.06; blurPx1; tintMix.586; saturation1.25; rim.45; grain.0045; magnify.08×min(1,90/H); shadowAmt0; flatInner1; Preblur16|
| GlassSlab→Island/Popover/Switcher/Launchpad |thickness25.6; dispersion.078; blurPx1.5; tintMix.231; saturation1.25; rim.1125; grain.006; magnify.08; shadowAmt0; flatInner1; rimTint1; ringW0; Preblur5|
| GlassSlab→Control |gleiche Slabwerte, residualblur0/Preblur0 für klare native Kontrolloberfläche; originale lokale Tracklinsen noch offen|
| geeignete Titeltoolbars |Slabwerte, FeatherBlur-radius9 als Preblur; keine erfassten Fensterinhalte|

Renderer: Material-/Fokus-/Popoverdarstellung und vorhandene Appcontroller; keine Node-Rechte. Main: Autorisierung, Sitzungen, native Dialoge/Clipboard/OS-Einstellungsaufrufe. Plattformadapter: feste URI-Kataloge, begrenzte Statusdaten und optionaler read-only Hyprlandaufruf. Nicht unterstützt: Systemvolume-/Bluetooth-/Brightnessschalter, prozentualer Akkustatus, OS-weite Fenstermanagerrechte, heimliche Aufnahme, globale Zwischenablageüberwachung, native Systemsperre. Die Air-OS-Anmeldung bleibt eine App-Anmeldung.

[Emuliertes DPR2: Messwerte](visual/system-evolution-1/retina/material-report.json), [exakt ausgeführter eigenständiger Launcher](visual/system-evolution-1/retina/launcher.cjs.txt), [echter2×Dock-Ausschnitt](visual/system-evolution-1/retina/dock-dpr2.png). Voller Drei-Größen-Lauf auch bei DPR2 mit System-/Clipboard-/M1/M2-/Kontextverlust-/Reduce-/Classic-/Logoutprüfungen bestanden. Native Display-API meldet weiterhin das echte Xvfb1×Display; CDP-DPR2 wird ausdrücklich nicht als physisches Retina-/DPI-Monitorereignis ausgegeben.

### B-Ergänzung — echte Bearbeiten-Menüaktionen

Bestehende MacShell-Appmenüstruktur erweitert: **Kopieren, Ausschneiden, Einfügen** über den sicheren nativen Textclipboard-Vertrag. Kein zweites Menü/Editor-/Notesmodell. `src/core/clipboard-edit.js` ist eine begrenzte Texttransaktion: nur echte Text-/Suchfelder und Textareas, keine Passwortfelder; readonly/disabled/maxlength; nach asynchroner Clipboardaktion Fokus, Textrevision, Auswahl, DOM und Sitzung erneut prüfen. Native `insertText/delete` erhalten im Chromium-Pfad die Undo-Historie und bestehende Notes-input-/Speicherhandler. PWA ohne native Bridge erhält keine vorgetäuschten Clipboard-Menüaktionen; reguläre Browserbedienung bleibt bestehen.

**489/489 Tests**,302 Runtimeassets. Echter Linux-Electron-Menülauf: copy→paste→cut→native Undo→bestätigtes Notes-Speichern und Storevergleich, alle drei Zielgrößen/übrige Systemregressionen bestanden. [Messprotokoll](visual/system-evolution-1/native-edit/material-report.json), [echte Notes-Aufnahme](visual/system-evolution-1/native-edit/native-edit-notes.png), [Tests](visual/system-evolution-1/native-edit/tests.tap). R4 wird aus diesem erweiterten Stand erneut gebaut. Bereits erfolgreicher Vorgänger: [Windowslauf40639966766](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40639966766), Buildcommit `d1f7921b505ad20d7bf60cec83c2ec06775aa143`,485 Tests/native installierte GUI plus Systemcapabilities erfolgreich; endgültiger Stand folgt unten.
