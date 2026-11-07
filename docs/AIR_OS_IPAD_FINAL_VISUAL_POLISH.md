# Air-OS iPad — gezielte visuelle Schlusskorrektur

Branch `feat/air-os-ipad-liquid-glass-maclock`. Ausgangsprodukt `de4813a0762627edbb1c73337823eed8afcf100d`, einschließlich ausschließlich synthetischer CI-Nachweise in `0778d0e8a5d4af3616702fb5431ebfcabce6e8d1`.

Die beiden rot markierten Nutzeraufnahmen und die inline bereitgestellte MacShell-Lockscreen-/Desktopvorlage bestimmen diese sechs Korrekturen. Keine erneute Entwicklung von Musik, Notch, Datenmodellen oder Systemcontrollern. Herkunft und Lizenzen der bestehenden MacShell-Ports bleiben im [Hauptbericht](AIR_OS_IPAD_LIQUID_GLASS_MACLOCK.md) dokumentiert. Die aktuellen Transportglyphen und CSS-Anpassungen sind eigenständige Browsergestaltung, keine behaupteten neuen Originalcodeübernahmen.

| Markierte Stelle | Tatsächlicher Befund / Korrektur |
|---|---|
| Oberer schwarzer Bereich | In der laufenden Oberfläche ist dies der vorhandene schwarze 165×24-px-Körper einschließlich seiner bestehenden Inhalte. Die Notch liegt außerhalb der Menüleiste, direkt am Safe-Area-Rand; Stichproben unmittelbar links/rechts treffen ausschließlich die transparente Menüleiste. Keine zusätzliche schwarze Ebene gefunden. Deshalb keine Notch-, Menüleisten-, Safe-Area- oder Z-Index-Korrektur vorgenommen. |
| Musikwidget | Gefüllte weiße Transportglyphen, Play/Pause 30px, Zurück/Weiter 24px; drei symmetrische 48×44-px-Touchziele. Widget etwa 146px hoch, bei schmalem Viewport etwa 132px. Bestehende drei Transporthandler bleiben maßgeblich. |
| Erstes Dockicon | Nur die bestehende Launchpad-Markenfläche: 23% Rundung, 80% Helligkeit des bisherigen Weißfelds, dezente Rahmenreflexion. Originalbitmap, Markenform, Icongeometrie und Magnifikationskern unverändert; andere Icons bleiben unangetastet. |
| MacLock-Uhr | Weiß, zentriert, 11,3dvh mit responsiver Begrenzung: rund 106px statt 75px bei 1688×938. Vier Pixel Abstand zwischen Datum und Uhr; kompaktere Varianten für kurze Fenster verhindern Überschneidungen. |
| MacLock-Musik | Play/Pause 28px, Zurück/Weiter 22px, 48×48-px-Touchziele, heller 4px-Fortschritt, präzisere Glaskontur. Cover-, Titel- und letzte Wiedergabedaten kommen unverändert aus dem bestehenden Besitzer. |
| „Air-OS öffnen“ | 208×46-px-Pille mit 14px-Semibold-Beschriftung, klarer Kontur, Fokusrahmen und dezentem Druckeffekt. Das bestehende MacLock-Material des gemeinsamen Renderers wird auch auf diesen Button angewendet. Vorhandene Entsperrlogik unverändert. |

Reduced Motion deaktiviert die neuen Drucktransitions, Reduced Transparency erhält einen deckenden lesbaren Button. Keine Daueranimation und kein weiterer Materialrenderer.

## Visueller Vergleich und Messung

Echte vollständige Aufnahmen vor dieser Korrektur: [Desktop](visual/ipad-liquid-maclock/de4813a0762627edbb1c73337823eed8afcf100d/liquid-chromium/desktop.png), [Dock](visual/ipad-liquid-maclock/de4813a0762627edbb1c73337823eed8afcf100d/liquid-chromium/dock-maximum.png), [MacLock](visual/ipad-liquid-maclock/de4813a0762627edbb1c73337823eed8afcf100d/liquid-chromium/lockscreen-music.png).

Die lokalen Korrekturläufe wurden als ganze Browseransichten geprüft: zunächst Gesamtbild mit gefüllten Musikglyphen und ruhigerem Logo, danach pausierte Musik mit sichtbarem Play-Symbol und größere Uhr, anschließend Hochformat und DPR2. Keine Retusche, Bildmontage oder Ausschnittaufnahme. Datum/Uhr sind im isolierten Test reproduzierbar auf 7. November 2026, 12:00 gesetzt; Musik und Cover stammen aus ausdrücklich synthetischen Testdateien, der wirkliche Audiotransport läuft.

Bei 1688×938: Notch x761,5/y0/165×24, Cover x695,80/y305,78/296,41×296,41 und Medienpanel x695,80/y621,88/296,41×108,80 bleiben geometrisch unverändert. Die Uhrgruppe wächst auf 136,97px; Profil/Entsperrgruppe bleibt vollständig im Viewport (untere Kante 893,92px). Vergleich mit der Nutzerreferenz: erkennbare gefüllte Symbole statt dünner kleiner Konturen, größere Uhr und deutlich sichtbare Öffnen-Pille; keine behauptete pixelidentische native Darstellung.

## Prüfstand

Lokal: 52/52 bestehende Node-Tests; 35/35 gezielte Chromium-Prüfungen mit Touch und weitere 35/35 mit DPR2/Fine Pointer. Die funktionalen Prüfungen verwenden tatsächliches Play/Pause, Weiter und Zurück, vorhandene lokale Daten, Backup/Restore, Neustart ohne Server und den bestehenden sicheren Service-Worker-Updatepfad. Die Galerie wartet das reale Schließen des Repeat-Hinweises ab, statt UI-Elemente für die Aufnahme zu verstecken.

Der vorhandene vollständige Chromium-/WebKit-CI-Gate wird für den Produktcommit erneut ausgeführt; Abschlussnachweis und Artefakt folgen erst nach tatsächlichem Ergebnis. Im gezielten Lauf: 1688×938, 834×1194, 1180×820, 1024×768, 1366×1024, 820×1180 und 390×600; zusätzlich bestehender Sechs-Viewport-, Notch-, Material-, Unterpfad-, Offline- und Updategate.

Physisches iPad/Safari, reale Safe-Area-Werte, Akku und Hardware-GPU bleiben offen. Browser-Touch/DPR2 und Linux-WebKit ersetzen keine Geräteabnahme.

## Erhaltene Grenzen

Alle vier `ipad/notch/`-Dateien bleiben bytegleich und werden durch die vorhandene Hashregression geschützt. Das offizielle Logo bleibt SHA-256 `381aed7af688220f32301ba420baf7696db39b143001f9fef53b0bda358a7399`; Yosemite bleibt SHA-256 `d1d1a71c8080696bf45b1ff0a664df592e59ac27a0710853f76d938a10a9ac06`.

Keine Datenbankmigration, keine Änderung an Musikblobs oder Kalender-/Timerlogik, keine neuen Apps, keine Anmeldung bei Nutzerkonten. Nur temporäre synthetische Browserprofile für Tests. Keine private iPad-Installation, Tailscale-Konfiguration, Windows-Serve-Datei oder stabile Branchinstallation geöffnet oder verändert. Kein Merge, kein Deployment.
