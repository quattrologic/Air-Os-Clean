# Air-OS Tahoe 7 – ausgeführter Source-Port

27. Oktober 2026. Basis **87cb80eaedc93793423420109f87e9bf1aca872a**, Branch **feat/air-os-tahoe-7-full-shell**. Keine Änderungen an main, bestehenden PRs oder veröffentlichten Releases. Kein Cloudlogin. Produktcheckpoint **cf004a2a905fd2c75fe5a6ae2e0b3911a529bdea**; R3-Endabnahme/Launcher **a9971ccce381824f75dcd85383783a2b5b894457**. Der Dokumentationsabschluss-SHA wird im Abschlussbericht genannt.

## Was tatsächlich läuft

- Das bestehende Dock verwendet jetzt **gemeinsam berechnete Iconzellen**, Nachbarverschiebung, dynamische Breite, originale52px-Basis/1.7-Magnifikation und99%-Artwork. Die bisherige440px-Auswahlbegrenzung gilt im neuen Präsentationspfad nicht mehr. Alle registrierten gespeicherten Pins erreichen denselben Dockcontroller; schmale Ansichten erhalten echte Vor-/Zurück-Seiten. Pinreihenfolge, Registry und Lifecycle bleiben allein maßgeblich.
- M2 liest das **sichtbare Iconrechteck**. Eine freigegebene Präsentationslease hält das Dock während derselben bestehenden WAAPI-Zeitachse fest, auch bei Umkehr; Cleanup löst sie einmalig. Offpage-Ziele verwenden die sichtbare Dockhülle. Keine zweite Fensterverwaltung und kein veränderter410ms-M2-Verlauf.
- Die bestehende Menüliste besitzt ein echtes, aus geöffneten Fenstern abgeleitetes Untermenü mit Auswahl/Fokus, Pfeiltasten und Escape. Acht generische WGlyph-Zeichenpfade ergänzen die drei vorhandenen originalen Statusglyphen. Statusgruppe: tatsächlicher **Air-OS-interner** Fokus, vorhandener Musiktransport, Datum/Kalender, Spotlight, CC und Mitteilungen. Kein erfundener OS-/Akku-/WLAN-Status, keine zusätzliche Uhr.
- **MacShell Desktop** ist eine sichtbare Aktion im Air-OS-Menü und der vorhandenen Widgetgalerie. Erst nach gesonderter Bestätigung ersetzt sie die Widgetanordnung durch Uhrzifferblatt, Kalender, Notes, Reminders und Player. Bestehende Profile werden nicht automatisch geändert; Pins, Texte und Daten bleiben erhalten. Schmale Ansichten verwenden die vorhandene Widget-Seitennavigation.
- Der bestehende Player rendert die **Original-RU-Innenkomposition**, nicht nur Außenmaße: Artwork/Textachsen, Progress- und Transportpositionen, Größenvarianten sowie originale PlayerGlyph-Canvas-Pfade und21/24- bzw.18/21-RU-Textgrößen. Die kleine Variante besitzt den originalen46-RU-Playbutton rechts oben; der zusätzliche Air-OS-Widgetheader entfällt dort zugunsten des quadratischen Originalinnenlayouts. Titel, Fortschritt und Aktionen stammen weiterhin aus derselben echten Audioengine. Ohne echtes Cover erscheint ausdrücklich eine neutrale Notensymbolfläche.
- Eine gemeinsame Komponentenebene über nativen Eingaben übernimmt GlassSlider-Geometrie und Geschwindigkeitsverformung, getrennte Switchkanten und Segmentmarkerkanten. Tatsächliche Werte bzw. bestätigte `aria-pressed`-Zustände gehören weiterhin den bestehenden Controllern. Normale Aufgabencheckboxen bleiben Checkboxen.
- **54 eindeutige originale GPL-SVGs** insgesamt, davon40 neu; zusätzliche7 Browserexporte ergänzen ausschließlich den fehlenden XML-Namensraum. Zentrales bestehendes Mapping für Apps/Toolbar-/Menü-/Kalenderaktionen und eine echte Symbolübersicht in der Widgetgalerie. Die14 bisherigen Originalassets bleiben erhalten. Keine ungeprüften Anbieterlogos importiert.

## Source-Port-Matrix

Alle folgenden MacShell-Pfade beziehen sich auf [0-ss/MacShell@1bdb51870b621100fd2709f66c8f8e00ab17b9c4](https://github.com/0-ss/MacShell/tree/1bdb51870b621100fd2709f66c8f8e00ab17b9c4), MIT, Copyright2026 Rickky. [Originaldateien, SHA-256 und Grenzen](../third_party/tahoe7/provenance.json), [LICENSE](../third_party/tahoe7/LICENSE), [NOTICE](../third_party/tahoe7/NOTICE). Schon vorhandene MacBar-/Clock-/Calendar-/Materialports bleiben in ihren bisherigen Provenienzen.

| Originalpfad | Übernommener ausführbarer Anteil | Electron-Ziel und tatsächlicher Aufruf | Anpassung / ausdrücklich nicht portiert |
|---|---|---|---|
| `MacShell/MacDock.qml` | `iconSize52`, `spacing6`, `hPad10`, `top8/bottom9`, `totalW0`, `c0`, `refLeft`, Kosinusfenster mit Radius2.6, Peak1.7,99%-Artwork; Zellbreiten verschieben Nachbarn | `src/core/macshell-shell7.js` → `air-macshell-dock.js` am **bestehenden** Dock; vorhandene Appbuttons/Pinquelle | Air-OS-Konkavsilhouette bleibt; responsive Seiten ergänzen fehlenden Platz. Separator nach Logo statt MacShell-App/Task-Gruppen. Original140ms-OutCubic-Strength wird zur140ms-Response des Original-Spring-Integrators adaptiert. Hyprlandfenster, native Livevorschauen/Drag-Tear/Auto-Hide nicht neu portiert. |
| `MacShell/Spring.qml` | Vollständiger Kraftintegrator: `w=2π/response`, `k`, Dämpfung,50ms-Clamp,4ms-Substeps, Epsilon, Position und Geschwindigkeit bei Retarget erhalten | `macshell-shell7.step` → begrenzte Dock-RAF-Kette | QML FrameAnimation durch requestAnimationFrame ersetzt; kein Idle-Loop. |
| `MacShell/GlassSlider.qml` | Pos/14px-Inset,4px-Track,21×14→27×17-Knopf,45/55-Geschwindigkeitsmischung, begrenztes Jig/Rotation/Squash,70ms-Rückkehr | `air-macshell-controls.js` / `air-macshell-components.css` → bestehende Range-Inputs in Einstellungen, CC und Medienwidget | Native Input-/Tastatur-/Valueownership. Qt-Knob-Linsenshader und isolierter ShaderEffectSource nicht portiert; GLASS-3-Hostmaterial bleibt. |
| `MacShell/GlassSwitch.qml` |46×21,27×17-Thumb, unabhängige Vorder-/Hinterkante,300/440ms OutBack mit1.7/.9, Zwischenfarben und Rücknahme zum tatsächlichen Ownerzustand | Gemeinsamer Adapter → bestehende Settings-Switches | Native Klick-/Leertastenbedienung; keine behauptete vollständige Drag/Flick-Geste. Bestätigtes Speichern bleibt außerhalb der Präsentationsschicht. |
| `MacShell/GlassSegmented.qml` | Getrennte linke/rechte Markerkanten und originale OutBack-Parameter | Adapter liest tatsächliche `aria-pressed`-Geometrie der vorhandenen Island-/CC-Seitenbuttons | Segmenttexte und Seitencontroller bleiben Air-OS; keine konkurrierenden Befehle/Stores. |
| `MacShell/PlayerWidget.qml` | Referenzeinheiten202/446; artX/Y/S, textX/titleCY/subCY, barCY/timeCY/ctlCY und Größenkomposition,21/24-/18/21-RU-Schrift, kleiner46-RU-Playbutton | `macshell-shell7.player` → `air-widget-views.js` im vorhandenen Musikwidget | Kein MPRIS, Provider/Lyrics, vollständiger PlayerArt-/PlayerBtn-Shaderport. Vorhandenes echtes NowPlaying/Seeking/Volume bleibt Owner. |
| `MacShell/PlayerGlyph.qml` | Originale `onPaint`-Canvas-Zeichenbefehle; verwendete Play/Pause/Prev/Next-Branches | `src/core/player-glyphs.js` → reale Widgettransportbuttons | Qt-reset/Contextbindung an HTML Canvas angepasst. Andere im Quellmodul vorhandene Glyphen bedeuten keine zusätzlichen Funktionen. |
| `MacShell/WGlyph.qml` | Acht generische Pfadzweige: moon/speaker/folder/layers/clipboard/lock/close/gear | `src/core/macshell-glyphs7.js` → Status und echte Menüaktionen | HTML-Canvas-Skalierung/Ink; übrige Anbieter-/Markenpfade bewusst ausgeschlossen. |
| `MacShell/MacBar.qml`, vorhandene Glyph-/Menüports | Bestehende Menüordnung/Fokus-/Appaktionen und Statusausrichtung weiterverwendet | `air-tahoe6-shell.js` erweitert um Fensteruntermenü; `air-macshell-status.js` bindet vorhandene Fokus-/Musik-/Kalenderdienste | Untermenü ist eine Electron-Adaption über dieselben MRU-Fenster; nicht als vollständiger MacBar-/WindowBar-/TLGlyph-Port ausgewiesen. |
| `src/sass/_variables.scss`, `_colors.scss`, `gtk/_common-3.0.scss`, `_common-4.0.scss` in [MacTahoe GTK@1e45e19](https://github.com/vinceliuice/MacTahoe-gtk-theme/tree/1e45e19f510edb8cde18fa84d6cd5319f60b086b) | Bestehende MIT-Tokens/100ms-Zustandswechsel, native Disabled/Focus/Pressed-/Scrollbar-Komponenten vertieft; überholte T6-Dockregeln konsolidiert | `air-tahoe.css` plus eine gemeinsame `air-macshell-components.css`-Ebene für vorhandene Appflächen | GTK-Widgetruntime nicht übernommen. Dark Header/Sidebar + Light Workspace und Classic bleiben erhalten. Kein vollständiger Sass-/Dialog-/WindowBar-Port behauptet. |
| [MacTahoe Icons@839848b](https://github.com/vinceliuice/MacTahoe-icon-theme/tree/839848b9a8a38a92a6936e30c4abe35cc6f2546d), `src/{apps,places,actions,status,devices,categories}/…` |54 eindeutige Original-SVGs; neue Actions, Places, Devices, Status,7 Symbolic | `src/core/tahoe-icons.js` → vorhandene Registry/Iconpainter und `air-tahoe7-icons.js`; vollständige Liste/Hashes in [Provenienz](../third_party/tahoe/provenance.json) | GPL-3.0 separat mit COPYING/AUTHORS/NOTICE und unveränderten Quellen;7 XML-only-Exporte über `scripts/export-tahoe-symbolic.cjs`. Kein Ersatz des eigenen Air-OS-Logos. |

`GlassSlab`, `Liquid*`, `CornerBorder`, `EdgeBlur`, `FeatherBlur`, `Dissolve`, `SPopUp`, `PlayerArt/Btn`, `ExtraWidgets/CardWidget`, weitere Weather-/Image-/Menübestandteile wurden **nicht als vollständige neue Komponenten** portiert. Vorhandene GLASS-3/MacLock-/Widgetimplementierungen werden weiterverwendet. Keine neue Qt-/Quickshell-/PAM-Laufzeit oder Bibliothek. Die Portmatrix nennt bewusst Teilumfänge und reale Callsites statt kopierte Dateien als fertige Features zu zählen.

## Tests und visuelle Abnahme

**463/463 Tests,0Fehler/Skips**: alle bisherigen448 bleiben erhalten. Neue Regressionen für vollständige Dockzellen/Magnifikation/Nachbarn/Budget, Originalspring-Unterbrechung, Preset-Schema/Datenneutralität, Player-RU, Quellen/GPL-/Browserexporthashes, Glyphausführung, native Eingabeownership, Segmentkanten, M2-Lease sowie R3-Quelle/Workflow/Paketabdeckung. Die alte T6-RAF-Ownershipprüfung verweist jetzt auf den einzigen neuen Dock-Präsentationsowner und verbietet den alten parallelen Pointerhandler.

`node scripts/windows-test-build.cjs validate`:279 Laufzeitressourcen; `node scripts/build-pwa.cjs`:267 allowlisted Assets. Keine PWA-Veröffentlichung oder Cloudverbindung. Endgültige Laufzeitanzahl wird vom R3-ASAR-Verifier erneut ermittelt.

Echte sandboxed **Linux-x64 Electron44.9.3**-Vorher-/Nachherläufe:1920×1080,1650×930,390×600. Synthetische isolierte Profile, native CDP-Eingabe, tatsächliches Notes-Speichern durch Menü mit Main-Store-Vergleich, zwei Profile, Login/Fehler/Logout/Neustart, Apps, Music/Widget/CC, MRU/Snap, Classic/Modern, M1/M2 vorwärts/rückwärts, Reduced Motion sowie echter WebGL1+2-Ausfall.390px ist ein schmaler CDP-Renderer bei nativer Mindestfensterbreite760, kein physisches390px-/Touch-/iPad-Gerät.

Zusätzliche Szenarien: ausdrückliche Presetbestätigung,13 Dockbuttons aus12 gespeicherten Pins, gekoppelte Magnifikation, Seitennavigation und originale Symboldecodierung; eigenes90s-WAV statt fremder Medien. Die Dockgrößenpräferenz wurde zusätzlich im echten Renderer auf36 verkleinert und bestätigt zurückgesetzt. Die tatsächlichen Maße und Ergebnisse stehen in [Nachher-JSON](visual/tahoe7-after/r1-gui-report.json), [Vorher-JSON](visual/tahoe7-before/r1-gui-report.json). Historische `r1-`/`t6-`-Dateipräfixe stammen vom wiederverwendeten Launcher; sie enthalten den hier geprüften aktuellen Quellstand.

**GLASS-Diagnose separat:** [Report](visual/tahoe7-diagnostic/report.json), SwiftShader, drei bestehende Shaderprogramme, Wallpaper-only,0zusätzlicheDraws/700msIdle, ContextLoss→0Programme, Restore→3, Reduced Motion/Transparency/Forced Colors und Logout. Regulärer Softwarepfad bleibt CSS. Das ist keine Hardware-GPU-Abnahme und kein60fps-Nachweis. Keine neue Engine oder Live-Fenstertexturaufnahme. Der ursprüngliche Legacy-Root-Check lehnt Electron32 erwartungsgemäß als modernen Kanal ab; derselbe Modern-Guard besteht mit der isolierten eingefrorenen44.9.3-Toolchain. Der moderne Audit ist0; bekannte Legacy-Abhängigkeiten werden dadurch nicht freigegeben.

### Vergleichsgrenzen und Korrekturen

Der originale Quickshell-Desktop war hier nicht ausführbar. Der README-Screenshot-Host `github.com/user-attachments/assets/600f75bc-b4d1-442d-bec5-41ee7dfa5023` wurde vom Netzwerkproxy mit403 blockiert. [Original-README](https://github.com/0-ss/MacShell/blob/1bdb51870b621100fd2709f66c8f8e00ab17b9c4/README.md) und fixierter Code dienen als Quellenreferenz; **kein gleich aufgelöster Original-/Air-OS-Pixelvergleich**, keine Pixelgleichheit. Die echten Air-OS-Vorher-/Nachherbilder wurden auf Proportionen/Komposition geprüft und iteriert. Dabei wurden die alte Pin-Auswahlbegrenzung, Windows-stabile Originalbytes, fehlender SVG-XML-Namensraum, ein Menü-Glyph-Referenzfehler, CSS-Priorität/Dockbreite und Testvorbereitung über den bestätigten Controller korrigiert. Fehlgeschlagene Versuche werden nicht als bestandene Abnahmen gezählt.

### Dock und Island

Vorher325×62, jetzt mit6 Standardbuttons auf großen Flächen377×69; untere Basis stets exakt Viewporthöhe, gleiche konkave Formmaske. Die bisherige325px-Bindung wurde im Auftrag explizit aufgehoben. Iconzellen52, Artwork51.48; die bestehende36–64-Dockgrößenpräferenz bleibt wirksam (Legacy48 → Original52, additive4px-Anpassung, keine Schemaänderung); beim Hover wachsen Zellen und Nachbarn zusammen. Responsive Maße/Pinseiten siehe Messdaten. Island unverändert:1920 →220×40;1650 →189.078125×36;390 →144×36, jeweils y0. CSS-/Geometrievergleich vor/nach Classic-/M1/M2-Roundtrip ist Teil des GUI-Laufs.


| Breite | Standarddock | 13 Buttons normal | 13 Buttons Hover | größte Iconfläche Hover | Dockseiten |
|---|---|---|---|---|---|
| 1920 | 377.000×69.000 | 783.000×69.000 | 877.859 | 87.516 | 1 |
| 1650 | 377.000×69.000 | 783.000×69.000 | 877.859 | 87.516 | 1 |
| 390 | 292.000×54.828 | 315.375×42.188 | 361.344 | 42.406 | 2 |

## Windows R3

Eigener Workflow [build-windows-r3.yml](../.github/workflows/build-windows-r3.yml), neue R3-Komposition über **unveränderte** R1/R2-Packagingverifier. Frozen Electron44.9.3/builder26.18.0, native Windows2022-x64, mandatory Audit, gesamter Testgate, alle Runtimebytes/ASAR/PE-x64/Installerhash, vollständige installierte Payloadbytes, echter installierter Login/Desktop/Apps/Presets/Pages/Restart/Fallback-GUI-Lauf. Keine automatische Veröffentlichung. Installer/BUILD-INFO/SHA256/Anleitung und separate Windows-PNGs/Logs/Audit als14-Tage-Artefakte.

**Zwischenstand: [nativer R3-Lauf40556537389](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40556537389), Audit/Source/Tests/NSIS/ASAR/Installation bestanden; abschließender installierter GUI-Lauf noch in Prüfung.** Ungesignierter technischer Testbuild; Smart App Control kann blockieren. Keine Empfehlung zum Abschalten von Defender/SAC, keine Produktionsfreigabe. Native Dateipicker/Consentdialoge, Audioausgabe, physische GPU/Windows-Hardware, macOS und Safari/iPadOS bleiben offen. CDP-Auswahl einer eigenen Testdatei ist kein manueller Picker-/Zustimmungsnachweis.

## Bewusst offen

Vollständige übrige MacShell-Kontrollmaterialien/Knoblinsen, Switch-Drag/Flick, zusätzliche Widgetinnenlayouts, vollständige Notes-/Reminder-Originalwidgets, Wetterquelle, native Systemadapter, echte Livevorschauen, weitere Dock-Launch/Drag-/Bouncepfade sowie vollständige MacBar-/WindowBar-Untermenüs. Keine Behauptung, dass die100-Punkte-Matrix abgeschlossen sei. Bestehende Authentifizierung, Main-/Preload-Grenzen, MacLock, Profile, Daten, Notes-Sperrschutz, Cloud und PWA bleiben maßgeblich. R3-Installerfreigabe ist getrennt von Produkt-/Hardwarefreigabe.

## Bilder

Die folgende Tabelle verweist auf echte Electron-Aufnahmen; Detailbilder sind ausschließlich Ausschnitte dieser PNGs. Synthetische öffentliche Testdaten, normales Air-OS-Wolkenwallpaper. Kein Neuzeichnen von Screenshots.

| Ansicht | Vorher: Tahoe6 | Nachher: Tahoe7 |
|---|---|---|
| Desktop · 1920 | ![before Desktop 1920](visual/tahoe7-before/t6-desktop-1920.png) | ![after Desktop 1920](visual/tahoe7-after/t6-desktop-1920.png) |
| Gleich angeordnete Widgets / Preset · 1920 | ![before Gleich angeordnete Widgets / Preset 1920](visual/tahoe7-before/t7-preset-1920.png) | ![after Gleich angeordnete Widgets / Preset 1920](visual/tahoe7-after/t7-preset-1920.png) |
| Dock mit12 Pins · 1920 | ![before Dock mit12 Pins 1920](visual/tahoe7-comparison/before-dock-1920.png) | ![after Dock mit12 Pins 1920](visual/tahoe7-comparison/after-dock-1920.png) |
| Gekoppelte Magnifikation · 1920 | ![before Gekoppelte Magnifikation 1920](visual/tahoe7-comparison/before-hover-1920.png) | ![after Gekoppelte Magnifikation 1920](visual/tahoe7-comparison/after-hover-1920.png) |
| Menü-/Statusleiste · 1920 | ![before Menü-/Statusleiste 1920](visual/tahoe7-comparison/before-bar-1920.png) | ![after Menü-/Statusleiste 1920](visual/tahoe7-comparison/after-bar-1920.png) |
| Widgetinnenlayout · 1920 | ![before Widgetinnenlayout 1920](visual/tahoe7-comparison/before-widgets-1920.png) | ![after Widgetinnenlayout 1920](visual/tahoe7-comparison/after-widgets-1920.png) |
| Kontrollzentrum · 1920 | ![before Kontrollzentrum 1920](visual/tahoe7-before/t6-control-1920.png) | ![after Kontrollzentrum 1920](visual/tahoe7-after/t6-control-1920.png) |
| Spotlight · 1920 | ![before Spotlight 1920](visual/tahoe7-before/deep-spotlight-1920.png) | ![after Spotlight 1920](visual/tahoe7-after/deep-spotlight-1920.png) |
| Finder und Notes · 1920 | ![before Finder und Notes 1920](visual/tahoe7-before/t6-apps-1920.png) | ![after Finder und Notes 1920](visual/tahoe7-after/t6-apps-1920.png) |
| Launchpad · 1920 | ![before Launchpad 1920](visual/tahoe7-before/t7-launchpad-1920.png) | ![after Launchpad 1920](visual/tahoe7-after/t7-launchpad-1920.png) |
| Mitteilungen · 1920 | ![before Mitteilungen 1920](visual/tahoe7-before/deep-notifications-1920.png) | ![after Mitteilungen 1920](visual/tahoe7-after/deep-notifications-1920.png) |
| Desktop · 1650 | ![before Desktop 1650](visual/tahoe7-before/t6-desktop-1650.png) | ![after Desktop 1650](visual/tahoe7-after/t6-desktop-1650.png) |
| Gleich angeordnete Widgets / Preset · 1650 | ![before Gleich angeordnete Widgets / Preset 1650](visual/tahoe7-before/t7-preset-1650.png) | ![after Gleich angeordnete Widgets / Preset 1650](visual/tahoe7-after/t7-preset-1650.png) |
| Dock mit12 Pins · 1650 | ![before Dock mit12 Pins 1650](visual/tahoe7-comparison/before-dock-1650.png) | ![after Dock mit12 Pins 1650](visual/tahoe7-comparison/after-dock-1650.png) |
| Gekoppelte Magnifikation · 1650 | ![before Gekoppelte Magnifikation 1650](visual/tahoe7-comparison/before-hover-1650.png) | ![after Gekoppelte Magnifikation 1650](visual/tahoe7-comparison/after-hover-1650.png) |
| Menü-/Statusleiste · 1650 | ![before Menü-/Statusleiste 1650](visual/tahoe7-comparison/before-bar-1650.png) | ![after Menü-/Statusleiste 1650](visual/tahoe7-comparison/after-bar-1650.png) |
| Widgetinnenlayout · 1650 | ![before Widgetinnenlayout 1650](visual/tahoe7-comparison/before-widgets-1650.png) | ![after Widgetinnenlayout 1650](visual/tahoe7-comparison/after-widgets-1650.png) |
| Kontrollzentrum · 1650 | ![before Kontrollzentrum 1650](visual/tahoe7-before/t6-control-1650.png) | ![after Kontrollzentrum 1650](visual/tahoe7-after/t6-control-1650.png) |
| Spotlight · 1650 | ![before Spotlight 1650](visual/tahoe7-before/deep-spotlight-1650.png) | ![after Spotlight 1650](visual/tahoe7-after/deep-spotlight-1650.png) |
| Finder und Notes · 1650 | ![before Finder und Notes 1650](visual/tahoe7-before/t6-apps-1650.png) | ![after Finder und Notes 1650](visual/tahoe7-after/t6-apps-1650.png) |
| Launchpad · 1650 | ![before Launchpad 1650](visual/tahoe7-before/t7-launchpad-1650.png) | ![after Launchpad 1650](visual/tahoe7-after/t7-launchpad-1650.png) |
| Mitteilungen · 1650 | ![before Mitteilungen 1650](visual/tahoe7-before/deep-notifications-1650.png) | ![after Mitteilungen 1650](visual/tahoe7-after/deep-notifications-1650.png) |
| Desktop · 390 | ![before Desktop 390](visual/tahoe7-before/t6-desktop-390.png) | ![after Desktop 390](visual/tahoe7-after/t6-desktop-390.png) |
| Gleich angeordnete Widgets / Preset · 390 | ![before Gleich angeordnete Widgets / Preset 390](visual/tahoe7-before/t7-preset-390.png) | ![after Gleich angeordnete Widgets / Preset 390](visual/tahoe7-after/t7-preset-390.png) |
| Dock mit12 Pins · 390 | ![before Dock mit12 Pins 390](visual/tahoe7-comparison/before-dock-390.png) | ![after Dock mit12 Pins 390](visual/tahoe7-comparison/after-dock-390.png) |
| Gekoppelte Magnifikation · 390 | ![before Gekoppelte Magnifikation 390](visual/tahoe7-comparison/before-hover-390.png) | ![after Gekoppelte Magnifikation 390](visual/tahoe7-comparison/after-hover-390.png) |
| Menü-/Statusleiste · 390 | ![before Menü-/Statusleiste 390](visual/tahoe7-comparison/before-bar-390.png) | ![after Menü-/Statusleiste 390](visual/tahoe7-comparison/after-bar-390.png) |
| Widgetinnenlayout · 390 | ![before Widgetinnenlayout 390](visual/tahoe7-comparison/before-widgets-390.png) | ![after Widgetinnenlayout 390](visual/tahoe7-comparison/after-widgets-390.png) |
| Kontrollzentrum · 390 | ![before Kontrollzentrum 390](visual/tahoe7-before/t6-control-390.png) | ![after Kontrollzentrum 390](visual/tahoe7-after/t6-control-390.png) |
| Spotlight · 390 | ![before Spotlight 390](visual/tahoe7-before/deep-spotlight-390.png) | ![after Spotlight 390](visual/tahoe7-after/deep-spotlight-390.png) |
| Finder und Notes · 390 | ![before Finder und Notes 390](visual/tahoe7-before/t6-apps-390.png) | ![after Finder und Notes 390](visual/tahoe7-after/t6-apps-390.png) |
| Launchpad · 390 | ![before Launchpad 390](visual/tahoe7-before/t7-launchpad-390.png) | ![after Launchpad 390](visual/tahoe7-after/t7-launchpad-390.png) |
| Mitteilungen · 390 | ![before Mitteilungen 390](visual/tahoe7-before/deep-notifications-390.png) | ![after Mitteilungen 390](visual/tahoe7-after/deep-notifications-390.png) |

Zusätzlich: [Fensteruntermenü](visual/tahoe7-after/t7-window-submenu.png), [Einstellungen](visual/tahoe7-after/cloud1-settings-1920.png), [Isolierte GL-Diagnose](visual/tahoe7-diagnostic/integrated-diagnostic.png), [Kontextverlust-Fallback](visual/tahoe7-diagnostic/context-loss-css-fallback.png), [Cropquellen/Hashes](visual/tahoe7-comparison/sources.json). Vollständige Original-PNGs bleiben in den jeweiligen Vorher-/Nachherordnern. Das Preset wurde für den Vorhervergleich über die bestehenden Einstellungen gleich angeordnet; die neue Ein-Klick-Bestätigung existiert erst in Tahoe7. Synthetische Notiz-/Uhr-/Fortschrittsinhalte können sich zwischen Läufen unterscheiden.

## Checkpoints und Evidenz

- `eef6baf79b391b9cbbe15847a848310e6a4e7259` Port MacShell Dock layout, control motion, glyphs and player composition
- `3b57c84a1781a27abef0c584be222508f78b1973` Add audited R3 Windows channel for installed Tahoe 7 verification
- `55209dddda11998a37c4d7794e9c04c62c2b8a22` Remove competing legacy Dock hover transform and verify icon-to-cell geometry
- `f661c9a0398551456bdbc47548a0b1acbc25d79c` Stabilize real pointer targeting after Dock magnification; cancel superseded R3 runs
- `ab5b3f0b171aa6fb477902d768c66b9edc9d653f` Preserve confirmed Dock size preference with original MacShell default geometry
- `cf004a2a905fd2c75fe5a6ae2e0b3911a529bdea` Port original small PlayerWidget controls and reference-unit typography
- `a9971ccce381824f75dcd85383783a2b5b894457` Make normal-motion renderer scenario explicit for Windows magnification proof

[463-Tests-TAP](visual/tahoe7-evidence/node-tests.tap), [moderner Audit](visual/tahoe7-evidence/modern-audit.json), [unveränderte geschützte Quellbytes](visual/tahoe7-evidence/source-identity.json), [kleiner Originalplayerzweig](visual/tahoe7-after/t7-small-player.png).

Zwischenläufe wurden nicht als Erfolg umgedeutet: Ein lokaler Lauf fiel während paralleler Index-/NOTICE-Aktualisierung im Checkoutvergleich aus; ein einzelner ASAR-Testfixtures-Lauf zeigte einen nicht reproduzierten Public-Key-Decoderfehler. Der anschließend stabile Gesamtgate und der native Windows-Gate liefen vollständig. Ein Windows-GUI-Lauf scheiterte am Magnifikationsnachweis; für Normalbewegung wird nun im **Testrenderer** ausdrücklich `no-preference` gesetzt und auf das Ende der tatsächlichen Springbewegung gewartet. Reduced Motion wird separat mit `reduce` geprüft; die Windows-Einstellung und Produktpräferenzen werden nicht umgangen. Original-/aktuelle Bewegungspräferenz und Dockzustände stehen in der GUI-Evidenz. Frühere Builds bzw. abgebrochene CI-Läufe werden nicht als finale Windows-Abnahme verwendet.
