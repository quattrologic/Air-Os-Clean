# Reboot in Air OS (lokale Steuerung)

Diese Integration fügt die App **Reboot** zum Air-OS-Dock hinzu. Sie ist eine selbst entwickelte Steuerungsoberfläche für **separat installierte** Komponenten und **keine 1:1-Kopie** des Reboot-Launcher-Programms oder des eigentlichen Fortnite-Spiels.

## Unterstützte Projekte

- [Reboot Launcher](https://github.com/Auties00/Reboot-Launcher): externes Windows-Programm. Die App öffnet eine zuvor lokal ausgewählte `.exe`, zeigt aber nicht deren Oberfläche im Air-OS-Fenster.
- [LawinServer](https://github.com/Lawin0129/LawinServer): Node.js-Backend. Auswahl des lokalen Repository-Ordners; Start/Stop eines lokalen `node index.js`-Prozesses.
- [FortMatchmaker](https://github.com/Lawin0129/FortMatchmaker): Node.js-WebSocket-Matchmaker. Auswahl des lokalen Repository-Ordners; Start/Stop eines lokalen `node index.js`-Prozesses.
- [Project Reboot 3.0](https://github.com/Milxnor/Project-Reboot-3.0): nativer Gameserver. Muss separat erstellt, eingerichtet und mit einem kompatiblen Launcher gestartet werden. Wird von Air OS derzeit **nicht** gebaut oder gestartet.

## Einrichten

1. Air OS aktualisieren, `npm install` ausführen und mit `npm start` starten.
2. Die oben genannten Projekte aus den Originalquellen separat beziehen. Reboot Launcher gemäß dessen Release-/Build-Anleitung installieren; für den Gameserver die dort genannten Voraussetzungen beachten.
3. Für LawinServer und FortMatchmaker jeweils im **eigenen** Projektverzeichnis `npm install` ausführen. Node.js muss als ausführbarer Befehl `node` (unter Windows `node.exe`) im PATH verfügbar sein.
4. In Air OS anmelden, im Dock **Reboot** öffnen und beim Launcher die lokale `.exe`, bei den beiden Node-Projekten den jeweiligen Repository-Ordner auswählen.
5. Den Backend-/Matchmaker-Dienst mit den Start- und Stopp-Schaltflächen verwalten. Den externen Launcher mit **Launcher öffnen** starten.
6. Fortnite-Clients und der Gameserver benötigen ihre eigene kompatible Konfiguration. Ein laufender Dienst bedeutet **nicht**, dass Login, Matchmaking oder ein Spiel funktionieren.

## Sicherheit und Grenzen

- Air OS lädt die Drittanbieter-Projekte nicht automatisch herunter, verteilt deren Code nicht mit dem Installer und verändert keine Fortnite-Dateien.
- Sämtliche Prozessstarts erfordern eine angemeldete Air-OS-Sitzung und eine ausdrücklich ausgewählte lokale Komponente. Es gibt keine generische Shell-/Befehlseingabe oder frei definierbare IPC-Befehle.
- Die Prozessausgabe wird bewusst nicht in der UI angezeigt oder protokolliert. Die App meldet lediglich, ob der von Air OS gestartete Node-Prozess noch läuft; sie prüft keine Anwendungs-Health-Endpoints.
- Dienste, die Air OS gestartet hat, werden bei Abmeldung und beim Beenden von Air OS gestoppt. Bereits extern gestartete Prozesse werden nicht übernommen oder gestoppt.
- Der Reboot Launcher ist in dieser Integration auf **Windows** beschränkt. Die Backend-Dienste können mit geeigneter Node.js-Umgebung auch auf anderen Desktop-Plattformen laufen.
- FortMatchmaker versucht laut Originalprojekt standardmäßig Port **80** zu nutzen. Dieser Port kann bereits belegt sein oder erhöhte Betriebssystemrechte erfordern; Air OS fordert keine zusätzlichen Rechte an.
- Die Prozesse brauchen gültige lokale Installationen inklusive der Drittanbieter-Abhängigkeiten. Die Integration installiert, konfiguriert oder testet deren Netzwerk- und Game-Server-Verbindungen nicht.
- Die aus den Original-Repositories übernommenen Programme haben eigene Lizenzbedingungen: FortMatchmaker und LawinServer sind GPL-3.0; Project Reboot 3.0 BSD-3-Clause. In Air OS wurde kein Code aus diesen Projekten einkopiert. Wenn sie separat weiterverbreitet werden, sind ihre jeweiligen Lizenzpflichten zu beachten.
- Die Verwendung mit Fortnite unterliegt den einschlägigen Nutzungsbedingungen und Rechten. Diese Integration enthält keine Netzwerkumleitung oder Maßnahmen zum Umgehen von Schutzmechanismen.

## Entwicklung und Tests

```sh
node --check reboot-integration.cjs
node --check reboot-app.js
node --test tests/reboot-integration.test.cjs
```

Der UI-Test im laufenden Air-OS-Desktop und ein vollständiger End-to-End-Test mit Reboot Launcher, LawinServer, FortMatchmaker und Project Reboot 3.0 bleiben separate Aufgaben. Diese Integration ersetzt sie nicht.
