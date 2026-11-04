# Air-OS Ultimate iPad — Desktop Parity

Basis `feature/private-ipad-pwa@7de1635c0207b8604c5409ef62c466585b4d5f04`. Entwicklungsbranch `feat/ipad-complete-desktop-parity`. PR #16/#17 bei Beginn offen. **Kein Merge in main oder den verwendeten privaten Branch. Keine Tailscale-, Task- oder Serve-Konfiguration auf dem Windows-PC verändert.**

## Checkpoint A/B — echter Browserdesktop und Daten

Eine Registry (`ipad/registry.js`) steuert Dock, Launchpad und Appstarts. Ein Window Manager (`ipad/desktop.js`) verwaltet bestehende Panels und neue Apps: Fokus, Drag/Resize mit Pointercancel, Minimize/Restore/Maximize, Side-by-Side, Übersicht, persistierte Geometrie und Tastatur. Keine Steuerung nativer iPadOS-Fenster. Dock/Notch/Lockscreen bleiben Air-OS-Oberflächen.

Die bestehende Datenbank **`air-os-ipad-tracks-v1` wird additiv von Version 1 auf 2 erweitert**: `tracks` bleibt bestehen; `records` ergänzt Notes/Dokumente/Dateien/Reminders/Kalender/Einstellungen. Keine Datenbank wird gelöscht oder zurückgesetzt. Der bestehende Musikcontroller und das einzige HTMLAudioElement bleiben zuständig. Letzter Titel, Position und Timer behalten ihre bisherigen Schlüssel. Kalender wird transaktional und idempotent übernommen; der alte LocalStorage-Wert bleibt unverändert als Rückfallsicherung. Fehler brechen den Import ab. Alte gleichzeitig offene Tabs können das Upgrade blockieren und müssen geschlossen werden.

Dateien liegen ausschließlich im internen Browserspeicher. Expliziter File-Import, Ordner, Kopie, Move, Rename, Papierkorb/Restore, Text-/Bildvorschau und Export erweitern diesen Bereich; keine Rechte auf beliebige iPad-Dateien. Notes und AirWrite-Dokumente verwenden Revisionsprüfungen und bestätigtes Speichern. Ungespeicherte Entwürfe werden bei Fensterschließen abgefragt. Backup/Restore besitzt eine gemeinsame Transaktion über beide Stores; IDs werden nur nach ausdrücklicher Bestätigung ersetzt.

## Ausführbare Wiederverwendung

- Vorhandener privater Controller `ipad/app.js`: Audio, Notch, Lockscreen, Timer und Kalender weitergeführt; keine fremde Shell darübergelegt.
- Originale eigene Desktopmodule `airwrite.js`/`air-arcade-games.js` und CSS nach `ipad/vendor/` gezielt portiert. AirWrite-Handschrift/Cropping/Canvas/PNG-Export läuft im Browser; Dokumentbibliothek ergänzt denselben Appbereich. Keine native PencilKit-/Wallet-Funktion behauptet.
- Bounded ID3/FLAC-Parser aus `src/core/music-metadata.js` des geprüften Air-OS-Desktopports nach `ipad/core/` übernommen. Keine Dateipfade, externen Metadatenabfragen oder zweite Audioengine.
- Bereits kuratierte MacTahoe-Icons aus der bestehenden Air-OS-Integration: `ipad/icons/` mit vollständigen GPL-3.0-Texten, Autoren-/NOTICE-/Quellnachweisen. Eigenes offizielles Logo unverändert. Glas ist der Chromium/WebKit-CSS-Compositor, **keine behauptete Snell- oder Fremdfensterrefraktion**.

## Funktionsmatrix — aktueller tatsächlicher Stand

| App/Funktion | Desktopvertrag / native Abhängigkeit | iPad-Pfad / Persistenz | Offline | Prüfstand / Einschränkung |
|---|---|---|---|---|
| Finder | Main-FS, explizite Roots | virtueller IDB-Dateibaum, File/Blob-Import, Export | ja | Import/Textspeichern real Chromium; weitere Dateiaktionen noch gezielt prüfen |
| Notes | lokale Datendienste / Profil | IDB-Notes, Revisionen, Suche, Save, Import/Export | ja | echter Save und Offline-Neuladen geprüft; weitere Konflikt-/Undo-Prüfungen folgen |
| AirWrite | Handschrift-Canvas, lokale Profile | Original-Canvas plus IDB-Dokumentbibliothek | ja | Dokument speichern und Originalmodul gemountet; physischer Pencil offen |
| Reminders | gemeinsamer Taskstore | IDB-Reminders, Listen/Fälligkeit/Priorität/Filter | ja | Aufgabe erstellen geprüft; erweiterte CRUD-Prüfungen folgen |
| Kalender | Desktopkalender / Datendienst | bestehende Oberfläche + Monatsansicht, IDB-Migration | ja | bestehender und neuer Termin geprüft; kein Apple-Kalenderzugriff |
| Musik | Desktopaudio / lokale Metadaten | **bestehendes** Audio/Tracks, neue Playlist-/Filter-/Transportaktionen | ja | v1-Bibliothek/Start/Erhalt geprüft; Safari-Audiohardware offen |
| Timer | lokale Deadline | vorhandene persistierte Zeitstempel | ja | vorhandener Timer erhalten; Hintergrundgrenzen iPadOS |
| Fotos | ausgewählte Desktopdateien | gemeinsame interne File-Blobs, Galerie/Export | ja | Oberfläche aufgenommen; realer Importtest folgt |
| Rechner | lokale Rechnung | begrenzter Parser ohne eval | ja | tatsächliches Ergebnis geprüft |
| Air Arcade | eigene sieben JS-Spiele | bestehende Spielcontroller im Browser | ja | konkrete Spielabläufe noch prüfen |
| AirCard Lite | Geräte-/Wallet-Skins auf macOS | lokale Kartenbibliothek/JSON als Webalternative | ja | keine Wallet-/Gerätesteuerung; CRUD-Abnahme folgt |
| Downloads | native Downloads | interner Dateibereich / explizite Exporte | ja | kein Lesen der nativen Safari-Downloadliste |
| Papierkorb | native/interne Dateiaktionen | nur interner Datei-Papierkorb | ja | Restore-/Löschabnahme folgt |
| Air Home | Desktopübersicht | echte lokale Appstarts | ja | keine native OS-Übersicht |
| Einstellungen | Electron-/OS-Adapter | PWA-Design, Storage, Backup, Update | ja | OS-Toggles nicht vorgetäuscht |
| Browser | Electron-Webfenster | geprüfter HTTPS-Link in Browser | nur UI | kein iframe-Zwang, keine Browserengine in der PWA |
| Mail | Provider / native URL | expliziter externer Providerlink | nein | kein Mailclient-/Offline-Sync behauptet |
| Übersetzer | externer Dienst | expliziter DeepL-Link | nein | keine erfundenen Übersetzungen |
| Air-KI | externer Dienst/Auth | expliziter Browserlink | nein | keine Secrets oder automatische Anmeldung |
| Nachrichten | Onlineanbieter | expliziter Tagesschau-Link | nein | keine erfundenen Meldungen |
| Wetter | Onlinequelle | expliziter Anbieterlink | nein | keine heimliche Ortung/Fakewerte; Widgetprovider noch offen |
| Fußball | Onlineanbieter | expliziter kicker-Link | nein | keine Fake-Ergebnisse |
| Aktien | Onlineanbieter | expliziter Börsenlink | nein | keine Fakekurse |
| Spotify | Konto/Onlinedienst | expliziter Webplayerlink | nein | keine native Spotify-Steuerung |
| Über Air-OS | Produktinfos | lokale Informationen/Lizenzen | ja | keine native App-Store-App |
| Launchpad/Spotlight | Registry/Suchdienste | eine Registry, lokale Suche, Rechner | ja | echte Suche im Browser geprüft |
| Notch/Kontrollzentrum | gemeinsame Dienste | vorhandene Player-/Timerzustände, lokale Hinweise | ja | keine systemweite iPadOS-Steuerung |

## Bislang tatsächlich ausgeführt

21 bestehende Node-Tests erhalten. Erster echter Chromium-154-Lauf: **21 Prüfungen, 21 Screenshots**, darunter Legacy-v1-Musik, Kalenderübernahme, Notes, AirWrite, Reminders, File-Import/Textsave, Musikstart, Calculator, Side-by-Side, sechs Viewports und Offline-Neuladen. Keine physische iPad-Abnahme. Ein leeres Appfenster allein zählt nicht als Appabnahme; noch nicht geprüfte Workflows stehen explizit in der Matrix.

Lokaler Playwright-Browserdownload war durch die Netzwerkregel für `cdn.playwright.dev` blockiert. Installiertes Chromium funktioniert; WebKit wird über einen separaten CI-Pfad geprüft. Kein Erfolg behauptet, bevor dieser Lauf tatsächlich stattgefunden hat.

## Offline und privates Update

Contenthash-generierter v5-Service-Worker cached alle lokalen Runtime-/Iconassets. Root bleibt `./`; Navigation erhält eine neu erzeugte, nicht umgeleitete Response. Cachewechsel löscht keine IndexedDB-Daten. Eine vorherige Cacheversion bleibt verfügbar. Neue Worker aktivieren sich bei bestehenden Clients nur nach Sicherheitsabfrage aller geöffneten Appfenster; Musik und ungespeicherte Inhalte blockieren Reload. Kein GitHub Pages/Funnel/Clouddeploy.

Die bestehenden Windows-Skripte sind bislang **nicht umgestellt**. Späterer Rollout erst nach vollständiger Abnahme, Export auf dem tatsächlichen iPad und ausdrücklicher Freigabe. Die alte Version bleibt auf `feature/private-ipad-pwa` unverändert erreichbar. Ein neuer Hostname/Port bedeutet einen anderen Browser-Origin und getrennte Daten.

## Noch offen vor Freigabe

Gezielte vollständige CRUD-/Konflikt-/Backup-/Update-/Touchtests, echter kalter Offline-Browserneustart, WebKit, visuelle Korrekturen, versioniertes Build-ZIP und sicherer Rolloutplan. Physische iPadOS-/Pencil-/Safari-Dateipicker-/Audio-/Suspend-Abnahme bleibt mangels Hardware offen. Externe Dienste bleiben ehrlich begrenzte Browserlinks. Keine vollständige Desktopparität oder Installationsfreigabe behauptet.
