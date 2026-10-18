# Tiny Strike — Air-OS Offline Edition

Upstream: https://github.com/guyz/tinystrike
Revision: 04db555c4fc9f43fef3325c37930ad97a0c27aa3

Bundled runtime: Three.js 0.166.1 (MIT), under vendor/three/.
Original game: ISC (LICENSE). Rendering code: MIT (src/gfx/LICENSE).
Character models: Quaternius CC0; see ASSETS.md for provenance.
All notices are retained. No Valve or Counter-Strike game files are required.

Air-OS changes: remove multiplayer, leaderboard and server modules; remove
online and career UI; bundle Three.js locally; pause on pointer unlock;
run in a dedicated sandboxed Electron window with network requests blocked.
No multiplayer server, account, telemetry, remote ranking or CDN is used.
Game settings, map selection and appearance are stored locally per Air-OS profile.

Open from the Dock or Air Arcade. WASD: move; mouse: aim; left click: fire;
B: buy; R: reload; E: defuse; Esc: pause and release the mouse.
Close the game window to return to Air-OS. Logout closes the game.

Manual validation: launch an installed build without internet; select each map;
start a solo round; verify bots, movement, shooting, buying and round restart;
Esc and minimize must pause; reopen and check settings persistence; logout
must close the game. Windows/macOS packaged GPU tests are required before release.

Validation in this change: 21 Air-OS tests passed, including local serving,
network blocking, path validation, and profile session isolation. 40 upstream
bot navigation, tactics, settings, map-selection, scoreboard and player-death
tests also passed against the bundled source. JavaScript syntax and Catalina
configuration checks passed. A graphical smoke test could not run in the
execution environment; packaged Windows/macOS playtesting remains outstanding.
