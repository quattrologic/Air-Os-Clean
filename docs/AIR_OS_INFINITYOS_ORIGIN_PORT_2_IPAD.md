# InfinityOS Integration 2 — iPad PWA 2

Basis: `1deb36a2e77107897cd277d07bdd09140697da9d`.
Branch: `feat/air-os-infinityos-origin-port-2-ipad`.

## Ausführbarer selektiver Port

Kein Desktopbranch-Merge. Gezielt übernommen: reine Stage-/Panel-Modelle, vorhandener Window-System-Adapter mit Browserguard, Gruppenübersicht, Layoutauswahl, Gruppieren/Sortieren, gruppiertes Minimieren/Wiederherstellen über dieselben M2-Verträge, räumliche Tastaturnavigation und endliche Stage-Einblendungen. Die bisherige Appübersicht delegiert an diese gemeinsame Übersicht. Touch-/Pencil-/Trackpad-Inputs nutzen Pointer Events; Pointercancel und Orientierungswechsel räumen die Geste auf. Safe-Area-/VisualViewport-Grenzen kommen weiterhin vom PWA-Adapter.

Stage-Gruppen liegen im bestehenden versionierten IndexedDB-Preference-Datensatz des lokalen Bereichs. Keine neue Datenbank und keine Electron-IPC. Validierung prüft bekannte Registry-IDs, Gruppengrenzen und Duplikate, einschließlich Backups. Veraltete explizite Sitzungstokens werden abgewiesen. Fensterpositionen und Modus verwenden die vorhandenen `windowLayout`-/`desktopLayout`-Felder. Logout wartet auch auf diese Schreibwarteschlangen. Die iPad-eigenen Reminders-Listen, CAS-Schreibschutz, Kalenderbearbeitung und sicheren virtuellen Finderaktionen bleiben erhalten.

GLASS-3 übernimmt die separate Mipmap-Skalierung und endliches Pointerlicht. Standard bleibt sparsames CSS-Compositor-Glas; „Hoch“ erfordert weiter geeignete Hardware/WebGL2. Kein permanenter Shaderloop, keine native Fenstertextur, kein Stage-Manager-Zugriff auf fremde iPad-Apps. Reduced Transparency und Forced Colors haben Vorrang. Bestehende Music-/Notification-/Widget-Datencontroller werden weiterverwendet.

## Herkunft / Lizenz

Neue Stage-Funktionen eigenständig implementiert; keine ungeklärten Origin-/GNOME-Dateien oder GPL-Blur-My-Shell-Quellen übernommen. Existierende MacShell-MIT-, MacTahoe-MIT/GPL-, Hyprland-BSD- und Font-Nachweise bleiben unangetastet. Keine ISO- oder Linux-Systemoperation im Browser.

## Prüfstand dieses Checkpoints

584/584 lokale Node-Regressionen; bestehender vollständiger Chromium-GUI-Lauf: 99/99 Prüfungen, sieben Viewports, keine Browserfehler. PWA-Paketprüfung: 368 Dateien, 367 cachebare Runtimeassets. Die zusätzlichen Stage-/WebKit- und Subpath-Läufe werden nach tatsächlichem CI-Ergebnis ergänzt. Physisches iPad/Safari/Pencil/Audio ist offen.

Eigener Workflow `build-air-os-ipad-origin2.yml`: Audit, Regressionen, sauberer versionierter PWA-ZIP-Build, identischer Chromium-Vorherlauf auf der verifizierten Basis, Chromium/WebKit-Nachherläufe einschließlich Pages-Unterpfad und Stage-Szenarien. Nur Actions-Artefakte und synthetische Evidenz im Featurebranch; **keine Veröffentlichung**. Die vorhandenen manuellen Pages-/privaten Bereitstellungsverträge bleiben unverändert.

## Installation / Grenzen

ZIP auf einem ausdrücklich gewählten vertrauenswürdigen HTTPS-Host entpacken; Safari → Teilen → Zum Home-Bildschirm → als Web-App öffnen. Dieser Auftrag deployed keine Website. Nach erstmaligem vollständigem Laden bleiben lokale Apps offline verfügbar. Browserdaten regelmäßig über das vorhandene Backup exportieren. Lokale Bereiche sind keine sichere Passwortauthentifizierung; kein Apple-Kalender-/Stage-Manager-/Dateien-App-Vollzugriff und keine native App-Store-App.

## Visuelle Korrektur nach realem Bildvergleich

Der erste reale Chromium-Stage-Lauf bestand 113 Prüfungen ohne Fehler. Das Overlay war über weißen Arbeitsflächen zu hell; Produktcode erhält eine separate Lesefläche, kompaktere Appzeilen, ehrliche Zustandsindikatoren und deaktivierte nicht anwendbare Gruppenaktionen. Widgets/Dock bleiben transparent. Lokales Stage-Rail-Swipen respektiert vertikales Scrollen und Pointercancel. Touch-Release räumt Hoverlicht auf. Zusätzliche Szenarien prüfen Leseflächen-Kontrast, Swipe-Abbruch und bestätigte Backup-Wiederherstellung der Gruppen. Die Hardwaregrenzen bleiben unverändert.

## Finale Produktarchitektur / Browservertrag

| Funktion | Zuständiger Pfad | Prüfgrenze |
|---|---|---|
| Stage-Gruppen / Vorschauen | `stage-model` + `air-stage-overview` | Live-Appicons, Geometrie und minimiert/aktiv; keine privaten Inhaltskopien |
| Fenster / Gruppenaktionen | Existierendes `air-window-system`, `openApps`, Lifecycle/MRU, M2 | Interne PWA-Fenster; kein nativer iPadOS Stage Manager |
| Touch / Pencil / Tastatur | Pointer-Capture der bestehenden Fenster; lokale Rail-Swipes; Previewdrag mit Cancel | Touch und Pen-Pointer automatisiert; kein PencilKit oder physischer Penciltest |
| Persistenz | `pwa/adapter.js` → bestehendes IndexedDB-v2-`preferences` | Validierte Gruppen/Registry-IDs und Sitzungstoken; kein neues Schema oder Store |
| Backup | Bestehender atomarer Backup-/Restore-Dienst einschließlich Stage-Preferences | Bestätigung erforderlich; fehlerhafte oder veraltete Daten abgewiesen |
| Glas | Gemeinsamer GLASS-3-Owner + Original-MacShell-Materialprofile / `air-origin2.css` | Standard CSS; Hoch nur nach Hardwareguard; eigenes Wallpaper / prozedurale Controls |
| Apps | Vorhandene Notes/Reminders/Calendar/Finder/Music-Controller und Browseradapter | Lokale Bereiche, echte Daten/Offline; keine neue Audioengine oder Registry |
| Controls | Vorhandene zwölf Kacheln, Detail-Reveal-Owner, gemeinsame Notifications/Music | Native OS-Schalter bleiben nicht unterstützt; Browser-WakeLock nur soweit verfügbar |
| Offline / Updates | Versionierter scoped Worker, Cache-Whitelist, vorhandener Dirty-Editor-Updateschutz | Kein Cloudcaching oder Public Deployment; Cold-Offline-WebKit separat unten |

Die Browser-spezifische Glasqualitätsprüfung und `airPwaWorkArea` wurden beim selektiven Port ausdrücklich erhalten. Dock/Island-Geometrie, Magnifikation, Pins, helle App-Arbeitsflächen und Profile werden nicht ersetzt. Keine Electron- oder GNOME-Laufzeit in der PWA.

## Reale lokale Vorher-/Nachher-Abnahme

585/585 Node-Regressionen (576 bestehende + 9 neue). Zusätzliche Cacheprüfung führt den tatsächlich erzeugten Worker aus: die kanonische Start-URL wird unabhängig vom Browser-Requestmodus auf `index.html` abgebildet; Query-/Fremdorigin-/Fremdscope-Anfragen bleiben ausgeschlossen. Eine anfangs falsche Testausgabe nach `/tmp` wurde an den bestehenden Buildschutz angepasst: Testbuilds liegen isoliert unter `dist`. Kein Schutz wurde gelockert.

Identische Linux-Chromium-/Touch-/DPR2-Bedingungen, synthetische Zeit 29.10.2026 12:34, tatsächlicher `/Air-Os-Clean/`-Unterpfad:

- Vorherquelle `1deb36a2e77107897cd277d07bdd09140697da9d`: **100** Browserchecks, sieben Viewports, 0 Fehler.
- Nachherquelle `977aa8946aacd6ff9349f1c61a27d7c032749fb4`: **117** Browserchecks, sieben Viewports, 0 Fehler. Der folgende Commit b716ad3 korrigiert nur den CI-Ausdruck; die Produktausführung ist dieselbe.
- Gruppen-Minimize/Restore, Keyboard-Zyklus, Pointercancel, bestätigter Backup-Restore, Reloadpersistenz und lokale Bereichstrennung werden tatsächlich ausgeführt. Stage-Szenen zusätzlich in allen fünf angeforderten iPad-Größen.
- Originale Fenstertiteldrags, Cancel, M2-Restore, bestehende Appdaten-/CAS-/Quota-/Offline-/Update- und siebengroße Viewporttests bleiben erhalten.
- „Hoch“ erkennt im lokalen Test eine Software-GPU und bleibt korrekt im CSS-Fallback; keine Hardwarefreigabe. Standard hat 0 Idle-Shaderdraws.

23 unveränderte, echte Renderer-JPEGs sind mit SHA-256 in [comparison.json](visual/origin2-ipad/local-chromium-977aa8946aac/comparison.json) verzeichnet; keine Retusche und kein nachträgliches Umzeichnen.

| Szene | Vorher | Nachher |
|---|---|---|
| Desktop | [1180×820](visual/origin2-ipad/local-chromium-977aa8946aac/before/1180x820-desktop.jpg) | [1180×820](visual/origin2-ipad/local-chromium-977aa8946aac/after/1180x820-desktop.jpg) |
| Hochformat | [834×1194](visual/origin2-ipad/local-chromium-977aa8946aac/before/834x1194-desktop.jpg) | [834×1194](visual/origin2-ipad/local-chromium-977aa8946aac/after/834x1194-desktop.jpg) |
| Zwei Apps | [Vorher](visual/origin2-ipad/local-chromium-977aa8946aac/before/1180x820-two-apps.jpg) | [Nachher](visual/origin2-ipad/local-chromium-977aa8946aac/after/1180x820-two-apps.jpg) |
| Kontrollzentrum | [Vorher](visual/origin2-ipad/local-chromium-977aa8946aac/before/1180x820-control-center.jpg) | [Nachher](visual/origin2-ipad/local-chromium-977aa8946aac/after/1180x820-control-center.jpg) |
| Notes | [Vorher](visual/origin2-ipad/local-chromium-977aa8946aac/before/1180x820-notes.jpg) | [Nachher](visual/origin2-ipad/local-chromium-977aa8946aac/after/1180x820-notes.jpg) |
| Appübersicht / neue Gruppen | [Bisherige Übersicht](visual/origin2-ipad/local-chromium-977aa8946aac/before/1180x820-overview.jpg) | [Stage-Gruppen](visual/origin2-ipad/local-chromium-977aa8946aac/after/1180x820-stage-groups.jpg) |

Die neue Stage-Funktion hat auf der alten iPad-Basis kein identisches Gegenstück; dafür wird kein Pixelgleichheitsvergleich behauptet. Die erste neue Bildrunde zeigte zu wenig Kontrast über weißen Apps; eine tatsächliche Produktkorrektur dunkelt nur textreiche Overlays ab und verkürzt die Appzeilen. Der neue Test prüft mindestens 4.5:1 gegen die weiße Basiskomposition der Lesefläche, nicht eine erfundene globale Kontrastfreigabe für jedes Wallpaper.

## WebKit-Cold-Offline: ausdrücklich separates Abnahmekriterium

Erster CI-Lauf 41221967018: Chromium 113 bestanden; WebKit lief durch Apps/Stage/Offline-Neuladen, scheiterte aber nach dem vollständigen Browserneustart beim Offline-Aufruf der kanonischen Start-URL mit `Internal error`. **Kein insgesamt erfolgreicher iPad-CI-Lauf.**

Daraufhin: die Start-URL-Zuordnung benötigt nicht länger `Request.mode === navigate`; ein eigener Test deckt die korrekte Abbildung und Scope-Grenzen ab. Ein erneuter Fehler speichert nur begrenzte Diagnosewerte (Workerregistrierung, Cache vorhanden, Anzahl synthetischer Notizen). Unabhängige Unterpfadläufe und das erfolgreich gebaute ZIP werden bei einer GUI-Blockade erhalten; der Job bleibt dabei rot und die Evidenz ist ausdrücklich `INCOMPLETE/FAILED`. Fehler werden nicht in Erfolge umgedeutet. Das Ergebnis des letzten Laufs wird unten ergänzt.

## Build / Installation

Produkt-/Buildquelle des letzten Kanals: `b716ad310902cadc29cc2d952415bb984fe5935b`. Lokal aus sauberem Checkout gebaut und paketgeprüft:

- `Air-OS-Ultimate-iPad-b716ad310902.zip` · 2268061 Bytes.
- SHA-256: `614b2bfa860dd022ff704f44084a65c9ac1db24e0e5506302d3c7b0aca01fc53`.
- 368 Paketdateien / 367 gecachte Runtimeassets; Manifest/Scope/CSP, Originalicons und Lizenzen geprüft.
- Kein Electron-Main-/Preload, keine privaten Daten/Secrets und keine Cloudanmeldung.
- ZIP ist ein Web-App-Paket: auf einem ausdrücklich autorisierten vertrauenswürdigen HTTPS-Host entpacken; Safari → Teilen → Zum Home-Bildschirm → Als Web-App öffnen. Kein IPA und keine App-Store-App.
- Keine öffentliche Website bereitgestellt. Bestehende private/ausdrücklich freizugebende Pages-Optionen unverändert. Origins haben getrennte Browserdaten; regelmäßige Backups bleiben erforderlich.

Physisches iPad, Safari-Home-Screen-Installation, reale Safe Areas/Bildschirmtastatur/Pencil/Audio/Suspend sowie echte Hardware-WebGL-GPU bleiben offen. Keine nativen iPad-Fenstertexturen, kein Zugriff auf andere Apps und keine Gleichsetzung des lokalen Startbildschirms mit sicherer Anmeldung. MacLock-Shader wurden in dieser Phase nicht ersetzt.

## Checkpoints

- `d5dcdb62a379372f4d8d14a391459fd6cfe1e599`: selektiver browserkompatibler Stage-/Materialport, 584 Node-Tests.
- `a84fc161ebaa1493ed82cd2dfb693b3301b684b7`: Bildkorrektur, Swipe-Cancel und Backup-Abnahme.
- `771ab1989ad4d508242c3989b9e04560050cdf9e` / `ac1c6ed70415f041dc005720c684931c5bc28eb6`: kanonischer Workerstart und korrigiertes isoliertes Testausgabeverzeichnis; danach 585 Tests bestanden.
- `977aa8946aacd6ff9349f1c61a27d7c032749fb4`: begrenzte Offline-Diagnostik und ehrliche Fehlerartefakte.
- `b716ad310902cadc29cc2d952415bb984fe5935b`: unterstützter CI-Statusausdruck statt eines im `env`-Kontext nicht erlaubten Statusfunktionsaufrufs.

[Desktop / geprüfter Windows-R8-Installer](https://github.com/quattrologic/Air-Os-Clean/blob/feat/air-os-infinityos-origin-port-2-desktop/docs/AIR_OS_INFINITYOS_ORIGIN_PORT_2.md).

## Zweite visuelle Korrekturrunde (WebKit)

Der abschließende Lauf 41223948617 auf b716ad310902cadc29cc2d952415bb984fe5935b bestand tatsächlich alle Browserpfade: Chromium Root 116, WebKit Root 115, Chromium Unterpfad 117, WebKit Unterpfad 116; jeweils sieben Viewports und 0 Fehler. Auch der kalte Offline-Neustart besteht nach der robusten Start-URL-Zuordnung. Dennoch zeigte die visuelle Prüfung der WebKit-Aufnahmen schlecht lesbare native weiße Select-Flächen. Produktkorrektur: echter Select bleibt erhalten, explizite dunkle geschlossene Fläche / lesbarer Vordergrund / native Picker- und Tastaturfunktion. Zusätzlicher GUI-Check; erneuter Build wird getrennt nachgewiesen. Die WebKit-GTK-Compositorwirkung unterscheidet sich sichtbar von Chromium; keine Behauptung gleicher physischer Safari-Blurqualität.
