# Air-OS R6.1 — Vollbild und vollständige Fensterfläche

- Branch: `fix/air-os-r6-true-fullscreen`
- Verbindliche Basis: `2e43327423abcce56da464789e01bf92ff7345f0`
- Produktkorrekturen: `f59d5a513da9b75f75132634fb9c48bf61c7971c`
- Build-/Prüfcommit: `874082788fa803b02c198deae3b7f676fcf11332`. Native Windows-Abnahme vollständig bestanden.
- Erster geprüfter Hotfix `49ee7eef61f80d2f889e6f7672e5d1b654f8f3d5` wurde weiterverwendet.

## Tatsächliche Ursache

Der Windows-Nutzerscreenshot zeigt ein intern maximiertes Fenster unter einer weiterhin nativen Windows-Titelleiste. Das waren zwei unterschiedliche Zustände. Zusätzlich begrenzten die **tatsächlich aktiven R6-Regeln** den Fensterhost: Desktopbeginn bei 31px, weitere 62px Islandreserve und 76px Dockreserve unten. Die ältere Regel `.windows { inset:8px 12px 86px }` war vorhanden, aber nicht die letzte wirksame Geometrie. Maximieren mit 100% füllte nur diesen verkleinerten Host.

Die unveränderte Basis wurde zusätzlich tatsächlich in Electron ausgeführt und vermessen. Die DOM-Messwerte stammen aus diesem Lauf; aus dem bereitgestellten Windows-Bild werden keine angeblich gemessenen DOMRects abgeleitet.

## Codeänderungen und Bedienung

| Zustand | Tatsächliches Verhalten |
|---|---|
| Normal | Freies Verschieben/Skalieren bis an die vier Workarea-Kanten; keine Seiten-/Dockreserve. Erreichbarer Titelbereich bleibt erhalten. |
| Maximiert | x=0, y=24, volle Rendererbreite und Höhe bis zur Unterkante. Bündige Ränder ohne Rundung. Grün oder Titelleisten-Doppelklick stellt die vorherige normale Box wieder her. |
| Echtes Vollbild | Electron `BrowserWindow.setFullScreen`; aktive interne App füllt den Renderer. Native Titelleiste, Air-OS-Menü, Island und Dock sind verborgen. |

- `src/core/window-system.js` definiert die gemeinsame Workarea: Modern normal/maximiert beginnt bei 24px, natives Vollbild bei 0. `app.js` verwendet diesen Vertrag für Host/Drag/Clamp/Resize. `styles.css` korrigiert die tatsächlich wirksamen Overrides.
- `air-window-system.js` behält Lifecycle/MRU und Profilgeometrien als maßgebliche Verwaltung. Temporäre Fullscreenmaße werden nicht gespeichert; Drag/Resize/Snap sind dort gesperrt.
- `src/core/hyprland-layout.js` verwendet dieselbe Fläche. Dwindle/Master behalten 8px **innere** Abstände, äußere Abstände sind 0; Monocle nutzt die gesamte zugewiesene Fläche. Floating bleibt Standard.
- Snap links/rechts wartet bei Tiling zuerst auf den **bestätigten** Wechsel zu Floating. Sonst überschriebe die asynchrone Restore-Antwort die Snapbox. Ein bestehender Snap wird bei Tiling-Resize nicht erneut angewandt.
- Restore passt nur außerhalb eines verkleinerten Viewports liegende gespeicherte Boxen erreichbar ein. Gültige gespeicherte Positionen bleiben erhalten. Manuelles Randdragging bleibt erlaubt.
- Maximierte/gekachelte Modern-Fenster nutzen Dock-Autohide mit 4px-Hotedge und Tastaturfokus. Das vorhandene Dock wird nur geclippt, nicht verschoben oder verkleinert; Pins, Magnifikation, konkave Form und M2-Zielrechtecke bleiben erhalten. Floating-Dock bleibt sichtbar.
- `air-platform-system.css` reduziert die tatsächliche Menüzeile von 26px auf 24px und setzt den bisherigen oberen 5px-Offset auf 0. Die eigene Islandhöhe und ihre Kontur werden nicht zusammengedrückt.
- `main.cjs`/`preload.cjs`: autorisierter Fullscreen-Toggle/-Status und Native-Enter/Leave-Ereignisse über vorhandene Main-Window-/Frame-/Sessionprüfung. BrowserWindow bleibt im normalen Modus nativ gerahmt.
- F11, **Darstellung → Vollbild**, sichtbarer Austrittsbutton und Escape ohne vorrangigen Dialog. Ein sichtbarer Dialog erhält Escape zuerst. Logout verlässt Vollbild und Listener werden bereinigt. Classic außerhalb Vollbild behält seinen bisherigen Host.

M1/M2 bleiben die einzigen Eigentümer ihrer ursprünglichen Animationen. Keine zweite Window-Engine, keine Änderung an Profil-/Dateiberechtigungen, Notes-Sperrschutz, App-Registry, Cloud oder PWA.

## Geometrieabnahme: Linux und installierte Windows-Anwendung

540/540 Node-Tests bestanden; alle 533 ursprünglichen R6-Tests erhalten. Echte sandboxerhaltende Linux-Electron-44.9.3-Läufe und native Windows-Runnerläufe aus der installierten EXE mit isolierten synthetischen Profilen. Beide liefern die folgenden Maximierungsmaße:

| Rendererviewport | R6 maximiert y / Höhe | R6.1 y / Höhe | Gewonnene Höhe | R6.1 Kantenfehler |
|---|---|---|---|---|
| 1688×896 | 93 / 727 | 24 / 872 | 145px | 0px |
| 1920×1080 | 93 / 911 | 24 / 1056 | 145px | 0px |
| 1650×930 | 93 / 761 | 24 / 906 | 145px | 0px |
| 1536×864 | 93 / 695 | 24 / 840 | 145px | 0px |
| 390×600 | 91 / 433 | 24 / 576 | 143px | 0px |

Links/rechts jeweils x=0 und volle Breite. Vorher 62px Spalt unter der Menükomponente und 76px unter dem Finder; danach beide 0px. Menü vorher y=5/Höhe26/Unterkante31, nachher y=0/Höhe24/Unterkante24. Die Island bleibt top=0 mit ihrer eigenen Höhe.

[Geometrievergleich](visual/r61/geometry-comparison.json) · [unveränderte R6-Messung](visual/r61/before-r6/before-report.json) · [vollständige neue DOMRects](visual/r61/full-screen/bounds-report.json).

Die GUI prüft tatsächliche Pointerdrags an allen vier Kanten bei1688/1920 sowie Maximieren/Restore in allen fünf Viewports, Restore innerhalb 1px, Grün, Doppelklick, Snap, Dock-Hotedge, native F11-API und Menüaktion, Escape mit Dialogvorrang, sichtbaren Vollbildaustritt, Floating/Dwindle/Master/Monocle, vier Workspaces, M1/M2 mit Reverse und Classic-Wechsel. Zwei echte Apps werden gekachelt und anschließend per Snap aus Dwindle übernommen.

Die ursprüngliche vollständige GUI-Suite besteht zusätzlich: Notes-Speichern, Profiltrennung/Neustart, Appstarts, Lock/Logout, Musik-/Fensterfunktionen und Software-/CSS-Fallback. CDP-Tastaturaktionen bleiben echte Eingaben; bei genau einer veralteten CDP-DOM-Knoten-ID wird dasselbe Element maximal dreimal frisch gesucht. Tatsächlicher Fokus und Enter-Ausführung werden weiterhin geprüft.

**Native Fullscreenmessung:** Vor dem Eintritt wird die CDP-Größenemulation entfernt. Im Linux-Lauf stimmen inner/outer/screen mit 1920×1080 überein; aktive App x=0/y=0/1920×1080. Die fünf angegebenen Größen sind Renderergrößen, insbesondere 390×600 ist keine physische Mobil-/Monitorabnahme.

## Echte Vorher-/Nachher-Bilder

![R6 vor der Korrektur, 1688×896](visual/r61/before-r6/finder-maximized-1688.png)
![R6.1 maximiert, 1688×896](visual/r61/full-screen/finder-maximized-1688.png)

[Finder normal](visual/r61/full-screen/finder-normal-1688.png) · [echtes Vollbild](visual/r61/full-screen/finder-fullscreen.png) · [obere Kante](visual/r61/full-screen/finder-edge-1688-top-left.png) · [untere Kante](visual/r61/full-screen/finder-edge-1688-bottom-left.png) · [zwei Apps Dwindle](visual/r61/full-screen/dwindle-two-apps.png) · [Monocle](visual/r61/full-screen/layout-monocle.png) · [Snap nach Dwindle](visual/r61/full-screen/snap-from-dwindle.png) · [Fullscreen verlassen](visual/r61/full-screen/finder-fullscreen-restored.png) · [Dock-Hotedge](visual/r61/full-screen/finder-maximized-dock-revealed-1688.png) · [Desktop nach Minimieren](visual/r61/full-screen/desktop-minimized.png).

## Windows-R6.1-Kanal und Checkpoints

Eigener technischer Kanal `build-windows-r61.yml`, zusammengesetzt aus den unveränderten R6-Verifiern und der eingefrorenen modernen Toolchain (Electron44.9.3). R1–R6 bleiben intakt. Pflichtaudit, vollständige Tests, ASAR-/Runtimebytevergleich, Lizenzdateien, PE-x64, NSIS und SHA-256. Anschließend tatsächliche Runnerinstallation und installierte EXE: volle bestehende GUI, R6-Funktionsprüfung, R6.1-Fenster-/Vollbildprüfung und separate Software-Shaderdiagnose.

| Checkpoint | Tatsächliches Ergebnis |
|---|---|
| 1b1f7d7 / Lauf40773273220 | Paket/Installation bestanden; volle GUI scheiterte an überlagerndem Dock beim Notes-Speichern im schmalen Viewport. Nicht als erfolgreiche Freigabe angeboten. |
| 0204bd5 / Lauf40775736880 | Produktkorrektur für erreichbaren Restore und Dock-Autohide. Alle23 nativen Schritte bestanden; echter Fullscreen1024×768. |
| f59d5a5 / Lauf40778077423 | Zusätzlicher Dwindle→Snap-Fix. Paket/Installation und volle alte GUI bestanden; zusätzliche Bedienprüfung scheiterte an inzwischen veralteter CDP-Knoten-ID. Keine vollständige Freigabe behauptet. |
| 8740827 / Lauf40779691219 | 540 Tests und sämtliche23 nativen Schritte bestanden; installierte EXE, alte GUI, neue Fenster-/Fullscreenprüfung und getrennte Softwarediagnose. |

Der abschließende Installer enthält auch den Snap-Fix. Die ältere0204-Datei und die fehlgeschlagenen Zwischenläufe werden nicht als aktueller Testinstaller angeboten.


## Erfolgreicher Windows-R6.1-Testinstaller

[GitHub Actions:23/23Schritte erfolgreich](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40779691219) · [Installer-Artefakt](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40779691219/artifacts/12856348590) · [Prüfprotokolle/Screenshots](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40779691219/artifacts/12856946762).

- Exakter Buildcommit: 874082788fa803b02c198deae3b7f676fcf11332
- Installer: Air-OS-Ultimate-R6.1-1.0.3-dev.4.sha874082788fa8-Windows-x64.exe
- Größe: 122557437 Bytes.
- SHA-256: c73ab769acf6c1d121861c6bf198e77280d7d784d9c95cfc1c83f7b277a84157
- Electron44.9.3 / electron-builder26.18.0; eingefrorene Toolchain unverändert.
- NSIS-x64, PE-/ASAR-/Runtimebytevergleich und Pflichtaudit erfolgreich.
- Tatsächlich in ein isoliertes Runnerverzeichnis installiert und aus der installierten EXE gestartet.
- Profile/Neustartpersistenz, Notes-Speichern, komplette bestehende GUI, System-/Layoutprüfung, fünf R6.1-Viewportprüfungen und isolierte Shaderdiagnose erfolgreich.
- Vollbild unter Windows: BrowserWindow meldet true; inner/outer/screen1024×768, Finder0/0/1024×768. Nach Austritt normale Box0/72/390×480 wiederhergestellt. Keine CDP-Größenemulation bei dieser nativen Messung.
- Normale Windows-Pipeline: korrekt erkannte Software-GPU → CSS-Fallback,0Materialprogramme. Separate SwiftShaderdiagnose mit0Idle-Draws; **keine Hardware-GPU-Freigabe**.
- Bild-/Messcheckpoint:204d4ec3b74af52f8f5992bc1e6ff855b3f08d1e. Rein dokumentarischer Abschlusscommit folgt; er verändert den gebauten Produktcode nicht.

[Windows-Messdaten](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/evidence.json) · [Windows: maximierter Finder](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/finder-maximized-1688.png) · [Windows: echtes Vollbild](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/finder-fullscreen.png) · [Windows: Dwindle](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/dwindle-two-apps.png) · [Windows: Snap nach Dwindle](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/snap-from-dwindle.png) · [Windows: Rückkehr aus Vollbild](visual/r61/windows-r61/874082788fa803b02c198deae3b7f676fcf11332/finder-fullscreen-restored.png).

Die Bilder sind echte Aufnahmen des installierten Renderers, keine Aufnahme eines privaten Windows-Desktops. Native API-/Fenstermaße ergänzen den visuellen Nachweis. Der CI-Host läuft unter Windows10.0.20348x64;390×600 und die größeren Vergleichsgrößen sind gekennzeichnete Rendererviewports. Native Vollbildschirmgröße des Runners ist1024×768.

### Späterer Test auf dem eigenen Windows-PC

1. Das Actions-Artefakt herunterladen und entpacken. Es enthält Installer, SHA256SUMS.txt, BUILD-INFO.json und Testhinweise; zusätzliches Evidenzartefakt enthält Protokolle.
2. Vor dem Start die Installerdatei mit PowerShell Get-FileHash -Algorithm SHA256 prüfen und mit obigem vollständigen Hash vergleichen.
3. Der Installer ist unsigniert. Windows-Sicherheitsentscheidungen respektieren; keine Schutzfunktion abschalten. Keine automatische Installation auf einem privaten Rechner.
4. Mit einem eigenen lokalen Testprofil Finder öffnen: Grün/Doppelklick, Wiederherstellen, Randdrag, Snap und F11 testen. F11 erneut, Escape ohne Dialog oder der sichtbare Austrittsbutton verlassen Vollbild. Native Titelleiste kehrt zurück.
5. Den physischen Mehrmonitor-/DPI-Wechsel separat prüfen. Keine Cloud-Anmeldung für diese Abnahme erforderlich.

Die Actions-Artefakte haben14Tage Aufbewahrung; Screenshots und Metadaten sind zusätzlich im Branch gesichert.

## Verbleibende native Abnahmen

Physisches Windows11, Smart App Control, vertrauenswürdiges Codesigning, echte Mehrmonitor-/DPI-Hardware und macOS-Hardware bleiben offen. Virtuelle Renderergrößen und Window-Resize-/DPR-Tests ersetzen keinen physischen Monitorwechsel. Native Picker-/Zustimmungsdialoge und Audioausgabe sind keine manuelle Geräteabnahme. Software-GPU/CSS und isolierte SwiftShaderdiagnose werden von Hardware-WebGL unterschieden.

Ungesignierter technischer Testinstaller, kein Produktionsrelease. Kein Deaktivieren von Smart App Control/Defender, keine Cloud-Anmeldung, keine privaten Laptopdaten, keine Veröffentlichung.
