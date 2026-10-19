# Air-OS – Dependency Audit und Release-Risiken

Stand: 19. Oktober 2026. Quelle: GitHub Actions Security Check auf PR #11, zuletzt Run 39290158577. Meldung: **10 Einträge, 2 High, 8 Moderate**. Das sind gemeldete betroffene Abhängigkeiten im npm-Abhängigkeitsbaum, keine gezählten Exploits.

## Konkrete Ergebnisse

| Abhängigkeit | Schwere | Ursache | Entscheidung |
| --- | --- | --- | --- |
| `electron@32.3.3` | High | Zahlreiche Electron-Advisories; die alte Chromium-/Electron-Laufzeit ist außerhalb des üblichen Security-Supports. Beispiele: ASAR-Integrität, origin-/permission-Fehler, native UAF, Protokollbehandlung. | **Legacy-Release-Blocker**, nicht blind auf Electron 44 aktualisieren. |
| `extract-zip` | High | Symlink-/Pfad-Traversal beim Entpacken, u.a. GHSA-jmr9-qjv8-65gv und GHSA-7pqw-9j4j-h8q3. | Transitiv über Electron-Download. Build-System-Integrität und untrusted Archive streng trennen. |
| `sprintf-js` | Moderate | Unbegrenzte Precision-Spezifikatoren (Denial of Service). | Transitiv über `roarr`/`global-agent`; aktualisierte Toolchain evaluieren. |
| `roarr`, `global-agent`, `@electron/get` | Moderate, kaskadierend | Indirekte Abhängigkeiten im Electron-Downloadpfad. | Bei Modern-Channel auf aktuelle Electron-Kette wechseln, danach erneut auditieren. |
| `app-builder-lib`, `dmg-builder`, `electron-builder-squirrel-windows`, `electron-builder@26.15.3` | Moderate, kaskadierend | Build-Toolchain verwendet betroffene Abhängigkeiten. | Upstream-Patches prüfen. Runtime- und Builder-Updates getrennt testen. |

Wichtige Advisories: [Electron ASAR](https://github.com/advisories/GHSA-vmqv-hx8q-j7mg), [extract-zip traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv), [sprintf-js DoS](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).

## Warum kein `npm audit fix --force`?

Der Audit empfiehlt `electron@44.9.0`. Electron 33 entfernte Catalina-Unterstützung; Electron 44 benötigt **macOS 13 oder höher**. Ein globales Upgrade würde den vom Benutzer benötigten macOS-10.15.8-Build zerstören. Ein Override für die Archiv- oder Download-Pakete ohne Kompatibilitätsnachweis könnte ferner den Installer brechen.

## Kontrollierte Kanäle

- **Legacy / Catalina:** `package.json` bleibt für den regulären Build auf `electron@32.3.3`, Mindestversion 10.15. Diese Version wird nur als *unsignierter, risikobehafteter Test-Build* bezeichnet. Der rote Security-Status wird nicht unterdrückt. Untrusted Inhalte dürfen nicht privilegiert sein.
- **Modern / Ventura+:** Neuer manueller Workflow `.github/workflows/build-modern.yml` überschreibt Electron **nur innerhalb des CI-Workspace** mit `44.9.0`, prüft die tatsächlich installierte Version und erzeugt separate Artefakte. macOS-Mindestversion **13.0**; Windows ebenfalls über den Modern-Workflow. Das allein behebt nicht automatisch sämtliche Build-Toolchain-Warnungen. Nicht mit Catalina verteilen.
- **Release-Gate:** Weitere Audit-Prüfung pro Kanal, echte Laufzeit-/Installer-Tests, Code Signing/Notarisierung und Prüfung aller Third-Party-Lizenzen. Solange High-Severity-Befunde im Legacy-Kanal stehen, keine reguläre Veröffentlichung.

## Relevanz und Eingrenzung

Air-OS setzt `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true` und `webSecurity:true`. Das reduziert bestimmte Angriffsmöglichkeiten, **ersetzt aber keine Chromium-/Electron-Sicherheitsupdates**. Der Nutzer öffnet lokale Daten und einige Onlinedienste; Parser- und Chromium-Schwachstellen bleiben deshalb relevant. `extract-zip` wird im Build- und Installationskontext verwendet, nicht durch eine normale Anwendungsschaltfläche aufgerufen; das begrenzt einen typischen Remote-Angriffsweg, beseitigt aber das Supply-Chain-Risiko nicht.

Ein erfolgreiches GitHub-Actions-Paket ist kein Security-Freigabezertifikat. Security-Check auf PR #11 zeigt die Audit-Risiken ausdrücklich weiter an.

## Folgende Prüfungen

1. Modern-Workflow manuell auf macOS und Windows starten und die Installer prüfen.
2. Audit der **tatsächlich installierten** Modern-Abhängigkeiten separat durchführen.
3. Prüfen, ob aktuelle gepatchte `electron-builder`-/`@electron/get`-Versionen die betroffenen Abhängigkeiten beseitigen, ohne Builder-Breakage.
4. Vor einem regulären Release Catalina-Legacy und modernen Kanal getrennt freigeben; Legacy bleibt unter Security-Vorbehalt.
