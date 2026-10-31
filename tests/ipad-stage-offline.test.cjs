'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
test('PWA canonical launch URL maps to cached index even if the engine differs in request mode; scope/query/origin boundaries remain strict',async()=>{
 const dir=fs.mkdtempSync(path.join(process.cwd(),'dist','ipad-scope-'));try{
 execFileSync(process.execPath,['scripts/build-pwa.cjs',dir],{stdio:'pipe'});const handlers={},scope='https://example.invalid/Air-Os-Clean/',hits=[];
 const c={self:{registration:{scope},location:{origin:'https://example.invalid'},addEventListener:(name,fn)=>handlers[name]=fn},URL,Set,caches:{open:async()=>({match:async target=>{hits.push(target);return {ok:true};}})},fetch:()=>{throw Error('Unexpected network');}};
 vm.runInNewContext(fs.readFileSync(path.join(dir,'sw.js'),'utf8'),c);
 for(const mode of ['navigate','same-origin',undefined]){let response;handlers.fetch({request:{method:'GET',url:scope,mode},respondWith:r=>response=r});assert.ok(await response);assert.equal(hits.at(-1),scope+'index.html');}
 for(const url of [scope+'?private=1','https://other.invalid/Air-Os-Clean/','https://example.invalid/other/']){let called=false;handlers.fetch({request:{method:'GET',url,mode:'navigate'},respondWith:()=>called=true});assert.equal(called,false);}
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
