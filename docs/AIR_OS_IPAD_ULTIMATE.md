# Air-OS Ultimate · iPad Edition

Basis: feat/air-os-r7-final-experience @ 02ccaf88724731cf685d2221f88e959020aff3f0.
Branch: feat/air-os-ipad-ultimate.
Produkt-/Buildstand: 6e9094530175455c4214dcad08550284de63a483.
Installierbare Browser-PWA; keine native App-Store-App oder iPadOS-Shell.

## Tatsächlich implementiert

Die Beschränkung auf wenige PWA-1-Apps ist entfernt. Finder, Notes, Reminders, Kalender, Musik, Einstellungen, Air Home, AirWrite, Rechner und Launchpad verwenden die vorhandenen echten Controller. Spotlight durchsucht Apps, Notiztitel, Aufgaben, Termine und interne Dateien. Alle 25 im Browser registrierten Apps haben einen lokalen Einstieg oder eine sichtbare Verfügbarkeitsangabe; native Apppakete werden nicht als Webapps ausgegeben.

Die bestehende openApps-/Lifecycle-/MRU-Verwaltung läuft auch auf Plattform web. Drag, Resize, Fokus, Maximize/Restore, Minimize/Restore, interne Layouts und Arbeitsbereiche verwenden dieselbe Registry und dieselben Fenster. Der PWA-Hook passt die gemeinsame Arbeitsfläche an Safe Areas und VisualViewport an. Touchziele, Pointercancel, Long Press auf Dockicons, Appübersicht und bestätigte Dock-Reihenfolge ergänzen diesen Pfad. Trackpad-Hover bleibt beim vorhandenen MacShell-Dock. Touch-Reordering erfolgt zuverlässig über Reihenfolgeknöpfe; zusätzlicher Touch-Drag zum Umsortieren wurde nicht behauptet. Unter 640 CSS-Pixeln fallen nicht sinnvoll teilbare Fensterlayouts auf eine aktive App zurück.

M1/M2, Dock-/Island-Außenform, Logo, Wolkenwallpaper und Tahoe-Fenster bleiben erhalten. Kalendertermine lassen sich nun auch über das bestehende Formular bearbeiten. Finder-Aktionen bleiben in schmalen Teilfenstern erreichbar; Notes/Reminders erhalten inneren Platz oberhalb des Overlay-Docks. Der Fensterhost selbst reserviert keine Dockhöhe.

## Architektur und Daten

| Schicht | Ausführung |
|---|---|
| Gemeinsame Apps/Shell | Bestehende Renderercontroller, Registry, Fensterverwaltung, Widgets und Suchdienst |
| Browserfähigkeiten | pwa/adapter.js, files.js, apps.js, desktop.js |
| Speicherung | pwa/storage.js: IndexedDB, Transaktionen, CAS, Sessionprüfung, Quota-/Fehlerbehandlung |
| Gemeinsame Formate | src/core/notes-format.js und reminders-format.js; Browser und nativer Reminderstore verwenden dasselbe Format |
| Kalender, Playlists, AirWrite | Bestehende ProfileLocal-Schnittstelle mit asynchroner IndexedDB-Facade; native Speicherung bleibt erhalten |
| Audio | Bestehende AmplitudeJS-Engine, File-/Blob-Import, derselbe Transport für App/Widget/Island/Kontrollzentrum |
| Optionale Medienfläche | pwa/media-session.js, nur bei vorhandener Browser-API; Cleanup von Metadaten/Handlern |
| Electron-Main/Preload, native Hyprland-IPC | Im Browserpaket nicht enthalten/aufgerufen |
| Cloud/Push | Deaktiviert, keine Backend-/Service-Role-Schlüssel oder simulierte Synchronisierung |

IndexedDB air-os-pwa-local-v1 wird auf Version 2 erweitert; der vorhandene data-Store und PWA-1-Notizen/Einstellungen bleiben erhalten. Der Standardbereich nutzt seine bisherigen Schlüssel. Weitere ausdrücklich gewählte lokale Bereiche erhalten getrennte Schlüsselräume. Notes, Reminders, Kalender, Playlists, virtuelle Dateien, Medien und AirWrite liegen in derselben Browserdatenbank. Desktopprofile werden nicht eingelesen.

**Lokale Bereiche sind kein Passwortschutz und keine sichere Authentifizierung.** Die Startseite sagt dies ausdrücklich. Browserdaten gelten pro Origin; eigene Daten auf einer vertrauenswürdigen eigenen HTTPS-Origin verwenden. Andere Skripte derselben Origin wären keine Sicherheitsgrenze. Cloudanmeldung bleibt aus.

Schreiben wird nach transaction.oncomplete bestätigt. Notiz-Snapshots und Kalender-/Playlist-Snapshots schützen vor veraltetem Überschreiben. Abgebrochene Transaktionen behalten den bisherigen Inhalt. Sitzungsende bricht offene Transaktionen ab, schließt Datenbank/Channel, entfernt Medien-/Mitteilungszustände und verdeckt den alten DOM. BFCache-Rücksprünge laden neu. Logout/Update verweigern das Verwerfen offener Notes-/Finder-Änderungen.

Backup/Restore enthält versionierte JSON-Daten und Blob-Inhalte. Restore benötigt Bestätigung und validiert das gesamte Paket vor atomarer Ersetzung. Null-/Array-Sammlungen, doppelte IDs und ungültige Zeitstempel werden vor dem Schreiben abgewiesen. Backups sind **unverschlüsselte private Exporte**. Browserstorage kann vom System oder Nutzer gelöscht werden; keine ewige Haltbarkeitszusage.

Grenzen: 200 Notizen à 512 KiB, 300 Aufgaben, 1.000 Termine; Finder 500 Einträge/16 MiB, Einzelimport bis 8 MiB; persistente Musik 40 Dateien/16 MiB; Gesamtbackup bis 48 MiB. Größere Inhalte einzeln exportieren. Safari verwaltet Downloads. Kein beliebiger Zugriff auf die Dateien-App, kein showDirectoryPicker und kein nativer Apple-Kalender.

## Funktionsmatrix

„Funktionierend“ bezeichnet den bestehenden Appumfang, nicht die gesamte gleichnamige native Betriebssystem-App. Desktop = vorhandener R7-Vertrag; keine neue native Windows-Abnahme in diesem Auftrag.

| App/Funktion | Desktop | iPad-PWA | Offline | Persistenz | Geprüfter Pfad / Einschränkung |
|---|---|---|---|---|---|
| Air Home | R7 | Funktionierend | Ja | Gemeinsame Stores | Start und echte Notiz-/Aufgabencontroller |
| Finder | Autorisierte Roots | Webalternative | Ja | IndexedDB-Blobs | Import, Textwrite, Rename, Duplicate, Ordner, Suche, Traversal-/Import-Rollback; Download statt nativer App; kein interner Drag-Move |
| Notes | R7 | Funktionierend | Ja | IndexedDB | UI-Schreiben, CAS-Konflikt, Retry/Fehler, Export, Neustart; explizites Sichern |
| Reminders | R7 | Funktionierend | Ja | IndexedDB | Erstellen, Fälligkeit, Priorität, Erledigen, benannte Listen/Filter, Heute-Widget |
| Kalender | R7 | Funktionierend | Ja | IndexedDB | UI-Erstellen/Bearbeiten, Entfernen, Monats-/Tagesnavigation, ICS-Export; kein Apple-Kalender |
| Air Music | R7-Transport | Eingeschränkt funktionierend | Nach Import | Blobs/Playlists | Ohne Autoplay, echter Transport/Restore; 16 MiB; Geräteaudio/iOS-Lautstärke/Background offen |
| Einstellungen | R7 | Browserpräferenzen funktionierend | Ja | IndexedDB | Gemeinsame Darstellung; Qualität/Backup im iPad-Menü; keine nativen OS-Aktionen |
| AirWrite | R7-MVP | Funktionierend im MVP-Umfang | Ja | IndexedDB | Pointerstrich und bestätigtes Zeichenprofil, Import/Export; kein PencilKit/keine Erkennung |
| Rechner | R7 | Funktionierend | Ja | Nicht nötig | Gemeinsamer Rechencontroller/Regressionen und Browserstart |
| Launchpad | R7 | Funktionierend | Ja | Gemeinsame Pins | Registry/Suche/Tastatur, Tahoe-Icons, Verfügbarkeitsangaben |
| Spotlight | R7 | Lokale Suche funktionierend | Ja | Vorhandene Stores | Apps, Notiztitel, Aufgaben, Termine und interne Dateinamen |
| Fotos | Ausgewählte Dateien | Eingeschränkt funktionierend | Nach Auswahl | Sitzung | Bildauswahl/Ansicht, begrenzter Import; keine native/persistente Fotomediathek |
| Browser/Webstart | Linkstarter | Eingeschränkt funktionierend | Oberfläche | Keine Webhistorie | Gewählte externe Seiten in Safari; Inhalte benötigen Internet |
| Mail | Anbieterlinks | Eingeschränkt funktionierend | Oberfläche | Kein Postfach | Anbieterlinks; kein behaupteter OAuth-Posteingang |
| Downloads | Nativer Ordner | Webalternative | Ja | Interner Finder | Safari-Export; kein Zugriff auf nativen Downloadordner |
| Arcade | R7-Spiele | Eingeschränkt funktionierend | Ja | Bestehender Umfang | Browserstart/Webspiele; einzelne Spiele benötigen Tastatur |
| Über Air-OS | R7 | Funktionierend | Ja | Nicht nötig | Browserstart, Originalidentität |
| Spotify | Nativer Start | Nicht unterstützt; Weblink | Nein | Keine | Kein nativer Spotify-Transport |
| AirCard Lite | Desktopadapter | Nicht unterstützt | Nein | Keine | Verfügbarkeitsdialog |
| App Store/native Pakete | Desktopvertrag | Nicht unterstützt | Nein | Keine | Keine EXE-/Apppaketinstallation; fremde Profile nicht aufgelistet |
| KI/Ollama | Desktopdienst | Nicht unterstützt | Nein | Keine | Kein lokaler iPad-Ollama-Dienst |
| Übersetzer | Externer Dienst | Nicht konfiguriert | Nein | Keine | Keine ungefragte Weitergabe von Eingaben |
| Wetter | Desktopdienst | Nicht konfiguriert | Leerzustand | Widgetpräferenzen | Keine Standortabfrage/Fakewerte; Browserprovider offen |
| Fußball | Externer Dienst | Nicht konfiguriert | Nein | Keine | Ehrliche Verfügbarkeitsangabe |
| Aktien | Externer Dienst | Nicht konfiguriert | Nein | Keine | Keine Livekurse/Anbieterframes |
| Papierkorb | Desktopumfang | Nicht implementiert | Nein | Keine | Finder löscht nach Bestätigung; keine vorgetäuschte Wiederherstellung |
| Widgets | Gemeinsamer Manager | Datenabhängig funktionierend | Ja | Präferenzen/Stores | Uhr/Heute, Kalender, Notes, Reminders, Player, ausgewähltes Bild; Wetter ohne Quelle |
| Kontrollzentrum | 12 Controls | Gemeinsame Oberfläche | Ja | Präferenzen | Fokus/Darstellung/Musik; Wake Lock nur bei API und expliziter Aktivierung; keine Fake-OS-Schalter |
| Mitteilungen | Appereignisse | Gemeinsamer Verlauf | Ja | Sitzung | Dienst/Fokus, Öffnen/Gelesen/Entfernen; kein Push |
| MacLock | Desktopauth | Lokaler Startbildschirm | Ja | Bereichswahl | Keine sichere Anmeldung/iPadOS-Sperre; keine privaten Karten vor Öffnen |
| Fenster/Workspaces | R7/Electron-F11 | Interne PWA-Fenster | Ja | Bereichspräferenzen | Drag/Resize/Cancel, MRU, Snap/Layout, Minimize/Reverse; kein Stage Manager/native F11 |
| Cloud/Backup | Bestehende Infrastruktur | Cloud aus, Backup funktioniert | Backup ja | Datei/IndexedDB | Atomarer validierter Restore/Binär-Roundtrip; kein Backend-/Push-Test |

## Originalquellen und Materialien

Bestehende Originalports werden ausgeführt und nicht erneut als neue Übernahmen gezählt:

- MacShell 1bdb51870b621100fd2709f66c8f8e00ab17b9c4, MIT: vorhandene Dockmagnifikation, Widgetkomposition, Kontrollzentrum, Shellinteraktionen und GLASS-3-Shaderpipeline.
- MacTahoe GTK 1e45e19f510edb8cde18fa84d6cd5319f60b086b, MIT: bestehende Sass-Werte in air-tahoe.css, dunkle Header/Sidebars, helle Arbeitsflächen und Controls.
- MacTahoe Icons 839848b9a8a38a92a6936e30c4abe35cc6f2546d, GPL-3.0: zentrale Zuordnung mit 56 Schlüsseln; 54 eindeutige Original-SVGs laut vorhandenem NOTICE, einschließlich Browserexports. Keine neuen Markenassets.
- Hyprland 0aa6745f705f2c4b0a5004eb019ef76e5bbdb426, BSD-3-Clause: vorhandene reine interne Layout-/Materialalgorithmen, keine native Wayland-Abhängigkeit.

Lizenzen, AUTHORS, COPYING, NOTICE, Originalquellen/Hashes bleiben im Paket; siehe third_party/tahoe/provenance.json und RUNTIME-ASSETS.json. Eigene Anpassungen: Browseradapter, Transaktionen, Touchziele, Viewport und lokale Werkzeuge. Kein direkt ausgeführter QML-/GTK-Compositor behauptet.

**Standard** nutzt CSS-Compositor-Glas; **Hoch** dieselbe GLASS-3-Engine nach WebGL2-/Hardwareklassifikation; **Reduziert** respektiert Transparenzreduktion. CSS-Blur ist keine Snell-Refraktion. Shader-Backdrop bleibt wallpaper-only. Keine Bildschirmaufnahme/Fremdfenstertexturen und kein erzwungenes WebGL auf Software-/unbekannten GPUs. MacLock nutzt die visuelle Startschicht; native Desktop-Authentifizierung wird nicht in den Browser importiert.

## Tests, Messwerte und Bilder

571/571 Node-Regressionen, einschließlich aller 557 Ausgangstests. Neue Prüfungen: Datenformate, Browsergrenzen, Transaktionen/Backup, Viewport, Workflow, Lizenz-/Byteinventar, Media Session und BFCache.

Lokal: **90 Chromium-Browserprüfungen**, sieben Größen, DPR2, echte Touch-Taps und Maus-/Pointerdrag. Synthetische Daten, Testuhr 29.10.2026 12:34 UTC. Geprüft: v1-Migration, Notes/Reminders/Termine, Finder/Textwrite, CAS, injizierte Quota-/Transaktionsfehler, Musik ohne Autoplay, AirWrite, Backup/Blob-Roundtrip, zwei lokale Bereiche, Offline-Neuladen und Browserprozess-Neustart ohne erreichbare Origin, Registryeinträge, Classic/Modern, M2 und GPU-Guards.

Alle sechs Kernappfenster wurden je Größe gemessen: kein horizontaler Dokumentüberlauf, Host/maximierte Fenster innerhalb des Viewports. Safe Areas sind in Linux null. Echte iPad-Tastatur/Pencil/Insets bleiben offen; Emulation ist keine Hardwareabnahme.

| CSS-Viewport | Fensterhost |
|---|---|
| 1024×768 | x0 / y24 / 1024×744 |
| 1180×820 | x0 / y24 / 1180×796 |
| 1366×1024 | x0 / y24 / 1366×1000 |
| 834×1194 | x0 / y24 / 834×1170 |
| 820×1180 | x0 / y24 / 820×1156 |
| 744×1133 | x0 / y24 / 744×1109 |
| 390×600 | x0 / y24 / 390×576 |

[Messwerte/Prüfliste](screenshots/ipad-ultimate/chromium/results.json).
[Vorher: originaler R7-PWA-Build](screenshots/ipad-ultimate/before/1180x820-desktop.jpg) · [Nachher: Desktop/Dock/Widgets](screenshots/ipad-ultimate/chromium/1180x820-desktop.jpg) · [Hochformat](screenshots/ipad-ultimate/chromium/834x1194-desktop.jpg) · [kleiner Fallback](screenshots/ipad-ultimate/chromium/390x600-desktop.jpg).

Weitere Rendereraufnahmen: [Start](screenshots/ipad-ultimate/chromium/1180x820-start-screen.jpg), [zwei Apps](screenshots/ipad-ultimate/chromium/1180x820-two-apps.jpg), [Finder](screenshots/ipad-ultimate/chromium/1180x820-finder.jpg), [Notes](screenshots/ipad-ultimate/chromium/1180x820-notes.jpg), [Reminders](screenshots/ipad-ultimate/chromium/1180x820-reminders.jpg), [Kalender](screenshots/ipad-ultimate/chromium/1180x820-calendar.jpg), [Musik](screenshots/ipad-ultimate/chromium/1180x820-music.jpg), [AirWrite](screenshots/ipad-ultimate/chromium/1180x820-airwrite.jpg), [Einstellungen](screenshots/ipad-ultimate/chromium/1180x820-settings.jpg), [Launchpad](screenshots/ipad-ultimate/chromium/1180x820-launchpad.jpg), [Spotlight](screenshots/ipad-ultimate/chromium/1180x820-spotlight.jpg), [Kontrollzentrum](screenshots/ipad-ultimate/chromium/1180x820-control-center.jpg), [Mitteilungen](screenshots/ipad-ultimate/chromium/1180x820-notifications.jpg), [Appübersicht](screenshots/ipad-ultimate/chromium/1180x820-overview.jpg), [Offline](screenshots/ipad-ultimate/chromium/1180x820-offline-notes.jpg), [Backup](screenshots/ipad-ultimate/chromium/1180x820-storage-tools.jpg).
Direkte JPEG-Browseraufnahmen ohne Retusche; durch DPR2 sind Pixelmaße doppelt so groß wie CSS-Angaben.

Aus Bildern korrigiert: übergroße Traffic-Light-Flächen, doppelte obere Hostverschiebung, Widgetpager über Apps, falscher Zwei-App-Layoutfallback, überlappende Finderaktionen und Notes-/Reminders-Footer am Dock. Keine Pixelgleichheit zu Qt behauptet.

Performance: Standard ohne GL-Programme/GL-Texturen; 0 zusätzliche GL-Idle-Draws im gemessenen 500-ms-Fenster. Keine Aussage über CSS-Compositorkosten/FPS/Akku. Im lokalen Hochqualitäts-Probeversuch wurde Software-GPU erkannt und CSS-Fallback verwendet. Hochqualität separat diagnostiziert; keine Hardware-GPU-Freigabe.

## Browser-CI und Offline-Grenze

Workflow: .github/workflows/build-air-os-ipad.yml; Featurebranch/manueller Build, contents:read, keine Veröffentlichung. Playwright 1.62.1/AmplitudeJS 5.3.2 fixiert; eingefrorene Desktop-Testtools für ASAR-/Securityregressionen. Audits einschließlich Testabhängigkeiten ohne Befunde.

Lokaler WebKit-Download war durch den Netzwerkfilter blockiert; der GitHub-Runner installierte beide Engines. **[Abschlusslauf 40940401712](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40940401712) vollständig erfolgreich**: Audits, gesamte Regressionen, Paket-/CSP-/Lizenz-/Byteprüfung, Chromium **90** und WebKit **89** Browserprüfungen bei je sieben Größen. [Maschinenlesbarer CI-Nachweis](screenshots/ipad-ultimate/ci-proof.json). Beide Browserpfade benutzen reale Engines; keine physische iPad-Abnahme.

In [Lauf 40933579317](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40933579317) brach WebKit beim Reload mit Playwrights Offline-Schalter intern ab. Der aktuelle gemeinsame Test schaltet die tatsächliche lokale HTTP-Origin ab, auch beim Prozessneustart; Cachemisses können den Server nicht erreichen. Chromium prüft zusätzlich den Offline-Schalter. Dies ersetzt keinen physischen Safari-Flugmodus-Test.

## Build und iPadOS-Installation

363 Dateien / 362 Offlineassets; inventarisierte Bytes, CSP und Pflichtlizenzen geprüft. Keine Main-/Preload-/cjs-/node-/EXE-Dateien, privaten Profile oder Cloudantworten.

Lokales ZIP: Air-OS-Ultimate-iPad-6e9094530175.zip, 2.252.510 Bytes.
SHA-256: 184ff5998cbabb05968b72798e2b6bd8e936b0a9d3845ae6163eec75daf4d6d3.
BUILD-INFO enthält den sauberen Produkt-/Buildcommit. **CI erfolgreich. [Installationsartefakt](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40940401712/artifacts/12928280262) · [WebKit-/Chromium-Screenshots, Tests und Audits](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40940401712/artifacts/12926629016).** Der innere ZIP-Hash stimmt mit dem lokalen, aus sauberem Checkout gebauten ZIP überein. Der separate Actions-Containerdigest ist in ci-proof.json festgehalten.

1. ZIP und SHA256SUMS.txt aus dem geprüften Actions-Artefakt beziehen und prüfen.
2. Inhalt auf einem eigenen vertrauenswürdigen HTTPS-Webhost entpacken; Unterverzeichnis möglich, URLs/Scopes sind relativ.
3. Safari öffnen, lokalen Bereich wählen, vollständigen Offline-Appcache laden lassen.
4. Teilen → Zum Home-Bildschirm → als Web-App öffnen; Bezeichnung je nach iPadOS.
5. Offline neu starten; regelmäßig über iPad-Menü → Datenbackup exportieren sichern.

Keine öffentliche Bereitstellung ausgelöst. Bestehende Pages-Preview behält manuelle Freigabe/Branchschutz. Main und Windows-/macOS-Workflows nicht geändert.

## Checkpoints und offene Abnahmen

8bb5dbe: Browseradapter/Touch-Shell, 565 Tests.
d283741: Appworkflows/Offlinepaket/Browsergate.
c96e0f7 + 12e4fa1: eingefrorene ASAR-Tools/volle Historie für unveränderte CI-Regressionen.
8142c3b: Registryfähigkeiten, Media Session, Migration/Quota/BFCache/Neustart, 570 Tests.
f692645: schmale Teilfenster, erreichbare Aktionen, originbasierter Offline-Test.
0c35d5f: maschinenlesbare Build-/Browsernachweise; erfolgreicher Chromium-/WebKit-Lauf.
833b2a8: einfache Mitteilungen statt doppelter eigener Speicherereignisse.
afc3fbb: 44px-Touchziele in gemeinsamen Appinhalten.
6e90945: strikte Backup-Sammlungs-/ID-/Zeitstempelvalidierung vor jedem Restore.

Offen: zusätzliche Island-Swipe-Gesten (Tap/M1 bleibt vorhanden), echtes iPad/Safari, Home-Screen-Installation, Safe Areas, Bildschirmtastatur, Pencil, Split View/Stage-Manager-Zuteilung, native Datei-/Download-/Share-Dialoge, Audio/Lautstärke/Background/Suspend, Akku/Hardware-WebGL; Browser-Wetterprovider, sichere Cloudauth/Sync, Push, große Medienbibliotheken und native Desktopapps. Die PWA steuert weder iPadOS-Fenster noch fremde Apps. Diese Grenzen werden nicht als fertig gemeldet.
