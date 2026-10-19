# Air-OS – lokales signiertes .airapp-Paketformat (Entwurf)

Die erste technische Implementierung befindet sich in `src/main/airapp-package.cjs` und `src/main/airapp-manager.cjs`.

## Format

Ein UTF-8-JSON-Dokument mit `manifest`, `assets`, `signer` und `signature`. Signatur: Ed25519 über exakt `Buffer.from(JSON.stringify(manifest),'utf8')`. Jedes Asset ist Base64 und steht mit SHA256-Digest in `manifest.files`. Version `schemaVersion: 1`, exakt kontrollierter Dateipfad, App-ID und SemVer erforderlich. Noch keine ABI für native Erweiterungen.

## Sicherheitsgarantien

- Kein Benutzer darf freie lokale Pfade oder URLs als zu installierendes Paket übergeben; lokale Katalog-ID ist serverseitig festgelegt.
- Vor Dateischreibzugriff muss die Signatur mit einem **fest eingebauten öffentlichen Herausgeberschlüssel** und jeder Asset-Hash geprüft werden.
- Akzeptiert sind nur statische HTML-/CSS-/JS-/Bilddateien, derzeit **keine angefragten Berechtigungen**.
- Installiert wird in einem konto-spezifischen Verzeichnis durch eine temporäre Struktur und einen atomaren Rename.
- Eine .airapp-Datei ist **niemals direkt in Node/Electron-Hauptprozess auszuführen**.
- Der zugehörige isolierte BrowserWindow-Start und die UI sind eine separate nachfolgende Entwicklungseinheit. Bis dahin darf keine Oberfläche eine vollständige Installation/Startfunktion behaupten.

## Grenzen

Ed25519-Prüfung bietet Herkunftsschutz nur solange der private Signierschlüssel geheim bleibt. Ein Demo-Schlüssel ist keine Produktions-Trust-Root. Später erforderlich: kanonische Signaturserialisierung (z.B. RFC 8785), Schlüsselrotation/Widerruf, Version-Rollback-Schutz, Plattformprüfungen, Größenlimits, konsistente Deinstallations-Transaktionen, CSP, Berechtigungsdialoge, unabhängige Penetrationstests und Code Signing der Host-Anwendung.

Der Demo-Signierschlüssel darf **nicht** ins Repository eingecheckt werden. `npm audit` bleibt unabhängig davon ein Release-Blocker.
