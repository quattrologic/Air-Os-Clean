# Air-OS Ultimate – dauerhafter Entwicklungsfortschritt

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
- Air App Store mit **wirklich signierten** und sicher installierbaren `.airapp`-Paketen, SDK und App-Runtime.
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
