# Air-OS System Evolution1

Basis `d6af14b2089db5f35386da2969d13b4e558d8fba`; Branch `feat/air-os-system-evolution-1`. Geprüfte Checkpoints werden unten ergänzt. Keine produktive Releasefreigabe.

## A — gemeinsamer Materialpfad

Vorhandene GLASS-3-Engine erweitert, keine zweite Engine. Dock-/Widget-/Islandprofile aus8A unverändert. Originale GlassSlab-Parameter auch auf Control-Center-Kacheln, Menüs, Fensterwechsler, geeigneten Toolbars und Launchpadhosts. Bestehende Snell-/Squircle-/Dispersion-/Rim-/Meniskus-Formeln aus liquidglass/dockglass und contourglow bleiben erhalten.

MacDock `glassBlur5+8=13`, MacWidgets `5+11=16`, FeatherBlur `radius9`, Island/Popover5, Control0 laufen jetzt als **pro Szenentextur/Radius gecachter separabler WebGL2-Framebuffer-Prepass**. Zwei17-Tap-Passes bei halber Szenentexturauflösung, danach Mipmaps. Das ist eine bewusste Gaussian-Approximation des Qt-MultiEffect-Kernels, keine behauptete Pixelgleichheit. Der bisherige pauschale2px-CPU-Blur entfällt. Kein zusätzlicher Idleloop; ein Kontext, bestehender Renderer, drei Materialprogramme plus ein Prepassprogramm. CornerBorder-Farbmischung, sechs Fade-Stops und0.8px-Linie tatsächlich auf Canvasmaterialien ausgeführt. Konkave Dock-/Islandmasken bleiben maßgeblich.

**Quelle ausschließlich aktives Wallpaper**, keine eigenen/fremden Fenstertexturen und kein Systemcapture. Software-/unbekannte GPUs bleiben im CSS-Fallback; isolierte SwiftShaderdiagnose ist kein Hardwarebeleg. CSS-Blur ist keine Snell-Refraktion. Die vorhandene MacLock-Shaderpipeline bleibt getrennt und unverändert; lokale Tracklinsen der Qt-Slider/Switches, tintcard-Albumtransition, FeatherBlur-/EdgeBlur-Inhaltsmasken sind noch nicht integriert. Nur gespeicherte Originaldateien werden ausdrücklich nicht als implementiert gezählt. Herkunft/Bytehashes/MIT: [Manifest](../third_party/evolution1/provenance.json), [NOTICE](../third_party/evolution1/NOTICE).

A-Abnahme: **470/470 Node-Tests**,297 Runtimeassets. Echter Linux-Electron44.9.3-Lauf mit synthetischen Profilen bei1920×1080/1650×930/390×600: originaler sicherer Softwarefallback, isolierter Shaderpfad, Context Loss/Restore4→0→4, Reduced Glass/Transparency/Motion, Classic/Modern, M1/M2-Reverse und Logout.390px ist ein CDP-Rendererviewport im nativen Mindestfenster, keine iPad-/Hardwareabnahme. [Renderer-Messwerte](visual/system-evolution-1/A/material-report.json), [Tests](visual/system-evolution-1/A/tests.tap). Prepass-/Upload-/Transferzähler und geschätzte Texturbytes sind lokale Diagnosewerte; keine FPS-Zusage.

## Weitere Checkpoints

Die folgenden Abschnitte dokumentieren B und den später erfolgreich geprüften nativen R4. Die einzelnen Zwischenstände bleiben zeitlich erkennbar; der endgültige C-Nachweis ist maßgeblich.

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

## C — Vorbereitung beim B-Checkpoint (historisch)

Eigener `build-windows-r4.yml` und `windows-r4-build.cjs`; eingefrorener R1-Kanal/R3-Verifier wiederverwendet. R1/R2/R3 unverändert. Exakte8A-Abstammung/Featurebranch/Checkout-SHA; alle lokalen Runtimebytes/Notices im ASAR geprüft, Payloadinventur, PE-x64/Installerhash, native Runnerinstallation und Start aus installiertem Pfad, voller Tahoe7-Bestandslauf plus neuer Capability-/Materiallauf. Kein Publish/Signing/Sicherheitsbypass. Zum damaligen Checkpoint noch kein R4-Download; der endgültige erfolgreiche Nachweis folgt unten.


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


### Zusammenhängende Appabläufe vor/nach, unveränderte Appcontroller

Vorher-Durchlauf mit korrekt verknüpfter lokaler Amplitude-Runtime ebenfalls vollständig bestanden. Ein früherer Baselineversuch ohne diese Worktree-Abhängigkeit scheiterte bei Musik und zählt nicht als Erfolg. Alle Inhalte synthetisch. Aktuelle Basis-Appoberflächen werden bewusst nicht neu gestaltet; diese Bilder zeigen die bewahrten Abläufe plus Menü-/Materialintegration.

| Bereich | Vorher8A | NachherEvolution1 |
|---|---|---|
| Desktop/Finder1920 | ![Vorher](visual/system-evolution-1/before-apps/r1-desktop-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-desktop-1920.png) |
| Notes1920 | ![Vorher](visual/system-evolution-1/before-apps/r1-notes-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-notes-1920.png) |
| Spotlight1920 | ![Vorher](visual/system-evolution-1/before-apps/deep-spotlight-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-spotlight-1920.png) |
| Mitteilungen1920 | ![Vorher](visual/system-evolution-1/before-apps/deep-notifications-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-notifications-1920.png) |
| MacLock1920 | ![Vorher](visual/system-evolution-1/before-apps/r1-lockscreen-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-lockscreen-1920.png) |
| Kontrollzentrum bei geöffneter App1920 | ![Vorher](visual/system-evolution-1/before-apps/t6-control-live-1920.png) | ![Nachher](visual/system-evolution-1/after-apps/t6-control-live-1920.png) |
| Desktop/Finder1650 | ![Vorher](visual/system-evolution-1/before-apps/r1-desktop-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-desktop-1650.png) |
| Notes1650 | ![Vorher](visual/system-evolution-1/before-apps/r1-notes-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-notes-1650.png) |
| Spotlight1650 | ![Vorher](visual/system-evolution-1/before-apps/deep-spotlight-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-spotlight-1650.png) |
| Mitteilungen1650 | ![Vorher](visual/system-evolution-1/before-apps/deep-notifications-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-notifications-1650.png) |
| MacLock1650 | ![Vorher](visual/system-evolution-1/before-apps/r1-lockscreen-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-lockscreen-1650.png) |
| Kontrollzentrum bei geöffneter App1650 | ![Vorher](visual/system-evolution-1/before-apps/t6-control-live-1650.png) | ![Nachher](visual/system-evolution-1/after-apps/t6-control-live-1650.png) |
| Desktop/Finder390 | ![Vorher](visual/system-evolution-1/before-apps/r1-desktop-390.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-desktop-390.png) |
| Notes390 | ![Vorher](visual/system-evolution-1/before-apps/r1-notes-390.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-notes-390.png) |
| Spotlight390 | ![Vorher](visual/system-evolution-1/before-apps/deep-spotlight-390.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-spotlight-390.png) |
| Mitteilungen390 | ![Vorher](visual/system-evolution-1/before-apps/deep-notifications-390.png) | ![Nachher](visual/system-evolution-1/after-apps/deep-notifications-390.png) |
| MacLock390 | ![Vorher](visual/system-evolution-1/before-apps/r1-lockscreen-390.png) | ![Nachher](visual/system-evolution-1/after-apps/r1-lockscreen-390.png) |
| Kontrollzentrum bei geöffneter App390 | ![Vorher](visual/system-evolution-1/before-apps/t6-control-live-390.png) | ![Nachher](visual/system-evolution-1/after-apps/t6-control-live-390.png) |
| Fenster-Snap | ![Vorher](visual/system-evolution-1/before-apps/r2-snap.png) | ![Nachher](visual/system-evolution-1/after-apps/r2-snap.png) |
| MRU-Wechsel | ![Vorher](visual/system-evolution-1/before-apps/r2-switcher.png) | ![Nachher](visual/system-evolution-1/after-apps/r2-switcher.png) |
| Musik/Widget | ![Vorher](visual/system-evolution-1/before-apps/r2-music-widget.png) | ![Nachher](visual/system-evolution-1/after-apps/r2-music-widget.png) |

MacLock bleibt bewusst im vorhandenen sicheren Login-Materialpfad: Er läuft vor der Desktop-Sitzung und darf keine authentifizierten Desktoppräferenzen/privaten Inhalte übernehmen. Eine gemeinsame Login-/Desktop-Backdrop-Ownership wurde deshalb nicht im Sammelumbau eingeführt. Qt-Tracklinsen benötigen ihre eigenen kontrollierten lokalen Trackquellen; die übernommenen Originalreferenzen allein werden nicht als Ausführung ausgegeben. Electron liefert keinen nativen Systemvolume-/Brightness-/Bluetoothzustand oder Akkuprozent über die hier eingesetzten APIs; dafür werden keine ungeprüften zusätzlichen nativen Module installiert. Native Notifications bleiben ohne sicheren Opt-in-/OS-Verlaufsvertrag offen. Displaybounds sind Electron-DIP plus echte Skalierung, keine erfundene physische Monitorabnahme.

390px-Widgetseiten: [CSS-Seite2](visual/system-evolution-1/B/widgets-390-page2.png) · [CSS-Seite3](visual/system-evolution-1/B/widgets-390-page3.png) · [Shader-Seite2](visual/system-evolution-1/final-diagnostic/widgets-390-page2.png) · [Shader-Seite3](visual/system-evolution-1/final-diagnostic/widgets-390-page3.png). Alle fünf vorhandenen Widgets bleiben über die bestehende Navigation erreichbar.


## C — endgültiger nativer Windows-R4-Nachweis

**Erfolgreich:** [Windows-x64-Lauf40642861669](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40642861669), Windows Server2022 (`10.0.20348`), tatsächliches installiertes Electron44.9.3 / builder26.18.0. [Vollständige öffentlichen Schrittresultate](visual/system-evolution-1/C/windows-ci.json).

- Buildcommit **`fbbc11f4614047bc1dc865ef06d57678171db63f`**;8A-Ausgangscommit **`d6af14b2089db5f35386da2969d13b4e558d8fba`**.
- A **`195235f28fc4b689089de65f22bec633fef0bc2e`**, B **`3ec212077710d802e989fddbbc9680efe3cb1f9b`**, zusätzliche echte Bearbeiten-Aktionen **`868405d`**; C-Windowsbilder vom CI anschließend als **`ffcdc05`** gesichert. Dieser Bericht wird als reiner Dokumentationsabschluss zusätzlich committet; dessen SHA steht im Abschlussbericht. Runtimecode bleibt identisch zum Buildcommit.
- Source/Toolchain/Dependency-Audit inklusive dev-Abhängigkeiten, vollständiger verpflichtender Testgate, NSIS-x64-Build, **302 lokale Runtimeassets bytegenau im ASAR**, PE-Architektur und vollständige installierte Payload bestanden. Keine Sicherheitsprüfung deaktiviert. **491/491 lokale Tests**; nativer Windows-Testgate ebenfalls erfolgreich. Hostabhängige Symlinkbedingungen und dessen genaue TAP-Zähler sind im Windows-Evidenzartefakt nachlesbar und werden nicht aus Linuxwerten abgeleitet.
- Echte Runnerinstallation in temporäres Verzeichnis, Start genau der installierten EXE. Zwei isolierte Profile, Login/Logout/Neustart, Apps, Metadaten-/Musiktransport, Notes-Speicherung/Sperrschutz, Widgets, CC/Spotlight, Fokus/MRU/Snap, M1/M2-Reverse, Classic/Modern, Reduced-Präferenzen und deaktiviertes WebGL1+2 bestanden.
- Neuer nativer Systemlauf1920/1650/390 bestanden: Betriebssystem-online=true, Netzbetrieb, echte Displaybounds1024×768DIP/1× des virtuellen Runnerdisplays. Die größeren Zielgrößen werden wie bisher als eigene Fenster-/CDP-Rendererviewports geprüft; keine physische Monitorgrößenbehauptung. Alle fünf festen `ms-settings`-Aufrufe wurden von der echten Windows-Shell akzeptiert. Das ist kein manueller Funktionstest jeder externen Settingsseite.
- Nativer Textclipboard-Roundtrip und echte Menüaktionen copy/paste/cut/Undo mit bestätigtem Notes-Speichern bestanden. Falsche/abgelaufene Sitzungen abgewiesen. Native Ordnerpicker/Consentdialoge, hörbare Audioausgabe, physische Batterie-/Multi-Monitor-/DPI-/Suspendereignisse und Windows11-SAC bleiben **manuell offen**.
- Windows-GPU-Klassifikation tatsächlich **software**, deshalb korrekt `css-fallback`,0 Shaderprogramme/Draws/Texturen, DPR1. **Keine Hardware-WebGL-Abnahme**. Linux isolierte Shaderdiagnose und DPR2 bleiben getrennte Nachweise.
- Die ersten zwei CI-Versuche scheiterten an Windows-EOL-Drift der neuen MIT-Lizenz. Vollständiger Byte-Erhalt des gesamten neuen Drittanbieterpakets korrigierte die Ursache; der Prüfvertrag wurde nicht gelockert. Spätere vollständige Läufe sind grün. Die letzte CI-Version enthält zusätzlich alle Menü-/Evidenzänderungen.

### Aktueller Testdownload

**[Air-OS Ultimate – Windows x64 – R4-Testinstaller](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40642861669/artifacts/12796172839)** · [Windows-Screenshots, Logs, Audit und TAP](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40642861669/artifacts/12796317035). Actions-Artefakte sind14Tage aufbewahrt und benötigen gegebenenfalls GitHub-Anmeldung. Kein öffentliches Produktionsrelease, keine Notarisierung oder vertrauenswürdige Signatur.

Datei: `Air-OS-Ultimate-R4-1.0.3-dev.6.shafbbc11f46140-Windows-x64.exe`
Größe: **122483497 Bytes (116.81MiB)**
Builddatum: **2026-10-28T06:18:14.968Z**
SHA-256:

```text
638a881038c9af72ef05ad0936efb62aa74cdabe786b143b755e990252da3cea
```

Die Prüfsumme stammt aus den tatsächlich gelesenen Installerbytes des erfolgreichen Windowsbuilds und stimmt mit Artefaktname und [bereinigtem CI-BUILD-INFO-Auszug](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/evidence.json) überein. Installer, SHA256SUMS.txt, vollständige BUILD-INFO.json und INSTALL-R4.txt liegen im Download. Artefakt-ZIP-Digest ist eine andere Prüfsumme als die obige EXE-Prüfsumme.

Auf dem eigenen Test-PC ZIP entpacken, `Get-FileHash -Algorithm SHA256 .\Air-OS-Ultimate-R4-1.0.3-dev.6.shafbbc11f46140-Windows-x64.exe` vergleichen, danach manuell installieren. **Ungesigniert:** Smart App Control kann weiterhin blockieren. Defender/SAC nicht deaktivieren; bei Blockierung nicht umgehen. Nur synthetische Profile nutzen, Cloud deaktiviert lassen. Upgrade über vorhandene private Installationen ist keine abgenommene Datenmigration und gehört zur separaten Hardwareprüfung.

### Echte installierte Windowsbilder

| Windows-Renderer |1920×1080|1650×930|390×600|
|---|---|---|---|
| Desktop/Preset/CSS-Fallback | ![Desktop/Preset/CSS-Fallback](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/desktop-1920.png) | ![Desktop/Preset/CSS-Fallback](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/desktop-1650.png) | ![Desktop/Preset/CSS-Fallback](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/desktop-390.png) |
| Native Systemfähigkeiten | ![Native Systemfähigkeiten](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/system-status-1920.png) | ![Native Systemfähigkeiten](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/system-status-1650.png) | ![Native Systemfähigkeiten](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/system-status-390.png) |
| Kontrollzentrum | ![Kontrollzentrum](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/island-open-1920.png) | ![Kontrollzentrum](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/island-open-1650.png) | ![Kontrollzentrum](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/island-open-390.png) |
| Spotlight | ![Spotlight](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/deep-spotlight-1920.png) | ![Spotlight](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/deep-spotlight-1650.png) | ![Spotlight](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/deep-spotlight-390.png) |
| MacLock | ![MacLock](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-lockscreen-1920.png) | ![MacLock](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-lockscreen-1650.png) | ![MacLock](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-lockscreen-390.png) |
| Appdesktop/Finder | ![Appdesktop/Finder](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-desktop-1920.png) | ![Appdesktop/Finder](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-desktop-1650.png) | ![Appdesktop/Finder](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-desktop-390.png) |
| Notes | ![Notes](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-notes-1920.png) | ![Notes](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-notes-1650.png) | ![Notes](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r1-notes-390.png) |

[Native Bearbeiten-/Notes-Aufnahme](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/native-edit-notes.png) · [Windows-Snap](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r2-snap.png) · [Windows-MRU](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r2-switcher.png) · [Musik/Widget](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r2-music-widget.png) · [neutral gesperrt](visual/system-evolution-1/windows-r4/fbbc11f4614047bc1dc865ef06d57678171db63f/r2-locked-neutral.png).

Die CI schreibt nur fest erlaubte PNG-Dateien aus den isolierten installierten Tests und bereinigte Metadaten auf den unveränderten eigenen Featurebranch. Kein Force-Push, keine Main-/PR-Änderung, keine Profile/Passwörter/rohen Logs in diesem Commit. Erwarteter Remote-SHA wird vorher geprüft; bei fremdem Fortschritt bleiben Bilder ausschließlich im Actions-Artefakt. Keine automatische App-/Websiteveröffentlichung.

### Abschlussumfang

A: gemeinsamer Materialpfad/Preblur/Originalparameter/CornerBorder und überprüfte Fallbacks vertieft; restliche Qt-Linsen/Inhaltsmasken offen. B: echte begrenzte OS-Capabilities, sichere Systemaktionen/Clipboard, Finder-Raceschutz und26px-Menüzeile nutzbar; anspruchsvollere native Hardwareadapter/Hyprland-Ereignisstream offen. C: aktueller R4 tatsächlich gebaut, installiert und im nativen Windowsrunner geprüft. **Kein Anspruch auf vollständigen MacShell-Port oder physische Hardwarefreigabe.** [Unveränderte Schutzdateien mit Hashes](visual/system-evolution-1/C/protected-files.json); bestehende Dock-/Island-/M1-/M2-/MacLock-/Cloud-/R1/R2/R3-Toolchain erhalten. Kein Cloudlogin, keine privaten Daten, keine iPad-Veröffentlichung. Nach Dokumentationssicherung STOP.


### Shader-Vergleich mit dem bereits gesicherten8A-Originalstand

Die8A-Aufnahmen stammen unverändert aus dem fixierten Ausgangscommit. Beide Shaderbilder sind **Softwarediagnose, kein Hardwarebeleg**; gleiche Wallpaper-/Preset-/Viewportpipeline, natürlich unterschiedliche Uhrzeit. Die stärkere geglättete Refraktion kommt vom nun laufenden Originalradius-Prepass und den ausgeführten Material-/Borderpfaden, nicht von geänderten8A-Dock-/Widget-Tintwerten. Die guten8A-Dock-/Widget-CSS-Fallbackwerte bleiben ausdrücklich erhalten; R4 verpackt sie erstmals zusammen mit diesen Erweiterungen.

|1920×1080|8A ohne originalradiusnahen Prepass|Evolution1 mit gecachtem Prepass|
|---|---|---|
|Normales Wallpaper / isolierte Shader|![8A](visual/tahoe8a-after-diagnostic/desktop-1920.png)|![Evolution](visual/system-evolution-1/final-diagnostic/desktop-1920.png)|
|Identisches synthetisches Muster / isolierte Shader|![8A](visual/tahoe8a-after-diagnostic/stripes-1920.png)|![Evolution](visual/system-evolution-1/final-diagnostic/stripes-1920.png)|


Endgültige Workflowhärtung: Im mehrzeiligen PowerShell-Validierungsblock wird **jeder** native Exitcode sofort geprüft (Link/Install/Source/Modern/Catalina/Runtime). Ein früher Fehler kann nicht durch ein später erfolgreiches Kommando verdeckt werden. Separate Regression ergänzt, lokaler Abschluss491/491. Der endgültige Windowslauf mit dieser Härtung ist vollständig grün; alle final verlinkten Installer-/Bilddaten stammen aus genau diesem Lauf. Bereits frühere erfolgreiche R4-Vergänger bleiben nur als historische Nachweise bestehen.
