# AirWrite Cloud-Sync – nur Schriftprofile

**Festlegung:** Ausschließlich ausdrücklich ausgewählte persönliche Schriftprofile dürfen später mit Supabase synchronisiert werden.

**Nicht synchronisieren:** eingegebene oder von ChatGPT kopierte Texte, erzeugte Dokumente, PNG-Exporte, Zeichenblock-Inhalte, Verlauf, lokale Benutzerkonten und Passwörter.

`cloud-sync/airwrite-profile.cjs` stellt eine strikte Upload-Datengrenze bereit: ausschließlich `version`, `id`, `name`, `glyphs`. Glyphen bestehen aus normalisierten Strichpunkten. Unbekannte Felder werden abgewiesen; Zustimmung und ausgewählte Profil-ID sind Pflicht. Der Baustein sendet **keine** Netzwerkdaten.

**Aktueller Stand:** AirWrite bietet jetzt eine lokale Handschrift-Erfassung, die Darstellung eingegebener Texte mit erfassten Glyphen und einen PNG-Export. Diese Funktionen arbeiten ohne Cloud. Sichere Supabase-Authentifizierung, RLS sowie ein ausdrücklicher Upload/Download nur ausgewählter Profile sind weiterhin nicht implementiert. Profile sind biometrieähnliche persönliche Daten; Datenschutz und ggf. Verschlüsselung vor Aktivierung prüfen.

Test: `node --test tests/airwrite-profile.test.cjs`.
