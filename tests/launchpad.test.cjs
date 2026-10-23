'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Launchpad resources are linked and packaged',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 for(const name of ['air-launchpad.js','air-launchpad.css']){assert.ok(html.includes(name));assert.ok(pkg.build.files.includes(name))}
 assert.ok(html.includes('data-app="launchpad"'));
 assert.ok(fs.readFileSync(path.join(root,'app.js'),'utf8').includes('window.airLaunchpad?.mount(win)'));
});
