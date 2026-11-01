# Air-OS Linux — isolierter Nexus-Paketprototyp

Empfohlene erste Testbasis: Ubuntu **24.04 LTS**, identisch zum tatsächlich verfügbaren CI-Host. Das ist eine unterstützte Basis, keine Behauptung über die neueste Ubuntu-Version. Windows bleibt unabhängig davon.

## Bereits ausführbarer Pfad

`main.cjs` und `src/main/system-capabilities.cjs` besitzen Plattformtrennung: Netzwerkstatus, reale Displaygeometrie und Energiequelle; native Dateidialoge über Electron. Systemlautstärke, Bluetooth-Toggle, Helligkeit und Batterieprozent bleiben ohne verifizierten Adapter nicht unterstützt. Der vorhandene optionale Hyprland-Adapter benötigt erkanntes Linux/Hyprland und native Zustimmung; keine Steuerung fremder Fenster. Kein Polling unbekannter Programme.

`scripts/linux-nexus-build.cjs` erzeugt eine getrennte DEB-Konfiguration für die bereits eingefrorene Electron-44.9.3-Toolchain. `build/linux/air-os.desktop` beschreibt die Startmenüintegration ohne Autostart. Die normale Paketierung soll Icon und Desktop-Datei über electron-builder installieren; sie ändert weder GNOME-Theme noch Dock-/Cursor-/Hintergrundkonfiguration. **Keine Installationsskripte, keine sudo-Aufrufe im Produkt, kein automatischer Autostart.** Ein optionaler Autostart benötigt später eine ausdrückliche Nutzeraktion und überprüfbare Rücknahme.

Manueller reproduzierbarer Build: gefrorene Toolchain installieren, Pflichtaudit und Tests ausführen, `node scripts/linux-nexus-build.cjs`, danach `node build/windows-x64/node_modules/electron-builder/cli.js --linux deb --x64 --config dist/linux-nexus-config.json --publish never`. Das DEB ist ein Anwendungsprototyp, kein nativer Compositor oder bootfähiges Betriebssystem. AppImage und eine echte ISO sind separate, noch nicht abgenommene Paketziele.

## Quellen und nächste begrenzte Abnahmen

Die Ubuntu-macOS-Anleitung von mmBesar wurde nur statisch gelesen. Sie verlangt GNOME-Erweiterungen, WhiteSur-/Themeinstallationen und Hoständerungen. Keine Befehle ausgeführt, keine dort verlinkten Assets übernommen. Air-OS verwendet weiter MacTahoe und die vorhandenen MIT/GPL/OFL-Nachweise.

Vor einer Linux-Edition: DEB in einer isolierten Ubuntu-VM installieren, starten und deinstallieren; Sandbox, Picker/Audio, Suspend/Resume und Wayland/X11 prüfen. Hyprland braucht einen echten, ausdrücklich freigegebenen Testhost. Vor einer ISO: Paket-/Quellinventar, vollständige Lizenzprüfung, reproduzierbarer Imagebau, VM-Boot, Update-/Rollbackmodell und separater Installationsreview. Keine Festplatten-/Bootloaderänderung im Nexus-Auftrag.

Der Nexus-Bericht nennt nach dem CI-Lauf den tatsächlichen DEB-/GUI-Status. Vorbereitung ist keine behauptete native Linux- oder ISO-Abnahme.
