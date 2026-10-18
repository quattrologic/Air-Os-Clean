# AirWrite Cloud-Sync – nur Schriftprofile

**Festlegung:** Ausschließlich ausdrücklich ausgewählte persönliche Schriftprofile dürfen später mit Supabase synchronisiert werden.

**Nicht synchronisieren:** eingegebene oder von ChatGPT kopierte Texte, erzeugte Dokumente, PNG-Exporte, Zeichenblock-Inhalte, Verlauf, lokale Benutzerkonten und Passwörter.

`cloud-sync/airwrite-profile.cjs` stellt eine strikte Upload-Datengrenze bereit: ausschließlich `version`, `id`, `name`, `glyphs`. Glyphen bestehen aus normalisierten Strichpunkten. Unbekannte Felder werden abgewiesen; Zustimmung und ausgewählte Profil-ID sind Pflicht. Der Baustein sendet **keine** Netzwerkdaten.

**Noch zu implementieren:** Das bisherige `airwrite.js` ist ein einfacher Zeichenblock und noch **kein** Handschrift-Schriftprofil-Editor oder Text-zu-Handschrift-Renderer. Als Nächstes benötigt AirWrite Buchstaben-Erfassung, lokale Profilverwaltung, Glyphenlayout für eingegebenen Text und PNG-Export. Erst danach sichere Supabase-Authentifizierung, RLS und einen expliziten Upload/Download nur der ausgewählten Profile. Profile sind biometrieähnliche persönliche Daten; Datenschutz und ggf. Verschlüsselung vor Aktivierung prüfen.

Test: `node --test tests/airwrite-profile.test.cjs`.
