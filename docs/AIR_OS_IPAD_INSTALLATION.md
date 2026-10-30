# Air-OS Ultimate iPad · Installation und GitHub Pages

## Status

**Vorbereitet; in diesem Auftrag nicht öffentlich veröffentlicht.**
Der Deploymentworkflow wurde nicht gestartet. Eine aktuelle öffentliche App-Adresse wird deshalb nicht als installierbare Website angegeben.

Basis: feat/air-os-ipad-ultimate @ 4a82ac41fcc43eb6ebde34f6422cb2bdd239f971.
Bestätigter Produkt-/Buildstand: 6e9094530175455c4214dcad08550284de63a483.
[Vorhandenes geprüftes PWA-ZIP samt SHA-256 und Anleitung](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40940401712/artifacts/12928280262).
[Vorhandener erfolgreicher Build](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40940401712).
[Apps, Speichergrenzen und iPad-Funktionsmatrix](AIR_OS_IPAD_ULTIMATE.md).

Keine neue App oder Datenmigration. Die Laufzeitadapter bleiben erhalten. Einzige Installationsmetadatenkorrektur: Auch der Safari-Metatitel heißt jetzt „Air-OS Ultimate“.

## Vorbereiteter Veröffentlichungsprozess

Datei: [deploy-air-os-ipad.yml](../.github/workflows/deploy-air-os-ipad.yml).
Ausschließlich workflow_dispatch, nur Repositoryinhaber quattrologic und nur refs/heads/feat/air-os-ipad-ultimate. Kein Push-, PR-, Timer- oder Folgeworkflow-Deployment.

Erforderliche manuelle Eingaben:

| Parameter | Wert |
|---|---|
| public_confirmation | publish-air-os-ipad-publicly |
| source_commit | Vollständiger zuvor geprüfter aktueller 40-stelliger HEAD des iPad-Branches |
| site_review | exclusive-air-os-ipad-site-reviewed |
| previous_source_commit | Bei einer bestehenden eindeutig zugeordneten iPad-Site deren exakt geprüfter BUILD-INFO-Commit; bei einer wirklich neuen leeren Site leer |

Diese Werte sind bewusste Veröffentlichungsbestätigungen, keine automatisch gesetzten Standardwerte. Eine zusätzliche GitHub-Environment-Freigabe kann der Inhaber für github-pages konfigurieren.

Der Workflow:

1. Prüft Owner, manuelles Ereignis, Branch, Basisabstammung, sauberen Checkout und SHA-Lease gegen den aktuellen Remote-HEAD.
2. Liest die Pages-Konfiguration und prüft den bestehenden Site-Inhalt. Ein API-/HTTP-Fehler gilt niemals als leere Site.
3. Benutzt actions/configure-pages mit **enablement: false**: keine automatische Aktivierung, Domain- oder Quellenänderung.
4. Installiert eingefrorene Testtools; führt beide Dependency-Audits, den vollständigen Testgate und die bestehende PWA-/Byte-/CSP-/Lizenzprüfung aus.
5. Prüft dieselben echten Apps unter dem konfigurierten Unterpfad in Chromium und WebKit.
6. Lädt ausschließlich dist/pwa als Pages-Artefakt hoch. Das Build-ZIP und Testdaten liegen separat, nicht im Website-Root.
7. Prüft SHA und Ziel vor der Veröffentlichung erneut; erst danach actions/deploy-pages.
8. Verifiziert die tatsächlich ausgegebene HTTPS-Adresse, Build-SHA, Manifest und Service Worker. Die wirkliche App-URL erscheint danach im Deployment-Environment und in der Actions-Zusammenfassung.

Die Publishing-Jobs erhalten minimale Rechte: Build nur contents:read/pages:read; erst der Deploymentjob pages:write/id-token:write. Der gemeinsame Concurrency-Schlüssel serialisiert den Kanal mit der unveränderten alten PWA-Preview.

## Schutz vorhandener Pages-Inhalte

Pages ersetzt die komplette Repository-Site; ein Unterverzeichnis ist kein automatischer Schutz für andere bestehende Projekte. Deshalb:

- Neue Site nur bei verifiziertem 404 für Startseite/Buildmarker und noch keinem vorhandenen Pages-Build.
- Bestehende Site nur mit eindeutigem Air-OS-iPad-BUILD-INFO, sauberem Quellstand, dazu passender vorheriger SHA und ausdrücklicher exklusiver Site-Prüfung.
- Fremde, gemischte, alte nicht eindeutig zugeordnete oder nicht prüfbare Inhalte blockieren das Deployment. Es gibt keinen Override für unbekannte Websites.
- Keine vorhandenen Inhalte werden ungefragt kopiert, gelöscht oder übergangen. Eine Migration einer fremden/gemischten Site braucht eine gesonderte konkrete Bestandsprüfung und Freigabe.

Die aktuelle Pages-Konfiguration konnte aus dieser Umgebung nicht authentifiziert verifiziert werden (GitHub-API-Verbindung verweigert). Sie wird ausdrücklich **nicht als leer** angenommen.

## Noch erforderliche Freigabehandlung

1. Der Repositoryinhaber muss der **öffentlichen Bereitstellung** ausdrücklich zustimmen und prüfen, dass die gesamte Repository-Pages-Site ausschließlich für diese iPad-App vorgesehen ist.
2. Erst danach Settings → Pages prüfen: Quelle GitHub Actions, korrektes Ziel bzw. bewusst gewählte eigene Domain, HTTPS aktiviert. Bestehende andere Projekte vorher klären; der Workflow ändert diese Einstellungen nicht automatisch.
3. GitHub muss den manuell startbaren Workflow anbieten. workflow_dispatch benötigt eine Registrierung über den Defaultbranch. Bei der Prüfung am 30.10.2026 antwortete die Actions-Seite der neuen Datei noch mit „Workflow not found“. Die Übernahme **nur dieser geprüften Workflowdatei** auf den Defaultbranch braucht deshalb eine gesonderte Inhaberfreigabe. Hier wurde main nicht geändert und kein App-Merge vorbereitet. Die Laufzeitdateien bleiben auf dem iPad-Branch; der Workflow checkt ausdrücklich dessen freigegebene SHA aus.
4. Im Actions-Menü den neuen Workflow wählen, Branch feat/air-os-ipad-ultimate auswählen und die vier obigen Eingaben setzen. Die source_commit muss der aktuell freigegebenen Branch-SHA entsprechen; ein veralteter Wert bricht ab.
5. Falls konfiguriert, github-pages-Environment freigeben. Nach erfolgreicher Bereitstellung ausschließlich den tatsächlichen page_url-Link aus dem Lauf öffnen.

Der neue Workflow wird in dieser Vorbereitung **nicht** mit Veröffentlichungsparametern ausgeführt. Ein grüner Build ist keine Veröffentlichungsfreigabe. Falls die Verifikation nach actions/deploy-pages fehlschlägt, kann die Site bereits veröffentlicht sein; zuerst den konkreten Lauf und dessen tatsächliche URL prüfen, nicht blind erneut veröffentlichen.

## Pfade und Installationseigenschaften

Manifestname Air-OS Ultimate, Standalone-Anzeige, offizielle geometrische 192/512/maskable Icons und Apple-Touch-Icon. Manifest-ID, Start-URL und Scope sind jeweils ./ relativ zum Manifest. Worker-URL/Scope liegen relativ zur App. Safe Areas, dynamischer Viewport, Hoch-/Querformat und lokaler Startbildschirm bleiben erhalten.

Der Browsertest simuliert eine Pages-Projektadresse auf einer sicheren Loopback-Origin unter /Air-Os-Clean/. Er prüft echte gerenderte Apps, IDB-Persistenz, Manifestauflösung, Worker-Grenzen und per SHA-256 geladene CSS-/JS-/Bild-/Fontdateien. Er erkennt HTTP-Anfragen außerhalb des App-Unterpfads; lokale Blob-Medien sind ausdrücklich keine fremden Webpfade.

Der echte Updatefall wird geprüft: wartender Worker, blockierter ungespeicherter Notes-Entwurf, bestätigte Aktivierung, Rückkehr zum richtigen Unterpfad, begrenzte Cachebereinigung und erhaltene Notes-/Reminders-/Kalender-/Finder-/Musikdaten. Andere Caches bleiben erhalten.

Die Browserprüfung arbeitet mit echten Chromium-/WebKit-Engines auf einer sicheren Loopback-Origin. Sie ist kein öffentlicher HTTPS-Pages-Livetest und keine physische iPad-Abnahme. Der Veröffentlichungsjob bleibt bis zur späteren Zustimmung ungestartet; dessen tatsächlicher OIDC-/Pages-Deploypfad ist deshalb noch nicht ausgeführt.

## Safari: Zum Home-Bildschirm hinzufügen

Nach Freigabe und erfolgreichem Deployment:

1. Die tatsächliche HTTPS-App-Adresse in Safari auf dem iPad öffnen.
2. Warten, bis der Offline-Appcache vollständig installiert ist; der Status steht im iPad-Menü der App.
3. Safari → Teilen → Zum Home-Bildschirm.
4. „Als Web-App öffnen“ aktivieren, falls die iPadOS-Version diesen Schalter anbietet.
5. Name Air-OS Ultimate prüfen → Hinzufügen.
6. Vom Home-Bildschirm starten und den gewünschten lokalen Bereich öffnen.
7. Offline-Neustart und Datei-/Audioauswahl auf dem eigenen Gerät testen.

Es gibt keine IPA-Datei, App-Store-Freigabe oder automatische Installation. Ein tatsächlicher iPad-/Safari-Hardwaretest, Pencil, Bildschirmtastatur, Geräteaudio und Home-Screen-Installationsdialog bleiben offen.

## Offline, Updates und Backup

Die einmal vollständig geladene App-Shell und importierte lokale Daten sind offline nutzbar. Externe Anbieterlinks und noch nicht geladene Dateien sind kein Bestandteil des Offlineversprechens. Im Browsertest wird der lokale HTTP-Ursprung wirklich abgeschaltet; ein Cachemiss kann ihn nicht erreichen. Zusätzlich prüft Chromium seinen Offline-Schalter. Der bekannte interne WebKit-Fehler bei dieser speziellen Offline-Emulation bleibt von einer echten Geräteabnahme getrennt.

Eine neue Website-Version aktiviert sich nicht heimlich über einem ungespeicherten Notes-/Finder-Entwurf. Offene Arbeit sichern und erst dann „Neue Offline-Version laden“ bestätigen. Für Betreiber verlangt jedes spätere Deployment erneut Freigabe, aktuellen Quellcommit und den vorherigen veröffentlichten Commit. Branch oder Domain nicht still wechseln.

Vor Installation, Updates oder Hostwechsel: iPad-Menü → Datenbackup exportieren. Das private JSON sicher aufbewahren. Wiederherstellen benötigt ausdrückliche Bestätigung und ersetzt den gewählten lokalen Bereich nach Validierung. Fehlerhafte Sammlungen/IDs werden vor dem Schreiben verworfen.

## Datenschutz

Die Website und ihre statischen Quellen können öffentlich erreichbar sein. Lokale Notes, Aufgaben, Kalenderdaten, importierte Dateien und Musik liegen in IndexedDB des eigenen Browsers und werden nicht automatisch als GitHub-Dateien oder Pages-Inhalte veröffentlicht. Es gibt keine automatische Cloud-Synchronisierung, keine privaten Supabase-Schlüssel und keinen Pushdienst im Bundle.

Lokale Bereiche sind keine sichere Passwortanmeldung. Browserstorage kann durch iPadOS, Safari, private Sitzungen oder manuelles Löschen verloren gehen. Persistenzanfragen sind keine ewige Speicherungsgarantie; Export/Backup bleiben erforderlich.

Unterschiedliche Origins haben getrennte Browserdaten. Ein Wechsel von Host/Domain/Protokoll öffnet deshalb einen anderen Speicherbereich; Daten werden nicht automatisch übernommen. Unterschiedliche Pfade derselben Origin sind dagegen keine IndexedDB-Sicherheitsgrenze. Wer andere Projekte auf derselben Origin betreibt, muss deren Vertrauenswürdigkeit berücksichtigen oder eine eigene Origin wählen. Safari-Tab und Home-Screen-App können je nach iPadOS zusätzlich unterschiedliche Speicher-/Sitzungszustände besitzen; vorher sichern.

## Geprüfter Vorbereitungsstand

Produkt-/Workflowcommit: 49b2130789265a47a456533ef235c203cc49ba38. Der folgende Dokumentationscommit ändert keine Appdateien. Beim späteren Deployment wird trotzdem der dann ausdrücklich freigegebene vollständige Branch-HEAD erneut gebaut und geprüft; ein altes ZIP wird nicht ungeprüft veröffentlicht.

- Lokal: 576/576 Regressionstests, darunter fünf neue Prüfungen für Owner-/SHA-Freigabe, fremde/unbekannte Pages-Inhalte, HTTPS-/Domainkonfiguration, Tokenbegrenzung und manuellen Workflow.
- Sauberer PWA-Build: 363 Dateien, 362 Offlineassets; Byteinventur, CSP, Lizenzen und Ausschluss nativer Laufzeitdateien bestanden.
- Reproduzierbares ZIP: Air-OS-Ultimate-iPad-49b213078926.zip, 2.252.526 Bytes, SHA-256 `bb50f44cdbfa45a998367876e59aed0f4c6c9e9223c9030c6ba7ccb835565d0b`.

[Nicht veröffentlichender CI-Lauf für diesen Stand](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41081662717): **erfolgreich**, einschließlich Pflichtaudits, vollständigem Testgate, Build, Paketprüfung und Artefakten.

| Echter Browserlauf | Startpfad | Bestandene Prüfungen | Viewports | Unbehandelte Browserfehler |
|---|---|---:|---:|---:|
| Chromium | / | 99 | 7 | 0 |
| WebKit | / | 98 | 7 | 0 |
| Chromium | /Air-Os-Clean/ | 100 | 7 | 0 |
| WebKit | /Air-Os-Clean/ | 99 | 7 | 0 |

Viewports mit Touch-Emulation und DPR 2: 1024×768, 1180×820, 1366×1024, 834×1194, 820×1180, 744×1133 und 390×600. Die zusätzlichen Chromiumprüfungen betreffen dessen Offline-Netzwerkemulation; beide Engines müssen unabhängig davon einen tatsächlichen Ausfall des Ursprungsservers und einen Browserneustart mit erhaltenen Daten bestehen.

[Aktuelles PWA-ZIP herunterladen](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41081662717/artifacts/12991115521). Der SHA-256 der enthaltenen PWA-ZIP entspricht dem oben dokumentierten lokalen Build. Die GitHub-Artefaktverpackung hat einen eigenen, davon verschiedenen Hash.
[Chromium-/WebKit-Screenshots, Ergebnis-JSON, Audits und Testprotokoll](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41081662717/artifacts/12991195406); die Unterpfadnachweise liegen darin unter ipad-evidence/pages/. [Kompakter Prüfnachweis](visual/ipad-installation/verification.json).

In allen vier Läufen geprüft: Notes/Reminders/Kalender, virtueller Finder mit Dateiimport/-export, echter Musiktransport ohne Autoplay, Dock/M2/Island, lokale Bereichstrennung, Backup/Restore mit Binärdateien, Hoch-/Querformat, Offline-Kaltstart, begrenzter Worker-Scope und bestätigtes Update mit erhaltenen Daten. Keine physischen iPad-, Safari-Installations-, Audiohardware- oder öffentlichen Pages-Erfolge werden daraus abgeleitet.

GitHub-Actions-Artefakte dieses Kanals werden 30 Tage aufbewahrt; der Download kann eine GitHub-Anmeldung verlangen. Eine ZIP ist ein Paket für einen Webhost, kein direkt auf iPadOS installierbares IPA. Zur Home-Screen-Installation braucht es die nach Freigabe tatsächlich bereitgestellte HTTPS-Website.
