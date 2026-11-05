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
