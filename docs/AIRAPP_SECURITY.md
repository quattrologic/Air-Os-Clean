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

## Sandbox-Runtime und Integration

`src/main/airapp-runtime.cjs` registriert vor Electron-Start das sichere `airapp:`-Schema. Für installierte Pakete wird pro Benutzer und App eine eigene Session-Partition verwendet. Berechtigungsanfragen, externe Netzwerke, Downloads, Popups, Webviews und unbekannte Navigationsziele werden blockiert. Der Dateidienst erlaubt nur im installierten Manifest benannte, reguläre Dateien und setzt CSP-Header. Der Renderer bekommt weder Preload noch Node-Zugriff.

Ein lokaler Katalog mit signiertem `Air Timer`-Demo-Paket ist vorhanden. Sein öffentlicher Demo-Schlüssel ist im Repository, der private Schlüssel **nicht**. Die GUI wird separat ergänzt; der Signatur- und Sandbox-Code muss noch gegen eine echte Electron-Laufzeit getestet werden.

## Lokaler Demo-Katalog

Air Timer liegt als unterschriebenes UTF-8-Paket in `store/catalog/demo-timer.airapp`. SHA256-Dateiprüfung und Ed25519-Signatur werden vor dem Kopieren geprüft. Der private Demo-Signierschlüssel wurde **nicht** im Repository hinterlegt. Die neue `Air App Store`-Ansicht installiert und deinstalliert diese konkrete App pro Benutzer und startet sie über den isolierten Electron-Runtime-Adapter. Es gibt **keinen** freien Download fremder Pakete, keine Zahlungen und keine anwendungsspezifischen Berechtigungen.

## App-Verwaltung und Launchpad

Nach Anmeldung liest `air-app-bootstrap.js` über die bereits authentifizierte IPC-Schnittstelle die tatsächlich installierten Air-OS-Apps. `airAppRegistry.syncInstalled()` legt reine Metadaten mit `origin: 'store'` an; installierte Apps erscheinen damit in Launchpad und Spotlight. Eine solche Registrierung erteilt selbst **keine** Rechte: `openApp()` delegiert den Start an den Hauptprozess, der Installation, Profil und Signatur erneut verifiziert.
