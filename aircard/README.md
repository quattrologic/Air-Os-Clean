# AirCard Lite – optionaler macOS-Backend

Air-OS lädt hier ein vorhandenes, ausführbares `AirCardBackendCLI` (nur macOS). Der erwartete Vertrag ist:

- `list-devices` → JSON-Array mit `id`, `name`, `product`, `osVersion`
- `scan-cards --device <id>` → JSON-Array mit `id`, `name`
- `apply-skin --device <id> --card <id> --artwork <lokaler-pfad>` → Exit-Code 0 bei Erfolg

Das Produktions-Backend ist nicht in den bereitgestellten AirCard-Lite-Archiven enthalten. Dieses Verzeichnis enthält absichtlich keine simulierte Implementierung, keine privaten Schlüssel und keinen neuen iPhone-Transport. Das Backend kann hier lokal bereitgestellt und anschließend mit Air-OS paketiert werden.
