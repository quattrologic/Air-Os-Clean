# Air-OS Ultimate Hybrid – Designplan vor F2

24. Oktober 2026 · Basis: F1 `4cae58f367c76cdc9d8989fe35970df58d13ac07` · Dokumentationsbranch `docs/air-os-hybrid-design-20261024`.

**Status:** Die Richtung „Air-OS Ultimate Hybrid“ ist verbindlich. Dieses Dokument ist der konkrete Entwurf zur Prüfung; neue Maße/Farben sind Vorschläge und noch nicht implementiert. F2 beginnt erst nach Freigabe. Die Supaste-Oberfläche konnte hier wegen einer Netzwerksperre nicht visuell geprüft werden. Keine behauptete pixelgenaue Supaste-Abnahme. Bestehende gemessene Geometrien bleiben die Baseline.

## 1. Quellen und Beleggrenzen

| Quelle | Tatsächlich geprüft | Konsequenz |
| --- | --- | --- |
| [Supaste](https://www.supaste.com/) | Abruf mit www und ohne www: HTTP403. CONNECT-Tunnel meldet Forbidden; isolierter Electron-Browser mit aktiver Sandbox: ERR_TUNNEL_CONNECTION_FAILED. Kein Produktbild geladen. | Dunkle Schnellablagen, Suchfelder, Filter-Chips und Vorschaukarten stammen als gewünschte Richtung aus dem Benutzerauftrag. Keine Supaste-Farbwerte, Abmessungen, Animationen oder Funktionen als beobachtet ausgeben. Für genaue visuelle Annäherung werden erreichbare Referenzbilder benötigt. |
| [apple-design/SKILL.md](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md) | Vollständig gelesen, Repository-HEAD `2d228630ba1446365f614a108cb8252f1feda202`. [Fixierte Fassung](https://github.com/emilkowalski/skills/blob/2d228630ba1446365f614a108cb8252f1feda202/skills/apple-design/SKILL.md), SHA256 `77bb63b7043bb93aca2ff4ab040c249484eef35682bb6ff7163433c31d30adc7`. Repository-Lizenz MIT gelesen. | Unmittelbare Rückmeldung, direkte Manipulation, Unterbrechbarkeit, räumliche Kontinuität, differenzierte Materialien/Typografie und Barrierefreiheit als Gestaltungsprinzipien nutzen. Drittanbieter-Skill, keine offizielle Apple-HIG oder Garantie für Electron-Verhalten. |
| F1-Code und vorhandene Messdaten | Remote-HEAD bestätigt; Notes-Klasse/Styles, Startmenü, Island und Fensteranimationen gelesen; gespeicherte Electron-Messwerte abgeglichen. | Gesicherter Ist-Zustand. Kein erneuter F1-GUI-Lauf in dieser reinen Konzeptaufgabe. |

Es wird kein Skill installiert und kein Beispielcode übernommen. Keine Supaste-/Apple-Logos, Icons, Schriftdateien, Fotos oder proprietären Assets in Air-OS. Bloom/Folia bleiben frühere Gestaltungsreferenzen ohne Code-/Asset-Übernahme. Die neue Richtung ergänzt Mint/Creme und ersetzt diese Arbeitsflächen nicht durch ein vollständig dunkles System.

## 2. Vergleich mit F1 und gestalterische Aufteilung

**Arbeitsbereich:** Air Home, Notes und spätere längere Arbeitsvorgänge behalten Mint-Rahmen, hellgrüne Navigation, warme Cremeflächen und ruhige Serif-Akzente. Der blaue Wolkenhintergrund bleibt bestehen. Dunkle Overlay-Flächen sollen darüber als kompakte Werkzeuge erkennbar sein.

**Schnellbereich:** Bestehendes Startmenü und bestehendes Island-Panel bekommen später eine gemeinsame dunkle Formsprache für Suche, Filter und Vorschau. Kein zusätzlicher permanenter Balken, kein zweites Dock und keine zweite Island. Die klare Trennung entsteht durch Material und Hierarchie, nicht durch zwei unabhängige Settings-/App-Systeme.

| Bereich | F1/Ist-Zustand | Hybrid-Ziel nach Freigabe |
| --- | --- | --- |
| Air Home / Notes | Mint/Creme, systemeigene Navigation, Serif-Titel; Notes nur Modern | Beibehalten; erst konkrete Kontrast-/Dichteprobleme korrigieren. Kein neuer Fullscreen-Dashboard-Entwurf. |
| Dock / Startlogo | Kompakt schwarz, Originalicons, profilbezogene Pins, Startmenü | Unverändert. Kein Dock-Scrolling und keine Umfärbung. |
| Startmenü | Dunkle Registry-Liste, Suchfeld, getrennte Pin-Aktionen | Dichte Such-/Filtergestaltung und kleine App-Vorschauen; genau dieselbe Registry/Lifecycle/Pins. Keine willkürlichen Dateipfade ausführen. |
| Island / Kontrollzentrum | Schwarzer Trigger oben; echte Uhr, bestätigte Einstellungen, Notes-Mitteilung | Bestehendes Panel schrittweise als gemeinsame dunkle Schnellfläche verfeinern. Feste Position beibehalten. |
| F1-Interaktion | Hover/Fokus, Ereignisse nach Speicherung, vereinzelte feste Öffnungs-/Schließanimationen | Sofortiges Press-Feedback und unterbrechbare Präsentation als Ziel, unabhängig von bestätigten Datenänderungen. |
| Supaste-Vergleich | Noch keine erreichbare visuelle Quelle | Konkrete Pixel-/Formsprache erst nach Sichtung bestätigen; gegenwärtig eigenständiger Entwurf aus Benutzerbriefing. |

## 3. Gesicherte Geometrien – nicht versehentlich überschreiben

CSS-Pixel bei100%-Darstellung. Aus vorhandenen JSON-Messungen, nicht in dieser Sitzung neu gemessen. Die historischen Entwurfswerte y≈89 bei1650 werden nicht als tatsächliches y ausgegeben; der Fensterhost begrenzt derzeit auf93.

| Element | 1920×1080: x/y; B×H | 1650×930: x/y; B×H | 390×600: x/y; B×H |
| --- | --- | --- | --- |
| Air Home |200/103;1522×849 |171,875/93;1307,969×731,078 |12/91;366×430 |
| Home-Navigation |212px links |182,188px links |366×48px horizontal |
| Air Notes |525/244,719;870×480 |390/180,219;870×480 |6/91;378×433 |
| Notes-Liste |190×436px links |190×436px links |362×100px oben |
| Notes-Editor |664×436px |664×436px |362×289px |
| Dock, sechs Icons |781/1012;358×68 |646/862;358×68 |16/532;358×68 |
| Geschlossene Island |835/0;250×45 |717,578/0;214,844×38,672 |117/0;156×36 |
| Bestehendes Panel |745/0;430×284 |610/0;430×284 |12/44;366×284 |

Dock-Unterkante und Island-Oberkante: jeweils0px zum Viewport. Auf390px darf das aufgeklappte Panel unter der Island beginnen, damit das Systemmenü links oben frei bleibt. Insel, Dock und Fensterhost werden nicht durch einen neuen Layoutmanager ersetzt.

Home-Kacheln:1920px drei380px-Spalten bei x472/872/1272,20px Abstand,60px Innenabstand; Radius10px. Notes: Außenradius20px, Innenradius12px,36px Titelleiste. Home: Außenradius22px, Mint-Rand etwa10px. Diese Unterschiede zwischen App und Dashboard sind beabsichtigt.

Belege: [Home-Messwerte](visual/air-home-d1-measurements.json), [Dock/Island/Panel](visual/air-reference-c2-measurements.json), [F1 Notes](visual/air-notes-f1-measurements.json), [F1-Screenshot vor Home](visual/air-notes-f1-modern-1920.png), [bestehendes dunkles Panel, C2-Screenshot](visual/air-reference-c2-panel-1650.png). Letzterer zeigt die im F1-Zweig nicht neu gestaltete C2-Komponente, kein Supaste-Bild.

## 4. Farb- und Materialplan

Die folgende dunkle Palette ist ein **eigenständiger Vorschlag**, kein aus Supaste gesampeltes Farbsystem. Bestehende CSS-Tokens weiterverwenden, neue Rollen erst in einzeln beauftragten Änderungen hinzufügen. Keine zweite Theme-Datenbank; desktopTheme/dockTheme bleiben unabhängig.

| Rolle | Bestand / Vorschlag | Anwendung |
| --- | --- | --- |
| Mint-Rahmen |bestehend #9cdaa1 |Home/Notes unverändert |
| Helle Navigation |bestehend #b0e5ad |Arbeitsflächen-Seitenleisten |
| Creme |bestehend #f8f7f3 |Editor und Kacheln, weitgehend opak |
| Text auf Creme |bestehend #2c3b31 |Primärtext |
| Sekundärtext auf Creme |bestehend #677e6c; Vorschlag für kleinen Text #5f7464 |F2-Kontrastbefund prüfen, noch keine Farbänderung |
| Feiner heller Rand |bestehend #b8bcb6 |Dekorative Kartenlinien; nicht alleinige Fokus-/Konturinformation |
| Dunkle Grundfläche |bestehend #090b0c |Dock/Island |
| Dunkles Panel |Vorschlag #101517 |Suche/Schnellbereich |
| Dunkle Karte/Eingabe |Vorschlag #171e21 |Abhebung von der Panelbasis |
| Hover / Auswahl |Vorschlag #202a2c / #26382f |Dezent, aktive Auswahl zusätzlich mit Rand/Markierung |
| Heller Text / Sekundärtext |Vorschlag #f2f5f3 / #b5c1ba |Auf dunklen Flächen |
| Fokus dunkel / hell |#9cdaa1 / #365e43 |2px sichtbarer Ring mit2px Abstand, nicht abschneiden |

**Kontrastbefund:** WCAG-sRGB-Rechnung für opake Flächen: #2c3b31 auf Creme≈11,02:1; bestehendes #677e6c≈4,10:1, für normalen kleinen Text unter4,5:1. Vorschlag #5f7464≈4,70:1. #b8bcb6 auf Creme≈1,80:1: als dekorative Linie geeignet, als alleinige relevante UI-Kontur nicht ausreichend. #365e43 auf Creme≈6,90:1. Vorgeschlagener heller Text auf Panel≈16,76:1 und dunkler Sekundärtext #b5c1ba auf #171e21≈9,08:1. Keine pauschale Barrierefreiheitsfreigabe aus diesen Zahlen; tatsächliche Zustände, Transparenz und Hintergründe separat prüfen.

Materialien: Arbeitsflächen bleiben opak und ruhig. Dunkle Overlays zunächst nahe-opak; höchstens eine vorhandene sanfte Hintergrundunschärfe, keine übereinanderliegenden Glaslagen. Bei reduzierter Transparenz opake Fallbacks; bei erhöhtem Kontrast klare Konturen. Supaste-artige Tiefe durch Oberflächenabstufung und präzise Abstände statt großer Glaseffekte. Vorschlag Panelschatten0 14px 36px #0006, Karten maximal0 2px 6px #0002. Keine animierten Blurflächen oder neuen starken Filter auf großen Fenstern.

## 5. Proportionen, Typografie und Dichte

Arbeitsfenstergeometrien aus Abschnitt3 bleiben bestehen. Für neue **dunkle Schnellkomponenten** vorgeschlagen:

| Element | Ziel bei normaler Textgröße | Verhalten |
| --- | --- | --- |
| Panel |430px breit bei Island; Startmenü bisher bis480px |Bestehende Hosts behalten; keine gemeinsame Zwangsbreite für alle Oberflächen |
| Innenabstand / Raster |16px Panelrand;12px Gruppenabstand;8px zwischen Elementen |4px-Grundraster, keine leeren dekorativen Großflächen |
| Suche |40px hoch,10px Radius,12px seitliches Padding |Sichtbare Beschriftung plus optionaler Platzhalter, Löschaktion zugänglich |
| Filter-Chip |28–32px sichtbar,999px Radius,10px Innenabstand |An echten Filtern; aktive Auswahl über Text/Form und aria-pressed erkennbar |
| Vorschaukarte |12px Radius,12px Padding,160–192px Breite |Zwei Spalten nur bei ausreichendem Platz, sonst eine; keine erfundenen Miniaturbilder |
| Ergebniszeile |44–48px hoch,36px Originalicon |Name und höchstens eine reale Statuszeile, Pin-Aktion getrennt |
| Treffer-/Filterbereich |Vertikal scrollbar |Dock nie scrollbar; fokussierte Treffer automatisch sichtbar |

Typografie: system-ui für Suche/Navigation/Karten; Georgia in Home/Notes als bestehender Akzent. Vorgeschlagene Hierarchie:12/16px Metadaten,13/18px Navigation/Chips,14/20px Fließtext,16/22px Gruppenüberschrift; vorhandene Notes-Titel30/36px und Home-Akzente nicht pauschal verkleinern. Kleine Texte keine enge negative Laufweite; große Überschriften höchstens leicht enger (etwa−0,02em). Keine fremden Fonts herunterladen. Größen in späteren Komponenten mit rem/em und lokalem Layout skalieren; Baseline-Messwerte gelten bei100%, nicht als Hindernis für Textvergrößerung.

Supaste-Nähe wäre bei dunklem Suchfeld, Dichte, Filterform, Kartenradius und ruhiger Auswahlmarkierung möglich. Exakte Supaste-Proportionen bleiben bis zu erreichbaren Referenzbildern offen.

## 6. Island und Schnellablage – eine vorhandene Oberfläche erweitern

Geschlossene Island unverändert: echter lokaler Zeit-/12-/24h-Vertrag, gleiche x/y-Werte, schwarzer Randkontakt. Keine fiktiven Medien-, Batterie-, CPU-, WLAN- oder Wetterdaten. Geöffnetes Panel bleibt derselbe air-island-Host mit bestehenden Fokus-/Outside-Click-/Escape-Regeln und bestätigten Preference-Aktionen.

Ein späterer Bereich „Schnellzugriff“ kann im **bestehenden** Panel eine Ansicht bilden. Anfangs echte Verweise zu Notes, Erinnerungen, Finder und vorhandenen Notes-/Reminder-Übersichten, sofern deren eigene bestätigte Datenadapter wiederverwendet werden. Das ist keine zusätzliche Kopie der Widgets oder ihrer Stores. Kontrollzentrum bleibt klar erreichbar; aktive Ansicht explizit benennen. Kein generischer „Inbox“-Bereich, der eine nicht vorhandene Sammlung vortäuscht.

„Schnellablage“ bezeichnet bis zu einer separat spezifizierten sicheren Ablagefunktion nur das visuelle Konzept. Keine Zwischenablagehistorie lesen, kein Hintergrund-Monitoring, kein Drag-and-drop mit vorgetäuschter Speicherung. Keine OCR, Cloud/iCloud, systemweite Hotkeys oder Einfügeaktionen als vorhanden anzeigen. File-/Textablage erst nach Daten-/Berechtigungs-/Löschkonzept; nicht Teil der nächsten visuellen Abnahme.

Bestehende Notes-Mitteilung bleibt inhaltsfrei. Private Titel nur in bewusst geöffneten autorisierten Ansichten; keine automatische Vorschau im geschlossenen Trigger. Logout, Sitzungswechsel, veraltete Antworten und Publisher-Grenzen aus E1–E3 beibehalten. Nicht verfügbare Host-Controls weiterhin klar deaktiviert; dunkles Design rechtfertigt keine Scheinregler.

## 7. Suche und Navigation

Startmenü bleibt der Registry-Einstieg. Keine zweite App-Liste. Suchfeld oben, darunter erst nach gesicherter Integration echte Filter wie „Alle“ oder bestehende App-Kategorien. Nicht vorhandene „Bilder“, „Zwischenablage“ oder „Cloud“-Treffer nicht als verfügbare Kategorien einführen. Apps, Datei- und Notizsuche nur soweit bestehende Dienste/Berechtigungen sie tatsächlich liefern; Quellen müssen erkennbar bleiben.

Leere Suche zeigt verfügbare Apps; kein Treffer und Ladefehler sind unterschiedliche Zustände. Suche nach Namen/IDs beibehalten; bei späterer asynchroner Suche Generation/Sitzung prüfen statt künstlicher Wartezeit. Pfeile wählen Ergebnisse, Enter öffnet über den bestehenden sicheren Startpfad. Pin-Buttons bleiben eigene Tab-Ziele und zählen nicht als Suchtreffer. Bestätigte Pin-Speicherung weiterhin Voraussetzung für den neuen Status.

Karte oder Zeile zeigt Originalicon, echten Namen und belegbaren Status. Vorschauen eigenständig typografisch gestalten; keine Supaste-Screenshots als Produktgrafik. Falls Notes-Vorschau später gewünscht: zunächst Titel, keine ungefragten Body-Ausschnitte. Ausgewählte Filter, leere Zustände, Fehler und aktive Ansicht bleiben eindeutig sichtbar.

## 8. Apple-Prinzipien in konkrete Interaktionsregeln übersetzen

1. **Sofort reagieren:** Press-Hintergrund/Rand auf pointerdown bzw. native Tastaturbetätigung ohne IPC-Wartezeit. Aktion weiterhin per normalem Click/Enter/Space; destruktive Aktion nicht auf pointerdown ausführen. Bei Wegziehen darf der native Klick abgebrochen werden.
2. **Bestätigung trennen:** Druckfeedback ist kein Erfolg. Während eines echten Writes „Speichert …“, Erfolg erst nach Acknowledgement; Fehler und Retry erhalten. Doppelte Datenmutationen dürfen gesperrt bleiben, Navigation darf dadurch nicht grundlos blockiert werden.
3. **Direkte Bewegung:** Vorhandene Pointer-Capture- und Griffversatzlogik weiterverwenden. Fensterziehen1:1, keine Feder hinter dem Mauszeiger und keine pauschale Änderung des Window Managers.
4. **Unterbrechen:** Eine neue Öffnen-/Schließen-/Restore-Absicht übernimmt die tatsächlich sichtbare Position/Opacity. Frühere Completion-Callbacks müssen verworfen werden; kein Sprung auf den alten Zielwert, kein späteres verstecktes Fenster nach erneutem Öffnen.
5. **Räumlicher Zusammenhang:** Startmenü aus Richtung des Dock-Buttons, Island-Panel von der oberen Island. Rückweg gleich, Trigger-Fokus wiederherstellen. Nicht plötzlich unterschiedliche Aus-/Einflugrichtungen verwenden.
6. **Feder als Verhalten:** Für später tatsächlich gestengesteuerte Elemente kritisch gedämpft (Ziel-Dämpfung1,0, Response etwa0,3–0,4s) als Ausgangspunkt. Response ist keine garantierte Dauer. Kein dekoratives Nachschwingen von Menü oder Editor. Momentumübergabe erst für eine konkret beauftragte Geste; keine neue Federbibliothek ohne Lizenz-/Sicherheits-/Bundleprüfung.
7. **Reduzierte Bewegung:** OS-Signal oder vorhandene Air-OS-Einstellung genügt. Keine Feder/Translation/Zoom/Parallaxe; statischer Wechsel oder kurze Opacity-Rückmeldung0–100ms. Press-/Fokus-/Statusfeedback bleibt sichtbar.

Vorgeschlagene ruhige Nicht-Gesten-Zeiten: Press-Farbe unmittelbar, Hover80–100ms, kleines Panel100–140ms, Fokus ohne Verzögerung. Für echte Gesten keine fest vorgeschriebene Keyframe-Bahn. Nur transform/opacity pro Frame; Blur/Schatten statisch, will-change nur kurzfristig. Keine neuen Hintergrundtimer oder neue Startverzögerung.

**Ist-Lücke aus Codeprüfung, noch kein Fix:** Startmenü verwendet140ms CSS-Eintritt. Island-Schließen120ms WAAPI; erneutes Toggle beendet die alte Animation, ist aber keine nachgewiesene positions-/geschwindigkeitsstetige Umkehr. Fensterminimierung410ms feste WAAPI, erneute Minimierung wird während is-minimizing verworfen. Dies erfüllt noch nicht pauschal die Unterbrechbarkeitsziele der Skill. In F2 zunächst reproduzieren/protokollieren, danach pro Komponente einzeln korrigieren. Verlässliche bestehende Cleanup-/Restore-Verträge dabei nicht aufgeben.

Die Skill empfiehlt stellenweise Material-/Bluranimation und physikalische Effekte. Für Air-OS haben Performance, reduzierte Bewegung, Kompaktheit und sichere Zustände Vorrang; solche Effekte werden nicht ungeprüft übernommen. Keine Audio-/Haptikfunktion einführen, nur weil sie in der Quelle beschrieben ist.

## 9. Tastatur, Kontrast und Bedienbarkeit

- Sichtbare native Buttons, sinnvolle DOM-Reihenfolge. Enter/Space aktivieren; Escape schließt jeweils die aktive oberste Oberfläche; Fokus kehrt zum Auslöser zurück. Klick außerhalb darf keinen ungewollten App-Start auslösen.
- Nichtmodalen Parallelbereich nicht als Modal deklarieren oder mit Fokusfalle versehen. Für späteres echtes Modal sind Fokusbegrenzung und aria-modal getrennt zu planen. Keine versteckten fokussierbaren Icons.
- Pfeilnavigation nur innerhalb klarer Listen/Filter-Gruppen. Suche erhält beim bewussten Öffnen Fokus; eine reine Datenaktualisierung stiehlt keinen Fokus und löscht keinen Suchtext.
- Mindestens4,5:1 für normalen Text,3:1 für große Schrift bzw. relevante UI-Konturen. Fokus/Rand/Label dürfen nicht allein auf Farbwechsel beruhen. Disabled-Zustände klar beschriften; kleine Texte nicht beliebig schrumpfen.
- Ziel24×24CSS-Pixel oder ausreichende Abstände für Pointer-Ziele; bei coarse pointer möglichst44×44. Kompakte sichtbare Icons sind erlaubt, aber Klickbereiche dürfen Nachbaraktionen oder Fenster-Griffe nicht überlagern. F1-Traffic-Lights sind sichtbar10px; tatsächliche Trefferflächen sind ein konkreter F2-Prüfpunkt, noch kein geänderter Stil.
- 200%-Textvergrößerung, forced-colors/prefers-contrast, reduzierte Transparenz und beide Reduced-Motion-Wege prüfen. CSS-Media-Signale mit opaken/kontrastierenden Fallbacks; keine ungesicherte neue Preferences-Option als schon verfügbar bezeichnen.
- Status/Laden/Erfolg/Fehler sparsam über bestehende Statusbereiche mitteilen. Keine privaten Titel als unaufgeforderte Live-Region vorlesen. Tastatur- und Screenreader-Prüfung auf beiden Zielplattformen getrennt dokumentieren.

## 10. Responsive-Regeln

1920×1080 und1650×930 behalten die gesicherten Fenster-/Kachelproportionen. Kein globales Herunterskalieren der ganzen Electron-Oberfläche. Suche/Karten reagieren auf tatsächliche verfügbare Breite und Textgröße.

390×600: bestehendes Systemmenü links frei; Island oben0, Dock unten0. Panel maximal366px breit, x12, unter der Island ab y44. Bestehendes Panel284px hoch passt; für spätere längere Inhalte max-height an freie Strecke bis Dock minus12px koppeln (hier476px Obergrenze), nur Inhalt vertikal scrollen. Startmenü bleibt im bestehenden Dock-Bezug; kein zweiter Schnellbereich gleichzeitig darüber legen. Gegenseitiges Dismissal/Fokusverhalten verwenden.

Chips bei Platzmangel umbrechen, keine versteckte horizontale Filter-/Dock-Scrollfläche. Karten auf eine Spalte, Originalicons nicht strecken. Suchfeld/Header und wichtige Aktionen bleiben erreichbar, nur Treffer-/Previewfläche scrollt. Notes behält sein100px-Listenband; Home seine vorhandene horizontale Navigation und einspaltige Kacheln. Zoom/kontrastbedingte größere Texte dürfen zusätzliche vertikale Höhe benötigen; feste Bestandsmaße sind Baseline, keine Erlaubnis zum Abschneiden.

## 11. Was optisch angenähert wird und was eigenständig bleibt

| Angestrebte Annäherung aus Supaste-Briefing | Eigenständige Air-OS-Entscheidung/Grenze |
| --- | --- |
| Dunkle, kompakte Schnellfläche mit Suchfeld |Vorhandener Island-/Startmenü-Host, eigenes Styling; Quelle derzeit nicht sichtbar |
| Filter-Chips und Vorschaukarten |Nur echte Registry-/Suchdaten, eigene Labels/Komposition, keine Produkt-Assets |
| Präzise Dichte, Schrift- und Fokusabstimmung |Konkrete vorgeschlagene Rollen aus diesem Plan, Plattform-Systemfonts, Kontrastprüfung |
| Ruhige kurze Rückmeldung |Apple-Skill als Prinzipienquelle, eigene Electron-/DOM-Implementierung in späteren kleinen Einheiten |
| Hochwertige Gesamtwirkung |Mint/Creme-Home und Notes, blaue Wolken, randbündiges Dock/Island, Birnenlogo und bunte Originalicons bleiben Air-OS-spezifisch |
| Keine Funktionsübernahme durch bloße Optik |Kein Clipboard-Monitoring, iCloud/Cloud, OCR, Host-Einfügen, nicht vorhandene Systemsteuerung oder zweite Verwaltung |

Eigene Komponenten verwenden; das visuelle Nachstellen proprietärer Produktgrafiken ist kein Ersatz für ein legales Asset-Konzept. Nur sichtbare allgemeine Gestaltungsprinzipien nach Sichtung übernehmen, keine unbestätigten Lizenzfreigaben für Supaste voraussetzen.

## 12. Kleine nächste Einheiten – keine davon jetzt implementiert

| Einheit | Kleiner Umfang | Reviewbarer Nachweis |
| --- | --- | --- |
| Referenzabgleich vor F2 |Erreichbare Supaste-Screenshots auswerten; Tabelle um tatsächlich beobachtete Farben/Proportionen ergänzen |Quellenmarkierung und Abweichungsliste; keine Implementierung. Konkrete Supaste-Pixelziele bis dahin offen. |
| F2.1 nach Freigabe |F1 auf Windows bei drei Größen rein visuell/mit Tastatur abnehmen |Screenshots, tatsächliche Font-/Hitbox-/Kontrastwerte, fehlerfreie Funktion separat berichten |
| F2.2 |Dasselbe auf macOS; vorhandene reale Version/Architektur nennen |Plattformbericht; kein behaupteter Hardwaretest aus Linux-CDP |
| K1 separat |Genau eine belegte Kontrast- oder Trefferflächenabweichung korrigieren |Ein Vorher/Nachher-Paar und Regression; Classic/Geometrie erhalten |
| K2 separat |Nur vorhandenes Startmenü-Suchfeld samt einer vorhandenen Filtergruppe optisch abstimmen |Echte Registry-Treffer, Keyboard/Suche/Pin-Persistenz und drei Viewports |
| K3 separat |Genau einen bestehenden Bereich des Island-Panels als dunkle Schnellansicht verfeinern |Ein Host, reale Daten, keine neuen scheinbaren Host-Funktionen |
| M1 separat |Nur Island-Umkehr während laufender Animation korrigieren |Schnelles Toggle/Escape/Wiederöffnen, kein Sprung, keine alten Callbacks, Reduced Motion |
| M2 separat |Nur Minimieren→Restore während laufender Animation absichern |Bestehender Window Manager, Fokus/Persistenz/Close sauber, kein zweiter Lifecycle |

Reihenfolge: Konzept prüfen, Supaste-Belege ergänzen, Freigabe, F2-Abnahme, dann einzelne beauftragte Korrekturen. Nicht alle K-/M-Einheiten als nächsten Großauftrag beginnen. Neue Funktionen und neue Datenquellen bleiben separate Produktaufgaben.

## 13. Prüfstand dieser Konzept-Sitzung

Nur Dokumentation. Keine Renderer-/CSS-/Runtime-/IPC-/Preferences-/Installeränderung und keine neue Abhängigkeit. Keine neue App-GUI-Abnahme oder Testsuite behauptet; letzter real belegter F1-Stand216/216 Tests und Linux/Electron-Screenshots bleibt historische Basis. Hier geprüft: Remote-HEAD, Code-/Messdaten, fixierte Skill-Quelle/Lizenz, Kontrastrechnung und Dokumentlinks/Whitespace. Supaste-Prüfung konkret blockiert wie Abschnitt1. Bestehende Audit-, Legacy-Electron-, Signing-/Notarisierungs- und Release-Blocker bleiben unverändert.

## Umsetzungshinweis K2 (24. Oktober 2026)

[Bestehendes Startmenü mit exakt zwei echten Pin-Filtern umgesetzt](AIR_START_MENU_HYBRID_K2.md). Der in diesem Plan vorgeschlagene dunkle Such-/Zeilenstil ist für diese eine Oberfläche umgesetzt; andere Schnellflächen bleiben separat. Originalgeometrien erhalten, Classic unverändert, kein Clipboard-/Cloud-/OCR-Ausbau. Supaste-Abgleich weiter offen.

## Umsetzungshinweis K3 (24. Oktober 2026)

[Eine zusätzliche Schnellzugriff-Ansicht im bestehenden Panel umgesetzt](AIR_ISLAND_QUICK_K3.md): vier echte interne Apps, keine neue Ablage/Datenquelle, keine zweite Island. Control bleibt Default, beide Ansichten vollständig getrennt verborgen/inert. Benutzer wählte bestehendes Birnenlogo für die Home-Karte. Breite und Randposition erhalten; aktive Ansicht braucht unterschiedliche dokumentierte Höhe. Unterbrechbare Feder-/Richtungswechsel-Logik weiter nur geplanter M1-Schritt.

## Benutzerkorrektur: dezentes Glas, 24. Oktober 2026

[Umsetzung und echter Vorher-/Nachhervergleich](AIR_MODERN_SOFT_GLASS.md). Neueste ausdrückliche Vorgabe ersetzt die früheren opaken/eckigen Randflächen: Modern-Dock rgba(9,11,12,.84), alle vier Ecken20px, weiter unten0 und358×68px; Island gleicher Glasgrund mit16/16/22/22px-Radien, oben0 und unveränderten Maßen. Birne vorhandener weißer Vektor ohne Kasten, andere bunte Originalicons unverändert. Schlichter Air-OS-Textzugang, Tastaturfokus erhalten. Neue Profile Desktop/Dock Modern, bestehende Auswahlen maßgeblich. Mint/Creme/Home-Geometrie und Classic unverändert. 232/232 Linux-Tests und echte Linux-Electron-Prüfungen an drei Größen; native Windows/macOS weiterhin offen. Kein Supaste-/Referenzpixelgleichheitsanspruch.
