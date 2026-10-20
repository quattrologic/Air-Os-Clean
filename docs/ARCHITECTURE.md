# Air-OS Architektur – Phase 0 und erste Implementierung

Stand: 19.10.2026 · `main` Version 1.0.3. Air-OS Desktop Edition ist eine Electron-App, kein bootfähiges Betriebssystem.

## Verifizierter Bestand
- `main.cjs`: Electron-Hauptprozess, lokale Konten mit scrypt, geprüfte IPC-Absender, explizit freigegebener Finder-Arbeitsordner.
- `preload.cjs`: begrenzte IPC-Schnittstellen. Electron: `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`.
- `app.js`, `index.html`, `styles.css`: Dock, Fenster und vorhandene Apps; bisher eng gekoppelt.
- `air-os-enhancements.js`: Finder-Erweiterungen und Air Arcade. `air-arcade-games.js`: weitere Spiele.
- `airwrite.js`, `air-music.js`, `aircard-lite.js`, `air-extra-apps.js`: bestehende Anwendungen.
- `cloud-sync/`: vorbereitende Bausteine, kein produktiver Cloud-Dienst.
- `tests/`: vorhandene Node-Tests für Cloud-Sync und AirWrite.
- Tiny Strike: Entwurfs-PR #10; noch nicht in `main`. Nicht als bereits integrierte App ausgeben.

## Erste Implementierung: interne App Registry
`src/core/app-registry.js` bündelt bestehende Namen, CSS-Icon-Klassen und Fallback-Zeichen. Die Desktop-App nutzt die Registry direkt. API: `get(id)`, `list()`, `register(id, {name, iconClass?, glyph?})`. Registrierung validiert IDs und Metadaten, schützt vor doppelten IDs und gibt unveränderliche Snapshots zurück. Die bisherigen Erweiterungen können die gemeinsam verwendeten Metadatenobjekte vorerst weiter ergänzen.

**Grenze:** Diese Registry ist nur eine Liste vertrauenswürdiger, mitgelieferter Apps. Sie ist weder eine Sandbox noch ein Installer, eine Berechtigungsprüfung oder ein App Store. Keine untrusted Pakete darüber ausführen.

## Sicherheitsbefund und offene Probleme
- Finder-Zugriff ist auf ausgewählte Ordner begrenzt; Pfad-Traversal und Symlinks werden geprüft. Zusätzliche automatisierte IPC-/Dateisystemtests fehlen.
- Der Security-Workflow prüft Syntax, Abhängigkeiten und nun Node-Tests. Der Dependency-Audit war zuletzt fehlgeschlagen und bleibt aktiviert.
- macOS Catalina wird mit Electron 32.3.3 adressiert. Diese alte Laufzeit benötigt einen getrennten Legacy-Channel; ein moderner, gepflegter Channel fehlt.
- Test-Installer sind nicht regulär signiert oder notarisiert. Echte Catalina-Hardwaretests fehlen.
- App Store, signierte Pakete, SDK, zentrale Settings- und Window-Manager-Services, Backup und Native Edition sind noch nicht implementiert.

## Prioritäten und Abhängigkeiten
1. **P0:** CI-Tests, IPC-/Finder-Sicherheitstests, Sicherheits-Audit beheben, Modern/Legacy-Kompatibilität planen.
2. **P1:** App-Registrierung der Erweiterungen vollständig vereinheitlichen; App-Lifecycle und Window-Manager-API einführen.
3. **P2:** Finder-Dateioperationen und Papierkorb, Berechtigungen, versionierte lokale Benutzerdaten.
4. **P3:** Systemeinstellungen, Themes, Launchpad, Spotlight und Notification-Service.
5. **P4:** Isolierte App-Runtime, signiertes `.airapp`-Format, Berechtigungsmodell, SDK und echte Demo-App.
6. **P5:** Lokaler Air App Store mit Installation, Updates und Deinstallation.
7. **P6:** Weitere Apps, Backups, optionale Cloud, plattformübergreifende Tests und Releases.

Kein Komplettumbau ohne Regressionstests. Laufende PRs bleiben unabhängig.

## Lokale Prüfung
```sh
npm install
npm test
node --check src/core/app-registry.js
node --check app.js
npm run check:catalina
```
GitHub Actions führt die Tests aus. Ein grüner Build ersetzt keinen manuellen Funktionstest auf macOS 10.15.8.

## Lifecycle und Launchpad

`src/core/app-lifecycle.js` verfolgt Ereignisse bei Fokus, Minimieren, Maximieren und Schließen und ist per Listener beobachtbar. `air-launchpad.js` ist eine suchbare Kategorienansicht der tatsächlich gebündelten Apps. Starts gehen durch den vorhandenen Fenstermanager. Beide Module führen weder neue Systemberechtigungen ein noch installieren sie Drittanbieter-Code.

## Sichere benutzerspezifische Darstellungseinstellungen

`src/main/preferences.cjs` speichert Wallpaper-Auswahl, Akzent, Dock-Größe, Uhrformat und visuelle Schalter unter `userData/profiles/<SHA256(username)>/appearance-v1.json`. Validierte, atomare Schreibvorgänge finden ausschließlich im Electron-Hauptprozess statt; IPC erlaubt Lesen/Ändern/Zurücksetzen nur für authentifizierte lokale Seiten mit aktivem Air-OS-Benutzer. Unbekannte Felder und potenziell gefährliche Daten-URLs sind verboten. 

**Datenmigration:** Die früheren globalen `localStorage`-Einstellungen werden aus Datenschutzgründen nicht automatisch einem beliebigen angemeldeten Profil zugeordnet. Alte Profileinstellungen können manuell neu gewählt werden. Andere gespeicherte App-Daten (Notizen, Musikplaylists) müssen in einer Folgestufe separat pro Benutzer isoliert werden.

## Spotlight-artige App-Suche

`src/core/search-service.js` stellt deterministische, begrenzte Suchergebnisse aus der internen Registry bereit. `air-spotlight.js` ergänzt das Menü-Suchsymbol und eine per Ctrl/⌘+K erreichbare, tastaturbedienbare Suchoberfläche. Treffer öffnen bestehende, registrierte Apps. Datei-, Cloud- und externe Inhalte werden bewusst noch nicht indiziert; das wäre ohne Benutzerberechtigungen und Suchdienst ein Datenschutzrisiko.

## Modern- und Catalina-Kompatibilitätskanäle

Die Catalina Edition bleibt bei Electron 32.3.3. Der manuell auslösbare Modern-Workflow testet Electron 44.9.0 und macOS >=13.0 beziehungsweise Windows. Diese Kanäle werden als separate Test-Artefakte erzeugt. Vollständiger Audit und verbleibende Sicherheitsblocker stehen in `docs/SECURITY_AUDIT.md`. Weder Audit noch Code-Signing werden übersprungen.

## Air Notes – echte lokale CRUD-Verwaltung

`src/main/notes-store.cjs` speichert maximal 200 Notizen je angemeldetem Konto mit atomaren Schreibvorgängen, ID-Prüfung und Größenlimit. `air-notes.js` bietet Erstellen, Auswählen, Bearbeiten, explizites Speichern und bestätigtes Löschen. Die bisherige global gespeicherte Einzelnotiz wird nicht automatisch einem anderen Benutzer zugeordnet; Datenmigration muss bewusst und datenschutzkonform erfolgen. Noch kein Rich Text, Cloud Sync oder Autosave.

## Spotlight-Dateinamen-Suche (20. Oktober 2026)

`src/main/file-search.cjs` durchsucht ausschließlich die durch `ensureFileWorkspace()` und die authentifizierte `air-os:files:search`-IPC freigegebenen Dateinamen. Kein Dateiinhaltsindex, kein heimlicher systemweiter Host-Scan. Die Suche wird pro Eingabe gestartet, asynchron ausgeführt und ist auf 3.000 Einträge, 30 Treffer und fünf Verzeichnisebenen begrenzt. Symlink-Knoten werden übersprungen. `air-spotlight.js` verwirft veraltete Antworten und öffnet einen Treffer über `window.airFinder.revealFile` im selben Finder-Workspace. Automatisierte Tests: `tests/file-search.test.cjs`; vollständiger manueller GUI-Regressionstest steht aus.


## Air Erinnerungen (20. Oktober 2026)

`src/main/reminders-store.cjs` speichert bis zu 300 Aufgaben pro Air-OS-Benutzerprofil atomar und versioniert. Datenfelder: Titel, Beschreibung, ISO-Fälligkeitsdatum, Priorität, Erledigt-Status. Authentifizierte schmale IPC in `main.cjs`/`preload.cjs`; `air-reminders.js`/`.css` stellen eine eigene Dock-/Launchpad-App bereit. Die Node-Tests von `tests/reminders-store.test.cjs` sind erfolgreich. Noch keine Host-OS-Wecker, Hintergrundbenachrichtigungen, Cloud oder Sync.
