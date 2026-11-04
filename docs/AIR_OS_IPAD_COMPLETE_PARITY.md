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

## Checkpoint C — Browserhärtung und Buildpfad

28/28 Node-Tests (21 vorhandene + 7 neue) bestanden. Der erste neue statische Löschschutztest traf fälschlich `Set.clear()`; auf tatsächliche Datenbank-Löschoperationen präzisiert. Zweiter realer Chromiumlauf wieder 21/21 mit CSP, angepasster Pointer-/Ink-Behandlung und spielabhängigen Pausentimern bestanden. Private Stablebranch weiterhin unverändert.

Neue CI baut eine versionierte ZIP, prüft alle Bytes/CSP/Lizenzen und testet Chromium sowie WebKit unter Root und `/Air-OS/`. Kein Deployment. Workflowerfolg wird erst nach tatsächlichem Lauf dokumentiert.

## Checkpoint D — echte Safari-Fehlersuche

CI [41836745449](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41836745449): Chromium unter Root und Unterpfad bestanden; WebKit scheiterte beim Backup mit `NotFoundError`. Keine Safari-Freigabe. Zusätzliche Blob-Readback-/Audiodecoder-Prüfungen grenzen dies jetzt ein. Lokales Chromium besteht auch bei tatsächlichem Abspielfortschritt statt bloßem `paused=false`.

Pointercapture wird bei Abbruch/Fokusverlust beendet, Fenster bleiben vollständig im verfügbaren Viewport; Long-Press unterdrückt den folgenden Ghost-Klick. Die Cache-Namen enthalten den Service-Worker-Scope und löschen keine fremden Unterpfad-Caches. Arcade-Timer pausieren auch hinter dem Lockscreen. Backup-Merge behält bestehende Einstellungen statt wegen automatisch angelegter Setting-IDs abzubrechen.

## Checkpoint E — Datenworkflows und kalter Neustart

28 Node-Regressionen und **41 echte Chromiumprüfungen / 27 Aufnahmen** bestanden. Der Testserver wird tatsächlich beendet; anschließend wird der ganze Browserprozess geschlossen und mit demselben isolierten Profil ohne verfügbaren Server gestartet. Notes, Dokumente und exportierbare Musikbytes bleiben erhalten. Echte Dateiaktionen (Copy/Move/Rename/Trash/Restore/Zyklen), PNG-Import/Decode, AirCard, Arcade/Intervallcleanup, Undo/Redo und Speicherkonflikte sind geprüft.

Backup-Restore validiert Modelle und Ordnerbeziehungen. Ein einzelner IDB-Commit stellt Nutzerdaten samt Journal für alte Timer-/Player-/Handschrift-Schlüssel wieder her; bei einem LocalStorage-Fehler bleibt das Journal für einen sicheren Retry erhalten. Keine Datenbanklöschung. Bewusstes Überschreiben verlangt die bestehende zweite Bestätigung. Ein fehlgeschlagener Konfliktimport verändert keine Nutzerdaten.

WebKit-Zwischenlauf: Medien-/Backup-Prüfungen bestanden, Offline-Emulation verursachte internen WebKit-Navigationsfehler. Der nächste Test nutzt statt Browseremulation einen tatsächlich abgeschalteten HTTP-Server. Physische iPad-Abnahme bleibt unabhängig davon offen.

## Checkpoint F — realer Update- und Rückfalltest

Lokales Chromium: **8 zusätzliche Updateprüfungen / 7 Aufnahmen** bestanden. Original-v4-Oberfläche aus dem verbindlichen Commit wird tatsächlich geladen, spielt synthetische Musik, lädt den neuen Worker wartend und läuft ohne erzwungenen Musikabbruch weiter. Nach Schließen aller alten Clients aktiviert v5. SHA-256 der alten Audiodatei stimmt exakt überein; alter Kalender/Timer bleiben erhalten. Zweiter Tab mit Audio und ungespeicherte Notes blockieren den neuen Worker; nach Speichern/Pause gelingt Aktivierung.

Ein **getrenntes kompatibles Classic-Recovery-ZIP** enthält die ursprüngliche Vier-App-Oberfläche mit aktuellem v2-fähigem Datenadapter. Der echte Rückfalltest öffnet damit die unveränderten Musikbytes und kann auch die weiterhin gespeicherten Workspace-Daten exportieren. Kein Datenbank-Downgrade und kein Deployment. Unveränderter alter v1-Code wäre nach einem v2-Upgrade kein sicherer Rückweg; deshalb diese ausdrücklich getestete kompatible Variante verwenden.

Musikmetadaten werden im Records-Bereich getrennt von den vorhandenen Audiodateien aktualisiert. Der wiederholte WebKit-Blobfehler nach erneutem Schreiben gelesener Audio-Blobs wird damit gezielt vermieden; Bestätigung durch nächsten WebKit-CI-Lauf steht noch aus. Fensterrestore und gleichzeitige Appstarts sind serialisiert. Kalender besitzt zusätzlich Such-/Tages-/Wochenfilter; Reminder-Bearbeitung umfasst Liste, Datum und Priorität.
