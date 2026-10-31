# Air-OS × InfinityOS / Origin · funktionale Integration 1

Basis: Desktop-R7 02ccaf88724731cf685d2221f88e959020aff3f0, vor Änderungen gegen Remote geprüft. Branch feat/air-os-infinityos-origin-port-1. iPad separat unverändert bei 1deb36a2e77107897cd277d07bdd09140697da9d. Kein main-Merge, keine öffentliche Site, kein Release.

## Herkunft und Lizenzentscheidung

Das Nutzerarchiv wurde ausschließlich außerhalb des Produktrepos in ein separates Analyseverzeichnis entpackt. README_START_HERE und CODEX_MASTERPROMPT vollständig gelesen; SHA-256 und Bytelängen aller 70 Referenzdateien gegen die beigelegte Liste bestätigt. Kein geliefertes Programm ausgeführt. Die ISO liefert keinen nachvollziehbaren Upstream-Commit für Origin.

**Direkte Originalcodeübernahmen aus diesem Archiv: 0.** Kein Origin-/Dash-to-Dock-/Blur-My-Shell-Quelltext, CSS, GLSL, SVG oder substanzielle Ausdrucksstruktur wird eingebunden. Die Implementierungen beruhen auf den ausdrücklich vorgegebenen funktionalen Anforderungen und den vorhandenen Air-OS-Verträgen. Keine Behauptung eines 1:1-Originalports.

| Referenz / Anforderung | Rechte-/Technikstatus | Produktentscheidung / tatsächlicher Pfad |
|---|---|---|
| Origin@appscreen animationEngine/config/minimize/unminimize | Kein fileweiser Copyright-/Lizenznachweis, GNOME Actor/GLib | Keine Übernahme; vorhandene reversible M2-Timeline bleibt. Eigenes UI-Cancellation und vorhandener Window-System-Spring-Cleanup |
| stageManager, stageManagerStageScroll | Lizenz unklar; GNOME-Fensterobjekte | Eigene Gruppen-/Reihenfolgemetadaten in src/core/stage-model.js; bestehender air-window-system.js bleibt Owner. air-stage-overview.js zeigt abgeleitete interne Fenstergeometrien |
| OriginUICC remakeQS/DateMenu/Overview/Dialogs und Styles | Teilweise fehlend, zwei Dateien leer; GNOME-private APIs | Nur funktionale Anforderungen; vorhandene Island-/Control-/Calendar-Owner weiterverwenden |
| remakeNotificationBanner | SPDX GPL-2.0-or-later in dieser Datei, keine Sammellizenz | Nicht kopiert; bestehender Air-OS-Verlauf/Bannerdienst bleibt maßgeblich |
| Blur My Shell effects (Gaussian/Noise/Corner/Color/Down-/Upscale) | GPLv3-Text; Gesamtbuild-/Weitergabepflichten nicht geregelt | Keine GPL-Codeadaption. Vorhandene erlaubte MacShell-/Hyprland-Pipeline bleibt |
| OriginUIPrivateMode/privateModeLiquidGlass | Lizenz unklar, Zoom/Welle statt Snell; Extension privilegiert | Nicht kopiert/ausgeführt. Keine Linux-Privatsphärenschalter oder Sicherheitsversprechen |
| Dash-to-Dock intellihide/windowPreview/appIconIndicators | Lizenz/NOTICE fehlen im Extrakt | Nur eigenständige Overlap-/Preview-Funktionen auf interner Registry; keine Systemfensteraufnahme |
| Radience / Plymouth | Nur Index bzw. Konfiguration, keine nutzbaren Iconassets | Nicht eingebunden; Tahoe-Icons und Air-OS-Logo unverändert |

Die vorhandenen MacShell-MIT-, MacTahoe-MIT-/GPL-Icon-, Hyprland-BSD- und Schrift-Lizenznachweise bleiben unverändert. Kopierter existierender Air-OS-Testcode unterliegt weiterhin der Repositorylizenz. Die neuen eigenen Module sind keine Umdeklaration fremden Codes.

## Checkpoint A · ausführbarer Stage-Vertrag

Fenster → Stage-Übersicht (auch Strg+Alt+S). Die Übersicht listet nur echte interne Fenster des aktuellen Arbeitsbereichs. Vorschauen zeigen geometrische Miniaturen und Registryicons, keine DOM-Kopien oder privaten Window-Captures. Mehrere Fenster auswählen → gruppieren; Gruppen lösen, Pfeiltasten-/Button-Reihenfolge und Pointer-Reorder. Pointercancel/Resize/Visibility/Profilwechsel räumen UI und Pointercapture auf.

Der freiwillige Stage-Modus blendet andere Gruppen aus, ohne Fenster zu minimieren, zu schließen oder ihre Geometrie umzuschreiben. Ausschalten stellt deren Sichtbarkeit wieder her. Gruppen, Modus und Reihenfolge werden erst nach bestätigter Main-Preferences-Speicherung wirksam. Strenge Registry-ID-/Mengenvalidierung, Session-Fence vor/nach asynchronen Writes. Kein neuer Window-State-Store.

F11-/R6.1-Arbeitsfläche, Floating/Dwindle/Master/Monocle, vier Workspaces, Snap/Restore, M1/M2 und Dock-/Island-Außenformen bleiben maßgeblich. Classic erhält keine Stage-Oberfläche.

## Prüfstand

Baseline 557/557 Node-Tests. Checkpoint A 562/562, darunter Gruppenvalidierung/Isolation/Persistenz, aktive Fensterableitung, Reorder, Miniaturgrenzen und Overlap. Echte Electron-GUI wird im eigenen nicht veröffentlichenden Linux-CI-Kanal geprüft; Ergebnisse werden nach Ausführung ergänzt. Noch keine lokale/nativ-Windows/iPad-Hardwareabnahme behauptet.

## Checkpoint B · vorhandene Systemflächen und Dock

Geometrische Pfeil-/Home-/End-Navigation zwischen vorhandenen Kontrollkacheln; Tab bleibt im offenen Island-Panel, Kalender-/Dialognavigation hat Vorrang. Kurze innere Kachel-Reveals laufen im bestehenden Glascontroladapter und werden beim Schließen/Reduzieren/Verbergen/Logout beendet. M1 bleibt die einzige äußere Island-Timeline.

Der vorhandene Benachrichtigungsverlauf bleibt der einzige Nachrichtenstore. Reale Bannerhöhen bestimmen den begrenzten Stapel; Fokus/Hover pausieren dessen Ablauf, Escape entfernt das fokussierte Banner. Fokusmodus verbirgt schon sichtbare nichtkritische Banner, kritische bleiben erlaubt.

Im vorhandenen Dock-Kontextmenü ist Intelligentes Dock freiwillig einschaltbar. Ausschließlich sichtbare interne Fenster lösen Overlap aus. Resize-, Pointer-, Layout- und Lifecycle-Ereignisse statt Intervallpolling; bei M2 bekommt das vorhandene Dock eine synchrone Sichtbarkeitslease, bevor der ursprüngliche M2-Code sein Zielrechteck misst. Ein beschrifteter Rückholbutton und die Bildschirmkante bleiben erreichbar. Pins, Magnifikation und Außenkontur unverändert. Die bisherige Dock-Fensterübersicht öffnet dieselbe Stage-Übersicht.

564/564 Regressionen. Erster CI-Lauf startete echtes sandboxed Electron erfolgreich, scheiterte dann an einer DOMRect-Serialisierung im neuen Testharness; korrigiert. Weitere reale Testergebnisse folgen.

## Checkpoint C · gemeinsame Materialien

Die neuen Stage-Flächen sind echte Zieloberflächen derselben air-desktop-glass.js-Engine: Übersicht als Switcher-/GlassSlab-Profil, Rail als Popover. Gemeinsame Szenentextur, Preblur, Programme, DPR-Budgets, GPU-Schutz und Ressourcenfreigabe. Keine neue Shaderberechnung aus dem Archiv, kein neuer Compositor, kein Fenster-Capture. Originale existierende MacShell-Parameter in src/core/glass-geometry.js unverändert; Wallpaper-only-Grenze bleibt. CSS-Fallback nutzt eine abgestufte transparente Fläche mit Lichtsaum; Reduced Transparency bleibt opak.

Ein getrennter isolierter Software-Shadertest prüft den tatsächlich ausgeführten Stage-Pfad, DPR1/2/3, Idle-Draws, Context Loss/Restore und Cleanup. Dies ist ausdrücklich keine Hardware-GPU- oder Windows-Abnahme. Ergebnis folgt nach tatsächlichem Lauf.

## Architektur, Cleanup und iPad-Portfähigkeit

Renderer: Stage-Ansicht, Tastatur-/Pointer-/Touch-Navigation, schematische Vorschauen, vorhandene Fensteraktionen und kontrollierter Bannerablauf. Window-System: Registry-/Workspace-/Layout-/Fokushoheit bleibt in air-window-system.js/openApps; kein neuer Minimierungsowner. Main: vorhandene autorisierte Preferences-IPC, validierte Stage-/Dockmetadaten und bestehende atomare profilgetrennte Dateien. Keine neue native IPC, Shelloperation oder Datenbank.

Stage-Drag endet bei pointercancel, lostpointercapture, Resize, Blur, Visibility, Profilwechsel und Fullscreen. Lokale Bannerlistener besitzen je einen eigenen abgebrochenen Controller statt einer unbeschränkt anwachsenden Liste am Sitzungscontroller. Endliche UI-Reveals canceln beim Schließen/Verbergen/Reduzieren.

| Teil | iPad-Portfähigkeit | Geprüfter Stand / offene Anpassung |
|---|---|---|
| stage-model / panel-navigation | Reine Browser-/JS-Modelle, keine Node-/GNOME-Imports | Browser-Realm-Modelltest bestanden; bestehende PWA-Preferences brauchen getrennte Validierung/Defaults |
| Stage-Übersicht und Pointercapture | Web Pointer API, native Buttons/Checkboxen/Tab, Responsive Layout | Linux-Electron-Touch-Emulation vorgesehen; kein Pencil-/Safari-Hardwaretest |
| Stage-Konfiguration / Fensterowner | An gemeinsame Registry ankoppelbar | PWA-Fensteradapter/Offline-/VisualViewport-Vertrag separat prüfen; nicht ungeprüft übernommen |
| Kachel-/Banner-/Dockfunktionen | DOM-/ResizeObserver-/Event-basiert | Safe Areas, WebKit, Offlineupdates und Browseradapter auf eigenem Portbranch prüfen |
| Electron-F11 / native Energiesperre | Keine entsprechende Browserberechtigung | Nicht in PWA importieren oder vortäuschen |

Der iPad-Branch wurde nicht gemerged/geändert; seine 576 bisherigen Tests werden nicht mit den 565 Desktoptests addiert. Kein Pages-Deployment. [Eigene Referenz-Hashprüfung ohne Quellinhalt](build-evidence/infinity-origin/reference-audit.json).

M2-Resize-Korrektur im bestehenden app.js: Bei Viewport-/Displaygrößenänderung wird ausschließlich eine schon laufende M2-Animation über ihren ursprünglichen settleModernDockMotion-Pfad beendet, bevor die Fenstergrenzen neu geklemmt werden. Das verhindert veraltete Dock-Ziele/Leases nach Resize. Die normale 410ms-Timeline, Kurve und Reverse bleiben unverändert. Der GUI-Test prüft beide Zielrichtungen und Lease=0.

## Tatsächliche visuelle Korrekturrunde

Die ersten echten CI-Bilder (5eb457a; ausdrücklich unvollständige Abnahme) zeigten kleine Checkbox-Klickziele, mit Drag kollidierende Labelbereiche, sehr kleine schematische Fenster und unnötige leere Panelhöhe. Korrigiert: 44px-Auswahlzeilen, Labels ausdrücklich vom Drag ausgenommen, größere zentrierte Gruppenausschnitte und inhaltsabhängige Panelhöhe mit einem begrenzten Scrollbereich im schmalen Viewport. Keine nachträgliche Bildbearbeitung.

Die erste Materialdiagnose verwendete ein neues SVG-data-URI, das die vorhandene Herkunftsprüfung korrekt mit wallpaper-origin ablehnte. Der Test verwendet nun ausschließlich selbst im Test erzeugte PNG-Pixel über den bereits freigegebenen begrenzten Rasterpfad. Herkunfts-/GPU-Schutz im Produkt unverändert.

## Gemeinsame Registry statt zweiter Appwelt

Die echte Stage-Tastaturprüfung fand eine bestehende Inkonsistenz: reminders, launchpad, store und arcade wurden erst in Renderermodulen registriert; Main kannte diese mitgelieferten Apps nicht und lehnte ihre Stage-Reihenfolge bzw. Workspace-/Fenstergeometrien ab. Die Metadaten stehen nun ausschließlich in derselben zentralen src/core/app-registry.js. Vorhandene Controller registrieren nur noch bei Bedarf, ihre Funktionen/Icons/Daten bleiben unverändert. Ein neuer Test prüft Main-seitig Gruppen und Workspaces mit diesen echten IDs. 566/566 lokale Regressionen.

Die Material-Idle-Messung beginnt erst nach einem nachweislich ruhenden Übergang (600ms unveränderte Draws, maximal8s Wartebudget), danach ein separates800ms-Messfenster. Es werden keine Ereignisse/Rendererfunktionen für einen grünen Zähler abgeschaltet.
