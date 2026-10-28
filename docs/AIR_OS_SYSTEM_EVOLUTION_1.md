# Air-OS System Evolution1

Basis `d6af14b2089db5f35386da2969d13b4e558d8fba`; Branch `feat/air-os-system-evolution-1`. Geprüfte Checkpoints werden unten ergänzt. Keine produktive Releasefreigabe.

## A — gemeinsamer Materialpfad

Vorhandene GLASS-3-Engine erweitert, keine zweite Engine. Dock-/Widget-/Islandprofile aus8A unverändert. Originale GlassSlab-Parameter auch auf Control-Center-Kacheln, Menüs, Fensterwechsler, geeigneten Toolbars und Launchpadhosts. Bestehende Snell-/Squircle-/Dispersion-/Rim-/Meniskus-Formeln aus liquidglass/dockglass und contourglow bleiben erhalten.

MacDock `glassBlur5+8=13`, MacWidgets `5+11=16`, FeatherBlur `radius9`, Island/Popover5, Control0 laufen jetzt als **pro Szenentextur/Radius gecachter separabler WebGL2-Framebuffer-Prepass**. Zwei17-Tap-Passes bei halber Szenentexturauflösung, danach Mipmaps. Das ist eine bewusste Gaussian-Approximation des Qt-MultiEffect-Kernels, keine behauptete Pixelgleichheit. Der bisherige pauschale2px-CPU-Blur entfällt. Kein zusätzlicher Idleloop; ein Kontext, bestehender Renderer, drei Materialprogramme plus ein Prepassprogramm. CornerBorder-Farbmischung, sechs Fade-Stops und0.8px-Linie tatsächlich auf Canvasmaterialien ausgeführt. Konkave Dock-/Islandmasken bleiben maßgeblich.

**Quelle ausschließlich aktives Wallpaper**, keine eigenen/fremden Fenstertexturen und kein Systemcapture. Software-/unbekannte GPUs bleiben im CSS-Fallback; isolierte SwiftShaderdiagnose ist kein Hardwarebeleg. CSS-Blur ist keine Snell-Refraktion. Die vorhandene MacLock-Shaderpipeline bleibt getrennt und unverändert; lokale Tracklinsen der Qt-Slider/Switches, tintcard-Albumtransition, FeatherBlur-/EdgeBlur-Inhaltsmasken sind noch nicht integriert. Nur gespeicherte Originaldateien werden ausdrücklich nicht als implementiert gezählt. Herkunft/Bytehashes/MIT: [Manifest](../third_party/evolution1/provenance.json), [NOTICE](../third_party/evolution1/NOTICE).

A-Abnahme: **470/470 Node-Tests**,297 Runtimeassets. Echter Linux-Electron44.9.3-Lauf mit synthetischen Profilen bei1920×1080/1650×930/390×600: originaler sicherer Softwarefallback, isolierter Shaderpfad, Context Loss/Restore4→0→4, Reduced Glass/Transparency/Motion, Classic/Modern, M1/M2-Reverse und Logout.390px ist ein CDP-Rendererviewport im nativen Mindestfenster, keine iPad-/Hardwareabnahme. [Renderer-Messwerte](visual/system-evolution-1/A/material-report.json), [Tests](visual/system-evolution-1/A/tests.tap). Prepass-/Upload-/Transferzähler und geschätzte Texturbytes sind lokale Diagnosewerte; keine FPS-Zusage.

## B / C

Systemadapter und R4 werden in getrennten geprüften Checkpoints ergänzt. Aktuell keine neue Windows-/macOS-/Hardwareabnahme und noch kein R4-Installer.
