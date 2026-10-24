# Aktueller Checkpoint – F2.1: Windows-Testanleitung auf M2

24. Oktober 2026. Verifizierte M2-Basis/Remote-HEAD **bc5b8dae196aabc62df5ffc3d1710da02289aed2**, eigener reiner Dokumentationsbranch **docs/air-windows-f21-m2-guide-20261024**. [Kurze Windows-Prüfanleitung mit Umgebungskopf, W01–W10, Größen-/Skalierungsmatrix und optionalen lesenden DOM-Messungen](AIR_WINDOWS_F21_M2_TEST_GUIDE.md). Echter Windows-Start laut Benutzerbericht, Commit/Version des Starts noch unbestätigt. Hier weiterhin Debian13/Linux, keine Windows-Sitzung und kein entsprechendes Werkzeug; eigene native Abnahme BLOCKIERT, alle konkreten M2-Windows-Ergebnisse OFFEN.

Anleitung prüft Glass/Birne/Originalicons/Air-OS-Schriftzug, neue/gespeicherte Theme-Auswahl, Home/Notes/Startmenü/Island, M1/M2-Richtungswechsel, Fokus/Tastatur, Profilwechsel, Reduced Motion, CB-02/CB-03 und Windows-Schriften. Physische Displayauflösung, Anzeigeskalierung/Textgröße/App-Zoom, gemessener CSS-Viewport und DPR getrennt. Native760px-Mindestbreite als Quellbefund,390px nicht erzwingen oder per DevTools-Simulation als nativen Test ausgeben. CB-01-K1-Korrektur berücksichtigt; CB-02/03 weiterhin Prüfpunkte, keine unbelegten neuen Fehler-/Erfolgsurteile. Neue synthetische Testprofile statt Änderungen an Bestandsdaten, keine Installeränderung.

Keine neue Windows-GUI, Screenshots oder Messwerte; erst nach Bereitstellung echter Belege auswerten. Neuer Linux-Regressionslauf: **242/242 bestanden**,0 Fehler/Skips, kein Windows-Nachweis. Lokale Dokumentlinks, lesende Mess-Snippet-Syntax und Docs-only-Diff geprüft. PR-/Actions-Zugriff erneut Forbidden, kein CI-Erfolg behauptet. Produktcode/Design/main/PRs/Installer und andere Entwicklungsbranches unverändert. Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen.

Nächste drei getrennte kleine Einheiten: **Benutzer führt W01–W10 auf Windows aus**, **bereitgestellte echte Windows-Belege auswerten**, **F2.2 native macOS-Abnahme**. CB-02/CB-03 erst nach Bewertung separat korrigieren. Nach Dokumentvalidierung/Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – M2: umkehrbare Fensteranimationen

24. Oktober 2026. Verifizierte M1-Basis/Remote-HEAD **ce0ef22d5b4083258fd9a49ff933f92442a86728**, eigener Branch **fix/air-window-interruptible-m2-20261024**. Ausschließlich vorhandene Fensteranimations-/Dock-Startwege in app.js: Modern-Minimieren/Restore teilen410ms-WAAPI im bestehenden Motion-Slot; reverse() erhält live currentTime/Translate/Scale/Opacity. Zielbahn einmal aus bestehendem dockMotionValues bestimmt, keine Neuberechnung aus skaliertem Zwischenrect. Identität/Generation/Verbindung schützen alte Completions. Close während Minimize/Restore, Reopen vor/nach Abschluss, pointerEvents/display/Fokus und bestehende Lifecycle-/Dock-Markierung bleiben konsistent. Neue App-Starts weiter synchron, Classic-Pfad unverändert. Keine neue Bibliothek/zweiter Window Manager.

**242/242 Linux-Tests bestanden**,0 Fehler/Skips; sieben neue deterministische WAAPI-/Lifecycle-/Close-/Cleanup-/Reduced-Motion-/Classic-Regressionen. Bestehende isolierte Spotify-Dock-Fixture um neuen Fensterkontext ergänzt, Sicherheitsassertionen erhalten. Echte Linux/Electron32.3.3-/Sandbox-/Xvfb-Prüfungen bei1920×1080,1650×930,390×600: je8 laufende Umkehrungen mit maximalem unmittelbarem x/y/Breite/Höhe-/Opacity-/Zeit-Sprung0; zusätzliche echte Dock-Mausklicks, Close/Reopen, zwei Fenster, Fokus/Lifecycle/Dockzustand, maximierte Rundreise, beide Reduced-Motion-Wege und Laufzeit-Mediawechsel, Logout/neues Profil bestanden. Sechs echte Screenshots,24 Umkehrpaare als JSON, keine Rendererfehler, finaler Helferlauf Exit0. Syntax/Catalina/Diff bestanden.

[Bericht, Messwerte und Screenshots](AIR_WINDOW_MOTION_M2.md). Fensterrest-/Maximierungsmaße vor/nach identisch. CSS/Glas/Birne/Docklayout/Island/M1/Preferences/Installer-Dateien unverändert; gemessene Dock-/Island-Geometrien/Flächen und Originalicons erhalten. Kein FPS-/Feder-/Hardwareversprechen. Native Windows/macOS und CB-02/CB-03 offen. PR-/Actions-API erneut Forbidden, kein neuer CI-Erfolg behauptet. Audit-/Signing-/Notarisierungs-/Release-Blocker unverändert. main/PRs/Installer/andere Entwicklungsbranches unverändert.

Nächste drei separate kleine Einheiten: **F2.1 native Windows-Abnahme**, **F2.2 native macOS-Abnahme**, danach **eine bestätigte CB-02/CB-03-Abweichung** separat korrigieren. Nach Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – M1: unterbrechbare Island-Animation

24. Oktober 2026. Verifizierte Soft-Glass-Basis/Remote-HEAD **3d5bd3d117925ef3de2eb03f91dc21bdfae894ca**, eigener Branch **fix/air-island-interruptible-m1-20261024**. Nur bestehende Island-Animation: Modern nutzt eine gemeinsame140ms-WAAPI-Zeitleiste statt CSS-Einstieg/separatem120ms-Ausstieg. reverse() behält live currentTime/Opacity/Transform; Identität+Generation schützen vor veralteten Abschlusscallbacks derselben umgekehrten Animation. Frisches Öffnen Kontrollzentrum; unterbrochenes Wiederöffnen behält sichtbare K3-Ansicht/Panelhöhe. Inert/Fokus/aria sofort korrekt; ausstehender K3-Launch schon bei Close invalidiert. Media-Reduced-Motion-Wechsel/Settings/Hidden/Pagehide räumen Effekt sicher auf, Listener beim Dispose entfernt. Classic-CSS-Einstieg und unmittelbarer Close unverändert.

**235/235 Linux-Tests bestanden**,0 Fehler/Skips; Island23/23. Drei zusätzliche M1-Regressionen für Richtungswechsel/Zeitposition/alte Callbackgenerationen, K3-Ansicht/Launch-Stale und Reduced-Motion/Dispose. Echte Linux/Electron32.3.3-/Sandbox-/Xvfb-GUI bei1920×1080,1650×930,390×600: je12 laufende Umkehrungen, maximaler unmittelbarer Positions-/Opacity-/Zeit-Sprung0; sechs echte Screenshots plus Rohdaten. animation.ready berücksichtigt asynchronen Playback-Rate-Wechsel. Vier echte K3-App-Starts je Größe, Fensterfokus, Escape/Outside-Click, beide Reduced-Motion-Wege/Wechsel während Bewegung und Classic bestanden. Dock/Island-Geometrie, Glasdarstellung und Originalicon-SVGs exakt gegen Soft-Glass-Messwerte unverändert. Keine Rendererfehler, finaler Helferlauf Exit0. Syntax/Catalina/Diff bestanden.

[Bericht, Messwerte, Screenshots und Grenzen](AIR_ISLAND_MOTION_M1.md). Keine Spring-/FPS-/native Windows-/macOS-Garantie. Kein Glass-/Logo-/Dock-/Home-/Window-Manager-/Preference-/Installer-Code geändert, keine Bibliothek/Timer hinzugefügt. PR-/Actions-API erneut Forbidden, kein neuer CI-Erfolg behauptet. Audit-/Signing-/Notarisierungs-/Release-Blocker und CB-02/CB-03 bleiben offen. main/PRs/Installer/andere Entwicklungsbranches unverändert.

Nächste drei getrennte kleine Einheiten: **F2.1 native Windows-Abnahme**, **F2.2 native macOS-Abnahme**, danach **eine bestätigte CB-02/CB-03-Abweichung** separat korrigieren. Nach Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – Air Modern: dezentes Glas und freigestellte Birne

24. Oktober 2026. Basis/Remote-HEAD **f65e7683d70904183b1217d2bc16e73bb6b60036**, eigener Branch **theme/air-modern-soft-glass-20261024**. Benutzerbeauftragte zusammenhängende Designkorrektur: neue eindeutig registrierte Profile ohne bestehende Preferences erhalten nun Desktop UND Dock Modern; gespeicherte Entscheidungen und Altprofile konservativ erhalten. Modern-Dock/Island dezent transparent, Dock an allen vier Ecken rund, eigene vorhandene Birnen-Vektorsilhouette weiß ohne schwarzen Bildkasten, andere Originalicons bytegleich mit dezentem Kontrastuntergrund, Air-OS links nur Schriftzug mit erhaltenem Menü/Fokus. Bestehendes Reduce Glass auch an geschlossener Island respektiert; keine neue Preference/Registry/Animation/Dependency.

**232/232 Linux-Tests bestanden**,0 Fehler/Skips; echte getrennte Linux/Electron32.3.3-/Sandbox-/Xvfb-Vorher-/Nachherprüfungen bei1920×1080,1650×930,390×600,18 Screenshots und JSON. Dock358×68 unten0, Island250×45 /214,84×38,67 /156×36 oben0, Air-Home- und Classic-Geometrien exakt gegen unveränderten K3-Stand bestätigt. Menü/Suche/Tastatur/Fokus, Kontrollzentrum/Schnellzugriff, große Classic-Launchpad-Ansicht, bestätigtes Pin/Unpin, echter Notes-Save, gespeicherte Auswahl/Pins nach Reload, Glasreduktion/Forced Colors und keine Rendererfehler geprüft. Erste SVG-Maske zeigte im390px-GUI nach Themewechsel einen weißen Block; durch referenzfreien vorhandenen Birnenpfad behoben und alle Größen neu geprüft. Syntax/Catalina/Diff bestanden.

[Bericht, sichtbare Vorher-/Nachherbilder, Messwerte und Abweichungen](AIR_MODERN_SOFT_GLASS.md). Kein Pixel-Diff gegen die nur im Chat sichtbaren Benutzerbilder; eigenes weiches Wallpaper/funktionale statt fremde Referenzinhalte erhalten. Linux kein nativer Windows/macOS-Beleg. Bekannte Audit-/Signing-/Notarisierungsblocker unverändert; PR-/Actions-Zugriff nicht verfügbar, kein neuer CI-Erfolg behauptet. main/PRs/Installer/andere Entwicklungsbranches unverändert.

Nächste drei separate kleine Einheiten: **F2.1 native Windows-Abnahme**, **F2.2 native macOS-Abnahme**, **M1 Island-Unterbrechbarkeit**. CB-02/CB-03 offen. Nach Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – K3: Schnellzugriff im bestehenden Island-Panel

24. Oktober 2026. Bestätigte K2-Basis/Remote-HEAD **41d7d67d11c46928ba6fa171a4730b9ac9cacb73**, eigener Branch **feat/air-island-quick-access-k3-20261024**. Genau eine neue flüchtige Ansicht: bestehendes Panel erhält Kontrollzentrum/Schnellzugriff als beschriftete Buttons mit aria-pressed/aria-controls. Öffnen beginnt immer im Kontrollzentrum. Inaktive Inhalte hidden UND inert; aktive Regionsbeschriftung folgt der Ansicht. Kein zweiter Host, keine zweite Registry/Lifecycle/Preferences-Option.

Vier Karten referenzieren ausschließlich home/notes/reminders/finder, lesen die tatsächlichen Registry-Namen und rufen openApp auf. Erfolgreicher Start schließt das Panel, Fokus geht in sichtbare Inhalte des existierenden internen Fensters. Der GUI-Lauf fand beim Finder ein verborgenes Editorfeld als erste Eingabe; nur die neue Fokusübergabe wurde so korrigiert, dass hidden/inert/unsichtbare Ziele übersprungen werden. Finder-/Window-Manager-Code unverändert. Fehler bleiben mit Retry sichtbar, Doppelstart und verspätete Antwort nach Close/Reopen werden verworfen.

Iconwahl mit Benutzer geklärt: Air Home hatte keinen eigenen registrierten Iconeintrag; nur seine neue Schnellkarte verwendet ausdrücklich das vorhandene Air-OS-Birnenlogo. Kein globaler Home-/Launchpad-/Pinning-Iconeintrag geändert. Notes/Erinnerungen/Finder verwenden originale statische Icon-Daten bzw. Dock-SVGs. Namen ausschließlich textContent, kein Metadaten-HTML. Unregistrierte App-Karte sicher deaktiviert, kein falscher Start.

**231/231 Linux-Tests bestanden**,0 Fehler/Skips. Sechs neue Island-Regressionen für Default/Wechsel/Reset, hidden/inert, vier bestehende Startpfade/Registry-Namen/Originalicons/Fokus, Fehler/Retry/Doppelstart/stale Completion, Classic/Pagehide/Registry-Unsubscribe, sichere Namen/fehlende Apps und versteckte Finder-Fokusziele. Vorhandene Clock-/Speicherfehler-/Session-/Notes-/Volume-/Reduced-Motion-/Animationscleanup-Tests erhalten. Syntax, Catalina-Konfiguration und Diff geprüft.

Echte Linux/Electron32.3.3-/Sandbox-/Xvfb-Vorher-/Nachher-Läufe bei1920×1080,1650×930,390×600: unveränderter K2-Test-Worktree und K3 nacheinander in getrennten Wegwerfprofilen, neun Screenshots plus JSON-Messwerte. Island geschlossen250×45 /214,84×38,67 /156×36px, immer y0; Dock sechs Standardicons358×68px unten0 unverändert. Panelbreiten430/430/366px und x/y identisch; Kontrollzentrum nun334px hoch statt284px durch50px-Ansichtsnavigation, Schnellzugriff270px. Auf390: Panel y44, unterer Rand maximal378px vor Notes-Mitteilung, Dock y532. Längere Inhalte begrenzt/vertikal scrollbar, kein horizontaler Overflow.

GUI bestätigt vier echte Starts je Auflösung und sichtbares Fokusziel im jeweiligen Fenster, Tab/Enter/Space, sofortiges Press-Feedback, Escape/Trigger-Fokus und Outside-Click. Klassische Panel-Skin/Geometrie gegen K2 identisch. Alle vorhandenen Einstellungen nach Kartenstarts unverändert; Dock- und Desktop-Theme-Schalter, Refresh, deaktivierte Hardwarekacheln/Helligkeit, echte Notes-Mitteilung ohne Titel/Inhalt und echte lokale Air-Music-Lautstärke32% geprüft. OS- und Air-OS-Reduced-Motion, neuer Bob-Login mit Control-Default/keiner alten Notes-Mitteilung, keine Rendererfehler. [Vergleich, Messwerte und Grenzen](AIR_ISLAND_QUICK_K3.md).

Keine neuen Timer, Spring-Logik, Datenquellen oder Host-Steuerung; bestehende120/140ms-Panelanimation bleibt für M1. K2/Notes/Home/Registry/Dock-/Window-Manager-/Installer-Code nicht angefasst. Native Windows/macOS und CB-02/CB-03 bleiben offen. Supaste bleibt nicht visuell verifiziert, Hybridwerte eigenständiger Entwurf. Actions-API Forbidden, keine neue CI-Zusage; Audit-/Signing-/Notarisierungsblocker unverändert.

Nächste drei getrennte Einheiten: **M1** Island-Unterbrechbarkeit/Richtungswechsel; **F2.1** native Windows-Abnahme; **F2.2** native macOS-Abnahme. main/PRs/Installer/andere Entwicklungsbranches unverändert. Nach Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – K2: Hybrid-Startmenü mit zwei echten Filtern

24. Oktober 2026. Bestätigte K1-Basis/Remote-HEAD **3dacfc4316c2f8081c91a7c289b09b7b5bedb23f**, eigener Branch **theme/air-start-menu-hybrid-k2-20261024**. Ausschließlich bestehendes Startmenü: Modern-dunkle Fläche#101517, Such-/Zeilenfläche#171e21, Text#f2f5f3/#b5c1ba, Mint-Fokus,40px-Suche, kompakte Originalicon-Zeilen und getrennte Pin-Aktion. Native Scrollbar erhält nur innerhalb der Modern-Menüfläche color-scheme:dark. Genau zwei Chips „Alle“/„Angeheftet“, sichtbarer Zustand und aria-pressed; keine zusätzliche Datenquelle/Registry/Lifecycle/Preferences-Option.

Filter liest ausschließlich airDockReferences(dockPins): null vollständige Standardreferenzen,[] keine angehefteten Apps, explizite Arrays als Mitgliedschaft. Startmenü-Pflichtbutton bleibt über das Dock erreichbar und ist kein zusätzlicher Default-Pin. Nicht registrierte Referenzen werden nicht angezeigt, aber niemals gelöscht. Suche nach Namen/IDs mit beiden Filtern kombiniert. Filterzustand nur flüchtig, beim Öffnen Alle. Pin/Unpin weiterhin über bestätigten vorhandenen Adapter, Fehler/Retry/Profile-Sitzungsprüfung erhalten.

Suchfeld und Chips bleiben bei ausstehendem App-Start/Pin-Write bedienbar; doppelte Start-/Pin-Mutationen weiterhin gesperrt. Benutzerinteraktion wird gezählt, damit eine spätere Pin-Antwort während weiterer Suche keinen Fokus stiehlt. Lade-/Fehlertexte werden nicht von einem bloßen Rerender überschrieben, reine Trefferzusammenfassungen aktualisieren sich bei geändertem Pin-Satz. Sofortiges Press-Feedback ohne Nachschwingen; OS- und Air-OS-Bewegungsreduktion geprüft. Kein neuer Timer und keine Animationsbibliothek.

**225/225 Linux-Tests bestanden**,0 Fehler/Skips. Acht neue Controller-Regressionen für Standard-/Leer-/unbekannte Pins, beide Suchfilter/Leertreffer, bestätigte Pins, Texteingabe während Pin/Launch, Fehler/Retry, Fokus, transiente Filter/Classic und geänderten Profil-Pin-Satz. Bestehende echte Preferences-/Profil-/Race-/Sicherheitsregressionen erhalten. Gezielt verzögerte Antworten/Fehler mit markierten API-/DOM-Doubles, tatsächliche Persistenz zusätzlich GUI. Syntax, Catalina-Konfiguration und Diff geprüft.

Echte Linux/Electron32.3.3-/Sandbox-/Xvfb-Vorher-/Nachher-Läufe an1920×1080,1650×930,390×600. Vorher unveränderter K1-Code in eigenem detached Test-Worktree mit separatem Wegwerfprofil, danach K2 ebenfalls isoliert; nacheinander, keine Installer-Builds. Neun Screenshots (drei Vorher, drei Nachher, drei Angeheftet) und Messdaten. Menü unverändert480×440px bei720/562 bzw.585/412,366×440px bei12/82, jeweils10px über Dock. Dock mit sechs Standardicons358×68px unten0; Island oben0 mit identischen Koordinaten. Kein Dock-Scrolling/Horizontaloverflow, nur Trefferbereich vertikal scrollbar. Classic-Skin einschließlich Geometrie gegen echten K1-Stand identisch.

GUI prüft Registry-Vollständigkeit, Original-SVGs/kein Filter, echte Standard-/Leer-Pins und Pin/Unpin ohne App-Start, Suche, Enter/Space/Tab/Pfeile/Escape/Fokusrückgabe, unmittelbares Press-Feedback, beide Reduced-Motion-Wege, Reload/Alice-Bob-Re-Login mit getrennten Pins und erhaltenen unbekannten Referenzen; Classic-Dock öffnet weiterhin großes Launchpad. Keine Rendererfehler. [Vergleich, Messwerte und Einschränkungen](AIR_START_MENU_HYBRID_K2.md).

Modern-Stil/Chips gelten nur für desktopTheme=modern; vorhandener Menü-Einstieg hängt weiter unabhängig von dockTheme=modern ab. Classic-Desktop+Modern-Dock behält alte Menüoptik ohne Chips; Classic-Dock behält großen Launchpad-Weg. Kein Dock-/Island-/Control-/Notes-CSS, kein App-/Profil-/IPC-/Speicherformat geändert. Native Windows/macOS und CB-02/CB-03 bleiben offen. Supaste weiter nicht visuell verifiziert; Hybrid-Werte sind eigenständiger Entwurf, keine1:1-Behauptung. Actions-API Forbidden, keine neue CI-Zusage; bekannte Audit-/Signing-/Notarisierungsblocker bleiben.

Nächste drei separate Einheiten: **K3** genau einen Bereich der bestehenden Island-Schnellzentrale verfeinern; **F2.1** echte Windows-Abnahme; **F2.2** echte macOS-Abnahme. main/PRs/Installer/andere Entwicklungsbranches unverändert. Nach Commit/Push STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – K1: Notes-Sekundärtext-Kontrast CB-01 korrigiert

24. Oktober 2026. Bestätigte F2.1-Basis/Remote-HEAD **617b1b293ef5a5b075c2c5819c0b84238731e1a3**, eigener Branch **fix/air-notes-secondary-contrast-k1-20261024**. Ausschließlich zwei Farbdeklarationen in styles.css geändert: Modern-Notes-Status und gemeinsame Input-/Textarea-Placeholder-Regel von#677e6c auf#5f7464. Große Titel-Placeholder dürfen dieselbe Farbe erhalten. Kein globales Sekundärtext-Token verändert; keine Geometrie-/Font-/Spacing-/Animations-/Funktionsänderung. CB-02 und CB-03 unberührt.

**217/217 Linux-Tests bestanden**,0 Fehler/Skips. Ein neuer Farb-/Flächen-Kontrasttest liest tatsächliche CSS-Deklarationen, prüft beide normalen Textfälle gegen4,5:1 und alten Wert als Negativfall; bestehender Modern-/Notes-Scope-Test sowie Notes-/E3-/Profil-/Race-Tests weiter aktiv. Syntax, Catalina-Konfiguration und Diff geprüft. Keine neue Dependency oder IPC-/Datenformatänderung.

Echter Linux/Electron32.3.3-/Sandbox-/Xvfb-Test bei1920×1080,1650×930,390×600: Vorher aus exaktem styles.css des Ausgangscommits im selben isolierten Renderer geladen; Nachher aktuelles Stylesheet, jeweils unveränderte DOM-/Testdaten und gleiche Auflösung. Sechs echte Screenshots. Tatsächlich berechnete Farbe#5f7464 auf opakem Creme#f8f7f3, Placeholder-opacity1; Kontrast vor4,1003483213:1, nach4,6991984843:1 für Status UND Textarea-Placeholder. Chromium128 meldet per getComputedStyle(::placeholder) die Elternfarbe; deshalb tatsächlichen sichtbaren UA-Placeholder-Knoten per CDP/CSS.getComputedStyleForNode geprüft. Kein erfundener Pixelwert.

Alle22 Notes-DOM-Geometrien je Auflösung vor/nach identisch; bestehende Font-/Padding-/Konturwerte unverändert. Randloser Statusspan erhält implizit andere currentColor-borderColor, borderWidth bleibt0; keine Bedienkontur geändert. Classic vollständig identisch, Home-/Widget-/Dock-/Island-Oberflächen und Positionen ebenfalls. Echter Notes-Save/Delete aktualisiert Home/Island weiterhin; keine Rendererfehler. [Vorher/Nachher und Messdaten](AIR_NOTES_CONTRAST_K1.md).

Native Windows-F2.1 und macOS-F2.2 bleiben offen/blockiert, Linux kein Ersatz. Actions-API weiterhin Forbidden, keine neue CI-Zusage. Bestehende Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen. main/PRs/Installer/andere Branches unverändert. Nächste drei separate Einheiten: echte Windows-F2.1, echte macOS-F2.2, K2 Startmenü gemäß Hybridplan. Nach Sicherung STOP; neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – F2.1 Windows-Abnahme: BLOCKIERT

24. Oktober 2026. Bestätigter Ausgangscommit/Remote-HEAD **1866281571b04ad74efdf549d665eae68842d254**, eigener Berichtszweig **docs/air-notes-windows-f21-20261024**. Ausschließlich Abnahme/Dokumentation, keine CSS-/JS-/Funktionsänderung. [F2.1-Prüfbericht](AIR_NOTES_WINDOWS_F21_REVIEW.md).

**Keine native Windows-Umgebung verfügbar:** Debian13.6/Linux6.18.55/x64, Node24.19.0; keine Windows-Sitzung oder entsprechendes Ausführungswerkzeug angebunden. Electron32.3.3 nur als Paketversion festgestellt, keine GUI gestartet. Alle nativen Prüfungen bei1920×1080,1650×930,390×600 BLOCKIERT. Keine Windows-Version/Skalierung/Font-/Hitbox-/Fenster-Messwerte oder Screenshots erfunden; Linux-/Emulationsbelege nicht als Windows ausgegeben.

Separat bestätigte Code-/Rechenbefunde: #677e6c auf Creme **4,10035:1**, betroffen Notes-Status12/11px und Textarea-Placeholder14/13px; Titel-Placeholder24/30px gegen große Schrift3:1 separat bewerten. Kandidat#5f7464≈4,69920:1 unverändert. CSS deklariert Traffic-Buttons10×10px, tatsächliche Windows-Hitbox offen. Rand#b8bcb6≈1,79610:1, funktionale Relevanz nativ zu prüfen. Keine dieser Stellen korrigiert. Quellbefund BrowserWindow-minWidth760:390px-Nativfenster-Erreichbarkeit muss ausdrücklich geprüft werden.

**Neuer tatsächlicher Linux-Testlauf:216/216 bestanden,0 Fehler/Skips**; Catalina-Konfiguration bestanden. Kein nativer Windows-/macOS-Erfolg. Vorhandene Regressionen bleiben aktiv. PR-/Actions-Abfrage Forbidden, keine neue CI-Bestätigung. Quellen/Kontrast/Dokumentlinks/Whitespace und Docs-only-Diff geprüft. Bekannte Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen. main/PRs/Installer/andere Entwicklungsbranches unverändert.

Nächste drei getrennte Schritte: (1) F2.1 auf echter Windows-Sitzung nach dokumentiertem Ablauf vervollständigen; (2) F2.2 native macOS-Abnahme separat; (3) K1 genau eine nachgewiesene Kontrast-/Hitboxabweichung separat korrigieren. K2 danach als eigener Auftrag. Nach Commit/Push STOP, keine weiteren Arbeiten im Hintergrund. Neuer SHA im Abschlussbericht.

---

# Aktueller Checkpoint – Air-OS Ultimate Hybrid: Konzept vor F2

24. Oktober 2026. Bestätigter F1-Remote-HEAD **4cae58f367c76cdc9d8989fe35970df58d13ac07**, eigener Dokumentationsbranch **docs/air-os-hybrid-design-20261024**. Nur der vom Benutzer beauftragte Designplan, keine F2-Implementierung oder zusätzliche App-Funktion. [Konkreter Hybrid-Plan](AIR_OS_ULTIMATE_HYBRID_DESIGN.md) ergänzt die bestehende Mint-/Creme-/Wolken-/Originalicon-Identität um kompakte dunkle Such-/Schnellflächen und Apple-inspirierte Interaktionsregeln. Neue Token-/Maßwerte sind reviewfähige Vorschläge, bestehende gemessene Geometrien als Baseline festgehalten.

Apple-Design-Skill vollständig gelesen und auf **2d228630ba1446365f614a108cb8252f1feda202** fixiert, MIT-Lizenz geprüft; keine Quelle/Assets/Beispielcodes übernommen. Drittanbieter-WWDC-Zusammenfassung, keine offizielle Apple-Vorgabe. Supaste ist **nicht visuell verifiziert**: www und Apex HTTP403/CONNECT Forbidden; isolierter Electron-Browser ERR_TUNNEL_CONNECTION_FAILED. Supaste-Richtung ausdrücklich aus Benutzerbriefing abgeleitet, keine erfundenen beobachteten Farben/Maße. Exakte Supaste-Annäherung benötigt erreichbare Referenzbilder; der Plan weist diese Grenze offen aus.

Belegte Konzeptbefunde: #677e6c auf #f8f7f3≈4,10:1 (kleiner Text unter4,5:1), Vorschlag#5f7464≈4,70:1; bestehende Traffic-Light-Trefferflächen und feste Animationen sind F2-Prüfpunkte. Keine dieser Stellen geändert. Bestehende Island-Reopen-/Minimierungswege aus Code gelesen; unterbrechbare, positionsstetige Federbewegung noch kein bestätigter Ist-Zustand. Konkrete Material-/Typografie-/Responsive-/Keyboard-/Datenschutzregeln und kleine spätere Einheiten dokumentiert.

Validierung dieser Sitzung: Quellenabruf/Hash, vorhandene JSON-Geometrien, Kontrastberechnung, lokale Dokumentlinks, Whitespace und ausschließlich Docs-Diff. **Keine neue Testsuite oder App-GUI-Abnahme ausgeführt**; F1-Belege216/216 und Screenshots bleiben historische Basis. main/PRs/Installer/Produktcode unverändert. Bestehende Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen.

Nächste drei kleine Einheiten: (1) erreichbare Supaste-Belege ergänzen und Konzept prüfen; (2) erst nach Freigabe F2-Windows-Abnahme; (3) F2-macOS-Abnahme, danach jeweils nur eine separat beauftragte Korrektur. Keine Umsetzung im Hintergrund. Neuen Dokumentations-SHA im Abschlussbericht nennen.

---

# Aktueller Checkpoint – F1: Air Notes im Air-Modern-Design

24. Oktober 2026. Bestätigter E3-Remote-HEAD **b57da11ea7952d7d2000955f9eadaae42249ee28**, eigener Branch **theme/air-notes-modern-f1-20261024**. Ausschließlich visuelle Notes-Integration: vorhandenes Notes-Fenster erhält `air-notes-window`, alle neuen CSS-Selektoren benötigen `html[data-desktop-theme="modern"]` UND diese Klasse. Mint-Rahmen#9cdaa1/36px-Titelleiste, hellgrüne Liste#b0e5ad, cremeweißer Editor#f8f7f3, dunkelgrüne Texte, feine Rahmen, Georgia-Titel, Systemschrift, dezente Auswahl/Hover und sichtbarer Tastaturfokus. Keine neue Glasfläche/Farbverlaufsfläche. Andere Fenster und Classic behalten ihre Regeln.

Responsive: auf großen Displays190px-Liste links, auf390px100px-hoher Listenbereich oben mit separat scrollbarer Notizliste; Editor darunter. Speicherstatus und Aktionsbuttons bleiben erreichbar. Bestehende Fenstermaße, Verschieben, Minimieren/Maximieren/Restore/Schließen und Startmenü-Pfad weiterverwendet. Keine neue Fensterverwaltung. Notes-/E3-Logik, Datenformat, Main/IPC/Preferences und Profilverwaltung unverändert.

**216/216 Node-Tests bestanden**,0 Fehler/Skips. Neue CSS-Isolationsregression prüft alle Selektorzweige inklusive Responsive-/Fokus-Regeln auf Modern UND Notes, sodass Classic/andere Apps nicht versehentlich getroffen werden. Alle215 bestehenden Funktion-/Session-/Race-/Store-/Sicherheitsprüfungen weiter grün, insbesondere fehlgeschlagenes Speichern/Retry und neuere ungespeicherte Eingaben während eines Saves. Syntax, Catalina-Konfiguration und Diff geprüft.

Echter Linux/Electron32.3.3-/Sandbox-/Xvfb-Lauf bei1920×1080,1650×930,390×600 erfolgreich: berechnete Mint-/Creme-Farben/keine neue Hintergrundgradienten- oder Blurfläche, Classic→Modern→Classic ohne Neustart. Classic-Skin mit temporär deaktivierten neuen F1-Regeln und vollständigem Vor-F1-CSS verglichen, identisch; Notizen/Editor/Listenselektion/Buttons einbezogen. Stabile Messung nach Ende vorhandener CSS-Transitions. Styles von Home/Dock/Island zusätzlich mit/ohne F1-Regeln verglichen, unverändert; Original-Dock-SVGs identisch. Startmenü-Start, Notes-Neu/Bearbeiten/Speichern/Auswählen/Löschen, E3-Live-Übersicht, Island-Speichermitteilung, Fokus, Drag/Maximize/Restore/Minimize/Reopen/Keyboard-Close, Logout/Bob-Leerprofil/Alice-Re-Login-Persistenz geprüft. Keine Rendererfehler. Ausschließlich synthetische Daten, reduzierte Bewegung im Test aktiv. [Screenshots, Geometrie und Abweichungen](AIR_NOTES_MODERN_F1.md).

Gemessenes Notes-Fenster:1920 bei525/244,719 und1650 bei390/180,219 jeweils870×480px; Sidebar190px, Editor664×436px.390 bei6/91,378×433px; Liste362×100px, Editor362×289px. Kein horizontaler Content-Überlauf; Titel/Inhalt/Neu/Löschen/Sichern innerhalb des Fensters. Nur40 neue eng begrenzte CSS-Zeilen und eine Notes-Klassenzuordnung produktiv geändert; kein Verhalten der anderen Apps angepasst.

Actions-API weiterhin Forbidden: keine neue CI-Bestätigung/Windows-/macOS-Hardwareabnahme. Audit-, Signing-, Notarisierungs- und Release-Blocker bleiben offen. main, PRs, Installer/Manifeste, Notes-Controller und neue Widgetfunktionen unangetastet. Kein Referenzbild speziell für Notes in diesem Prompt; vorhandenes Air-Home-Design/Farbkonzept als verbindliche Vergleichsbasis verwendet. Keine pixelidentische Abnahme behauptet; Plattform-Fontmetriken, native Controls/Scrollbars und bekannte Hintergrundabweichungen bleiben für F2.

Nächste drei kleine Einheiten: **F2 Windows** native visuelle/Bedien-Abnahme; **F2 macOS** Intel/Apple-Silicon-Abnahme soweit vorhandene Hardware; danach genau eine nachgewiesene F2-Abweichung korrigieren. Keine weitere App in dieser Sitzung. Neuen SHA im Abschlussbericht nennen; nach Push Sitzung beenden.

---

# Aktueller Checkpoint – E3: automatische bestätigte Widget-Aktualisierung

24. Oktober 2026. Bestätigte E2-Basis und Remote-HEAD **9b584ce75fd6b956f9fb991a7c02286aa38868b4**, eigener Branch **feat/air-home-live-updates-e3-20261024**. Vollständige kleine E3-Einheit für beide vorhandenen Widgets; kein E3.2-Rest. Notes: bestehendes `air-notes-saved` unverändert als inhaltsfreies Save-Signal; neu `air-notes-changed` nach bestätigter Löschung. Reminder: `air-reminders-changed` nach bestätigtem Neu-/Bearbeiten-Speichern, Erledigt/Offen-Markieren und Löschen. Home liest jeweils aus dem vorhandenen authentifizierten Store neu. Keine privaten IDs/Titel/Details/Sitzungen im Event, keine neue IPC/Datenbank/Timer/Polling.

Publisher sind an ursprüngliche preferenceSession und gültiges auslösendes App-Fenster gebunden; nach Logout/Profilwechsel/Schließen unterdrückte alte Bestätigungen. Vor Veröffentlichung wird die aktuelle Sitzung erneut geprüft. Mutationsereignis folgt direkt auf Write-Acknowledgement, vor dem separaten Neuladen der Editorliste. Fehlgeschlagene Writes senden nichts. Bestehende Widget-Prüfungen vor/nach Read, Generation gegen alte Antworten, sofortiges Leeren und Cleanup bei Close/Logout/pagehide bleiben erhalten; neue Listener werden beim Close entfernt, Mount bleibt idempotent. Keine neue Aktualisierungsschleife.

Ein durch neue Regression nachgewiesener vorhandener Fehler im Reminder-Mutationspfad wurde gezielt behoben: nach bestätigtem Refresh waren neu gezeichnete Checkboxen dauerhaft disabled, weil busy noch true war. Nach Aufhebung von busy wird die Liste jetzt erneut gezeichnet; Erledigt→Offen ist dadurch wieder bedienbar. Keine neue Funktion/Optik.

**215/215 Node-Tests bestanden**,0 Fehler/Skips. Neun neue Tests: echte temporäre Stores mit DOM-/API-Doubles für Notes-Löschung/Fehler, Reminder-Neu/Edit/Erledigt/Offen/Löschen samt Fehlern, payloadfreie Events, alte Write-Antwort nach Profilwechsel bzw. neuer gleicher Profilanmeldung, Listener-Cleanup/mehrfacher Mount/Reopen; neue Widgettests für Notes-Änderungsereignis, schnelle Reminder-Ereignisse/ältere Ladeantworten und Profilwechsel während ereignisgetriebenem Read. Vorhandene Sicherheits-/Datums-/Sessiontests erhalten. Zwei alte Notes-Editor-Fixtures erhalten EventTarget-/currentUser-Stubs statt nicht mehr vollständiger Minimal-DOMs. Syntax, Catalina-Konfiguration und Diff geprüft.

Echter Linux/Electron32.3.3-/Sandbox-/Xvfb-GUI-Lauf bei1920×1080,1650×930,390×600 erfolgreich: alle acht bestätigten Änderungsereignisse pro Auflösung (2 Notes-Saves,1 Notes-Delete,5 Reminder-Aktionen), automatische Widgetänderung ohne manuelles Aktualisieren/Schließen, Ereignisse ohne Payload, echte vorhandene Apps und synthetische isolierte Daten. Weiter geprüft: geschlossenes/neues Home, sofortiger Logout-Scrub, leeres Bob-Profil, Classic, identische Dock-SVGs, Randabstände0, keine Rendererfehler. [Screenshots, Maße und Ereignisvertrag](AIR_HOME_LIVE_E3.md).

**Keine CSS-/HTML-/App-Registry-/Preferences-/IPC-/Installeränderung**. Fenster unverändert1522×849 bei200/103;1307,969×731,078 bei171,875/93;366×430 bei12/91. Notes-Kachel380×384 /326,09×330 /299×180. Due-Kachelhöhe variiert wie zuvor mit der Eintragszahl; Screenshots nach den Mutationen zeigen zwei offene Aufgaben, keine Geometrie-Neugestaltung. Kalender/Projekte/Fokus weiter Demnächst.

Actions-API weiterhin Forbidden: keine neue CI-/native Windows-/macOS-Abnahme behauptet. Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen. main, bestehende PRs, E2- und Installer-Branches unberührt; keine Dependencies. Ereignisse gelten für diese Renderer-App-Aktionen, nicht für direkte externe Storeänderungen oder automatische Mitternachtsaktualisierung. Bei nicht bestätigbarer Sitzung kein Signal; manuelles Aktualisieren/Reopen bleibt verfügbar. D1-Designabweichungen unverändert.

Nächste drei getrennte Einheiten: **F1** genau eine vorhandene App optisch an Mint/Creme anpassen; **F2** deren plattformspezifische visuelle Abnahme separat; danach eine weitere ausdrücklich ausgewählte kleine App-/Widget-Aufgabe. Neuen SHA im Abschlussbericht nennen; nach Push Sitzung beenden.

---

# Aktueller Checkpoint – E2: echte offene Erinnerungen in Air Home

24. Oktober 2026. Bestätigter E1-Remote-HEAD **a6d2d88b5df6d4944ff55545026d27052e0e1ce7**, eigener Branch **feat/air-home-reminders-e2-20261024**. Genau ein Widget: bestehende `.air-home-due` mit „Heute & demnächst“, höchstens drei offene Einträge aus `window.airOS.reminders.list()`, echte Titel und kleine Fälligkeitsangaben. Erledigte Einträge ausgeschlossen. Gültige Date-only-Werte werden aufsteigend als Kalendertage sortiert: überfällig, heute, zukünftig, zuletzt ohne Datum. Kein UTC-Parsen für die Einordnung; lokale Jahres-/Monats-/Tageswerte bilden Heute. Ungültige Datumswerte konservativ wie ohne Datum. Gleichstände behalten die Store-Reihenfolge. Dezent braune Überfälligkeitsangabe, keine erfundenen Aufgaben oder privaten Beschreibungen.

Leerer Zustand „Keine offenen Aufgaben.“; bestehendes `openApp('reminders')`, manueller Aktualisieren-/Retry-Button, keine Checkboxen/Bearbeitung/Löschung im Widget. Erneutes Öffnen liest frisch aus dem vorhandenen Store. Fehlertexte generisch ohne private Pfade. E1-Prinzipien separat auf dieses Widget angewandt: preferenceSession vor/nach Lesen, Anfragengeneration, sofortiges Leeren bei Close/Logout/pagehide, Cleanup nach DOM-Entfernung, ausschließlich textContent. Keine neue Datenbank/IPC/Timer und keine Änderung am E1-Controller.

**206/206 Node-Tests bestanden**, 0 Fehler/Skips; elf neue Widget-Regressionen. Sortierung/Limit/offen-erledigt/ohne Datum/Schaltjahr/ungültiges Datum, leerer Zustand, bestehender App-Start, HTML-Text, Details-Ausschluss, tatsächlicher temporärer Alice/Bob-Store und erneutes Öffnen mit frischer Store-Instanz, Fehler/Retry, Profilwechsel/Logout/Close/Removal/pagehide/veraltete Antworten geprüft. Datumsregressionen in separaten Prozessen mit America/Los_Angeles, Pacific/Kiritimati und Europe/Berlin, einschließlich Sommerzeitgrenzen. API-/DOM-Doubles für deterministische Race-/Fehlerfälle klar markiert. Syntax, Catalina-Konfiguration und Diff geprüft.

Echter Linux/Electron32.3.3-/Sandbox-/Xvfb-GUI-Lauf an1920×1080,1650×930,390×600 erfolgreich: echte synthetische Reminder-Daten, Reihenfolge/Datum/Limit, keine erledigten/privaten Details, E1-Notiz bleibt korrekt, Notes- und Reminder-Integration, Erinnerungen über Enter öffnen, echte Aufgabe in bestehender App erledigen, manueller Refresh, Reopen/Reload-Persistenz, HTML-Titel literal, sofortiger Logout-Scrub, Alice/Bob-Re-Login-Trennung und Classic. Keine Rendererfehler. [Screenshots und Messwerte](AIR_HOME_REMINDERS_E2.md).

Fenster/Sidebar/E1-Kachel/Dock/Island unverändert; das neue Due-Widget nutzt die vorhandene Scrollfläche. Rahmen1920 exakt200/103,1522×849px;1650 bei171,875/93,1307,969×731,078px;390 bei12/91,366×430px. Due-Kachel380×230,39 /326,09×212,98 /299×182,27px; auf kleinen Displays natürliche Höhe statt Inhaltsabschneiden. Screenshots zeigen zur Kachel gescrollten Inhalt. Dock358×68px unten0, Island oben0 und originale Dock-SVGs geprüft.

Actions-API weiterhin Forbidden, kein neuer CI-/PR-Status bestätigt. Native Windows-/macOS-Hardwareabnahme offen. Vorhandene Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben sichtbar. Keine Änderungen an main, bestehenden PRs, Installern/Manifesten, Notes-Widget, Profil-/Preferences-Store, Registry, Dock oder Kontrollzentrum. Keine neue Dependency. Kalender/Projekte/Fokus bleiben Demnächst. Kein Autorefresh bei Mutationen oder Mitternacht behauptet: Aktualisieren oder Reopen nötig.

Nächste drei getrennte Einheiten: **E3** Aktualisierungs- und Profilgrenzen beider Dashboard-Widgets gezielt absichern; **F1** genau eine bestehende App optisch integrieren; anschließend eine weitere explizit ausgewählte kleine Widget-Aufgabe. Kein weiterer Ausbau in dieser Sitzung. Neuer SHA im Abschlussbericht; nach Sicherung beenden.

---

# Aktueller Checkpoint – E1: echtes Notizen-Widget in Air Home

24. Oktober 2026. Bestätigte D1-Basis und Remote-HEAD **bc2fceab226649ff364df9d67bf6d9899e2f61e3**, eigener Branch **feat/air-home-notes-e1-20261024**. Ausschließlich die vorhandene `.air-home-inbox` wird zum Notizen-Widget. `window.airOS.notes.list()` aus vorhandenem authentifiziertem Notes-Store; maximal drei echte Titel nach gültigem `updatedAt` absteigend, ungültige Daten zuletzt, stabile Reihenfolge bei Gleichstand. Leeres Profil: „Noch keine Notizen vorhanden.“ Button „Alle Notizen öffnen“ nutzt `openApp('notes')`. Ladefehler generisch mit Retry; bestätigtes Notes-Speichern aktualisiert über das vorhandene `air-notes-saved`-Ereignis. Keine Bearbeitung/Erstellung im Widget und kein zweiter Store/IPC-Endpunkt.

Datenschutz: Titel ausschließlich über `textContent`; Notizinhalt weder gerendert noch in einem zusätzlichen Cache gespeichert. Vor und nach Read wird die flüchtige bestehende `preferenceSession` geprüft; Anfragen besitzen eine Generation, ältere Antworten werden verworfen. Close-Click leert sofort, MutationObserver räumt nach Entfernung auf, pagehide und der bestehende Logout-Weg leeren Titel und entfernen globale Listener. Minimieren bleibt vom Schließen getrennt. Keine neuen Timer. Bei fehlgeschlagenem Logout bleibt das Widget sicher geleert und ist nach erneutem Öffnen wieder verfügbar.

**195/195 Node-Tests bestanden**, 0 Fehler/Skips: neun neue Widget-Regressionen mit markierten API-/DOM-Test-Doubles; vorhandener echter temporärer Notes-Store für Alice/Bob. Erfolgs-/Leerzustand, Sortierung/Limit, sichere HTML-Titel, Notes-Start, Fehler/Retry, ältere Antwort nach neuerem Refresh, Profilwechsel/Logout/Close/Removal/pagehide und frisches Fenster geprüft. D1-Fixture erhält nur den bisher fehlenden window-Stub für den neuen Mount-Hook. Syntax, Catalina-Konfiguration und Diff geprüft. Vorhandene Sicherheits-/Preferences-/Pinning-Tests bleiben aktiv.

Echter **Linux/Electron32.3.3-/Sandbox-/Xvfb-GUI-Test** an1920×1080,1650×930,390×600 mit ausschließlich synthetischen Profilen/Notizen: echte Notes-Bridge/Store-Daten, drei sortierte Titel, keine Body-Strings, Notes-App per Tastatur öffnen, Reload, Aktualisierung nach echter bestätigter Speicherung, HTML-Titel nur literal, sofortiges Leeren beim Logout und Alice/Bob-Re-Login-Trennung; keine Rendererfehler. Keine neue Projektdependency. [Screenshots und Messwerte](AIR_HOME_NOTES_E1.md). D1-Fenstermaße, Sidebar und drei-/einspaltiges Layout erhalten; Inbox380×384 /326,09×330 /299×180px. Auf390px zeigt der Screenshot die in der bestehenden Hauptfläche zur Notizen-Kachel gescrollte Ansicht. Dock358×68 unten0 und Island oben0 unverändert.

Actions-/PR-API weiterhin Forbidden; keine neue CI-Bestätigung oder Windows-/macOS-Hardwareabnahme behauptet. Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen. main, bestehende PRs, Installer/Manifeste, Registry, Profil-/Preferences-Verträge, andere Widgets, Dock-/Island-/Control-CSS unverändert. Keine neue freie Neuinterpretation oder vollständige Pixelgleichheit behauptet; D1-Abweichungen (Fotowolken, Referenzschrift/Fotografie,1650px y93) bleiben bestehen.

Nächste drei getrennte Einheiten: **E2** ein weiteres echtes Widget (z.B. bestehende Erinnerungen), **E3** genau einen weiteren Daten-/Profilgrenzfall dieses Widgets absichern, **F1** eine vorhandene App optisch integrieren. Keine weiteren Widgets in dieser Sitzung. Neuer SHA im Abschlussbericht; nach Sicherung Sitzung beenden.

---

# Aktueller Checkpoint – D1: Air-Home-Grundfenster

24. Oktober 2026. Bestätigte Basis **c2e48fec1e289dbb337578f29bf83db49a477d0e**, Remote-HEAD geprüft; eigener Branch **theme/air-home-foundation-d1-20261024**. Ausschließlich D1: registrierte integrierte App `home`/Air Home, über bestehendes Startmenü auffindbar/startbar, dieselbe Fensterverwaltung und Lifecycle. Kein Autostart und keine Widget-Implementierung. Eigener Mint-Rahmen, cremeweiße Fläche, Navigation Home/Apps/Dateien/Settings mit echten bestehenden App-Startaktionen; drei Kachelspalten als klar bezeichnete Demnächst-Zustände. Keine fiktiven Projekte, Termine, Fortschritte, Nutzerangaben oder Fotos.

**186/186 Node-Tests grün**, 0 Fehler/Skips, drei neue Air-Home-Regressionen. Syntax, Catalina-Konfiguration und Diff geprüft. Echter Linux/Electron32.3.3-/Sandbox-/Xvfb-GUI-Test bei 1920×1080, 1650×930, 390×600 erfolgreich: Registry-Suche/Start, keine Doppelinstanz, Navigation startet vorhandene Apps, bestehendes Verschieben/Maximieren/Minimieren/Wiederherstellen/Schließen, Classic-Rückkehr, kein horizontaler Überlauf, keine Rendererfehler. Bewegungsreduktion im GUI-Test aktiv. Bestehende Profil-/Pinning-/Sicherheitsregressionen weiterhin grün. Keine neuen Abhängigkeiten. Actions-/PR-API weiterhin Forbidden, deshalb kein aktueller CI-/PR-Status bestätigt und keine native Windows-/macOS-Abnahme behauptet.

Gemessen: **1920: x200/y103, 1522×849px, Sidebar212px, Kacheln380px bei x472/872/1272**. **1650: x171,875/y93, 1307,969×731,078px, Sidebar182,188px**. Bestehender Fensterhost begrenzt hier y auf93 statt proportional88,69. **390: x12/y91, 366×430px**, kompakte48px-Navigation, einspaltiger Inhalt. Dock unverändert358×68px unten0; Island oben0; Originalicons identisch. [Screenshots, Messdaten und genaue Referenzabweichungen](AIR_HOME_D1_COMPARISON.md).

Classic-Desktop, Startmenü, Pins, Profile und C2-Kontrollzentrum unverändert. Keine Installer-, Paketmanifest-, Workflow-, IPC- oder Preferences-Änderung, kein main-/PR-Merge/Release. Audit-, Signing-, Notarisierungs- und Hardware-Abnahmeblocker bleiben offen. Foto/echte Widgets/Folia-Werkzeugband nicht übernommen; keine vollständige Pixelgleichheit behauptet.

Nächste drei kleine Einheiten: **E1** genau ein reales bestehendes Widget mit Profilgrenzen; **E2** ein weiteres Widget separat; **F1** eine bestehende App optisch integrieren. Fotografische Wolken nur mit eigener oder geklärter Quelle. Neuen Commit-SHA im Abschlussbericht nennen; nach Push Sitzung beenden.

---

# Aktueller Checkpoint – C2: sichtbarer Referenzabgleich abgeschlossen

23. Oktober 2026. Ausgangsstand Randkorrektur **71139f562ea751f546e01efc6e5006d8961a803b**, separater Branch **theme/air-modern-reference-c2-20261023**. Schritt 1 Logo separat in **a6d25a3** gesichert, Schritt 2 Kontrollzentrum in eigenem Folgecommit. Die früher fehlenden Bilder sind jetzt sichtbar; frühere Blockade ist aufgehoben. Neuer SHA steht im Abschlussbericht.

Modern übernimmt das vorhandene weiße Birnen-PNG ausschließlich für den Startbutton; Classic behält Grid. Neues Kontrollzentrum nach Bild 5: dunkles Panel, echte Statusuhr, 2×2-Kacheln, sechs runde Aktionen, zwei Slider. Dock-/Desktop-Design nutzen bestätigte bestehende Preferences-Schreibwege. Apps, Settings, erneutes Einlesen und echte Notes-Mitteilung verwenden vorhandene Dienste. Wi-Fi, Bluetooth, Focus, Fensterübersicht und native Helligkeit ausdrücklich deaktiviert; lokale Volume-Steuerung erst mit echter Air-Music-Quelle. Keine falschen Hardwareprozente oder Demo-Erfolge.

**183/183 Node-Tests bestanden**, keine Skips/Fehler; Syntax, Catalina-Konfiguration und Diff geprüft. Drei neue Kontrollregressionen und Logo-Regression; bestehende Pin-/Profil-/Speicher-/Sicherheitsregressionen erhalten. Echter Linux/Electron-32.3.3-/Xvfb-Test an allen drei Größen bestanden, inklusive Suche/Start/Pin/Unpin, Escape/Fokus, Classic-Rückkehr, echten bestätigten Theme-Wechseln, Audio.volume=0,32 aus synthetischer lokaler WAV-Datei und echter Notes-Mitteilung. Keine Rendererfehler. Sandbox aktiv, keine neue Dependency. Kein nativer Windows-/macOS-Hardwaretest. GitHub-Actions-API am Sitzungsende erneut Forbidden; keine neue CI-Bestätigung.

Gemessene Dock-/Island-Randabstände **0px**. Dock jeweils **358×68px**, kein Scrollen/Abschneiden. Island 250×45 / 214,84×38,67 / 156×36px für 1920/1650/390px. Panel auf großen Displays **430×284px bei y0**, auf 390px **366×284px bei x12/y44**, damit Systemmenü erreichbar bleibt. [Sichtbarer Vorher-/Nachher-Vergleich und genaue Grenzen](AIR_CONTROL_CENTER_COMPARISON.md), Screenshots und rohe Messwerte unter docs/visual.

Keine behauptete Pixelidentität: Fotowolken, Air Home und Hardwareanzeigen der Referenz fehlen; Funktionszustände ehrlich statt kopierter Fantasiewerte. Weitere Icons/Registry/Pins/Profiles unverändert; main, bestehende PRs, Installer und Downloads nicht angefasst. Bestehende Dependency-Audit-, Signing-, Notarisierungs- und Release-Blocker bleiben offen; keine Security-Prüfung deaktiviert, kein Audit-Erfolg behauptet.

Nächste drei separate Einheiten: **D1** eigenständiges mintgrünes Air-Home-Grundfenster; **E1** genau ein echtes vorhandenes Widget integrieren; **F1** eine vorhandene App optisch integrieren. Fotografische Wolkentextur nur mit eigener oder geklärter lizenzierter Quelle. Sitzung nach Commit/Push beenden.

---

# Referenzkorrektur – Schritt 1: Bilder erhalten, Air-OS-Startlogo übernommen

23. Oktober 2026. Basis 71139f562ea751f546e01efc6e5006d8961a803b, eigener Branch `theme/air-modern-reference-c2-20261023`. Die fünf Referenzbilder sind jetzt sichtbar; die vorherige Bildblockade ist aufgehoben. Ränder bereits mit 0px gesichert. Bild 3 zeigt das weiße Birnenlogo auf Schwarz; das vorhandene, vom Benutzer stammende `assets/air-logo.png` entspricht dieser Form visuell. Unveränderte PNG-Bytes sind im bestehenden Launchpad-SVG eingebettet, damit kein Installer-/Paketmanifest geändert werden muss. Nur das Modern-Launchpad-Icon wechselt; andere Originalicons und Classic-Grid bleiben erhalten. Logo-Regression prüft Originalbytes und Theme-Rückkehr. Kein 1:1-Bytevergleich mit dem hochauflösenden Anhang behauptet. Nächster bereits beauftragter Schritt: Kontrollzentrum nach Bild 5 (Statuszeile, 2×2-Tiles, sechs runde Aktionen, zwei ehrliche Reglerdarstellungen); danach GUI-Vergleich bei drei Auflösungen. Kein Air Home, kein Build/Release, main unverändert.

---

# Zwischenstand – C1/C2-Visuelle Korrektur: Randanbindung gesichert, Bildreferenzen fehlen

23. Oktober 2026. Explizit gewünschte Basis **`ceae6ba438f552edc32845369f2c6a31aa0473b4`** / B2.2; neuer separater Branch **`fix/air-modern-edge-attachment-c12-20261023`**. Kein Merge oder Schreiben auf C1, main, PRs oder Installer-Branches. Die bereits eigenständig implementierten Island-Viewport-/Animations-/Cleanup-Änderungen aus C1 `8c550c2` wurden als geprüfte Dateigrundlage wiederverwendet, ohne Branches zusammenzuführen. C1/C2-Gesamtauftrag ausdrücklich **noch nicht abgeschlossen**.

Abgeschlossen: ausschließlich Modern-Randanbindung und zugehörige Funktionserhaltung. `desktopTheme=modern` setzt Island viewportfest auf **y=0**, obere Ecken gerade, untere gerundet. `desktopTheme=modern` zusammen mit `dockTheme=modern` setzt kompaktes Dock auf **bottom=0**, unten gerade Ecken und zurückhaltenden Schatten nach oben. Keine Desktop-/Fensterhost-Verschiebung. Classic-Desktop und Classic-Dock behalten ihre bisherige Darstellung; beide Preferences bleiben unabhängig. Originalicons, Registry, Pins und Startmenü unverändert.

| Viewport | Island x/y, Breite×Höhe | Dock x/y, Breite×Höhe | Oberer / unterer Abstand | Bisheriges Panel x/y, Breite×Höhe |
| --- | --- | --- | --- | --- |
| 1920×1080 | 835/0, 250×45 | 781/1012, 358×68 | 0 / 0px | 790/53, 340×210 |
| 1650×930 | 717,58/0, 214,84×38,67 | 646/862, 358×68 | 0 / 0px | 655/46,67, 340×210 |
| 390×600 | 117/0, 156×36 | 16/532, 358×68 | 0 / 0px | 25/44, 340×210 |

Echter Linux/Electron-32.3.3-/Xvfb-Test erfolgreich: neun Screenshots und rohe getBoundingClientRect-Messwerte unter docs/visual; beide Abstände wirklich 0, Zentrierung, 358×68px, kein Dock-Scrollen, Fensterhost unverändert, Fenster-Schließen-Hit-Test bei maximiertem Fenster, Kontrollzentrum/Enter/Escape/Fokusrückgabe, Startmenü-Suche/Notizen-Start, Anheften/Lösen und identische originale SVG-Inhalte geprüft. Classic-Island bleibt 156×38px bei y39/y37; Modern-Dock unter Classic-Desktop behält 6px Abstand. **179/179 automatisierte Tests, 0 Fehler/Skips** inklusive vier wiederverwendeter C1-Animations-/Cleanup-Regressionen und aller bisherigen Profil-/Pin-/Sicherheitsprüfungen. Syntax, Catalina-Konfiguration und Diff-Whitespace geprüft. Keine neue Windows-/macOS-Hardware-/CI-Abnahme. Actions-Abruf weiterhin Forbidden; keine Installer-Builds ausgelöst.

**Konkrete Blockade:** In der aktuellen Nachricht sind die angekündigten Bilder 3 (gewünschtes Air-OS-Logo) und 5 (verbindliches neues Kontrollzentrum) nicht als Anhänge verfügbar. Erneute Bereitstellung frühzeitig erbeten. Im Repository existiert lediglich ein älteres weißes Birnenlogo `assets/air-logo.png` aus b063352; es kann nicht als identisch mit dem angeforderten neuen Bild 3 bestätigt werden und wurde deshalb nicht als Ersatz eingebaut. **Launchpad-Icon bleibt vorerst das bestehende Grid.** Das Kontrollzentrum bleibt das bestehende funktionierende Panel mit Dock-Kachel und Notes-Mitteilung; **kein behaupteter Umbau nach Bild 5**, keine neuen Tiles/Slider oder erfundenen Hardwarezustände. Die fehlenden Referenzen werden nicht durch geratenes Design ersetzt.

Nächster exakter Schritt: Bilder 3 und 5 erneut bereitstellen, dann auf diesem gesicherten Branch Referenzmaße/Farben/Logo prüfen und den noch offenen Icon-/Kontrollzentrum-Teil dieser Phase umsetzen. Mögliche ehrliche Controls aus bestehender Architektur: Dock-Design, Desktop-Design, Bewegungsreduktion, 24h-Uhr; Apps/Notizen/Suche/Settings als Aktionen. Volume/Brightness nur mit klarer echter interner Wirkung oder explizitem Nicht-verfügbar-/Demo-Status, keine native Steuerung behaupten. Danach erst die drei Folgeeinheiten: (1) **D1** Air Home, (2) **E1** ein echtes Widget, (3) **F1** einzelne App optisch integrieren. Nicht vor Abschluss der ausstehenden Referenzkorrektur beginnen.

Main a1f3e12, PR #11 eecab2a, PR #12 eb3f3bc, Installer-Branch d6a2cc0 und C1-Branch 8c550c2 erhalten. Keine Dependencies, IPC-/Preferences-/Registry-/Installer-Dateien oder fremde Assets geändert. Bestehende Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen. Commit `Attach Modern dock and Island to viewport edges; document missing visual references`; SHA im Abschlussbericht. Sicherer Zwischenstand, Sitzung nach Sicherung kontrolliert beenden und fehlende Anhänge anfordern.

---

# Aktueller Checkpoint – B2.2: Apps im Startmenü anheften und lösen

23. Oktober 2026. Bestätigter B2-Ausgangs-HEAD **`f21441703c833fa9d3a7e0c6922badc0fca0fca8`**; eigener Branch **`theme/air-modern-start-pins-b22-20261023`**. Genau B2.2: getrennte native App-Start- und Anheften-/Lösen-Buttons in einer kompakten Startmenü-Liste. App-Suche, Originalicons und Startpfad bleiben erhalten. Kein Drag-and-drop, Kontextmenü, neues Dock, Island oder Air Home.

Eine vollständige Default-Referenzliste wird von Dock-Auswahl und Pinning geteilt: `dockPins:null` erbt Finder/Browser/Notizen/Air Music/Settings; beim ersten Lösen wird diese komplette Liste materialisiert und nur die gewählte ID entfernt – niemals die viewportabhängige Auswahl. `[]` bleibt explizit leer bis auf den immer verfügbaren Startmenü-Button. Explizite Reihenfolge, unbekannte/nicht installierte Referenzen und andere Profile bleiben erhalten. Doppelte Pins sind idempotent, neue Pins werden hinten ergänzt, maximal 64 Referenzen. Startmenü kann nicht gelöst werden. Anheften prüft Registry und echte vorhandene SVG-/Icon-Daten; ohne unterstütztes Dock-Icon keine falsche Erfolgsaktion. Bereits gespeicherte nicht mehr darstellbare registrierte Apps können gelöst werden.

UI-Badges unterscheiden **„Angeheftet · im Dock“** von **„Angeheftet · unter Alle Apps“**. Platzmangel löscht keine Pins; B1-Kapazität/Originalicons bleiben unverändert. Sechs Icons weiter **358×68px**, keine Dock-Scrollfunktion; bei sieben sichtbaren Icons auf breiten Displays weiterhin höchstens 440px nach unveränderter Berechnung. Tab erreicht separate Pin-Aktion; Enter/Space pinnen ohne App-Start. Pfeiltasten treffen ausschließlich App-Ergebnisse. Nach bestätigtem Speichern bleibt Menü offen, Fokus bei der aktualisierten Pin-Aktion; Suche bleibt erhalten. Fehler sichtbar, Zustand unverändert, Retry möglich. Ein echter GUI-Befund wurde behoben: Neuzeichnen entfernte den geklickten Pin-Button vor Document-Bubbling und wurde fälschlich als Outside-Click erkannt; ursprünglicher composedPath zählt jetzt zum Menü, Regression aktiv.

Persistenz läuft über vorhandene `airSettingsWrites`-Warteschlange und authentifizierte Preferences-API, ohne zweite Datenbank. Jeder Vorgang liest den aktuellen gespeicherten Pin-Satz vor seiner Änderung; UI/Cache ändern sich erst nach Bestätigung. Doppelklicks werden gesperrt, direkte parallele Adapteraufrufe serialisiert. Main erzeugt pro Anmeldung eine **nur im Speicher gehaltene zufällige preferenceSession**; bestehender Update-Endpunkt akzeptiert optional diese erwartete Sitzung und prüft sie vor dem Schreiben. Neue Pin-Vorgänge nutzen sie verbindlich und prüfen außerdem vor/nach IPC den aktuellen Benutzerkontext. Alte Aufrufe bleiben kompatibel; keine neue IPC-Route. Dadurch kein Alice-Auftrag ins Bob-Profil und keine alte Alice-Antwort nach neuer Anmeldung. Kein Token auf Platte, keine Passwortänderung. Alte andere Appearance-Aufrufer werden hier nicht als vollständig sitzungsgebunden behauptet.

**175/175 Node-Tests bestanden, 0 Fehler/Skips** (zuvor 165): zehn neue Regressionen plus angepasste/erweiterte vorhandene Controller-/IPC-Fixtures. Null/leer, Lösen/erneutes Anheften, Reihenfolge/unbekannte Referenzen, Duplikate/64-Grenze/ungültige IDs/fehlendes Originalicon, parallele bestätigte Speicherung, Fehler/Retry, unveränderte andere Einstellungen/Bob, frische Store-Instanz, Sitzungswechsel vor Write und nach Commit, neue Sitzung auch bei erneutem Alice-Login, getrennte Pin-/App-Aktionen, Tastaturnavigation und Rerender-Outside-Click geprüft. Asynchrone Fehler-/Profilwechseltests verwenden klar abgegrenzte API-Test-Doubles mit echtem temporärem Preferences-Store; produktive Main-Sitzungsprüfung zusätzlich ausgeführt. Sicherheitsprüfungen aktiv. Syntax für Renderer/Main/Preload, Catalina-Konfiguration und Whitespace geprüft.

Echter Linux/Electron-32.3.3-/Xvfb-Test im isolierten Profil bei **1920×1080, 1650×930 und 390×600 erfolgreich**: Tastatur-Tab/Enter/Space für Pinning, Standard-App lösen, Spotify anheften/lösen/erneut anheften mit grünem Originalicon, Fokus, App-Suche/Pfeile/Finder-Start, 358×68px bei sechs Icons und Scrollversuch 0. Bei vollem 390px-Dock Spotify gespeichert, Badge „unter Alle Apps“, kein versteckter fokussierbarer Dock-Eintrag. Fehlende Icon-Aktion deaktiviert. Absichtlich blockierte Preferences-Datei ausschließlich im Testprofil: sichtbarer Speicherfehler, Originaldatei unverändert wiederhergestellt, Retry erfolgreich. Reload, Classic/Modern-Dock-Wechsel und Alice/Bob-Ab-/Anmeldung erhalten getrennte Pins; keine Rendererfehler. [Sieben echte Screenshots und Reproduktion](AIR_MODERN_DESIGN.md). Persistenz nach Store-Neuinstanz automatisiert; kein vollständiger Electron-Prozessneustart, keine Windows/macOS-/Screenreader-/Hardwareabnahme.

Main a1f3e12, PR #11 eecab2a, PR #12 eb3f3bc und Installer-Branch d6a2cc0 bleiben unverändert. Actions-Abruf über gh weiterhin Forbidden; keine neue CI-Abnahme behauptet, kein Build gestartet. Keine Dependencies, Installer-Workflows, Preferences-Dateiformate oder Icon-Assets geändert. Bestehende Audit-/Signing-/Notarisierungs-/Release-Blocker offen.

Designabweichungen: eigene dunkle App-Liste statt fremder Oberfläche, Vektorwolken/alte Island-Position und fehlendes Mint-Air-Home bleiben; nicht alle angehefteten Apps sind gleichzeitig sichtbar, alle bleiben über Startmenü erreichbar. Keine Kategorien/Häufigkeitsanzeige/Sortierung/komplexen Kontextmenüs. Nächste drei einzelne Einheiten erst nach neuem Prompt: (1) **C1** kompakte schwarze Island oben mittig, (2) **D1** Mint-Air-Home-Grundfenster, (3) **E1** genau ein echtes Dashboard-Widget an vorhandenen Dienst anbinden. Commit `Add confirmed profile-safe pin and unpin actions to the start menu`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Aktueller Checkpoint – B2: kompaktes Registry-Startmenü mit App-Suche

23. Oktober 2026. Bestätigter B1-HEAD **`7b1b0bbe149675fcf0b3004ecbe53efe810c46f1`**; eigener Branch **`theme/air-modern-start-menu-b2-20261023`**. Genau B2: Dock-Launchpad/Alle Apps öffnet bei `dockTheme=modern` ein kleines dunkles Startmenü, mittig 10px oberhalb des bestehenden Docks. Classic-Dock öffnet unverändert das große Launchpad; dieses bleibt zusätzlich per eigenem Popup-Button und A3-Systemmenü erreichbar. Keine Einstellungen oder Pins umgeschrieben, kein zweites Dock/Registry-System.

Registry ist einzige App-Quelle: alle 25 aktuell registrierten Einträge, keine Duplikate, Live-Suche nach Namen/ID ohne Groß-/Kleinschreibung, leer = alle, verständliche Leermeldung. Registry-Änderungen aktualisieren ein geöffnetes Menü. App-Namen ausschließlich per textContent/Attribut, vorhandene SVG-Icons unverändert geklont oder aus vorhandenen statischen Icon-Daten; keine Umfärbung oder fremde Assets. Einträge ohne vorhandenes Bild erfinden kein App-Logo. Kein neuer ChatGPT-Eintrag, keine installierte Spotify-App behauptet.

App-Start ausschließlich über vorhandenes `openApp`: interne Registry/Lifecycle-Fenster, bestehende native Spotify-Bridge bzw. bestehender Store-Runtime-Start. Diese Funktion gibt zusätzlich einen Erfolg-/Fehlerstatus zurück; bestehende Fire-and-forget-Aufrufer behalten Toast-Fehler ohne unbehandelte Promise-Rejection. Startmenü schließt nach bestätigter Startaktion, bleibt bei Fehler sichtbar und meldet lesbaren Text ohne technischen IPC-Präfix. Ausstehender Start sperrt Doppelstarts; Escape/Schließen invalidiert veraltete UI-Antworten. Keine IPC-/Main-/Runtime-/Dateipfad-Ausführungsänderung.

Maus/Enter/Space öffnen mit Suchfokus. Pfeiltasten wählen Treffer, Enter startet, Tab bleibt nativ ohne Fokusfalle, Escape/Outside-Click schließen mit Rückgabe zum Dock-Button. Sichtbarer Mint-Fokus; 140ms Öffnungsanimation, bei OS- oder Air-OS-Bewegungsreduktion deaktiviert. Nur Trefferbereich scrollt vertikal, Suchfeld/Footer bleiben erreichbar.

**165/165 Node-Tests bestanden, 0 Fehler/Skips**, sechs neue Controller-/Launch-Regressionen: Fokus/Classic, Suche/Leermeldung/Registry-Update, injektionssichere Namen, Pfeiltasten/Enter, asynchroner Erfolg/Fehler/Doppelstart/Retry, Abbruch und veraltete Antwort, produktiver nativer Status mit klar markierten Test-Doubles. Bestehende B1-/Profil-/Sicherheitstests bleiben aktiv. Syntax, Catalina-Konfiguration und Diff-Whitespace geprüft.

Echter Linux/Electron-32.3.3-/Xvfb-Lauf im isolierten Testprofil: **1920×1080 und 1650×930: Menü 480×440px; 390×600: 366×436px bei x12/y80**. Jeweils 10px oberhalb des Docks, bei 390px unterhalb der Island, keine abgeschnittenen Bedienelemente. Dock weiter **358×68px**, Scrollversuch 0, B1-Styles unverändert. Alle 25 Registry-IDs abgeglichen, Finder-Original-SVG verglichen, Suche/keine Treffer, Finder-Start, Enter/Space/Pfeile/Tab/Escape/Outside-Click, Fokus, großes Launchpad und Classic-Route erfolgreich. Echter sicher abgewiesener Spotify-Start unter Linux bleibt als sichtbarer Fehler im Menü, kein Host-Start behauptet. Normal-/Reduce-Motion geprüft. Preferences vor/nach GUI-Prüfung vollständig identisch inkl. dockPins; keine Rendererfehler. [Screenshots/Messwerte/GUI-Reproduktion](AIR_MODERN_DESIGN.md). Kein nativer Windows/macOS-/Screenreader-/Hardwaretest oder vollständiger Prozessneustart.

GitHub-HEADs main a1f3e12, PR #11 eecab2a, PR #12 eb3f3bc, Installer-Branch d6a2cc0 unverändert. Frischer Actions-Abruf über gh weiterhin Forbidden, keine neue CI-Abnahme behauptet. Kein Build gestartet. Keine Dependencies, Installer-Workflows, Main/IPC/Runtime/Preferences oder Icon-Assets geändert. Bekannte Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen.

Abweichungen: kein Pixel-Match zur Bloom-/Folia-Referenz, bestehender eigener Vektorhimmel, alte Island-Position, kein Mint-Air-Home. Das neue Startmenü ist eine eigene Air-OS-Oberfläche, kein Fremdcode/-Asset. Keine Kategorien/Häufigkeit/Pin-Kontextmenüs. Nächste drei getrennte Einheiten erst nach neuem Prompt: (1) **B2.2** profilbezogenes Anheften/Lösen im Startmenü, (2) **C1** Island-Proportion/Position, (3) **D1** Mint-Air-Home-Grundfenster. Commit `Add compact registry start menu with safe app search and launch feedback`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Aktueller Checkpoint – B1: kompaktes schwarzes Dock ohne Scrollen

23. Oktober 2026. Bestätigter A3-Ausgangs-HEAD **`01d8ed9a7f71260bfc7a7823fc14c2a4f3f24c6b`**; eigener Branch **`theme/air-modern-compact-dock-b1-20261023`**. Genau B1, kein neues Startmenü/B2. Bestehendes Dock mit Original-Buttons/-SVGs, Registry und Lifecycle: Modern-Dock schwarz `#090b0c`, sechs Standardzugänge **Launchpad, Finder, Browser, Notizen, Air Music, Einstellungen**, 42px-Originalicons, 20px-Radius, 6px unterer Abstand. Launchpad behält sein Originalicon und heißt zugänglich „Alle Apps“. Suche dort unverändert verfügbar.

**Gemessen: 358×68px bei 1920×1080, 1650×930 und 390×600**, Zentren x=960/825/195. Client-/Scrollbreite jeweils 356/356px; Scrollversuch bleibt 0, `overflow-x/y:clip`, kein Scrollcontainer/Scrollbar. Alle sichtbaren Buttons vollständig im Viewport. Maximal 440px; Kapazität anhand Auflösung und gespeicherter Icongröße, maximal sieben Standardgrößen-Buttons auf breiten Displays, sechs bei 390px. Mehr Pins werden nicht abgeschnitten oder gespeichert gekürzt, sondern durch echte `hidden`-Buttons aus Layout/Fokus genommen; Launchpad bleibt als Zugriff mit Anzahl weiterer darstellbarer Pins erhalten. Keine horizontal verborgenen bedienbaren Icons.

Vorhandene profilbezogene `dockPins`: null = neue kleine Default-Auswahl, [] = nur Launchpad; explizite Reihenfolge erhalten, unbekannte/deinstallierte Referenzen nicht angezeigt und nicht gelöscht. Registry-Änderungen/Resize aktualisieren die Auswahl; Original-Buttons bleiben mit Handlern erhalten, zusätzliche bestehende Icon-Klassen nutzen den vorhandenen Icon-Painter. Keine monochromen Ersatzicons für Store-Einträge ohne vorhandene Icon-Klasse; diese bleiben im Launchpad. Focus bleibt beim Reflow am Button bzw. geht bei ausgeblendetem Button zu Launchpad. Fensteranimationen nutzen bei ausgeblendetem Ziel die reale Dockfläche statt leere Icon-Koordinaten.

`dockTheme` bleibt **unabhängig von desktopTheme**: B1 wird durch Dock-Design „Air Modern“ aktiviert; keine bestehende Auswahl und kein Profil wird umgeschrieben. Classic-Dock stellt Original-Reihenfolge und ursprüngliche Darstellung wieder her, inklusive seines bisherigen Verhaltens auf kleinen Displays. Spotify-Icon/-Launcher bleiben unverändert und über explizite Pins/Launchpad erreichbar; mangels Installationserkennung kein als sicher verfügbar ausgegebener Default. ChatGPT ist bisher keine registrierte startbare App und wird nicht erfunden. Kein neuer App-/Dock-Manager und keine zweite Datenbank.

**159/159 Node-Tests bestanden, keine Fehler/Skips**, davon fünf neue Tests für begrenzte Registry-Auswahl, Originalicon-Voraussetzung, Pins/null/leer/unbekannt/Reihenfolge, Kapazität mit Größen/kleinen Viewports und versteckte Fensteranimationsziele. Vorhandene Profil-/Persistenz-/Schreibsicherheits-/A3-Tests aktiv. Echter Linux/Electron-32.3.3-/Xvfb-Test mit isoliertem Profil: alle drei Maße, schwarz/mittig/kein Scrollen, Original-SVG-Inhalte unverändert, keine Grayscale-Filter, Finder/Browser/Launchpad/Notizen, Enter/Space, aktive Markierung, Reduce-Motion, viele/leere Pins, Spotify-Originalicon, zusätzliches Wetter-Originalicon, Resize-Fokus, Classic-Rückkehr und Persistenz nach Renderer-Reload erfolgreich; keine Rendererfehler. Native Spotify-Installation/Start nicht auf Linux behauptet. [Screenshots und Reproduktion](AIR_MODERN_DESIGN.md). Syntax, Catalina-Konfiguration und Diff-Whitespace geprüft.

GitHub-HEADs main a1f3e12, PR #11 eecab2a, PR #12 eb3f3bc und Installer-Branch d6a2cc0 unverändert. Actions-Abruf per gh weiterhin Forbidden; keine neue CI-Abnahme oder Windows/macOS-Hardwareprüfung behauptet. Keine Dependencies, Build-/Installer-Workflows, Preferences-/Main-Dateien oder Icon-Assets geändert; kein Build gestartet. Audit-/Signing-/Notarisierungs-/Release-Blocker bleiben offen.

Designabweichungen: Default-Dock jetzt im Zielbereich statt 1553×86px; eigenes unverändertes Icon-Set/andere App-Auswahl als Referenz, 6px Abstand statt bündig, kein eigener Startmenü-Popup. Vektorwolken, alte Island-Position und fehlendes Mint-Air-Home bleiben. Nächste drei separate Einheiten erst auf neuen Prompt: (1) **B2** kompaktes Registry-Startmenü mit Suche und verbesserter Pin-/Unpin-Bedienung; (2) **C1** Island-Proportion/Position; (3) **D1** eigenständiges Mint-Air-Home-Grundfenster. Commit `Make Air Modern dock compact, black and non-scrolling with original icons`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Aktueller Checkpoint – Redesign A3: minimalistische Modern-Desktop-Hülle

23. Oktober 2026. Bestätigter Ausgangs-HEAD **`6ff843719e9dccc7a305678c6664e3ae6aefbab5`** auf A2; eigener Branch **`theme/air-modern-shell-a3-20261023`**. Genau A3: `html[data-desktop-theme="modern"]` blendet klassische Menüleiste und große Desktop-Icons per `display:none` aus (damit auch aus Tab-Reihenfolge/Accessibility-Tree). Classic zeigt dieselben ursprünglichen Elemente wieder. Wolken, Fensterbereich, Dock und Island behalten ihre vorhandene Geometrie; kein Air Home.

Kompakter Air-OS-Knopf links oben, nichtmodales System-Popup mit nativen Buttons/Tab-Reihenfolge. Finder, Launchpad, Suche, Systemeinstellungen/Theme, Downloads, Bilder, Papierkorb und bisherige weitere Menüaktionen bleiben erreichbar. App-Buttons verwenden bestehende Registry/Lifecycle-Delegation; Suche/Legacy-Menüs verwenden ihre Original-Handler. Originale Profil-/Abmeldeelemente werden zwischen Menüleiste und Popup verschoben, nicht dupliziert. Popup scrollbar und oberhalb des bestehenden Docks begrenzt, sichtbarer Fokus, Enter/Space nativ, Escape schließt mit Fokusrückgabe, Tab/Outside-Click schließen ohne Tastaturfalle. Keine neue Animation; reduzierte Bewegung unverändert unterstützt.

**154/154 Node-Tests bestanden, 0 Fehler/Skips**; vier neue Controller-Regressionen für Theme-/Profilwechsel, Fokusübergänge, Escape/Tab/Outside-Click und Original-Aktionsdelegation. A2-Persistenz-/Fehler-/Profiltests und alle bisherigen Sicherheitsprüfungen bleiben aktiv. Echter Electron-GUI-Test entdeckte vor Abschluss einen Fokusfehler: Microtask las während nativer Fokusübergabe noch body und schloss das Popup vor Mausklick. Korrigiert auf `focusout.relatedTarget`, Regression für Fokuswechsel innerhalb des Popups ergänzt. Kein Test deaktiviert.

**Echter Linux/Electron-32.3.3-/Xvfb-Lauf bei 1920×1080, 1650×930 und 390×600 erfolgreich**: Modern/Classic live, originale Chrome-Rückkehr, versteckte Icon-Rects leer, Enter/Space/Escape/Tab, Finder/Launchpad/Notizen (über Launchpad), echter Dock-Launchpad-Klick, Suche und Ctrl+K, Settings/Theme, Island öffnen/schließen, maximierte Fensterbedienelemente im Viewport, Minimieren/Wiederöffnen, Profilmenü/Abmelden, scrollbares Hilfemenü, Persistenz nach Reload sowie Ab-/Anmelden; keine ungefangenen Rendererfehler. OS-Reduce-Motion emuliert. Sieben echte Screenshots unter docs/visual; [Designvergleich und Reproduktionsanleitung](AIR_MODERN_DESIGN.md). Vollständiger App-Prozessneustart und native Windows/macOS-/Screenreader-Abnahme nicht durchgeführt. Syntax-/Catalina-Konfiguration und Diff-Whitespace geprüft.

GitHub-HEADs per Git bestätigt: main a1f3e12, PR #11 eecab2a, PR #12 eb3f3bc, Installer-Branch d6a2cc0 unverändert. Frischer Actions-/PR-Metadatenabruf über gh scheitert konkret mit Forbidden; keine neue CI-Abnahme behauptet. Vorhandene Workflow-Filter lösen durch Theme-Branch-Push keine Installer-Pipeline aus; keine Builds manuell gestartet. Keine Dependencies, Main-/IPC-/Preferences-/Dock-/Island-Dateien, fremden Assets oder Installer-Workflows geändert.

Abweichungen zu Bild 2: eigener Vektorhimmel statt fotografischer Körnung; kleiner zusätzlicher Air-OS-Zugang links oben; Dock noch groß/hell (bei 390px bestehender horizontaler Scrollbereich), Island weiterhin alte Größe/Position; Mint-Air-Home und Widgets fehlen. Popup kann andere Desktop-Inhalte vorübergehend überlagern, lässt sich per Escape/Outside-Click schließen; geschlossene Hülle blockiert keine Island-/Fensteraktionen. Keine 1:1-Freigabe. Bekannte Dependency-Audit-/Signing-/Notarisierungs-/Hardware-/Store-/Datenisolationsblocker bleiben offen.

Nächste drei kleine Einheiten, jeweils erst auf neuen Prompt: (1) **B1** sehr kompaktes dunkles Floating Dock mit vorhandener Registry/Lifecycle; (2) **C1** kompakte schwarze Island am oberen Rand; (3) **D1** erstes eigenständiges Mint-Air-Home-Fenster, ohne komplette Widgets. Commit `Add minimal Air Modern desktop shell with accessible system actions`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Aktueller Checkpoint – Redesign A2: profilbezogenes Desktop-Design

23. Oktober 2026. Ausgangs-Commit **`6d6c5add6111b7c957852e61c6b2ccc11fbee994`** / bestätigter A1-HEAD; eigener Branch **`theme/air-modern-desktop-a2-20261023`**. Genau eine Einheit: `desktopTheme` (`modern` / `classic`) im bestehenden Preferences-Service und eigener Bereich **Desktop-Design** in den Systemeinstellungen. `dockTheme`, Wallpaper und alle anderen Felder bleiben beim Wechsel erhalten. Kein zweiter Settings-Store.

Kompatibilität: gespeicherte gültige Auswahl hat Vorrang. Bestehende/unklare Profile ohne gültige Auswahl bleiben Classic, auch bei fehlender Preferences-Datei; kein Umschreiben beim Lesen. Nur die Main-Registrierung kennzeichnet eindeutig neue Konten mit `profileSchemaVersion: 2`; diese erhalten bei erstmalig fehlender Datei Modern. Bestehende Dateien ohne Desktop-Auswahl werden konservativ Classic. Reset verwendet diese Kontogeneration (alt Classic / neu Modern), setzt wie bisher die gesamten Darstellungseinstellungen zurück und löscht keine App-Dateien. Der Marker enthält keine zusätzliche Theme-Auswahl.

Renderer-Vertrag für A3: `document.documentElement.dataset.desktopTheme` bzw. `html[data-desktop-theme="modern|classic"]`. Initial sicher Classic, danach bestätigter Preferences-Wert. Umschaltung nutzt vorhandene IPC/Schreibwarteschlange; erst bestätigtes Speichern ändert Cache/Root, laufende Auswahl ist gesperrt. Fehler erscheinen im bestehenden `role=status`, bisheriger Wert bleibt bestehen, Retry möglich. Ohne Desktop-API ist die Auswahl deaktiviert; kein neuer LocalStorage-Fallback.

Prüfungen: **150/150 automatisierte Tests, 0 Fehler/Skips**, darunter fünf neue Tests für gültige/ungültige Werte, Alt-/Neuprofile, Main-Registrierung (explizites Test-Double für Passwortableitung), Profiltrennung, unabhängiges Dock/Wallpaper, Modern → Classic → Modern, Reset, fresh-store Persistenz und verzögertes/fehlgeschlagenes Speichern. Bestehende Temp-/Symlink-Schutztests weiterhin aktiv. `node --check` für app.js/main.cjs, Catalina-Konfigurationscheck und `git diff --check` bestanden.

Echter Linux/Electron-32.3.3-/Xvfb-GUI-Test mit eigener Testkonfiguration: neues Konto startet Modern; beide Auswahlen unabhängig; Wechsel, Renderer-Neuladen und Reset erfolgreich. Absichtlich blockierte Preferences-Datei nur im isolierten Testprofil: echte IPC meldet Fehler sichtbar, bestätigtes Theme bleibt, Originalbytes werden unverändert wiederhergestellt; Retry erfolgreich. [Screenshot 1650×930](visual/air-modern-a2-settings-1650.png). Kein vollständiger Electron-Prozessneustart im GUI-Test; Wiederladen des persistenten Stores ist automatisiert geprüft. Keine neuen nativen Windows-/macOS-Hardwaretests, keine neue CI-Abnahme behauptet. Theme-Branch-Push löst laut unveränderter Workflow-Filter keinen Installer-Build aus.

Visuelle Abweichungen zu Bild 2 bleiben ausdrücklich: Menüleiste/Seiten-Icons sichtbar, bestehendes helles großes Dock, bisherige Island-Position, kein Mint-Air-Home. A2 bereitet nur den Zustand vor; keine A3-Styles umgesetzt. main, A1, PR #11/#12, Installer-Branch, Workflows, Dependencies und Downloads unverändert. Bekannte Audit-/Signing-/Notarisierungs- und native Release-Blocker bleiben offen.

Nächste drei Micro-Einheiten, jeweils erst nach neuem Prompt: (1) **A3** reduzierte Modern-Desktop-Hülle mit erreichbarer Suche/Settings/Abmelden/Finder/Launchpad und Classic-Rückkehr; (2) **B1** kompaktes schwarzes Dock über vorhandene Registry/Lifecycle; (3) **C1** kompakte schwarze Island am oberen Rand ohne neue Systemsteuerungen. Commit `Add profile-scoped desktop theme selection independent of dock`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Aktueller Checkpoint – Redesign A1: Original-Wolkenhintergrund und Designsystem

23. Oktober 2026. Genau eine kleine Phase-A-Einheit: **eigener Offline-Wolkenhintergrund, neue Standardauswahl und wiederverwendbare Farbtokens**, nicht das vollständige Desktop-Redesign. Ausgangs-Commit `d6a2cc086113eceb71da02e68742f13903ffe2aa` auf Testinstaller-Branch per GitHub bestätigt, eigener Branch `theme/air-modern-foundation-a1-20261023`. main `a1f3e12`, PR #11 `eecab2a`, PR #12 `eb3f3bc` unverändert. Arbeitsbaum zuvor sauber, kein paralleles Schreiben auf dem Installer-Branch.

Bild 1/Bild 2 visuell analysiert; [präzises Maß-/Farbkonzept, Phasen und echte Screenshots](AIR_MODERN_DESIGN.md). Referenz 1920×1080: Air Home ca. 79,3 % × 78,6 %, 212-px-Navigation, 380-px-Kacheln/20-px-Lücken; Dockziel bei 1650px ca. 378px, Island ca. 215px. Farben sind visuell angenäherte Air-OS-Festlegungen, keine behaupteten exakten Pixel-Samples. Kein GPL-/Folia-Code/Asset/Logo übernommen.

Implementiert: eigene statische SVG-Wolken als Data-URI in bestehendem app.js, `--air-modern-*`-Palette/Radius/Schatten-Tokens in styles.css, `clouds` als neuer Preferences-Default für fehlende Auswahl/neue Profile und echter Settings-Button „Blaue Wolken“. Explizite Classic-/Custom-Auswahl und Profiltrennung bleiben. Alte CSS-`!important`-Strandbildregel überdeckte die echte Auswahl, im GUI reproduziert und entfernt. Keine Menü-/Dock-/Window-Manager-/Registry-Neuentwicklung, kein Air Home oder Fake-Widget.

Tests: gesamte Suite **145 bestanden, 0 Fehler/Skips**; gezielt Preferences/Temp-Schreibsicherheit/Dock-Pins **16/16**. Echter sandboxed Linux/Electron-32.3.3-/Xvfb-Lauf: SVG tatsächlich dekodiert, neues Profil, echte Settings-Klicks/Preferences-IPC/Persistenz nach Reload, Launchpad-Start/Schließen, vollflächiger Hintergrund/zentrierte bestehende Island bei 1920/1650/390px, statischer Reduce-Motion-Hintergrund, keine Rendererfehler. Drei echte PNGs unter docs/visual. Syntax, Catalina-Konfiguration, git diff --check bestanden. package.json, Installer-Workflows und Testbuild-Helfer per Diff unverändert; kein neuer Installer-Build ausgelöst.

Abweichungen: Vektorwolken statt Fotostruktur; Menüleiste und Desktop-Icons noch sichtbar; Dock 1553×86px bei Desktopgrößen statt ca. 378px Breite, noch hell; Island 156×38px bei y39 statt am Rand; Mint-Air-Home/Navigation/Kacheln/Typografie noch nicht umgesetzt. Keine 1:1-Übereinstimmung oder neue Windows-/macOS-/Release-Abnahme behauptet. Vorhandene Installer bleiben unverändert und enthalten A1 nicht. Audit-/Signing-/Profilgrenzen weiter offen.

Nächste drei Micro-Einheiten, jeweils erst auf neuen Prompt: (1) A2: profilbezogenen Desktop-Theme-Vertrag Modern/Classic im vorhandenen Preferences-Store ergänzen; (2) A3: reduzierte Modern-Hülle mit Menü/Account/Suche auf Abruf und erhaltenen Tastatur-/App-Zugängen; (3) B1: kompaktes schwarzes Dock mit vorhandenem Registry-/Lifecycle-Pfad, Pinning/Sortierung separat. Commit `Establish Air Modern palette and original offline cloud wallpaper`; SHA im Abschlussbericht. Danach Sitzung beenden.

---

# Abschluss – echte Windows-/macOS-Testinstaller hochgeladen

23. Oktober 2026. Erfolgreicher gemeinsamer [Run #99 / 39990292082](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39990292082), **Build-Commit `668f636e63a16f78fa5c5bae2e042ec65259d743`**, Vorabversion `1.0.3-dev.99.sha668f636e63a1`. Beide nativen Regressionstestschritte, Windows x64/ARM64- und macOS-Universal-Paketierung, tatsächliche Paket-/CPU-/Hash-Prüfung und vier Uploads erfolgreich. Kein behaupteter Hardware-/Installations-/Starttest. Lokale Suite 144/144 ohne Fehler/Skips; native genaue Log-Zählungen nicht erneut abrufbar.

[Downloadliste, Artefakt-IDs, Größen, Prüfsummenhinweise, Reparaturbelege und Einschränkungen](AIR_OS_TEST_BUILD_20261023.md). Tatsächlich sichtbare Artefakte: Windows x64 `12517013177` (75.1 MB), ARM64 `12517627118` (72.7 MB), macOS Universal DMG `12516579305` (170 MB), ZIP `12516798653` (170 MB). Alle tragen denselben vollständigen Build-SHA; nicht mit den früheren #98-macOS-Artefakten mischen. Je Download Installer, BUILD-INFO.json und SHA256SUMS.txt. GitHub-Anmeldung erforderlich, 14 Tage Retention; kein Stable-Release. GitHub-Artefakt-ZIP-Digests öffentlich geprüft, Installer-Dateihashes in den Artefakten/Job-Summaries. Anonymer Download endet erwartungsgemäß ohne passende Anmeldung mit 404; ein berechtigter Download wurde hier wegen gesperrter API nicht selbst ausgeführt.

PR #12 zeigte auf main; Historie bestätigt Entwicklungsbase eecab2a als Vorfahr (13 Folgecommits bis eb3f3bc). API-Basisänderung versucht und Forbidden; keine erfolgreiche Umstellung behauptet. Main `a1f3e12`, PR #11 `eecab2a`, PR #12 `eb3f3bc` bleiben unverändert; nur eigener Testbranch gepusht. Windows-Fehler anhand Benutzerlogs repariert, keine Tests deaktiviert. Neue Folgelogs zu #98 bestätigen genau den korrigierten ASAR-Pfadfehler. Aktueller Run danach vollständig grün.

Offen: zwei High-Dependency-Befunde bei isolierter frischer Auflösung (Electron/extract-zip), fehlendes vertrauenswürdiges Signing/Notarisierung, native Hardware-/Installerabnahme, Profil-/Pfad-Races, Produktions-Store-Trust, Updates/Rollback. Öffentlicher Demo-Verifikationsschlüssel bleibt für vorhandene Signaturprüfung nötig; keine privaten Testschlüssel eingebaut. ChatGPT nur Kandidatenprüfung, Cloud-Sync unverfügbar. Catalina nur als konfigurierte Intel-Mindestversion 10.15.0 erhalten, keine Catalina-ARM- oder Hardware-Abnahme behauptet.

Nächste drei kleine Einheiten, erst auf neuen Prompt: (1) genau einen Installer auf echter OS-/CPU-Hardware mit Profilpersistenz/Grundfunktionen abnehmen; (2) nächste OS-/CPU-Kombination separat prüfen; (3) PR-#12-Basis/Integration der neuen Fixes bei funktionierendem Zugriff korrigieren und Audit-/Release-Supportstrategie weiter bewerten. Dieser reine Dokumentations-Checkpoint löst keinen weiteren Build aus; Build-SHA bleibt ausdrücklich 668f636. Nach Sicherung Sitzung beenden.

---

# Testbuild-Zwischenstand – native macOS-Pakete vorhanden, ASAR-Pfadgrenze korrigiert

23. Oktober 2026. Erster echter Push-Testlauf [39989705165](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39989705165), Commit `364cb284cac7c1719ad14331499592b508dd3569`, Build #98: macOS-Tests, Universal-Paketierung, Inhalts-/Architektur-/Datei-/Hash-Prüfung und beide Uploads erfolgreich. Zwei etwa 170-MB-Artefakte sichtbar: DMG `12517666264`, ZIP `12516473563`. Windows-Testschritt weiterhin rot, Paketierung/Uploads dort übersprungen. Kein Windows-Erfolg behauptet und macOS-Artefakte nicht als Vier-Plattform-Abschluss ausgegeben. API-Logs weiterhin gesperrt; neue Logausgabe beim Benutzer angefragt.

Unabhängig nachgewiesener Fehler im neuen Paketprüfer: @electron/asar trennt Verzeichnisnamen am nativen path.sep; plattformneutrale Slash-Namen wurden ungeändert an extractFile übergeben. Unter Windows ergibt dies falsche Traversierung. Fix: Vergleiche weiterhin mit portablen Namen, Extraktion ausschließlich mit path.normalize an der API-Grenze. Zusätzlicher strikter Windows-Pfad-Vertragstest mit Produktionsmodul im VM-Adapter vor Fix rot/nach Fix grün. Keine ASAR-/Signatur-/Dateiprüfung entfernt. CLI schreibt echte Installer-Namen/Größen/Hashes zusätzlich in GitHub-Step-Summary; Unit-Fixtures schreiben dort nichts.

Aktueller lokaler Gesamtstand **144 Tests bestanden, 0 Fehler/Skips**. Erneuter isolierter Audit der unveränderten Dependencies: **Exit 1, zwei High (Electron und extract-zip), keine Critical/Moderate/Low**; kein Upgrade/Abschalten. Nächster kontrollierter Schritt: genau ein erneuter gemeinsamer nativer Lauf mit diesem ASAR-Fix und Windows-Preferences-Fix; alle vier finalen Installer müssen dessen identischen SHA tragen. Erster Lauf ist bereits beendet, kein widersprüchlicher Parallelbuild.

---

# Aktueller Checkpoint – überprüfbare Vorab-Installer-Pipeline vorbereitet

23. Oktober 2026. Autorisierter Windows-/macOS-Testinstaller-Auftrag, eigener Branch `build/air-ultimate-test-installers-20261023`, auf neuestem Funktionsstand `eb3f3bc` plus gesichertem Windows-Sicherheitsfix `cdc97aa`. Beide Plattformen sollen aus einem identischen nächsten Code-/Workflow-Commit bauen; tatsächlicher Build-SHA/Run und Artefaktresultate folgen im Testbuild-Bericht. Noch keine Installer oder erfolgreichen nativen Tests behauptet.

Neue `scripts/test-build.cjs` bereitet nur im CI-Workspace die Version `1.0.3-dev.<run_number>.sha<12-stelliger Commit>` mit vollständiger Commit-Kennung/Limitierungen in den Paketmetadaten vor. Die Repository-Version/Electron-Abhängigkeiten bleiben unverändert. Nach Paketierung werden benötigte Registry-/Runtime-/Island-/Dock-/Preferences-/Notes-/Spotify-/ChatGPT-Dateien in tatsächlichen ASARs geprüft, Paket-SHA/Version abgeglichen, persönliche Pfade/Privatschlüssel zurückgewiesen sowie Windows-PE-Maschinen x64/ARM64 und beide Intel-/ARM64-Slices des macOS-Universal-Mach-O geprüft. Installer müssen eindeutigen Versionsnamen, Mindestgröße und EXE-/ZIP-/DMG-Formatkennung haben. Vier getrennte Verzeichnisse mit jeweiligem Installer, BUILD-INFO.json und SHA256SUMS.txt werden erzeugt; fehlende/mehrdeutige/falsche Ergebnisse brechen ab.

`build-desktop.yml` behält Tests vor Paketierung und --publish never bei, unterstützt PRs gegen den Entwicklungsbranch, workflow_dispatch und genau den neuen Testbranch als zusätzlichen Push-Auslöser. Je Plattform zwei commit-/attempt-gebundene Artefakte, 14 Tage Aufbewahrung, if-no-files-found:error. Kein Release-Schreibrecht. Workflow-Concurrency verhindert überlappende Läufe auf demselben Ref; reine spätere docs/**-Pushes lösen keine weiteren Builds aus. Kein stabiler Release, kein Main-Merge oder Änderung fremder Quellbranches. PR-#12-Basisänderung per API weiterhin blockiert.

Lokale Ergebnisse: **143/143 Tests, 0 Skips/Fehler** mit `TMPDIR=/workspace/scratch npm test`. Darin 15 gezielte Preferences-/Pinning-Tests und sieben neue Build-Verifikationstests. Build-Tests verwenden echte temporäre ASAR-Archive, aber ausdrücklich synthetische PE-/Mach-O-/Installer-Dateiköpfe: keine lauffähigen Installer, keine native Plattformabnahme, immer nur OS-Tempdateien und nach Tests gelöscht. Negativfälle: fehlende Island, privater Schlüssel, Profildaten, falscher Commit, fehlender Installer und falsche Architektur. Geänderte CJS-Dateien syntaxgeprüft, Catalina-Konfiguration/YAML-Reihenfolge/Artefaktnamen und git diff --check bestanden. package.json und Security-Workflow unverändert bestätigt.

Wichtige Grenze: Der bestehende Offline-Demo-Store benötigt beim Host-Start den mitgelieferten **öffentlichen** Demo-Verifikationsschlüssel. Er wird nicht entfernt, um Signaturprüfungen nicht zu umgehen; keine privaten Demo-/Test-Signierschlüssel werden eingebaut. Falls „keine Testschlüssel“ auch diesen öffentlichen Prüfschlüssel ausschließen soll, benötigt das einen gesonderten Store-/Trust-Root-Umbau; der bisherige Store ist kein Produktions-Vertrauenssystem. Keine persönlichen Daten oder Testfixtures dürfen in die App-Pakete gelangen. Catalina-Minimum bleibt 10.15.0 konfiguriert (Intel); Apple Silicon benötigt tatsächlich passende neuere Hardware/OS-Laufzeit, kein erfundener Catalina-ARM-Support. Fehlendes Signing/Notarisierung und bekannte Electron/extract-zip-High-Befunde bleiben Testbuild-Limitierungen. Kein vollständiger Schutz gegen gleichzeitigen bösartigen Pfadaustausch/Power-Loss behauptet.

Nächste kontrollierte Schritte dieses Installer-Auftrags: (1) gemeinsamen Code-Commit pushen und einmaligen Push-Build beobachten; (2) native Testergebnisse/Paketprüfung/Uploads prüfen; (3) nur tatsächlich vorhandene Artefakt-IDs/Downloadlinks und Hashes in docs/AIR_OS_TEST_BUILD_20261023.md sichern. Bei API-/Runnerblockade sicheren Zwischenstand mit exakt nächstem Schritt dokumentieren.

---

# Aktueller Checkpoint – Windows: verwaisten Preferences-Temp-Symlink vor Open abweisen

23. Oktober 2026. Ausgangs-HEAD `eb3f3bc62641afdd4a0fc2a5a66f6dc3fa053f73` (PR #12), eigener Branch `build/air-ultimate-test-installers-20261023`. PR #11/Entwicklungsbase unverändert `eecab2a`, main `a1f3e12`. PR #12 zeigt laut öffentlicher Seite auf main; passende Entwicklungsbase ist dessen bestätigter Vorfahr `feat/air-os-architecture-foundation` (0/13). Änderung der PR-Base per `gh pr edit` versucht, GraphQL Forbidden; nicht erfolgt.

Vom Benutzer bereitgestellter Original-Log zu Run 39987254742, Windows-Job 120529625679: 134 Tests, 133 bestanden, einziger Fehler `dangling temporary symlink cannot create its target and remains untouched`, erwartetes EEXIST blieb aus. Öffentliche Jobseite bestätigt den fehlgeschlagenen Testschritt und übersprungene Paketierung. Direkter Log-/API-Zugriff hier gesperrt. Das ist eine Windows-Open-/Reparse-Point-Semantik mit Sicherheitswirkung, keine zu entfernende Assertion: wx allein verhinderte in diesem Fall nicht das Folgen eines verwaisten Links.

Fix nur im bestehenden Preferences-Writer: vor exklusiver Reservierung `lstatSync(temp)` statt linkfolgendem existsSync; jede bestehende Directory-Entry mit EEXIST abweisen, andere Inspektionsfehler fail-closed. Kein Cleanup auf solchen fremden Pfaden. Anschließend unverändert wx/0600, Dateideskriptor-Schreiben/Schließen, Rename und nur eigener Cleanup. Zwei neue Regressionstests vor Fix rot/nach Fix grün, einschließlich eines expliziten Windows-Semantik-Dateisystem-Doubles; ursprünglicher Test erhalten. Kein allgemeiner Schutz vor bösartigem konkurrierendem Austausch zwischen lstat/Open behauptet; dieser Race bleibt eine bekannte Grenze.

`node --test tests/preferences-write.test.cjs tests/preferences.test.cjs tests/dock-pins.test.cjs`: **15/15 bestanden** auf Linux (gezielter Lauf im zusammenhängenden Build-Vorbereitungslauf ebenfalls grün). Keine echte Windows-/macOS-Abnahme behauptet. Keine Tests zur Umgehung des Fehlers deaktiviert/übersprungen. Testbuild-Pipeline und Artefaktprüfung folgen als nächster gesicherter Schritt im selben autorisierten Installer-Auftrag, aus einem danach festgelegten identischen Commit für beide Plattformen. Keine öffentliche Veröffentlichung, keine Änderungen an main oder fremden Branches.

Nächste drei kontrollierte Schritte: (1) vorbereitete Paket-/Architektur-/Prüfsummenprüfung samt Tests sichern; (2) gemeinsamen nativen Windows/macOS-Testlauf auf dem Testbranch starten; (3) tatsächlich hochgeladene Artefakte/Größen/Hashes prüfen und echte Downloadlinks dokumentieren. Audit/Signing/Notarisierung und native Hardwaretests bleiben offen.

---

# Aktueller Checkpoint – Desktop-CI: Plattformtests vor Windows-/macOS-Paketierung

23. Oktober 2026. Genau eine Micro-Einheit: **vorhandene Node-Regressionstests auf beiden nativen Desktop-CI-Runnern vor der Paketierung verbindlich ausführen**. Ausgangs-Commit `827d1ef0203b61e01c3d600ff7398f3da3c2bc9d` auf `fix/air-preferences-exclusive-temp-20261023` per GitHub bestätigt; main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`. Remote-Branch-Refs geprüft, lokaler Ausgangsarbeitsbaum sauber. Eigener Branch `fix/air-desktop-platform-test-gates-20261023`; main/PR #11/fremde Branches unverändert.

Aktuelle Actions geprüft: `gh run list` über API liefert Forbidden. Die öffentliche [Actions-Seite](https://github.com/quattrologic/Air-Os-Clean/actions) und einzelne Run-Seiten waren erreichbar. Neueste dort sichtbare Einträge am Abruf: [Security #89 / Run 39813992511](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39813992511) **failure**, [Desktop-Build #96 / Run 39813992467](https://github.com/quattrologic/Air-Os-Clean/actions/runs/39813992467) **success**, beide vom 22.10.2026 16:25:49 UTC, Seitenkopf jeweils `eecab2a`/PR #11. Das sind frühere Runs und **keine Abnahme der nachfolgenden Micro-Branches oder dieses Commits**. Ohne vollständige aktuelle Logs wird die genaue Ursache des roten Security-Runs nicht behauptet. Release-Listenabfrage über `gh release list` ebenfalls Forbidden; aktueller veröffentlichter Releasebestand nicht bestätigt.

Pipeline-Bestand geprüft: `build-desktop.yml` validiert Quellsyntax/Catalina-Konfiguration auf Ubuntu und paketiert nachfolgend auf `windows-latest` und `macos-latest`. Beide checken standardmäßig denselben Workflow-Commit aus. `pack:win` fordert x64/ARM64 an, `pack:mac` DMG/ZIP universal; beide mit `--publish never`. Artefakte sind zeitlich begrenzte Test-Uploads und werden in diesem Workflow bei PRs nicht hochgeladen. Daneben existieren ein separater macOS-Workflow, manuelles Modern-Channel-Building mit Electron 44.9.0 und ein unveränderter separater Security-Workflow mit Unit-Tests/High-Audit. Keine automatisierte freigegebene Produktions-Release-Kette nachgewiesen.

Konkreter Mangel: Im Desktop-Workflow führte vor dieser Änderung **keiner der beiden Plattform-Buildjobs `npm test` aus**. Der separate Ubuntu-Security-Job ersetzt keine nativen Dateisystem-/Plattformtests und ist keine Job-Abhängigkeit der Paketierung. Fix ausschließlich in `.github/workflows/build-desktop.yml`: je ein unbedingter `npm test`-Schritt nach Dependency-Installation und vor `pack:win` bzw. `pack:mac`, ohne `continue-on-error`. Ein roter Plattformtest verhindert so die nachfolgende Paketierung in diesem Job. Keine Tests gelöscht, kein Audit deaktiviert, keine neuen Abhängigkeiten, Versions-/Electron-/Signing-/Release-Änderungen. Der separate macOS- und der Modern-Workflow werden in dieser Einheit nicht umgebaut; der generelle Security-Gesamtstatus ist weiterhin separat zu bewerten.

Tatsächliche lokale Prüfungen: Linux x86_64, Node 24.19.0/npm 11.9.0; `TMPDIR=/workspace/scratch npm test` **134 bestanden, 0 fehlgeschlagen/übersprungen**. Vorher-/Nachher-YAML mit bereits installiertem Python/PyYAML BaseLoader geprüft: zuvor kein Testschritt in beiden Jobs; nun Reihenfolge Installation → unbedingter Test → jeweilige Paketierung, vorhandenes `needs: validate-source`, keine abweichenden Checkout-Refs, weiterhin `contents: read` und `--publish never` in beiden Paketbefehlen. Das ist eine lokale Strukturprüfung, kein ausgeführter GitHub-Runner. Syntax Main/Preload, `npm run check:catalina` und `git diff --check` bestanden. `package.json`, Security- und Modern-Workflow per Diff unverändert bestätigt. Keine zusätzliche Testdatei für diese vierzeilige Workflow-Anbindung; die bestehende vollständige Regressionssuite ist die Testschranke.

**Neue Windows-/macOS-Builds blockiert:** `gh workflow run build-desktop.yml --repo quattrologic/Air-Os-Clean --ref fix/air-desktop-platform-test-gates-20261023` scheitert bereits beim GET der Workflow-Metadaten unter `api.github.com/.../actions/workflows/build-desktop.yml` mit Forbidden, vor einem Dispatch. Kein neuer Runner/Build gestartet oder erfolgreich behauptet. Diese Cloud ist Linux, keine native Windows-/macOS-Ausführungsumgebung; kein Cross-Build als Ersatz für Installations-/Starttests ausgegeben. Nach Verfügbarkeit der Dispatch-Rechte den gepushten Branch verwenden, beide Jobs auf identischen `head_sha` prüfen und tatsächliche x64/ARM64-/Universal-Artefakte und Testresultate abnehmen. Ein Branch-Push allein löst diesen auf main/PR/Dispatch begrenzten Workflow nicht aus.

**Release-/Supportgrenzen bleiben offen:** Legacy ist weiterhin Electron 32.3.3 mit konfiguriertem macOS-Minimum 10.15.0, nur risikobehafteter Testkanal; Modern ist separat manuell mit Electron 44.9.0 und Ziel macOS >=13 konfiguriert. Catalina-Konfigurationsprüfung ist kein echter Catalina-Starttest; tatsächliche OS-/CPU-Unterstützung/Installergrenzen je Architektur prüfen. Kein unkontrolliertes Major-Upgrade. Historischer Audit vom 20.10.: zehn betroffene Pakete, zwei High (Electron/extract-zip), acht Moderate; heute kein neuer Dependency-Audit und kein Nachweis ihrer Behebung. Modern benötigt eigenen aktuellen Audit. Außerdem offen: reproduzierbarer Lockfile-Vertrag, native Installer-/Smoke-/GUI-/Performance-/Accessibility-Abnahme, Profil-/Dateisystem-Races, Produktions-Store-Trust, Signing/Notarisierung, Prüfsummen und sichere Update-/Rollback-Kette. Keine öffentliche Veröffentlichung vorgenommen oder freigegeben. Spätere iPadOS-Version bleibt eine eigene Laufzeit; Electron ist kein iPadOS-Ziel.

Nächste drei kleine Qualitätseinheiten, erst auf weiteren Prompt: (1) Desktop-Workflow mit funktionierendem GitHub-Zugriff für denselben gepushten SHA auf Windows/macOS starten und Resultate/Architekturen belegen; (2) Modern-Kanal isoliert auditieren und einen konkreten transitive-/Runtime-Befund bewerten, Legacy/Catalina nicht still aktualisieren; (3) genau einen erzeugten Installer auf einer echten OS-/CPU-Kombination installieren/starten/deinstallieren und Profilpersistenz prüfen. Commit `Run native platform regression tests before desktop packaging`; SHA im Git-Log/Abschlussbericht. Nach GitHub-Sicherung stoppen.

---

# Aktueller Checkpoint – Preferences: temporäre Schreibpfade exklusiv reservieren

23. Oktober 2026. Genau eine Micro-Einheit: **Datenintegrität beim vorhandenen Preferences-Update/Reset sichern**. Ausgangs-Commit `0be04bafefd7dbd3c3f0812907ca36b6e5d8551c` auf `fix/air-notes-pending-save-edits-20261023` per GitHub bestätigt. main `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, PR #11 `eecab2a043fc62ab0802312aa09ce29dfd96c280`; alle Remote-Branch-Refs geprüft, lokaler Ausgangsarbeitsbaum sauber. Eigener Branch `fix/air-preferences-exclusive-temp-20261023`. Aktuelle CI-/PR-API-Abfragen liefern Forbidden; kein aktueller CI-/PR-Gesamtstatus bestätigt. Main und andere Branches bleiben unverändert.

Bestand geprüft: `src/main/preferences.cjs`, Notes-/Reminders-Stores, Profil-/Anmelde-/Preferences-IPC in `main.cjs`, bestehende Preferences-/Dock-Pins-Tests sowie `cloud-sync/core.cjs` und `selection.cjs`. Darstellung liegt bereits in `profiles/<Benutzerhash>/appearance-v1.json`; IPC bestimmt den Benutzer anhand der angemeldeten Sitzung, nicht anhand eines Renderer-Profilpfads. Notes/Reminders haben eigene Profil-Stores. Konten speichern Salt/scrypt-Hash statt Klartextpasswort; das ist eine Quellprüfung, kein neuer Auth-Audit. Kalender/AirWrite/Musik besitzen weiterhin bekannte globale Datenbereiche; diese Sitzung migriert sie nicht.

Nachgewiesene Lücke im Preferences-Writer: `writeFileSync(temp, ..., mode:0o600)` reservierte den Zufallspfad nicht exklusiv. Eine bereits vorhandene Datei wurde überschrieben und per Rename verschoben; ein vorhandener Symlink wurde verfolgt und konnte dadurch die Einstellungen eines anderen Profils verändern. Das anschließende Cleanup konnte außerdem einen fremden Temp-Pfad löschen. Reproduktion ausschließlich in temporären Testprofilen mit deterministischer Namenskollision. Vor Fix **2/6 neue Tests bestanden, 4 fehlgeschlagen** (Kollisionen/Symlinks sowie der neue Deskriptor-Vertrag).

Fix nur im bestehenden Preferences-Writer: `openSync(temp,'wx',0o600)` **vor** dem Cleanup-Block. Bestehende Dateien/Symlinks einschließlich dangling Links führen zu EEXIST, ohne Schreibzugriff/Cleanup an diesem Namen. Schreiben über den exklusiv geöffneten Dateideskriptor; diesen im inneren `finally` schließen, anschließend per bestehendem Rename die Preferences ersetzen. Fehler-Cleanup nur nach erfolgreichem Reservieren. Bestehendes Schema, validierte Felder einschließlich Dock-Pins, Profilpfade und authentifizierte IPC unverändert; keine neue Datenbank, Abhängigkeit, Cloud-Anbindung oder Profilmigration.

Sechs neue `tests/preferences-write.test.cjs`: Produktionsmodul im Node-VM-Adapter, echte temporäre Dateien/Profilpfade, deterministische Zufallsnamen und gezielt injizierte I/O-Fehler ohne globale fs-Monkeypatches. Update/Reset und frische Store-Instanz, private 0600-Dateimodi auf POSIX, Datei-Kollision bei vorhandenem/fehlendem Ziel, Symlink auf Bobs Preferences, dangling Symlink, partieller ENOSPC mit geschlossenem Deskriptor und Rename-EACCES geprüft. Fremde Pfade/Ziele und alte Einstellungen bleiben bytegenau erhalten; nur eigene Fehler-Tempdatei wird entfernt; Retry und Profiltrennung bestätigt. Windows-Symlink-Tests dürfen bei fehlender EPERM-Berechtigung ausdrücklich skippen, aktueller Linux-Lauf ohne Skip.

Nach Fix: `node --test tests/preferences-write.test.cjs tests/preferences.test.cjs tests/dock-pins.test.cjs` **13/13 grün**. `TMPDIR=/workspace/scratch npm test` **134 bestanden, 0 fehlgeschlagen/übersprungen**. Syntax des Stores und neuen Tests, `npm run check:catalina`, `git diff --check` bestanden. Keine neue GUI-/echte Electron-IPC-/Windows-/macOS-/Installerprüfung oder Audit; reine Store-/Dateisystem-Einheit. Kein Schutz gegen bösartigen konkurrierenden Austausch nach Reservierung, Symlinks in sämtlichen Elternpfaden oder Power-Loss garantiert; Rename allein ist keine vollständige Durability-Garantie.

Cloud-Status unverändert **nicht verfügbar**: `cloud-sync/` bietet lokale Auswahl-/Validierungs-/Konfliktbausteine, standardmäßig deaktiviert. Keine produktive Authentifizierung, kein Transport-/Sync-Dienst und keine angebundene Cloud-Verfügbarkeitsanzeige im Desktop gefunden; keine Aktivierung oder neue Erfolgsanzeige ergänzt. Backup/Restore, sichere Cloud-Authentifizierung und E2EE bleiben gesonderte offene Aufgaben. Bestehende Legacy-Electron-/historischen Audit-, Profilisolations-, Store-Trust-/Update-, Signing-/Notarisierungs- und CI-Blocker bleiben sichtbar; kein öffentlicher Release freigegeben.

Nächste drei kleine Integritätseinheiten, jeweils erst auf neuen Prompt: (1) temporären Notes-Store-Schreibpfad separat auf exklusive Reservierung/Eigentum beim Cleanup absichern; (2) denselben Kollisionsfall beim Reminders-Store prüfen, dessen exklusiver Write derzeit innerhalb des Cleanup-Blocks liegt; (3) beschädigte `accounts.json` beim Kontoanlegen reproduzieren und fail-closed behandeln, statt Lesefehler als leere Kontenliste zu überschreiben. Keine dieser Änderungen in dieser Sitzung umgesetzt. Commit `Reserve preferences temporary files exclusively before cleanup`; SHA im Git-Log/Abschlussbericht. Nach Sicherung stoppen.

---

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
