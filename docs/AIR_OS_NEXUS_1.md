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

## Checkpoint B — Finder-/Plattformintegration und erste GUI-Korrektur

580/580 lokale Node-Tests, 393 Runtime-Ressourcen geprüft. Finder-Dateien lassen sich über ihre vorhandene explizite Rootfreigabe in die Ablage kopieren; Rückexport verwendet den bestehenden Finder-Resolver und exklusives Erstellen ohne Überschreiben. Ordnerstapel importieren nach nativer Auswahl nur 2–32 direkte Dateien; keine rekursive Rootfreigabe. Native Drag-Ausgabe und echte manuelle Pickerabnahme sind getrennte Hostprüfungen.

Erste echte Linux-CI [41287651894](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41287651894): vier Baselineansichten und 14 neue Ablage-/Layoutprüfungen bestanden. Island-Aktivierung fiel durch; Ursache war eine falsche Referenz auf `window.open`, korrigiert zum vorhandenen M1-Toggle und durch neuen Regressionstest gesichert. Dieser Lauf ist ausdrücklich **keine vollständige GUI-Freigabe**. Debugbilder unter `docs/visual/nexus1/2e3cd8b1720811585ce54fceb2cfabbbb11afdf9/`.

Getrennte Software-Shaderdiagnose bestand: DPR 1/2/3, echte Pixeländerung durch Refraktion, null Idle-Draws, Context Loss/Restore und Cleanup auf 0 Programme/0 Texturen. Keine Hardware-GPU-Abnahme. Neue Linux-/Windows-CI läuft vom nächsten Quellcheckpoint aus. Windows-NSIS und Linux-DEB bleiben Testartefakte ohne automatische Veröffentlichung/Installation auf Privatgeräten.

Checkpoint A: `2e3cd8b1720811585ce54fceb2cfabbbb11afdf9`. Debug-Evidenz: `3b71d87` (vollständige SHA in Git). iPad-Basis unverändert; InfinityOS-ISO fehlt weiterhin. Siehe [Linux-Prototyp](AIR_OS_LINUX_ROADMAP.md) und [ISO-Voraussetzungen](AIR_OS_INFINITYOS_INVENTORY.md).

## Checkpoint C — reale Integrationskorrekturen

597/597 Node-Regressionen einschließlich der 15 wiederverwendeten Stage-/Paneltests; alle ursprünglichen 557 Tests bleiben erhalten. `d1cdfa712f2a195db7d480c3e0c60e2e1d4f57e8` bestand 24 neue echte Linux-Electron-Prüfungen. Der getrennte Gruppenlauf fand den nicht geladenen `panel-navigation.js`-Helfer; dieser wird jetzt tatsächlich im HTML geladen. Shelf-Shortcut ist getrennt **Strg+Alt+Y**, Stage bleibt Strg+Alt+S. Die vorhandenen Tahoe-Promptdialoge ersetzen auf Electron nicht unterstützte Browser-Prompts.

Die direkte Bildkontrolle zeigte zu hellen Textuntergrund über cremefarbenen Appflächen. Korrektur im Produkt: begrenzte dunkle Fallbacktönung der Shelf und eine lesbare innere Island-Fläche; keine Änderung der äußeren Dock-/Islandform. Hardwarematerialien bleiben beim selben GLASS-3-Eigentümer. Der neue Materialtest prüft die Shelf selbst im Shaderpfad und nach Idle.

Zusätzliche ausdrückliche Browser-Dateiauswahl kopiert nur die vom Nutzer ausgewählten File-Inhalte in denselben Main-Speicher; keine Hostpfade oder neuen Dateisystemrechte. Das ist auch ein geeigneter Ansatz für einen späteren PWA-Port, noch kein iPad-Branchport. Die GUI wählt eigene synthetische Dateien über den echten Browser-Dateieingabepfad und bildet daraus Stapel über die Produktdialoge. Native Picker-/OLE-Dragabnahmen bleiben separat.

Windows verweigerte zunächst korrekt den Build wegen veränderter Zeilenenden in der neuen Apache-Lizenz. Byteerhalt für `third_party/edge-drop/**` ergänzt; keine Integritätsprüfung abgeschwächt. Linux-DEB-Gate benötigte vollständige Git-Historie und erhält diese jetzt. Endgültige Installer-/DEB-/GUI-Ergebnisse folgen nach den neuen Läufen.

## Checkpoint D — Dateistapel und native Buildabnahme

600/600 lokale Tests; 393 Runtime-Dateien. Echte Dateiauswahl und zwei benannte Stapel funktionierten im Linux-Renderer. Beim Öffnen eines Stapels wurde ein unnötiges Main-Leseereignis als Mutation publiziert und anschließend die Ansicht neu aufgebaut. Beides korrigiert: Lesen bleibt ohne Änderungsereignis und lokale Aufklappaktionen lösen keinen Neuaufbau aus. Neues Laufzeitverhalten wird erneut per GUI geprüft. Finder-Import/Export bindet nun zusätzlich die konkrete Rootrevision über asynchrone Schritte; portable Dateinamen verhindern insbesondere Windows-Gerätenamen.

Windows-CI [41288878817](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41288878817) bestand Audit, komplette Regressionen, Originalbytes/ASAR/PE/SHA-256 und die tatsächliche NSIS-Installation. Die GUI scheiterte an der alten Annahme konstanter Dockbreite trotz neu hinzugekommener Running-/Recent-Apps. Die neue Prüfung berechnet die erwartete dynamische Breite aus dem vorhandenen MacShell-Algorithmus; die unveränderte Island, Unterkante, M2 und alle ursprünglichen Pins bleiben verpflichtend. **Noch keine vollständige Windows-Abnahme aus diesem Zwischenlauf.**

Der Linux-DEB-Prototyp erhält explizite Maintainerangabe und begrenzte Builderdiagnosen. Noch kein installiertes DEB oder VM-Boot behauptet.

### Herkunft eigener wiederverwendeter Komponenten

Gezielte eigene Air-OS-Wiederverwendung aus `feat/air-os-infinityos-origin-port-2-desktop@45d056fcb97f841dbe5182c6c48c083fc614e5a7`: Stage-Modell/Übersicht und Integration im vorhandenen Window System, geometrische Panelnavigation, intelligentes Dock-Ausblenden samt M2-Motion-Leases, finite Materialinteraktion und zugehörige 15 Regressionstests. Kein kompletter Branchmerge, keine ungeklärten Origin-Originale.

Tatsächlich verwendete Edge-Drop-Funktionen: `contentSignature` → Main-Shelf-Deduplizierung; `isLinkText` → Text-/Linkklassifikation; `normalizeNote` → Stapelnamen; `queryWords/searchText/matchesWords` → Shelf-Suche; `reduceGuard/isGuarded` → native Drag-Rücklaufbegrenzung; `isClipboardExcluded` → explizite Clipboard-Übernahme. Andere mitgelieferte reine Hilfsfunktionen werden nicht als ausgeführte Produktfunktionen ausgegeben.

## Checkpoint E — integrierter visueller Prüfstand

Produktstand D `b22053315addbe075bc1046f40a7a4c5d72b6ff8`: **27 neue echte Nexus-GUI-Prüfungen und 5 separate Materialprüfungen bestanden**. Screenshotkontrolle bestätigt zwei reale Dateistapel, aufgeklappte Inhalte und lesbaren Timer. [Linux-Lauf](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41289704007). DEB-Prototyp erfolgreich gebaut; Artefakt `Air-OS-Nexus1-Linux-DEB-prototype-b22053315addbe075bc1046f40a7a4c5d72b6ff8`, Prüfsummen im Artefakt. Keine DEB-Installation/VM-Abnahme.

Weitere Prüfkorrekturen: Alle ursprünglichen 13 Dockeinträge werden weiterhin explizit verlangt, zusätzlich der funktionale Shelf-Eintrag. Dynamische Running-/Recent-Einträge dürfen vorhanden sein; Duplikate bleiben verboten. Beabsichtigte Logout-Navigation darf ihre laufende CDP-Auswertung beenden; anschließend bleibt die neue Loginseite zwingend zu prüfen. Andere Auswertungsfehler werden nicht geschluckt. Gruppenberichte sichern künftig auch den letzten erfolgreichen Prüfschritt bei Fehlern.

Die Dateiauswahl verwendet jetzt einen Tahoe-Button über dem echten HTML-Dateieingabepfad; der zusätzliche sichtbare rohe Browserbutton entfällt. Nativer Electron-Dialog bleibt in den Optionen. Timer-Mitteilungen öffnen direkt dieselbe Island-Ansicht, keine Platzhalterapp. Die erneute GUI prüft diese Aktionen.

Frühere Nexus-Messdateien erfassten für `menu` irrtümlich die im Modern-Modus versteckte Classic-`.menubar` (Höhe 0). Der Fensterhost lag korrekt bei y=24. Der neue Lauf misst ausdrücklich die aktive `.t6-menu-bar` und verlangt 24px sowie den vollständigen Fensterarbeitsbereich in jeder Zielgröße. Historische Messdateien bleiben unverändert als Fehlernachweis erhalten.

## Checkpoint F — abschließende CI-Härtung

`f1765ca` bestand die vollständige installierte Windows-App-GUI (Profile, Apps, M1/M2, Musiktransport, MRU, MacLock, Fallback); weitere native Prüfungen waren noch im Lauf. Der Linux-Vorherlauf scheiterte diesmal an einem flüchtigen Mausziel während der MacShell-Dockmagnifikation. Der Launcher wird im Harness nun über tatsächlichen Fokus und Enter aktiviert. Maus-/Hover-/Magnifikationstests bleiben separat erhalten.

Unabhängige Nexus-/Stage-/Material-/Bounds-Prüfungen laufen nach bestandenem Sicherheitsgate und bestätigter Installation auch dann, wenn eine andere GUI-Prüfung fehlschlägt. Der Gesamtlauf bleibt bei jedem Fehler rot. Keine Sicherheits-, Integritäts- oder Fachprüfung wird übersprungen oder als erfolgreich ausgegeben. Produkt-Runtime seit Checkpoint E unverändert; dieser Checkpoint ändert nur Teststeuerung und Dokumentation.

## Gesicherter Sitzungsabschluss — Wochenbudget 1 %

Auf ausdrückliche Budgetanweisung keine neue Entwicklungsphase begonnen. Alle Produktänderungen und die letzte Teststeuerung bleiben erhalten. Letzter geprüfter lokaler Gate: **600/600 Node-Tests**, Syntax-/Runtimeprüfung mit **393 Dateien**. Die letzten Änderungen an Launcheraktivierung und unabhängiger Teststeuerung sind noch nicht vollständig per GUI abgenommen und werden nicht als fertig geprüft bezeichnet.

Gesicherte Integrationen: temporäre Main-Shelf mit bewussten Datei-/Clipboardimporten, Deduplizierung, Suche, Favoriten und Stapeln; Finder-Import/Export mit Rootrevision und exklusivem Schreiben; bestehendes Dock mit Running-/Recent-Einträgen und Pinreorder; eigene geprüfte Stage-Komponenten; bestehende Island mit Musik, lokalem LRC, Timer/Pomodoro, Reminders und echtem Status; gemeinsame GLASS-3-Materialanbindung. Keine globale Clipboard-Überwachung, kein neuer Datenspeicher für Musik/Reminders, keine zweite Window-/Dock-/Glasengine.

Belastbare GUI-Nachweise: Produkt D `b22053315addbe075bc1046f40a7a4c5d72b6ff8` bestand **27 Nexus-Prüfungen** und **5 isolierte Software-Materialprüfungen**, einschließlich echter ausgewählter File-Objekte, zweier benannter Stapel, Entnehmen und Profilbereinigung. [Vorher/Nachher und Messdaten](visual/nexus1/b22053315addbe075bc1046f40a7a4c5d72b6ff8/evidence.json), [Stapel](visual/nexus1/b22053315addbe075bc1046f40a7a4c5d72b6ff8/after/shelf-bundle-expanded.png), [Timer](visual/nexus1/b22053315addbe075bc1046f40a7a4c5d72b6ff8/after/island-timer-running.png). GPU: Software; separate Diagnose, keine Hardwarefreigabe. 0 Programme/0 Texturen nach Cleanup.

Windows: Installer mehrfach erfolgreich gebaut, ASAR/Originalbytes/PE-x64/SHA geprüft und auf dem nativen Runner installiert. [Lauf 41290680599](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41290680599) bestand zuletzt bestätigt die vollständige installierte App-GUI. **Vollständige abschließende Windows-/Stage-/Bounds-Abnahme sowie endgültiger Installername und SHA-256 wurden vor diesem Budgetstopp nicht bestätigt. Kein fertig abgenommener Nexus-Windows-Installer behauptet.** Die Actions-Artefakte enthalten die tatsächlich erzeugten Installer, BUILD-INFO und Prüfsummen.

Linux-DEB-Prototyp: gebaut und als `Air-OS-Nexus1-Linux-DEB-prototype-b22053315addbe075bc1046f40a7a4c5d72b6ff8` in [41289704007](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41289704007) gesichert. Keine Installation/VM-/ISO-Abnahme.

### Konkrete Fortsetzung

1. Letzte Nexus-Linux-/Windows-CIs prüfen. Gruppen-/Neustartsequenz vollständig abschließen; bei Fehlern `origin-report.json` samt letztem Prüfschritt auswerten. Die letzten Testkorrekturen brauchen noch einen erfolgreichen vollständigen Lauf.
2. Danach Windows-Installer aus exakt geprüftem Quellstand freigeben: BUILD-INFO, Installername, SHA-256, installierte Screenshots und alle nativen Testergebnisse dokumentieren. CI wird durch Push gestartet; kein öffentliches Release/Website-Deployment.
3. Native Picker-/OLE-Drag-/Audio-/Hardware-GPU-Abnahmen fehlen. Native Drag-Ausgabe unterstützt importierte Dateien; Clipboard-Bilder in gemischten Stapeln brauchen noch vollständige Export-/UI-Unterstützung. Globale private Clipboardüberwachung bleibt bewusst ausgeschlossen. LRC-Parser ist getestet; vollständiger LRC-/Medien-GUI-Durchlauf bleibt offen.
4. Linux-DEB in isolierter VM installieren/starten/deinstallieren. Keine Host-/Bootloaderänderungen; echte Hyprland-Hardware fehlt.
5. iPad-Port separat durchführen: nur reine Modelle gezielt übernehmen, Safari/WebKit/Touch/Offline prüfen. Bestehender iPad-Branch unverändert.
6. InfinityOS-ISO/Inspektionsarchiv fehlt weiterhin; keine ungeklärten Originaldateien übernommen. Siehe Linux-/InfinityOS-Berichte.

Quell-/Testcheckpoint nach nicht destruktiver Übernahme ausschließlich synthetischer CI-Dokumentation: `9c5a8614a83d179bf47cabb9609de599099726e7`. Runtime-Produktcheckpoint E: `f1765ca` (vollständige SHA in Git). Abschließender Sicherungscommit folgt im Git-Verlauf; keine Änderungen verworfen, kein Force-Push, kein Merge auf main.
