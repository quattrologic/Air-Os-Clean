'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
function shaders(){const context={window:{}};vm.runInNewContext(fs.readFileSync('hyprland-shaders.js','utf8'),context);return context.window.airHyprShaders;}
test('R7 generated Prism/Frost ports are deterministic and strip native include extensions',()=>{
 const before=fs.readFileSync('hyprland-shaders.js');cp.execFileSync(process.execPath,['scripts/build-hyprland-shaders.cjs']);assert.deepEqual(fs.readFileSync('hyprland-shaders.js'),before);
 for(const name of ['prism','frost']){const s=shaders()[name];assert.match(s,/#version 300 es/);assert.doesNotMatch(s,/#include|GL_ARB_shading_language_include/);assert.match(s,/airDistance\(qt_TexCoord0\*itemSize\)/);assert.match(s,/dFdx\(v_texcoord\)\*airPixelScale.x/);}
});
test('R7 preserves actual original Prism dispersion and Frost Voronoi/seam calculations',()=>{
 const s=shaders();for(const fn of ['triangleWave','distanceToFold','prismSurface','prismFinish'])assert.ok(s.prism.includes(fn));
 assert.match(s.prism,/mix\(0.12, 0.28, glassRoughness\)/);
 for(const fn of ['frostRandom','frostWarp','frostCellular','frostGradient'])assert.ok(s.frost.includes(fn));
 assert.match(s.frost,/secondDistance = nearestDistance/);assert.match(s.frost,/seamDirection \* seam \* 0.55/);
});
test('R7 inner-glow decay is executed inside existing finish shaders, no additional render owner',()=>{
 const s=shaders();for(const name of ['acrylic','glass','prism','frost']){assert.match(s[name],/pow\(1.0 - distFromEdge \/ range, glowPower\)/);assert.match(s[name],/fragColor=airGlowFinish\(fragColor\)/);assert.match(s[name],/color.a\*vec3/);}
 const source=fs.readFileSync('air-desktop-glass.js','utf8');assert.equal((source.match(/getContext\('webgl2'/g)||[]).length,1);assert.match(source,/software&&!diagnostic/);assert.match(source,/quality>\.25/);
});
test('R7 material variants use existing validated per-profile preferences and no software bypass',()=>{
 const p=require('../src/main/preferences.cjs');for(const name of ['prism','frost'])assert.equal(p.validate({glassFamily:name}).glassFamily,name);
 for(const name of ['force-software','javascript:alert(1)','unknown'])assert.throws(()=>p.validate({glassFamily:name}));
});
