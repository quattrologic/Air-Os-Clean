# MacLock — kleinere Uhr und freie Entsperraktion

Branch `feat/air-os-ipad-liquid-glass-maclock`, Ausgangsstand `e03cd791ee6caaee8f5861b5f38e4ec028a7002f`. Gezielte Folgekorrektur anhand des vom Nutzer bereitgestellten ursprünglichen MacShell-Lockscreen-Screenshots.

Die Uhr verwendet wieder die frühere MacShell-Proportion `clamp(58px,8dvh,100px)`: etwa75px statt106px bei1688×938. Schlichte weiße Regular-Schrift, Datum unmittelbar darüber, beide oben mittig. Die bisherige größere Variante und ihre Overrides für kurze Fenster sind entfernt. Keine Glas-/Shaderbehandlung der Uhr.

Das bestehende runde Avatar und der Benutzername bleiben erhalten. „Air-OS öffnen“ steht als freie Textaktion darunter: kein Hintergrund, Rahmen, Schatten, Verlauf oder Materiallayer. Die semantische Schaltfläche mit bestehender ID und bestehendem Handler bleibt für Barrierefreiheit erhalten; ihre unsichtbare Zielfläche misst160×44px. Enter, Leertaste und Touch entsperren dieselbe lokale Sitzung. Ein2px-Fokusrahmen erscheint ausschließlich bei Tastaturbedienung. Hover hellt nur den Text leicht auf, Druck senkt kurz dessen Deckkraft; Reduced Motion deaktiviert die Transition. Der zusätzliche Erklärungshinweis unter der Aktion entfällt.

`#unlock` ist aus der Auswahl des bestehenden Materialrenderers entfernt. Die Musik- und Benachrichtigungskarten verwenden unverändert ihre bisherigen Materialien. Keine zusätzliche Login- oder Audioengine, kein Passwortfeld, keine native iPadOS-Authentifizierung.

## Erhalten

Alle vier Pro-Notch-Dateien, Yosemite, Albumcover-/Musikpanelregeln, Benachrichtigungen, Musik-/Spotify-Metadatencontroller, Datenspeicher und25 Apps bleiben unverändert. Nur Präsentations-CSS, Lock-Markup und die Materialzuordnung dieser einen Aktion ändern sich; der Build erneuert regulär die Service-Worker-Assetversion ohne Logik- oder Schemaänderung.

## Prüfungen und Aufnahmen

Lokal52/52 bestehende Node-Tests und39/39 gezielte Chromium-Prüfungen bestanden. Funktionale Fälle prüfen unsichtbare Touchfläche, tatsächliche Entsperrung per Enter/Leertaste/Pointer, Tastaturfokus, Musiktransport, letzte Metadaten, Backup/Restore, Offline-Neustart und sichere Updates; vorhandene Prüfungen für Notch, Dock und mehrere Viewports bleiben erhalten. Das geprüfte PWA-Paket enthält weiterhin140 Runtime-Dateien.

Die Aufnahmehilfe wartet jetzt zusätzlich auf zwei Renderframes und den sichtbaren, vollständig eingeblendeten Lock-Vordergrund; nach Pause wartet sie auf den tatsächlich aktualisierten Medienzustand der Oberfläche. Keine versteckten UI-Elemente und keine nachträgliche Bildbearbeitung.

Abschlussnachweis, echte Chromium-/WebKit-Ergebnisse und die beiden unveränderten Vollbildaufnahmen werden nach dem CI-Lauf ergänzt. Physisches iPad/Safari und Hardware-GPU bleiben offen. Keine private Installation, Tailscale-Adresse oder Windows-Serve-Datei verändert. Kein Merge, kein Deployment.
