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
