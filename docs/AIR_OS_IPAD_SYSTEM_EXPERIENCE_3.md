# Air-OS iPad System Experience 3

Development branch: `feat/air-os-ipad-system-experience-3`. Exact Ultra base: `12f8e401c21eb35debf2ed2180a283dc10de8476`. No deployment, merge, installed-PWA update, Tailscale change or data migration.

## Checkpoint A – launcher and lifecycle

Full-scene App Library with All Apps / Categories, eight groups derived from the existing 25 registry entries; category view for new sessions, persistent user view preference; search, group expansion, keyboard navigation and touch dismissal. The original Dock stays visible; pins and lifecycle remain owned by the existing controllers.

The existing animation scheduler now owns cancellable opening/closing and focus effects. Opening uses the actual Dock/launcher button rectangle, closing targets the real Dock icon. Reopening cancels pending close cleanup. Geometry/mode changes cancel presentation effects. Reduced motion and document visibility release ownership.

EveningGlow (Ian Hex, LGPLv3) replaces the forest default with a licensed sunset/lake photograph. Original file and metadata from KDE plasma-workspace-wallpapers `0643e9404da07d204014549d9f734424fdf961ed`, `EveningGlow/contents/images/2560x1600.jpg`. Forest remains available as an unchanged asset. Existing shared GLASS-3 owner handles materials; the full-screen launcher uses bounded CSS wallpaper blur rather than a giant additional GL surface.

Source audit: InfinityOS `a6584135cbcad837d57484211119451bbb2d8fb2`, `script.js::openMenu` supplies registry partitioning; `styles.css::winOpen` supplies the source movement curve. The upstream menu only partitions system/user apps; tablet category cards are an Air-OS adaptation against the supplied reference. MacShell `1bdb51870b621100fd2709f66c8f8e00ab17b9c4`, `SPopUp.qml` supplies short OutCubic/OutQuint popup motion principles. MacTahoe GTK `1e45e19f510edb8cde18fa84d6cd5319f60b086b` supplies the existing neutral palette and sidebar construction. Detailed port paths remain in `ipad/vendor/infinityos/provenance.json`; MIT/AGPL/GPL/OFL/LGPL notices and offline corresponding source are retained.

The supplied category, MacShell desktop and lock references are visible in the conversation. The separate File Received reference A is absent; no direct comparison to it is claimed. No pixel identity is claimed between Qt/GNOME and WebKit.

First correction round: the first rendered category view exposed a header selector styling tab buttons as close buttons; this product selector and search contrast were corrected, then rerendered. At 1180×820 the scene uses four columns of 154px cards, 54px icons, readable labels and a permanently visible Dock. Touch geometry is deliberately larger than the embedded reference.

Validation so far: 42/42 Node regressions; Chromium baseline 7 checks/21 screenshots from exact Ultra base; new Chromium visual suite 23 checks/24 screenshots at six viewports. Full Chromium root GUI: 112 checks passed, including legacy music/data preservation, touch, geometry and offline restart. WebKit, subpath/update regressions and subsequent design rounds remain pending until recorded below.

## Remaining work at Checkpoint A

Recompose Control Center/Island/MacLock and a real file-import acknowledgement; rebuild Finder/music/Notes/calendar interior hierarchy; perform rounds two and three; test both browsers, offline/update/resource paths; package a versioned PWA ZIP and publish synthetic evidence on this development branch only. Physical iPad, Safari install, Pencil, hardware GPU/thermal/battery and native system gestures remain unverified.

## Checkpoints B/C – system surfaces and app interiors

Control Center now composes connectivity/focus, a real shared-media slab, native app-volume slider and shortcuts. All former actions remain available; calendar is an actual existing app action. Unsupported native OS controls are not invented. Island retains the original pill contour and binds its expanded view to existing music/timer nodes. MacLock increases clock/art/transport hierarchy without changing its local visual-unlock boundary.

The reusable import acknowledgement is in the existing popup owner (`desktop.js::received`), called only after the Finder writes explicitly selected files successfully. It reads actual file IDs from the existing store, permits only bounded PNG/JPEG/WebP/GIF previews and revokes its Blob URL on dismissal. No network transfer service, device capture or alternate file database exists. A synthetic stored PNG exercises exactly this contract in visual tests.

Finder, Notes/AirWrite, Air Music, Calendar and Settings now have composed interiors, not just replacement titlebars. Shared `system3.css` app tokens and the adapted MacTahoe 6px sidebar shadow unify sidebars/toolbars/selection/paper/inputs. Existing DOM nodes and handlers for the original audio and calendar panels are moved, not duplicated. Finder retains all file operations through the existing context-menu owner; Notes list previews and compact toolbars retain dirty/save/import/export handlers; Music retains its single library and audio engine while grouping secondary actions; Calendar keeps the original event form/list next to the month; Settings groups appearance/data/update/privacy with the existing controls. Other apps inherit shared chrome and retain their established limitations.

Round 2: enlarged widget text, recomposed slabs, lock typography and Island; removed duplicate transport mask exposed in rendered pixels. Round 3: first interior captures revealed oversized file action rows, a bright sidebar search field and Music tools pushing the library below the fold. Product code now uses real context menus, a corrected sidebar selector and a compact player/secondary-action group. These are actual rerendered corrections.

Latest local evidence before the final browser gate: 42/42 Node; full Chromium root suite 112/112; visual round 2 27 checks/27 images; round 3 28 checks/31 images including live paused WAAPI open/close frames, actual stored-file acknowledgement and released preview URL. Reopening during close preserves the original window. The three visual rounds and their intermediate outputs are retained locally; final CI will save selected before/after screenshots and complete reports.

### Source transfer distinctions

- Directly adapted algorithm: InfinityOS registry iteration/partition (`script.js::openMenu`) into `vendor/infinityos/launcher-model.js`, called by the existing launchpad. Tablet cards, touch/keyboard behavior and strict filtering are Air-OS integration, not a claimed upstream tablet implementation.
- Adapted motion: original InfinityOS `styles.css::winOpen` curve; MacShell `MacShell/SPopUp.qml` popup timings/curves. FLIP rectangles, cancellation leases and browser lifecycle are Air-OS implementation in `core/visual-motion.js` / `desktop.js`.
- Adapted app construction: MacTahoe `src/sass/gtk/_common-4.0.scss` source retained as `third_party/tahoe/gtk/source/gtk/_common-4.0.scss` in the desktop history, `%side_style_left`, `%side_headerbar_left/right`; neutral palette, 6px complementary sidebar shadow and flat toolbar hierarchy adapted to shared browser CSS. No GTK runtime. Copyright (c) 2021 WhiteSur Developers; existing MIT text retained.
- Reused, not new ports: MacShell dial, coupled Dock magnification/Spring, curated MacTahoe icons/fonts and shared GLASS-3 shaders/guards from Ultra/R7. The full-screen launcher deliberately avoids an extra GL material tile. Wallpaper pixels are the only permitted source; no live foreign-window refraction is claimed.

## Measured local material/lifecycle gate

Chromium DPR2: standard path has 0 GL programs, 0 textures and 0 shader draws. Opt-in High correctly rejects the detected software GPU and retains CSS. Only an injected isolated diagnostic test enables software shaders: 4 programs (3 material), 5 textures, 21,356,816 estimated texture bytes, scene 1697×1179. Refraction uniform on/off changed real rendered pixels: mean absolute channel difference 3.095 on the test widget crops (not a reference similarity score). Idle draw count remains stable; context loss/restore and navigation disposal pass. Diagnostic wall time is environment-dependent and costly (1236ms measured paint incl.1012ms transfer on this software renderer), so this is not a hardware-performance or iPad-battery claim.

Final local visual gate at this checkpoint: 28 checks /31 screenshots; 42 Node tests. The independent material test passes 11 checks. The last complete root browser run passes 112 checks; CI will repeat on the exact committed build for Chromium and WebKit, root and `/Air-OS/`, including protected updates and offline cold restart.

Final usability correction: fresh sessions open Categories, while a saved All Apps preference is respected. Keyboard tabs use roving focus. Regression tests explicitly choose All Apps before testing the legacy category filter; tests do not force the product default. The imported screenshot fixture is removed from the isolated test store before comparative Finder captures so before/after app contents match.

The final local visual suite now checks 31 conditions, including the new-session category default, five-app expansion of Produktivität and the actual persisted Focus preference. Viewport fitting cancels in-flight presentation effects before using the existing central bounds model.

## Browser-gate correction

CI `42104409361`, source `82241727c77e28035563a4f21e01f786ef900315`: Chromium passes all 283 GUI checks across before/after/material/root/subpath/update reports. WebKit passes the baseline and renders all requested new scenes, then its page closes after the 24th visual check during repeated launcher/material changes. This is a failed WebKit acceptance, not a completed Safari result. Evidence is retained under `docs/visual/ipad-system3/82241727c77e28035563a4f21e01f786ef900315/`.

A product correction removes full-viewport blur interpolation, caps launcher blur at 16px, releases hidden widget scene layers and restricts detailed title materials to the focused internal window. The same material owner observes window-focus changes and reconciles dormant layers. Reduced Transparency avoids launcher blur. The visual sequence is retained and gains an explicit no-blur-interpolation check and renderer-crash reporting. No test step or data gate is skipped. The full two-engine gate is rerun before acceptance.

## Lifecycle correction after full browser evidence

CI `42105917530`, product `ef057f7af9cbc7eb38ff021bbeee28f9b1ed6460`: WebKit now passes its full before/after/material/root/subpath/update suite (282 checks). Chromium passes its root/visual/material gate, but the subpath run exposes an Arcade-close timeout after returning from app fullscreen. Its actual game interval remains alive.

Cause: the delayed viewport-fit callback cancels the close animation. The close method also treated this animation cancellation as cancellation of the already approved close request. It must instead use its existing close-request lease: a user reopen/focus/minimize invalidates that lease; resize, reduced motion or visibility only interrupt presentation. A new deterministic GUI test explicitly dispatches resize during close and fails against the previous product. The product correction preserves the close request while retaining the existing reopen protection. No test is relaxed; all previous fullscreen/Arcade cleanup checks remain.
