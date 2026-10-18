# Air-OS – Entwicklung und Architektur

## Voraussetzungen und Start

Node.js **22+**, npm und Git. Installation mit `npm install`, Start mit `npm start`.

## Projektstruktur

| Pfad | Aufgabe |
| --- | --- |
| `main.cjs` | Electron-Hauptprozess, Fenster, lokale Konten und geprüfte Systemzugriffe |
| `preload.cjs` | Begrenzte Brücke zwischen Renderer und Hauptprozess |
| `index.html`, `app.js`, `styles.css` | Desktop, Dock und App-Fenster |
| `login.html`, `login.js`, `login.css` | Lokale Anmeldung |
| `air-os-enhancements.*` | Ergänzende Desktop-Funktionen |
| `airwrite.*` | Aktueller AirWrite-Zeichenblock |
| `aircard-lite.js`, `aircard/` | AirCard Lite und lokale Artwork-Funktionen |
| `cloud-sync/` | Vorbereitende Cloud-Datengrenzen, kein fertiger Cloud-Dienst |
| `tests/` | Node-Testfälle |
| `.github/workflows/` | Build- und Sicherheitsprüfungen |

## Testen

```bash
node --test tests/*.test.cjs
node --check main.cjs
node --check preload.cjs
node --check app.js
node --check airwrite.js
node --check air-os-enhancements.js
node --check aircard-lite.js
node --check login.js
```

Die Tests decken aktuell vor allem Cloud-Sync-Hilfsmodule ab. Sie ersetzen **keinen** vollständigen GUI-, Installations- oder plattformübergreifenden Sicherheitstest.

## Installer

```bash
npm run pack:win
npm run pack:mac
npm run pack:linux
```

`electron-builder` legt die Pakete in `dist/` ab. Der jeweilige Build benötigt eine passende Umgebung. Die GitHub-Workflows bauen Windows- und macOS-Versionen auf den jeweiligen Runnern. Pushes auf `main` veröffentlichen Vorab-Builds unter [Releases](https://github.com/quattrologic/Air-Os-Clean/releases). Die Builds sind derzeit **nicht offiziell signiert oder notarisiert**.

## Datenschutz und Sicherheitsmodell

- Lokale App-Profile sind **keine** Windows-/macOS-Benutzerkonten.
- Lokale Daten werden nicht automatisch geräteübergreifend synchronisiert.
- Der Finder benötigt eine bewusste Ordnerauswahl und begrenzt Zugriffe auf den gewählten Bereich.
- Keine geheimen Schlüssel in `package.json`, Renderer-Dateien, Git-Historie oder Installer einbauen.
- Cloud-Sync-Module dürfen nicht mit produktiver Ende-zu-Ende-Synchronisierung verwechselt werden.
- Vor neuen Netzwerkschnittstellen Berechtigungen, Datensparsamkeit und Fehlerbehandlung dokumentieren.

## Manuelle Prüfung vor einer Veröffentlichung

1. Frische Installation unter Windows und macOS.
2. Neues lokales Konto anlegen, anmelden und abmelden.
3. Fenster öffnen, verschieben, minimieren und wiederherstellen.
4. Finder mit bewusst ausgewähltem Testordner prüfen; Pfadgrenzen respektieren.
5. Desktop-Symbole, Dock, Air Arcade und Downloads auf Darstellung prüfen.
6. Netzwerkabhängige Funktionen auch offline testen.
7. Prüfen, dass keine privaten Daten oder geheimen Schlüssel im Paket enthalten sind.
8. Sicherheits-Workflow, Dependency-Audit und Release-Dateien kontrollieren.

Siehe auch [CONTRIBUTING.md](../CONTRIBUTING.md), [SECURITY.md](../SECURITY.md) und [ROADMAP.md](../ROADMAP.md).
