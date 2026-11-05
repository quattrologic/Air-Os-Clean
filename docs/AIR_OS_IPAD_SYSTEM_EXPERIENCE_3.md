# Air-OS iPad System Experience 3

Development branch: `feat/air-os-ipad-system-experience-3`. Exact Ultra base: `12f8e401c21eb35debf2ed2180a283dc10de8476`. No deployment, merge, installed-PWA update, Tailscale change or data migration.

## Checkpoint A – launcher and lifecycle

Full-scene App Library with All Apps / Categories, eight groups derived from the existing 25 registry entries; persistent view preference; search, group expansion, keyboard navigation and touch dismissal. The original Dock stays visible; pins and lifecycle remain owned by the existing controllers.

The existing animation scheduler now owns cancellable opening/closing and focus effects. Opening uses the actual Dock/launcher button rectangle, closing targets the real Dock icon. Reopening cancels pending close cleanup. Geometry/mode changes cancel presentation effects. Reduced motion and document visibility release ownership.

EveningGlow (Ian Hex, LGPLv3) replaces the forest default with a licensed sunset/lake photograph. Original file and metadata from KDE plasma-workspace-wallpapers `0643e9404da07d204014549d9f734424fdf961ed`, `EveningGlow/contents/images/2560x1600.jpg`. Forest remains available as an unchanged asset. Existing shared GLASS-3 owner handles materials; the full-screen launcher uses bounded CSS wallpaper blur rather than a giant additional GL surface.

Source audit: InfinityOS `a6584135cbcad837d57484211119451bbb2d8fb2`, `script.js::openMenu` supplies registry partitioning; `styles.css::winOpen` supplies the source movement curve. The upstream menu only partitions system/user apps; tablet category cards are an Air-OS adaptation against the supplied reference. MacShell `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, `SPopUp.qml` supplies short OutCubic/OutQuint popup motion principles. MacTahoe GTK `1e45e19f510edb8cde18fa84d6cd5319f60b086b` supplies the existing neutral palette and sidebar construction. Detailed port paths remain in `ipad/vendor/infinityos/provenance.json`; MIT/AGPL/GPL/OFL/LGPL notices and offline corresponding source are retained.

The supplied category, MacShell desktop and lock references are visible in the conversation. The separate File Received reference A is absent; no direct comparison to it is claimed. No pixel identity is claimed between Qt/GNOME and WebKit.

First correction round: the first rendered category view exposed a header selector styling tab buttons as close buttons; this product selector and search contrast were corrected, then rerendered. At 1180×820 the scene uses four columns of 154px cards, 54px icons, readable labels and a permanently visible Dock. Touch geometry is deliberately larger than the embedded reference.

Validation so far: 42/42 Node regressions; Chromium baseline 7 checks/21 screenshots from exact Ultra base; new Chromium visual suite 23 checks/24 screenshots at six viewports. Full Chromium root GUI: 112 checks passed, including legacy music/data preservation, touch, geometry and offline restart. WebKit, subpath/update regressions and subsequent design rounds remain pending until recorded below.

## Remaining work at Checkpoint A

Recompose Control Center/Island/MacLock and a real file-import acknowledgement; rebuild Finder/music/Notes/calendar interior hierarchy; perform rounds two and three; test both browsers, offline/update/resource paths; package a versioned PWA ZIP and publish synthetic evidence on this development branch only. Physical iPad, Safari install, Pencil, hardware GPU/thermal/battery and native system gestures remain unverified.
