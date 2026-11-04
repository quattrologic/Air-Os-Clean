# iPad Desktop Parity — bewusste Restarbeiten

Der Entwicklungsstand ist geprüft und gesichert. Kein automatischer Wechsel der verwendeten Installation.

1. Eigentümer prüft die Artefakte des [grünen Builds](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41844493854), Funktionsmatrix und [privaten Rolloutplan](AIR_OS_IPAD_PRIVATE_ROLLOUT.md).
2. Reales iPad/Safari: Home-Screen-Installation, Safe Areas, Bildschirmtastatur, Touch/Pencil/Trackpad, native Auswahl/Downloads, Audio, Suspend/Resume und private Tailscale-Serverunterbrechung prüfen. Linux-WebKit ist kein Ersatz dafür.
3. Erst nach ausdrücklicher Freigabe: bisherigen Windows-Updatejob bewusst anhalten, lesendes Vorabbackup am selben Origin ermöglichen, Sicherung überprüfen, geprüfte neue Version umstellen. Kein Datenbank-/Cache-Reset. Nach v2-Upgrade ausschließlich kompatible Recovery nutzen.
4. Offen für spätere Entwicklung: segmentierte Backups über 64 MiB, breite Metadaten-/Spielregelabdeckung, rich-text AirWrite, weitergehende Safari-DnD-/Dateifreigaben, optional ausdrücklich konfigurierte Provider. Wetter/News/Mail/Ollama/Spotify sind keine heimlich aktivierten nativen Dienste.
5. Externe Webalternativen und fehlende native OS-/Cloudfunktionen stehen ehrlich in der [Matrix](AIR_OS_IPAD_COMPLETE_PARITY.md). Keine neue Windows-/Linux-/öffentliche Deploymentphase begonnen.
