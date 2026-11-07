# Air-OS iPad — Pro Notch

Branch: `feat/air-os-ipad-pro-notch`. Pinned base: Premium 4 `35bb3375aa57cfb68b1c29d9e784fe60e48b976e`, tested product `07666db83bc821441c57a03b01a10715de8d88f2`, successful CI `42254786645` (704 browser checks). Premium 5 `ae0037de7efb064ff49619ed403b98f4371edf51` is newer but its CI `42261344976` failed; none of its CSS changes are included. System Experience 3 is an older ancestor.

## Actual reference and legal scope

The attached `Pro-Notch-Codex-Referenz.mov` is available: 612×512, 388 frames, 12.934 seconds, nominal 30fps, actual variable timestamps. SHA-256: `9f129a886e4781fd4fa17a9f1f45e740e352e71e45ce5e150cc341184c390b74`. It was decoded and inspected, including intermediate frames. The separately named `Pro-Notch.zip`, `ScreenRecording_11-07-2026 11-50-36_1.mp4` and pre-extracted keyframes are absent. The provided Drive URL returns tunnel HTTP403. No association with inaccessible files or native source is claimed.

The recording is a filmed display with camera shifts, hard cuts, exposure/motion blur and an unknown mapping from recorded pixels to native macOS points. The measured stable body sizes are approximately closed 235×31, music 440×151, extended music 443×260, timer 442×176, calendar 507×212–215 and Shelf 440×149. Runtime targets use CSS pixels and adapt to the actual PWA viewport. Native/camera pixels are not assumed to equal iPad hardware pixels. The reference includes an active compact-lyrics variant; it is only used when genuine local LRC content exists and the existing audio engine is playing.

This is an independent reimplementation of visible UI/motion, not a port of proprietary native program code. No macOS binary, resource extraction, decompilation, reference album artwork or reference lyric text enters the PWA. New glyph paths are independently drawn. Native AirDrop is replaced with an explicitly named browser import action. The black surface is always #000000, with no glass shader, backdrop filter, gradient, colored outline or idle animation.

## Architecture and running paths

- `ipad/notch/motion-data.js`: actual sampled timing/height progress, reference frame ranges, geometry and uncertainty.
- `ipad/notch/model.js`: bounded geometry, sampled WAAPI keyframes and plain-text local LRC parsing; no system/data ownership.
- `ipad/notch/pro-notch.js`: one continuous outer surface and one cancellable request lease. Width/height/bottom radius morph; content tracks share that request. Music/lyrics retain the same inner player nodes. No generic popup/zoom, no second visual-motion owner.
- `ipad/notch/pro-notch.css`: isolated solid black UI, stable final-size content clipped by the evolving outside contour.
- `ipad/app.js`: the existing audio/timer owner remains authoritative. Timer methods expose the existing state/actions; its existing deadline clock is rearmed after actions. Music, IDB, backup and calendar models are unchanged.
- Existing `shelf-files` references and `fileAction` power the shelf. Import requires explicit file selection/drop; removal only removes references. Export uses existing Air Transfers. No native AirDrop, native window control or new file database.
- Existing `core/visual-motion.js` and GLASS-3 no longer animate/materialize the Notch. Dock/windows/widgets keep their original engine.

The original #notch-toggle/#notch-panel metadata bindings are preserved, but their old glass presentation is replaced. Access to calendar, shelf and player controls requires the existing local session to be open; this remains a visual PWA session, not secure native authentication.

## Motion derivation

Opening samples: frames18–28, 333ms. Expanded lyrics:104–113, 300ms. Closing/settling:158–179, 700ms (most contraction occurs in the first ~270ms, followed by a small recorded rebound). Switching profile:195–206, 367ms. Native implementation/easing names are unknown: no guessed Bezier is called original. Between measured keyframes WAAPI interpolates linearly. Frame duplication/quantization in the MOV is retained. A frame19 point is not interpreted as a perfect continuous native velocity measurement. Camera-cut intervals1→2 and113→114 are excluded. Bottom radii are visual estimates (closed ~10–12, open ~20–24), not recovered native alpha masks; top shape is attached to the viewport edge.

## Visual correction rounds

1. Initial single black surface and all real data paths; comparison showed media rows too low and view bodies too tall.
2. Actual nav-button tests exposed a stacking conflict with the capsule hit target. Header is now outside the animated content track; real tabs remain interactive. Timer scale now reflects actual remaining time. Async metadata/import tests wait for committed UI state.
3. Relative reference coordinates corrected: cover y32, title y28, progress center~72, transport center~115; music152px, timer176px, calendar216px, Shelf150px. Extra visible close glyph is replaced by a small independent monochrome header mark.

## Verified checkpoint / pending gate

45/45 Node regressions (42 retained +3 pure Notch cases). First complete Chromium Notch GUI pass:37 checks/32 scenes, including actual metadata switching, LRC, timer/store contract, calendar, shelf import/removal, all six viewports, interruption, repeated inputs, pointercancel, Reduced Motion, idle and offline restart. This includes 16 actual paused intermediate frames for opening, closing, expansion and mode switching. The complete existing Chromium app/data gate also passes112 checks. WebKit, final reference-comparison packaging and the full CI/update gate remain pending until results are recorded below.

## Protected boundaries

No IndexedDB migration: `air-os-ipad-tracks-v1`, schema2. All25 apps remain. `storage.js`, `backup.js`, Tailscale/Windows setup/update scripts, private installation and Serve address are untouched. Yosemite SHA-256 remains `d1d1a71c8080696bf45b1ff0a664df592e59ac27a0710853f76d938a10a9ac06`. No deployment and no merge. Physical iPad/Safari/Pencil, battery, GPU and actual macOS/native-app equivalence remain open.

### Resource correction exposed by real viewports

The first small-viewport capture exposed a real WAAPI lifecycle error: removing a finished effect from the ownership set before cancellation left its `fill:both` geometry attached to the DOM. It overrode later resize dimensions despite an internal zero count. The coordinated request now retains all effects until final cancellation. Every settle check also requires the real subtree `getAnimations()` list to be empty. The corrected 390px capture stays inside the viewport. Closing keeps the actual old page/content width until its scheduled fade, then reveals the real compact state; no abrupt removal at close start.

## Checkpoint B — measured frames and final local gate

The final model samples **width and height separately**, rather than applying a height-only curve to both axes. A fifth measured family covers lyrics→calendar (frames235–247,400ms). The four diagnostic captures per family use the exact retained source-frame timestamps (approximately20/40/60/80%); the opening fixture uses the same small closed state as the recording. The compact lyric capsule is a different real state and is not silently compared with the smaller paused capsule.

`analyze-pro-notch-reference.py` reproduces measurements from the attached video with ffmpeg/ffprobe, Pillow, NumPy and SciPy (analysis tools only). `docs/reference/pro-notch/keyframes.json` and content-free contour masks preserve27 measured states. `build-pro-notch-comparisons.cjs` compares actual unretouched PWA crops with those masks at one filmed pixel per comparison CSS pixel; actual DPR2 captures are downsampled to CSS size. It does not independently fit each silhouette or claim a whole-image similarity score. Full reference UI crops remain in the local analysis package; copyrighted album art/lyrics are not shipped in the application or repository.

The final local Chromium run passes **44 targeted checks/36 actual screenshots**, including20 paused intermediate frames across five motion families, plus a separate interrupted opening. Calendar now reproduces the compact header, Day/Week control and day-time rail: week navigation selects real dates, the day rail derives marks from existing appointments. Both actions are tested. The timer ruler is aligned7px higher after direct reference comparison. Local regressions pass **46/46** (42 retained +4 Notch cases), the existing app/data gate112, existing visual gate37 and material gate11. These are separate suites, not additional app counts. The remaining complete two-engine CI gate is recorded in the final acceptance section when available.

After correcting the comparison start state and exact frame time, sampled width/height differences from the measured contours are about0–3px; this demonstrates reproduction of the fitted measurements, not independent proof of native motion equivalence. Corner/opacity interpolation remains estimated. Native macOS screen position, camera perspective, font rasterization, provider-specific badges and native file transfer remain different.

The new workflow `.github/workflows/test-ipad-pro-notch.yml` runs Chromium and actual WebKit, the pinned verified Premium4 baseline, normal/DPR2 visual and Notch suites, existing material/app/root/subpath/update tests, mandatory test-tool dependency audit, exact runtime/CSP/license checks and versioned ZIP packaging. It uploads diagnostic/evidence artifacts and may commit only synthetic screenshots/reports to this development branch; it has no deployment job. The existing update, private Serve and storage owners remain authoritative.

Checkpoint A: `9196f94bc0c7ca9e4a75bf0af020594308caea70` (pushed). Checkpoint B and final CI/artifact SHAs follow below.

A final full-color comparison exposed a content-timing difference despite matching contours: source cover/text are already partly visible around frame20 and substantially visible by frame24. The coordinated enter track now uses measured-sequence estimates8%→55% of the opening instead of24%→78%, with no extra blur/zoom. These values live in the motion data and are used by all incoming content tracks; they remain estimated opacity, not extracted native alpha. The follow-up local44-check run passes. The corresponding-source ZIP includes the content-free contour/measurement inputs and the current feature branch in its source instructions.

The last interaction gate replaces navigation mouse clicks with actual Playwright touchscreen taps and additionally tests six real rapid capsule taps plus keyboard ArrowRight tab selection. The local targeted suite now passes **46 checks/36 screenshots**. Synthetic Pencil `PointerEvent` cancellation is covered separately; this is not physical Pencil hardware validation.

## CI correction — real server outage instead of emulated network loss

Run42374274723 / source`11c5b34e7d6304a76fc5a37a8de8184dfeea00b2`: the complete Chromium job passed, including audit, both DPRs, root/subpath, material and10 update checks. WebKit passed all three37-check visual suites and44 Notch checks, then `page.reload` raised a browser-internal error with Playwright network-offline emulation. That run is **not** accepted as a complete release; its report/screens remain preserved.

The Notch test now uses the existing regression suite's real outage method: wait for the controlling active Service Worker, shut down the local HTTP server, reload, then close and restart the persistent browser process while the server remains down. No retry, exception swallowing, product SW change or weakened data assertion is used. Local Chromium passes **47 checks/37 screenshots** with both offline stages. The complete two-engine gate is rerun before final acceptance.

## Retina WebKit synchronization correction

Run42375098262 passed47 normal WebKit Notch checks, including real offline reload/cold restart, and the complete Chromium job. Retina WebKit stopped at the pause→small-capsule assertion: `audio.pause()` returns before WebKit dispatches its asynchronous media event, allowing a generic zero-animation wait to return before the morph begins. The test now explicitly waits for paused audio and the real32px target (0.5CSSpx rounding tolerance), then still requires zero actual DOM effects. No retry, feature removal or application/SW/template change. The local47-check follow-up passes; final acceptance requires both complete browser jobs.
