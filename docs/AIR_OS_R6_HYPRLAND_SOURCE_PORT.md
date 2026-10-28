# Air-OS R6: Source-Port-Nachweis

Branch: feat/air-os-r6-macshell-hyprland. Basis: 7c3fc8dc8eb6e55bcd709bd007be79e3537d108e.
Produkt-/Buildcheckpoint: 58e395966d2699a707eac6fa5a8fa5860bb4ce66. Windows-Abnahme: siehe [Ergebnisbericht](AIR_OS_R6_REFERENCE_MATCH.md).

## Fixierte Originale und Lizenzen

| Projekt | Commit | Lizenz / Nachweis |
|---|---|---|
| Hyprland | 0aa6745f705f2c4b0a5004eb019ef76e5bbdb426 | BSD-3-Clause, Copyright 2022–2026 vaxerski; [vollständiger Text](../third_party/hyprland/LICENSE), [NOTICE](../third_party/hyprland/NOTICE) |
| MacShell | 1bdb51870b621100fd2709f66c8f8e00ab17b9c4 | MIT, Copyright 2026 Rickky; [Text](../third_party/r6-macshell/LICENSE), [NOTICE](../third_party/r6-macshell/NOTICE) |
| MacTahoe GTK | 1e45e19f510edb8cde18fa84d6cd5319f60b086b | MIT; vorhandenes third_party/tahoe/gtk |
| MacTahoe Icons | 839848b9a8a38a92a6936e30c4abe35cc6f2546d | GPL-3.0; vorhandene getrennte Quellen/COPYING/AUTHORS |

Exakte Originalpfade und SHA-256 jedes gebündelten Originals: [Hyprland](../third_party/hyprland/provenance.json), [neue MacShell-Auszüge](../third_party/r6-macshell/provenance.json), [Tahoe](../third_party/tahoe/provenance.json). Git erhält diese Originalbytes auch unter Windows unverändert. R6 bündelt 27 Hyprland-Referenzdateien und 5 zusätzliche MacShell-Quelldateien. Nicht alle Referenzdateien werden als Port gezählt.

## Tatsächlich ausgeführter Port

Hyprland-Pfade sind relativ zum fixierten Repository; Shader unter src/render/shaders/glsl/.

| Originalquelle | Übernommener Algorithmus | Air-OS-Ziel / echter Aufruf | Notwendige Anpassung / Test |
|---|---|---|---|
| acrylicfinish.frag; src/render/gl/blur/Acrylic.cpp; src/config/values/ConfigValues.cpp; cm_helpers.glsl | Achtstufige verschachtelte SDF-Profiltiefe, Profilnormalen, beschränkte UV-Reise, Clarity, RGB-Aberration, Absorption, Fresnel, Licht/Kaustik, sRGB-Transfer | scripts/build-hyprland-shaders.cjs → hyprland-shaders.js → air-desktop-glass.js, auswählbares Acrylic/Hybrid-Material | WebGL2/GLSL ES300, feste SDR-sRGB-Transferfunktionen, lokale logische Pixel und Air-SDF für konkaves Dock/Island. Kein HDR/ICC/Wayland. Reale Shaderkompilierung und Pixelvergleich mit ausgeschalteter Refraktion. |
| blur1.glsl, blur2.glsl | Dual-Kawase, 5 Taps / Gewicht8 und 8 Taps / Gewicht12, Vibrancy0.1696 | Dieselbe Engine, derselbe Framebuffer, bestehender Texturcache; Acrylic wählt Kawase | Ein begrenzter Halbierungslevel, Radius8; normalisierte UV-Wrappers statt nativer FBO-Atlas-Koordinaten. Gaussian-Preblur bleibt erhalten. Kein zweiter Renderer. |
| glassFinish.glsl, blurFinish.glsl | Normalenbasierter UV-Versatz, Emboss, Finish/Noise | Material hyprglass im selben Renderer | Eigene Air-Maske und Wallpapertextur; keine Gleichsetzung mit Snell-Liquid-Glass. Tatsächlicher Compile/Render-/Pixelnachweis. |
| src/layout/algorithm/tiled/dwindle/DwindleAlgorithm.cpp | Rekursive Splitformel Dimension/2×Verhältnis; Achse und Clamp | src/core/hyprland-layout.js → vorhandener air-window-system.js-Reflow | Einfacher neu aufgebauter Splitbaum für interne Air-Fenster; kein vollständiger nativer Tree-Editor. Originalsplit mathematisch portiert, nicht C++-Objektmodell. Unit-Geometrie und echte Fenster. |
| src/layout/algorithm/tiled/master/MasterAlgorithm.cpp | Linker Hauptbereich, vertikale Nebenfenster | Derselbe interne Owner, optionaler Mastermodus | Nur linke Standardausrichtung, nicht alle nativen Konfigurationsvarianten. Ratio0.2–0.8; echte GUI/M2. |
| src/layout/algorithm/tiled/monocle/MonocleAlgorithm.cpp | Aktives Fenster füllt Arbeitsbereich | Derselbe Owner; andere interne Fenster inert/verborgen | Unter unmöglichen Mindestgrößen auch sicherer Tiling-Fallback. Floating bleibt Standard und wiederherstellbar. |
| src/animation/AnimationManager.cpp, updateVariable | begin+(goal-begin)×POINTY | airHyprLayout.interpolate pro Geometriewert während endlichem RAF | Originale lineare Interpolation; 180ms sind Air-Anpassung. Keine Übernahme des nativen 500µs-Timers. Kein Eingriff in M1/M2-Transform-Timelines. |
| MacShell/MacWidgets.qml, WidgetVisual.qml, PlayerWidget.qml (bereits vorhanden) | Raster/Größen, echte Callsite playerScale0.8 → contentScale → k; Artwork/Text/Buttons in RU | Bestätigtes Reference-Preset, src/core/macshell-shell7.js → air-widget-views.js | Neue Konfiguration nur nach zweiter Bestätigung, vorherige Widgets/Pins/Materialeinstellung gesichert und restaurierbar. Player-Ausschnitt nach sichtbarer Nutzerreferenz korrigiert. |
| MacShell/WeatherWidget.qml, WeatherHourCol.qml, WeatherIcon.qml | Stadt/Temperatur/High-Low/Stundenkomposition, originale Canvas-Zeichenfunktionen | air-weather.js, src/core/weather-glyphs.js | Reale eigene Open-Meteo-API statt Quickshell-Dienst. Kleine Variante ohne Stundenstreifen; große Variante ohne originale vollständige 5-Tage-Liste. Keine automatische Geolocation. |
| MacShell liquidglass.frag, dockglass.frag, contourglow.frag / bestehende R5-Ports | Bestehende Snell-, Dock-, Kontur-, Linsen-, Tintcard- und Feather-Funktionen | GLASS-3 und vorhandene App-/Control-/Widget-/Popover-Pfade | Weiterverwendet; kein erneuter Originalport behauptet. Default MacShell bleibt; Hybrid kombiniert vorhandenen Gaussian mit genau einem Acrylic-Finish. |
| MacTahoe src/actions/22/view-grid.svg | Ein unverändertes zusätzliches generisches GPL-Icon | Zentrales src/core/tahoe-icons.js-Mapping → Workspaceauslöser | 56 vorhandene zentrale Quellassets einschließlich dieses Icons; ursprüngliches Air-OS-Hauptlogo bleibt. Keine Markenicons aus Nutzerbildern kopiert. |

Acrylic-Callsites: Refraction24px, Bulb48px, Clarity0.82, Aberration0.025, Tint0x14EEF5FF (Alpha als optische Tiefe −ln(1−20/255)), Strength1, Noise0.0117, Brightness1. Air-PixelScale korrigiert Ableitungen bei begrenzter Rasterauflösung/DPR. GlassFinish verwendet Refraction20 und Roughness1; die konkrete Materialauswahl ist eine Air-Integration.

## Architektur, Zustände und Datenschutz

- Renderer: vorhandene Registry/openApps/Lifecycle/MRU; optionale Dwindle/Master/Monocle-Modi und vier interne Arbeitsbereiche. ACK-basierte serialisierte Präferenzupdates; keine zweite Window-Engine.
- Main: bestehende Main-Window-/Main-Frame-/Session-Prüfung vor und nach asynchronen Aufrufen. Weather-Cache/Stadt dürfen nur über den begrenzten Wetteradapter geschrieben werden.
- Optionaler Linux-Adapter: offizieller Socket2-Vertrag aus src/ipc/s2/S2.cpp und Unix.cpp. Der Node-Client ist eine eigene Plattformanpassung, kein ausgeführter Wayland-Code. Nur nach nativer Bestätigung; uid-eigene kanonische Runtime-Verzeichnisse, keine Symlinks,1.5s Connect-Timeout,64KiB Puffer/Chunk,4KiB Zeile und200Events/s Grenze. Nur numerische workspacev2-ID und Monitoränderung werden weitergegeben. Fremde Titelereignisse werden sofort verworfen, nichts protokolliert; der Consent erklärt den gemeinsamen Stream. Stop bei Widerruf, Navigation, Logout, Quit. Windows/macOS deaktiviert. Kontrollierte Sockettests sind kein nativer Hyprland-Hosttest.
- Wetter: feste HTTPS-Hosts, keine Redirects/Schlüssel,6s Timeout,512KiB Antwortlimit, explizite Stadtwahl, profilgebundener Cache, keine Standortabfrage und kein Hintergrundpolling. Open-Meteo-README bestätigt kostenlosen privaten/nichtkommerziellen Zugang und CC-BY-4.0-Daten mit Attribution; GeoNames-Hinweis im Setup. Keine AGPL-Serverimplementierung übernommen. Lokaler Livezugriff HTTP403-blockiert; echter öffentlicher Berlin-Abruf im nativen Windows-Runner erfolgreich (Evidenz im Ergebnisbericht). [Anbieter](https://open-meteo.com/), [Upstream-Nutzungsangaben](https://github.com/open-meteo/open-meteo#readme). Kommerzielle Freigabe nicht behauptet.

## Ausdrücklich nicht portiert / nicht freigegeben

Hyprland Shadow/InnerGlow/Prism/Frost/Border-Referenzen, WorkspaceAnimationController/OkLab und AnimatedVariable-Objektmodell sind nicht als neue ausgeführte Funktionen gezählt. Scrolling-Layout, vollständige Dwindle-Baumeditoren, native Compositor-Workspaces, DRM/KMS/wlroots/Wayland-Rendering und systemweite Fremdfenstersteuerung fehlen bewusst. Keine native Hyprland-Pflichtabhängigkeit, kein WSL.

Backdrop bleibt eigenes Wallpaper und bestehende prozedurale Control-Tracks. Keine fremden Fenster-/Desktopaufnahmen. CSS-Fallback ist Chromium-Blur, keine Snell-Refraktion. Neue große MacLock-Cover-/Benachrichtigungs-Komposition ist offen; bestehende sichere lokale Anmeldung/private Cleanup-Verträge bleiben unverändert.
