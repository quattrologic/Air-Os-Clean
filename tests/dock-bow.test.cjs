'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Modern dock has a straight flush base and decorative inverse feet, never an ellipse',()=>{
 const css=fs.readFileSync(require.resolve('../air-modern-dock.css'),'utf8');
 const modern=css.split('/* Attached lower edge;')[1].split('/* Soft glass')[0];
 assert.match(modern,/html\[data-desktop-theme="modern"\] \.dock\[data-theme="modern"\]/);
 assert.match(modern,/bottom:0 !important/);assert.match(modern,/border-radius:22px 22px 0 0 !important/);
 assert.doesNotMatch(modern,/padding:|height:|width:|transform:|50%/);
 const feet=css.split('/* Inverse edge corners,')[1];assert.ok(feet);
 assert.match(feet,/pointer-events:none/);assert.match(feet,/bottom:-1px/);
 assert.match(feet,/width:12px/);assert.match(feet,/height:12px/);
 assert.match(feet,/circle at top left,transparent 12px,#000 12.5px/);
 assert.match(feet,/circle at top right,transparent 12px,#000 12.5px/);
 assert.match(css,/overflow:clip !important/);assert.match(css,/overflow-clip-margin:13px/);
 assert.doesNotMatch(feet,/\.dock-app|transform:|onclick|pointer-events:auto/);
});
test('Modern island mirrors inverse top corners without changing trigger size or animations',()=>{
 const css=fs.readFileSync(require.resolve('../air-island.css'),'utf8');
 const material=css.split('/* Subtle glass,')[1].split('/* M1:')[0];
 assert.match(material,/border-radius:0 0 16px 16px/);
 const feet=css.split('/* Mirrored inverse corners')[1];assert.ok(feet);
 assert.match(feet,/html\[data-desktop-theme="modern"\] \.air-island-toggle::before/);
 assert.match(feet,/top:-1px/);assert.match(feet,/pointer-events:none/);
 assert.match(feet,/circle at bottom left,transparent 12px,#000 12.5px/);
 assert.match(feet,/circle at bottom right,transparent 12px,#000 12.5px/);
 assert.doesNotMatch(feet,/transform:|animation:|transition:|\.air-island-panel/);
});
test('music preview is explicitly static Demo with original text, no pretend controls/audio and Modern-only display',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),css=fs.readFileSync(require.resolve('../air-island.css'),'utf8');
 const card=html.match(/<section class="air-island-demo"[\s\S]*?<\/section>/)?.[0];assert.ok(card);
 assert.match(card,/Musik-Demo ohne Audiowiedergabe/);assert.match(card,/DEMO · keine Audiowiedergabe/);assert.match(card,/Demo-Künstler/);assert.match(card,/Demo-Zeile:/);assert.match(card,/Unter weitem Himmel wächst ein neuer Tag/);
 assert.doesNotMatch(card,/<audio|<video|<button|<input|https?:|onclick=/);
 assert.match(css,/\.air-island-demo \{display:none\}/);assert.match(css,/html\[data-desktop-theme="modern"\] \.air-island-demo \{display:grid/);
 assert.match(css,/html\[data-desktop-theme="modern"\] \.air-island-toggle>span \{display:none\}/);
});
