# R6 source port

Base7c3fc8dc8eb6e55bcd709bd007be79e3537d108e;Hyprland0aa6745f705f2c4b0a5004eb019ef76e5bbdb426(BSD-3-Clause,vaxerski2022–2026),MacShell1bdb51870b621100fd2709f66c8f8e00ab17b9c4(MIT,Rickky).Existing MacTahoe GTK1e45e19f510edb8cde18fa84d6cd5319f60b086b/MIT and GPL-icon pins remain in third_party/tahoe/provenance.json. No Linux/Qt runtime installed. Original bytes/hashes: [Hyprland manifest](../third_party/hyprland/provenance.json),[BSD copyright/disclaimer](../third_party/hyprland/LICENSE),[NOTICE](../third_party/hyprland/NOTICE).

| Original | Runtime port | Adaptation / evidence |
|---|---|---|
| acrylicfinish.frag,Acrylic.cpp,ConfigValues.cpp | scripts/build-hyprland-shaders.cjs → hyprland-shaders.js → air-desktop-glass.js | Actual8-step nestedSDFdepth/normal,refraction24px,bulb48,clarity.82,aberration.025,tint0x14EEF5FF/log optical depth,light/Fresnel/caustics/absorption. SDR normalized luminance1 and extracted original sRGB transfer functions;HDR/ICC/Wayland unavailable. Air concave mask/gradient only overrides boundary geometry. |
| blur1.glsl,blur2.glsl | same context / existing framebuffer and texture cache | Original5tap1/8 down and8tap1/12 up kernels,vibrancy.1696,radius8,onelevel;normalized UV wrappers replace native framebuffer atlas. Bounded half-resolution cache,not full compositor damage tracking. |
| glassFinish.glsl,blurFinish.glsl | optional HyprlandGlass material | Original normal UV displacement/emboss/finish noise;separate from Acrylic and MacShell. |
| MacShell liquidglass,dockglass,contourglow and R5 local lenses | unchanged shared engine | Default MacShell profile retained. Hybrid selects cached MacShell Gaussian + single Acrylic finish;no stacked refraction or second renderer. |

A:514/514Node tests;actual sandboxed Linux-Electron compiled/rendered all4material families. [Actual render](visual/r6/A/material-acrylic.png),[report](visual/r6/A/material-report.json). Explicit isolated SwiftShader is NOT hardware acceptance. Normal software/unknown guard retained. Wallpaper-only source;no screen/window capture. Reference originals of shadow/innerglow/prism/frost/layouts are not automatically counted as ported;their executed paths will be documented only after integration. GL resources released by existing lifecycle/context-loss owner.
