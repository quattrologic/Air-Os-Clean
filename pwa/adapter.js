'use strict';
// Separate origin storage. No filesystem, Electron profile, cloud credentials or auth claims.
(() => {
 const denied=async()=>{throw Error('In PWA-1 nicht unterstützt. Cloud und native Funktionen sind deaktiviert.');};
 const session=sessionStorage.getItem('air-pwa-session');
 if(location.pathname.endsWith('desktop.html')&&!session){location.replace('./');return;}
 const user={username:'local-browser',displayName:'Lokaler Browsermodus',preferenceSession:session};
 let dbPromise;
 function db(){return dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('air-os-pwa-local-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Browserspeicher nicht verfügbar.'));});}
 async function transaction(mode,fn){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('data',mode),s=tx.objectStore('data');let result;tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(Error('Browserspeicherung fehlgeschlagen.'));fn(s,v=>result=v,tx);});}
 async function notesChange(fn){let error;const result=await transaction('readwrite',(s,done,tx)=>{const r=s.get('notes');r.onsuccess=()=>{try{const notes=r.result||[],value=fn(notes);s.put(notes,'notes');done(value);}catch(e){error=e;tx.abort();}};}).catch(e=>{throw error||e;});return result;}
 const notes={
 list:()=>transaction('readonly',(s,done)=>{const r=s.get('notes');r.onsuccess=()=>done(r.result||[]);}),
 save:input=>notesChange(notes=>{if(input.id!=null&&!/^[0-9a-f-]{36}$/i.test(input.id))throw Error('Ungültige Notiz-ID.');const i=input.id?notes.findIndex(n=>n.id===input.id):-1;if(input.id&&i<0)throw Error('Notiz nicht gefunden.');if(i<0&&notes.length>=200)throw Error('Höchstens 200 Notizen erlaubt.');if(i>=0&&input.expectedSnapshot&&JSON.stringify(notes[i])!==JSON.stringify(input.expectedSnapshot))throw Error('Notiz inzwischen geändert; neu laden.');const n=airNotesFormat.make(input,notes[i],new Date().toISOString(),crypto.randomUUID());if(i>=0)notes[i]=n;else notes.unshift(n);return n;}),
 remove:(id,expected)=>notesChange(notes=>{const i=notes.findIndex(n=>n.id===id);if(i<0)throw Error('Notiz nicht gefunden.');if(expected&&JSON.stringify(expected)!==JSON.stringify(notes[i]))throw Error('Notiz inzwischen geändert.');notes.splice(i,1);return {ok:true};})
 };
 const defaults={desktopTheme:'modern',dockTheme:'modern',dockSize:48,reduceGlass:true,reduceMotion:false,clock24:true};
 const preferences={get:()=>transaction('readonly',(s,done)=>{const r=s.get('preferences');r.onsuccess=()=>done({...defaults,...r.result});}),update:patch=>transaction('readwrite',(s,done)=>{const r=s.get('preferences');r.onsuccess=()=>{const next={...defaults,...r.result,...patch};s.put(next,'preferences');done(next);};}),reset:()=>transaction('readwrite',(s,done)=>{s.put(defaults,'preferences');done({...defaults});})};
 window.airOS=Object.freeze({platform:'web',currentUser:async()=>session?user:null,notes,preferences,
 logout:async()=>{sessionStorage.removeItem('air-pwa-session');location.replace('./');return {ok:true};},
 cloud:{status:async()=>({configured:false,signedIn:false}),signIn:denied,sync:denied,signOut:denied},
 reminders:{list:denied,save:denied,remove:denied},appStore:{installed:async()=>[],catalog:denied,launch:denied,install:denied,remove:denied},
 files:new Proxy({},{get:()=>denied}),launchSpotify:denied,restart:async()=>location.replace('./'),quit:denied});
})();
