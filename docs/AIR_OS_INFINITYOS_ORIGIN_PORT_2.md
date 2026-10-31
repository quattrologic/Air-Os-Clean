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
