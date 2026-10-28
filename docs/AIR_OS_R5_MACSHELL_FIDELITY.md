# Air-OS R5 — MacShell Fidelity

Verbindliche Basis `a5e17ece1b1e7f4ceaee69f92fae26490088e8db`, Branch `feat/air-os-r5-macshell-fidelity`. Technischer Testkanal, keine Produktionsfreigabe. Die charakteristischen Air-OS-Außenformen und die vorhandenen Datencontroller bleiben maßgeblich.

## A — echte Ausführungspfade

Originale `liquidglass.frag`/`dockglass.frag` behalten SDF, Squircle-Normalen, Snell,24Golden-Angle-Gaussiantaps, Dispersion, Rim, Meniskus und Mipmapberechnung. Electron-Anpassung: auf derselben Original-SDF/bezel-Distanz fließend zwischen detailreicher Originalwallpapertextur an der Kante und vorhandener gecachter Preblur-Innenfläche wechseln. Keine zweite Engine/keine neue Capturequelle. Nur im Übergangsband zwei Texturzugriffe, innen/außen je ein Zugriff. Originale Tint-/Dickenwerte bleiben erhalten. Opaque Szenenbasis verhindert unbeabsichtigte Alphaabdunklung bei transparenten PNGs. Concave Air-OS-SDF unverändert.

`GlassSlab`, `GlassSlider`, `GlassSwitch`, `GlassSegmented`, `LiquidKnob`: eigener begrenzter prozeduraler Track (keine DOM-/Fensteraufnahme) geht in den bestehenden liquidglass-Draw. Originale21×14/27×17-Slidergrößen,14px-Trackinset,4px-Track,1.35-fache LiquidKnob-Trackvergrößerung im Compositorfallback, lokale Stärke.85/.65, zwei animierte Switch-/Segmentkanten und ursprüngliche T7-Jig-/OutBack-Zeitachsen. Native Input-/Click-/Keyboardhandler behalten alle Werte und bestätigen Speicherung. Dekorative Linsen sind aria-hidden/pointer-events:none; keine neuen Hitboxen. Lokale Textur nur bei tatsächlicher Trackänderung neu hochladen; keine Zeichen/Passwörter in Texturen. Max32 lokale Quellen,1024×256, gemeinsamer Cleanup/Context-Restore. Reduced/Forced Colors/Classic bleiben bedienbar.

Diagnosebudget für kleine sichtbare Kanten von16K auf begrenzte64K Pixel angehoben; Hardwarebudget500K unverändert, Software-/Unknown-Guard unverändert. **Kein produktiver Software-Liquid-Modus.** Isolierte Diagnose lief ohne `--enable-unsafe-swiftshader`/ohne ausgeschaltete Chromium-Sandbox. Eigene Testuhr nur im Renderer; Main-Uhr und performance.now bleiben natürlich.

A-Abnahme: **496/496 Tests**, echter Linux-Electron44.9.3-Drei-Größen-Lauf inklusive Shaderkompilierung, Refraktion-on/off, originaler nativer Slider-/Switchbedienung und bestätigter Pref-Speicherung, Context Loss/Restore, Idle, M1/M2-Reverse, Classic/Modern, Reduced und Logout. [Messprotokoll](visual/r5/A/material-report.json), [Slider gehalten](visual/r5/A/glass-slider-held.png), [Switch](visual/r5/A/glass-switch.png), [Tests](visual/r5/A/tests.tap). Keine Hardware-GPU-Abnahme.390px ist ein CDP-Rendererviewport.

## Quellen

MacShell fixiert auf `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`. Bestehende Originalquellen und MIT/OFL/GPL bleiben erhalten; neue originale Quellen/Bytehashes: [Manifest](../third_party/r5/provenance.json), [MIT](../third_party/r5/LICENSE), [NOTICE](../third_party/r5/NOTICE). QML-Referenzen zählen allein nicht als Integration. Tatsächlich laufende Zielpfade: `scripts/build-glass2-shaders.cjs`, `air-desktop-glass.js`, `air-glass-controls.js`, `src/core/macshell-fidelity.js`. Neue Randdetailmischung ist eine dokumentierte Electron-Compositoranpassung, keine behauptete originale Qt-Callsite.

B/C/D/E werden nach ihren tatsächlichen Prüfungen ergänzt. Noch kein R5-Installer gebaut.
