# Air-OS: gemeinsamer Integrationsstand bis Renderer-Absturz-Recovery

Prüfung am 23. Oktober 2026. Ziel ist **Integration in den bestehenden Entwicklungsbranch**, keine Veröffentlichung und kein Merge nach main. Keine Quellcodeänderung, kein Merge, kein Force-Push. Dieser neue Dokumentationsbranch `docs/air-integration-review-20261023` basiert auf dem geprüften Head; er enthält nur den zusätzlichen Prüfbericht/PR-Text und Übergaben. Der vorgesehene PR verwendet den bestehenden Recovery-Branch als Head, **nicht diesen Dokumentationsbranch**.

## Bestätigte GitHub-Refs

| Ref | SHA / Einordnung |
| --- | --- |
| main | `a1f3e123200b17f3d5b1d6275dd39cd526d5f96e`, unverändert |
| `feat/air-os-architecture-foundation`, PR #11 | `eecab2a043fc62ab0802312aa09ce29dfd96c280`, gemeinsame PR-Base |
| `fix/air-finder-save-temp-cleanup-20261023` | `552282ffa71ffd465ff4a3067977f1c770d9e7fe`, Vorfahr des Heads |
| `feat/air-chatgpt-installation-probe-20261023` | `e745357d4b46b0c032c4543561a1359a591205ad`, direkter Parent des Heads |
| `fix/airapp-renderer-crash-recovery-20261023` | `96dd9908865c9eca8e0f035e0375f57784df6de2`, angeforderter Integrations-Head |
| `fix/air-notes-pending-save-edits-20261023` | `0be04bafefd7dbd3c3f0812907ca36b6e5d8551c`, bereits vorhandener späterer Folgecommit |
| `fix/air-preferences-exclusive-temp-20261023` | `827d1ef0203b61e01c3d600ff7398f3da3c2bc9d`, nächster Folgecommit |
| `fix/air-desktop-platform-test-gates-20261023` | `eb3f3bc62641afdd4a0fc2a5a66f6dc3fa053f73`, jüngster bestätigter Stand dieser linearen Entwicklungsfolge |

Der vom Auftrag benannte Recovery-Branch ist also ein konsistenter Checkpoint, inzwischen aber nicht mehr das Ende dieser Folge. Die drei neueren Commits werden nicht still in den angeforderten PR aufgenommen. Andere offene PR-Branches wie Tiny Strike/AirWrite/Dependabot sind nicht Gegenstand dieser Integration und werden nicht pauschal als enthalten bezeichnet.

## Historie, Duplikate und Merge-Simulation

`git rev-list --count 96dd990`: **91 Commits** vom Root bis Head. Keine Merge-Commits; alle 91 erzeugen einen nichtleeren stabilen Patch. Über `git log --no-merges --format='commit %H' -p 96dd990 | git patch-id --stable` keine gleichen Patch-IDs gefunden. Ähnliche/gleiche historische Commit-Betreffzeilen, etwa zu Security-Checks, sind allein kein Beleg für doppelte Patches. Keine historische Bereinigung vorgenommen.

`git merge-base --is-ancestor` bestätigt main, PR-#11-Base, Finder und ChatGPT als Vorfahren des Heads. Vollständige Parent-Kette unten, insbesondere `552282f → e745357 → 96dd990`. `git rev-list --left-right --count BASE...HEAD`: **0 / 10**. `git cherry BASE HEAD`: zehn `+`, kein bereits in Base vorhandener äquivalenter Patch.

Lokale `git merge-tree --write-tree BASE HEAD`: Exit 0, keine Konflikte. Ergebnisbaum und `HEAD^{tree}` sind identisch: `e713def677f0bfe7e287154732f0630814eac764`. Damit enthält der simulierte Integrationsbaum alle Head-Dateien und nichts wird durch eine Konfliktauflösung verworfen. Diff: 23 Dateien, 1564 hinzugefügte/4 entfernte Zeilen, **keine Dateilöschungen**. Die vier entfernten Zeilen gehören zu gezielten Ersetzungen in bestehenden Implementierungen. Dies ist eine lokale Simulation gegen die bestätigten SHAs; nach neuem Base-/Head-Commit erneut prüfen. Kein behaupteter aktueller GitHub-Mergeability-Status bei gesperrter API.

Ein gemeinsamer PR ist sinnvoll: Die drei Sicherheits-/Recovery-Branches sind verschachtelte Vorfahren, keine unabhängigen Patches. Der PR umfasst jedoch alle zehn folgenden Checkpoints und nicht nur die letzten drei:

```text
b450031 Document verified Air-OS Ultimate inventory and micro-roadmap
335e0ac Check Air Modern dock in Electron and fix active background
f5cdcac Add accessible Air Island base with local clock and panel
c35f31d Connect Control Center dock tile to persistent profile settings
a40bb24 Show acknowledged Air Notes saves in Island panel
9709376 Notify repeated internal window focus changes correctly
764ac84 Persist validated profile-specific dock pin references
552282f Preserve foreign temporary paths when Finder save creation fails
e745357 Add bounded ChatGPT installation candidate probe
96dd990 Retire crashed Air App renderers before verified restart
```

## Ausgeführte Prüfungen am exakten Head

Separate saubere Worktree unter `/workspace/air-os-integration-review`, zunächst exakt `96dd990`; der zuvor aktuelle Checkout `eb3f3bc` bleibt unverändert. Linux x86_64, Node 24.19.0/npm 11.9.0. Keine Testdaten aus echten Nutzerprofilen.

- `TMPDIR=/workspace/scratch npm test`: **125 bestanden, 0 fehlgeschlagen/übersprungen**. Einschließlich Finder-Kollisionen/Dateifehler, ChatGPT-Kandidat vorhanden/fehlend/abgelehnt, signierte Air-App-Pakete und Installations-Recovery, Renderer-Absturz/Retry/Profiltrennung. Die neuen Runtime-/ChatGPT-Plattformantworten sind klar gekennzeichnete Test-Doubles; Store-/Finder-Tests verwenden echte temporäre Dateien.
- `node --check` für **alle versionierten `.js`/`.cjs`** bestanden; `npm run check:catalina` bestanden.
- `git diff --check BASE..HEAD`, `git fsck --connectivity-only --no-dangling HEAD`, Konfliktmarkerprüfung aller versionierten Dateien bestanden.
- Dateinamen-Suche entsprechend Security-Workflow nach `.env`, SSH-/Signing-Schlüsseln, `accounts.json`, `.DS_Store` sowie Private-Key-Header-Suche ohne Treffer. Das sind begrenzte Prüfungen, kein vollständiger Secret-/Auth-/Penetrationstest.
- Keine neuen GUI-, echten Electron-Crash-, Windows-/macOS-, Installer- oder Race-/Power-Loss-Tests. Bestehende GUI-Belege in alten Checkpoints ersetzen keine neue native Abnahme.

## Aktueller Dependency-Audit und Datenverlustgrenzen

In `/tmp/air-integration-audit` die **exakte package.json des Heads** kopiert; `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` erfolgreich. Keine Install-Skripte ausgeführt, keine Manifest-/Lockfile-Änderung im Repository, kein Upgrade. Anschließend `npm audit --audit-level=high --json`: **Exit 1**, **2 High**, keine Critical/Moderate/Low/Info.

| Paket | Frisch aufgelöste Version | Befund |
| --- | --- | --- |
| electron | 32.3.3 | High; u.a. [ASAR-Integritätsumgehung](https://github.com/advisories/GHSA-vmqv-hx8q-j7mg) |
| extract-zip | 2.0.1 | High; u.a. [Symlink-/Path-Traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv) |

Electron-builder bleibt 26.15.3. SHA256 des temporären frischen Lockfiles: `8f01b79ed42e9e510efe1b124b53d6be1d137cd98ada1c511d9c1fbcbc68ab0b`. Quelle ist eine heutige frische Auflösung der deklarierten Versionen; das Repository hat kein festgeschriebenes Lockfile. Deshalb kein Audit eines vorhandenen signierten Installers oder seiner ursprünglichen transitiven Auflösung. Historische zehn Audit-Einträge werden nicht rückwirkend als falsch oder sämtliche früheren Risiken als behoben bezeichnet. Keine Audit-Ausnahme und kein Major-Upgrade. Reguläre öffentliche Freigabe weiterhin blockiert.

Der angeforderte Head enthält den Finder-Tempdateischutz. Er enthält **noch nicht** den bereits vorhandenen späteren Preferences-Fix `827d1ef`: Der dortige alte Temp-Writer kann bei Kollision/Symlink fremde Daten verändern. Auch der Notes-Save-Fix `0be04ba` und die nativen CI-Testschranken `eb3f3bc` fehlen in diesem Head. Diese bekannten offenen Datenintegritäts-/Qualitätsgrenzen im Review sichtbar lassen und Folgeintegration priorisieren. Keine Datenbank-/Profilmigration oder echte Nutzerdatei angefasst. Allgemeine konkurrierende Pfad-Races und Power-Loss bleiben auch nach den Fixes unbewiesen.

ChatGPT ist nur eine unverbundene Kandidatenprüfung, kein Launcher/Identitätsnachweis. Dock-Pins sind ein profilbezogener Speichervertrag ohne vollständige Pin/Unpin-UI. Cloud-Sync bleibt nicht verfügbar. Kein zweiter Window Manager oder zweite App Registry.

## PR-Erstellung: konkreter technischer Blocker

Vorgesehen: Draft-PR `fix/airapp-renderer-crash-recovery-20261023` → `feat/air-os-architecture-foundation`. Vollständig reviewbarer Text in [AIR_OS_INTEGRATION_PR.md](AIR_OS_INTEGRATION_PR.md).

`gh pr list --state open` scheitert an GraphQL Forbidden. Die erreichbare öffentliche Pull-Request-Liste zeigte PR #11 und ältere separate PRs, keinen gemeinsamen Integrations-PR. Anschließend tatsächlicher Erstellungsversuch mit festgelegter Base/Head, `--draft` und `--body-file /tmp/air-integration-pr-body.md`: **`Post https://api.github.com/graphql: Forbidden`**. **Kein PR erstellt, keine PR-Nummer erfunden.** Kein Auto-Review-Rejection- oder fehlendes Nutzerfreigabeproblem; die verfügbare GitHub-API ist technisch gesperrt. Keine geeigneten GitHub-Connector-/Browser-Werkzeuge in dieser Umgebung verfügbar. Git-Transport bleibt nutzbar; Bericht und PR-Text werden auf dem separaten Dokumentationsbranch gesichert.

[Vergleich mit korrekter Base/Head und PR-Erstellung im Browser](https://github.com/quattrologic/Air-Os-Clean/compare/feat/air-os-architecture-foundation...fix/airapp-renderer-crash-recovery-20261023?expand=1). Der Link allein erstellt noch keinen PR. Bei später funktionierendem API-Zugriff erst erneut bestehende PRs/HEADs prüfen und dann den gespeicherten Text verwenden, um Doppel-PRs zu vermeiden.

`security-check.yml` läuft bei PRs allgemein. `build-desktop.yml` filtert PRs auf Base **main**; bei dieser gewünschten Entwicklungs-Base startet er nicht automatisch. Windows-/macOS-Validierung muss deshalb separat für denselben Integrations-SHA ausgelöst/abgenommen werden. Die neuen Testschranken aus `eb3f3bc` sind erst nach dessen Folgeintegration verfügbar. Frühere erfolgreiche Builds auf `eecab2a` sind kein aktueller Nachweis.

## Sichere Reihenfolge

1. Nur den gemeinsamen Draft-PR bis `96dd990` gegen den Entwicklungsbranch reviewen; keine drei verschachtelten Einzel-PRs zusätzlich mergen/cherry-picken. Fachlich konsistent, lokal konfliktfrei, wegen Audit/native Tests noch keine Release-Freigabe.
2. Bei späterer Freigabe **normalen Merge mit erhaltener Historie** bevorzugen. Base ist heute Vorfahr, ein Fast-Forward wäre auf Git-Ebene möglich; kein Merge wird hier durchgeführt. Squash/Rebase-Merge verändert die Ancestry und würde die unveränderten Folgebranches erneut mit alten Commits belasten. Falls dennoch gewählt, Folgebranches zuerst bewusst neu basieren und neu prüfen; kein Force-Push im Rahmen dieser Sitzung.
3. Danach die linearen Folgecommits `0be04ba` → `827d1ef` → `eb3f3bc` separat reviewen. Ein weiterer gemeinsamer PR vom letzten Folgebranch enthält alle drei, alternativ in dieser Reihenfolge integrieren. Nicht parallel die Vorfahren und den Gesamtbranch mergen. Nach jedem Base-Wechsel Diff/Merge-Simulation/Tests erneut prüfen; ein neuer Merge-Commit auf Base erfordert erneute Simulation, ist nicht schon hier abgenommen.
4. Audit, native Tests, Signing/Notarisierung, Produktions-Store-Trust, Updates/Rollback und Lockfile-Strategie abarbeiten. PR #11/main erst in gesonderter Freigabe behandeln; main bleibt unverändert.

## Vollständige geprüfte Historie

Format: Commit-SHA, Parent-SHA (beim Root leer), Betreff; alle 91 Commits in aufsteigender Reihenfolge.

```text
09fb174b35d9c9e0960a3dc0375ef0e588bd71c5  Initial clean Air-OS commit
a80a4461afee3609513c80ba3909065ed7d7db1a 09fb174b35d9c9e0960a3dc0375ef0e588bd71c5 Add MIT License to the project
e09ff0fc052f821539002fcaad25e6a2da1a21bd a80a4461afee3609513c80ba3909065ed7d7db1a Harden external link handling in Electron
ebd209fb3ae6368672a608ea8c28599dc23adf0c e09ff0fc052f821539002fcaad25e6a2da1a21bd Add automated security checks and disclosure guidance
e64b06d071c9486d306026e0123b155a8e0a2ecf ebd209fb3ae6368672a608ea8c28599dc23adf0c Add automated security checks and disclosure guidance
915708a5d98dd92049dd55fa035ec1eea9d52d02 e64b06d071c9486d306026e0123b155a8e0a2ecf Add automated security checks and disclosure guidance
d08b9bf626c8a70e35bda7f29d707fe457bf097f 915708a5d98dd92049dd55fa035ec1eea9d52d02 Ignore local account data and signing secrets
20e7e8dd563190e15d88fb448c8e7b8ec98b0f1f d08b9bf626c8a70e35bda7f29d707fe457bf097f Upgrade Electron and electron-builder to supported stable versions
9c9542a059fe3cb4158390a2ce1f8dcce2e0a04c 20e7e8dd563190e15d88fb448c8e7b8ec98b0f1f Run JavaScript syntax checks and always check tracked secrets
0095341399b68e8579608acad52563303605afcc 9c9542a059fe3cb4158390a2ce1f8dcce2e0a04c Prepare opt-in offline-first cloud sync foundation
82fd95c86a0715b117cc6ef2fb01421aa581d1f7 0095341399b68e8579608acad52563303605afcc Prepare opt-in sync selection for settings, apps, AirWrite and Finder
74efabcd1f45a8f21780f5599978e48e034df9ff 82fd95c86a0715b117cc6ef2fb01421aa581d1f7 Add AirWrite handwriting app with local editable stroke storage
7ebb5142fff006303d9932247c73de55a32d4e94 74efabcd1f45a8f21780f5599978e48e034df9ff Restrict planned AirWrite cloud sync to selected handwriting profiles
b06335281323fec30b68c01cd6e9c5a21f55c4bf 7ebb5142fff006303d9932247c73de55a32d4e94 Update Air-OS menu logo, compact desktop icons and three dock icons
df510d03d5165544c2b63c3084294fe95f11cf5c b06335281323fec30b68c01cd6e9c5a21f55c4bf Use supplied bitten pear silhouette and minimalist arcade dock icon
793f41b7681ee24dbd830e46e3049185620ae3d9 df510d03d5165544c2b63c3084294fe95f11cf5c Simplify Downloads dock icon to blue arrow only
a20aad11b1b9b355ac509d85187d65cab29e9c51 793f41b7681ee24dbd830e46e3049185620ae3d9 Restore original trash, redesign Arcade icon and make menu pear black
f62cd709a6cf9821bd20f0b0197403f406a1ccb2 a20aad11b1b9b355ac509d85187d65cab29e9c51 Improve README and add contributor, development and issue documentation
1b9eb12aadd97f46f7e15a229729245a8daec54c f62cd709a6cf9821bd20f0b0197403f406a1ccb2 Pause public installer releases and mark Air-OS as development-only
8263c66fe2707dcf2e183a9b5dc9b49fdfcba464 1b9eb12aadd97f46f7e15a229729245a8daec54c Restore Air-Rechner, Air-KI and Air-Übersetzer from draft PR #9
fef61d511e0511a9b51c4db6ddcc107b3912ae2c 8263c66fe2707dcf2e183a9b5dc9b49fdfcba464 Restore handwriting-profile AirWrite from PR #8 and update docs
c4d55ef96d36ded91907f12b2961156bad9551ae fef61d511e0511a9b51c4db6ddcc107b3912ae2c Expand Air Arcade with seven integrated offline mini-games and blue joystick icon
948c563d50f477e7028c6fe5e60640d2763bfcf2 c4d55ef96d36ded91907f12b2961156bad9551ae Trace Air Arcade joystick icon directly from supplied reference
c10e7922796f45fea0a3def375463ad981a2d713 948c563d50f477e7028c6fe5e60640d2763bfcf2 Integrate Air Music with MIT-licensed AmplitudeJS, local files and playlists
9c78dc74455e8ae974d741c300a424ff499ec47e c10e7922796f45fea0a3def375463ad981a2d713 Redesign Air Music dock icon as minimalist iPod inspired by AirCard Lite
099ffcd173eba40b8cb5922127856245e8fdc161 9c78dc74455e8ae974d741c300a424ff499ec47e Target macOS Catalina 10.15 with Electron 32 and compatibility checks
9e1fa76bb99592f9d80acc360a0330eda5ae7c08 099ffcd173eba40b8cb5922127856245e8fdc161 Show prominent 2048 score and persist personal high score locally
0c996f3ab515b01563f1731468438aabfb0c9fdb 9e1fa76bb99592f9d80acc360a0330eda5ae7c08 Modernize AirWrite icon with minimalist Apple-style pen and page
a1f3e123200b17f3d5b1d6275dd39cd526d5f96e 0c996f3ab515b01563f1731468438aabfb0c9fdb Refine AirWrite dock icon to soft pastel blue minimalist style
b51c14b5b59b2813a472fe825f95656081a518a7 a1f3e123200b17f3d5b1d6275dd39cd526d5f96e Start Air-OS architecture: shared app registry, tests and audit
05bfbe14f570059590f390cc993418856628f196 b51c14b5b59b2813a472fe825f95656081a518a7 Reject reserved prototype property names in app registry
7c832846eba9e75498e417352c363d2c64981033 05bfbe14f570059590f390cc993418856628f196 Track application lifecycle and register Air Arcade via central registry
daff81cc249adab99065c515c32fadd192bf7d65 7c832846eba9e75498e417352c363d2c64981033 Introduce searchable Launchpad for bundled Air-OS apps
4df08859f2dc83ade4d6db676e90c5f8343db595 daff81cc249adab99065c515c32fadd192bf7d65 Persist validated appearance preferences per authenticated local user
a06e518eb63b371cdab98a0598cc86a0aeb76693 4df08859f2dc83ade4d6db676e90c5f8343db595 Add accessible Spotlight-style application search with Ctrl/Command K
fea1fca524c10824bb474b7b90c009c48ab067ca a06e518eb63b371cdab98a0598cc86a0aeb76693 Document dependency advisories and add isolated modern Electron test channel
0b6819e592402592d2b406d16ebe034a4b3196cd fea1fca524c10824bb474b7b90c009c48ab067ca Implement per-user Air Notes CRUD with validated IPC and atomic storage
760875dda41e15e1cb6254f13d6ada3a33ed621f 0b6819e592402592d2b406d16ebe034a4b3196cd Record implementation status, test evidence, audit blockers and exact next steps
07a8e62ac3d5abbdaa3faff25c4e57416f7f40e5 760875dda41e15e1cb6254f13d6ada3a33ed621f Implement signed airapp package verifier and per-user local install manager
7559b0e6f464303b528b81618a3c2956a03a8ec5 07a8e62ac3d5abbdaa3faff25c4e57416f7f40e5 Bundle Ed25519 signed offline Air Timer demo package and public key
a8cb1a201fa79b43d962fb874ec9ab73cf3317b3 7559b0e6f464303b528b81618a3c2956a03a8ec5 Wire signed local airapp installer to sandboxed Electron app runtime
396a8905f489039d68a38b966d3bd382ce1c8659 a8cb1a201fa79b43d962fb874ec9ab73cf3317b3 Add functional local Air App Store UI and installable signed demo timer
be797f1c1f00a15b47f138317142fb7df16840a2 396a8905f489039d68a38b966d3bd382ce1c8659 Recheck signed package and installed file hashes on every app launch
831bc7bc7f782b191770cebc79679b538a9bd855 be797f1c1f00a15b47f138317142fb7df16840a2 Show installed signed apps in Launchpad and Spotlight with guarded launch
4dde81a496c2f2fa7694ccc61cce15f2d69bff47 831bc7bc7f782b191770cebc79679b538a9bd855 Make signed app uninstall rollback-safe and reject symlink targets
b61d5cf3b149bc692a19d3a356f6e6ade13d30f4 4dde81a496c2f2fa7694ccc61cce15f2d69bff47 Validate signed app assets and canonical paths on each runtime request
94bb7f2444477aee8bd974c4586bf196435214ea b61d5cf3b149bc692a19d3a356f6e6ade13d30f4 Update registry test expectation for built-in origin metadata
027ae762150b8973e8f499cee4f8bba291e3c695 94bb7f2444477aee8bd974c4586bf196435214ea Test signed Air App runtime isolation and symlink rejection
efbda65dc2978da301143e8081973bdea0a8f491 027ae762150b8973e8f499cee4f8bba291e3c695 Provide signed-runtime manifest fixture for protocol security tests
d04e2017178d08edd860a5c306f78e89b634537e efbda65dc2978da301143e8081973bdea0a8f491 Add permission-scoped Finder folder creation with symlink and traversal tests
3cc832eb9e8f8506b1a14313d8a8cae1ac2b624a d04e2017178d08edd860a5c306f78e89b634537e Enable Finder create-folder action after workspace selection
160dfc3492b7e5dfa18530a8db312bf56ae9f558 3cc832eb9e8f8506b1a14313d8a8cae1ac2b624a Enable safe Finder file duplication with no-overwrite and symlink checks
6e21094e6b1f2064160dd4dc2015be785992e6a6 160dfc3492b7e5dfa18530a8db312bf56ae9f558 Add safe file-only Finder rename without overwriting destinations
46e172b6b8c98dfc6b8784e52fb85a694b1c0949 6e21094e6b1f2064160dd4dc2015be785992e6a6 Remove inline-style allowance from sandboxed Air App CSP
b7c23c83ab96d129c693b25aa3f3133555edd722 46e172b6b8c98dfc6b8784e52fb85a694b1c0949 Search per-user note titles in Spotlight and focus selected Air Notes
a4c7b29becf1f86ead59592bf7aaded698f1f2b9 b7c23c83ab96d129c693b25aa3f3133555edd722 Hash-check bytes delivered by sandboxed Air App protocol
10a7492147aaa07684b3c9e0c0570dfcbcb3a1c8 a4c7b29becf1f86ead59592bf7aaded698f1f2b9 Journal Air App removals and recover interrupted uninstalls without data loss
b33f945e25a9eca917e88bb01569b9cead25d975 10a7492147aaa07684b3c9e0c0570dfcbcb3a1c8 Fix recovery journal staging-name validation
c20246990e6ed402992abd9adadc3dd0a4b581a7 b33f945e25a9eca917e88bb01569b9cead25d975 Test crash recovery for interrupted signed-app uninstall transactions
716bb4de718113fb6026a0f2d7b0da44b462dd24 c20246990e6ed402992abd9adadc3dd0a4b581a7 Reload and verify current signed app assets per protocol request
a26c88933db91a098f14210e2384a2e566139984 716bb4de718113fb6026a0f2d7b0da44b462dd24 Regression-test persistent Air App sessions after reinstall and uninstall
795f50d7c67245b3cafb94325bf24f2bf474a885 a26c88933db91a098f14210e2384a2e566139984 Add bounded, authorized Finder filename search API and security tests
739f4d1730c9f7988525e62e3cdcebf203ff8bbd 795f50d7c67245b3cafb94325bf24f2bf474a885 Show approved Finder filename matches in Spotlight and reveal results
844877c3347ae263094df96d082900af83e97968 739f4d1730c9f7988525e62e3cdcebf203ff8bbd Record verified CI results, audit risks and resumable Air-OS development handoff
524768a77e445171ad33b6b87cbbad68a42f0f37 844877c3347ae263094df96d082900af83e97968 Prevent Finder New File from truncating existing user documents
9a947dbce57f381730a4671f48f4a2174c1aa0dc 524768a77e445171ad33b6b87cbbad68a42f0f37 Introduce per-profile Air Reminders service with atomic CRUD and tests
217a91ced9d70172aeaa4cece852c8af597415ec 9a947dbce57f381730a4671f48f4a2174c1aa0dc Add native Air Reminders app with task editor, priorities, due dates and Dock icon
c0e6ac90e42c07cebd6784858baccb3c85e4b78a 217a91ced9d70172aeaa4cece852c8af597415ec Validate new Reminders and Spotlight modules in CI syntax gates
08453e9d6fa2da846e2484a7d1fc32786c8b8ca2 c0e6ac90e42c07cebd6784858baccb3c85e4b78a Update Air-OS Ultimate progress and handoff after Reminders implementation
b1f91186b61cc3cfb6b48bea145c0b7a9b5fc001 08453e9d6fa2da846e2484a7d1fc32786c8b8ca2 Record successful Reminders GUI installer CI and remaining hardware test gaps
f673d7c3a8c175ca9a9d2fee811d1f2c4d8c6499 b1f91186b61cc3cfb6b48bea145c0b7a9b5fc001 Serialize concurrent Air App launches and test single-window behavior
d4fde6e3116ddec3359b792f79482878d2e3f4d1 f673d7c3a8c175ca9a9d2fee811d1f2c4d8c6499 Record passing Air App runtime tests and outstanding dependency audit
ea51c6f083bfb300355d731d2b4a9b37808abe77 d4fde6e3116ddec3359b792f79482878d2e3f4d1 Fix Air App startup result after window closure
bd881fa2c570f57b7652f76935c5c11e5d4f1ea3 ea51c6f083bfb300355d731d2b4a9b37808abe77 Enforce Air App termination on logout and removal
f1a0e775347c7619d2c8565c1418ca150588522d bd881fa2c570f57b7652f76935c5c11e5d4f1ea3 Revoke Air App protocol access after window closure
3751d15d47a5edf2c6c6c45b2630d963bc55be3f f1a0e775347c7619d2c8565c1418ca150588522d Recover verified orphan Air App installations on retry
2c5c72b3ded7863ef231bc2133f6c499d9d7d5c2 3751d15d47a5edf2c6c6c45b2630d963bc55be3f Test recovery integration through Store Registry and Launchpad
3a6d12a8cbb817fa0a8ecacd858ff15dba7c9652 2c5c72b3ded7863ef231bc2133f6c499d9d7d5c2 Protect existing Air App staging paths from reuse and cleanup
3d3c5759c0200d12e2cc717f71cc6e6734245d5b 3a6d12a8cbb817fa0a8ecacd858ff15dba7c9652 Launch installed Spotify desktop client without browser fallback
05d132df03da2990dc91897d4a57938db9f9bc50 3d3c5759c0200d12e2cc717f71cc6e6734245d5b Add opt-in Air Modern floating dock theme
eecab2a043fc62ab0802312aa09ce29dfd96c280 05d132df03da2990dc91897d4a57938db9f9bc50 Test Spotify desktop launch contracts and UI routing
b45003159fa2607be177289c0959e8b4d6ce11e4 eecab2a043fc62ab0802312aa09ce29dfd96c280 Document verified Air-OS Ultimate inventory and micro-roadmap
335e0aceeb99c2b92662ed2e48d38262cc4005df b45003159fa2607be177289c0959e8b4d6ce11e4 Check Air Modern dock in Electron and fix active background
f5cdcace6a95c89e1c9fa95eb9dfc149082f865b 335e0aceeb99c2b92662ed2e48d38262cc4005df Add accessible Air Island base with local clock and panel
c35f31df9f17b5dba4bf4ca666ea98eb58ee36ab f5cdcace6a95c89e1c9fa95eb9dfc149082f865b Connect Control Center dock tile to persistent profile settings
a40bb2485ebd6b18a4e62a20cacc8d194f9805d1 c35f31df9f17b5dba4bf4ca666ea98eb58ee36ab Show acknowledged Air Notes saves in Island panel
970937631ba1dd5ebe8af6593547e1927509de61 a40bb2485ebd6b18a4e62a20cacc8d194f9805d1 Notify repeated internal window focus changes correctly
764ac848ed75ac7d476a5c44b82ff5dd0ad1c478 970937631ba1dd5ebe8af6593547e1927509de61 Persist validated profile-specific dock pin references
552282ffa71ffd465ff4a3067977f1c770d9e7fe 764ac848ed75ac7d476a5c44b82ff5dd0ad1c478 Preserve foreign temporary paths when Finder save creation fails
e745357d4b46b0c032c4543561a1359a591205ad 552282ffa71ffd465ff4a3067977f1c770d9e7fe Add bounded ChatGPT installation candidate probe
96dd9908865c9eca8e0f035e0375f57784df6de2 e745357d4b46b0c032c4543561a1359a591205ad Retire crashed Air App renderers before verified restart
```
