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
- **A3:** minimale Modern-Desktop-Hülle: dauerhaft sichtbare Menüleiste/Seiten-Icons ausblenden, aber Menüfunktionen, Kontomenü/Abmelden, Suche, Settings und alle Apps über erreichbare Maus-/Tastaturwege erhalten. Classic wiederherstellbar; keine stille Funktionsentfernung.
- **B:** Dock erst auf ca. 350–420 px und dunkle Fläche reduzieren; Apps weiterhin aus bestehender Registry/Lifecycle. Pinning-Renderer, Pin/Unpin, Sortierung und Kontextmenüs in jeweils eigenen Untereinheiten. Vorhandener Pinning-Speichervertrag bleibt die Grundlage.
- **C:** bestehende Island an oberen Rand/proportionale Größe anpassen; echte Uhrzeit/Control-Tile/Notes-Mitteilung erhalten, Fokus/kleine Displays/reduzierte Bewegung regressionsprüfen. Keine Fake-Medien-/Batteriewerte.
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
- **Menü/Icons:** klassische Menüleiste (31 px bei Desktopgrößen) und große linke Icons sind noch sichtbar; A3 steht aus. Sie werden nicht als neue finale Oberfläche ausgegeben.
- **Dock:** tatsächlich 1553 × 86 px bei 1920/1650 px Breite, statt Ziel etwa 440 × 68 bzw. 378 × 59; noch hell/Classic und 12 px vom unteren Rand. B ist nicht umgesetzt.
- **Island:** tatsächlich 156 × 38 px, y=39; Ziel etwa 250 × 45 bei y≈0 bzw. skaliert bei 1650. Vorhandene Funktion erhalten, neue Proportionen erst C.
- **Air Home:** Mint-Fenster, Seitenleiste, cremefarbene Kacheln/Typografie und Widgets fehlen vollständig; nur Designvorgaben/Tokens, keine fertigen Komponenten behauptet.
- **Animationen:** in A1 nur statischer Hintergrund. Keine bestätigte neue Dock-/Island-/Fensteranimation oder generelle Performance-Abnahme.
- **Plattform:** neue visuelle Abnahme nur Linux/Electron, keine neue Windows-/macOS-/Installer-/Screenreader-Abnahme. Vorhandene Testinstaller aus 668f636 enthalten dieses Redesign noch nicht.

Die Sitzung liefert bewusst nur A1. Ziel bleibt Bild 2; die deutlichen strukturellen Abweichungen sind geplante offene Arbeit, keine abgeschlossene visuelle Freigabe. Bestehende Audit-/Signing-/Notarisierungs-/Datenisolationsgrenzen bleiben bestehen.

## A2 – Theme-Vertrag (23. Oktober 2026)

Desktop-Design und Dock-Design sind unabhängige Felder desselben profilbezogenen Preferences-Stores. `html[data-desktop-theme="modern"]` / `html[data-desktop-theme="classic"]` ist der zentrale Renderer-Zustand für A3; A2 ändert daran keine Desktop-Styles. Neue Main-registrierte Konten mit `profileSchemaVersion: 2` starten bei fehlender Datei Modern, Alt-/unklare Profile und bestehende Dateien ohne gültigen Desktop-Wert Classic. Explizite Auswahl bleibt erhalten; Reset folgt der Kontogeneration. Erst bestätigtes Speichern aktiviert die Auswahl, Fehler werden sichtbar gemeldet.

[Eigener Electron-Screenshot bei 1650×930](visual/air-modern-a2-settings-1650.png): getrennte Auswahl Desktop/Dock; Menü, Icons, Dock und Island bewusst im bisherigen Zustand. Ausführlicher Test-/Persistenznachweis und Grenzen im aktuellen DEVELOPMENT_PROGRESS-Checkpoint. Nächste Einheit A3; keine behauptete Übereinstimmung mit Bild 2.
