# InfinityOS Integration 2 — Desktop / Windows R8

Basis: `8651a1aaa357b52a7c4edfbea7056bf59e40601b`.
Branch: `feat/air-os-infinityos-origin-port-2-desktop`.

## Implementierter erster Checkpoint

Stage-Gruppen verwenden ausschließlich vorhandene `openApps`-Fenster und Lifecycle/MRU. Gemeinsames Minimieren und Wiederherstellen führt die vorhandenen reversiblen M2-Timelines aus, öffnet keine geschlossenen Gruppenmitglieder und schließt keine Fenster. Aktivierung stellt vorhandene Mitglieder wieder her. Strg+Alt+[ / ] wechselt Gruppen; die Übersicht unterstützt räumliche Pfeilnavigation, Home/End, Sortieren per Pointer und Strg+Pfeil sowie die vier vorhandenen Layoutmodi. Profilgruppen und Layout bleiben im bisherigen atomaren Preference-Dienst. Endliche Opacity-Übergänge werden vom bestehenden Window-System verwaltet und bei Fullscreen, Profilwechsel, minimierten/geschlossenen Fenstern, Sichtbarkeitswechsel und Reduced Motion abgebrochen. Keine zweite Fensterengine.

GLASS-3 korrigiert die Mipmap-Stufen separat für die tatsächliche Wallpaper-Texturauflösung und den halbaufgelösten Preblur: `lod + log2(texturePixelsPerCssPixel)`. Originale MacShell-Refraktion und Materialbasen bleiben erhalten. Touch-/Pencil-Pointer betätigen den bestehenden endlichen ContourGlow und die begrenzte Rim-Beleuchtung. Kein neuer Shader, kein Capture, keine Freischaltung unsicherer GPUs. CSS-Fallback trennt transparente Tönung und helle Innenkante; Reduced Transparency/Forced Colors überschreiben die Materialien. Das ist keine Snell-Refraktion.

Alle zwölf Controls, bestehende Music-/Notification-/Calendar-Dienste und ehrliche OS-Capabilities bleiben erhalten. Display-Details öffnen dieselbe Stage-Übersicht. Detailanimationen nutzen den vorhandenen Reveal-Owner mit explizitem Cleanup.

## Herkunft und Sicherheit

Neue Funktionen sind eigenständige Air-OS-Implementierungen. **Keine** ungeklärt lizenzierten Origin-Dateien, Blur-My-Shell- oder Dash-to-Dock-Quelltexte übernommen. Die Prüfung und Hashliste aus Port 1 gelten unverändert. Existierende MacShell-MIT-Shader werden reproduzierbar über `scripts/build-glass2-shaders.cjs` adaptiert; ihre Originale und Notices bleiben unangetastet. MacTahoe-/Hyprland-/Font-Lizenzen bleiben erhalten. Previews bestehen aus Geometrien und registrierten Appicons, ohne Inhaltsabbilder.

## Prüfstand

Lokal: 572/572 Node-Regressionen (566 vorhanden + 6 neue), Source-/Syntaxprüfung bestanden. Linux-Electron-Vorher/Nachher, isolierte Materialdiagnose und nativer Windows-R8-Build werden über eigene Featurebranch-Workflows geprüft. Noch keine erfolgreiche neue GUI-/Installerabnahme behauptet.

Der R8-Kanal nutzt die bestehende eingefrorene Electron-44.9.3-Toolchain, Audit, vollständigen Runtime-/ASAR-Bytevergleich, NSIS-x64, Runnerinstallation und die unveränderten R7/R6.1-Abnahmen zusätzlich zu Stage-2-Szenarien. R1–R7 bleiben unangetastet. Kein öffentliches Release, keine Codesignierung.

## Noch offen

Neue CI-Ergebnisse, Bildprüfung/Korrektur, Installer-Hash und iPad-Port werden nach tatsächlicher Ausführung ergänzt. Physische Windows-GPU/Audio/Dialoge, iPad-Hardware und echter Hyprland-Host sind nicht abgenommen. Wallpaper-only ist weiterhin die Grenze des WebGL-Backdrops. MacLock behält seinen separaten sicheren Renderer; kein neuer MacLock-Shaderport in diesem Checkpoint.

## Checkpoint 2: tatsächliche GUI und Korrektur

Produkt 82cd19cd85a341d7ecb0ed38abb250b8c33d74f6: Linux-CI 41221498036 bestand 62 echte Funktionschecks in vier Viewports sowie vier isolierte Materialchecks. CSS-Produktpfad Software-GPU; Diagnose 4 Programme / 5 Texturen; DPR1: 169ms, DPR2: 252ms, DPR3: 267ms letzte Paint-Wallzeit, keine Hardware-FPS. Refraction-on/off derselben Shaderkarte: 51585 geänderte Pixel / 429×152, mittlere absolute RGB-Differenz 17.3545. Unterschiedliche Geometrien früherer Berichte erlauben keinen direkten Stärkevergleich. Context Loss/Restore und Cleanup: 0 Programme/0 Texturen/0 Tiles, pending false. Screenshotvergleich unter `docs/visual/origin2/82cd19cd85a341d7ecb0ed38abb250b8c33d74f6/`.

Bildprüfung zeigte zu wenig Textkontrast des Overlays über weißen Workspaces. Produktkorrektur: separate dunklere Lesefläche nur für textreiche Overlays, kompakte Appzeilen, Zustandsanzeige minimierter Vorschauen und passende deaktivierte Gruppenaktionen. Pointer-Swipe auf der Stage-Rail wechselt Gruppen; vertikales Scrollen bleibt erhalten und Pointercancel verwirft die Geste. Touch-Release beendet Hoverlicht. Testuhren im isolierten GUI-Harness nun deterministisch.

Windows-Lauf 41221498035 erzeugte/installierte R8 und bestand die GUI-Schritte inklusive Stage/F11/R6.1-Grenzen/R7/Shaderdiagnose; das abschließende Outcome-Schreiben schlug wegen fehlendem `stageGui`-Metadatenfeld fehl. Kein insgesamt grüner Build. Feld ergänzt; neuer Lauf erforderlich.

## Architektur und tatsächlich verwendete Komponenten

| Bereich | Laufender Ausführungspfad | Zuständigkeit / Herkunft |
|---|---|---|
| Gruppen / Navigation | `src/core/stage-model.js` → `air-window-system.js` → `air-stage-overview.js` | Eigene reine Modelle; dieselben live `openApps`-IDs, Lifecycle, MRU und vier Workspaces |
| Gruppen-Minimize / Restore | `stageAction` → vorhandene `.minimize` / `openApp` → originale M2-Timeline und Docklease | Keine eigene Minimize-Animation; geschlossene Mitglieder werden nicht gestartet |
| Layout / Persistenz | Bestehendes `configure` / Dwindle / Master / Monocle / Floating; Main-Preferences mit Sessionprüfung | Kein zweiter Geometrievertrag; Stage verändert keine gespeicherten Floating-Geometrien |
| Shader | `build-glass2-shaders.cjs` → `macshell-glass2-shaders.js` → gemeinsames `air-desktop-glass.js` | Vorhandene MIT-MacShell-Originale; neue Texel-/CSS-Abbildung ist Electron-Adaption |
| Licht / Fallback | `glass-geometry.sampleScale/light`; Pointer → existierendes ContourGlow; `air-origin2.css` | Begrenzte Rim-Verstärkung, separates Preblur-/Detail-LOD; ein CSS-Backdropfilter pro Host |
| Controls / System | `air-deep-desktop.js`, `air-island.js`, `airControlMotion` | Bestehende zwölf Controls, echte Adapter; Detail-Reveal und Cleanup ergänzt |
| iPad | Separater Branch / Browser-Preferences / IndexedDB v2 | Selektiver Port; kein Desktopmerge und keine Main-/Preload-Übernahme |

In dieser Phase keine neuen Originalassetdateien importiert. Lizenzlich ungeklärte Origin-, Blur-My-Shell- und Dash-to-Dock-Dateien bleiben **nicht** Bestandteil des Produkts. Existierende fixierte MacShell-, MacTahoe-, Hyprland- und Font-Quellen/Notices sind unverändert. Neue Air-OS-Gruppenlogik ist eigenständig.

## Finale Linux-Abnahme der Produktkorrektur

Produkt-/Buildquelle: `e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5`.
[Linux-Lauf 41222397658](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41222397658): 572/572 Node-Regressionen, 62 reale Electron-Funktionschecks, vier isolierte Materialchecks bestanden. Tests und Bilder liefen unter Linux Electron 44.9.3. Die Vorherbasis ist exakt 8651a1aaa357b52a7c4edfbea7056bf59e40601b; letzte Vergleichsrunde mit identischer synthetischer Testzeit.

| Viewport | Fensterhost / maximierter Finder `(x,y,w,h)` | Max. Kantenabweichung |
|---|---|---|
| 1920×1080 | (0, 24, 1920, 1056) | 0px |
| 1688×896 | (0, 24, 1688, 872) | 0px |
| 1650×930 | (0, 24, 1650, 906) | 0px |
| 390×600 | (0, 24, 390, 576) | 0px |

Menüleiste 24px, Dock-Unterkante exakt am Viewportende, Island oben 0px. Vollbild wird tatsächlich über den vorhandenen Electron-Main-/Preload-Vertrag geprüft, einschließlich Austritt; keine Dockreserve. M1- und M2-Reverse, Resize während pausiertem M2, alle zwölf Controls, Touchcancel, Classic, zwei Profile, Neustart und Logout werden ausgeführt.

### Materialmessung und Grenzen

Normaler Software-GPU-Produktpfad: CSS-Fallback, **0** aktive GL-Programme und **0** Draws. Isolierter Software-Diagnosepfad ist ausdrücklich kein Produkt-/Hardwarepfad.

| DPR | Letzter Paint (Wallzeit) | Programme | Texturen | Geschätzte Texturbytes | Kumulativer 2D-Transfer |
|---|---|---|---|---|---|
| 1 | 106ms | 4 | 5 | 16132779 | 21ms |
| 2 | 263ms | 4 | 5 | 42705792 | 24ms |
| 3 | 275ms | 4 | 5 | 42705792 | 27ms |

Nach gemessener Ruhephase keine zusätzlichen Draws. Context Loss/Restore baut Ressourcen korrekt neu auf; Profil-Cleanup endet mit 0 Programmen/Texturen/Tiles und `pending:false`. Letzte strukturierte Refraction-on/off-Probe: 51377 veränderte Pixel bei 451×145, mittlere absolute RGB-Differenz 17.8028. Das belegt ausführbare sichtbare Shaderwirkung über dem synthetischen eigenen Linienwallpaper, **keine** Pixelgleichheit zum MacShell-Compositor und keinen fairen Stärkevergleich mit anders großen früheren Karten. Kein GPU-FPS-Wert und keine Beschleunigungszusage aus dieser Softwaremessung.

### Echte Vergleichsbilder

- Desktop / Apps: [Vorher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/before/desktop-1650.png) · [Nachher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/desktop-1650.png).
- Kontrollzentrum: [Vorher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/before/control-center-1688.png) · [Nachher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/control-center-1688.png).
- Maximierter Finder: [Vorher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/before/finder-maximized-1920.png) · [Nachher](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/finder-maximized-1920.png).
- [Stage-Gruppenaktionen](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/stage-group-actions.png), [Gruppenübersicht](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/grouped-stages.png), [Fullscreen](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/native-fullscreen.png), [MacLock neutral](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/after/neutral-maclock.png).
- [Shader / DPR2](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/materials/stage-shader-dpr-2.png), [reduzierte Transparenz](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/materials/stage-reduced.png), [strukturierte Rohmessungen](visual/origin2/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/evidence.json).

Die erste Bildrunde zeigte zu helle Textflächen vor weißen Appinhalten. Die zweite Runde korrigiert die Overlay-Lesefläche und Appzeilen im Produktcode; Widget-/Docktransparenz wird dabei nicht pauschal zurückgedreht. Keine retuschierten Aufnahmen.

## Bewusst nicht als fertig ausgegeben

- Keine neuen Live-Thumbnails privater Fenster; die Übersicht zeigt nur echte Icons/Geometrien/Lifecycle. Keine Szenen-/Fremdfenster-Captures.
- Stage-Wechsel blendet eintretende Fenster mit endlicher Opacity ein; keine vollständige GNOME-Actor-/Origin-Animationsengine. M2 und Geometriesprings bleiben maßgeblich.
- Keine neue Fenstergruppendatenbank, keine automatischen Appschließungen, keine Wiederherstellung geschlossener Gruppenmitglieder.
- MacLock nutzt weiter seinen sicheren separaten Renderer. Kein neuer Origin-Private-Mode-/MacLock-Shaderport.
- Physische Windows-GPU/Audio/Pickers, macOS, echter Hyprland-Host und iPad/Safari/Pencil sind nicht abgenommen.
- Öffentliche Website, Cloudsync, main-Merge und Produktionsrelease wurden nicht ausgelöst.

## Git-Checkpoints

- `82cd19cd85a341d7ecb0ed38abb250b8c33d74f6`: ausführbare Gruppenaktionen, Materialkorrektur, 572 Tests und R8-Kanal.
- `767afb2832b70fed701865396468b6ef71abb15f`: erste Linux-Evidenz.
- `e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5`: visuelle Korrektur, Touch-Cleanup, R8-Metadatenfix; finales getestetes Produkt.
- `ce6fc11` (vollständige ID im Gitverlauf): zweite Linux-Evidenz; keine Produktänderung.

## Windows R8 — erfolgreich gebaut und installiert

[Erfolgreicher nativer Windows-Lauf 41222397648](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41222397648).
Produkt-/Buildcommit: `e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5`. Evidenzcommit: `fc0f562984d856f9ef3dc0757b121bf12c51ff46`.

- [Installer-Artefakt inklusive SHA256SUMS, BUILD-INFO und Installationsanleitung](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41222397648/artifacts/13050634087).
- Datei: `Air-OS-Ultimate-R8-1.0.3-dev.2.shae4ab7f8d89ca-Windows-x64.exe` · 122589527 Bytes.
- **Installer-SHA-256:** `c15047bfc7b1ab966881766da5ff071807b0013462db4454124483842c175a89`. Das ist der Hash der EXE im Artefakt, nicht der umschließenden Actions-ZIP.
- Electron 44.9.3, electron-builder 26.18.0, eingefrorener moderner x64-Kanal. Audit, Source/Syntax, 572 Regressionen, vollständiger Runtime-/ASAR-Bytevergleich und PE-x64-Prüfung bestanden.
- NSIS auf Windows-2022-Runner installiert; EXE aus dem installierten Verzeichnis gestartet. Native GUI, 62 Stagechecks, Capability-/Materialpfade, R6.1-Fullscreen-/Bounds, R7-Erfahrung und isolierte Shaderdiagnose: **alle erfolgreich**.
- Zwei synthetische Profile und Prozessneustartpersistenz bestätigt. Native Netzwerk-/Display-Statusdaten sind vom Simulator getrennt; physische Audio-/Picker-/Zustimmungsdialoge sind keine bestätigte manuelle Abnahme.
- Normaler Windows-Produktpfad: Software-GPU → CSS-Fallback / 0 Programme. Isolierte Diagnose zeigt ausführbare Shader mit 0 Idle-Draws; keine Hardwarefreigabe.
- 149 echte installierte Windows-Screenshots. [Stage-Aktionen](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/stage-stage-group-actions.png), [Desktop 1688](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/r7-desktop-1688.png), [maximierter Finder](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/finder-maximized-1920.png), [Fullscreen](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/finder-fullscreen.png), [MacLock](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/r7-maclock-1650.png), [Kontrollzentrum](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/stage-control-center-1650.png), [Spotlight](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/r7-spotlight-1650.png), [gesamte Messdaten](visual/origin2/windows-r8/e4ab7f8d89ca543edd102d81100dc9aeb46dc3d5/evidence.json).
- [Actions-Rohartefakt mit Audits und Protokollen](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41222397648/artifacts/13050374719).

Unsignierter technischer Testinstaller. Kein Produktionsrelease, kein Smart-App-Control-/Defender-Bypass und keine automatische Installation auf privaten Rechnern. Nach Download ZIP entpacken, `Get-FileHash -Algorithm SHA256` auf die EXE anwenden und mit obigem Hash vergleichen. Schutzfunktionen nicht deaktivieren. Eigener Test-PC / synthetische lokale Profile; keine Cloudanmeldung.

[iPad-Portbericht im separaten Branch](https://github.com/quattrologic/Air-Os-Clean/blob/feat/air-os-infinityos-origin-port-2-ipad/docs/AIR_OS_INFINITYOS_ORIGIN_PORT_2_IPAD.md). Die dortige WebKit-Cold-Offline-Abnahme wird separat dokumentiert; Windows-Erfolg ist kein iPad-Nachweis.
