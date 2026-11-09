# Air-OS iPad — Desktop, Dock und obere Systemzone

## Ausgangsstand und Umfang

Fortsetzung auf dem tatsächlich neuesten, sauberen Entwicklungsbranch `feat/air-os-ipad-desktop-dock-correction`, Ausgangscommit `23472c950d59693fc55f7b91d712fe9fda002e3d`. Die vorhandene funktionsfähige Implementierung und ihre vollständigen CI-Ergebnisse wurden erhalten. Kein Merge, kein Deployment, kein Zugriff auf die private Installation, keine Änderung an Windows oder Tailscale.

Diese Korrektur betrifft ausschließlich Desktop-Präsentation, Dock-Eingaben, die sichere äußere Einbettung der bestehenden Notch und die Darstellung vorhandener Playback-Metadaten. Es gibt keine neue App, keine zusätzliche Dock-/Fenster-/Audio-/Spotify-Engine und keine Datenmigration.

## Ursachen und konkrete Korrekturen

- **Dock:** Die alte separate Materialebene und zusätzlicher unterer Icon-Innenabstand ergaben uneinheitliche vertikale Proportionen. Der tatsächliche Dock-Host besitzt jetzt den WebKit-Live-Backdrop; seine Innenebene zeichnet ausschließlich die feine Kante. Icons sitzen ohne zusätzlichen unteren Buttonabstand in einem 60px hohen Körper mit 8px vertikalem Innenabstand. Der Abstand zur unteren sicheren Kante beträgt 14px, der Radius 18px. Das Material verwendet Blur 12px/Sättigung 1,28 und begrenzte gerichtete Lichtabstufungen, keine Wallpaper-Kopie. Helle und dunkle Fenster werden tatsächlich durch den Browser zusammengesetzt.
- **Magnifikation:** Die vorhandene originale Cosinusfunktion bleibt unverändert. Die Zeigerposition wird auf stabile Ruhezentren bezogen; vorher konnten bereits verschobene Iconzentren in die nächste Positionsberechnung zurückwirken. Der bestehende Federintegrator glättet zusätzlich die Zielposition. Beim Verlassen bleibt das letzte Wellenzentrum bis zum Auslaufen der Feder erhalten; das bisherige sofortige Entfernen des Zentrums hatte die optische Rückkehr trotz laufender Feder abrupt abgebrochen. Ein zusätzlicher Browserfall misst 20 tatsächliche Zwischenzustände und verlangt einen kontinuierlichen Rückgang der Icongröße. Touch erzeugt nach Loslassen keinen verbleibenden synthetischen Maus-Hover. Hold, Scrub, Cancel, normales Antippen, horizontales Scrollen und Tastatur bleiben im selben Besitzer.
- **Obere Leiste:** Der bisherige vollbreite Blur und sein Tint sind vollständig entfernt. Hintergrund, Backdrop und Filter sind transparent/aus; auch die beiden Pseudoelemente zeichnen nichts. Die 24px hohe Leiste beginnt einmal unter dem tatsächlich gemeldeten Safe-Area-Inset; scharfe Beschriftungen und Symbole behalten ihren lokalen Schatten.
- **Notch:** Ein 24px hohes Element konnte in einem Standalone-Viewport mit 24px oberem Inset vollständig in die native, für Browser-Taps unzugängliche Zone fallen. Die bestehende Komponente besitzt nun eine transparente, tastaturbedienbare 165×44px-Touchfläche unterhalb dieser Zone. Ihr schwarzer Körper reicht kontinuierlich bis zur zugewiesenen Viewport-Oberkante; nur der native Inset wird außen ergänzt, alle vorhandenen Inhalte werden entsprechend unter diesen Inset versetzt. Bei Inset 0 bleiben die ursprünglichen Maße unverändert, bei simulierten 24px ergibt sich außen 165×48px geschlossen und 310×132px für den Musikmodus. Keine zweite Kapsel, kein neuer sichtbarer Abstandshalter. Die ursprünglichen Geometrie-/Konturdefinitionen, Farben, CSS und Motion-Daten sind byte-identisch. Der Präsentationscontroller ist gezielt angepasst; eine Behauptung, sämtliche vier Notch-Dateien seien unverändert, gilt für diese Runde ausdrücklich nicht.
- **Spotify/Musik:** Das Desktop-Widget bevorzugt den vorhandenen validierten Spotify-Datensatz inklusive gecachtem Cover und letztem Titel. Ohne Spotify-Datensatz dient echte lokale Wiedergabe als Fallback; ohne beides erscheint der verständliche Verbindungszustand mit direktem Weg zur vorhandenen Einstellung. Quelle und letzter/aktiver Zustand sind sichtbar. Die Notch liest ebenfalls die gemeinsame, bereits nach tatsächlichen Wiedergabeereignissen priorisierte Metadatenquelle des Lockscreens. Spotify bleibt lesend: Transport und Seek sind deaktiviert, das Cover öffnet den validierten offiziellen Spotify-Link. Keine zusätzlichen Poller, Scopes oder Tokenspeicher.
- **Komposition:** Enger abgestimmte Widgetabstände und Quelltypografie. Das kompakte Kalenderraster wurde auf vollständige sechs Wochen korrigiert, nachdem eine echte Zwischenaufnahme die abgeschnittene letzte Zeile zeigte.
- **Arbeitsfläche:** Die vorhandene korrigierte VisualViewport-/Safe-Area-Berechnung bleibt erhalten. Maximierte Fenster beginnen direkt nach der kompakten Systemleiste und reichen mit ihrem Hintergrund bis zur zugewiesenen Unterkante. Scrollbarer Inhaltsabstand berücksichtigt den gewachsenen Dockkörper, den Abstand und die untere Safe Area.

## Originalquellen und Grenzen

Der vorhandene Port aus MacShell `MacShell/MacDock.qml` am Commit `1bdb51870b621100fd2709f66c8f8e00ab17b9c4` bleibt die Quelle für c0-Zentren, Cosinuswelle und gekoppelte Zellbreiten. `ipad/vendor/macshell/shell7.js` wurde nicht verändert. MIT-Lizenz und Attribution in `ipad/licenses/MacShell-MacLock-MIT.txt`, `ipad/NOTICE`, Sourceangebot und [bestehendem Pfadmanifest](source-ports/liquid-maclock.json) bleiben erhalten. Neu sind eigene Browseranpassungen an die vorhandenen Controller, keine zusätzlich kopierten Fremdkomponenten.

Das echte bereitgestellte Dockvideo und die bereits dekodierten Vollframes `docs/reference/macdock/frame-0150.png` und `frame-0226.png` wurden betrachtet. Die Aufnahme zeigt eine abgefilmte perspektivische Anzeige; daraus wird keine exakte CSS-Pixel- oder Zeitidentität erfunden. Die markierte echte iPad-Fehlerreferenz ist eine visuelle Ausgangsvorgabe, keine kontrollierte Browser-/Farbmessung. Der bestehende native Qt-MacLock-Vergleich prüft weiterhin das geschützte Lockscreen-Material und ersetzt keine native Dock- oder physische iPad-Abnahme.

## Tatsächliche visuelle Korrekturrunden

1. [Lokale erste Runde](visual/ipad-desktop-ultra/round-1/): Dock-Host und sichere obere Einbettung, reale unbeschnittene Chromium-Bilder. Teilweise geänderter Arbeitsbaum auf dem angegebenen Basiscommit, kein unveränderter Basisbuild.
2. [Zweite Runde](visual/ipad-desktop-ultra/round-2/): sichtbarer Spotify-Quellbezug, ruhigere Komposition, klare Oberkante und gekoppelte Dockwelle. Die sichtbare abgeschnittene Kalenderzeile wurde als Fehler festgehalten.
3. Abschließende Browseraufnahmen: Kalenderraster korrigiert, tatsächliche Touchöffnungen und sichere Statuszone geprüft, Vollbilder mit offener Notch, maximaler Vergrößerung, hellen Einstellungen, Hochformat und Offline-Neustart. Endgültiger CI-/Bildverweis folgt im verifizierten Abschlussabschnitt.

Vorher: unveränderte [Vollbilder des vorherigen Produktbuilds](visual/ipad-desktop-dock-correction/8842fc337ec10e373df94e2bde6c8f39099bc8c0/desktop-dock-webkit-dpr2/), identischer Runtime-Ausgangspunkt des Basiscommits. Keine Bildbearbeitung, keine Ausschnitte, keine Collagen und keine KI-Bilder. Spotify-Fälle sind ausdrücklich synthetische offizielle API-Mocks, keine behauptete Anmeldung eines Nutzerkontos.

## Tests und reproduzierbarer Build

```
node --test --test-reporter=tap tests/*.test.cjs
node scripts/package-ipad-desktop-dock.cjs
node scripts/check-ipad-parity-package.cjs
node scripts/test-ipad-desktop-dock.cjs
```

Lokaler Zwischenstand: 60/60 Modelltests, 54/54 neue Chromium-DPR2-Desktop-/Dockfälle 40/40 MacLock-/Musik-/Offlinefälle einschließlich lokalem Fallback, 71/71 Pro-Notch-Regressionen und 37/37 System-/App-Prüfungen bestanden. Die komplette bestehende Matrix wird abschließend auf dem gesicherten Produktcommit geprüft. PWA-Paketgate: 141 exakte lokale Assets, CSP-/Lizenz-/Sourceangebot unverändert erhalten. `sw.js` und `version.json` sind ausschließlich die regulär neu generierten Buildversionen; Safari-Redirect-Fix und Safe-Update-Logik bleiben bestehen.

Die bestehende Featurebranch-CI prüft Chromium und WebKit, DPR1/2, sechs Viewports, Touch, schnelle Eingaben/Cancel, Tastaturfokus, Safe-Area-/Keyboard-Fixture, gespeicherte Spotify-Metadaten, echten Offline-Hostausfall und kalten Browserneustart. Dazu alle bisherigen 25-App-, Legacy-Musikdaten-, Backup-/Restore-, Notch-, Context-Loss-/Fallback- und sicheren PWA-Updatepfade. Vollständige Endzahlen/Commit/ZIP und tatsächliche Screenshots werden erst nach Abschluss hier ergänzt.

## Offene reale Geräteprüfungen

Physisches iPadOS/Safari, native Standalone-Statusleiste, Trackpad/Apple Pencil, Akku und Hardware-GPU sind nicht hier gemessen. Die obere Statuszone wird in einem getrennten, ausdrücklich synthetischen Fixture durch einen wirklich Pointer-abfangenden Bereich simuliert; dies ist kein Hardwaretest. Eine Spotify-Anmeldung und echte Accountantworten bleiben ungetestet; die App kann native iPad-Musik fremder Apps nicht systemweit auslesen. Die starke Dockvergrößerung kann in schmalen Split-View-Größen horizontales Scrollen benötigen. Ein Live-Backdrop ist kein vollständiger WebGL-Snell-Refractionsport der gesamten Fensterszene; diese ehrliche WebKit-Komposition vermeidet eine falsche Wallpaper-Textur über Fenstern.

## Abschließende Bewegungsprüfung

Der erste neue CI-Lauf auf `48202db40fab38890b8f051c81248fc1898ab3fd` ([42627329971](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42627329971)) bestand in beiden Engines bereits beide DPR-Desktop-/Dock-Gates mit je 50 Assertions. Während der abschließenden Codeprüfung wurde zusätzlich der harte Rücksprung beim Verlassen der Vergrößerungswelle gefunden und im vorhandenen Controller korrigiert. Der vollständige Gate wird dafür auf dem neuen Produktcommit erneut ausgeführt; der vorherige, dadurch abgelöste Gesamtlauf wird nicht als abschließende Abnahme bezeichnet. Lokal besteht die zusätzliche 51. Assertion: tatsächlich gemessene Beispielskalen 1,800 → 1,714 → 1,564 → 1,413 → 1,285 → … → 1,000. Das sind Browser-Geometriewerte, keine behaupteten Hardware-FPS.

## WebKit-Gesamtregression und präzisere Eingabeunterscheidung

[CI 42628231851](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42628231851) auf `8a801c01818dd74a1bf064c8b80d79d8d4bf98c2`: Chromium besteht vollständig. WebKit besteht beide neuen 51-Fall-Gates und alle bisherigen Material-/Notch-/Systemprüfungen, bricht jedoch im älteren Gesamt-App-Test an `original MacShell coupled magnification changes multiple icon widths` ab. [Unveränderte 32 Rohreports, davon einer fehlgeschlagen](visual/ipad-desktop-dock-correction/8a801c01818dd74a1bf064c8b80d79d8d4bf98c2/evidence.json), Evidenzcommit `d6365c018d46f62433e9a140538169664b19eb72`. Die nachgelagerten nativen Vergleiche wurden in diesem Lauf nicht ausgeführt. Dieser Gesamtlauf wird nicht als bestanden bezeichnet.

Der ältere Test wartete pauschal 250ms und erwartete mindestens zwei Icons breiter als 49px. Diese feste Zahl bezog sich auf die frühere 48px-Ruhegröße; bei 44px wurde daraus unabsichtlich eine erheblich strengere relative Schwelle. Die Assertion bleibt erhalten und wartet nun auf mindestens zwei tatsächliche DOM-Breiten über 104% ihrer unmittelbar gemessenen Ruhewerte. Ein Timeout bewahrt zusätzlich den wirklichen Dockzustand zur Diagnose. Die separate starke 1,8-Vergrößerungsprüfung bleibt unverändert bestehen.

Die vorherige pauschale 900ms-Maussperre wurde außerdem auf tatsächliche kompatible Ereignisse eingegrenzt: Ein stationäres Mausereignis am letzten Touchpunkt lässt keine Hoverwelle zurück; eine echte Zeigerbewegung von diesem Punkt weg oder ein echter Maustastendruck wird sofort wieder akzeptiert. Ein vorhandener Clickblock wird bei eindeutig neuer Mausbewegung aufgehoben. Keine neuen Eingabecontroller. Drei zusätzliche Browserfälle prüfen genau den stationären Kompatibilitätsfall, sofortige starke echte Mausmagnifikation und einen einzelnen echten Appstart nach Touchabbruch.

Lokale erneute Prüfung: 54/54 neue Desktop-/Dockfälle und 112/112 vollständige Legacy-/App-/Musik-/Offlinefälle in Chromium erfolgreich. Der vollständige Chromium-/WebKit-/Qt-Gate wird auf dem gesicherten Korrekturcommit erneut ausgeführt; alle Einschränkungen zur realen Hardware bleiben bestehen.
