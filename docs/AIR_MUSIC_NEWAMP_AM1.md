# AM1 – NewAmp als konkrete Codebasis für Air Musik

25. Oktober2026. Air-OS-Basis/Remote-HEAD **1346006c8d6f0dd8cf96c1fa9a6122d32a7ba0e4**, eigener Branch **docs/air-music-newamp-am1-20261025**. NewAmp geprüft/fixiert auf **d27c765de8ef2bacbc409dd42c1aebae61b2a9bb** (Paket2.7.0). Spicetify separat auf **c3fd98f6fbf922ae944d1ecd64f97c380d04368e**. [Verbindliche Komponenten-Zuordnung](OPEN_SOURCE_BLUEPRINTS.md).

## Ergebnis

NewAmp eignet sich als tatsächliche Quellcodebasis für Air Musik. Geeignet sind besonders seine Transportzustände und Stale-Play-Sicherung, Queue-/Playlistfunktionen, Albumidentität, LRC-Parser und Media-Session-Daten. Ein unveränderter Komplettimport ist technisch und lizenzseitig ungeeignet: NewAmp bringt eine eigene React-/Zustand-/Electron42-App, optionale native Audioverfahren sowie GPL-/MPL-Abhängigkeiten mit. Air-OS bleibt bei seiner bestehenden Electron32-Oberfläche und `music`-App-ID.

**In AM1 wurde kein Player implementiert oder migriert, keine Abhängigkeit installiert und kein NewAmp-Produktcode in Air-OS übernommen.** Tatsächliche Übernahme nur des vollständigen MIT-Lizenztexts als Dokumentationsbeleg; Referenzbilder bleiben externe Originaldateien. Die folgenden Codeübernahmen sind konkrete geplante Ports, keine bereits vorhandenen Air-OS-Funktionen. L1B.3/L1C und sämtliche Produktdateien bleiben unverändert.

[Maschinenlesbares Quelleninventar mit SHA256, Größen, Status, Phasen und direkten GitHub-Links](references/NEWAMP_AM1_SOURCES.json). „Analysiert“ bezeichnet die relevanten Einstiegspunkte/Verfahren, keine vollständige Sicherheitsprüfung aller über900 Repositorydateien.

## 1. Ist-Zustand von Air Music

Die bestehende Air-OS-App ist mehr als die alte Demo in `app.js`: `air-os-enhancements.js` wählt `window.airMusic.body()` und mountet die vorhandene App aus [air-music.js](../air-music.js). [index.html](../index.html) lädt `amplitudejs@5.3.2` und das Modul bereits. Registry-ID **music**, vorhandenes farbiges Air-OS-Musik-Icon, `openApp('music')` und bestehender Fenster-Lifecycle werden weiterverwendet.

Heute vorhanden laut Quellprüfung: lokale Dateiauswahl/Blob-URLs, Play/Pause, Titelsprung, Shuffle/Repeat, Lautstärke/Seek, sitzungsbezogene Dateiliste, Playlistnamen und Datei-Referenzen. Metadaten stammen im Wesentlichen aus Dateinamen, keine echte Cover-/Lyricsfunktion. In AM1 wurde diese Wiedergabe nicht erneut per Audio-GUI abgenommen.

Zwei wichtige Migrationsanschlüsse:

- Playlists liegen gegenwärtig im originweiten `localStorage` unter **air-music-playlists-v1**, ohne Profilkennung. Das ist ein im Code bestätigter fehlender Profilbezug, kein in AM1 neu ausgeführter Datenleck-Exploit. Alte Daten nicht löschen oder still einem anderen Profil zuweisen. AM3 braucht einen erhaltenen Legacybestand plus eindeutig profilbezogenen Import-/Migrationsweg; eine konservative Übernahme muss die unklare Zuordnung berücksichtigen.
- Das Island-Kontrollzentrum liest die Lautstärke über `window.Amplitude.getAudio()`. Ein Enginewechsel muss diesen Verbraucher an denselben echten Audio-Owner anbinden. Das gehört in den späteren Integrations-/Regressionsteil der Migration; kein zweiter Player und keine unabhängig laufende Amplitude-/NewAmp-Wiedergabe. In AM1 bleibt Island-Code bytegleich.

Die aktuell eingebundene AmplitudeJS-MIT-Lizenz (Copyright2021 521 Dimensions) bleibt erhalten, solange Bestandteile mitgeliefert werden. Ein Dokumentationsentscheid ersetzt keine laufende Engine.

## 2. Geprüfte NewAmp-Architektur

| Ebene | Konkrete Originaldateien | Konsequenz für Air-OS |
| --- | --- | --- |
| Renderer-Transport | [src/audio/engine.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/src/audio/engine.ts) |2028 Zeilen; zwei HTMLAudio-Decks, Web-Audio-Graph, Zustandsereignisse, Play-Sequenzschutz, Seek/Volume/Dispose. Geeignete Kernmethoden portieren, nicht die gesamte Spezialaudio-Engine voraussetzen. |
| UI-/Zustand | [usePlayerStore.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/src/store/usePlayerStore.ts), NowPlaying/Library-Views | React18/Zustand5; Store2854 Zeilen und große Views mit vielen Fremdfunktionen. Kleine Verfahren extrahieren und an vorhandenes DOM binden; kein zusätzlicher React-App-/Fensterhost erforderlich. |
| Bibliothek | [electron/library.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/electron/library.ts) |8774 Zeilen, sql.js/WASM-SQLite, Scan/Tagdaten/Art-Cache/Playlists. Ausgewählte Schema-/Verfahrensports, profilbezogener Air-OS-Store statt globalem NewAmp-userData. |
| Lokale Dateiautorisierung | [audio-path-policy.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/electron/audio-path-policy.ts), [audio-protocol-authorize.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/electron/audio-protocol-authorize.ts) | Gute Portkandidaten: erlaubte Roots/geöffnete Dateien, separator-sichere Pfade, Vorprüfung vor Dateisystemzugriff und erneute Prüfung nach realpath. Für Air-OS zwingend zusätzlich an Profil/Sitzung binden. |
| Lyrics | [local-lyrics.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/electron/local-lyrics.ts), [lrclib.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/src/api/lrclib.ts) | Lokale Sidecars/Tags vor Netzsuche;512KiB-Lesebegrenzung, Cache bis64 Einträge. Reinen LRC-Parser separat portieren, automatische Requests/Storage nicht mitkopieren. |
| System-/Medienmetadaten | [shared/media-session.ts](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/shared/media-session.ts) | Validierte Titel/Art/Position und nur bei Änderung/Seek nötiger Sync statt10Hz-IPC. Geeignet für einen gemeinsamen Air-Musik-Zustand; kein fertiger MacLock-Adapter. |
| Native/Erweiterungen | FFmpeg, Mediabunny, AudioWorklet/Exclusive/WASAPI, Visualizer, Radio/Remote/Server | Für AM2 nicht erforderlich und nicht pauschal übernehmen. Keine zweite Electron-Laufzeit oder externe NewAmp-Anwendung als Wrapper. |

Air-OS-Runtime hier tatsächlich ausgelesen: **Electron32.3.3 / Node20.18.1 / Chromium128.0.6613.186**. NewAmp-Paket verlangt Build-Node≥22.12 und verwendet Electron^42.0.1 (Lock42.11.1). Das belegt unterschiedliche Zielumgebungen, keine automatisch bestätigte Inkompatibilität jedes reinen Helpers. Electron/Vite/React/TypeScript werden nicht allein wegen NewAmp aktualisiert.

NewAmp startet einen100ms-Positionstimer für seine umfangreichen Gapless-/Projektor-/Queuepfade. Dieser Takt ist keine Pflicht für einen kleinen lokalen Air-Musik-Player. AM2 beginnt mit nativen Medienereignissen und nur aktiv benötigten UI-Updates; keine Visualizer-/Dauer-RAF-Schleife neben dem bekannten MacLock-Softwareengpass.

## 3. Konkrete Originalübernahmen nach Phase

Jede tatsächliche spätere Übernahme erhält `third_party/newamp/LICENSE`, NOTICE, Fixcommit, Originalhash, Portziel, Änderungen/Begründung und zugehörige Tests. Bei TS→bestehendes JS-Modul bleiben die originalen Algorithmen/Verträge erkennbar; Entfernung nicht benötigter Decoder-/Frameworkpfade wird dokumentiert. Ein umbenanntes frei erfundenes Playback-Modul allein erfüllt den NewAmp-Codebasis-Auftrag nicht.

| Original | Geplante tatsächliche Übernahme | Air-OS-Anpassung / Phase |
| --- | --- | --- |
| `src/audio/engine.ts` | `EngineState`, Ereignisabbildung play/pause/ended/waiting/loadedmetadata/error, `playSeq`/Stale-Rückgabe, relevante Play/Pause/Seek/Volume/Subscribe/Dispose-Teile | AM2: begrenzter lokaler Transportport für zunächst eine Datei; kein EQ-/Exclusive-/Gapless-Unterbau als Pflicht. Genau ein aktiver Owner im vorhandenen Musikmodul. |
| `shared/play-intent.ts` | `createPlayIntentGate()` unverändertes Ticketprinzip | AM2: zusätzlich bestehende Profil-/Sessiongrenze vor/nach asynchronem Play. |
| `shared/playback-start.ts` | Indexnormalisierung und später Wiederherstellung nach Trackidentität | AM2/AM3; keine verwechslungsanfällige neue Queue nach Dateiverlust. |
| `shared/queue-edit.ts`, `queue-insert.ts` | Move/Remove/Append/Play-Next mit aktueller Position und Duplikatsemantik | AM3; ursprüngliche Reihenfolge-/Indexregressionen portieren. |
| `shared/playback-error.ts` | Begrenzte Fehlerversuche/kein endloser Fehler-Skip | AM3; verständliche bestehende Air-OS-Fehleranzeige. |
| `shared/album-key.ts` | Normalisierte Album-Artist-/Albumidentität, kollisionsarmer Separator | AM3; Unicode-/Dateiidentitätsfälle beibehalten. |
| `electron/library.ts`, `shared/types.ts` | Relevante Trackfelder, Scan-/Coververfahren, Playlist-/Positionsschema | AM3; serverseitige Pfade, opaque Track-IDs im Renderer, eine profilgebundene Musikbibliothek als Fachdatenstore. Kein zweiter Preferences-Store. |
| `electron/playlist-cover-guard.ts` | Begrenzte dialoggenehmigte Coverreferenzen | AM3; pro Sitzung, zusätzliche MIME-/Größenprüfung; keine beliebigen Rendererpfade. |
| `src/hooks/useSavedPlaylists.ts` | Load-on-change, bestätigte Ereignisse, Unsubscribe/Stale-Abwehr | AM3; React-Hook in vorhandenen DOM-/Lifecycle-Vertrag portieren. |
| `src/api/lrclib.ts::parseLrc`, `NowPlayingView.tsx::findActive` | Timestamp-/Mehrfachstempelparser, sortierte Zeilen, aktive Zeile anhand echter Position | AM4; Text ausschließlich sicher darstellen, Größen-/Zeitstempelvalidierung ergänzen. Keine fremden Lyrics-Testdaten. |
| `electron/local-lyrics.ts` | Begrenzte lokale Sidecar-/Embedded-Quellen und Cachekonzept | AM4; nur zugelassene aktuelle Dateien/Profil, Cache bei Logout freigeben. |
| `shared/media-session.ts` | Metadaten-/Positionsnormalisierung und `mediaSessionPositionNeedsSync` | AM4; ein echter Air-Musik-Zustand versorgt Views/ggf.OS-MediaSession und später MacLock. Keine Spotify-Medien emulieren. |

Referenztests im Original: `scripts/play-intent-test.mjs`, `queue-store-test.mjs`, `local-lyrics-smoke.mjs`, `embedded-lyrics-test.mjs`, Medien-/Pfadtests. In AM1 gelesen, nicht ausgeführt oder als bestanden ausgegeben; sie verlangen teilweise gebaute TS-Artefakte, esbuild oder Electron42. Testlogik wird mit dem jeweiligen Port gezielt übernommen.

## 4. Lizenzprüfung – keine pauschale MIT-Freigabe des Gesamtpakets

[Original-LICENSE](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/LICENSE), [vollständiger lokaler Lizenzbeleg](references/NEWAMP_AM1_LICENSE.txt): **Copyright(c)2026 NewAmp contributors, MIT**. Copyright/Erlaubnis-/Haftungstext müssen bei Codeübernahme erhalten bleiben. [README-Lizenzabschnitt](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/README.md#license) nimmt Namen und Logo aus: Air Musik verwendet ausschließlich eigene Air-OS-Benennung und bestehendes Originalicon.

Direkte Paket-/Lockmetadaten geprüft; vollständige Lizenztexte der vier kritischen Paket-Tarballs aus deren fixierten `resolved`-URLs gelesen, ohne Installation/Ausführung ihrer Scripts:

| Bestandteil im NewAmp-Lock | Lizenzbeleg | Entscheidung für den Portplan |
| --- | --- | --- |
| NewAmp-eigene ausgewählte TS-/JS-Verfahren |Root MIT |Geeignete Kandidaten oben, Quell-/Änderungsnachweis je Port. |
| `ffmpeg-static@5.3.0` |GPL-3.0-or-later, LICENSE des npm-Pakets gelesen |Nicht für AM2 übernehmen. Separater CLI-Prozess ist keine automatische Befreiung von Paket-/Binärweitergabepflichten. Etwaige spätere FFmpeg-Build-/Codec-/Quellpflichten separat konkret prüfen. |
| `mediabunny@1.50.4` |MPL-2.0, LICENSE gelesen |Nicht für AM2 erforderlich. Falls später gewählt: dateibezogene Lizenz-/Source-Pflichten und konkrete Decodernutzung prüfen; nicht als MIT umdeklarieren. |
| `music-metadata@11.12.3` |MIT, Copyright2026 Borewit; LICENSE gelesen |AM3-Kandidat, erst dann einführen. ESM/Transitive/Packaging separat testen; deklarierte Engines reichen nicht als Laufzeitbeweis. |
| `sql.js@1.14.1` |MIT, Copyright2017 sql.js authors; LICENSE gelesen |AM3-Kandidat für ausgewählten Bibliotheksport; WASM-/SQLite-/weiteren Distributionsumfang nachweisen, keine globale NewAmp-Settingsdatenbank kopieren. |
| React/ReactDOM18.3.1, Zustand5.0.13 |MIT laut Lock |Framework nicht zwingend für reine Funktionsports; in AM1 nicht eingeführt. |
| Butterchurn/Presets, QR-Code |MIT laut Lock, zugehörige Fremdinhalte separat zu prüfen |Nicht für angeforderte erste Musikphasen erforderlich, keine Visualizer-/Remote-Funktionen nebenbei. |
| `native/newamp-audio/miniaudio.h` |Header/Ende: Public Domain oder MIT-0, Copyright2023 David Reid |Nicht für AM2 auswählen; keine fremde vorkompilierte `.node`-Datei/zweite Audio-Runtime bundeln. |
| Vier gebündelte WOFF2-Fonts |Keine separaten Font-Lizenzdateien im Repository gefunden; eingebettete Metadaten hier wegen fehlender Brotli-Erweiterung nicht ausgelesen |Nicht übernehmen. Air-OS-System-/bestehende lizenzierte Fonts verwenden; keine ungeprüfte OFL-/MIT-Behauptung. |
| Cover, Song-/Künstlerbilder, Lyrics, Markenassets |Nicht durch die Root-Softwarelizenz pauschal freigegeben |Keine Produktassets kopieren. Nutzerdateien nur lokal/verlangt verarbeiten; referenzierte Originalscreenshots extern belassen. |
| Spicetify CLI Fixstand siehe Zuordnung |Root LICENSE LGPL-2.1 gelesen, **nicht MIT** |Optionale separate AM5-Prüfung, keine automatische Kopie/Installation im lokalen Player. |

Das Lock enthält daneben z.B.CC-BY-4.0 (`caniuse-lite`) und Python-2.0 (`argparse`) in der Gesamt-Toolchain. AM1 ist eine gezielte Vorprüfung, keine vollständig aufgelöste transitive Lizenz-/Sicherheitszertifizierung. Vor tatsächlicher Abhängigkeitseinführung ist ein Inventar des **ausgelieferten** Dependencybaums einschließlich Binärdateien/Fonts/Notices erforderlich. In AM1 bleiben `package.json`, Lockfile und Installer vollständig unverändert.

## 5. Architekturentscheidung für AM2–AM4

**Ein Host:** vorhandene Registry-ID `music`, `openApp('music')`, Fensterverwaltung und Profil-Lifecycle. Der bestehende Air-Musik-Inhalt erhält später den NewAmp-basierten Port. Kein `newamp.exe`, kein zweites `app.whenReady`, keine zusätzliche komplette Electron-Instanz und keine fremden Hauptfenster-/Fensterknöpfe.

**AM2 lokal und begrenzt:** eine ausdrücklich ausgewählte MP3-/FLAC-Datei über vorhandenen Browser-Dateidialog/File/Blob-URL; ein Audio-Owner, Play/Pause, bestätigte Audiozustände/Fehler und Cleanup. NewAmps Native-Decoder/FFmpeg sind dafür nicht automatisch Voraussetzung: zuerst die vorhandenen Electron-/Chromium-Decodiermöglichkeiten mit echten synthetischen MP3-/FLAC-Dateien testen. `canPlayType` allein ist kein Wiedergabenachweis; bei nicht unterstützter Datei ehrlich fehlschlagen, keinen anderen Decoder als vorhanden ausgeben. Keine neue Bibliotheksdatenbank oder große Main-IPC in AM2.

**AM3 Fachdaten:** persistente Bibliothek, Cover und Playlists an authentifizierte Profile binden; vorhandene Preferences behalten ihre eigene Funktion. Einen gewählten Musik-Fachdatenstore/ausgewählte NewAmp-Schemateile verwenden, nicht zwei konkurrierende Musikdatenbanken. Alte Playlistnamen/-Referenzen und nicht gefundene Dateien erhalten; keine verdeckte Neuordnung/Übernahme originweiter Legacydaten. Persistenz mit bestätigter Speicherung/Retry. Für dauerhafte Dateien ist eine sitzungsgebundene Main-Freigabe/opaque Trackreferenz mit echter Pfadprüfung nötig; nie vom Renderer frei gewählte absolute Dateipfade ausführen/streamen. Autorisierung vor Dateisystemzugriff schützt auch vor unerwünschten UNC-/Netzzugriffen; realpath danach erneut abgleichen.

**Keine pauschale Main-/Preload-Kopie:** NewAmp-Main enthält eigene breite IPC-/Protokollpfade und `sandbox:false`-Fensteroptionen. Air-OS behält `sandbox:true`, `contextIsolation:true`, `nodeIntegration:false`, vertrauenswürdige Senderprüfung und vorhandene Profilrechte. Keine Sandbox-Abschaltung aus README/Entwicklungsflags übernehmen. Begrenzte Main-Erweiterungen erst in der jeweiligen echten Implementierungsphase.

**AM4 Lyrics:** zuerst lokale `.lrc`-/Embedded-Daten aus erlaubten Dateien, eigene synthetische Prüflyrics; keine geschützten Songtexte in Tests/Repository kopieren. NewAmp führt laut README Lyrics-/Wikipedia-Abfragen teils automatisch ohne Off-Schalter aus. Diese Netzwerk- und Cachepfade nicht unverändert übernehmen. Etwaige spätere Onlinedienste benötigen einen klaren Zweck, passende Rechte/Nutzungsbedingungen und profilbezogene Cachegrenzen; für AM4 lokale Nutzung reicht zunächst der reine Parser.

**AM4 Now Playing und Datenschutz:** ein echter Zustand mit Track-ID, Titel/Künstler, Dauer/Position, Play/Pause und lokaler Artworkreferenz; Profil-/Sessionkennung und Stale-Gates. Medienposition extrapolieren/coalescen statt permanenter Cross-Window-IPC. Private Dateipfade nicht im Lock-/UI-Payload. Auf Logout stoppen, Objekt-URLs/Metadaten/Caches entfernen, verspätete Antworten verwerfen.

Wichtige heutige Grenze: MacLock ist derzeit die **unauthentifizierte Air-OS-Anmeldeseite nach Logout**, kein authentifiziertes App-Lock mit weiterlebender Session. Sie darf nicht alte Now-Playing-Titel/Lyrics eines abgemeldeten Profils anzeigen. Eine spätere echte Now-Playing-Anbindung braucht deshalb ein ausdrücklich entworfenes, sicheres Session-/App-Lock-Modell oder bleibt auf eingeloggte Oberflächen beschränkt. L1C-Demo-Player bleibt davon getrennt; Demo wird nicht als reale Medienquelle ausgegeben. In AM1 wird weder Login noch L1B.3/L1C geändert.

## 6. Spotify / Spicetify separat

Spicetify ist ein Community-CLI zur Anpassung des installierten offiziellen Spotify-Clients, keine Musikdateibibliothek und keine Ersatz-Audioengine. Der vorhandene sichere native Air-OS-Spotify-Launcher bleibt unverändert. AM5 prüft gesondert Installation, Version/Kompatibilität, Backup/Restore, Lizenz der CLI und jeder Extension/Themes sowie tatsächlich zulässige Schnittstellen. Keine automatische Clientmodifikation oder Installation in AM1–AM4.

Keine Spotify-Audiokopien, Extraktion, DRM-/Zugriffsumgehung oder erfundene Premium-/Remote-Funktion. Ein vorhandener Launcher belegt nur eine angeforderte Öffnung, keine Medienkontrolle. Spotify-Web-API/SDK-Berechtigungen, Nutzungsbedingungen und Plattformgrenzen vor ihrer konkreten Nutzung prüfen; eine Spicetify-Extension ist nicht automatisch eine offiziell freigegebene Spotify-API.

## 7. Kleine Folgeeinheiten und Abnahmekriterien

| Phase | Begrenzte Lieferung | Verbindlicher Nachweis |
| --- | --- | --- |
| **AM1, jetzt** | Diese Analyse, Quellen-/Lizenzinventar, Vorlagenzuordnung und Referenzbilder | Dokumentationsänderungen; kein Player-/GUI-/Codec-Erfolg behauptet. |
| **AM2** | Ein echter lokaler Track, NewAmp-Transportkern/Intent-Gate, Play/Pause, sicherer Cleanup | Synthetische MP3 und FLAC tatsächlich abspielen; Fehler/Retry, schnelle Wechsel, Stop/Logout/Close, Profile, Tastatur; bestehende Island-Lautstärke an denselben Owner erhalten. Kein Decoder-/Frameworkkomplettimport. |
| **AM3.1–3.3** | Bibliotheks-/Metadatenport, danach Cover, danach persistente Playlists/Fortschritt | Profilgetrennte Speicherung/Legacyerhalt, fehlende Dateien/Duplikate/Reihenfolge, sichere Cover und Seekgrenzen, Neustart/Retry. |
| **AM4** | Lokaler LRC-Port und echter Now-Playing-Datenvertrag, danach sichere MacLock-Anbindung | Lyrics synchron zur echten Position; Session-/Logout-/Stale-Grenzen, kein privater Leak auf unauthentifizierter Loginseite. Kein vorgetäuschter Spotify-/Systemplayer. |
| **AM5** | Optionale separate Spotify-/Spicetify-Integration | Reale Installation/APIrechte/Version, reversible Anpassung, keine Audioextraktion; separate Lizenz-/Regressionseinheit. |

Jede Produktphase später bei1920×1080,1650×930,390×600 in echtem Electron prüfen, Windows/macOS gesondert nativ. Mint-/Creme-Arbeitsflächen und Air-OS-eigene farbige Icons bleiben; NewAmps neonfarbene Retrohaut/komplette Shell sind kein Auftrag, das Air-OS-Design global umzubauen. Keine erfundenen Bibliotheken oder Fortschrittszahlen aus Referenzscreenshots übernehmen.

## 8. Tatsächliche Referenzbilder

Die folgenden Bilder sind **Originaldateien aus dem fixierten NewAmp-Repository**, hier visuell betrachtet und direkt verlinkt. Sie zeigen laut sichtbarer Titelleiste **v2.1.0**; der analysierte Quellstand meldet Paket2.7.0. Keine behauptete aktuelle2.7-GUI-Abnahme, keine Air-OS-Integration, kein neu ausgeführter Originalplayer. Cover/Marken bleiben beim externen Ursprung; keine Bilddatei in Air-OS kopiert.

| Now Playing | Library |
| --- | --- |
| [![NewAmp originale Now-Playing-Referenz](https://raw.githubusercontent.com/Evilander/newamp/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/assets/screenshots/real/real-now-playing.png)](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/assets/screenshots/real/real-now-playing.png) | [![NewAmp originale Bibliotheksreferenz](https://raw.githubusercontent.com/Evilander/newamp/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/assets/screenshots/real/real-library.png)](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/assets/screenshots/real/real-library.png) |

Zusätzliche [Albumraster-Referenz](https://github.com/Evilander/newamp/blob/d27c765de8ef2bacbc409dd42c1aebae61b2a9bb/assets/screenshots/real/real-albums.png). Direkte Raw-/Blob-URLs und SHA256 im Quelleninventar. Geprüfte Raw-Links der drei Bilder, LICENSE und Engine: HTTP200.

## 9. Verifikation und offener Umfang

Die bestehende Air-OS-Testsuite wurde in dieser Dokumentationseinheit neu ausgeführt: **300/300 bestanden**,0 Fehler/Skips. Keine neuen Funktionstests für noch nicht implementierten Musikcode. Quelleninventar/Hashes, lokale Dokumentlinks und reiner Dokumentationsdiff geprüft. Keine Abhängigkeiten installiert, keine NewAmp-Scripts/Installer ausgeführt, keine Audiodatei decodiert und keine neue Electron-GUI-Abnahme behauptet.

Kritische Lizenztexte direkt aus fixierten npm-Tarballs gelesen, Fonts nicht freigegeben, vollständiger ausgelieferter/transitiver Audit später erforderlich. Keine Abnahme von MP3/FLAC/Metadaten, Fremddecoder oder konkreter Spotify-API vorweggenommen. Bestehende MacLock-/native Plattform-/Performance-/CB-03-/Releaseblocker bleiben offen. PR-/Actions-Lesezugriff hier Forbidden; kein neuer CI-Erfolg behauptet. main, PRs, Installer und sämtliche Produktquellen unverändert.

Nächste drei getrennte Einheiten: **AM2 ein Track mit originalem Transportport**, **AM3.1 profilbezogene Bibliothek/Metadaten**, **AM3.2 Cover/Playlists als weiterer kleiner Schritt**. L1C bleibt unabhängig, AM4/AM5 werden nicht vorweggenommen. Nach Dokumentationscheckpoint STOP.
