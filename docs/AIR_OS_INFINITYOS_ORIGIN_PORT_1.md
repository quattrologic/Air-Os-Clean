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
