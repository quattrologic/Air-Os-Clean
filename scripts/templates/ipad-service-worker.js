'use strict';
const CACHE_PREFIX='air-os-ipad-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE_VERSION=CACHE_PREFIX+'__VERSION__';
const SHELL=__SHELL__;
const INTEGRITY=__INTEGRITY__;
async function verified(response,path){
 const expected=new URL(path,self.registration.scope),url=new URL(response.url||expected.href),root=new URL(self.registration.scope);
 if(!response.ok||response.type==='opaque'||url.origin!==root.origin||!(url.pathname===expected.pathname||path==='./'&&url.pathname===root.pathname+'index.html'))throw Error('Untrusted app response');
 if(path==='./'&&!(response.headers.get('content-type')||'').includes('text/html'))throw Error('Not app HTML');
 const bytes=await response.clone().arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
 if(hash!==INTEGRITY[path==='./'?'./index.html':path])throw Error('App bytes changed or authentication required');
 return withoutRedirect(response);
}
function withoutRedirect(response){return new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers});}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE_VERSION);try{const shell=await fetch('./',{cache:'reload'});await cache.put('./',await verified(shell,'./'));for(const path of SHELL.filter(path=>path!=='./')){const r=await fetch(path,{cache:'reload',credentials:'same-origin',redirect:'error'});await cache.put(path,await verified(r,path));}}catch(error){await caches.delete(CACHE_VERSION);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=(await caches.keys()).filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_VERSION);const previous=names.at(-1);await Promise.all(names.filter(name=>name!==previous).map(name=>caches.delete(name)));await self.clients.claim();})()));
let proposal=null;
self.addEventListener('message',event=>{const message=event.data||{};if(message.type==='REQUEST_SAFE_UPDATE'&&typeof message.token==='string'&&message.token.length<=100&&event.source?.url?.startsWith(self.registration.scope))event.waitUntil((async()=>{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});const scoped=clients.filter(c=>c.url.startsWith(self.registration.scope));proposal={token:message.token,waiting:new Set(scoped.map(c=>c.id)),blocked:false};for(const client of scoped)client.postMessage({type:'CHECK_UPDATE_SAFETY',token:message.token});})());
 if(message.type==='UPDATE_SAFETY'&&proposal&&message.token===proposal.token&&event.source?.id&&proposal.waiting.has(event.source.id)){proposal.waiting.delete(event.source.id);if(message.ready!==true)proposal.blocked=true;if(!proposal.waiting.size){const approved=!proposal.blocked;proposal=null;if(approved)event.waitUntil(self.skipWaiting());else event.source.postMessage({type:'UPDATE_BLOCKED'});}}});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url),scope=new URL(self.registration.scope);if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.startsWith(scope.pathname+'__air_access/')||url.pathname.startsWith(scope.pathname+'cdn-cgi/'))return;
 if(event.request.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE_VERSION),saved=await cache.match('./');if(saved)return withoutRedirect(saved);const live=await fetch(event.request);const safe=await verified(live,'./');await cache.put('./',safe.clone());return safe;})());return;}
 const relative='./'+url.pathname.slice(scope.pathname.length);if(!Object.hasOwn(INTEGRITY,relative))return;event.respondWith((async()=>{const cache=await caches.open(CACHE_VERSION),saved=await cache.match(event.request);return saved||verified(await fetch(event.request,{redirect:'error'}),relative);})());});
