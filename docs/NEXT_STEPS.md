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

# Aktuelle Übergabe – Finder schützt fremde temporäre Speicherpfade

23. Oktober 2026. Genau eine Micro-Einheit: **fremde temporäre Dateien beim Finder-Textspeichern erhalten**. Ausgangs-HEAD `764ac848ed75ac7d476a5c44b82ff5dd0ad1c478` auf `feat/air-dock-pin-preferences-20261023` per GitHub bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `fix/air-finder-save-temp-cleanup-20261023`; main und andere Branches unverändert.

Bestand geprüft: `src/main/file-ops.cjs`, vorhandene File-Operationstests, begrenzte Dateinamensuche und Main-Finder-IPC/Workspace-Resolver. Vorhanden sind Ordneranlage, exklusive Textdateierstellung, Kopieren/Duplizieren, No-overwrite-Umbenennen sowie Text lesen/speichern. Es wird kein zweiter Dateidienst und kein neuer Finder gebaut. Kein neuer Datei-/Ordnerzugriff, keine Lösch-/Papierkorbfunktion und keine Änderung von Profildaten/Arbeitsordnerfreigabe.

Reproduzierter Datenverlust: Der Text-Save wählt `.airos-save-<Zufallswert>.tmp`. Existiert dieser Name bereits, wirft `writeFileSync(..., flag:'wx')` korrekt EEXIST, aber das bisherige `finally` löscht den fremden Pfad. Mit deterministischem Test-Zufallswert verschwanden sowohl eine vorher vorhandene Datei als auch ein vorhandener Symlink. Vor Fix **4/6 neue Tests grün, 2 Kollisionsfälle rot**.

Fix im vorhandenen `air-os:files:write-text`-Handler: temporäre Datei mit `openSync(...,'wx',0o600)` **vor Eintritt in den Cleanup-Block** exklusiv reservieren. Bei EEXIST erfolgt kein Cleanup dieses fremden Namens. Nach erfolgreichem Reservieren über den Dateideskriptor schreiben, diesen auch bei Schreibfehler im inneren `finally` schließen und erst dann per bestehendem Rename ersetzen. Fehler-Cleanup betrifft den für diesen Versuch reservierten temporären Pfad. Das ausdrücklich angeforderte Speichern eines regulären vorhandenen Dokuments ersetzt dieses weiterhin; „Neue Datei“ bleibt separat exklusiv/no-overwrite.

Neue `tests/file-write.test.cjs` führen den **Produktions-IPC-Handler und seine Produktions-Workspace-Resolver im Node-VM-Adapter** mit echtem temporärem Dateisystem aus. Deterministischer Zufallswert und nachgebildete Vertrauensprüfung; partielle Schreib-/Rename-Fehler gezielt injiziert, keine globalen fs-Monkeypatches. Fälle: neues/bestehendes Dokument, Kollisionsdatei bei bestehendem oder fehlendem Ziel, Symlink mit Ziel außerhalb des Workspaces (Link und Ziel unverändert), partielle Schreibstörung samt geschlossenem Deskriptor, fehlgeschlagene Ersetzung, fehlende Anmeldung/Freigabe, untrusted Event, Traversal, ungültiger Dateityp und vorhandener Zielordner. Auf Windows kann nur der Symlink-Test bei fehlender Symlink-Berechtigung explizit übersprungen werden; aktueller Linux-Lauf ohne Skip.

Nach Fix: `node --test tests/file-write.test.cjs tests/file-ops.test.cjs` **12/12 grün**; `TMPDIR=/workspace/scratch npm test` **117 bestanden, 0 fehlgeschlagen/übersprungen**. `node --check main.cjs`, Syntax des neuen Tests, `npm run check:catalina`, `git diff --check` bestanden. Keine neue GUI-/echte Electron-IPC-/Windows-/macOS-/Installerprüfung in dieser Backend-Einheit, kein neuer Audit und kein bestätigter aktueller CI-Gesamtstatus. Keine vollständige Sicherheit gegen konkurrierenden bösartigen Austausch von Pfadbestandteilen nach Validierung/Reservierung oder gegen Power-Loss behauptet; diese Race-/Durability-Grenzen bleiben separate Aufgaben.

Nächste drei kleine Finder-Einheiten, jeweils nur auf nächsten Prompt: (1) fremde Änderungen am Dokument zwischen Öffnen und Speichern reproduzieren und einen begrenzten Konflikterkennungs-Vertrag testen; (2) Fehlerpfad des vorhandenen No-overwrite-Umbenennens nach erfolgreichem Hardlink und fehlgeschlagenem Unlink regressionsprüfen, Daten erhalten; (3) Papierkorb-/Restore-Vertrag für den freigegebenen Workspace mit Kollisionen und expliziter Wiederherstellung spezifizieren, noch keine endgültige Löschung. Commit `Preserve foreign temporary paths when Finder save creation fails`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

# Aktuelle Übergabe – Pinning-Speicher bereit, Oberfläche folgt separat

23. Oktober 2026. Genau eine Micro-Einheit: **P1, profilbezogener Pinning-Speichervertrag**. GitHub-HEAD vor Beginn bestätigt: `970937631ba1dd5ebe8af6593547e1927509de61` auf `fix/air-window-focus-20261023`; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `feat/air-dock-pin-preferences-20261023`. Arbeitsbaum zuvor sauber; main und andere Branches unverändert.

Bestandsprüfung: Classic/Modern verwenden weiterhin feste Dock-Buttons in `index.html`. Vorhandene Preferences speichern Theme/Größe, aber keine Pin-Auswahl; kein vollständiges profilbezogenes Pin/Unpin gefunden. Registry, Launchpad und Installationssynchronisierung bleiben die bestehenden Dienste. Deshalb ausschließlich den bereits geplanten Datenvertrag P1 ergänzen; kein Dock-/Such-/Registry-Umbau.

Implementiert in `src/main/preferences.cjs`: additives `dockPins` im vorhandenen `appearance-v1.json` je Profil, erreichbar über unveränderte authentifizierte Preferences-IPC. `null` bedeutet **Standardbelegung erben**, `[]` eine explizit leere Auswahl; Array-Reihenfolge bleibt erhalten. Höchstens 64 eindeutige String-IDs: Built-in-ID-Form bzw. vorhandene `com.*`-Registry-ID-Form, keine Pfade, URLs, Objekte, Duplikate oder Sparse-Einträge. Arrays werden kopiert. Alte Dateien ohne Feld laden `null`; ungültige gespeicherte Pin-Felder fallen auf `null` zurück, andere gültige Einstellungen bleiben erhalten. Reset setzt nur das betreffende Profil auf Standardwerte zurück.

**Nur Verweise, keine zweite App-Liste:** keine Namen, Icons, Kategorien, Installations- oder Aktivitätszustände speichern. Die Validierung ist syntaktisch und erteilt keine Installations-/Startrechte; eine noch unbekannte/deinstallierte ID ist kein App-Nachweis. P2 muss diese Verweise bei jedem Rendern gegen die **eine vorhandene Registry** auflösen und auf deren Installations-/Deinstallationsereignisse reagieren. Eine noch nicht geladene Registry darf nicht zur automatischen Löschung von Nutzerpräferenzen führen. Die sichtbaren Standard-Dock-Buttons werden von P1 absichtlich noch nicht aus `dockPins` gerendert: **Pin/Unpin-Oberfläche, dynamische Reihenfolge und Drag-and-drop sind weiterhin offen.**

Tests vor Änderung: vier neue Tests rot (Feld fehlt/abgewiesen). Danach `node --test tests/dock-pins.test.cjs` **4/4 grün** und `TMPDIR=/workspace/scratch npm test` **111 bestanden, 0 fehlgeschlagen/übersprungen**. Abgedeckt: geordnete Referenzen, Entfernen eines Verweises, erneute Store-Instanz/Dateipersistenz, Profiltrennung, Array-Kopie, Grenze 64, ungültige/sparse/duplizierte Werte, bytegenau unveränderte Datei bei Ablehnung, leere Auswahl gegenüber `null`, Reset/alte Dateien sowie echte Produktions-IPC-Handler im Node-Adapter mit nachgebildeter Vertrauensprüfung. Syntax von Store/Test, `npm run check:catalina` und `git diff --check` bestanden.

Zusätzlich echte Linux/Electron-32.3.3-/Xvfb-IPC-Prüfung mit aktiver Sandbox und zwei Wegwerfprofilen: **4 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-dock-pins-ipc.cjs`, vorhandenes Playwright, CDP lokal auf Port 9228. Über `window.airOS.preferences` echte Profildatei/ID-Reihenfolge und Reload geprüft; ungültiger Write lässt Dateibytes unverändert; Entfernen/`[]` gespeichert; abgemeldeter Write verweigert; zweites Profil und dessen Reset verändern erste Profildatei nicht. Sichtbares Dock vor/nach direktem IPC-Update identisch, wie für diesen reinen Speicherschritt erwartet. Keine neue Pinning-GUI behauptet.

Grenzen: keine native Windows-/macOS-/Installerprüfung, kein neuer Audit oder bestätigter aktueller CI-Gesamtstatus. Bestehende Release-/Signing-Blocker bleiben. Nächste drei kleine Einheiten: (1) **P2a** vorhandenes Dock aus ID-Verweisen/Registry rendern und fehlende/deinstallierte Einträge sowie Profilwechsel testen, bestehende Standardbelegung bei `null` erhalten; (2) **P2b** eine kleine Pin/Unpin-Bedienung mit bestätigtem Save/Fehler-Retry und Tests; (3) erst danach eine einzelne Reihenfolgeänderung per Drag-and-drop samt Tastaturalternative weiter zerlegen. Commit `Persist validated profile-specific dock pin references`; SHA im Git-Log/Abschlussbericht. Danach stoppen.

---

# Aktuelle Übergabe – interner Fokusmarker-Fehler behoben

23. Oktober 2026. Genau eine Micro-Einheit: **wiederholte interne Fenster-Fokuswechsel korrekt melden**. GitHub-HEAD vor Beginn bestätigt: `a40bb2485ebd6b18a4e62a20cacc8d194f9805d1` auf `feat/air-notes-island-notification-20261023`; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `fix/air-window-focus-20261023`. Kein zweiter Window Manager, keine Änderungen an App Registry, nativen App-Fenstern, Spotify oder Host-APIs.

Bestandsprüfung: `app.js` verwaltet interne DOM-Fenster über `openApps`, Z-Reihenfolge, bestehende Dock-Animationen, Drag-/Resize-Handler und Maximieren/Wiederherstellen. `src/core/app-lifecycle.js` meldet Zustände an den Dock-Beobachter. Installierte Air-Apps besitzen separat isolierte Electron-BrowserWindows; externe Apps werden nur an das OS übergeben. Diese Typen wurden nicht zusammengelegt.

Reproduzierter Fehler: Notes → Rechner → vorhandene Notes. Notes wird korrekt nach vorne gebracht, aber sein zuletzt gemeldeter App-Zustand ist weiterhin `focused`. Die bisherige per-App-Deduplizierung unterdrückt deshalb das neue Ereignis, und der Dock-Beobachter behält den Rechner als aktiv. Vor Fix **zwei neue Node-Regressionstests rot** und vorhandener echter Dock-GUI-Test mit genau diesem Fokusmarker-Fehler **Exit 1**; andere GUI-Prüfgruppen liefen weiter.

Fix ausschließlich im vorhandenen Lifecycle: neben zuletzt gemeldeten per-App-Zuständen wird die zuletzt fokussierte interne App gehalten. Gleicher Zustand **mit erneutem Fokusgewinn nach einer anderen App** löst ein Ereignis aus; identischer Fokus auf die weiterhin aktive App bleibt eine No-op. Minimieren/Schließen/laufender Zustand der aktiven App gibt diese Fokusreferenz frei; Schließen einer Hintergrund-App löscht nicht den Fokus einer anderen App. Kein automatisches Wiederherstellen/Neueröffnen anderer Fenster, kein neues Geometrie-/Fensterzustandsmodell. `get/list` behalten ihre bisherige Bedeutung als zuletzt gemeldete App-Zustände, keine umfassende globale Fensterübersicht daraus ableiten.

Tests nach Fix: `node --test tests/app-lifecycle.test.cjs` **4/4 grün**; `TMPDIR=/workspace/scratch npm test` **107 bestanden, 0 fehlgeschlagen/übersprungen**. Neue Fälle: A→B→A, deduplizierter erneuter A-Fokus, Wiederfokus eines bereits maximierten Fensters, Minimieren/Wiederherstellen, Hintergrund-Schließen und kein unbeabsichtigtes Wiederbeleben minimierter Apps. Syntax aller drei geänderten JS-/Testdateien, `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: nach Reload `node scripts/check-dock-gui.cjs 9227` **10 Prüfgruppen bestanden, Exit 0**, keine ungefangenen Rendererfehler. Der bisher fehlschlagende A/B/A-Pfad ist unverändert enthalten und prüft nun zusätzlich **genau eine** aktive Markierung für Notes. Echte Dock-Mausaktionen, tatsächliche Z-Reihenfolge, Minimieren/Restore, Tastaturaktivierung, Theme-Wechsel/Persistenz und emulierte Breiten 1440/1024/760/600/390px bestanden. Keine Assertion deaktiviert. Das ist ein Nachweis für diesen internen Fenster-/Dock-Pfad, keine allgemeine Native-/Screenreader-/Mehrmonitorabnahme. Keine neue Audit-/Signing-/Release-Freigabe; aktueller CI-Gesamtstatus unbestätigt. Der zuvor dokumentierte konkrete wiederholte Dock-Fokusmarker-Defekt ist damit behoben.

Nächste drei kleine Fenster-Einheiten, nur nach weiterem Prompt: (1) Fokus-Fallback beim Schließen/Minimieren der obersten App zunächst reproduzieren und eine begrenzte Regel testen; (2) vorhandenen Fenstermenü-Restore-Pfad über dieselben bestehenden Fokus-/Animationswege absichern; (3) einen internen Tastatur-Fokuswechsel mit Registry-IDs spezifizieren/testen. Snapping, Vorschauen, Mission Control, persistente Geometrie und virtuelle Arbeitsflächen bleiben getrennte Roadmap-Aufgaben; keine davon in dieser Sitzung implementiert. Commit `Notify repeated internal window focus changes correctly`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

# Aktuelle Übergabe – eine Notes-Mitteilung integriert

23. Oktober 2026. Genau eine Micro-Einheit: **echte Air-Notes-Speichermitteilung im Island-Panel**. Ausgangs-HEAD `c35f31df9f17b5dba4bf4ca666ea98eb58ee36ab` auf `feat/air-control-center-dock-theme-20261023` per GitHub-Ref bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Eigener Branch `feat/air-notes-island-notification-20261023`. main und andere Branches unverändert. Keine Abhängigkeit oder Host-Schnittstelle ergänzt.

Bestandsprüfung: Air Music verwendet AmplitudeJS und echte lokal ausgewählte Audiodateien mit Play/Pause-/Zeitereignissen; seine Metadaten stammen teils aus Dateinamen, Playlists weiterhin aus globalem localStorage. Kein allgemeiner Musik-/Notification-Service gefunden; vorhandene Toasts sind kurzlebige Statusanzeigen. Air Erinnerungen hat echte profilbezogene Aufgaben, aber keine verlässlich terminierten Benachrichtigungen. Daher ausschließlich eine bestätigte Notes-Aktion integrieren statt Wiedergabe oder Fälligkeit zu erfinden. Spotify/Visualizer/Systemaudio unverändert.

`air-notes.js` sendet nach erfolgreichem `await api.save()` das feste lokale Signal `air-notes-saved` **ohne Payload**. Bei fehlgeschlagenem oder noch laufendem Save kein Erfolgssignal. Die Island zeigt genau **eine letzte Mitteilung** mit App-Name, festem Erfolgstext und lokal formatiertem Empfangszeitpunkt an; wiederholtes Speichern ersetzt den Zeitpunkt, keine Historie. Notiztitel, Inhalt und ID werden nicht übertragen oder in der Mitteilung gespeichert. Panel und Fokus werden nicht automatisch verändert. Sichtbare Darstellung per `textContent`, keine HTML-Übernahme.

Nur aktuelles Dokument: keine Datenbank/LocalStorage/Übertragung/OS-Notification für Mitteilungen. Listener und Anzeige werden bei `pagehide` entfernt/geleert; neue Dokumente nach Reload/Profilwechsel beginnen leer. Dieses interne DOM-Signal zwischen mitgelieferten Komponenten ist **kein Berechtigungs- oder Herkunftsnachweis für beliebige Apps**. Keine allgemeine App-Notification-API, Read/Unread-, Lösch-/Ruhemodus- oder Berechtigungsschicht behauptet; weitere Quellen benötigen ein eigenes begrenztes Konzept.

Tests: `TMPDIR=/workspace/scratch npm test` **105 bestanden, 0 fehlgeschlagen/übersprungen**. Zwei neue Produktions-Notes-Controller-Tests mit nachgebildeter Notes-API prüfen ausstehende Bestätigung, Doppelklick, Fehler/Retry und payloadfreies Signal. Zusätzlicher Island-Test prüft feste Meldung trotz unerwartetem Payload, neuesten Zeitpunkt, geschlossenen Zustand/Fokus sowie Cleanup und frisches Dokument. Syntax aller geänderten JS-/Testdateien, `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: **6 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-notes-notification-gui.cjs`, vorhandenes Playwright, CDP nur lokal auf Port 9226. Reale Notes-Speicherung → sichtbare Mitteilung/Zeitstempel ohne privaten Titel/Inhalt und ohne automatisches Panel/Fokus; erneuter Save bleibt bei einer Meldung; emulierte 760/390px-Ansichten; Reload leert die Meldung bei weiter vorhandener gespeicherter Notiz; zweites tatsächlich angelegtes Profil erhält weder fremde Notiz noch Mitteilung. Finale 390px-Ansicht visuell geprüft; Artefakte unter ignoriertem `dist/notes-notice-*.png`. Fehlgeschlagene Saves sind im Node-Test simuliert; keine künstlichen GUI-Fehler als echte OS-Befunde ausgegeben.

Grenzen: keine native Windows-/macOS-/Screenreader-/Installerprüfung und keine neue Security-/Release-Freigabe. Aktuelle CI nicht bestätigt; bekannte Audit-/Signing-/Dock-Fokusmarker-Blocker bleiben offen. Nächste drei mögliche kleine Einheiten nur nach Nutzerprompt: (1) Berechtigungs-/Quellenvertrag für weitere App-Mitteilungen festlegen; (2) begrenzte profilbezogene Mitteilungsliste/Gelesen-Zustände als getrennten Datenvertrag testen; (3) echten lokalen Air-Music-Zustand für eine spätere reine Titelanzeige testen. Vollständige Mediensteuerung und Visualizer bleiben später. Commit `Show acknowledged Air Notes saves in Island panel`; SHA im Git-Log/Abschlussbericht. Nach Sicherung beenden.

---

# Aktuelle Übergabe – Dock-Theme-Kachel gespeichert und getestet

23. Oktober 2026. Genau eine Micro-Einheit: **Dock-Theme-Kachel im Kontrollzentrum**. GitHub-Stand vor Beginn geprüft: Island-Basis `f5cdcace6a95c89e1c9fa95eb9dfc149082f865b`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`, main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `feat/air-control-center-dock-theme-20261023`; main/andere Branches unverändert. Keine Bloom-Quellen/Assets, keine neue Abhängigkeit, keine weiteren Kacheln.

Die Island-Region heißt nun Kontrollzentrum und enthält **genau einen** echten Toggle „Modernes Dock“ mit sichtbarem Classic-/Modern-Wert, `aria-pressed`, Fokusmarkierung, Busy-/Unavailable-Zustand und Statusmeldung. Zweispaltiges Grid mit einer belegten Kachel, keine funktionslosen Host-Platzhalter. Bestehende Reduced-Motion-Regeln gelten weiterhin. WLAN, Bluetooth, Host-Helligkeit/-Lautstärke, Batterie und andere Host-Funktionen werden weder angesprochen noch als geändert ausgegeben.

`persistAirDockTheme()` nutzt vorhandene `airSettingsLoad`/`airSettingsWrites`, authentifizierte `airOS.preferences.update` und unveränderten profilbezogenen Main-Store. Die Kachel schaltet das Dock **erst nach erfolgreicher Speicherung** über `applyAirSettings` um. Fehler werden verständlich gemeldet, der alte Zustand bleibt erhalten, Retry bleibt möglich. Wiederholte Aktivierung während einer laufenden Anfrage wird abgefangen. Kein zweiter Store/LocalStorage-Fallback für die Kachel. Über `air-settings-changed` und das bestehende Settings-Select wird derselbe Wert in beide Richtungen dargestellt; externe Änderungen löschen einen veralteten Erfolgshinweis. Fehlende Preferences führen zu einem erklärten deaktivierten Zustand.

Tests: `TMPDIR=/workspace/scratch npm test` **102 bestanden, 0 fehlgeschlagen/übersprungen**. Drei zusätzliche Tests im bestehenden Island-Harness: bestätigte Saves/Doppelklick/externes Update; Fehler/Retry/Unavailable; echter persistierender Preferences-Store mit Produktions-Saveadapter, neu erzeugtem Store nach Save, Profiltrennung, ungültigem Theme und simuliertem IO-Fehler. Syntax von `app.js`, `air-island.js`, Test sowie `npm run check:catalina` und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-Test mit aktiver Sandbox und separatem Wegwerfprofil: **6 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Lokaler Helfer `/workspace/.air-os-onboarding/check-control-gui.cjs`, vorhandenes Playwright, CDP nur lokal auf Port 9225. Reale Kachel-/Enter-Aktivierung, Dock-CSS und vorhandenes Settings-Select, JSON-Profildatei nach erfolgreichem Save, Wiederherstellung nach Renderer-Reload, Änderungen aus Settings zurück zur Kachel, Fokus und Escape geprüft. Panel/Kachel bei emulierten 760/390px innerhalb des Viewports; finale 390px-Ansicht visuell betrachtet (`dist/control-center-390.png`, ignoriertes Artefakt). Native Windows/macOS, vollständiger Electron-Neustart und reale Fehler der GUI-Dateisystemschicht nicht in diesem Lauf geprüft; Store-Neustart/Fehlerfälle sind Node-Tests. Aktuelle CI nicht bestätigt; bekannte Audit-/Signing-/Dock-Fokusmarker-Blocker bleiben offen.

Nächste drei mögliche kleine Einheiten, nur auf nächsten Nutzerprompt: (1) genau eine weitere vorhandene Darstellungseinstellung als Kachel, etwa reduzierte Animationen; (2) Capability-/Unavailable-Vertrag für einen Host-Status ohne Scheinsteuerung; (3) danach genau eine belegte Statusquelle auf einer realen Zielplattform prüfen. Keine weiteren Kacheln automatisch entwickeln. Commit `Connect Control Center dock tile to persistent profile settings`; SHA im Git-Log/Abschlussbericht.

---

# Aktuelle Übergabe – Island-Grundelement abgeschlossen

22. Oktober 2026. Genau eine Micro-Einheit: **Dynamic-Island-Grundelement**. Bestätigte Ausgangsbasis `335e0aceeb99c2b92662ed2e48d38262cc4005df` auf `test/air-modern-dock-gui-20261022`; PR #11 weiterhin `eecab2a043fc62ab0802312aa09ce29dfd96c280`, main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `feat/air-dynamic-island-base-20261022`. Keine fremden Branches geändert, keine Bloom-Quellen/Assets oder neue Abhängigkeiten übernommen. Bestehende Release-/Audit-Blocker und der bekannte Dock-Fokusmarker-Fehler bleiben offen; Ausgangsstand ist keine Release-Freigabe.

Implementiert: `air-island.js/.css`, Einbindung in `index.html` und Installer-Dateiliste. Schwarze kompakte Pille mittig unter der Menüleiste, echte lokale Uhrzeit mit vorhandener `clock24`-Einstellung, unmittelbar aktualisiert über ein schlankes `air-settings-changed`-Event aus `applyAirSettings`. Keine neue Einstellung oder paralleler Store. Timer pausiert bei verborgenem Dokument, Listener/Timer werden bei Seitenende entfernt. Uhrzeit ist auch im zugänglichen Buttonnamen enthalten, ohne laufende Live-Ansagen.

Panel ist eine einfache benannte, **nicht modale** Region ohne Systemsteuerungen. Maus/Enter/Leertaste öffnen; Schließen/Escape geben Fokus an die Pille zurück. Tab/Fokuswechsel und Außenklick schließen ohne Fokusdiebstahl und ohne Klickblockade für das Ziel außerhalb. Kein globales Tastenkürzel oder Fokus-Trap. Die kompakte Island erhält einen reservierten 62px-Bereich oberhalb interner Fenster und Desktop-Symbole; eine begrenzte Fenster-Ebene oberhalb der Desktop-Symbole und unterhalb der Island verhindert, dass Symbole Fensterknöpfe abfangen oder Fenster die Island verdecken. Maximierte Fenster nutzen den vorhandenen Fenster-Host. Das geöffnete Panel darf lokal über Inhalt liegen, bleibt aber per Escape/Schließen/Außenklick verlassbar; kein Vollbild-Overlay. Responsive Breite, begrenzte scrollbare Panelhöhe und reduzierte Animationen über vorhandene Air-OS-Klasse sowie OS-Media-Query.

Tests: `TMPDIR=/workspace/scratch npm test` **99 bestanden, 0 fehlgeschlagen/übersprungen** (drei neue Tests: Uhrformat/Tick/Visibility/Cleanup; Panel/Fokus/Dismissal; Desktop-/Installer-Einbindung). Syntax von Island, App und Test sowie `npm run check:catalina` und `git diff --check` bestanden.

Zusätzlich echter **Electron 32.3.3/Linux/Xvfb-GUI-Test**, aktiver Namespace-/Renderer-Sandbox, separates Wegwerfprofil, CDP nur lokal auf Port 9224. Ausgeführt mit dem lokalen Playwright-Helfer `/workspace/.air-os-onboarding/check-island-gui.cjs` aus der vorhandenen Umgebung, keine neue Projektabhängigkeit: **8 Prüfgruppen bestanden**, keine ungefangenen Rendererfehler. Getestet: Maus/Enter/Space, Escape-/Schließen-Fokusrückgabe, Tab-Dismissal, Außenklick bis zum App-Start, unmittelbarer 12-/24h-Wechsel über echte Settings, Air-OS- und OS-Reduced-Motion sowie zentrierte Pille/Panel und erreichbare maximierte Fensterleiste bei emulierten Renderergrößen 1440×900, 760×540 und 390×600. Screenshot der finalen 390px-Ansicht visuell betrachtet; lokale Bilder unter ignoriertem `dist/island-*.png`. Erste zusätzliche Ebenenprüfung fand eine Kollision mit Desktop-Symbolen; Fenster-Ebene angepasst, vollständiger abschließender GUI-Lauf grün.

Grenzen: Renderergrößen sind emuliert; native Mindestfensterbreite bleibt 760px. Keine neuen nativen Windows-/macOS-/DPI-/Mehrmonitor-/Screenreader-/Installerprüfungen. Aktuelle CI nicht bestätigt, historischer API-Zugriff Forbidden; keine neue Audit-/Release-Freigabe. Bekannter Dock-GUI-Fokusmarker-Test wurde in dieser Island-Einheit nicht repariert oder erneut als grün ausgegeben. Noch keine Statusdaten, Mediensteuerung, Benachrichtigungen, Kalender oder Timer in der Island.

Nächste drei kleine Einheiten: **Q1** einfaches Kontrollzentrum ausschließlich an vorhandene Air-OS-Darstellungseinstellungen anbinden (inklusive Speicherfehler/Profilpersistenz); danach **M1** echtes lokales Air-Music-Zustandsmodell testen; danach **B1** Capability-/Unavailable-Vertrag für spätere Statusanzeigen festlegen. Jede Einheit separat; kein automatischer Beginn. Frühere Pinning-/Drag-and-drop-Pläne und der offene Dock-Marker bleiben erhalten. Commit `Add accessible Air Island base with local clock and panel`; SHA im Git-Log/Abschlussbericht.

---

# Aktuelle Übergabe – Floating Dock: GUI-Checkpoint mit offenem Fokusmarker

22. Oktober 2026. Ausgangsbasis `b45003159fa2607be177289c0959e8b4d6ce11e4`, PR-11-Funktionsbasis `eecab2a`; eigener Branch `test/air-modern-dock-gui-20261022`. main und PR #11 unverändert. Genau eine Einheit: vorhandenes Dock in echtem Linux-Electron/Xvfb prüfen und **eine** CSS-Korrektur an der aktiven Modern-Hintergrundfläche. Keine neuen Dock-Funktionen, kein GPL-Code, keine Dynamic Island.

`node scripts/check-dock-gui.cjs [port]` ist ein neuer manueller GUI-Regressionstest ohne zusätzliche Abhängigkeit; benötigt Node >=22 und eine laufende, lokal per CDP erreichbare Electron-App mit angemeldetem **Wegwerfprofil**. Er schließt Notes-/Rechner-Testfenster und stellt Preferences am Ende wieder her. Vollständiger Startablauf, Nachweise und Grenzen: neuester Abschnitt in DEVELOPMENT_PROGRESS.md.

Ergebnis: 96/96 Node-Tests grün, Syntax/Catalina/Diff grün. Echter GUI-Test: **9 Prüfgruppen erfolgreich, 1 offener Fehler → Exit 1**. Position/Glasdarstellung, Theme-Wechsel/Persistenz, App-Start, tatsächliche Fensterreihenfolge, Minimieren/Wiederherstellen, Tastaturaktivierung und Overflow bei emulierten 1440/1024/760/600/390px geprüft. Keine echten Windows-/macOS-/DPI-/Mehrmonitorprüfungen; CI-Gesamtstatus unbekannt.

**Nicht als erledigt markieren:** Notes→Rechner→Notes kann eine veraltete aktive Dock-Markierung hinterlassen, obwohl Notes korrekt oben liegt. Der GUI-Test enthält eine weiterhin fehlschlagende Prüfung dafür. Zweiter nachgewiesener Fehler wurde wegen der Grenze „höchstens ein Fehler“ nicht zusätzlich korrigiert. Bekannte Audit-/Release-Blocker bleiben.

Nächste drei kleine Dock-Einheiten (jeweils eigener Prompt):
1. **Pinning-Datenvertrag (P1):** profilbezogene, begrenzte Registry-ID-Liste validieren/persistieren; Isolation/ungültige IDs/Reset testen. Keine Drag-and-drop-UI in derselben Einheit.
2. **Pinning-Anbindung (P2):** vorhandenes Dock aus dem Vertrag rendern; Pin/Unpin und deinstallierte Einträge testen, Classic erhalten. Offenen Fokusmarker separat vor Freigabe korrigieren.
3. **Drag-and-drop:** nach P1/P2 zunächst genau eine sichere Reihenfolgeänderung inklusive Persistenz testen; Tastaturalternative getrennt absichern.

Commit `Check Air Modern dock in Electron and fix active background`; exakter SHA im Abschlussbericht/Git-Log. Kein automatischer Beginn der nächsten Einheit.

---

# Aktuelle Übergabe – Roadmap dokumentiert, Implementierung pausiert

Stand 22. Oktober 2026. **Genau eine Dokumentationseinheit**, keine Produktimplementierung. Ausgangs-HEAD von PR #11 und `feat/air-os-architecture-foundation`: `eecab2a043fc62ab0802312aa09ce29dfd96c280`; GitHub `main`: `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`. Eigener Branch `docs/air-os-ultimate-roadmap-20261022`; PR #11 weiterhin Draft laut öffentlicher GitHub-Seite. Keine neueren Commits auf den abgefragten Entwicklungsrefs. main, PR #11 und andere PRs unverändert.

Neu: [AIR_OS_ULTIMATE_ROADMAP.md](AIR_OS_ULTIMATE_ROADMAP.md) mit quellbasierter Bestandsaufnahme, umgesetzten/teilweisen/fehlenden Funktionen, eigenständigen Bloom-Prinzipien, Plattformmatrix, Release-Blockern und einzeln abnehmbaren Micro-Einheiten. Bloom-Referenz `8b3d5dcdcbadc1490c2824ccec01e818b7a0233c`; GPL-3.0-only bestätigt, keine Quellen/Assets übernommen. Vorhandene Registry, Lifecycle, Finder, Spotlight, Launchpad, Runtime, lokaler Demo-Store, Spotify und Modern-Dock ausdrücklich berücksichtigt; ältere Dokumentaussagen nicht als aktuellen Stand übernommen.

Tatsächlich geprüft: `TMPDIR=/workspace/scratch npm test` **96/96 bestanden, 0 fehlgeschlagen/übersprungen**; Syntax aller Root-JS-Dateien, Main/Preload, `src/core/*.js`, `src/main/*.cjs`, `scripts/*.cjs` und `npm run check:catalina` bestanden. Dokumentationsdiff und lokale Markdown-Verweise separat vor Commit geprüft. Keine neuen GUI-/Windows-/macOS-/Audit-/Buildtests. GitHub-API für PR/CI liefert Forbidden; aktueller CI-Gesamtstatus unbekannt. Historische Audit-/Signing-/Plattformblocker gelten weiter. Bestehende globale Kalender-/AirWrite-/Musikdaten benötigen Profilwechselprüfung; keine Migration in dieser Sitzung.

Nächste drei kleine Einheiten: **S1** Legacy-Audit reproduzieren; **D1** Kalender-Daten und Profilwechsel prüfen; **U1** vorhandenes Dock real in Electron validieren. Früherer ChatGPT-Wunsch bleibt als **C1/C2** erhalten und kann per nächstem Nutzerprompt priorisiert werden. Keine Folgeaufgabe automatisch starten. Neuer Commit: `Document verified Air-OS Ultimate inventory and micro-roadmap`; exakter SHA im Git-Log/Abschlussbericht, da der Commit seinen eigenen Hash nicht vorwegnehmen kann.

---

# Aktuelle Übergabe – Spotify-Testeinheit, 22. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11 (offen/Draft). Letzter bestätigter GitHub-Checkpoint `05d132df03da2990dc91897d4a57938db9f9bc50`; sauberer Arbeitsbaum vor Beginn. Neuer Checkpoint: `Test Spotify desktop launch contracts and UI routing` (SHA im Abschlussbericht/Git-Log). main und andere PRs unverändert.

Abgeschlossen: vier zusätzliche automatisierte Tests für native Pfadvarianten/Store-Grenzen, Retry und vorhandene Dock-/Launchpad-Routen. 17/17 gezielte Tests sowie Syntax/Diff grün. Ausschließlich Linux/Node mit simulierten OS-APIs; keine erfolgreiche native Windows/macOS-/Store-Kompatibilität behauptet. Kein Launcher-Umbau.

Nächste drei Micro-Aufgaben:
1. Auf Nutzerwunsch als Nächstes: offizielle installierte ChatGPT-App über sicheren nativen Launcher mit Registry-, Launchpad- und Dock-Eintrag integrieren; Mechanismen vorher prüfen, kein Browserfallback. Noch nicht implementiert.
2. Spotify: technische Dateisystemfehler (z.B. EACCES) verständlich melden, Sicherheitsgrenzen erhalten.
3. Spotify: echte Windows-Standard-/Store- und macOS-Tests, Wiederaktivierung und Air-Modern-Dock visuell prüfen.

Grenzen: Store-Handler ohne validierbaren lokalen Spotify-Pfad bleiben nicht unterstützt; Aktivierung laufender Fenster nicht nachgewiesen. Ausgangs-CI Installer grün, Security rot; neue CI prüfen. Frühere Dock-/Dynamic-Island-Aufgaben bleiben erhalten und sind nachgeordnet. main/andere PRs unangetastet; AGENTS.md/Micro-Modus beibehalten.

---

# Aktuelle Übergabe – Air Modern Dock, 22. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11. Letzte bestätigte Basis `3d3c5759c0200d12e2cc717f71cc6e6734245d5b`; neuer Checkpoint `Add opt-in Air Modern floating dock theme` (SHA im Git-Log/Abschlussbericht).

Abgeschlossen: opt-in Floating-Dock-Theme über Einstellungen → Dock-Design, vorhandene Start-/Lifecycle-Funktionen wiederverwendet. Classic bleibt Standard. Profilbezogene Persistenz, Reset und Validierung getestet. 6/6 gezielte Tests grün; Syntax/Diff grün. GUI-Prüfung blockiert durch fehlendes Chromium; echte Windows/macOS-Prüfung und CI-Status offen. Keine Dynamic Island oder Host-Steuerung in dieser Einheit.

Nächste drei Micro-Aufgaben:
1. Dock visuell in Electron prüfen: Desktop/schmaler Bildschirm, Scrollen, Fokus, Theme-Wechsel, Start/Minimieren/Wiederherstellen, reduzierte Bewegung.
2. Dynamic Island separat: echte Uhrzeit, Öffnen/Schließen per Tastatur, Platzierung ohne Fensterkollisionen.
3. Quick Settings an vorhandene Einstellungen anbinden; nicht unterstützte Host-Funktionen kennzeichnen. Mediensteuerung erst nach Prüfung echter APIs.

Frühere Spotify-/ChatGPT- und Pinning-Aufgaben bleiben erhalten, sind durch diesen Designauftrag nur nachgeordnet. Audit-/Release-/Plattformtest-Blocker bleiben offen. AGENTS.md und Micro-Modus beibehalten; main und andere PRs unverändert lassen.

---

# Aktuelle Übergabe – Spotify-Desktop-Launcher, 22. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11. Gesicherte Basis `3a6d12a8cbb817fa0a8ecacd858ff15dba7c9652`; neue Einheit `Launch installed Spotify desktop client without browser fallback`. SHA im Abschlussbericht/Git-Log.

Abgeschlossen: bestehender Spotify-Eintrag in Registry/Launchpad/statischem Dock startet über authentifizierte parameterlose IPC den validierten lokalen OS-Handler. Browser-Weiterleitung und Demo-Inhalte entfernt. 13/13 Tests sowie Syntax/Catalina-Konfiguration grün. Neue CI prüfen. Kein nativer GUI-Nachweis; OS-Zuordnung ersetzt keine Herausgeber-Signaturprüfung.

Nächste drei kleine Aufgaben:
1. Windows/macOS-Smoke-Test: installierter/laufender/fehlender Spotify-Client, Microsoft-Store-Handler-Kompatibilität; bekannte Einschränkungen dokumentieren.
2. Profilbezogenes Dock-Pinning über vorhandene Registry/Preferences ergänzen. Prozessstatus und externe Fenstersteuerung erst nach separater Plattformprüfung.
3. ChatGPT-Desktop-Launcher mit eigenem Registry-Eintrag nach Prüfung offizieller Startmechanismen; keine unsichere Web-Einbettung. API-Alternative separat, eigener Benutzer-Key und sichere Speicherung, Abonnement ist kein API-Zugang.

Grenzen: Spotify läuft im OS-Fenster; Air-OS kontrolliert dessen Minimieren/Schließen noch nicht und meldet keinen erfundenen Laufstatus. ChatGPT noch nicht implementiert. Audit, Marken-/Release-Prüfung und echte Plattformtests offen. AGENTS.md/Micro-Modus einhalten; main und andere PRs erhalten.

---

# Aktuelle Übergabe – Teil 6 abgeschlossen, 22. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11. Gesicherte Ausgangsbasis `2c5c72b3ded7863ef231bc2133f6c499d9d7d5c2`; neuer Checkpoint `Protect existing Air App staging paths from reuse and cleanup` (SHA im Abschlussbericht/Git-Log).

Abgeschlossen: exklusive Anlage temporärer .install-Ordner. Bestehende Ordner/Dateien/Symlinks am gewählten Ziel führen vor Schreiben/Cleanup zu kontrolliertem Fehler mit Retry-Hinweis. Alte beschädigte/unvollständige Reste bleiben erhalten; ein neuer Versuch installiert aus dem geprüften Katalog in einen frischen Ordner. Kein automatisches Löschen oder Registrieren von Resten.

Tests: 23/23 im gezielten Recovery-/Paket-/Registry-/Launchpad-Lauf bestanden; fünf neue Regressionstests, keine übersprungen. Syntax/Diff grün. Neue CI prüfen. Ausgangs-Installer grün, Security rot; GUI-/Audit-Blocker bleiben.

Nächste drei kleine Aufgaben:
1. Store-Integrationstest für Namenskonflikt des temporären Pfades samt Meldung, Registry-Abwesenheit und Retry.
2. Windows/macOS-Smoke-Test für Installation nach Abbruch.
3. Sichere Diagnose alter .install-Reste spezifizieren, ohne pauschale Bereinigung.

AGENTS.md befolgen: HEAD/PR/CI/Arbeitsbaum prüfen, genau eine kleine Aufgabe, testen und sichern. main und andere PRs erhalten. Race nach erfolgreicher Ordneranlage bleibt gesondert zu prüfen.

---

# Aktuelle Übergabe – Recovery-Integration getestet, 21. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11 Draft. Gesicherte Ausgangsbasis `3751d15d47a5edf2c6c6c45b2630d963bc55be3f`; neue Einheit `Test recovery integration through Store Registry and Launchpad`. SHA im Abschlussbericht/Git-Log.

Abgeschlossen: echter Store-Installieren-Handler → App-Manager-Recovery → Store-Refresh → gemeinsame Registry → bereits geöffnetes Launchpad. Erfolg erzeugt genau einen korrekten Eintrag; manipuliertes Paket und Index-Schreibfehler erzeugen keinen falschen Eintrag. Bestehende Kacheln, Registry-Metadaten und Dateiinhalte einschließlich anderer Nutzer bleiben unverändert.

Gezielter Testlauf: 15/15 grün, keine übersprungen; drei neue Integrationsfälle. Syntax/Diff-Prüfung grün. Nur Tests/Dokumentation geändert. DOM/IPC-Transport als Testadapter, kein echter Electron-GUI-Nachweis; neue CI separat prüfen.

Nächste drei kleine Aufgaben:
1. Datenbewahrende Behandlung temporärer .install-Reste vor Rename spezifizieren/testen.
2. Windows/macOS-Smoke-Test der Store-/Launchpad-Recovery mit echter Electron-Laufzeit.
3. Separater Modern-Channel-Audit ohne unkontrolliertes Legacy-Upgrade.

AGENTS.md befolgen: HEAD/PR/CI/Arbeitsbaum vor nächster Änderung prüfen, genau eine kleine Aufgabe, testen, sichern und stoppen. main und andere PRs unverändert lassen. Audit-/GUI-Blocker bleiben offen.

---

# Aktuelle Übergabe – Teil 4: Installations-Retry abgeschlossen

Stand 21. Oktober 2026. Branch `feat/air-os-architecture-foundation`, PR #11 Draft. Gesicherte Ausgangsbasis `f1a0e775347c7619d2c8565c1418ca150588522d`. Neue Einheit: `Recover verified orphan Air App installations on retry`; SHA im Git-Log/Abschlussbericht. AGENTS.md weiterhin verbindlich: genau eine kleine Aufgabe pro Sitzung.

Abgeschlossen: erneutes Installieren übernimmt nach Crash verbliebene App-Dateien nur nach vollständiger signierter Integritätsprüfung und erfolgreicher Index-Speicherung. Beschädigte/unvollständige/Symlink-Ordner werden ohne Löschen abgewiesen. Bestehender Store synchronisiert danach wie zuvor die Registry.

Fünf neue Recovery-Tests vollständig grün; gezielter Paket-/Manager-Lauf 15 grün mit dokumentierten Plattformgrenzen älterer Tests. Syntax und Diff-Prüfung grün. Neue CI prüfen; Ausgangs-Installer erfolgreich, Security rot. Kein GUI-Nachweis.

Nächste drei kleine Aufgaben:
1. Store-Integrationstest für Registry/Launchpad nach erfolgreichem bzw. fehlgeschlagenem Installations-Retry.
2. Sicheren Umgang mit .install-Resten vor dem Rename festlegen und testen; nichts pauschal löschen.
3. Echter Windows/macOS-Store-Smoke-Test nach Recovery.

Offen: Dependency-Audit/Legacy-Electron, GUI-Tests, Power-Loss-/Race-Grenzen. Vor nächster Änderung GitHub-HEAD/PR/CI und Arbeitsbaum prüfen; main und andere PRs erhalten.

---

# Aktuelle Übergabe – Teil 3 abgeschlossen, 21. Oktober 2026

Dauerhafter Einstieg für „Air-OS weiterentwickeln“: `AGENTS.md` befolgen, aktuellen GitHub-HEAD/Branch/PR/CI und Arbeitsbaum prüfen, diesen und DEVELOPMENT_PROGRESS-Checkpoint lesen. Genau eine kleine Einheit abschließen; keine Gesamt-Neuplanung.

Branch `feat/air-os-architecture-foundation`, PR #11 Draft. Ausgangs-Checkpoint `bd881fa2c570f57b7652f76935c5c11e5d4f1ea3`; neue Einheit `Revoke Air App protocol access after window closure` (SHA im Git-Log/Abschlussbericht). Lokal 72/72 Tests grün. Audit weiter rot; neue CI gesondert prüfen.

Abgeschlossen: Protokollanfragen benötigen eine lebende Profil-/App-Fensterinstanz. Nach Logout/Schließen 403; alte laufende Anfragen bleiben auch nach Neustart gesperrt. Neue Anfragen nach frischem Start funktionieren. Kein Löschen persistenter Daten, kein vollständiger Chromium-Storage-Isolationsnachweis.

Nächste drei kleine Einheiten:
1. Installationsabbruch zwischen Rename und Index-Schreiben reproduzieren und datenbewahrende Recovery implementieren.
2. Echte Electron-GUI-Prüfung der Logout-/beforeunload-/Protokoll- und Profilwechselgrenzen.
3. Gezielte Modern-Channel-Dependency-Stabilisierung mit Audit; Legacy-Kompatibilität erhalten.

main unverändert lassen; andere PRs berücksichtigen. Sicherheitschecks bleiben aktiv. Nach Tests, Commit und Dokumentation kontrolliert stoppen.

---

# Aktuelle Übergabe – Teil 2 abgeschlossen, 21. Oktober 2026

Branch `feat/air-os-architecture-foundation`, PR #11 weiterhin Draft. Ausgangs-Checkpoint `ea51c6f083bfb300355d731d2b4a9b37808abe77`; neue Einheit `Enforce Air App termination on logout and removal`. Exakten SHA im Git-Log prüfen. Lokal 68/68 Tests grün; Teil-1-Installer für Windows/macOS inzwischen erfolgreich, Audit weiter rot.

Abgeschlossen: Host-Cleanup der isolierten Air-Apps ist bei Logout, Deinstallation und Ladefehler nicht mehr durch beforeunload blockierbar. Drei Regressionstests prüfen Veto, Profilfenster-Auswahl, wiederholtes Beenden und Neustart. Kein Autosave und kein vollständiger Session-Isolationsnachweis.

Vor Teil 3 HEAD, Arbeitsbaum und neue CI prüfen. Danach genau eine kleine Einheit:
1. Persistente Session-Partitionen und alte Protokollzugriffe nach Logout prüfen/absichern.
2. Danach Installations-Crash-Recovery zwischen Rename und Index-Persistenz.
3. Danach echter GUI-Test der Logout-/beforeunload-Grenze auf Windows/macOS.

Audit/Legacy-Electron, Code Signing und weitere GUI-Prüfungen bleiben Release-Blocker. main nicht ändern, andere PRs nicht ungeprüft integrieren. Vollständiger Nachweis im aktuellen DEVELOPMENT_PROGRESS-Abschnitt. Keine weitere Einheit vor Teil 3 beginnen.

---

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
