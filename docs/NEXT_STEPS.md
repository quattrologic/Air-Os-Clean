# iPad Ultimate 2.0 — konkrete Restarbeiten

[Gesicherter Produktstand, Ergebnisse und Pakete](AIR_OS_IPAD_ULTIMATE_2.md). `feature/private-ipad-pwa` bleibt unverändert; kein automatischer Rollout.

1. Exakte finale Chromium-/WebKit-Evidenz und PWA-/Preflight-/Recoverypakete prüfen. Eigentümerfreigabe und bestätigtes Vorabbackup bleiben Voraussetzung für jeden späteren Wechsel. [Privater Plan](AIR_OS_IPAD_2_PRIVATE_ROLLOUT.md). Keine Datenbank-/Cache-Reset-Anleitung.
2. Physisches iPad/Safari: Home-Screen, Safe Areas, echte Bildschirmtastatur, Touch/Pencil/Trackpad, native Dateiauswahl/Downloads, Audio, Suspend/Resume und konkreten privaten Windows-/Tailscale-Ausfall testen. Automatisiertes Linux-WebKit ist kein Hardwareersatz.
3. Original-ISO außerhalb des Produktbaums verfügbar machen, statisch hashen/inventarisieren, SquashFS/Distribution/Pakete/Lizenzen prüfen. Erst dann Zuordnung zu einem der beiden getrennten öffentlichen InfinityOS-Projekte. [Inventar und read-only Werkzeug](INFINITYOS_SOURCE_INVENTORY.md). Kein unbekanntes ISO-Skript ausführen.
4. Segmentierte Bibliotheksbackups/Restore über 64 MiB mit Integritäts-/Quota-/Abbruchtests entwickeln. Der jetzige Größencheck ist keine große Bibliothekswiederherstellung. Vorab Originalaudiodateien separat sichern.
5. Geeignete originale Glas-/Blur-/Linsenpfade erst in vorhandene Architektur portieren, wenn WebKit-Zuverlässigkeit, Energiebedarf, Kontextverlust und sichere Ressourcenownership nachgewiesen sind. Aktuell CSS-Compositor; keine behauptete Snell-/Fremdfensterrefraktion.
6. Weitere Iterationen: reichere Widget-/Control-Center-Komposition, visuelle Fensterübersicht, Drag-to-Snap-Hinweise, AirWrite-Formatierung, Metadaten-/Arcade-Regeln und Safari-Dateiaustausch. Neun Onlineapps bleiben ehrlich beschriebene Webalternativen ohne ungeprüfte Provider oder API-Secrets.
7. AGPL-/GPL-/MIT-Notices und lokales Corresponding-Source-Angebot bei jeder privaten Verteilung vollständig erhalten. Keine automatische öffentliche Pages-/Funnel-Bereitstellung.
