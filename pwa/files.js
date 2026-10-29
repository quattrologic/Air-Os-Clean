'use strict';
// Virtual files are IndexedDB Blobs; never host paths or File System Access grants.
(() => {
 const s=window.airBrowserStorage,CAP=16*1024*1024,MAX=500;
 function path(value,root=false){if(typeof value!=='string'||value.length>240||/[\u0000-\u001f\\]/.test(value)||value.startsWith('/')||value.endsWith('/')||value.split('/').length>12||value.split('/').some(p=>!p||p==='.'||p==='..')){if(root&&value==='')return '';throw Error('Ungültiger interner Dateipfad.');}return value;}
 const parent=p=>p.split('/').slice(0,-1).join('/');
 const name=p=>p.split('/').at(-1),stamp=()=>new Date().toISOString();
 const all=()=>s.read('files',[]);
 function validate(items,media=false){if(!Array.isArray(items)||items.length>(media?40:MAX))throw Error('Zu viele Dateien.');const seen=new Set();let bytes=0;for(const f of items){path(f.path);if(seen.has(f.path))throw Error('Doppelter Dateipfad.');seen.add(f.path);if(!['file','folder'].includes(f.kind)||media&&f.kind!=='file'||typeof f.modifiedAt!=='string'||!Number.isFinite(Date.parse(f.modifiedAt))||Object.keys(f).some(k=>!['path','kind','blob','modifiedAt'].includes(k))||f.kind==='folder'&&Object.hasOwn(f,'blob'))throw Error('Ungültige Datei.');if(f.kind==='file'){if(!(f.blob instanceof Blob)||f.blob.size>CAP)throw Error('Ungültiger Dateiinhalt.');bytes+=f.blob.size;}}if(bytes>CAP)throw Error('Die lokale Bibliothek ist auf 16 MiB begrenzt. Exportieren und Dateien entfernen.');for(const f of items)if(parent(f.path)&&!media&&!items.some(p=>p.path===parent(f.path)&&p.kind==='folder'))throw Error('Übergeordneter Ordner fehlt.');}
 function meta(f){const n=name(f.path);return {path:f.path,name:n,kind:f.kind,size:f.blob?.size||0,extension:n.includes('.')?'.'+n.split('.').at(-1).toLowerCase():'',modifiedAt:f.modifiedAt};}
 function parentExists(items,p){if(p&&!items.some(f=>f.path===p&&f.kind==='folder'))throw Error('Ordner nicht gefunden.');}
 const change=fn=>s.change('files',[],items=>{const result=fn(items);validate(items);return result;});
 async function blobAt(p){path(p);const f=(await all()).find(f=>f.path===p&&f.kind==='file');if(!f)throw Error('Datei nicht gefunden.');return f.blob;}
 function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const api={
  selectFolder:async()=>({name:'Air-OS · Browserspeicher',path:'',rootName:'Air-OS · Browserspeicher'}),
  currentFolder:async()=>({name:'Air-OS · Browserspeicher',path:'',rootName:'Air-OS · Browserspeicher'}),
  async listDirectory(p=''){path(p,true);const items=await all();parentExists(items,p);return {path:p,parentPath:parent(p),rootName:'Air-OS · Browserspeicher',items:items.filter(f=>parent(f.path)===p).map(meta).sort((a,b)=>a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='folder'?-1:1)};},
  async readTextFile(p){const blob=await blobAt(p);if(blob.size>512*1024)throw Error('Textdatei über 512 KiB. Bitte exportieren.');const content=await blob.text();s.valid();return {path:p,content};},
  writeTextFile:(p,text)=>change(items=>{path(p);if(typeof text!=='string'||new Blob([text]).size>512*1024)throw Error('Textdatei zu groß.');const f=items.find(f=>f.path===p&&f.kind==='file');if(!f)throw Error('Datei nicht gefunden.');f.blob=new Blob([text],{type:'text/plain'});f.modifiedAt=stamp();return {ok:true};}),
  createTextFile:p=>change(items=>{path(p);parentExists(items,parent(p));if(items.some(f=>f.path===p))throw Error('Name bereits vorhanden.');items.push({path:p,kind:'file',blob:new Blob([''],{type:'text/plain'}),modifiedAt:stamp()});return {ok:true};}),
  createFolder:p=>change(items=>{path(p);parentExists(items,parent(p));if(items.some(f=>f.path===p))throw Error('Name bereits vorhanden.');items.push({path:p,kind:'folder',modifiedAt:stamp()});return {ok:true};}),
  renameFile:(from,to)=>change(items=>{path(from);path(to);if(to.startsWith(from+'/'))throw Error('Ordner kann nicht in sich selbst verschoben werden.');parentExists(items,parent(to));const f=items.find(f=>f.path===from);if(!f)throw Error('Datei nicht gefunden.');if(items.some(f=>f.path===to))throw Error('Ziel existiert bereits.');for(const f of items)if(f.path===from||f.path.startsWith(from+'/')){f.path=to+f.path.slice(from.length);f.modifiedAt=stamp();}return {ok:true};}),
  duplicateFile:(from,to)=>change(items=>{path(from);path(to);parentExists(items,parent(to));const f=items.find(f=>f.path===from&&f.kind==='file');if(!f)throw Error('Datei nicht gefunden.');if(items.some(f=>f.path===to))throw Error('Ziel existiert bereits.');items.push({...f,path:to,modifiedAt:stamp()});return {ok:true};}),
  remove:p=>change(items=>{path(p);const i=items.findIndex(f=>f.path===p);if(i<0)throw Error('Datei nicht gefunden.');if(items.some(f=>f.path.startsWith(p+'/')))throw Error('Ordner muss vor dem Entfernen leer sein.');items.splice(i,1);return {ok:true};}),
  async import(files,p='',signal){path(p,true);const selected=[...files];if(!selected.length||selected.length>40)throw Error('1–40 Dateien auswählen.');if(selected.some(f=>!(f instanceof Blob)||f.size>8*1024*1024))throw Error('Einzelimport höchstens 8 MiB.');if(signal?.aborted)throw Error('Import abgebrochen.');return change(items=>{if(signal?.aborted)throw Error('Import abgebrochen.');parentExists(items,p);for(const f of selected){const target=[p,f.name].filter(Boolean).join('/');path(target);if(items.some(i=>i.path===target))throw Error('Name bereits vorhanden: '+f.name);items.push({path:target,kind:'file',blob:f,modifiedAt:stamp()});}return {ok:true,count:selected.length};});},
  async export(p){const blob=await blobAt(p);s.valid();download(blob,name(p));return {ok:true};},
  async openNative(p){const blob=await blobAt(p);s.valid();if(/^image\/(png|jpeg|gif|webp)$/.test(blob.type)&&blob.size<=8*1024*1024){const d=document.createElement('dialog'),image=document.createElement('img'),url=URL.createObjectURL(blob),close=document.createElement('button');d.className='pwa-image-preview';image.src=url;image.alt=name(p);close.textContent='Schließen';close.onclick=()=>d.close();d.append(image,close);d.addEventListener('close',()=>{URL.revokeObjectURL(url);d.remove();},{once:true});document.addEventListener('air-profile-changing',()=>d.close(),{once:true});document.body.append(d);d.showModal();}else download(blob,name(p));return {ok:true};},
  async searchNames(q){if(typeof q!=='string'||q.length>200)return {items:[]};return {items:(await all()).filter(f=>name(f.path).toLocaleLowerCase('de-DE').includes(q.toLocaleLowerCase('de-DE'))).slice(0,30).map(meta)};},
  validateBackup(data){if(Object.hasOwn(data,'files'))validate(data.files);if(Object.hasOwn(data,'media'))validate(data.media,true);},download
 };
 window.airBrowserFiles=Object.freeze(api);
 window.airBrowserMedia=Object.freeze({
  async list(){return (await s.read('media',[])).map(f=>new File([f.blob],name(f.path),{type:f.blob.type,lastModified:Date.parse(f.modifiedAt)}));},
  async replace(files){const items=[...files].map(f=>({path:path(f.name),kind:'file',blob:f,modifiedAt:stamp()}));if(items.some(f=>!f.blob.type.startsWith('audio/')&&!/\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.path)))throw Error('Nur Audiodateien erlaubt.');validate(items,true);await s.put('media',items);return {ok:true};},
  clear:()=>s.put('media',[])
 });
})();
