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
