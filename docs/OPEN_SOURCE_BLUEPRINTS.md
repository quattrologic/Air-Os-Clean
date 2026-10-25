# Verbindliche Open-Source-Vorlagen für Air-OS Ultimate

25. Oktober2026. Diese Zuordnung ist ab jetzt maßgeblich für Design- und Entwicklungsplanung. „Offiziell“ bezeichnet die Auswahl des Air-OS-Projekts, keine Partnerschaft oder Freigabe durch Spotify/andere Hersteller. Produktnamen und Icons bleiben Air-OS-eigen.

| Air-OS-Bereich | Verbindliche Vorlage | Rolle und geprüfter Stand |
| --- | --- | --- |
| **LOCKSCREEN** | [MacShell / MacLock](https://github.com/0-ss/MacShell) | Layout, Materialien und Interaktionen; bisheriger Fixstand `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, MIT; Open-Runde-Fonts separat OFL. [L1B.3-Bericht](AIR_MACLOCK_L1B3_MORPH.md). |
| **AIR MUSIK** | [NewAmp](https://github.com/Evilander/newamp) | Konkrete Codebasis für geeignete Player-/Bibliotheks-/Lyrics-Verfahren, nicht nur Stilvorbild. AM1-Fixstand `d27c765de8ef2bacbc409dd42c1aebae61b2a9bb`, Paket2.7.0. Root MIT; Name/Logo ausgenommen, Abhängigkeiten separat prüfen. [AM1-Analyse und Portplan](AIR_MUSIC_NEWAMP_AM1.md). |
| **SPOTIFY, optional** | [Spicetify CLI](https://github.com/spicetify/cli) | Separates Community-Werkzeug zur Anpassung des installierten offiziellen Spotify-Clients; geprüfter HEAD `c3fd98f6fbf922ae944d1ecd64f97c380d04368e`, LGPL-2.1. Keine lokale Audio-Engine, keine Rechte zur Spotify-Audioextraktion. |

Air-OS behält seine einzige Electron-Laufzeit, App Registry, Fensterverwaltung und Profil-/Authgrenzen. Kein NewAmp-Electron neben Air-OS, kein zweites Dock/Island und keine ungeprüfte Übernahme fremder Logos, Fonts, Cover oder Lyrics. Bestehende Hybrid-/Mint-/Creme-Entscheidungen bleiben gültig; NewAmp-Funktionen werden in Air-OS-eigene Oberflächen eingebettet.

AM1 ist ausschließlich Analyse/Dokumentation. Der aktuelle Air-Music-Bestand verwendet weiterhin AmplitudeJS; eine Migration hat noch nicht stattgefunden. L1B.3 bleibt als abgeschlossener Commit erhalten, L1C bleibt ein separat beauftragter MacLock-Arbeitsstrang.

## Air-Musik-Roadmap

1. **AM1:** Code-, Lizenz- und Architekturprüfung sowie konkrete Originalübernahmekandidaten. Mit diesem Dokumentationscheckpoint vorbereitet; keine Produktimplementierung.
2. **AM2:** Eine echte lokale MP3-/FLAC-Datei mit Play/Pause, bestätigten Fehlerzuständen und Cleanup im bestehenden `music`-App-Pfad. Zuerst ein begrenzter Originalcodeport.
3. **AM3:** Profilbezogene Bibliothek, Cover, Playlists und Fortschritt. In kleine Daten-/Cover-/Playlist-Schritte teilen; bestehende Playlistdaten erhalten.
4. **AM4:** Lokale synchronisierte Lyrics und sichere Now-Playing-Verbindung. Abmelden beendet private Medienzustände; die aktuelle unauthentifizierte Loginseite erhält keine alten Titel. Ein authentifiziertes App-Lock-Sitzungsmodell wäre gesondert zu entwerfen.
5. **AM5:** Optionale Spotify-/Spicetify-Anbindung getrennt prüfen. Nur zulässige Schnittstellen; keine Audioextraktion, DRM-/Werbe-/Zugriffsumgehung oder behauptete Spotify-Funktion ohne echte Integration.

Die AM-Reihe überschreibt weder L1C noch bisherige Plattform-/Performance-/Releaseblocker. Die jeweils nächste Einheit beginnt nur auf gesonderten Auftrag.
