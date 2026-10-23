Dieser gemeinsame Integrations-PR übernimmt die zehn aufeinander aufbauenden Commits von `eecab2a` bis `96dd990` in den bestehenden PR-#11-Entwicklungsbranch. Enthalten sind Roadmap, Dock-Korrektur, Island-Grundelement, persistente Dock-Theme-Kachel, inhaltsfreie Notes-Speichermitteilung, Lifecycle-Fokusfix, profilbezogener Pinning-Speicher, Finder-Tempdateischutz, reine ChatGPT-Installationskandidatenprüfung und Renderer-Absturz-Recovery.

Base: `feat/air-os-architecture-foundation` (`eecab2a043fc62ab0802312aa09ce29dfd96c280`). Head: `fix/airapp-renderer-crash-recovery-20261023` (`96dd9908865c9eca8e0f035e0375f57784df6de2`). Kein PR gegen main, kein automatischer Merge.

Validierung am exakten Head auf Linux x64:

- 125 Tests bestanden, keine Fehler oder Skips. Native Launcher-/Electron-Ereignisse teilweise Test-Doubles; keine neue Windows-/macOS-/GUI-Abnahme.
- Alle versionierten JS/CJS-Dateien syntaxgeprüft; Catalina-Konfiguration, Diff-Whitespace, Konfliktmarker, sensible Dateinamen und Private-Key-Marker geprüft.
- 91 Commits vom Root bis Head, linear ohne Merge-Commits und ohne doppelte stabile Patch-IDs. Zehn zusätzliche Patches gegenüber Base, alle neu; Base ist Vorfahr.
- Lokale `git merge-tree --write-tree`-Simulation konfliktfrei und identisch zum Head-Baum. Keine Dateilöschungen im Diff. Kein Nachweis gegen sämtliche Dateisystem-Races oder Power-Loss.
- Frischer isolierter npm-Audit der deklarierten Abhängigkeiten: Exit 1, zwei High (Electron und extract-zip), keine Critical/Moderate/Low. Kein Upgrade oder Abschalten von Checks. Das Repository hat kein Lockfile; dies ist keine Verifikation eines bereits gebauten Installers.

Grenzen und sichere Reihenfolge:

1. Diesen gemeinsamen PR zuerst in den Entwicklungsbranch reviewen. Bevorzugt normaler Merge mit erhaltener Historie; kein Squash/Rebase-Merge, solange die abhängigen Branches unverändert darauf aufbauen. Keine Einzel-PRs für die bereits enthaltenen Vorfahren zusätzlich mergen/cherry-picken.
2. Danach separat die bereits vorhandenen linearen Folgecommits `0be04ba` (Notes-Save), `827d1ef` (Preferences-Tempdateischutz), `eb3f3bc` (Plattformtest-Gates) prüfen und integrieren. Sie sind ausdrücklich NICHT Teil dieses PR. Insbesondere der spätere Preferences-Sicherheitsfix fehlt in diesem Head und bleibt vor Freigabe erforderlich.
3. Danach native CI-/Installer-Tests und Audit-/Signing-/Notarisierungs-/Store-Trust-/Update-Blocker behandeln. PR #11 nicht ungeprüft nach main mergen; main bleibt unverändert.

ChatGPT ist weiterhin kein Launcher: nur Kandidatenerkennung, keine verifizierte App-Identität, kein Browser-Fallback. Pinning ist nur ein Speichervertrag, keine fertige Pin/Unpin-UI. Cloud-Sync ist nicht verfügbar.

Vollständiger Prüfbericht und alle 91 Commit-/Parent-SHAs: https://github.com/quattrologic/Air-Os-Clean/blob/docs/air-integration-review-20261023/docs/AIR_OS_INTEGRATION_REVIEW.md
