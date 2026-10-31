# Air-OS × InfinityOS / Origin · funktionale Integration 1

## Gesicherter Stand

- Branch: `feat/air-os-infinityos-origin-port-1`.
- Desktopbasis: tatsächlicher Remote-HEAD `02ccaf88724731cf685d2221f88e959020aff3f0` von R7.
- Abgenommener Quell-/Testcommit: `d299a706fe95a59a0f8458126c8d9fd4c5ed5b07`. Letzte Produktkorrektur: `a1f0c92a4f2c561f4d9b5656232c2c70518f03b5`.
- Geprüfte Bilder/Messwerte gesichert in `1e773c77b3409f880d6304ac50646fc219416be2`; anschließender Berichtcommit ändert keinen Produktcode. Finaler Branch-HEAD siehe Git-Historie/Abschlussnachricht, kein selbstreferenzieller SHA im Commitinhalt.
- [Vollständig erfolgreicher Linux-Electron-CI-Lauf](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41196045500): Pflichtaudit, Source-/Syntaxprüfung, **566/566 Regressionen**, **56 echte Produkt-GUI-Prüfungen**, vier Vorher-Szenen und vier separate Materialprüfungen.
- [Screenshots, Testprotokoll und vollständige CI-Artefakte](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41196045500/artifacts/13040591834). [Geprüfte Messwerte und 41 direkte Rendererbilder](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/evidence.json).

**Direkt kopierte Originaldateien aus dem Nutzerarchiv: 0.** Origin-Rechte sind nicht ausreichend belegt; eine GPL-Übernahme aus Blur My Shell ist für den Gesamtbuild nicht geregelt. Die neuen Funktionen sind eigenständige Air-OS-Implementierungen der beauftragten funktionalen Anforderungen. Die vorhandenen erlaubten MacShell-/Hyprland-Materialien und Air-OS-Controller werden tatsächlich weiterverwendet. Dies ist keine Behauptung eines 1:1-Origin-Codeports.

Keine Änderungen an main, keine Websitebereitstellung, kein Release, keine fremden Laptop-/Cloud-Daten. Der iPad-Branch bleibt separat unverändert bei `1deb36a2e77107897cd277d07bdd09140697da9d`.

## Tatsächlich bedienbare Funktionen

### Stage-Übersicht und Gruppen

**Fenster → Stage-Übersicht** oder **Strg+Alt+S** innerhalb von Air-OS. Nur echte interne Fenster des aktuellen Arbeitsbereichs werden angezeigt. Die Miniaturen zeigen skalierte, zentrierte Fenstergeometrien und Registryicons, keine Screenshots oder DOM-Kopien privater Fensterinhalte.

Fenster über 44px-Auswahlzeilen auswählen → gruppieren; Gruppen lösen; per Pfeilbuttons, Strg+Pfeil links/rechts oder Pointer-Drop sortieren. Der Arbeitsbereich lässt sich in derselben Ansicht wechseln. Fensteraktionen fokussieren/wiederherstellen das bestehende Fenster über den vorhandenen Lifecycle/M2, erzeugen keine Duplikate.

Der **freiwillige Stage-Modus** zeigt die aktive Gruppe und eine Gruppenleiste. Andere Gruppen werden im vorhandenen Window-System ausgeblendet/inert gesetzt, weder geschlossen noch als zusätzlich minimiert gespeichert. Ausschalten stellt ihre Sichtbarkeit und in Floating dieselben Fenstergeometrien wieder her. Die Leiste ist ein Overlay, reserviert keine neue Work-Area. Gruppen und Reihenfolge werden erst nach bestätigter Main-Speicherung wirksam; beide Einstellungen bleiben pro Profil nach Neustart erhalten. Standard bleibt ausgeschaltet.

Pointercancel, verlorene Capture, Resize, Blur, Visibility, Appclose, Fullscreen, Lock/Profilwechsel und Pagehide räumen Drag/UI-Animationen auf. Tastaturfokus bleibt in der Übersicht; Escape schließt und gibt den Fokus zurück. Classic erhält keine Stage-Oberfläche.

### Vorhandenes Kontrollzentrum und Mitteilungen

Keine zweite Verwaltung: Alle zwölf bestehenden Controls bleiben über die vorhandenen Seiten/den Editor erreichbar. Hinzu kommen geometrische Pfeil-/Home-/End-Navigation und eine Tab-Fokusgrenze im offenen Island-Panel. Kalender- und native Dialognavigation haben Vorrang. Die bestehenden Kalenderaktionen, Musiktransport-/Fokus-/Keep-Awake-/Systemadapter bleiben zuständig; es gibt keine neuen Fake-Schalter oder Gerätewerte.

Kurze endliche Reveals der inneren Kacheln laufen im bestehenden Glascontroladapter. Beim Schließen, Verbergen, Reduced Motion und Profilwechsel werden sie beendet. **M1 bleibt die einzige äußere Island-Timeline.**

Der vorhandene Nachrichtenverlauf bleibt der einzige Store (60 Einträge). Maximal vier sichtbare Banner, bei wenig Höhe entsprechend weniger, anhand realer Kartenhöhen angeordnet. Hover/Fokus pausiert den Ablauf zum Lesen. Escape entfernt das fokussierte Banner; bestehende Öffnen-/Gelesen-/Entfernen-/Leeren-Aktionen bleiben. Fokusmodus räumt nichtkritische Banner weg und behält echte Ereignisse im Verlauf; kritische Fehler bleiben erlaubt. Pro Banner ein eigener abgebrochener Listenercontroller, keine zurückgehaltenen entfernten Karten am Sitzungscontroller. Verlauf/Banner passen in den Viewport und verschwinden beim Logout.

### Intelligentes Dock und M2

Im **bestehenden Dock-Kontextmenü** freiwillig einschaltbar: Intelligentes Dock. Nur tatsächlich sichtbare interne Fenster lösen Überlappung aus. Lifecycle, ResizeObserver, Layout- und Pointerereignisse invalidieren die Prüfung; kein Intervallpolling. Bildschirmkante, Fokus und ein beschrifteter Rückholbutton machen das Dock wieder erreichbar. Die Dock-Fensterübersicht öffnet dieselbe Stage-Ansicht.

Vor einer M2-Zielmessung wird das ursprüngliche Dock synchron über seine vorhandene Lease eingeblendet. Bei Viewportänderung beendet `app.js` ausschließlich bereits laufende M2-Animationen über deren ursprünglichen `settleModernDockMotion`-Pfad, bevor neu geklemmt wird. Das verhindert veraltete Dockziele/Leases. Die normale **410ms-Timeline, Kurve, Reverse, Magnifikation, Pinning und Außenmaske bleiben unverändert**. Der Test hält M2 gezielt an, damit nur das echte Resize-Handling und kein zufälliger Animationsablauf ihn bestehen lässt.

### Gemeinsame Registry korrigiert

Die reale Tastaturprüfung fand eine bestehende Inkonsistenz: reminders, launchpad, store und arcade wurden erst in Renderermodulen registriert. Main lehnte deshalb diese tatsächlich mitgelieferten Apps in Stage-/Workspace-/Fensterpersistenz ab.

Die Metadaten stehen nun in **derselben** `src/core/app-registry.js`; die bisherigen Controller registrieren nur bei Bedarf. Keine zweite Registry, keine neue App oder Datenhaltung. Ein neuer Regressionstest prüft exakt die vorher abgewiesenen Main-Verträge. Appfunktionen, Iconzuordnungen und Nutzerdaten bleiben erhalten.

## Architektur und Ausführungspfade

| Zuständigkeit | Tatsächlicher Pfad |
|---|---|
| Fenster, Fokus, MRU, M2, Workspaces und Layouts | vorhandene `app.js`, `air-window-system.js`, `openApps`/Lifecycle; zusätzliche Stage-Sichtbarkeitsprojektion im selben Owner |
| Gruppen-/Reihenfolgevalidierung und Geometrie | eigenständige `src/core/stage-model.js`; nur Registry-IDs, begrenzte Mengen, keine Inhalts-/Dateipfade |
| Stage-Darstellung/Pointer/Tastatur | `air-stage-overview.js`, `air-origin.css`; abgeleitete Ansichten, keine Kopien echter Appfenster |
| Bestätigte profilgetrennte Persistenz | bestehende Preferences-IPC/Session-/Frameprüfung und atomare `src/main/preferences.cjs`; neue Stage-/Dockmetadaten, keine neue Datenbank |
| Kontrollnavigation/Bannerstapel | eigene `src/core/panel-navigation.js`, vorhandene `air-island.js`/`air-deep-desktop.js` |
| Endliche innere Controlanimationen | vorhandene `air-macshell-controls.js`, nur UI-Reveals; keine Window-/M1-/M2-Ownership |
| Dockoverlap und Vorschauaktionen | bestehende `air-dock-actions.js`, `air-macshell-dock.js`; eventbasierte Invalidierung und bestehende Lease |
| Gemeinsame Glasressourcen | vorhandene `air-desktop-glass.js`, zwei neue Zielselektoren; dieselben Programme, Szenen, Preblurs und GPU-Guards |

Stage-Updates prüfen die Sitzung vor und nach dem asynchronen Schreiben; nach Dispose wird kein alter Zustand angewendet. Unbekannte Felder/Apps, doppelte Gruppenzuordnung, unzulässige Größen/Reihenfolgen werden abgewiesen. Fehler bleiben sichtbar und werden nicht als gespeichert bestätigt. Kein zusätzlicher Node-Zugriff im Renderer, kein neues IPC-Kommando und keine nativen GNOME-/Privatsphärenoperationen.

## Referenz- und Lizenzmatrix

README_START_HERE und CODEX_MASTERPROMPT vollständig gelesen. Ausschließlich außerhalb des Repos entpackt. **70/70 Hashes und Bytelängen, insgesamt 640.973 Referenzbytes, stimmen.** [Eigene Auditmetadaten mit Archiv-/Datei-SHA-256, ohne Quellinhalt](build-evidence/infinity-origin/reference-audit.json). Der ISO-Extrakt liefert keine nachvollziehbaren Origin-Upstream-Commits und keine allgemeine Wiederverwendungsfreigabe.

| Originalreferenz / Funktion | Rechte und technische Grenze | Entscheidung / Ziel | Nachweis |
|---|---|---|---|
| Origin@appscreen animationEngine/config/minimize/unminimize | keine vollständige fileweise Copyright-/Lizenzkette; GNOME Actor/GLib | keine Kopie/LUT-/Kurvenübernahme; bestehendes M2 und eigenes Cleanup | native M1/M2-/Resize-Tests |
| stageManager, stageManagerStageScroll | Lizenz unklar; native Shell-Fensterobjekte | eigene Stage-Modelle und UI auf bestehendem Window-System | origin-stage.test.cjs; native Gruppierung/Pointer/Tastatur/Profile |
| OriginUICC remakeQS/DateMenu/Overview/Dialogs, Styles | teilweise ungeklärt, zwei leere Dateien; GNOME-Privat-APIs | eigene Navigation/Reveals im bestehenden Center; Kalenderowner behalten | origin-panels.test.cjs; zwölf Controls, Escape/Tab |
| remakeNotificationBanner | SPDX GPL-2.0-or-later nur in dieser Datei | keine Adaption; vorhandenen Air-OS-Dienst erweitern | Fokus, Pause, Escape, Queue und Logout in echter GUI |
| Blur My Shell Gaussian/Noise/Corner/Color/Down-/Upscale | GPLv3-Text; Gesamtbuild-/Copyleft-Pflichten nicht geregelt | **kein GPL-Shaderport**; erlaubte vorhandene MacShell-/Hyprland-Pipeline wiederverwenden | echte Stage-Shader-/Pixel-/Context-/Cleanup-Diagnose |
| OriginUIPrivateMode/privateModeLiquidGlass | ungeklärte Lizenz; Zoom/Welle statt Snell; privilegierte Extension | nicht kopiert/ausgeführt; keine Privatsphärentoggles | keine dieser Quellen in 374 produktiven Runtimeassets |
| Dash-to-Dock intellihide/windowPreview/appIconIndicators | Lizenz/NOTICE im Extrakt fehlen | eigene Overlap-/Vorschau-/Indikatorintegration auf bestehender Registry | Overlap-Unit, echtes Dock/M2-Lease-Rendering |
| Radience/Plymouth | nur Index/Konfiguration; keine nutzbaren Iconassets | nicht eingebunden | Air-OS-/Tahoe-Assets unverändert |

MacShell-MIT, MacTahoe-MIT/GPL-Icons, Hyprland-BSD und bestehende Schriftlizenzen bleiben unverändert. Neue eigene Implementierungen sind keine Umdeklaration fremder Quelltexte. Die Referenzquellen wurden weder als Produktabhängigkeit, Buildasset, Screenshot von Quellcode noch als öffentliches Sourcepaket ausgeliefert.

## Glas und gemessene Performance

Die Übersicht nutzt das bestehende Switcher-/GlassSlab-Profil, die Rail das Popover-Profil. Kein neues Shaderprogramm für Stage, keine zweite Engine. Bestehende passende MacShell-Werte bleiben: thickness25,6, dispersion0,078, blurPx1,5, tintMix0,231, saturation1,25, rim0,1125, grain0,006, magnify0,08, shadowAmt0, flatInner1, dark1, ringW0 und rimTint1. Diese Profile stammen aus dem bereits dokumentierten erlaubten Port, nicht dem ungeklärten ISO-Code.

CSS-Fallback: transparente Tönung/Lichtkante, ein Compositor-Blur; auf aktivem Shaderpfad kein doppelter CSS-Blur. Reduced Transparency wird opak. Herkunftsschutz, GPU-Klassifikation und Wallpaper-only-Backdrop unverändert. Kein Live-Fensterrefraktionsversprechen.

| Messung | Tatsächliches Ergebnis im finalen Linux-CI |
|---|---|
| Normalpfad | Software-GPU, css-fallback, Grund software-gpu; 0 GL-Programme/GL-Texturen/Draws |
| Isolierter Softwarepfad | aktive Originalmaterialprogramme, 4 gemeinsame Programme und 5 Texturen; **keine Hardwareabnahme** |
| DPR1 / DPR2 / DPR3 | Texturgrenzen eingehalten; geschätzte GL-Texturbytes16.132.779 /42.705.792 /42.705.792 |
| Paint-Walltime der aufgenommenen Samples | 70 /142 /96ms; Softwarediagnose, keine FPS-/Hardwareaussage |
| Kumulierte Canvas-Transfer-Walltime | 18 /22 /27ms in den jeweiligen Samples, keine Zeit pro Frame |
| Idle nach endlicher Übergangsruhe | 0 zusätzliche Shaderdraws im separaten800ms-Messfenster |
| Pixelwirkung auf eigenem Linienwallpaper | 50.463 geänderte Pixel im461×141-Stagecanvas, mittlere absolute RGB-Differenz15,8908 beim An-/Ausschalten von Brechung/Dispersion/Magnify |
| Context Loss/Restore | Programme freigegeben und Materialpfad wiederhergestellt |
| Profile-Lifecycle-Cleanup | Programme0, Texturen0, Tiles0, pendingfalse |

Die Pixeldifferenz misst die echte Reaktion des Shaderoutputs auf Materialuniforms, **keine Originaltreuequote**. Keine privaten Fensterpixel im Testwallpaper. Ein normaler Fallback-Snapshot enthielt noch eine CPU-Invalidierung (`pending:true`), aber keine GL-Ressource/Draws; daraus wird keine vollständig schlafende Renderer-CPU behauptet. Speicherzahlen sind Texturschätzungen, keine RSS-/VRAM-Hardwaremessung.

## Geometrie und echte Abnahme

Alle bisherigen557 Desktoptests erhalten, neun neue: **566/566**. Pflichtaudit der vorhandenen eingefrorenen Toolchain und vollständiger Source-/Testgate in CI bestanden. Keine neue Produktionsabhängigkeit. Electron **44.9.3** tatsächlich am User-Agent geprüft; Sandboxhelper regulär eingerichtet, kein `--no-sandbox`/GPU-Guard-Bypass.

56 neue tatsächliche GUI-Prüfungen: Gruppen, Tastaturreihenfolge, Pointer-Drop, tatsächliche emulierte Touch-/Touchcancel-Ereignisse, Workspacewechsel, Floating/Dwindle/Master/Monocle, Snap, echtes Main-F11/Exit, M1/M2-Reverse, pausiertes M2 bei Resize, alle zwölf Controls, Fokus/Bannerpause, Docküberlappung/Lease, Reduced Motion/Transparency, Classic, zwei Profile, Neustart und Logout. Keine unbehandelten Rendererfehler in den geprüften Szenen. Die Shaderdiagnose ist separat und nicht mit dem Produktfallback vermischt.

| Viewport | Menüzeile | Maximierter Finder: x/y/Breite/Höhe | Unterkante |
|---|---:|---|---:|
|1920×1080|24|0 /24 /1920 /1056|1080|
|1688×896|24|0 /24 /1688 /872|896|
|1650×930|24|0 /24 /1650 /906|930|
|390×600|24|0 /24 /390 /576|600|

Host-, Menü-, Dock- und Island-DOMRects sind bei allen vier Größen **identisch zur R7-Baseline**. Dock bottom=Viewporthöhe; Island top=0. Keine neue Dockreserve und keine geänderten Außenmasken. Native Xvfb-Fenstergrößen plus CDP-Renderergrößen;390px ist ein schmaler Renderer-Testviewport, keine physische Gerätegröße.

## Bilder und visuelle Korrektur

Alle Bilder sind direkte Electron-Rendereraufnahmen mit synthetischen lokalen Konten/gleichen Appabläufen. Unterschiedliche reale Uhrzeiten, keine nachträgliche Bildretusche oder behauptete Pixelidentität. Es lag kein ausführbares InfinityOS-Referenzdesktopbild aus diesem Paket vor; der Vergleich ist Air-OS R7 vor/nach der Implementierung.

| Szene | Nachweis |
|---|---|
| Desktop1920 vorher/nachher | [Vorher](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/before/desktop-1920.png) · [Nachher](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/desktop-1920.png) |
| Gruppierte Stage | [Gruppen und Rail](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/grouped-stages.png) |
| Schmale Übersicht | [390×600, ein erreichbarer Scrollbereich](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/stages-390.png) |
| Kontrollzentrum | [Vorher](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/before/control-center-1920.png) · [Nachher](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/control-center-1920.png) |
| Echtes Fullscreen | [Finder und sichtbarer Rückweg](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/native-fullscreen.png) |
| Überlappendes Dock | [Ausgeblendet mit Rückholbutton](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/overlap-dock-hidden.png) |
| Benachrichtigungen | [Begrenzter echter Appereignisstapel](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/notification-stack.png) |
| Shaderdiagnose | [Linienwallpaper/DPR1](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/materials/stage-shader-dpr-1.png) |
| Reduzierte Transparenz | [Opake Stage-Fläche](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/reduced-stage.png) |
| Logout | [Neutraler MacLock](visual/origin1/d299a706fe95a59a0f8458126c8d9fd4c5ed5b07/after/neutral-maclock.png) |

Die erste Bildkontrolle fand zu kleine Klickziele, einen Label-/Drag-Konflikt, kleine Vorschauen und unnötig leere Panelhöhe. Tatsächliche Produktkorrekturen:44px-Auswahlzeilen, Labelausschluss vom Drag, zentrierte Gruppenausschnitte und passende Panelhöhe. Die zweite Bildkontrolle bestätigte größere Vorschauen, funktionierende Gruppierung und erreichbares mobiles Scrollen. Frühere Debugbilder/CI-Läufe sind ausdrücklich unvollständig/fehlgeschlagen markiert und keine Abnahmebelege. Ein zuerst unzulässiges SVG-Testwallpaper wurde durch selbst erzeugte PNG-Pixel im bereits erlaubten Pfad ersetzt; Herkunftsschutz blieb erhalten. Weitere Harnessfehler wurden behoben, keine Prüfung deaktiviert.

## iPad und verbleibende Grenzen

| Teil | Portfähigkeit / tatsächlicher Status |
|---|---|
| Stage-/Panelmodelle | Browser-Realm-Test ohne Node/Electron bestanden; reine Logik portfähig |
| Stage-Pointer/Touch | Linux-Electron mit echten emulierten Pointer-/Touchcancel-Ereignissen geprüft; kein Pencil-/WebKit-Hardwaretest |
| PWA-Integration | **Nicht übernommen.** Browserpreferences, Safe Areas, Offlineupdates und WebKit müssen auf separatem iPad-Portbranch geprüft werden. Der bestehende iPad-Branch bleibt unangetastet |
| Desktopauth/native F11/Keep Awake | bestehende Electron-Verträge; nicht als iPadOS-Funktionen vortäuschen |
| Origin/GPL-Direktport | weiterhin Lizenz-/Verteilungsfreigabe nötig; keine neuen unklaren Quellabhängigkeiten |
| Vorschauen | schematisch, keine Live-Inhalte; keine Fremdfenster-/Desktopaufnahme |
| Stage-Umfang | Auswahlgruppierung, Reorder und vorhandene Workspaces; kein Drag-out in native OS-Fenster, keine systemweite Stage-Verwaltung |
| Hardware/Plattform | neue Windows-/macOS-GUI, physische GPU, iPad/Safari/Pencil und Mehrmonitorhardware offen |
| Installer | kein neuer Windowsinstaller in diesem Auftrag; vorhandene R7-Buildkanäle unverändert |

Bestehende Notes-/Finder-/Reminders-/Kalender-/Musik-/Cloud-Sicherheitsregressionen sind Teil der vollständigen Node-Suite. Die neue GUI speichert eine echte synthetische Notiz und prüft die beschriebenen Shellabläufe; daraus wird keine neue vollständige Hardware-/Picker-/Audio-/Cloudabnahme dieser Apps abgeleitet. Keine Cloudanmeldung, keine Datenmigration, keine neuen nativen Dateirechte.

## Git-Checkpoints

| Commit | Inhalt |
|---|---|
|e22fc8a|Stage-Vertrag/Übersicht/Persistenz,562 Tests|
|ab56a14|Controlnavigation, Banner, intelligentes Dock,564 Tests|
|8f71bcd|gemeinsame Stage-Glasflächen und Diagnosepfad|
|26ed2ae|Pointer-/Banner-Cleanup und Browser-Realm-Modelltest,565 Tests|
|874aa0c|M2 bei Viewportänderung beenden|
|d8c11de|echte visuelle Korrektur aus Rendererbildern|
|a1f0c92|Main-/Renderer-Registry korrigiert,566 Tests|
|d299a70|vollständig abgenommener Quell-/Teststand,56 GUI-/4 Materialprüfungen|
|1e773c7|geprüfte finale Rendererbilder/Messwerte, kein Produktcode|

Danach ausschließlich Abschlussdokumentation. Kein Merge auf main, kein Deployment und keine weiterlaufende Entwicklungsphase nach diesem Checkpoint.
