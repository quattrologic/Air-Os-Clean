# Air-OS Cloud-Sync – Vorbereitung

Status: **Nur Grundlage, nicht aktiviert.** Air-OS überträgt derzeit **keine** Daten an eine Cloud.

## Sicherheitsmodell
- **Opt-in:** Synchronisierung erst nach ausdrücklicher Zustimmung im UI und Verbindung mit einem Anbieter.
- **Lokale Konten bleiben lokal.** `accounts.json`, Passwörter, scrypt-Salts/Hashes, Zugangstokens, AirCard-Wallet-Daten, Dateisystemordner und private Schlüssel niemals hochladen.
- Zulässige Dokumentkategorien für die spätere erste Version: `settings`, `notes`, `calendar`. Die Kategorien allein sind **keine Freigabe** sämtlicher lokaler Inhalte: Vor dem Anschluss echte Feld-Whitelists je Kategorie definieren.
- Keine GitHub-Repository-Secrets als Endnutzer-Anmeldedaten verwenden. OAuth/OIDC mit PKCE und sicherem Token-Speicher im Betriebssystem vorsehen.
- Serverseitige Autorisierung pro Benutzer und Dokument (Row Level Security oder vergleichbar); TLS; restriktive Zugriffsregeln; Lösch-/Exportfunktion.
- Ende-zu-Ende-Verschlüsselung ist **noch nicht implementiert**. Vor Synchronisierung sensibler Notizen oder Kalenderdaten Datenschutzkonzept prüfen.
- Konflikte nicht nach Gerätezeit still überschreiben. Version/ETag und explizite Konfliktbehandlung einsetzen.
- Keine automatische Synchronisierung beim App-Start; offline-first und lokale Backups erhalten.

## Vorhandener Baustein
`cloud-sync/core.cjs` bietet Dokumentvalidierung, SHA-256-Fingerprints und Konflikterkennung ohne Netzwerkzugriffe. Das Modul ist **noch nicht** an die Electron-App oder die Oberfläche angeschlossen. `node --test tests/cloud-sync.test.cjs` prüft die Grundregeln.

## Nächste Implementierungsschritte
1. Cloud-Anbieter auswählen (z. B. Supabase oder eigener Server), Free-Tier-Limits und Datenschutz prüfen.
2. Datenmodell mit Benutzer-ID, Dokument-ID, Version/ETag, Zeitstempel, verschlüsseltem Payload und Löschmarkern festlegen.
3. Sichere OAuth-Anmeldung und Token-Speicherung im Electron-Hauptprozess implementieren.
4. Nur ausdrücklich ausgewählte, geprüfte Daten in die Sync-Warteschlange aufnehmen.
5. Benutzeroberfläche für An-/Ausschalten, Status, Konflikte, Export und Cloud-Daten-Löschung bauen.
6. Mit zwei Geräten, Offline-Modus, widerrufener Anmeldung und Konflikten testen.

**Keine Cloud-Zugangsdaten in GitHub committen.**
