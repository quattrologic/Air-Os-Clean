# Air-OS Ultimate – ausführbarer Development Handoff

**Branch:** `feat/air-os-architecture-foundation`  
**PR:** https://github.com/quattrologic/Air-Os-Clean/pull/11  
**Gegenbranch:** `main`  
**Tiny Strike:** PR #10 separat lassen.  
**Status:** Inkrementell implementierte Systemmodule, **kein fertiger App Store oder vollständiges OS**.

## Sofort ausführen

1. Fetch `feat/air-os-architecture-foundation` und vergleiche PR #11 mit `main`.
2. `npm install --no-audit --no-fund`, `npm test`, `node --check main.cjs`, `node --check app.js`, `node scripts/check-catalina.cjs` auf CI/Entwicklungsrechner.
3. GitHub Actions `Security checks` prüfen; `npm audit --audit-level=high` meldet weiterhin bekannte Legacy-Probleme. Ursache und Bewertung: `docs/SECURITY_AUDIT.md`.
4. Beim **neuesten** Commit den Build des Electron-Testinstallers prüfen. Nicht allein aufgrund grüner Syntaxprüfungen die GUI als getestet ausgeben.

## Neu geprüft: Deinstallationssicherheit

- `src/main/airapp-manager.cjs`: Deinstallation verwendet Quarantäne/Rollback; Crash-Recovery für unterbrochene Deinstallationen sowie parallele Install-/Uninstall-Aufrufe fehlen.
- `tests/airapp-installed.test.cjs`: neue Rollback- und Symlink-Tests nach dem letzten Commit über CI prüfen.
- Anschließend Profil-Isolation, App-Runtime-Pfadauflösung und sichere Wiederherstellung nach Stromausfall testen.

## Neuer Finder-Schritt

- Prüfe CI für `tests/file-ops.test.cjs` und echte UI-Interaktion „＋ Ordner“; die IPC-Authentifizierung nutzt `requireFileAccess`.
- Danach Rename/Copy mit strengem Verbot ungewollten Überschreibens, Unicode-/Case-Folding-Verhalten (macOS) und atomarem Rollback prüfen.

## Finder nach Duplizieren

- `src/main/file-ops.cjs` und `tests/file-ops.test.cjs` enthalten Ordnererstellung und Datei-Duplikation ohne Überschreiben. Als Nächstes sichere Umbenennung (vor allem auf case-insensitive macOS-Volumes), Move mit Rollback und native Papierkorb-Integration entwickeln.

## Rename-Einschränkung

- Derzeit nur **reguläre Dateien**. Ordner-Rename oder Cross-Volume-Move erfordern ein geeignetes No-Overwrite-/Rollback-Konzept; Linux-/macOS-Dateisystemvarianten prüfen. Der sichere Link/Unlink-Ablauf schützt gegen unbeabsichtigtes Überschreiben, aber nicht gegen Absturz zwischen Link und Unlink (dann liegen zwei Namen vor).

## Konkrete nächste Implementierung

**A – Sichere App-Runtime als eigene Electron-Sandbox:**
- `main.cjs`, `preload.cjs`, `src/core/app-registry.js` und Tiny Strike PR #10 als Vergleich lesen.
- Dokumentiertes Paketmanifest `.airapp` mit eindeutiger ID, SemVer, Dateiliste, Berechtigungsdeklaration, SHA256 pro Datei und überprüfbarer Signatur definieren.
- Für den lokalen Store **nur ausdrücklich vertrauenswürdige, signierte** Demo-Pakete akzeptieren; keine ungeprüften URLs, Pfad-Traversal oder beliebiges `require`.
- App-Inhalte nur in eigener `BrowserWindow` mit `nodeIntegration:false`, `contextIsolation:true`, `sandbox:true`, strenger CSP, verweigerter externer Navigation/Downloads und eigenem partitioniertem Speicher rendern.
- Signatur-/Hash-Prüfung, Ablehnung manipulierter Pakete, Installieren/Deinstallieren und Profiltrennung per Unit-/IPC-Test nachweisen, **bevor** ein App-Store-UI „Installiert“ meldet.
- Kleine Offline-Beispiel-App (z. B. Timer) hinzufügen, echte Installation und Start demonstrieren.

**B – Finder-Rechte und Dateiverwaltung:**
- `main.cjs` Finder-IPC-Routen, `resolveWorkspacePath()`, `normalizeFileRelative()`, `air-os-enhancements.js` ansehen.
- Sichere Create-Folder-, Rename- und Copy-Operationen samt Symlink-/Traversal-/Konflikttests implementieren.
- Löschvorgänge erst mit bestätigtem Papierkorb-/Wiederherstellungsmodell.

**C – Vollständige App-Registry-/Lifecycle-Integration:**
- `src/core/app-registry.js`, `src/core/app-lifecycle.js`, `air-os-enhancements.js`, `air-extra-apps.js` vereinheitlichen.
- Garantieren, dass App-Registrierungen nicht nur Metadaten, sondern deklarierte LifeCycle-Hooks haben; weiterhin keine Berechtigungsausweitung.
- Fenster-Cleanup und Registry-/Dock-Regression mit End-to-End-Tests absichern.

**D – Suche und Einstellungen erweitern:**
- `src/core/search-service.js`, `air-spotlight.js` um nur ausdrücklich freigegebene Datei-Namen und Air-Notes-Titel erweitern; Abbruch- und Datenschutzregeln.
- `src/main/preferences.cjs` mit Schema-Migrationen und separaten Theme-Profilen ausbauen.
- Derzeit globales `localStorage` in alten Apps identifizieren und datenschutzkonform migrieren.

## Bereits geänderter Code

- Desktop: `app.js`, `index.html`, `air-launchpad.js/css`, `air-spotlight.js/css`.
- Core: `src/core/app-registry.js`, `src/core/app-lifecycle.js`, `src/core/search-service.js`.
- Sicherer Datenzugriff: `src/main/preferences.cjs`, `src/main/notes-store.cjs`, `main.cjs`, `preload.cjs`, `air-notes.js`.
- Build: `package.json`, `.github/workflows/build-modern.yml`.
- Tests: `tests/app-registry.test.cjs`, `tests/app-lifecycle.test.cjs`, `tests/search-service.test.cjs`, `tests/preferences.test.cjs`, `tests/notes-store.test.cjs`, `tests/launchpad.test.cjs`.

## Vor Abgabe immer aktualisieren

- Letzte erfolgreiche getestete SHA eintragen.
- CI-Fehler nach Ursache unterscheiden.
- `docs/DEVELOPMENT_PROGRESS.md` samt offenen Blockern fortführen.
- Kleine Commits auf PR #11, keine automatische Freigabe oder Release.
- Bei technisch unvermeidbarer Unterbrechung konkreten Einstiegspunkt für nächste Sitzung dokumentieren.

Die Arbeitsumgebung arbeitet **nicht automatisch im Hintergrund weiter**, nachdem eine Sitzung endet. Jede Fortsetzung startet mit einer neuen Entwicklungsanfrage oder einer separaten genehmigten Agenten-Ausführung.
