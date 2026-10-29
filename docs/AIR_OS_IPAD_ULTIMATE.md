# Air-OS Ultimate · iPad Edition

Basis: feat/air-os-r7-final-experience @ 02ccaf88724731cf685d2221f88e959020aff3f0.
Arbeitsbranch: feat/air-os-ipad-ultimate.

## Geprüfter Zwischenstand A/B

IndexedDB-v2 bewahrt den PWA-1-Datenstore. Lokale Arbeitsbereiche sind getrennte Schlüsselräume, **keine Sicherheitsauthentifizierung**. Desktopprofile und native Dateien werden nicht gelesen. Notes und Reminders verwenden gemeinsame Formate; Kalender-/Playlist-Controller verwenden eine asynchrone Browser-Facade. Finder verwaltet interne Blob-Dateien. Musik bleibt bei derselben AmplitudeJS-Engine und demselben gemeinsamen Transport. Cloud/native OS-Dienste bleiben deaktiviert.

Adapter und Touchregeln liegen in pwa/. App-Registry, openApps, Window-Lifecycle, MRU/Layouts, MacShell-/MacTahoe-Assets sowie M1/M2 bleiben gemeinsam. Standardqualität verwendet sparsames CSS-Glas; Hochqualität behält Hardwareklassifikation und WebGL-Fallback; reduzierte Transparenz bleibt explizit.

565/565 Node-Tests und erster Chromium-Touch-Smoke bestanden. Vollständige GUI-/Persistenz-/Offline-Abnahme und Build-ZIP folgen innerhalb dieses Auftrags. Kein echter iPadhost verfügbar; WebKit-Download lokal bislang durch Domainfilter blockiert. Keine Hardware- oder Safari-Abnahme behauptet.
