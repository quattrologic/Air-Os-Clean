# Air-OS iPad — private Updates ohne Windows-PC

## Stand und Freigabegrenze

Basis **`feat/air-os-ipad-ultimate-2@e4b1c4203c2430da04bccc5dd33953fb44cc0781`**. Neuer Featurebranch **`feat/ipad-private-cloud-updates`**. Produkt-/Buildcommit **`62a7b31aa1cb4a70c846901e9a36955210b8130f`**.

**Vorbereitet und lokal geprüft, nicht veröffentlicht.** Kein Cloudflare-Konto verbunden, kein Login/API-Token verwendet, kein Projekt angelegt, keine Domain aktiviert. Releasebranch noch nicht angelegt. Kein Merge, keine Pages-/Funnel-Veröffentlichung. Die private Installation, Windows-Aufgabe und Tailscale-Konfiguration bleiben unverändert. `feature/private-ipad-pwa` bleibt auf `7de1635c0207b8604c5409ef62c466585b4d5f04`; die iPad-2.0-Basis bleibt auf dem oben genannten Abschlusscommit.

Die Voraussetzungen für einen späteren PC-unabhängigen Host sind vorhanden. **Eine laufende Cloudinstallation oder ein fertiger Ein-Klick-Deploymentdienst wird damit nicht behauptet.** Kontoanbindung, Live-Schutzprüfung und jede Veröffentlichung verlangen weiterhin ausdrückliche Eigentümerfreigaben. Falls die erste Appauslieferung ohne öffentliche Exposition nicht nachweisbar abgesichert werden kann, bleibt sie gesperrt.

## Architektur und tatsächlich implementierter Schutz

`freigegebener Releasebranch → GitHub-Tests beider Browser → geprüftes Cloudpaket → separat freigegebener privater Pages-Host → iPad`

| Datei | Tatsächliche Funktion |
|---|---|
| `.github/workflows/build-ipad-private-cloud.yml` | Automatischer Build ausschließlich bei Push auf `release/ipad-private-cloud`; manuelle Tests auch auf diesem Featurebranch. Audit, 47 Tests, Paketprüfung, Chromium und WebKit. Erst **nach beiden grünen Jobs** entsteht `iPad-Private-Cloud-Verified-Build-<SHA>`. Kein Deployjob/Cloudflare-Secret/Schreibrecht |
| `scripts/build-ipad-private-cloud.cjs` | Nutzt vorhandenen PWA-Builder in einem isolierten temporären Baum. Kopiert nur Runtimeassets, vergleicht ihre Bytes mit dem Buildinput, fügt Access-Worker und gesonderten Cloudclient hinzu. Manifest/Scope/CSP/Notices/Corresponding Source erhalten. ZIP/SHA-256/BUILD-INFO; keine Anmeldung/Übertragung |
| `cloudflare/ipad/access-worker.mjs` | Pages Advanced Mode `_worker.js`: HTTPS und GET/HEAD, RS256-Signatur, gepinnter Team-Issuer/AUD, Ablauf/iat/nbf und explizite E-Mail-Allowlist. Schlüssel ausschließlich vom festen Team-JWKS-Endpunkt, begrenzt, Timeout, fünf Minuten Cache. Kein Token-/Cookie-/Identitätslogging, keine Weitergabe an ASSETS |
| `_routes.json`, `_headers` | **Alle** Routen einschließlich JS, Bilder, Manifest und Source-ZIP durch denselben Worker; keine statischen Ausnahmen. `private, no-store`, noindex, nosniff. Ohne Konfiguration 503, ohne gültige Berechtigung 403, niemals Appbytes |
| `cloudflare/ipad/session.js` | Nur im Cloudpaket: Schutzstatus prüfen, sichtbare Neuanmeldung, sichere automatische Aktivierung vollständig geladener Updates. Keine Hintergrund-Pollingschleife. Start/Online/Resume/Benutzeraktion statt permanenter Überwachung |
| `scripts/templates/ipad-service-worker.js` | Exakte SHA-256 der erwarteten App-Shell/Assets. Fremder Origin, Login-HTML, Fehler-/veränderte Dateien werden nicht zum Appcache. Nur bekannte kanonische HTML-Rückleitung zulässig; Safaris nicht umgeleitete Offlineantwort bleibt erhalten. Fehlgeschlagenes Update löscht nur seinen neuen Cache, keine alte Version/IndexedDB |
| `scripts/verify-ipad-cloud-protection.cjs` | Strenge lokale Checkliste für Apex/Wildcard/Allowlist/Fail Closed; optional anonyme, lesende Negativtests erst mit `--approved-network-check`. Gibt **niemals** eine Deploymentautorisierung aus; ersetzt keine echte Kontoprüfung |
| `cloudflare/ipad/release-policy.json` | `deploymentEnabled: false`, Konto nicht verbunden, explizite Freigabe je Veröffentlichung. Keine versteckte Aktivierungsvariable |

Access-Konfiguration und Worker sind zwei Schutzschichten. Der Worker allein genügt nicht: **Pages Functions müssen zusätzlich bei erschöpfter Free-Quota auf „Fail closed“ stehen.** „Fail open“ könnte sonst statische Dateien unter Umgehung der Funktion ausliefern. Diese tatsächliche Kontooption wurde nicht eingestellt oder live geprüft.

Kein persönlicher Daten- oder Cloudsync-Endpunkt wurde hinzugefügt. Der Worker nimmt keine Musik-/Dokumentuploads an. Source-/Lizenzpakete enthalten ausschließlich Produktquellen, keine IndexedDB-/Backupdateien oder Zugangsdaten. Die kombinierte iPad-PWA behält AGPL-3.0 und die vorhandenen MIT-/GPL-Notices. Source lässt sich auch ohne Git/Zugangsdaten neu bauen; das ist getestet.

## Einrichtung vom iPad aus — erst nach gesonderter Zustimmung

### 1. Konto und freigegebenen Build vorbereiten

1. In Safari ein eigenes Cloudflare-Konto öffnen, E-Mail bestätigen, MFA aktivieren. **Zero Trust Free** wählen und aktuelle Kontolimits prüfen; keinen kostenpflichtigen Tarif/Upgrade automatisch bestätigen. Teamname festlegen. Anmeldung/Zugangsdaten selbst eingeben, nicht in Git/Chat/Browserlogs kopieren.
2. In GitHub auf dem iPad den geprüften Featurestand und diesen Bericht kontrollieren. Erst nach ausdrücklicher Freigabe einen **neuen** Branch `release/ipad-private-cloud` an einem konkret freigegebenen SHA anlegen. Kein Merge in main oder den installierten Branch nötig. Branchschutz/Review durch den Eigentümer vor späteren Aktualisierungen vorsehen.
3. Der Push startet ausschließlich den Artefaktworkflow. Im Actions-Lauf **beide** Browserjobs und `verified-package` prüfen. ZIP und beiliegende `.sha256` aus genau diesem grünen Lauf herunterladen. Ein vorhandenes ZIP aus einem anderen oder roten Lauf ist keine Veröffentlichungserlaubnis. Manuelle `workflow_dispatch`-Sichtbarkeit hängt davon ab, ob GitHub den neuen Workflow bereits kennt; keinen Defaultbranch-Merge zur Umgehung automatisch ausführen.
4. Kein Cloudflare-Git-Autodeploy verbinden. Keine GitHub-Pages-Installation. Ein neuer Direct-Upload-Pages-Projektbaum vermeidet die Übernahme oder Überschreibung bestehender Sites.

### 2. Leeres Projekt anlegen, noch keine Air-OS-Dateien hochladen

Ziel ist ein **vollständig neues, leeres Pages-Projekt ohne Git-Verbindung**. Nicht den Dashboard-Assistenten mit Appdateien „erst einmal testen“. Wenn die Dashboardoberfläche eine sofortige erste Veröffentlichung erzwingt, abbrechen.

Ein Browserterminal in einem GitHub Codespace kann nach separater Eigentümerfreigabe ein leeres Projekt über die offizielle API anlegen; der Windows-PC ist dafür nicht erforderlich. Vorher kostenlose Codespaces-Quote prüfen, keine kostenpflichtige Sitzung ungefragt starten. Dafür einen zeitlich begrenzten API-Token ausschließlich mit **Cloudflare Pages: Edit** für das gewählte Konto erstellen und als Codespaces-Secret setzen, nicht in Code/Argumenten/Logs. Konto-ID und neuer Projektname ebenfalls nur lokal konfigurieren. Folgendes ist eine **noch nicht live ausgeführte Vorlage**, keine Aufforderung zur jetzigen Kontoanbindung:

```js
// Browserterminal: node --input-type=module; Werte aus selbst gesetzten Secrets/Env.
// Nur nach ausdrücklicher Freigabe zum Anlegen EINES leeren Projekts ausführen.
const {CF_ACCOUNT_ID: account, CF_PROJECT: name, CF_API_TOKEN: token,
       AIR_APPROVE_EMPTY_PROJECT: approval} = process.env;
if (approval !== 'CREATE EMPTY ONLY' || !/^[a-f0-9]{32}$/i.test(account || '') ||
    !/^[a-z0-9-]{3,58}$/.test(name || '') || !token) throw Error('Not approved');
const url = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
const headers = {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'};
const existing = await fetch(`${url}/${name}`, {headers});
if (existing.status !== 404) throw Error('Existing/unknown project: no changes');
const created = await fetch(url, {method: 'POST', headers, body: JSON.stringify({
  name, production_branch: 'release/ipad-private-cloud',
  deployment_configs: {production: {fail_open: false}, preview: {fail_open: false}}
})});
if (!created.ok || !(await created.json()).success) throw Error('Setup not verified');
console.log('Empty project created. No assets uploaded. Check dashboard before proceeding.');
```

Die konkrete Konto-/API-Ausführung bleibt offen; fehlende Felder/abweichende Dashboardzustände müssen vor jeder weiteren Aktion geprüft werden. Token danach widerrufen. Hierdurch wird keine Datei und kein Nutzerdatum hochgeladen. Ein Projektname allein ist keine Schutzfreigabe.

### 3. Hauptadresse UND alle Vorschauen schützen

Die offiziellen Pages-Anleitungen unterscheiden ausdrücklich zwei Access-Anwendungen. Der erste Schalter schützt standardmäßig nur Vorschauen!

1. **Workers & Pages → neues Projekt → Settings → General → Enable access policy**. Die angelegte Preview-Access-Anwendung über **Manage** öffnen.
2. In **Zero Trust → Access controls → Applications → Projekt → Configure** beim Public Hostname den Subdomain-Wildcard `*` entfernen. Diese Anwendung schützt damit **`<PROJECT>.pages.dev`**. Gegebenenfalls eigenen eindeutigen Appnamen vergeben. Speichern.
3. Zurück zu Pages, **Enable access policy erneut einschalten**. Prüfen, dass zusätzlich eine zweite Anwendung für **`*.<PROJECT>.pages.dev`** vorhanden ist. Diese muss Hash-URLs, Branch-Aliase und alte Vorschauadressen erfassen. Hash-Deployments verschwinden beim nächsten Build nicht automatisch.
4. In **BEIDEN** Anwendungen nur ausdrücklich genehmigte Einzel-E-Mail-Adressen erlauben, geeignete Anmeldung (z.B. E-Mail-One-Time-PIN oder eigener IdP) und bewusste Sitzungsdauer konfigurieren. Keine Regeln „Everyone“, „Bypass“, breite Domains, unkontrollierte Kontoteilnehmer oder Service-Token-Ausnahmen.
5. Falls später eigene Domains hinzukommen: jede zusätzlich als selbst gehostete Access-Anwendung schützen. Für kostenlosen Betrieb ist eine eigene gekaufte Domain nicht erforderlich; keine vorhandene Domain ungefragt ändern.
6. **Pages → Settings → Runtime → Fail open / closed = Fail closed**, für Produktion und Preview tatsächlich kontrollieren. Keine Ausnahme für statische Assets setzen. Bei fehlender/unklarer Option **STOP ohne Appupload**.
7. Aus beiden Access-Anwendungen die AUD-Tags kopieren. In Pages **Production UND Preview** als serverseitige Variablen setzen, entsprechend `cloudflare/ipad/environment.example.txt`: `AIR_ACCESS_TEAM` ohne abschließenden Slash, `AIR_ACCESS_AUDIENCES` als JSON-Array beider AUD-Tags, `AIR_ACCESS_EMAILS` als JSON-Array genehmigter Einzeladressen. Keine realen Werte ins Repository/Bundle aufnehmen. Diese Variablen sind keine Browserkonfiguration. `ASSETS` ist die automatische Pages-Bindung.

### 4. Negative Zugangstests VOR dem ersten Appupload

Eine lokale, nicht eingecheckte Checkliste außerhalb des Repos mit folgenden Feldern anlegen: `project`, `productionFailOpen:false`, `previewFailOpen:false`, `automaticDeployments:false`, `emails:[...]`, `customDomains:[]`, `previewHosts:[...]` und `applications:[{domain,policies:[{decision:'allow',emails:[...]}]}]`. Anwendungen für Apex **und** Wildcard erfassen. Die Liste muss aus wirklich kontrollierten Kontoeinstellungen stammen; eine selbst ausgefüllte Datei ist kein unabhängiger Beweis.

Zunächst nur lokal prüfen:

```sh
node scripts/verify-ipad-cloud-protection.cjs /separat/protection.json
```

Erst nach ausdrücklicher Freigabe für Netzwerkprüfungen:

```sh
node scripts/verify-ipad-cloud-protection.cjs /separat/protection.json --approved-network-check
```

Der Test sendet keine Cookies/Tokens, folgt keinen Redirects und prüft `/`, `/index.html`, `/sw.js`, `/app.js`, `/source/source.zip` und den Statuspfad auf allen angegebenen Hosts. Erlaubt sind ausschließlich Access-Anmeldeumleitungen oder 401/403. **Öffentliches 200 oder lediglich 404 gilt nicht als Schutzbeweis.** Im leeren Projekt mindestens einen reservierten Preview-Alias wie `air-private-preflight.<PROJECT>.pages.dev` gegen die Wildcard prüfen. Wenn Pages diese Adressen vor einem Deployment nicht nachweisbar durch Access schützt, **keine App veröffentlichen**. Zunächst Anbieter-/Kontokonfiguration klären, keine „kurze öffentliche“ Testphase.

Zusätzlich mit privatem Safari-Fenster und ohne Cloudflare-Login kontrollieren. Nach erster gesondert freigegebener Veröffentlichung jede tatsächlich entstandene Hash-/Branchadresse erneut prüfen, ebenso Hauptadresse/eigene Domains. Nie eine unbekannte alte öffentliche Projekthistorie übernehmen. Funktionierendes Login allein beweist keine Ablehnung anonymer Besucher.

### 5. Veröffentlichung bleibt ein eigener Freigabeschritt

**Diese Phase enthält absichtlich keinen Upload-/Deployworkflow und keinen Cloudflare-Token in GitHub Actions.** Vor einer späteren Veröffentlichung müssen beide Browserjobs, privater Accountschutz, Fail Closed und anonyme Negativtests nachgewiesen sein. Anschließend gesonderte Freigabe für genau ein Build-SHA und Projekt einholen.

Ein späterer Deployworkflow soll eine eingefrorene, auditierte Pages/Wrangler-Toolchain, geschützte Owner-Approval-Umgebung und die geprüften Artefaktbytes nutzen. Nicht ungeprüft `npx ...@latest`, öffentliche Static-Hosting-Actions oder Drag-and-drop einsetzen, bei denen die Ausführung von `_worker.js` nicht belegt ist. **Keine Datei-Only-Veröffentlichung ohne Worker.** Diese Transport-/Liveabnahme ist bewusst noch offen. Jede spätere Veröffentlichung verlangt erneut ausdrückliche Freigabe; ein Push allein veröffentlicht nichts.

Eine künftige Adresse `https://<PROJECT>.pages.dev/` ist hier **nur ein Muster**, keine bereits bereitgestellte Website.

## Installation, Updates und Sitzungsablauf

Nach erfolgreicher separater Freigabe/Liveabnahme: geprüfte HTTPS-Adresse in Safari öffnen, Access-Anmeldung durchführen, dann **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen**. Als Namen z.B. „Air-OS Cloud“ wählen, um sie von der alten Tailscale-Installation zu unterscheiden. Keine IPA/App-Store-App.

Das Cloudpaket prüft freigegebene Versionen beim Start und nach Online-/Sichtbarkeitswechsel. Vollständig geladene Worker werden automatisch nur bei pausierter Musik, gespeicherten Entwürfen und abgeschlossenen Exportübergaben zur bisherigen Mehrclient-Sicherheitsabstimmung vorgeschlagen. Keine Schleife im Hintergrund; kein automatischer Abbruch von Musik oder Verlust von Entwürfen. Der manuelle Updatebutton bleibt erhalten. iPadOS garantiert **keine** Downloads, während eine Web-App geschlossen oder vom System suspendiert ist; nach erneutem Öffnen wird weiter geprüft.

Auth-Redirects und Login-HTML können wegen Origin-/Byteprüfung nicht als neue App-Shell installiert werden. `/__air_access/*` und `/cdn-cgi/*` werden vom PWA-Worker nicht als Appnavigation abgefangen oder gecacht. Bei abgelaufener Sitzung bleibt der alte Offlinecache nutzbar; unter Einstellungen zeigt der Cloudstatus eine erforderliche Prüfung. **Cloudzugang anmelden / erneuern** führt erst nach Pause/Speichern zum echten Access-Top-Level-Login zurück. Die lokale Sperransicht ersetzt weder Access noch den iPad-Gerätecode.

Wichtig: Access schützt die **Netzauslieferung**. Es löscht oder verschlüsselt keine schon erlaubterweise gespeicherten lokalen App-/Nutzdaten. Offlinebetrieb nach Sitzungsablauf ist beabsichtigt. Ein lokaler Appcache lässt sich nicht als fernwiderrufene Gerätesperre ausgeben. Safari-/Home-Screen-Cookies und IdP-Redirects auf echter Hardware müssen gesondert getestet werden.

## Datenübernahme und Rückfall

- Neuer Hostname/Port/Protokoll bedeutet **anderen Origin**: neue, zunächst leere IndexedDB. Keine automatische Übernahme aus Tailscale. Die alten Daten und die alte Home-Screen-App werden nicht gelöscht. Verschiedene Unterpfade desselben Origins teilen dagegen IDB/LocalStorage; das sind keine getrennten Profile.
- Zuerst Cloudinstallation ausschließlich mit synthetischen Testdaten testen. Persönliche Migration erst nach gesonderter Datensicherung und Freigabe. Der vorhandene [Vorabexport-/Recoveryplan](AIR_OS_IPAD_2_PRIVATE_ROLLOUT.md) gilt weiter; falls die alte App keinen Export besitzt, auch einen ReadOnly-Preflight nur nach ausdrücklicher Zustimmung bereitstellen.
- Musik pausieren, alle Entwürfe speichern, Backup am alten Origin exportieren und außerhalb des Browsers in Dateien sichern/prüfen. Format `air-os-private-ipad-backup`, Version 1, bleibt kompatibel; DB `air-os-ipad-tracks-v1`, Schema 2, wird nicht zurückgesetzt. Zielimport mit bewusster Konflikt-/Überschreibentscheidung, danach Titel/Audio/Termine/Timer kontrollieren und Offline-Neustart testen.
- JSON-Vollbackup: **64 MiB Binärdaten / 96 MiB Datei**, Einzeldatei im virtuellen Finder 32 MiB. Größenprüfung vor Export verwenden. Große Musikbibliotheken benötigen zusätzlich getrennt gesicherte Originalaudiodateien; segmentierte Bibliotheksbackups/-restores sind weiterhin offen. Keine vollständige Migration ohne nachgewiesene Sicherung behaupten.
- Backups sind persönliche, unverschlüsselte Dateien: nicht in Git, GitHub-Actions-Artefakte oder das Cloudflare-Uploadverzeichnis legen. Cloudpaket enthält ausschließlich Appcode/Assets/Lizenzen. Keine automatische Cloud-Datenbank, keine Musik-/Dokumentsynchronisation, kein Supabase-Login.
- Tailscale Serve bleibt unverändert als Rückfalladresse erhalten, wenn der Windows-PC eingeschaltet ist. Bei ausgeschaltetem PC funktioniert die dort bereits gecachte PWA weiter offline; für neue Netzauslieferung ist dann der spätere Cloudhost zuständig. Kein Task-/ACL-/Funnel-/DNS-Eingriff in dieser Sitzung. Nach einem Schema-v2-Upgrade nur kompatible Recovery, keinen Website-/Datenbankreset als Rückweg verwenden.

## Kostenloser Rahmen und überprüfte Anbieterquellen

Öffentliche Cloudflare-Dokumentation über das offizielle GitHub-Quellenrepo geprüft, Stand 4. November 2026, Commit **`b34fec76797f87e74ee87f484ee90b26d51dd4af`**. Direkter Abruf von developers.cloudflare.com war aus dieser Umgebung mit Tunnel-HTTP403 blockiert; kein Konto-/Tarifdashboard wurde abgerufen.

| Grenze | Konsequenz |
|---|---|
| Pages Free: 500 Builds/Monat, 20.000 Dateien, 25 MiB pro Datei | aktuelles Paket hat 110 lokale Dateien; keine persönlichen Audios als Hostingassets |
| Pages Functions/Workers Free: zusammen 100.000 Requests/Tag, Reset 00:00 UTC | **alle** geschützten Assets laufen durch die Funktion; unbegrenzte kostenlose Static Requests gelten hier nicht. Bei Erschöpfung Fail Closed statt Schutzumgehung/automatischem Paid-Upgrade |
| Zero Trust Access Free: bekannter Tarifrahmen bis 50 Nutzer | aktuelle Sitz-/Sitzungs-/Kontobedingungen vor Auswahl im Anbieterangebot bestätigen; nicht als hier überprüfte individuelle Tarifzusage ausgeben |
| GitHub Actions/Codespaces | eigene Kontingente/Tarife, nur Standardrunner vorgesehen; Codespaces optional und vorab Quote prüfen. Keine kostenpflichtige Infrastruktur automatisch aktivieren |

Keine Kostengarantie und kein abgeschlossener Vertrag. Zusätzliche Funktions-CPU-/Ressourcenlimits und künftige Tarifänderungen beachten. Keine eigene Domain/R2/Datenbank erforderlich. Bei kostenpflichtiger Voraussetzung stoppen und Entscheidung einholen.

Quellen: [Previewzugriff](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [Apex und Wildcard separat schützen](https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain), [Fail open/closed](https://developers.cloudflare.com/pages/functions/routing/#fail-open--closed), [Pages-Limits](https://developers.cloudflare.com/pages/platform/limits/), [Functions-Quota](https://developers.cloudflare.com/pages/functions/pricing/), [JWT-Prüfung](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Advanced Mode](https://developers.cloudflare.com/pages/functions/advanced-mode/), [leeres Direct-Upload-Projekt](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Access-Tarif prüfen](https://www.cloudflare.com/plans/zero-trust-services/). Quelltexte unter `cloudflare/cloudflare-docs@<oben genannter SHA>:src/content/docs/`.

## Tatsächliche Tests, Paket und offene Liveabnahme

- **47/47 automatisierte Tests**: alle 37 Basisregressionen erhalten; Signatur/Issuer/AUD/Zeiten/Allowlist, fehlende Secrets, fehlgeschlagene JWKS, HTTPS, Methoden, keine Tokenweitergabe; Login-/Assetcache-Poisoning, alter Cache bleibt erhalten, Safari-Redirect-Fix, alle Routen, Broad-/Bypass-Policyablehnung, Source-Neubau ohne Git sowie Bytetampering-Erkennung.
- **Chromium Linux:** 112 Rootchecks, 112 unter `/Air-OS/`, zehn originale Update-/Recoverychecks, zehn zusätzliche Cloudabläufe. Insgesamt **244 Browserchecks**. Echtes Browserprofil, kalter Prozessneustart ohne Server, synthetische Anmeldeumleitung/echte RSA-Prüfung, abgelaufene Sitzung, geschützte Entwürfe, sichere automatische Aktivierung und explizite Restoreübernahme an einen zweiten Origin. Das ist kein echter Cloudflare-/IdP-Login.
- Audit eingefrorener Testwerkzeuge: **0 Schwachstellen**. Normales PWA-Paket 106, Cloudpaket **110** exakt überprüfte Dateien; Manifest `./`, CSP, Lizenzen/Corresponding Source vorhanden, kein Node/Electron im Browser. Keine neue npm-Produktabhängigkeit.
- **WebKit für diese Phase nicht ausgeführt:** offizieller Playwright-Download (WebKit 26.5/v2336) blockiert durch HTTP403 „Domain forbidden“. Die vorherige iPad-2.0-Abnahme bleibt gültiger Basisnachweis, ersetzt aber keinen neuen WebKitlauf. Der manuelle/releasegebundene neue CI-Workflow verlangt beide Browser und gibt ohne deren Erfolg kein Verified-Build-Artefakt frei. Dieser Cloud-CI-Lauf wurde nicht gestartet; keine neue Actions-URL erfunden.
- Offen: reale Cloudflare-Account-/Access-/Wildcard-/Fail-Closed-Konfiguration, anonyme externe Prüfungen, reale Token-/Schlüsselrotation, Quota-/Runtimeverhalten, erste ausdrücklich freigegebene Veröffentlichung, realer Safari-/IdP-/Home-Screen-Login, physisches iPad, große persönliche Bibliothek und vollständige Datenmigration. Keine persönliche Installation als Testfixture verwendet.

Lokal gebaut: `Air-OS-iPad-Private-Cloud-62a7b31aa1cb4a70c846901e9a36955210b8130f.zip`. SHA-256 **`86e1d36b52a39227b203e2987ece1a970af38f5d3ade310e241e6227f2609984`**, PWA-Version `air-os-ipad-v5-42efa24dba92d48f0c41`. ZIP/SHA unter `dist/`, nicht in Git und nicht hochgeladen. Andere Buildmaschinen können andere ZIP-Zeitstempel und Archivhashes haben; stets die zugehörige `.sha256` verwenden.

[Gesicherte synthetische Evidenz](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/report.json): [Clouddesktop](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/cloud-protected-desktop.png), [Sitzung abgelaufen](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/cloud-session-expired.png), [kalter Offlinestart](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/cloud-cold-offline.png), [erneuert und aktualisiert](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/cloud-renewed-update.png), [Hochformat](visual/ipad-private-cloud/62a7b31aa1cb4a70c846901e9a36955210b8130f/cloud-portrait.png). Unveränderte Rendereraufnahmen, ausschließlich synthetische Inhalte. `liveCloudflare:false`, `physicalIPad:false` sind im Report ausdrücklich gesetzt.

Checkpoints: `2be47425ff4d15bbff4e179e9a2ead8d87ee7123` (Build/Access/Offline), `29b57a7fafae3c556d5682e03486835ce4d19f11` (HTTPS), `62a7b31aa1cb4a70c846901e9a36955210b8130f` (Verified-Paket erst nach beiden Browsergates). Alle auf eigenem Featurebranch gesichert/gepusht. Dokumentationsabschluss siehe Git-Verlauf dieses Berichts.

**Noch erforderliche Handlung:** ausdrückliche Freigabe zur Cloudflare-Kontoanbindung und Sicherheitskonfiguration; danach echte Schutz-/WebKit-/iPad-Abnahme. Erst anschließend separate Freigabe für die Veröffentlichung eines exakten Builds. Persönliche Migration ist eine weitere, gesondert freizugebende Handlung.
