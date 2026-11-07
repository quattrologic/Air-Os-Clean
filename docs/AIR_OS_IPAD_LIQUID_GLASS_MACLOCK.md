# Air-OS iPad — Liquid Glass, MacDock und MacLock

Arbeitsbranch `feat/air-os-ipad-liquid-glass-maclock`; Ausgangsstand `732bb798bfe2bc9ed614610eaeee5d60296ad3e6` enthält Produkt `5b09e4d93e08bb60304f32cad40676c477cb7a9e`. Keine Installation, Veröffentlichung oder Zusammenführung. Private Tailscale-Version bleibt unverändert.

## Implementierung und Herkunft

MacShell MIT, Referenzcommit `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`. [Maschinenlesbare Pfade und SHA-256](source-ports/liquid-maclock.json), vollständiger Copyright-/Lizenztext unter `ipad/licenses/MacShell-MacLock-MIT.txt`, Attribution in `ipad/NOTICE` und mitgeliefertem Corresponding Source. Bestehende MacTahoe-/AGPL-/Shaderlizenzen bleiben erhalten.

| Original | Ausführbarer Port / Anpassung | Umfang |
|---|---|---|
| `MacShell/MacDock.qml` | `vendor/macshell/shell7.js` → `dock-material.js` | Originaler c0-/Cosinus-Kern, Radius 2,6 Iconabstände, gekoppelte Zellbreiten und Wachstum nach oben. Vorhandener Spring-Integrator bleibt; Stärke auf 1,8 abgestimmt. |
| `MacLock/Glass.qml`, `MacShell/GlassSlab.qml` | `vendor/glass/geometry.js` → bestehender Renderer | MacLock-Material: Dicke38,4, Dispersion0,078, Tintmix0,176, Rim0,5, Grain0,006, Magnify0,08. Gemeinsame Shader, Texturen, Preblur und Ressourcenverwaltung. |
| `MacShell/MacBar.qml` | `liquid-maclock.css` und Renderer-Menüleistenprofil | Browseranpassung: 24px, klarer Vordergrund, lokaler3px-Fallback statt globalem Blur. |
| `MacLock/LockScreen.qml` | `maclock.js`, vorhandene Lock-DOM, `liquid-maclock.css`, `core/visual-motion.js` | Hierarchie Datum/Uhr, quadratisches Cover, separate Medienkarte, lokale Hinweise, vorhandene lokale Entsperrung; responsive Browserberechnung. 650ms-Eintritt mit OutQuint-Näherung im bestehenden Scheduler. |

Keine Qt-/Quickshell-, PAM-, MPRIS- oder native Scene-Capture-Übernahme. Keine neue Render-, Audio-, Fenster- oder Dockengine. Kein Kopieren der nativen Fenstertexturen. Shader refraktieren ausschließlich das erlaubte gebündelte Wallpaper; CSS-Fallback ist keine Snell-Refraktion.

## Pro Notch und Daten

Alle vier Dateien unter `ipad/notch/` bleiben byte-identisch zum Ausgangscommit; Node-Regression prüft ihre SHA-256. Keine neuen Styles adressieren die Notch. Alle25 App-Einträge, Yosemite-Wallpaper, Store-Schema2, vorhandene Musikblobs und Kalenderdaten bleiben erhalten.

Der obere Nebel stammte vom globalen `body:has(#lockscreen...) .wallpaper`-Filter. Desktop-Wallpaper ist nun ausdrücklich scharf; Lock-Blur18px sitzt auf einem ausschließlich lokalen Hintergrundlayer. Vordergrund und Notch bleiben scharf. Kontrollzentrum verwendet einzelne MacShell-artige Slabs mit gemeinsamem Wallpaper-Cache, keine gestapelten globalen Blurflächen.

## Dockbedienung

Maus/Trackpad: kontinuierlicher Cosinus-Verlauf, keine unabhängigen CSS-Hover-Scales. Zentrum1,80, direkter Nachbar1,54, zweiter Nachbar1,10; reale Bildgrößen und Zellabstände wachsen gemeinsam. Hintergrundkörper58px bei48px Basisicons, ohne übergroße milchige Fläche. Bewegung endet, sobald die Feder ruht.

Touch/Pencil-Pointer: kurzes Tippen nutzt vorhandene Appaktion. Halten280ms aktiviert die Welle, horizontales Führen verschiebt Auswahl, Loslassen startet höchstens eine App. Vorzeitiges Bewegen scrollt ein zu breites Dock; Pointercancel öffnet nichts. Tastatur-Kontextmenü über Umschalt+F10/ContextMenu, Maus-Kontextmenü und native Desktop-Umordnung bleiben erhalten. Touch-Longpress für die Welle ersetzt den konkurrierenden alten Longpress-Kontextmenü-Timer. Auf schmalen Ansichten bleibt horizontales Scrollen nötig; kein Anspruch auf native macOS-Docksteuerung.

## Musik und Spotify

`core/playback-history.js` und `playback-history.js` sind ausschließlich Metadatenprojektionen über der vorhandenen Musikengine. Neue kleine Einstellung `last-played-metadata-v1` im bestehenden Settings-Store, keine Schemaänderung. Höchstens ein letzter Datensatz je Quelle; echte Wiedergabezeitstempel entscheiden, unbekannte historische Zeiten bleiben unbekannt. Lokales Cover wird begrenzt gespeichert; Pause/Neustart behalten „Zuletzt gehört“. Sperren pausiert die vorhandene Wiedergabe nicht mehr. Löschen/Abwählen in Einstellungen entfernt nur Metadaten, niemals Musikdateien.

Optionales `spotify.js`: öffentliche Client-ID erst durch Nutzer eintragen, Zustimmung ankreuzen und ausdrücklich verbinden. Authorization Code PKCE S256 mit Einmal-State,10min-Verfall und exakt registrierter HTTPS-Redirect-URI; kein Client-Secret. Scopes `user-read-playback-state`, `user-read-currently-playing`, `user-read-recently-played`. Access-/Refresh-Token ausschließlich im Arbeitsspeicher; PKCE-Versuch kurzzeitig sessionStorage, nach Callback gelöscht. Nach Prozessneustart erneut anmelden. Callback-Code/State werden aus URL entfernt. OAuth-Antworten niemals SW-App-Shell; externe Antworten cache:no-store. Keine Spotify-Steuerung: Buttons deaktiviert, vorhandener externer Spotify-Titellink.

Abfragen nur nach Anmeldung: aktuell → currently-playing → recently-played. Sichtbare aktive Wiedergabe höchstens alle30s, Pause im Hintergrund/lokaler Wiedergabe, Retry-After bei429, verständliche401/403. Trennen bricht laufende Anfragen ab. Kein systemweiter Zugriff auf andere iPad-Player. Keine Verbindung zu einem Nutzerkonto in dieser Entwicklung.

Offizielles Spotify TypeScript SDK-README bestätigt browserseitiges PKCE (öffentliches Originalrepository, kein SDK eingebettet). `developer.spotify.com` ist in dieser Umgebung nicht erreichbar; aktuelle Dashboard-/Tarif-/Development-Mode-/Premium-/Allowlist-Bedingungen konnten nicht vollständig live verifiziert werden. Reale Konto-/API-Freigabe ist OFFEN und wird nicht als bestanden ausgegeben. Spotify-Cover nur erlaubte CDN-URL, keine Offline-Download-Zusage; vorhandene lokale Air-OS-Cover funktionieren offline. Keine externe Anmeldung, keine Zugangsdaten im Bundle.

## Referenzen und visuelle Korrekturen

Nutzervideo tatsächlich empfangen und vollständig in287 Frames dekodiert: [Analyse einschließlich Original-PTS und Frame-Hashes](reference/macdock/video-analysis.json). Ausrichtung846×1300 nach Rotation, kodiert1300×846, Laufzeit6,955s. Fünf unbeschnittene Schlüsselbilder im selben Verzeichnis. Gefilmter Laptop mit wechselnder Perspektive: daraus keine exakten nativen CSS-Skalen oder60fps-Timingmessungen behauptet. Übernommen wurden sichtbarer gekoppelter Verlauf, Bodenanker, lokale Welle und klarer flacher Glaskörper; Zahlen stammen aus tatsächlichen Air-OS-DOM-Messungen und Quellkernel.

MacLock-Nutzerbild im Chat sichtbar:1688×938-Komposition mit Cover etwa296×296 ab306px, Player ab622px, Uhr oben mittig, Hinweise rechts. Original-JPEG-Bytes fehlen; kein erfundener Pixel-MAE. Browser nutzt dasselbe Seitenverhältnis, eigenes klar gekennzeichnetes Testcover und das unveränderte Yosemite-Wallpaper. Abweichungen: andere Schrift statt nicht gebündelter Originalfont, lokaler Öffnen-Button statt vorgetäuschtem Passwort/PAM, Status/Herkunft in Künstlerzeile,44px-Touchziele, responsive Hinweise.

Drei echte Browserdurchläufe mit vollständigen Screenshots:

1. Runde1: neuer Hintergrund-/Dock-/Lock-Aufbau. Sichtbar: Hinweise kollidieren im Hochformat mit Uhr; Kontrollzentrum zu transparent.
2. Runde2: Hinweise unter Uhr verschoben, einzelne CC-Slabs mit lokalem Material und höherem Kontrast,44px-Medientasten. Tatsächliche Neuaufnahmen kontrolliert.
3. Runde3: überholte äußere CC-Kartenkontur entfernt, Beschriftungen präzisiert, Spotify-Settings ohne Safari-Eingabezoom; vorhandener Scheduler übernimmt MacLock-Eintritt. Erneute vollständige Aufnahmen und Geometrieprüfungen.

Vorheraufnahmen werden aus isoliertem Archiv des gepinnten Ausgangsstands erzeugt, mit identischem Viewport und denselben synthetischen Daten. Kein Checkout der privaten Version, keine Bildnachbearbeitung. Endgalerie ausschließlich vollständige Browseransichten, ohne Ausschnitte oder Collagen.

## Prüffortschritt — Checkpoint1

Lokal bisher:52/52 Node-Tests; neuer Chromium-GUI-Lauf23/23 mit12 echten Vollansichten; Spotify-Endpunkt-/PKCE-Mocks16/16. Kein reales Spotifykonto. Paketprüfung140 exakte Runtimeassets einschließlich Lizenzen bestanden. Vollständige ältere Browserregressionen, DPR2 und tatsächliches WebKit laufen im separaten Workflow `test-ipad-liquid-maclock.yml`; Endergebnisse werden nachgetragen.

Neue GUI-Prüfungen: Header24px, Notch165×24, echter Cosinuspeak und Nichtüberlappung, Idle-Paint-Stopp, Touch-Halten/Cancel/Einzelstart, echte Musiksteuerung beim Sperren, reale lokale Hinweise, getrennte Vorder-/Hintergrundfilter,25Apps/Schema2, Viewports1688×938/834×1194/1180×820/1024×768/1366×1024/820×1180/390×600, Offline-Neustart mit letztem Titel/Cover, Metadatenlöschen ohne Musiklöschung.

## Offene Grenzen

Physisches iPad/Safari, Trackpad-/Pencil-Hardware, Akku, Hardware-GPU und reale Tailscale-Adresse nicht getestet. Automatisiertes WebKit ersetzt kein iPad. GPU-Softwareguard bleibt aktiv; isolierte Shaderdiagnose ist keine Hardwarefreigabe. Kein Zugriff auf fremde Fenster, keine privaten Daten, keine Installation und kein Deployment. Safari-/Spotify-Autoplay und Hintergrundbeschränkungen gelten weiterhin. Kein exakt identisches Verhalten zur nativen MacShell-/macOS-Oberfläche versprochen.

### Checkpoint2 — Regression der Dockgrenzen

Der ältere37-Fälle-Systemlauf fand eine reale Regression: Überlappungsprüfung war auf den neuen flachen Glaskörper begrenzt, obwohl Icons darüber hinausreichen. Korrigiert auf die vollständige bestehende Dock-DOM-Geometrie; derselbe unveränderte Test besteht anschließend37/37. Pointerup/-cancel werden zusätzlich am Fenster abgefangen, damit ein außerhalb der Dockfläche endender früher Touch keine gehaltene Geste zurücklässt. Bestehende71/71 Notch- und11/11 Material-/Lifecycle-Prüfungen bestehen lokal. CI wird für diesen korrigierten Stand erneut ausgeführt.
