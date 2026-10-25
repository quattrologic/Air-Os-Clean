'use strict';
// Supabase protocol adapter. No renderer tokens, server keys, timers or second notes database.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function validate(notes){
 if(!Array.isArray(notes)||notes.length>200)throw Error('Ungültige Cloud-Notizen.');
 const ids=new Set();
 return notes.map(n=>{
  if(!n||!/^[0-9a-f-]{36}$/i.test(n.id)||ids.has(n.id)||typeof n.title!=='string'||n.title.length>120||typeof n.body!=='string'||Buffer.byteLength(n.body)>524288||!Number.isFinite(Date.parse(n.createdAt))||!Number.isFinite(Date.parse(n.updatedAt)))throw Error('Ungültige Cloud-Notiz.');
  ids.add(n.id);return {id:n.id,title:n.title,body:n.body,createdAt:n.createdAt,updatedAt:n.updatedAt};
 });
}
function merge(base,local,remote){
 const maps=[base,local,remote].map(ns=>new Map(validate(ns).map(n=>[n.id,n]))),result=[];
 for(const id of new Set(maps.flatMap(m=>[...m.keys()]))){
  const [b,l,r]=maps.map(m=>m.get(id));
  let n;if(same(l,r))n=l;else if(same(l,b))n=r;else if(same(r,b))n=l;else throw Error('Synchronisierungskonflikt: Beide Geräte haben dieselbe Notiz geändert oder gelöscht. Lokale und Cloud-Daten bleiben erhalten.');
  if(n)result.push(n);
 }
 return validate(result);
}
function config(env=process.env){
 const url=env.AIR_CLOUD_SUPABASE_URL,key=env.AIR_CLOUD_SUPABASE_ANON_KEY;
 if(!url&&!key)return null;
 let u;try{u=new URL(url)}catch{throw Error('Ungültige Cloud-Konfiguration.');}
 if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Cloud benötigt eine vertrauenswürdige Supabase-HTTPS-Adresse.');
 let anon=false;try{anon=JSON.parse(Buffer.from(key.split('.')[1],'base64url')).role==='anon'}catch{}
 if(typeof key!=='string'||!(key.startsWith('sb_publishable_')||anon))throw Error('Nur öffentliche Supabase-Publishable-/Anon-Schlüssel zulässig.');
 return {url:u.origin,key};
}
function createCloud({root,store,safeStorage,settings,fetchImpl=globalThis.fetch}){
 let epoch=0;const tokens=new Map(),busy=new Set(),errors=new Map();
 const file=user=>path.join(root(),'profiles',crypto.createHash('sha256').update(user.toLowerCase()).digest('hex'),'cloud-notes-v1.json');
 function read(user){try{return JSON.parse(fs.readFileSync(file(user),'utf8'))}catch(e){if(e.code==='ENOENT')return {base:[]};throw Error('Cloud-Verknüpfung beschädigt; lokale Notizen bleiben erhalten.')}}
 function write(user,s){const f=file(user),tmp=f+'.'+crypto.randomUUID()+'.tmp';fs.mkdirSync(path.dirname(f),{recursive:true});try{fs.writeFileSync(tmp,JSON.stringify(s),{mode:0o600});fs.renameSync(tmp,f)}finally{try{fs.unlinkSync(tmp)}catch(e){if(e.code!=='ENOENT')throw e}}}
 function guard(e,alive){if(e!==epoch||!alive())throw Error('Cloud-Aktion wegen Sitzungswechsel abgebrochen.');}
 function secure(){if(!safeStorage.isEncryptionAvailable()||safeStorage.getSelectedStorageBackend?.()==='basic_text')throw Error('Sichere Betriebssystem-Schlüsselablage nicht verfügbar. Cloud-Anmeldung blockiert; lokale Notizen funktionieren weiter.');}
 async function request(route,{token,method='GET',body}={}){
  if(!settings)throw Error('Air Cloud ist noch nicht eingerichtet.');
  let response;try{response=await fetchImpl(settings.url+route,{method,headers:{apikey:settings.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(20000)})}catch{throw Error('Cloud nicht erreichbar. Lokale Änderungen bleiben gespeichert.');}
  if(!response.ok)throw Error(response.status===401||response.status===403?'Cloud-Anmeldung abgelaufen oder Zugriff verweigert. Bitte erneut anmelden.':'Cloud-Anfrage fehlgeschlagen. Bitte erneut versuchen.');
  let text='';
  if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;
   try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>110000000){await reader.cancel();throw Error('Cloud-Antwort zu groß.');}chunks.push(Buffer.from(part.value));}text=Buffer.concat(chunks).toString('utf8');}finally{reader.releaseLock();}
  }else{text=await response.text();if(Buffer.byteLength(text)>110000000)throw Error('Cloud-Antwort zu groß.');}
  try{return text?JSON.parse(text):null}catch{throw Error('Ungültige Cloud-Antwort.');}
 }
 function accept(user,data,prior){
  if(!data?.user?.id||!data.access_token||!data.refresh_token)throw Error('Unvollständige Cloud-Sitzung.');
  if(prior.uid&&prior.uid!==data.user.id)throw Error('Dieses lokale Profil ist bereits mit einem anderen Cloud-Konto verbunden.');
  secure();const next={...prior,uid:data.user.id,refresh:safeStorage.encryptString(data.refresh_token).toString('base64')};write(user,next);tokens.set(user,data.access_token);return next;
 }
 async function exclusive(user,fn){if(busy.has(user))throw Error('Cloud-Aktion läuft bereits.');busy.add(user);try{const result=await fn();errors.delete(user);return result}catch(error){errors.set(user,error.message);throw error}finally{busy.delete(user)}}
 function status(user){const s=read(user);return {configured:!!settings,linked:!!s.uid,signedIn:!!s.refresh,lastSync:s.lastSync||null,error:errors.get(user)||null};}
 async function signIn(user,input,alive){return exclusive(user,async()=>{
  secure();if(!input||typeof input.email!=='string'||input.email.length>254||typeof input.password!=='string'||input.password.length>1024)throw Error('Ungültige Cloud-Anmeldedaten.');
  const e=epoch,prior=read(user),data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:input.email,password:input.password}});guard(e,alive);accept(user,data,prior);return status(user);
 });}
 async function sync(user,alive){return exclusive(user,async()=>{
  const e=epoch;let s=read(user);guard(e,alive);secure();if(!s.refresh)throw Error('Bitte Cloud-Konto verknüpfen oder erneut anmelden.');
  // Refresh for each explicit sync, with rotation persisted before any data request.
  const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:safeStorage.decryptString(Buffer.from(s.refresh,'base64'))}});guard(e,alive);s=accept(user,data,s);
  const token=tokens.get(user),rows=await request('/rest/v1/air_notes?select=revision,notes&owner=eq.'+encodeURIComponent(s.uid),{token});guard(e,alive);
  if(!Array.isArray(rows)||rows.length!==1)throw Error('Cloud-Datensatz fehlt; Backend-Setup prüfen.');
  const remote=validate(rows[0].notes),local=validate(store.list(user)),merged=merge(s.base||[],local,remote);
  const revision=rows[0].revision;if(!Number.isSafeInteger(revision)||revision<0)throw Error('Ungültige Cloud-Version.');
  if(!same(merged,remote)){
   const next=await request('/rest/v1/rpc/air_notes_commit',{token,method:'POST',body:{expected_revision:revision,new_notes:merged}});guard(e,alive);
   if(next!==revision+1)throw Error('Cloud gleichzeitig geändert. Bitte erneut synchronisieren.');
  }
  guard(e,alive);
  // Atomic synchronous compare/apply: offline edits during network requests are never lost.
  store.replaceFromCloud(user,local,merged);
  write(user,{...s,base:merged,lastSync:new Date().toISOString()});return status(user);
 });}
 async function signOut(user){
  epoch++;const token=tokens.get(user);tokens.delete(user);const s=read(user),hadSession=!!s.refresh;delete s.refresh;write(user,s);errors.delete(user);
  if(token)try{await request('/auth/v1/logout?scope=local',{method:'POST',token})}catch{return {ok:true,warning:'Lokal abgemeldet; serverseitige Token-Sperrung nicht bestätigt.'};}
  return token||!hadSession?{ok:true}:{ok:true,warning:'Lokal abgemeldet; serverseitige Token-Sperrung nicht bestätigt.'};
 }
 function suspend(user){epoch++;tokens.clear();if(user){try{const s=read(user);delete s.refresh;write(user,s);}catch{ /* Corrupt cloud state must not block local logout. */ }}}
 return {status,signIn,sync,signOut,suspend};
}
module.exports={merge,validate,config,createCloud};
