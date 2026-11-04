# Private Cloud Updates — separater Vorbereitungsstand

Featurebranch `feat/ipad-private-cloud-updates`, Produkt `62a7b31aa1cb4a70c846901e9a36955210b8130f`, Basis `e4b1c4203c2430da04bccc5dd33953fb44cc0781`. Fail-closed Pages-Worker, SHA-256-Cacheprüfung, Cloudclient und releasegebundener Artefaktworkflow implementiert. 47 Tests und Chromiumabläufe bestanden; neuer WebKitdownload blockiert HTTP403. Kein Konto/Cloudflare-Login/Deployment, kein Releasebranch angelegt, keine private Installation geändert. [Einrichtung, Schutz, genaue Resultate und Freigaben](AIR_OS_IPAD_PC_FREE_UPDATES.md).

---

# Air-OS iPad Ultimate 2.0 — Fortsetzung gesichert

Arbeitsbranch `feat/air-os-ipad-ultimate-2`, Basis `a228d895939861bf5379917d6d69849aaadc2f84`, Produkt `7fb71d3a4ffb2659d87bcc6c24fedfc3ba1e898a`. Vorherige Parity-Checkpoints/Beweise bleiben erhalten; keine fertigen Arbeiten neu begonnen oder Nutzerdaten zurückgesetzt.

Tatsächliche InfinityOS-AGPL-/GPL-Portpfade: CSV-/Dateihelper, geometrischer Docküberlappungstest und Touch-Abstände, adaptierter Notification-Lifecycle. MacShell-R7-Dock-/Springlogik ausgeführt. Eigene Integration: vier Workspaces, persistente Fenstergruppen, Finderansichten/-kontexte/-Breadcrumbs, Dock-Dateireferenzen, opt-in Intellihide, reversibles internes App-Vollbild, Fokus-/Mitteilungsaktionen und sichere Export-/Updatekoordination. Backup-Vorabprüfung statt stiller Teilbackups. Ein Window Owner/eine Audioengine/eine Datenbank.

37 Node-Regressionen, 466 Chromium-/WebKit-Browserchecks, Audit und Paketprüfung bestanden. Grüner [CI-Lauf 41888353373](https://github.com/quattrologic/Air-Os-Clean/actions/runs/41888353373); 156 gerenderte PNGs im Evidenzcommit `b566132be6380fbf0335c700d88e836b85141bf9`. Alle alle Screenshots, Quellcode-/Lizenzangebot, Paket und genaue offene Grenzen im [Abschlussbericht](AIR_OS_IPAD_ULTIMATE_2.md). ISO bleibt wegen Tunnel-HTTP403 unzugeordnet; beide öffentlichen Projekte separat geprüft. Keine behauptete native iPad-/GPU-/ISO-Abnahme.

Private Installation, Windows-Task, Tailscale und `feature/private-ipad-pwa@7de1635c0207b8604c5409ef62c466585b4d5f04` unverändert. Kein Merge/Deployment. [Späterer Freigabeplan](AIR_OS_IPAD_2_PRIVATE_ROLLOUT.md).
