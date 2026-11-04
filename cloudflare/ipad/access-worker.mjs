// Air-OS Pages boundary. No user data, tokens, cookies or identity are logged/stored.
// The entire combined iPad distribution retains its AGPL-3.0 source offer.
const KEY_TTL=300000,MAX_JWKS=65536;
let keyCache=null,inflight=null;
function config(env){
 const team=env.AIR_ACCESS_TEAM;
 if(typeof team!=='string'||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team))throw Error('configuration');
 const audiences=JSON.parse(env.AIR_ACCESS_AUDIENCES||'null'),emails=JSON.parse(env.AIR_ACCESS_EMAILS||'null');
 if(!Array.isArray(audiences)||!audiences.length||audiences.length>8||audiences.some(a=>!/^[-a-zA-Z0-9]{16,128}$/.test(a))||!Array.isArray(emails)||!emails.length||emails.length>50||emails.some(e=>typeof e!=='string'||e.length>254||!/^\S+@\S+\.\S+$/.test(e)))throw Error('configuration');
 return{team,audiences,emails:emails.map(e=>e.toLowerCase())};
}
function segment(value){if(!/^[\w-]+$/.test(value))throw Error('token');const s=atob(value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4));return Uint8Array.from(s,c=>c.charCodeAt(0));}
async function keys(team){
 if(keyCache?.team===team&&keyCache.until>Date.now())return keyCache.keys;
 if(inflight?.team===team)return inflight.promise;
 const promise=(async()=>{const r=await fetch(team+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('keys');const reader=r.body.getReader();let size=0,chunks=[];try{for(;;){const{value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_JWKS)throw Error('keys');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
 const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(v=>[...v]))));if(!Array.isArray(data.keys)||data.keys.length>16)throw Error('keys');keyCache={team,until:Date.now()+KEY_TTL,keys:data.keys};return data.keys;})();
 inflight={team,promise};try{return await promise;}finally{if(inflight?.promise===promise)inflight=null;}
}
async function authorize(token,c){
 if(typeof token!=='string'||token.length>16384)throw Error('token');const parts=token.split('.');if(parts.length!==3)throw Error('token');
 const header=JSON.parse(new TextDecoder().decode(segment(parts[0])));if(header.alg!=='RS256'||typeof header.kid!=='string'||header.kid.length>256||header.crit||header.jku||header.jwk||header.x5u)throw Error('token');
 const candidates=await keys(c.team),jwk=candidates.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig'));if(!jwk)throw Error('token');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);if(key.algorithm.modulusLength<2048||!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,segment(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('token');
 const p=JSON.parse(new TextDecoder().decode(segment(parts[1]))),now=Math.floor(Date.now()/1000),aud=Array.isArray(p.aud)?p.aud:[p.aud];
 if(p.iss!==c.team||!aud.some(a=>c.audiences.includes(a))||!Number.isSafeInteger(p.exp)||p.exp<=now||!Number.isSafeInteger(p.iat)||p.iat>now+30||p.exp<=p.iat||p.nbf!==undefined&&(!Number.isSafeInteger(p.nbf)||p.nbf>now)||typeof p.email!=='string'||!c.emails.includes(p.email.toLowerCase()))throw Error('token');
}
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive'};
function deny(status){return new Response('Private Air-OS access required.',{status,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});}
export default {async fetch(request,env){
 if(!['GET','HEAD'].includes(request.method))return deny(405);
 let c;try{c=config(env);}catch{return deny(503);}
 // Do not trust a user-supplied assertion without its pinned issuer/audience/signature.
 try{await authorize(request.headers.get('Cf-Access-Jwt-Assertion'),c);}catch{return deny(403);}
 const url=new URL(request.url);
 if(url.pathname.endsWith('/__air_access/status'))return new Response(request.method==='HEAD'?null:JSON.stringify({authenticated:true}),{headers:{...headers,'Content-Type':'application/json'}});
 if(url.pathname.endsWith('/__air_access/login'))return new Response(null,{status:303,headers:{...headers,Location:new URL('./../',url).pathname}});
 // Access secrets and application token must never reach the static asset service.
 const clean=new Headers(request.headers);clean.delete('Cf-Access-Jwt-Assertion');clean.delete('Cookie');clean.delete('Authorization');
 try{const r=await env.ASSETS.fetch(new Request(request,{headers:clean}));const h=new Headers(r.headers);for(const[k,v]of Object.entries(headers))h.set(k,v);return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});}catch{return deny(503);}
}};
