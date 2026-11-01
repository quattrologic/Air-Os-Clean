# Air-OS Nexus 1

Basis: R7 `02ccaf88724731cf685d2221f88e959020aff3f0`. Branch `feat/air-os-nexus-1-system-integrations`. Kein Merge auf main, kein Website-Deployment. Der iPad-Branch bleibt unverändert.

## Checkpoint A — ausführbarer Dock-/Island-Port

- Main-eigene temporäre Edge Shelf: Text/Links, explizite Clipboard-Übernahme mit Ausschlussmarkern, bewusst ausgewählte Dateikopien, SHA-256-Deduplizierung, Suche, Favoriten, benannte Dateistapel, Entnehmen, Entfernen und vollständiges Löschen. 80 Elemente / 64 MB insgesamt / 16 MB je Datei. Originale bleiben unverändert. Favoriten sind ebenfalls temporär.
- Keine globale Clipboard-Überwachung. Nur nach nativer Freigabe können eigene Air-OS-Kopieraktionen automatisch abgelegt werden. Unmarkierte private Browser-/Passwortmanagerinhalte lassen sich nicht verlässlich klassifizieren; deshalb keine pauschale Überwachung. Manuelle Übernahme ist eine bewusste Datenfreigabe.
- Das vorhandene Dock erhält den Ablageknopf, Tastaturnavigation, Pin-Reorder und laufende/kürzlich verwendete Apps. Geometrie/Magnifikation/M2 bleiben beim bisherigen Eigentümer.
- Bereits geprüfte eigene Air-OS-Stage-Gruppen aus Origin 1/2 gezielt übernommen: vorhandene Registry/Lifecycle/MRU, M2-Gruppenaktionen und optische Geometrievorschauen ohne Fensteraufnahme. Keine Origin-Quelldateien übernommen.
- Die bestehende M1-Island registriert eine Aktivitätsansicht mit gemeinsamem Musiktransport, lokaler LRC-Datei, profilgebundenem Countdown/Pomodoro, vorhandenen Reminders und tatsächlichem Systemstatus. Keine zweite Audioengine/Reminder-Datenbank/Island.
- GLASS-3 erhält die Ablage als zusätzliche Popover-Fläche. Hardwareklassifikation, Wallpaper-only-Texturen, CSS-Fallback und reduzierte Transparenz bleiben erhalten.

## Originalcode und Lizenzen

Edge-Drop `72400d19cdb65b89b74358877d341aed68662625`, Apache-2.0: `electron/store/signature.ts`, `shared/linkText.ts`, `shared/itemMeta.ts`, `src/lib/search.ts`, `electron/preload/internalDragGuard.ts` und ein gezielter Auszug aus `electron/clipboard/formats.ts`. Unveränderte TS-Originale und vollständige Lizenz unter `third_party/edge-drop/`; SHA-256-Zuordnung in `SOURCE.json`. `scripts/build-edge-drop-port.cjs` entfernt nur Typen und erzeugt `src/core/edge-drop.js` sowie `src/main/clipboard-exclusion.cjs`. Keine React-/FFI-/Twemoji-Abhängigkeit. Bild-/Dateiidentitäten verwenden SHA-256 statt der schwächeren Größenheuristik.

Nusa `abe8bf5229b03516d80c81aff127832fc7fa95c7`: nur Website/README/Icon und kein Lizenznachweis für Anwendungscode. **Null Code/Assets übernommen**; reine Funktionsreferenz. MacShell/MacTahoe/Hyprland bleiben die vorhandenen, bereits lizenzierten Material-/Iconquellen. Ungeklärte InfinityOS-/Origin-Quellen werden nicht öffentlich übernommen.

## Sicherheit und tatsächliche Grenzen

Main authentifiziert Hauptfenster, exakten Hauptframe und Sitzung vor/nach asynchronen Operationen. Renderer erhält IDs, Namen und begrenzte Vorschauen, keine absoluten Dateipfade. Native Drag-Ausgabe nutzt ausschließlich Main-eigene Kopien. Import lehnt Symlinks, Sonderdateien und Übergrößen ab. Keine Remote-Linkvorschau oder Liedtextübertragung. Kein permanentes Clipboard-Polling. Abmeldung/Profilwechsel/Beenden entfernen die temporäre Ablage; ein Prozessabsturz kann Kopien im privaten OS-Tempverzeichnis hinterlassen. Löschung ist keine forensische SSD-Löschgarantie.

`src/core/nexus-model.js` und die reinen Edge-Drop-Modelle sind browserkompatibel. Native Clipboard-/Drag-/Dateipicker bleiben Desktopfunktionen. Kein ungeprüfter iPad-Port oder Branchmerge.

## Prüfstand

R7-Baseline: 557/557 tatsächlich ausgeführte Node-Tests. Checkpoint A: **575/575** (557 bestehende + 18 neue). Syntax-/Runtimeprüfung: 389 lokale Ressourcen. Neue echte Linux-Electron-/Materialprüfungen und ein Windows-Testkanal werden separat ausgeführt; bis zu deren Abschluss keine GUI-/Windows-Freigabe behauptet.

Screenshots, Messwerte, abschließende Commit-SHAs und verbleibende Teilaufgaben werden nach den tatsächlichen CI-Läufen ergänzt.
