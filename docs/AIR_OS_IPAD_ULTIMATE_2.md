# Air-OS iPad Ultimate 2.0 — Entwicklungsnachweis

Featurebranch `feat/air-os-ipad-ultimate-2`, Basis `a228d895939861bf5379917d6d69849aaadc2f84`. Bestehende private Installation und deren Branch/Task/HTTPS-Adresse bleiben unverändert. Kein Merge/Deployment.

Checkpoint A: Beide InfinityOS-Projekte auf exakte Commits getrennt geprüft; ISO-Zuordnung weiterhin offen. Direkte AGPL-CSV-/Dateihelper laufen im vorhandenen Finder und in der Speicheranzeige. Lizenztexte, Quellcodeangebot und read-only ISO-Inspector vorhanden. Keine zweite Dateidatenbank/Fensterregistry. Native Linux-Komponenten nicht in Safari ausgeführt.

[Quelleninventar](INFINITYOS_SOURCE_INVENTORY.md), [Port-/Lizenzmatrix](AIR_OS_INFINITYOS_DEEP_PORT.md). Weitere funktionale Integrationen, vollständige Browserabnahme, Screenshots und Paketnachweise werden nach geprüften Checkpoints ergänzt. Noch keine neue Installationsfreigabe.

## Checkpoint B — integrierte Systemfunktionen

Vier interne Arbeitsbereiche, persistierte Fenstergruppen, gruppiertes Minimize/Restore, gemeinsame Snap-/Geometriepfade und Fokuswechsel erweitern denselben Window Owner. Gruppen werden erst nach erfolgreichem Speichern als gespeichert übernommen; keine App wird durch einen Workspacewechsel geschlossen. Finder hat List/Raster, echte Breadcrumbs, Desktop-Kontextmenüs mit Long Press/Pointercancel/F2 und eine Dockablage aus Dateireferenzen. Navigations-/Speicher-Epochen verhindern spätes Überschreiben neuerer Auswahl/Entwürfe.

Das vorhandene Dock nutzt nun wirklich die MacShell-R7-Portalgorithmen für gekoppelte Magnifikation und den Spring-Integrator; InfinityOS-Linux-Originalüberlappung steuert opt-in Intellihide. Sichtbarer Dock-Rückweg, Idle-Frame-Stopp, keine zweite Pin-/Fensterverwaltung. NotificationView adaptiert den Original-Lifecycle in den bestehenden Toast-Host; Verlauf, Öffnen/Lesen/Entfernen und Fokusmodus benutzen denselben Notice-Store.

Ein gemeinsamer Exportpfad bindet den Quellcode-Download per explizitem Fetch an den Offlinecache und schützt Update/Reload während kurzer Downloadübergaben. Das ist keine native Downloadfortschritts-/Abschlussmessung. Quelle vor Login und in Einstellungen erreichbar; keine Original-Permission-Bypässe.

Lokal tatsächlich bestanden: **35 Node-Tests**, **100 Chromiumchecks/35 Aufnahmen**, **9 Upgrade-/Recoverychecks/8 Aufnahmen**. Der frühere lokale Chromium-154-SIGSEGV trat in einer anderen Download-/Neustartreihenfolge auf; offizielles Chromium 151 hat den damaligen Pfad in CI bestanden. Der neue Ablauf prüft den Source-Download zusätzlich ohne Server. WebKit-Speicheranzeige korrigiert: lokale Nutzdaten bleiben sichtbar, auch wenn Browserquota fehlt. Gesamt-WebKit-Endlauf für B steht noch aus.
