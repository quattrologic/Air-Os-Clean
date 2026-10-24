# MacLock / Open Runde attribution

MacLock layout and clock logic ported from https://github.com/0-ss/MacShell,
revision **1bdb51870b621100fd2709f66c8f8e00ab17b9c4**.
Copyright (c) 2026 Rickky. MIT License: [LICENSE](LICENSE).
Air-OS adaptations: DOM/CSS/Intl layout, native password input, existing Air-OS authentication.
No PAM, Wayland lock, Quickshell, Hyprland, media scraper or Qt binaries are included.
Original file hashes and selection: [SOURCE_MANIFEST.json](SOURCE_MANIFEST.json).

Unmodified Open Runde Regular/Semibold OTF files are copied byte for byte from
MacLock/fonts and independently matched to https://github.com/lauridskern/open-runde,
revision **3e7ed7f3cdfa5523766db7e430066472615fc935** (src/desktop).
Copyright 2023 Laurids Kern; derived from Inter, Copyright (c) 2016 The Inter Project Authors.
These fonts retain **SIL Open Font License 1.1**, not MIT. Full license:
[OpenRunde-LICENSE.txt](OpenRunde-LICENSE.txt). Fonts are bundled with the application,
not sold separately or renamed. Original font metadata/copyright remains intact.

No MacShell wallpaper, logo, album cover, artwork, lyrics or screenshot is bundled.
maclock-wallpaper.svg is existing original Air-OS vector artwork, copied from
AIR_MODERN_CLOUDS in app.js without changing the desktop or its preferences.

Detailed port/deviation and later-phase plan: docs/AIR_MACLOCK_L1A.md in the repository.

## L1B.1 Liquid Glass port

MacLock/liquidglass.frag and MacLock/glasstext.frag at the same pinned revision
are now copied unmodified in original/ as audit sources, under the MIT notice above.
Their fragment main/math bodies are ported to maclock-shaders.js without algorithm
changes (clock uniform refract renamed refractPx). GLSL ES300 input/output and
individual uniform declarations replace Qt440 uniform blocks/bindings.
maclock-glass.js ports Glass.qml / LockScreen.qml material parameters and manages
only public local wallpaper/clock textures; it reads no credentials or profile API.
Vertex, separable Gaussian and WebGL2/DOM lifecycle plumbing are Air-OS adaptations.
No Qt framework code, binaries or runtime are required. Qt MultiEffect's private blur pyramid
is approximated by an explicitly documented Gaussian support/sigma mapping.
Detailed values, screenshots and limitations: docs/AIR_MACLOCK_L1B1_GLASS.md.
