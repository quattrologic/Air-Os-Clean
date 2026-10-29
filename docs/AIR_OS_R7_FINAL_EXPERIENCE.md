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
