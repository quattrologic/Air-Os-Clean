# Aktuelle Übergabe – Teil 1 abgeschlossen, 21. Oktober 2026

Maßgeblich ist der aktuelle Checkpoint in DEVELOPMENT_PROGRESS.md; ältere Abschnitte unten sind Historie.

Branch `feat/air-os-architecture-foundation`, PR #11 bleibt Draft. Gesicherte Ausgangsbasis `d4fde6e3116ddec3359b792f79482878d2e3f4d1`; diese Einheit trägt die Commit-Nachricht `Fix Air App startup result after window closure`. Lokal 65/65 Tests bestanden. Audit weiterhin rot, macOS am Ausgangs-HEAD abgebrochen. Keine Freigabe für main oder Release.

Vor Teil 2 aktuellen GitHub-HEAD, neue CI und aktive Arbeit prüfen. Keine Wiederholung bereits implementierter Registry-/Runtime-/Store-Funktionen. Pro Sitzung eine kleine, getestete und gesicherte Änderung.

Nächste drei Einheiten:
1. macOS-CI-Abbruch diagnostizieren; Infrastrukturproblem von Quellcodefehler unterscheiden.
2. Profilwechsel und Logout-Isolation der Runtime gezielt testen.
3. Installations-Crash zwischen Rename und Index-Schreiben reproduzieren, datenbewahrende Recovery ergänzen.

Der Startup-Abbruch ist korrigiert und für Schließen, closeAll und Ladefehler einschließlich Retry getestet. Keine Sicherheitsprüfung deaktiviert. Detaillierte Nachweise, Parallel-PRs und Einschränkungen stehen in DEVELOPMENT_PROGRESS.md.

---

**CI-Nachtrag zum Micro-Commit `f673d7c3a8c175ca9a9d2fee811d1f2c4d8c6499`:** [Security run 39463414865](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463414865) — JavaScript-Syntax **bestanden**, Node.js-Unit-Tests **bestanden**, Dependency-Audit **weiterhin fehlgeschlagen** (bekannter Legacy-Release-Blocker). [Desktop-Build 39463414802](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463414802) zum Checkpoint noch nicht abgeschlossen. Manuelle GUI-Tests fehlen.

# Unmittelbare nächste Schritte – Micro-Development Handoff

**Aktuelle Einheit:** Parallelstarts derselben signierten Air-App auf ein Fenster begrenzen. Relevanter Code: `src/main/airapp-runtime.cjs`; Regressionstest: `tests/airapp-runtime.test.cjs`.

**Vorheriger bestätigter Commit:** `b1f91186b61cc3cfb6b48bea145c0b7a9b5fc001`; [Build 39371615066](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371615066) grün, [Security 39371615105](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371615105) nur wegen `npm audit` rot (Unit-/Syntaxchecks grün). Neuer Commit und CI müssen nach Push geprüft werden.

**Drei kleine Folgeaufgaben:**
1. Erfolgs-/Fehlerpfad für konkurrierendes `open()` inklusive LoadURL-Rejection testen; erneuter Aufruf darf nicht blockieren.
2. Isolation von App-Partitionen über abgemeldete Benutzer hinweg mit Node-Regressionstest absichern.
3. Reminders-Datum-/Persistenz-Randfälle ergänzen; keine ungesicherten Alarm-Features.

**Dauerhafte Blocker:** Legacy Electron 32.3.3 und `extract-zip` High, acht Moderate-Transitivpakete; fehlendes Code Signing/Notarisierung; keine E2E-Catalina-GUI-Tests. Sicherheitsworkflow nicht abschalten.

**Arbeitsregel:** Nur einen Micro-Schritt pro Sitzung; PR #11 bleibt Entwurf; Commit auf `feat/air-os-architecture-foundation` ausschließlich mit `expected_sha`; Branch vor Änderungen erneut lesen. `main` und Tiny Strike PR #10 nicht überschreiben.

---

# Air-OS Ultimate – Development Handoff

## WICHTIG: neuester Arbeitsstand (20. Oktober 2026)

Vorhandene Funktionen nicht noch einmal programmieren: Finder-Dateinamensuche, Spotlight-Dateitreffer, exklusive Textdateierstellung, profilbezogener Reminders-Store und Air-Erinnerungen-GUI sind bereits im PR #11.

**Zuletzt bestätigte Syntax- und Unit-Tests:** Commit `c0e6ac90e42c07cebd6784858baccb3c85e4b78a`, [CI 39371216725](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371216725) (Tests bestanden, npm audit rot).
**Vorhandene neue Implementierungen:** `src/main/file-search.cjs`, `tests/file-search.test.cjs`, `air-spotlight.js`, `air-os-enhancements.js`, `src/main/file-ops.cjs`, `src/main/reminders-store.cjs`, `tests/reminders-store.test.cjs`, `air-reminders.js`, `air-reminders.css`, `main.cjs`, `preload.cjs`, `app.js`, `index.html`, `package.json`.
**Installer:** `c0e6ac90e42c07cebd6784858baccb3c85e4b78a` erfolgreich gebaut, [CI 39371216813](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371216813). **Noch offene Tests:** neue GUI auf Windows und echter macOS-Catalina-10.15.8-Hardware testen; profilübergreifende Datenisolation und Abmelden prüfen.
**Nächster Entwicklungsschritt:** sichere Finder-Papierkorb-/Restore-Architektur oder Reminder-Benachrichtigungen mit echten Auslösebedingungen. Keine fiktiven Benachrichtigungen, keine destruktiven Dateioperationen ohne bestätigte Wiederherstellung. Danach Architekturservices und weitere Standardapps.
**Sicherheitsblocker:** 10 npm-Advisory-Pakete, darunter Legacy Electron und extract-zip (High), bleiben rot. Kein automatisches force-Upgrade, kein Umgehen der Sicherheitsprüfung.
**Git-Regel:** nur mit `expected_sha` auf `feat/air-os-architecture-foundation` schreiben, PR #10 und main nicht ändern.

**Stand:** 20. Oktober 2026  
**Branch:** `feat/air-os-architecture-foundation` · [PR #11](https://github.com/quattrologic/Air-Os-Clean/pull/11) (Entwurf)  
**Ausgangs-HEAD dieser Sitzung:** `a26c88933db91a098f14210e2384a2e566139984`  
**Zuletzt erfolgreich getesteter Funktionscommit:** `739f4d1730c9f7988525e62e3cdcebf203ff8bbd` (Syntax + Node-Tests grün, Dependency-Audit rot)  
**CI:** [39370066571](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39370066571) (Syntax/Tests grün, Audit fehlgeschlagen); [39370066549](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39370066549) (Installerstatus erneut prüfen).  
**Parallel:** [Tiny Strike PR #10](https://github.com/quattrologic/Air-Os-Clean/pull/10) bleibt unangetastet. `main` nicht ohne Freigabe ändern.

## Vor jeder weiteren Änderung
1. GitHub-PR #11 und aktuellen Branch-HEAD abfragen; prüfen, ob andere Entwicklungs- oder GitHub-Actions-Jobs laufen. Kein gleichzeitiges Überschreiben. Bei neuerem Branch-HEAD dieses Dokument gegen neue Commits abgleichen.
2. `docs/DEVELOPMENT_PROGRESS.md`, `docs/SECURITY_AUDIT.md`, `docs/ARCHITECTURE.md` lesen.
3. `npm install --no-audit --no-fund`, `npm test`, `node --check main.cjs`, `node --check app.js`, `node --check air-spotlight.js`, `npm run check:catalina`. Frühere Tests wurden in GitHub Actions durchgeführt, nicht auf echtem Catalina-Mac.
4. Aktuellen Actions-Buildstatus und die Audit-Stufe getrennt dokumentieren.

## Bereits real implementiert – nicht neu programmieren
- App Registry + Lifecycle: `src/core/app-registry.js`, `src/core/app-lifecycle.js`, `app.js`.
- Launchpad: `air-launchpad.js/css`, Spotlight für Apps + Notiztitel: `src/core/search-service.js`, `air-spotlight.js`.
- Benutzerspezifische Einstellungen/Notizen: `src/main/preferences.cjs`, `src/main/notes-store.cjs`, `air-notes.js`; Auth-IPC in `main.cjs`/`preload.cjs`.
- Signierte lokale Demo-Air-App und BrowserWindow-Sandbox: `src/main/airapp-package.cjs`, `src/main/airapp-manager.cjs`, `src/main/airapp-runtime.cjs`, `store/catalog/`, `store/keys/`, `air-app-store.js`. Die Manager-Deinstallation besitzt Journal-Recovery.
- Finder: Ordner anlegen, Datei duplizieren, Datei exklusiv umbenennen: `src/main/file-ops.cjs`; Frontend `air-os-enhancements.js`.
- **Neu:** Berechtigte, begrenzte Dateinamen-Suche `src/main/file-search.cjs` + `tests/file-search.test.cjs`, `air-os:files:search`, `files.searchNames`; Spotlight-Suchtreffer werden im Finder angezeigt.
- Catalina-Legacy Electron 32.3.3; experimenteller Modern-Workflow Electron 44.9.0 separat in `.github/workflows/build-modern.yml`.

## Nächster sinnvoller Implementierungsschritt
**A. Spotlight/Finder-End-to-End absichern:**
- `src/main/file-search.cjs`: Ordner-Enumeration unter Last, Symlink-Races, Anfragegrenzen prüfen.
- `air-spotlight.js` und `air-os-enhancements.js`: Titel suchen, Datei-Treffer auswählen, nur gewählten Ordner navigieren, Suchfenster schließen und altes Ergebnis ignorieren. Wenn eine DOM-Testumgebung ausgewählt wird, Lizenz und Catalyst-Kompatibilität prüfen.
- Sicherstellen, dass nach Abmelden `fileWorkspaceRoot` gelöscht und neue Suche verweigert wird.

**B. Finder Operationen:**
- `src/main/file-ops.cjs`, `main.cjs`, `preload.cjs` mit sicheren Kopier-/Verschiebe-Tests erweitern. Keine Zielfiles überschreiben; Symlinks ablehnen.
- Vor Löschen zuerst native Trash-API mit Wiederherstellungsstrategie und ausdrücklicher Bestätigung designen.

**C. Security Audit und Kanäle:**
- `docs/SECURITY_AUDIT.md`: Legacy-Audit verweist auf Elektron 32 und `extract-zip`, die beide **High** sind. 8 Toolchain-Transitivwarnungen `Moderate`. Rot bleibt ein Release-Blocker.
- Teste gepatchte Build-Toolchains und moderne Electron-Version getrennt; Catalina-10.15-Installer nicht auf Elektron 44 upgraden.
- Prüfe Code Signing, Notarisierung und Software-Lizenzhinweise; keine öffentliche Release-Aussage ohne Nachweis.

**D. Danach:** Einheitliche Fensterverwaltung/Mission Control, tiefere Systemeinstellungen und Themes, sichere App-Pakete und SDK, weitere Standard-Apps und Backups.

## Ende einer Sitzung
Den neuesten *wirklich erfolgreich getesteten* SHA eintragen; neue Commits und CI-Links in `docs/DEVELOPMENT_PROGRESS.md` ergänzen. `NEXT_STEPS.md` ggf. anpassen und per Branch-Lease (`expected_sha`) pushen. PR #11 als Entwurf behalten. Bei unbekanntem Ergebnis Status **offen** lassen statt „fertig“ behaupten. Kein selbstständiges Hintergrundarbeiten nach Ende der Sitzung.
