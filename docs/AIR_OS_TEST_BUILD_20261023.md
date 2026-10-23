# Air-OS Ultimate – Development-Testinstaller, 23. Oktober 2026

## Geprüfter Quellstand und Reparaturen

Gemeinsamer Build-Commit: `668f636e63a16f78fa5c5bae2e042ec65259d743`, Branch `build/air-ultimate-test-installers-20261023`, [Actions-Run 39990292082](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082), Build #99. Vorabversion `1.0.3-dev.99.sha668f636e63a1`. Kein stabiler Release, kein Merge, kein Force-Push.

Der Branch basiert auf PR-#12-Head `eb3f3bc`; dieser enthält den PR-#11-Entwicklungsstand `eecab2a` plus 13 spätere Checkpoints, darunter Dock, Island, Kontrollzentrum-Kachel, Spotify-Launcher, ChatGPT-Kandidatenprüfung, Finder-Fix, Runtime-/Absturz-Recovery, Notes-Save- und Preferences-Fixes sowie native Test-Gates. Der reine frühere Review-Dokumentationsbranch wird nicht als fehlende Produktfunktion behandelt. main bleibt `a1f3e12`.

PR #12 zeigte bei Prüfung weiterhin auf main. Die bestätigte Vorfahrbeziehung macht `feat/air-os-architecture-foundation` zur passenden Integrationsbase. `gh pr edit 12 --base ...` scheiterte an GraphQL Forbidden; Base nicht als geändert behauptet. Testbuild-Branch unabhängig davon angelegt, PRs/main nicht gemergt.

### Ursprünglicher Windows-Fehler

Benutzer-Originalausgabe aus [Run 39987254742 / Windows-Job 120529625679](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39987254742/job/120529625679): 134 Tests, 133 bestanden, ein Fehler beim verwaisten temporären Preferences-Symlink. Windows löste trotz wx nicht das erwartete EEXIST aus. Sicherheitsrelevanter Plattformunterschied, keine zu deaktivierende Testannahme. Commit `cdc97aa` prüft mit lstat die Directory-Entry vor Open und verweigert vorhandene Dateien/Links sowie nicht-ENOENT-Prüffehler; wx/0600, Deskriptor-Schreiben/Schließen und Cleanup nur nach eigener Reservierung bleiben erhalten. Originaltest unverändert, zwei zusätzliche Regressionen für explizite Windows-Semantik und Prüf-I/O-Fehler.

Dies beseitigt den getesteten bereits vorhandenen Link, ist aber kein vollständiger Schutz gegen bösartigen gleichzeitigen Austausch nach lstat/vor Open. Allgemeine Race-/Durability-Absicherung bleibt separat offen.

### Neuer Windows-Fehler in der Paketverifikation

Run 39989705165 / Commit `364cb28`: 143 Tests, 140 bestanden, drei Fehler im neuen Build-Prüfer. Vom Benutzer gelieferte Logs nennen für beide positiven Plattform-Fixtures und den Negativfall `src/core/app-lifecycle.js was not found in this archive`. Datei war in build.files enthalten. Ursache: @electron/asar traversiert mit nativen path.sep; der neue Prüfer übergab Slash-Pfade unter Windows. Das betrifft auch echte Archive, nicht nur Testfixtures.

Commit `668f636` verwendet path.normalize ausschließlich an der ASAR-Extraktionsgrenze, portable Namen bleiben für Vergleiche erhalten. Neuer Windows-Pfad-Vertragstest vor Fix rot/nach Fix grün; keine Sicherheitsprüfung entfernt. CLI schreibt echte Installergrößen/Dateihashes in die CI-Step-Summary; synthetische Unit-Fixtures tun das nie. macOS-Paketierung und zwei Uploads waren bereits in Run #98 erfolgreich, werden aber nicht mit Windows-Paketen eines anderen Commits gemischt.

## Tatsächliche Prüfungen

Lokal Linux x64/Node 24: **144 Tests bestanden, 0 Fehler/Skips**. Gezielte Preferences-/Pinning-Prüfung 15/15; acht Build-Verifikationstests mit echten temporären ASAR-Dateien, ausdrücklich synthetischen PE-/Mach-O-/Installer-Köpfen (keine lauffähigen Installer, nie hochgeladen). Negativfälle verweigern fehlende Features, Privat-/Profildaten, falsche Version/Commit, fehlende Installer und falsche CPU-Architektur.

YAML, geänderte CJS-Syntax, git diff --check und Catalina-Konfigurationsprüfung bestanden. package.json/Electron-Versionen und Security-Workflow im Repository unverändert. Der Testbuild ändert seine Version nur im CI-Workspace.

**Nativer gemeinsamer Run #99 ist erfolgreich abgeschlossen.** Öffentliche Actions-Liste meldet für Run 39990292082 `COMPLETED/SUCCESS`. Quellvalidierung auf Ubuntu sowie auf Windows und macOS jeweils Regressionstests, Versionsvorbereitung, Paketierung, Paket-/Architektur-/Hash-Verifikation und beide Uploads erfolgreich. Die exakten nativen Test-Output-Zählungen/Skips wurden mangels API-Logzugriff hier nicht erneut ausgelesen; ausgeführt wird die vollständige aktuelle 144-Test-Suite. Kein ARM64-Windows-/Intel-macOS-Hardwarestart aus einem grünen x64-/macOS-Runner-Test abgeleitet.

Der vom Benutzer später nachgereichte Log zu #98 bestätigt die drei ASAR-Fehler und den bereits korrigierten Pfadfehler; kein erneutes Entfernen/Umgehen dieser Assertions. Der ursprüngliche Windows-Dangling-Symlink-Test bleibt auch im erfolgreich ausgeführten nativen Lauf aktiv.

## Tatsächlich hochgeladene Downloads

Die folgenden vier Artefakte sind in Run #99 mit diesen IDs, Namen, Größen und GitHub-Digests vorhanden. Download mit geeignetem GitHub-Konto anmelden, Artefakt-ZIP entpacken und dann die enthaltene EXE/DMG bzw. macOS-App-ZIP verwenden. Keine alte #98-macOS-Datei mit diesem Build mischen.

| Ziel | Download | Anzeigegröße des Artefakts | Enthaltene Installationsdatei |
| --- | --- | --- | --- |
| Windows x64 EXE | [GitHub-Artefakt 12517013177](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082/artifacts/12517013177) | 75.1 MB | `Air-OS-1.0.3-dev.99.sha668f636e63a1-Windows-x64.exe` |
| Windows ARM64 EXE | [GitHub-Artefakt 12517627118](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082/artifacts/12517627118) | 72.7 MB | `Air-OS-1.0.3-dev.99.sha668f636e63a1-Windows-arm64.exe` |
| macOS Universal DMG | [GitHub-Artefakt 12516579305](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082/artifacts/12516579305) | 170 MB | `Air-OS-1.0.3-dev.99.sha668f636e63a1-mac-universal.dmg` |
| macOS Universal ZIP | [GitHub-Artefakt 12516798653](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082/artifacts/12516798653) | 170 MB | `Air-OS-1.0.3-dev.99.sha668f636e63a1-mac-universal.zip` |

Jedes Artefakt enthält zusätzlich `BUILD-INFO.json` mit tatsächlicher Dateigröße/Commit/Version und `SHA256SUMS.txt` mit dem **Installer-Dateihash**. Dieser wird auch vom CLI im zugehörigen Job-Summary ausgegeben. Hier nicht authentifiziert heruntergeladen; der Dateihash wird deshalb nicht geraten oder mit dem folgenden Container-Hash verwechselt.

### GitHub-Artefakt-ZIP-Digests (öffentliche Actions-Anzeige)

| Artefakt | SHA-256 des GitHub-Artefakt-ZIP |
| --- | --- |
| Windows x64 EXE | `83666ace4c4216153567294da8c292cdc00846b271e047553d4b19773784b135` |
| Windows ARM64 EXE | `42ede415dd767fbb27d026b17f648b6541d7ce33c1c667b392cab1575bba3dec` |
| macOS Universal DMG | `a246f101ac799c46f9365006489e40c5661c735def422214d5dfa26c8cf92caf` |
| macOS Universal ZIP | `13dfa886ee950a2ca6a6016f692b942db57296c839a3b6a8afe88cdc0d9761bc` |

Upload-Vorhandensein, IDs und gerundete Größen wurden auf der öffentlichen Run-Seite geprüft. Die vier grünen Upload-Schritte bestätigen die Übertragung; vorher war die tatsächliche Dateiformat-/ASAR-/CPU-/SHA-Prüfung erfolgreich. Eine direkte anonyme Probe des offiziellen Windows-x64-Downloadlinks wurde zur GitHub-Suite-Artefaktroute umgeleitet und endete ohne Anmeldung mit HTTP 404. Diese Umgebung kann wegen GitHub-API-Sperre keinen berechtigten angemeldeten Download selbst durchführen. Das ist ausdrücklich keine behauptete erfolgreiche lokale Installer-Download-/Installationserprobung. Bei Downloadproblemen zuerst GitHub-Anmeldung/Repo-Zugriff prüfen, dann die Artefaktsektion desselben Runs verwenden. Die Actions-Artefakte sind auf 14 Tage begrenzt, keine dauerhaften Release-Assets.

## Artefaktvertrag

Ein Lauf baut Windows x64/ARM64 und macOS Universal aus identischem Checkout. Vor Upload: tatsächliche App-ASARs auf wichtige Dateien und Commit/Version prüfen; private Schlüssel/Profildaten zurückweisen, öffentliche Demo-Verifikationsschlüssel syntaktisch prüfen; Windows-PE-Architekturen x64/ARM64 und macOS-Mach-O mit Intel-/Apple-Silicon-Slices prüfen; Installer-Formatkennungen, eindeutige Namen und Mindestgrößen prüfen. Anschließend je Ziel ein getrenntes GitHub-Artefakt mit Installer, `BUILD-INFO.json` und `SHA256SUMS.txt`. Letztere enthält den Hash der eigentlichen Installationsdatei; der GitHub-UI-Artefaktdigest betrifft dagegen den umschließenden Artefakt-ZIP-Download.

Uploads über workflow_dispatch oder den eng gefilterten Testbranch-Push, bei PRs kein Upload. Vier eindeutige Artefaktnamen mit vollständigem Git-SHA und Run-Attempt, Aufbewahrung 14 Tage. Download über GitHub Actions setzt passende GitHub-Anmeldung/Berechtigung voraus; kein öffentlicher stabiler Release-Link. Dokumentations-Pushes allein starten keinen weiteren Build.

## Bekannte Einschränkungen

- Isolierter frischer Dependency-Audit der unveränderten package.json: **Exit 1, zwei High (Electron und extract-zip), keine Critical/Moderate/Low**. Neue Lock-Auflösung nur in /tmp, kein Lockfile/Upgrade im Repository. Frühere andere Auflösungen/Audit-Zählungen sind kein Widerspruch und nicht rückwirkend als behoben zu behandeln.
- Electron 32.3.3 ist Legacy, kein regulärer sicherheitsfreigegebener Kanal. macOS-Minimum bleibt 10.15.0 konfiguriert; Catalina betrifft Intel. Apple Silicon kann nicht unter Catalina laufen; keine erfundene Catalina-ARM-Unterstützung. Echte Installations-/Start-/Hardwaretests auf Catalina/Intel/Apple Silicon/Windows x64/ARM64 stehen aus.
- Kein Developer-ID-/Authenticode-Signing und keine macOS-Notarisierung bestätigt. OS-Warnungen sind möglich. Keine automatischen Updates/kein verifiziertes Rollback.
- Offline-App-Store benötigt den bereits vorhandenen **öffentlichen Demo-Verifikationsschlüssel**. Keine privaten Demo-/Testschlüssel werden paketiert; der öffentliche Prüfschlüssel bleibt erhalten, um Host-Start und Signaturprüfungen nicht zu brechen. Das ist kein Produktions-Trust-Root. Ein vollständiger Ausschluss auch öffentlicher Demo-Schlüssel erfordert gesonderte Store-/Trust-Änderungen.
- ChatGPT-Komponente ist nur die Installationskandidatenprüfung, kein fertiger nativer Launcher/kein Login/kein Browser-Fallback. Dock-Pins sind noch keine vollständige Pin/Unpin-Oberfläche; Kontrollzentrum besitzt die tatsächlich angebundene Dock-Theme-Kachel. Cloud-Sync ist nicht verfügbar.
- CI-Paketierung/Datei-/Architekturprüfung ist keine vollständige Funktions-, GUI-, Performance-, Accessibility- oder Sicherheitsabnahme. Persönliche Daten/Privatschlüsselprüfung ist begrenzt und ersetzt keinen vollständigen Audit.

## Abschluss und sicherer nächster Schritt

Build-Commit bleibt `668f636e63a16f78fa5c5bae2e042ec65259d743`; dieser enthält `cdc97aa` (Windows-Symlink-Fix), `364cb28` (Testinstaller-Pipeline) und `668f636` (Windows-ASAR-Pfadfix). Nachfolgende Dokumentationscommits verändern diesen getesteten Paketstand nicht und starten wegen docs/**-Filter keinen neuen CI-Build. Die beiden Plattformen wurden aus demselben Commit gebaut; keine Stable-Veröffentlichung, kein Main-/PR-Merge, kein Force-Push.

Nächste kleine Einheit: genau einen dieser Installer auf echter Hardware installieren/starten und Profilpersistenz sowie Dock/Island/App-Start prüfen. Danach andere OS-/CPU-Kombination separat; PR-#12-Basis bei funktionierendem API-/UI-Zugriff korrigieren und die zwei neuen Fixes bewusst reviewen. Öffentliche Freigabe weiter gesperrt.
