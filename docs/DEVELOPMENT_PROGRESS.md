# Aktueller Checkpoint – Teil 2, 21. Oktober 2026

Dieser Abschnitt ist maßgeblich; frühere Checkpoints bleiben als Historie erhalten.

- Branch: `feat/air-os-architecture-foundation`, PR #11 offen/Draft. Ausgangs- und gesicherter Teil-1-Commit: `ea51c6f083bfb300355d731d2b4a9b37808abe77`. Lokaler Checkout vor Arbeit sauber, GitHub-HEAD unverändert.
- Diese Einheit: `Enforce Air App termination on logout and removal`; SHA über `git log -1 --format=%H -- src/main/airapp-runtime.cjs`. main und andere PRs unverändert; keine neuen Abhängigkeiten oder parallelen Entwickler gestartet.
- CI Teil 1: [Security 39650508176](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39650508176) bestätigt Syntax, Node-Tests und Private-File-Prüfung; Audit weiterhin fehlgeschlagen. [Desktop 39650508444](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39650508444) inzwischen **erfolgreich** für Windows/macOS. Der laufende Build war CI, keine parallele Quellcodebearbeitung. Früherer macOS-Abbruch damit nicht mehr der jüngste Buildstatus; Ursache des alten Abbruchs nicht bestimmt.

## Implementiert: nicht blockierbares Beenden isolierter Air-Apps

Vorhandenes `main.cjs` ruft Runtime.closeAll beim Abmelden/Hauptfenster-Schließen und Runtime.close vor Deinstallation auf. Bisher verwendeten beide BrowserWindow.close(), das eine App über beforeunload verhindern kann. closeAll verlor dabei sogar die Referenzen auf überlebende Fenster. Auch ein fehlgeschlagener Start konnte ein solches Fenster zurücklassen.

Die Runtime erzwingt an diesen drei Host-Cleanup-Stellen nun BrowserWindow.destroy(). Der closed-Handler bereinigt weiterhin die Fensterzuordnung. Normales Schließen über die Fensterleiste wird nicht verändert. Keine zweite Runtime oder neue IPC eingeführt.

Bewusster Lifecycle-Vertrag: Abmelden, Entfernen und fehlgeschlagener Start führen keine unload/beforeunload-Speicher-Hooks aus. Apps müssen Daten vor diesen Vorgängen dauerhaft sichern; diese Einheit bietet kein Autosave. Persistente Profildaten werden durch destroy() nicht gelöscht. API-Grundlage: https://www.electronjs.org/docs/latest/api/browser-window/#windestroy .

## Tests

Drei neue Node-Regressionstests mit einem Close-Veto im BrowserWindow-Double: gezieltes Beenden lässt anderes Profilfenster intakt, Logout beendet alle Fenster, fehlgeschlagener Start lässt keinen Renderer zurück. Wiederholtes Beenden und Neustart werden ebenfalls geprüft. Vor Fix 3 neue Tests fehlgeschlagen, nach Fix **68/68 gesamte Node-Tests bestanden**, keine übersprungen. Syntaxprüfungen beider JS-Dateien, Catalina-Konfiguration und git diff --check bestanden. TMPDIR wie in Teil 1 auf Workspace gesetzt.

Grenzen: Node-Doubles ersetzen keinen echten Electron-beforeunload-Test; Profilfenster-Auswahl ist geprüft, vollständige Session-/Storage-Isolation nicht. CI für den neuen Commit nach Sicherung separat prüfen. Audit unverändert aktiv; letzter ausgewerteter Befund 2 High/8 Moderate. Keine Release-Freigabe.

## Nächste drei kleine Einheiten

1. Persistente App-Partitionen nach Logout: getrennte Benutzer-Sessions und verbliebene Protokollzugriffe gezielt testen und nötigenfalls widerrufen.
2. Installationsabbruch zwischen Verzeichnis-Rename und Index-Schreiben reproduzieren und datenbewahrende Recovery absichern.
3. Echten Electron-GUI-Test für beforeunload-Veto, Abmelden und erneute Anmeldung auf Windows/macOS durchführen.

---

# Aktueller Checkpoint – Teil 1, 21. Oktober 2026

Dieser Abschnitt ersetzt ältere Statusangaben weiter unten; diese bleiben als Historie erhalten.

- Branch: `feat/air-os-architecture-foundation`; PR #11 offen, Draft, nicht gemergt.
- Letzter vor dieser Einheit auf GitHub gesicherter Commit: `d4fde6e3116ddec3359b792f79482878d2e3f4d1`.
- Diese Einheit: Commit `Fix Air App startup result after window closure`; exakten SHA mit `git log -1 --format=%H -- src/main/airapp-runtime.cjs` ermitteln. Alle 43 bisherigen Branch-Commits und 52 geänderten Dateien bleiben erhalten.
- `main` unverändert bei `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`.
- Frischer Checkout war sauber. Kein früherer Projekt-Checkout im verfügbaren Workspace; ungespeicherte Arbeit und aktive Ausführungen anderer Sitzungen sind nicht einsehbar. Prozessliste hier nicht verfügbar. GitHub meldete keine laufenden oder wartenden Actions; Branch-HEAD blieb während der Prüfung stabil. Keine parallele Bearbeitung gestartet.

## Genau eine Stabilisierungseinheit

Runtime meldete beim ersten Aufrufer Erfolg, wenn das Fenster während `loadURL()` geschlossen wurde. Nach dem Laden werden jetzt Fensterzustand und Zuordnung geprüft. Alle wartenden Aufrufer erhalten einen Fehler; erneuter Start bleibt möglich. Test-Double bildet Zerstörung nun korrekt ab. Drei Regressionstests decken `close`, `closeAll` und Ladefehler jeweils mit zwei Startanfragen und anschließendem Retry ab. Vor Korrektur: 2 neue Tests rot, nach Korrektur alle grün.

## Verifikation

- Lokal: **65/65 Node-Tests bestanden**, keine übersprungen; Syntax der geänderten Runtime und Tests, `check:catalina`, `git diff --check` bestanden. Wegen fehlendem `/tmp` wurde TMPDIR auf ein beschreibbares Workspace-Verzeichnis gesetzt; keine Testabschwächung.
- Ausgangs-HEAD, Security [39463594214](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463594214): 62/62 Tests, Syntax und Private-File-Check grün; Audit rot: **10 Befunde, 2 High / 8 Moderate**, insbesondere Electron/extract-zip. Audit unverändert aktiv, kein Force-Upgrade.
- Desktop [39463593983](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463593983): validate-source und Windows erfolgreich, macOS abgebrochen; Gesamtstatus failure. Letzter kompletter erfolgreicher Vorgänger-Build: [39463414802](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463414802).
- Neue Commit-CI nach Sicherung separat prüfen; lokale Node-Tests ersetzen keine Electron-GUI-/Installer-Tests.

## Geprüfter Bestand und Grenzen

Registry: validierte Registrierung, unveränderliche Snapshots, atomarer Austausch installierter Metadaten; kein Berechtigungsmechanismus. Runtime: profilbezogene Partitionen, Sandbox ohne Node/Preload, CSP, blockierte externe Zugriffe und erneute Hash-/Pfadprüfung je Anfrage. Store: Ed25519-signierter lokaler Demo-Katalog, temporäre Installation mit Index-Rollback, Deinstallations-Journal und Recovery. Vorhandene Tests prüfen Manipulation, Symlinks, fehlgeschlagene Operationen und Recovery. Kein vollständiger Sicherheitsnachweis oder öffentlicher Store.

Weitere vorhandene Funktionen: Lifecycle, Launchpad, Spotlight einschließlich berechtigter Dateinamensuche, Preferences, Notes, Reminders und sichere Finder-Grundoperationen. Nicht neu entwickelt.

Offene PRs: #10 Tiny Strike, #9 Air-Apps, #8/#1 AirWrite sowie #5/#3/#2 Actions-Updates. Feature-PRs überschneiden sich in app.js/index.html/package.json, #10 zusätzlich main.cjs/preload.cjs/README.md. Keine Übernahme oder Änderung dieser PRs; Runtime-Fix berührt diese Integrationsdateien nicht.

Offen bleiben Dependency-Audit/Legacy-Electron, reale GUI-/Profilwechseltests, macOS-Abbruchdiagnose, Code Signing/Notarisierung sowie weitergehende Installations-Crash-/Pfad-Race-Absicherung. Ältere Architektur-/Security-Abschnitte enthalten inzwischen überholte Aussagen zum Implementierungsstand.

## Nächste drei kleine Einheiten

1. macOS-Job-Abbruch am Ausgangs-HEAD anhand Annotations/Logs eingrenzen; gezielten Wiederholungslauf nur bei begründetem Infrastrukturfehler.
2. Profilwechsel/Abmelden: Partitionstrennung und verweigerte Zugriffe alter Sitzungen gezielt testen, nur nachgewiesenen Fehler beheben.
3. Installationsabbruch zwischen Verzeichnis-Rename und Index-Persistenz reproduzieren und datenbewahrende Recovery separat absichern.

---

**CI-Nachtrag zum Micro-Commit `f673d7c3a8c175ca9a9d2fee811d1f2c4d8c6499`:** [Security run 39463414865](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463414865) — JavaScript-Syntax **bestanden**, Node.js-Unit-Tests **bestanden**, Dependency-Audit **weiterhin fehlgeschlagen** (bekannter Legacy-Release-Blocker). [Desktop-Build 39463414802](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39463414802) zum Checkpoint noch nicht abgeschlossen. Manuelle GUI-Tests fehlen.

## Micro-Development – 20. Oktober 2026: doppelte Air-App-Fenster beim gleichzeitigen Start verhindern

**Ausgangs-HEAD:** `b1f91186b61cc3cfb6b48bea145c0b7a9b5fc001` (neuere Arbeit seit `a26c88933d` vollständig erhalten). Der letzte Build auf [CI 39371615066](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371615066) war erfolgreich; Syntax und Node-Tests auf [CI 39371615105](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371615105) bestanden. `npm audit` blieb rot (Legacy Electron/extract-zip).

**Genau eine Implementierung:** `src/main/airapp-runtime.cjs` verwendet ein In-Flight-Register pro Profil und App-ID, damit parallele Startanforderungen nicht mehrere BrowserWindows öffnen. Der `closed`-Handler entfernt nur sein eigenes Fenster aus der Map. `tests/airapp-runtime.test.cjs` enthält einen deterministischen Test mit verzögerter Fensterladung.

**Teststatus dieser Änderung:** CI `Security checks` und `Build Air-OS desktop installers` müssen am neuen Commit überprüft werden. Keine manuelle Catalina-/Windows-GUI-Prüfung. Sicherheitsadvisories bleiben Release-Blocker.

**Nächste drei Micro-Aufgaben:**
1. Separater Runtime-Test: Ladefehler und unmittelbarer erneuter Start räumen das In-Flight-Register zuverlässig auf.
2. Verifizieren, dass nach Abmelden keine alten App-Partitionen über ein zweites Benutzerprofil zugänglich sind; zielgerichteten Regressionstest hinzufügen.
3. `src/main/reminders-store.cjs` auf Fälligkeiten-Grenzfälle testen, ohne Benachrichtigungen vorzutäuschen.

**Fortsetzung:** Aktuelle Branch-SHA und CI-Status abfragen; dieser Checkpoint ist ausschließlich auf PR #11. `main` und Tiny Strike PR #10 bleiben unberührt.

# Air-OS Ultimate – dauerhafter Entwicklungsfortschritt

## Weiterentwicklung vom 20. Oktober 2026 – Air Erinnerungen und Finder-Datensicherheit

**Ausgangs-HEAD:** `a26c88933db91a098f14210e2384a2e566139984`, PR #11 weiterhin ein Entwurf. Tiny Strike PR #10 und `main` unangetastet.

- `795f50d7c67245b3cafb94325bf24f2bf474a885` und `739f4d1730c9f7988525e62e3cdcebf203ff8bbd`: sichere, begrenzte Finder-Dateinamensuche (maximal 3.000 Einträge, 30 Treffer, fünf Ebenen) samt authentifizierter IPC, Tests und Spotlight-Anzeige mit Finder-Navigation. Nur explizit freigegebene Ordner, keine Inhaltsindizierung.
- `524768a77e445171ad33b6b87cbbad68a42f0f37`: Neue Textdatei im Finder wird exklusiv erstellt; ein bestehendes Dokument wird bei Namenskonflikt niemals geleert. Regressionstest.
- `9a947dbce57f381730a4671f48f4a2174c1aa0dc`: profilbezogener, atomarer Reminders-Speicherdienst mit CRUD, Datum, Priorität, Erledigt-Status; Tests prüfen Profiltrennung, Validierung und Recovery bei Schreibfehler.
- `217a91ced9d70172aeaa4cece852c8af597415ec`: eigenständige App Air Erinnerungen mit Editor, Dock-Icon und Launchpad-Eintrag.
- `c0e6ac90e42c07cebd6784858baccb3c85e4b78a`: CI prüft Syntax der neu hinzugefügten UI- und Speichermodule.

**Letzte bestätigte Unit-/Syntaxprüfung:** `c0e6ac90e42c07cebd6784858baccb3c85e4b78a`, [CI 39371216725](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371216725): Syntax und alle Node-Tests erfolgreich. Gesamtrun weiterhin ROT wegen bekanntem npm audit (2 High / 8 Moderate).
**Zuletzt verifizierter Installer-Build einschließlich Reminders-GUI:** `c0e6ac90e42c07cebd6784858baccb3c85e4b78a`, [CI 39371216813](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39371216813), **Desktop-Build erfolgreich**. Das bestätigt Installer-Erzeugung, nicht macOS-Catalina-Hardware-Kompatibilität oder Code-Signing.
**Offen:** keine manuellen GUI-/macOS-Catalina-Hardwaretests, keine Reminders-Benachrichtigungsalarme oder Cloud-Sync, keine Code-Signierung/Notarisierung. Der Alt-Electron-Catalina-Kanal bleibt ein Sicherheits-Release-Blocker.

**Fortsetzung:** aktuelle Branch-SHA und letzte Runs prüfen, anschließend Air Erinnerungen mit Benutzer A/B, Fälligkeitsdaten, Markierungen und Löschen manuell testen; Finder-Dokumentkonflikt und Dateinamensuche testen. Danach Finder-Papierkorb-/Restore-Konzept oder sichere Benachrichtigungen als nächste kleine Entwicklungseinheit. Siehe `docs/NEXT_STEPS.md`.

## Checkpoint – 20. Oktober 2026 (Fortsetzung nach Commit a26c88933d)

**Aktueller Branch:** `feat/air-os-architecture-foundation` · [Entwurfs-PR #11](https://github.com/quattrologic/Air-Os-Clean/pull/11) · keine Änderung an `main` oder Tiny-Strike-PR #10.  
**Ausgangsrevision:** `a26c88933db91a098f14210e2384a2e566139984` (zu Sitzungsbeginn exakt HEAD).  
**Neue Implementierung:** `795f50d7c67245b3cafb94325bf24f2bf474a885` (Finder-Suche, gesicherte IPC und Tests), `739f4d1730c9f7988525e62e3cdcebf203ff8bbd` (Spotlight + Finder-Treffer).  
**Letzte Revision mit erfolgreich bestandener Syntax- und Node-Unit-Prüfung:** `739f4d1730c9f7988525e62e3cdcebf203ff8bbd` · [Security-Run 39370066571](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39370066571). Der Run ist rot **nur wegen npm audit**, nicht wegen Syntax oder Unit-Tests.  
**Letzter bestätigter erfolgreicher Desktop-Build vor der UI-Integration:** `795f50d7c67245b3cafb94325bf24f2bf474a885` · [Build-Run 39369922271](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39369922271); Installer-Build für `739f4d` zum Checkpoint noch laufend.  
**Hardwarestatus:** Kein vollständiger manueller End-to-End-Test auf macOS Catalina 10.15.8, Modern macOS oder Windows.

### Fertig implementiert in dieser Sitzung
- `src/main/file-search.cjs`: On-Demand-Suche **ausschließlich nach Dateinamen** innerhalb des vom Finder aktiv ausgewählten Arbeitsbereichs. Traversal außerhalb des kanonischen Workspace ausgeschlossen; Symlinks und versteckte Dateien werden übersprungen. Maximal 3.000 geprüfte Einträge, 30 Treffer, fünf Unterordnerebenen; keine Datei-Inhalte oder globale Host-Dateien indiziert.
- `main.cjs`: neue authentifizierte IPC `air-os:files:search` mit `requireFileAccess` und `ensureFileWorkspace`; `preload.cjs`: ausschließlich freigegebener `files.searchNames(query)`-Aufruf.
- `air-spotlight.js`: async Dateitreffer zusätzlich zu App- und eigenen Notiztiteln; 180 ms Debounce, Schutz vor veralteten Ergebnissen, fehlendes Zugriffsrecht führt nicht zum globalen Scan.
- `air-os-enhancements.js`: Datei- oder Ordnertreffer im Finder im erlaubten Workspace aufrufen.
- `tests/file-search.test.cjs`: Positiv-/Negativtests für Grenzen, Traversal, Symbolic Links, Ergebnisformat und inhaltsfreie Suche. Diese Tests sind in der genannten CI-Revision grün.
- `package.json`: `src/main/file-search.cjs` in der Installer-Dateiliste aufgenommen.

### Vorhandene Module – nicht doppelt entwickeln
App Registry und Lifecycle, Launchpad, Spotlight-App-/Notizsuche, profilbezogene Preferences und Air Notes, signierter Demo-Air-App-Store mit Runtime und Transaktions-Journal für Deinstallation, Finder Create/Duplicate/Rename und zugehörige Tests sind bereits auf diesem Branch vorhanden. Das ist **noch kein vollständiger öffentlicher App Store**, SDK oder produzierter Release.

### Offene Sicherheits-/Release-Blocker
- `npm audit`: **10 Pakete, 2 High und 8 Moderate**; Legacy Electron 32 und `extract-zip` High, weitere Toolchain-Transitivabhängigkeiten Moderate. Nicht mit `npm audit fix --force` die Catalina-Unterstützung zerstören. Siehe `docs/SECURITY_AUDIT.md`.
- Kein Code Signing / keine Notarisierung, keine umfassenden Electron-GUI-, Installer- und Catalina-Hardwaretests.
- Laufzeitsichere App-Installation, IPC-Routing und Fenster-Lifecycle benötigen weitere Tests; Multi-Session-Konflikte gesondert prüfen.

### Nächste konkreten Arbeitsschritte
1. Installer-CI für `739f4d` überprüfen und echte Spotlightsuche mit expliziter Ordnerauswahl im Desktop testen. Besonders Notiztreffer, neuer Finder, laufender Finder, geschlossene Suche und Benutzerwechsel.
2. Auf `src/main/file-search.cjs` aufbauend abbrechbare langlaufende Suchen und Dateigrößen-/Skalierungsgrenzen prüfen; keine automatische Indexierung einführen.
3. Finder-Papierkorb-/Wiederherstellungsmodell und sichere Copy-/Move-Operationen zuerst spezifizieren und testen, **kein** unbestätigtes dauerhaftes Löschen.
4. Modern-Channel und Catalina-Legacy getrennt evaluieren; moderne Audit- und Installer-Tests, keine falsche Sicherheitsfreigabe.
5. `docs/NEXT_STEPS.md` und diese Datei nach jeder Sitzung aktualisieren; Branch-SHA im Repo prüfen und ausschließlich Fast-Forward mit erwarteter vorheriger SHA committen.


**Stand:** 19. Oktober 2026  
**Entwicklungszweig:** `feat/air-os-architecture-foundation` · [PR #11](https://github.com/quattrologic/Air-Os-Clean/pull/11) (Entwurf)  
**Stabile Basis vor PR #11:** `main` @ `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`  
**Parallel:** [Tiny Strike PR #10](https://github.com/quattrologic/Air-Os-Clean/pull/10) auf `feat/tiny-strike-offline`; **nicht gemergt**.  
**Produkttyp:** Electron-App für Windows/macOS, nicht bootfähig; spätere iPadOS-Version ist ein separates Laufzeitprojekt.

## Verifizierte Änderungen in PR #11

| Modul | Stand | Wichtige Dateien |
| --- | --- | --- |
| Architektur-Audit und priorisierter Plan | Dokumentiert | `docs/ARCHITECTURE.md` |
| Interne App Registry | Implementiert, Node-Tests bestanden | `src/core/app-registry.js`, `tests/app-registry.test.cjs` |
| Arcade-Registrierung | Auf Registry umgestellt | `air-os-enhancements.js` |
| App Lifecycle | Zustandsverfolgung integriert und getestet; **kein vollständiger Window-Manager-Ersatz** | `src/core/app-lifecycle.js`, `app.js` |
| Launchpad | Suchbare Kategorien, Dock-Icon, Starten und Laufstatus; Installer noch nicht enthalten | `air-launchpad.js`, `air-launchpad.css` |
| Spotlight-Grundlage | App-Suche mit Ctrl/⌘+K, Tastatursteuerung; **keine Dateisystemindizierung** | `src/core/search-service.js`, `air-spotlight.js` |
| Systemeinstellungen | Validierte, atomare und benutzergetrennte Speicherung von Darstellungs-Einstellungen | `src/main/preferences.cjs`, `main.cjs`, `preload.cjs` |
| Air Notes | Mehrere Notizen pro Nutzer, Erstellen/Bearbeiten/Sichern/Löschen, authentifiziert | `src/main/notes-store.cjs`, `air-notes.js` |
| macOS Modern Channel | Manueller Test-Workflow für Electron 44.9.0/macOS 13+, **noch nicht manuell ausgeführt** | `.github/workflows/build-modern.yml`, `scripts/check-modern.cjs` |
| Sicherheits-Audit | Realer Befund dokumentiert; **Release-Blocker bleibt bestehen** | `docs/SECURITY_AUDIT.md` |

## Tests und Buildstatus

- Nach Commit `0b6819e592402592d2b406d16ebe034a4b3196cd` bestand die JavaScript-Syntaxprüfung und alle Node.js-Tests in CI: Security-Run [39294041757](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39294041757).
- Derselbe Run ist **rot** bei `npm audit --audit-level=high`, nicht bei Syntax oder Unit-Tests.
- Letzter **erfolgreich validierter Installer-Build vor Air Notes**: [39293747930](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39293747930) für Revision `fea1fca524c10824bb474b7b90c009c48ab067ca`. Neuerer Installerstatus separat prüfen.
- **Letzter Stand mit erfolgreichen Unit-Tests:** `0b6819e592402592d2b406d16ebe034a4b3196cd`. Manuelle vollständige UI- und Catalina-Tests fehlen; nicht als produktionsreif kennzeichnen.

## Sicherheitsbefunde und technische Schulden

1. Legacy Electron 32.3.3 (Catalina) und Download-/Builder-Abhängigkeiten: Audit meldet **10 betroffene Abhängigkeiten, darunter 2 High**. Vollständiger Befund in `docs/SECURITY_AUDIT.md`. `npm audit fix --force` darf nicht unkontrolliert auf Legacy angewendet werden.
2. Electron 44 erfordert mindestens macOS 13. Der Modern-Workflow installiert Electron 44 nur temporär; eine eigenständige signierte Release-Kette fehlt.
3. Bestehender Finder muss für alle Schreib-, Kopier- und Löschoperationen gegen Pfad-Traversal, Symlinks und Verlust getestet werden.
4. Air Music-Playlistnamen, ältere Notizen und andere historische UI-Storage-Schlüssel liegen teilweise im gemeinsamen localStorage. Nur **neu gespeicherte** Preferences/Notizen sind derzeit getrennt.
5. Benutzerwechsel/Abmelden und Window-Lifecycle benötigen End-to-End-Tests, inklusive Cleanup.
6. Neue Systemapps wurden nur durch Node-Tests und CI-Build geprüft, nicht durch manuelle Interaktion auf Windows/macOS.
7. Keine Code-Signing-Zertifikate, keine Notarisierung; GitHub-Artefakte sind **Test-Builds**, keine freigegebenen Releases.

## Noch fehlende oder partielle Module

- Vollständiger Window Manager, Mission Control und virtuelle Arbeitsflächen.
- Finder-Operationen (Kopieren, Verschieben, Umbenennen, Papierkorb) und Dateivorschau.
- Air App Store derzeit nur als **lokaler, signierter Demo-Katalog** mit installierbarer isolierter Demo-App; vollständige öffentliche Paketverwaltung, SDK, Update- und Berechtigungsmodell fehlen.
- Kontrollzentrum und Benachrichtigungszentrale.
- Umfangreiche Systemeinstellungen jenseits der vorhandenen Darstellungsoptionen.
- Suchanbieter für freigegebene Dateien und Notizen.
- Mail/Kalender/Kontakte/Foto-/Video-/TextEdit-Funktionen in produktiver Tiefe.
- Updates, Backup/Restore, Cloud und iPadOS-Konzept.

## Entwicklungsvorgaben

- `main` nicht automatisch überschreiben, PR #10 nicht ungeprüft integrieren.
- Keine externen Apps im privilegierten Electron-Prozess.
- Neue Funktion ohne echten Ablauf und Tests nicht als fertig melden.
- Catalina- und Modern-Runtime strikt unterscheiden.
- Security-Checks niemals stillschweigend deaktivieren oder Tests künstlich grün schalten.
- Für neue Module Node-Tests und wo möglich echte UI-Tests.
- Weiterarbeit anhand `docs/NEXT_STEPS.md`.

**Fortsetzung:** Neuer Agent öffnet diese Datei, `docs/NEXT_STEPS.md`, `docs/SECURITY_AUDIT.md`, PR #11 und die letzten CI-Runs, setzt direkt den ersten offenen Implementierungsschritt fort.

## Iteration: sicherer App-Store-Deinstallationsablauf (19.10.2026)

- **Implementierung:** `src/main/airapp-manager.cjs` verschiebt installierte App-Verzeichnisse zunächst in ein Quarantäneverzeichnis, aktualisiert den Installationsindex und löscht erst danach. Bei fehlgeschlagenem Index-Speichern erfolgt ein Rollback. Symbolische Links am Ziel werden vor der Operation abgewiesen.
- **Tests:** `tests/airapp-installed.test.cjs` prüft einen simulierten Speicherausfall mit Rollback und verweigert Symlink-Deinstallation. Node-CI-Ergebnisse der zugehörigen Revision prüfen.
- **Grenze:** Ein Prozessabbruch zwischen Quarantäne und Index-Schreibvorgang erfordert weiterhin Wiederherstellung; der nächste Schritt ist transaktionale Crash-Recovery. Ein unvollständiger endgültiger Löschvorgang wird als Fehler gemeldet.

## Sichere Finder-Erweiterung – Ordner erstellen (19.10.2026)

- `src/main/file-ops.cjs` validiert lokale relative Pfade, unterbindet Traversal und Symlink-Eltern und erstellt exakt einen Unterordner innerhalb des ausgewählten Arbeitsbereichs.
- Neue authentifizierte IPC `air-os:files:create-folder` und Finder-Schaltfläche „＋ Ordner“.
- `tests/file-ops.test.cjs` deckt reguläre Erstellung, Namenskonflikt und Symlink-Angriffe ab.
- Keine Lösch- und Move-Operationen ohne Wiederherstellungs-/Konfliktstrategie implementiert.

## Finder-Dateien duplizieren
- `src/main/file-ops.cjs`: neue `duplicateFile`-Operation mit Begrenzung auf den gewählten Arbeitsordner, Symlink-Verbot und atomarem `COPYFILE_EXCL`-Konfliktschutz.
- `preload.cjs`/Electron-IPC authentifizieren die Aktion; Finder-Zeilen bieten „Duplizieren“ direkt an.
- Tests für Datenintegrität, Namenskonflikte, Traversal und Symlinks.

## Datei sicher umbenennen

- Datei-Rename innerhalb freigegebener Arbeitsordner implementiert: `fs.linkSync` erstellt exklusiv neuen Namen, `unlinkSync` entfernt erst danach die alte Verknüpfung. Ein vorhandener Zielname wird nicht überschrieben. Nur reguläre Dateien, keine Ordner.
- Finder-Zeilen bieten „Umbenennen“; neue authentifizierte IPC und Unit-Tests. Auf Dateisystemen ohne Hardlink-Unterstützung schlägt die Aktion sicher fehl.

## Spotlight: eigene Notiztitel durchsuchen

- Spotlight fragt bei mindestens zwei Suchzeichen über die bereits authentifizierte `window.airOS.notes.list()`-API ausschließlich **Notizen des angemeldeten Profils** ab und sucht in Titeln (nicht im vertraulichen Inhalt).
- Anfragen werden durch Zähler bei neuer Suche/Schließen entwertet; App-Suche bleibt bei Fehlern nutzbar.
- Ein Treffer öffnet Air Notes mit der passenden Notiz-ID; `air-notes.js` kann diesen Fokus bei bereits offenem oder neu geöffnetem Fenster übernehmen.
- Unit-Tests prüfen Titelsuche, Nichtdurchsuchen des Bodys, Grenzen und unveränderliche Suchresultate.
