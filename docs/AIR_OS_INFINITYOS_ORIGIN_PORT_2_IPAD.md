# InfinityOS Integration 2 — iPad PWA 2

Basis: `1deb36a2e77107897cd277d07bdd09140697da9d`.
Branch: `feat/air-os-infinityos-origin-port-2-ipad`.

## Ausführbarer selektiver Port

Kein Desktopbranch-Merge. Gezielt übernommen: reine Stage-/Panel-Modelle, vorhandener Window-System-Adapter mit Browserguard, Gruppenübersicht, Layoutauswahl, Gruppieren/Sortieren, gruppiertes Minimieren/Wiederherstellen über dieselben M2-Verträge, räumliche Tastaturnavigation und endliche Stage-Einblendungen. Die bisherige Appübersicht delegiert an diese gemeinsame Übersicht. Touch-/Pencil-/Trackpad-Inputs nutzen Pointer Events; Pointercancel und Orientierungswechsel räumen die Geste auf. Safe-Area-/VisualViewport-Grenzen kommen weiterhin vom PWA-Adapter.

Stage-Gruppen liegen im bestehenden versionierten IndexedDB-Preference-Datensatz des lokalen Bereichs. Keine neue Datenbank und keine Electron-IPC. Validierung prüft bekannte Registry-IDs, Gruppengrenzen und Duplikate, einschließlich Backups. Veraltete explizite Sitzungstokens werden abgewiesen. Fensterpositionen und Modus verwenden die vorhandenen `windowLayout`-/`desktopLayout`-Felder. Logout wartet auch auf diese Schreibwarteschlangen. Die iPad-eigenen Reminders-Listen, CAS-Schreibschutz, Kalenderbearbeitung und sicheren virtuellen Finderaktionen bleiben erhalten.

GLASS-3 übernimmt die separate Mipmap-Skalierung und endliches Pointerlicht. Standard bleibt sparsames CSS-Compositor-Glas; „Hoch“ erfordert weiter geeignete Hardware/WebGL2. Kein permanenter Shaderloop, keine native Fenstertextur, kein Stage-Manager-Zugriff auf fremde iPad-Apps. Reduced Transparency und Forced Colors haben Vorrang. Bestehende Music-/Notification-/Widget-Datencontroller werden weiterverwendet.

## Herkunft / Lizenz

Neue Stage-Funktionen eigenständig implementiert; keine ungeklärten Origin-/GNOME-Dateien oder GPL-Blur-My-Shell-Quellen übernommen. Existierende MacShell-MIT-, MacTahoe-MIT/GPL-, Hyprland-BSD- und Font-Nachweise bleiben unangetastet. Keine ISO- oder Linux-Systemoperation im Browser.

## Prüfstand dieses Checkpoints

584/584 lokale Node-Regressionen; bestehender vollständiger Chromium-GUI-Lauf: 99/99 Prüfungen, sieben Viewports, keine Browserfehler. PWA-Paketprüfung: 368 Dateien, 367 cachebare Runtimeassets. Die zusätzlichen Stage-/WebKit- und Subpath-Läufe werden nach tatsächlichem CI-Ergebnis ergänzt. Physisches iPad/Safari/Pencil/Audio ist offen.

Eigener Workflow `build-air-os-ipad-origin2.yml`: Audit, Regressionen, sauberer versionierter PWA-ZIP-Build, identischer Chromium-Vorherlauf auf der verifizierten Basis, Chromium/WebKit-Nachherläufe einschließlich Pages-Unterpfad und Stage-Szenarien. Nur Actions-Artefakte und synthetische Evidenz im Featurebranch; **keine Veröffentlichung**. Die vorhandenen manuellen Pages-/privaten Bereitstellungsverträge bleiben unverändert.

## Installation / Grenzen

ZIP auf einem ausdrücklich gewählten vertrauenswürdigen HTTPS-Host entpacken; Safari → Teilen → Zum Home-Bildschirm → als Web-App öffnen. Dieser Auftrag deployed keine Website. Nach erstmaligem vollständigem Laden bleiben lokale Apps offline verfügbar. Browserdaten regelmäßig über das vorhandene Backup exportieren. Lokale Bereiche sind keine sichere Passwortauthentifizierung; kein Apple-Kalender-/Stage-Manager-/Dateien-App-Vollzugriff und keine native App-Store-App.
