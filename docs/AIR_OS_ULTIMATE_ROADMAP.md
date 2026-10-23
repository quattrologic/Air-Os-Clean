# Air-OS Ultimate – verifizierter Bestand und priorisierte Roadmap

Stand: **23. Oktober 2026**, fortgeschrieben um Dock-, Island-, Kontrollzentrum- und Notes-Mitteilungs-Checkpoints. Abschnitt 1 dokumentiert die ursprüngliche Bestandsaufnahme; spätere Änderungen und ihre Nachweise stehen in den benannten Checkpoints und den neuesten Übergabedokumenten.

## 1. Ausgangspunkt und belastbare Nachweise

| Quelle | Tatsächlich geprüfter Stand |
| --- | --- |
| GitHub `main` / Repository-HEAD | `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e` |
| Entwicklungsbranch `feat/air-os-architecture-foundation` und PR #11 | `eecab2a043fc62ab0802312aa09ce29dfd96c280`; entspricht dem Nutzer-Handoff, keine neueren Commits auf diesen abgefragten Refs |
| PR-Status | GitHub-Webseite meldet **DRAFT**; PR #11 bleibt unangetastet |
| Dokumentationsbranch | `docs/air-os-ultimate-roadmap-20261022`, unmittelbar von diesem PR-HEAD abgezweigt; `main` ist dessen Vorfahr |
| Bloom | `8b3d5dcdcbadc1490c2824ccec01e818b7a0233c`, Version 3.10.0; öffentliche Quellen separat unter `/tmp` untersucht |
| Lokale Prüfungen dieser Sitzung | Linux x64, Node.js 24.19.0; `TMPDIR=/workspace/scratch npm test`: **96 bestanden, 0 fehlgeschlagen, 0 übersprungen** |
| Weitere ausgeführte Prüfungen | `node --check` für Main/Preload, alle JS-Dateien im Projektwurzelverzeichnis, `src/core/*.js`, `src/main/*.cjs`, `scripts/*.cjs`; `npm run check:catalina`: bestanden |
| Aktuelle CI | GitHub-REST-/GraphQL-Abfragen liefern `Forbidden`; kein aktueller grüner Gesamtstatus nachgewiesen. Die öffentliche PR-Seite erlaubt die Statusprüfung des PR, ersetzt aber keinen vollständigen CI-Nachweis. |

Gelesen: `AGENTS.md`, die Fortschritts-/Übergabedokumente mit ihren neuesten Checkpoints, `docs/ARCHITECTURE.md`, `ROADMAP.md`, `package.json`, Security-Dokumentation und relevante Implementierungen/Tests. Ältere Abschnitte sind historische Planungen: `ROADMAP.md` beschreibt Spotify noch als Web-Weiterleitung, und frühe Architekturabschnitte nennen inzwischen implementierte Dienste als fehlend. Maßgeblich sind hier der oben genannte Quellstand und die tatsächlich ausgeführten Prüfungen.

**Nachweisgrenze:** Die 96 Tests prüfen Node-Module und teils Produktions-Renderer in VM-/DOM-Adaptern bzw. simulierte Electron-/OS-APIs. In dieser Dokumentationseinheit wurden keine neuen GUI-, Windows-, macOS-, Installer-, Audit- oder Performance-Tests durchgeführt. Frühere GUI-Checks des `main`-Checkouts sind kein Nachweis für den erweiterten PR-Stand. „Vorhanden“ bedeutet deshalb unten eine konkret identifizierte Implementierung, keine plattformübergreifende Release-Freigabe.

## 2. Produktgrenze und Architekturentscheidung

Air-OS bleibt eine **Electron-Desktop-Anwendung innerhalb von Windows und macOS**. Dock, Island, Kontrollzentrum und interne Fenster gehören zunächst zum Air-OS-Desktop. Keine Ersetzung der Host-Taskleiste, keine globalen Eingabe-Hooks, kein Kernel/Bootloader und keine Linux-Distribution.

Vorhandene Registry, Lifecycle, profilbezogene Stores, Preload und App-Runtime werden erweitert. Kein paralleles App-Verzeichnis, zweiter Fenstermanager oder Framework-/Tauri-Umbau. Drei Fenstertypen müssen getrennt behandelt werden:

1. Mitgelieferte Apps: interne DOM-Fenster in `app.js` mit bestehendem Lifecycle.
2. Installierte Air-Apps: eigene isolierte Electron-`BrowserWindow`s über `airapp-runtime.cjs`.
3. Externe Apps wie Spotify: Startanforderung an das Host-OS; daraus folgt weder ein kontrollierbares Fenster noch ein bekannter Prozessstatus.

Die spätere native iPadOS-App benötigt eine eigene Laufzeit. Gemeinsame Datenmodelle, Validierungen und Zustandsverträge sind geeignete gemeinsame Komponenten; Electron-/Node-/Desktop-IPC und native OS-Steuerung sind nicht direkt übertragbar.

## 3. Was bereits implementiert und prüfbar ist

| Bereich | Konkreter Bestand | Grenze / noch erforderlicher Nachweis |
| --- | --- | --- |
| Lokale Konten | `main.cjs`, `preload.cjs`: scrypt/Salt, lokale Anmeldung, vertrauenswürdige Absender, begrenzte IPC; Renderer ohne Node, mit Isolation/Sandbox | Kein Cloud-Konto oder OS-Login; lokale Administratoren bleiben außerhalb des Schutzmodells. Kein vollständiger Auth-Sicherheitsaudit dieser Sitzung. |
| App Registry | `src/core/app-registry.js`: gemeinsame Metadaten, validierte Einträge, installierte Apps mit `origin: store`, Änderungsbeobachter; Unit-Tests | Metadaten verleihen keine Berechtigungen. Bestehende Erweiterungen/Legacy-Metadaten nicht als vollständig entkoppelte Architektur ausgeben. |
| Lifecycle / Fenster | `src/core/app-lifecycle.js`, `app.js`: Fokus, Minimieren, Maximieren, Schließen; interne Fenster verschieben/vergrößern; Tests für Zustandsbeobachtung | Kein vereinheitlichter Window-Service für alle drei Fenstertypen, keine Mission-Control-/Workspace-Verwaltung. Visuelle/funktionale Plattformregression fehlt. |
| Air Modern Dock | `air-modern-dock.css`, `app.js`, Preferences: opt-in Theme, Classic als Standard, persistentes Theme pro Profil, bestehende Start-/Lifecycle-Routen | Kein neu zu entwickelndes Grund-Dock. Dynamisches Pinning/Reihenfolge und echte visuelle Prüfung fehlen; Spotify hat keinen erfundenen Laufstatus. |
| Launchpad | `air-launchpad.js/.css`: registrierte Apps, Suche/Kategorien, bestehende Startwege, installierte Air-Apps; Paket-/Routingtests | Kein eigenständiger Installer; Screenreader, Fokus und Darstellung real prüfen. |
| Spotlight | `src/core/search-service.js`, `air-spotlight.js`: Apps, bereitgestellte Notiztitel, Dateinamen; veraltete Antworten werden verworfen | Kein Volltext-/Cloud-/systemweiter Index. GUI-Auswahl, Fokus und Abmeldung real prüfen. |
| Finder | `main.cjs`, `src/main/file-ops.cjs`, `file-search.cjs`, Enhancements: gewählter Workspace, Verzeichnisliste, Text lesen/speichern/erstellen, Ordneranlage, exklusive Kopie/Umbenennung, begrenzte Dateinamensuche | Kein vollständiger Dateimanager. Kein sicherer Papierkorb/Restore, allgemeines Verschieben, umfangreiche Vorschauen oder robuster Operationsfortschritt. Symlink-/Race-Grenzen nicht als abschließend gelöst deklarieren. |
| Einstellungen | `src/main/preferences.cjs`: atomare, validierte profilbezogene Darstellung, Dock-Theme, Reset; Persistenz-/Isolationstests | Kein umfassendes Host-Einstellungszentrum. Alte globale Daten werden nicht willkürlich einem Profil zugeordnet. |
| Notizen / Erinnerungen | Eigene Main-Stores und Oberflächen; profilbezogene CRUD/Persistenz, Größen-/ID-Prüfungen; Reminder-Priorität/Fälligkeit/Erledigt | Kein Notes-Rich-Text/Cloud/Autosave; keine zuverlässig terminierten Host-Benachrichtigungen oder Hintergrundalarme. |
| Air-App-Pakete | `airapp-package.cjs`, `airapp-manager.cjs`: Ed25519, SHA256, fester lokaler Katalog, Profilinstallation, Journal-Deinstallation, verifizierter Retry nach Rename/Index-Abbruch, Schutz fremder Staging-Pfade; Tests | Demo-Trust-Root, kein Produktions-SDK/öffentlicher Paketkanal/Update-/Widerrufssystem. Power-Loss und konkurrierender Pfadaustausch gesondert prüfen. |
| App Runtime | `airapp-runtime.cjs`: eigenes Schema, App-/Profilpartition, CSP, blockierte Rechte/Netzwerke/Popups, Hashprüfung, parallele Starts koordiniert, Host-Cleanup und Protokollwiderruf nach Schließen | Isolierte Air-Apps sind zusätzliche native Fenster. Tests simulieren Electron; echte Chromium-Storage-/Logout-/Navigationstests stehen aus. |
| Air App Store | `air-app-store.js`, `air-app-bootstrap.js`, `store/catalog`: signierten Demo-Timer installieren/öffnen/entfernen; Registry/Launchpad/Spotlight synchronisieren; Recovery-Integrationstests | Lokaler Demo-Store, kein öffentliches Ökosystem, keine Zahlungen oder freie Installation beliebiger URLs. |
| Spotify | `src/main/spotify-launcher.cjs`: authentifizierte parameterlose Bridge, lokaler validierter OS-Handler, Parallelklick-/Retry-/UI-Tests; keine Web-Weiterleitung | OS-Übergabe ist kein Start-/Fensternachweis. Standard-/Store-Installation und macOS nicht nativ geprüft; manche Store-Handler unsupported, technische Dateifehler noch unfreundlich. |
| Bestehende lokale Apps | AirWrite, Musikdateiauswahl/-wiedergabe, Fotoauswahl, lokaler Kalender/ICS, Rechner und Arcade sind im Quelltext vorhanden | Nicht durch die 96 Tests vollständig GUI-geprüft. Kalender, Handschrift, Musikplaylists und Spiele nutzen weiterhin globale `localStorage`-Daten. Audiodateien müssen nach Neustart erneut gewählt werden. |

## 4. Teilimplementierungen und fehlende Desktop-Funktionen

- **Datenisolation:** Preferences, Notes und Reminders haben Profil-Stores. Kalender, AirWrite, Musikplaylists und Scores besitzen weiter globale Renderer-Schlüssel. AirCard-Artwork liegt ebenfalls nicht offensichtlich in derselben profilbezogenen Store-Struktur. Vor einem Mehrbenutzer-Freigabeversprechen tatsächlichen Zugriff nach Profilwechsel prüfen. Datenmigration benötigt explizite Zuordnung, Backup und Fehlerbehandlung.
- **Statusanzeigen:** `login.html` zeigt statisch „100%“, die Desktop-Menüleiste enthält dekorative WLAN-/Ton-/Batteriesymbole. Das sind keine verifizierten Host-Messwerte. Uhrzeit funktioniert, ein allgemeiner Status-/Capability-Service fehlt.
- **Island / Kontrollzentrum:** Das eigenständige Island-Grundelement ist im unten beschriebenen Phase-3-Checkpoint implementiert: Uhrzeit, einfaches Panel und Fokusverwaltung. Eine erste echte Dock-Theme-Kachel im Kontrollzentrum ist seit Phase 4 angebunden; weitere Inhalte fehlen weiterhin. Zuerst vorhandene Air-OS-Einstellungen und lokale Medien verwenden; Host-Funktionen nur mit belegter Schnittstelle.
- **Fensterkomfort:** Persistente Fenstergeometrie, konsistente App-/Fensteridentitäten, koordinierte Fokusregeln, Mehrmonitor-/DPI-/Zoom-Verhalten, Snap/Mission Control und Tastatur-Navigation fehlen teilweise oder sind nicht abgesichert. Kein externer Fensterzugriff als Nebenwirkung einer Designaufgabe.
- **Alltagsapps:** Browser-/Mail-/Übersetzer-/KI-Einträge und externe Dienste sind keine vollständigen eigenständigen Clients. Provider-APIs, OAuth und Einbettungsbedingungen jeweils separat prüfen. ChatGPT-Desktop-Integration ist noch offen; früherer Nutzerwunsch bleibt erhalten.
- **AirCard:** iPhone-/Wallet-Funktionen benötigen ein separates macOS-Backend; nicht enthalten, unter Windows keine Parität. Lokales Artwork ist davon zu unterscheiden.
- **Cloud / Backup:** `cloud-sync/` enthält getestete Auswahl-/Validierungsbausteine, keinen produktiven Auth-/Sync-Dienst. Versionierte Exporte, getestete Wiederherstellung, Konfliktbehandlung und optionale sichere Kontoverknüpfung fehlen.
- **Betriebsqualität:** Noch keine belegte vollständige Barrierefreiheit, dauerhafte GUI-Teststrecke, Leistungsmessung oder verlässliche signierte Update-/Rollback-Kette.

## 5. Bloom: geeignete Prinzipien und bewusste Grenzen

Referenzstand und Lizenz sind in Abschnitt 1 festgehalten. `package.json` und `src-tauri/Cargo.toml` nennen **GPL-3.0-only**; Air-OS steht unter **MIT**. Es wurden keine Bloom-Quellen, Assets, Icons, Fonts oder Ausschnitte in Air-OS übernommen. Diese Roadmap beschreibt eigenständig formulierte allgemeine Prinzipien. Jede spätere Übernahme geschützter Bestandteile benötigt zuvor ausdrückliche Klärung der konkreten Rechte und Lizenzfolgen; GPL-Code darf nicht einfach als MIT-Code umetikettiert werden.

Bloom ist ein React-/Tauri-/Rust-Projekt mit direkter Windows-Shell-Integration. Es wurde hier gelesen, nicht gebaut oder auf Windows ausgeführt. Aussagen zu dessen Verhalten sind Quellbefunde, keine eigenen Benchmarks.

| Untersuchter Bereich / Bloom-Quelle | Geeignetes Prinzip für Air-OS | Abgrenzung der Umsetzung |
| --- | --- | --- |
| Dock: `src/Dock.tsx`, `src/dockApps.ts` | Eine Datenquelle für angeheftete/laufende Apps, klare aktive Zustände, verzögerte Vorschau erst bei Bedarf | Vorhandene Air-OS-Registry/Lifecycle nutzen; Pinning separat ergänzen. Keine Windows-Taskleistenersetzung, HWND-Übernahme oder Bloom-Assets. |
| Island/Notch: `src/App.tsx`, `src/settings/NotchTab.tsx` | Kompakte/expandierte Zustände, kontextabhängige Inhalte und klare Moduswechsel | Eigenständige Komponente innerhalb des Air-OS-Fensters. Zunächst Uhrzeit und Tastaturbedienung; kein globales Always-on-top-/Click-through-Fenster. |
| Kontrollzentrum: `src/App.tsx`, `src/components/WifiPanel.tsx`, `BluetoothPanel.tsx` | Gruppierte Aktionen mit echten Zuständen, Lade-/Fehler-/Unavailable-Anzeige | Zuerst vorhandene Air-OS-Preferences. WLAN/Bluetooth/Host-Helligkeit erhalten keine Schein-Schalter. |
| Medien: `src/CompactMediaPlayer.tsx`, `src/App.tsx`, Rust-Mediendienste | Ein Medienmodell für Titel, Wiedergabe, Seek und Fehler; Anzeige folgt wirklicher Quelle | Zuerst eigenes Air-Music-Audio. Spotify-Start ist keine Wiedergabe-API. Keine WASAPI-/COM-/DRM-Portierung oder Systemaudioaufnahme als Design-Nebenaufgabe. |
| Fensterintegration: `src-tauri/tauri.conf.json`, `src/Dock.tsx` | Definierte Fokus-/Sichtbarkeitsübergänge, begrenzte Vorschauen, sauberes Aufräumen | Blooms mehrere transparente native Fenster passen nicht direkt zum Air-OS-DOM-Desktop. Interne Fenster zuerst integrieren; externe Prozesse separat spezifizieren. |
| Animationen: `src/App.tsx`, `src/Dock.tsx`, Styles | Kontinuierliche Übergänge, stabile Größen, respektierte Bewegungseinstellungen | Eigene CSS-/Web-Animations-Lösung mit `transform`/`opacity`, Abbruch/Cleanup und `prefers-reduced-motion`; kein ungeprüftes React-/Framer-Motion-Migrationsprojekt. |
| Einstellungen: `src/Settings.tsx`, `src/settings/useSettings.ts`, `src/hooks/useSettingsSync.ts` | Konsistente Änderungen über Ansichten, validierter Zustand, sichtbare Speicherfehler | Vorhandenen Air-OS-Preferences-Service ausbauen; nicht eine zweite globale `localStorage`-Konfiguration einführen. |
| Status: `src-tauri/src/battery.rs`, `wifi.rs`, `bluetooth.rs` und UI | Datenquelle, Aktualität, Fehler und fehlende Capability gemeinsam darstellen | Electron-Adapter pro Plattform; Batteriezustand nur aus einer geprüften Quelle. Dekoration nicht als Live-Telemetrie ausgeben. |
| Performance: `src/hooks/useTrailingThrottle.ts`, Visualizer in `src/App.tsx`, Vorschauen in `src/Dock.tsx` | Gedrosselte Eingaben mit letztem Wert, verzögerte begrenzte Vorschauen, Listener-Cleanup; Visualizer-Abonnement nur bei Wiedergabe | Prinzipien eigenständig umsetzen, sichtbarkeits-/lifecycleabhängig pausieren und messen. Bloom enthält auch Polling; kein pauschales Versprechen von „zero idle CPU“. |

## 6. Windows-/macOS-Unterschiede als Teil der Abnahme

| Thema | Windows | macOS | Gemeinsame Regel |
| --- | --- | --- | --- |
| Laufzeit | Legacy und experimenteller Modern-Build; x64/arm64 Installer vorhanden | Catalina-Legacy Electron 32.3.3; Modern-Workflow im Repository: Electron 44.9.0 mit Ziel macOS >=13 | Gepflegte aktuelle Version/Toolchain im jeweiligen nächsten Audit prüfen, nicht aus Versionsnummern Sicherheit ableiten. Kanäle getrennt testen. |
| Externe Apps | EXE-/Protokollhandler, Store-/Alias-Varianten, Zugriffsrechte | `.app`-Bundles, Protokollzuordnung, ggf. Betriebssystemfreigaben | Erfolg der OS-Übergabe nicht mit Prozess-/Fensterkontrolle gleichsetzen; kein freier Pfad/Command aus dem Renderer. |
| Dateien | Laufwerke, reservierte Namen, Groß-/Kleinschreibung, Dateisperren | APFS-Varianten, Unicode, Berechtigungen, Finder/Papierkorb | Pfad- und No-overwrite-Tests pro OS; Workspace-Grenzen, Race-Fälle und Wiederherstellung erhalten. |
| Oberfläche | Ctrl, DPI-/Mehrmonitor-/Taskleistenvarianten | Cmd, Retina, Menü-/Vollbild-/Space-Verhalten, Hardware-Notch | Nur eigenen Desktop belegen; Fokus, Zoomen, Safe Areas und reduzierte Bewegung real testen. |
| Medien / Hardware | Manche Funktionen brauchen gepflegte native Windows-Adapter | Andere APIs/Freigaben; keine automatische Parität zu Windows-COM/WMI | Capability-Modell mit `available/unavailable/error`, schmale geprüfte IPC. Zuerst app-interne Medien. |
| Release | Authenticode, Installer-/Update-/Rollback-Prüfung | Developer-ID-Signing, Hardened Runtime, Notarisierung; Intel/Apple Silicon | Keine Schlüssel im Repository. Pro Kanal echte Installation/Start/Deinstallation und Lizenznachweise. |

## 7. Sicherheits- und Release-Blocker

**P0 – vor einer regulären öffentlichen Freigabe:**

1. **Legacy-Laufzeit und Toolchain:** Der dokumentierte Audit vom 20. Oktober meldet zehn betroffene Pakete, davon zwei High (`electron`, `extract-zip`) und acht Moderate. Das ist ein historischer Befund, kein neu erhobener Audit dieser Sitzung. Electron 32 ist Legacy. `npm audit fix --force` würde die Catalina-Zielsetzung gefährden und ist keine Lösung. Der Modern-Workflow baut/testet, enthält derzeit aber keinen eigenen `npm audit`-Schritt. Beide tatsächlich installierten Kanäle müssen separat auditiert und freigegeben werden.
2. **Mehrbenutzerdaten:** Globale App-Daten und Profilwechsel sind ein konkreter Prüf-/Migrationsbedarf. Lokales Login ist keine OS-Sicherheitsgrenze und lokale App-Daten sind nicht automatisch verschlüsselt.
3. **Runtime- und Dateisystemgrenzen:** Tests zu manipulierten Paketen, Logout/`beforeunload`, Protokollwiderruf und Installations-Recovery existieren. Echte Electron-/Dateisystem-Race-/Power-Loss-Nachweise fehlen weiterhin; eine Signatur schützt nicht vor allen Laufzeitfehlern.
4. **Produktions-Trust:** Demo-App-Signatur ist kein Produktions-Schlüsselmanagement. Für zusätzliche Herausgeber/Downloads fehlen Rotation/Widerruf, Update-/Rollback-Regeln und ein belastbares Berechtigungsmodell. Aktuelle Grenzen nicht vorschnell öffnen.
5. **Release-Kette:** Signing/Notarisierung, sichere Updates, getesteter Datenexport/Restore, Installationsmatrix und Third-Party-/Markenprüfung sind offen. Kein öffentlicher Release allein aufgrund erfolgreicher Paketierung.
6. **Reproduzierbarkeit / CI:** Kein eingechecktes Dependency-Lockfile; transitive Auflösung ist nicht vollständig festgelegt. Lockfile-/Toolchain-Strategie als separate Änderung bewerten. Aktueller CI-Status bleibt bis erfolgreicher Abfrage unbekannt; frühere rote Security-Läufe bleiben sichtbar.

## 8. Priorisierte, einzeln abnehmbare Micro-Einheiten

Jede Tabellenzeile ist **höchstens eine Sitzung**, keine Aufforderung, die ganze Phase abzuarbeiten. Ziel sind etwa 5–10 Minuten Implementierungsarbeit. Wenn Diagnose, Hardware oder Umfang das verhindern, nur den überprüfbaren Teil dokumentieren und sauber abschließen; größere Aufgaben vor Codeänderungen weiter teilen. Plattform-Smoke-Tests benötigen die genannten Geräte und dürfen nicht durch simulierte Erfolge ersetzt werden.

### P0 – verlässliche Sicherheits- und Datenbasis

| ID | Genau eine Einheit | Abnahme / Abhängigkeit |
| --- | --- | --- |
| S1 | Audit der bestehenden Legacy-Abhängigkeiten reproduzieren und Befund aktualisieren; noch kein Upgrade | Tatsächliche Auflösung, Audit-Exitcode und Advisories dokumentiert; vorhandene Tests weiter aktiv. |
| S2 | Modern-Kanal isoliert auditieren und kleinsten Toolchain-Fix festlegen | Eigener nachprüfbarer Befund; Catalina-Dateien unverändert. Umsetzung eines Updates folgt in separater Einheit. |
| D1 | Globale App-Daten und Profilwechsel für **eine** App inventarisieren, zuerst Kalender | Reproduzierbarer A→B→A-Fall mit nichtprivaten Testdaten und dokumentierter Migrationsentscheidung; kein stilles Löschen. |
| D2 | Für Kalender einen profilbezogenen Main-Store nach Notes-/Reminders-Muster ergänzen | CRUD/Validierung, Isolation und fehlgeschlagener atomarer Schreibvorgang getestet. Noch keine GUI-Migration. |
| D3 | Kalender-UI an diesen Store anbinden | A→B→A-GUI-Abnahme; vorhandene Daten bleiben erhalten. Altdatenimport nur nach gesondert festgelegter Zuordnung. |
| R1 | Einen echten Electron-Test für Air-App-Logout/Protokollwiderruf ergänzen | Geladene Demo-App wird beendet, alte Requests abgelehnt, frischer Start funktioniert; keine produktiven Daten. |
| F1 | Papierkorb-/Restore-Vertrag für den gewählten Workspace entwerfen | Bestätigung, Kollision, Wiederherstellungsziel und Fehlerfälle spezifiziert; noch keine Löschfunktion. |

D1–D3 anschließend je App einzeln auf AirWrite/Musik anwenden; keine Mehrfachmigration in einer Sitzung. S1/S2 sind Release-Arbeit und können in separaten Sitzungen neben kleinen Produktfortschritten laufen; neue visuelle Funktionen beseitigen diese Freigabeblocker nicht.

### P1 – vorhandenen Desktop stabilisieren, dann sichtbaren Mehrwert liefern

| ID | Genau eine Einheit | Abnahme / Abhängigkeit |
| --- | --- | --- |
| U1 | Vorhandenes Classic-/Modern-Dock in Electron visuell prüfen | Schmale Breite, Scrollen, Fokus, Theme-Persistenz, Start/Minimieren/Wiederherstellen und reduzierte Bewegung; nur Befunde dokumentieren bzw. genau einen isolierten Defekt beheben. |
| N1 | Bestehenden Spotify-Dateisystemfehler benutzerfreundlich abbilden | EACCES/fehlender Client/Retry getestet; Auth-, Pfad- und No-browser-Grenzen unverändert. |
| N2 | Spotify auf **einer** tatsächlichen Plattform/Installationsart prüfen | Pfad-/OS-Übergabe und bereits laufender/fehlender Client dokumentiert; Windows-Store/macOS in weiteren Sitzungen. |
| C1 | Offiziellen lokalen ChatGPT-Startmechanismus für eine Zielplattform prüfen | Quelle, erlaubter Startweg, Versions-/Installationsgrenzen und benötigte Rechte dokumentiert. Kein Login-/API-Key-/Browser-Umbau. |
| C2 | Nach C1 genau diesen nativen Startadapter in bestehende Registry/Bridge integrieren | Parameterlose authentifizierte IPC, fehlender Client und Fehler getestet; weitere Plattform separat. ChatGPT bleibt der bereits gewünschte nächste neue Integrationskandidat. |
| I1 | Eigenständigen Island-Zustandskern implementieren | Kompakt/expandiert/geschlossen und Aufräumen getestet; keine Host-API. |
| I2 | Uhrzeit-Island im Air-OS-Desktop anbinden | Tastatur, Escape, Fokus-Rückgabe, Fensterkollisionen/kleine Breite, reduzierte Bewegung real prüfen. Abhängig von I1. |
| Q1 | Quick Settings nur für vorhandene Air-OS-Darstellung anbinden | Bestehende Preferences ändern/persistieren; Speicherfehler sichtbar, kein zweiter Store. |
| M1 | Ein getestetes Medienzustandsmodell für **Air Music** extrahieren | Echte Audioereignisse, Pause/Ended/Fehler und Listener-Cleanup; keine Spotify-Steuerung behaupten. |
| M2 | Island-Medienansicht an M1 anbinden | Play/Pause und Titel folgen wirklichem Audio; verborgen/geschlossen keine unnötige Aktualisierung. |
| P1 | Profilbezogene Dock-Pins als Datenvertrag ergänzen | Nur Registry-IDs, begrenzt, validiert, profilisoliert und persistiert; noch kein Drag-and-drop. |
| P2 | Bestehendes Dock aus P1 rendern und Pin/Unpin anbieten | Keine doppelte Registry; fehlende/deinstallierte IDs sicher behandeln, Startwege erhalten. |

### P2 – Ausbau nach abgesicherten Grundlagen

| ID | Nächste begrenzte Einheit | Abnahme / Voraussetzung |
| --- | --- | --- |
| W1 | Zustands-/Fokusvertrag für interne und Air-App-Fenster dokumentieren | Fenstertypen getrennt, eindeutige IDs und testbare Übergänge; danach Adapter einzeln extrahieren. |
| B1 | Ehrliches Statusmodell mit `unavailable` einführen | Statische Host-Werte nicht mehr als Messung behandeln; eine echte Quelle erst in Folgeeinheit ergänzen. |
| T1 | Einen Idle-/Animationsmessfall erfassen | Gleiche Umgebung/Ansicht und Messdauer; CPU-/Timer-/Listener-Befund vor Optimierung, keine erfundenen Zielwerte. |
| A1 | Einen Tastatur-/Screenreader-Ablauf absichern, zuerst Launchpad | Fokusreihenfolge, Escape und Namen; danach Spotlight/Island einzeln. |
| X1 | Versionierten Export für **einen** Profil-Store spezifizieren/testen | Backup/Restore mit beschädigten Daten und Kollisionen; GUI und weitere Stores separat. |
| L1 | Einen Modern-Installer auf einer realen Plattform abnehmen | Installation, Start, Profilpersistenz, Deinstallation; Signing/Updates gesonderte Einheiten. |

Langfristig folgen nach diesen Verträgen Finder-Vorschauen/Move/Trash, Benachrichtigungen mit echten Auslösebedingungen, Mission Control, produktionsfähige Paketverteilung/SDK, Provider-basierte Mail/Kalender, opt-in Cloud und native iPadOS-Laufzeit. Jedes Vorhaben wird vor Beginn erneut in eine konkrete kleine Einheit zerlegt; keine Vollimplementierung eines „kompletten Desktops“ in einer Sitzung.

## Notes-Mitteilungs-Checkpoint – 23. Oktober 2026

Auf `feat/air-notes-island-notification-20261023`, ausgehend von `c35f31d`: nach einem tatsächlich bestätigten Air-Notes-Save erscheint eine feste Meldung samt lokalem Zeitstempel im Island-Panel. Kein Titel/Inhalt/ID im Signal, kein automatisches Öffnen/Fokuswechsel. Genau die letzte Meldung je Dokument, ohne persistente Historie; Cleanup bei Seitenende und leeres Panel nach Reload/Profilwechsel. Kein allgemeiner Notification-Service oder Berechtigungsnachweis durch DOM-Events.

105 Node-Tests grün; echter Linux-Electron-GUI-Lauf mit sechs Prüfgruppen einschließlich tatsächlichem Save, erneuter Speicherung, emulierten 760/390px, Reload und zweitem Profil grün. Details/Grenzen in den neuesten Übergabedokumenten. Vorhandene Musikfunktionen wurden geprüft, aber weder Spotify-Steuerung noch Audioaufnahme/Visualizer oder erfundene Mediendaten ergänzt. Weitere App-Quellen/Berechtigungen, Gelesen/Löschen/Ruhemodus, vollständige Mediensteuerung und native Plattformabnahme bleiben separate spätere Einheiten.

## Kontrollzentrum-Checkpoint Q1 – 23. Oktober 2026

Auf `feat/air-control-center-dock-theme-20261023`, ausgehend von `f5cdcac`, ist **genau eine** Kachel angebunden: „Modernes Dock“ schaltet Classic/Modern im bestehenden Air-OS-Dock. Vorhandene Preferences-IPC, profilbezogener Store und Schreibwarteschlange werden verwendet; Anwendung und Erfolgshinweis erst nach bestätigtem Save, Fehler/Retry/Busy/Unavailable explizit behandelt. Kachel und vorhandenes Settings-Select spiegeln Änderungen in beide Richtungen. Kein Host-Systemzustand wird verändert oder vorgetäuscht, keine weiteren Kacheln und kein Bloom-Code.

102 Node-Tests grün, einschließlich drei neuer Kontrollzentrum-/Saveadapter-Tests. Echter Linux-Electron-GUI-Lauf: sechs Prüfgruppen grün, Profildatei und Renderer-Reload sowie Maus/Tastatur/Fokus und emulierte 760/390px geprüft. Details, Grenzen und Reproduktion in den neuesten Übergabedokumenten. Q1 ist nur für diese erste Einstellung umgesetzt; weitere Kacheln werden einzeln in späteren Sitzungen entwickelt. Native Plattform-/Release-Gates und der bekannte Dock-Marker bleiben offen.

## Island-Checkpoint I1/I2 – 22. Oktober 2026

Auf `feat/air-dynamic-island-base-20261022`, ausgehend von `335e0ac`, ist die erste kleine Island-Einheit implementiert: schwarze zentrierte Pille unter der Menüleiste, echte lokal formatierte Uhrzeit mit vorhandener 12-/24h-Einstellung, nicht modales Panel, Maus-/Tastaturbedienung und Fokusverwaltung. Reservierter Platz für die kompakte Island, begrenzte Ebenen für Fenster/Symbole, responsive Panelbreite/-höhe und reduzierte Animationen. Keine Host-Steuerung oder weiteren Panel-Inhalte. Eigenständige Lösung ohne Bloom-Code/Assets.

99 Node-Tests einschließlich drei neuer Island-Tests bestanden; echter Linux-Electron-GUI-Lauf mit acht Prüfgruppen grün. Emulierte 1440×900/760×540/390×600-Ansichten, Fokus, Bedienbarkeit maximierter Fensterleisten, bestehende Clock-/Reduced-Motion-Preferences und OS-Reduced-Motion geprüft. Native Windows/macOS und Release-Gates bleiben offen; Details/Reproduktion in den neuesten Fortschrittsdokumenten. I1/I2 sind für dieses Grundelement abgedeckt; dies ersetzt keine vollständige Desktop-/Barrierefreiheitsabnahme.

Nächste Island-Einheit auf Nutzerwunsch: **Q1**, kleines Kontrollzentrum mit bestehenden Air-OS-Darstellungseinstellungen und echter Persistenz. Medien, Notifications, Kalender, Timer und Host-Status bleiben eigene spätere Einheiten. Dock-Pinning/Drag-and-drop und der bekannte Dock-Fokusmarker bleiben offen.

## Dock-Checkpoint U1 – 22. Oktober 2026

Auf Branch `test/air-modern-dock-gui-20261022` nach Basis `b450031` in echtem Linux-Electron geprüft: Position/Classic↔Modern, Start, tatsächlicher Fensterfokus, Minimieren/Wiederherstellen, Enter und schmale emulierte Rendererbreiten. Eine CSS-Korrektur macht die aktive Modern-Hintergrundfläche sichtbar. `scripts/check-dock-gui.cjs` hält den Nachweis wiederholbar. **U1 bleibt teilweise offen:** erneuter Fokuswechsel kann die aktive Dock-Markierung veralten lassen. Finaler GUI-Test: neun erfolgreiche Prüfgruppen, ein expliziter Fehler (Exit 1); Node-Tests 96/96 grün. Keine Windows-/macOS-Abnahme. Details und Reproduktion im neuesten DEVELOPMENT_PROGRESS-Checkpoint.

Der Phase-2-Nutzerauftrag priorisiert als nächste Dock-Einheit **P1 (Pinning-Datenvertrag)**, danach P2 und erst anschließend Drag-and-drop. Der offene Fokusmarker bleibt vor Freigabe zu beheben; diese Sitzung korrigierte entsprechend Nutzergrenze genau einen Fehler.

## 9. Nächste drei mögliche Sitzungen und Abschlussregel

Empfohlene Reihenfolge: **S1** (Audit reproduzieren), **D1** (Kalender-Profilgrenze prüfen), **U1** (vorhandenes Dock real validieren). Der bestehende ChatGPT-Wunsch wird als C1/C2 erhalten; wenn der nächste Nutzerprompt diese Integration ausdrücklich priorisiert, zuerst C1 durchführen. Diese Roadmap startet keine dieser Aufgaben automatisch.

Vor jeder Sitzung GitHub-HEAD, PR/CI und Arbeitsbaum erneut prüfen. Ein eigener Branch schützt PR #11 vor parallelem Schreiben; Agentenaktivität lässt sich nicht allein aus einem unveränderten HEAD ausschließen. Keinen Force-Push, keine automatischen Merges, `main` und andere PRs erhalten. Nach genau einer Einheit: tatsächlich passende Tests, Commit und beide Übergabedokumente aktualisieren, Push nach erneuter Remote-Prüfung, Ergebnis und Grenzen berichten, dann stoppen.

## Quellen

- [Air-OS PR #11](https://github.com/quattrologic/Air-Os-Clean/pull/11), [geprüfter Air-OS-Commit](https://github.com/quattrologic/Air-Os-Clean/tree/eecab2a043fc62ab0802312aa09ce29dfd96c280).
- Lokale Belege: [Architektur](ARCHITECTURE.md), [Fortschritt](DEVELOPMENT_PROGRESS.md), [nächste Schritte](NEXT_STEPS.md), [Security Audit](SECURITY_AUDIT.md), [Air-App-Sicherheit](AIRAPP_SECURITY.md), [bisherige Roadmap](../ROADMAP.md), [Paketmanifest](../package.json).
- [Bloom am geprüften Commit](https://github.com/SehajveerSingh2005/bloom/tree/8b3d5dcdcbadc1490c2824ccec01e818b7a0233c), insbesondere die in Abschnitt 5 genannten Dateien; [Manifest/Lizenzangabe](https://github.com/SehajveerSingh2005/bloom/blob/8b3d5dcdcbadc1490c2824ccec01e818b7a0233c/package.json) und [Lizenz](https://github.com/SehajveerSingh2005/bloom/blob/8b3d5dcdcbadc1490c2824ccec01e818b7a0233c/LICENSE).
