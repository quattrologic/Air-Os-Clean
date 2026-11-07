# Pro Notch 2.0 — Ultra Compact

Branch: `feat/air-os-ipad-pro-notch-ultra-compact`. Unveränderte, erfolgreich geprüfte Basis: `ac64d9a26544b1401227046d066a6bbd00f5d1e5` / Produkt `2dab906d7b85b6a8a3d8e4e9e65157fd631a49e0`, CI42376851353. Der bisherige Pro-Notch-Branch und die private Installation bleiben erhalten. Kein Deployment und kein Merge.

## Geometrie und Kontur

| Zustand | Vorher | Ultra Compact (CSSpx) |
|---|---:|---:|
| Geschlossen |236×32|165×24|
| Geschlossen mit lokalem Songtext |300×58|165×24|
| Musik |440×152|310×108|
| Timer |440×176|310×132|
| Kalender |506×216|350×155|
| Shelf |440×150|310×108|
| Dateiliste |440×152|310×152|
| Erweiterter Songtext |440×260|310×196|

Die Hauptflächen sind ungefähr halb so groß. Timer benötigt7px mehr als der Ausgangswunsch125px, um Kopfbedienung, Dauerschieber und Steuerung in drei getrennten44px-Bändern unterzubringen. Musik, Kalender und Shelf treffen die gewünschten Ausgangsmaße. Die geschlossene Form wächst auch bei echtem laufendem LRC nicht mehr zu einer zweiten großen Kapsel.

Eine einzige schwarze Fläche bleibt am oberen Rand des verfügbaren PWA-Inhalts / Safe-Area-Rand befestigt. Ein gemeinsam animierter CSS-Pfad bildet oben konkave, nach außen auslaufende Schultern (5–8px); die unteren Rundungen (7–16px) sind unabhängig. Kein positiver Rundungsradius oben, der daraus eine schwebende Bubble machen würde. Die Videoaufnahme wurde erneut direkt geprüft; die Schulterkurve ist eine visuelle Browseradaption, keine zurückgewonnene native Alpha-Maske. Schwarz#000, kein Blur/Glas, Glow oder Schatten. Der übrige Air-OS-Desktop bleibt unverändert.

Keine Skalierung der gesamten Komponente: echte Breite/Höhe, eigene Innenabstände,52px-Cover, neu angeordnete Kontrollen und13px/12px Medienbeschriftung. Normale Status-/Zeitangaben sind11px. Kalender zeigt kompakte echte Termine; Woche dient als44px-Datumsauswahl und kehrt bei Auswahl zur Tagesagenda zurück. Dateiliste nutzt scrollbare Zeilen mit getrennten44px-Aktionen.

## Bedienung und Motion

Aktionsbuttons, Navigation, Transport, Kalenderdatum, Dateiaktionen und Timer-Schieber besitzen echte44px-Ziele. Browserprüfungen messen DOMRects, Hit-Tests mit `elementFromPoint` und Überschneidungen; reine transparente Polster, die Nachbaraktionen verdecken, zählen nicht als bestandene Ziele. Ausnahmen sind bewusst dokumentiert: die165×24-Kapsel und der20px hohe Musik-Suchlauf. Es gibt keine zusätzliche unsichtbare44px-Fläche über anderen Anwendungen.

Das Musik-Icon links und drei Ansichtspunkte rechts schaffen Platz für die größeren Ziele und die mittige Kapselaktion. Kleine sichtbare Glyphen liegen in größeren Zielrechtecken. Während eines Morphs fangen die wandernden Headerziele keine versehentlichen Mehrfach-Taps ab; die Kapsel bleibt abbrechbar. Tastaturtabs, Escape und Pointercancel bleiben erhalten.

Die fünf ursprünglichen, separat gemessenen Breiten-/Höhenprofile bleiben unverändert:333ms Öffnen,300ms Erweitern,700ms Schließen/Settling,367ms Wechsel,400ms Kalender. Ein zusätzlicher Regressionstest prüft den SHA256 der serialisierten Profilwerte: `4eee1ca54fef46d27702a8cdd6cf644bb0f7c4d76c234bff37b5112ea0c48efd`. Nur die Zielgeometrien und daraus berechneten Konturen ändern sich. Unterbrechungen lesen den tatsächlich laufenden Pfad und das aktuelle Rechteck zurück. Eine WAAPI-Lease besitzt alle Effekte; kein zusätzlicher Scheduler, kein RAF-/Intervallloop.

## Daten und geschützte Bereiche

Musik, Timer, Kalender und Shelf verwenden die bisherigen Controller/Stores. Keine neue Audio-/Fenster-/Datenengine, keine IndexedDB-Migration, keine Änderung an `storage.js`, `backup.js`, dem Safari-Service-Worker-Template oder den Windows-/Tailscale-Skripten. Alle25 Apps und das unveränderte Yosemite bleiben. Nur generierter Worker/Version und das bestehende Source-Angebot werden aktualisiert. Physische iPad-, Safari-, Pencil-, Akku- und GPU-Abnahme bleibt offen.

## Reproduzierbare Abnahme

`scripts/capture-ipad-pro-notch-compact-baseline.cjs` archiviert die geprüfte Basis separat und erzeugt mit denselben synthetischen Musik-/Timer-/Kalender-/Dateidaten echte Vorheraufnahmen. Kein verwendeter Branch wird ausgecheckt oder verändert. `scripts/test-ipad-pro-notch.cjs` liefert alle Zustände,71 gezielte Prüfungen,44 Screenshots und20 echte Zwischenframes der Morphs. Porträtbilder aller offenen Ansichten kommen zusätzlich zu sechs Viewports hinzu. Echtes Offline-Neuladen und Prozessneustart erfolgen bei abgeschaltetem lokalen Server.

`scripts/build-pro-notch-compact-comparisons.cjs` stellt die unretuschierten PNGs bei ihrer tatsächlichen CSS-Größe gegenüber; DPR2 wird nur in der HTML-Darstellung auf CSS-Pixel normalisiert. Keine unabhängige Einpassung, kein erfundener Ähnlichkeitsscore. Beschriftung und Größen-/Flächenvergleich bleiben von Produktbildern getrennt.

Lokaler Zwischenstand:48 Node-Regressionen,71 gezielte Chromium-Prüfungen bei DPR2 sowie37 bestehende visuelle DPR2-Prüfungen bestanden. Die abschließende vollständige Chromium-/WebKit-Matrix und Artefakte werden nach erfolgreichem Lauf unten ergänzt.
