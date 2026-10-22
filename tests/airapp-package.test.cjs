'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {verifyPackage}=require('../src/main/airapp-package.cjs');
function signed(){
 const pair=crypto.generateKeyPairSync('ed25519');
 const contents=Buffer.from('<p>Safe local timer</p>');
 const manifest={schemaVersion:1,id:'com.airos.demo.timer',name:'Timer',version:'1.0.0',author:'Air-OS',description:'Local timer',entry:'index.html',permissions:[],platforms:['darwin','win32','linux'],files:[{path:'index.html',sha256:crypto.createHash('sha256').update(contents).digest('hex')}]};
 const pkg={manifest,assets:{'index.html':contents.toString('base64')},signature:crypto.sign(null,Buffer.from(JSON.stringify(manifest)),pair.privateKey).toString('base64')};
 return{pkg,publicKey:pair.publicKey,privateKey:pair.privateKey};
}
test('Ed25519 signature and each file digest are verified',()=>{
 const{pkg,publicKey}=signed();const found=verifyPackage(pkg,publicKey);
 assert.equal(found.manifest.id,'com.airos.demo.timer');assert.equal(found.files.get('index.html').toString(),'<p>Safe local timer</p>');
});
test('rejects modified payloads and unsigned metadata',()=>{
 const{pkg,publicKey}=signed();
 const changed=structuredClone(pkg);changed.assets['index.html']=Buffer.from('malware').toString('base64');
 assert.throws(()=>verifyPackage(changed,publicKey),/integrity/);
 const renamed=structuredClone(pkg);renamed.manifest.name='Different app';
 assert.throws(()=>verifyPackage(renamed,publicKey),/signature/);
 const traverse=structuredClone(pkg);traverse.manifest.files[0].path='../escape.js';traverse.manifest.entry='../escape.js';
 assert.throws(()=>verifyPackage(traverse,publicKey));
});
test('permission declarations fail closed',()=>{
 const {pkg,publicKey,privateKey}=signed();pkg.manifest.permissions=['filesystem'];
 pkg.signature=crypto.sign(null,Buffer.from(JSON.stringify(pkg.manifest)),privateKey).toString('base64');
 assert.throws(()=>verifyPackage(pkg,publicKey),/permissions/);
});
