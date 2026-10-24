/* WebGL2 ports of MacLock/liquidglass.frag and glasstext.frag.
 * Original copyright (c) 2026 Rickky, MIT: third_party/maclock/LICENSE.
 * Pinned upstream 1bdb51870b621100fd2709f66c8f8e00ab17b9c4.
 * Original math/main bodies preserved; GLSL ES declarations/Qt uniform bindings adapted.
 * Original unmodified sources: third_party/maclock/original/.
 * Vertex/blur plumbing below is Air-OS code, no Qt runtime or library. */
(function(root,factory){
 'use strict';
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.airMacLockShaders=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const vertex=`#version 300 es
precision highp float;
layout(location=0) in vec2 position;
uniform bool toScreen;
out vec2 qt_TexCoord0;
void main(){
 gl_Position=vec4(position,0.,1.);
 qt_TexCoord0=(position+1.)*.5;
 if(toScreen)qt_TexCoord0.y=1.-qt_TexCoord0.y;
}`;
 const blur=`#version 300 es
precision highp float;
in vec2 qt_TexCoord0;
out vec4 fragColor;
uniform sampler2D src;
uniform vec2 stepPx;
uniform float radius;
// Separable Gaussian kernel with support blurMax*blur; sigma=support/3.
// Qt MultiEffect's private blur pyramid differs: kernel mapping is documented.
void main(){
 float sigma=max(radius/3.,.25),sum=0.;
 vec4 color=vec4(0.);
 for(int i=-32;i<=32;i++){
  float x=float(i);
  if(abs(x)>ceil(radius))continue;
  float w=exp(-.5*x*x/(sigma*sigma));
  color+=texture(src,clamp(qt_TexCoord0+stepPx*x,vec2(0.),vec2(1.)))*w;
  sum+=w;
 }
 fragColor=color/sum;
}`;
 const liquidglass=`#version 300 es
precision highp float;
precision highp int;
// Liquid Glass for the macdock Dock.
//
// Build:  qsb --qt6 -o liquidglass.frag.qsb liquidglass.frag
// (shell.qml runs this automatically on first use and caches the result in ~/.config/macdock/)
//
// The shader treats the Dock as a slab of curved glass sitting on top of a live backdrop texture:
//   * a rounded-rect signed distance field gives the distance to the edge and the edge direction
//   * a convex "squircle" bezel profile turns that into a surface normal
//   * Snell's law (refract) turns the normal into a lateral shift of the sampled backdrop
//   * the backdrop is sampled per colour channel (dispersion) through a small disk blur
//   * saturation / tint / milky lift, then specular rim, inner depth shading and a soft drop shadow

in vec2 qt_TexCoord0;
out vec4 fragColor;

uniform float qt_Opacity;
uniform vec2 itemSize;
uniform vec2 glassSize;
uniform vec2 srcSize;
uniform vec2 srcOffset;
uniform float pad;
uniform float radius;
uniform float bezel;
uniform float thickness;
uniform float dispersion;
uniform float blurPx;
uniform float tintMix;
uniform float saturation;
uniform float dark;
uniform float debug;
uniform float rim;
uniform float grain;
uniform float magnify;
uniform float shadowAmt;

uniform sampler2D src;

const int   TAPS   = 24;
const float GOLDEN = 2.39996323;

// Natural blur, no "duplicated background" ghosts:
//  * every tap reads a pre-blurred mip level sized to the gap between taps, so the taps overlap into one
//    smooth surface instead of showing as separate copies of the content
//  * Gaussian weights give a soft falloff instead of a hard disk edge
//  * the tap pattern is rotated per pixel (interleaved gradient noise), so any leftover gaps turn into
//    fine grain instead of repeating ghost lines
//  * one shared pattern for all three colour channels (dispersion only shifts the centre)
// Needs \`mipmap: true\` on the ShaderEffectSource (set in MacBar.qml / MacDock.qml).
vec3 backdropLod(vec2 pItem, float lod)
{
    vec2 uv = (pItem + srcOffset) / srcSize;
    return textureLod(src, clamp(uv, vec2(0.001), vec2(0.999)), lod).rgb;
}

float ign(vec2 p)
{
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

vec3 blurredDisp(vec2 pItem, vec2 disp, float disperse, float rad)
{
    float R   = max(rad, 0.5) * 1.5;                       // Gaussian reaches further than a flat disk
    float gap = R * sqrt(3.14159265 / float(TAPS));        // spacing between neighbouring taps, px
    float lod = clamp(log2(max(gap, 1.0)) + 0.35, 0.0, 6.0);
    float rot = ign(gl_FragCoord.xy) * 6.2831853;
    vec3  acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = 0; i < TAPS; ++i) {
        float fi = float(i) + 0.5;
        float r  = sqrt(fi / float(TAPS));
        float a  = fi * GOLDEN + rot;
        float w  = exp(-2.2 * r * r);
        vec2  o  = vec2(cos(a), sin(a)) * r * R;
        vec3  c;
        c.r = backdropLod(pItem + o + disp * (1.0 + disperse), lod).r;
        c.g = backdropLod(pItem + o + disp,                    lod).g;
        c.b = backdropLod(pItem + o + disp * (1.0 - disperse), lod).b;
        acc  += c * w;
        wsum += w;
    }
    return acc / wsum;
}

float hash12(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float roundBox(vec2 q, vec2 hs, float r)
{
    vec2 d = abs(q) - (hs - r);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

void main()
{
    vec2 p  = qt_TexCoord0 * itemSize;
    vec2 hs = glassSize * 0.5;
    vec2 q  = p - vec2(pad) - hs;
    float r = min(radius, min(hs.x, hs.y));

    float sd  = roundBox(q, hs, r);               // < 0 inside the glass
    float cov = clamp(0.5 - sd, 0.0, 1.0);        // anti-aliased coverage

    if (debug > 0.5) {
        vec4 s = texture(src, clamp((p + srcOffset) / srcSize, vec2(0.001), vec2(0.999)));
        fragColor = (s.a < 0.01 ? vec4(1.0, 0.0, 1.0, 1.0) : vec4(s.rgb / max(s.a, 1e-3), 1.0)) * cov * qt_Opacity;
        return;
    }

    // ── soft drop shadow (only visible outside the glass) ──
    float sds    = roundBox(q - vec2(0.0, 3.0), hs, r);
    float shadow = 0.30 * shadowAmt * (1.0 - smoothstep(-2.0, 9.0, sds));
    if (sd > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, shadow) * qt_Opacity;
        return;
    }

    // ── distance to edge + outward edge direction ──
    float t = max(-sd, 0.0);
    vec2 d2 = abs(q) - (hs - r);
    vec2 sg = vec2(q.x >= 0.0 ? 1.0 : -1.0, q.y >= 0.0 ? 1.0 : -1.0);
    vec2 m  = max(d2, 0.0);
    vec2 g  = (length(m) > 1e-4) ? normalize(m) * sg
                                 : ((d2.x > d2.y) ? vec2(sg.x, 0.0) : vec2(0.0, sg.y));

    // ── convex squircle bezel → surface normal ──
    float bz   = max(bezel, 1.0) * 1.45;           // wider bezel: the glass reads thicker
    float u    = clamp(t / bz, 0.0, 1.0);
    float om   = 1.0 - u;
    float om4  = om * om * om * om;
    float slope = (om * om * om) / pow(max(1.0 - om4, 1e-3), 0.75);
    slope = min(slope, 7.0);
    vec3 n = normalize(vec3(g * slope, 1.0));

    // ── refraction: glass n≈1.5, ray enters straight down ──
    vec3 rd   = refract(vec3(0.0, 0.0, -1.0), n, 1.0 / 1.5);
    vec2 disp = rd.xy / max(-rd.z, 0.2) * thickness * 1.35;

    // the whole slab acts as a gentle vertical lens; blur is crisper right at the curved rim
    vec2 ps = vec2(p.x, (p.y - pad - hs.y) * (1.0 - magnify * 1.5) + pad + hs.y);
    float rad = blurPx * mix(0.45, 1.0, smoothstep(0.0, bz, t));

    vec3 col = blurredDisp(ps, disp, dispersion * 0.6, rad);

    // ── colour grading: vibrancy, tint, milky lift ──
    float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(l), col, saturation);
    vec3 tintC = mix(vec3(1.0), vec3(0.09, 0.09, 0.10), dark);
    col = mix(col, tintC, tintMix);
    col += mix(0.055, 0.020, dark);

    // ── depth: soft top sheen, darker lower inner edge ──
    float ty = clamp((q.y + hs.y) / glassSize.y, 0.0, 1.0);
    col += (1.0 - ty) * mix(0.040, 0.030, dark);
    col *= 1.0 - 0.12 * exp(-t / 6.0) * clamp(g.y, 0.0, 1.0);
    col *= 1.0 - 0.10 * exp(-t / (bz * 0.45));          // thick glass absorbs light toward the edge (heavier feel)

    // ── specular rim, light from the top-left ──
    vec2  L      = normalize(vec2(-0.55, -0.83));
    float facing = dot(g, L);
    float spec   = pow(max(facing, 0.0), 1.6) + 0.55 * pow(max(-facing, 0.0), 2.2);
    float hair   = exp(-t / 1.1);
    float wide   = exp(-t / 5.0);
    float edgeHi = hair * (0.18 + 0.78 * spec) + wide * 0.10 * (0.30 + spec);
    edgeHi *= rim * mix(0.85, 1.0, dark);
    col += edgeHi * vec3(0.96, 0.98, 1.0);

    // meniscus: a soft second highlight inside the rim, like surface tension pulling the liquid together
    float mx  = (t - bz * 0.5) / (bz * 0.2 + 1.0);
    float men = exp(-mx * mx);
    col += men * 0.07 * (0.35 + spec) * rim * vec3(0.96, 0.98, 1.0);

    // fine triangular-distribution grain, same on every channel so it reads as texture, not colour noise
    float gn = hash12(gl_FragCoord.xy) + hash12(gl_FragCoord.xy * 1.7 + 17.0) - 1.0;
    col += gn * grain;

    col = clamp(col, 0.0, 1.0);

    float a = cov + shadow * (1.0 - cov);
    fragColor = vec4(col * cov, a) * qt_Opacity;   // premultiplied alpha
}
`;
 const glasstext=`#version 300 es
precision highp float;
precision highp int;
// The lock screen clock's material, after iOS 26 / macOS 26:
//
//   Solid (mode 0) — Apple's vibrancy: the digits are the wallpaper behind them pushed most of the way to the tint
//                     colour (white by default), so they glow with a hint of the background's colour. Crisp, no rim.
//   Glass (mode 1) — Liquid Glass: clear digits that are a real slab of glass. The blurred glyph coverage (\`hmap\`) is
//                     used as a height field: its slope is the surface normal, and the wallpaper behind is REFRACTED
//                     through that surface — bent most where the glass curves, undisturbed in the flat middle — with a
//                     touch of chromatic dispersion, a little magnification, and a faint frost. The light only shades
//                     the curved surface (brighter on the side facing it, darker on the other); there are NO outlines,
//                     rims, glints or hairlines anywhere. \`lightDir\` follows the pointer, like tilting a phone.
//
// \`mask\` = sharp glyph coverage; \`hmap\` = a softened copy that serves as the height field.
// Build:  /usr/lib/qt6/bin/qsb --qt6 -o glasstext.frag.qsb glasstext.frag      (or run ./build-shaders.sh)

in vec2 qt_TexCoord0;
out vec4 fragColor;

uniform float qt_Opacity;
uniform vec2 itemSize;
uniform vec2 srcSize;
uniform vec2 srcOffset;
uniform float mode;
uniform float intensity;
uniform float refractPx;
uniform float bevel;
uniform vec4 tint;
uniform vec2 lightDir;

uniform sampler2D src;
uniform sampler2D mask;
uniform sampler2D hmap;

float H(vec2 uv) { return texture(hmap, uv).a; }
vec3 bgAt(vec2 p, float lod) { return textureLod(src, clamp(p / srcSize, vec2(0.001), vec2(0.999)), lod).rgb; }

void main()
{
    vec2 uv = qt_TexCoord0;
    float a = texture(mask, uv).a;
    if (a <= 0.002) { fragColor = vec4(0.0); return; }

    vec2 p = uv * itemSize + srcOffset;
    vec3 tintC = tint.rgb;

    // ── Solid: vibrancy ──
    vec3 bgS = bgAt(p, 2.0);
    float ls = dot(bgS, vec3(0.299, 0.587, 0.114));
    bgS = mix(vec3(ls), bgS, 1.35);                      // keep the wallpaper's hue in it
    vec3 solid = mix(bgS, tintC, clamp(intensity, 0.0, 1.0)) + 0.04;

    // ── Glass: refraction through a height field ──
    // surface slope (per px) from the softened glyphs: 0 on the flat top of a stroke, steepest on the curved flanks
    vec2 d = 2.0 / itemSize;
    vec2 g = vec2(H(uv + vec2(d.x, 0.0)) - H(uv - vec2(d.x, 0.0)),
                  H(uv + vec2(0.0, d.y)) - H(uv - vec2(0.0, d.y))) * 0.5;
    float slope = length(g) * bevel;
    float s = clamp(slope, 0.0, 1.0);
    vec2 n2 = slope > 1e-6 ? -g / length(g) : vec2(0.0);   // surface normal, projected: points out of the glyph

    // Snell-style bend: the ray is displaced along the slope (inwards where the glass falls away). A smooth S-curve
    // keeps the bend gradual across the whole bevel instead of piling up at the very edge.
    float bend = s * s * (3.0 - 2.0 * s);
    vec2 shift = n2 * refractPx * (0.35 * s + 0.65 * bend);
    float lod = 0.5 + 2.0 * intensity;
    vec3 bg;
    bg.r = bgAt(p - shift * 1.10, lod).r;               // dispersion: red bends least, blue most
    bg.g = bgAt(p - shift,        lod).g;
    bg.b = bgAt(p - shift * 0.90, lod).b;
    float lg = dot(bg, vec3(0.299, 0.587, 0.114));
    bg = mix(vec3(lg), bg, 1.25);                        // glass saturates what it bends
    vec3 glass = bg * 1.04 + 0.04;
    glass = mix(glass, mix(vec3(1.0), tintC, 0.85), 0.08 + 0.52 * intensity);        // frost (and tint)
    glass = mix(glass, glass * tintC, 0.35 * (1.0 - tintC.r * tintC.g * tintC.b));   // coloured glass when tinted

    // light only SHADES the curved surface: lit flank brighter, far flank darker, flat middle untouched
    float facing = dot(n2, normalize(lightDir));
    float shade = facing * smoothstep(0.0, 0.55, s);
    glass *= 1.0 + 0.22 * shade;
    glass += 0.10 * max(shade, 0.0) * (1.0 - 0.5 * intensity);

    vec3 col = mix(solid, glass, clamp(mode, 0.0, 1.0));
    fragColor = vec4(clamp(col, 0.0, 1.0) * a, a) * qt_Opacity;
}
`;
 const motionScene=`#version 300 es
precision highp float;
in vec2 qt_TexCoord0;
out vec4 fragColor;
uniform sampler2D src;
uniform float zoom;
uniform float blurControl;
uniform float blurOpacity;
// Motion-only composition from cached, mipmapped L1B.1 scene texture.
// The original material shader math remains unchanged. Qt blur pyramid is approximated.
float vignette(float y){
 if(y<.35)return mix(.22,0.,y/.35);
 if(y>.72)return mix(0.,.30,(y-.72)/.28);
 return 0.;
}
void main(){
 vec2 uv=clamp((qt_TexCoord0-.5)/zoom+.5,vec2(.001),vec2(.999));
 float sigmaHalf=48.*blurControl/3.*.5;
 float lod=max(0.,log2(max(1.,sigmaHalf*sqrt(12.))));
 vec3 a=textureLod(src,uv,0.).rgb,b=textureLod(src,uv,lod).rgb;
 vec3 color=mix(a,b,blurOpacity);
 color*=(1.-vignette(qt_TexCoord0.y))/max(.01,1.-vignette(uv.y));
 fragColor=vec4(clamp(color,0.,1.),1.);
}`;
 return Object.freeze({vertex,blur,liquidglass,glasstext,motionScene});
});
