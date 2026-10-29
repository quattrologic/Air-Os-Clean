# Air-OS R7 — Final Experience

Branch: feat/air-os-r7-final-experience. Verbindliche Basis:7be272a61d43db03810817755adf9615629ac89b. Die R6.1-Geometrie,24px-Menü und natives Fullscreen bleiben Regressionen.

## Checkpoint A — gemeinsame Materialpipeline

544/544 Node-Tests und tatsächlicher Electron44.9.3-Compile-/Renderlauf aller sechs Materialfamilien bestanden. Linux/Softwarediagnose, keine Hardwareabnahme.

- Hyprland0aa6745f705f2c4b0a5004eb019ef76e5bbdb426: prismfinish.frag, frostfinish.frag und inner_glow.glsl gegen die tatsächlichen Upstreambytes verifiziert. Vorhandene Originale und SHA-256 in third_party/hyprland/provenance.json, BSD-3-Clause/NOTICE unverändert.
- Prism: originale dreiachsige Faltungen, Zellvariation, Spektrum, RGB-Abtastung und Emboss werden ausgeführt.
- Frost: originale Warp-/Voronoi-Suche, zwei nächste Zellzentren, Seam-Normalen und GlassFinish werden ausgeführt.
- Inner Glow: originaler potenzbasierter Alphaabfall im bestehenden Finishshader, premultiplizierte Mischung. Air-Anpassung: konkave Air-SDF statt nativer Rechteckmaske;12px/Power2 und zurückhaltende Fokusamplitude sind Integrationsparameter, keine behaupteten Hyprlanddefaults.
- Ziele: scripts/build-hyprland-shaders.cjs → hyprland-shaders.js → air-desktop-glass.js. Settings verwendet dieselbe validierte profilgebundene glassFamily-Einstellung; kein weiterer Renderer/Store.
- Die Patternkoordinaten sind logische lokale Pixel, UV-Ableitungen berücksichtigen Raster-/DPR-Skalierung. Prism/Frost sind optionale Materialfamilien; MacShell-Standard bleibt erhalten.
- Begrenzte adaptive Hardwarequalität: nach drei Renderdurchgängen über28ms sinkt das vorhandene Pixelbudget um eine Stufe, höchstens bis25%. Kein zusätzlicher Loop, keine GPU-Guard-Abschaltung, kein60fps-Versprechen. Diagnoseauflösung bleibt reproduzierbar.
- Wallpaper bleibt einzige Szenentextur; eigene prozedurale Control-Tracks sind separat begrenzt. Keine Fenster-/Desktopaufnahme.

[Prism](visual/r7/materials/material-prism.png) · [Frost](visual/r7/materials/material-frost.png) · [Acrylic mit Inner Glow](visual/r7/materials/material-acrylic.png).

Weitere Checkpoints und Windows-R7-Abnahme folgen im selben Auftrag. Native Schatten-/Borderobjekte, DRM/KMS/Wayland und echte Live-Fensterrefraktion sind dadurch nicht portiert.

## Checkpoint B — echte Interaktionen und sichere MacLock-Komposition

550/550 Tests; echte Electron-GUI in allen fünf Zielgrößen bestanden, darunter Finder/Notes, Kontrollzentrum, Spotlight, Dock-Hover, Widgetseiten und neutraler MacLock. Zusätzliche vollständige R6.1-Geometrie-/F11-/M1/M2-/Layoutabnahme ebenfalls bestanden.

- Vorhandenes MacShell Spring.qml / airMacShell7.step steuert jetzt auch interne Tiling-Geometrien. Originale stabile Substeps, Geschwindigkeitsübernahme beim Retargeting, begrenzter RAF nur während Bewegung. Response0.18 und Epsilon0.08 sind Air-Integrationsparameter. M2 bleibt eigener Owner.
- Drag-to-Snap verwendet denselben Workarea-/Snap-/Maximize-Vertrag. Sichtbare Vorschau erst nach450ms Randverweilen; Abbruch/Blur/Logout räumt auf. Normales schnelles Randdragging bleibt möglich. Reale Pointerprüfung bestätigt Finder0/24/844×872 bei1688×896.
- Originale MacWidgets-Skalierung0.6–1.5 ist profilgebunden über den bestehenden Store verfügbar. Default1 verändert bestehende Profile nicht. Das ausdrücklich bestätigte Reference-Preset wählt0.8; Widgets148×148 bzw.316×148. Vorherige Skalierung wird zusammen mit Pins/Positionen gesichert.
- MacLock/LockScreen.qml wurde vom fixierten Original geladen und bytegenau samt MIT nachgewiesen: third_party/r7-macshell/provenance.json. Tatsächlich portiert:372u-Medienbreite,150u/138u-Kartenhöhen, quadratisches vergrößertes Cover,24u-Abstand und340u-Rechtskarte mit18u/48u-Ankern;650ms OutQuint.
- Die vorhandene Main-Consent-/60s-Snapshotpolicy bleibt unverändert. Vor Anmeldung nur neutrale Medien-/Datenschutzkarte. Vergrößern ausschließlich bei ausdrücklich freigegebenem echtem Cover; keine vorgetäuschten Playcontrols für bereits gestoppten Transport. Autorisierte Live-Wiedergabe bleibt auf authentifizierten App-/Widget-/Island-Flächen. Nativer Freigabedialog/erweiterte Coveransicht noch nicht manuell abgenommen.
- CSS-Fallback heller und feiner geschichtet, ein Compositorblur pro Host. Reduced Transparency/Forced Colors bleiben deckend. CSS ist weiterhin keine Snell-Refraktion.

[Unveränderter R6.1-Desktop](visual/r7/before/r7-desktop-1536.png) · [erster integrierter R7-Durchgang](visual/r7/iteration1/r7-desktop-1536.png) · [reale Snapvorschau](visual/r7/iteration1/r7-snap-preview.png) · [Snap-Ergebnis](visual/r7/iteration1/r7-drag-snap.png).

Der erste direkte Bildvergleich zeigt konkrete Restprobleme: feste Wetterpixel überlappen nach Skalierung; Kalenderkopf bricht um und letzte Zeile benötigt Scrollen. Diese Produktfehler werden in der folgenden visuellen Korrekturrunde behoben. Kein Pixelgleichheitsversprechen.

## Checkpoint C/D — visuelle Korrekturen und vollständige Regression

554/554 Tests, alle540 R6.1-Regressionen erhalten. Komplette bisherige Linux-Electron-App-/Profil-/Neustart-/Musik-/MacLock-Suite bestanden. R6.1-F11/Geometrie/M1/M2 zusätzlich geprüft. Neue fünfgrößige R7-Szenen einschließlich realer Randvorschau/Snap, Workspacewechsel mit/ohne aktives Fenster, Spotlightrechner, zwei Apps, Kontrollzentrum, Widgetseiten, neutraler MacLock und reduzierter Transparenz bestanden.

### Tatsächliche visuelle Korrekturrunden

1. Erster integrierter Screenshot: Wettertexte überlappen bei0.8-Skalierung, Kalenderkopf bricht um. Wetterkomposition und Schrift-/Monatsdarstellung korrigiert.
2. Zweiter Screenshot: CSS-zoom verschiebt prozentuale Wetteranker; durch explizite Originaleinheiten×scaleF ersetzt. Kalender hatte zusätzlich vererbte feste12px-Zeilen und eine maximale Inhaltshöhe; jetzt explizite Kopf-/Sieben-Zeilen-/Öffnerkomposition. Keine Funktion durch overflow:hidden entfernt.
3. DOM-Prüfung fand verbleibenden horizontalen Überlauf: originale16px-Aktions-SVGs waren größer als die skalierten14.4px-Buttons. Glyphen skaliert; beide Kalenderachsen werden nun auf tatsächliche scroll/client-Maße geprüft. Wetter-Stundenstreifen muss vollständig innerhalb der Kartenrechtecke liegen.

[Vorher1536](visual/r7/before/r7-desktop-1536.png) · [Durchgang1](visual/r7/iteration1/r7-desktop-1536.png) · [Durchgang2](visual/r7/iteration2/r7-desktop-1536.png) · [geprüftes Nachher1536](visual/r7/after/r7-desktop-1536.png).

Der im Chat vorhandene MacShell-Zieldesktop wurde visuell als Kompositionsreferenz verwendet (Uhr/Kalender, breites Wetter/Player, breites Dock). Keine Original-Pixeldatei aus dem Chat im Workspace, daher kein behaupteter direkter Pixelidentitätswert. Unveränderte R6.1-Baseline7be272a wurde separat tatsächlich ausgeführt; identische Uhr12:34/Datum und ausdrücklich synthetisches DEMO-Wetter nur im Renderer-Test. Das blaue Air-OS-Wallpaper bleibt identisch.

| Bereich | Original / Abweichung | Konkreter R7-Nachweis |
|---|---|---|
| Komposition | MacWidgets dims185/395, scale0.8, Originalraster179/28/23 | Kleine Widgets148×148, breite316×148, Abstandpitch165/161; bestehende Profile nur nach Bestätigung umstellen |
| Kalender | CalendarWidget-Monatskopf, sieben Spalten; eigener Appöffner bleibt | Kein Umbruch, kein horizontaler/vertikaler Scrollbedarf; alle Tage/Monatsaktionen erhalten |
| Wetter | WeatherWidget/HourCol/WeatherIcon, reale API bleibt | Skalierte Originalkomposition; DEMO klar gekennzeichnet, keine erfundenen Produktivwerte |
| Dock/Island | Eigene äußere Air-Formen bleiben absichtlich | Originalmagnifikation/Pins,24px-Menü und M1/M2 unverändert; feinere CSS-Lichtkante |
| Glas | Original MacShell plus tatsächlich ausgeführte neue Hyprland-Finishes | Prism/Frost opt-in; Wallpaper-only; sichere Software-CSS-Pipeline getrennt |
| MacLock | LockScreen.qml-Medien-/Rechtskartenkomposition | Originalgeometrie, freigegebenes Cover erweiterbar; vor Login neutral; wiederverwendeter originaler PlayerArt-Notenpfad |
| Apps | Tahoe-Header/Sidebar/Workspace aus R1–R6.1 | Finder/Notes gleichzeitig, bisherige Datenspeicherung/Retry/Undo/Profilrechte weiter geprüft; keine neue Appengine |

### Final verwendete Originalparameter und Portgrenzen

Hyprland ConfigValues.cpp: glass.refraction20, glass.size40, glass.roughness1; glow.range10, glow.render_power3. Frost/Prism verwenden den vorhandenen gecachten Dual-Kawase-Prepass; MacShell/Gaussian bleiben erhalten. Die frühe A-Diagnose verwendete noch Air-Kalibrierung12/2 und Prism80; der finale Stand benutzt diese tatsächlichen Originaldefaults. Aktivierung/weiße Glastönung und zurückhaltende Alphaamplitude sind Air-Anpassungen, kein unmodifizierter Hyprland-Standardglow.

### Gemessene Shaderwirkung und Ressourcen

[Reale Streifen-Pixelmessungen](visual/r7/diagnostic/pixel-comparison.json). Paarweise derselbe Dockcrop mit/ohne Refraktionsuniform, unveränderte Szene:

| Material | mittlere absolute RGB-Differenz0–255 | geänderte Pixel über2 |
|---|---:|---:|
| Acrylic | 1.163 | 5399 |
| Hybrid | 2.179 | 10303 |
| GlassFinish | 2.871 | 13602 |
| Prism | 10.795 | 36379 |
| Frost | 2.577 | 23729 |

Dies belegt tatsächliche gerenderte Shaderwirkung, keine Hardwareabnahme oder Fidelity-Prozentzahl. Neue Muster sind optional; das Standardmaterial wird nicht still auf Prism geändert.

[Prism mit Refraktion](visual/r7/diagnostic/stripes-prism.png) · [ohne](visual/r7/diagnostic/stripes-prism-no-refraction.png) · [Frost mit Refraktion](visual/r7/diagnostic/stripes-frost.png) · [ohne](visual/r7/diagnostic/stripes-frost-no-refraction.png).

Die vollständige isolierte Softwarediagnose bestand einschließlich Context Loss/Restore, DPR1/2/3, Reduced Motion/Transparency, Classic und Logout. Gemessene zusätzliche Idle-Draws0. Nach allen sechs Familien maximal10 Programme inklusive Prepass/Controls,8 Texturen und geschätzte27.648.000 Texturbytes in dieser Szene; nach Restore7 Programme/4Texturen. [Tatsächliche Zähler](visual/r7/diagnostic/material-report.json). Kein FPS-Versprechen, kein Hardware-Benchmark. Die adaptive Hardwarequalität ist als begrenzter Schutz implementiert; physische GPU-Abnahme offen.

### Screenshots und Messdaten

[1536](visual/r7/after/r7-desktop-1536.png) · [1688](visual/r7/after/r7-desktop-1688.png) · [1920](visual/r7/after/r7-desktop-1920.png) · [1650](visual/r7/after/r7-desktop-1650.png) · [390-Renderer](visual/r7/after/r7-desktop-390.png) · [Apps](visual/r7/after/r7-apps-1536.png) · [Kontrollzentrum](visual/r7/after/r7-controls-1536.png) · [Spotlight](visual/r7/after/r7-spotlight-1536.png) · [MacLock](visual/r7/after/r7-maclock-1536.png) · [Workspace](visual/r7/after/r7-workspace.png) · [Geometrie/Scrollmessungen](visual/r7/after/r7-report.json) · [R6.1-Fullscreenregression](visual/r7/after/r61-bounds-report.json).

## Technische Zuständigkeiten

| Ebene | Zuständigkeit |
|---|---|
| Renderer | Derselbe GLASS-3-Owner, Materialcache/Masken/Controls; bestehender Widgetmanager/Window-Lifecycle/MRU; sichere MacLock-Präsentation |
| Electron Main / Preload | Unveränderte authentifizierte Profil-/Datei-/Musikmetadaten-/Vollbild-/System-IPC, Native-Consent vor öffentlichem Cover-Snapshot |
| Plattformadapter | Bestehende allowlistbasierte Windows-Einstellungen, Display-/Power-/Netzstatus; optionaler Linux-Hyprland-Consentadapter bleibt separat |
| Ausdrücklich nicht unterstützt | Systemweite Fremdfenstersteuerung/-aufnahme, Live-Fensterrefraktion, Hyprland/Wayland auf Windows, private Daten vor Login |

MacTahoe GTK/Icons und ihre MIT/GPL-3.0-Nachweise unverändert weiterverwendet; R7 importiert keine weiteren Markenicons. Originalquellen und SHA-256: third_party/hyprland/provenance.json, third_party/r7-macshell/provenance.json sowie bestehende Tahoe-/MacShell-Manifeste. Kein neuer Bibliotheks-/Datenbank-/Audio-/Renderer-Owner.

## Windows R7

Eigener build-windows-r7.yml auf unverändertem R6.1-Kanal/Verifier und eingefrorener Electron44.9.3-/Builder26.18.0-Toolchain.370 tatsächliche Runtimeassets einschließlich neuem CSS und vollständigem MIT-Originalnachweis; jeder lokale Runtimebyte wird beim ASAR-/Installationsvergleich geprüft. Pflichtaudit, sämtliche Tests, NSIS-x64/PE/Hash, echte Installation/EXE, volle bisherige GUI, R6.1-Fenstergrenzen/Fullscreen, zusätzliche fünfgrößige R7-Szenen und separate Shaderdiagnose sind verpflichtend. R1–R6.1 unverändert.

Installer/Windows-Erfolg werden erst nach tatsächlichem Abschluss ergänzt. Unsignierter technischer Testbuild, kein Produktionsrelease.

## Bewusst offen

Physische Windows11-/Mehrmonitor-/DPI-/Hardware-GPU-/SAC-/Codesigning-Abnahme, macOS und nativer Hyprlandhost. Native Picker-/Zustimmungsdialoge und Audioausgabe sind weiterhin keine manuelle Geräteabnahme. Erweiterte freigegebene MacLock-Coveransicht ist geometrisch/policyseitig geprüft; der echte native Freigabedialog wurde nicht simuliert und nicht manuell abgenommen. Kein privater Live-Transport vor Login. Native Hyprland-Shadow-/Border-Compositorobjekte, neue Fenstergruppen und zusätzliche Finder-/Notes-/Reminders-Funktionen wurden in R7 nicht neu implementiert; bestehende sichere Workflows bleiben maßgeblich.

## Checkpoint D — ältere bestätigte Desktop-Backups

Die letzte Kompatibilitätsprüfung fand einen realen Fall: vor R7 erstellte referenceBackup-Objekte enthalten kein widgetScale. Ein reines Partial-Update beim Restore hätte dadurch die neue0.8-Skalierung beibehalten.

Korrigiert in der bestehenden Reference-Aktion: fehlende Skalierung wird **nur beim ausdrücklich gewählten Anwenden/Wiederherstellen** als ursprüngliche1 normalisiert; vorhandene neue Skalierungswerte und alte Backupobjekte bleiben unverändert. Keine automatische Migration/Zuordnung beim Login.

555/555 Tests. Die tatsächliche Electron-GUI schreibt im isolierten Profil ein Backup im alten Format, aktiviert den bestehenden Restorebutton über echte Tastaturbedienung und prüft den bestätigten Wert1 sowie geleerte Sicherung. [Prüfung](visual/r7/after/r7-report.json): legacyBackupRestore=true. Die fünf visuellen Ansichten, Workspace-/Snapaktionen und neutraler MacLock bestanden erneut.

Checkpoint A49e5374, B d7bb297, C836a046. Der erste native R7-Lauf40840202863 bestand Audit, Tests, Packaging/Installation und die alte GUI, wird aber durch den Build mit diesem Kompatibilitätsfix ersetzt. Kein veralteter Installer wird als abschließender R7-Stand angeboten.
