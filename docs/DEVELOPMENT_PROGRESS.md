# Aktueller Checkpoint – Notizen: neuere Eingaben während des Speicherns erhalten

23. Oktober 2026. Genau eine Micro-Einheit: **den bestehenden Notizen-Speichervorgang gegen das Überschreiben neuerer Editor-Eingaben absichern**. Ausgangs-Commit `96dd9908865c9eca8e0f035e0375f57784df6de2` auf `fix/airapp-renderer-crash-recovery-20261023` per GitHub bestätigt. main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`; alle Branch-Refs geprüft, lokaler Ausgangsarbeitsbaum sauber. Eigener Branch `fix/air-notes-pending-save-edits-20261023`. PR-/CI-API-Abfragen dieser Sitzung liefern Forbidden; aktueller Gesamtstatus unbekannt. Main und fremde Branches bleiben erhalten.

Kurze Standard-App-Bestandsaufnahme aus Registry, `app.js`, Enhancements, Notes/Reminders-Stores/-UI, AirWrite, Air Music und Extra-Apps steht im **Phase-11-Checkpoint der Ultimate-Roadmap**. Notizen/Erinnerungen besitzen bereits profilbezogene CRUD/Persistenz; Kalender/AirWrite/Musik sind teilweise funktional mit globalen Speichergrenzen, Finder enthält bereits einen Texteditor. Browser/Mail sind keine vollwertigen integrierten Clients. Priorisiert: Notizen als grundlegende Produktivitäts-App, weil ein konkret reproduzierbarer Eingabeverlust vorliegt. Kein zweites App-System und keine Migration anderer Apps in dieser Sitzung.

Reproduktion im Node-/DOM-Adapter mit Produktions-UI und echtem Notes-Store: Text eingeben → Speichern verzögert bestätigen → weiter tippen → die bisherige `refresh(selected)`-Antwort ersetzt die neueren Eingaben durch den vorher gespeicherten Stand. Vor Fix **zwei neue Tests rot, ein Fehler-/Retry-Test bereits grün**. Fix: bestätigten kanonischen Save-Datensatz direkt in die lokale Listenansicht übernehmen; kein erneuter List-Aufruf und kein Überschreiben von Titel/Text. Bei abweichenden Editorwerten ausdrücklich „Stand gespeichert. Neuere Änderungen sind noch nicht gespeichert.“ melden. Erneutes Speichern verwendet die bestätigte ID und erzeugt keine doppelte Notiz. Nur bestätigte Saves lösen weiterhin die bestehende inhaltsfreie Island-Mitteilung aus.

Während Laden/Speichern keine Auswahländerung über Notizliste/Neu/Spotlight und keine Löschung zulassen, damit die Antwort nicht einer zwischenzeitlich anderen Auswahl zugeordnet wird; während Speichern bleibt der Editor beschreibbar. Solche Navigationsaktionen werden in dieser kurzen Busy-Phase ignoriert und müssen anschließend erneut ausgelöst werden, nicht automatisch nachgeholt. Nach Abschluss normale Auswahl/Neu wieder möglich. Kein Autosave: neuere Eingaben sind bis zum nächsten ausdrücklichen erfolgreichen Save nur im Editor und überstehen einen Neustart nicht. Schutz vor Verwerfen beim normalen Notizwechsel/Fensterschließen/Abmelden, konkurrierende Löschvorgänge und allgemeine Load-Races bleiben eigene offene Einheiten.

Tests: `node --test tests/notes-save-ui.test.cjs tests/notes-notification.test.cjs tests/notes-store.test.cjs` **7/7 grün**, davon drei neue Integrationstests. Produktions-Renderer läuft unverändert im Node-VM-/minimalen DOM-Adapter mit verzögerter API-Antwort; tatsächlicher profilbezogener Notes-Store und temporäres Dateisystem. Geprüft: spätere Titel-/Textänderungen bleiben erhalten, kein erneuter List-Aufruf beim Save, paralleler Save dedupliziert, bestätigter Snapshot gespeichert, erneuter Save gleiche ID, Wiederladen über frische Store-Instanz, Bobs Daten unverändert, Busy-Navigation/-Löschen verweigert und später wieder möglich, fehlgeschlagener Save erhält Entwurf und gespeicherte Daten ohne Erfolgssignal, Retry erfolgreich. Bestehendes Benachrichtigungs-Test-Double liefert jetzt wie Produktion kanonische Notizfelder statt nur einer ID; keine Assertion deaktiviert.

`TMPDIR=/workspace/scratch npm test`: **128 bestanden, 0 fehlgeschlagen/übersprungen**. Syntax der drei JS-/Testdateien, `npm run check:catalina`, `git diff --check` bestanden. Keine neue echte Electron-/GUI-/IPC-/Windows-/macOS-/Installerprüfung und kein Audit; VM-/Store-Integration ist kein solcher Nachweis. Bestehende Legacy-Electron-/Audit-, globale App-Daten-, Store-Trust-/Update-, Signing-/Notarisierungs- und CI-Blocker bleiben offen; keine Release-Freigabe behauptet.

Nächste drei kleine Einheiten, jeweils nur auf weiteren Prompt: (1) Schutz eines ungespeicherten Notizentwurfs beim normalen Notizwechsel spezifizieren und testen; (2) denselben Schutz separat für internes Fensterschließen anbinden, Speichern/Verwerfen/Abbrechen klar behandeln; (3) Kalender-Profilgrenze entsprechend Roadmap D1 reproduzieren und einen datenerhaltenden Migrationsvertrag festlegen, keine stille Zuordnung alter globaler Termine. Commit `Preserve newer Notes edits across pending save acknowledgement`; SHA im Git-Log/Abschlussbericht. Danach stoppen.

---

# Aktueller Checkpoint – Air-App-Runtime: Renderer-Absturz kontrolliert beenden

23. Oktober 2026. Genau eine Micro-Einheit aus dem offenen Runtime-/Recovery-Bereich der Ultimate-Roadmap (§7.3, Lifecycle-/Fenstergrenzen): **abgestürzte Air-App-Fenster aus der bestehenden Runtime entfernen und einen frisch geprüften Neustart ermöglichen**. Ausgangs-Commit `e745357d4b46b0c032c4543561a1359a591205ad` auf `feat/air-chatgpt-installation-probe-20261023` per GitHub bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Remote-Branch-Refs geprüft, lokaler Ausgangsarbeitsbaum sauber. Eigener Branch `fix/airapp-renderer-crash-recovery-20261023`; keine fremden Branches/main ändern. PR-/CI-API-Abfragen dieser Sitzung liefern Forbidden; aktuellen PR-Gesamtstatus/CI-Erfolg deshalb nicht behaupten.

Bestand geprüft: Paketprüfer, Manager, Runtime, Store/Bootstrap, Registry-Anbindung und vorhandene Installations-Recovery-/Runtime-Tests. Bereits vorhanden: Ed25519-/SHA256-Prüfung, fester lokaler Demo-Katalog, Profilinstallation, verifizierte Orphan-Adoption, staging-sicherer Retry, journalisierte Entfernung, Store→Registry→Launchpad-Synchronisierung, isolierte Session-Partitionen und widerrufener Asset-Zugriff nach Fensterende. Diese Dienste werden nicht neu gebaut. Kein öffentliches Store-/SDK-System und keine zusätzlichen App-Berechtigungen in dieser Einheit.

**Reproduziert im bestehenden Node-/Electron-Adapter:** `render-process-gone` beendet bisher nicht das Runtime-Fenster. Beide neuen Regressionstests schlugen vor Änderung fehl (**16 vorhandene Runtime-Tests grün, 2 neue rot**). Ein existierendes Fenster kann so als wiederverwendbar gelten, obwohl sein Renderer ausgefallen ist. Fix ausschließlich im vorhandenen Runtime-Fensteraufbau: Ereignis an genau dieses Fenster binden und es bei Renderer-Ende per `destroy()` beenden. Der vorhandene `closed`-Cleanup entfernt die Fensterreferenz; bestehende Protocol-Autorisierung verweigert dann weitere Assets. Kein automatischer Neustart oder Abschalten von Sandbox/Signatur-/Hashprüfungen. Der nächste ausdrückliche Start durchläuft wieder die vorhandene Installationsprüfung.

Zwei neue Tests: (1) Absturz nach Start beendet nur Alices Fenster, Bob bleibt nutzbar, Alices Asset-Zugriff wird verweigert; fehlgeschlagene aktuelle Integritätsprüfung verhindert Neustart, nach Wiederherstellung entsteht ein neues Fenster; spätes doppeltes Absturzereignis am alten Fenster schließt den Ersatz nicht. (2) Absturz während gemeinsamem Start beendet das Fenster; nach Auflösen des simulierten `loadURL` werden beide wartenden Startanforderungen abgelehnt, Protokoll bleibt gesperrt und späterer Retry funktioniert. Kein neuer Timeout-Vertrag für ein nie endendes `loadURL` behauptet.

Nach Fix: `node --test tests/airapp-runtime.test.cjs tests/airapp-install-recovery.test.cjs tests/airapp-installed.test.cjs tests/airapp-package.test.cjs` **41/41 grün**. `TMPDIR=/workspace/scratch npm test` **125 bestanden, 0 fehlgeschlagen/übersprungen**. Syntax beider geänderten CJS-Dateien, `npm run check:catalina` und `git diff --check` bestanden. Neue Runtime-Tests verwenden wie bisher Electron-/Manager-Test-Doubles mit echten temporären Asset-Dateien; keine echte Electron-Crash-/GUI-/Windows-/macOS-/Installerabnahme. Die Manager-/Paket-/Recovery-Tests laufen zusätzlich mit tatsächlich signierten Testpaketen. Kein neuer Audit, keine erfundenen nativen Ergebnisse.

**Offene Release-Blocker:** Legacy-Electron 32 und historischer Audit-Befund (20.10.: zehn betroffene Pakete, zwei High, acht Moderate; heute nicht neu erhoben), fehlende native Plattform-/Crash-/Storage-Abnahme, Dateisystem-Races/Power-Loss, fehlendes reproduzierbares Dependency-Lockfile sowie Signing/Notarisierung. Öffentlicher Store weiterhin gesperrt durch Demo-Trust-Root statt Produktions-Schlüsselverwaltung, fehlende Herausgeberprüfung/Veröffentlichungsstrategie, Schlüsselrotation/Widerruf, Update-/Rollback-Vertrag und Berechtigungsmodell. Bestehende Signatur-/Hash-/IPC-/Netzwerkgrenzen unverändert; eine Signatur allein ersetzt keine Inhaltsprüfung. SDK und öffentliche Verteilung werden nicht als fertig dargestellt.

Nächste drei kleine Einheiten, jeweils nur auf neuen Prompt: (1) diesen Crash-/Retry-Pfad mit signiertem Demo-Paket in einer echten Electron-Laufzeit prüfen, z.B. kontrolliertem `forcefullyCrashRenderer()` in separatem Testprofil; (2) Store-Startfehler und anschließenden ausdrücklichen Retry über bestehenden Runtime-/Registry-Weg als kleine UI-Integration testen, keinen falschen Aktivitätszustand anzeigen; (3) genau eine minimale SDK-Projektvorlage gegen den bestehenden Manifest-/Paketprüfer testen, ohne neue Rechte oder öffentliche Installation. Commit `Retire crashed Air App renderers before verified restart`; SHA im Abschlussbericht/Git-Log. Nach GitHub-Sicherung stoppen.

---

# Aktueller Checkpoint – ChatGPT: sichere Installationsprüfung als Launcher-Vorbereitung

23. Oktober 2026. Genau eine Micro-Einheit: **systemweiten macOS-Installationskandidaten prüfen, ohne ihn voreilig zu starten**. Ausgangs-HEAD `552282ffa71ffd465ff4a3067977f1c770d9e7fe` auf `fix/air-finder-save-temp-cleanup-20261023` per GitHub bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Alle Branch-Refs geprüft, eigener Branch `feat/air-chatgpt-installation-probe-20261023`; sauberer Ausgangsarbeitsbaum. Main und fremde Branches bleiben unverändert.

Bestand: Spotify besitzt bereits nativen Launcher, authentifizierte parameterlose IPC/Preload, Dock-/Launchpad-Routing sowie Fehler-/Retry-Tests. Unverändert erhalten. Kein ChatGPT-Eintrag/-Launcher in Registry/Main/Preload/Tests gefunden. `ai` ist Air-KI/Ollama und wird nicht als ChatGPT umbenannt.

**Konkrete Rechercheblockade:** Die offiziellen Seiten https://help.openai.com/en/articles/9275200-downloading-the-chatgpt-macos-app, https://chatgpt.com/download und https://openai.com/chatgpt/desktop/ lieferten am 23.10.2026 über den Umgebungsproxy `CONNECT tunnel failed, response 403`. Direkter Zugriff auf die Hilfeseite scheiterte an DNS. Eine erreichbare aktuelle Homebrew-Cask-Datei ist eine Drittquelle und kein ausreichender Beleg für offizielle App-Identität oder einen unterstützten Startvertrag. Deshalb keine geratenen URL-Schemes, Bundle-IDs, Store-IDs, Zertifikat-Teams oder Startbefehle übernehmen. Sicherer Zwischenstand statt unbestätigter nativer Startintegration.

Neu: `src/main/chatgpt-installation.cjs` exportiert eine ausschließlich Main-seitige `createChatGPTInstallationProbe().inspect()`-Vorstufe, in der Builder-Dateiliste enthalten. Auf macOS ausschließlich `/Applications/ChatGPT.app` mit `lstat` und `realpath` prüfen. Reguläres Verzeichnis ohne Symlink/kanonische Umleitung ergibt **`candidate-found`, `identityVerified:false`**, ausdrücklich keinen Nachweis einer offiziellen oder kompatiblen installierten App. `ENOENT` ergibt `not-found` mit Scope `system-applications`, keine globale Nichtinstalliert-Behauptung; Benutzer-/andere Installationsorte werden nicht durchsucht. Datei, Symlink oder umgeleiteter Pfad werden abgelehnt; Zugriffs-/I/O-/Verschwinden-beim-Prüfen-Fehler führen zu nachvollziehbarem Fehler und erlauben erneuten Versuch. Windows/andere Plattformen melden `unavailable/platform-not-implemented`, ohne Dateisystemzugriff.

**Grenzen:** Noch kein Launcher, keine IPC-/Renderer-Anbindung, kein ChatGPT-Icon/Registry-/Dock-Eintrag und keine Aussage über laufende externe Fenster. Kein Prozessstart, kein Browser-Fallback, keine Downloads, kein Audio-/Credential-Zugriff, keine Schlüssel. Pfadprüfung ersetzt keine Signatur-/Herausgeberprüfung und garantiert keinen Schutz gegen konkurrierenden Pfadaustausch; ihr Ergebnis darf nicht als Startfreigabe verwendet werden. Der Baustein wird bislang nur von Tests aufgerufen, nicht automatisch im Desktop.

**Plattformvertrag noch offen:** Aktuelle offizielle ChatGPT-Mindestversionen und CPU-Unterstützung für Windows/macOS konnten nicht verifiziert werden. Keine alten Annahmen als heutigen Support ausgeben. Air-OS unterstützt weiterhin seine eigene Legacy-Konfiguration; daraus folgt keine ChatGPT-Unterstützung. Windows ist in dieser Vorstufe nicht implementiert; auch für macOS ist der native Start nicht freigegeben. Vor Aktivierung offizielle aktuelle Anforderungen und signierte App-Identität prüfen; für dann nachweislich nicht unterstützte OS-/CPU-Versionen einen konkreten erklärten Status ausgeben. Keine offizielle Nichtunterstützung einer bestimmten Version ohne Quellenbeleg behauptet. Eine spätere OpenAI-API-App bleibt eine getrennte Aufgabe mit eigenem Benutzer-API-Zugang; ein ChatGPT-Abonnement ist kein API-Schlüssel.

Tests: `node --test tests/chatgpt-installation.test.cjs tests/spotify-launcher.test.cjs` **16/16 grün**, davon sechs neue Kandidaten-/Fehler-/Plattformtests und zehn unveränderte Spotify-Tests. Neue Tests verwenden ausdrücklich **Linux-seitig ausgeführte macOS-/Dateisystem-Test-Doubles**, keine native Windows-/macOS-Abnahme. Kandidat vorhanden/fehlend, ungeeignete Datei/Symlink, kanonische Umleitung, Zugriffs-/I/O-Fehler, Retry und nicht implementierte Plattformen geprüft. `TMPDIR=/workspace/scratch npm test`: **123 bestanden, 0 fehlgeschlagen/übersprungen**. Syntax beider neuen Dateien, `npm run check:catalina`, `git diff --check` bestanden. Keine GUI nötig für diese nicht angebundene reine Dateisystemvorstufe; keine Installer-/neuen Audit-/Signaturtests. Aktueller CI-Gesamtstatus unbestätigt: auch die heutige `gh api`-Statusabfrage für den Ausgangs-Commit liefert Forbidden. Bestehende Electron-/Audit-/Signing-/Release-Blocker bleiben offen.

Nächste drei kleine Einheiten, nur nach weiterem Prompt: (1) aktuelle offizielle Plattformanforderungen, App-Identität und nativen Startvertrag quellenbasiert verifizieren und dokumentieren; ohne Belege weiter gesperrt lassen; (2) einen verifizierten Plattform-Launcher mit Identitätsprüfung sowie installierten/fehlenden/abgelehnten Zuständen testen, nur OS-Übergabe bestätigen; (3) parameterlose authentifizierte Bridge und anschließend separat die vorhandene Registry-/Launchpad-/Dock-Route anbinden, ohne zweite App-Liste oder erfundenen Laufstatus. Commit `Add bounded ChatGPT installation candidate probe`; SHA im Git-Log/Abschlussbericht. Danach stoppen.

---

# Aktueller Checkpoint – Finder-Save-Cleanup gegen Datenverlust abgesichert

23. Oktober 2026. Genau eine Micro-Einheit: **fremde temporäre Dateien beim Finder-Textspeichern erhalten**. Ausgangs-HEAD `764ac848ed75ac7d476a5c44b82ff5dd0ad1c478` auf `feat/air-dock-pin-preferences-20261023` per GitHub bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `fix/air-finder-save-temp-cleanup-20261023`; main und andere Branches unverändert.

Bestand geprüft: `src/main/file-ops.cjs`, vorhandene File-Operationstests, begrenzte Dateinamensuche und Main-Finder-IPC/Workspace-Resolver. Vorhanden sind Ordneranlage, exklusive Textdateierstellung, Kopieren/Duplizieren, No-overwrite-Umbenennen sowie Text lesen/speichern. Es wird kein zweiter Dateidienst und kein neuer Finder gebaut. Kein neuer Datei-/Ordnerzugriff, keine Lösch-/Papierkorbfunktion und keine Änderung von Profildaten/Arbeitsordnerfreigabe.

Reproduzierter Datenverlust: Der Text-Save wählt `.airos-save-<Zufallswert>.tmp`. Existiert dieser Name bereits, wirft `writeFileSync(..., flag:'wx')` korrekt EEXIST, aber das bisherige `finally` löscht den fremden Pfad. Mit deterministischem Test-Zufallswert verschwanden sowohl eine vorher vorhandene Datei als auch ein vorhandener Symlink. Vor Fix **4/6 neue Tests grün, 2 Kollisionsfälle rot**.

Fix im vorhandenen `air-os:files:write-text`-Handler: temporäre Datei mit `openSync(...,'wx',0o600)` **vor Eintritt in den Cleanup-Block** exklusiv reservieren. Bei EEXIST erfolgt kein Cleanup dieses fremden Namens. Nach erfolgreichem Reservieren über den Dateideskriptor schreiben, diesen auch bei Schreibfehler im inneren `finally` schließen und erst dann per bestehendem Rename ersetzen. Fehler-Cleanup betrifft den für diesen Versuch reservierten temporären Pfad. Das ausdrücklich angeforderte Speichern eines regulären vorhandenen Dokuments ersetzt dieses weiterhin; „Neue Datei“ bleibt separat exklusiv/no-overwrite.

Neue `tests/file-write.test.cjs` führen den **Produktions-IPC-Handler und seine Produktions-Workspace-Resolver im Node-VM-Adapter** mit echtem temporärem Dateisystem aus. Deterministischer Zufallswert und nachgebildete Vertrauensprüfung; partielle Schreib-/Rename-Fehler gezielt injiziert, keine globalen fs-Monkeypatches. Fälle: neues/bestehendes Dokument, Kollisionsdatei bei bestehendem oder fehlendem Ziel, Symlink mit Ziel außerhalb des Workspaces (Link und Ziel unverändert), partielle Schreibstörung samt geschlossenem Deskriptor, fehlgeschlagene Ersetzung, fehlende Anmeldung/Freigabe, untrusted Event, Traversal, ungültiger Dateityp und vorhandener Zielordner. Auf Windows kann nur der Symlink-Test bei fehlender Symlink-Berechtigung explizit übersprungen werden; aktueller Linux-Lauf ohne Skip.

Nach Fix: `node --test tests/file-write.test.cjs tests/file-ops.test.cjs` **12/12 grün**; `TMPDIR=/workspace/scratch npm test` **117 bestanden, 0 fehlgeschlagen/übersprungen**. `node --check main.cjs`, Syntax des neuen Tests, `npm run check:catalina`, `git diff --check` bestanden. Keine neue GUI-/echte Electron-IPC-/Windows-/macOS-/Installerprüfung in dieser Backend-Einheit, kein neuer Audit und kein bestätigter aktueller CI-Gesamtstatus. Keine vollständige Sicherheit gegen konkurrierenden bösartigen Austausch von Pfadbestandteilen nach Validierung/Reservierung oder gegen Power-Loss behauptet; diese Race-/Durability-Grenzen bleiben separate Aufgaben.

Nächste drei kleine Finder-Einheiten, jeweils nur auf nächsten Prompt: (1) fremde Änderungen am Dokument zwischen Öffnen und Speichern reproduzieren und einen begrenzten Konflikterkennungs-Vertrag testen; (2) Fehlerpfad des vorhandenen No-overwrite-Umbenennens nach erfolgreichem Hardlink und fehlgeschlagenem Unlink regressionsprüfen, Daten erhalten; (3) Papierkorb-/Restore-Vertrag für den freigegebenen Workspace mit Kollisionen und expliziter Wiederherstellung spezifizieren, noch keine endgültige Löschung. Commit `Preserve foreign temporary paths when Finder save creation fails`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

# Aktueller Checkpoint – P1: profilbezogener Dock-Pinning-Speicher

23. Oktober 2026. Genau eine Micro-Einheit: **P1, profilbezogener Pinning-Speichervertrag**. GitHub-HEAD vor Beginn bestätigt: `970937631ba1dd5ebe8af6593547e1927509de61` auf `fix/air-window-focus-20261023`; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `feat/air-dock-pin-preferences-20261023`. Arbeitsbaum zuvor sauber; main und andere Branches unverändert.

Bestandsprüfung: Classic/Modern verwenden weiterhin feste Dock-Buttons in `index.html`. Vorhandene Preferences speichern Theme/Größe, aber keine Pin-Auswahl; kein vollständiges profilbezogenes Pin/Unpin gefunden. Registry, Launchpad und Installationssynchronisierung bleiben die bestehenden Dienste. Deshalb ausschließlich den bereits geplanten Datenvertrag P1 ergänzen; kein Dock-/Such-/Registry-Umbau.

Implementiert in `src/main/preferences.cjs`: additives `dockPins` im vorhandenen `appearance-v1.json` je Profil, erreichbar über unveränderte authentifizierte Preferences-IPC. `null` bedeutet **Standardbelegung erben**, `[]` eine explizit leere Auswahl; Array-Reihenfolge bleibt erhalten. Höchstens 64 eindeutige String-IDs: Built-in-ID-Form bzw. vorhandene `com.*`-Registry-ID-Form, keine Pfade, URLs, Objekte, Duplikate oder Sparse-Einträge. Arrays werden kopiert. Alte Dateien ohne Feld laden `null`; ungültige gespeicherte Pin-Felder fallen auf `null` zurück, andere gültige Einstellungen bleiben erhalten. Reset setzt nur das betreffende Profil auf Standardwerte zurück.

**Nur Verweise, keine zweite App-Liste:** keine Namen, Icons, Kategorien, Installations- oder Aktivitätszustände speichern. Die Validierung ist syntaktisch und erteilt keine Installations-/Startrechte; eine noch unbekannte/deinstallierte ID ist kein App-Nachweis. P2 muss diese Verweise bei jedem Rendern gegen die **eine vorhandene Registry** auflösen und auf deren Installations-/Deinstallationsereignisse reagieren. Eine noch nicht geladene Registry darf nicht zur automatischen Löschung von Nutzerpräferenzen führen. Die sichtbaren Standard-Dock-Buttons werden von P1 absichtlich noch nicht aus `dockPins` gerendert: **Pin/Unpin-Oberfläche, dynamische Reihenfolge und Drag-and-drop sind weiterhin offen.**

Tests vor Änderung: vier neue Tests rot (Feld fehlt/abgewiesen). Danach `node --test tests/dock-pins.test.cjs` **4/4 grün** und `TMPDIR=/workspace/scratch npm test` **111 bestanden, 0 fehlgeschlagen/übersprungen**. Abgedeckt: geordnete Referenzen, Entfernen eines Verweises, erneute Store-Instanz/Dateipersistenz, Profiltrennung, Array-Kopie, Grenze 64, ungültige/sparse/duplizierte Werte, bytegenau unveränderte Datei bei Ablehnung, leere Auswahl gegenüber `null`, Reset/alte Dateien sowie echte Produktions-IPC-Handler im Node-Adapter mit nachgebildeter Vertrauensprüfung. Syntax von Store/Test, `npm run check:catalina` und `git diff --check` bestanden.

Zusätzlich echte Linux/Electron-32.3.3-/Xvfb-IPC-Prüfung mit aktiver Sandbox und zwei Wegwerfprofilen: **4 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-dock-pins-ipc.cjs`, vorhandenes Playwright, CDP lokal auf Port 9228. Über `window.airOS.preferences` echte Profildatei/ID-Reihenfolge und Reload geprüft; ungültiger Write lässt Dateibytes unverändert; Entfernen/`[]` gespeichert; abgemeldeter Write verweigert; zweites Profil und dessen Reset verändern erste Profildatei nicht. Sichtbares Dock vor/nach direktem IPC-Update identisch, wie für diesen reinen Speicherschritt erwartet. Keine neue Pinning-GUI behauptet.

Grenzen: keine native Windows-/macOS-/Installerprüfung, kein neuer Audit oder bestätigter aktueller CI-Gesamtstatus. Bestehende Release-/Signing-Blocker bleiben. Nächste drei kleine Einheiten: (1) **P2a** vorhandenes Dock aus ID-Verweisen/Registry rendern und fehlende/deinstallierte Einträge sowie Profilwechsel testen, bestehende Standardbelegung bei `null` erhalten; (2) **P2b** eine kleine Pin/Unpin-Bedienung mit bestätigtem Save/Fehler-Retry und Tests; (3) erst danach eine einzelne Reihenfolgeänderung per Drag-and-drop samt Tastaturalternative weiter zerlegen. Commit `Persist validated profile-specific dock pin references`; SHA im Git-Log/Abschlussbericht. Danach stoppen.

---

# Aktueller Checkpoint – wiederholter Fensterfokus korrigiert

23. Oktober 2026. Genau eine Micro-Einheit: **wiederholte interne Fenster-Fokuswechsel korrekt melden**. GitHub-HEAD vor Beginn bestätigt: `a40bb2485ebd6b18a4e62a20cacc8d194f9805d1` auf `feat/air-notes-island-notification-20261023`; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `fix/air-window-focus-20261023`. Kein zweiter Window Manager, keine Änderungen an App Registry, nativen App-Fenstern, Spotify oder Host-APIs.

Bestandsprüfung: `app.js` verwaltet interne DOM-Fenster über `openApps`, Z-Reihenfolge, bestehende Dock-Animationen, Drag-/Resize-Handler und Maximieren/Wiederherstellen. `src/core/app-lifecycle.js` meldet Zustände an den Dock-Beobachter. Installierte Air-Apps besitzen separat isolierte Electron-BrowserWindows; externe Apps werden nur an das OS übergeben. Diese Typen wurden nicht zusammengelegt.

Reproduzierter Fehler: Notes → Rechner → vorhandene Notes. Notes wird korrekt nach vorne gebracht, aber sein zuletzt gemeldeter App-Zustand ist weiterhin `focused`. Die bisherige per-App-Deduplizierung unterdrückt deshalb das neue Ereignis, und der Dock-Beobachter behält den Rechner als aktiv. Vor Fix **zwei neue Node-Regressionstests rot** und vorhandener echter Dock-GUI-Test mit genau diesem Fokusmarker-Fehler **Exit 1**; andere GUI-Prüfgruppen liefen weiter.

Fix ausschließlich im vorhandenen Lifecycle: neben zuletzt gemeldeten per-App-Zuständen wird die zuletzt fokussierte interne App gehalten. Gleicher Zustand **mit erneutem Fokusgewinn nach einer anderen App** löst ein Ereignis aus; identischer Fokus auf die weiterhin aktive App bleibt eine No-op. Minimieren/Schließen/laufender Zustand der aktiven App gibt diese Fokusreferenz frei; Schließen einer Hintergrund-App löscht nicht den Fokus einer anderen App. Kein automatisches Wiederherstellen/Neueröffnen anderer Fenster, kein neues Geometrie-/Fensterzustandsmodell. `get/list` behalten ihre bisherige Bedeutung als zuletzt gemeldete App-Zustände, keine umfassende globale Fensterübersicht daraus ableiten.

Tests nach Fix: `node --test tests/app-lifecycle.test.cjs` **4/4 grün**; `TMPDIR=/workspace/scratch npm test` **107 bestanden, 0 fehlgeschlagen/übersprungen**. Neue Fälle: A→B→A, deduplizierter erneuter A-Fokus, Wiederfokus eines bereits maximierten Fensters, Minimieren/Wiederherstellen, Hintergrund-Schließen und kein unbeabsichtigtes Wiederbeleben minimierter Apps. Syntax aller drei geänderten JS-/Testdateien, `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: nach Reload `node scripts/check-dock-gui.cjs 9227` **10 Prüfgruppen bestanden, Exit 0**, keine ungefangenen Rendererfehler. Der bisher fehlschlagende A/B/A-Pfad ist unverändert enthalten und prüft nun zusätzlich **genau eine** aktive Markierung für Notes. Echte Dock-Mausaktionen, tatsächliche Z-Reihenfolge, Minimieren/Restore, Tastaturaktivierung, Theme-Wechsel/Persistenz und emulierte Breiten 1440/1024/760/600/390px bestanden. Keine Assertion deaktiviert. Das ist ein Nachweis für diesen internen Fenster-/Dock-Pfad, keine allgemeine Native-/Screenreader-/Mehrmonitorabnahme. Keine neue Audit-/Signing-/Release-Freigabe; aktueller CI-Gesamtstatus unbestätigt. Der zuvor dokumentierte konkrete wiederholte Dock-Fokusmarker-Defekt ist damit behoben.

Nächste drei kleine Fenster-Einheiten, nur nach weiterem Prompt: (1) Fokus-Fallback beim Schließen/Minimieren der obersten App zunächst reproduzieren und eine begrenzte Regel testen; (2) vorhandenen Fenstermenü-Restore-Pfad über dieselben bestehenden Fokus-/Animationswege absichern; (3) einen internen Tastatur-Fokuswechsel mit Registry-IDs spezifizieren/testen. Snapping, Vorschauen, Mission Control, persistente Geometrie und virtuelle Arbeitsflächen bleiben getrennte Roadmap-Aufgaben; keine davon in dieser Sitzung implementiert. Commit `Notify repeated internal window focus changes correctly`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

# Aktueller Checkpoint – echte Air-Notes-Mitteilung in der Island

23. Oktober 2026. Genau eine Micro-Einheit: **echte Air-Notes-Speichermitteilung im Island-Panel**. Ausgangs-HEAD `c35f31df9f17b5dba4bf4ca666ea98eb58ee36ab` auf `feat/air-control-center-dock-theme-20261023` per GitHub-Ref bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `feat/air-notes-island-notification-20261023`. main und andere Branches unverändert. Keine Abhängigkeit oder Host-Schnittstelle ergänzt.

Bestandsprüfung: Air Music verwendet AmplitudeJS und echte lokal ausgewählte Audiodateien mit Play/Pause-/Zeitereignissen; seine Metadaten stammen teils aus Dateinamen, Playlists weiterhin aus globalem localStorage. Kein allgemeiner Musik-/Notification-Service gefunden; vorhandene Toasts sind kurzlebige Statusanzeigen. Air Erinnerungen hat echte profilbezogene Aufgaben, aber keine verlässlich terminierten Benachrichtigungen. Daher ausschließlich eine bestätigte Notes-Aktion integrieren statt Wiedergabe oder Fälligkeit zu erfinden. Spotify/Visualizer/Systemaudio unverändert.

`air-notes.js` sendet nach erfolgreichem `await api.save()` das feste lokale Signal `air-notes-saved` **ohne Payload**. Bei fehlgeschlagenem oder noch laufendem Save kein Erfolgssignal. Die Island zeigt genau **eine letzte Mitteilung** mit App-Name, festem Erfolgstext und lokal formatiertem Empfangszeitpunkt an; wiederholtes Speichern ersetzt den Zeitpunkt, keine Historie. Notiztitel, Inhalt und ID werden nicht übertragen oder in der Mitteilung gespeichert. Panel und Fokus werden nicht automatisch verändert. Sichtbare Darstellung per `textContent`, keine HTML-Übernahme.

Nur aktuelles Dokument: keine Datenbank/LocalStorage/Übertragung/OS-Notification für Mitteilungen. Listener und Anzeige werden bei `pagehide` entfernt/geleert; neue Dokumente nach Reload/Profilwechsel beginnen leer. Dieses interne DOM-Signal zwischen mitgelieferten Komponenten ist **kein Berechtigungs- oder Herkunftsnachweis für beliebige Apps**. Keine allgemeine App-Notification-API, Read/Unread-, Lösch-/Ruhemodus- oder Berechtigungsschicht behauptet; weitere Quellen benötigen ein eigenes begrenztes Konzept.

Tests: `TMPDIR=/workspace/scratch npm test` **105 bestanden, 0 fehlgeschlagen/übersprungen**. Zwei neue Produktions-Notes-Controller-Tests mit nachgebildeter Notes-API prüfen ausstehende Bestätigung, Doppelklick, Fehler/Retry und payloadfreies Signal. Zusätzlicher Island-Test prüft feste Meldung trotz unerwartetem Payload, neuesten Zeitpunkt, geschlossenen Zustand/Fokus sowie Cleanup und frisches Dokument. Syntax aller geänderten JS-/Testdateien, `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: **6 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-notes-notification-gui.cjs`, vorhandenes Playwright, CDP nur lokal auf Port 9226. Reale Notes-Speicherung → sichtbare Mitteilung/Zeitstempel ohne privaten Titel/Inhalt und ohne automatisches Panel/Fokus; erneuter Save bleibt bei einer Meldung; emulierte 760/390px-Ansichten; Reload leert die Meldung bei weiter vorhandener gespeicherter Notiz; zweites tatsächlich angelegtes Profil erhält weder fremde Notiz noch Mitteilung. Finale 390px-Ansicht visuell geprüft; Artefakte unter ignoriertem `dist/notes-notice-*.png`. Fehlgeschlagene Saves sind im Node-Test simuliert; keine künstlichen GUI-Fehler als echte OS-Befunde ausgegeben.

Grenzen: keine native Windows-/macOS-/Screenreader-/Installerprüfung und keine neue Security-/Release-Freigabe. Aktuelle CI nicht bestätigt; bekannte Audit-/Signing-/Dock-Fokusmarker-Blocker bleiben offen. Nächste drei mögliche kleine Einheiten nur nach Nutzerprompt: (1) Berechtigungs-/Quellenvertrag für weitere App-Mitteilungen festlegen; (2) begrenzte profilbezogene Mitteilungsliste/Gelesen-Zustände als getrennten Datenvertrag testen; (3) echten lokalen Air-Music-Zustand für eine spätere reine Titelanzeige testen. Vollständige Mediensteuerung und Visualizer bleiben später. Commit `Show acknowledged Air Notes saves in Island panel`; SHA im Git-Log/Abschlussbericht. Nach Sicherung beenden.

---

# Aktueller Checkpoint – Kontrollzentrum: genau eine Dock-Theme-Kachel

23. Oktober 2026. Genau eine Micro-Einheit: **Dock-Theme-Kachel im Kontrollzentrum**. GitHub-Stand vor Beginn geprüft: Island-Basis `f5cdcace6a95c89e1c9fa95eb9dfc149082f865b`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`, main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `feat/air-control-center-dock-theme-20261023`; main/andere Branches unverändert. Keine Bloom-Quellen/Assets, keine neue Abhängigkeit, keine weiteren Kacheln.

Die Island-Region heißt nun Kontrollzentrum und enthält **genau einen** echten Toggle „Modernes Dock“ mit sichtbarem Classic-/Modern-Wert, `aria-pressed`, Fokusmarkierung, Busy-/Unavailable-Zustand und Statusmeldung. Zweispaltiges Grid mit einer belegten Kachel, keine funktionslosen Host-Platzhalter. Bestehende Reduced-Motion-Regeln gelten weiterhin. WLAN, Bluetooth, Host-Helligkeit/-Lautstärke, Batterie und andere Host-Funktionen werden weder angesprochen noch als geändert ausgegeben.

`persistAirDockTheme()` nutzt vorhandene `airSettingsLoad`/`airSettingsWrites`, authentifizierte `airOS.preferences.update` und unveränderten profilbezogenen Main-Store. Die Kachel schaltet das Dock **erst nach erfolgreicher Speicherung** über `applyAirSettings` um. Fehler werden verständlich gemeldet, der alte Zustand bleibt erhalten, Retry bleibt möglich. Wiederholte Aktivierung während einer laufenden Anfrage wird abgefangen. Kein zweiter Store/LocalStorage-Fallback für die Kachel. Über `air-settings-changed` und das bestehende Settings-Select wird derselbe Wert in beide Richtungen dargestellt; externe Änderungen löschen einen veralteten Erfolgshinweis. Fehlende Preferences führen zu einem erklärten deaktivierten Zustand.

Tests: `TMPDIR=/workspace/scratch npm test` **102 bestanden, 0 fehlgeschlagen/übersprungen**. Drei zusätzliche Tests im bestehenden Island-Harness: bestätigte Saves/Doppelklick/externes Update; Fehler/Retry/Unavailable; echter persistierender Preferences-Store mit Produktions-Saveadapter, neu erzeugtem Store nach Save, Profiltrennung, ungültigem Theme und simuliertem IO-Fehler. Syntax von `app.js`, `air-island.js`, Test sowie `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: **6 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-control-gui.cjs`, vorhandenes Playwright, CDP nur lokal auf Port 9225. Reale Kachel-/Enter-Aktivierung, Dock-CSS und vorhandenes Settings-Select, JSON-Profildatei nach erfolgreichem Save, Wiederherstellung nach Renderer-Reload, Änderungen aus Settings zurück zur Kachel, Fokus und Escape geprüft. Panel/Kachel bei emulierten 760/390px innerhalb des Viewports; finale 390px-Ansicht visuell betrachtet (`dist/control-center-390.png`, ignoriertes Artefakt). Native Windows/macOS, vollständiger Electron-Neustart und reale Fehler der GUI-Dateisystemschicht nicht in diesem Lauf geprüft; Store-Neustart/Fehlerfälle sind Node-Tests. Aktuelle CI nicht bestätigt; bekannte Audit-/Signing-/Dock-Fokusmarker-Blocker bleiben offen.

Nächste drei mögliche kleine Einheiten, nur auf nächsten Nutzerprompt: (1) genau eine weitere vorhandene Darstellungseinstellung als Kachel, etwa reduzierte Animationen; (2) Capability-/Unavailable-Vertrag für einen Host-Status ohne Scheinsteuerung; (3) danach genau eine belegte Statusquelle auf einer realen Zielplattform prüfen. Keine weiteren Kacheln automatisch entwickeln. Commit `Connect Control Center dock tile to persistent profile settings`; SHA im Git-Log/Abschlussbericht.

---

# Aktueller Checkpoint – Dynamic-Island-Grundelement

22. Oktober 2026. Genau eine Micro-Einheit: **Dynamic-Island-Grundelement**. Bestätigte Ausgangsbasis `335e0aceeb99c2b92662ed2e48d38262cc4005df` auf `test/air-modern-dock-gui-20261022`; PR #11 weiterhin `eecab2a043fc62ab0802312aa09ce29dfd96c280`, main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `feat/air-dynamic-island-base-20261022`. Keine fremden Branches geändert, keine Bloom-Quellen/Assets oder neue Abhängigkeiten übernommen. Bestehende Release-/Audit-Blocker und der bekannte Dock-Fokusmarker-Fehler bleiben offen; Ausgangsstand ist keine Release-Freigabe.

Implementiert: `air-island.js/.css`, Einbindung in `index.html` und Installer-Dateiliste. Schwarze kompakte Pille mittig unter der Menüleiste, echte lokale Uhrzeit mit vorhandener `clock24`-Einstellung, unmittelbar aktualisiert über ein schlankes `air-settings-changed`-Event aus `applyAirSettings`. Keine neue Einstellung oder paralleler Store. Timer pausiert bei verborgenem Dokument, Listener/Timer werden bei Seitenende entfernt. Uhrzeit ist auch im zugänglichen Buttonnamen enthalten, ohne laufende Live-Ansagen.

Panel ist eine einfache benannte, **nicht modale** Region ohne Systemsteuerungen. Maus/Enter/Leertaste öffnen; Schließen/Escape geben Fokus an die Pille zurück. Tab/Fokuswechsel und Außenklick schließen ohne Fokusdiebstahl und ohne Klickblockade für das Ziel außerhalb. Kein globales Tastenkürzel oder Fokus-Trap. Die kompakte Island erhält einen reservierten 62px-Bereich oberhalb interner Fenster und Desktop-Symbole; eine begrenzte Fenster-Ebene oberhalb der Desktop-Symbole und unterhalb der Island verhindert, dass Symbole Fensterknöpfe abfangen oder Fenster die Island verdecken. Maximierte Fenster nutzen den vorhandenen Fenster-Host. Das geöffnete Panel darf lokal über Inhalt liegen, bleibt aber per Escape/Schließen/Außenklick verlassbar; kein Vollbild-Overlay. Responsive Breite, begrenzte scrollbare Panelhöhe und reduzierte Animationen über vorhandene Air-OS-Klasse sowie OS-Media-Query.

Tests: `TMPDIR=/workspace/scratch npm test` **99 bestanden, 0 fehlgeschlagen/übersprungen** (drei neue Tests: Uhrformat/Tick/Visibility/Cleanup; Panel/Fokus/Dismissal; Desktop-/Installer-Einbindung). Syntax von Island, App und Test sowie `npm run check:catalina` und `git diff --check` bestanden.

Zusätzlich echter **Electron 32.3.3/Linux/Xvfb-GUI-Test**, aktiver Namespace-/Renderer-Sandbox, separates Wegwerfprofil, CDP nur lokal auf Port 9224. Ausgeführt mit dem lokalen Playwright-Helfer `/workspace/.air-os-onboarding/check-island-gui.cjs` aus der vorhandenen Umgebung, keine neue Projektabhängigkeit: **8 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Getestet: Maus/Enter/Space, Escape-/Schließen-Fokusrückgabe, Tab-Dismissal, Außenklick bis zum App-Start, unmittelbarer 12-/24h-Wechsel über echte Settings, Air-OS- und OS-Reduced-Motion sowie zentrierte Pille/Panel und erreichbare maximierte Fensterleiste bei emulierten Renderergrößen 1440×900, 760×540 und 390×600. Screenshot der finalen 390px-Ansicht visuell betrachtet; lokale Bilder unter ignoriertem `dist/island-*.png`. Erste zusätzliche Ebenenprüfung fand eine Kollision mit Desktop-Symbolen; Fenster-Ebene angepasst, vollständiger abschließender GUI-Lauf grün.

Grenzen: Renderergrößen sind emuliert; native Mindestfensterbreite bleibt 760px. Keine neuen nativen Windows-/macOS-/DPI-/Mehrmonitor-/Screenreader-/Installerprüfungen. Aktuelle CI nicht bestätigt, historischer API-Zugriff Forbidden; keine neue Audit-/Release-Freigabe. Bekannter Dock-GUI-Fokusmarker-Test wurde in dieser Island-Einheit nicht repariert oder erneut als grün ausgegeben. Noch keine Statusdaten, Mediensteuerung, Benachrichtigungen, Kalender oder Timer in der Island.

Nächste drei kleine Einheiten: **Q1** einfaches Kontrollzentrum ausschließlich an vorhandene Air-OS-Darstellungseinstellungen anbinden (inklusive Speicherfehler/Profilpersistenz); danach **M1** echtes lokales Air-Music-Zustandsmodell testen; danach **B1** Capability-/Unavailable-Vertrag für spätere Statusanzeigen festlegen. Jede Einheit separat; kein automatischer Beginn. Frühere Pinning-/Drag-and-drop-Pläne und der offene Dock-Marker bleiben erhalten. Commit `Add accessible Air Island base with local clock and panel`; SHA im Git-Log/Abschlussbericht.

---

# Aktueller Checkpoint – Floating-Dock-GUI geprüft, eine CSS-Korrektur

Stand 22. Oktober 2026. Micro-Einheit U1, Ausgangscommit `b45003159fa2607be177289c0959e8b4d6ce11e4` (Roadmap), darunter Entwicklungsbasis PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Zu Sitzungsbeginn und vor Sicherung Remote-HEAD prüfen; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 unverändert. Eigener Branch `test/air-modern-dock-gui-20261022`; keine andere Entwicklung beschrieben oder überschrieben. Kein Dock-Neubau, kein Pinning, keine Dynamic Island, keine Bloom-Quellen/Assets übernommen.

## Echte Electron-GUI statt DOM-Simulation

Electron 32.3.3 auf Linux/Xvfb, aktiver Namespace-/Renderer-Sandbox, separates nichtproduktives Profil außerhalb des Checkouts. Start über `/workspace/.air-os-onboarding/start-desktop.sh` mit `AIR_OS_CONFIG_HOME=/workspace/.air-os-onboarding/dock-gui-profile`, CDP ausschließlich lokal auf Port 9223. Start benötigt `exec_command` mit `sandbox_permissions=require_escalated`, da die Dateisystem-Sandbox User-Namespaces blockiert; kein `--no-sandbox`. Vorhandene Linux-D-Bus-Diagnostik verhinderte den Test nicht. Anmeldung mit temporär generiertem Testpasswort; keine Zugangsdaten im Test/Repository gespeichert.

Reproduzierbarer Opt-in-Test: `node scripts/check-dock-gui.cjs [port]`, Node >=22 und bereits angemeldetes **Wegwerfprofil** erforderlich. Keine neue Abhängigkeit. Der Test schließt bestehende Notes-/Rechner-Testfenster, verändert nur Testansichten und Darstellungseinstellungen und stellt ursprüngliche Preferences/Viewport am Ende wieder her. Er verwendet reale gerenderte CSS-Werte, CDP-Maus-/Tastaturereignisse und echte Preferences-IPC; keine nachgebildete Renderer-Implementierung. Screenshots unter dem ignorierten `dist/dock-gui/`.

Geprüft: Classic→Modern→Classic→Modern über den gerenderten Einstellungs-Handler, Start von Notes/Rechner, tatsächliche Z-Reihenfolge, Minimieren und Dock-Wiederherstellen, laufende Markierung, Enter-Aktivierung und automatisches Fokusscrollen bis zum letzten Dock-Eintrag, gespeichertes Theme. Modern liegt unten mittig mit 12px Abstand und horizontalem Overflow bei Rendererbreiten 1440/1024/760/600/390. **Alle Breiten wurden per CDP emuliert**, kein Nachweis physischer Bildschirm-/DPI-/Mehrmonitorgrößen; das native Hauptfenster hat weiterhin mindestens 760px Breite. Screenshots von Classic und Modern, insbesondere Modern/760px mit sichtbarer aktiver Notes-Markierung, wurden visuell betrachtet.

## Genau ein behobener Fehler

`styles.css` setzt `.dock-app` auf `background: transparent !important`. Dadurch verlor die Modern-Regel `.dock-app.is-active` ihren vorgesehenen Hintergrund trotz korrekter Klasse. `air-modern-dock.css` setzt nun **nur für diese aktive Modern-Regel** die bestehende Hintergrundfarbe ebenfalls mit `!important`. Kein Wert-/Layoutumbau; Classic bleibt unverändert. Der neue GUI-Test schlug vor dem Fix an der transparenten aktiven Fläche fehl; nach Reload bestand genau diese Prüfung.

## Testergebnis und offener zweiter Befund

- `TMPDIR=/workspace/scratch npm test`: **96 bestanden, 0 fehlgeschlagen/übersprungen**.
- `node --check scripts/check-dock-gui.cjs`, `npm run check:catalina`, `git diff --check`: bestanden.
- Finaler echter GUI-Lauf: **9 erfolgreiche Prüfgruppen, 1 offener Befund, Exitcode 1**. Kein vollständig grüner GUI-Lauf behauptet.
- Offener Befund: Notes öffnen → Rechner öffnen → vorhandene Notes über Dock fokussieren. Notes liegt korrekt oben, die aktive Dock-Klasse kann jedoch beim Rechner bleiben. Der Lifecycle unterdrückt identische `focused`-Übergänge pro App, obwohl ein anderer App-Fokus die UI-Markierung inzwischen verändert hat. Der Test meldet dies vor Minimieren/Wiederherstellen ausdrücklich. Diese zweite Fehlerkorrektur wurde wegen der Nutzergrenze **höchstens ein Fehler** nicht begonnen; keine Assertion entfernt/übersprungen.
- Keine native Windows-/macOS-/DPI-/Installerprüfung, kein neuer Audit, kein kompletter Accessibility-/Performance-Nachweis. Aktueller CI-Gesamtstatus nicht bestätigt; bekannter Audit-/Release-Blocker bleibt offen.

Nächste Dock-Einheit gemäß Nutzerwunsch: **P1, profilbezogenen Pinning-Datenvertrag mit Registry-IDs und Store-Tests ergänzen**, noch keine Sortieroberfläche. Danach **P2**, bestehendes Dock damit rendern/Pin-Unpin anbieten; danach Drag-and-drop-Reihenfolge als eigene Einheit. Den offenen Fokusmarker-Defekt vor einer Dock-Freigabe separat beheben. Commit `Check Air Modern dock in Electron and fix active background`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

# Aktueller Checkpoint – Air-OS Ultimate Bestandsaufnahme und Roadmap

Stand 22. Oktober 2026. **Genau eine Dokumentationseinheit**, keine Produktimplementierung. Ausgangs-HEAD von PR #11 und `feat/air-os-architecture-foundation`: `eecab2a043fc62ab0802312aa09ce29dfd96c280`; GitHub `main`: `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `docs/air-os-ultimate-roadmap-20261022`; PR #11 weiterhin Draft laut öffentlicher GitHub-Seite. Keine neueren Commits auf den abgefragten Entwicklungsrefs. main, PR #11 und andere PRs unverändert.

Neu: [AIR_OS_ULTIMATE_ROADMAP.md](AIR_OS_ULTIMATE_ROADMAP.md) mit quellbasierter Bestandsaufnahme, umgesetzten/teilweisen/fehlenden Funktionen, eigenständigen Bloom-Prinzipien, Plattformmatrix, Release-Blockern und einzeln abnehmbaren Micro-Einheiten. Bloom-Referenz `8b3d5dcdcbadc1490c2824ccec01e818b7a0233c`; GPL-3.0-only bestätigt, keine Quellen/Assets übernommen. Vorhandene Registry, Lifecycle, Finder, Spotlight, Launchpad, Runtime, lokaler Demo-Store, Spotify und Modern-Dock ausdrücklich berücksichtigt; ältere Dokumentaussagen nicht als aktuellen Stand übernommen.

Tatsächlich geprüft: `TMPDIR=/workspace/scratch npm test` **96/96 bestanden, 0 fehlgeschlagen/übersprungen**; Syntax aller Root-JS-Dateien, Main/Preload, `src/core/*.js`, `src/main/*.cjs`, `scripts/*.cjs` und `npm run check:catalina` bestanden. Dokumentationsdiff und lokale Markdown-Verweise separat vor Commit geprüft. Keine neuen GUI-/Windows-/macOS-/Audit-/Buildtests. GitHub-API für PR/CI liefert Forbidden; aktueller CI-Gesamtstatus unbekannt. Historische Audit-/Signing-/Plattformblocker gelten weiter. Bestehende globale Kalender-/AirWrite-/Musikdaten benötigen Profilwechselprüfung; keine Migration in dieser Sitzung.

Nächste drei kleine Einheiten: **S1** Legacy-Audit reproduzieren; **D1** Kalender-Daten und Profilwechsel prüfen; **U1** vorhandenes Dock real in Electron validieren. Früherer ChatGPT-Wunsch bleibt als **C1/C2** erhalten und kann per nächstem Nutzerprompt priorisiert werden. Keine Folgeaufgabe automatisch starten. Neuer Commit: `Document verified Air-OS Ultimate inventory and micro-roadmap`; exakter SHA im Git-Log/Abschlussbericht, da der Commit seinen eigenen Hash nicht vorwegnehmen kann.

---

# Aktueller Checkpoint – Spotify-Startmechanismen getestet, 22. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11 (offen/Draft). Letzter bestätigter GitHub-Checkpoint `05d132df03da2990dc91897d4a57938db9f9bc50`; sauberer Arbeitsbaum vor Beginn. Neuer Checkpoint: `Test Spotify desktop launch contracts and UI routing` (SHA im Abschlussbericht/Git-Log). main und andere PRs unverändert.

Genau eine Testeinheit; keine Änderung des Launchers oder Designs. Geändert: tests/spotify-launcher.test.cjs und beide Fortschrittsdateien. Vier neue Regressionstests mit synthetischen OS-Antworten: regulärer Windows-Pfad, WindowsApps-Pfad, macOS-Benutzerbundle; wiederholte Startanforderung; Ablehnung nicht unterstützter Store-Aktivierungskennungen; Zugriffsfehler ohne Start und anschließender Retry; vorhandene Dock-/Launchpad-Klickpfade bis zur nativen Bridge mit Erfolg und verständlicher Nicht-installiert-Meldung. Registry und moderne CSS-Einbindung bleiben vorhanden. Die UI-Routen werden im Node-VM-Harness ausgeführt, nicht in einem gerenderten Electron-Fenster.

Tests: `node --test tests/spotify-launcher.test.cjs tests/app-registry.test.cjs tests/launchpad.test.cjs` → 17/17 bestanden, 0 fehlgeschlagen/übersprungen. Syntaxprüfung des Tests und git diff --check bestanden. Bestehende Tests decken Parallelklicks, IPC-Authentifizierung, parameterlose Bridge und Ablehnung gefährlicher Pfade ab.

Tatsächliche Umgebung: Linux/Node. Keine echte Windows-, Microsoft-Store- oder macOS-Installation getestet; keine native Spotify-Sitzung vorhanden. Die WindowsApps-Pfade sind bewusst synthetische Fixtures, keine beobachteten Handler-Pfade. Ein zweiter erfolgreicher Aufruf beweist nur eine weitere OS-Übergabe, keine Aktivierung oder Prozess-/Fenstererkennung. Dock-Theme-Darstellung wurde nicht visuell geprüft.

Mechanismen unverändert: getApplicationInfoForProtocol('spotify://') zur lokalen Handler-Auflösung, anschließend shell.openPath für den validierten lokalen Pfad. Offizielle API-Referenzen: https://www.electronjs.org/docs/latest/api/app#getapplicationinfoforprotocolurl und https://www.electronjs.org/docs/latest/api/shell#shellopenpathpath . Keine Browserweiterleitung, Web-Einbettung oder neue Prozessabfrage. Diese APIs liefern keinen Nachweis, dass jeder Spotify-Store-Handler unterstützt wird.

Offen: echte Plattformtests für alle sieben Nutzerszenarien; Store-Handler ohne unterstützten Dateipfad werden kontrolliert abgewiesen. Dateisystemfehler (z.B. EACCES beim Auflösen eines Store-Pfads) werden derzeit unverändert weitergereicht und können technisch statt benutzerfreundlich wirken; separat normalisieren. Kein Hersteller-Signaturnachweis; OS-Zuordnung bleibt Vertrauensbasis.

CI der Ausgangsbasis: Installer 39812878973 erfolgreich, Security 39812878872 fehlgeschlagen; Ursache in dieser Testeinheit nicht neu untersucht. Kein grüner Gesamt-CI-Status behauptet; neue CI nach Checkpoint separat prüfen.

Nächste drei kleine Einheiten:
1. ChatGPT-Desktop-Launcher: offizielle lokale Startmechanismen prüfen, vorhandene Registry/Launchpad/Dock verwenden; kein Browserfallback. Erst nächste Sitzung implementieren.
2. Spotify-Dateisystemfehler in verständliche Fehlermeldungen übersetzen und gezielt testen.
3. Echter Spotify-Smoke-Test auf Windows (Standard/Store) und macOS, einschließlich bereits laufender App und Air-Modern-Dock.

---

# Aktueller Checkpoint – Air Modern Dock, 22. Oktober 2026

Gesicherte Ausgangsbasis: `3d3c5759c0200d12e2cc717f71cc6e6734245d5b`. Branch `feat/air-os-architecture-foundation`, PR #11. Neuer Checkpoint: `Add opt-in Air Modern floating dock theme` (SHA im Git-Log/Abschlussbericht). main und andere PRs unverändert.

Genau eine Aufgabe: zusätzliches Floating-Dock-Theme. Unter Einstellungen → Dock-Design zwischen Air Classic (Standard) und Air Modern wechseln. Die vorhandene Preferences-Verwaltung speichert die Auswahl profilbezogen; Reset setzt Classic zurück. Modern verwendet dieselben Dock-Buttons und Start-Handler, zeigt vorhandene Laufstatus-Markierungen und ergänzt eine aktive Markierung aus dem vorhandenen Lifecycle. Kompakte dunkle Glasoberfläche, begrenzte Breite, horizontales Scrollen bei vielen Apps, Tastatur-Fokus und reduzierte Bewegung/Glaseffekte. Keine zweite Registry, keine neuen App-Integrationen.

Geändert: app.js, index.html, package.json, src/main/preferences.cjs, tests/preferences.test.cjs; neu air-modern-dock.css; beide Fortschrittsdateien. Stylesheet in Electron-Paketdateiliste aufgenommen.

Tests: 6/6 Preferences-/Lifecycle-/Launchpad-Tests bestanden, keine übersprungen. Neuer Regressionstest prüft Theme-Standard, Persistenz nach Neustart, Benutzertrennung, ungültige Werte und Reset. Syntaxprüfung und git diff --check bestanden. Keine visuelle oder native Windows/macOS-Prüfung: Playwright installiert, Chromium-Binärdatei fehlt. Kein Browserdownload im Micro-Schritt. Responsives Layout, Scrollen und Fokus müssen noch visuell geprüft werden. Die erwähnten Screenshots waren hier nicht verfügbar; Umsetzung basiert auf der Textbeschreibung.

GitHub meldete für die Ausgangsbasis keine PR-Workflow-Runs über die verfügbare Abfrage; daraus folgt kein grüner CI-Status. Bekannter vorheriger Security-/Audit-Blocker bleibt offen. Spotify behält seinen nativen Launcher ohne erfundenen Laufstatus; ChatGPT und dynamisches Dock-Pinning bleiben offen.

Nächste drei kleine Einheiten:
1. Visueller Dock-Smoke-Test unter Electron: Classic/Modern, schmale Displays, Tastatur, App-Start, Minimieren/Wiederherstellen und reduzierte Bewegung.
2. Separate Dynamic-Island-Komponente mit echter Uhrzeit, Tastaturbedienung und kollisionsarmer Positionierung.
3. Kontrollzentrum mit vorhandenen persistenten Air-OS-Einstellungen verbinden; Host-Funktionen ohne Schnittstelle ausdrücklich nicht verfügbar anzeigen. Medienansicht später nur mit unterstützter API.

---

# Aktueller Checkpoint – nativer Spotify-Launcher, 22. Oktober 2026

Ausgangs-Commit `3a6d12a8cbb817fa0a8ecacd858ff15dba7c9652`, Branch `feat/air-os-architecture-foundation`, PR #11. Arbeitsbaum sauber und GitHub-HEAD bestätigt. Einheit: `Launch installed Spotify desktop client without browser fallback`; SHA im Abschlussbericht/Git-Log. Ausgangs-Installer 39810291064 erfolgreich; Security 39810291093 fehlgeschlagen. Neue CI gesondert prüfen. main und andere PRs unverändert.

## Genau eine Teilaufgabe

Vorhandene Spotify-Registry, Icon, Launchpad und statischer Dock-Eintrag wiederverwendet. openApp('spotify') ruft jetzt eine parameterlose Preload-Bridge auf. Main prüft bestehende requirePreferenceUser-Authentifizierung/vertrauenswürdigen IPC-Absender und startet den nativen Launcher. Keine URL/Pfadübergabe vom Renderer.

Der Launcher ermittelt über Electron getApplicationInfoForProtocol('spotify://') ausschließlich den registrierten lokalen App-Pfad, prüft absoluten/normalisierten Pfad und kanonisches Ziel, erwartet Spotify.exe als Datei unter Windows bzw. Spotify.app als Verzeichnis unter macOS und übergibt diesen lokalen Pfad an shell.openPath. Keine HTTP-URL, kein openExternal, keine Shell-Kommandointerpretation. Fehlende/fremde Zuordnung schlägt mit Hinweis fehl. Gleichzeitige Starts teilen eine laufende Anfrage; späterer Retry ist möglich. Das OS bzw. der Client entscheidet über Aktivierung/Wiederverwendung eines vorhandenen Fensters.

Der alte Web-Player-Button und Demo-Tracks wurden entfernt. Es wird kein Air-OS-Scheinfenster erzeugt und kein Prozessstatus behauptet. launchRequested bedeutet nur erfolgreiche OS-Übergabe. Spotify verwaltet Anmeldung, Musik und sein eigenes Fenster. Die native App wird nicht mitgeliefert.

## Recherche und Entscheidung

- Spotify Web Playback SDK: https://developer.spotify.com/documentation/web-playback-sdk — Browser-/Encrypted-Media-Anforderungen; zuverlässige Unterstützung der offiziellen Oberfläche im vorhandenen Electron-32-Build nicht belegt. Daher keine Einbettung oder DRM-Manipulation.
- Spotify Web Player: https://support.spotify.com/us/article/web-player-help/ — Browser-/Widevine-Anforderungen.
- Bedingungen: https://www.spotify.com/legal — Nutzung/Account bleibt beim offiziellen Client; keine Lizenz zur Wiederverteilung oder Markenfreigabe daraus ableiten. Bestehendes Projekt-Icon wurde nicht neu gestaltet; Marken-/Veröffentlichungsprüfung bleibt vor öffentlichem Release offen. Dies ist keine pauschale rechtliche Freigabe einer Spotify-Integration.
- Electron API: https://www.electronjs.org/docs/latest/api/app#getapplicationinfoforprotocolurl und https://www.electronjs.org/docs/latest/api/shell — OS-App-Auflösung und lokales Öffnen.
- ChatGPT: https://learn.chatgpt.com/docs/app — offizielle Desktop-App dokumentiert. Keine verifizierte Zusage zur Drittanbieter-Electron-Einbettung gefunden; nächste Integration bevorzugt installierten Client. Keine API-Nutzung, Schlüssel oder Login-Eingriffe in dieser Einheit.

## Tests und Grenzen

13/13 gezielte Tests (spotify-launcher, app-registry, launchpad) bestanden, keine übersprungen. Abgedeckt: Windows/macOS-Pfadübergabe, Parallelklicks, Retry, URL-/Browser-/UNC-/Traversal-/Nullbyte-Ablehnung, fehlender Client, kanonisch abweichendes Ziel, OS-/Startfehler, Renderer-Routing, authentifizierte IPC und parameterlose Preload-Bridge, Installer-Dateiliste. Syntaxchecks von Main, Preload, App, Enhancements und Launcher; check:catalina und git diff --check bestanden.

Native APIs werden in Tests nachgebildet; kein tatsächlicher Windows/macOS-Start oder Login nachgewiesen. OS-Protokollzuordnung ist Vertrauensbasis, Dateiname/Pfad ist kein Herausgeber-Signaturnachweis. Unbekannte Windows-Store-Alias-Pfade oder anders benannte Bundles werden abgewiesen; Kompatibilität real prüfen. Keine Prozess-/Fenstererkennung, kein externes Minimieren/Schließen, kein dynamisches Anheften in dieser Einheit. Spotify ist bereits statisch im Dock. Benutzeranpassbares Pinning ist noch offen. Bestehender Audit-/Legacy-Blocker bleibt.

Geändert: main.cjs, preload.cjs, app.js, air-os-enhancements.js, package.json; neu src/main/spotify-launcher.cjs und tests/spotify-launcher.test.cjs; beide Fortschrittsdokumente.

## Nächste drei kleine Einheiten

1. Spotify-Desktop-Smoke-Test auf Windows (Installer/Store) und macOS; tatsächliche Handler-Pfade, bereits laufenden Client und Fehlerzustände prüfen.
2. Persistentes profilbezogenes Dock-Pinning über bestehende Registry/Preferences gezielt ergänzen; externe Laufstatus-Erkennung separat spezifizieren.
3. Offizielle ChatGPT-Desktop-Installation/Startmechanismen prüfen und parameterlosen nativen Launcher mit Registry-Eintrag implementieren; keine Anmeldung einbetten. API-Alternative später nur mit eigenem sicher gespeichertem Benutzerschlüssel, kein ChatGPT-Abo als API-Zugang.

---

# Aktueller Checkpoint – Teil 6: temporäre Installationsreste, 22. Oktober 2026

- Gesicherte Ausgangsbasis: `2c5c72b3ded7863ef231bc2133f6c499d9d7d5c2`; Branch `feat/air-os-architecture-foundation`, PR #11 offen. GitHub-HEAD und sauberer Arbeitsbaum bestätigt; vor Push erneut abgleichen und expected_sha verwenden.
- Diese Einheit: `Protect existing Air App staging paths from reuse and cleanup`; SHA im Abschlussbericht/Git-Log.
- Ausgangs-CI: Desktop [39654876570](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39654876570) erfolgreich; Security [39654876790](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39654876790) fehlgeschlagen. Keine erneute Auditdiagnose; neue Commit-CI separat prüfen.

## Genau eine Absicherung

Die bisherige rekursive Anlage von .install-<Zufallswert> konnte einen bestehenden Ordner oder Ordner-Symlink wiederverwenden. Ein späterer Schreibfehler führte in den finally-Cleanup dieses fremden Pfades. Die Anlage erfolgt nun exklusiv, ohne recursive. Bei EEXIST wird vor Eintritt in die Schreib-/Cleanup-Logik eine verständliche Meldung ausgegeben: Dateien bleiben erhalten, erneuten Versuch starten. Andere Dateisystemfehler werden weitergereicht.

Zurückgebliebene .install-Verzeichnisse werden weder pauschal gelöscht noch als installierte Apps übernommen. Ein späterer Versuch verwendet einen neuen zufälligen Pfad und das vollständig signatur-/hashgeprüfte Katalogpaket. Bestehende Recovery nach dem finalen Rename bleibt erhalten. Keine Änderung von Registry, Store, Runtime, Signaturprüfung oder Plattformfreigaben.

## Tests

Fünf neue Fälle in der bestehenden signierten Recovery-Fixture: unvollständiger Rest, beschädigter Rest, Kollision mit Ordner, Datei und Symlink. Byte-Snapshots prüfen erhaltene Dateien; Wiederholungsversuche und bereits funktionierende Installation werden geprüft. Vor Fix drei Kollisionsfälle rot, danach alle grün. Keine unvollständigen Einträge im Installationsindex; bestehende Registry-/Launchpad-Integrationstests ebenfalls grün.

Gezielter Lauf: `node --test tests/airapp-install-recovery.test.cjs tests/airapp-package.test.cjs tests/app-registry.test.cjs tests/launchpad.test.cjs` mit Workspace-TMPDIR: **23/23 bestanden**, keine übersprungen. Syntaxprüfungen von Manager und Testdatei sowie git diff --check bestanden.

Geändert: `src/main/airapp-manager.cjs`, `tests/airapp-install-recovery.test.cjs`, beide Fortschrittsdokumente. main und andere PRs unverändert; keine parallele Entwicklung.

## Grenzen und nächste drei kleine Aufgaben

Keine automatische Rettung/Bereinigung alter temporärer Verzeichnisse, kein Power-Loss-/GUI-Test. Die Änderung schützt gegen bereits vorhandene Zielpfade; konkurrierender Austausch nach erfolgreicher Ordneranlage bleibt eine separate Race-Grenze. Audit/Legacy-Electron sowie echte Windows/macOS-Tests bleiben offen.

1. Store-Integrationstest für temporären Namenskonflikt: Meldung sichtbar, keine Registry-Kachel, Retry erfolgreich.
2. Echten Windows/macOS-Smoke-Test für abgebrochene Installation und Wiederholungsversuch durchführen.
3. Datenbewahrende Diagnose vorhandener Installationsreste spezifizieren; keine automatische Löschung ohne sichere Zuordnung.

---

# Aktueller Checkpoint – Recovery/Registry/Launchpad-Integration, 21. Oktober 2026

- Gesicherte Ausgangsbasis: `3751d15d47a5edf2c6c6c45b2630d963bc55be3f`; Branch `feat/air-os-architecture-foundation`, PR #11 offen/Draft. Arbeitsbaum vor Änderung sauber, GitHub-HEAD bestätigt; vor Remote-Aktualisierung erneut prüfen und expected_sha verwenden.
- Diese Einheit: `Test recovery integration through Store Registry and Launchpad`; SHA im Abschlussbericht bzw. `git log -1 --format=%H -- tests/airapp-install-recovery.test.cjs`.
- Geändert ausschließlich `tests/airapp-install-recovery.test.cjs` und beide Fortschrittsdokumente. Kein Produktivcode geändert, keine zweite Registry, kein Store-Umbau, keine neuen Abhängigkeiten. main und andere PRs bleiben unverändert.

Ausgangs-CI: Desktop-Build [39654049942](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39654049942) erfolgreich; Security [39654050082](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39654050082) fehlgeschlagen. Keine erneute Auditdiagnose in dieser Testeinheit.

## Geprüfte Integration

Drei gezielte Fälle nutzen den echten App-Manager und unveränderte Produktionsquellen von Store, App Registry und Launchpad in einer isolierten Node-VM. Ein kleiner DOM-Adapter und eine asynchrone AppStore-API verbinden sie ohne Electron. Die vorhandene signierte Recovery-Testfixture wird wiederverwendet; kein separater Installer oder Registry-Nachbau.

Der Test öffnet zuerst Launchpad und Store, betätigt den tatsächlich gerenderten Installieren-Button und wartet auf dessen Produktions-Handler einschließlich finally/refresh. Der Test ruft weder registry.syncInstalled noch Launchpad-render selbst auf.

1. Erfolgreiche Recovery: Installationsindex enthält die App, Registry führt origin=store, das bereits geöffnete Launchpad zeigt genau einen Eintrag mit korrektem Namen, der Store bietet Starten an.
2. Manipuliertes Paket sowie Index-Schreibfehler: kein installierter Index-/Registry-/Launchpad-Eintrag, konkrete Fehlermeldung und weiterhin Installieren verfügbar.
3. In allen drei Fällen bleiben vorhandene Registry-Einträge und Launchpad-Kacheln unverändert. Vollständige Byte-Snapshots des Alice-App-Ordners einschließlich zusätzlicher Nutzerdaten sowie der bereits installierten Bob-App einschließlich Profilindex/Nutzerdaten bleiben identisch.

## Tests und Grenzen

`TMPDIR=<Workspace-Verzeichnis> node --test tests/airapp-install-recovery.test.cjs tests/app-registry.test.cjs tests/launchpad.test.cjs`: **15/15 bestanden**, keine übersprungen (davon drei neue Integrationsfälle). Syntaxprüfung der Testdatei und git diff --check bestanden. Keine Produktivfehler in diesem Umfang gefunden.

Dieser Nachweis umfasst Komponenten und echte Dateipersistenz, nicht grafisches Layout, Browser-DOM-Vollständigkeit, echte IPC-Authentifizierung oder Installer. Keine Behauptung eines vollständigen Electron-End-to-End-Tests. Neue Commit-CI nach Sicherung separat prüfen. Dependency-Audit/Legacy-Electron und echte Windows/macOS-GUI-Prüfungen bleiben externe Release-Blocker.

## Nächste drei kleine Aufgaben

1. Sicheren, datenbewahrenden Umgang mit .install-Resten vor dem Rename festlegen und gezielt testen.
2. Windows/macOS-Electron-Smoke-Test: Store-Recovery, Anzeige im Launchpad, Starten und Deinstallieren.
3. Modern-Channel-Dependency-Audit separat prüfen; Legacy-Kompatibilität erhalten und keine Security-Gates deaktivieren.

---

# Aktueller Checkpoint – Teil 4: Installations-Retry, 21. Oktober 2026

- Gesicherte Ausgangsbasis: `f1a0e775347c7619d2c8565c1418ca150588522d`; Branch `feat/air-os-architecture-foundation`, PR #11 offen/Draft. Arbeitsbaum vor Änderung sauber, GitHub-HEAD unverändert.
- Diese Einheit: `Recover verified orphan Air App installations on retry`; SHA über `git log -1 --format=%H -- src/main/airapp-manager.cjs` oder Abschlussbericht.
- Aktueller Ausgangs-Build [39651495641](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39651495641) erfolgreich. Security [39651495636](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39651495636) rot; neue Commit-CI gesondert prüfen.
- Offene PRs #10/#9/#8/#1 (Features) sowie #5/#3/#2 (Actions) geprüft; keine Integration oder Änderung. main unverändert, keine parallele Bearbeitung.

## Genau eine kleine Funktion

Der Store besitzt bereits Katalog, Installieren/Starten/Deinstallieren und Registry-Synchronisation. Der wichtigste kleine offene Integrationsfall war eine nach Prozessabbruch vorhandene App ohne Indexeintrag: bisher scheiterte jeder erneute Installationsversuch am vorhandenen Ordner.

Der vorhandene Installieren-Aufruf übernimmt jetzt einen solchen Ordner ausschließlich nach vollständiger Prüfung gegen das signierte lokale Katalogpaket. Dafür nutzt Recovery dieselbe extrahierte verifyFolder-Prüfung wie der App-Start: Manifestvergleich, regulärer Ordner/Dateien, Symlink-/Pfadgrenzen und Hashprüfung. Erst nach erfolgreicher atomarer Index-Speicherung wird Erfolg gemeldet; die bestehende Store-Aktualisierung übernimmt anschließend den Index in die Registry. Keine zweite App-Liste, neue IPC oder UI erforderlich.

Der Recovery-Pfad überschreibt/löscht keine vorhandenen App-Dateien. Fehlende/manipulierte Assets und Symlink-Ordner werden abgewiesen. Bei Index-Schreibfehler bleiben die Daten für einen erneuten Versuch erhalten. Zusätzliche Dateien bleiben erhalten, werden aber nicht dadurch zur signierten Runtime-Dateiliste hinzugefügt.

## Dateien und Tests

Geändert: `src/main/airapp-manager.cjs`, neu `tests/airapp-install-recovery.test.cjs`, beide Fortschrittsdokumente.

Fünf neue Tests mit frisch signiertem Testpaket für die tatsächliche Testplattform: Recovery nach Neustart, Manipulation, fehlendes Asset, fehlgeschlagene Index-Persistenz mit Retry, Symlink-Ordner. Vor Fix scheiterten Erfolgs-/Index-Retry-Fälle; nach Fix alle fünf bestanden, einschließlich Symlink-Test. Testschlüssel entstehen nur temporär im Speicher; Produktionspaket und Plattformfreigaben unverändert.

Gezielter Lauf: `node --test tests/airapp-install-recovery.test.cjs tests/airapp-installed.test.cjs tests/airapp-package.test.cjs` meldet **15 bestanden**. Transparente Einschränkung: vorhandene Demo-Installationstests kehren unter Linux wegen der Windows/macOS-Freigabe teilweise früh zurück; die fünf neuen Recovery-Tests laufen tatsächlich vollständig unter Linux. Syntaxprüfungen beider geänderten JS-Dateien und git diff --check bestanden. Kein kompletter Testlauf oder Electron-GUI-Test in dieser bewusst kleinen Einheit.

## Grenzen und nächste drei Einheiten

Diese Recovery geschieht beim expliziten erneuten Installieren, nicht automatisch bei Anmeldung. Der Zustand nach Rename/vor Index wird im Test nachgestellt; kein echter Prozess-Kill/Power-Loss-Test. Abbrüche vor dem Rename und verwaiste .install-Verzeichnisse bleiben gesondert zu behandeln. Kein Schutzversprechen gegen sämtliche konkurrierenden lokalen Dateisystemänderungen. Audit-/Legacy-Electron-Blocker und reale GUI-Tests bleiben offen.

1. Store-Integrationstest: erfolgreiche Recovery erscheint nach Refresh in Registry/Launchpad; fehlgeschlagene Recovery nicht.
2. Temporäre .install-Reste vor Rename: sichere, datenbewahrende Strategie separat festlegen und testen.
3. Windows/macOS-Electron-Smoke-Test für Store-Installieren, Starten und Deinstallieren nach Recovery.

---

# Aktueller Checkpoint – Teil 3, 21. Oktober 2026

Dieser Checkpoint ist maßgeblich; ältere Einträge bleiben Historie.

- Ausgangs- und gesicherter Teil-2-Commit: `bd881fa2c570f57b7652f76935c5c11e5d4f1ea3`.
- Branch `feat/air-os-architecture-foundation`, PR #11 offen/Draft. Lokaler Arbeitsbaum vor Beginn sauber; GitHub-HEAD unverändert. main und andere PRs nicht geändert.
- Diese Einheit: `Revoke Air App protocol access after window closure`; genauen Checkpoint-SHA mit `git log -1 --format=%H -- src/main/airapp-runtime.cjs` ermitteln.
- Teil-2-CI [39650995471](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39650995471): Syntax, Node-Tests und Private-File-Prüfung bestanden; Dependency-Audit weiterhin fehlgeschlagen. Installer [39650995571](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39650995571) bei Eingangsprüfung queued; kein Erfolg behauptet. Letzter bestätigter kompletter Build weiterhin Teil 1 / 39650508444.

## Genau eine Funktion: Protokollzugriff an lebendes App-Fenster binden

Persistente Session-Handler konnten nach dem Schließen weiterhin signierte Dateien ausliefern. Jede airapp-Anfrage erfasst jetzt die aktuelle Fensterinstanz ihres Profil-/App-Schlüssels. Ohne lebendes Fenster wird sie mit 403 verweigert. Direkt vor Rückgabe der geprüften Bytes wird dieselbe Instanz erneut geprüft: Schließen, Logout oder ein zwischenzeitlicher Neustart dürfen eine bereits laufende alte Anfrage nicht autorisieren. Ein frischer Start darf neue Anfragen wieder bedienen. Signatur-, Hash-, Pfad- und CSP-Prüfungen bleiben unverändert aktiv; keine Profildaten werden gelöscht.

Das Test-Double bildet persistente Sessions jetzt je Partitionsname statt als eine globale Session ab. Vier Regressionstests prüfen close, closeAll, anderes Profil und eine während des Lesens geschlossene/neu gestartete App. Alle vier schlugen vor dem Fix mit 200 statt 403 fehl. Danach **72/72 Node-Tests bestanden**, keine übersprungen. Syntaxprüfungen der Runtime und Tests, Catalina-Konfiguration und git diff --check bestanden (Workspace-TMPDIR wie zuvor).

Grenzen: Prüfung des eigenen Protokoll-Handlers mit Node-Doubles, kein vollständiger Chromium-Cache-/Storage-/Electron-GUI-Sicherheitsnachweis. Bereits ausgelieferte Bytes werden nicht zurückgerufen. Profil-Authentifizierung bleibt Aufgabe der vorhandenen Main-IPC. Die neue Commit-CI ist nach Sicherung gesondert zu prüfen. Legacy-Audit, Code Signing und reale GUI-/Installer-Tests bleiben offen; letzter detaillierter Auditbefund 2 High/8 Moderate.

## Dauerhafter Ablauf

`AGENTS.md` hält den vom Nutzer gewünschten Anti-Freeze-Modus fest: Statusprüfung, genau eine kleine Aufgabe, relevante Tests, zeitnaher Git-Checkpoint, aktualisierte Übergabe, kurzer Abschluss. Richtwerte 5–10 Minuten je Einheit und möglichst 10–15 Minuten je Sitzung; keine Laufzeitgarantie. „Air-OS weiterentwickeln“ verwendet diesen Ablauf ohne erneute Gesamtplanung.

## Nächste drei kleine Einheiten

1. Installations-Crash zwischen Verzeichnis-Rename und Index-Persistenz reproduzieren; datenbewahrende Recovery gezielt absichern.
2. Echte Electron-Prüfung für Logout, beforeunload-Veto, alte Protokollanfragen und Profilwechsel auf Windows/macOS.
3. Separater Modern-Channel-Audit: kleinsten kompatiblen Dependency-Fix ermitteln/testen; Catalina-Legacy nicht blind upgraden.

---

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
