'use strict';
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const registry=require('../src/core/app-registry.js'),icons=require('../src/core/tahoe-icons.js'),provenance=require('../third_party/tahoe/provenance.json');
test('Tahoe icon metadata resolves through the single existing registry, without changing app identity',()=>{
 for(const id of ['finder','browser','notes','calendar','settings','music','photos','mail','downloads','trash','calculator','airwrite']){
  const app=registry.get(id);a.equal(app.iconAsset,icons[id]);a.equal(app.origin,'builtin');a.ok(Object.isFrozen(app));
 }
 a.equal(registry.get('home').iconAsset,undefined);a.equal(registry.get('spotify').iconAsset,undefined);
 a.equal(registry.get('terminal'),null,'No phantom application registered just because an upstream icon exists');
});
test('Every vendored icon is original pinned GPL source with exact digest, local resources and full attribution',()=>{
 a.equal(provenance.icons.commit,'839848b9a8a38a92a6936e30c4abe35cc6f2546d');
 a.match(fs.readFileSync('third_party/tahoe/icons/COPYING','utf8'),/GNU GENERAL PUBLIC LICENSE/);
 a.match(fs.readFileSync('third_party/tahoe/icons/AUTHORS','utf8'),/Vince Liuice/);
 for(const item of provenance.icons.assets){
  const data=fs.readFileSync(item.asset);a.equal(crypto.createHash('sha256').update(data).digest('hex'),item.sha256);a.equal(item.modified,false);a.equal(item.license,'GPL-3.0');
  const svg=data.toString();a.doesNotMatch(svg,/<(?:script|foreignObject)\b|\bon(?:load|click|error)=/i);
  for(const [,href]of svg.matchAll(/(?:xlink:)?href="([^"]+)"/g))a.ok(href.startsWith('#')||href.startsWith('data:image/png;base64,'),'Only internal fragments or embedded upstream PNG shadows');
 }
});
test('Tahoe GTK values come from pinned original laptop Sass and preserve MIT notices',()=>{
 const css=fs.readFileSync('air-tahoe.css','utf8'),vars=fs.readFileSync('third_party/tahoe/gtk/source/_variables.scss','utf8'),colors=fs.readFileSync('third_party/tahoe/gtk/source/_colors.scss','utf8');
 a.match(vars,/\$shorter_duration: 100ms/);a.match(vars,/\$longer_duration: 150ms/);a.match(colors,/#242424/);a.match(colors,/#dedede/);
 for(const token of ['--tahoe-base:#242424','--tahoe-text:#dedede','--tahoe-button-radius:6px','--tahoe-field-radius:8px','--tahoe-short:100ms'])a.ok(css.includes(token));
 a.match(fs.readFileSync('third_party/tahoe/gtk/COPYING','utf8'),/Copyright \(c\) 2021 WhiteSur Developers/);
});
test('Tahoe icon painter uses safe images only in Modern and leaves Classic to original artwork',()=>{
 const src=fs.readFileSync('app.js','utf8'),fn=src.slice(src.indexOf('function paintAirAppIcon('),src.indexOf('function paintAppIcons('));
 const doc={documentElement:{dataset:{desktopTheme:'modern'}},createElement:()=>({setAttribute(){}})},window={airAppRegistry:registry};const context=vm.createContext({document:doc,window});vm.runInContext(fn,context);
 let image;const host={replaceChildren:im=>image=im};a.equal(context.paintAirAppIcon(host,'notes'),true);a.equal(image.src,registry.get('notes').iconAsset);a.equal(image.alt,'');a.equal(image.draggable,false);
 doc.documentElement.dataset.desktopTheme='classic';image=null;a.equal(context.paintAirAppIcon(host,'notes'),false);a.equal(image,null);a.equal(context.paintAirAppIcon(host,'<img onerror=x>'),false);
});
test('Tahoe is a Modern component layer without shell geometry or animation ownership',()=>{
 const css=fs.readFileSync('air-tahoe.css','utf8');a.match(css,/prefers-reduced-motion/);a.match(css,/forced-colors/);a.match(css,/glass2-active\{background:transparent/);
 a.doesNotMatch(css,/\.(?:dock|air-island-toggle)\s*\{/);
 a.doesNotMatch(css,/animation:|setInterval|z-index:/);a.match(css,/not\(\.air-home-window\)/);a.match(css,/--tahoe-workspace:#f8f7f3/);
});
test('Tahoe originals, licenses, metadata and UI dependencies are packaged for offline Electron/PWA use',()=>{
 const files=require('../scripts/windows-test-build.cjs').runtimeFiles(process.cwd());
 for(const item of provenance.icons.assets)a.ok(files.includes(item.asset));
 for(const p of ['src/core/tahoe-icons.js','air-tahoe.css','third_party/tahoe/icons/COPYING','third_party/tahoe/gtk/COPYING','third_party/tahoe/provenance.json'])a.ok(files.includes(p),p);
 const html=fs.readFileSync('index.html','utf8');a.ok(html.indexOf('src/core/tahoe-icons.js')<html.indexOf('src/core/app-registry.js'));
 for(const f of ['air-launchpad.js','air-spotlight.js','air-island.js'])a.match(fs.readFileSync(f,'utf8'),/paintAirAppIcon/);
});
