# MacLock Glass Material Parity

Branch: `feat/air-os-ipad-maclock-glass-parity`, Ausgangsstand `47c15663f01b4c457190cec9d32da2c1751f9163`. Kein Deployment, keine Zusammenführung und kein Zugriff auf die installierte private PWA.

## Gesicherter Zwischenstand

Die Originale `Glass.qml`, `liquidglass.frag` und `LockScreen.qml` wurden erneut aus MacShell `1bdb51870b621100fd2709f66c8f8e00ab17b9c4` geladen und stimmen bytegenau mit den bereits lizenzierten MIT-Referenzen überein. Quellen und Lizenz: [vorhandene Provenienz](source-ports/maclock-adaptive/provenance.json).

Der bestehende Glass-Renderer enthält nun einen vorberechneten Fallback mit derselben SDF, konvexen Kantenableitung, Snell-Brechung n=1,5, gerichteter Lichtkante, Tiefenabsorption, Meniskus und feiner Körnung. CSS überblendet nur die gecachten Bildschichten. Die alte gleichmäßige Dunkeltönung und die konische Pseudokontur werden für diese Karten ersetzt. Musik- und Mitteilungskarten behalten ihre unterschiedlichen originalen Dicke-/Tint-/Schattenparameter. Keine zusätzliche Engine, Registry oder Datenbank.

Der WebGL-Pfad behält den vollständigen originalen 24-Tap-Shader. Der begrenzte Fallback verwendet drei bilineare Farbkanalabtastungen aus derselben vorgefilterten Szene und ist deshalb eine dokumentierte Näherung, kein behaupteter identischer 24-Tap-Shader. Alle vorberechneten Maps gehören dem vorhandenen Renderer, werden im Ruhezustand nicht neu erzeugt und beim Verlassen freigegeben.

Die zweite Korrekturrunde adaptiert `gl_FragCoord` auf vollständige physische Fensterkoordinaten: Das Original rendert im Qt-Fenster, Air-OS auf einem begrenzten gemeinsamen GL-Canvas. Körnung und Taprotation verwenden dadurch dieselbe Koordinatenkonvention. Die Referenzdatei bleibt unverändert; die Abbildung erfolgt im mechanischen ES-Generator.

## Tatsächlich vorhandener nativer Vergleich

`scripts/reference/render-maclock-qt.py` rendert die unveränderte originale `Glass.qml` und den mit Qt qsb gebauten Originalshader in einem eigenen QtQuick/OpenGL-Fenster. PySide6 6.8.2.1 und Xvfb liegen ausschließlich in der isolierten Testumgebung, nicht im Produkt. Dies ist ein nativer **Materialkomponentenvergleich**, kein gestarteter vollständiger MacShell-Lockscreen und keine Hardware-GPU-Abnahme.

Die erste kontrollierte Runde verwendet dieselbe eigene tatsächliche Hintergrundtextur, 1280×710, DPR 1, denselben 224×100 großen Glasgegenstand und Radius 22. Gemessene mittlere absolute RGB-Kanaldifferenz innerhalb der gemeinsamen Materialregion einschließlich 10px Schattenraum: WebGL-Port rund 1,56/255; Fallback rund 2,23/255. Die Bilder stammen aus wirklichen Renderern; es ist kein Vergleich verschiedener Covers und keine erfundene Originalaufnahme. [Unveränderte Vollbilder und Reports](visual/maclock-glass-parity-checkpoints/round-1/).

## Visuelle Runden und offener Abschluss

- Runde 0: gesicherter Ausgangsstand mit Wald-/Seecover, 32 bestehende Szenenprüfungen bestanden.
- Runde 1: tatsächliche Brechung im vorberechneten Fallback, kontrollierte native Referenz, 12 neue Chromium-Prüfungen bestanden.
- Runde 2: korrekte Fensterkoordinaten für Grain/Taprotation, neue Vollbilder, 12 Chromium-Prüfungen bestanden.
- Noch offen: dritte Korrekturrunde für Blur/Farbwirkung, abschließender nativer Vergleich nach dieser Runde, WebKit/DPR-2-Matrix, vollständiger CI-Gate und finaler Buildnachweis.

[Gesicherte Vollaufnahmen und Rohreports](visual/maclock-glass-parity-checkpoints/). Alle Bilder sind unbearbeitet; die unterschiedliche Größe von Ausgangs- und Kontrollviewport wird ausdrücklich getrennt behandelt. Der kontrollierte Komponentenvergleich verwendet jeweils identische Maße.

Aktuell: 60/60 vorhandene und neue Node-Modelltests sowie Paketprüfung für 141 exakte Browserassets bestanden. Die Pro-Notch-Dateien bleiben bytegleich; sämtliche 25 Apps, Audio-/Spotify-Eigentümer, IndexedDB-Schema, Backup, Service-Worker-Logik, kleine Uhr, Avatar, freie Entsperrschrift und vorhandene Geometrien bleiben erhalten.

Physisches iPad/Safari, Akku, Hardware-GPU und echte Spotify-Kontoabnahme sind weiterhin offen. Tests verwenden ausschließlich eigene synthetische Audiodaten und bereits lizenzierte Fotocover.
