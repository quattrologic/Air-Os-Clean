# Air-OS Ultimate – dauerhafter Entwicklungsfortschritt

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
