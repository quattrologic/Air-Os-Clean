# Air-OS Ultimate R2 – Windows-x64-Testkanal

27. Oktober 2026. Tahoe-5-Ausgangscommit **e71aa3bd71094ba6597dc8eb073181f374f8428e**, eigener Branch **build/air-ultimate-windows-x64-r2-20261027**. Der genaue Buildcommit wird aus dem tatsächlichen CI-Checkout in `BUILD-INFO.json` geschrieben; der abschließende Quellcommit steht im Branchverlauf und Abschlussbericht.

## Tatsächliches Windows-Ergebnis

**R2 erfolgreich gebaut, geprüft, auf dem nativen Windows-x64-Runner installiert und als installierte Anwendung GUI-getestet.** [Erfolgreicher Lauf #3](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40499579556), [nativer Job](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40499579556/job/122173588777), [gesicherte Schritt-/Artefaktnachweise](build-evidence/r2/windows-ci-final.json).

| Feld | Tatsächlicher Stand |
|---|---|
| Tahoe-5-Basis | `e71aa3bd71094ba6597dc8eb073181f374f8428e` |
| Exakter Buildcommit | `8f6ced850cf7fb2d4cb5e0c728e159f333c1e870` |
| Builddatum | 27. Oktober 2026; präzise Buildzeit in `BUILD-INFO.json` |
| Installername | `Air-OS-Ultimate-R2-1.0.3-dev.3.sha8f6ced850cf7-Windows-x64.exe` |
| Installer-SHA-256 | `3d98a66ad0e70d55df1a887dd0d9266264f9ec2277dc6c86d894363d4872c68f` |
| Installer / SHA256SUMS / BUILD-INFO / Anleitung | [Tatsächlich hochgeladenes R2-Artefakt](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40499579556/artifacts/12732018578) |
| Echte Windows-GUI-PNGs, Prozess-/Fehlerlogs, TAP, Audit, Authenticode-Status | [Tatsächlich hochgeladene Windows-Evidenz](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40499579556/artifacts/12732258173) |
| Security- und Sourcechecks, Tests | Windows-Job erfolgreich; alle439 vorhandenen/neuen Tests bleiben mandatory; keine Skips konfiguriert. Lokal439/439. |
| Paket / x64 / Installerhash | Erfolgreich; alle erwarteten ASAR-Runtimeassets geprüft, vollständiger Payload inventarisiert. |
| Tatsächliche NSIS-Installation / installierte Bytes | Erfolgreich; jedes erwartete Payloadfile und installiertes ASAR gegen Buildstand geprüft. |
| Installierte EXE / Profile / Desktop / Apps / M1/M2 / Fallback | Gesamter nativer Windows-GUI-Schritt erfolgreich. |
| Signierung / SAC / Produktion | **UNSIGNED / NOT TESTED / NOT APPROVED** |

Artefakte sind 14 Tage aufbewahrt. [Öffentlich erreichbare Artefakttabelle](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40499579556#artifacts); zum Download **bei GitHub anmelden**. Anonyme HEAD-Abfragen der direkten Downloadrouten liefern hier404; Existenz, Name, ID und ZIP-Digest sind in der öffentlichen Artefakttabelle belegt. Ein unabhängiger Download aus dieser Sitzung war nicht möglich. Die genaue Installergröße, File-by-File-Hashes und Testergebnisse stehen in der mitgelieferten `BUILD-INFO.json`. Keine öffentliche GitHub-Releasefreigabe. Die ZIP-Artefaktdigests im Evidenz-JSON sind **andere** Werte als der oben genannte EXE-SHA-256. Die Binärprüfung fand tatsächlich im Windows-Runner statt; kein zusätzlicher unabhängiger lokaler ZIP-Download wurde behauptet.

Die Actions-API dieser Umgebung bleibt mit HTTP403 gesperrt; **die öffentliche Workflow-/Jobseite lieferte jedoch den tatsächlichen Nachweis sämtlicher erfolgreichen Schritte und beider existierender Artefakte.** [API-Grenze](build-evidence/r2/github-access.json). Lokal steht ausschließlich Linux zur Verfügung. Windows-PNGs liegen im ausdrücklich verlinkten Windows-Evidenzartefakt; die unten gespeicherten lokalen Linuxbilder werden nicht als Windowsbilder ausgegeben.

Vorläufe offen dokumentiert: [#1](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40498593077) scheiterte vor Packaging an einer POSIX-Datei-URL in der bestehenden Main-Bridge-Testfixture. Jetzt native `path.resolve()`/`pathToFileURL()`, gleiche Sicherheitsassertions. [#2](https://github.com/quattrologic/Air-Os-Clean/actions/runs/40498832934) baute/installierte erfolgreich, GUI scheiterte am nicht aktivierten Schnellzugriff nach Pointereingabe. Der finale Test aktiviert animierte Island-Buttons nach Motion-Ende per echter fokussierter Tastatureingabe, mit unveränderten vier-Karten-/Escape-/M1-Assertions. Kein Produktcode geändert; erfolglose Vorläufe werden nicht als Gesamtfreigabe gezählt.

[Eigener R2-Workflow](https://github.com/quattrologic/Air-Os-Clean/actions/workflows/build-windows-r2.yml). **main, R1, R1.1/Signing und Legacykanäle bleiben unverändert.** Der spätere Dokumentationscommit verändert den tatsächlich gebauten Commit nicht und löst wegen `paths-ignore` keinen neuen Build aus.

## Tatsächlich eingerichteter Ausführungspfad

1. `windows-2022` x64, Node 24, unveränderte eingefrorene Toolchain **Electron 44.9.3 / electron-builder 26.18.0 / Amplitude 5.3.2** aus `build/windows-x64/package-lock.json`. Kein neuer Paket-/CDN-Laufzeitbezug.
2. Mandatory `npm audit --audit-level=high` einschließlich Dev-Abhängigkeiten, bestehende Source-/Modern-/Catalina-Checks und vollständiger `run-test-gate.cjs`; kein Überspringen bei Fehlern.
3. `windows-r2-build.cjs source` prüft Tahoe-5-Abstammung, korrekten CI-Ref/SHA, kritische neue Module und alle 200 Laufzeitressourcen gegen Gitbytes. `prepare` verwendet R1 unverändert und ergänzt nur R2-Identität, aktuelle Funktionen/Grenzen und Installername.
4. NSIS x64 mit `--publish never`, danach bestehende R1-ASAR-Prüfung: erwartete lokale Dateien/Originalfonts/Shader/Tahoe-SVGs/MIT/OFL/GPL-Lizenzen byteweise, Abhängigkeiten und Metadaten semantisch geprüft. Paket-JSON wird durch electron-builder normalisiert; darin sämtliche verbleibenden Felder verglichen. Keine Testlauncher, Profile oder Zugangsdaten im Paket.
5. Vollständiges `win-unpacked`-Payloadinventar mit Datei/SHA-256/Größe, x64-PE-Prüfung, Installerhash. Installation per NSIS `/S` **ausschließlich im RUNNER_TEMP**. Sämtliche installierten Payloadbytes und das installierte ASAR werden nochmals gegen den gerade gebauten Stand geprüft.
6. `check-windows-r2.cjs` verwendet den vorhandenen aktuellen Tahoe-Regressionsablauf, aber ausschließlich die installierte EXE im CI, keine Source-App und keinen Consent-Testhost. Isolierte zufällige Testprofile und eigene Tondatei, echte CDP-Tastatur-/Mauseingaben. Native Fenstervergrößerung für 1920×1080 und 1650×930; 390×600 ist ein schmaler Renderer, kein physisches 390px-Gerät.
7. Tests für Login/Fehler/Login/Logout/Neustart/zwei Profile, registrierte interne Appstarts, Notes/Home/Reminders, Kalender/Spotlight/Kontrollzentrum/Widgets, M1/M2-Reverse, Dockkontext, Classic/Modern/Reduced Motion und nativ deaktiviertes WebGL1+2. Zusätzlicher Tahoe-5-Abschnitt für MRU-Shortcut, Snap/Restore, echte lokale WAV-Decodierung/Fortschritt, gemeinsamer Player-/Widget-/Islandzustand und neutrale Sperre mit erneuter Anmeldung. Titel/Artwork ohne Tags fallen ehrlich zurück. MP3-/FLAC-Metadaten werden in der bestehenden Testsuite geprüft; native Picker/Codecaudioausgabe sind dadurch nicht abgenommen.
8. `BUILD-INFO.json` hält tatsächliche Installation und GUI-Ergebnisse fest, auch bei Fehlern. Installer kann als ausdrücklich nicht freigegebenes technisches Artefakt mit fehlgeschlagener GUI-Evidenz hochgeladen werden; ein Upload ist keine Freigabe. Fehlerlogs/Screenshots/Tests/Audit separat, alle 14 Tage aufbewahrt.

Enthalten sind sämtliche tatsächlich integrierten Tahoe-1–5-Module: originale 14 Tahoeicons samt Herkunft/GPL, gemeinsames Designsystem, Einstellungen/Finder/Notes/Reminders/Kalender/Musik, Widgetgalerie/Widgets, CC/Spotlight, Dock/Island/M1/M2, GLASS-3 und CSS, MacLock, begrenzter lokaler Metadatenimport/Now Playing, Mitteilungen, MRU/Snap und profilbezogene Fensterpositionen. Nicht implementierte Funktionen werden durch Packaging nicht nachträglich als fertig erklärt. MacLock ist keine Betriebssystemsperre und erlaubt nur neutrale oder ausdrücklich freigegebene **gestoppte** öffentliche Medienvorschau.

**Konkreter Windows-Quellcheck behoben:** Ein `core.autocrlf=true`-Checkout veränderte 13 bereits gehashte originale Sass-/Lizenz-/NOTICE-Dateien in Tahoe/MacBar/Deep Port. Eng begrenzte `-text`-Attribute erhalten jetzt die tatsächlichen Upstreambytes unverändert. Neue Regression prüft alle betroffenen Originaldateien gegen einen echten Windows-Zeilenendencheckout. Kein Originalasset wurde umgeschrieben.

## Erzeugte Artefakte und Namensvertrag

- Installer: `Air-OS-Ultimate-R2-<version>-Windows-x64.exe` (`<version>` enthält Runnummer und Checkout-SHA).
- `SHA256SUMS.txt`, `BUILD-INFO.json` mit vollem Commit, Basis, Toolchain, Buildzeit, CI-Link, Größe und echtem SHA-256 sowie Payload-/Runtimeinventar; `INSTALL-R2.txt`.
- Actions-Artefakt: `Air-OS-Ultimate-Windows-x64-R2-<github.sha>-<sha256>-<attempt>`.
- Evidenz: `Air-OS-R2-Windows-evidence-<github.sha>-<attempt>` mit tatsächlichen Windows-PNGs/Prozess-/Fehlerlogs, TAP und Audit. Der historische Dateipräfix `r1-*` einzelner Screenshots ist nur ein wiederverwendeter Testname; JSON zeichnet echte OS-/Runtimeidentität auf.

## Lokal ausgeführte Prüfungen

- **439/439 Node-Tests**, einschließlich aller bisherigen 434 sowie neuer R2-Payload-/Source-/Workflow-/Windows-Zeilenendenregressionen.
- Unveränderte moderne Dependencylockdatei: **0 bekannte Auditwarnungen** zum Prüfzeitpunkt. Dies hebt separate Legacy-/Signierungs-/Releaseblocker nicht auf. [Audit](build-evidence/r2/local-audit.json).
- **200** Laufzeitressourcen geprüft; echte lokale ASAR aus sauberem separaten Tahoe-5-Checkout erstellt und mit dem R1-Verifier gegen alle Quellbytes/Abhängigkeiten verglichen. Zunächst verweigerte der Runtimeguard korrekt eine versehentlich verlinkte Legacyinstallation; anschließend mit der expliziten modernen Toolchain bestanden. **Dies ist keine Windows-Paketprüfung und kein Installer.** [ASAR-Rohbeleg](build-evidence/r2/local-asar.json).
- Lokaler vollständiger **Linux-Electron-R2-GUI-Lauf bestanden**, alle drei Größen plus neue Tahoe-5-Musik-/MRU-/Snap-/Lock-Szenarien, WebGL1+2-null, Profiltrennung und Neustart. **Kein Windows-Nachweis.** [Rohmessungen](build-evidence/r2/local-linux-gui.json), [Linux Medienflächen](build-evidence/r2/linux-r2-shared-media.png), [Linux Appwechsel](build-evidence/r2/linux-r2-switcher.png). Zwei Vorläufe erkannten Fehler im neuen Test: CDP-Modifikatormaske und zu früher Login-Klick während Eintritt. Korrigiert, keine Produktänderung und kein Erfolg für diese Versuche behauptet.

## Später auf dem eigenen Windows-PC testen

1. Nur ein tatsächlich existierendes R2-Artefakt des gewünschten Commit aus dem erfolgreichen Actions-Lauf laden; `BUILD-INFO.json` inklusive `runnerInstallation`/`runnerGui` prüfen. Erwartete Ergebnisse `success`, sonst Fehlernachweis lesen.
2. ZIP entpacken. `Get-FileHash .\Air-OS-Ultimate-R2-…-Windows-x64.exe -Algorithm SHA256` ausführen und den vollständigen Hash mit `SHA256SUMS.txt` vergleichen.
3. **Ungesigniert; Smart App Control kann blockieren. Defender/SAC nicht deaktivieren, keine Ausnahmen/Registryumgehungen setzen.** Ein Vertrauens-/Publisherblock ist mit diesem Testkanal nicht behoben. Geschützte Code-Signing-Identität und echte SAC-Abnahme bleiben separate Voraussetzungen; kein Selbstzertifikat und keine produktive Freigabe.
4. Wenn Windows die Ausführung zulässt, manuell installieren, eigenes synthetisches lokales Testprofil anlegen, keine Cloudverknüpfung. Login→Desktop→Tahoe-Apps→Musik→Widgets/CC→Fensterwechsel/Snap→Sperren→Login→Logout prüfen. Kein automatischer Zugriff auf persönliche Dateien. Vor vorhandenem produktivem Profil/Installationsupgrade Datensicherung vornehmen; CI prüft nur frische isolierte Installation.
5. Native Ordner-/Musikpicker, echte Zustimmung zum öffentlichen Lockvorschaudialog, Lautsprecherausgabe, Skalierung und physische GPU separat dokumentieren. Der CI-Test wählt ausschließlich seine eigene WAV-Datei per CDP, akzeptiert keinen nativen Zustimmungsdialog und behauptet keine Hardware-/SAC-Abnahme.

Keine Cloud-Anmeldung, kein iPad-Deployment, keine Nutzung privater Laptopdateien. Keine Design-/Fenster-/Auth-/Profiländerungen für R2.
