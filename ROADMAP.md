# Air-OS — Ausbauplan

Ziel: Air-OS soll sich wie ein eigenständiger, liebevoll gestalteter Desktop im Mac-OS-X-Yosemite-/2014-Stil anfühlen und auf Windows und macOS dieselben Apps, Konten und Dateien anbieten. Es bleibt zunächst eine Electron-Desktop-App und kein bootfähiges Betriebssystem.

## Bereits im Feature-Branch

- **Finder mit echten Dateien:** Nutzer wählen bewusst einen lokalen Ordner. Air-OS kann darin Ordner und Dateien auflisten, unterstützte Textdateien öffnen, neu anlegen und speichern. Andere Dateien werden über die im Betriebssystem zugeordnete App geöffnet.
- **Begrenzter Dateizugriff:** Die Oberfläche übergibt keine absoluten Dateipfade. Der Electron-Hauptprozess prüft den ausgewählten Arbeitsordner, verweigert Pfad-Ausbrüche und überspringt symbolische Links. Der Texteditor ist vorerst auf 2 MB pro Datei begrenzt.
- **Air Arcade:** Ein spielbares Snake-Minispiel mit Pfeiltasten/WASD, Touch-Schaltflächen und lokal gespeichertem Bestwert.
- **Spotify:** Die Spotify-Kachel öffnet den offiziellen Spotify Web Player im Standardbrowser. Die Anmeldung und Wiedergabe werden nicht nachgebaut; Spotify-Zugangsdaten werden nicht von Air-OS gespeichert.

## Phase 1 — Desktop-Grundlagen stabilisieren

1. Fenster-/Dock-Verhalten, Fokus, Tastaturbedienung und Größenanpassung auf Windows und macOS testen.
2. Finder um Vorschau für Bilder/PDFs, Sortierung, Favoriten, Drag-and-drop und kontrolliertes Verschieben/Kopieren erweitern.
3. Notizen und Einstellungen vom allgemeinen localStorage auf getrennte, versionierte Nutzerdaten umstellen.
4. Automatische Tests für Pfadvalidierung, Textgrenzen, Dateitypen, Speichern und IPC-Berechtigungen ergänzen.
5. Windows- und macOS-Builds bei Pull Requests ausführen; Installer später signieren/notarisieren.

## Phase 2 — Ein Air-OS-Konto auf Mac und Windows

Die jetzigen Konten sind lokal. Sie lassen sich nicht automatisch auf ein anderes Gerät übertragen. Für echten geräteübergreifenden Login braucht Air-OS einen zentralen Identitätsanbieter und einen sicheren Sitzungsablauf.

Vorgeschlagene Umsetzung:

- **Supabase Auth** für Registrierung, Login, Passwort-Reset und verifizierte E-Mail; zuerst E-Mail/Passwort oder Magic Link, OAuth erst später.
- **Sicherer Token-Speicher:** Sitzungsgeheimnisse nicht in Klartext in den normalen Web-Storage legen. Auf Electron-Seite einen Betriebssystem-geschützten Speicher verwenden und den Auth-Flow mit PKCE und klarer Rücksprung-URL umsetzen.
- **Datenmodell:** Profileinstellungen, Notizen und App-Daten in einer Datenbank; Dateiinhalte in privaten Storage-Buckets. Jede Zeile und Datei ist serverseitig dem authentifizierten Benutzer zugeordnet.
- **Zugriffsschutz:** Row-Level Security und Storage-Policies, die ausschließlich den eigenen Benutzerordner erlauben. Service-Role-Schlüssel oder andere Servergeheimnisse dürfen nie in einem Desktop-Installer landen.
- **Offline zuerst:** lokale Arbeitskopie, Upload-Warteschlange, Versionsnummer/Hash, Wiederholungen und ein verständlicher Konfliktdialog. Bei parallelen Änderungen Dateien lieber als Konfliktkopie erhalten statt still zu überschreiben.
- **Bewusste Aktivierung:** lokale Profile werden nur nach Zustimmung mit einem Cloud-Konto verknüpft. Die Cloud muss nicht eingerichtet sein, damit die lokale Demo funktioniert.

## Phase 3 — Dateien synchronisieren

1. Jede Datei erhält eine stabile ID, relativen Pfad, Größe, Hash, Änderungszeit und Revisionsnummer.
2. Änderungen werden erst lokal gespeichert und anschließend verschlüsselt per TLS synchronisiert.
3. Bei erneutem Login lädt der Client die Metadaten und stellt Dateien auf Windows und macOS wieder her.
4. Löschen, Versionierung, Papierkorb, Kontolöschung und Export/Backup werden vor öffentlicher Freigabe umgesetzt.
5. Größenlimits, Speicherquote und Upload-Fortschritt werden in Einstellungen angezeigt.

## Phase 4 — Apps, Medien und Alltagstauglichkeit

- **Spotify:** wenn eine Integration innerhalb des Fensters gewünscht ist, ausschließlich offizielle Spotify-Embeds/APIs und den aktuellen Spotify-Entwicklerbedingungen folgen; keine Zugangsdaten abfragen oder kopieren.
- **Browser:** in-app Web-Inhalte nur mit eigener Isolation und klaren Berechtigungen einbetten. Für externe Seiten ist der Standardbrowser vorerst sicherer.
- **Mail und Kalender:** richtige Provider-Anbindung über deren offizielle OAuth-APIs, nicht mit vorgetäuschten Demo-Daten.
- **Fotos/Downloads:** Dateisystem-basierte Ansichten statt Platzhalterobjekte.
- **App-Einstellungen:** skalierbares Dock, Light/Dark/Reduced Motion, mehrere Wallpaper, Tastenkürzel, Fensterzustand und Barrierefreiheit.
- **Mac-/Windows-Parität:** plattformspezifische Dialoge, Pfade, Tastenkürzel, Updates und Installer gezielt testen.

## Architektur- und Open-Source-Referenzen

Diese Projekte sind technische Referenzen; ihre Oberflächen werden nicht ungeprüft in Air-OS kopiert.

- [WinBox](https://github.com/nextapps-de/winbox) — Apache-2.0, HTML5-Fenstermanager. Vergleichspunkt für Fensterzustände und API-Design; Air-OS besitzt bereits einen eigenen Fenstermanager.
- [React95](https://github.com/React95/React95) — UI-Komponenten im Windows-95-Stil. Nützlich als Beispiel für konsistente nostalgische UI-Komponenten, aber nicht als direktes Design- oder Abhängigkeitsziel: Air-OS bleibt beim Aqua-/Yosemite-Look.
- [Supabase JavaScript SDK](https://github.com/supabase/supabase-js) — Auth, Datenbank und Storage als mögliche Basis für die geräteübergreifende Anmeldung und Synchronisierung.
- [browser-fs-access](https://github.com/GoogleChromeLabs/browser-fs-access) — Referenz für Dateiauswahl und Dateizugriff in einer späteren Browser-Version. In der Electron-App werden lokale Dateien über den geprüften Main-/Preload-Kanal angesprochen.

Vor Übernahme von Code oder Bibliotheken müssen Lizenz, Wartungsstatus, Plattformunterstützung, Sicherheitsmodell und Paketgröße geprüft werden.

## Nicht als erledigt betrachten

Cloud-Login, Cloud-Speicher und geräteübergreifende Synchronisierung sind in diesem Stand **noch nicht implementiert**. Der aktuelle Login bleibt lokal; lokale Dateien werden nicht automatisch hochgeladen. Ein kompletter Cloud-Ausbau braucht zusätzlich Projektkonfiguration und echte Tests mit einem bereitgestellten Backend.
