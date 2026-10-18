# Air-OS

Air-OS ist eine eigenständige Desktop-App für Windows und macOS auf Basis von Electron. Sie enthält eine Desktop-Oberfläche mit transparenter Menüleiste, Dock und Fenstern sowie einen eigenen Anmeldebildschirm.

## Was ist enthalten?

- Air-OS startet als Desktop-App und benötigt kein geöffnetes Chrome-Fenster.
- Beim ersten Start lässt sich ein lokales Konto mit Namen, Benutzername und Passwort erstellen.
- Weitere lokale Profile können angelegt und beim Anmelden ausgewählt werden.
- Passwörter werden nicht im Klartext, sondern mit scrypt und individuellem Salt als Hash gespeichert.
- Im Desktop-Menü rechts gibt es ein Profilmenü mit Abmelden.
- Apps wie Finder, tagesschau und Aktien öffnen in Fenstern innerhalb des Air-OS-Desktops. Der Finder-Ausbau kann reale Dateien in einem ausdrücklich gewählten Ordner anzeigen.
- Live-Daten von tagesschau und Börsenwidgets benötigen Internet.

## Lokal starten

Voraussetzung: Node.js 22 oder neuer und npm.

    npm install
    npm start

## Installer bauen

Windows: `npm run pack:win`

macOS (DMG und ZIP): `npm run pack:mac`

Linux: `npm run pack:linux`

Pakete landen im Ordner dist/. Der GitHub-Actions-Workflow baut automatisch Installer für Windows und macOS und stellt sie als Build-Artefakte bereit.

## Konten und Sicherheit

Die Konten sind lokal auf dem jeweiligen Gerät gespeichert und werden nicht zwischen PCs synchronisiert. Das Passwort schützt die Air-OS-App-Anmeldung; es ist kein Windows-/macOS-Systemkonto und ersetzt nicht die Betriebssystem-Sperre. Wer Administratorzugriff auf den Computer hat, kann lokale App-Dateien grundsätzlich weiterhin manipulieren. Für vergessene Passwörter gibt es derzeit keine Wiederherstellung.

Electron läuft mit contextIsolation, deaktivierter Node-Integration, Sandbox und einer begrenzten Preload-API. Externe Links werden an den Standardbrowser weitergegeben. Das Paket ist noch nicht mit einem persönlichen Code-Signing-Zertifikat signiert; öffentliche Windows-/macOS-Builds sollten signiert/notarisiert werden.

## Projektgrenzen

Air-OS ist eine Desktop-App, kein bootfähiges Betriebssystem. Sie ersetzt nicht den Windows-/macOS-Anmeldebildschirm und läuft erst, nachdem sich der Benutzer am eigentlichen Betriebssystem angemeldet hat.

## AirCard Lite in Air-OS

AirCard Lite ist direkt in den Air-OS-Desktop integriert und über das Dock erreichbar. Die App kann Artwork lokal pro Wallet-Karte speichern, importieren (Dateiauswahl oder Drag-and-drop) und als Kartendesign vorschauen. Artwork liegt lokal unter `AirCard-Lite/Artwork` im Air-OS-Benutzerordner.

iPhone-Erkennung, Wallet-Scan und „Skin anwenden“ sind nur auf macOS aktiv und werden ausschließlich an ein vorhandenes lokales `AirCardBackendCLI` delegiert. **Dieses Backend ist im bereitgestellten AirCard-Lite-Repo nicht enthalten.** Ohne Backend zeigt AirCard Lite eine entsprechende Fehlermeldung, statt eine Änderung der Wallet vorzutäuschen. Unter Windows ist die App im Air-OS-Dock sichtbar; die AirCard-Bedienfunktionen sind deaktiviert, weil die bestehende Geräte-/Wallet-Integration macOS benötigt.

Die App enthält keine Telemetrie, keinen externen Artwork-Katalog und keinen neu implementierten iPhone-Transport oder Bypass. Ein vorhandenes Backend kann lokal unter `aircard/AirCardBackendCLI` abgelegt und danach in einen neuen Air-OS-Build aufgenommen werden.

## Fensterbedienung (1.0.3)

- App-Fenster lassen sich über die untere rechte Ecke in der Größe ändern.
- Fenster lassen sich innerhalb des Desktop-Bereichs bis in alle vier Ecken ziehen; die Position wird relativ zum Desktop-Fenster berechnet.
- Minimieren und Wiederherstellen animiert das Fenster in Richtung des zugehörigen Dock-Symbols.
- Maximierte Fenster können mit derselben Taste wieder auf ihre vorige Größe und Position zurückgesetzt werden.


## Finder, Air Arcade und Spotify

- Der Finder kann einen lokalen Ordner öffnen, Inhalte auflisten, unterstützte Textdateien bearbeiten und Änderungen direkt in dieser Datei speichern. Nicht unterstützte Dateitypen werden an die im Betriebssystem zugeordnete App übergeben.
- Air-OS fordert die Ordnerauswahl explizit an. Die Dateisystem-IPC-API begrenzt Zugriffe auf diesen Ordner, verweigert Pfad-Ausbrüche und öffnet keine symbolischen Links.
- Air Arcade enthält Snake mit Tastatur- und Richtungstasten-Steuerung. Der Bestwert wird lokal auf dem Gerät gespeichert.
- Spotify öffnet den offiziellen Spotify Web Player im Standardbrowser. Login und Wiedergabe werden von Spotify gehandhabt.

## Geräteübergreifende Cloud

Die Air-OS-Konten sind weiterhin **lokal auf dem Gerät**. Es findet noch keine Synchronisierung zwischen Windows und macOS statt und Dateien werden nicht im Hintergrund hochgeladen. Der empfohlene weitere Ausbau steht in [ROADMAP.md](ROADMAP.md).


## Echte lokale Funktionen statt Platzhalter

Der aktuelle Ausbau ersetzt weitere Demo-Bildschirme durch tatsächliche lokale Abläufe:

- **Einstellungen:** Hintergrund-Presets und eigene Bilder, Akzentfarbe, Dock-Größe, reduzierte Glaseffekte, reduzierte Animationen und Uhrformat werden auf dem Gerät gespeichert.
- **Fotos:** Bilder vom Computer auswählen, als Galerie ansehen und in einer Vollbildansicht öffnen. Es wird nichts automatisch hochgeladen.
- **Musik:** Lokale Audiodateien auswählen und über die native HTML-Audiowiedergabe abspielen.
- **Kalender:** Termine anlegen, lokal speichern, entfernen und als standardisierte \`.ics\`-Datei exportieren.
- **Mail:** Verknüpfungen zu Gmail, Outlook und iCloud Mail öffnen den jeweiligen echten Anbieter; Air-OS zeigt keine erfundenen Nachrichten.
- **Downloads:** Führt in den Finder-Workflow, um den echten Ordner auszuwählen, statt Beispieldateien anzuzeigen.

Diese Daten liegen weiterhin lokal. Kalender-Synchronisierung, ein nativer E-Mail-Posteingang, ein vollwertiger Browser, Cloud-Dateien und ein plattformübergreifendes Benutzerkonto sind noch keine implementierten Funktionen. Die genaue Abgrenzung und nächste Schritte stehen in [ROADMAP.md](ROADMAP.md).

## Repository hygiene

- Do not commit personal email addresses, access tokens, passwords, private keys, local configuration, or logs.
- Keep local secrets in environment variables or GitHub Actions secrets, never in source files.
- `.gitignore` excludes common local configuration, credential, log, and build-output files.
- Air-OS is a local desktop application; review dependencies and Electron permissions before publishing a release.
