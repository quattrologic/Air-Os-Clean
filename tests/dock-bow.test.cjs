'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('Modern lower silhouette spans the complete width as an ellipse, without changing layout or Classic',()=>{
 const css=fs.readFileSync(require.resolve('../air-modern-dock.css'),'utf8');
 const modern=css.split('/* Attached lower edge;')[1].split('/* Soft glass')[0];
 assert.match(modern,/html\[data-desktop-theme="modern"\] \.dock\[data-theme="modern"\]/);
 assert.match(modern,/bottom:0 !important/);assert.match(modern,/border-radius:22px 22px 50% 50% \/ 22px 22px 24px 24px/);
 assert.doesNotMatch(modern,/padding:|height:|width:|transform:/);
 assert.match(css,/html\[data-desktop-theme="modern"\] \.dock\[data-theme="modern"\] \.dock-app.is-open::after \{bottom:2px !important\}/);
});
test('music preview is explicitly static Demo with original text, no pretend controls/audio and Modern-only display',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),css=fs.readFileSync(require.resolve('../air-island.css'),'utf8');
 const card=html.match(/<section class="air-island-demo"[\s\S]*?<\/section>/)?.[0];assert.ok(card);
 assert.match(card,/Musik-Demo ohne Audiowiedergabe/);assert.match(card,/DEMO · keine Audiowiedergabe/);assert.match(card,/Demo-Künstler/);assert.match(card,/Demo-Zeile:/);assert.match(card,/Unter weitem Himmel wächst ein neuer Tag/);
 assert.doesNotMatch(card,/<audio|<video|<button|<input|https?:|onclick=/);
 assert.match(css,/\.air-island-demo \{display:none\}/);assert.match(css,/html\[data-desktop-theme="modern"\] \.air-island-demo \{display:grid/);
 assert.match(css,/html\[data-desktop-theme="modern"\] \.air-island-toggle>span \{display:none\}/);
});
