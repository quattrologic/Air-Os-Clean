# Air-OS iPad Ultimate 2.0 — Alpine Glass Visual Overhaul

## Gesicherte Basis und Umfang

Basis **`feat/air-os-ipad-ultimate-2@e4b1c4203c2430da04bccc5dd33953fb44cc0781`**. Neuer Branch **`feat/ipad-ultimate2-visual-overhaul`**, Produkt-/Buildcommit **`146769b64efd308aa497991563feecacb97fbd83`**. Kein Merge oder Deployment. Private Installation, Tailscale, Windows-Aufgabe, Datenbanken und Cloudvorbereitung bleiben getrennt und unverändert.

Der Auftrag wurde als zusammenhängender visueller Umbau umgesetzt: gemeinsame Material-/Typografieebenen, neue Komposition bestehender Systemflächen, Touchfeedback und begrenzte Motion. Keine neue Appwelle, Registry, Window-Engine, Musikengine oder Datenhaltung. Die gleichgewichtete MacShell-/InfinityOS-Vorgabe ist eine Gestaltungsrichtung, **keine gemessene 50%-Pixelübereinstimmung**.

## Sichtbare Änderungen

| Bereich | Umsetzung |
|---|---|
| Desktop/Wallpaper | Originale eigene alpine Vektorlandschaft „Alpine Dusk“ mit Bergrücken, Wald, See und Dunst. Lokal/offline, MIT, keine Apple-Fotografie/kein Laufzeit-CDN. Ruhige dunkle Blau-/Schiefertöne |
| Material | Eine zentrale `visual.css`: transluzente Grundtönung, gerichtete Glanzverläufe, obere Lichtkante, seitliche Innenreflexe, gestaffelte Schatten. Standardblur 16px, explizite hohe Qualität 24px; fester und Forced-Colors-Fallback |
| Dock | Flache dunkle schwebende Leiste, kleinere Innenabstände, gerundete Iconbühne, zurückhaltende Running-/Aktiv-/Minimized-Zustände. Bestehende MacShell-Kopplung und Spring bleiben Eigentümer der Geometrie; Iconbühne wächst nun auch in der Höhe und schneidet Magnifikation nicht ab. Pin-/Dateiablage-/Kontext-/Intellihide-Aktionen erhalten |
| Menüleiste | Visuelle Zeile 36px statt 44px; eigene Island weiterhin 44px hoch. Gemeinsame eigene Linienglyphen, echte Touchziele 44×44 auf Coarse Pointer, klare Abstände, keine grauen Hintergrundpunkte/zweite Daueruhr |
| Icons | Bestehende MacTahoe-SVGs zuerst, konsistent in Dock/Fenster/Launchpad/Spotlight. Fehlende App-/Systemglyphen als eigene Vektoren; keine fremden Markenicons importiert. Geometrisches Air-OS-Logo bytegleich erhalten |
| Fenster | Dunkle Titelleiste mit feinen Kanten, kleine Traffic-Light-Punkte innerhalb großer Touchflächen, abgestufte Schatten und Focusborder. Dunkle Sidebars/Systeminhalte; warme helle Schreibfläche für Notes/AirWrite. Gemeinsame Controls und native gut lesbare Selects, keine zusätzliche Fensterregistry |
| Notes/AirWrite | Titel/Suche bleiben im eigenen Editorlayout erreichbar; getrennte scrollbare Liste/Arbeitsfläche statt versehentlich herausgescrollter oberer Felder. Daten-/Save-/Undo-/Konfliktcontroller unverändert |
| Widgets | Kompakte Uhr mit Wochentag/Datum, echte Monatsrasterung und aktueller Tag, nächster echter Termin; Player mit echtem Titel/Künstler/zulässigem Artwork und Transport; leise Reminderzusammenfassung. Vorhandene Datenservices, kein neuer Store/keine Fake-Wetterwerte |
| Kontrollzentrum | Medienkarte, native App-Lautstärke, klare Kachelgruppen, Systemaktionen, Navigation und ehrliche Browsergrenzen. Alle bisherigen Aktionen erhalten; Transport und Lautstärke verwenden dieselbe Audioengine. Keine vorgetäuschten Bluetooth-/Helligkeits-/Systemlautstärkeschalter |
| Launchpad/Spotlight | Ruhigere Iconbühnen, gegliederte Suchfläche, einheitliche Ergebnisicons, Hover/Fokus und unveränderte Registry-/Suchcontroller. Externe Dienste weiterhin ausdrücklich bezeichnet |
| Island/Lockscreen | Größere klare Uhr-/Datumshierarchie, ruhige Medien-/Profilkomposition, stärkere Kanten und transparente Flächen, feinere Übergänge. Lokalsperre bleibt visuell, keine neue Sicherheitsauthentifizierung und keine native iPadOS-Sperre |
| Motion | Ein begrenzter Präsentationshelfer für Fensteröffnung, Restore, Panels, Island und Lock/Desktop-Fades. Vorherige Animation wird abgebrochen, Finish/Close/Minimize/Drag/Snap/Vollbild/Visibility geben Ownership frei. Kein Idle-RAF oder zusätzlicher Animationstimer |

Das ist **CSS-/Chromium/WebKit-Compositing**, keine Snell-Refraktion, Qt-Runtime, echte Fenstertexturaufnahme oder zweite Glasengine. Die Glanzränder sind CSS-Materialsimulation. Die frühere Desktop-GLASS-3-Engine wurde nicht in diese PWA hineinkopiert oder verändert.

## Architektur und Schutz bestehender Funktionen

- `ipad/visual.css` besitzt Tokens und gemeinsame Oberflächenhierarchie; bestehende Basestyles bleiben als Kompatibilitätsbasis. `core/visual-icons.js` stellt feste eigene SVG-Pfade bereit.
- `core/visual-motion.js` besitzt ausschließlich kurz laufende WAAPI-Präsentationen. Die vorhandene Map in `desktop.js` behält Lifecycle/Fokus/Geometrie/Persistenz; Drag/Snap/Vollbild abbrechen laufende Präsentation statt konkurrierend zu animieren.
- `dock-material.js` bleibt derselbe Geometrie-/Spring-Owner, nur die Iconbühne berücksichtigt nun seine tatsächliche Höhe. Keine zweite Pinverwaltung.
- `widgets.js` liest bestehende Daten und Medienereignisse; minutenweises Uhrupdate wie zuvor, keine laufende Renderanimation. Fehler werden als nicht lesbar angezeigt, nicht als leere Daten ausgegeben. Alte verspätete Antworten dürfen keine neueren Views überschreiben.
- Kontrollzentrum: bestehende Actions/Audioadapter, ein abräumbarer Listenercontroller pro Panel, keine Neben-Audioengine oder unnötige Pollingschleife.
- **Unverändert:** Storage-/Backupcode und DB-Schema, vorhandene Musik-/Kalender-/Timer-/Fenster-/Pinrecords, private Rolloutskripte, native Main/Preload, Cloud-/Tailscale-Konfiguration. Keine Datenmigration. Der alte private Branch wird nicht automatisch aktualisiert.

## Vorbilder, direkte Wiederverwendung und eigene Arbeit

Exakte Quellen/Hashes/Abweichungen: [maschinenlesbare Visual-Portmatrix](source-ports/ipad-visual.json). Alle bisherigen AGPL-/GPL-/MIT-Notices und lokalen Corresponding-Source-Pakete bleiben erhalten.

| Herkunft | Tatsächliche Verwendung | Abgrenzung |
|---|---|---|
| MacShell, Pin `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, MIT | bestehender `vendor/macshell/shell7.js`-Port aus MacDock/Spring läuft weiter; WidgetVisual-Komposition als Material-/Layoutrichtung | Keine neu ausgeführte QML-/Qt-Shaderkomponente behauptet |
| InfinityOS Web, Pin `a6584135cbcad837d57484211119451bbb2d8fb2`, AGPL-3.0 | Originale `winOpen`-Kurve `cubic-bezier(.34,1.56,.64,1)` und Opacity-/Scale-/Translate-Trajektorie in ausgeführtem Motionhelfer | Original 350ms/.88/30px an 250ms/.985/8px für begrenzte Touchbewegung adaptiert; kein WinBox |
| MacTahoe, vorhandene kuratierte GPL-3.0-Assets | bestehende Icons und Lizenz-/Quellassets werden weiterverpackt | Keine zusätzliche Apple-/Drittanbieter-Marke importiert |
| Eigene Air-OS-Integration | Materialtokens, Layout-/Kachelkomposition, Systemglyphen, Scroll-/Fokuskorrekturen, WAAPI-Ownership und SVG-Wallpaper | Keine fremde Vollanwendung oder frei erfundener Originalshaderport |

InfinityOS-Stylesheet-SHA-256: `2f375c1241ab1ab499cd2e67da667add7cce993d40680683fcc87a44c55b43e3`. Originalausschnitt und Herkunft stehen in der Portmatrix. Eigene Landschaft/Glyphen unter vorhandenen First-Party-MIT-Bedingungen; kombinierte iPad-PWA weiterhin AGPL-3.0 mit unveränderten GPL-/MIT-Komponenten.

MacShell-Ansichten waren im Chat sichtbar; lokale Originalbilddateien für einen direkten Referenz-Pixelvergleich lagen nicht vor. Ein separates eindeutig zuordenbares InfinityOS-Referenzbild war im aktuellen Dateikontext nicht verfügbar. Dafür wurden die verifizierten InfinityOS-Quellen und die ausdrücklichen Designvorgaben verwendet. Keine angeblich durchgeführte direkte Pixelanalyse fehlender Bilddateien. Der fotografische MacShell-Berghintergrund ist **nicht** kopiert: Herkunft/Rechte ließen sich nicht ausreichend belegen, ein ergänzender Wikimedia-Abruf scheiterte an HTTP403. Deshalb eine eigene rechtlich klare Naturillustration. Ein lizenziertes fotografisches Wallpaper bleibt eine mögliche spätere Alternative; das Ergebnis wird nicht als identische Referenzfotografie ausgegeben.

## Echte Bildprüfung und Korrekturrunden

`scripts/capture-ipad-visual-baseline.cjs` extrahiert exakt die freigegebene Basis e4b1c42 in einen separaten temporären Baum. Aktuelles Aufnahmeskript und Browsertools werden von außen bereitgestellt; der installierte Branch wird nicht ausgecheckt. `test-ipad-visual.cjs` erzeugt Vorher/Nachher mit **identischen synthetischen Dateien/Terminen/Musik/Notizen**, Auflösung/DPR und fester Testzeit `2026-11-05T18:40:00Z`. Das synthetische Testcover wird einmal über Canvas erzeugt und als tatsächliches Artwork im Testrecord verwendet, nicht in Screenshots hineingemalt. Kein privater Inhalt/keine Retusche.

Erster gerenderter Vergleich: dunklere kohärente Oberflächen und deutlich bessere Desktopkomposition; dabei reale Probleme erkannt. Korrekturrunde 1 korrigiert Editor-Scrollhierarchie, zu knapp bemessene Dockiconhöhe, unpassenden Container-Fokusrand und Emoji-Playerglyph. Korrekturrunde 2 erhält 44×44-Systemziele und korrigiert die CI-Isolation der Vorher-Tools. Die abschließende WebKit-Bildprüfung korrigiert außerdem durchscheinenden Text gestapelter Fenster: Arbeitsflächen sind nun vollständig deckend, Glas bleibt gezielt an Systemflächen. Docküberlappung berücksichtigt den echten Floating-Abstand; der Lautstärkeregler liest den tatsächlichen Audiozustand zurück. Produktcode und Tests wurden angepasst, keine Bildfehler retuschiert.

Szenen: Lock, Desktop, Widgets, Dockcrop, Launchpad, Spotlight, Kontrollzentrum, Island, Notes, Finder, Musik, zwei Fenster; sechs responsive Arbeitsflächen und reduzierte Transparenz. Die Bilder belegen eine eigenständige Air-OS-Adaption; keine erfundene Pixelidentitätsquote.

| Referenzaspekt | Sichtbare Verbesserung | Verbleibende Grenze |
|---|---|---|
| MacShell-Glastiefe | durchscheinender Hintergrund, Kanten, Innenreflexe, getrennte Materialstufen | CSS-Blur statt originalem Compositor/Refraction |
| InfinityOS-Dock | flacher dunkler schwebender Rahmen, klare Iconbühne/Indikatoren | bestehender Air-OS-Controller und MacShell-Kopplung bleiben maßgeblich |
| Fenster/Controls | konsistente native Feldfarben, saubere Titel/Sidebars, ruhigere Typografie | Safari-native Controls bleiben plattformabhängig |
| Widgets | klare Uhr/Monats-/Musikkomposition, weniger Rauschen | keine ungeprüfte Wetterquelle oder freie Widgetgalerie neu gebaut |
| Lock/Island | große Uhr, zentrierte Medienhierarchie, Lichtkante | kein natives OS-Lock und kein erfundenes Albumcover |
| Motion | begrenzte, abbrechbare Öffnung/Fades, direkte Touchreaktion | Schließen/Minimieren bleibt zustandsgetreu unmittelbar; kein neuer M1-/M2- oder Qt-Dissolve-Port |

## Tests und Paket

Lokal tatsächlich bestanden: **40 Node-Tests** (alle 37 Basisregressionen erhalten), **112 Chromium-Rootchecks**, **112 Unterpfadchecks**, **10 Upgrade-/Recoverychecks**, **7 Baseline-Visualchecks** und **19 Nachher-Visualchecks**. Der Audit eingefrorener Testwerkzeuge meldet **0 Schwachstellen**. Paketprüfung: **112 byteidentische lokale Runtimeassets**, relative Manifest-/SW-Pfade, Lizenzen und lesbares Sourcepaket. Kein Laufzeit-CDN, keine neue npm-Produktabhängigkeit.

Geprüfte Viewports: **1024×768, 1180×820, 1366×1024, 834×1194, 820×1180, 390×600**, Touch-Emulation, DPR1 sowie DPR2 im bestehenden kalten Offline-Prozessneustart. Neue Prüfungen: reale Kontrollzentrum-/Audioaktionen, tatsächliche Touchrechtecke, erreichbare Editorfelder, Reduced Motion/Transparency und Animation-Ownership nach Finish/Cancel. Bestehende Tests decken Pointercancel, Fenstergruppen, Snap/Vollbild/Restore, Dirty-Notes-/Updateblockaden, erhaltene Musikbytes, Backup/Restore und neuen Origin ohne automatische Übernahme ab.

**Finales CI vollständig grün:** [42045946450](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42045946450) für exakt `146769b64efd308aa497991563feecacb97fbd83`. Ubuntu-24.04-Runner, Chromium 151 und Playwright-WebKit; kein macOS-/iPad-Hardwareerfolg behauptet. 40 Node-Regressionen pro Job sowie **518 echte Browserchecks**:

| Engine | Basisbilder | Visual-Nachher | Apps Root | Apps Unterpfad | Update/Recovery | Ergebnis |
|---|---:|---:|---:|---:|---:|---|
| Chromium | 7 | 19 | 112 | 112 | 10 | bestanden |
| WebKit | 7 | 19 | 111 | 111 | 10 | bestanden |

Die Differenz im Appbasispfad entspricht CDP-Touchdrag/Cancel in Chromium gegenüber WebKit-Touch-Tap, keine entfernte Prüfung. **74 permanente Vorher-/Nachher-PNGs** und alle zehn Reportgruppen im [Evidenzindex](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/evidence.json), gesichert durch Commit `331d1c1432eb41500b170cb75159e459ce0faf8c`. Weitere App-/Offline-/Touch-/Hoverbilder bleiben in den CI-Artefakten.

Rote Zwischenstände bleiben nachvollziehbar: `42041125272` scheiterte am temporären Baseline-Toolpfad. Später verlangte ein neuer Volumentest unzulässig exakte native Zahlengleichheit. Der finale Report misst in WebKit **Regler 0.99 / Audio 0.9900000095367432**, Stufe 0.01; die Prüfung wartet auf Synchronisation und erlaubt maximal eine halbe Stufe (0.005). Echte ganze Stufenabweichungen schlagen weiterhin fehl. So wird Floatdarstellung berücksichtigt, kein Fake-Regler grün gerechnet. Nach der Korrektur beide Browser vollständig bestanden.

Workflow `.github/workflows/test-ipad-visual.yml` erzeugt ausschließlich Artefakte/synthetische Evidenz auf dem eigenen Branch; überholte Läufe können abgebrochen werden. Kein Deployment. Actions melden nur den bekannten Node20-Aktionsversionshinweis bei Ausführung unter Node24, keinen ausgefallenen Audit-/Testschritt.

### Messwerte und Bilder

Identische Szene bei 1180×820, DPR1; beide Engines messen für die Nachhergeometrie dieselben Werte:

| Element | Vorher | Nachher |
|---|---|---|
| Fensterhost | x0/y44, 1180×776, Unterkante820 | x0/y36, 1180×784, Unterkante820 |
| Dock | 569×75.52, Unterkante820 | 569×70.52, Unterkante810, 10px Floating-Abstand |
| Island | Höhe44, zentriert | Höhe44, zentriert, 160px Bühne |
| Touch-Systemglyphen | Textbuttons | gemessene mindestens44×44-Ziele |
| Fenstersteuerungen | 30px sichtbarer Buttonbereich | mindestens40×44, Lichtpunkte10px |

In keinem der sechs Viewports horizontaler Dokumentüberlauf; Dock darf intern scrollen. Der Fensterhost reserviert keine Dockhöhe. DPR2-Kaltstart, maximierte-/Snap-/Vollbild-/Restoregrenzen bleiben im bestehenden Appbasispfad bestanden. Die eigene Island ist **nicht** auf die 36px-Menüzeile zusammengedrückt.

| Szene | Vorher (Chromium) | Nachher (Chromium) | Nachher (WebKit) |
|---|---|---|---|
| Gesamt/Desktop | [Desktop](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/desktop.png) | [Desktop](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/desktop.png) | [Desktop](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/desktop.png) |
| Dockcrop | [Dock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/dock.png) | [Dock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/dock.png) | [Dock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/dock.png) |
| Widgets | [Widgets](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/widgets.png) | [Widgets](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/widgets.png) | [Widgets](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/widgets.png) |
| Launchpad | [Launcher](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/launchpad.png) | [Launcher](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/launchpad.png) | [Launcher](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/launchpad.png) |
| Spotlight | [Suche](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/spotlight.png) | [Suche](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/spotlight.png) | [Suche](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/spotlight.png) |
| Kontrollzentrum | [Controls](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/control-center.png) | [Controls](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/control-center.png) | [Controls](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/control-center.png) |
| Islandpanel | [Island](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/island.png) | [Island](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/island.png) | [Island](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/island.png) |
| Lockscreen | [Lock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/lockscreen.png) | [Lock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/lockscreen.png) | [Lock](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/lockscreen.png) |
| Notes | [Notizen](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/notes.png) | [Notizen](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/notes.png) | [Notizen](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/notes.png) |
| Finder | [Dateien](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/finder.png) | [Dateien](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/finder.png) | [Dateien](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/finder.png) |
| Musik | [Player](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/before-chromium/music.png) | [Player](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-chromium/music.png) | [Player](visual/ipad-visual/146769b64efd308aa497991563feecacb97fbd83/after-webkit/music.png) |

Weitere sechs Quer-/Hochformatansichten, Zwei-Fenster- und Reduced-Transparency-Bilder liegen im selben Evidenzordner. Die Bilder sind unveränderte Browseraufnahmen; keine nachträgliche Montage.

### Paketnachweis

Lokale ZIP `Air-OS-iPad-Ultimate-2-146769b64efd308aa497991563feecacb97fbd83.zip`, SHA-256 **`a7f7cd0e99b31d1609055c1fcd4303a1506ad9c32ecee9038e1d9853391b9870`**. Sie wurde aus dem geprüften Produktstand gebaut und nicht bereitgestellt.

Im grünen Actions-Lauf: **`Air-OS-iPad-Visual-Build-146769b64efd308aa497991563feecacb97fbd83`**, mit PWA-ZIP/Prüfsumme und separater Preflight-/kompatibler Recovery. Actions-Sammelartefakt-Digest `1abfcaf36fb17939b5154586ffbebfe4da8c21bd9730e630d6899b4de714ab91` ist **nicht** der innere PWA-ZIP-Hash. Für CI-Downloads dessen beigefügte `.sha256` verwenden; ZIP-Zeitstempel können je Build variieren. Artefakte 30 Tage, Bild-/Testnachweise zusätzlich dauerhaft im Git.


## Grenzen und noch offene Freigaben

- Physisches iPad/Safari, Home-Screen, native Bildschirmtastatur/Pencil/Trackpad, Safe Areas mit realem Inset, Audioausgabe und Suspend/Resume bleiben Hardwareabnahme. Linux-WebKit ist kein echtes iPad.
- Keine neue GLASS-3-/Qt-/WebGL-Refraktion oder Hardware-GPU-Freigabe. CSS-/WAAPI-Animationen sind begrenzt, aber iPad-Energie-/GPU-Leistungsaufnahme wurde nicht physisch gemessen. Keine erfundenen FPS/Idle-Draw-Zahlen.
- Ein reales fotografisches Mountain-Wallpaper benötigt nachgewiesene Rechte. Die neue Originalillustration ist bewusst als solche ausgewiesen.
- Großbackups, weitere Appfunktionen, private Cloudbereitstellung, ISO-Untersuchung und persönliche Migration sind keine Teile dieses Visualauftrags.
- Installation/Branchwechsel/Deployment erfolgen erst in einem separaten ausdrücklich freigegebenen Vorgang nach Backup und Geräteprüfung. Tailscale und die bereits installierte PWA bleiben unangetastet.

Produktcheckpoints: `9f72c1843c9e2ce46ccb5f315b89f8a8e94d0a55` (zusammenhängendes Material-/UI-/Motionpaket), `ac9894f8326b46f7f12b8d93892f0f3a9a05a5bc` (Baselineisolation, Touchziele, Playerglyph), `ce5c748045e5b5515cd6ee06b3f8b9e7d54dc9da` (Floating-Überlappung/Audiozustand/Notices), `9cdadf4cb33582999c76d60d3fcac5e83c04cf56` (deckende Arbeitsflächen und präzisierte Bildprovenienz), `146769b64efd308aa497991563feecacb97fbd83` (native Präzisionsprüfung, finale grüne Abnahme). Dokumentationsabschluss siehe Git-Verlauf dieser Datei.
