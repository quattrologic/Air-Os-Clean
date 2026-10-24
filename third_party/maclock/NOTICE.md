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

## L1B.2 motion behavior port

LockScreen.qml at the same revision supplies entry/exit opacity, wallpaper scale,
clock/login positions, avatar scale and engaged password width/blur targets,
per-property durations and OutQuint easing. maclock-motion.js ports this behavior
to a finite, generation-guarded DOM/RAF timeline. No Qt framework, PAM unlock
delay, media/morph logic or operating-system session lock is copied.
The original L1B.1 material shader bodies and font assets are unchanged.
maclock-shaders.js adds an Air-OS motion-scene pass, using cached mip levels
as an explicitly documented approximation of the Qt blur pyramid.
Authentication remains in the existing bridge; its confirmed notification has no
payload and never waits for animation completion.
Detailed source mapping, measured frames and limitations: docs/AIR_MACLOCK_L1B2_MOTION.md.

## L1B.3 text and interaction port

MorphText.qml, MorphGlyph.qml and ClockGlyph.qml are bundled byte-exact in original/
as MIT audit sources at the pinned Rickky revision. MorphText's two layers,
width/alignment/stretch equations and timings are ported to maclock-morph.js with
LockScreen.qml's actual clock overrides (560ms,1.03/.97,no stretch/animated width).
LockScreen.qml also supplies CapsLock vector paths/timings, submit arc800ms,
press140/420ms and six-step435ms shake. Native password entry replaces QML's
custom password dot model; no credential is cloned/rastered. MorphGlyph and
ClockGlyph belong to upstream media/timer widgets; analysed/audited, not injected
as invented login actions. Hardware raster caching and finite compositor lifecycle
are Air-OS adaptations. Detected software rendering avoids GPU readback with a
documented transient text/CSS approximation, returning to original GL materials.
Original L1B.1 fragment math, Open Runde font files and their separate OFL notices
remain unchanged. See docs/AIR_MACLOCK_L1B3_MORPH.md for exact values and limitations.
