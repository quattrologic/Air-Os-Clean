# Air Modern – verbindlicher Designplan aus Bild 2

23. Oktober 2026. Bild 1 ist der zu ersetzende Bestand, **Bild 2 ist die visuelle Zielreferenz**. Keine Folia-Webseite, kein fremdes Logo, kein Bloom-Code/-Asset. Bloom bleibt GPL-Referenz für allgemeine Interaktionsprinzipien; Air-OS-Implementierung eigenständig unter MIT. Desktop bleibt innerhalb der Electron-App. Installer-Workflows, Testinstaller-Branch und vorhandene Downloads bleiben unangetastet.

## Referenzgeometrie

Das beigefügte Bild 2 ist 1920 × 1080 px groß. Die folgenden Bildkoordinaten sind aus der sichtbaren Vorlage angenähert; sie sind keine automatisch berechnete Pixel-Diff-Messung. Die daraus festgelegten Zielmaße sind die Grundlage der nächsten Einheiten.

| Element | Ziel bei 1920 × 1080 | Umgerechnet auf 1650 × 930 |
| --- | --- | --- |
| Air-Home-Außenrahmen | etwa x=200, y=103, Breite=1522, Höhe=849 | x≈172, y≈89, 1308 × 731 |
| Anteil am Desktop | 79,3 % breit, 78,6 % hoch; oben 9,5 % Abstand | dieselben Proportionen, nicht Vollbild |
| Mint-Seitenleiste | etwa 212 px / 13,9 % der Fensterbreite | etwa 182 px |
| Mint-Rahmen, Außenradius | 9–10 px, Radius 22 px | 8–9 px, Radius 20 px |
| Hauptinhalt | 3 Spalten, Kacheln ca. 380 px, Abstand 20 px, Rand 60 px | Kacheln ca. 327 px, Abstand 17–18 px, Rand 52 px |
| Schwarzes Host-Dock | etwa 440 × 68 px, mittig, unten 0–8 px | etwa 378 × 59 px; Icons 35–42 px |
| Schwarze Island | etwa 250 × 45 px, mittig am oberen Rand | etwa 215 × 39 px |

Das große helle Werkzeugband **innerhalb** des Folia-Fensters ist nicht das schwarze Air-OS-App-Dock. Keine Kopie dieses Fremdprodukts/Logos oder seiner Daten. Bei kleinen Displays: Außenabstand 12–16 px, Kacheln später auf zwei/eine Spalte, Seitenleiste kompakter; Island und Dock dürfen niemals Bedienelemente verdecken. Layout-/Fokusvertrag mit der bestehenden Fensterverwaltung umsetzen, keine zweite Fensterverwaltung.

## Farb- und Typografiesystem

An Bild 2 angenäherte und für Air-OS festgelegte Werte, keine behaupteten exakt gesampelten Originalfarben. Bereits als wiederverwendbare `--air-modern-*`-Tokens in styles.css hinterlegt; bestehende App-Oberflächen werden erst in ihren Folgephasen umgestellt.

| Rolle | Air-OS-Wert |
| --- | --- |
| Himmel, Richtwert | `#235f94`, Verlauf von `#124f86` zu `#9bbcc7` |
| Mint-Rahmen | `#9cdaa1` |
| Helle Navigation | `#b0e5ad` |
| Warmer Inhaltsgrund | `#f8f7f3` |
| Dunkelgrüner Text | `#2c3b31` |
| Sekundärtext | `#677e6c` |
| Feine Umrandung | `#b8bcb6`, 1 px |
| Dock/Island | `#090b0c` |
| Kachelradius | 10 px |
| Fensterschatten | `0 18px 48px #183b3929` |

Spätere Schriftumstellung: System-UI für Navigation/Inhalte (`system-ui`, macOS-Systemschrift, Segoe UI unter Windows); eigene Serif-Akzente mit vorhandenen Georgia/Times-Fallbacks statt fremder Fontdateien. Hauptbegrüßung ca. 34–36 px, Abschnittstitel 28–30 px, Inhalt 17–18 px bei Referenzgröße, entsprechend kleiner bei 1650 px. Tatsächliche Fontmetriken pro Plattform visuell abnehmen. Keine externen Fonts erforderlich.

## Kleine, einzeln prüfbare Einheiten

- **A1 – diese Sitzung abgeschlossen:** Original-Wolkenhintergrund und Farb-/Maßgrundlage. `clouds` ist der neue Default bei fehlender Auswahl/neuen Profilen. Vorhandene explizite Bilder bleiben erhalten. Bestehende Einstellungen erlauben Auswahl von „Blaue Wolken“, Classic-Bildern und eigenen Bildern.
- **A2 – abgeschlossen:** separater profilbezogener Desktop-Theme-Vertrag „Air Modern / Classic“ im bestehenden Preferences-Service; Alt-/Neuprofile, Reset und fehlgeschlagenen Save testen. Dock-Theme nicht als zweiten widersprüchlichen Desktop-Theme-Store missbrauchen.
- **A3 – abgeschlossen:** minimale Modern-Desktop-Hülle: dauerhaft sichtbare Menüleiste/Seiten-Icons ausblenden, aber Menüfunktionen, Kontomenü/Abmelden, Suche, Settings und alle Apps über erreichbare Maus-/Tastaturwege erhalten. Classic wiederherstellbar; keine stille Funktionsentfernung.
- **B1/B2/B2.2 – abgeschlossen:** Dock auf 358×68 px und schwarze Fläche reduziert; Apps weiterhin aus bestehender Registry/Lifecycle. Pinning-Renderer, Pin/Unpin, Sortierung und Kontextmenüs in jeweils eigenen Untereinheiten. Vorhandener Pinning-Speichervertrag bleibt die Grundlage.
- **C1 – abgeschlossen:** bestehende Modern-Island viewportfest am oberen Rand/proportionale Größe angepasst; echte Uhrzeit/Control-Tile/Notes-Mitteilung erhalten, Fokus/kleine Displays/reduzierte Bewegung regressionsprüfen. Keine Fake-Medien-/Batteriewerte.
- **D:** eigenständiges Air Home in bestehender Registry/Fensterverwaltung, Mint-Rahmen und Navigation; kein Web-Wrapper für Folia. Ein Fenster, keine Dashboard-Funktionssammlung in derselben Einheit.
- **E:** je ein echtes Widget anbinden: angemeldeter Benutzer/lokales Datum; Notes; Reminders. Kalender zunächst Profilgrenze lösen. Projekte/zuletzt verwendete Apps/Fokus-Timer nur mit tatsächlichem Zustandsmodell; keine Beispielwerte als echte Nutzerdaten.
- **F:** Fensterrahmen/Öffnen/Schließen sowie Bewegungsreduktion über vorhandene Lifecycle-/Animationswege angleichen.
- **G:** bestehende Apps einzeln integrieren; Finder-/Store-/Runtime-/Profile-/Dateisicherheitsfunktionen erhalten.
- **H:** festgelegte Screenshot-Fälle auf Windows und macOS, unterschiedliche Größen, Tastatur/Kontrast/Performance; Abweichungen einzeln beheben. Keine 1:1-Abnahme aus einem einzelnen Linux-Bild ableiten.

## A1-Implementierung und tatsächliche visuelle Prüfung

Eigene SVG-Vektorgrafik in app.js, als Data-URI offline im Renderer dekodiert, kein Netzdownload oder fremdes Bild. Statische Farbverläufe und weiche Wolkenformen, keine neuen Timer/Animationen. Kein zusätzliches Runtime-Asset und keine Änderung von package.json/Build-Manifest/Installer-Workflows nötig. Alte CSS-Regel erzwang das Strandbild mit `!important` sogar über der gespeicherten Preferences-Auswahl; sie ist entfernt. Der erste echte GUI-Test entdeckte diesen Effekt (`clouds` gespeichert, berechnetes Bild trotzdem Strand), nach Fix tatsächlich SVG sichtbar.

145 Node-Tests bestanden, kein Fehler/Skip; gezielte Preferences-/Pinning-/Schreibsicherheitsprüfungen 16/16. Neue Store-Regression prüft Default, Neustart über neue Store-Instanz, Classic-/Custom-Bilder, Profiltrennung, Wechsel/Reset und Ablehnung freier Wallpaper-URLs. Keine bestehenden Daten migriert oder gelöscht.

Echter Electron-32.3.3-/Linux-/Xvfb-GUI-Test mit aktiver Namespace-Sandbox, ohne --no-sandbox, separatem Wegwerfprofil und lokalem CDP 9231. Der alte Helfer-Display :99 war nicht autorisiert; eigener authentifizierter Display :101 löste dies, ohne fremde Sessions zu beenden. Baseline vor Änderung lokal unter `/workspace/.air-os-onboarding/modern-a1-evidence/before-1920.png`. GUI-Helfer `/workspace/.air-os-onboarding/check-modern-a1.cjs` (vorhandenes Playwright):

1. Neues Profil liefert clouds; tatsächlich dargestellte Data-URI dekodiert als 1920 × 1080 SVG.
2. Echte Settings-Klicks wechseln zu Yosemite und wieder zu Wolken, bestätigte authentifizierte Preferences-IPC liefert die Auswahl, Reload behält sie.
3. Bestehendes Launchpad öffnet/schließt über Dock; vorhandener automatischer Finder wird für den Hintergrundvergleich regulär geschlossen, keine Registry-/Lifecycle-Ersetzung.
4. Vollflächiger Hintergrund und mittige Island bei 1920 × 1080, 1650 × 930, 390 × 600; statischer Hintergrund bei OS-Bewegungsreduktion, keine ungefangenen Rendererfehler.

Screenshots stammen tatsächlich aus diesem Electron-Lauf, kein Mockup und kein erzeugter Entwurf einer noch fehlenden Dashboard-Oberfläche:

![Air Modern A1 – echte Electron-Aufnahme, 1920 × 1080](visual/air-modern-a1-1920.png)

[1650 × 930](visual/air-modern-a1-1650.png) · [390 × 600](visual/air-modern-a1-390.png)

## Ausdrückliche Abweichungen zu Bild 2

- **Hintergrund:** eigenes weiches Vektorbild, nicht die fotografische Wolkenstruktur/Körnung oder exakte Wolkenverteilung der Referenz. Farbrichtung angenähert, kein Pixel-Match.
- **Menü/Icons (seit A3):** in Modern ausgeblendet, in Classic unverändert sichtbar. Kleiner eigener Air-OS-Menüknopf links oben erhält System-/Profilaktionen. Kein dauerhaftes neues Werkzeugband.
- **Dock (seit B1):** Modern-Dock tatsächlich 358×68px, Originalicons 42px, Hintergrund #090b0c, 6px vom unteren Rand; bei allen drei geprüften Breiten ohne Scrollen. Classic bleibt unverändert. B2-Startmenü steht aus.
- **Island (seit C1):** Modern 250×45px bei 1920, 214,84×38,67px bei 1650 und 156×36px bei 390; jeweils y2 und exakt mittig. Classic 156×38px bei y39/y37 erhalten. Keine fremden Mediengrafiken oder simulierten Statuswerte.
- **Air Home:** Mint-Fenster, Seitenleiste, cremefarbene Kacheln/Typografie und Widgets fehlen vollständig; nur Designvorgaben/Tokens, keine fertigen Komponenten behauptet.
- **Animationen:** in A1 nur statischer Hintergrund. Keine bestätigte neue Dock-/Island-/Fensteranimation oder generelle Performance-Abnahme.
- **Plattform:** neue visuelle Abnahme nur Linux/Electron, keine neue Windows-/macOS-/Installer-/Screenreader-Abnahme. Vorhandene Testinstaller aus 668f636 enthalten dieses Redesign noch nicht.

Die Sitzung liefert bewusst nur A1. Ziel bleibt Bild 2; die deutlichen strukturellen Abweichungen sind geplante offene Arbeit, keine abgeschlossene visuelle Freigabe. Bestehende Audit-/Signing-/Notarisierungs-/Datenisolationsgrenzen bleiben bestehen.

## A2 – Theme-Vertrag (23. Oktober 2026)

Desktop-Design und Dock-Design sind unabhängige Felder desselben profilbezogenen Preferences-Stores. `html[data-desktop-theme="modern"]` / `html[data-desktop-theme="classic"]` ist der zentrale Renderer-Zustand für A3; A2 ändert daran keine Desktop-Styles. Neue Main-registrierte Konten mit `profileSchemaVersion: 2` starten bei fehlender Datei Modern, Alt-/unklare Profile und bestehende Dateien ohne gültigen Desktop-Wert Classic. Explizite Auswahl bleibt erhalten; Reset folgt der Kontogeneration. Erst bestätigtes Speichern aktiviert die Auswahl, Fehler werden sichtbar gemeldet.

[Eigener Electron-Screenshot bei 1650×930](visual/air-modern-a2-settings-1650.png): getrennte Auswahl Desktop/Dock; Menü, Icons, Dock und Island bewusst im bisherigen Zustand. Ausführlicher Test-/Persistenznachweis und Grenzen im aktuellen DEVELOPMENT_PROGRESS-Checkpoint. Nächste Einheit A3; keine behauptete Übereinstimmung mit Bild 2.

## A3 – minimalistische Desktop-Hülle (23. Oktober 2026)

Modern nutzt den bestehenden Desktop-Theme-Vertrag, keine neue Präferenz. `display:none` entfernt klassische Menüleiste/Icons auch aus dem Tastaturzugriff; Classic stellt sie wieder her. Ein 32px hoher Air-OS-Knopf bei x=12/y=10 öffnet eine zurückhaltende dunkle Navigation (270px breit, auf Viewport begrenzt, scrollbar). Native Buttons und Details statt unvollständiger ARIA-Menü-Semantik: Enter/Space, normale Tab-Reihenfolge, sichtbarer Mint-Fokus und Escape mit Rückgabe. Originale Account-Elemente werden verschoben; Apps/Suche/Legacy-Aktionen behalten ihre vorhandenen Handler. Alle vorhandenen Apps bleiben über Launchpad/Dock zugänglich.

Echte Electron-Screenshots desselben GUI-Laufs, kein Mockup:

| Größe | Modern | Classic |
| --- | --- | --- |
| 1920×1080 | [Modern](visual/air-modern-a3-1920.png) | [Classic](visual/air-classic-a3-1920.png) |
| 1650×930 | [Modern](visual/air-modern-a3-1650.png) | [Classic](visual/air-classic-a3-1650.png) |
| 390×600 | [Modern](visual/air-modern-a3-390.png) | [Classic](visual/air-classic-a3-390.png) |

[System-/Profilmenü bei 390×600](visual/air-modern-a3-menu-390.png). A3 entfernt die beiden dominierenden Classic-Elemente aus Modern. Gegenüber Bild 2 bleiben Vektorwolken, großes helles Dock, alte Island-Proportionen/-Position und fehlendes Air Home ausdrücklich offen. Ein geöffnetes Popup überlagert vorübergehend Desktop-Inhalte; Escape/Outside-Click stellen die freie Fläche sofort wieder her. Classic bleibt optisch im bisherigen Zustand. Kein Vergleich mit behauptetem Pixel-Match; keine Windows/macOS-Hardware-Abnahme.

Automatisiert: `npm test` (154/154). Optionaler tatsächlicher Electron-Test: `AIR_GUI_TEST_ISOLATED=1 AIR_GUI_CDP=http://127.0.0.1:9233 node scripts/check-air-modern-shell.cjs`. Voraussetzung: Electron in **eigener Wegwerf-userData-Konfiguration** am Login, aktiver Sandbox/Xvfb und lokalem CDP; vorhandenes externes Playwright, keine zusätzliche Projektabhängigkeit. Der Helfer erstellt ausschließlich ein synthetisches Testkonto, hält das zufällige Passwort nur im Arbeitsspeicher und prüft alle drei Auflösungen inkl. echten Klicks, App-/Fensteraktionen, Suche, Profil/Abmelden und erneuter Anmeldung. Nicht gegen ein persönliches Profil ausführen. Lokaler Starthelfer: `/workspace/.air-os-onboarding/start-modern-a3.sh`, eigenes authentifiziertes Display :103. Native Screenreader-/OS-Tests bleiben Folgearbeit. Keine neue Bewegung hinzugefügt.

## B1 – schwarzes kompaktes Dock ohne Scrollen (23. Oktober 2026)

B1 verwendet `dockTheme=modern`, unabhängig von `desktopTheme`. Keine automatische Änderung gespeicherter Designs. Standard ohne explizite Pins: Launchpad/Alle Apps, Finder, Browser, Notizen, Air Music, Einstellungen. Spotify bleibt mit seinem unveränderten grünen Icon über vorhandene Pins/Launchpad erreichbar, wird ohne Installationserkennung nicht als sicher installiert dargestellt. ChatGPT ist keine startbare Registry-App. Das eigene Windows-ähnliche Startmenü folgt B2; bis dahin öffnen Alle Apps und die bestehende Launchpad-Suche regulär über die bestehende Registry/Lifecycle.

| Viewport | Gemessenes Dock | Mittelpunkt | Nachweis |
| --- | --- | --- | --- |
| 1920×1080 | 358×68px | x=960 | [Modern](visual/air-modern-b1-1920.png) |
| 1650×930 | 358×68px | x=825 | [Modern](visual/air-modern-b1-1650.png) |
| 390×600 | 358×68px | x=195 | [Modern](visual/air-modern-b1-390.png) |

[Unverändertes Spotify-Originalicon mit expliziten Pins bei 390px](visual/air-modern-b1-pins-390.png) · [Classic-Dock bei 1650px](visual/air-classic-b1-1650.png).

Schwarz #090b0c, Icons 42px bei bisheriger Standardgröße 48, Höhe 68px, Radius 20px, 6px Abstand unten. Kein horizontaler Scrollcontainer (`overflow:clip`), Client-/Inhaltsbreite 356/356px; Scrollversuch ergibt 0. Responsive Kapazität maximal sieben solche Buttons auf breiten Displays bzw. sechs bei 390px. Weitere Pins bleiben unverändert gespeichert, ausgeblendete Buttons haben keine sichtbaren/fokussierbaren Flächen. Launchpad immer sichtbar, Tooltip/Accessible Name nennt weitere darstellbare Pins. `dockPins=[]` zeigt nur Launchpad, null erbt die kleine Default-Auswahl. Keine ersatzweise monochromen Store-Icons; Einträge ohne vorhandene Icon-Klasse bleiben ausschließlich im Launchpad. Classic stellt seine Original-Buttons/Reihenfolge wieder her; dessen altes Layout wird nicht still geändert.

159 Node-Tests erfolgreich; eigener GUI-Helfer `AIR_GUI_TEST_ISOLATED=1 AIR_GUI_CDP=http://127.0.0.1:9234 node scripts/check-compact-dock.cjs` (extern vorhandenes Playwright, keine neue Projektabhängigkeit). Start ausschließlich in isoliertem Electron-Profil am Login, aktiver Sandbox, authentifiziertem Xvfb und lokalem CDP. Lokaler Starthelfer `/workspace/.air-os-onboarding/start-modern-b1.sh`, Display :104. GUI vergleicht unveränderte SVG-Inhalte vor/nach Themewechsel und prüft Geometrie/kein Scrollen, echte App-Klicks, Tastatur, Reduce-Motion, Fokus beim Resize, viele/leere/zusätzliche Pins, Original-Spotify-Icon, Classic und Reload-Persistenz. Kein nativer Spotify-/ChatGPT-/Windows-/macOS-Hardwaretest.

Vergleich mit Bild 2: Dockgröße jetzt im gewünschten Bereich; farbige eigene Air-OS-Originalicons statt fremder Logos. Abweichend bleiben App-Auswahl, 6px Abstand zum Rand, eigene Vektorwolken, alte Island-Proportionen und fehlendes Mint-Air-Home. Keine Pixelgleichheit oder Release-Abnahme behauptet. Nächste Einheit B2, nicht Teil dieser Sitzung.

## B2 – eigenständiges Air-OS-Startmenü (23. Oktober 2026)

Im Modern-Dock öffnet derselbe unveränderte Alle-Apps-Button ein dunkles Popup; `dockTheme` steuert diese Dock-Aktion weiterhin unabhängig vom Desktop-Theme. Classic-Dock und der große Launchpad-Zugang bleiben erhalten. Live-Suche „Apps suchen …“ nach Name/ID, 25 Registry-Einträge ohne zusätzliche Datenbank, farbige Originalicons, lesbare leere Trefferliste. App-Namen werden als Text behandelt; Start nur über vorhandene Registry-/Lifecycle-/Native-/Store-Wege. Kein Pin-Kontextmenü in B2.

| Viewport | Menü gemessen | Dock unverändert | Electron-Screenshot |
| --- | --- | --- | --- |
| 1920×1080 | 480×440px, x720/y556 | 358×68px | [Startmenü](visual/air-start-b2-1920.png) |
| 1650×930 | 480×440px, x585/y406 | 358×68px | [Startmenü](visual/air-start-b2-1650.png) |
| 390×600 | 366×436px, x12/y80 | 358×68px | [Startmenü](visual/air-start-b2-390.png) |

[Lesbarer nativer Fehler unter Linux](visual/air-start-b2-error-390.png) · [Unveränderter großer Launchpad-Weg im Classic-Dock](visual/air-start-b2-classic-1650.png). Menü jeweils 10px oberhalb des Docks und mittig; nur Trefferbereich vertikal scrollbar. Kein Dock-Scrolling. Kompakte 36px-Kopien der vorhandenen SVGs, keine Grayscale-Filter oder neuen Logos; Über Air-OS besitzt bisher kein Bild und bleibt als Text statt erfundenem Ersatzicon erreichbar.

Fokus in Suchfeld; Enter/Space öffnen, Pfeile wählen, Enter startet, Escape/Outside-Click geben Fokus zurück. Native Tab-Reihenfolge ohne Fokusfalle. Start wird bestätigt, bevor das Menü schließt; Fehler bleiben lesbar und ermöglichen Retry, Doppelstarts/veraltete UI-Antworten sind gesperrt. 140ms sanfte Öffnung, bei reduzierter Bewegung keine Animation. Kein Host-Status oder erfolgreicher Spotify-Start auf Linux erfunden; die vorhandene Bridge lehnt dort sicher ab. ChatGPT erscheint erst nach echter späterer Registrierung/Startintegration.

165/165 Node-Tests. Optionaler echter GUI-Test: `AIR_GUI_TEST_ISOLATED=1 AIR_GUI_CDP=http://127.0.0.1:9235 node scripts/check-start-menu.cjs` mit extern vorhandenem Playwright, eigener Wegwerf-userData-Konfiguration am Login, Sandbox/Xvfb und lokalem CDP. Lokaler Helfer `/workspace/.air-os-onboarding/start-modern-b2.sh`, Display :105. Test erstellt synthetisches Konto, prüft drei Auflösungen, Registry-Vollständigkeit, Original-SVG, Dockmaß/kein Scrollen, Suche/App-Start/Leermeldung, Tastatur/Fokus, Animation/Reduce-Motion, echten Linux-Nativfehler, großen Launchpad- und Classic-Weg sowie identische Preferences/Pins. Keine neue Dependency oder IPC. Native Windows-/macOS-/Screenreader-Abnahme offen.

B2 ergänzt B1, ohne dessen Styles zu ändern. Weitere visuelle Abweichungen bleiben Wolkenstruktur, alte Island-Position und fehlendes mintgrünes Air Home. Pinning/Unpinning und Kategorien sind nicht als fertig ausgewiesen. Nächste Einheit **B2.2**, anschließend C1/D1 separat.

## B2.2 – profilbezogenes Anheften und Lösen (23. Oktober 2026)

Startmenü als kompakte dunkle Liste mit getrennten App- und Pin-Buttons; Original-SVGs unverändert. Badges zeigen angeheftet/im Dock oder angeheftet/unter Alle Apps. Nicht darstellbare Icons bekommen keine falsche Pin-Erfolgsmeldung; App-Start bleibt möglich. Startmenü/Launchpad immer erreichbar, nicht lösbar. Suchpfeile behandeln ausschließlich `[data-start-app]`, Pin-Aktionen sind eigenständige Tab-/Enter-/Space-Ziele. Nach bestätigter Änderung bleiben Menü und Suche offen, Fokus bei der Aktion; Speicherfehler erlauben Retry.

| Viewport | Angeheftet, sechs Originalicons (358×68px) | Spotify gelöst |
| --- | --- | --- |
| 1920×1080 | [Angeheftet](visual/air-start-pins-b22-1920.png) | [Gelöst](visual/air-start-unpinned-b22-1920.png) |
| 1650×930 | [Angeheftet](visual/air-start-pins-b22-1650.png) | [Gelöst](visual/air-start-unpinned-b22-1650.png) |
| 390×600 | [Angeheftet](visual/air-start-pins-b22-390.png) | [Gelöst](visual/air-start-unpinned-b22-390.png) |

[Bei vollem 390px-Dock weiterhin gespeichert, aber unter Alle Apps](visual/air-start-overflow-b22-390.png). Keine B1-Dock-Styles geändert, keine neuen/umgefärbten Logos. Vertikal scrollt ausschließlich die Startmenü-Liste. Gegenüber Bild 2 bleiben Wolkenstruktur, alte Island und fehlendes Air Home offen.

Eine Default-Liste, geteilt mit Dock-Auswahl: null erbt die vollständige Standardauswahl, [] explizit leer, explizite Arrays behalten Reihenfolge und unbekannte Referenzen. Lösen materialisiert niemals nur sichtbare Icons. Neue Pins hinten, keine Duplikate, maximal 64. Renderer nutzt bestehende Schreibwarteschlange und liest vor jedem Vorgang frisch aus dem Store; kein optimistischer Erfolg. Bestehende Preferences-Update-IPC ist um eine optionale erwartete Sitzung ergänzt: Main generiert pro Anmeldung eine flüchtige zufällige Kennung, neue Pin-Schreibvorgänge prüfen sie vor Write und vor UI-Übernahme. Legacy-Aufrufer bleiben kompatibel. Keine zweite Datenbank oder IPC-Route.

175 Node-Tests erfolgreich. Echter optionaler GUI-Helfer: `AIR_GUI_TEST_ISOLATED=1 AIR_GUI_CDP=http://127.0.0.1:9236 node scripts/check-start-pins.cjs` (extern vorhandenes Playwright; keine neue Dependency). Voraussetzung: eigener Wegwerf-userData-Pfad `/workspace/.air-os-onboarding/modern-b22-profile`, Electron am Login, aktive Sandbox, authentifiziertes Xvfb/local CDP. Lokaler Helfer `/workspace/.air-os-onboarding/start-modern-b22.sh`, Display :106. Test erstellt nur synthetische Alice-/Bob-Konten; Passwort nur im Speicher. Prüft drei Größen, echte Pin-Tastaturaktionen/App-Start, Overflow, echte isolierte Speicherblockade mit Restore/Retry, Reload, Classic-Rückkehr und Ab-/Anmeldung mit Profiltrennung. Ausstehende Antworten beim Profilwechsel zusätzlich mit realem temporärem Store und markierten IPC-Test-Doubles sowie produktivem Main-Handler geprüft. Frische Store-Instanz prüft Neustart-Persistenz; kein voller Electron-Prozessneustart oder nativer Windows-/macOS-Hardwaretest behauptet.

Keine Drag-and-drop-Sortierung, komplexen Kontextmenüs, neue App-Registrierung, Island/Air-Home- oder Installer-Änderungen. Nächste Einheit **C1**, danach D1 separat.

## C1 – bestehende Modern-Island am Viewportrand (23. Oktober 2026)

Nur `html[data-desktop-theme="modern"]` verwendet feste Viewport-Position, y2 statt Desktop-Inset+8px. Desktop-/Window-Host bleibt unverändert; dockTheme ist davon unabhängig. Tiefschwarz #090b0c, warmweiß #f8f7f3, dezenter Rand/Schatten, begrenzte responsive Maße und tatsächlich zentrierte lokale Uhr. Nur echte bestehende Control-/Notes-Funktionen, keine neue Systemintegration.

| Viewport | Pille x/y, Breite×Höhe | Abstand Systemmenü | Panel x/y, Breite×Höhe | Aufnahmen |
| --- | --- | --- | --- | --- |
| 1920×1080 | 835/2, 250×45px | 740,47px | 790/55, 340×210px | [Modern](visual/air-island-modern-c1-1920.png) · [Panel](visual/air-island-panel-c1-1920.png) · [Classic](visual/air-island-classic-c1-1920.png) |
| 1650×930 | 717,58/2, 214,84×38,67px | 623,05px | 655/48,67, 340×210px | [Modern](visual/air-island-modern-c1-1650.png) · [Panel](visual/air-island-panel-c1-1650.png) · [Classic](visual/air-island-classic-c1-1650.png) |
| 390×600 | 117/2, 156×36px | 22,47px | 25/46, 340×210px | [Modern](visual/air-island-modern-c1-390.png) · [Panel](visual/air-island-panel-c1-390.png) · [Classic](visual/air-island-classic-c1-390.png) |

[Rohe getBoundingClientRect-Messwerte und unveränderter Fensterhost](visual/air-island-c1-measurements.json) · [Echte Notes-Mitteilung bei 390px](visual/air-island-notes-c1-390.png) · [Echter abgefangener Speicherfehler](visual/air-island-error-c1-390.png). Panelhöhe ist begrenzt und intern scrollbar; zusätzliche Notes-Mitteilung erhöht den Inhalt innerhalb dieser Grenze. Classic-Pille bleibt 156×38px, y39 auf Desktop bzw. y37 bei 390px.

Normaler Open-Effekt wie bisher, zusätzlicher 120ms-Exit mit opacity/4px-Translation nur in Modern. Bedienung beim Schließen sofort gesperrt (inert), Escape gibt Fokus direkt zurück. Reopen, Themewechsel, Dokument-verbergen und Profilwechsel canceln ausstehende Animation; beide Reduce-Motion-Einstellungen schließen sofort. Keine neuen Aktualisierungstimer. Vor Öffnung wird ein bestehendes Startmenü über dessen vorhandenen Toggle geschlossen, damit dessen Fokusrückgabe die Island nicht wieder schließt. Startmenü-/Dock-Dateien unangetastet.

179/179 Node-Tests; optionaler tatsächlicher GUI-Regressionstest: `AIR_GUI_TEST_ISOLATED=1 AIR_GUI_CDP=http://127.0.0.1:9237 node scripts/check-island-layout.cjs` mit extern vorhandenem Playwright, eigener Wegwerf-userData-Konfiguration am Login, authentifiziertem Xvfb und aktiver Electron-Sandbox. Lokaler Helfer `/workspace/.air-os-onboarding/start-modern-c1.sh`, Display :107. Prüft alle Tabellenwerte, Classic-Umschaltung/identischen Window-Host, Uhrformate, echte Dock-Theme-IPC-Saves/Fehler/Retry, Tastatur/Fokus/Outside, maximierte Fenster-Schließen-Hit-Tests, Minimieren/Wiederherstellen, Startmenü-Koordination, beide Reduce-Motion-Wege, Notes-UI-Save und leeres zweites Profil. Fehlerfall betrifft nur die explizit isolierte Preferences-Datei, mit unverändertem Restore. Dock bleibt 358×68px ohne Scrollen. Native Windows/macOS-/Screenreader-/Hardware-Abnahme weiterhin offen.

Gegenüber Bild 2 stimmen nun die vorgesehenen Island-Proportionen und obere Platzierung; 2px Abstand, volle Pillenrundung und Uhr/Chevron sind eigene Air-OS-Entscheidungen. Keine fremden Audiografiken/Albumcover oder Fake-Statusanzeigen. Wolkenstruktur und fehlendes Mint-Air-Home bleiben sichtbare Abweichungen. Geöffnetes Kontrollzentrum kann Inhalte vorübergehend überlagern, schließt über Escape/Outside/Fokus jederzeit. Nächste Einheit **D1**, keine Air-Home-Implementierung in C1.
