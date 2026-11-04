# InfinityOS Deep Port — iPad 2.0

Basis Air-OS `a228d895939861bf5379917d6d69849aaadc2f84`, Featurebranch `feat/air-os-ipad-ultimate-2`. [ISO-Status](INFINITYOS_SOURCE_INVENTORY.md): Herkunft offen, beide Drive-Zugriffe HTTP 403. Öffentliche Quellen getrennt auf exakten Commits geprüft.

## Portmatrix (laufender Checkpoint A)

| Komponente | Original / Lizenz | Air-OS-Pfad / Entscheidung |
|---|---|---|
| CSV inkl. BOM/Quotes/Multiline + Spaltennamen | Web `script.js:getColLabel/parseCsv`, AGPL-3.0 | `ipad/core/infinity-web.js` → echte sichere Finder-Tabellenvorschau; Text bleibt editier-/exportierbar, begrenzte Vorschau |
| Ext/Bytes/Binärgröße/Dateisortierung | Web `script.js:getExt/formatBytes/getObjectSize`, Sortiercallsite, AGPL-3.0 | bestehende Finder-Records/Sortierauswahl und Speicheranzeige, keine neue FS-DB |
| Dock-Rechtecküberlappung/Hit-Test/Abstände | Linux `dash2dock-animated/.../utils.js`, GPL-3.0 | reine Originalfunktionen in `ipad/core/infinity-dock.js`; UI-Integration folgt, bisher nur Modelltest, deshalb noch kein produktiver Dock-Port behauptet |
| Fenster | Web lädt WinBox; GNOME benutzt Shell-Actors | keine zweite Engine; vorhandenen Window Owner erweitern |
| Startmenu/Appverwaltung | Web dynamischer App-Autoload/ausführbare Nutzerdateien; Fedora RPM/Flatpak/privilegierte Installer | kein eval, keine Shell/Installer; bestehende Registry bleibt maßgeblich |
| Kontext-Popover | Web `adapt.js:updateSystemPopover` | ungeeignete screenX/DPR-Positionierung nicht blind übernehmen; bestehende sichere Viewportanker verwenden |
| Benachrichtigungen | Web `adapt.js:OSNotification` | geeigneter View-Lifecycle weiter zu prüfen; kein localhost-Berechtigungsbypass/kein globaler Notification-Ersatz |
| Native Themes/Icons/Boot/GPUtreiber | Fedora `THIRD_PARTY.md`, gemischte Rechte/Marken | nicht gebündelt; MacTahoe und Air-OS-Logo behalten |
| Penner-Easing im GNOME-Dock | extra Herkunftshinweise unvollständig | nicht übernommen; vorhandene MacShell-MIT-Algorithmen bevorzugen |

Exakte Quellpfade, Bereiche, Original-/Excerpt-SHA-256 und Zielpfade: [maschinenlesbare Portmatrix](source-ports/infinityos.json). Original ausgewählte Excerpts und Lizenztexte werden mit ausgeliefert. Die vollständigen fremden Repositories bleiben außerhalb des Produkts; keine fremden Setupskripte wurden ausgeführt.

## Copyleft und Sourcezugang

Direkte Webports sind AGPL-3.0. Die kombinierte **iPad-2.0-PWA** wird entsprechend unter AGPL-3.0 verteilt; vorhandene MIT-Notices bleiben erhalten. Die separate Desktopbasis bleibt MIT. GPLv3-Komponenten behalten GPLv3; Kombination mit AGPLv3 erfolgt nach §13 beider Lizenzen. Keine Behauptung, AGPL-Code sei MIT oder ein isoliertes Plugin ohne Pflichten.

`ipad/NOTICE`, `licenses/`, vorhandene `icons/COPYING/AUTHORS/NOTICE` und `vendor/infinityos/provenance.json` werden verpackt. Jeder Build erstellt ein lokales Corresponding-Source-ZIP mit exakten lesbaren geänderten Browserdateien, Buildskripten und Hinweisen. Sichtbarer Download auch vor der visuellen Lokalsitzung sowie in Einstellungen; keine bloße Github-Verknüpfung und kein privater Sourcezugangsschlüssel. Kein öffentliches Deployment.

Checkpoint-A-Tests: alle 29 bisherigen Regressionen erhalten; zusätzliche Originalalgorithmus-/Sourcepakettests hinzugefügt. Endgültige UI-/WebKit-Abnahme folgt nach den weiteren Integrationen.

## Browserzwischenstand A

34 Node-Tests und der unveränderte 80-Check-Chromium-Basispfad bestanden. Die zusätzlichen CSV-/Speicher-/Source-Downloadprüfungen laufen ebenfalls erfolgreich, aber der kombinierte lokale Ablauf bricht bei einem späteren Blobdownload nach vollständigem Browserneustart mit einem nativen Chromium-154-SIGSEGV ab. Kein JavaScript-Erfolg oder physisches Safari-Ergebnis daraus behauptet. Eigener vollständiger Chromium-/WebKit-CI-Lauf wird zur Abgrenzung gestartet; der betroffene End-to-End-Pfad bleibt bis dahin offen. Keine GPU-Schutzflags geändert.

## Tatsächlich verdrahteter Checkpoint B

- `isOverlapRect` läuft in der opt-in Dock-Überlappungsentscheidung; `get_distance_sqr` im Touch-/Long-Press-Abbruch. Andere mitgelieferte Distanz-/Hithelper bleiben explizit nur modellgetestet, keine zusätzliche Featurebehauptung.
- MacShells vorhandener erlaubter `shell7.js`-Port läuft für gekoppelte Icongeometrie und den ereignisgesteuerten Spring. Keine neuen GNOME-/Qt-Runtimes. Idle-Schedulerstop und echte Nachbarbreiten im Browser geprüft.
- `adapt.js:OSNotification`-Lifecycle adaptiert in `infinity-notification.js`, verwendet von `app.js:presentNotice` und den vorhandenen Desktop-Noticeereignissen. Kein zweiter Verlauf, keine global ersetzte Notification-API, kein localhost-Permissionsbypass und kein automatischer Ton.
- Workspaces, Gruppen, sichere Kontextanker und Navigations-Epochen sind **eigene Air-OS-Integration**, kein behaupteter WinBox-Originalport. Ursprung und Grenzen bleiben getrennt.
- Renderer bleibt CSS-Compositor. Kein neuer Shaderport oder Hardware-Snell-Erfolg behauptet; MacShell-/Hyprland-Desktopengine unverändert.

35 Node-/100 lokale Chromium-/9 Upgradeprüfungen bestanden. Der erste CI-Chromiumlauf bestand 85/85 plus Unterpfad und 9 Updates; WebKit stoppte bei der fehlenden Browserquota-Anzeige. Dieser konkrete Fallback ist korrigiert; neuer vollständiger CI-Nachweis folgt. Keine noch offene Prüfung als grün ausgegeben.
