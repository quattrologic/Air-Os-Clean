# Zu Air-OS beitragen

Vielen Dank für dein Interesse! Beiträge zu Fehlerbehebungen, Dokumentation, Tests und barrierefreier Bedienung sind willkommen.

## Vor dem Start

1. Prüfe [offene Issues](https://github.com/quattrologic/Air-Os-Clean/issues) und die [Roadmap](ROADMAP.md).
2. Für größere Änderungen zuerst einen Issue zur Abstimmung eröffnen.
3. Repository forken, einen eigenen Branch anlegen und kleine, nachvollziehbare Commits erstellen.
4. Pull Request gegen `main` eröffnen und Änderungen, Tests und ggf. Screenshots beschreiben.

## Lokale Entwicklung

Node.js 22+ und npm werden benötigt:

```bash
npm install
npm start
node --test tests/*.test.cjs
```

Vor dem Pull Request zusätzlich JavaScript-Syntax prüfen:

```bash
node --check main.cjs
node --check preload.cjs
node --check app.js
node --check airwrite.js
node --check air-os-enhancements.js
node --check login.js
```

## Richtlinien

- Bestehende Sicherheitsgrenzen von Electron (Sandbox, `contextIsolation`, keine Node-Integration im Renderer) nicht abschwächen.
- Dateisystemzugriffe nur über geprüfte Main-/Preload-APIs; keine beliebigen Pfade freigeben.
- Neue Funktionen mit Tests oder klaren manuellen Testschritten versehen.
- Keine Zugangsdaten, Kontodatenbanken, Zertifikate, persönlichen Dateien oder großen Build-Ausgaben committen.
- Keine ungeprüften fremden Logos, Bilder, Schriftarten oder Code übernehmen. Lizenzbedingungen beachten.
- Cloud-Funktionen nur nach ausdrücklicher Zustimmung und mit dokumentiertem Datenschutzmodell.
- Sicherheitslücken **nicht öffentlich** melden; siehe [SECURITY.md](SECURITY.md).

## Pull-Request-Checkliste

- [ ] Änderung und Motivation beschrieben
- [ ] Tests ausgeführt oder Einschränkungen erläutert
- [ ] Keine Geheimnisse oder persönlichen Daten enthalten
- [ ] Oberfläche auf relevante Plattformen geprüft (oder Testlücke angegeben)
- [ ] Dokumentation bei sichtbaren Änderungen aktualisiert

Bitte respektvoll, sachlich und konstruktiv miteinander umgehen.
