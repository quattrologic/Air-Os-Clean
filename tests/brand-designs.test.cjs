'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dir=path.join(__dirname,'../docs/brand/brand-1'),manifest=require('../docs/brand/brand-1/designs.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('BRAND-1 has three distinct, self-contained, script/font/text/foreign-asset-free SVG symbols',()=>{
 assert.equal(manifest.designs.length,3);assert.equal(new Set(manifest.designs.map(d=>d.sha256)).size,3);
 for(const d of manifest.designs){const bytes=fs.readFileSync(path.join(dir,d.file)),svg=bytes.toString();assert.equal(hash(bytes),d.sha256);assert.match(svg,/viewBox="0 0 64 64"/);assert.doesNotMatch(svg,/<(?:text|script|image|foreignObject|use|iframe|animate)\b|\bon\w+=|(?:href|font-family)=|<!ENTITY/i);const ids=new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));for(const m of svg.matchAll(/url\(([^)]+)\)/g))assert.ok(m[1].startsWith('#')&&ids.has(m[1].slice(1)));assert.match(svg,/<title\b/);assert.match(svg,/<path\b/)}
});
test('BRAND-1 actual raster exports have requested dimensions, transparent margins and unchanged rendered hashes',()=>{
 const report=require('../docs/brand/brand-1/render-report.json'),pixels=require('../docs/brand/brand-1/pixel-report.json');assert.equal(report.dpr,1);
 for(const d of manifest.designs)for(const size of [16,32,64,256,512]){
  const name='png/'+d.id+'-'+size+'.png',bytes=fs.readFileSync(path.join(dir,name)),receipt=report.files.find(f=>f.file===name),pixel=pixels.find(f=>f.file===name);
  assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);assert.equal(bytes[25],6,'RGBA output');assert.equal(hash(bytes),receipt.sha256);assert.equal(pixel.sha256,receipt.sha256);assert.deepEqual(pixel.cornerAlpha,[0,0,0,0]);assert.ok(pixel.visiblePixels>size*size*.12&&pixel.visiblePixels<size*size*.8);assert.ok(pixel.bbox[0]>0&&pixel.bbox[1]>0&&pixel.bbox[2]<size&&pixel.bbox[3]<size,'no clipped symbol or opaque tile');
 }
});
test('BRAND-1 preview sheets are genuine complete renderer exports and all asset receipts match',()=>{
 const r=require('../docs/brand/brand-1/render-report.json');assert.equal(r.files.length,19);assert.ok(Number(r.renderer.split('.')[0])>=44);for(const f of r.files){const b=fs.readFileSync(path.join(dir,f.file));assert.equal(hash(b),f.sha256);assert.equal(b.readUInt32BE(16),f.width);assert.equal(b.readUInt32BE(20),f.height)}for(const d of manifest.designs){const f=r.files.find(f=>f.file===d.id+'-preview.png');assert.equal(f.width,1280);assert.ok(f.height>=1000)}
});
test('BRAND-1 remains awaiting selection and no draft is referenced by product entry points or packaging',()=>{
 assert.equal(manifest.status,'DRAFT_AWAITING_USER_SELECTION');assert.equal(manifest.activeLogoUnchanged,true);assert.equal(manifest.recommended,'fold');
 for(const file of ['index.html','login.html','air-launchpad.js','package.json']){const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');for(const d of manifest.designs)assert.ok(!source.includes(d.file));assert.ok(!source.includes('docs/brand/brand-1'))}
});
