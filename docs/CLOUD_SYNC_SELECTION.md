# Cloud-Sync-Auswahl: Einstellungen, Apps, AirWrite und Finder

**Status: vorbereitet, nicht aktiviert.** Keine Verbindung zu Supabase, keine Cloud-Anmeldung, keine Dateiübertragung.

## Geplante Auswahl im Air-OS-Einstellungsfenster
- Hauptschalter: Cloud-Sync **aus** (Standard).
- Einstellungen: Design, Dock und freigegebene Geräteeinstellungen.
- Apps: pro App explizite Freigabe der unterstützten Datentypen.
- AirWrite: Handschrift als **editierbare Strichdaten** (Punkte, Druck, Werkzeug, Seiten, Dokumentversion) und optional Vorschaubilder; keine automatische Synchronisierung fremder Dateien.
- Finder: **nur einzelne ausdrücklich ausgewählte Dateien** innerhalb eines vom Nutzer freigegebenen Arbeitsordners. Ordner-Synchronisierung später nur mit separater expliziter Freigabe und klarer Anzeige der enthaltenen Dateien.
- Status, letzter Abgleich, Konflikte, Pause, Abmelden, Export und Löschen der Cloud-Kopie.

## Implementierte Vorbereitung
`cloud-sync/selection.cjs` implementiert eine reine lokale Freigabeprüfung. Der Standard ist aus. Kategorien müssen ausdrücklich gesetzt werden; Apps werden über IDs, Finder-Dateien über relative Pfade ausgewählt. Die Freigabe selbst lädt **nichts** hoch.

`cloud-sync/core.cjs` ist ein separater Dokumentprüfer für eine frühe Testmenge (`settings`, `notes`, `calendar`). **AirWrite-, App- und Finder-Upload sind dort noch nicht implementiert.** Diese Dateitypen benötigen getrennte Schemas, Limits und Transportlogik.

## Sicherheit vor echter Freischaltung
1. Cloud-Provider (geplant: Supabase) auswählen und Projekt einrichten. Nur öffentliche Projekt-URL und Publishable/Anon-Key im Client; niemals Service-Role-Key. RLS für alle Benutzerdateien aktivieren und mit zwei Testkonten prüfen.
2. Authentifizierung im Electron-Hauptprozess; Tokens im OS-Keychain speichern, niemals in `accounts.json` oder Git.
3. Finder-Dateien **nach** expliziter Auswahl im Hauptprozess erneut auf Pfadgrenzen und symbolische Links prüfen; Auswahl an einen stabilen, freigegebenen Root binden. Größenlimits, Dateitypen und Quoten durchsetzen. Keine Hintergrund-Vollplattensuche.
4. Keine Konten, Passwörter, Hashes, API-Schlüssel, Tokens, AirCard-/Wallet-Daten oder Systemordner synchronisieren.
5. Versionierung, ETag/optimistische Sperren, Konflikt-UI, Offline-Warteschlange, Wiederholungen und Löschmarkierungen ergänzen. Keine stillen Überschreibungen.
6. Handschrift-Format mit Version und Migrationspfad definieren, damit editierbare Strokes erhalten bleiben. AirWrite ist im derzeitigen Repository noch nicht als eigene App-Datei vorhanden; die tatsächliche Integration folgt mit AirWrite.
7. Datenschutz und gegebenenfalls clientseitige Verschlüsselung vor Freischaltung sensibler Inhalte klären.

Tests: `node --test tests/cloud-sync.test.cjs tests/cloud-sync-selection.test.cjs`.
