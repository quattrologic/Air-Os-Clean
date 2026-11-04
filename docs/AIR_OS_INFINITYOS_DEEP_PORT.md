# InfinityOS Deep Port — tatsächlich ausgeführte iPad-2.0-Pfade

Air-OS-Basis `a228d895939861bf5379917d6d69849aaadc2f84`; Produkt `7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a` auf `feat/air-os-ipad-ultimate-2`. [Abschlussbericht mit Tests/Paketen/Bildern](AIR_OS_IPAD_ULTIMATE_2.md).

**Keine ISO-Zuordnung:** Beide Drive-Zugriffe scheitern am Tunnel-HTTP403 der Entwicklungsumgebung. Öffentliche Quellen sind separat geprüft und nicht allein aufgrund des Namens zur Nutzer-ISO erklärt. [Inventar und statischer Inspector](INFINITYOS_SOURCE_INVENTORY.md).

## Direkter/adaptierter Originalcode

Webquelle `Infinity-Systems-UA/InfinityOS@a6584135cbcad837d57484211119451bbb2d8fb2`, AGPL-3.0. Native Quelle `InfinityOS-linux/infinityos@fbcdaff53bdc6e9d76836e9fb70f6a19a403fdb3`, GPL-3.0 plus separat lizenzierte Inhalte. Exakte Zeilenbereiche, Quell-/Excerpt-SHA-256, Anpassungen und Ziele: [maschinenlesbare Matrix](source-ports/infinityos.json), unverändert im ausgelieferten `vendor/infinityos/provenance.json`.

| Original | Tatsächlicher Ziel-/Ausführungspfad | Übernahme/Anpassung/Test |
|---|---|---|
| Web `script.js:getColLabel/parseCsv` | `ipad/core/infinity-web.js` → `apps.js:finder/show` | Originalalgorithmus BOM/Quotes/Multiline; Wrapper begrenzt Eingang auf 256 KiB, 10.000 Zeilen/1.000 Spalten; Anzeige max. 100×40. Unit + echte CSV-GUI, HTML bleibt inerte Textknoten |
| Web `getExt/formatBytes/getObjectSize` | gleiches Modul → Dateityp, reale Dateigrößen, Einstellungen/Speicheranzeige | Originalfunktionen, Featureguard für browserlosen Test; Blobbytes exakt, Metadaten als logische Schätzung ohne DB-Overhead bezeichnet |
| Web Dateisortiercallsite | `infinity-web.js:compare` → Finder-Sortierauswahl | eng an vorhandene Air-OS-Records adaptiert; Name/Größe/Typ/Änderungsdatum, keine InfinityOS-FS-Datenbank |
| Linux `dash2dock-animated@infinityos.org/utils.js:isOverlapRect` | `infinity-dock.js` → `dock-material.js` | reine GPL-Funktion läuft in opt-in Intellihide auf eigenen DOMRects, Randberührungsssemantik und sichtbarer Rückweg getestet |
| gleiche Datei `get_distance_sqr` | `desktop.js:bindContext` und Dock-Long-Press | originale Distanzberechnung läuft beim Bewegungsabbruch; Pointercancel/Pen/Mauswechsel geprüft |
| gleiche Datei `get_distance/isInRect` | nur reines Modul/Modelltest | **kein zusätzlicher Liveport behauptet**, kein GI/GLib/Gio importiert |
| Web `adapt.js:OSNotification` | `infinity-notification.js:NotificationView` → `app.js:presentNotice`, bestehende Desktop-Appereignisse | adaptierter idempotenter Close-/Timeout-/Click-Lifecycle, vorhandener Host/Store; Textknoten, keine Permissions-/Parent-/Soundhooks. Air-OS-Bannerdauer 4,2s statt Originaldefault 2,5s |
| MacShell `MacDock.qml/Spring.qml` via vorhandenen R7-Port | `vendor/macshell/shell7.js` → `dock-material.js:dock/step` | bytegleich übernommener MIT-R7-Port, originale gekoppelte Geometrie und Integrator tatsächlich ausgeführt; Nachbarbreiten und Idle-Stopp geprüft. Scroll-/Kapazitätsanpassung für iPad. Andere Helpers in dieser Original-Portdatei nicht als neue Livefeatures gezählt |

MacShell-Originalpin `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`; Air-OS-R7-Quellcommit `02ccaf88724731cf685d2221f88e959020aff3f0`, Pfad `src/core/macshell-shell7.js`, SHA-256 `493275153232357fdf9400d1bbeb34a49b1d92e47c69d4e8e00ee4b3e3e0c644`. Rickky-2026-MIT-Hinweis bleibt erhalten. GNOME-Dockmetadaten nennen **icedman**, Dash2Dock Animated v92; InfinityOS führt einen eigenen Fork-UUID. Keine falsche alleinige Autorschaft.

## Eigene Air-OS-Integration

Vier Arbeitsbereiche, validierte persistente Gruppen, gruppiertes Minimize/Restore, PWA-App-Vollbild mit exaktem Restore, gemeinsame Kontext-/Tastaturanker, Finder-Navigations-/Render-Epochen, Dateiablage als Referenzen, Fokus-/Mitteilungsaktionen, Blob-Übergaben, Updatekoordination und Backup-Vorabprüfung sind **eigene Integrationsarbeit**. Diese Funktionen erweitern die bisherige Registry/Map/IDB-/Audioarchitektur und werden nicht als kopierter WinBox-/GNOME-Window-Manager bezeichnet.

## Bewusst nicht übernommen

- InfinityOS-Web delegiert Fenster an WinBox: kein zweiter Fenstermanager. Dynamischer App-Autoload, ausführbare Nutzerdateien/eval, native API-Umleitungen und localhost-Notification-Berechtigungsbypass ausgeschlossen.
- `adapt.js:updateSystemPopover` benutzt native Screen-/DPR-Annahmen: bestehende sichere Air-OS-Viewportanker statt blindem Kopieren.
- Fedora-KIWI/RPM/DNF/Flatpak/Setup/Updater/GPU-Treiber/GNOME-Actors: keine Linux-Systemkommandos in Safari/Windows, keine privilegierten Hooks.
- Penner-Easing mit unvollständiger separater Provenienz ausgeschlossen; erlaubten MacShell-Spring verwendet.
- Native Themes, Wallpaper, Markenicons, Bootpayloads und gemischt lizenzierte vollständige Drittanbieterpakete nicht pauschal gebündelt. Vorhandene MacTahoe-Assets/AUTHORS/COPYING/NOTICE bleiben erhalten.
- Kein WebGL-/Qt-/GNOME-Blurport als bloße Dateikopie ausgegeben. Diese PWA nutzt weiterhin CSS-Compositing; Desktop-GLASS-3 ist unverändert.

## Lizenz- und Sourcepflichten

Direkte Webports bleiben AGPL-3.0; **die kombinierte iPad-2.0-PWA wird entsprechend unter AGPL-3.0 verteilt**. Vorhandene First-Party-MIT-Notices bleiben erhalten; GPLv3-Komponenten behalten GPLv3, Kombination nach §13 beider Lizenzen. Keine Behauptung, ein kopierter AGPL-Baustein sei MIT oder ein pflichtenfreies Plugin. Root-Desktop-MIT-Datei und Desktopruntime wurden nicht neu lizenziert.

`ipad/NOTICE`, volle `licenses/`, `icons/COPYING/AUTHORS/NOTICE`, Herkunftsmatrix und lesbare Excerpts sind Paketbestandteil. Vollständige fremde Repositories bleiben im separaten Analyseverzeichnis; keine fremden Setupskripte wurden ausgeführt. Jeder Build erstellt ein lokales **Corresponding-Source-ZIP** mit exakten geänderten Browserquellen, Buildskripten und eingefrorenen Testwerkzeugen. Sichtbar vor der visuellen Lokalsitzung und in Einstellungen, auch nach kaltem Offline-Neustart. Kein bloßer privater GitHub-Link, keine Nutzerdaten oder Zugangstoken im Sourcepaket. Kein öffentliches Deployment.

## Testergebnisse und historische Fehler

37 Node-Tests erhalten alle 29 Paritybasisregressionen. Originalparser/Größen/Rechtecksemantik, Source-Bytes/Notices und statischer ISO-Inspector sind automatisiert getestet. 112 lokale Chromiumchecks am Root, 112 am Unterpfad und 10 Upgrade-/Recoverychecks bestanden. Grüner unabhängiger CI-Lauf 41888353373: 466 Chromium-/WebKit-Browserchecks, Audit und Paketprüfung bestanden. Einzelzahlen im [Abschlussbericht](AIR_OS_IPAD_ULTIMATE_2.md).

Rote Zwischenläufe werden nicht versteckt: WebKit meldete fehlende Browserquota sowie zu frühe View-/Dateiablageabfragen. Quota-Fallback, Lade-/Retryzustand und unmittelbar aktualisierte Finderansicht mit getesteter Speicherrücknahme korrigieren die konkreten Pfade. Der Test wartet weiterhin auf tatsächlich bestätigte DOM-/IDB-Zustände. Lokaler Chromium154 hatte in einem früheren Download-/Neustartablauf einen nativen SIGSEGV; offizielles Chromium151 bestand jenen Pfad. Neue komplette lokale Läufe einschließlich Offline-Source/Dateiexport sind bestanden; kein GPU-Sicherheitsguard wurde deaktiviert.
