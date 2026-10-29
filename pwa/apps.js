'use strict';
// Browser-only actions on existing controllers. No alternate app/database implementation.
(() => {
 const events=new AbortController(),signal=events.signal,mounted=new WeakSet();
 function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;return b;}
 function mount(win){
  if(mounted.has(win))return;mounted.add(win);
  const files=win.querySelector('.air-files-app');
  if(files){
   for(const n of files.querySelectorAll('[data-air-action=choose-folder] strong'))n.textContent='Interne Dateien';
   for(const n of files.querySelectorAll('[data-air-action=choose-folder] small'))n.textContent='In diesem Browser';
   const hint=files.querySelector('.air-files-place-hint');if(hint)hint.textContent='Dateien ausdrücklich importieren. Alle Ordner liegen ausschließlich im Air-OS-Browserspeicher.';
   const footer=files.querySelector('.air-files-sidebar-footer');if(footer)footer.textContent='Lokaler Browserbereich · Backup über iPad-Menü';
   const bar=document.createElement('div');bar.className='pwa-file-actions';const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Interner Browserspeicher · Import bis 8 MiB/Datei, Bibliothek bis 16 MiB.';
   const label=document.createElement('label');label.textContent='Dateien importieren';const input=document.createElement('input');input.type='file';input.multiple=true;input.hidden=true;label.append(input);bar.append(label,status);
   const current=()=>window.airFinder?.currentPath(win)||'';
   const refresh=()=>win.querySelector('[data-air-action=refresh]')?.click();
   let importing=false;
   input.onchange=async()=>{if(importing)return;importing=true;input.disabled=true;try{await airOS.files.import(input.files,current());status.textContent='Import vollständig im Browser gespeichert.';refresh();}catch(e){status.textContent=e.message;}finally{importing=false;input.disabled=false;input.value='';}};
   files.querySelector('.air-files-main')?.prepend(bar);
   function paintRows(){win.querySelectorAll('.air-file-row').forEach(row=>{if(row.querySelector('[data-pwa-file]'))return;const entry=row.querySelector('[data-air-action=open-item]');if(!entry)return;const controls=document.createElement('span');controls.className='pwa-file-menu';controls.dataset.pwaFile='true';const run=fn=>async()=>{try{await fn();refresh();}catch(e){status.textContent=e.message;}};
    if(entry.dataset.kind==='file')controls.append(button('↓',run(()=>airOS.files.export(entry.dataset.path))));controls.append(button('×',run(async()=>{if(confirm('Dieses interne Objekt endgültig löschen?'))await airOS.files.remove(entry.dataset.path);})));controls.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-label',(b.textContent==='↓'?'Exportieren: ':'Löschen: ')+entry.dataset.path);});row.append(controls);
   });}
   const observer=new MutationObserver(paintRows);observer.observe(files,{childList:true,subtree:true});paintRows();document.addEventListener('air-profile-changing',()=>observer.disconnect(),{once:true,signal});
   files.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault();},{signal});
   files.addEventListener('drop',async e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();try{await airOS.files.import(e.dataTransfer.files,current());status.textContent='Dateien importiert.';refresh();}catch(error){status.textContent=error.message;}},{signal});
  }
  const notes=win.querySelector('.air-notes');
  if(notes){const actions=notes.querySelector('.note-actions')||notes.querySelector('.note-workspace');actions?.append(button('Notizen exportieren',async()=>{try{const data=await airOS.notes.list();airBrowserFiles.download(new Blob([JSON.stringify({format:'air-os-notes',version:1,notes:data},null,2)],{type:'application/json'}),'Air-OS-Notizen.json');}catch(e){toast(e.message);}}));}
 }
 function availability(){for(const b of document.querySelectorAll('.alp-app[data-app],[data-start-app]')){const id=b.dataset.app||b.dataset.startApp;if(window.airIPad.availability(id)==='unavailable'&&!b.querySelector('.pwa-capability')){const badge=document.createElement('small');badge.className='pwa-capability';badge.textContent='iPad: nicht verfügbar';b.title=(b.title||id)+' · '+badge.textContent;b.append(badge);}}}
 const observer=new MutationObserver(()=>{for(const w of openApps.values())mount(w);availability();});
 observer.observe(document.querySelector('#windows'),{childList:true,subtree:true});
 for(const w of openApps.values())mount(w);
 // Preserve dirty Notes and the Finder editor before destructive UI/session transitions.
 document.addEventListener('click',e=>{const close=e.target.closest('.close');if(!close)return;const win=close.closest('.app-window');if(((win?.querySelector('.air-notes')&&window.airNotes?.hasUnsaved())||window.airFinder?.hasUnsaved(win))&&!confirm('Ungespeicherte Änderungen verwerfen und schließen?')){e.preventDefault();e.stopImmediatePropagation();}}, {capture:true,signal});
 window.addEventListener('beforeunload',e=>{if(window.airNotes?.hasUnsaved()||[...openApps.values()].some(w=>window.airFinder?.hasUnsaved(w))){e.preventDefault();e.returnValue='';}},{signal});
 function dispose(){observer.disconnect();events.abort();}
 document.addEventListener('air-profile-changing',dispose,{once:true});window.addEventListener('pagehide',dispose,{once:true});
})();
