# InfinityOS — verifizierter Quellenstand für iPad Ultimate 2.0

Stand 2026-11-04. Die vom Nutzer genannte ISO hat angeblich 2.394.456.064 Bytes; Größe, SHA-256 und Inhalt sind **nicht gemessen**. Beide Drive-Links (`1_vrEGmQ3NX0IY5e-cXHE9niM5JANwx6G` und `1crzru-jlku4voU1zO4POcqa9hhfQhbOM`) scheitern in dieser Umgebung mit `Tunnel connection failed: 403 Forbidden`. Das belegt eine Zugriffsblockade der Entwicklungsumgebung, nicht einen Defekt oder eine bestimmte Freigabeeinstellung der Dateien. Keine passende lokale ISO/kein vollständiges ISO-Inventar vorhanden. Der frühere 70-Dateien-Origin-Extrakt ist kein vollständiger Herkunftsnachweis.

## Keine voreilige Zuordnung

| Quelle | Tatsächlich belegt | Nicht belegt |
|---|---|---|
| Infinity-Systems-UA/InfinityOS @ `a6584135cbcad837d57484211119451bbb2d8fb2` | Browserdesktop aus HTML/CSS/JS; README nennt eigenen Bootloader/verschlüsseltes Browser-FS und ISO, schließt Boot-ISO/Driver vom Repository aus; AGPL-3.0 | Dass dies die Nutzer-ISO ist |
| InfinityOS-linux/infinityos @ `fbcdaff53bdc6e9d76836e9fb70f6a19a403fdb3` | KIWI-Imagequellen, Fedora-45/GNOME-51-Definitionen, RPM/DNF/Flatpak, Python-Setup/Updater/Terminal, GNOME-Erweiterungen, eigener GPL-3.0-Code plus separat lizenzierte Komponenten | Dass diese Definitionen in genau der Nutzer-ISO stecken |
| Nutzer-ISO/zweiter Drive-Link | nur Nutzerangabe/URL, keine ausgelesenen Nutzbytes | Distribution, Kernel, DE/WM, Paketmanifest, ISO-Dateien und Lizenzen |

Gleicher Name ist kein gemeinsames Projekt und kein ISO-Herkunftsnachweis. Native/Fedora- und Webquellen bleiben getrennt.

## Statische Untersuchung reproduzieren

`python3 scripts/inspect-infinity-iso.py /freigegeben/infinityOS-amd64.iso /separates-analyseverzeichnis/inventory.json`

Das Werkzeug öffnet nur lesend, hasht den Input, prüft ISO9660-Header/Extents, inventarisiert begrenzt Verzeichnisse und liest ausschließlich kleine Metadatendateien wie `os-release`/Paketmanifeste. Keine Mounts, keine Payload-Ausführung, keine Rootrechte, keine Übernahme ins Produkt. Ausgabe innerhalb des Git-Repos wird verweigert. UDF und Rock-Ridge-Sondernamen werden nicht als vollständig unterstützt ausgegeben. Bei SquashFS nennt der Report nur den Extraktionsbedarf. Danach außerhalb des Produktbaums mit einem geprüften read-only `unsquashfs` Metadaten/Quellpaket-/Lizenzzuordnung prüfen; keine fremden Startskripte ausführen.

Das Tool ersetzt keine fehlende ISO. Synthetische Testimages belegen nur den Inspector, niemals die Herkunft der echten ISO.
