# Air-OS iPad — Ultra Security Hardening

## Stand und unveränderte Installation

Fortsetzung des bereits begonnenen Auftrags auf `feat/air-os-ipad-ultra-security-hardening`, Ausgangscommit `0cc6f31d5f810d72cf695c5579b40eca7ec5e717`. Der zuletzt zuvor vollständig geprüfte Produktcode war `4fa5ea951f43a7c643d7011e351c3e60595b50fd` (CI 42634335969); dazwischen liegen ausschließlich dessen Nachweise und Dokumentation.

Keine Veröffentlichung, kein Merge, kein Zugriff auf ein Spotify-Konto, keine Änderung an Tailscale, Windows-Serve-Ordner oder installierter PWA. Alle Angriffe, Daten und Browserprofile sind isolierte synthetische Testfälle auf IPv4-Loopback. Keine Musikmigration, kein Löschen einer bestehenden Datenbank.

## Quellen und übertragbare Sicherheitsprinzipien

Die tatsächlich gelesenen Originaldateien, Commits und SHA-256 stehen in [security/source-references.json](security/source-references.json):

- Vanadium `99a6c8285bf88edf55d7614e8ceb247350620d52`: README, LICENSE sowie konkrete Patches für Netzwerkvorhersage, Site-/Origin-Isolation und Cross-Origin-Referrer. Patchlizenz GPL-2.0-only mit den dortigen Ausnahmen.
- Auditor `cfcd2450ae6fb1ef601ac531e3c7c2e4326dc7f8`: README, MIT-Lizenz, `AttestationProtocol.java`, `RemoteVerifyJob.java`, `network_security_config.xml`; insbesondere frische Challenges, überprüfte Zustände und eingeschränkte Kommunikationsziele.
- Offizieller Website-Quellcode `GrapheneOS/grapheneos.org`, `aa9a49f4d93393d7d4582d5cf675bdf80559a23d`: MIT-Lizenz und tatsächliches `static/features.html`. Der direkte Abruf von `grapheneos.org/features` wurde vom Umgebungsproxy mit HTTP 403 abgewiesen; stattdessen wurde der offizielle, fest referenzierte Websitecode gelesen.

Kein Android-, Chromium- oder Attestation-Originalcode wurde übernommen. Eigenständige Webanpassungen übertragen begrenzte Angriffsfläche, minimale Berechtigungen, explizite Zielprüfung, frische einmalige Challenges und geprüfte Zustandsübergänge. Die bestehenden Air-OS-/MIT-/AGPL-Herkunftsnachweise und das vollständige Sourceangebot bleiben im PWA-Paket.

Diese PWA kann weder WebKit-Prozessisolation/JIT-Konfiguration noch Verified Boot, Hardware-Attestation oder TLS-Zertifikat-Pinning des Browsers implementieren. HTTP `Origin-Agent-Cluster` ist nur eine Browseranforderung und kein Nachweis eines eigenen Sicherheitsprozesses.

## Konkrete Befunde und Korrekturen

Bewertung bezieht sich auf die bisherige PWA und die jeweils genannten Angriffsbedingungen; kein unabhängiges Penetrationstest-Zertifikat.

| Befund | Gewichtung / Voraussetzung | Korrektur und Nachweis |
| --- | --- | --- |
| Nicht im BFCache verbleibende OAuth-Ausgangsnavigation entfernte den noch benötigten Verifier | Mittel, funktionaler Anmeldefehler | `pagehide` löscht RAM-Tokens und beendet Anfragen, erhält aber die einmalige PKCE-Transaktion für die Rückkehr; echte Dokumentnavigation zum simulierten Provider und zurück getestet |
| Unvollständige Validierung gespeicherter PKCE-Daten und mehrdeutiger Rückleitungen | Niedrig bis mittel, teilweise manipulierte Same-Origin-Sitzungsdaten nötig; kein nachgewiesener entfernter Account-Takeover | Exakt gebundene Client-ID, Redirect, State, Verifier, Felder und Zeitfenster; doppelte, implizite, gemischte, falsch geschriebene oder abgelaufene Parameter abweisen |
| Callback-Parameter blieben bis zur späteren Initialisierung in der URL | Mittel, unnötige Offenlegung innerhalb des Dokuments | Synchrones lokales Bootstrap-Script entfernt OAuth-Daten aus Query und Fragment vor der übrigen Laufzeit; Referrer grundsätzlich `no-referrer` |
| Tokenantworten und Redirects waren nicht ausreichend eingegrenzt | Mittel bei manipuliertem Provider-/Transport-Endpunkt; HTTPS bleibt Voraussetzung | Nur feste HTTPS-Endpunkte, keine Fetch-Redirects/Cookies/Referrer; begrenztes JSON, strenge Bearer-/Scope-/TTL-Prüfung, sichere Fehlermeldungen |
| Späte Antworten konnten eine lokale Trennung überholen; andere Tabs behielten eigene Sitzungen | Mittel, Lebenszyklusproblem | Epoch-/Client-Bindung, AbortController, einmaliger Grant, ausschließlich lokale Disconnect-Nachricht über BroadcastChannel; verspätete Antworten und mehrere Tabs getestet |
| Worker konnte umgeleitete Authentifizierungs-HTML als Startseite übernehmen; Dateigenerationen waren nicht durchgehend geprüft | Mittel bis hoch bei manipuliertem Hosting, Antworten oder Cache-Inhalten | Alle Shell-Bytes mit eingebetteten SHA-256 und Größen prüfen, komplette Generation zunächst separat laden; Redirects/HTML statt JS/Abweichungen ablehnen; Cache-Leseprüfung und SRI |
| Updatebestätigungen waren an den vom Anforderer gelieferten Wert gebunden | Mittel, manipulierte Same-Origin-Clients/Bestätigungen nötig | Worker erzeugt frischen Nonce mit 10-Sekunden-Frist, prüft echte Client-Identität und Scope, verlangt Zustimmung aller lebenden Clients, kontrolliert neue Tabs nochmals; Replay und fremde Bestätigungen abgewiesen |
| Rekursive Paketaufnahme konnte versehentlich abgelegte zusätzliche Dateien einbeziehen | Mittel, versehentliches Ablegen im Quellbaum nötig | Explizite Runtime-/Source-Dateiliste; unbekannte Runtime-Dateien und Symlinks vor Sourcepaketerstellung abweisen; private Testdatei bleibt unangetastet und wird nicht eingepackt |
| HTTP-Header der bestehenden privaten Bereitstellung sind hier nicht kontrolliert | Offen, betrifft tatsächlichen Server | Separater getesteter Header-Adapter vorbereitet, strikt an `127.0.0.1` gebunden; nicht an Tailscale angeschlossen, keine Produktionsheader als geändert behauptet |

## Spotify: verbleibender, einzelner Controller

`ipad/spotify.js` bleibt der bestehende Besitzer der Kontoverbindung; `ipad/core/security.js` ergänzt reine Validierung und frühes URL-Scrubbing. Musikengine, Metadatenpriorisierung, Widget, MacLock und Cover-Speicherung bleiben unverändert.

- Authorization Code mit S256-PKCE, zufälliger 64-Zeichen-Verifier und State; temporäre Transaktion im bestehenden `sessionStorage`-Schlüssel. Akzeptiert höchstens zehn Minuten, maximal eine Sekunde Zukunftstoleranz, danach ungültig. Verbrauch vor dem Tokenaufruf verhindert Replay.
- Exakte Redirectbindung an `location.origin + location.pathname`; öffentliche 32-stellige Client-ID. Keine Passwörter oder Client-Secrets.
- Ausschließlich `user-read-playback-state`, `user-read-currently-playing`, `user-read-recently-played`. Keine Schreibrechte oder Wiedergabesteuerung hinzugefügt.
- Access- und Refresh-Token nur im Dokument-RAM, Tokenlaufzeit höchstens eine Stunde, absolute RAM-Sitzung höchstens acht Stunden. Kein dauerhaftes Refresh-Token, kein Token in IndexedDB, Backup, Cache oder Logs. Nach Dokumentneustart erneute Anmeldung. JavaScript garantiert keine physische Speicherlöschung; Browser-/OS-Zugriff bleibt außerhalb dieser Schutzgrenze.
- API-Anfragen höchstens bestehende sichtbare Wiedergabeabfragen, bei verborgenem Dokument angehalten; feste Ziele, 12-Sekunden-Timeout, Antwortlimit 1 MB und Retry-After-Beachtung. Keine neuen Hintergrunddienste.
- „Spotify trennen“ verwirft lokale Tokens, Verifier, laufende Anfragen, Timer und Anmeldeversuche und benachrichtigt offene Tabs desselben Scopes. Browser ohne BroadcastChannel haben nur die lokale Dokumenttrennung.
- **Die lokale Trennung widerruft nicht automatisch die erteilte Berechtigung im Spotify-Konto.** Vollständiger Provider-Widerruf zusätzlich unter <https://www.spotify.com/account/apps/> durch den Kontoinhaber. Dieser Hinweis steht hier, damit die geschützte bestehende Oberfläche unverändert bleibt.
- Zuletzt zuverlässig bekannte Songdaten und freigegebene Cover bleiben absichtlich in der bestehenden Metadatenablage. Sie lassen sich über deren vorhandene Löschfunktion entfernen; keine Tokenablage dort. Eine PWA kann keine systemweite native iPadOS-Musikerkennung anbieten.

## Browser, DOM und externe Verbindungen

CSP bleibt auf lokale Scripts ohne `eval` beschränkt und verbietet ausdrücklich Scriptattribute, fremde Frames, Objekte und Base-URLs; Worker, Fonts und Manifest nur vom eigenen Origin. Statische lokale Scripts/Styles tragen SHA-256-SRI. `style-src 'unsafe-inline'` bleibt für die bestehende Oberfläche erforderlich; kein ungetestetes Trusted-Types-Zwangsregime für Safari eingeführt.

Gespeicherte Notizen, Aufgaben, Titel und Metadaten werden über DOM-Text-/Value-Eigenschaften dargestellt. Vorhandene `innerHTML`-Verwendungen für feste geprüfte Editor-/Spieltemplates sind keine neu eingeführten Daten-Sinks. Ein gespeichertes `<img onerror=…>`-Notizpayload, Inline-Scripts, Eventattribute und eine fremde Base-URL werden im echten Browser negativ getestet. Das ist gezielte Regressionserkennung, keine vollständige formale XSS-Freiheitsgarantie.

Verbindungen:

| Ziel | Auslöser / Daten |
| --- | --- |
| Eigener privater Origin | App-Shell, Manifest, Versionsprüfung, Sourcepaket und Worker; keine persönliche Musik-/Dokumentübertragung |
| `accounts.spotify.com` | Nur nach freiwilliger Anmeldung: öffentlicher OAuth-Client, PKCE-Codeaustausch/Refresh; keine Cookies bei API-Fetches |
| `api.spotify.com` | Autorisierte drei bestehende Lese-Endpunkte; Bearer ausschließlich im Authorization-Header |
| `i.scdn.co`, `mosaic.scdn.co` | Validierte echte Cover nach bestehender Spotify-Zustimmung; vorhandene lokale begrenzte Coverkopie bleibt erhalten |
| Externe App-Links | Nur ausdrücklicher Nutzeraufruf: Outlook, DeepL, ChatGPT, Tagesschau, Open-Meteo, Kicker, Börse Frankfurt, Spotify und vom Nutzer im Air-Web eingegebene zulässige HTTPS-Adressen; separate Navigation mit bestehenden sicheren Linkattributen |
| GitHub/Originalquellen | Entwicklungs-/Source-Links, keine automatische Telemetrie der laufenden PWA |

Keine neuen Tracker, Analyse-, Cloudspeicher- oder Werbedienste. Kein unnötiges Vorladen fremder Ursprünge. Bestehende App-Funktionen und erlaubte Spotify-Bilder werden durch die CSP nicht entfernt.

## Worker, Integrität und Rückfall

Der vorhandene Worker bleibt einziger Cache-/Updatebesitzer (`scripts/templates/ipad-service-worker.js`). Build schreibt `sw.js`, `version.json` und SRI deterministisch aus den tatsächlichen Bytes. Version bleibt kompatibel `air-os-ipad-v5-<Hash>`, ändert sich aber bei Runtime-, Sourcepaket- oder Workeränderung.

Install: begrenzte Parallelität, vollständiges separates Staging, Status/MIME/Redirect/Größe/SHA-256 prüfen, erst dann komplette Generation publizieren. Fehler entfernen nur die unvollständige neue Generation; aktiver Cache und Nutzerdaten bleiben. Abruf: Cache-Bytes erneut prüfen, beschädigte Datei nur aus identischen überprüften Netzwerkbytes reparieren; sonst HTTP 503, kein fremdes Login-HTML ausführen. Rootnavigation nutzt ausschließlich die verifizierte Shell und erzeugt weiterhin ein nicht umgeleitetes Response-Objekt für Safari. Token-/API-/POST-/beliebige Queryantworten werden nicht aufgenommen.

Aktivierung bleibt explizit und verlangt sichere Clients: keine lokale Musik, ungespeicherten Entwürfe, offenen Übergaben oder laufende Spotify-Autorisierung. Bestehende sichere Reloadlogik bleibt erhalten. Alte vollständige Generation und fremde Caches werden erhalten; unbekannte Caches werden nicht pauschal gelöscht.

SHA-256/SRI schützen gegen beschädigte/manipulierte einzelne Antworten, Cache-Einträge und Versionsmischung unter einer vertrauenswürdig geladenen Buildbeschreibung. **Sie sind keine unabhängige Herausgebersignatur.** Wer HTTPS-Origin, HTML und Worker vollständig kontrolliert, kann auch deren Hashes ersetzen; keine Auditor-/Verified-Boot-Garantie. Same-Origin-Schadcode ist ebenfalls keine durch Nonces vollständig lösbare Vertrauensgrenze.

Rückfall: bisherigen geprüften vollständigen Build am selben Origin/Scope erneut bereitstellen, alle Entwürfe/Exporte sichern und Wiedergabe pausieren, vollständigen Download abwarten und ausdrücklich aktivieren. Niemals einen einzelnen alten Scriptstand in eine neue Generation kopieren, Safari-Daten löschen oder IndexedDB zurücksetzen. Vorhandene kompatible Recovery-/Read-only-Preflight-Pakete bleiben baubar. Test erstellt zusätzlich den unveränderten vorigen Quellstand in einem isolierten Verzeichnis und prüft echte Vorwärts-/Rückwärtswechsel mit identischer Musik-SHA-256 und Notizdaten. Kein privater Rollout wurde durchgeführt.

## Optionaler Header-Adapter: ausdrücklich nur Loopback

`scripts/serve-ipad-secure.cjs` kann lokal mit `node scripts/serve-ipad-secure.cjs dist/ipad-parity 8787` gestartet werden. Selbst die exportierte `listen`-Schnittstelle lehnt fehlenden Host sowie `0.0.0.0`, öffentliche IPs und Socketpfade ab; nur explizites IPv4 `127.0.0.1` möglich. Kein automatischer Start, keine Windows-Aufgabe, kein Serve-Aufruf.

Der Adapter dient ausschließlich dem verifizierten statischen Buildinventar. Keine Verzeichnisauflistung, kein Upload, keine Nutzerdaten, keine Request-/Queryprotokolle. Pfad-, Symlink-, Host- und Methodengrenzen sowie Dateihashes werden geprüft. CSP plus `frame-ancestors 'none'`, `no-referrer`, `nosniff`, Framing-Verbot, eingeschränkte Permissions Policy, COOP/CORP, DNS-Prefetch aus und `no-store` werden tatsächlich per HTTP getestet. Kein COEP, das vorhandene Coverbilder zerstören könnte.

**Die bestehende Windows-Konfiguration verwendet `tailscale serve --bg "$PSScriptRoot"`, also die eingebaute Ordnerbereitstellung, nicht diesen Adapter.** Ohne getrennt genehmigte Betriebsänderung gelten dessen HTTP-Header dort nicht. Metadaten-CSP/Referrer und Runtimehärtung können nach späterer ausdrücklicher Installation wirken; Framing-/Permissions-HTTP-Header des echten privaten Servers bleiben ungeprüft. Der Adapter wird weder öffentlich geöffnet noch ungefragt mit Tailscale verbunden. Kein Produktionshost wurde aufgerufen.

## Tests, Build und Nachweise

Lokaler Abschluss und CI werden unten mit den tatsächlich erreichten Ergebnissen ergänzt. Wiederaufgenommene Änderungen wurden zuerst unverändert inventarisiert; keine fertige Funktion neu gebaut oder verworfen.

- 70 Node-Testgruppen einschließlich bestehender Regressionen und neuer negativer OAuth-/Worker-/Header-/Allowlisttests.
- Neue Browser-Sicherheitsprüfung: echtes Provider-Dokument mit Mockzustimmung, manipulierte Rückleitungen/Tokenantworten, Disconnect-Rennen, mehrere Tabs, RAM-Refresh, gespeichertes HTML, tatsächliche CSP/Header, Versionswechsel/Rückfall, Cache-Poisoning, unveränderte Blob-SHA-256 und kalter Offline-Neustart.
- Exakt gleiche Browser-/Viewport-/Zeit-/Datenbedingungen: Lockscreen und Desktop vor/nach der Härtung, 1180×820 CSS-Pixel. Bei erfolgreicher Prüfung null unterschiedliche Pixel; keine Collagen oder manipulierten Produktbilder.
- `docs/security/protected-surfaces.json`: 138 byte-identische geschützte Dateien plus unveränderter HTML-Body und Musik-/Timercode vor `safeReload`. Darunter Notch, Dock, MacLock, Materialien, Widgets, Yosemite, 25-App-Registry, Daten-/Backupbesitzer und Windows-Skripte.
- Vollständige bestehende Gate-Suite für beide Browser bleibt vorgesehen, einschließlich Touch/DPR1/2, sechs Viewports, Pro-Notch, MacLock-Material, nativer kontrollierter Qt-Referenz und früherer Update-/Recovery-Regression.
- Keine echte Spotify-Kontoautorisierung, physische iPad-Abnahme, native Safari-/Akkumessung oder private Tailscale-HTTP-Prüfung. WebKit-Automation ist keine Hardwareabnahme.

Reproduktion mit Node 24, Python 3 und den gesperrten Tools aus `build/ipad-parity-tests`: `node --test tests/*.test.cjs`, `node scripts/package-ipad-security.cjs`, `node scripts/check-ipad-parity-package.cjs`, dann `AIR_PAD_ENGINE=chromium node scripts/test-ipad-security.cjs` beziehungsweise `webkit`; Unterpfad zusätzlich `AIR_SECURITY_PREFIX=/Air-OS/`. Paket unter `dist/Air-OS-iPad-Ultra-Security-<Quellcommit>.zip` mit `.zip.sha256`, `BUILD-INFO.json`, 142 geprüften Runtime-Dateien, Lizenzen und Sourcepaket. Vor Verwendung SHA-256-Sidecar und enthaltenes Inventar prüfen; keine automatische Installation.

Lokales WebKit wurde gestartet, das benötigte `webkit-2336/pw_run.sh` fehlt in dieser Umgebung. Daher ist die tatsächliche WebKit-Abnahme Aufgabe des CI-Jobs mit eigens installiertem Browser; kein lokaler WebKit-Erfolg wird behauptet. Die Workflowdatei `test-ipad-security.yml` veröffentlicht nur Prüfarbeitsartefakte und isolierte Nachweise auf dem Security-Branch, keine Website.

### Verbleibende Grenzen

HTTPS-/Hosting-Vertrauen, Browserversion, Same-Origin-Code und Gerätezugriff bleiben maßgeblich. Browserprofile/Backups sind keine verschlüsselte OS-Schlüsselablage. Die Air-OS-Sperre bleibt eine Anwendungsansicht, keine native sichere Gerätesperre. Speicherlimits, Safari-Suspend und Provider-Verfügbarkeit bleiben reale Grenzen. Vollständiger Spotify-Widerruf ist eine Benutzeraktion im Spotify-Konto. Tatsächliche private Serverheader und physisches iPad bleiben offen. Keine Aussage „100 % sicher“.

### Lokaler geprüfter Checkpoint

70/70 Node-Testgruppen, neue Chromium-Sicherheitsprüfung 45/45, bestehende Chromium-Update-/Recovery-Prüfung 10/10; vorheriger Spotify-Smoketest 20/20. Lokaler Paketprüfer: 142 exakte Runtime-Dateien. Beide kontrollierten Vorher-/Nachheransichten (Desktop und Lockscreen) haben im Chromium-Lauf null unterschiedliche Pixel. Der abschließende ZIP-Quellcommit und die WebKit-/Gesamt-CI werden nach erfolgreichem Branch-Build separat festgehalten. Keine lokalen Hardwaretests.

Beim Aufbau des neuen Browserfixtures wurden ungültige Testdaten und ein vorzeitiges Erfassen eines noch installierenden Workers korrigiert. Der Versionswechseltest wartet jetzt am stabilen lokalen HTTP-Origin auf die vollständig installierte Generation; aus diesen Testfehlern wird keine Produktlücke abgeleitet.

### SRI-kompatibles Safe-Area-Testfixture

Der erste CI-Versuch bestand beide neuen Chromium-Sicherheitsläufe, erreichte aber ein altes Testfixture, das CSS-Antworten für simulierte Safe Areas verändert und deren SRI nicht aktualisiert hatte. Das Fixture veröffentlicht jetzt ausschließlich in seinem isolierten Test-Origin die passenden neuen SHA-256-Werte und prüft, dass tatsächlich alle Stylesheets mit aktivem SRI geladen sind. Produktions-SRI wird nicht entfernt. Der zusätzliche Browserkontext wird auch bei einem Assertionfehler geschlossen. Lokale Dock-Abnahme nach dieser Testkorrektur: 55 Prüfungen bei DPR1; der vollständige CI-Versuch wird mit dem korrigierten Fixture neu gestartet. Keine Änderung an der sichtbaren Dock-/Notch-Implementierung.

DPR2 desselben korrigierten Fixtures besteht ebenfalls mit 55/55; Node weiterhin 70/70. Der zusätzliche lokale Docker-/WebKit-Versuch mit der zur gesperrten Playwright-Version passenden offiziellen Imageversion `v1.62.1-noble` scheiterte beim Download mit `Forbidden`; keine Umgehung der Netzwerkregeln, kein lokaler WebKit-Erfolg daraus abgeleitet.
