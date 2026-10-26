# Air-OS Tahoe Master – gesicherter Design-/Iconstand

26. Oktober 2026, Europe/Berlin. Nach der ausdrücklichen Budgetkorrektur ausschließlich gemeinsames Designsystem, geprüfte Originalicons und ihre bestehenden Ausführungspfade umgesetzt. **Kein vollständiger Tahoe-/MacShell-Port behauptet.**

Basis: `1f240274d773cd0eee75d515ca6c59e9f626b35f` (enthält den bestätigten UI-REFINE-1-Abschluss `30aef2bc89d212f1c0992547a2263a1841c783c8` sowie die isolierte WinBox-Evaluation). Arbeitsbaum anfangs sauber; Remote-Branches und main-HEAD gelesen. Eigener Branch `feat/air-os-tahoe-master`; keine fremden Branches überschrieben. WinBox bleibt isolierte Evaluation, keine produktive Fenstermigration.

Produktcode-Checkpoint: `578bddac8e9575da07a10149224ad4c47d08e132`. Dieser Bericht und die Aufnahmen folgen als separater Dokumentationscommit.

## Tatsächlich integriert

- **14 verschiedene unveränderte Original-SVG-Dateien**, **13 App-Zuordnungen**. Weitere Zuordnungen `folder`/`pictures` für bestehende Dateisymbole; Ordner und Finder teilen dieselbe Datei. Keine neue App-Registry.
- `src/core/tahoe-icons.js` enthält ausschließlich statische Ressourcenmetadaten. Die bestehende Registry liefert `iconAsset`; ein gemeinsamer sicherer Image-Painter verwendet diese Information. Keine aus Registrydaten erzeugte HTML-Struktur.
- Echte Aufrufpfade: Dock, kompaktes Startmenü, großes Launchpad, Spotlight-App-Ergebnisse, Island-Schnellzugriff und vorhandene App-/Datei-Icons über `paintAppIcons`. Appstarts, Pins, Suche, Fokus und Lifecycle bleiben in ihren bisherigen Controllern.
- **Ein Modern-only Designlayer** `air-tahoe.css`: originale GTK-Laptopwerte für dunkle Header/Sidebar, Text, Button-/Feld-/Menü-/Fensterradien, Farbzustände und kurze Farbtransitionen. Helle/cremeweiße Arbeitsflächen und Air Home bleiben erhalten. Gemeinsame Fenster-/Sidebarselektoren wirken auch auf vorhandene Finder-/Notes-/Reminders-/Music-Flächen; keine Appstruktur oder Appfunktion neu gebaut.
- Classic erhält weiterhin die bisherigen Vektorgrafiken und Styles. Themewechsel malt die betroffenen Icons neu. Air-OS-Hauptlogo, Dock-/Islandform, M1/M2 und Shared-GLASS-3 bleiben maßgeblich. Aktive GLASS-3-Canvasflächen werden vom neuen CSS nicht verdeckt.
- Elektron-/PWA-Asset-Allowlist um diese lokalen Ressourcen und die vollständigen Lizenzen ergänzt. Keine neue Abhängigkeit, CDN-Laufzeitquelle, Installation von GTK oder Ausführung von Upstream-Installationsscripts. Build-/Signierungslogik unverändert.

## Originalquellen, Lizenzen und Anpassungen

| Quelle | Fixierter Stand | Übernahme / Electron-Anpassung |
|---|---|---|
| [MacTahoe GTK](https://github.com/vinceliuice/MacTahoe-gtk-theme/tree/1e45e19f510edb8cde18fa84d6cd5319f60b086b) | `1e45e19f510edb8cde18fa84d6cd5319f60b086b` | MIT; sechs unveränderte Sass-Quelldateien unter `third_party/tahoe/gtk/source`, originales COPYING. GTK-spezifische Zustände nach Browserselektoren portiert, nicht als GTK ausgeführt. |
| [MacTahoe Icons](https://github.com/vinceliuice/MacTahoe-icon-theme/tree/839848b9a8a38a92a6936e30c4abe35cc6f2546d) | `839848b9a8a38a92a6936e30c4abe35cc6f2546d` | Separates GPL-3.0-Ressourcenpaket mit unveränderten SVG-Quellen, vollständigem COPYING/AUTHORS/NOTICE, Originalpfaden und SHA-256 je Datei. Keine Umdeklarierung zu MIT. |
| [MacShell](https://github.com/0-ss/MacShell/tree/1bdb51870b621100fd2709f66c8f8e00ab17b9c4) | `1bdb51870b621100fd2709f66c8f8e00ab17b9c4` | Bestehender MIT-/OFL-Port/GLASS-3 unverändert weiterverwendet; keine weiteren QML-/Shaderkopien oder neuen MacShell-Funktionen in diesem budgetbegrenzten Paket. |

Sass: `_variables.scss`, `_colors.scss`, `_colors-palette.scss`, `_gtk-base.scss`, `gtk/_common-3.0.scss`, `gtk/_common-4.0.scss`. Verwendete Dark-Laptopwerte: Basis `#242424`, Header `#333333`, Text `#dedede`, Sekundärtext `#afafaf`, Originalakzent `#0088ff`; Buttonradius 6, Feldradius 8, Menüradius 12, Fensterradius 24, Popoverradius 14; 100/150 ms, originale Deceleration-/OutQuad-Kurven. Bestehende Headerhöhen, Schriftgrößen und Fensterpositionen bleiben bestehen; M1/M2-Zeiten werden nicht durch GTK-Zeiten ersetzt. Creme `#f8f7f3` ist die bewusst erhaltene Air-OS-Arbeitsfläche, kein behaupteter GTK-Originalwert.

Das Iconpaket bleibt als unabhängiger Ressourcenbestand nachvollziehbar; seine vollständigen bevorzugten SVG-Quellen und GPL-Lizenz werden mit ausgeliefert. Der Anwendungsquelltext erhält dadurch keine vorgetäuschte MIT-Lizenz für diese Bilder. Upstream-GPL gewährt keine fremden Markenrechte: Apple-Logo-, Finder-Gesicht-, Safari-Kompass- und zusätzliche Anbieter-Brand-SVGs wurden nicht übernommen. Ein Monitoricon mit kleinem Apple-Zeichen wurde bei der echten Previewprüfung ausgeschlossen; das eigene Monitorbild bleibt. Generische Ordner-/Internet-/Kameraassets ersetzen die entsprechenden markennahen Motive. Dies ist keine Rechtsgarantie für das vollständige ungeprüfte Upstream-Iconarchiv, das ausdrücklich nicht gebündelt wird.

### Tatsächliche Asset-Zuordnung

| Air-OS-Schlüssel | Unveränderte Originaldatei |
|---|---|
| `finder` | `src/places/scalable/folder.svg` |
| `browser` | `src/categories/32/applications-internet.svg` |
| `notes` | `src/apps/scalable/accessories-text-editor.svg` |
| `reminders` | `src/apps/scalable/evolution-tasks.svg` |
| `calendar` | `src/apps/scalable/calendar.svg` |
| `settings` | `src/apps/scalable/preferences-system.svg` |
| `music` | `src/apps/scalable/gnome-music.svg` |
| `photos` | `src/apps/scalable/accessories-camera.svg` |
| `mail` | `src/apps/scalable/internet-mail.svg` |
| `downloads` | `src/places/scalable/folder-download.svg` |
| `trash` | `src/places/scalable/user-trash.svg` |
| `calculator` | `src/apps/scalable/calc.svg` |
| `airwrite` | `src/apps/scalable/text-editor.svg` |
| `folder` | `src/places/scalable/folder.svg` |
| `pictures` | `src/places/scalable/folder-images.svg` |

Die übrigen Appicons behalten ihre bisherigen Air-OS-Grafiken. Kalendericon zeigt das unveränderte statische Upstreammotiv „Tue 1“ und wird nicht als aktuelle Tagesanzeige ausgegeben. Browser nutzt das generische Internet-/Wolkenmotiv, Finder den generischen Ordner. Keine Pixelgleichheit oder vollständige Übernahme aller System-/Anbietericons behauptet.

## Ausgeführte Prüfung

- **396/396 Node-Tests bestanden**: alle 390 Basistests erhalten und sechs gezielte Tahoe-Regressionen für Registry-/Quellen-/Hash-/Lizenz-/Sicherheits-/Modern-/Classic-/Paketverträge.
- `node scripts/windows-test-build.cjs validate`: **183 Runtime-Dateien**, einschließlich JavaScript-Syntaxprüfung.
- `node scripts/build-pwa.cjs`: **172 erlaubte statische Assets**, lokale Icons und Lizenzquellen enthalten. Keine Veröffentlichung oder Cloudanmeldung, keine neue native Safari-Abnahme.
- Echter sandboxed **Linux Electron 44**, x64, Xvfb: Vorher/Nachher bei 1920×1080, 1650×930 und 390×600. Die schmale Ansicht verwendet Renderer-Metriken; kein behaupteter physischer iPad-/Windows-Screen.
- Echte Maus-/Tastatur-Appstarts für Finder, Einstellungen, Notes und Reminders; Startmenü, Spotlight und Kontrollzentrum aufgenommen. Iconbilder im Dock, Startmenü, Spotlight und großen Launchpad erfolgreich geladen; dieselbe Notes-SVG-URL gemessen. Helle/dunkle Originaliconvorschauen durch echten Chromium-Renderer erzeugt.
- Zusätzlicher vollständiger Bestands-Electron-Regressionslauf: Notes speichern/Fehler/Retry/Home-Liveupdate, zwei Profile ohne Vermischung, Logout/Login, Prozessneustart/Persistenz, Classic/Modern, M1-Schnellwechsel, M2-Minimieren/Umkehren/Schließen, Reduced Motion und ohne WebGL1/2. [Maschinenbericht](visual/tahoe-regression/r1-gui-report.json).
- Regulärer Software-GPU-/CSS-Glasfallback. **Keine Hardware-GPU-, native Windows-/macOS-, 60fps- oder Safari-/iPadOS-Abnahme.** Context-Loss-/Reduced-Transparency-Regressionen der gemeinsamen Engine bleiben in der vollständigen Testsuite; kein neuer Hardware-Stresstest.
- PR-/CI-Abfrage hier HTTP403; kein neuer CI-Erfolg behauptet. main, PRs, Installer, Auth-/Main-/Preload-/Cloud-/PWA-Logik unverändert. Keine privaten Daten oder Zugangsdaten verwendet.

### Unveränderte Shellgeometrien (CSS-Pixel, vor = nach)

| Renderer | Dock | Geschlossene Island |
|---|---|---|
| 1920×1080 | 325×62, bottom 1080 | 220×40, top 0 |
| 1650×930 | 325×62, bottom 930 | 189,078125×36, top 0 |
| 390×600 | 325×62, bottom 600 | 144×36, top 0 |

Positionen sind exakt zentriert; gerade Dockbasis und vorhandene konkave Anschlüsse wurden nicht neu konstruiert. Der Dateischlüssel der vorhandenen Profileinstellungen bleibt unverändert.

## Echte Bildvergleiche

Gleiches Wolkenwallpaper, synthetische öffentliche Testprofile/-notiz/-erinnerung und deterministische Testzeit; keine persönlichen Inhalte. Die UI wird nicht nachgezeichnet. Die Original-Upstreamdarstellung wurde nicht unter GTK/QML ausgeführt; vergleichbare Upstreamreferenzen sind [GTK Tahoe](https://github.com/vinceliuice/MacTahoe-gtk-theme/blob/1e45e19f510edb8cde18fa84d6cd5319f60b086b/Tahoe.png) und [Iconpreview](https://github.com/vinceliuice/MacTahoe-icon-theme/blob/839848b9a8a38a92a6936e30c4abe35cc6f2546d/preview.png). Keine vollständigen fremden Screenshots/Wallpaper übernommen.

| Größe / Oberfläche | Vorher | Nachher |
|---|---|---|
| 1920 · Desktop/Widgets | ![Vorher](visual/tahoe-before/desktop-1920.png) | ![Nachher](visual/tahoe-after/desktop-1920.png) |
| 1920 · Dock | ![Vorher](visual/tahoe-before/dock-1920.png) | ![Nachher](visual/tahoe-after/dock-1920.png) |
| 1920 · Startmenü | ![Vorher](visual/tahoe-before/launchpad-1920.png) | ![Nachher](visual/tahoe-after/launchpad-1920.png) |
| 1920 · Spotlight | ![Vorher](visual/tahoe-before/spotlight-1920.png) | ![Nachher](visual/tahoe-after/spotlight-1920.png) |
| 1920 · Finder | ![Vorher](visual/tahoe-before/finder-1920.png) | ![Nachher](visual/tahoe-after/finder-1920.png) |
| 1920 · Einstellungen | ![Vorher](visual/tahoe-before/settings-1920.png) | ![Nachher](visual/tahoe-after/settings-1920.png) |
| 1920 · Notes | ![Vorher](visual/tahoe-before/notes-1920.png) | ![Nachher](visual/tahoe-after/notes-1920.png) |
| 1920 · Reminders | ![Vorher](visual/tahoe-before/reminders-1920.png) | ![Nachher](visual/tahoe-after/reminders-1920.png) |
| 1920 · Kontrollzentrum | ![Vorher](visual/tahoe-before/control-1920.png) | ![Nachher](visual/tahoe-after/control-1920.png) |
| 1650 · Desktop/Widgets | ![Vorher](visual/tahoe-before/desktop-1650.png) | ![Nachher](visual/tahoe-after/desktop-1650.png) |
| 1650 · Dock | ![Vorher](visual/tahoe-before/dock-1650.png) | ![Nachher](visual/tahoe-after/dock-1650.png) |
| 1650 · Startmenü | ![Vorher](visual/tahoe-before/launchpad-1650.png) | ![Nachher](visual/tahoe-after/launchpad-1650.png) |
| 1650 · Spotlight | ![Vorher](visual/tahoe-before/spotlight-1650.png) | ![Nachher](visual/tahoe-after/spotlight-1650.png) |
| 1650 · Finder | ![Vorher](visual/tahoe-before/finder-1650.png) | ![Nachher](visual/tahoe-after/finder-1650.png) |
| 1650 · Einstellungen | ![Vorher](visual/tahoe-before/settings-1650.png) | ![Nachher](visual/tahoe-after/settings-1650.png) |
| 1650 · Notes | ![Vorher](visual/tahoe-before/notes-1650.png) | ![Nachher](visual/tahoe-after/notes-1650.png) |
| 1650 · Reminders | ![Vorher](visual/tahoe-before/reminders-1650.png) | ![Nachher](visual/tahoe-after/reminders-1650.png) |
| 1650 · Kontrollzentrum | ![Vorher](visual/tahoe-before/control-1650.png) | ![Nachher](visual/tahoe-after/control-1650.png) |
| 390 · Desktop/Widgets | ![Vorher](visual/tahoe-before/desktop-390.png) | ![Nachher](visual/tahoe-after/desktop-390.png) |
| 390 · Dock | ![Vorher](visual/tahoe-before/dock-390.png) | ![Nachher](visual/tahoe-after/dock-390.png) |
| 390 · Startmenü | ![Vorher](visual/tahoe-before/launchpad-390.png) | ![Nachher](visual/tahoe-after/launchpad-390.png) |
| 390 · Spotlight | ![Vorher](visual/tahoe-before/spotlight-390.png) | ![Nachher](visual/tahoe-after/spotlight-390.png) |
| 390 · Finder | ![Vorher](visual/tahoe-before/finder-390.png) | ![Nachher](visual/tahoe-after/finder-390.png) |
| 390 · Einstellungen | ![Vorher](visual/tahoe-before/settings-390.png) | ![Nachher](visual/tahoe-after/settings-390.png) |
| 390 · Notes | ![Vorher](visual/tahoe-before/notes-390.png) | ![Nachher](visual/tahoe-after/notes-390.png) |
| 390 · Reminders | ![Vorher](visual/tahoe-before/reminders-390.png) | ![Nachher](visual/tahoe-after/reminders-390.png) |
| 390 · Kontrollzentrum | ![Vorher](visual/tahoe-before/control-390.png) | ![Nachher](visual/tahoe-after/control-390.png) |

[Großes Launchpad](visual/tahoe-extra/large-launchpad.png) · [Icons auf Dunkel](visual/tahoe-extra/icons-dark.png) · [Icons auf Hell](visual/tahoe-extra/icons-light.png) · [Classic](visual/tahoe-extra/classic-notes.png) · [Unveränderter Lockscreen vorher](visual/tahoe-before/lock-1920.png) / [nachher](visual/tahoe-after/lock-1920.png).

## Bewusst offen nach Budgetkorrektur

Keine zusätzlichen MacShell-Funktionen, Widgets, App-Umbauten oder Lockscreen-Medien umgesetzt. Die vorhandene Funktionsmatrix bleibt fachlich unverändert. Dieses Paket liefert das gemeinsame Design und das begrenzte, geprüfte Iconpaket; separate Appstruktur-/Widget-/MacLock-Arbeiten sowie native Zielplattformabnahmen folgen ausschließlich auf neuen Auftrag. Auch WinBox wird nicht zur aktiven Fensterverwaltung. Keine neue Roadmap, keine verdeckten Hintergrundaufgaben. Gesicherten Stand committen/pushen, danach STOP.
