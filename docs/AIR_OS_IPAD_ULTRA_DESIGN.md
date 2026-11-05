# Air-OS iPad Ultra Design

Basis: `e4b1c4203c2430da04bccc5dd33953fb44cc0781`.
Branch: `feat/air-os-ipad-ultra-design`. Kein Deployment, kein Merge und kein Eingriff in Tailscale.

## Checkpoint 1 – neue Präsentation und Quellenpfad

Die Präsentation in `ipad/desktop.css` wurde ersetzt. Fotografischer Waldhintergrund „Path“ von Risto Saukonpää aus KDEs lizenzierter Wallpaper-Sammlung, neutrale MacTahoe-Fenster, schlanke Menüzeile, MacShell-Widgetkomposition, monochrome Transportcontrols und neu komponiertes Kontrollzentrum. Bestehende Pins werden gelesen; nur der Standard für unkonfigurierte Profile enthält zusätzliche reale Apps.

Direkter Algorithmusport: MacShell `ClockWidget.qml::tickGeo` → `ipad/vendor/macshell/clock-dial.js`, 60 Schnittpunkte von Strahlen mit einer abgerundeten Rechteckkontur. Bestehende gekoppelte Dockmagnifikation/Spring bleiben aktiv. Die Uhr aktualisiert sich energiesparend minutenweise; der ursprüngliche 33-ms-Sekundentrail wird bewusst nicht übernommen.

Bestehender R7 GLASS-3-Renderer → `ipad/vendor/glass/renderer.js`, bestehende GLSL-/Geometriepfade im selben Verzeichnis. Browserselektoren und Qualitätseinstellungen adaptiert. Standard bleibt CSS. Hochwertig versucht WebGL2 mit unveränderten Software-/Unknown-GPU-Guards. Keine Aufnahme; ausschließlich eigenes Same-Origin-Wallpaper. Hardware-WebGL ist noch nicht abgenommen.

MacShell MIT, MacTahoe GTK MIT, Icons GPL-3.0, InfinityOS-Web AGPL-3.0. Kombinierte Browseredition bleibt AGPL-3.0; ursprüngliche Einzelnotices erhalten. Exakte Source-Dateihashes: `ipad/vendor/glass/provenance.json`. Foto unverändert mit Metadaten/LGPLv3 und GPLv3-Haupttext gebündelt; vollständiger Quellcode inkl. Foto wird offline angeboten.

Eigenständige Integration: Control-Center-Komposition, Browser-Layout/CSS-Fallback, Touchhitboxen, monochrome Glyphen und Adapter für bestehende Datencontroller. Keine Qt-/GNOME-Runtime, keine neue Datenhaltung oder Appregistry.

Vorläufig geprüft: alle bestehenden 37 Node-Tests; Chromium-Vergleichsrunde 1 und 2, zweite Runde 19 Prüfungen/19 Aufnahmen. Die erste Runde zeigte beschnittene Hovericons und Emoji-Medienbuttons; Produktcode korrigiert. Weitere Vergleichs-/Browser-/Update-/Offlineprüfungen folgen. Physische iPad-Abnahme offen.

## Visuelle Prüfung und Korrekturen

Die im Gespräch sichtbaren MacShell-Desktop-/MacLock-Bilder sind Kompositionsreferenzen: zwei kleine obere Widgets, breite Module darunter, zurückhaltende Menüzeile, niedriger Dock und zentraler Lock-Medienbereich. Sie liegen hier nicht als lokale Originalbilddateien vor; kein behaupteter Pixelidentitätsvergleich. Die Produktaufnahmen vor/nach stammen dagegen aus identischen automatisierten Browserszenen mit synthetischem Cover/WAV, Notiz, Aufgabe, Termin und fixierter Testzeit. Keine Retusche.

1. [Runde 1](visual/ipad-ultra-local/round1/desktop.png): neue Fotografie, Widget-/Panelkomposition und neutrales Chrome. Erkannte Probleme: abgeschnittene Hovericons, Emoji-Transport, Notes-Titel angeschnitten.
2. [Runde 2](visual/ipad-ultra-local/round2/desktop.png): dynamische Dockhöhe, monochrome MacTahoe-Medienmasken, mehr echte Standardapps, aktualisierter Überlappungsbereich. Notes-Scrollrand blieb problematisch.
3. [Runde 3](visual/ipad-ultra-local/round3/notes.png): negative Sidebarmargins entfernt, Scrollanchoring begrenzt, Toolbar nach oben, echte Titel-/Papierhierarchie. Anschließend letzter Proportionspass: quadratische Widgets, dichterer Monatsraster, ruhiger Panel-Fokus, originale Open-Runde-Schriften lokal gebündelt.

| Bereich | Vorher / Nachher | Bewusste Grenze |
|---|---|---|
| Desktop | [vorher](visual/ipad-ultra-local/before/desktop.png) / [nachher](visual/ipad-ultra-local/after/desktop.png) | Lizenzierte Wald-/Naturfotografie statt ungeklärtem Yosemite-/Apple-Bild |
| Hochformat | [vorher](visual/ipad-ultra-local/before/desktop-portrait.png) / [nachher](visual/ipad-ultra-local/after/desktop-portrait.png) | Touchgerechte Mindestgrößen; keine identische Qt-Skalierung |
| Dock | [vorher](visual/ipad-ultra-local/before/dock.png) / [nachher](visual/ipad-ultra-local/after/dock.png) | Bestehende Pins unverändert; lange Reihen horizontal scrollbar |
| Kontrollzentrum | [vorher](visual/ipad-ultra-local/before/control-center.png) / [nachher](visual/ipad-ultra-local/after/control-center.png) | Browseraktionen; keine vorgetäuschten OS-Schalter |
| MacLock | [vorher](visual/ipad-ultra-local/before/lockscreen.png) / [nachher](visual/ipad-ultra-local/after/lockscreen.png) | Lokale visuelle Sperransicht; keine neue Authentifizierung |
| Notes | [vorher](visual/ipad-ultra-local/before/notes.png) / [nachher](visual/ipad-ultra-local/after/notes.png) | Vorhandene Textlogik/Dirty-Schutz erhalten |
| Finder | [vorher](visual/ipad-ultra-local/before/finder.png) / [nachher](visual/ipad-ultra-local/after/finder.png) | Ausschließlich interner, autorisierter Browserspeicher |
| Musik | [vorher](visual/ipad-ultra-local/before/music.png) / [nachher](visual/ipad-ultra-local/after/music.png) | Ein vorhandenes Audioelement, keine zweite Engine |

Messwerte und DOM-Rechtecke stehen in den jeweiligen `report.json`. Der letzte Normalfenster-Notes-Titel liegt vollständig innerhalb des Inhaltsbereichs. Die Menüzeile beträgt 28 CSS-Pixel, Island bleibt eigenständig 39 Pixel. Sichtbare schmale Statusbuttons besitzen auf Touch durch Pseudoelemente erweiterte 44px-Zielflächen. Trafficlights haben kleine sichtbare Punkte in separaten größeren Buttons.

## Zwischenstand der Tests

- 40/40 Node-Tests einschließlich aller 37 Ausgangstests bestanden.
- Chromium: Root 112/112 und `/Air-OS/` 112/112 echte Browserprüfungen bestanden, inklusive lokalen Appabläufen, Datei-/Audioimport, Datenpersistenz, Touch/Pointercancel, Viewportwechsel und kaltem Offline-Neustart/DPR2.
- Kontrollierte visuelle Szenen: letzter Lauf 19 Prüfungen, 22 Aufnahmen; gepinnte Basis 7 Prüfungen, 21 Aufnahmen.
- Materialprüfung: 10 Prüfungen bestanden. Standard ohne GL-Allokation; Hochwertig mit GPU-Klassifikation; isolierte Originalshader, echte Pixeldifferenz, Idle-Draw-Stabilität, Context Loss/Restore und Cleanup.
- Fester Playwright-Testtoolchain-Audit: keine bekannten Schwachstellen.
- WebKit wird zusätzlich über den neuen reinen Test-/Artefaktworkflow `.github/workflows/test-ipad-ultra.yml` geprüft. Ergebnis bei diesem Checkpoint noch ausstehend.

Checkpoint 1: `1fca54b`. Nächster Produkt-/Testcheckpoint enthält die drei Korrekturrunden, Font-/Renderer-Lifecycle-Härtung und den Browserworkflow. Diese Dokumentation behauptet noch keinen erfolgreichen CI-/Hardwareabschluss.

## CI-Zwischenprüfung und präzisierter Idle-Test

[Erster CI-Lauf](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42067511908), Produkt `e843949643b75196b32844559bb7e9cc2e632fb7`: Chromium vollständig bestanden. WebKit bestand beide visuellen Szenenläufe, scheiterte danach am neuen Idle-Test; die übrigen WebKit-Regressionsschritte wurden dadurch nicht ausgeführt. Das ist ausdrücklich noch keine vollständige WebKit-Abnahme. Belege einschließlich Fehler stehen unter `docs/visual/ipad-ultra/e843949643b75196b32844559bb7e9cc2e632fb7/evidence.json`.

Der Idle-Test hatte nur auf die GL-Queue gewartet. Der isolierte Materialvergleich wartet jetzt zusätzlich auf Fonts und Dock-Spring-Endzustand und verwendet ausdrücklich Reduced Motion, damit sich Geometrie/Animationslicht während des Pixelvergleichs nicht weiter verändern. Die normalen Touch-/UI-/Motion-Regressionsläufe bleiben unverändert. Softwarediagnose bleibt von der normalen Produktpolitik getrennt.

Zusätzlicher Lock-Regressionsschutz: Kalender-/Reminder-Ergänzung der Island bleibt vor dem Öffnen der lokalen Sitzung verborgen; beim Sperren wird der Appname in der Menüzeile zurückgesetzt. Das bestehende visuelle Lock-Sicherheitsmodell wird dadurch nicht als Authentifizierung ausgegeben. Lokaler visueller Lauf nun 20 Prüfungen/22 Aufnahmen.
