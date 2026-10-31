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
