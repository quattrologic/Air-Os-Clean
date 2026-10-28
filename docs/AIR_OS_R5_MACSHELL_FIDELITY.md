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

## B — Widget/PlayerArt und Scroll-under

`PlayerArt.qml` liefert die unveränderte generische Musiknoten-Path2D,512px-Verlauf,#3b3b40/#27272b,0.62-Skalierung sowie Schatten/Prägung. Canvas2D statt Qt MultiEffect: Schattenradius32×.24 und Innenblur6.4 sind bewusst adaptierte Compositorwerte. Kein neues Markenasset. `PlayerWidget.qml` liefert die vorhandene RU-Komposition, jetzt mit der vollständigen Kartenfläche statt einer zweiten Header-/Padding-Verkleinerung; Titel24RU/Künstler21RU, Artwork/Transportpositionen bleiben original. `PlayerBtn.qml`:0.86-Pressedscale,0.6Opacity,180msOutBack. Bestehende originale PlayerGlyph-Zeichenfunktionen bleiben maßgeblich. Glyphwechsel verwendet zwei abbrechbare340msOutCubic-Lagen; keine neue Audioengine.

Echte ausdrücklich ausgewählte, bereits im Air-Music-Transport vorhandene Cover-Blobs werden begrenzt dekodiert, auf16×16 nur für die originale sättigungsgewichtete Palette reduziert und nach Revision geprüft. Kein Dateisystemzugriff, keine fremden Bilder. Originale HSL-Farbfläche mit begrenzter Sättigung. `tintcard.frag` läuft bei Coverdaten als **fünftes, erst dann erzeugtes Programm** im bestehenden Kontext; originale Rounded-Coverage/smoothstep-Scheibe/Premultiplied-Alpha-Mischung. Wichtig: Am fixierten Upstreamstand existiert **keine QML-Callsite für tintcard.frag**. Ihre Verbindung zur Liquid-Playerkarte ist eine Air-OS-Anpassung, keine angeblich ursprüngliche Komposition:480msOutCubic,Alpha0.42×0.55,34pxSoftness. Der CSS-Modus führt dieselbe Farbausbreitung begrenzt in Canvas2D aus. Keine Cover: originale graue Musiknote statt erfundenem Album. Schnelle Wechsel, Fehler, Reduced Motion, Logout und entfernte Widgets räumen Animationen/Bilder auf.

`ClockWidget.qml`/bestehende Clock-Geometrie: tickweise .40/.58-Past- und .12/.28-Ahead-Deckkraft, reale Sekunden,zentrierte64u-Typografie mit.94/1.14-Stretch, realer Wochentag/Datum. Der bestehende Widgettimer tickt nur für das sichtbare Zifferblatt sekündlich; kein zusätzlicher GPU-Loop. Kalender übernimmt#FF453A-Tageskreis; echte Datumsnavigation bleibt beim vorhandenen Controller. Notes/Reminders bleiben echte profilgebundene Air-OS-Daten, nur Listenkomposition/Leerzustände wurden angeglichen.

Das **explizit bestätigte** Preset nutzt jetzt Originalraster21/228 und56/258/460; vorhandene konfigurierte Profile werden nicht automatisch überschrieben.185/395px-Kartenmaße bleiben unverändert.

`FeatherBlur.qml`: komplementäre9-Stufen-smoothstep-Masken,hold52/depth30/blur9/pad24 für Settings; Spotlight adaptiert aufhold0/depth34. Originale scharfe DOM-Inhalte und eine inert/aria-hidden-Blurkopie derselben eigenen Oberfläche; keine Pixelaufnahme, kein GL-Readback. Blurstrip≤106px,≤600Knoten,≤4096physische Breitenpixel; darüber bleibt das Original unverändert lesbar. Formulare werden neutralisiert,Cloudpanel/IDs/Eventattribute/Canvas/Frames/Medien ausgeschlossen. Kopie nur bei Inhaltsänderung neu aufgebaut, Scrollpositionsupdates höchstens einmal pro Frame. Native Controller behalten Fokus/Inputs; keine konkurrierenden Bedienelemente.

CSS-Fallback: Docktönung0.231,Widgetverlauf0.42 statt zusätzlicher deckender Schichten,neutrale.42-Island/Popovertönung,feine obere Reflexe/Innenkante. Geometrie/M1/M2 unverändert. Reduced Transparency wird opak und ohne Blur; Forced Colors nutzt Systemfarben. **CSS-Blur ist keine Snell-Refraktion.**

## C — tatsächliche Korrekturrunde

Der erste integrierte Screenshot zeigte eine vom Alt-CSS verschobene Uhr,einen zu tiefen Lautstärkeregler und bei schnellem Play/Pause übriggebliebene Glyphlagen. Produktcode korrigiert: spezifische originale Zentrierung,5%-Trackinset/7px-Unterrand,sauberer Abbruch und Entfernen veralteter Glyphlagen. [Erste Integration](visual/r5/first-integration/desktop-1920.png) bleibt als Nachweis erhalten. Keine nachbearbeiteten Produktbilder.

| Bereich | Referenz / Abweichung | Korrektur und verbleibende Grenze |
|---|---|---|
| Glasrand/Refraktion | liquidglass/dockglass; zu stark vorgefilterte Kanten | originale Snellrechnung plus kantenabhängige Detailquelle;Wallpaper-only |
| Alpha/Transparenz | GlassSlab/WidgetVisual; CSS-Zusatzabdunklung | einzelne klare Tönung;CSS ohne optische Brechung |
| Widgets innen | Clock/Calendar/PlayerWidget | Originalticks/RU/PlayerArt;Air-OS-Header und Notesdaten bleiben |
| Dock/Island | MacDock/GlassSlab | Originalmaterial/Detaillicht;bewusst eigene gerade/konkave bzw.Island-Silhouette |
| Controls | GlassSlider/Switch/Segmented/LiquidKnob | lokale prozedurale Trackquelle;kein Capture fremder Flächen;native Eingaben bleiben |
| Scroll-under | FeatherBlur | komplementäre bounded DOM-Compositorschichten;Inputs neutral statt Qt-Pixelsource |
| Menüleiste/Apps | bestehender MacBar/MacTahoe-Port |26px und Dark-Sidebar/Light-Workspace erhalten;kein kompletter Neubau |
| Animationen | PlayerBtn/Glyph/Clock,bestehende M1/M2 | finite abbrechbare Übergänge;keine unbelegte60fps-Aussage |

Originalreferenzbilder aus dem Upstream-README wurden angefragt; der verfügbare Netzwerkpfad beantwortete die GitHub-user-attachments-URL mit403. Daher **Quellcodevergleich und reproduzierbarer R4/R5-Bildvergleich**, keine behauptete direkte Pixelabnahme gegen eine ausführbare MacShell-Originaloberfläche. Keine Pixelgleichheitsquote.

B/C-Nachweis: echte Electron44.9.3-Läufe bei1920×1080,1650×930,390×600 mit tatsächlich eingelesenen CC0-MP3s/64px-PNG-Covern. [Shaderlauf](visual/r5/B/material-report.json): max5Programme inklusive tintcard,aktiveLinsen,0IdleDraws im700ms-Fenster,ContextLoss/Restore,erfolgreiche native Range-/Switchbedienung mit bestätigter Speicherung,komplementärer Scrollmaskenlauf(scrollTop38,1aktiveinertKopie). [Normaler CSS-Lauf](visual/r5/C/material-report.json):0GL-Programme,echter Softwareguard. [Vergleichsbasisszenen](visual/r5/before-final/),[Nachher](visual/r5/C/),[echte Shaderbilder](visual/r5/B/). Identischer synthetischer Rendererzeitpunkt2026-10-28T12:34:30Z,identische ausgewählte Widgetpositionen,Main-/Performanceuhr unverändert. Diagnose ist SwiftShader,keine Hardwareabnahme.

Im festen Dock-Rechteck(755,1013–1167,1080) beträgt die mittlere absolute RGB-Abweichung von Refraktion an/aus beim R4-Diagnosebild1.949 und nachR5-A3.986(8bit-Kanalwerte). Das ist ein Bildnachweis stärkerer sichtbarer Wirkung im isolierten synthetischen Renderpfad,keine FPS-/Hardware-/Pixelgleichheitsbewertung. R5 nutzt hier ein64K- statt16K-Diagnosebudget; dieser Unterschied ist Teil der dokumentierten Kantenqualitätskorrektur.
