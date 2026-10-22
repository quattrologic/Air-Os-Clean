# Air-OS Ultimate: dauerhafter Micro-Development-Modus

Diese Projektregeln gelten für zukünftige Entwicklungssitzungen, insbesondere bei „Air-OS weiterentwickeln“.

## Einstieg

1. `docs/DEVELOPMENT_PROGRESS.md` und `docs/NEXT_STEPS.md` lesen; jeweils der neueste Checkpoint ist maßgeblich.
2. Aktuellen GitHub-Commit, Entwicklungsbranch, PR-Status, CI und lokalen Arbeitsbaum prüfen. Ungespeicherte Änderungen erhalten. Bei nachweislich noch aktiver alter Entwicklung keine parallele Bearbeitung starten; normale CI-Builds sind keine Quellcodebearbeitung.
3. Genau eine kleine, noch offene Roadmap-Aufgabe auswählen. Vorhandene Implementierungen prüfen, nicht doppelt entwickeln. Keine vollständige Neuplanung ohne konkrete Architekturentscheidung.

## Eine Einheit

- Richtwert 5–10 Minuten Entwicklung, möglichst 10–15 Minuten bis zum Sitzungsabschluss; keine garantierte technische Laufzeitgrenze.
- Größere Aufgaben vor Implementierung zerlegen. Wenige zusammengehörige Dateien ändern, bestehende Funktionen erhalten.
- Ablauf: Analyse → Implementierung → Test → gezielte Fehlerkorrektur → Git-Checkpoint → Abschluss.
- Sicherheits- und Datenverlustprobleme priorisieren. Keine Sicherheitstests deaktivieren, keine ungeprüften Erfolge behaupten, keine Platzhalter als fertige Funktion ausgeben.
- Neue Open-Source-Abhängigkeiten nur nach Prüfung von Lizenz, Sicherheitsstatus, Wartung und Electron-Kompatibilität.
- Keine unkontrollierten Werkzeugwiederholungen. Bei Blockaden Umfang verkleinern, konsistenten Zwischenstand sichern, Rest dokumentieren und kontrolliert beenden.

## Sicherung und Übergabe

- Aussagekräftiger Commit auf geeignetem Entwicklungsbranch; main nur nach ausdrücklicher Freigabe ändern. Keine destruktiven Git-Befehle und keine fremde Arbeit überschreiben.
- Vor Aktualisierung eines Remote-Branches dessen HEAD prüfen; vorhandene expected_sha-Lease verwenden, wenn über den GitHub-Connector geschrieben wird. Kein Force-Push.
- Beide Fortschrittsdokumente mit Ausgangs-Commit, Branch, konkreter Änderung, tatsächlich ausgeführten Tests, CI-Status, Grenzen und nächsten drei kleinen Einheiten aktualisieren. Den neuen SHA im Abschlussbericht nennen; ein Commit kann seinen eigenen SHA nicht im Inhalt vorwegnehmen.
- Kurz berichten: Implementiert, Commit, Tests, offen, nächste Aufgabe. Danach Sitzung beenden, keine weitere Einheit im Hintergrund beginnen.

## Plattform und Umfang

Air-OS bleibt eine Desktop-Anwendung innerhalb von Windows/macOS auf Electron. Kein Kernel, Bootloader oder bootfähiges Betriebssystem. Spätere iPadOS-Unterstützung braucht eine separate Laufzeit mit möglichst gemeinsamen Komponenten. Bestehende andere PRs berücksichtigen, nicht ungeprüft integrieren. Audit-/Release-Blocker bleiben sichtbar.
