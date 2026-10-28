# R6.1 — Echtes Vollbild und vollständige Arbeitsfläche

Branch:fix/air-os-r6-true-fullscreen. Verbindliche Basis2e43327423abcce56da464789e01bf92ff7345f0; geprüfter erster Hotfix49ee7eef61f80d2f889e6f7672e5d1b654f8f3d5 wiederverwendet, nichts neu begonnen.

## Ursache und Korrektur

Im aktiven R6 kombinieren sich Desktop31px, Island-Hostverschiebung62px und untere76px-Reserve. Die ältere8/12/86px-Regel ist zusätzlich noch in styles.css vorhanden, aber nachfolgende Overrides bestimmen die tatsächliche Box. Maximieren100% bezog sich auf diesen verkleinerten Host. Der nachgereichte Windows-Screenshot zeigt genau diesen Effekt; native Windows-Titelleiste und internes Maximieren waren zudem unterschiedliche Zustände.

Modern arbeitet jetzt mit24px Menüzeile und danach voller Breite/Höhe ohne Dockreserve. Gemeinsamer Vertrag src/core/window-system.js workArea → app.js appWindowHostRect wird für Drag/Clamp/Snap, Maximize/Restore sowie die vorhandenen Hyprland-Layouts verwendet. CSS setzt denselben Host. Classic außerhalb Vollbild bleibt beim bisherigen Host. Dock ist Overlay, nicht Layoutreserve; Island bleibt fest oben mit ihrer eigenen Höhe/Kontur. Dwindle/Master behalten nur innere8px-Gaps, äußere Ränder0; Monocle füllt die Fläche.

Normal: frei beweglich/skalierbar, am Rand weiterhin greifbar. Grün und Titelleisten-Doppelklick maximieren/restaurieren denselben vorhandenen Controller. Gesicherte normale Geometrie bleibt maßgeblich.

Echtes Vollbild: BrowserWindow.setFullScreen über Main/preload; keine dauerhaft frameless-Erzeugung. F11 (Native-Key-Hook und sicherer DOM-/IPC-Fallback), Darstellung → Vollbild, Escape ohne vorrangigen Dialog sowie sichtbarer Vollbild-verlassen-Button. Native Enter/Leave-Ereignisse sind maßgeblich. IPC verwendet bestehende Main-Window-/Frame-/Session-Autorisierung. Logout verlässt Vollbild; Listener werden entfernt. Keine temporäre Vollbildgeometrie in Profilpräferenzen schreiben; Drag/Resize/Snap blockiert. M1/M2 bleiben ursprüngliche Timeline-Owner.

## Gemessene Linux-Electron-Abnahme

539/539 Node-Tests bestanden, alle533 ursprünglichen R6-Tests erhalten. Echte sandboxerhaltende Electron44.9.3-GUI mit synthetischem Profil, fünf Renderergrößen:

| Viewport | Maximierter Finder x/y | Größe | Kantenabweichung |
|---|---|---|---|
|1688×896|0/24|1688×872|0px an allen4Kanten|
|1920×1080|0/24|1920×1056|0px|
|1650×930|0/24|1650×906|0px|
|1536×864|0/24|1536×840|0px|
|390×600|0/24|390×576|0px|

### Direkter Vorher-/Nachher-DOM-Vergleich

Die Vorheraufnahme führt den unveränderten verbindlichen Commit2e43327 in Electron aus; beide Seiten verwenden synthetische leere Finderfenster und dieselben Renderergrößen. Der Windows-Nutzerscreenshot wurde visuell ausgewertet; er ist keine nachträglich vermessene DOM-Aufnahme.

| Viewport | R6 Finder y/Höhe | R6.1 Finder y/Höhe | Gewinn |
|---|---|---|---|
|1688×896|93/727|24/872|145px|
|1920×1080|93/911|24/1056|145px|
|1650×930|93/761|24/906|145px|
|1536×864|93/695|24/840|145px|
|390×600|91/433|24/576|143px|

Links/rechts jeweils0px Spalt. Alte Menükomponente:y5/Höhe26/Unterkante31; neue:y0/Höhe24/Unterkante24. Der neue Host endet exakt an der Rendererunterkante; Maximierungsabweichung zur Sollbox in allen5Größen0px. [Unveränderte R6-Messung](visual/r61/before-r6/before-report.json).

![Vorher: unveränderter R6-Finder1688](visual/r61/before-r6/finder-maximized-1688.png)
![Nachher: R6.1-Finder1688](visual/r61/full-screen/finder-maximized-1688.png)

Normale Randdrags und Restore innerhalb1px. Vollständige DOMRects für Menü, Island, Host, Finder, Dock und Viewport: [Messdaten](visual/r61/full-screen/bounds-report.json). Echter F11-Eintritt/Austritt, Menüaktion, sichtbarer Rückweg und Escape-Dialogvorrang bestanden. Vor nativer Fullscreenmessung wird die CDP-Größenemulation aufgehoben: inner/outer/screen1920×1080, aktive App0/0/1920/1080.390 ist ausdrücklich nur ein schmaler Rendererviewport.

Snaplinks/rechts, Doppelklick, Floating/Dwindle/Master/Monocle/Workspaces, M2-Minimize/Reverse/Fokus, M1-Schließen/Reverse und Classic-Wechsel bestanden. Kein privates Profil/Cloudkonto/Dateisystem verwendet.

![Finder maximiert1688](visual/r61/full-screen/finder-maximized-1688.png)
![Echtes Vollbild](visual/r61/full-screen/finder-fullscreen.png)

[Normal](visual/r61/full-screen/finder-normal-1688.png) · [obere Kante](visual/r61/full-screen/finder-edge-1688-top-left.png) · [untere Kante](visual/r61/full-screen/finder-edge-1688-bottom-left.png) · [Dwindle](visual/r61/full-screen/layout-dwindle.png) · [Monocle](visual/r61/full-screen/layout-monocle.png) · [aus Vollbild zurück](visual/r61/full-screen/finder-fullscreen-restored.png) · [Desktop minimiert](visual/r61/full-screen/desktop-minimized.png).

## Windows-R6.1

Eigener eindeutig benannter technischer R6.1-Testkanal auf Grundlage der unveränderten R6-Verifier/Toolchain. R1–R6 bleiben intakt. Pflichtaudit/Tests/Runtimebytes/ASAR/x64/NSIS/Hash, tatsächliche Runnerinstallation und installierte EXE: volle bestehende GUI, R6-Produktpfad, neue5-Größen-/Fullscreenabnahme und separate Shaderdiagnose. Noch laufende Windowsabnahme wird erst nach realem CI-Erfolg als bestanden dokumentiert.

Kein Codesigning/Produktionsrelease. Physisches Windows11/SAC, echte Mehrmonitor-/DPI-Hardware und macOS bleiben separat abzunehmen. Kein Schutzmechanismus wird umgangen.

Produktcheckpoint:1b1f7d74dc1d07394ac54c01fe8b30138cb36e52; native Windows-R6.1-Abnahme läuft. Der Installer wird nur nach tatsächlichem erfolgreichen CI-/Installations-/GUI-Nachweis verlinkt.


## Korrektur nach erstem nativen Lauf

Lauf40773273220 baute/installierte den technischen Installer, bestand aber die alte vollständige GUI-Suite nicht. Er wird **nicht** als erfolgreiche Windowsfreigabe angeboten. Die390px-Notes-Speicheraktion traf nach Viewportwechsel das darüberliegende Settings-Dockicon.

Reproduziert und im Produkt behoben: Beim initialen Restore werden nur außerhalb des neuen Viewports liegende gespeicherte Fenster mittig erreichbar eingesetzt; bereits gültige Positionen bleiben exakt erhalten. Manuelles Ziehen/Clamping bis zur Unterkante bleibt erlaubt. Maximierte/gegatchelte Flächen verwenden Dock-Autohide über eine4px-Hotedge; Hover/Fokus legt das ursprüngliche Dock wieder frei. Clip statt Transform: keine Änderung an Dockabmessungen, Pins, Magnifikation oder M2-Zielrechtecken. Floating-Dock bleibt normal sichtbar.

Die vollständige bestehende Linux-GUI-Suite besteht danach wieder einschließlich Notes-Speichern, Profil-/Neustartprüfung, Apps, M1/M2 und WebGL-Fallback.539/539 Node-Tests bestanden. Native R6.1-Abnahme wird mit den tatsächlichen korrigierten Bytes erneut durchgeführt.
