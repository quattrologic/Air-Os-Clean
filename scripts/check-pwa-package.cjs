'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function check(root){
 root=path.resolve(root);let count=0;
 function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,e.name),relative=path.relative(root,file).split(path.sep).join('/');
  assert.ok(!e.isSymbolicLink(),'No symlinks in upload');
  assert.ok(!/(^|\/)(?:\.git|\.env[^/]*|profiles|accounts\.json|notes-v1\.json|cloud-notes-v1\.json|src\/main)(\/|$)/i.test(relative),'Private/native path forbidden: '+relative);
  assert.ok(!/\.(?:cjs|exe|dll|node|pfx|pem|key|log)$/i.test(relative),'Native/private file forbidden');
  if(e.isDirectory())visit(file);else count++;
 }}visit(root);
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const manifest=JSON.parse(read('manifest.webmanifest'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 function asset(value){assert.ok(!value.startsWith('/')&&!value.includes('..')&&!/^[a-z]+:/i.test(value),'Relative asset required: '+value);assert.ok(fs.existsSync(path.join(root,value)),'Missing asset: '+value);}
 for(const icon of manifest.icons)asset(icon.src);
 for(const f of ['index.html','desktop.html']){
  const html=read(f);for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!m[1].startsWith('#'))asset(m[1]);}
  assert.match(html,/viewport-fit=cover/);assert.match(html,/apple-mobile-web-app-capable/);assert.match(html,/connect-src 'self'/);assert.doesNotMatch(html,/src="air-cloud.js"/);
 }
 const sw=read('sw.js');const list=JSON.parse(sw.match(/ASSETS=(\[[^\n]+?\]);/)[1]);
 for(const value of list)asset(value);assert.ok(list.includes('index.html')&&list.includes('desktop.html'));
 assert.match(read('adapter.js'),/configured:false/);
 return {files:count,cachedAssets:list.length,privateData:'not included by build allowlist; no user data read'};
}
if(require.main===module)console.log(JSON.stringify(check(process.argv[2]||'dist/pwa')));
module.exports={check};
