# Tahoe 8A – MacShell Glass Foundation

Basis **854d7fb17700a7deb99307274b0ac3d98f5b3be1**, Branch **feat/air-os-tahoe-8a-glass-foundation**. Produktcheckpoint **aeef80e**. Nur Materialien, Wallpaperinvalidierung und zugehörige Abnahme geändert. Keine neue Engine, Abhängigkeit, Registry, Fensterverwaltung, Authentifizierung oder Datenmigration; kein R4-Installer.

## Diagnose und tatsächliche Korrekturen

Die gemeinsame GLASS-3-Engine zeichnet auf unterstützten klassifizierten Hardwarekandidaten in WebGL2. Software-/unbekannte GPUs bleiben im normalen Produktpfad beim CSS-Fallback. Hier war ausschließlich **SwiftShader** verfügbar. Der normale CSS-Pfad und die ausdrücklich isolierte bestehende Shaderdiagnose werden getrennt dokumentiert; kein Hardware- oder Windows-/macOS-Nachweis für8A.

- Dock verwendete bisher `tintMix .45`, Island `.60`, Widgets `.70`; Original-Callsites ergeben `.231`, `.231` und `.586`. Auch Thickness/Dispersion/Rim/Grain/Magnify waren vereinheitlicht statt komponentenspezifisch.
- GLASS-2/3-Fallback und eine spätere Tahoe-Widgetregel stapelten dunkle bläuliche Flächen/Verläufe. Das Widgetmaterial gehört jetzt einem gemeinsamen CSS-Block; die spätere Abdunklung entfällt. Dock nutzt neutrales MacDock-Anthrazit mit Alpha `.42`. Widgets behalten die originalen grauen Verlaufstöne und verwenden die tatsächliche Widget-Tönung `.586` als CSS-Alpha. Island erhält das gemeinsame GlassSlab-Profil.
- Ein deckender Island-Header mit eigenem14px-Blur wurde transparent/blurfrei. Pro Host arbeitet genau ein Compositor-Backdropfilter: Dock13px (`5+8`), Widgets16px (`5+11`), Island5px. Die konkaven seitlichen Anschlussflächen bleiben Teil derselben alten Form; keine neuen Overlays oder Hitboxen.
- Aktive Shaderhosts bleiben transparent, deren Canvas oberhalb des Hosthintergrunds und unterhalb der Inhalte. Die Island verwendet jetzt den gemeinsamen originalen `liquidglass`-Shader mit GlassSlab-Werten, das Dock weiterhin `dockglass`; vorhandenes `contourglow` bleibt im bestehenden Hover-/Fokuspfad. Keine zusätzlichen Shaderpasses/Programme.
- Die Wallpaper-Styleinvalidierung fehlte im Observer. Bei direkten Änderungen konnte die alte Textur stehen bleiben. `.wallpaper` invalidiert jetzt ereignisgebunden dieselbe vorhandene Szenentextur. Dekodiercache, Cover-/Positionsabbildung und Renderbudget bleiben erhalten.
- Reduced Transparency/Contrast und die gespeicherte Reduced-Glass-Präferenz gewinnen gegen die neuen transparenten Fallbacks: deckende lesbare Fläche, kein Backdropfilter, keine GL-Ressourcen. Forced Colors bleibt systemfarbenbasiert.

Nicht betroffene Popovers behalten ihre bisherigen Materialien. Bewusste Notes-/Home-Titelleistentints bleiben erhalten; ihre Fensterinhalte und das MacLock-Material wurden nicht umgebaut.

## Originalparameter und Ausführungspfad

MacShell **[1bdb51870b621100fd2709f66c8f8e00ab17b9c4](https://github.com/0-ss/MacShell/tree/1bdb51870b621100fd2709f66c8f8e00ab17b9c4)**, MIT, Copyright2026 Rickky. [Genaue Originalpfade, Zeilenbereiche, Hashes, Auszüge und Anpassungen](../third_party/glass2/materials-8a.json); bestehende [LICENSE](../third_party/glass2/LICENSE)/[NOTICE](../third_party/glass2/NOTICE) unverändert. Die vorhandenen originalen Shader und ihr reproduzierbarer GLSL-ES-Port wurden **nicht neu geschrieben**.

`src/core/glass-geometry.js:material(kind,height)` → `air-desktop-glass.js:draw()` → derselbe Uniformbinder/Renderer. Diagnose-Snapshots enthalten nur Profilnamen und numerische Werte, keine Profil-/Fenster-/Notiztexte oder Gerätenamen.

| Parameter | Dock: `MacDock.qml` tatsächlicher Dock-Shader | Fünf Widgets: `WidgetVisual` → `ClockWidget`/`CalendarWidget`/`PlayerWidget` | Island: `GlassSlab.qml` adaptiert |
|---|---|---|---|
| thickness |30 |30 |16×1.6 =25.6 |
| dispersion |.06 |.06 |.06×1.3 =.078 |
| blurPx |1.5 |1.0 |1.5 |
| tintMix |.42×.55 =.231 |.25+.42×.8 =.586 |.42×.55 =.231 |
| saturation |1.25 |1.25 |1.25 |
| rim |.45×.20 =.09 |.45 |.1125 |
| grain |.03×.3 =.009 |.03×.15 =.0045 |.03×.2 =.006 |
| magnify |.08 |.08×min(1,90/H) |.05×1.6 =.08 |
| shadowAmt |0 |0 |0 |
| flatInner |Kein Uniform im speziellen Dockshader; dessen eigene Tiefenformel gilt |1 |1 |
| rimTint / ringW |Nicht im speziellen Dockshader vorhanden, Binder ignoriert gemeinsame Profilfelder |1 /0 |1 /0 |

Notes und Reminders verwenden bewusst dasselbe vorhandene Widgetmaterial; das ist eine **Materialadaption**, kein neuer vollständiger `ExtraWidgets.qml`-Port. `edgeTint` wird beim Dock mit Stärke0 neutralisiert: die originale adaptive Wallpaper-Farbschätzung wird nicht behauptet. Schatten, Konturen, Meniskus und Refraktion stammen weiter aus den originalen Shaderformeln; die Air-OS-SDF für gerade Basis/konkave Anschlüsse bleibt erhalten. Gemeinsame Profilfelder ohne passendes Shaderuniform werden ignoriert und zählen nicht als aktive Dockeffekte.

### Technische Grenzen der Materialtreue

Die sichere Backdropquelle ist weiterhin **nur das tatsächlich aktive eigene Wallpaper**, inklusive bestehender Skalierung/Position und unterstützter Overlays. Kein Screen-Capture, keine privaten Fenstertexturen. Abnahmescreenshots werden ausschließlich gespeichert, niemals wieder als Rendertextur eingelesen.

Die bestehende gecachte WebGL-Wallpaper-Vorverarbeitung verwendet2px-Blur. Qt-MultiEffect-Prepasses mit komponentenabhängigen13/16px werden hier **nicht** als identisch portiert ausgegeben; `blurPx` in obiger Tabelle ist der originale residuale Shaderblur. Die CSS-Variante verwendet die genannten13/16px als einen Compositorfilter. Qt-Original-Widgetfallback hat Alpha `.82`; für den geforderten durchscheinenden Electron-Fallback werden dessen RGB-Verlauf und die originale Widget-Shadertönung `.586` kombiniert. Island/CSS ist eine Adaption an die vorhandene Air-OS-Hülle. **CSS-Blur erzeugt keine Snell-Refraktion.** Keine Pixelgleichheit oder native Original-QML-Abnahme behauptet.

## Tests, Geometrie und Bildmessung

**467/467 Node-Tests bestanden,0Fehler/Skips**, einschließlich aller463 bisherigen Tests. Neue Regressionen prüfen Callsiteprofile, höhenabhängige Magnify-Werte, Originalauszüge/MIT-Hashes, echte Uniformbindung, sichere GPU-Guards, Wallpaperinvalidierung, Fallbackkonsolidierung und reduzierte Transparenz. Die erste neue Floatprüfung wurde auf eine numerisch sinnvolle Toleranz korrigiert; fehlgeschlagene Zwischenversuche werden nicht als Erfolg gezählt.

**285 Runtime-Ressourcen** validiert; PWA mit273 allowlisted Assets gebaut, nicht veröffentlicht. [Test-TAP, Buildprüfungen und Messungen](visual/tahoe8a-evidence/).

Echte sandboxed Linux-x64-Electron44.9.3-Läufe bei **1920×1080,1650×930,390×600**, jeweils Vorher/Nachher mit demselben Preset und eigenen synthetischen Daten. Bei390 werden alle fünf Widgets über die echten drei Widgetseiten aufgenommen;390 ist ein schmaler CDP-Renderer bei nativer Mindestfensterbreite760, kein physisches390px-/iPad-Fenster. Normaler SwiftShader-Pfad: CSS-Fallback. Isolierte Shaderdiagnose: dieselbe Produktengine, drei kompilierte Programme, keine vorgetäuschte Hardwarefreigabe.

Nachher zusätzlich: echte M1-/M2-Richtungswechsel über Maus/Tastatur, Classic/Modern, Escape, gespeichertes Reduced Glass, emulierte Reduced Transparency, ContextLoss→0Programme/0Texturen, Restore→3Programme, Logout. **0zusätzliche Draws im700ms-Leerlaufsample bei390px.** Kein60fps-Versprechen. Die Materialprüfung deckte einen Prioritätskonflikt mit Reduced Transparency auf; dieser wurde vor der erfolgreichen Endabnahme behoben. Der Launcher wartet auf den abgeschlossenen M1-Cleanup, bevor er Widgetseiten bedient.

[Byte- und echte Renderer-Geometrienachweise](visual/tahoe8a-evidence/protected-and-geometry.json): `app.js`/M2, Island/M1, Dockform/-layout, Main/Preload, MacLock, erzeugte Shader und R3-Workflow bytegleich zur Basis. Dock-, Island- und Widgetrechtecke **vor/nach exakt identisch** in allen drei Größen.

[Pixelmessungen und unveränderte Screenshot-Cropquellen](visual/tahoe8a-details/measurements.json): gleiche synthetische Streifenszene im selben Shaderpfad, Refraktion/Dispersion/Magnify an gegen aus; Tönung unverändert. Mittlere absolute RGB-Abweichung in ausgewählten Glasrandflächen:

| Viewportbreite | Dock | Uhrwidget | Island |
|---|---:|---:|---:|
|1920 |7.465 |4.618 |16.882 |
|1650 |5.324 |15.604 |11.339 |
|390 |2.297 |12.716 |27.036 |

Werte auf0–255-RGB-Skala. Die Unterschiede belegen gerenderte optische Verzerrung im isolierten Softwarediagnosepfad, keine Hardwareleistung und keinen CSS-Snell-Effekt. Die Streifen sind ausschließlich ein technisches Testwallpaper; normales Air-OS-Wolkenwallpaper bleibt das Produktdesign.

## Vorher/Nachher

Die Bilder sind echte Electron-PNGs. Details sind ausschließlich Ausschnitte dieser Aufnahmen. Jede Auflösung enthält Gesamtdesktop, Dock, fünf Widgets (390: Seiten2/3 zusätzlich), geschlossene/geöffnete Island, CSS-Fallback und separat gekennzeichnete Shaderdiagnose.

| Ansicht | Vorher | Nachher |
|---|---|---|
|Desktop · CSS · 1920|![before Desktop · CSS 1920](visual/tahoe8a-before-css/desktop-1920.png)|![after Desktop · CSS 1920](visual/tahoe8a-after-css/desktop-1920.png)|
|Dock · CSS · 1920|![before Dock · CSS 1920](visual/tahoe8a-details/before-dock-1920.png)|![after Dock · CSS 1920](visual/tahoe8a-details/after-dock-1920.png)|
|Fünf Widgets / sichtbare Seite · CSS · 1920|![before Fünf Widgets / sichtbare Seite · CSS 1920](visual/tahoe8a-details/before-widgets-1920.png)|![after Fünf Widgets / sichtbare Seite · CSS 1920](visual/tahoe8a-details/after-widgets-1920.png)|
|Island geschlossen · CSS · 1920|![before Island geschlossen · CSS 1920](visual/tahoe8a-details/before-island-1920.png)|![after Island geschlossen · CSS 1920](visual/tahoe8a-details/after-island-1920.png)|
|Island geöffnet · CSS · 1920|![before Island geöffnet · CSS 1920](visual/tahoe8a-before-css/island-open-1920.png)|![after Island geöffnet · CSS 1920](visual/tahoe8a-after-css/island-open-1920.png)|
|Streifen · CSS-Fallback · 1920|![before Streifen · CSS-Fallback 1920](visual/tahoe8a-before-css/stripes-1920.png)|![after Streifen · CSS-Fallback 1920](visual/tahoe8a-after-css/stripes-1920.png)|
|Streifen · isolierte Shaderdiagnose · 1920|![before Streifen · isolierte Shaderdiagnose 1920](visual/tahoe8a-before-diagnostic/stripes-1920.png)|![after Streifen · isolierte Shaderdiagnose 1920](visual/tahoe8a-after-diagnostic/stripes-1920.png)|
|Desktop · CSS · 1650|![before Desktop · CSS 1650](visual/tahoe8a-before-css/desktop-1650.png)|![after Desktop · CSS 1650](visual/tahoe8a-after-css/desktop-1650.png)|
|Dock · CSS · 1650|![before Dock · CSS 1650](visual/tahoe8a-details/before-dock-1650.png)|![after Dock · CSS 1650](visual/tahoe8a-details/after-dock-1650.png)|
|Fünf Widgets / sichtbare Seite · CSS · 1650|![before Fünf Widgets / sichtbare Seite · CSS 1650](visual/tahoe8a-details/before-widgets-1650.png)|![after Fünf Widgets / sichtbare Seite · CSS 1650](visual/tahoe8a-details/after-widgets-1650.png)|
|Island geschlossen · CSS · 1650|![before Island geschlossen · CSS 1650](visual/tahoe8a-details/before-island-1650.png)|![after Island geschlossen · CSS 1650](visual/tahoe8a-details/after-island-1650.png)|
|Island geöffnet · CSS · 1650|![before Island geöffnet · CSS 1650](visual/tahoe8a-before-css/island-open-1650.png)|![after Island geöffnet · CSS 1650](visual/tahoe8a-after-css/island-open-1650.png)|
|Streifen · CSS-Fallback · 1650|![before Streifen · CSS-Fallback 1650](visual/tahoe8a-before-css/stripes-1650.png)|![after Streifen · CSS-Fallback 1650](visual/tahoe8a-after-css/stripes-1650.png)|
|Streifen · isolierte Shaderdiagnose · 1650|![before Streifen · isolierte Shaderdiagnose 1650](visual/tahoe8a-before-diagnostic/stripes-1650.png)|![after Streifen · isolierte Shaderdiagnose 1650](visual/tahoe8a-after-diagnostic/stripes-1650.png)|
|Desktop · CSS · 390|![before Desktop · CSS 390](visual/tahoe8a-before-css/desktop-390.png)|![after Desktop · CSS 390](visual/tahoe8a-after-css/desktop-390.png)|
|Dock · CSS · 390|![before Dock · CSS 390](visual/tahoe8a-details/before-dock-390.png)|![after Dock · CSS 390](visual/tahoe8a-details/after-dock-390.png)|
|Fünf Widgets / sichtbare Seite · CSS · 390|![before Fünf Widgets / sichtbare Seite · CSS 390](visual/tahoe8a-details/before-widgets-390.png)|![after Fünf Widgets / sichtbare Seite · CSS 390](visual/tahoe8a-details/after-widgets-390.png)|
|Island geschlossen · CSS · 390|![before Island geschlossen · CSS 390](visual/tahoe8a-details/before-island-390.png)|![after Island geschlossen · CSS 390](visual/tahoe8a-details/after-island-390.png)|
|Island geöffnet · CSS · 390|![before Island geöffnet · CSS 390](visual/tahoe8a-before-css/island-open-390.png)|![after Island geöffnet · CSS 390](visual/tahoe8a-after-css/island-open-390.png)|
|Streifen · CSS-Fallback · 390|![before Streifen · CSS-Fallback 390](visual/tahoe8a-before-css/stripes-390.png)|![after Streifen · CSS-Fallback 390](visual/tahoe8a-after-css/stripes-390.png)|
|Streifen · isolierte Shaderdiagnose · 390|![before Streifen · isolierte Shaderdiagnose 390](visual/tahoe8a-before-diagnostic/stripes-390.png)|![after Streifen · isolierte Shaderdiagnose 390](visual/tahoe8a-after-diagnostic/stripes-390.png)|

Weitere Nachweise: [390px Widgetseite2](visual/tahoe8a-after-css/widgets-390-page2.png), [Seite3/NowPlaying](visual/tahoe8a-after-css/widgets-390-page3.png), [Shaderdiagnose ohne Refraktion](visual/tahoe8a-after-diagnostic/stripes-no-refraction-1920.png), [Context-Loss-Fallback](visual/tahoe8a-after-diagnostic/context-loss.png), [Restore](visual/tahoe8a-after-diagnostic/context-restored.png), [Reduced Transparency](visual/tahoe8a-after-css/reduced-transparency.png), [gespeichertes Reduced Glass](visual/tahoe8a-after-css/reduced-glass.png).

Rohberichte: [Vorher CSS](visual/tahoe8a-before-css/material-report.json), [Nachher CSS](visual/tahoe8a-after-css/material-report.json), [Vorher Shaderdiagnose](visual/tahoe8a-before-diagnostic/material-report.json), [Nachher Shaderdiagnose/Uniformprofile/Cleanup](visual/tahoe8a-after-diagnostic/material-report.json).

## Offen und bewusst nicht umgesetzt

Physische Hardware-GPU, natives Windows/macOS und DPI/Retina-Abnahme bleiben offen; keine solche Abnahme aus Linux-/SwiftShaderbildern abgeleitet. R3 enthält weiterhin Tahoe7, **nicht8A**. Kein R4 gebaut, keine Codesign-/SAC-Freigabe. Qt-MultiEffect-Preblur, adaptive Dock-Edgefarbe und weitere Glass-Komponenten bleiben getrennte Aufgaben. Kein Kontrollzentrum-/Spotlight-Komplettport, MacLock-Umbau, Cloudlogin oder Plattformumbau. Der vollständige Original-Desktop ist hier nicht als gleich aufgelöste QML-Referenz ausgeführt worden.

Der Dokumentationsabschluss-SHA steht im Abschlussbericht; danach STOP.
