# Air-OS iPad Premium 5 — visual QA and first implementation pass

**Scope:** private development branch only. Not a claim of 10/10 design quality.
**Pinned baseline:** `feat/air-os-ipad-premium-4` @ `35bb3375aa57cfb68b1c29d9e784fe60e48b976e`.
**Last tested Premium 4 product:** `07666db83bc821441c57a03b01a10715de8d88f2`.
**Existing user-provided Yosemite wallpaper:** strictly unchanged.
**No deployment, no merge, no modification to Tailscale, indexedDB, runtime data or private iPad installation.**

## Original evidence reviewed

Actual unaltered Premium 4 Chromium screenshots from workflow `42254786645`, not hand-made mockups:
[Desktop](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/desktop.png),
[Launcher Categories](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/launcher-categories.png),
[Control Center](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/control-center.png),
[Island](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/island.png),
[Finder](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/finder.png),
[Music](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/music.png),
[Notes](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/notes.png),
[Calendar](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/calendar.png),
[Settings](../docs/visual/ipad-premium4/07666db83bc821441c57a03b01a10715de8d88f2/after-chromium/settings.png).

Sources:
[MacShell](https://github.com/0-ss/MacShell) for GlassSlab/Control Center, desktop and MacLock,
[InfinityOS](https://github.com/Infinity-Systems-UA/InfinityOS) for launcher motion/model and touch/system transitions,
[MacTahoe GTK](https://github.com/vinceliuice/MacTahoe-gtk-theme) for composed app interiors and sidebar/headerbar construction.
The user-supplied ester launcher reference is a composition guide, not upstream InfinityOS source code.

## Specific remaining visual gaps, ranked

1. **Legibility at tablet sizes:** premium4 contains many 9–12 px labels in music, Finder, calendar events, Settings and Control Center; at 1180×820 the screenshot hierarchy feels miniature.
2. **Inconsistent interactive emphasis:** selected sidebars, toolbar hover states and focus states vary among apps.
3. **Control Center hierarchy:** pill slabs are closer to MacShell, but metadata and secondary buttons are too small; photo visibility competes with translucent surfaces.
4. **Finder scanning:** file rows, metadata and column labels need a clearer baseline/spacing grid.
5. **Notes text rhythm:** body, headings and selected note previews have disproportionate size/spacing.
6. **Music library:** real album/player content needs priority over secondary controls and miniature row labels.
7. **Settings density:** section labels and toggle rows should use consistent touch-friendly vertical rhythm.
8. **Calendar information:** weekday headers and event labels are extremely small.
9. **Launcher labels:** category names and All Apps text should be readable at regular iPad viewing distance.
10. **Native device check is still absent:** the browser renders are Chromium/WebKit automation on Linux, not iPad Safari/Apple GPU/battery measurements.

## First real code pass

The CSS changes are appended to `ipad/premium4.css`, preserving existing controller and ownership contracts.

- Consolidated text rhythm and restrained blue selection across shared MacTahoe app surfaces.
- Improved real Finder row heights, metadata labels and breadcrumb emphasis.
- Increased true editable title/body text and note list metadata without replacing inputs.
- Raised music title/library typography, calendar event readability and Settings label sizes.
- Increased contrast and label scale of MacShell-derived Control Center slabs without enabling extra WebGL surfaces.
- Raised InfinityOS-derived launcher icon/group label sizes and visible keyboard focus outlines.
- Kept `prefers-reduced-transparency` and the existing in-app reduced-transparency mode; no new GPU draws or animation loops.

**Important:** A CSS readjustment alone is not a complete 10/10 overhaul. No fabricated reference similarity or physical hardware result is claimed.

## Build and safety gate

Own branch workflow: `.github/workflows/test-ipad-premium5.yml`.
Baseline helper: `scripts/capture-ipad-premium5-baseline.cjs` pinned to exact Premium 4 completion.
Package helper: `scripts/package-ipad-premium5.cjs` with a distinct artifact identity.
It runs the existing browser, regression, update, license and recovery suites on the new branch, without deployment.

## Release boundary

Do **not** change the installed iPad's Safari data, IndexedDB, Music, Calendar, Tailscale URL, Windows Serve path or scheduled tasks. No release and no private-host update is performed. Any later iPad installation requires a separate explicit opt-in and physical validation.
