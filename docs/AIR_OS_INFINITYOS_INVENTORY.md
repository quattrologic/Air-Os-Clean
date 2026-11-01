# InfinityOS — verfügbare Nachweise und fehlendes ISO-Inventar

Nexus 1: Die angekündigte `infinityOS-amd64.iso` (~2,39 GB) und `AirOS_ISO_Inspection.zip` sind in den bereitgestellten Workspace-/Anhangsverzeichnissen **nicht verfügbar**. Kein Google-Drive-Zugriff ist angeschlossen. Deshalb lassen sich Distribution/Version, ISO-Dateisystem, Paketliste, Desktopumgebung, Quellpakete und vollständige Lizenzen nicht belastbar bestimmen.

Das frühere 70-Dateien-Integrationspaket und `docs/AIR_OS_INFINITYOS_ORIGIN_PORT_1.md` ersetzen kein vollständiges ISO-Inventar. Ausgewählte eigene Stage-/Panel-Implementierungen aus den geprüften Air-OS-Origin-Branches wurden gezielt wiederverwendet; sie enthalten keinen ungeklärten Origin-/GNOME-/Blur-My-Shell-Code. Keine Aussage, die ISO sei vollständig untersucht oder bereits als Linux-Basis eingebaut.

## Wartender statischer Prüfpfad

Nach Bereitstellung: SHA-256 und Herkunft festhalten; ISO-Header/Dateibaum read-only inventarisieren; `/etc/os-release`, Paketdatenbank, Copyright-/Lizenztexte und Desktopdateien statisch auswerten. Enthaltene SquashFS-/Dateisysteme ausschließlich in ein getrenntes Analyseverzeichnis extrahieren. Keine unbekannten Start-/Installationsskripte ausführen und keine Rootdateien als Produktabhängigkeiten übernehmen. Erst danach geeignete Einzelkomponenten mit konkretem Quellpaket und Weitergaberechten zuordnen.

Keine ISO, kein privates Dateisystem und keine ungeklärten Referenzassets werden in Git aufgenommen. Dieser Teil bleibt ausdrücklich **wartend**, unabhängig vom funktionsfähigen Dock-/Island-Port.
