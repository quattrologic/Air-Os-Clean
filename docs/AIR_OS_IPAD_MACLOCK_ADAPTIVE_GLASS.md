# MacLock — Originalglas und adaptive Musikszene

Branch `feat/air-os-ipad-liquid-glass-maclock`; geprüfte Ausgangsbasis `c25ff0ad17d713e8a1217c282273ced23fccdda8`. Keine Änderung an privater Installation, Tailscale oder bestehenden Benutzerdateien. Kein Deployment und keine Zusammenführung mit anderen Branches.

## Originalquellen und tatsächlich ausgeführte Portierung

MacShell MIT, Commit `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`. Die Originale wurden vor dem Port anhand ihrer konkreten Lizenz und Hashes geprüft: [Glass.qml](source-ports/maclock-adaptive/Glass.qml), [LockScreen.qml](source-ports/maclock-adaptive/LockScreen.qml), [Lizenz](source-ports/maclock-adaptive/LICENSE), [Provenienz/SHA-256](source-ports/maclock-adaptive/provenance.json). Das unveränderte Fragment liegt unter `ipad/vendor/glass/maclock-original.frag`.

`scripts/build-maclock-shader.cjs` übersetzt das Originalfragment mechanisch von Qt/GLSL440 nach WebGL2/ES300: Uniformblock auf Einzeluniforms, Qt-Samplerbindung entfernen, Fragment-Eingang ohne Desktop-Location-Qualifier. Die Materialrechnung bleibt erhalten: abgerundetes SDF, Snell-Brechung mit Index 1,5, 24 Gaussian-/Dispersionstaps, Mipmap-Abtastung, Top-Left-Lichtvektor, Innenabsorption, Meniskus und Grain. Das neue Programm läuft **im bestehenden** `vendor/glass/renderer.js`, mit dessen GPU-Prüfung, Preblurcache, Auflösungsbudget und Context-Lifecycle. Keine zweite Engine.

Die bisherigen generischen MacLock-Defaults entsprachen nicht den tatsächlichen Aufrufen in `LockScreen.qml`. Jetzt gelten:

| Fläche | Originalaufruf Dicke/Tint/Schatten | Tatsächliche Shaderwerte |
|---|---|---|
| Musikpanel | 26 /0,48 /0,55 | Dicke 41,6; Tintmix 0,264; Schatten 0,55 |
| Benachrichtigung | 20 /0,40 /0,30 | Dicke 32; Tintmix 0,22; Schatten 0,30 |
| Beide | Glass.qml Stärke 1 | Dispersion 0,078; Magnify 0,08; Rim 0,5; Grain 0,006; Blur 1,5 |

Der gemeinsame MacLock-Preblur verwendet den Originalparameter `32×0,35`; die Auflösung/Kernelabbildung von Qt auf den vorhandenen Browser-Gaussian-Pass bleibt eine dokumentierte Annäherung. Die feste CSS-Border und der zusätzliche gemalte CornerBorder-Pass sind für Lockkarten entfernt. Das Originalfragment berechnet deren Kantenhelligkeit selbst.

## artBg und gemeinsame Szenenquelle

`maclock.js` erweitert den vorhandenen Präsentationsbesitzer um zwei Bildschichten. Tatsächliches Cover laden und decodieren, erst danach übergeben: Skalierung 1,25; Blur-Maximum 64 als Browserabbildung; Sättigung 1,25; Helligkeit 0,84. Alte und neue Szene überblenden 650ms mit dem originalen OutCubic-Verlauf. Bei schnellem Wechsel wird ausschließlich die eigene erlaubte Bildszene in einen begrenzten Zwischenpuffer übernommen. Keine Aufnahme des Bildschirms, fremder Fenster oder des DOM.

Die Musiksteuerung und das große Vordergrundcover bleiben geometrisch unverändert. Ein fehlendes, fehlerhaftes oder nicht zulässig ladbares Cover führt zum bisherigen Yosemite-Hintergrund. Keine Produktion künstlicher Ersatzcover. Pausieren oder Beenden behält die bestehende letzte Wiedergabe. Die neue Einstellung „Albumcover als Lockscreen-Hintergrund“ ist standardmäßig an; Abschalten betrifft nur diese Szene.

Der vorhandene Materialrenderer liest beim Sperren dieselbe erlaubte Szene, die sichtbar hinter den Karten liegt. Im Desktopmodus verwendet er weiter das vorhandene Wallpaper. Der CSS-Fallback nutzt einen gemeinsamen, begrenzten Vorweichzeichner pro Bild/Viewport statt erneut große Blurflächen je Karte. Lokale Vergrößerung und ein aus der tatsächlichen Szenenhelligkeit modulierter gerichteter Rim sind eine Browserannäherung, **keine behauptete Snell-Brechung im CSS-Pfad**. Musik- und Mitteilungskarten berücksichtigen ihre jeweilige Position und erhalten auch im CSS-Pfad die unterschiedlichen Original-Tintwerte0,264 beziehungsweise0,22.

## Daten, Spotify und Sicherheit

Die vorhandenen `playback-history.js`-/`spotify.js`-Besitzer, OAuth-PKCE und Lesescopes bleiben maßgeblich. Keine neue Audioengine und keine systemweite iPad-Musikerkennung. Nur die freiwillig autorisierte Spotify-Antwort kann reale Spotify-Metadaten liefern. Es wurde kein echtes Konto angemeldet; die Abnahme verwendet klar synthetische offizielle Endpoint-Mocks.

Ergänzt ist eine begrenzte 320px-Miniatur eines tatsächlich gelieferten, zugelassenen CDN-Covers, nach CORS-Decodierung. Sie liegt im bestehenden Wiedergabeverlauf, ohne neue Datenbank, Migration oder parallelen Cache. Keine Tokens darin. Fällt die Verbindung aus, bleiben Titel und vorhandene Miniatur erhalten; die Anzeige lautet „Zuletzt gehört“. Alte Antworten dürfen den zuverlässig gespeicherten Titel nicht fälschlich als aktuelle Wiedergabe markieren. Priorität verwendet weiterhin echte lokale Playback-Ereignisse beziehungsweise tatsächliche API-Zeitstempel; Legacy-Zeiten werden nicht erfunden.

Bei fehlender CORS-/Codec-Freigabe bleibt die bekannte Metadaten-/URL-Quelle erhalten, der Hintergrund fällt auf Yosemite zurück. Ohne verifizierte Autorisierung wird keine Spotify-Funktion als verfügbar dargestellt. Spotify-Steuerung bleibt entsprechend den bisherigen Fähigkeiten deaktiviert.

Die Hintergrundoption ist ein zusätzliches Feld im bestehenden originbezogenen Laufzeitdatensatz. Der bewährte v1-Backupvertrag bleibt unverändert: Bibliothek, lokale Cover und bisherige Legacy-Wiedergabe sind weiterhin enthalten; die bereits zuvor ausgeschlossene Spotify-/Runtime-Metadatenprojektion und diese Präsentationsoption werden nicht als portables Backup ausgegeben. Verlaufslöschen entfernt auch seine Miniatur, nicht die Musikdateien. Keine Cloudübertragung lokaler Musik.

## Drei echte Korrekturrunden

Unveränderte Vollaufnahmen und Originalreports: [Korrekturrunden](visual/maclock-adaptive/correction-rounds/).

1. Vorhandener 39er-Regressionstest mit der bereits bestehenden synthetischen Medienfixture: dynamische Farben und entfernte feste Border sichtbar; noch unsaubere Filtergrenzen am Bildschirmrand.
2. Echte Datei-/Coverauswahl mit den bereits lizenzierten Wald-/Seefotografien des Repositories: gemeinsamer Vorweichzeichner gleicht Hintergrund und Karten ab. 23 funktionale GUI-Fälle bestanden; der Report wies jedoch einen Shader-Compile-Fehler aus. Dieser Stand wird ausdrücklich nicht als erfolgreiche GPU-Integration bewertet.
3. Der unzulässige Fragment-Location-Qualifier wurde bei der mechanischen ES-Übersetzung entfernt. Der nun tatsächlich ausgeführte Originalshader, unterbrochene Coverwechsel im gesperrten Zustand, lokale Reflexionsunterschiede und Cleanup werden streng geprüft. Shader-Compile-/Link-/Draw-Fehler dürfen nicht mehr als bloß „nicht verfügbar“ durchgehen. Stationäre alte Bildebene wird ausgeblendet; Vorweichzeichner und Zwischenpuffer bleiben begrenzt.

Die Fotocover der Abschlussansichten wurden über die bestehende Musik-Dateiauswahl importiert und in der vorhandenen Coverfunktion ausgewählt. 8s-PCM-Dateien sind synthetische Testaufnahmen. Die fotografischen Assets selbst sind unverändert lizenziert; keine KI-Bilder, keine nachträgliche Retusche und keine Collagen. Die originale Nutzeraufnahme bleibt eine visuelle Referenz, deren Erika-Artwork nicht ungeprüft in das Produkt kopiert wird.

## Prüfstand und verbleibende Abnahme

Lokal 56/56 Node-Tests, 39/39 bestehende MacLock-/Dock-Prüfungen im ersten Materialcheckpoint, 20/20 Spotify-Mocks und 29/29 neue adaptive Szenenprüfungen bestanden. Die abschließende vollständige Chromium-/WebKit-Matrix wird für den gesicherten Produktstand erneut ausgeführt; der genaue Abschlussnachweis folgt nach dem Lauf.

Die neuen GUI-Fälle prüfen tatsächlichen Dateieingang und Originaltransport, Vor-/Zurück im gesperrten Zustand, Zwischenwerte statt schwarzer Übergangsszene, schnelle Wechsel, fehlendes Cover, echte Persistenz/Offline-Neustart, die Option, Reduced Motion/Transparency, mehrere Quer-/Hochformate und 390×600. Isolierte Shaderdiagnose prüft reale Pixeldifferenzen, Context Loss/Restore und Ressourcenfreigabe. Sie ist ausdrücklich keine Hardware-GPU-Abnahme.

Erster vollständiger Lauf [42463676358](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42463676358): Chromium vollständig erfolgreich; WebKit bestand20 neue Szenenfälle, brach aber beim Neuladen nach Playwrights `setOffline(true)` intern vor der Appnavigation ab. [Unveränderter Fehlerreport](visual/ipad-liquid-maclock/2a4dcd6f12ad7434a6c641678c278b1f87d9d07a/evidence.json). Die zusätzliche Abnahme verwendet nun denselben echten Origin-Ausfall wie der bestehende Safari-Gate: HTTP-Server und Verbindungen schließen, einen ungecachten Netzaufruf tatsächlich scheitern lassen, dann aus dem echten Service Worker neu laden. Keine gemockte App-Shell und keine Abschwächung des Daten-/Cache-Nachweises. Ein Funk-/Flugmodus auf physischer iPad-Hardware ist davon getrennt und bleibt offen. Die Service-Worker-Logik wird für diese Testkorrektur nicht verändert; die reguläre Assetversion wird erneuert.

Im folgenden Lauf [42465008131](https://github.com/quattrologic/Air-Os-Clean/actions/runs/42465008131) bestand WebKit sämtliche30 fachlichen neuen Fälle, einschließlich echtem Offline-Neustart, Originalshader, messbarer Brechung, Context Loss/Restore und Cleanup. Die abschließende Fehlerfreiheit scheiterte jedoch an der absichtlich ausgelösten negativen Netzprobe (`unavailable-network-probe`), die WebKit zusätzlich als Seitenfehler meldete. [Originalreport](visual/ipad-liquid-maclock/b29ae28f177c9ccf5063b15087038c64067e55fd/evidence.json). Die Probe erfolgt jetzt über eine separate lokale HTTP-Verbindung und verlangt tatsächlich `ECONNREFUSED`; der PWA-Neustart selbst bleibt vollständig im echten Browser. Kein Fehlerfilter und keine gelockerte Assertion: Die Prüfung auf unaufgefangene Appfehler bleibt unverändert streng. Lokal besteht dieser31er-Gate ohne Browserfehler.

Stationär laufen weder Cover-RAF noch wiederholte Vorweichzeichnung. Materialdraws stoppen nach dem Übergang. Der CSS-Preblur hat ein Zielbudget von etwa 0,6MP, der Zwischenpuffer etwa 0,4MP; die vorhandenen GL-Budgets bleiben erhalten. Diese Grenzen und Zähler sind keine erfundenen FPS-/Akkumessungen.

Physische iPad-/Safari-, Hardware-GPU-, Akku- und echte Spotify-Kontoabnahme bleiben offen. Pro Notch inklusive aller vier Dateien, kleine Uhr, Avatar/Textentsperrung, Dockkern, 25 Apps, ursprüngliche Musikdatenbank und private Installation bleiben geschützt.
